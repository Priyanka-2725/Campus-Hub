import { SendHorizonal } from "lucide-react";
import { useEffect, useState } from "react";
import MessageBubble from "../components/MessageBubble";
import { messageApi } from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Chat() {
  const { user } = useAuth();
  const [inbox, setInbox] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [smartReplies, setSmartReplies] = useState([]);

  useEffect(() => {
    let mounted = true;

    messageApi
      .inbox()
      .then(({ data }) => {
        if (!mounted) {
          return;
        }

        setInbox(data);
        if (data.length > 0) {
          const first = data[0];
          const otherUser =
            first.sender?.id === user?.id ? first.receiver : first.sender;
          setActiveConversation(otherUser);
        }
      })
      .catch(() => {
        if (mounted) {
          setInbox([]);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!activeConversation?.id) {
      setMessages([]);
      setSmartReplies([]);
      return;
    }

    let mounted = true;

    messageApi
      .conversation(activeConversation.id)
      .then(({ data }) => {
        if (mounted) {
          setMessages(data);
        }
      })
      .catch(() => {
        if (mounted) {
          setMessages([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, [activeConversation?.id]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    const content = (lastMessage?.content || "").toLowerCase();

    if (!messages.length) {
      setSmartReplies([
        "Is this still available?",
        "Can you lower the price?",
        "Can I pick this up today?",
      ]);
      return;
    }

    if (content.includes("price") || content.includes("cost")) {
      setSmartReplies([
        "Can you lower the price?",
        "What is your best offer?",
        "Would you take cash on pickup?",
      ]);
      return;
    }

    if (content.includes("available") || content.includes("still have")) {
      setSmartReplies([
        "Is this still available?",
        "Can I pick this up today?",
        "Where should we meet?",
      ]);
      return;
    }

    setSmartReplies([
      "Is this still available?",
      "Can you lower the price?",
      "Can I pick this up today?",
    ]);
  }, [messages]);

  const handleSelectConversation = (conversationMessage) => {
    const otherUser =
      conversationMessage.sender?.id === user?.id
        ? conversationMessage.receiver
        : conversationMessage.sender;
    setActiveConversation(otherUser);
  };

  const handleSend = async (event) => {
    event.preventDefault();

    if (!activeConversation?.id || !draft.trim()) {
      return;
    }

    setSending(true);

    try {
      const { data } = await messageApi.send({
        receiverId: activeConversation.id,
        content: draft.trim(),
      });
      setMessages((current) => [...current, data]);
      setDraft("");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-soft bg-white shadow-card lg:grid lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="border-b border-slate-100 bg-cream/45 p-6 lg:border-b-0 lg:border-r">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine">
              Conversations
            </p>
            <div className="mt-6 space-y-3">
              {loading ? (
                <div className="rounded-3xl bg-white px-4 py-6 text-sm text-slate-500">
                  Loading conversations...
                </div>
              ) : inbox.length ? (
                inbox.map((conversation) => {
                  const otherUser =
                    conversation.sender?.id === user?.id
                      ? conversation.receiver
                      : conversation.sender;
                  const isActive = activeConversation?.id === otherUser?.id;

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => handleSelectConversation(conversation)}
                      className={`w-full rounded-3xl px-4 py-4 text-left transition ${
                        isActive ? "bg-white shadow-sm" : "bg-transparent hover:bg-white/70"
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {otherUser?.name || otherUser?.email}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                        {conversation.content}
                      </p>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-3xl bg-white px-4 py-6 text-sm text-slate-500">
                  No conversations yet.
                </div>
              )}
            </div>
          </aside>

          <div className="flex min-h-[640px] flex-col bg-[linear-gradient(180deg,#FFFFFF_0%,#FAF3E0_100%)]">
            <div className="border-b border-slate-100 px-6 py-5">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine">
                {activeConversation ? activeConversation.name || activeConversation.email : "Select a conversation"}
              </p>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
              {messages.length ? (
                messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwnMessage={message.sender?.id === user?.id}
                  />
                ))
              ) : (
                <div className="rounded-3xl bg-white px-5 py-6 text-sm text-slate-500 shadow-sm">
                  {activeConversation
                    ? "No messages in this conversation yet."
                    : "Choose a conversation from the left to start chatting."}
                </div>
              )}
            </div>

            <form className="border-t border-slate-100 px-6 py-5" onSubmit={handleSend}>
              {smartReplies.length ? (
                <div className="mb-4 flex flex-wrap gap-2">
                  {smartReplies.map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      onClick={() => setDraft(reply)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <input
                  type="text"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Type a message"
                  className="w-full border-none bg-transparent outline-none"
                />
                <button
                  type="submit"
                  disabled={!activeConversation || sending || !draft.trim()}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-pine text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <SendHorizonal size={18} />
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
