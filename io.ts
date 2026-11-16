import JSZip from "jszip";
import { validateWork, type Work, safeMedia } from "./schema";
const MAX = 100 * 1024 * 1024;
export function download(data: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(data);
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 30000);
}
export function jsonExport(w: Work) {
  download(
    new Blob([JSON.stringify(w, null, 2)], { type: "application/json" }),
    `${w.title}.foundphone.json`,
  );
}
export async function backup(w: Work) {
  const zip = new JSZip();
  zip.file("work.json", JSON.stringify(w, null, 2));
  zip.file(
    "README.txt",
    "FoundPhone Studio نسخة كاملة للعمل. تُحفظ المواد كـ data URL داخل work.json. يمكن استيراد ZIP مباشرة في المحرر. حقوق العمل يقررها كاتبه.",
  );
  download(
    await zip.generateAsync({ type: "blob" }),
    `${w.title}.foundphone.zip`,
  );
}
export async function importWork(file: File) {
  if (file.size > MAX) throw Error("الملف يجب ألا يتجاوز 100 ميجابايت");
  let source: string;
  if (file.name.toLowerCase().endsWith(".zip")) {
    const zip = await JSZip.loadAsync(file);
    let total = 0;
    for (const entry of Object.values(zip.files)) {
      if (
        entry.name.includes("..") ||
        entry.name.startsWith("/") ||
        entry.name.includes("\\") ||
        (entry.unsafeOriginalName && entry.unsafeOriginalName !== entry.name)
      )
        throw Error("ZIP يحتوي مساراً غير آمن");
      const size =
        (entry as unknown as { _data?: { uncompressedSize: number } })._data
          ?.uncompressedSize ?? 0;
      total += size;
      if (total > MAX) throw Error("ZIP حجم الملف بعد الفك كبير جداً");
    }
    const entry = zip.file("work.json");
    if (!entry) throw Error("ZIP ينقصه work.json");
    source = await entry.async("string");
  } else if (file.name.toLowerCase().endsWith(".json"))
    source = await file.text();
  else throw Error("اختر JSON أو ZIP");
  if (source.length > MAX) throw Error("العمل كبير جداً");
  const w = validateWork(JSON.parse(source));
  for (const items of Object.values(w.data))
    for (const item of items)
      if (item.media && !safeMedia(item.media))
        throw Error("العمل يحتوي رابط وسائط غير مدعوم");
  return w;
}
export async function staticExport(w: Work) {
  const zip = new JSZip();
  const manifest = await fetch("./player-runtime/manifest.json").then((r) => {
    if (!r.ok)
      throw Error(
        "شغّل npm run build أولاً ثم npm run preview لتصدير الصفحة المستقلة",
      );
    return r.json() as Promise<string[]>;
  });
  for (const file of manifest) {
    if (file.includes("..")) throw Error("موارد المشغّل غير صالحة");
    const r = await fetch(`./player-runtime/${file}`);
    if (!r.ok) throw Error("موارد المشغّل مفقودة");
    zip.file(file === "player.html" ? "index.html" : file, await r.blob());
  }
  zip.file("work.json", JSON.stringify(w));
  zip.file(
    "DEPLOY.txt",
    "ارفع هذا المجلد إلى GitHub Pages أو Cloudflare Pages أو Vercel أو أي خادم ثابت. لا يشمل المحرر. النقر المزدوج على index.html سيتأثر بقيود أمان المتصفح، فافتحه عبر HTTP(S) للوصول. للمعاينة المحلية: npx serve .\nيرجى الإبقاء على LICENSE وTHIRD_PARTY_LICENSES.txt و BRAND_NOTICE.txt.",
  );
  download(await zip.generateAsync({ type: "blob" }), `${w.title}-player.zip`);
}
export async function mediaData(file: File) {
  if (file.size > 20 * 1024 * 1024) throw Error("الحد الأقصى للمادة 20 ميجابايت");
  if (
    !/^image\/(png|jpeg|webp|gif)$|^audio\/(mpeg|mp3|wav|ogg|webm|mp4)$|^video\/(mp4|webm)$/.test(
      file.type,
    )
  )
    throw Error("يدعم PNG فقط/JPEG/WebP/GIF، الصوتيات الشائعة، MP4/WebM");
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  if (!file.type.startsWith("image/") || file.type === "image/gif") return data;
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ratio = Math.min(1, 1600 / Math.max(img.width, img.height));
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      canvas
        .getContext("2d")
        ?.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/webp", 0.85));
    };
    img.onerror = reject;
    img.src = data;
  });
}
