export const CONTACT_PHONE_MAX_DIGITS = 13;
export const CONTACT_PHONE_MAX_CHARS = 16;
export const CONTACT_FIRST_NAME_MAX = 80;
export const CONTACT_SECOND_NAME_MAX = 80;
export const CONTACT_EMAIL_MAX = 254;
export const CONTACT_MESSAGE_MAX = 4000;

export type ContactFormPayload = {
  firstName: string;
  secondName?: string;
  phone?: string;
  email: string;
  message: string;
};

function digitCount(value: string): number {
  return value.replace(/\D/g, '').length;
}

export function isStrictEmailFormat(
  value: string,
): boolean {
  const s = value.trim();
  if (!s.includes('@')) return false;
  const at = s.lastIndexOf('@');
  if (at <= 0 || at === s.length - 1) return false;
  const domain = s.slice(at + 1);
  if (
    domain.startsWith('.') ||
    domain.endsWith('.') ||
    domain.includes('..')
  )
    return false;
  const labels = domain.split('.').filter(Boolean);
  if (labels.length < 2) return false;
  const tld = labels[labels.length - 1] ?? '';
  if (tld.length < 2) return false;
  if (tld.length > 5 && !/^xn--/i.test(tld)) return false;
  return true;
}

export function sanitizePhoneInput(raw: string): string {
  return raw.replace(/[^\d+().-]/g, '');
}

function normalizePhoneLeadingPlus(
  sanitized: string,
): string {
  if (sanitized.startsWith('+')) {
    return `+${sanitized.slice(1).replace(/\+/g, '')}`;
  }
  return sanitized.replace(/\+/g, '');
}

export function clampPhoneInput(raw: string): string {
  const s = normalizePhoneLeadingPlus(
    sanitizePhoneInput(raw),
  );
  let digits = 0;
  let out = '';
  for (const ch of s) {
    if (/\d/.test(ch)) {
      if (digits >= CONTACT_PHONE_MAX_DIGITS) continue;
      digits += 1;
      out += ch;
    } else {
      out += ch;
    }
  }
  return out.slice(0, CONTACT_PHONE_MAX_CHARS);
}

const BASIC_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeSecondName(
  value: unknown,
): string | undefined {
  if (value == null) return undefined;
  const t = String(value)
    .trim()
    .slice(0, CONTACT_SECOND_NAME_MAX);
  return t === '' ? undefined : t;
}

function normalizePhone(
  value: unknown,
): string | undefined {
  if (value == null) return undefined;
  const t = clampPhoneInput(String(value)).trim();
  return t === '' ? undefined : t;
}

export function parseContactFormPayload(
  body: unknown,
):
  | { success: true; data: ContactFormPayload }
  | {
      success: false;
      fieldErrors: Record<string, string>;
    } {
  if (typeof body !== 'object' || body === null) {
    return {
      success: false,
      fieldErrors: { firstName: 'First name is required' },
    };
  }

  const raw = body as Record<string, unknown>;
  const fieldErrors: Record<string, string> = {};

  const firstName = String(raw.firstName ?? '').trim();
  if (!firstName) {
    fieldErrors.firstName = 'First name is required';
  } else if (firstName.length > CONTACT_FIRST_NAME_MAX) {
    fieldErrors.firstName = `First name must be at most ${CONTACT_FIRST_NAME_MAX} characters`;
  }

  const secondName = normalizeSecondName(raw.secondName);

  const phone = normalizePhone(raw.phone);
  if (
    phone !== undefined &&
    (digitCount(phone) < 10 ||
      digitCount(phone) > CONTACT_PHONE_MAX_DIGITS)
  ) {
    fieldErrors.phone = `Enter a valid phone number (10–${CONTACT_PHONE_MAX_DIGITS} digits)`;
  }

  const email = String(raw.email ?? '').trim();
  if (!email) {
    fieldErrors.email = 'Email is required';
  } else if (email.length > CONTACT_EMAIL_MAX) {
    fieldErrors.email = `Email must be at most ${CONTACT_EMAIL_MAX} characters`;
  } else if (!BASIC_EMAIL_RE.test(email)) {
    fieldErrors.email = 'Enter a valid email address';
  } else if (!isStrictEmailFormat(email)) {
    fieldErrors.email = 'Enter a valid email address';
  }

  const message = String(raw.message ?? '').trim();
  if (!message) {
    fieldErrors.message = 'Message is required';
  } else if (message.length > CONTACT_MESSAGE_MAX) {
    fieldErrors.message = `Message must be at most ${CONTACT_MESSAGE_MAX} characters`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    data: {
      firstName,
      ...(secondName !== undefined ? { secondName } : {}),
      ...(phone !== undefined ? { phone } : {}),
      email,
      message,
    },
  };
}
