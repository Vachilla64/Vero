/**
 * NUBAN Validation Utility
 * Validates a 10-digit Nigerian Uniform Bank Account Number (NUBAN)
 * based on the Modulus-10 weighted sum algorithm.
 */

function validateNuban(accountNumber, bankCode = "000") {
  if (!accountNumber || accountNumber.length !== 10 || !/^\d+$/.test(accountNumber)) {
    return false;
  }

  // The 10th digit is the check digit
  const checkDigit = parseInt(accountNumber.charAt(9), 10);
  
  // The algorithm requires concatenating the bank code and the first 9 digits of the account number
  const serialNumber = accountNumber.substring(0, 9);
  const accountString = bankCode + serialNumber;

  // Standard NUBAN weights for the 12 digits (3-digit bank code + 9-digit serial)
  const weights = [3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3];
  
  if (accountString.length !== 12) {
      // Fallback for internal 15-digit codes if we expand the bank code length
      return false;
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(accountString.charAt(i), 10) * weights[i];
  }

  const modulo = sum % 10;
  let calculatedCheckDigit = 10 - modulo;
  if (calculatedCheckDigit === 10) {
    calculatedCheckDigit = 0;
  }

  return calculatedCheckDigit === checkDigit;
}

const FIRST_NAMES = ["Chidi", "Blessing", "Adaeze", "Tunde", "Emeka", "Ngozi", "Aisha", "Ibrahim", "Oluwaseun", "Fatima", "Kelechi", "Chiamaka", "Abubakar", "Folake", "Obinna"];
const LAST_NAMES = ["Nwosu", "Eze", "Okafor", "Adeyemi", "Okonkwo", "Ibrahim", "Musa", "Bello", "Ogunleye", "Abiola", "Olawale", "Okoro", "Nwachukwu", "Umar", "Lawal"];

function generateFakeName(nuban) {
  if (!nuban || nuban.length !== 10) return "Unknown User";
  
  // Use parts of NUBAN to deterministically pick names
  const firstIndex = parseInt(nuban.substring(0, 5), 10) % FIRST_NAMES.length;
  const lastIndex = parseInt(nuban.substring(5, 10), 10) % LAST_NAMES.length;
  
  return `${FIRST_NAMES[firstIndex]} ${LAST_NAMES[lastIndex]}`;
}

module.exports = {
  validateNuban,
  generateFakeName
};
