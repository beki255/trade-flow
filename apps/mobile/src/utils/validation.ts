/**
 * Ethiopian Phone & Password Validation Utilities for TradeFlow (Mobile)
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  normalized?: string;
}

/**
 * Validates strictly Ethiopian phone numbers.
 * Supported formats:
 * - +251 9XXXXXXXX or +251 7XXXXXXXX (Ethio Telecom 9, Safaricom 7)
 * - 09XXXXXXXX or 07XXXXXXXX
 * - 2519XXXXXXXX or 2517XXXXXXXX
 * - 9XXXXXXXX or 7XXXXXXXX
 */
export function validateEthiopianPhone(phoneStr: string, lang: 'EN' | 'AM' | 'OM' = 'EN'): ValidationResult {
  if (!phoneStr || !phoneStr.trim()) {
    return {
      isValid: false,
      error:
        lang === 'AM'
          ? 'እባክዎ የስልክ ቁጥር ያስገቡ።'
          : lang === 'OM'
          ? 'Maaloo lakkoofsa bilbilaa galchaa.'
          : 'Phone number is required.',
    };
  }

  // Remove spaces, dashes, parentheses
  const cleaned = phoneStr.trim().replace(/[\s\-\(\)]/g, '');

  // Detect and reject foreign country codes (e.g. +1, +44, +254, etc.)
  if (cleaned.startsWith('+') && !cleaned.startsWith('+251')) {
    return {
      isValid: false,
      error:
        lang === 'AM'
          ? 'የኢትዮጵያ ስልክ ቁጥር ብቻ (+251 9... ወይም +251 7...) ተቀባይነት አለው።'
          : lang === 'OM'
          ? 'Lakkoofsa bilbilaa Itoophiyaa qofa (+251 9... ykn +251 7...) fudhatama qaba.'
          : 'Only Ethiopian phone numbers (+251 9... / +251 7... or 09... / 07...) are accepted.',
    };
  }

  // Regular expression for Ethiopian mobile numbers
  const ethRegex = /^(\+251|251|0)?(9|7)\d{8}$/;

  if (!ethRegex.test(cleaned)) {
    return {
      isValid: false,
      error:
        lang === 'AM'
          ? 'ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ (ለምሳሌ፦ +251 91 123 4567 ወይም 0911234567)።'
          : lang === 'OM'
          ? 'Lakkoofsa bilbilaa Itoophiyaa sirrii galchaa (fkn: +251 91 123 4567 ykn 0911234567).'
          : 'Invalid Ethiopian phone. Must start with 09, 07 or +251 (9 digits after code).',
    };
  }

  // Extract the 9 digits (starts with 9 or 7)
  const match = cleaned.match(/(9|7)\d{8}$/);
  const localDigits = match ? match[0] : '';
  const canonical = `+251${localDigits}`;

  return {
    isValid: true,
    normalized: canonical,
  };
}

/**
 * Validates password strength:
 * - Minimum 8 characters
 * - At least one letter (a-z, A-Z)
 * - At least one digit (0-9)
 */
export function validatePassword(password: string, lang: 'EN' | 'AM' | 'OM' = 'EN'): ValidationResult {
  if (!password) {
    return {
      isValid: false,
      error:
        lang === 'AM'
          ? 'የይለፍ ቃል ያስፈልጋል።'
          : lang === 'OM'
          ? 'Jechi icciitii barbaachisaadha.'
          : 'Password is required.',
    };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      error:
        lang === 'AM'
          ? 'የይለፍ ቃል ቢያንስ 8 ፊደላት/ቁጥሮች መሆን አለበት።'
          : lang === 'OM'
          ? 'Jechi icciitii yoo xiqqaate arfiilee/lakkoofsota 8 ta\'uu qaba.'
          : 'Password must be at least 8 characters long.',
    };
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);

  if (!hasLetter || !hasDigit) {
    return {
      isValid: false,
      error:
        lang === 'AM'
          ? 'የይለፍ ቃል ቢያንስ አንድ ፊደል እና አንድ ቁጥር ማካተት አለበት።'
          : lang === 'OM'
          ? 'Jechi icciitii yoo xiqqaate qubee tokkoo fi lakkoofsa tokko qabaachuu qaba.'
          : 'Password must contain at least one letter and one number.',
    };
  }

  return { isValid: true };
}

/**
 * Validates matching confirm password
 */
export function validatePasswordMatch(p1: string, p2: string, lang: 'EN' | 'AM' | 'OM' = 'EN'): ValidationResult {
  if (p1 !== p2) {
    return {
      isValid: false,
      error:
        lang === 'AM'
          ? 'የተረጋገጠው የይለፍ ቃል አይዛመድም።'
          : lang === 'OM'
          ? 'Jechi icciitii lamaan wal hin simne.'
          : 'Passwords do not match.',
    };
  }
  return { isValid: true };
}

/**
 * Validates email format strictly
 */
