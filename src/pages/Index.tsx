import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

const CONTACTS = [
  { id: 1, name: "Алиса Морозова", avatar: "АМ", status: "online", lastSeen: "в сети", color: "#a855f7" },
  { id: 2, name: "Денис Волков", avatar: "ДВ", status: "offline", lastSeen: "час назад", color: "#3b82f6" },
  { id: 3, name: "Марина Соколова", avatar: "МС", status: "online", lastSeen: "в сети", color: "#ec4899" },
  { id: 4, name: "Игорь Петров", avatar: "ИП", status: "away", lastSeen: "15 мин назад", color: "#f59e0b" },
  { id: 5, name: "Ксения Лебедева", avatar: "КЛ", status: "online", lastSeen: "в сети", color: "#06b6d4" },
  { id: 6, name: "Роман Захаров", avatar: "РЗ", status: "offline", lastSeen: "вчера", color: "#10b981" },
];

const INIT_CHATS = [
  {
    id: 1, contactId: 1, unread: 3,
    messages: [
      { id: 1, text: "Привет! Как дела? 👋", time: "10:21", out: false, encrypted: true },
      { id: 2, text: "Отлично! Работаю над новым проектом", time: "10:22", out: true, encrypted: true },
      { id: 3, text: "Интересно! Расскажешь подробнее?", time: "10:24", out: false, encrypted: true },
      { id: 4, text: "Конечно! Это мессенджер с E2E-шифрованием 🔐", time: "10:25", out: true, encrypted: true },
      { id: 5, text: "Звучит круто! Когда можно будет попробовать?", time: "10:28", out: false, encrypted: true },
      { id: 6, text: "Уже сейчас! 🚀", time: "10:30", out: true, encrypted: true },
    ]
  },
  {
    id: 2, contactId: 3, unread: 1,
    messages: [
      { id: 1, text: "Встреча завтра в 14:00 не забудь!", time: "вчера", out: false, encrypted: true },
      { id: 2, text: "Обязательно буду ✅", time: "вчера", out: true, encrypted: true },
      { id: 3, text: "Отлично, жду! Принеси презентацию", time: "09:15", out: false, encrypted: true },
    ]
  },
  {
    id: 3, contactId: 5, unread: 0,
    messages: [
      { id: 1, text: "Фото с вечеринки 📸", time: "пт", out: false, encrypted: true },
      { id: 2, text: "Вау, классные получились!", time: "пт", out: true, encrypted: true },
    ]
  },
  {
    id: 4, contactId: 2, unread: 0,
    messages: [
      { id: 1, text: "Спасибо за помощь с кодом!", time: "ср", out: false, encrypted: true },
      { id: 2, text: "Пожалуйста, всегда рад помочь 😊", time: "ср", out: true, encrypted: true },
    ]
  },
];

const MEDIA_FILES = [
  { id: 1, type: "image", name: "photo_001.jpg", size: "2.4 МБ", date: "Сегодня", from: "Алиса Морозова" },
  { id: 2, type: "image", name: "screenshot.png", size: "1.1 МБ", date: "Вчера", from: "Марина Соколова" },
  { id: 3, type: "video", name: "video_meeting.mp4", size: "48 МБ", date: "12 июня", from: "Ксения Лебедева" },
  { id: 4, type: "file", name: "presentation.pdf", size: "5.2 МБ", date: "10 июня", from: "Денис Волков" },
  { id: 5, type: "audio", name: "voice_001.ogg", size: "0.8 МБ", date: "8 июня", from: "Алиса Морозова" },
  { id: 6, type: "image", name: "party_photo.jpg", size: "3.6 МБ", date: "7 июня", from: "Ксения Лебедева" },
  { id: 7, type: "file", name: "contract.docx", size: "0.3 МБ", date: "5 июня", from: "Роман Захаров" },
  { id: 8, type: "image", name: "sunset.jpg", size: "4.1 МБ", date: "3 июня", from: "Марина Соколова" },
];

const statusColor: Record<string, string> = {
  online: "#22c55e",
  offline: "#6b7280",
  away: "#f59e0b",
};

const mediaIcon: Record<string, string> = {
  image: "Image",
  video: "Video",
  audio: "Mic",
  file: "FileText",
};

