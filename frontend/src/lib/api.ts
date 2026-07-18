/**
 * lib/api.ts — central API client for TheraVox AI.
 *
 * Handles auth token storage (in-memory only) and every REST call the
 * frontend makes to the FastAPI backend.
 */

// ---------------------------------------------------------------------------
// Token management (in-memory only — see AuthContext for the security model)
// ---------------------------------------------------------------------------

let _accessToken: string | null = null;

export function setToken(token: string | null) {
  _accessToken = token;
}

export function getToken(): string | null {
  return _accessToken;
}

// ---------------------------------------------------------------------------
// Low-level fetch helper
// ---------------------------------------------------------------------------

async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };

  if (_accessToken) {
    headers['Authorization'] = `Bearer ${_accessToken}`;
  }
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(path, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail ?? data.error ?? `Request failed (${res.status})`);
  }

  // Some endpoints (e.g. DELETE) may return no body.
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EmotionAnalysisResponse {
  emotion: string;
  confidence: number;
  emoji: string;
  description: string;
  scores?: Record<string, number>;
  crisis?: {
    flagged: boolean;
    severity: string;
    signals: { phrase: string; category: string; severity: string }[];
    recommended_action: string;
    crisis_resources: Record<string, unknown>[];
  };
}

export interface PostcardData {
  emotion: string;
  emoji: string;
  confidence: number;
  quote_text: string;
  quote_author: string;
  gradient: string[];
  accent: string;
  text_color: string;
  glow: string;
  pattern: string;
}

export interface SessionSummary {
  id: string;
  session_id: string;
  summary: string;
  key_themes: string[];
  action_items: string[];
  mood_arc?: string;
  model_used: string;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  message_count: number;
  created_at: string;
  updated_at: string;
  preview?: string;
}

export interface ChatSessionDetailMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export interface ChatSessionDetail {
  id: string;
  title: string;
  created_at: string;
  messages: ChatSessionDetailMessage[];
  summary?: SessionSummary;
}

export interface JournalInsights {
  emotion: string;
  confidence: number;
  emoji: string;
  description: string;
  reflection: string;
}

export interface AccountStats {
  wellness_entries_count: number;
  member_since: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Emotion analysis
// ---------------------------------------------------------------------------

export async function analyzeText(text: string): Promise<EmotionAnalysisResponse> {
  return apiFetch('/api/analyze_text', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export async function analyzeAudio(file: File | Blob): Promise<EmotionAnalysisResponse> {
  const form = new FormData();
  form.append('file', file, (file as File).name ?? 'audio.wav');
  return apiFetch('/api/analyze_audio', {
    method: 'POST',
    body: form,
  });
}

export async function analyzeFrame(imageData: string): Promise<{ faces: EmotionAnalysisResponse[] }> {
  return apiFetch('/api/analyze_frame', {
    method: 'POST',
    body: JSON.stringify({ image: imageData }),
  });
}

export async function saveScreenshot(imageData: string): Promise<{ success: boolean; filename: string }> {
  return apiFetch('/save_screenshot', {
    method: 'POST',
    body: JSON.stringify({ image: imageData }),
  });
}

// ---------------------------------------------------------------------------
// Postcard
// ---------------------------------------------------------------------------

export async function generatePostcard(
  emotion: string,
  emoji: string,
  confidence: number,
): Promise<PostcardData> {
  return apiFetch('/api/postcard', {
    method: 'POST',
    body: JSON.stringify({ emotion, emoji, confidence }),
  });
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export async function sendChatMessage(
  messages: ChatMessage[],
  context?: { recent_mood?: string; streak?: number; breathing_minutes?: number },
  sessionId?: string,
): Promise<{ reply: string; model: string; session_id: string; crisis?: EmotionAnalysisResponse['crisis'] }> {
  return apiFetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      messages,
      context,
      session_id: sessionId ?? null,
    }),
  });
}

export async function getChatSessions(): Promise<ChatSession[]> {
  return apiFetch('/api/chat/sessions', { method: 'GET' });
}

export async function getChatSession(id: string): Promise<ChatSessionDetail> {
  return apiFetch(`/api/chat/sessions/${id}`, { method: 'GET' });
}

export async function deleteChatSession(id: string): Promise<void> {
  await apiFetch(`/api/chat/sessions/${id}`, { method: 'DELETE' });
}

export async function generateSessionSummary(sessionId: string): Promise<SessionSummary> {
  return apiFetch(`/api/chat/sessions/${sessionId}/summary`, { method: 'POST' });
}

export async function getSessionSummary(sessionId: string): Promise<SessionSummary> {
  return apiFetch(`/api/chat/sessions/${sessionId}/summary`, { method: 'GET' });
}

// ---------------------------------------------------------------------------
// Guided journal
// ---------------------------------------------------------------------------

export async function getJournalPrompt(
  recentMood?: string,
  moodHistory?: string[],
): Promise<{ prompt: string }> {
  return apiFetch('/api/journal/prompt', {
    method: 'POST',
    body: JSON.stringify({ recent_mood: recentMood, mood_history: moodHistory }),
  });
}

export async function submitJournalEntry(text: string, prompt?: string): Promise<JournalInsights> {
  return apiFetch('/api/journal/submit', {
    method: 'POST',
    body: JSON.stringify({ text, prompt }),
  });
}

// ---------------------------------------------------------------------------
// Profile / account
// ---------------------------------------------------------------------------

export async function updateProfile(payload: { full_name?: string; email?: string }): Promise<UserProfile> {
  return apiFetch('/api/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiFetch('/api/auth/me/password', {
    method: 'POST',
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
}

export async function getAccountStats(): Promise<AccountStats> {
  return apiFetch('/api/auth/me/stats', { method: 'GET' });
}
