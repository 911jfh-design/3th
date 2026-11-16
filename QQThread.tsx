import { useState } from "react";
import {
  ChevronLeft,
  Menu,
  Image,
  Camera,
  Mic,
  Smile,
  Plus,
  Check,
  Video,
} from "lucide-react";
import { NativeComposer } from "../DeviceSystem";
import { Avatar, Media, meta, type Props } from "./shared";
import "./qq-detail.css";
export function QQThread(p: Props) {
  const [panel, setPanel] = useState("");
  const messages = p.items.filter(
    (i) => i.title === p.thread && i.folder !== "المساحة" && i.kind !== "post",
  );
  const read = (i: (typeof messages)[number]) =>
    p.creator || i.password ? p.onItem(i) : p.onRead(i.id);
  return (
    <div className="qq-native-thread">
      <header className="qq-thread-nav">
        <button aria-label="رجوع لرسائل QQ" onClick={() => p.onThread("")}>
          <ChevronLeft size={26} />
        </button>
        <div>
          <strong>{p.thread}</strong>
          <small>{meta(messages.at(-1), "status", "الدردشة")}</small>
        </div>
        <button
          aria-label="QQمعلومات المحادثة"
          onClick={() => setPanel(panel ? "" : "معلومات المحادثة")}
        >
          <Menu size={24} />
        </button>
      </header>
      <div className="qq-thread-messages">
        {messages.map((i, n) => {
          const quoted = messages.find((x) => x.id === i.meta.replyTo),
            quote = i.meta.reply || quoted?.body;
          return (
            <div key={i.id}>
              {(n === 0 ||
                i.time.slice(-5) !== messages[n - 1].time.slice(-5)) && (
                <time className="qq-message-time">{i.time.slice(-5)}</time>
              )}
              <div
                className={
                  "qq-native-message " + (i.outgoing ? "outgoing" : "")
                }
              >
                <Avatar name={i.sender} src={i.avatar} />
                <div className="qq-message-stack">
                  {i.meta.badge && <small>{i.meta.badge}</small>}
                  <button
                    className={
                      "qq-native-bubble " +
                      (i.kind === "transfer" ? "qq-transfer-bubble" : "")
                    }
                    onClick={() => read(i)}
                  >
                    {i.kind === "transfer" ? (
                      <>
                        <div className="qq-transfer-top">
                          <span>
                            <Check size={25} />
                          </span>
                          <div>
                            <strong>
                              ¥
                              {meta(
                                i,
                                "amount",
                                /^\d+(\.\d+)?$/.test(i.body) ? i.body : "—",
                              )}
                            </strong>
                            <p>تحويل</p>
                          </div>
                        </div>
                        <footer>
                          {meta(i, "transferStatus", "سجل التحويلات")}
                          <small>QQدفع</small>
                        </footer>
                      </>
                    ) : (
                      <>
                        {quote && (
                          <span className="qq-message-quote">
                            <b>
                              {i.meta.replySender || quoted?.sender || "اقتباس"}
                            </b>
                            <span>{quote}</span>
                          </span>
                        )}
                        {["image", "video", "audio"].includes(i.kind) ? (
                          <Media item={i} />
                        ) : (
                          i.body
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {!messages.length && <p className="qq-thread-empty">لا توجد رسائل</p>}
      </div>
      <div className="qq-native-composer">
        <NativeComposer creator={p.creator} onAdd={p.onAdd} />
        <div>
          {[
            [Mic, "صوت"],
            [Image, "صورة"],
            [Camera, "الكاميرا"],
            [Video, "الفيديو"],
            [Smile, "الإيموجي"],
            [Plus, "المزيد"],
          ].map(([Icon, label]) => {
            const Glyph = Icon as typeof Mic;
            return (
              <button
                aria-label={"QQ" + label}
                key={String(label)}
                onClick={() => setPanel(panel === label ? "" : String(label))}
              >
                <Glyph size={26} />
              </button>
            );
          })}
        </div>
      </div>
      {panel && (
        <div className="qq-thread-sheet">
          <header>
            <button onClick={() => setPanel("")}>
              <ChevronLeft />
              رجوع
            </button>
            <strong>{panel}</strong>
          </header>
          {panel === "معلومات المحادثة" ? (
            <div className="qq-member-list">
              {[...new Set(messages.map((i) => i.sender))].map((name) => (
                <div key={name}>
                  <Avatar name={name} />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="qq-media-picker">
              {messages
                .filter((i) => ["image", "audio", "video"].includes(i.kind))
                .map((i) => (
                  <button key={i.id} onClick={() => read(i)}>
                    <Media item={i} />
                    <span>
                      {i.kind === "audio"
                        ? "صوت"
                        : i.kind === "image"
                          ? "صورة"
                          : "الفيديو"}
                    </span>
                  </button>
                ))}
              {!messages.some((i) =>
                ["image", "audio", "video"].includes(i.kind),
              ) && <p>لا يوجد محتوى</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
