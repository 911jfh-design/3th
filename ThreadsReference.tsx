import { useState } from "react";
import {
  Home,
  Send,
  Plus,
  Heart,
  User,
  Search,
  Menu,
  MoreHorizontal,
  ArrowLeft,
  Repeat2,
  Bookmark,
  SquarePen,
  SlidersHorizontal,
  BellOff,
  ChevronRight,
  X,
  Smile,
  Globe,
  Mic,
  Delete,
  ArrowUp,
  CornerDownLeft,
  Pin,
} from "lucide-react";
import type { SkinProps } from "../AppSkins";
import { Avatar, Media } from "./shared";
import { makeItem, type Item } from "../schema";
import { useSkinState } from "../skinState";
import "./threads-reference.css";
export function ThreadsReference(p: SkinProps) {
  const [tab, setTab] = useSkinState<string>(p, "threads-tab", "الرئيسية"),
    [liked, setLiked] = useSkinState<string[]>(p, "threads-liked", []),
    [saved, setSaved] = useSkinState<string[]>(p, "threads-saved", []),
    [posts, setPosts] = useSkinState<string[]>(p, "threads-posts", []),
    [replies, setReplies] = useSkinState<string[]>(p, "threads-replies", []);
  const [draft, setDraft] = useState(""),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("الكل"),
    [side, setSide] = useState(false),
    [compose, setCompose] = useState(false),
    [keyboard, setKeyboard] = useState(false),
    [shift, setShift] = useState(false),
    [numbers, setNumbers] = useState(false),
    [options, setOptions] = useState(false),
    [selected, setSelected] = useState<Item | null>(null);
  const local = posts.map((body, n) =>
    makeItem({
      id: "local-thread-" + n,
      title: "خيوط محلية",
      body,
      sender: p.owner || "صاحبة الجوال",
      time: p.virtualTime || "09:41",
      meta: { local: "true" },
    }),
  );
  const feed = [
      ...local,
      ...p.items.filter((i) => i.folder !== "رسائل خاصة" && !i.meta.activityType),
    ],
    messages = p.items.filter((i) => i.folder === "رسائل خاصة"),
    activities = p.items.filter((i) => i.meta.activityType);
  const toggle = (id: string, items: string[], set: (v: string[]) => void) =>
    set(items.includes(id) ? items.filter((v) => v !== id) : [...items, id]);
  const open = (i: Item) => {
    if (i.password || p.creator) {
      p.onItem(i);
      return;
    }
    if (i.meta.local !== "true") p.onRead(i.id);
    setSelected(i);
  };
  const card = (i: Item) => (
    <article className="tr-post" key={i.id}>
      <button className="tr-avatar" onClick={() => setTab("الملف الشخصي")}>
        <Avatar name={i.sender} src={i.avatar} />
        <span>+</span>
      </button>
      <div className="tr-post-content">
        <div className="tr-byline">
          <b>{i.sender}</b>
          <span>{i.time.slice(-5)}</span>
          <button
            aria-label="خيارات المنشور"
            onClick={() => {
              setSelected(i);
              setOptions(true);
            }}
          >
            <MoreHorizontal />
          </button>
        </div>
        <button className="tr-body" onClick={() => open(i)}>
          {i.body}
          {i.media && <Media item={i} />}
        </button>
        <div className="tr-actions">
          <button
            aria-label={"إعجاب" + i.title}
            aria-pressed={liked.includes(i.id)}
            onClick={() => toggle(i.id, liked, setLiked)}
          >
            <Heart
              fill={liked.includes(i.id) ? "#ff3060" : "none"}
              color={liked.includes(i.id) ? "#ff3060" : "currentColor"}
            />
            {i.likes + (liked.includes(i.id) ? 1 : 0) || ""}
          </button>
          <button aria-label={"الردود" + i.title} onClick={() => open(i)}>
            <MessageCircleIcon />
            {i.comments.length || ""}
          </button>
          <button
            aria-label={"إعادة نشر" + i.title}
            onClick={() => toggle(i.id, saved, setSaved)}
          >
            <Repeat2 />
          </button>
          <button
            aria-label={"مشاركة​" + i.title}
            onClick={() => {
              setDraft(i.body);
              setCompose(true);
            }}
          >
            <Send />
          </button>
        </div>
      </div>
    </article>
  );
  return (
    <div className="threads-reference">
      <div className="tr-scroll">
        {selected ? (
          <>
            <header className="tr-head">
              <button
                aria-label="رجوع لقائمة Threads"
                onClick={() => setSelected(null)}
              >
                <ArrowLeft />
              </button>
              <b>خيط</b>
              <MoreHorizontal />
            </header>
            {card(selected)}
            <div className="tr-comments">
              {[
                ...selected.comments,
                ...replies
                  .filter((v) => v.startsWith(selected.id + "\t"))
                  .map((v) => v.split("\t").slice(1).join("\t")),
              ].map((c, n) => (
                <p key={n}>{c}</p>
              ))}
            </div>
            <form
              className="tr-reply"
              onSubmit={(e) => {
                e.preventDefault();
                if (draft.trim()) {
                  setReplies([...replies, selected.id + "\t" + draft.trim()]);
                  setDraft("");
                }
              }}
            >
              <input
                aria-label="Threadsالردود"
                placeholder="الرد على الخيط"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button>إرسال</button>
            </form>
          </>
        ) : (
          <>
            <header
              className={
                "tr-head " + (tab === "الرئيسية" ? "tr-home-head" : "tr-large-head")
              }
            >
              {tab === "الرئيسية" ? (
                <>
                  <button
                    aria-label="فتح قائمة Threads"
                    onClick={() => setSide(true)}
                  >
                    <Menu />
                  </button>
                  <svg
                    className="tr-logo"
                    width="29"
                    height="36"
                    viewBox="0 0 64 64"
                    aria-label="Threads"
                  >
                    <path
                      d="M48 17C42 5 17 8 14 25c-5 23 26 32 36 17 9-15-9-25-23-17-11 8 7 17 13 8 5-8 0-16-10-14M49 29c6 20-16 31-29 17"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                  <button
                    aria-label="بحث في Threads"
                    onClick={() => setTab("بحث")}
                  >
                    <Search />
                  </button>
                </>
              ) : (
                <>
                  <h1>
                    {tab === "المحادثات"
                      ? "المحادثات"
                      : tab === "المنشورات"
                        ? "المنشورات"
                        : tab === "الملف الشخصي"
                          ? p.owner || "صاحبة الجوال"
                          : tab}
                  </h1>
                  {(tab === "المحادثات" || tab === "المنشورات") && <BellOff />}
                  <button
                    aria-label="خيط جديد"
                    onClick={() => setCompose(true)}
                  >
                    <SquarePen />
                  </button>
                </>
              )}
            </header>
            {(tab === "المحادثات" || tab === "بحث") && (
              <label className="tr-search">
                <Search size={18} />
                <input
                  aria-label="بحث في محتوى Threads"
                  placeholder="بحث"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            )}
            {(tab === "المحادثات" || tab === "المنشورات") && (
              <nav className="tr-filters">
                {(tab === "المحادثات"
                  ? ["تصفية", "الوارد", "رسائل غير معروفة"]
                  : ["الكل", "متابعة", "الحوارات", "الإشارات", "من تتابعهم"]
                ).map((t) => (
                  <button
                    key={t}
                    className={filter === t ? "selected" : ""}
                    onClick={() => setFilter(t)}
                  >
                    {t === "تصفية" ? <SlidersHorizontal size={19} /> : t}
                  </button>
                ))}
              </nav>
            )}
            {tab === "الرئيسية" &&
              feed
                .filter((i) =>
                  filter === "المفضلة"
                    ? saved.includes(i.id)
                    : filter === "متابَع"
                      ? i.meta.following === "true"
                      : filter === "منشورات مؤقتة"
                        ? i.meta.story === "true"
                        : true,
                )
                .map(card)}
            {tab === "بحث" &&
              feed.filter((i) => (i.body + i.sender).includes(query)).map(card)}
            {tab === "المحادثات" &&
              messages
                .filter(
                  (i) =>
                    (i.body + i.sender).includes(query) &&
                    (filter !== "رسائل غير معروفة" || i.meta.request === "true"),
                )
                .map((i) => (
                  <button
                    className="tr-message"
                    key={i.id}
                    onClick={() => open(i)}
                  >
                    <Avatar name={i.sender} src={i.avatar} />
                    <span>
                      <b>{i.sender}</b>
                      <small>
                        {i.body} · {i.time.slice(-5)}
                      </small>
                    </span>
                    {i.favorite && <Pin size={16} />}
                  </button>
                ))}
            {tab === "المنشورات" && (
              <>
                <h3 className="tr-section">آخر 7 أيام</h3>
                {activities
                  .filter((i) =>
                    filter === "متابعة"
                      ? i.meta.activityType === "follow"
                      : filter === "الحوارات"
                        ? i.meta.activityType === "reply"
                        : filter === "الإشارات"
                          ? i.meta.activityType === "mention"
                          : true,
                  )
                  .map((i) => (
                    <div className="tr-activity" key={i.id}>
                      <Avatar name={i.sender} src={i.avatar} />
                      <div>
                        <b>{i.sender}</b>
                        <small>{i.time.slice(-5)}</small>
                        <p>{i.body}</p>
                        <div className="tr-actions">
                          <Heart />
                          <Send />
                        </div>
                      </div>
                    </div>
                  ))}
                {!activities.length && <p className="tr-empty">لا توجد منشورات</p>}
              </>
            )}
            {tab === "الملف الشخصي" && (
              <>
                <div className="tr-profile">
                  <Avatar name={p.owner || "صاحبة الجوال"} />
                  <p>{p.owner}</p>
                </div>
                {feed
                  .filter(
                    (i) => i.sender === p.owner || i.meta.local === "true",
                  )
                  .map(card)}
              </>
            )}
            {((tab === "المحادثات" && !messages.length) ||
              (tab === "الرئيسية" && !feed.length)) && (
              <p className="tr-empty">لا يوجد محتوى</p>
            )}
          </>
        )}
      </div>
      <nav className="tr-bottom">
        {[Home, Send, Plus, Heart, User].map((Icon, n) => (
          <button
            key={n}
            aria-label={
              [
                "Threadsالرئيسية",
                "Threadsالمحادثات",
                "خيط جديد",
                "Threadsالمنشورات",
                "Threadsالملف الشخصي",
              ][n]
            }
            className={
              tab === ["الرئيسية", "المحادثات", "", "المنشورات", "الملف الشخصي"][n]
                ? "selected"
                : ""
            }
            onClick={() => {
              setSelected(null);
              if (n === 2) {
                setCompose(true);
                setKeyboard(true);
              } else setTab(["الرئيسية", "المحادثات", "", "المنشورات", "الملف الشخصي"][n]);
            }}
          >
            <Icon
              fill={
                (n === 0 && tab === "الرئيسية") || (n === 3 && tab === "المنشورات")
                  ? "currentColor"
                  : "none"
              }
            />
          </button>
        ))}
      </nav>
      {side && (
        <div className="tr-side-cover" onClick={() => setSide(false)}>
          <aside className="tr-side" onClick={(e) => e.stopPropagation()}>
            <header>
              <b>المنشورات</b>
              <button
                aria-label="إغلاق قائمة Threads"
                onClick={() => setSide(false)}
              >
                <X />
              </button>
            </header>
            <div className="tr-side-tools">
              <button
                onClick={() => {
                  setTab("الرئيسية");
                  setSide(false);
                }}
              >
                <Heart />
              </button>
              <button
                onClick={() => {
                  setFilter("المفضلة");
                  setSide(false);
                }}
              >
                <Bookmark />
              </button>
            </div>
            <div className="tr-side-list">
              {["مقترح لك", "متابَع", "منشورات مؤقتة"].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setFilter(t);
                    setSide(false);
                  }}
                >
                  {t}
                  <ChevronRight />
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}
      {compose && (
        <section className="tr-compose">
          <header>
            <button
              onClick={() => {
                setCompose(false);
                setKeyboard(false);
              }}
            >
              إلغاء
            </button>
            <b>خيط جديد</b>
            <button aria-label="خيارات الخيط" onClick={() => setOptions(!options)}>
              <MoreHorizontal />
            </button>
          </header>
          <div className="tr-compose-content">
            <Avatar name={p.owner || "صاحبة الجوال"} />
            <div>
              <b>{p.owner}</b>
              <span className="tr-muted"> › مجتمع أو موضوع</span>
              <textarea
                aria-label="محتوى الخيط"
                placeholder="ما الجديد؟"
                value={draft}
                inputMode="none"
                onFocus={() => setKeyboard(true)}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={2000}
              />
              <p className="tr-muted">إضافة إلى الخيط</p>
            </div>
          </div>
          <div className="tr-compose-actions">
            <button onClick={() => setOptions(!options)}>
              <SlidersHorizontal size={21} />
              خيارات المنشور
            </button>
            <button
              disabled={!draft.trim()}
              onClick={() => {
                setPosts([draft.trim(), ...posts]);
                setDraft("");
                setCompose(false);
                setKeyboard(false);
                setTab("الرئيسية");
              }}
            >
              نشر
            </button>
          </div>
          {keyboard && (
            <div className="tr-keyboard">
              <div className="tr-candidates">
                {["أنا", "أنتِ", "جيد", "هو", "لا", "هذا", "هذا الشيء", "صحيح"].map((k) => (
                  <button
                    key={k}
                    onClick={() =>
                      setDraft(draft + (shift ? k.toUpperCase() : k))
                    }
                  >
                    {k}
                  </button>
                ))}
                <button
                  aria-label="إخفاء لوحة الخيط"
                  onClick={() => setKeyboard(false)}
                >
                  ⌄
                </button>
              </div>
              {(numbers
                ? ["1234567890", "-/:;()&@", ".,?!"]
                : ["qwertyuiop", "asdfghjkl", "zxcvbnm"]
              ).map((row, n) => (
                <div className="tr-key-row" key={n}>
                  {n === 2 && (
                    <button
                      aria-label="حروف كبيرة"
                      aria-pressed={shift}
                      onClick={() => setShift(!shift)}
                    >
                      <ArrowUp />
                    </button>
                  )}
                  {[...row].map((k) => (
                    <button key={k} onClick={() => setDraft(draft + k)}>
                      {k}
                    </button>
                  ))}
                  {n === 2 && (
                    <button
                      aria-label="حذف حرف"
                      onClick={() => setDraft(draft.slice(0, -1))}
                    >
                      <Delete />
                    </button>
                  )}
                </div>
              ))}
              <div className="tr-key-row">
                <button onClick={() => setNumbers(!numbers)}>
                  {numbers ? "ABC" : "123"}
                </button>
                <button>
                  <Smile />
                </button>
                <button
                  className="space"
                  aria-label="مسافة"
                  onClick={() => setDraft(draft + " ")}
                >
                  {" "}
                </button>
                <button
                  aria-label="سطر جديد"
                  onClick={() => setDraft(draft + "\n")}
                >
                  <CornerDownLeft />
                </button>
              </div>
              <footer>
                <Globe />
                <Mic />
              </footer>
            </div>
          )}
        </section>
      )}
      {options && (
        <div className="tr-options">
          <b>خيارات المنشور</b>
          <p>يمكن للجميع الرد</p>
          <button onClick={() => setOptions(false)}>تم</button>
        </div>
      )}
    </div>
  );
}
function MessageCircleIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M20 12a8 8 0 0 1-8 8H4l2-4a8 8 0 1 1 14-4z" />
    </svg>
  );
}
