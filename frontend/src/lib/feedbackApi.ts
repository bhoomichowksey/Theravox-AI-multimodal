/**
 * lib/feedbackApi.ts — client for the feedback / contact endpoints.
 */

import { getToken } from './api';

export type FeedbackCategory = 'bug' | 'suggestion' | 'general' | 'compliment';

export interface FeedbackSubmission {
  category: FeedbackCategory;
  subject: string;
  message: string;
  rating: number | null;
}

export interface FeedbackRecord {
  id: string;
  user_id: string | null;
  category: FeedbackCategory;
  subject: string;
  message: string;
  rating: number | null;
  created_at: string;
}

async function feedbackFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

  const res = await fetch(path, { ...options, headers, credentials: 'include' });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail ?? data.error ?? `Request failed (${res.status})`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function submitFeedback(payload: FeedbackSubmission): Promise<FeedbackRecord> {
  return feedbackFetch('/api/feedback', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMyFeedback(): Promise<FeedbackRecord[]> {
  return feedbackFetch('/api/feedback', { method: 'GET' });
}
