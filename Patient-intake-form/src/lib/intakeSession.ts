/** After a successful submit, block /form until a new browser session (sessionStorage cleared). */
export const INTAKE_SUBMITTED_KEY = 'mygastro_intake_submitted';

/** Landing page stores name/email before opening the intake form. */
export const PATIENT_ENTRY_KEY = 'patient_entry';

/** Logged-in patient user stored after successful sign-in or sign-up. */
export const PATIENT_AUTH_KEY = 'mygastro_patient_auth';

export interface PatientAuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function getPatientAuth(): PatientAuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(PATIENT_AUTH_KEY);
    return raw ? (JSON.parse(raw) as PatientAuthUser) : null;
  } catch {
    return null;
  }
}

export function setPatientAuth(user: PatientAuthUser): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(PATIENT_AUTH_KEY, JSON.stringify(user));
}

export function clearPatientAuth(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(PATIENT_AUTH_KEY);
  sessionStorage.removeItem(PATIENT_ENTRY_KEY);
  sessionStorage.removeItem(INTAKE_SUBMITTED_KEY);
}
