import { Link } from "@tanstack/react-router";

export const SMS_CONSENT_TEXT =
  "I agree to receive text messages from Sanders Manufactured Housing about my request, including home availability, pricing and appointment updates. Message frequency varies. Message and data rates may apply. Reply STOP to opt out, HELP for help. Consent is not a condition of purchase.";

export const MARKETING_CONSENT_TEXT =
  "Optional: send me occasional texts and emails about new arrivals, specials and financing offers from Sanders Manufactured Housing.";

export type ConsentState = { sms: boolean; marketing: boolean };

export const EMPTY_CONSENT: ConsentState = { sms: false, marketing: false };

/**
 * TCPA / TCR compliant consent capture. The SMS checkbox is required before a
 * lead can be submitted, it is never pre-checked, and the exact wording the
 * visitor agreed to is stored with the lead.
 */
export function ConsentFields({
  value,
  onChange,
  idPrefix,
}: {
  value: ConsentState;
  onChange: (next: ConsentState) => void;
  idPrefix: string;
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-border bg-sand p-3">
      <label htmlFor={`${idPrefix}-sms`} className="flex cursor-pointer gap-3">
        <input
          id={`${idPrefix}-sms`}
          type="checkbox"
          checked={value.sms}
          onChange={(e) => onChange({ ...value, sms: e.target.checked })}
          className="mt-0.5 size-4 shrink-0 accent-[var(--color-primary)]"
        />
        <span className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Text me updates (required)</span>
          <br />
          {SMS_CONSENT_TEXT} See our{" "}
          <Link to="/privacy" className="font-semibold text-primary underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link to="/terms" className="font-semibold text-primary underline">
            Terms of Use
          </Link>
          .
        </span>
      </label>

      <label htmlFor={`${idPrefix}-marketing`} className="flex cursor-pointer gap-3">
        <input
          id={`${idPrefix}-marketing`}
          type="checkbox"
          checked={value.marketing}
          onChange={(e) => onChange({ ...value, marketing: e.target.checked })}
          className="mt-0.5 size-4 shrink-0 accent-[var(--color-primary)]"
        />
        <span className="text-xs leading-relaxed text-muted-foreground">
          {MARKETING_CONSENT_TEXT}
        </span>
      </label>
    </div>
  );
}

/** Builds the consent payload sent with a lead. */
export function consentPayload(value: ConsentState) {
  return {
    smsConsent: value.sms,
    marketingConsent: value.marketing,
    consentText: value.marketing ? `${SMS_CONSENT_TEXT} ${MARKETING_CONSENT_TEXT}` : SMS_CONSENT_TEXT,
    consentAt: new Date().toISOString(),
    consentSourceUrl: typeof window === "undefined" ? "" : window.location.href,
  };
}
