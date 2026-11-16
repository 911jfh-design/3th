import { useState } from "react";
import {
  ChevronLeft,
  MoreHorizontal,
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  Share,
  Headphones,
  Star,
  Camera,
  Crown,
  Copy,
  Send,
  Home,
  Search,
  Bell,
  Circle,
} from "lucide-react";
import { useSkinState } from "../skinState";
import { RichText } from "../RichText";
import { Avatar, Media, meta } from "./shared";
import type { Item, UiValue } from "../schema";
import "./social-details.css";
export const socialDetailApps = new Set(["twitter", "weibo"]);
const count = (n: number) =>
  n >= 10000 ? (n / 10000).toFixed(1).replace(/\.0$/, "") + "w" : String(n);
export function SocialDetail(p: {
  app: string;
  item: Item;
  back: () => void;
  owner: string;
  ui?: Record<string, UiValue>;
  onUi?: (key: string, value: UiValue) => void;
}) {
  const { item } = p,
    weibo = p.app === "weibo";
  const [liked, setLiked] = useSkinState<boolean>(p, "liked-" + item.id, false),
    [saved, setSaved] = useSkinState<boolean>(p, "saved-" + item.id, false),
    [followed, setFollowed] = useSkinState<boolean>(
      p,
      "followed-" + item.sender,
      false,
    ),
    [extra, setExtra] = useSkinState<string[]>(p, "replies-" + item.id, []);
  const [tab, setTab] = useState("التعليقات"),
    [draft, setDraft] = useState(""),
    [target, setTarget] = useState(""),
    [menu, setMenu] = useState(false),
    [sort, setSort] = useState(false),
    [copied, setCopied] = useState(false);
  const comments = [...item.comments, ...extra],
    replies = sort ? [...comments].reverse() : comments;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(item.body);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  const submit = () => {
    if (!draft.trim()) return;
    setExtra([...extra, (p.owner || "صاحبة الجوال") + ": " + draft.trim()]);
    setDraft("");
    setTarget("");
    setTab("التعليقات");
  };
  const actions = (
    <div className="post-detail-actions">
      <button aria-label="عرض التعليقات" onClick={() => setTab("التعليقات")}>
        <MessageCircle />
        {count(comments.length)}
      </button>
      <button aria-label="عرض إعادة النشر" onClick={() => setTab("إعادة نشر")}>
        <Repeat2 />
        {meta(item, "reposts", "0")}
      </button>
      <button
        aria-label="الإعجاب بالمنشور"
        aria-pressed={liked}
        onClick={() => setLiked(!liked)}
      >
        <Heart
          fill={liked ? "#f91880" : "none"}
          color={liked ? "#f91880" : undefined}
        />
        {count(item.likes + (liked ? 1 : 0))}
      </button>
      <button
        aria-label="حفظ المنشور"
        aria-pressed={saved}
        onClick={() => setSaved(!saved)}
      >
        <Bookmark fill={saved ? "currentColor" : "none"} />
        {saved ? "1" : "0"}
      </button>
      <button aria-label="مشاركة المنشور" onClick={() => setMenu(!menu)}>
        <Share />
      </button>
    </div>
  );
  return (
    <div
      className={
        "app-post-detail " +
        (weibo
          ? "weibo-post-detail"
          : "x-post-detail" +
            (p.ui?.["x-dark"] !== false ? " x-reference-dark" : ""))
      }
    >
      <header className="post-detail-nav">
        <button aria-label="رجوع لقائمة المنشورات" onClick={p.back}>
          <ChevronLeft size={27} />
        </button>
        <strong>{weibo ? "نص التدوينة" : "المنشورات​"}</strong>
        <div>
          {weibo && <Headphones size={23} />}
          <button aria-label="خيارات إضافية للمنشور" onClick={() => setMenu(!menu)}>
            <MoreHorizontal size={26} />
          </button>
        </div>
      </header>
      <div className="post-detail-scroll">
        <div className="post-detail-author">
          <Avatar name={item.sender} src={item.avatar} />
          <div>
            <strong>{item.sender || "المستخدم"}</strong>
            <small>
              {weibo
                ? item.time + " " + meta(item, "location")
                : meta(item, "handle", item.sender ? "@" + item.sender : "")}
            </small>
          </div>
          {weibo ? (
            <button
              aria-label="متابعة الكاتب"
              onClick={() => setFollowed(!followed)}
            >
              <Star fill={followed ? "#ff9500" : "none"} />
            </button>
          ) : (
            <button
              className="post-follow"
              onClick={() => setFollowed(!followed)}
            >
              {followed ? "متابَع" : "متابعة"}
            </button>
          )}
        </div>
        <div className="post-detail-body">
          <RichText value={item.richText} fallback={item.body} />
          {item.media && <Media item={item} />}
        </div>
        {weibo ? (
          <div className="weibo-share-options">
            {[Crown, MessageCircle, Camera, Share, Copy].map((Icon, n) => (
              <button
                key={n}
                aria-label={["عضو", "مشاركة عبر ويتشات", "الكاميرا", "مشاركة​", "نسخ"][n]}
                onClick={() => (n === 4 ? void copy() : setMenu(true))}
              >
                <Icon size={25} />
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="x-post-metadata">
              {item.time} · <b>{meta(item, "views", "0")}</b> مشاهدة
            </div>
            {actions}
          </>
        )}
        {weibo ? (
          <div className="weibo-detail-tabs">
            {["إعادة نشر", "التعليقات", "إعجاب​"].map((name) => (
              <button
                key={name}
                aria-pressed={tab === name}
                onClick={() => setTab(name)}
              >
                {name}{" "}
                {name === "التعليقات"
                  ? count(comments.length)
                  : name === "إعجاب​"
                    ? count(item.likes + (liked ? 1 : 0))
                    : meta(item, "reposts", "0")}
              </button>
            ))}
          </div>
        ) : (
          <div className="x-related-row">
            <button onClick={() => setSort(!sort)}>
              {sort ? "الأحدث" : "ذات صلة"}⌄
            </button>
            <button onClick={() => setTab(tab === "إعادة نشر" ? "التعليقات" : "إعادة نشر")}>
              عرض الاقتباس ›
            </button>
          </div>
        )}
        {weibo && (
          <button className="weibo-sort" onClick={() => setSort(!sort)}>
            {sort ? "حسب الوقت" : "حسب الشعبية"}⌄
          </button>
        )}
        {tab === "التعليقات" ? (
          <div className="post-detail-comments">
            {replies.map((c, index) => {
              const split = c.search(/[: :]/),
                hasName = split > 0 && split < 24,
                name = hasName ? c.slice(0, split) : "المستخدم",
                body = hasName ? c.slice(split + 1) : c;
              return (
                <article key={index} className="post-detail-comment">
                  <Avatar name={name} />
                  <div>
                    <strong>{name}</strong>
                    <p>{body}</p>
                    <div className="post-comment-actions">
                      <button
                        aria-label={"الردود" + name}
                        onClick={() => setTarget(name)}
                      >
                        <MessageCircle size={16} />
                      </button>
                      <button
                        aria-label={"الإعجاب بالرد" + index}
                        onClick={(e) => {
                          e.currentTarget.classList.toggle("liked");
                        }}
                      >
                        <Heart size={16} />
                      </button>
                    </div>
                  </div>
                  <MoreHorizontal size={17} />
                </article>
              );
            })}
            {!replies.length && <p className="post-comments-empty">لا توجد تعليقات</p>}
          </div>
        ) : (
          <p className="post-comments-empty">
            {tab === "إعادة نشر" ? "لا توجد سجلات إعادة نشر" : "لا توجد سجلات أخرى"}
          </p>
        )}
      </div>
      <form
        className="post-detail-reply"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Avatar name={p.owner || "صاحبة الجوال"} />
        <input
          aria-label="الرد على المنشور"
          placeholder={
            target ? "الردود @" + target : weibo ? "اكتب تعليقك" : "انشر ردك"
          }
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button aria-label="إرسال الرد" disabled={!draft.trim()}>
          <Send size={20} />
        </button>
      </form>
      {!weibo && (
        <nav className="x-detail-bottom">
          {[Home, Search, Circle, Bell, MessageCircle].map((Icon, n) => (
            <button
              key={n}
              aria-label={
                ["رجوع إلى الخط الزمني", "Xبحث", "Xالمساعد", "Xالإشعارات", "Xرسائل خاصة"][n]
              }
              onClick={p.back}
            >
              <Icon />
            </button>
          ))}
        </nav>
      )}
      {menu && (
        <div className="post-options-menu">
          <button onClick={copy}>
            <Copy size={18} />
            {copied ? "تم النسخ" : "نسخ النص"}
          </button>
          <button
            onClick={() => {
              setSaved(!saved);
              setMenu(false);
            }}
          >
            <Bookmark size={18} />
            {saved ? "إزالة من المفضلة" : "المفضلة"}
          </button>
          <button onClick={() => setMenu(false)}>إلغاء</button>
        </div>
      )}
    </div>
  );
}
