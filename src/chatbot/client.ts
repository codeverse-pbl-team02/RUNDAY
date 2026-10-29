import { getFirebase } from '../lib/firebase';
import { isNative } from '../platform/native';

export interface ChatMessage { role: 'user' | 'assistant'; content: string }
export interface ChatReply { answer: string; sources: { id: string; title: string }[] }
const requested = import.meta.env.VITE_CHAT_API_URL?.trim();
function endpoint() {
  if (!requested) return import.meta.env.DEV && !isNative ? '/api/chat' : null;
  try {
    const url = new URL(requested);
    return url.protocol === 'https:' ? url.href : null;
  } catch { return null; }
}
export async function sendChat(message: string, history: ChatMessage[], signal: AbortSignal): Promise<ChatReply> {
  const url = endpoint();
  if (!url) throw new Error('챗봇 서비스를 준비 중이에요. 잠시 후 다시 이용해 주세요.');
  const user = getFirebase().auth.currentUser;
  if (!user) throw new Error('로그인 후 다시 이용해 주세요.');
  const token = await user.getIdToken();
  const response = await fetch(url, { method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message, history: history.slice(-6).map(item => ({ role: item.role, content: item.content.slice(0, 800) })) }),
  });
  let body;
  try { body = await response.json(); } catch { throw new Error('챗봇에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.'); }
  if (!response.ok) {
    const errors: Record<string, string> = {
      UNAUTHENTICATED: '로그인 상태를 확인하고 다시 이용해 주세요.',
      CHAT_UNAVAILABLE: '챗봇 서비스를 준비 중이에요. 잠시 후 다시 이용해 주세요.',
      RATE_LIMITED: '잠시 쉬었다가 다시 질문해 주세요.',
      INVALID_REQUEST: '질문은 800자 이내로 입력해 주세요.',
    };
    throw new Error(errors[body.code] || '답변을 받지 못했어요. 다시 시도해 주세요.');
  }
  if (typeof body.answer !== 'string' || body.answer.length > 800 || !Array.isArray(body.sources)
    || body.sources.some((s: {id?: unknown; title?: unknown}) => typeof s?.id !== 'string' || typeof s?.title !== 'string')) {
    throw new Error('답변을 확인하지 못했어요. 다시 시도해 주세요.');
  }
  return body;
}
