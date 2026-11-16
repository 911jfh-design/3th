export type Field = { key: string; label: string; type?: "number" | "text" };
const fields: Record<string, Field[]> = {
  phone: [
    { key: "number", label: "رقم الهاتف" },
    { key: "status", label: "حالة المكالمة" },
  ],
  contacts: [
    { key: "number", label: "الهاتف" },
    { key: "email", label: "البريد الإلكتروني" },
    { key: "company", label: "الشركة" },
  ],
  calendar: [
    { key: "location", label: "الأماكن" },
    { key: "duration", label: "المدة​" },
  ],
  clock: [
    { key: "city", label: "المدن" },
    { key: "clock", label: "الوقت المعروض" },
  ],
  maps: [
    { key: "address", label: "العنوان​" },
    { key: "x", label: "إحداثي الخريطة الأفقي(0–100)", type: "number" },
    { key: "y", label: "إحداثي الخريطة الرأسي(0–100)", type: "number" },
  ],
  weather: [
    { key: "temperature", label: "الحرارة", type: "number" },
    { key: "condition", label: "حالة الطقس" },
    { key: "high", label: "الأعلى", type: "number" },
    { key: "low", label: "الأدنى", type: "number" },
    { key: "humidity", label: "الرطوبة" },
  ],
  wallet: [
    { key: "amount", label: "المبلغ" },
    { key: "status", label: "حالة المعاملة" },
    { key: "number", label: "آخر أرقام البطاقة" },
  ],
  health: [
    { key: "value", label: "القيمة", type: "number" },
    { key: "unit", label: "الوحدة" },
    { key: "metric", label: "اسم المؤشر" },
  ],
  find: [
    { key: "location", label: "الموقع" },
    { key: "status", label: "حالة الجهاز" },
    { key: "x", label: "الإحداثي الأفقي", type: "number" },
    { key: "y", label: "الإحداثي الرأسي", type: "number" },
  ],
  safari: [{ key: "url", label: "رابط خيالي" }],
  files: [
    { key: "extension", label: "امتداد الملف" },
    { key: "size", label: "حجم الملف" },
  ],
  mail: [
    { key: "email", label: "عنوان المرسل" },
    { key: "recipient", label: "المستلم" },
  ],
  discord: [
    { key: "server", label: "اسم الخادم" },
    { key: "status", label: "حالة العضو" },
  ],
  qq: [{ key: "number", label: "QQالرقم" }],
  telegram: [{ key: "handle", label: "اسم المستخدم" }],
  alipay: [
    { key: "amount", label: "المبلغ" },
    { key: "status", label: "حالة المعاملة" },
    { key: "merchant", label: "المتاجر" },
    { key: "number", label: "رقم المعاملة" },
  ],
  taobao: [
    { key: "price", label: "السعر" },
    { key: "status", label: "حالة الطلب" },
    { key: "tracking", label: "تقدّم الشحن" },
    { key: "number", label: "رقم الطلب" },
  ],
  delivery: [
    { key: "price", label: "المبلغ" },
    { key: "status", label: "حالة التوصيل" },
    { key: "address", label: "عنوان التوصيل" },
    { key: "duration", label: "مدة التوصيل" },
    { key: "rating", label: "التقييم" },
  ],
  reddit: [
    { key: "community", label: "اسم المجتمع" },
    { key: "votes", label: "عدد الأصوات", type: "number" },
  ],
  forum: [
    { key: "views", label: "عدد المشاهدات​", type: "number" },
    { key: "status", label: "حالة المنشور" },
  ],
  twitter: [
    { key: "handle", label: "اسم المستخدم" },
    { key: "reposts", label: "عدد إعادة النشر", type: "number" },
  ],
  weibo: [{ key: "reposts", label: "عدد إعادة النشر", type: "number" }],
  netflix: [
    { key: "genre", label: "النوع" },
    { key: "duration", label: "المدة" },
    { key: "year", label: "السنة" },
  ],
  spotify: [
    { key: "album", label: "الألبوم" },
    { key: "duration", label: "المدة" },
  ],
  music: [
    { key: "album", label: "الألبوم" },
    { key: "duration", label: "المدة" },
  ],
  netease: [
    { key: "album", label: "الألبوم" },
    { key: "duration", label: "المدة" },
  ],
  youtube: [
    { key: "views", label: "عدد المشاهدات" },
    { key: "duration", label: "المدة" },
  ],
  bilibili: [
    { key: "views", label: "عدد المشاهدات" },
    { key: "duration", label: "المدة" },
  ],
  douyin: [{ key: "views", label: "عدد المشاهدات" }],
  tiktok: [{ key: "views", label: "عدد المشاهدات" }],
};
export const getFields = (app: string) => fields[app] ?? [];
