import { makeItem, uid, type Work } from "./schema";
import { registry } from "./registry";
export function createWork(title = "قبل أن يتوقف المطر"): Work {
  const w: Work = {
    formatVersion: 1,
    id: uid(),
    title,
    description:
      "جوال سقط في آخر قطار، ورسالة لم تصل.\nقبل أن يتوقف المطر، ابحث عن الشخص الذي لم يحضر الموعد.",
    category: "غموض · دفء",
    cover: "",
    updatedAt: Date.now(),
    phone: {
      owner: "سلمى​",
      passcode: "",
      wallpaper: "sage",
      theme: "light",
      time: "09:41",
      battery: 86,
      network: "5G",
      notifications: true,
    },
    apps: registry.map((a) => ({
      id: a.id,
      name: a.name,
      installed: [
        "appstore",
        "phone",
        "messages",
        "photos",
        "notes",
        "safari",
        "settings",
      ].includes(a.id),
      visible: true,
      dock: ["phone", "messages", "safari", "music"].includes(a.id),
      folder:
        ![
          "appstore",
          "wechat",
          "photos",
          "notes",
          "instagram",
          "whatsapp",
          "mail",
          "calendar",
          "settings",
          "camera",
          "alipay",
          "taobao",
        ].includes(a.id) &&
        !["phone", "messages", "safari", "music"].includes(a.id)
          ? "المزيد من التطبيقات"
          : "",
      icon: "",
    })),
    data: {},
    variables: { found: false },
    nodes: [],
    mode: "mixed",
  };
  for (const a of registry)
    w.data[a.id] = [
      makeItem({
        id: `${a.id}-first`,
        title:
          a.engine === "messaging"
            ? "سلمى"
            : a.engine === "media"
              ? "المدينة بعد المطر"
              : a.engine === "social"
                ? "بانتظار توقف المطر"
                : "يوم من أيام سبتمبر",
        body:
          a.engine === "messaging"
            ? "هل وجدتَ هذا الجوال؟\nلا تستعجل، الدليل في الملاحظات."
            : a.engine === "records"
              ? "1 سبتمبر 2026 · مكتبة الحي القديم\nهذا سجل خيالي من القصة."
              : "كان المطر غزيراً ذلك اليوم، واتفقنا على اللقاء في المكتبة القديمة.\nلكن أحدهم لم يحضر أبداً.",
        kind:
          a.engine === "social"
            ? "post"
            : a.engine === "document"
              ? "note"
              : "text",
        folder: a.tabs[0],
      }),
    ];
  w.data.wechat = [
    makeItem({
      id: "wx1",
      title: "سلمى",
      sender: "سلمى",
      body: "سلمى، هل سقط جوالك في القطار؟",
      time: "2026-09-01 08:30",
    }),
    makeItem({
      id: "wx2",
      title: "سلمى",
      sender: "أنا",
      body: "إن وجده أحد، فليلقِ نظرة على الملاحظات.",
      outgoing: true,
      time: "2026-09-01 08:32",
    }),
    makeItem({
      id: "wx3",
      title: "سلمى",
      sender: "سلمى",
      body: "وهناك صورة، وهي أهم مما تتخيل.",
      time: "2026-09-01 08:34",
    }),
  ];
  w.data.notes = [
    makeItem({
      id: "note-clue",
      title: "إن نسيتُ",
      body: "1 سبتمبر، 16:30. مكتبة الحي القديم.\nخذ تذكرة القطار الخضراء.\n\nإن قرأت هذا النص فقد وجدتَ أول دليل.",
      kind: "note",
      folder: "ملاحظات خاصة",
    }),
    makeItem({
      id: "note-locked",
      title: "إلى نفسي في المستقبل",
      body: "تذكّري، مهما تأخر الوقت هناك من ينتظرك.",
      password: "0901",
      kind: "note",
      folder: "ملاحظات خاصة",
    }),
  ];
  w.data.photos = [
    makeItem({
      id: "photo-ticket",
      title: "تذكرة قديمة",
      body: "آخر قطار إلى الحي القديم. كُتب خلفها: لا تنسَ الموعد.",
      kind: "image",
      hidden: true,
    }),
    makeItem({
      id: "photo-rain",
      title: "المطر خارج النافذة",
      body: "1 سبتمبر 2026 · الحي القديم",
      kind: "image",
    }),
  ];
  w.data.instagram = [
    makeItem({
      id: "ig1",
      sender: "lin.zhixia",
      title: "لا بأس أن تتمهّل.",
      body: "المطر مناسب للمشي وانتظار شخص غاب طويلاً.\n#جولة في المدينة #سبتمبر",
      kind: "post",
      likes: 128,
    }),
  ];
  w.nodes = [
    {
      id: "start",
      label: "جوال ضائع",
      type: "start",
      event: "start",
      target: "",
      conditions: [],
      logic: "and",
      actions: [
        {
          type: "notification",
          key: "",
          value: "سلمى: إن وجدتَ الجوال فاقرأ الملاحظات.",
        },
      ],
      next: [],
      once: true,
      x: 40,
      y: 50,
    },
    {
      id: "clue",
      label: "قراءة الموعد · اكتشاف التذكرة",
      type: "event",
      event: "read",
      target: "note-clue",
      conditions: [],
      logic: "and",
      actions: [
        { type: "clue", key: "ticket", value: true },
        { type: "unlock", key: "photo-ticket", value: true },
        {
          type: "notification",
          key: "",
          value: "يبدو أن صورة جديدة ظهرت في الألبوم.",
        },
      ],
      next: ["decision"],
      once: true,
      x: 340,
      y: 50,
    },
    {
      id: "decision",
      label: "هل تذهب إلى المكتبة القديمة؟",
      type: "choice",
      event: "",
      target: "",
      conditions: [],
      logic: "and",
      actions: [],
      next: ["good", "quiet"],
      once: true,
      x: 640,
      y: 50,
    },
    {
      id: "good",
      label: "الذهاب للموعد · توقف المطر",
      type: "ending",
      event: "",
      target: "",
      conditions: [],
      logic: "and",
      actions: [
        {
          type: "ending",
          key: "",
          value:
            "توقف المطر. سلّمتَ الجوال لمن ينتظر عند المكتبة، وحفظتَ موعد شخص غريب.",
        },
      ],
      next: [],
      once: true,
      x: 940,
      y: 0,
    },
    {
      id: "quiet",
      label: "الانتظار · لطف من نوع آخر",
      type: "ending",
      event: "",
      target: "",
      conditions: [],
      logic: "and",
      actions: [
        {
          type: "ending",
          key: "",
          value: "بقيتَ عند المفقودات، وقبل حلول الظلام وجدك صاحب الجوال.",
        },
      ],
      next: [],
      once: true,
      x: 940,
      y: 180,
    },
  ];
  return w;
}
export function createEmptyWork(): Work {
  const w = createWork("عمل بلا اسم");
  w.description = "";
  w.category = "غير مصنّف";
  w.phone.owner = "صاحبة الجوال";
  w.nodes = [];
  w.variables = {};
  w.data = {};
  for (const a of w.apps) if (a.installed) w.data[a.id] = [];
  return w;
}
