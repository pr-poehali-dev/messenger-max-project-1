import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "online" | "offline" | "away";
type Section = "chats" | "contacts" | "settings" | "profile";
type MsgReaction = { emoji: string; count: number };

interface Message {
  id: number;
  text: string;
  time: string;
  out: boolean;
  reactions?: MsgReaction[];
  forwarded?: boolean;
  replyTo?: string;
  pinned?: boolean;
}

interface Chat {
  id: number;
  contactId: number;
  unread: number;
  pinned?: boolean;
  muted?: boolean;
  messages: Message[];
}

interface Contact {
  id: number;
  name: string;
  status: Status;
  lastSeen: string;
  color: string;
  bio?: string;
  phone?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CONTACTS: Contact[] = [
  { id: 1, name: "Алиса Морозова",  status: "online",  lastSeen: "в сети",       color: "#8B5CF6", bio: "Дизайнер · люблю кофе ☕",   phone: "+7 916 123-45-67" },
  { id: 2, name: "Денис Волков",    status: "offline", lastSeen: "1 ч назад",     color: "#3B82F6", bio: "Backend разработчик",         phone: "+7 926 234-56-78" },
  { id: 3, name: "Марина Соколова", status: "online",  lastSeen: "в сети",       color: "#EC4899", bio: "Product manager 🚀",           phone: "+7 903 345-67-89" },
  { id: 4, name: "Игорь Петров",    status: "away",    lastSeen: "15 мин назад", color: "#F59E0B", bio: "Предпочитаю звонки",           phone: "+7 985 456-78-90" },
  { id: 5, name: "Ксения Лебедева", status: "online",  lastSeen: "в сети",       color: "#10B981", bio: "Фотограф 📷 · путешествия",   phone: "+7 967 567-89-01" },
  { id: 6, name: "Роман Захаров",   status: "offline", lastSeen: "вчера",        color: "#6366F1", bio: "Финансовый аналитик 📊",       phone: "+7 977 678-90-12" },
];

const REPLIES = [
  "Отлично, понял! 👍",
  "Хорошо, договорились 🤝",
  "Спасибо за инфо!",
  "Ок, скоро отвечу",
  "Звучит хорошо! 😊",
  "Принято ✅",
  "Буду иметь в виду",
  "Интересно, расскажи больше!",
];

const INIT_CHATS: Chat[] = [
  {
    id: 1, contactId: 1, unread: 2, pinned: true,
    messages: [
      { id: 1, text: "Привет! Как продвигается проект?", time: "10:21", out: false },
      { id: 2, text: "Хорошо, уже почти готов дизайн 🎨", time: "10:22", out: true },
      { id: 3, text: "Покажешь когда будет готово?", time: "10:24", out: false },
      { id: 4, text: "Конечно! Это мессенджер с E2E-шифрованием", time: "10:25", out: true, reactions: [{ emoji: "🔥", count: 1 }] },
      { id: 5, text: "Вау, звучит серьёзно! Хочу попробовать 😍", time: "10:28", out: false },
      { id: 6, text: "Уже работает 🚀 Пиши сюда!", time: "10:30", out: true },
    ],
  },
  {
    id: 2, contactId: 3, unread: 1, pinned: true,
    messages: [
      { id: 1, text: "Встреча завтра в 14:00, не забудь!", time: "09:15", out: false },
      { id: 2, text: "Буду ✅ Подготовлю материалы", time: "09:17", out: true },
      { id: 3, text: "Захвати презентацию и ноутбук", time: "09:18", out: false, reactions: [{ emoji: "👍", count: 2 }] },
    ],
  },
  {
    id: 3, contactId: 5, unread: 0,
    messages: [
      { id: 1, text: "Привет! Фото с вечеринки 📸 — получились отличные!", time: "пт", out: false },
      { id: 2, text: "Классные! Пришли на почту?", time: "пт", out: true },
      { id: 3, text: "Уже отправила на drive", time: "пт", out: false },
    ],
  },
  {
    id: 4, contactId: 2, unread: 0,
    messages: [
      { id: 1, text: "Ты смотрел PR что я отправил?", time: "ср", out: false },
      { id: 2, text: "Да, оставил комменты, посмотри", time: "ср", out: true },
      { id: 3, text: "Спасибо! Исправлю сегодня", time: "ср", out: false },
    ],
  },
  {
    id: 5, contactId: 4, unread: 0, muted: true,
    messages: [
      { id: 1, text: "Договорились на среду в 11:00?", time: "пн", out: false },
      { id: 2, text: "Да, буду", time: "пн", out: true },
    ],
  },
  {
    id: 6, contactId: 6, unread: 0,
    messages: [
      { id: 1, text: "Документы отправил на почту, проверь", time: "пн", out: false },
      { id: 2, text: "Получил, спасибо! Посмотрю сегодня", time: "пн", out: true },
    ],
  },
];

const STATUS_COLOR: Record<Status, string> = {
  online:  "#22C55E",
  offline: "#D1D5DB",
  away:    "#F59E0B",
};

const STATUS_TEXT: Record<Status, string> = {
  online:  "в сети",
  offline: "не в сети",
  away:    "отошёл",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTime() {
  const now = new Date();
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
}

// ─── Small components (defined OUTSIDE main to avoid remount) ─────────────────

function Av({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0 font-bold text-white select-none"
      style={{ width: size, height: size, background: color, fontSize: size * 0.36, letterSpacing: "-0.5px" }}
    >
      {initials}
    </div>
  );
}

function Dot({ status, bg = "white" }: { status: Status; bg?: string }) {
  return (
    <div
      className="absolute bottom-0 right-0 rounded-full"
      style={{ width: 11, height: 11, background: STATUS_COLOR[status], border: `2.5px solid ${bg}` }}
    />
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative shrink-0 transition-all duration-200"
      style={{ width: 44, height: 24, borderRadius: 99, background: on ? "#2AABEE" : "#D1D5DB" }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200"
        style={{ left: on ? "calc(100% - 22px)" : 2, boxShadow: "0 1px 4px rgba(0,0,0,.18)" }}
      />
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Index() {
  const [section, setSection]               = useState<Section>("chats");
  const [chats, setChats]                   = useState<Chat[]>(INIT_CHATS);
  const [activeChatId, setActiveChatId]     = useState<number | null>(null);
  const [input, setInput]                   = useState("");
  const [search, setSearch]                 = useState("");
  const [isTyping, setIsTyping]             = useState(false);
  const [notif, setNotif]                   = useState(true);
  const [e2e, setE2e]                       = useState(true);
  const [sound, setSound]                   = useState(true);
  const [showChat, setShowChat]             = useState(false);     // mobile: show chat screen
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo]               = useState<string | null>(null);
  const [pinnedMsgId, setPinnedMsgId]       = useState<number | null>(null);
  const [contactInfo, setContactInfo]       = useState<Contact | null>(null);

  const endRef   = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeChat    = chats.find((c) => c.id === activeChatId) ?? null;
  const activeContact = activeChat ? CONTACTS.find((c) => c.id === activeChat.contactId) ?? null : null;

  const totalUnread = chats.reduce((a, c) => a + c.unread, 0);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages.length, isTyping]);

  // Keep focus after send (fix keyboard disappear)
  const focusInput = useCallback(() => {
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const openChat = useCallback((id: number) => {
    setActiveChatId(id);
    setShowChat(true);
    setReplyTo(null);
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const send = useCallback(() => {
    if (!input.trim() || !activeChatId) return;
    const time = getTime();
    const newMsg: Message = {
      id: Date.now(),
      text: replyTo ? `↩ ${replyTo}\n\n${input.trim()}` : input.trim(),
      time,
      out: true,
    };
    setChats((prev) =>
      prev.map((c) => c.id === activeChatId ? { ...c, messages: [...c.messages, newMsg] } : c)
    );
    setInput("");
    setReplyTo(null);
    focusInput();

    if (typingTimer.current) clearTimeout(typingTimer.current);
    setIsTyping(true);
    typingTimer.current = setTimeout(() => {
      setIsTyping(false);
      const reply: Message = {
        id: Date.now() + 1,
        text: REPLIES[Math.floor(Math.random() * REPLIES.length)],
        time: getTime(),
        out: false,
      };
      setChats((prev) =>
        prev.map((c) => c.id === activeChatId ? { ...c, messages: [...c.messages, newMsg, reply] } : c)
      );
    }, 1500 + Math.random() * 1000);
  }, [input, activeChatId, replyTo, focusInput]);

  const addReaction = useCallback((chatId: number, msgId: number, emoji: string) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        return {
          ...c,
          messages: c.messages.map((m) => {
            if (m.id !== msgId) return m;
            const existing = m.reactions ?? [];
            const idx = existing.findIndex((r) => r.emoji === emoji);
            if (idx >= 0) {
              const updated = [...existing];
              updated[idx] = { ...updated[idx], count: updated[idx].count + 1 };
              return { ...m, reactions: updated };
            }
            return { ...m, reactions: [...existing, { emoji, count: 1 }] };
          }),
        };
      })
    );
  }, []);

  const togglePin = useCallback((chatId: number) => {
    setChats((prev) => prev.map((c) => c.id === chatId ? { ...c, pinned: !c.pinned } : c));
  }, []);

  const toggleMute = useCallback((chatId: number) => {
    setChats((prev) => prev.map((c) => c.id === chatId ? { ...c, muted: !c.muted } : c));
  }, []);

  const deleteMessage = useCallback((chatId: number, msgId: number) => {
    setChats((prev) =>
      prev.map((c) => c.id === chatId ? { ...c, messages: c.messages.filter((m) => m.id !== msgId) } : c)
    );
  }, []);

  const filteredChats = chats
    .filter((c) => {
      const contact = CONTACTS.find((co) => co.id === c.contactId);
      return contact?.name.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const navItems = [
    { id: "chats"    as Section, icon: "MessageCircle", label: "Чаты"     },
    { id: "contacts" as Section, icon: "Users",          label: "Контакты" },
    { id: "settings" as Section, icon: "Settings",       label: "Настройки"},
    { id: "profile"  as Section, icon: "User",           label: "Профиль"  },
  ];

  // ─── Emoji reactions bar ───────────────────────────────────────────────────

  const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👏", "🎉"];

  // ─── Render ────────────────────────────────────────────────────────────────

  // Sidebar header (search + title)
  const renderSidebarHeader = () => (
    <div className="shrink-0 px-4 pt-5 pb-3" style={{ borderBottom: "1px solid #EBEBEB" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[17px] font-bold" style={{ color: "#111" }}>
          {section === "chats" ? "Чаты" : section === "contacts" ? "Контакты" : section === "settings" ? "Настройки" : "Профиль"}
        </span>
        {section === "chats" && (
          <button
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
            style={{ color: "#2AABEE" }}
          >
            <Icon name="PenSquare" size={18} />
          </button>
        )}
      </div>
      {(section === "chats" || section === "contacts") && (
        <label className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#F2F2F7" }}>
          <Icon name="Search" size={14} style={{ color: "#8E8E93" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "#111" }}
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <Icon name="X" size={13} style={{ color: "#8E8E93" }} />
            </button>
          )}
        </label>
      )}
    </div>
  );

  // Sidebar chat list
  const renderChatList = () => (
    <div className="flex-1 overflow-y-auto">
      {filteredChats.length === 0 && (
        <div className="flex flex-col items-center py-16 gap-2">
          <Icon name="Search" size={32} style={{ color: "#C7C7CC" }} />
          <p className="text-sm" style={{ color: "#8E8E93" }}>Ничего не найдено</p>
        </div>
      )}
      {filteredChats.map((chat) => {
        const contact = CONTACTS.find((c) => c.id === chat.contactId)!;
        const last = chat.messages[chat.messages.length - 1];
        const isActive = chat.id === activeChatId;
        return (
          <div key={chat.id} className="group relative" style={{ borderBottom: "1px solid #F2F2F7" }}>
            <button
              onClick={() => openChat(chat.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
              style={{ background: isActive ? "#E8F4FD" : "white" }}
              onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "#F9F9F9"; }}
              onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "white"; }}
            >
              <div className="relative shrink-0">
                <Av name={contact.name} color={contact.color} size={50} />
                <Dot status={contact.status} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {chat.pinned && <Icon name="Pin" size={12} style={{ color: "#8E8E93", flexShrink: 0 }} />}
                    {chat.muted && <Icon name="BellOff" size={12} style={{ color: "#8E8E93", flexShrink: 0 }} />}
                    <span className="text-[15px] font-semibold truncate" style={{ color: "#111" }}>{contact.name}</span>
                  </div>
                  <span className="text-[12px] shrink-0 ml-2" style={{ color: chat.unread > 0 ? "#2AABEE" : "#8E8E93" }}>{last.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[13px] truncate flex-1" style={{ color: "#8E8E93" }}>
                    {last.out && <span style={{ color: "#2AABEE" }}>Вы: </span>}
                    {last.text.split("\n").pop()}
                  </p>
                  {chat.unread > 0 && (
                    <div
                      className="ml-2 min-w-[20px] h-5 px-1 rounded-full text-[11px] font-bold flex items-center justify-center text-white shrink-0"
                      style={{ background: chat.muted ? "#8E8E93" : "#2AABEE" }}
                    >
                      {chat.unread}
                    </div>
                  )}
                </div>
              </div>
            </button>
            {/* Swipe actions on desktop hover */}
            <div className="absolute right-0 top-0 bottom-0 flex items-center gap-1 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => togglePin(chat.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-sm border"
                style={{ borderColor: "#E5E5E5" }}
                title={chat.pinned ? "Открепить" : "Закрепить"}
              >
                <Icon name="Pin" size={14} style={{ color: chat.pinned ? "#2AABEE" : "#8E8E93" }} />
              </button>
              <button
                onClick={() => toggleMute(chat.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-sm border"
                style={{ borderColor: "#E5E5E5" }}
                title={chat.muted ? "Включить звук" : "Отключить звук"}
              >
                <Icon name={chat.muted ? "Bell" : "BellOff"} size={14} style={{ color: "#8E8E93" }} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Contacts
  const renderContacts = () => (
    <div className="flex-1 overflow-y-auto">
      {CONTACTS.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())).map((contact) => {
        const chat = chats.find((c) => c.contactId === contact.id);
        return (
          <button
            key={contact.id}
            onClick={() => { if (chat) { openChat(chat.id); setSection("chats"); } }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
            style={{ borderBottom: "1px solid #F2F2F7" }}
          >
            <div className="relative shrink-0">
              <Av name={contact.name} color={contact.color} size={48} />
              <Dot status={contact.status} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold" style={{ color: "#111" }}>{contact.name}</p>
              <p className="text-[13px]" style={{ color: contact.status === "online" ? "#22C55E" : "#8E8E93" }}>
                {contact.status === "online" ? "в сети" : contact.lastSeen}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setContactInfo(contact); }}
              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100"
              style={{ color: "#8E8E93" }}
            >
              <Icon name="Info" size={17} />
            </button>
          </button>
        );
      })}
    </div>
  );

  // Settings
  const renderSettings = () => (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      <p className="text-[11px] font-semibold px-1 uppercase" style={{ color: "#8E8E93" }}>Уведомления</p>
      {[
        { label: "Push-уведомления", desc: "Получать уведомления",     state: notif,  toggle: () => setNotif(!notif)   },
        { label: "Звук",             desc: "Звук при новых сообщениях", state: sound,  toggle: () => setSound(!sound)   },
      ].map((s, i) => (
        <div key={i} className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-white shadow-sm" style={{ border: "1px solid #F2F2F7" }}>
          <span className="text-[15px]" style={{ color: "#111" }}>{s.label}</span>
          <Toggle on={s.state} onToggle={s.toggle} />
        </div>
      ))}

      <p className="text-[11px] font-semibold px-1 uppercase mt-4" style={{ color: "#8E8E93" }}>Приватность</p>
      <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-white shadow-sm" style={{ border: "1px solid #F2F2F7" }}>
        <div>
          <p className="text-[15px]" style={{ color: "#111" }}>E2E-шифрование</p>
          <p className="text-[12px]" style={{ color: "#8E8E93" }}>Все чаты защищены</p>
        </div>
        <Toggle on={e2e} onToggle={() => setE2e(!e2e)} />
      </div>

      <p className="text-[11px] font-semibold px-1 uppercase mt-4" style={{ color: "#8E8E93" }}>О приложении</p>
      <div className="px-4 py-4 rounded-2xl bg-white shadow-sm" style={{ border: "1px solid #F2F2F7" }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-lg" style={{ background: "#2AABEE" }}>В</div>
          <div>
            <p className="text-[15px] font-semibold" style={{ color: "#111" }}>Волна</p>
            <p className="text-[12px]" style={{ color: "#8E8E93" }}>Версия 1.0.0</p>
          </div>
        </div>
        <p className="text-[13px]" style={{ color: "#8E8E93" }}>
          {e2e ? "🔐 End-to-end шифрование активно. Только вы и собеседник читаете сообщения." : "⚠️ Шифрование отключено"}
        </p>
      </div>
    </div>
  );

  // Profile
  const renderProfile = () => (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col items-center pt-8 pb-6 gap-3 px-4" style={{ background: "linear-gradient(180deg, #EBF5FB 0%, white 100%)" }}>
        <div className="relative">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg" style={{ background: "#2AABEE" }}>
            ЯП
          </div>
          <button
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow"
            style={{ background: "#2AABEE" }}
          >
            <Icon name="Camera" size={15} style={{ color: "white" }} />
          </button>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold" style={{ color: "#111" }}>Яков Петренко</p>
          <p className="text-sm mt-0.5" style={{ color: "#22C55E" }}>● в сети</p>
        </div>
        <p className="text-sm text-center px-6" style={{ color: "#8E8E93" }}>🚀 Строю мессенджер мечты!</p>
      </div>
      <div className="px-4 py-4 space-y-2">
        {[
          { icon: "Phone",    label: "Телефон",  value: "+7 900 123-45-67" },
          { icon: "AtSign",   label: "Username", value: "@yakow_p"          },
          { icon: "Calendar", label: "Дата рег.",value: "13 июня 2026"      },
          { icon: "Globe",    label: "Страна",   value: "Россия 🇷🇺"         },
        ].map((f) => (
          <div key={f.label} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white shadow-sm" style={{ border: "1px solid #F2F2F7" }}>
            <Icon name={f.icon} size={17} style={{ color: "#2AABEE" }} />
            <div className="flex-1">
              <p className="text-[12px]" style={{ color: "#8E8E93" }}>{f.label}</p>
              <p className="text-[15px]" style={{ color: "#111" }}>{f.value}</p>
            </div>
            <Icon name="ChevronRight" size={15} style={{ color: "#C7C7CC" }} />
          </div>
        ))}
      </div>
    </div>
  );

  // Bottom nav
  const renderBottomNav = () => (
    <div
      className="shrink-0 flex items-center justify-around py-2 px-2"
      style={{ borderTop: "1px solid #EBEBEB", background: "white" }}
    >
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => { setSection(item.id); if (item.id !== "chats") setShowChat(false); }}
          className="flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all"
          style={{ color: section === item.id ? "#2AABEE" : "#8E8E93" }}
        >
          <div className="relative">
            <Icon name={item.icon} size={23} />
            {item.id === "chats" && totalUnread > 0 && (
              <div
                className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-0.5 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                style={{ background: "#2AABEE" }}
              >
                {totalUnread}
              </div>
            )}
          </div>
          <span className="text-[10px] font-medium leading-none">{item.label}</span>
        </button>
      ))}
    </div>
  );

  // Chat messages area
  const renderMessages = () => (
    <div
      className="flex-1 overflow-y-auto py-3 px-3 space-y-1"
      style={{
        background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='30' cy='30' r='1.5' fill='%23c8e6fa' opacity='0.5'/%3E%3C/svg%3E\") center / 60px, #E5EBF0",
      }}
    >
      {activeChat?.messages.map((msg, i) => {
        const isOut = msg.out;
        const prev = i > 0 ? activeChat.messages[i - 1] : null;
        const sameDir = prev && prev.out === msg.out;
        return (
          <div key={msg.id}>
            {/* Date divider every 5 messages */}
            {i === 0 && (
              <div className="flex justify-center mb-2">
                <span className="text-[11px] px-3 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.15)", color: "white" }}>
                  Сегодня
                </span>
              </div>
            )}
            <div className={`flex ${isOut ? "justify-end" : "justify-start"} ${sameDir ? "mt-0.5" : "mt-2"} group`}>
              {!isOut && !sameDir && (
                <div className="mr-1.5 shrink-0 self-end mb-1">
                  <Av name={activeContact!.name} color={activeContact!.color} size={28} />
                </div>
              )}
              {!isOut && sameDir && <div style={{ width: 36 }} />}
              <div className="relative max-w-[78%] sm:max-w-[65%]">
                <div
                  className={`px-3 py-2 shadow-sm ${isOut ? "msg-out" : "msg-in"}`}
                  style={{ wordBreak: "break-word" }}
                >
                  {msg.text.includes("\n\n") && (
                    <div className="mb-1 px-2 py-1 rounded-lg text-[11px] border-l-2" style={{ borderColor: "#2AABEE", background: "rgba(42,171,238,0.07)", color: "#2AABEE" }}>
                      {msg.text.split("\n\n")[0].replace("↩ ", "")}
                    </div>
                  )}
                  <p className="text-[14px] leading-[1.45]" style={{ color: "#111", whiteSpace: "pre-wrap" }}>
                    {msg.text.includes("\n\n") ? msg.text.split("\n\n").slice(1).join("\n\n") : msg.text}
                  </p>
                  <div className={`flex items-center gap-1 mt-0.5 ${isOut ? "justify-end" : "justify-start"}`}>
                    <span className="text-[10px]" style={{ color: "#8E8E93" }}>{msg.time}</span>
                    {isOut && <Icon name="CheckCheck" size={13} style={{ color: "#2AABEE" }} />}
                  </div>
                </div>
                {/* Reactions */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className={`flex gap-0.5 mt-0.5 flex-wrap ${isOut ? "justify-end" : "justify-start"}`}>
                    {msg.reactions.map((r) => (
                      <button
                        key={r.emoji}
                        onClick={() => activeChatId && addReaction(activeChatId, msg.id, r.emoji)}
                        className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] border transition-all hover:scale-110"
                        style={{ background: "white", borderColor: "#E5E5E5" }}
                      >
                        <span>{r.emoji}</span>
                        <span style={{ color: "#8E8E93" }}>{r.count}</span>
                      </button>
                    ))}
                  </div>
                )}
                {/* Hover actions */}
                <div
                  className={`absolute top-0 ${isOut ? "left-0 -translate-x-full pr-1" : "right-0 translate-x-full pl-1"} flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity`}
                >
                  <button
                    onClick={() => setReplyTo(msg.text.split("\n\n").pop() ?? msg.text)}
                    className="w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                    style={{ background: "white", border: "1px solid #E5E5E5" }}
                    title="Ответить"
                  >
                    <Icon name="Reply" size={12} style={{ color: "#8E8E93" }} />
                  </button>
                  <button
                    onClick={() => activeChatId && addReaction(activeChatId, msg.id, "❤️")}
                    className="w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                    style={{ background: "white", border: "1px solid #E5E5E5" }}
                    title="Реакция"
                  >
                    <Icon name="Heart" size={12} style={{ color: "#8E8E93" }} />
                  </button>
                  {isOut && (
                    <button
                      onClick={() => activeChatId && deleteMessage(activeChatId, msg.id)}
                      className="w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                      style={{ background: "white", border: "1px solid #E5E5E5" }}
                      title="Удалить"
                    >
                      <Icon name="Trash2" size={12} style={{ color: "#EF4444" }} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {isTyping && (
        <div className="flex justify-start mt-2">
          {activeContact && (
            <div className="mr-1.5 shrink-0 self-end mb-1">
              <Av name={activeContact.name} color={activeContact.color} size={28} />
            </div>
          )}
          <div className="msg-in px-4 py-3 flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );

  // Chat header
  const renderChatHeader = () => (
    <div
      className="flex items-center gap-2 px-3 py-2.5 shrink-0"
      style={{ borderBottom: "1px solid #EBEBEB", background: "white" }}
    >
      <button
        onClick={() => setShowChat(false)}
        className="md:hidden p-2 -ml-1 rounded-xl hover:bg-gray-100 transition-colors"
        style={{ color: "#2AABEE" }}
      >
        <Icon name="ChevronLeft" size={22} />
      </button>
      <button
        onClick={() => activeContact && setContactInfo(activeContact)}
        className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
      >
        <div className="relative shrink-0">
          <Av name={activeContact!.name} color={activeContact!.color} size={40} />
          <Dot status={activeContact!.status} />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold truncate" style={{ color: "#111" }}>{activeContact!.name}</p>
          <p className="text-[12px]" style={{ color: activeContact!.status === "online" ? "#22C55E" : "#8E8E93" }}>
            {isTyping ? (
              <span className="flex items-center gap-1">
                печатает
                <span className="flex gap-0.5 ml-0.5 items-center">
                  {[0,1,2].map((i) => <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.15}s`, background: "#8E8E93" }} />)}
                </span>
              </span>
            ) : STATUS_TEXT[activeContact!.status]}
          </p>
        </div>
      </button>
      <div className="flex gap-0.5 shrink-0">
        <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors" style={{ color: "#2AABEE" }}>
          <Icon name="Phone" size={19} />
        </button>
        <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors" style={{ color: "#2AABEE" }}>
          <Icon name="Video" size={19} />
        </button>
        <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors" style={{ color: "#8E8E93" }}>
          <Icon name="MoreVertical" size={19} />
        </button>
      </div>
    </div>
  );

  // Input area
  const renderInput = () => (
    <div className="shrink-0" style={{ background: "white", borderTop: "1px solid #EBEBEB" }}>
      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center gap-2 px-4 py-2" style={{ borderBottom: "1px solid #F2F2F7" }}>
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "#F2F2F7" }}>
            <Icon name="Reply" size={13} style={{ color: "#2AABEE" }} />
            <p className="text-[12px] truncate" style={{ color: "#8E8E93" }}>{replyTo}</p>
          </div>
          <button onClick={() => setReplyTo(null)}>
            <Icon name="X" size={16} style={{ color: "#8E8E93" }} />
          </button>
        </div>
      )}
      {/* Emoji quick bar */}
      {showEmojiPicker && (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto" style={{ borderBottom: "1px solid #F2F2F7" }}>
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => { setInput((v) => v + e); setShowEmojiPicker(false); focusInput(); }}
              className="text-xl shrink-0 hover:scale-125 transition-transform"
            >
              {e}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          onClick={() => { setShowEmojiPicker((v) => !v); }}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0"
          style={{ color: showEmojiPicker ? "#2AABEE" : "#8E8E93" }}
        >
          <Icon name="Smile" size={21} />
        </button>
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0"
          style={{ color: "#8E8E93" }}
        >
          <Icon name="Paperclip" size={20} />
        </button>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Сообщение"
          className="flex-1 px-4 py-2.5 rounded-full text-[14px] outline-none"
          style={{ background: "#F2F2F7", color: "#111", minWidth: 0 }}
          autoComplete="off"
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0"
          style={{
            background: input.trim() ? "#2AABEE" : "#F2F2F7",
            color: input.trim() ? "white" : "#8E8E93",
          }}
        >
          <Icon name={input.trim() ? "Send" : "Mic"} size={18} />
        </button>
      </div>
    </div>
  );

  // Welcome screen
  const renderWelcome = () => (
    <div className="flex-1 flex flex-col items-center justify-center gap-5" style={{ background: "#E5EBF0" }}>
      <div className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg" style={{ background: "white" }}>
        <Icon name="MessageCircle" size={44} style={{ color: "#2AABEE" }} />
      </div>
      <div className="text-center px-8">
        <p className="text-xl font-bold mb-1" style={{ color: "#111" }}>Волна</p>
        <p className="text-sm" style={{ color: "#8E8E93" }}>Выберите чат чтобы начать общение</p>
        <div className="flex items-center justify-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs mx-auto w-fit" style={{ background: "rgba(42,171,238,0.1)", color: "#2AABEE" }}>
          <Icon name="Lock" size={11} />
          <span>E2E-шифрование включено</span>
        </div>
      </div>
    </div>
  );

  // Contact info modal
  const renderContactModal = () => {
    if (!contactInfo) return null;
    const chat = chats.find((c) => c.contactId === contactInfo.id);
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setContactInfo(null)}>
        <div
          className="w-full sm:w-80 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: "white" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center pt-8 pb-5 px-6" style={{ background: "linear-gradient(180deg, #EBF5FB, white)" }}>
            <div className="relative mb-3">
              <Av name={contactInfo.name} color={contactInfo.color} size={72} />
              <Dot status={contactInfo.status} />
            </div>
            <p className="text-lg font-bold" style={{ color: "#111" }}>{contactInfo.name}</p>
            <p className="text-sm" style={{ color: contactInfo.status === "online" ? "#22C55E" : "#8E8E93" }}>
              {STATUS_TEXT[contactInfo.status]}
            </p>
            {contactInfo.bio && <p className="text-sm mt-1 text-center" style={{ color: "#8E8E93" }}>{contactInfo.bio}</p>}
          </div>
          <div className="px-5 py-3 space-y-2">
            {contactInfo.phone && (
              <div className="flex items-center gap-3 py-2">
                <Icon name="Phone" size={17} style={{ color: "#2AABEE" }} />
                <div>
                  <p className="text-[12px]" style={{ color: "#8E8E93" }}>Телефон</p>
                  <p className="text-[15px]" style={{ color: "#111" }}>{contactInfo.phone}</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 px-5 pb-6">
            <button
              onClick={() => { if (chat) { openChat(chat.id); setSection("chats"); } setContactInfo(null); }}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white transition-all active:scale-95"
              style={{ background: "#2AABEE" }}
            >
              Написать
            </button>
            <button
              onClick={() => setContactInfo(null)}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95"
              style={{ background: "#F2F2F7", color: "#111" }}
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Sidebar wrapper
  const renderSidebar = () => (
    <div className="flex flex-col h-full" style={{ background: "white" }}>
      {renderSidebarHeader()}
      {section === "chats"    && renderChatList()}
      {section === "contacts" && renderContacts()}
      {section === "settings" && renderSettings()}
      {section === "profile"  && renderProfile()}
      {renderBottomNav()}
    </div>
  );

  // Chat screen wrapper
  const renderChatScreen = () => (
    <div className="flex flex-col h-full">
      {activeContact ? (
        <>
          {renderChatHeader()}
          {renderMessages()}
          {renderInput()}
        </>
      ) : renderWelcome()}
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "white" }}>

      {/* ── DESKTOP (md+): sidebar left, chat right ── */}
      <div className="hidden md:flex w-full h-full">
        <div className="w-[340px] shrink-0 flex flex-col h-full" style={{ borderRight: "1px solid #EBEBEB" }}>
          {renderSidebar()}
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          {renderChatScreen()}
        </div>
      </div>

      {/* ── MOBILE: list or chat ── */}
      <div className="flex md:hidden w-full h-full flex-col">
        {showChat && activeContact ? renderChatScreen() : renderSidebar()}
      </div>

      {/* Contact info modal */}
      {renderContactModal()}
    </div>
  );
}
