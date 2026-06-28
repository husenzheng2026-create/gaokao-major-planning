import type { QuestionnaireInput } from '@/lib/scoring/build-report';
import { questionnaireSchema } from '@/lib/validation/questionnaire-schema';

function toBase64Url(value: string): string {
  if (typeof window === 'undefined') {
    return Buffer.from(value, 'utf8').toString('base64url');
  }

  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(token: string): string | null {
  try {
    if (typeof window === 'undefined') {
      return Buffer.from(token, 'base64url').toString('utf8');
    }

    const padded = token.replace(/-/g, '+').replace(/_/g, '/');
    const normalized = `${padded}${'='.repeat((4 - (padded.length % 4)) % 4)}`;
    const binary = atob(normalized);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function encodeReportInputToToken(value: QuestionnaireInput): string {
  return toBase64Url(JSON.stringify(value));
}

export function decodeReportInputFromToken(token: string): QuestionnaireInput | null {
  const raw = fromBase64Url(token);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    const result = questionnaireSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
