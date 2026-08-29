import { useEffect, useRef, useState } from "react";
import { isChatAvailable } from "../../../domain/workflow";
import "../../../styles/chat-attachments.css";
import { orderService } from "../orderService";
import type { RequestMessage, ReviewRequestStatus } from "../types";
import { formatDate } from "./OrderComponents";

type Props = { requestId: string; status: ReviewRequestStatus; messages: RequestMessage[]; hasOlderMessages?: boolean };

export function EnhancedChatPanel({ requestId, status, messages, hasOlderMessages = false }: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [olderMessages, setOlderMessages] = useState<RequestMessage[]>([]);
  const [canLoadOlder, setCanLoadOlder] = useState(hasOlderMessages || messages.length === 30);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const log = useRef<HTMLDivElement>(null);
  const enabled = isChatAvailable(status);
  const visibleMessages = [...olderMessages, ...messages].filter((message, index, all) => all.findIndex(candidate => candidate.id === message.id) === index);

  useEffect(() => { setOlderMessages([]); setCanLoadOlder(hasOlderMessages || messages.length === 30); }, [requestId, hasOlderMessages]);

  useEffect(() => {
    const element = log.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages]);

  const loadOlder = async () => {
    const oldest = visibleMessages[0];
    if (!oldest || loadingOlder) return;
    setLoadingOlder(true); setError("");
    try {
      const page = await orderService.loadOlderMessages(requestId, oldest.createdAt);
      setOlderMessages(current => [...page.messages, ...current]);
      setCanLoadOlder(page.hasMore);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Older messages could not be loaded."); }
    finally { setLoadingOlder(false); }
  };

  const send = async () => {
    if (!enabled || sending || !text.trim()) return;
    setSending(true);
    setError("");
    const result = await orderService.sendMessage(requestId, text);
    if (result.ok) setText("");
    else setError(result.error ?? "The message could not be sent.");
    setSending(false);
  };

  return <section className="od-chat">
    <div className="od-chat-log" ref={log} role="log" aria-live="polite">
      {canLoadOlder && <button type="button" className="od-load-older" disabled={loadingOlder} onClick={() => void loadOlder()}>{loadingOlder ? "Loading…" : "Load older messages"}</button>}
      {visibleMessages.length ? visibleMessages.map(message => <article className={message.senderRole} key={message.id}>
        <div className="od-avatar">{message.senderRole === "artisan" ? "IA" : message.senderRole === "system" ? "✦" : "YO"}</div>
        <div>
          <header><strong>{message.senderRole === "customer" ? "You" : message.senderName}</strong><small>{formatDate(message.createdAt)}</small></header>
          <p>{message.message}</p>
        </div>
      </article>) : <p className="od-empty">No letters yet. Your conversation with the artisan will appear here.</p>}
    </div>
    <div className="od-compose">
      <input disabled={!enabled || sending} value={text} onChange={event => setText(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); void send(); } }} placeholder={enabled ? "Type your message..." : "Chat is unavailable for this status."}/>
      <button className="od-send" type="button" disabled={!enabled || sending || !text.trim()} onClick={() => void send()}>{sending ? "…" : "➤"}</button>
    </div>
    {error && <p className="od-chat-error">{error}</p>}
    <small>Messages are loaded only when this room is opened or refreshed.</small>
  </section>;
}
