import { makeItem, type Item } from "./schema";
export function parseChat(text: string): { items: Item[]; errors: string[] } {
  const errors: string[] = [];
  const items: Item[] = [];
  text.split(/\r?\n/).forEach((line, index) => {
    if (!line.trim()) return;
    const match = line.match(/^\[([^\]]+)\]\s*([^: :]+)[: :]\s*(.+)$/);
    if (!match) {
      errors.push(`رقم ${index + 1} السطر: المتوقع [الوقت] المرسل: الرسالة`);
      return;
    }
    const [, time, sender, body] = match;
    items.push(
      makeItem({
        title: sender.trim() === "أنا" ? "سلمى" : sender.trim(),
        sender: sender.trim(),
        body,
        time,
        outgoing: sender.trim() === "أنا",
      }),
    );
  });
  return { items, errors };
}
export function parseCsv(text: string): { items: Item[]; errors: string[] } {
  const rows: string[][] = [];
  let row: string[] = [],
    field = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(field);
      field = "";
    } else if (c === "\n" && !quoted) {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  row.push(field);
  if (row.some(Boolean)) rows.push(row);
  if (quoted) return { items: [], errors: ["CSV علامة الاقتباس غير مغلقة"] };
  const header = rows.shift()?.map((s) => s.trim()) ?? [];
  const indexes = ["time", "sender", "body"].map((k) => header.indexOf(k));
  if (indexes.includes(-1))
    return { items: [], errors: ["CSV يجب أن يحتوي على time,sender,body أعمدة"] };
  return {
    items: rows.map((r) =>
      makeItem({
        time: r[indexes[0]] ?? "",
        sender: r[indexes[1]] ?? "",
        title: r[indexes[1]] ?? "",
        body: r[indexes[2]] ?? "",
        outgoing: r[indexes[1]] === "أنا",
      }),
    ),
    errors: [],
  };
}