type Section = "chats" | "contacts" | "media" | "search" | "settings" | "profile";

export default function Index() {
  const [activeSection, setActiveSection] = useState<Section>("chats");
  const [activeChatId, setActiveChatId] = useState<number | null>(1);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chats, setChats] = useState(INIT_CHATS);
  const [notifications, setNotifications] = useState(true);
  const [e2eEnabled, setE2eEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [fontSize, setFontSize] = useState("средний");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find((c) => c.id === activeChatId);
  const activeContact = activeChat ? CONTACTS.find((c) => c.id === activeChat.contactId) : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages.length]);

  const sendMessage = () => {
    if (!messageInput.trim() || !activeChatId) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newMsg = { id: Date.now(), text: messageInput, time, out: true, encrypted: true };
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId ? { ...chat, messages: [...chat.messages, newMsg] } : chat
      )
    );
    setMessageInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replyMsg = { id: Date.now() + 1, text: "Понял, принял! 👍", time, out: false, encrypted: true };
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId ? { ...chat, messages: [...chat.messages, newMsg, replyMsg] } : chat
        )
      );
    }, 2000);
  };

  const filteredChats = chats.filter((chat) => {
    const contact = CONTACTS.find((c) => c.id === chat.contactId);
    return contact?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const navItems: { id: Section; icon: string; label: string }[] = [
    { id: "chats", icon: "MessageCircle", label: "Чаты" },
    { id: "contacts", icon: "Users", label: "Контакты" },
    { id: "media", icon: "Image", label: "Медиа" },
    { id: "search", icon: "Search", label: "Поиск" },
    { id: "settings", icon: "Settings", label: "Настройки" },
    { id: "profile", icon: "User", label: "Профиль" },
  ];

  const totalUnread = chats.reduce((acc, c) => acc + c.unread, 0);

  return (
    <div className="flex h-screen w-full overflow-hidden font-golos" style={{ background: "hsl(222, 20%, 6%)" }}>
      {/* Background ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #a855f7, transparent 70%)" }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-8"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }} />
        <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #ec4899, transparent 70%)" }} />
      </div>

      {/* Left Navigation */}
      <nav
        className="relative z-10 flex flex-col items-center py-6 gap-2 w-16 shrink-0"
        style={{ background: "rgba(10, 9, 18, 0.97)", borderRight: "1px solid rgba(168, 85, 247, 0.15)" }}
      >
        <div className="mb-4 cursor-pointer animate-float">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
          >
            В
          </div>
        </div>

        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            title={item.label}
            className="relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200"
            style={{
              background: activeSection === item.id
                ? "linear-gradient(135deg, rgba(168,85,247,0.3), rgba(236,72,153,0.2))"
                : "transparent",
              color: activeSection === item.id ? "#a855f7" : "rgba(255,255,255,0.4)",
            }}
          >
            {activeSection === item.id && (
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full"
                style={{ background: "linear-gradient(180deg, #a855f7, #ec4899)" }}
              />
            )}
            <Icon name={item.icon} size={20} />
            {item.id === "chats" && totalUnread > 0 && (
              <div
                className="absolute top-1 right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
              >
                {totalUnread}
              </div>
            )}
          </button>
        ))}

        <div className="mt-auto">
          <button
            onClick={() => setActiveSection("profile")}
            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
          >
            ЯП
          </button>
        </div>
      </nav>

      {/* Sidebar Panel */}
      <div
        className="relative z-10 w-72 shrink-0 flex flex-col"
        style={{ background: "rgba(12, 11, 20, 0.97)", borderRight: "1px solid rgba(168, 85, 247, 0.1)" }}
      >
        <div className="px-4 pt-5 pb-4">
          <h2 className="text-lg font-bold text-white mb-3">
            {navItems.find((n) => n.id === activeSection)?.label}
          </h2>
          {(activeSection === "chats" || activeSection === "search" || activeSection === "contacts") && (
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.3)" }}>
                <Icon name="Search" size={15} />
              </div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none text-white transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(168,85,247,0.15)",
                  color: "white",
                }}
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">

          {/* CHATS */}
          {activeSection === "chats" && (
            <div className="space-y-0.5">
              {filteredChats.map((chat, i) => {
                const contact = CONTACTS.find((c) => c.id === chat.contactId);
                const lastMsg = chat.messages[chat.messages.length - 1];
                return (
                  <button
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left animate-fade-in ${activeChatId === chat.id ? "active-chat" : "hover:bg-white/5"}`}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="relative shrink-0">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                        style={{ background: `linear-gradient(135deg, ${contact?.color}88, ${contact?.color}44)`, border: `1.5px solid ${contact?.color}55` }}
                      >
                        {contact?.avatar}
                      </div>
                      <div
                        className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                        style={{ background: statusColor[contact?.status || "offline"], borderColor: "hsl(222,20%,6%)" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-semibold text-white truncate">{contact?.name}</span>
                        <span className="text-[11px] shrink-0 ml-1" style={{ color: "rgba(255,255,255,0.3)" }}>{lastMsg.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs truncate flex-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                          {lastMsg.out && <span style={{ color: "#a855f7" }}>Вы: </span>}
                          {lastMsg.text}
                        </p>
                        {chat.unread > 0 && (
                          <div
                            className="ml-2 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white shrink-0"
                            style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
                          >
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

          {/* CONTACTS */}
          {activeSection === "contacts" && (
            <div className="space-y-0.5">
              {CONTACTS.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((contact, i) => (
                <div
                  key={contact.id}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="relative shrink-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                      style={{ background: `linear-gradient(135deg, ${contact.color}88, ${contact.color}44)`, border: `1.5px solid ${contact.color}55` }}
                    >
                      {contact.avatar}
                    </div>
                    <div
                      className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                      style={{ background: statusColor[contact.status], borderColor: "hsl(222,20%,6%)" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{contact.name}</p>
                    <p className="text-xs" style={{ color: contact.status === "online" ? "#22c55e" : "rgba(255,255,255,0.35)" }}>
                      {contact.lastSeen}
                    </p>
                  </div>
                  <button
                    className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all"
                    onClick={() => {
                      const chatForContact = chats.find((c) => c.contactId === contact.id);
                      if (chatForContact) { setActiveChatId(chatForContact.id); setActiveSection("chats"); }
                    }}
                  >
                    <Icon name="MessageCircle" size={16} style={{ color: "#a855f7" }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* MEDIA */}
          {activeSection === "media" && (
            <div className="space-y-1">
              {MEDIA_FILES.map((file, i) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.2)" }}
                  >
                    <Icon name={mediaIcon[file.type]} size={18} style={{ color: "#a855f7" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{file.size} · {file.from}</p>
                  </div>
                  <span className="text-[11px] shrink-0" style={{ color: "rgba(255,255,255,0.25)" }}>{file.date}</span>
                </div>
              ))}
            </div>
          )}

          {/* SEARCH */}
          {activeSection === "search" && (
            <div className="space-y-2">
              {searchQuery === "" ? (
                <div className="flex flex-col items-center py-10 gap-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(168,85,247,0.1)" }}
                  >
                    <Icon name="Search" size={24} style={{ color: "#a855f7" }} />
                  </div>
                  <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Введите запрос для поиска<br />по сообщениям и контактам
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs font-semibold px-2 mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>КОНТАКТЫ</p>
                  {CONTACTS.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((contact) => (
                    <div key={contact.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                        style={{ background: `linear-gradient(135deg, ${contact.color}88, ${contact.color}44)` }}
                      >
                        {contact.avatar}
                      </div>
                      <p className="text-sm text-white">{contact.name}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* SETTINGS */}
          {activeSection === "settings" && (
            <div className="space-y-2">
              {[
                { label: "Уведомления", desc: "Звук и вибрация", state: notifications, toggle: setNotifications, icon: "Bell" },
                { label: "E2E-шифрование", desc: "Защита сообщений", state: e2eEnabled, toggle: setE2eEnabled, icon: "Lock" },
                { label: "Тёмная тема", desc: "Оформление", state: darkMode, toggle: setDarkMode, icon: "Moon" },
              ].map((setting, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-3.5 rounded-xl hover:bg-white/5 transition-all"
                  style={{ border: "1px solid rgba(168,85,247,0.08)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.12)" }}>
                      <Icon name={setting.icon} size={17} style={{ color: "#a855f7" }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{setting.label}</p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{setting.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setting.toggle(!setting.state)}
                    className="w-11 h-6 rounded-full transition-all duration-300 relative shrink-0"
                    style={{ background: setting.state ? "linear-gradient(135deg, #a855f7, #ec4899)" : "rgba(255,255,255,0.1)" }}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300"
                      style={{ left: setting.state ? "calc(100% - 22px)" : "2px", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }}
                    />
                  </button>
                </div>
              ))}
              <div
                className="flex items-center justify-between px-3 py-3.5 rounded-xl"
                style={{ border: "1px solid rgba(168,85,247,0.08)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.12)" }}>
                    <Icon name="Type" size={17} style={{ color: "#a855f7" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Размер шрифта</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Текущий: {fontSize}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {["мал", "сред", "бол"].map((s, idx) => {
                    const vals = ["маленький", "средний", "большой"];
                    return (
                      <button
                        key={s}
                        onClick={() => setFontSize(vals[idx])}
                        className="px-2 py-1 rounded-lg text-xs transition-all"
                        style={{
                          background: fontSize === vals[idx] ? "rgba(168,85,247,0.3)" : "rgba(255,255,255,0.06)",
                          color: fontSize === vals[idx] ? "#a855f7" : "rgba(255,255,255,0.5)",
                        }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div
                className="mt-2 px-3 py-4 rounded-xl"
                style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="Shield" size={15} style={{ color: "#a855f7" }} />
                  <span className="text-xs font-semibold" style={{ color: "#a855f7" }}>Волна v1.0.0</span>
                </div>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                  End-to-end шифрование активно. Ваши сообщения читаете только вы и собеседник.
                </p>
              </div>
            </div>
          )}

          {/* PROFILE */}
          {activeSection === "profile" && (
            <div className="space-y-3">
              <div className="flex flex-col items-center py-6 gap-3">
                <div className="relative">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white neon-glow-purple"
                    style={{ background: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)" }}
                  >
                    ЯП
                  </div>
                  <button
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center border-2"
                    style={{ background: "#a855f7", borderColor: "hsl(222,20%,6%)" }}
                  >
                    <Icon name="Camera" size={13} style={{ color: "white" }} />
                  </button>
                </div>
                <div className="text-center">
                  <p className="font-bold text-white text-lg">Яков Петренко</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>@yakow_p · в сети</p>
                </div>
              </div>
              {[
                { icon: "User", label: "Имя", value: "Яков Петренко" },
                { icon: "Phone", label: "Телефон", value: "+7 900 123-45-67" },
                { icon: "AtSign", label: "Юзернейм", value: "@yakow_p" },
                { icon: "Info", label: "Статус", value: "🚀 Строю мессенджер!" },
              ].map((field, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                  style={{ border: "1px solid rgba(168,85,247,0.08)" }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.12)" }}>
                    <Icon name={field.icon} size={15} style={{ color: "#a855f7" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>{field.label}</p>
                    <p className="text-sm text-white truncate">{field.value}</p>
                  </div>
                  <Icon name="ChevronRight" size={15} style={{ color: "rgba(255,255,255,0.2)" }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        {activeChatId && activeContact && activeSection === "chats" ? (
          <>
            {/* Chat Header */}
            <div
              className="flex items-center gap-4 px-6 py-4 shrink-0"
              style={{ background: "rgba(10,9,18,0.95)", borderBottom: "1px solid rgba(168,85,247,0.1)", backdropFilter: "blur(20px)" }}
            >
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                  style={{ background: `linear-gradient(135deg, ${activeContact.color}88, ${activeContact.color}44)`, border: `1.5px solid ${activeContact.color}55` }}
                >
                  {activeContact.avatar}
                </div>
                <div
                  className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                  style={{ background: statusColor[activeContact.status], borderColor: "hsl(222,20%,6%)" }}
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">{activeContact.name}</p>
                <p className="text-xs" style={{ color: activeContact.status === "online" ? "#22c55e" : "rgba(255,255,255,0.35)" }}>
                  {isTyping ? (
                    <span className="flex items-center gap-1">
                      печатает
                      <span className="flex gap-0.5 ml-1">
                        {[0, 1, 2].map((d) => (
                          <span
                            key={d}
                            className="typing-dot w-1.5 h-1.5 rounded-full inline-block"
                            style={{ background: "#a855f7", animationDelay: `${d * 0.2}s` }}
                          />
                        ))}
                      </span>
                    </span>
                  ) : activeContact.lastSeen}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {[
                  { icon: "Phone", label: "Звонок" },
                  { icon: "Video", label: "Видео" },
                  { icon: "Search", label: "Поиск" },
                  { icon: "MoreVertical", label: "Ещё" },
                ].map((action) => (
                  <button
                    key={action.icon}
                    title={action.label}
                    className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/8 transition-all"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    <Icon name={action.icon} size={18} />
                  </button>
                ))}
              </div>
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg shrink-0"
                style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.2)" }}
              >
                <Icon name="Lock" size={11} style={{ color: "#a855f7" }} />
                <span className="text-[10px] font-semibold" style={{ color: "#a855f7" }}>E2E</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-2">
              {activeChat?.messages.map((msg, i) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.out ? "justify-end" : "justify-start"} animate-fade-in`}
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <div
                    className={`max-w-[65%] px-4 py-2.5 ${msg.out ? "message-out" : "message-in"}`}
                    style={{
                      background: msg.out
                        ? "linear-gradient(135deg, rgba(168,85,247,0.35), rgba(236,72,153,0.25))"
                        : "rgba(255,255,255,0.07)",
                      border: msg.out
                        ? "1px solid rgba(168,85,247,0.3)"
                        : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <p className="text-sm text-white leading-relaxed">{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      {msg.encrypted && (
                        <Icon name="Lock" size={9} style={{ color: msg.out ? "rgba(168,85,247,0.7)" : "rgba(255,255,255,0.25)" }} />
                      )}
                      <span className="text-[10px]" style={{ color: msg.out ? "rgba(168,85,247,0.7)" : "rgba(255,255,255,0.3)" }}>
                        {msg.time}
                      </span>
                      {msg.out && <Icon name="CheckCheck" size={12} style={{ color: "rgba(168,85,247,0.8)" }} />}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start animate-fade-in">
                  <div
                    className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="typing-dot w-2 h-2 rounded-full inline-block"
                        style={{ background: "#a855f7", animationDelay: `${d * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="px-6 py-4 shrink-0"
              style={{ background: "rgba(10,9,18,0.95)", borderTop: "1px solid rgba(168,85,247,0.1)", backdropFilter: "blur(20px)" }}
            >
              <div className="flex items-center gap-3">
                <button
                  className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/8 transition-all shrink-0"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  <Icon name="Paperclip" size={20} />
                </button>
                <input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Написать сообщение..."
                  className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(168,85,247,0.2)",
                    color: "white",
                  }}
                />
                <button
                  className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/8 transition-all shrink-0"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  <Icon name="Smile" size={20} />
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0"
                  style={{
                    background: messageInput.trim() ? "linear-gradient(135deg, #a855f7, #ec4899)" : "rgba(255,255,255,0.06)",
                    color: messageInput.trim() ? "white" : "rgba(255,255,255,0.3)",
                    boxShadow: messageInput.trim() ? "0 0 20px rgba(168,85,247,0.4)" : "none",
                  }}
                >
                  <Icon name="Send" size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty / Welcome state */
          <div className="flex-1 flex flex-col items-center justify-center gap-5">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center animate-float"
              style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.1))", border: "1px solid rgba(168,85,247,0.2)" }}
            >
              <span className="text-4xl">🌊</span>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold gradient-text mb-2">Волна</h2>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                Выберите чат, чтобы начать общение
              </p>
              <div
                className="flex items-center justify-center gap-1.5 mt-3 px-3 py-1.5 rounded-full mx-auto w-fit"
                style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}
              >
                <Icon name="Lock" size={12} style={{ color: "#a855f7" }} />
                <span className="text-xs" style={{ color: "#a855f7" }}>End-to-end шифрование включено</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
