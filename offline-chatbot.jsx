import React, { useState, useRef, useEffect } from "react";

// ---- Offline reply engine -------------------------------------------------
// Pure pattern-matching, no network calls. Everything runs client-side.

const RULES = [
  {
    test: /\b(hi|hello|hey|yo|howdy)\b/i,
    replies: ["Hey there.", "Hello! What's up?", "Hi — how's it going?"],
  },
  {
    test: /\bhow are you\b/i,
    replies: [
      "Running smoothly, no network required. How are you?",
      "Can't complain — I'm just a script, but I'm doing fine. You?",
    ],
  },
  {
    test: /\b(bye|goodbye|see ya|later)\b/i,
    replies: ["Catch you later.", "Bye for now.", "See you around."],
  },
  {
    test: /\bthank(s| you)\b/i,
    replies: ["You're welcome.", "Anytime.", "No problem at all."],
  },
  {
    test: /\byour name\b/i,
    replies: ["I don't have a name — just call me Offline Bot.", "No name, just a set of rules in your browser."],
  },
  {
    test: /\b(who made you|who created you|who built you)\b/i,
    replies: ["I'm a small pattern-matching script — no company behind me, just plain JavaScript."],
  },
  {
    test: /\bjoke\b/i,
    replies: [
      "Why do programmers prefer dark mode? Because light attracts bugs.",
      "I'd tell you a UDP joke, but you might not get it.",
      "There are 10 kinds of people: those who understand binary and those who don't.",
    ],
  },
  {
    test: /\b(time|date|today)\b/i,
    reply: () => `Right now it's ${new Date().toLocaleString()} — according to your device's clock, not the internet.`,
  },
  {
    test: /\bweather\b/i,
    replies: ["I'm offline, so I can't check the weather — but look out the window, that usually works."],
  },
  {
    test: /\bwhat can you do\b/i,
    replies: [
      "I can chat using simple pattern matching — greetings, small talk, a few jokes, basic math. No internet needed.",
    ],
  },
  {
    test: /\b(help|what should i say)\b/i,
    replies: ["Try saying hello, asking for a joke, asking the time, or giving me a math problem like '12 * 7'."],
  },
  {
    test: /^[\s\d+\-*/().]+$/,
    reply: (text) => {
      try {
        // eslint-disable-next-line no-new-func
        const result = Function(`"use strict"; return (${text})`)();
        if (typeof result === "number" && isFinite(result)) {
          return `That comes out to ${result}.`;
        }
      } catch (e) {
        /* fall through */
      }
      return null;
    },
  },
];

const FALLBACKS = [
  "Not sure I follow — could you put that another way?",
  "I'm just a simple offline script, so that one's beyond me. Try asking something else.",
  "Hmm, I don't have a rule for that yet. Ask me for a joke, the time, or some quick math.",
  "I didn't quite catch the pattern there. Rephrase it, maybe?",
];

function generateReply(text) {
  for (const rule of RULES) {
    if (rule.test.test(text)) {
      if (rule.reply) {
        const r = rule.reply(text);
        if (r) return r;
      } else {
        return rule.replies[Math.floor(Math.random() * rule.replies.length)];
      }
    }
  }
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
}
// ---------------------------------------------------------------------------

export default function OfflineChatbot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey — I run entirely offline, no network calls. Say hi, ask for a joke, the time, or throw some math at me.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const send = () => {
    const text = input.trim();
    if (!text || thinking) return;

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    // Tiny artificial delay so it feels alive — still zero network calls.
    setTimeout(() => {
      const reply = generateReply(text);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setThinking(false);
    }, 300 + Math.random() * 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        maxHeight: "100vh",
        background: "#F6F3EC",
        fontFamily: "'Iowan Old Style', 'Georgia', serif",
        color: "#2B2A28",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 28px 16px",
          borderBottom: "1px solid #DDD6C4",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 12,
              letterSpacing: "0.12em",
              color: "#8A6E4B",
              textTransform: "uppercase",
            }}
          >
            §offline
          </span>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em" }}>
            Correspondence
          </h1>
        </div>
        <span
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 11,
            color: "#3E7A4E",
            letterSpacing: "0.06em",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3E7A4E", display: "inline-block" }} />
          no network
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <span
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#A79E88",
                marginBottom: 4,
              }}
            >
              {m.role === "user" ? "you" : "reply"}
            </span>
            <div
              style={{
                maxWidth: "72%",
                padding: "12px 16px",
                borderRadius: m.role === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                background: m.role === "user" ? "#2B2A28" : "#FFFFFF",
                color: m.role === "user" ? "#F6F3EC" : "#2B2A28",
                border: m.role === "user" ? "none" : "1px solid #E6E0CF",
                fontSize: 15,
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
                boxShadow: m.role === "user" ? "none" : "0 1px 2px rgba(0,0,0,0.03)",
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {thinking && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#A79E88",
                marginBottom: 4,
              }}
            >
              reply
            </span>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "14px 14px 14px 2px",
                background: "#FFFFFF",
                border: "1px solid #E6E0CF",
                display: "flex",
                gap: 5,
              }}
            >
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#B8AE93",
                    animation: `bounce 1.1s ${d * 0.15}s infinite ease-in-out`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div
        style={{
          padding: "16px 28px 22px",
          borderTop: "1px solid #DDD6C4",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 10,
            background: "#FFFFFF",
            border: "1px solid #DDD6C4",
            borderRadius: 12,
            padding: "10px 10px 10px 16px",
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write something…"
            rows={1}
            style={{
              flex: 1,
              resize: "none",
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: "inherit",
              fontSize: 15,
              lineHeight: 1.5,
              color: "#2B2A28",
              maxHeight: 120,
            }}
          />
          <button
            onClick={send}
            disabled={thinking || !input.trim()}
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "9px 16px",
              borderRadius: 8,
              border: "none",
              background: thinking || !input.trim() ? "#E6E0CF" : "#2B2A28",
              color: thinking || !input.trim() ? "#A79E88" : "#F6F3EC",
              cursor: thinking || !input.trim() ? "default" : "pointer",
              transition: "background 0.15s ease",
            }}
          >
            Send
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        textarea::placeholder { color: #A79E88; }
        div::-webkit-scrollbar { width: 6px; }
        div::-webkit-scrollbar-thumb { background: #DDD6C4; border-radius: 3px; }
      `}</style>
    </div>
  );
}