export function validateEmail(email: string, lang: 'EN' | 'AM' | 'OM' = 'EN'): ValidationResult {
  if (!email || !email.trim()) {
    return {
      isValid: false,
      error:
        lang === 'AM'
          ? 'እባክዎ የኢሜይል አድራሻ ያስገቡ።'
          : lang === 'OM'
          ? 'Maaloo teessoo imeelii galchaa.'
          : 'Email address is required.',
    };
  }

  const clean = email.trim();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(clean)) {
    return {
      isValid: false,
      error:
        lang === 'AM'
          ? 'ትክክለኛ የኢሜይል አድራሻ ያስገቡ (ለምሳሌ፦ user@domain.com)።'
          : lang === 'OM'
          ? 'Teessoo imeelii sirrii galchaa (fkn: user@domain.com).'
          : 'Please enter a valid email address (e.g. user@domain.com).',
    };
  }

  return { isValid: true, normalized: clean.toLowerCase() };
}

/**
 * Validates Ethiopian Taxpayer Identification Number (TIN).
 * Ethiopian MoR standard: Exactly 10 numeric digits.
 */
export function validateEthiopianTin(tinStr: string, required: boolean = true, lang: 'EN' | 'AM' | 'OM' = 'EN'): ValidationResult {
  const cleaned = (tinStr || '').trim().replace(/[\s\-]/g, '');

  if (!cleaned) {
    if (!required) return { isValid: true };
    return {
      isValid: false,
      error:
        lang === 'AM'
          ? 'እባክዎ የTIN (የግብር ከፋይ መለያ) ቁጥር ያስገቡ።'
          : lang === 'OM'
          ? 'Maaloo lakkoofsa TIN galchaa.'
          : 'TIN (Tax Identification Number) is required.',
    };
  }

  // Exactly 10 numeric digits
  const tinRegex = /^\d{10}$/;
  if (!tinRegex.test(cleaned)) {
    return {
      isValid: false,
      error:
        lang === 'AM'
          ? 'ትክክለኛ የኢትዮጵያ TIN ቁጥር ያስገቡ (በትክክል 10 አሃዝ ቁጥር ብቻ፤ ምሳሌ: 0098473621)።'
          : lang === 'OM'
          ? 'Lakkoofsa TIN Itoophiyaa sirrii galchaa (lakkoofsota 10 qofa; fkn: 0098473621).'
          : 'Invalid Ethiopian TIN. Must be exactly 10 numeric digits (e.g., 0098473621).',
    };
  }

  return { isValid: true, normalized: cleaned };
}

/**
 * Validates Ethiopian Trade License / Business Registration Number.
 * MoTRI / Regional Trade Bureaus / EMA standard:
 * - 6 to 30 alphanumeric characters with optional slashes and hyphens.
 * - Examples: MT/AA/14/673/2016, AA/B/001234/2015, ETH-MOTI-2024-99, EMA-FF-2026-08
 */
export function validateEthiopianTradeLicense(
  licenseStr: string,
  required: boolean = true,
  isForwarder: boolean = false,
  lang: 'EN' | 'AM' | 'OM' = 'EN'
): ValidationResult {
  const cleaned = (licenseStr || '').trim();

  if (!cleaned) {
    if (!required) return { isValid: true };
    return {
      isValid: false,
      error: isForwarder
        ? (lang === 'AM'
            ? 'እባክዎ የባህር ጉዳይ (EMA) የጭነት አስተላላፊነት ፍቃድ ቁጥር ያስገቡ።'
            : lang === 'OM'
            ? 'Maaloo lakkoofsa heyyama geejjibaa EMA galchaa.'
            : 'EMA Freight Forwarding License No is required.')
        : (lang === 'AM'
            ? 'እባክዎ የንግድ ፈቃድ / ምዝገባ ቁጥር ያስገቡ።'
            : lang === 'OM'
            ? 'Maaloo lakkoofsa heyyama daldalaa galchaa.'
            : 'Trade License / Registration Number is required.'),
    };
  }

  // Length 6 to 30, only alphanumeric and / -
  const licenseRegex = /^[A-Za-z0-9\/\-]{6,30}$/;
  if (!licenseRegex.test(cleaned)) {
    return {
      isValid: false,
      error:
        lang === 'AM'
          ? 'ትክክለኛ የንግድ ፈቃድ ቁጥር ያስገቡ (ከ6 እስከ 30 ፊደላት፣ ቁጥሮች ወይም /፤ ምሳሌ: MT/AA/14/673/2016 ወይም ETH-MOTI-2024-99)።'
          : lang === 'OM'
          ? 'Lakkoofsa heyyama daldalaa sirrii galchaa (arfiilee 6 hanga 30; fkn: MT/AA/14/673/2016 ykn ETH-MOTI-2024-99).'
          : 'Invalid Trade License format. Allowed 6-30 characters (letters, numbers, / and -; e.g. MT/AA/14/673/2016 or ETH-MOTI-2024-99).',
    };
  }

  return { isValid: true, normalized: cleaned.toUpperCase() };
}
