import type { RegisterPayload } from '../../../services/auth.service';

// ─── RegisterForm ─────────────────────────────────────────────────────────────

export type RegisterFormData = RegisterPayload & { confirmPassword: string };
