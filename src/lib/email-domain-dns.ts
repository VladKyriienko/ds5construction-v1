import { promises as dns } from 'node:dns';
import { toASCII } from 'node:punycode';

const MX_TIMEOUT_MS = 4500;
const A_TIMEOUT_MS = 2500;

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      reject(
        Object.assign(new Error('DNS lookup timed out'), {
          code: 'ETIMEOUT',
        }),
      );
    }, ms);
    promise.then(
      (v) => {
        clearTimeout(id);
        resolve(v);
      },
      (e) => {
        clearTimeout(id);
        reject(e);
      },
    );
  });
}

export function extractDomainFromEmail(
  email: string,
): string | null {
  const trimmed = email.trim();
  const at = trimmed.lastIndexOf('@');
  if (at <= 0 || at === trimmed.length - 1) return null;
  return (
    trimmed
      .slice(at + 1)
      .trim()
      .toLowerCase() || null
  );
}

export async function verifyEmailDomainAcceptsMail(
  domain: string,
): Promise<
  | { ok: true }
  | {
      ok: false;
      reason:
        | 'no_mx_or_host'
        | 'timeout'
        | 'invalid_domain';
    }
> {
  const raw = domain.trim().toLowerCase();
  if (!raw) return { ok: false, reason: 'invalid_domain' };

  let lookupHost: string;
  try {
    lookupHost = toASCII(raw);
  } catch {
    return { ok: false, reason: 'invalid_domain' };
  }
  if (!lookupHost)
    return { ok: false, reason: 'invalid_domain' };

  const isTimeout = (e: unknown) =>
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    (e as { code: string }).code === 'ETIMEOUT';

  try {
    const mx = await withTimeout(
      dns.resolveMx(lookupHost),
      MX_TIMEOUT_MS,
    );
    if (mx.length > 0) return { ok: true };
  } catch (e) {
    if (isTimeout(e))
      return { ok: false, reason: 'timeout' };
  }

  try {
    const v4 = await withTimeout(
      dns.resolve4(lookupHost),
      A_TIMEOUT_MS,
    );
    if (v4.length > 0) return { ok: true };
  } catch (e) {
    if (isTimeout(e))
      return { ok: false, reason: 'timeout' };
  }

  try {
    const v6 = await withTimeout(
      dns.resolve6(lookupHost),
      A_TIMEOUT_MS,
    );
    if (v6.length > 0) return { ok: true };
  } catch (e) {
    if (isTimeout(e))
      return { ok: false, reason: 'timeout' };
  }

  return { ok: false, reason: 'no_mx_or_host' };
}
