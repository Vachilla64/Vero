// Same color-blocked-panel language as the pamphlet/deck: dark hook →
// light mechanism → green payoff, each with a numbered badge instead of
// a generic centered icon. Shared by Onboarding.jsx and Register.jsx.
export const SLIDES = [
  {
    theme: "dark",
    num: "01",
    eyebrow: "Welcome to Vero",
    headlinePlain: "Stop guessing.",
    headlineAccent: "Start verifying.",
    body: "Vero checks any Nigerian bank account before you transfer — see the real risk before your money moves.",
  },
  {
    theme: "light",
    num: "02",
    eyebrow: "How it works",
    headlinePlain: "Enter a NUBAN.",
    headlineAccent: "Get a score.",
    body: "Any 10-digit account number returns a 0–100 trust score in seconds. No waiting, no guesswork.",
  },
  {
    theme: "green",
    num: "03",
    eyebrow: "Why it's different",
    headlinePlain: "Not just a number.",
    headlineAccent: "A plain-English why.",
    body: "Every score comes with an explanation you can act on — not just digits you have to trust blindly.",
  },
];

export const THEME = {
  dark: {
    bg: "bg-ink",
    eyebrow: "text-trust-good",
    headline: "text-white",
    accent: "text-trust-good",
    body: "text-white/60",
    badgeBg: "bg-white/10",
    badgeText: "text-trust-good",
    dotActive: "bg-trust-good",
    dotInactive: "bg-white/20",
    skip: "text-white/50 hover:text-white",
    button: "bg-trust-high text-white shadow-btn-green",
  },
  light: {
    bg: "bg-surface",
    eyebrow: "text-trust-high",
    headline: "text-ink",
    accent: "text-trust-high",
    body: "text-slate",
    badgeBg: "bg-trust-high/10",
    badgeText: "text-trust-high",
    dotActive: "bg-trust-high",
    dotInactive: "bg-slate/25",
    skip: "text-slate hover:text-ink",
    button: "bg-ink text-white shadow-card",
  },
  green: {
    bg: "bg-trust-high",
    eyebrow: "text-ink/70",
    headline: "text-ink",
    accent: "text-white",
    body: "text-ink/70",
    badgeBg: "bg-ink",
    badgeText: "text-trust-good",
    dotActive: "bg-ink",
    dotInactive: "bg-ink/20",
    skip: "text-ink/50 hover:text-ink",
    button: "bg-ink text-white shadow-[0_12px_28px_rgba(0,0,0,0.2)]",
  },
};
