/**
 * preferredLanguage may be a plain string (patient intake radio) or JSON array string
 * (admin assessment checkboxes), e.g. "Hindi" or '["Hindi"]' or '["English","Hindi"]'.
 */

function parsePreferredLanguages(raw: unknown): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.map((x) => String(x).trim()).filter(Boolean);
  }
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (!t) return [];
    try {
      const p = JSON.parse(t);
      if (Array.isArray(p)) {
        return p.map((x: unknown) => String(x).trim()).filter(Boolean);
      }
    } catch {
      /* single label */
    }
    return [t];
  }
  return [];
}

/** Primary language for patient-facing sections: first non-English if any, otherwise English. */
export function carePlanPrimaryPatientLanguage(raw: unknown): string {
  const langs = parsePreferredLanguages(raw);
  const normalized = langs.map((l) => l.trim());
  const nonEn = normalized.find((l) => l.toLowerCase() !== 'english');
  if (nonEn) {
    return nonEn.charAt(0).toUpperCase() + nonEn.slice(1).toLowerCase();
  }
  return 'English';
}
