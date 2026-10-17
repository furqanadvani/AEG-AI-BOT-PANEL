import { Fragment, useEffect, useRef } from "react";
import { Empty, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import { LANGUAGES } from "../../utils/Constants";
import { readableText, renderDate } from "../../utils/Methods";
import "./ChatThread.css";

/** Bot ke reply ke neeche: step, language, AI ya normal mode, tokens, time, lead */
const MetaStrip = ({ meta }) => {
  if (!meta) return null;
  return (
    <div className="chat-meta">
      {meta.next && (
        <Tooltip title="What the bot decided to do">
          <Tag color="blue">{readableText(meta.next)}</Tag>
        </Tooltip>
      )}
      {meta.language && <Tag>{LANGUAGES[meta.language] || meta.language}</Tag>}
      {meta.aiLimited ? (
        <Tooltip title={`No AI call: ${readableText(meta.aiReason || "limit")}. The bot used rule-based mode.`}>
          <Tag color="orange">Normal mode</Tag>
        </Tooltip>
      ) : meta.replyAI ? (
        <Tag color={meta.replyAI === "ok" ? "green" : meta.replyAI === "template" ? "default" : "orange"}>
          {meta.replyAI === "ok" ? "AI reply" : meta.replyAI === "template" ? "Template" : meta.replyAI === "limited" ? "Normal mode" : "Fallback"}
        </Tag>
      ) : null}
      {meta.skipReason === "direct_answer" && (
        <Tooltip title="Understood without AI, saving an AI call">
          <Tag>Direct answer</Tag>
        </Tooltip>
      )}
      {meta.tokens > 0 && <Tag>{Number(meta.tokens).toLocaleString()} tokens</Tag>}
      {meta.roundTripMs > 0 && <Tag>{(meta.roundTripMs / 1000).toFixed(1)}s</Tag>}
      {meta.leadId && <Tag color="green">Lead {meta.leadId}</Tag>}
      {meta.humanTakeover && <Tag color="volcano">Agent takeover</Tag>}
      {meta.botDisabled && <Tag color="volcano">Bot off</Tag>}
    </div>
  );
};

const dayLabel = (at) => {
  const d = dayjs(at);
  if (d.isSame(dayjs(), "day")) return "Today";
  if (d.isSame(dayjs().subtract(1, "day"), "day")) return "Yesterday";
  return d.format("D MMMM YYYY");
};

/**
 * messages: [{ role: user | assistant | agent | system | error, text, at, meta }]
 * showMeta: bot replies ke neeche debug tags
 */
const ChatThread = ({ messages = [], typing = false, emptyText = "No messages yet", className = "", style, showMeta = true, userLabel, botLabel }) => {
  const boxRef = useRef(null);
  const seenRef = useRef(0);

  // Sirf thread ke andar neeche scroll (scrollIntoView poora drawer / page bhi scroll kar deta tha).
  // Pehli dafa seedha aakhri message par (drawer animation ke baad bhi), phir naye messages par smooth.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const first = seenRef.current === 0;
    seenRef.current = messages.length;
    if (!first) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      return undefined;
    }
    const toBottom = () => { el.scrollTop = el.scrollHeight; };
    toBottom();
    const raf = requestAnimationFrame(toBottom);
    const t = setTimeout(toBottom, 350);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); };
  }, [messages.length, typing]);

  // Har message ke liye: kya yahan naye din ka separator lagana hai
  const dayBreaks = messages.map((m, i) => {
    if (!m.at) return false;
    const prev = messages.slice(0, i).reverse().find((x) => x.at);
    return !prev || !dayjs(prev.at).isSame(dayjs(m.at), "day");
  });

  return (
    <div ref={boxRef} className={`chat-thread ${className}`} style={style} aria-live="polite">
      {!messages.length && !typing && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />}
      {messages.map((m, i) => {
        const showDay = dayBreaks[i];
        return (
          <Fragment key={m.id || i}>
            {showDay && (
              <div className="chat-day" role="separator">
                <span>{dayLabel(m.at)}</span>
              </div>
            )}
            {m.role === "system" ? (
              <div className="chat-system">
                <span>{m.text}</span>
                {m.at && <time>{dayjs(m.at).format("h:mm A")}</time>}
              </div>
            ) : (
              <div className={`chat-row is-${m.role}`}>
                {(m.role === "agent" || (i === 0 || messages[i - 1]?.role !== m.role)) && (userLabel || botLabel) && (
                  <span className="chat-author">{m.role === "user" ? userLabel : m.role === "agent" ? "Agent" : botLabel}</span>
                )}
                <div className={`chat-bubble ${m.silent ? "is-silent" : ""}`} dir="auto">{m.silent ? "No reply (agent takeover)" : m.text}</div>
                {showMeta && m.role === "assistant" && <MetaStrip meta={m.meta} />}
                {m.at && (
                  <Tooltip title={renderDate(m.at, true)}>
                    <time className="chat-time">{dayjs(m.at).format("h:mm A")}</time>
                  </Tooltip>
                )}
              </div>
            )}
          </Fragment>
        );
      })}
      {typing && (
        <div className="chat-typing" aria-label="Bot is typing">
          <span />
          <span />
          <span />
        </div>
      )}
    </div>
  );
};

export default ChatThread;
