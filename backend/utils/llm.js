/**
 * LLM Explanation Layer Wrapper
 * Calls Gemini API (or OpenAI as fallback) to generate a 1-sentence risk explanation.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Pre-defined safe fallbacks if the LLM times out or crashes.
const fallbacks = {
  invalid_nuban: "This account number could not be verified in the system.",
  suspended_account: "This account is suspended due to severe policy violations.",
  critical_risk: "Accounts with this profile have a critically high association with scams.",
  heavily_reported: "Multiple users have recently reported this account for suspicious behavior.",
  flagged_by_users: "Some users have flagged this account for review.",
  new_account: "This is a brand new account with no established history.",
  velocity_anomaly: "This transfer amount is unusually high compared to your typical history.",
  high_value: "This is a high-value transfer that requires extra caution.",
  safe: "This recipient has an established and verified history."
};

async function getExplanation(flags) {
  // 1. Handle Empty Flags
  if (!flags || flags.length === 0) {
    return fallbacks.safe;
  }

  // 2. Pre-filter contradictory/unnecessary flags (keep max 3)
  const priorityFlags = flags.slice(0, 3);
  const primaryFlag = priorityFlags[0];

  if (!GEMINI_API_KEY) {
    console.warn("No GEMINI_API_KEY provided. Using static fallback.");
    return fallbacks[primaryFlag] || "Unusual activity detected on this account.";
  }

  // 3. Construct the strict prompt
  const flagDescriptions = priorityFlags.join(", ");
  const prompt = `You are a financial risk AI. Convert these risk flags into exactly ONE plain-English sentence (max 20 words) explaining the risk to a user sending money. 
Flags: [${flagDescriptions}]. 
Rules: No markdown. End with a period. Do not use words like 'scam' or 'fraud' directly unless it's a critical risk. Be neutral.`;

  // 4. Call LLM with 3.0s Timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 30,
          temperature: 0.2
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`LLM API Error: ${response.status}`);
    }

    const data = await response.json();
    let explanation = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Clean up response: strip markdown, newlines, and truncate to first period
    explanation = explanation.replace(/[`*]/g, '').trim();
    const periodIndex = explanation.indexOf('.');
    if (periodIndex !== -1) {
      explanation = explanation.substring(0, periodIndex + 1);
    }

    if (explanation.split(' ').length > 25) {
      throw new Error("LLM ignored length constraint");
    }

    return explanation || fallbacks[primaryFlag];
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("LLM Explanation failed or timed out:", error.message);
    // Graceful fallback prevents the demo from crashing
    return fallbacks[primaryFlag] || "Unusual activity detected on this account.";
  }
}

module.exports = {
  getExplanation
};
