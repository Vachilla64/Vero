export const BANK_STYLES = {
  "044": { color: "text-orange-500", bg: "bg-orange-500/10" },
  "058": { color: "text-orange-600", bg: "bg-orange-600/10" },
  "057": { color: "text-red-500", bg: "bg-red-500/10" },
  "033": { color: "text-red-600", bg: "bg-red-600/10" },
  "011": { color: "text-blue-800", bg: "bg-blue-800/10" },
  "032": { color: "text-blue-400", bg: "bg-blue-400/10" },
  "50211": { color: "text-purple-600", bg: "bg-purple-600/10" },
  "100004": { color: "text-green-500", bg: "bg-green-500/10" },
  "50515": { color: "text-blue-600", bg: "bg-blue-600/10" },
  "100033": { color: "text-purple-500", bg: "bg-purple-500/10" },
};

export const DEFAULT_BANK_STYLE = { color: "text-slate", bg: "bg-canvas" };
export const bankStyle = (code) => BANK_STYLES[code] || DEFAULT_BANK_STYLE;

export const BANK_ALIASES = {
  "gtbank": "guaranty trust",
  "gtb": "guaranty trust",
  "uba": "united bank for africa",
  "firstbank": "first bank",
  "fbn": "first bank",
  "ubn": "union bank",
  "fcmb": "first city monument",
  "stanbic": "stanbic",
  "sterling": "sterling",
  "wema": "wema",
  "alat": "wema",
  "fidelity": "fidelity",
  "polaris": "polaris",
  "unity": "unity",
  "keystone": "keystone",
  "heritage": "heritage",
  "providus": "providus",
  "suntrust": "suntrust",
  "jaiz": "jaiz",
  "moniepoint": "moniepoint",
  "moniepont": "moniepoint",
};

export const BANK_LOGOS = {
  "044": "/banks/accessbankplc.png",
  "058": "/banks/gtbank.png",
  "057": "/banks/zenithbank.png",
  "033": "/banks/ubagroup.png",
  "011": "/banks/firstbanknigeria.png",
  "032": "/banks/unionbankng.png",
  "50211": "/banks/kuda.png",
  "100004": "/banks/opayweb.png",
  "50515": "/banks/moniepoint.png",
  "100033": "/banks/palmpay.png",
};

export const FALLBACK_BANKS = [
  { code: "044", name: "Access Bank" },
  { code: "058", name: "Guaranty Trust Bank" },
  { code: "057", name: "Zenith Bank" },
  { code: "033", name: "United Bank For Africa" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "032", name: "Union Bank of Nigeria" },
  { code: "50211", name: "Kuda Bank" },
  { code: "100004", name: "OPay" },
  { code: "50515", name: "Moniepoint MFB" },
  { code: "100033", name: "PalmPay" },
];

/**
 * Attempts to resolve a bank name (which might be partial or aliased)
 * back to its Paystack code, and then returns the logo path if available.
 */
export const getBankLogoByName = (bankName) => {
  if (!bankName) return null;
  const lowerName = bankName.toLowerCase();
  
  let matchedBank = FALLBACK_BANKS.find(b => lowerName.includes(b.name.toLowerCase()));
  
  if (!matchedBank) {
    for (const [alias, target] of Object.entries(BANK_ALIASES)) {
      if (lowerName.includes(alias) || lowerName.includes(target)) {
        matchedBank = FALLBACK_BANKS.find(b => b.name.toLowerCase().includes(target));
        break;
      }
    }
  }

  if (!matchedBank) {
    if (lowerName.includes('guaranty trust') || lowerName.includes('gtbank')) return BANK_LOGOS["058"];
    if (lowerName.includes('access')) return BANK_LOGOS["044"];
    if (lowerName.includes('zenith')) return BANK_LOGOS["057"];
    if (lowerName.includes('united bank for africa') || lowerName.includes('uba')) return BANK_LOGOS["033"];
    if (lowerName.includes('first bank')) return BANK_LOGOS["011"];
    if (lowerName.includes('union bank')) return BANK_LOGOS["032"];
    if (lowerName.includes('kuda')) return BANK_LOGOS["50211"];
    if (lowerName.includes('opay')) return BANK_LOGOS["100004"];
    if (lowerName.includes('moniepoint')) return BANK_LOGOS["50515"];
    if (lowerName.includes('palmpay')) return BANK_LOGOS["100033"];
  }

  return matchedBank ? BANK_LOGOS[matchedBank.code] : null;
};
