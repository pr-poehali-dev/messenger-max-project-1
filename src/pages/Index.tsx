import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

// ─── Data ────────────────────────────────────────────────────────────────────

const CONTACTS = [
  { id: 1, name: "Алиса Морозова",   avatar: "АМ", status: "online",  lastSeen: "в сети",        color: "#9B59B6" },
  { id: 2, name: "Денис Волков",     avatar: "ДВ", status: "offline", lastSeen: "1 ч назад",      color: "#2980B9" },
  { id: 3, name: "Марина Соколова",  avatar: "МС", status: "online",  lastSeen: "в сети",        color: "#E91E8C" },
  { id: 4, name: "Игорь Петров",     avatar: "ИП", status: "away",    lastSeen: "15 мин назад",  color: "#E67E22" },
  { id: 5, name: "Ксения Лебедева",  avatar: "КЛ", status: "online",  lastSeen: "в сети",        color: "#16A085" },
  { id: 6, name: "Роман Захаров",    avatar: "РЗ", status: "offline", lastSeen: "вчера",         color: "#27AE60" },
];

const INIT_CHATS = [
  {
    id: 1, contactId: 1, unread: 2,
    messages: [
      { id: 1, text: "Привет! Как дела?", time: "10:21", out: false },
      { id: 2, text: "Отлично, работаю над проектом 🙂", time: "10:22", out: true },
      { id: 3, text: "Расскажи подробнее!", time: "10:24", out: false },
      { id: 4, text: "Это мессенджер с E2E-шифрованием", time: "10:25", out: true },
      { id: 5, text: "Звучит серьёзно. Когда можно попробовать?", time: "10:28", out: false },
      { id: 6, text: "Уже сейчас 🚀", time: "10:30", out: true },
    ],
  },
  {
    id: 2, contactId: 3, unread: 1,
    messages: [
      { id: 1, text: "Встреча завтра в 14:00, не забудь!", time: "09:15", out: false },
      { id: 2, text: "Буду ✅", time: "09:17", out: true },
      { id: 3, text: "Захвати презентацию", time: "09:18", out: false },
    ],
  },
  {
    id: 3, contactId: 5, unread: 0,
    messages: [
      { id: 1, text: "Фото с вечеринки 📸", time: "пт", out: false },
      { id: 2, text: "Классные получились!", time: "пт", out: true },
    ],
  },
  {
    id: 4, contactId: 2, unread: 0,
    messages: [
      { id: 1, text: "Спасибо за помощь с кодом!", time: "ср", out: false },
      { id: 2, text: "Всегда рад 😊", time: "ср", out: true },
    ],
  },
  {
    id: 5, contactId: 4, unread: 0,
    messages: [
      { id: 1, text: "Договорились на среду?", time: "пн", out: false },
      { id: 2, text: "Да, в 11:00", time: "пн", out: true },
    ],
  },
  {
    id: 6, contactId: 6, unread: 0,
    messages: [
      { id: 1, text: "Документы отправил на почту", time: "пн", out: false },
      { id: 2, text: "Получил, спасибо", time: "пн", out: true },
    ],
  },
];

const statusColor: Record<string, string> = {
  online: "#4dcd5e",
  offline: "#cccccc",
  away: "#f0a500",
};

