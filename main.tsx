import { AppManager } from "./AppLibrary";
import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import {
  Smartphone,
  LayoutGrid,
  GitBranch,
  FolderOpen,
  Settings2,
  Undo2,
  Redo2,
  Play,
  Download,
  Plus,
  ChevronDown,
  ArrowUpRight,
  Check,
  BookOpen,
  Upload,
  FileJson,
  Package,
  Globe,
  Copy,
  Trash2,
  ChevronRight,
  PanelRightClose,
  ShieldCheck,
  Info,
} from "lucide-react";
import { useStudio } from "./store";
import { Phone } from "./Phone";
import { getApp } from "./registry";
import {
  makeItem,
  initialRuntime,
  type Work,
  type Item,
  type Runtime,
} from "./schema";
import { ItemEditor, PhoneSettings, BatchImport, Modal } from "./Editors";
import { jsonExport, backup, staticExport, importWork, mediaData } from "./io";
import { dispatch } from "./engine";
import "./styles.css";
const StoryEditor = lazy(() =>
  import("./StoryEditor").then((m) => ({ default: m.StoryEditor })),
);
function Studio() {
  const store = useStudio();
  const { work, works, change } = store;
  const [view, setView] = useState("phone");
  const [app, setApp] = useState("messages");
  const [editing, setEditing] = useState<{ app: string; item: Item } | null>(
    null,
  );
  const [modal, setModal] = useState("");
  const [preview, setPreview] = useState<Work | null>(null);
  const [runtime, setRuntime] = useState<Runtime | undefined>();
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState("");
  const [busy, setBusy] = useState(false);
  const [side, setSide] = useState(true);
  const [phoneKey, setPhoneKey] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    void useStudio.getState().load();
    const handler = () => {
      void useStudio.getState().flush();
    };
    window.addEventListener("pagehide", handler);
    return () => window.removeEventListener("pagehide", handler);
  }, []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        void useStudio.getState().flush();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "z" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        if (e.shiftKey) useStudio.getState().redo();
        else useStudio.getState().undo();
      }
      if (e.key === "Escape") {
        setModal("");
        setEditing(null);
        setPreview(null);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
  const run = async (fn: () => Promise<unknown>, message: string) => {
    setBusy(true);
    try {
      await fn();
      setNotice(message);
    } catch (e) {
      setNotice(String(e));
    } finally {
      setBusy(false);
    }
  };
  if (!work)
    return (
      <div className="boot">
        <Smartphone size={40} />
        <h1>جوال ملقوط</h1>
        <p>{store.error || "جارٍ فتح استوديو قصتك…"}</p>
      </div>
    );
  const count = Object.values(work.data).reduce(
    (n, items) => n + items.length,
    0,
  );
  const items = (work.data[app] ?? []).filter((i) =>
    (i.title + i.body).includes(search),
  );
  const startPreview = () => {
    const snapshot = structuredClone(work);
    setPreview(snapshot);
    setRuntime(dispatch(snapshot, initialRuntime(snapshot), "start"));
  };
  const edit = (app: string, item: Item) => {
    setApp(app);
    setEditing({ app, item });
  };
  const add = (app: string) =>
    edit(
      app,
      makeItem({
        title: getApp(app).engine === "messaging" ? "سلمى" : "مقطع قصة جديد",
        folder: getApp(app).tabs[0],
      }),
    );
  return (
    <div className="studio">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="FoundPhone الرئيسية">
          <span className="brand-mark">
            <Smartphone size={25} />
          </span>
          <span>
            جوال ملقوط<small>FOUNDPHONE STUDIO</small>
          </span>
        </a>
        <div className="workspace-label">
          مساحة الكتابة <span>LOCAL</span>
        </div>
        <nav>
          {[
            { id: "phone", icon: Smartphone, label: "إنشاء الجوال" },
            { id: "story", icon: GitBranch, label: "ترتيب القصة" },
            { id: "assets", icon: FolderOpen, label: "المواد والمحتوى" },
            { id: "works", icon: LayoutGrid, label: "أعمالي" },
          ].map((t) => (
            <button
              key={t.id}
              className={view === t.id ? "active" : ""}
              onClick={() => setView(t.id)}
            >
              <t.icon size={18} />
              {t.label}
              {view === t.id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-divider" />
        <div className="section-label">
          <span>العمل الحالي</span>
          <button aria-label="عمل جديد" onClick={() => void store.add()}>
            <Plus size={15} />
          </button>
        </div>
        <button className="current-work" onClick={() => setView("works")}>
          <div className="work-thumb">
            <span>مطر</span>
          </div>
          <div>
            <strong>{work.title}</strong>
            <small>{work.category}</small>
          </div>
          <ChevronRight size={13} />
        </button>

        <div className="sidebar-bottom">
          <button onClick={() => setModal("guide")}>
            <BookOpen size={17} />
            دليل الكتابة <ArrowUpRight size={13} />
          </button>
          <button onClick={() => setModal("about")}>
            <Info size={17} />
            عن جوال ملقوط
          </button>
          <div className="local-status">
            <span />
            محلي أولاً · بدون تسجيل دخول
          </div>
        </div>
      </aside>
      <div className="main-workspace">
        <header className="topbar">
          <div className="breadcrumb">
            مساحة الكتابة <ChevronRight size={13} />
            <button onClick={() => setModal("metadata")}>
              {work.title}
              <ChevronDown size={13} />
            </button>
            <span className="draft-badge">المسودات</span>
          </div>
          <div className="topbar-actions">
            <button
              className={`save-status ${store.error ? "error" : ""}`}
              onClick={() => void store.flush()}
            >
              <span className="save-dot" />
              {store.status}
            </button>
            <span className="toolbar-divider" />
            <button
              aria-label="تراجع"
              disabled={!store.past.length}
              onClick={store.undo}
            >
              <Undo2 size={17} />
            </button>
            <button
              aria-label="إعادة"
              disabled={!store.future.length}
              onClick={store.redo}
            >
              <Redo2 size={17} />
            </button>
            <button className="secondary compact" onClick={startPreview}>
              <Play size={14} />
              معاينة
            </button>
            <button
              className="primary compact"
              onClick={() => setModal("export")}
            >
              <Download size={14} />
              تصدير العمل
            </button>
          </div>
        </header>
        {view === "story" ? (
          <Suspense fallback={<div className="boot">جارٍ تحميل محرر القصة…</div>}>
            <StoryEditor work={work} onChange={change} />
          </Suspense>
        ) : view === "works" ? (
          <div className="library-page">
            <div className="page-title">
              <div>
                <h1>
                  أعمالي<span> {works.length}</span>
                </h1>
              </div>
              <button className="primary" onClick={() => void store.add()}>
                <Plus size={16} />
                عمل جديد
              </button>
            </div>
            <div className="works-grid">
              {works.map((w) => (
                <article className="work-card" key={w.id}>
                  <button
                    className={`work-cover wallpaper-${w.phone.wallpaper}`}
                    onClick={() => {
                      store.select(w.id);
                      setPhoneKey((k) => k + 1);
                      setView("phone");
                    }}
                  >
                    {w.cover ? (
                      <img src={w.cover} alt={w.title} />
                    ) : (
                      <>
                        <small>FOUND PHONE STORY</small>
                        <h2>{w.title}</h2>
                        <span>{w.phone.owner} جوال</span>
                      </>
                    )}
                  </button>
                  <div className="work-card-meta">
                    <h3>{w.title}</h3>
                    <p>
                      {w.category} ·{" "}
                      {new Date(w.updatedAt).toLocaleDateString("ar-SA-u-ca-gregory-nu-latn")}
                    </p>
                    <div>
                      <button
                        onClick={() => {
                          store.select(w.id);
                          setModal("metadata");
                        }}
                      >
                        تعديل المعلومات
                      </button>
                      <button
                        aria-label={`نسخ${w.title}`}
                        onClick={() =>
                          void store.add({ ...w, title: `${w.title} نسخة` })
                        }
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        aria-label={`حذف${w.title}`}
                        className="danger"
                        onClick={() => setConfirmDelete(w.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              <button
                className="import-work-card"
                onClick={() => input.current?.click()}
              >
                <Upload size={26} />
                <strong>استيراد عمل</strong>
                <span>JSON أو حزمة ZIP</span>
              </button>
            </div>
            <p className="storage-note">
              مسح بيانات المتصفح يحذف المسودات المحلية، ولا تُزامَن بين الأجهزة. صدّر نسخة ZIP بانتظام.
            </p>
          </div>
        ) : view === "assets" ? (
          <div className="library-page">
            <div className="page-title">
              <div>
                <h1>المواد والمحتوى</h1>
              </div>
              <button className="primary" onClick={() => add(app)}>
                <Plus size={16} />
                إضافة محتوى
              </button>
            </div>
            <div className="asset-toolbar">
              <select
                aria-label="اختر تطبيق المحتوى"
                value={app}
                onChange={(e) => setApp(e.target.value)}
              >
                {work.apps.map((a) => (
                  <option value={a.id} key={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <input
                placeholder="بحث في محتوى القصة"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="secondary" onClick={() => setModal("batch")}>
                استيراد محادثات دفعة واحدة
              </button>
            </div>
            <div className="content-table">
              <div className="table-header">
                <span>العنوان / المحادثات​</span>
                <span>المحتوى</span>
                <span>الوقت</span>
                <span>الإجراءات​</span>
              </div>
              {items.map((i) => (
                <div key={i.id}>
                  <button onClick={() => edit(app, i)}>
                    <strong>{i.title}</strong>
                    {i.hidden && <small>إخفاء</small>}
                  </button>
                  <p>{i.body.slice(0, 85)}</p>
                  <small>{i.time}</small>
                  <button
                    aria-label={`تعديل${i.title}`}
                    onClick={() => edit(app, i)}
                  >
                    تعديل <ArrowUpRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={`creator-layout ${side ? "" : "no-inspector"}`}>
            <section className="phone-stage">
              <div className="stage-heading">
                <div>
                  <h1>إنشاء الجوال</h1>
                </div>
                <button
                  className="secondary"
                  aria-label="فتح مكتبة التطبيقات"
                  onClick={() => setModal("apps")}
                >
                  <LayoutGrid size={15} />
                  App المكتبة
                </button>
                <button
                  className="stage-settings"
                  aria-label="إعدادات الجوال"
                  onClick={() => setModal("settings")}
                >
                  <Settings2 size={19} />
                </button>
              </div>
              <div className="phone-presentation">
                <Phone
                  key={`${work.id}-${phoneKey}`}
                  work={work}
                  creator
                  onEdit={edit}
                  onAdd={add}
                  onSettings={() => setModal("settings")}
                  onOpen={setApp}
                />
              </div>
              <div className="stage-footer">
                <span className="mode-pill">
                  <span />
                  وضع الكتابة
                </span>
                <button onClick={startPreview}>
                  التبديل لمنظور اللاعب <ArrowUpRight size={13} />
                </button>
                <button
                  aria-label="إظهار لوحة الخصائص"
                  onClick={() => setSide(!side)}
                >
                  <PanelRightClose size={16} />
                </button>
              </div>
            </section>
            {side && (
              <aside className="inspector">
                <div className="inspector-section">
                  <div className="section-label">
                    <strong>نظرة عامة على العمل</strong>
                    <button onClick={() => setModal("metadata")}>
                      تعديل <ArrowUpRight size={12} />
                    </button>
                  </div>
                  <div className="overview-grid">
                    <div>
                      <strong>
                        {work.apps.filter((a) => a.installed).length}
                      </strong>
                      <span>التطبيقات المثبّتة</span>
                    </div>
                    <div>
                      <strong>{count}</strong>
                      <span>مقاطع المحتوى</span>
                    </div>
                    <div>
                      <strong>{work.nodes.length}</strong>
                      <span>عقد القصة</span>
                    </div>
                  </div>
                  <div className="story-mode">
                    <span>وضع القصة</span>
                    <select
                      value={work.mode}
                      onChange={(e) =>
                        change((w) => {
                          w.mode = e.target.value as Work["mode"];
                        })
                      }
                    >
                      <option value="mixed">وضع مختلط</option>
                      <option value="explore">استكشاف حر</option>
                      <option value="story">قصة تفاعلية</option>
                    </select>
                  </div>
                </div>
                <div className="inspector-section">
                  <div className="section-label">
                    <strong>تخصيص الجوال</strong>
                    <Settings2 size={14} />
                  </div>
                  <button
                    className="inspector-row"
                    onClick={() => setModal("settings")}
                  >
                    <span className="round-icon">
                      <Smartphone size={16} />
                    </span>
                    <span>
                      صاحبة الجوال وشاشة القفل<small>{work.phone.owner} آيفون</small>
                    </span>
                    <ChevronRight size={15} />
                  </button>
                  <button
                    className="inspector-row"
                    onClick={() => setModal("settings")}
                  >
                    <span
                      className={`wallpaper-swatch wallpaper-${work.phone.wallpaper}`}
                    />
                    <span>
                      الخلفية والمظهر
                      <small>
                        ضباب ناعم · {work.phone.theme === "light" ? "فاتح" : "داكن"}
                        الوضع
                      </small>
                    </span>
                    <ChevronRight size={15} />
                  </button>
                  <button
                    className="inspector-row"
                    onClick={() => setModal("apps")}
                  >
                    <span className="round-icon">
                      <LayoutGrid size={16} />
                    </span>
                    <span>App المكتبة</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
                <div className="inspector-section">
                  <div className="section-label">
                    <strong>قيد التعديل · {getApp(app).name}</strong>
                    <button
                      aria-label="إضافة محتوى للتطبيق الحالي"
                      onClick={() => add(app)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="app-content-list">
                    {(work.data[app] ?? []).slice(0, 4).map((i) => (
                      <button key={i.id} onClick={() => edit(app, i)}>
                        <span className="content-line-mark" />
                        <span>
                          <strong>{i.title}</strong>
                          <small>{i.body.slice(0, 25)}</small>
                        </span>
                        <ChevronRight size={13} />
                      </button>
                    ))}
                  </div>
                  <button
                    className="dashed-button"
                    onClick={() => setModal("batch")}
                  >
                    <Upload size={14} />
                    استيراد سجل محادثات دفعة واحدة
                  </button>
                  <button
                    className="text-button all-content"
                    onClick={() => setView("assets")}
                  >
                    إدارة كل المحتوى <ArrowUpRight size={12} />
                  </button>
                </div>

                <div className="inspector-bottom">
                  <ShieldCheck size={14} />
                  <span>محفوظ في متصفحك فقط</span>
                </div>
              </aside>
            )}
          </div>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept=".json,.zip"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file)
            void run(async () => {
              const imported = await importWork(file);
              await store.add(imported);
              setPhoneKey((k) => k + 1);
            }, "تم استيراد العمل");
          e.target.value = "";
        }}
      />
      {editing && (
        <ItemEditor
          key={editing.item.id}
          app={editing.app}
          item={editing.item}
          onClose={() => setEditing(null)}
          onSave={(item) => {
            change((w) => {
              const list = w.data[editing.app] ?? [];
              w.data[editing.app] = list.some((i) => i.id === item.id)
                ? list.map((i) => (i.id === item.id ? item : i))
                : [...list, item];
            });
            setEditing(null);
          }}
          onDelete={() => {
            if (confirm("حذف هذا المحتوى؟ يمكنك التراجع لاستعادته.")) {
              change((w) => {
                w.data[editing.app] = (w.data[editing.app] ?? []).filter(
                  (i) => i.id !== editing.item.id,
                );
              });
              setEditing(null);
            }
          }}
        />
      )}
      {modal === "settings" && (
        <PhoneSettings
          work={work}
          onChange={change}
          onClose={() => setModal("")}
        />
      )}
      {modal === "apps" && (
        <AppManager
          work={work}
          onChange={change}
          onClose={() => setModal("")}
        />
      )}
      {modal === "batch" && (
        <BatchImport
          onClose={() => setModal("")}
          onImport={(items) => {
            change((w) => {
              w.data[app] = [...(w.data[app] ?? []), ...items];
            });
            setModal("");
            setNotice(`تمت الإضافة إلى ${getApp(app).name} استيراد ${items.length} رسالة`);
          }}
        />
      )}
      {modal === "export" && (
        <Modal title="تصدير العمل" onClose={() => setModal("")}>
          <p className="modal-intro">اختر صيغة التصدير.</p>
          <div className="export-options">
            <button
              disabled={busy}
              onClick={() => {
                jsonExport(work);
                setNotice("JSON تم التصدير");
              }}
            >
              <FileJson />
              <span>
                <strong>عمل JSON</strong>
                <small>بيانات كاملة مع المواد المضمّنة، يمكن استيرادها وتعديلها لاحقاً.</small>
              </span>
              <Download size={16} />
            </button>
            <button
              disabled={busy}
              onClick={() => void run(() => backup(work), "ZIP تم تصدير النسخة الاحتياطية")}
            >
              <Package />
              <span>
                <strong>نسخة ZIP كاملة</strong>
                <small>يحفظ العمل والمواد، مناسب للنسخ الاحتياطي الطويل والنقل.</small>
              </span>
              <Download size={16} />
            </button>
            <button
              disabled={busy}
              onClick={() =>
                void run(() => staticExport(work), "تم تصدير صفحة اللاعب المستقلة")
              }
            >
              <Globe />
              <span>
                <strong>صفحة لاعب مستقلة</strong>
                <small>مشغّل ثابت + عمل بدون لوحة كتابة. يحتاج إلى بناء إنتاجي.</small>
              </span>
              <Download size={16} />
            </button>
          </div>
          <p className="storage-note">
            حجم العمل الحالي نحو{" "}
            {(new Blob([JSON.stringify(work)]).size / 1024).toFixed(1)}{" "}
            KB. حقوق المواد يتأكد منها الكاتب. شرح النشر في docs/DEPLOYMENT.md.
          </p>
          <footer>
            <button
              className="text-button"
              onClick={() => input.current?.click()}
            >
              <Upload size={15} />
              استيراد عمل
            </button>
            <span>{busy ? "جارٍ التجهيز…" : "كل عمليات التصدير تتم محلياً"}</span>
          </footer>
        </Modal>
      )}
      {modal === "metadata" && (
        <Metadata
          work={work}
          onClose={() => setModal("")}
          onSave={(patch) => {
            change((w) => Object.assign(w, patch));
            setModal("");
          }}
        />
      )}
      {(modal === "guide" || modal === "about") && (
        <Modal
          title={modal === "guide" ? "دليل الكتابة" : "جوال ملقوط · FoundPhone Studio"}
          onClose={() => setModal("")}
        >
          <div className="guide-content">
            {modal === "guide" ? (
              <ol>
                <li>افتح تطبيقاً في الجوال واضغط تعديل المحتوى، والزر ＋ أعلى اليمين للإضافة.</li>
                <li>في“المواد والمحتوى”أدر المحادثات والمنشورات والسجلات، واستورد المحادثات دفعة واحدة.</li>
                <li>
                  استخدم“ترتيب القصة”اربط الأحداث بالإجراءات، واستخدم معرّف المحتوى لفتح الصور وضبط الخيارات والنهايات.
                </li>
                <li>اضغط“معاينة”استكشف كلاعب. المعاينة لا تغيّر مسودة الكاتب.</li>
                <li>تصدير JSON / ZIP نسخة احتياطية، أو صدّر صفحة لاعب مستقلة بعد البناء.</li>
              </ol>
            ) : (
              <>
                <p>أداة مجانية مفتوحة المصدر لكتابة قصص الجوال الافتراضي محلياً.</p>
                <p>
                  الإصدار الحالي 0.2.0: مداخل 47 تطبيقاً تشترك في ستة محركات محتوى. التفاعل الكامل لكل علامة والجدولة الزمنية الحقيقية واختبار الجوال الكامل ما زالت قيد التطوير.
                </p>
                <p>
                  أسماء العلامات التجارية للمحاكاة غير الرسمية فقط. الأيقونات الافتراضية من Lucide، والمشاهد والشخصيات المدمجة خيالية أصلية.
                </p>
              </>
            )}
            <p className="storage-note">
              مسح بيانات المتصفح قد يفقدك المسودات، ولا تتم المزامنة بين الأجهزة. صدّر نسخة ZIP بانتظام. الشيفرة بترخيص MIT، أما الأعمال فلا تُرخَّص تلقائياً بـ MIT.
            </p>
          </div>
        </Modal>
      )}
      {preview && (
        <div className="preview-overlay">
          <header>
            <div>
              <h3>{preview.title}</h3>
            </div>
            <span>
              {runtime?.clues.length ?? 0} دليل ·{" "}
              {runtime?.endings.length ?? 0} نهاية
            </span>
            <button className="secondary" onClick={() => setPreview(null)}>
              إنهاء المعاينة
            </button>
          </header>
          <Phone
            key={preview.id + preview.updatedAt}
            work={preview}
            runtime={runtime}
            onRuntime={setRuntime}
          />
          <div className="debug-trace">
            <span>تصحيح القصة</span>
            {runtime?.trace.slice(-3).map((t, i) => (
              <small key={i}>{t}</small>
            ))}
          </div>
        </div>
      )}
      {confirmDelete && (
        <Modal title="حذف هذا العمل؟" onClose={() => setConfirmDelete("")}>
          <p className="modal-intro">
            سيُحذف العمل وتقدّم اللاعب من هذا الجهاز. صدّر نسخة احتياطية أولاً.
          </p>
          <footer>
            <button className="secondary" onClick={() => setConfirmDelete("")}>
              إلغاء
            </button>
            <button
              className="primary danger-bg"
              onClick={() => {
                void run(() => store.remove(confirmDelete), "تم حذف العمل");
                setConfirmDelete("");
              }}
            >
              تأكيد الحذف
            </button>
          </footer>
        </Modal>
      )}
      {notice && (
        <div className="toast" role="status">
          <Check size={17} />
          <span>{notice}</span>
          <button aria-label="إغلاق التنبيه" onClick={() => setNotice("")}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}
function Metadata({
  work,
  onClose,
  onSave,
}: {
  work: Work;
  onClose: () => void;
  onSave: (p: Partial<Work>) => void;
}) {
  const [title, setTitle] = useState(work.title),
    [description, setDescription] = useState(work.description),
    [category, setCategory] = useState(work.category),
    [cover, setCover] = useState(work.cover),
    [error, setError] = useState("");
  return (
    <Modal title="معلومات العمل" onClose={onClose}>
      <div className="editor-fields">
        <label>
          اسم العمل
          <input
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label>
          الوصف
          <textarea
            rows={4}
            maxLength={5000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label>
          التصنيفات
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </label>
        <label>
          الغلاف
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={async (e) => {
              if (e.target.files?.[0])
                try {
                  setCover(await mediaData(e.target.files[0]));
                } catch (err) {
                  setError(String(err));
                }
            }}
          />
        </label>
        {cover && <img className="cover-preview" alt="غلاف العمل" src={cover} />}
        <p className="error">{error}</p>
      </div>
      <footer>
        <span>معرّف العمل · {work.id.slice(0, 8)}</span>
        <button
          className="primary"
          disabled={!title.trim()}
          onClick={() =>
            onSave({ title: title.trim(), description, category, cover })
          }
        >
          حفظ المعلومات
        </button>
      </footer>
    </Modal>
  );
}
createRoot(document.getElementById("root")!).render(<Studio />);
