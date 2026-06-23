import { z } from 'zod';
import {
  clampPhoneInput,
  CONTACT_EMAIL_MAX,
  CONTACT_FIRST_NAME_MAX,
  CONTACT_MESSAGE_MAX,
  CONTACT_PHONE_MAX_DIGITS,
  CONTACT_SECOND_NAME_MAX,
  isStrictEmailFormat,
  type ContactFormPayload,
} from './contact-form-fields';

function digitCount(value: string): number {
  return value.replace(/\D/g, '').length;
}

const contactFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(
      CONTACT_FIRST_NAME_MAX,
      `First name must be at most ${CONTACT_FIRST_NAME_MAX} characters`,
    ),
  secondName: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => {
      if (v == null) return undefined;
      const t = String(v)
        .trim()
        .slice(0, CONTACT_SECOND_NAME_MAX);
      return t === '' ? undefined : t;
    }),
  phone: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => {
      if (v == null) return undefined;
      const t = clampPhoneInput(String(v)).trim();
      return t === '' ? undefined : t;
    })
    .refine(
      (v) =>
        v === undefined ||
        (digitCount(v) >= 10 &&
          digitCount(v) <= CONTACT_PHONE_MAX_DIGITS),
      {
        message: `Enter a valid phone number (10–${CONTACT_PHONE_MAX_DIGITS} digits)`,
      },
    ),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(
      CONTACT_EMAIL_MAX,
      `Email must be at most ${CONTACT_EMAIL_MAX} characters`,
    )
    .email('Enter a valid email address')
    .refine(
      isStrictEmailFormat,
      'Enter a valid email address',
    ),
  message: z
    .string()
    .trim()
    .min(1, 'Message is required')
    .max(
      CONTACT_MESSAGE_MAX,
      `Message must be at most ${CONTACT_MESSAGE_MAX} characters`,
    ),
});

export function parseContactFormPayload(
  body: unknown,
):
  | { success: true; data: ContactFormPayload }
  | {
      success: false;
      fieldErrors: Record<string, string>;
    } {
  const result = contactFormSchema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (
      typeof key === 'string' &&
      fieldErrors[key] === undefined
    ) {
      fieldErrors[key] = issue.message;
    }
  }
  return { success: false, fieldErrors };
}
