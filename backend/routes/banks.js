const express = require('express');

const router = express.Router();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // Bank lists change rarely

// Served when Paystack is unreachable or no key is configured, so the bank
// selector always has something to render.
const FALLBACK_BANKS = [
  { code: '044', name: 'Access Bank' },
  { code: '058', name: 'Guaranty Trust Bank' },
  { code: '057', name: 'Zenith Bank' },
  { code: '033', name: 'United Bank For Africa' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '032', name: 'Union Bank of Nigeria' },
  { code: '50211', name: 'Kuda Bank' },
  { code: '100004', name: 'OPay' },
  { code: '50515', name: 'Moniepoint MFB' },
  { code: '100033', name: 'PalmPay' }
];

let cache = { banks: null, fetchedAt: 0 };

async function fetchBanksFromPaystack() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(
      'https://api.paystack.co/bank?country=nigeria&perPage=200',
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
        signal: controller.signal
      }
    );

    if (!response.ok) {
      throw new Error(`Paystack responded ${response.status}`);
    }

    const body = await response.json();
    if (!body?.status || !Array.isArray(body.data)) {
      throw new Error('Unexpected Paystack payload');
    }

    // Paystack ships a handful of duplicate codes (e.g. two "Zenith Bank"
    // rows on 057, "BANKIT MFB" vs "BANKIT MICROFINANCE BANK LTD" on 50572).
    // The code is the identifier we send to /api/verify, so duplicates are
    // functionally identical — and they collide as React keys downstream.
    // Keep the shortest name, which is consistently the human-readable one.
    const byCode = new Map();
    for (const bank of body.data) {
      if (!bank.active || !bank.code) continue;
      const existing = byCode.get(bank.code);
      if (!existing || bank.name.length < existing.name.length) {
        byCode.set(bank.code, { code: bank.code, name: bank.name });
      }
    }

    return [...byCode.values()].sort((a, b) => a.name.localeCompare(b.name));
  } finally {
    clearTimeout(timeoutId);
  }
}

// GET /api/banks — public: bank codes are public reference data, and this
// keeps the Paystack secret key server-side where it belongs.
router.get('/', async (req, res) => {
  const isFresh = cache.banks && Date.now() - cache.fetchedAt < CACHE_TTL_MS;
  if (isFresh) {
    return res.json({ banks: cache.banks, source: 'cache' });
  }

  if (!PAYSTACK_SECRET_KEY) {
    return res.json({ banks: FALLBACK_BANKS, source: 'fallback' });
  }

  try {
    const banks = await fetchBanksFromPaystack();
    cache = { banks, fetchedAt: Date.now() };
    res.json({ banks, source: 'paystack' });
  } catch (error) {
    console.error('Bank list fetch failed:', error.message);
    // Serve a stale cache before falling back to the static list.
    const banks = cache.banks || FALLBACK_BANKS;
    res.json({ banks, source: cache.banks ? 'stale-cache' : 'fallback' });
  }
});

module.exports = router;
