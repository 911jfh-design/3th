import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List } from "lucide-react";
import type { Item } from "./schema";
import { parseRichText } from "./RichText";
export default function RichEditor({
  item,
  onChange,
}: {
  item: Item;
  onChange: (patch: Pick<Item, "body" | "richText">) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content:
      parseRichText(item.richText) ??
      `<p>${item.body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "</p><p>")}</p>`,
    onUpdate: ({ editor }) =>
      onChange({
        body: editor.getText({ blockSeparator: "\n" }),
        richText: JSON.stringify(editor.getJSON()),
      }),
  });
  return (
    <>
      <div className="rich-toolbar">
        <button
          type="button"
          title="عريض"
          aria-label="عريض"
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          title="مائل"
          aria-label="مائل"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic size={15} />
        </button>
        <button
          type="button"
          title="قائمة"
          aria-label="قائمة"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List size={15} />
        </button>
        <small>يدعم العريض والمائل والقوائم</small>
      </div>
      <EditorContent editor={editor} />
    </>
  );
}
