import {
  clampPhoneInput,
  parseContactFormPayload,
} from '../lib/contact-form-fields';

type FieldName =
  | 'firstName'
  | 'secondName'
  | 'phone'
  | 'email'
  | 'message';

let initPromise: Promise<void> | null = null;

export function ensureContactForms(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = Promise.resolve().then(() =>
    initContactForms(),
  );
  return initPromise;
}

function initContactForms() {
  if (
    document.documentElement.dataset.contactFormsInit ===
    'true'
  ) {
    return;
  }
  document.documentElement.dataset.contactFormsInit =
    'true';

  document
    .querySelectorAll<HTMLFormElement>(
      '[data-contact-form]',
    )
    .forEach((form) => {
      if (form.dataset.bound === 'true') return;
      form.dataset.bound = 'true';

      const errorEl = form.querySelector<HTMLElement>(
        '[data-form-error]',
      );
      const fieldsEl = form.querySelector<HTMLElement>(
        '[data-form-fields]',
      );
      const successEl = form.querySelector<HTMLElement>(
        '[data-form-success]',
      );
      const submitBtn =
        form.querySelector<HTMLButtonElement>(
          '[type="submit"]',
        );
      const phoneInput =
        form.querySelector<HTMLInputElement>(
          '[name="phone"]',
        );

      phoneInput?.addEventListener('input', () => {
        phoneInput.value = clampPhoneInput(
          phoneInput.value,
        );
        clearFieldError(form, 'phone');
      });

      form
        .querySelectorAll<
          HTMLInputElement | HTMLTextAreaElement
        >('input, textarea')
        .forEach((input) => {
          input.addEventListener('input', () => {
            const name = input.name as FieldName;
            if (name) clearFieldError(form, name);
          });
        });

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (errorEl) {
          errorEl.textContent = '';
          errorEl.classList.add('hidden');
        }

        const payload = {
          firstName: (
            form.elements.namedItem(
              'firstName',
            ) as HTMLInputElement
          ).value,
          secondName: (
            form.elements.namedItem(
              'secondName',
            ) as HTMLInputElement
          ).value,
          phone: phoneInput?.value ?? '',
          email: (
            form.elements.namedItem(
              'email',
            ) as HTMLInputElement
          ).value,
          message: (
            form.elements.namedItem(
              'message',
            ) as HTMLTextAreaElement
          ).value,
        };

        const parsed = parseContactFormPayload(payload);
        if (!parsed.success) {
          Object.entries(parsed.fieldErrors).forEach(
            ([field, message]) => {
              showFieldError(
                form,
                field as FieldName,
                message,
              );
            },
          );
          return;
        }

        clearAllFieldErrors(form);
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Sending…';
        }

        try {
          const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsed.data),
          });
          const data = (await res
            .json()
            .catch(() => ({}))) as {
            error?: string;
            fieldErrors?: Record<string, string>;
          };

          if (!res.ok) {
            if (errorEl && data.error) {
              errorEl.textContent = data.error;
              errorEl.classList.remove('hidden');
            }
            if (data.fieldErrors) {
              Object.entries(data.fieldErrors).forEach(
                ([field, message]) => {
                  showFieldError(
                    form,
                    field as FieldName,
                    message,
                  );
                },
              );
            }
            return;
          }

          fieldsEl?.classList.add('hidden');
          successEl?.classList.remove('hidden');
          document.dispatchEvent(
            new Event('quote-form-success'),
          );
        } catch {
          if (errorEl) {
            errorEl.textContent =
              'Failed to send. Please try again.';
            errorEl.classList.remove('hidden');
          }
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Get free quote';
          }
        }
      });
    });
}

function showFieldError(
  form: HTMLFormElement,
  field: FieldName,
  message: string,
) {
  const error = form.querySelector<HTMLElement>(
    `[data-error-for="${field}"]`,
  );
  if (!error) return;
  error.textContent = message;
  error.classList.remove('hidden');
  const input = form.elements.namedItem(
    field,
  ) as HTMLElement | null;
  input?.classList.add('border-destructive');
}

function clearFieldError(
  form: HTMLFormElement,
  field: FieldName,
) {
  const error = form.querySelector<HTMLElement>(
    `[data-error-for="${field}"]`,
  );
  if (error) {
    error.textContent = '';
    error.classList.add('hidden');
  }
  const input = form.elements.namedItem(
    field,
  ) as HTMLElement | null;
  input?.classList.remove('border-destructive');
}

function clearAllFieldErrors(form: HTMLFormElement) {
  (
    [
      'firstName',
      'secondName',
      'phone',
      'email',
      'message',
    ] as FieldName[]
  ).forEach((field) => clearFieldError(form, field));
}
