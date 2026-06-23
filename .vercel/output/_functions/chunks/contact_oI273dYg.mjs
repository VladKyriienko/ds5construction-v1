import { Resend } from 'resend';
import { z } from 'zod';

const CONTACT_PHONE_MAX_DIGITS = 13;
const CONTACT_PHONE_MAX_CHARS = 16;
const CONTACT_FIRST_NAME_MAX = 80;
const CONTACT_SECOND_NAME_MAX = 80;
const CONTACT_EMAIL_MAX = 254;
const CONTACT_MESSAGE_MAX = 4e3;
function isStrictEmailFormat(value) {
  const s = value.trim();
  if (!s.includes("@")) return false;
  const at = s.lastIndexOf("@");
  if (at <= 0 || at === s.length - 1) return false;
  const domain = s.slice(at + 1);
  if (domain.startsWith(".") || domain.endsWith(".") || domain.includes(".."))
    return false;
  const labels = domain.split(".").filter(Boolean);
  if (labels.length < 2) return false;
  const tld = labels[labels.length - 1] ?? "";
  if (tld.length < 2) return false;
  if (tld.length > 5 && !/^xn--/i.test(tld)) return false;
  return true;
}
function sanitizePhoneInput(raw) {
  return raw.replace(/[^\d+().-]/g, "");
}
function normalizePhoneLeadingPlus(sanitized) {
  if (sanitized.startsWith("+")) {
    return `+${sanitized.slice(1).replace(/\+/g, "")}`;
  }
  return sanitized.replace(/\+/g, "");
}
function clampPhoneInput(raw) {
  const s = normalizePhoneLeadingPlus(
    sanitizePhoneInput(raw)
  );
  let digits = 0;
  let out = "";
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

function digitCount(value) {
  return value.replace(/\D/g, "").length;
}
z.object({
  firstName: z.string().trim().min(1, "First name is required").max(
    CONTACT_FIRST_NAME_MAX,
    `First name must be at most ${CONTACT_FIRST_NAME_MAX} characters`
  ),
  secondName: z.union([z.string(), z.null(), z.undefined()]).transform((v) => {
    if (v == null) return void 0;
    const t = String(v).trim().slice(0, CONTACT_SECOND_NAME_MAX);
    return t === "" ? void 0 : t;
  }),
  phone: z.union([z.string(), z.null(), z.undefined()]).transform((v) => {
    if (v == null) return void 0;
    const t = clampPhoneInput(String(v)).trim();
    return t === "" ? void 0 : t;
  }).refine(
    (v) => v === void 0 || digitCount(v) >= 10 && digitCount(v) <= CONTACT_PHONE_MAX_DIGITS,
    {
      message: `Enter a valid phone number (10–${CONTACT_PHONE_MAX_DIGITS} digits)`
    }
  ),
  email: z.string().trim().min(1, "Email is required").max(
    CONTACT_EMAIL_MAX,
    `Email must be at most ${CONTACT_EMAIL_MAX} characters`
  ).email("Enter a valid email address").refine(
    isStrictEmailFormat,
    "Enter a valid email address"
  ),
  message: z.string().trim().min(1, "Message is required").max(
    CONTACT_MESSAGE_MAX,
    `Message must be at most ${CONTACT_MESSAGE_MAX} characters`
  )
});

const prerender = false;
new Resend(undefined                              );
const POST = async ({ request }) => {
  {
    return new Response(
      JSON.stringify({ error: "Email is not configured" }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
