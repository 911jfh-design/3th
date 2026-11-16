import { useState, type ComponentType } from "react";
import {
  Plane,
  Wifi,
  Bluetooth,
  Signal,
  Battery,
  Settings,
  Accessibility,
  Image,
  Bell,
  Volume2,
  Moon,
  Shield,
  ChevronRight,
  Search,
  Check,
  Link,
  Globe,
  Mic,
} from "lucide-react";
import type { Work, Item } from "../schema";
import { IOSToggle } from "../vendor/konsta/Toggle";
import { NavigationPage, useNavigation } from "./Navigation";
type Row = [ComponentType<{ size?: number }>, string, string];
const groups: Row[][] = [
  [
    [Plane, "وضع الطيران", "#ff9500"],
    [Wifi, "الواي فاي", "#007aff"],
    [Bluetooth, "بلوتوث", "#007aff"],
    [Signal, "بيانات الجوال", "#34c759"],
    [Link, "نقطة الاتصال", "#65ce88"],
    [Battery, "البطارية", "#34c759"],
    [Globe, "VPN", "#007aff"],
  ],
  [
    [Settings, "عام", "#8e8e93"],
    [Accessibility, "إمكانية الوصول", "#007aff"],
    [Image, "الخلفية​", "#32ade6"],
  ],
  [
    [Bell, "الإشعارات", "#ff3b30"],
    [Volume2, "الأصوات واللمس", "#ff2d55"],
    [Moon, "وضع التركيز", "#5856d6"],
    [Shield, "بصمة الوجه والرمز", "#34c759"],
  ],
];
export function NativeSettings({
  work,
  items,
  creator,
  onItem,
  onSettings,
}: {
  work: Work;
  items: Item[];
  creator: boolean;
  onItem: (i: Item) => void;
  onSettings?: () => void;
}) {
  const nav = useNavigation(),
    [query, setQuery] = useState(""),
    [airplane, setAirplane] = useState(false),
    [wifi, setWifi] = useState(true),
    [bluetooth, setBluetooth] = useState(true),
    [lowPower, setLowPower] = useState(false);
  const row = (label: string, value?: string, click?: () => void) => (
    <button key={label} className="settings-native-row" onClick={click}>
      <span>{label}</span>
      <span className="settings-detail-value">{value}</span>
      {click && <ChevronRight size={16} />}
    </button>
  );
  const toggle = (label: string, value: boolean, set: (v: boolean) => void) => (
    <div className="settings-native-row">
      <span>{label}</span>
      <IOSToggle label={label} checked={value} onChange={set} />
    </div>
  );
  const sub = () => {
    switch (nav.page) {
      case "عام":
        return (
          <div className="settings-group">
            {row("عن الجهاز", "", () => nav.push("عن الجهاز"))}
            {row("تحديث البرنامج", "iOS 18.0", () => nav.push("تحديث البرنامج"))}
            {row("iPhone مساحة التخزين", "", () => nav.push("iPhone مساحة التخزين"))}
            {row("التاريخ والوقت", "", () => nav.push("التاريخ والوقت"))}
            {row("اللغة والمنطقة", "العربية", () => nav.push("اللغة والمنطقة"))}
          </div>
        );
      case "عن الجهاز":
        return (
          <div className="settings-group">
            {row("الاسم", work.phone.owner + "آيفون")}
            {row("iOS الإصدار", "18.0")}
            {row("اسم الطراز", "iPhone 15 Pro")}
            {row("الصور", String(work.data.photos?.length || 0))}
            {row(
              "التطبيقات",
              String(work.apps.filter((a) => a.installed).length),
            )}
          </div>
        );
      case "Wi-Fi":
      case "الواي فاي":
        return (
          <>
            <div className="settings-group">
              {toggle("Wi-Fi", wifi, setWifi)}
            </div>
            {wifi && (
              <>
                <p className="settings-section-label">شبكتي</p>
                <div className="settings-group">
                  <div className="settings-native-row">
                    <Check size={18} color="#007aff" />
                    <span>{work.phone.network}</span>
                    <Wifi size={18} />
                  </div>
                </div>
                <p className="settings-page-caption">
                  حالة الاتصال خاصة بالجوال الافتراضي في العمل.
                </p>
              </>
            )}
          </>
        );
      case "بلوتوث":
        return (
          <>
            <div className="settings-group">
              {toggle("بلوتوث", bluetooth, setBluetooth)}
            </div>
            <p className="settings-page-caption">
              {bluetooth ? "أجهزتي" : "البلوتوث مغلق"}
            </p>
          </>
        );
      case "البطارية":
        return (
          <>
            <div className="settings-group">
              {row("مستوى البطارية", work.phone.battery + "%")}
              {toggle("وضع الطاقة المنخفضة", lowPower, setLowPower)}
            </div>
            <p className="settings-page-caption">
              وضع الطاقة المنخفضة يغيّر حالة الجهاز الافتراضي فقط.
            </p>
          </>
        );
      case "التاريخ والوقت":
        return (
          <div className="settings-group">
            {row("التاريخ​", work.phone.date || "2026-09-01")}
            {row("الوقت", work.phone.time)}
            {row("المنطقة الزمنية", "توقيت الرياض")}
          </div>
        );
      case "iPhone مساحة التخزين":
        return (
          <div className="settings-group">
            {work.apps
              .filter((a) => a.installed)
              .map((a) => row(a.name, `${work.data[a.id]?.length || 0} عنصر`))}
          </div>
        );
      case "تحديث البرنامج":
        return (
          <p className="settings-page-caption">
            iOS 18.0 · هذا نظام افتراضي داخل العمل ولا يُنزَّل له تحديث.
          </p>
        );
      default:
        return (
          <>
            <div className="settings-group">
              {row(
                nav.page,
                nav.page === "بصمة الوجه والرمز"
                  ? work.phone.passcode
                    ? "الرمز مضبوط"
                    : "لا يوجد رمز"
                  : "",
              )}
            </div>
            {!items.some((i) => i.folder === nav.page) && (
              <p className="settings-page-caption">لا توجد خيارات أخرى لهذا العمل.</p>
            )}
          </>
        );
    }
  };
  return (
    <div className="native-settings" data-root={!nav.page}>
      <NavigationPage
        page={nav.page}
        back={nav.pop}
        title={nav.depth > 1 ? "عام" : "الإعدادات"}
      >
        {nav.page ? (
          sub()
        ) : (
          <>
            <h1>الإعدادات</h1>
            {!query && (
              <button
                className="settings-account"
                onClick={() => nav.push(work.phone.owner)}
              >
                <span>{work.phone.owner.slice(0, 1)}</span>
                <div>
                  <strong>{work.phone.owner}</strong>
                  <small>Apple الحساب وiCloud والمزيد</small>
                </div>
                <ChevronRight size={17} />
              </button>
            )}
            {groups.map((group, n) => (
              <div className="settings-group" key={n}>
                {group
                  .filter(([, name]) => name.includes(query))
                  .map(([Icon, name, color]) => (
                    <div
                      key={name}
                      className="settings-native-row"
                      role={name === "وضع الطيران" ? undefined : "button"}
                      tabIndex={name === "وضع الطيران" ? undefined : 0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") nav.push(name);
                      }}
                      onClick={() => {
                        if (name !== "وضع الطيران") nav.push(name);
                      }}
                    >
                      <span
                        className="settings-glyph"
                        style={{ background: color }}
                      >
                        <Icon size={21} />
                      </span>
                      <span>{name}</span>
                      {name === "وضع الطيران" ? (
                        <IOSToggle
                          label="وضع الطيران"
                          checked={airplane}
                          onChange={setAirplane}
                        />
                      ) : (
                        <>
                          <small>
                            {name === "الواي فاي"
                              ? wifi
                                ? "غير متصل"
                                : "إغلاق"
                              : name === "بلوتوث"
                                ? bluetooth
                                  ? "فتح"
                                  : "إغلاق"
                                : name === "VPN"
                                  ? "غير متصل"
                                  : name === "بيانات الجوال" || name === "نقطة الاتصال"
                                    ? "إغلاق"
                                    : ""}
                          </small>
                          <ChevronRight size={16} />
                        </>
                      )}
                    </div>
                  ))}
              </div>
            ))}
          </>
        )}
        {items
          .filter(
            (i) =>
              !nav.page || i.folder === nav.page || i.title.includes(nav.page),
          )
          .map((i) => (
            <button className="record-row" key={i.id} onClick={() => onItem(i)}>
              {i.title}
              <ChevronRight size={16} />
            </button>
          ))}
        {creator && (
          <button className="phone-add" onClick={onSettings}>
            تعديل إعدادات النظام
          </button>
        )}
      </NavigationPage>
      {!nav.page && (
        <label className="settings-search">
          <Search size={23} />
          <input
            aria-label="بحث في الإعدادات"
            placeholder="بحث"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Mic size={22} aria-hidden="true" />
        </label>
      )}
    </div>
  );
}
