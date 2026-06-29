import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import type { ContactFormPayload } from '../../types';
import { parseContactFormPayload } from '../../lib/contact-form-validation.server';
import {
  extractDomainFromEmail,
  verifyEmailDomainAcceptsMail,
} from '../../lib/email-domain-dns';

export const prerender =
  process.env.GITHUB_PAGES === 'true';

function getResend(): Resend | null {
  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}
const CONTACT_EMAIL = 'info@DS5construction.co.uk';
const FROM_EMAIL =
  import.meta.env.RESEND_FROM_EMAIL ??
  'onboarding@resend.dev';
const TO_EMAIL =
  import.meta.env.CONTACT_FORM_RECIPIENT_EMAIL ??
  CONTACT_EMAIL;
const SKIP_MX_CHECK =
  import.meta.env.CONTACT_SKIP_MX_CHECK === 'true';

function buildEmailHtml(body: ContactFormPayload): string {
  const rows = [
    ['First name', body.firstName],
    ['Second name', body.secondName || '—'],
    ['Phone', body.phone || '—'],
    ['Email', body.email],
    ['Message', body.message],
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#666;">${label}</td><td style="padding:6px 0;">${value}</td></tr>`,
    )
    .join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:sans-serif;max-width:560px;"><h2 style="margin-bottom:16px;">New quote request</h2><table style="border-collapse:collapse;">${rows}</table></body></html>`;
}

export const POST: APIRoute = async ({ request }) => {
  const resend = getResend();
  if (!resend) {
    return new Response(
      JSON.stringify({ error: 'Email is not configured' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const parsed = parseContactFormPayload(raw);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: 'Please check the form fields',
        fieldErrors: parsed.fieldErrors,
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const body = parsed.data;
  const { firstName, email } = body;

  if (!SKIP_MX_CHECK) {
    const domain = extractDomainFromEmail(email);
    if (!domain) {
      return new Response(
        JSON.stringify({
          error: 'Please check the form fields',
          fieldErrors: {
            email: 'Enter a valid email address',
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const dnsResult =
      await verifyEmailDomainAcceptsMail(domain);
    if (!dnsResult.ok) {
      const emailMsg =
        dnsResult.reason === 'timeout'
          ? 'Could not verify this email domain. Please try again.'
          : 'This email domain does not appear to accept mail.';
      return new Response(
        JSON.stringify({
          error: emailMsg,
          fieldErrors: { email: emailMsg },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: `Quote request from ${firstName}`,
      html: buildEmailHtml(body),
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error:
          err instanceof Error
            ? err.message
            : 'Failed to send email',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
};
