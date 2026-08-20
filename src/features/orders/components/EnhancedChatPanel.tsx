import { useEffect, useRef, useState } from "react";
import { isChatAvailable } from "../../../domain/workflow";
import "../../../styles/chat-attachments.css";
import { validateChatImage } from "../chatAttachments";
import { orderService } from "../orderService";
import type { RequestMessage, ReviewRequestStatus } from "../types";
import { formatDate } from "./OrderComponents";

type Props = { requestId: string; status: ReviewRequestStatus; messages: RequestMessage[] };

export function EnhancedChatPanel({ requestId, status, messages }: Props) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const picker = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const enabled = isChatAvailable(status);

  useEffect(() => {
    if (!image) { setPreview(""); return; }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  useEffect(() => {
    const element = log.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages]);

  const choose = (file?: File) => {
    if (!file) return;
    try { validateChatImage(file); setImage(file); setError(""); }
    catch (cause) { setImage(null); setError(cause instanceof Error ? cause.message : "The image could not be added."); }
  };

  const send = async () => {
    if (!enabled || sending || (!text.trim() && !image)) return;
    setSending(true);
    setError("");
    const result = await orderService.sendMessage(requestId, text, "customer", image ?? undefined);
    if (result.ok) { setText(""); setImage(null); }
    else setError(result.error ?? "The message could not be sent.");
    setSending(false);
  };

  return <section className="od-chat">
    <div className="od-chat-log" ref={log} role="log" aria-live="polite">
      {messages.length ? messages.map(message => <article className={message.senderRole} key={message.id}>
        <div className="od-avatar">{message.senderRole === "artisan" ? "IA" : message.senderRole === "system" ? "✦" : "YO"}</div>
        <div>
          <header><strong>{message.senderRole === "customer" ? "You" : message.senderName}</strong><small>{formatDate(message.createdAt)}</small></header>
          {message.attachmentUrl && <a className="od-chat-image" href={message.attachmentUrl} target="_blank" rel="noreferrer"><img src={message.attachmentUrl} alt="Chat attachment"/></a>}
          <p>{message.message}</p>
        </div>
      </article>) : <p className="od-empty">No letters yet. Your conversation with the artisan will appear here.</p>}
    </div>
    {preview && <div className="od-attachment-preview"><img src={preview} alt="Image ready to send"/><span>{image?.name}</span><button type="button" onClick={() => setImage(null)} aria-label="Remove attached image">×</button></div>}
    <div className="od-compose">
      <input ref={picker} className="od-file-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={event => { choose(event.target.files?.[0]); event.target.value = ""; }}/>
      <button className="od-attach" type="button" disabled={!enabled || sending} onClick={() => picker.current?.click()} aria-label="Add image" title="Add image">+</button>
      <input disabled={!enabled || sending} value={text} onChange={event => setText(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); void send(); } }} placeholder={enabled ? "Type your message..." : "Chat is unavailable for this status."}/>
      <button className="od-send" type="button" disabled={!enabled || sending || (!text.trim() && !image)} onClick={() => void send()}>{sending ? "…" : "➤"}</button>
    </div>
    {error && <p className="od-chat-error">{error}</p>}
    <small>Images only: JPG, PNG, WebP, or GIF up to 2 MB.</small>
  </section>;
}
