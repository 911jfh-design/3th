import { useState } from "react";
import {
  Heart,
  Users,
  Grid2X2,
  Flame,
  Bed,
  Footprints,
  ChevronRight,
  ChevronLeft,
  User,
  Plus,
  MoonStar,
  Sunrise,
  CloudSun,
  Droplet,
  Wind,
  Map,
  List,
  Cloud,
  Activity,
  Search,
} from "lucide-react";
import { useSkinState } from "../skinState";
import type { Item } from "../schema";
import { meta, type Props } from "./shared";
import "../ios/native-apps.css";
const healthTypes = [
  { id: "cycle", title: "تتبع الدورة", icon: Activity, color: "#7361ff" },
  { id: "activity", title: "سجل اللياقة", icon: Flame, color: "#ff5900" },
  { id: "sleep", title: "تقييم النوم", icon: Bed, color: "#7361ff" },
  { id: "steps", title: "الخطوات", icon: Footprints, color: "#ff5900" },
];
function seriesFor(item: Item | undefined) {
  try {
    const values = JSON.parse(meta(item, "series", "[]"));
    return Array.isArray(values)
      ? values
          .filter((v) => typeof v === "number" && Number.isFinite(v) && v >= 0)
          .slice(0, 30)
      : [];
  } catch {
    return [];
  }
}
function recordFor(items: Item[], key: string) {
  const map: Record<string, string[]> = {
    cycle: ["الدورة", "الدورة الشهرية"],
    activity: ["النشاط", "اللياقة"],
    sleep: ["النوم"],
    steps: ["الخطوات"],
  };
  return items.find((i) =>
    map[key].some((s) => meta(i, "metric", i.title).includes(s)),
  );
}
export function HealthSkin(p: Props) {
  const [tab, setTab] = useSkinState<string>(p, "tab", "الملخص"),
    [pins, setPins] = useSkinState<string[]>(
      p,
      "pins",
      p.items.some((i) => recordFor([i], "cycle"))
        ? ["cycle", "activity", "sleep", "steps"]
        : ["activity", "sleep", "steps"],
    );
  const [editing, setEditing] = useState(false),
    [detail, setDetail] = useState(""),
    [profile, setProfile] = useState(false);
  const current = recordFor(p.items, detail);
  const open = (key: string) => {
    const i = recordFor(p.items, key);
    if (i && p.creator) {
      p.onItem(i);
      return;
    }
    if (i?.password) {
      p.onItem(i);
      return;
    }
    if (i) p.onRead(i.id);
    setDetail(key);
  };
  return (
    <div className="catalog-skin native-health calibrated-health">
      <header className="health-native-nav">
        {detail || profile ? (
          <button
            aria-label="رجوع لملخص الصحة"
            onClick={() => {
              setDetail("");
              setProfile(false);
            }}
          >
            <ChevronLeft />
          </button>
        ) : (
          <span />
        )}
        <strong>
          {detail
            ? healthTypes.find((x) => x.id === detail)?.title
            : profile
              ? "تفاصيل الصحة"
              : tab}
        </strong>
        <button
          aria-label="البيانات الصحية"
          onClick={() => (p.creator ? p.onAdd() : setProfile(true))}
        >
          <User size={23} />
        </button>
      </header>
      <div className="health-native-scroll">
        {profile ? (
          <>
            <h1>تفاصيل الصحة</h1>
            <section className="health-profile-empty">
              <User size={45} />
              <h2>{p.owner || "صاحبة الجوال"}</h2>
              <p>لم تُضف بيانات أخرى</p>
            </section>
          </>
        ) : detail ? (
          <>
            <div className="health-periods">
              {["يوم", "أسبوع", "شهر", "6 أشهر", "سنة"].map((x) => (
                <button
                  key={x}
                  onClick={(e) => {
                    e.currentTarget.parentElement
                      ?.querySelectorAll("button")
                      .forEach((b) => b.removeAttribute("data-selected"));
                    e.currentTarget.dataset.selected = "true";
                  }}
                >
                  {x}
                </button>
              ))}
            </div>
            <p className="health-detail-value">
              {current ? meta(current, "value", "—") : "لا توجد بيانات"}{" "}
              <small>{current ? meta(current, "unit") : ""}</small>
            </p>
            <div className="health-detail-chart" aria-label="مخطط السجل الصحي">
              {Array.from({ length: 7 }, (_, i) => (
                <span
                  key={i}
                  style={{
                    height:
                      seriesFor(current)[i] !== undefined
                        ? `${Math.max(2, (seriesFor(current)[i] / Math.max(...seriesFor(current), 1)) * 100)}%`
                        : "3px",
                  }}
                />
              ))}
            </div>
            <section className="health-detail-description">
              <h2>السجل​</h2>
              {current ? (
                <>
                  <p>{current.body}</p>
                  <small>{current.time}</small>
                </>
              ) : (
                <p>لا توجد بيانات​</p>
              )}
            </section>
          </>
        ) : tab === "الملخص" ? (
          <>
            <div className="health-section-title">
              <h2>تثبيت​</h2>
              <button onClick={() => setEditing(!editing)}>
                {editing ? "تم" : "تعديل"}
              </button>
            </div>
            {editing && (
              <div className="health-pin-editor">
                {healthTypes.map((t) => (
                  <label key={t.id}>
                    <input
                      type="checkbox"
                      checked={pins.includes(t.id)}
                      onChange={() =>
                        setPins(
                          pins.includes(t.id)
                            ? pins.filter((x) => x !== t.id)
                            : [...pins, t.id],
                        )
                      }
                    />
                    {t.title}
                  </label>
                ))}
              </div>
            )}
            <div className="health-cards">
              {pins.map((id) => {
                const t = healthTypes.find((t) => t.id === id);
                if (!t) return null;
                const i = recordFor(p.items, id);
                const Icon = t.icon;
                return (
                  <button
                    key={id}
                    className={"health-native-card health-card-" + id}
                    onClick={() => open(id)}
                  >
                    <header style={{ color: t.color }}>
                      <Icon size={19} />
                      <strong>{t.title}</strong>
                      <time>{i?.time.slice(5, 10) || ""}</time>
                      <ChevronRight size={18} />
                    </header>
                    {id === "activity" ? (
                      <div className="health-activity-values">
                        {[
                          ["النشاط", "active", "سعرة"],
                          ["تمرين", "exercise", "دقيقة"],
                          ["وقوف", "stand", "ساعة"],
                        ].map(([name, key, unit], n) => (
                          <div
                            key={key}
                            style={{
                              color: ["#ff2d55", "#54c900", "#00b2d9"][n],
                            }}
                          >
                            <small>{name}</small>
                            <p>
                              <b>{i ? meta(i, key, "—") : "—"}</b>
                              <span>{unit}</span>
                            </p>
                          </div>
                        ))}
                        <div className="activity-rings">
                          <i />
                          <i />
                          <i />
                        </div>
                      </div>
                    ) : (
                      <div className="health-card-bottom">
                        <div>
                          <b>
                            {i
                              ? meta(i, "value", i.body || "لا توجد بيانات")
                              : "لا توجد بيانات"}
                          </b>
                          <span>{i ? meta(i, "unit") : ""}</span>
                        </div>
                        {id === "steps" && (
                          <div className="health-spark" aria-hidden="true">
                            {Array.from({ length: 7 }, (_, n) => (
                              <i
                                key={n}
                                style={{
                                  height:
                                    seriesFor(i)[n] !== undefined
                                      ? `${Math.max(3, (seriesFor(i)[n] / Math.max(...seriesFor(i), 1)) * 45)}px`
                                      : "8px",
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <button className="health-all-row" onClick={() => setTab("تصفّح")}>
              <Heart color="#ff2d55" />
              عرض كل البيانات الصحية
              <ChevronRight />
            </button>
            <h2 className="health-trends-title">الاتجاهات</h2>
            <div className="health-trends-empty">
              {p.items.length ? "عرض سجلات البيانات الصحية" : "لا توجد اتجاهات"}
            </div>
          </>
        ) : tab === "مشاركة" ? (
          <section className="health-sharing">
            <Users size={54} />
            <h2>مشاركة البيانات الصحية</h2>
            <p>لا توجد بيانات مشتركة</p>
            {p.items
              .filter((i) => i.folder === "مشاركة")
              .map((i) => (
                <button key={i.id} onClick={() => p.onItem(i)}>
                  {i.title}
                </button>
              ))}
          </section>
        ) : (
          <>
            <h1>تصفّح</h1>
            {healthTypes.map((t) => (
              <button
                key={t.id}
                className="health-browse-row"
                onClick={() => open(t.id)}
              >
                <t.icon size={22} color={t.color} />
                {t.title}
                <ChevronRight />
              </button>
            ))}
            {p.items
              .filter((i) => !healthTypes.some((t) => recordFor([i], t.id)))
              .map((i) => (
                <button
                  className="health-browse-row"
                  key={i.id}
                  onClick={() => p.onItem(i)}
                >
                  {i.title}
                  <ChevronRight />
                </button>
              ))}
          </>
        )}
      </div>
      {!detail && !profile && (
        <nav className="health-floating-tabs">
          {[
            [Heart, "الملخص"],
            [Users, "مشاركة"],
            [Grid2X2, "تصفّح"],
          ].map(([Icon, label]) => {
            const Glyph = Icon as typeof Heart;
            return (
              <button
                key={String(label)}
                className={tab === label ? "selected" : ""}
                onClick={() => setTab(String(label))}
              >
                <Glyph size={25} />
                <span>{String(label)}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
function listMeta(
  item: Item | undefined,
  key: string,
): {
  time?: string;
  temperature?: string;
  low?: string;
  high?: string;
  label?: string;
}[] {
  try {
    const v = JSON.parse(meta(item, key, "[]"));
    return Array.isArray(v)
      ? v
          .filter(
            (x) =>
              x &&
              typeof x === "object" &&
              Object.values(x).every(
                (v) => typeof v === "string" || typeof v === "number",
              ),
          )
          .slice(0, 12)
      : [];
  } catch {
    return [];
  }
}
export function WeatherSkin(p: Props) {
  const [index, setIndex] = useSkinState<number>(p, "city", 0),
    [mode, setMode] = useState("temperature"),
    [sheet, setSheet] = useState(""),
    [query, setQuery] = useState("");
  const item = p.items[index] || p.items[0],
    hourly = listMeta(item, "hourly"),
    daily = listMeta(item, "daily");
  const read = () => {
    if (item) {
      if (p.creator || item.password) p.onItem(item);
      else p.onRead(item.id);
    }
  };
  return (
    <div
      className="catalog-skin native-weather calibrated-weather"
      data-empty={!item}
    >
      <div className="weather-stars" aria-hidden="true" />
      <div className="weather-native-scroll">
        <section className="weather-native-current">
          <small>{item ? meta(item, "locationLabel", "المدن") : "الطقس"}</small>
          <h1>{item?.title || "لم تتم إضافة مدن"}</h1>
          <output>{meta(item, "temperature", "—")}°</output>
          <div className="weather-high-low">
            <span>الأعلى​ {meta(item, "high", "—")}°</span>
            <span>الأدنى​ {meta(item, "low", "—")}°</span>
          </div>
          <p>{meta(item, "condition", "لا توجد بيانات طقس")}</p>
          <MoonStar className="weather-moon-art" size={55} />
        </section>
        <button
          className="weather-native-card weather-air-quality"
          onClick={() => {
            read();
            setSheet("جودة الهواء");
          }}
        >
          <strong>
            {meta(item, "aqi", "—")} · {meta(item, "aqiLabel", "جودة الهواء")}
          </strong>
          <div className="weather-aqi-scale">
            <i
              style={{
                left: Number.isFinite(Number(meta(item, "aqi")))
                  ? Math.max(0, Math.min(95, Number(meta(item, "aqi")) / 5)) +
                    "%"
                  : "0%",
              }}
            />
          </div>
          <p>
            {item?.meta.aqi
              ? `مؤشر جودة الهواء الحالي (CN) = ${item.meta.aqi}.`
              : "لا توجد بيانات جودة هواء"}
          </p>
        </button>
        <section className="weather-native-card weather-hourly">
          <header>
            <div>
              <strong>حالة الطقس</strong>
              <small>
                {mode === "temperature"
                  ? "الحرارة (°C)"
                  : mode === "rain"
                    ? "احتمال المطر"
                    : "سرعة الرياح"}
              </small>
            </div>
            <div className="weather-mode-switch">
              {[
                [Cloud, "temperature"],
                [Droplet, "rain"],
                [Wind, "wind"],
              ].map(([Icon, key]) => {
                const Glyph = Icon as typeof Cloud;
                return (
                  <button
                    aria-label={String(key)}
                    aria-pressed={mode === key}
                    key={String(key)}
                    onClick={() => setMode(String(key))}
                  >
                    <Glyph size={18} />
                  </button>
                );
              })}
            </div>
          </header>
          <div className="weather-hour-grid">
            {Array.from({ length: 6 }, (_, n) => (
              <button
                key={n}
                onClick={() => {
                  read();
                  setSheet("الطقس بالساعة");
                }}
              >
                <strong>
                  {hourly[n]?.time ||
                    ["الآن", "—س", "—س", "—س", "—س", "الشروق"][n]}
                </strong>
                {n === 5 ? (
                  <Sunrise size={28} color="#ffd60a" />
                ) : (
                  <MoonStar size={28} />
                )}
                <span>
                  {n === 5
                    ? meta(item, "sunrise", "—")
                    : mode === "temperature"
                      ? (hourly[n]?.temperature ?? "—") + "°"
                      : mode === "rain"
                        ? meta(item, "rain", "—")
                        : meta(item, "wind", "—")}
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="weather-native-card weather-days">
          {(daily.length
            ? daily
            : [
                {
                  label: "اليوم",
                  low: meta(item, "low", "—"),
                  high: meta(item, "high", "—"),
                },
              ]
          ).map((d, n) => (
            <button
              key={n}
              onClick={() => {
                read();
                setSheet("الطقس اليومي");
              }}
            >
              <strong>{d.label || d.time || "—"}</strong>
              <CloudSun size={23} />
              <span>{d.low || "—"}°</span>
              <i />
              <b>{d.high || "—"}°</b>
            </button>
          ))}
        </section>
      </div>
      <nav className="weather-native-toolbar">
        <button aria-label="خريطة الطقس" onClick={() => setSheet("خريطة الطقس")}>
          <Map size={27} />
        </button>
        <div className="weather-city-dots">
          {p.items.length ? (
            p.items.map((i, n) => (
              <button
                aria-label={"تغيير المدينة" + i.title}
                aria-current={n === index ? "true" : undefined}
                key={i.id}
                onClick={() => {
                  setIndex(n);
                  p.onRead(i.id);
                }}
              />
            ))
          ) : (
            <span />
          )}
        </div>
        <button aria-label="قائمة المدن" onClick={() => setSheet("قائمة المدن")}>
          <List size={29} />
        </button>
      </nav>
      {sheet && (
        <div className="weather-native-sheet">
          <header>
            <button aria-label="رجوع للطقس" onClick={() => setSheet("")}>
              <ChevronLeft />
              الطقس
            </button>
            <strong>{sheet}</strong>
          </header>
          {sheet === "قائمة المدن" ? (
            <>
              <label className="weather-city-search">
                <Search size={18} />
                <input
                  placeholder="بحث عن مدينة"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              {p.items
                .filter((i) => i.title.includes(query))
                .map((i) => (
                  <button
                    className="weather-city-row"
                    key={i.id}
                    onClick={() => {
                      setIndex(p.items.indexOf(i));
                      setSheet("");
                      p.onRead(i.id);
                    }}
                  >
                    <strong>{i.title}</strong>
                    <span>{meta(i, "temperature", "—")}°</span>
                  </button>
                ))}
              {!p.items.length && <p>لا توجد مدن</p>}
              {p.creator && (
                <button onClick={p.onAdd}>
                  <Plus />
                  إضافة مدينة
                </button>
              )}
            </>
          ) : sheet === "خريطة الطقس" ? (
            <div className="weather-map-empty">
              <Map size={60} />
              <p>لا توجد بيانات خريطة</p>
            </div>
          ) : (
            <div className="weather-section-detail">
              <h2>{item?.title || "لا توجد مدن"}</h2>
              <p>
                {sheet === "جودة الهواء"
                  ? meta(item, "aqi", "لا توجد بيانات جودة هواء")
                  : item?.body || "لا توجد سجلات طقس"}
              </p>
              {item && <small>{item.time}</small>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