type Section = "chats" | "contacts" | "settings" | "profile";

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0 font-semibold text-white select-none"
      style={{ width: size, height: size, background: color, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  return (
    <div
      className="absolute bottom-0 right-0 rounded-full border-2 border-white"
      style={{ width: 11, height: 11, background: statusColor[status] }}
    />
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Index() {
  const [section, setSection] = useState<Section>("chats");
  const [chats, setChats] = useState(INIT_CHATS);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [e2e, setE2e] = useState(true);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find((c) => c.id === activeChatId);
  const activeContact = activeChat ? CONTACTS.find((c) => c.id === activeChat.contactId) : null;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages.length, isTyping]);

  const openChat = (id: number) => {
    setActiveChatId(id);
    setShowChatOnMobile(true);
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };

  const send = () => {
    if (!input.trim() || !activeChatId) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newMsg = { id: Date.now(), text: input.trim(), time, out: true };
    setChats((prev) =>
      prev.map((c) => (c.id === activeChatId ? { ...c, messages: [...c.messages, newMsg] } : c))
    );
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply = { id: Date.now() + 1, text: "Понял, спасибо! 👍", time, out: false };
      setChats((prev) =>
        prev.map((c) => (c.id === activeChatId ? { ...c, messages: [...c.messages, newMsg, reply] } : c))
      );
    }, 1800);
  };

  const filteredChats = chats.filter((c) => {
    const contact = CONTACTS.find((co) => co.id === c.contactId);
    return contact?.name.toLowerCase().includes(search.toLowerCase());
  });

  const totalUnread = chats.reduce((a, c) => a + c.unread, 0);

  const navItems: { id: Section; icon: string; label: string }[] = [
    { id: "chats",    icon: "MessageCircle", label: "Чаты" },
    { id: "contacts", icon: "Users",         label: "Контакты" },
    { id: "settings", icon: "Settings",      label: "Настройки" },
    { id: "profile",  icon: "User",          label: "Профиль" },
  ];

  // ─── Chat panel ────────────────────────────────────────────────────────────

  const ChatPanel = () => (
    <div className="flex flex-col h-full bg-white" style={{ borderLeft: "1px solid var(--border-color)" }}>
      {activeChatId && activeContact ? (
        <>
          <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ borderBottom: "1px solid var(--border-color)" }}>
            <button onClick={() => setShowChatOnMobile(false)} className="md:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors mr-1">
              <Icon name="ChevronLeft" size={22} style={{ color: "var(--accent)" }} />
            </button>
            <div className="relative">
              <Avatar name={activeContact.name} color={activeContact.color} size={38} />
              <StatusDot status={activeContact.status} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>{activeContact.name}</p>
              <p className="text-xs" style={{ color: activeContact.status === "online" ? "var(--online)" : "var(--text-muted)" }}>
                {isTyping ? (
                  <span className="flex items-center gap-1">
                    <span>печатает</span>
                    <span className="flex gap-0.5 ml-1 items-center">
                      {[0, 1, 2].map((i) => <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.15}s` }} />)}
                    </span>
                  </span>
                ) : activeContact.lastSeen}
              </p>
            </div>
            <div className="flex gap-0.5">
              {[{ icon: "Phone" }, { icon: "Video" }, { icon: "Search" }].map((a) => (
                <button key={a.icon} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors" style={{ color: "var(--accent)" }}>
                  <Icon name={a.icon} size={18} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5" style={{ background: "#f0f2f5" }}>
            {activeChat?.messages.map((msg, i) => (
              <div key={msg.id} className={`flex ${msg.out ? "justify-end" : "justify-start"} anim-fade`} style={{ animationDelay: `${i * 0.02}s` }}>
                <div className={`max-w-[72%] px-3 py-2 ${msg.out ? "msg-out" : "msg-in"}`}>
                  <p className="text-sm leading-snug" style={{ color: "var(--text-primary)" }}>{msg.text}</p>
                  <div className={`flex items-center gap-1 mt-0.5 ${msg.out ? "justify-end" : "justify-start"}`}>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{msg.time}</span>
                    {msg.out && <Icon name="CheckCheck" size={12} style={{ color: "var(--accent)" }} />}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start anim-fade">
                <div className="msg-in px-4 py-3 flex items-center gap-1">
                  {[0, 1, 2].map((i) => <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.15}s` }} />)}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="px-3 py-3 shrink-0 flex items-center gap-2" style={{ borderTop: "1px solid var(--border-color)" }}>
            <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors" style={{ color: "var(--text-muted)" }}>
              <Icon name="Paperclip" size={19} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Сообщение"
              className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
            />
            <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors" style={{ color: "var(--text-muted)" }}>
              <Icon name="Smile" size={19} />
            </button>
            {input.trim() ? (
              <button onClick={send} className="w-9 h-9 rounded-full flex items-center justify-center transition-all" style={{ background: "var(--accent)", color: "white" }}>
                <Icon name="Send" size={17} />
              </button>
            ) : (
              <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors" style={{ color: "var(--text-muted)" }}>
                <Icon name="Mic" size={19} />
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ background: "#f0f2f5" }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "var(--accent-light)" }}>
            <Icon name="MessageCircle" size={36} style={{ color: "var(--accent)" }} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>Выберите чат</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Начните переписку с любым контактом</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
            <Icon name="Lock" size={11} />
            <span>E2E-шифрование включено</span>
          </div>
        </div>
      )}
    </div>
  );

  // ─── Sidebar content ────────────────────────────────────────────────────────

  const SidebarContent = () => (
    <>
      {section === "chats" && (
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat, i) => {
            const contact = CONTACTS.find((c) => c.id === chat.contactId)!;
            const last = chat.messages[chat.messages.length - 1];
            return (
              <button
                key={chat.id}
                onClick={() => openChat(chat.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left hover-row anim-fade ${activeChatId === chat.id ? "active-row" : ""}`}
                style={{ animationDelay: `${i * 0.04}s`, borderBottom: "1px solid var(--border-color)" }}
              >
                <div className="relative">
                  <Avatar name={contact.name} color={contact.color} size={46} />
                  <StatusDot status={contact.status} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{contact.name}</span>
                    <span className="text-[11px] shrink-0 ml-2" style={{ color: "var(--text-muted)" }}>{last.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs truncate flex-1" style={{ color: "var(--text-secondary)" }}>
                      {last.out && <span style={{ color: "var(--text-muted)" }}>Вы: </span>}
                      {last.text}
                    </p>
                    {chat.unread > 0 && (
                      <div className="ml-2 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white shrink-0" style={{ background: "var(--accent)" }}>
                        {chat.unread}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {section === "contacts" && (
        <div className="flex-1 overflow-y-auto">
          {CONTACTS.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())).map((contact, i) => (
            <button
              key={contact.id}
              onClick={() => {
                const chat = chats.find((c) => c.contactId === contact.id);
                if (chat) { openChat(chat.id); setSection("chats"); }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left hover-row anim-fade"
              style={{ animationDelay: `${i * 0.04}s`, borderBottom: "1px solid var(--border-color)" }}
            >
              <div className="relative">
                <Avatar name={contact.name} color={contact.color} size={44} />
                <StatusDot status={contact.status} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{contact.name}</p>
                <p className="text-xs" style={{ color: contact.status === "online" ? "var(--online)" : "var(--text-muted)" }}>
                  {contact.lastSeen}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {section === "settings" && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {[
            { label: "Уведомления", desc: "Звук и вибрация", state: notifications, toggle: setNotifications, icon: "Bell" },
            { label: "E2E-шифрование", desc: "Все чаты защищены", state: e2e, toggle: setE2e, icon: "Lock" },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3.5 rounded-xl" style={{ background: "var(--bg-secondary)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-light)" }}>
                  <Icon name={s.icon} size={16} style={{ color: "var(--accent)" }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{s.label}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.desc}</p>
                </div>
              </div>
              <button
                onClick={() => s.toggle(!s.state)}
                className="w-11 h-6 rounded-full transition-all duration-200 relative shrink-0"
                style={{ background: s.state ? "var(--accent)" : "#ddd" }}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200"
                  style={{ left: s.state ? "calc(100% - 22px)" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
                />
              </button>
            </div>
          ))}
          <div className="px-4 py-3 rounded-xl" style={{ background: "var(--accent-light)" }}>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Icon name="Shield" size={13} style={{ color: "var(--accent)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--accent)" }}>Волна v1.0.0</span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>End-to-end шифрование активно для всех чатов</p>
          </div>
        </div>
      )}

      {section === "profile" && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ background: "#2AABEE" }}>
                ЯП
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white" style={{ background: "var(--accent)" }}>
                <Icon name="Camera" size={13} style={{ color: "white" }} />
              </button>
            </div>
            <div className="text-center">
              <p className="font-bold text-base" style={{ color: "var(--text-primary)" }}>Яков Петренко</p>
              <p className="text-xs" style={{ color: "var(--online)" }}>в сети</p>
            </div>
          </div>
          {[
            { icon: "User", label: "Имя", value: "Яков Петренко" },
            { icon: "Phone", label: "Телефон", value: "+7 900 123-45-67" },
            { icon: "AtSign", label: "Username", value: "@yakow_p" },
            { icon: "Info", label: "Статус", value: "🚀 На связи!" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl hover-row" style={{ background: "var(--bg-secondary)" }}>
              <Icon name={f.icon} size={16} style={{ color: "var(--accent)" }} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{f.label}</p>
                <p className="text-sm" style={{ color: "var(--text-primary)" }}>{f.value}</p>
              </div>
              <Icon name="ChevronRight" size={14} style={{ color: "var(--text-muted)" }} />
            </div>
          ))}
        </div>
      )}
    </>
  );

  // ─── Bottom nav ─────────────────────────────────────────────────────────────

  const BottomNav = () => (
    <div className="shrink-0 flex items-center justify-around px-2 py-2" style={{ borderTop: "1px solid var(--border-color)", background: "white" }}>
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setSection(item.id)}
          className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors"
          style={{ color: section === item.id ? "var(--accent)" : "var(--text-muted)" }}
        >
          <div className="relative">
            <Icon name={item.icon} size={22} />
            {item.id === "chats" && totalUnread > 0 && (
              <div className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white" style={{ background: "var(--accent)" }}>
                {totalUnread}
              </div>
            )}
          </div>
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );

  // ─── Sidebar header ─────────────────────────────────────────────────────────

  const SidebarHeader = () => (
    <div className="px-4 pt-4 pb-3 shrink-0" style={{ borderBottom: "1px solid var(--border-color)" }}>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          {section === "chats" ? "Чаты" : section === "contacts" ? "Контакты" : section === "settings" ? "Настройки" : "Профиль"}
        </h1>
        {section === "chats" && (
          <button className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors" style={{ color: "var(--accent)" }}>
            <Icon name="PenSquare" size={18} />
          </button>
        )}
      </div>
      {(section === "chats" || section === "contacts") && (
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon name="Search" size={14} style={{ color: "var(--text-muted)" }} />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск"
            className="w-full pl-8 pr-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}
          />
        </div>
      )}
    </div>
  );

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">

      {/* ── DESKTOP ── */}
      <div className="hidden md:flex w-full h-full">
        <div className="w-80 shrink-0 flex flex-col h-full" style={{ borderRight: "1px solid var(--border-color)" }}>
          <SidebarHeader />
          <SidebarContent />
          <BottomNav />
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <ChatPanel />
        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="flex md:hidden w-full h-full flex-col">
        {showChatOnMobile ? (
          <ChatPanel />
        ) : (
          <>
            <div className="flex-1 flex flex-col overflow-hidden">
              <SidebarHeader />
              <SidebarContent />
            </div>
            <BottomNav />
          </>
        )}
      </div>

    </div>
  );
}
