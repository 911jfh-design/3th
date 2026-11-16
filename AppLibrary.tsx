import { useRef, useState } from "react";
import {
  GripVertical,
  Search,
  Plus,
  Check,
  ArrowUp,
  ArrowDown,
  FolderPlus,
  Trash2,
  Download,
  Smartphone,
} from "lucide-react";
import { Modal } from "./Editors";
import { AppIcon } from "./Phone";
import { registry, getApp } from "./registry";
import { type Work } from "./schema";
import {
  category,
  installApp,
  removeFromHome,
  uninstallApp,
  moveApp,
  newCustomApp,
} from "./apps";
import { mediaData } from "./io";
export function AppManager({
  work,
  onChange,
  onClose,
}: {
  work: Work;
  onChange: (fn: (w: Work) => void) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState(""),
    [group, setGroup] = useState("الكل"),
    [status, setStatus] = useState("الكل"),
    [selected, setSelected] = useState(""),
    [uninstall, setUninstall] = useState(""),
    [keep, setKeep] = useState(true),
    [folder, setFolder] = useState(""),
    [folderApps, setFolderApps] = useState<string[]>([]),
    [showFolder, setShowFolder] = useState(false),
    [customName, setCustomName] = useState(""),
    [error, setError] = useState(""),
    [dragging, setDragging] = useState("");
  const drag = useRef("");
  const catalog = [
    ...work.apps,
    ...registry
      .filter((r) => !work.apps.some((a) => a.id === r.id))
      .map((a) => ({
        id: a.id,
        name: a.name,
        installed: false,
        visible: false,
        dock: false,
        folder: "",
        icon: "",
      })),
  ];
  const filtered = catalog.filter(
    (a) =>
      (a.name + getApp(a.id).name)
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (group === "الكل" || category(a.id) === group) &&
      (status === "الكل" || (status === "مثبّت" ? a.installed : !a.installed)),
  );
  const current = work.apps.find((a) => a.id === selected);
  const update = (patch: Partial<Work["apps"][number]>) =>
    onChange((w) => {
      const a = w.apps.find((a) => a.id === selected);
      if (a) Object.assign(a, patch);
    });
  const drop = (target: string) => {
    if (drag.current && target && target !== drag.current)
      onChange((w) => moveApp(w, drag.current, target));
    drag.current = "";
    setDragging("");
  };
  return (
    <>
      <Modal title="App المكتبة" onClose={onClose} wide>
        <div className="app-library">
          <div className="library-controls">
            <label className="library-search">
              <Search size={16} />
              <input
                aria-label="ابحث عن تطبيق"
                placeholder="ابحث عن تطبيق"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <select
              aria-label="App التصنيفات"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            >
              {[
                "الكل",
                "النظام",
                "التواصل",
                "اجتماعي",
                "ترفيه",
                "الحياة",
                "الأدوات",
                "تخصيص",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              aria-label="تصفية المثبّت"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {["الكل", "مثبّت", "غير مثبّت"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <button
              className="secondary"
              onClick={() => setShowFolder(!showFolder)}
            >
              <FolderPlus size={15} />
              إنشاء مجلد
            </button>
          </div>
          {showFolder && (
            <section className="folder-builder">
              <label>
                اسم المجلد
                <input
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  placeholder="اسم المجلد"
                />
              </label>
              <div className="folder-app-picks">
                {work.apps
                  .filter((a) => a.installed)
                  .map((a) => (
                    <label key={a.id}>
                      <input
                        type="checkbox"
                        checked={folderApps.includes(a.id)}
                        onChange={(e) =>
                          setFolderApps(
                            e.target.checked
                              ? [...folderApps, a.id]
                              : folderApps.filter((id) => id !== a.id),
                          )
                        }
                      />
                      {a.name}
                    </label>
                  ))}
              </div>
              <button
                className="primary"
                disabled={!folder.trim() || !folderApps.length}
                onClick={() => {
                  onChange((w) => {
                    for (const a of w.apps)
                      if (folderApps.includes(a.id)) {
                        a.folder = folder.trim();
                        a.visible = true;
                        a.dock = false;
                      }
                  });
                  setShowFolder(false);
                  setFolderApps([]);
                }}
              >
                حفظ المجلد
              </button>
            </section>
          )}
          <div className="library-layout">
            <div className="library-catalog" aria-label="App الفهرس">
              {filtered.map((a) => (
                <article
                  key={a.id}
                  data-app-id={a.id}
                  className={`library-app ${a.id === selected ? "selected" : ""} ${dragging === a.id ? "dragging" : ""}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    drop(a.id);
                  }}
                >
                  <div className="library-app-main">
                    <button
                      className="drag-grip"
                      aria-label={`اسحب${a.name}ترتيب`}
                      disabled={!a.installed}
                      draggable={false}
                      onDragStart={(e) => {
                        drag.current = a.id;
                        setDragging(a.id);
                        e.dataTransfer.setData("text/plain", a.id);
                      }}
                      onDragEnd={() => {
                        drag.current = "";
                        setDragging("");
                      }}
                      onPointerDown={(e) => {
                        if (!a.installed) return;
                        e.preventDefault();
                        drag.current = a.id;
                        setDragging(a.id);
                        e.currentTarget.setPointerCapture(e.pointerId);
                      }}
                      onPointerUp={(e) => {
                        const row = document
                          .elementFromPoint(e.clientX, e.clientY)
                          ?.closest<HTMLElement>("[data-app-id]");
                        drop(row?.dataset.appId ?? "");
                      }}
                      onPointerCancel={() => {
                        drag.current = "";
                        setDragging("");
                      }}
                    >
                      <GripVertical size={15} />
                    </button>
                    <button
                      className="library-app-select"
                      onClick={() => setSelected(a.id)}
                    >
                      <AppIcon id={a.id} custom={a.icon} small />
                      <span>
                        <strong>{a.name}</strong>
                        <small>
                          {category(a.id)} ·{" "}
                          {a.installed
                            ? a.visible
                              ? "مثبّت"
                              : "مكتبة التطبيقات فقط"
                            : "غير مثبّت"}
                        </small>
                      </span>
                    </button>
                    {a.installed ? (
                      <button
                        className="library-configure"
                        onClick={() => setSelected(a.id)}
                      >
                        إدارة
                      </button>
                    ) : (
                      <button
                        className="library-install"
                        aria-label={`تثبيت${a.name}`}
                        onClick={() => {
                          onChange((w) => installApp(w, a.id));
                          setSelected(a.id);
                        }}
                      >
                        <Download size={14} />
                        تثبيت
                      </button>
                    )}
                  </div>
                  {a.installed && (
                    <div className="library-app-actions">
                      <button
                        aria-label={`للأعلى${a.name}`}
                        onClick={() => {
                          const i = work.apps.indexOf(a);
                          if (i > 0)
                            onChange((w) => moveApp(w, a.id, w.apps[i - 1].id));
                        }}
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        aria-label={`للأسفل${a.name}`}
                        onClick={() => {
                          const i = work.apps.indexOf(a);
                          if (i < work.apps.length - 1)
                            onChange((w) => moveApp(w, a.id, w.apps[i + 1].id));
                        }}
                      >
                        <ArrowDown size={12} />
                      </button>
                      <button
                        aria-label={`${a.visible ? "إزالة من الشاشة الرئيسية" : "إضافة للشاشة الرئيسية"}${a.name}`}
                        onClick={() =>
                          onChange((w) => {
                            if (a.visible) removeFromHome(w, a.id);
                            else {
                              const x = w.apps.find((x) => x.id === a.id);
                              if (x) x.visible = true;
                            }
                          })
                        }
                      >
                        <Smartphone size={12} />
                        {a.visible ? "إزالة من الشاشة الرئيسية" : "إضافة للشاشة الرئيسية"}
                      </button>
                      <button
                        className="danger"
                        aria-label={`إزالة${a.name}`}
                        onClick={() => {
                          setUninstall(a.id);
                          setKeep(true);
                        }}
                      >
                        <Trash2 size={12} />
                        إزالة
                      </button>
                    </div>
                  )}
                </article>
              ))}
              {!filtered.length && (
                <p className="library-empty">لا توجد تطبيقات مطابقة</p>
              )}
            </div>
            <aside className="app-properties">
              {current?.installed ? (
                <>
                  <h3>{current.name}</h3>
                  <label>
                    App الاسم
                    <input
                      aria-label="اسم التطبيق"
                      value={current.name}
                      onChange={(e) => update({ name: e.target.value })}
                    />
                  </label>
                  <label>
                    نص الأيقونة​
                    <input
                      aria-label="نص الأيقونة"
                      maxLength={4}
                      value={
                        current.icon.startsWith("data:") ? "" : current.icon
                      }
                      placeholder="استخدام الأيقونة الافتراضية"
                      onChange={(e) => update({ icon: e.target.value })}
                    />
                  </label>
                  <label className="icon-upload">
                    رفع أيقونة
                    <input
                      aria-label="رفع أيقونة التطبيق"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f)
                          try {
                            update({ icon: await mediaData(f) });
                          } catch (err) {
                            setError(String(err));
                          }
                      }}
                    />
                  </label>
                  {current.icon && (
                    <button
                      className="text-button"
                      onClick={() => update({ icon: "" })}
                    >
                      استعادة الأيقونة
                    </button>
                  )}
                  <label>
                    المجلد
                    <input
                      aria-label="App المجلد"
                      value={current.folder}
                      placeholder="اتركه فارغاً ليبقى على الشاشة"
                      onChange={(e) =>
                        update({
                          folder: e.target.value,
                          dock: false,
                          visible: true,
                        })
                      }
                    />
                  </label>
                  <label className="inline-check">
                    <input
                      type="checkbox"
                      checked={current.dock}
                      onChange={(e) => {
                        if (
                          e.target.checked &&
                          work.apps.filter(
                            (a) => a.installed && a.visible && a.dock,
                          ).length >= 4
                        ) {
                          setError("Dock 4 تطبيقات كحد أقصى​");
                          return;
                        }
                        update({
                          dock: e.target.checked,
                          visible: true,
                          folder: "",
                        });
                      }}
                    />
                    إضافة إلى الشريط السفلي
                  </label>
                  <small>
                    {(work.data[current.id] ?? []).length} عنصر محتوى
                  </small>
                </>
              ) : (
                <p>اختر تطبيقاً مثبّتاً لتعديل اسمه وأيقونته ومجلده.</p>
              )}
              <div className="custom-app-form">
                <label>
                  تطبيق مخصص
                  <input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="App الاسم"
                  />
                </label>
                <button
                  className="secondary"
                  disabled={!customName.trim()}
                  onClick={() => {
                    onChange((w) => {
                      setSelected(newCustomApp(w, customName.trim()));
                    });
                    setCustomName("");
                  }}
                >
                  <Plus size={14} />
                  إضافة تطبيق
                </button>
              </div>
            </aside>
          </div>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
        </div>
        <footer>
          <span>
            {work.apps.filter((a) => a.installed).length} مثبّت · اسحب المقبض للترتيب
          </span>
          <button className="primary" onClick={onClose}>
            <Check size={14} />
            تم
          </button>
        </footer>
      </Modal>
      {uninstall && (
        <Modal
          title={`إزالة${catalog.find((a) => a.id === uninstall)?.name}؟`}
          onClose={() => setUninstall("")}
        >
          <div className="editor-fields">
            <p>بعد الإزالة سيُحذف من الجوال ومكتبة التطبيقات.</p>
            <label className="inline-check">
              <input
                type="checkbox"
                checked={keep}
                onChange={(e) => setKeep(e.target.checked)}
              />
              يبقى المحتوى ويعود عند إعادة التثبيت
            </label>
            {!keep && (
              <p className="error">
                سيُحذف كل محتوى هذا التطبيق، وقد تتعطل أجزاء القصة المرتبطة به.
              </p>
            )}
          </div>
          <footer>
            <button className="secondary" onClick={() => setUninstall("")}>
              إلغاء
            </button>
            <button
              className="primary danger-bg"
              onClick={() => {
                onChange((w) => uninstallApp(w, uninstall, keep));
                setUninstall("");
              }}
            >
              تأكيد الإزالة{keep ? "مع الاحتفاظ بالبيانات" : "مع حذف البيانات"}
            </button>
          </footer>
        </Modal>
      )}
    </>
  );
}
