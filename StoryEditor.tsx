import { useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Connection,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import {
  uid,
  type Work,
  type StoryNode,
  type Action,
  type Condition,
} from "./schema";
import { validateGraph } from "./engine";
export function StoryEditor({
  work,
  onChange,
}: {
  work: Work;
  onChange: (fn: (w: Work) => void) => void;
}) {
  const [selected, setSelected] = useState("");
  const [dragged, setDragged] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [query, setQuery] = useState("");
  const n = work.nodes.find((n) => n.id === selected);
  const errors = validateGraph(work.nodes);
  const update = (patch: Partial<StoryNode>) =>
    onChange((w) => {
      w.nodes = w.nodes.map((x) =>
        x.id === selected ? { ...x, ...patch } : x,
      );
    });
  const add = () => {
    const id = uid();
    onChange((w) => {
      w.nodes.push({
        id,
        label: "حدث جديد",
        type: "event",
        event: "openApp",
        target: "wechat",
        conditions: [],
        logic: "and",
        actions: [],
        next: [],
        once: true,
        x: 100 + w.nodes.length * 25,
        y: 150 + w.nodes.length * 20,
      });
    });
    setSelected(id);
  };
  const connect = (c: Connection) => {
    if (c.source && c.target)
      onChange((w) => {
        const n = w.nodes.find((n) => n.id === c.source);
        if (n && !n.next.includes(c.target!)) n.next.push(c.target!);
      });
  };
  const nodes: Node[] = work.nodes.map((x) => ({
    id: x.id,
    data: {
      label: `${{ start: "البداية", event: "حدث", condition: "شرط", action: "إجراء", choice: "اختيار", delay: "تأخير", ending: "النهاية", comment: "ملاحظة" }[x.type]} · ${x.label}`,
    },
    position: dragged[x.id] ?? { x: x.x, y: x.y },
    type:
      x.type === "start" ? "input" : x.type === "ending" ? "output" : "default",
    selected: x.id === selected,
    style: {
      borderColor:
        x.type === "ending"
          ? "#a88963"
          : x.type === "choice"
            ? "#879c78"
            : "#a9b4ab",
      opacity: query && !x.label.includes(query) ? 0.3 : 1,
    },
  }));
  return (
    <div className="story-editor">
      <div className="graph-main">
        <div className="graph-toolbar">
          <div>
            <h2>ترتيب القصة</h2>
          </div>
          <input
            placeholder="بحث في العقد"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="secondary" onClick={add}>
            <Plus size={16} />
            إضافة عقدة
          </button>
        </div>
        <div className="flow-canvas">
          <ReactFlow
            nodes={nodes}
            edges={work.nodes.flatMap((n) =>
              n.next.map((id) => ({
                id: `${n.id}-${id}`,
                source: n.id,
                target: id,
                animated: n.type === "choice",
              })),
            )}
            onConnect={connect}
            onNodeClick={(_, n) => setSelected(n.id)}
            onNodeDrag={(_, n) =>
              setDragged((d) => ({ ...d, [n.id]: n.position }))
            }
            onNodeDragStop={(_, n) => {
              setDragged({});
              onChange((w) => {
                const x = w.nodes.find((x) => x.id === n.id);
                if (x) {
                  x.x = n.position.x;
                  x.y = n.position.y;
                }
              });
            }}
            onEdgesDelete={(edges) =>
              onChange((w) => {
                for (const e of edges) {
                  const n = w.nodes.find((n) => n.id === e.source);
                  if (n) n.next = n.next.filter((id) => id !== e.target);
                }
              })
            }
            fitView
            deleteKeyCode="Delete"
          >
            <Background gap={24} color="#d4dad1" />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
        <div className={`graph-validation ${errors.length ? "error" : ""}`}>
          {errors.length ? (
            <>
              <AlertCircle size={16} />
              {errors.join("؛")}
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              فحص البنية ناجح · {work.nodes.length} عقدة
            </>
          )}
        </div>
      </div>
      <aside className="node-inspector">
        {n ? (
          <>
            <h3>{n.label}</h3>
            <label>
              معرّف العقدة
              <input value={n.id} readOnly />
            </label>
            <label>
              الاسم
              <input
                value={n.label}
                onChange={(e) => update({ label: e.target.value })}
              />
            </label>
            <label>
              نوع العقدة
              <select
                value={n.type}
                onChange={(e) =>
                  update({ type: e.target.value as StoryNode["type"] })
                }
              >
                {[
                  "start",
                  "event",
                  "condition",
                  "action",
                  "choice",
                  "delay",
                  "ending",
                  "comment",
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            {n.type === "delay" && (
              <label>
                التأخير بالميلي ثانية
                <input
                  type="number"
                  min="0"
                  max="86400000"
                  value={n.delayMs ?? 1000}
                  onChange={(e) =>
                    update({
                      delayMs: Math.max(
                        0,
                        Math.min(86400000, Number(e.target.value)),
                      ),
                    })
                  }
                />
                <small>يُحسب حسب وقت تشغيل العمل ويتوقف عند الإغلاق.</small>
              </label>
            )}
            <label>
              الحدث المُطلِق
              <select
                value={n.event}
                onChange={(e) => update({ event: e.target.value })}
              >
                {[
                  "",
                  "start",
                  "openApp",
                  "read",
                  "password",
                  "choose",
                  "time",
                  "variable",
                  "callAnswered",
                  "callDeclined",
                  "callEnded",
                ].map((t) => (
                  <option key={t} value={t}>
                    {t || "يُطلَق بالوصلة فقط"}
                  </option>
                ))}
              </select>
            </label>
            <label>
              هدف الحدث
              <input
                list="story-targets"
                placeholder="اختر تطبيقاً أو محتوى أو متغيراً"
                value={n.target}
                onChange={(e) => update({ target: e.target.value })}
              />
            </label>
            <datalist id="story-targets">
              {work.apps.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
              {Object.entries(work.data).flatMap(([app, items]) =>
                items.map((i) => (
                  <option key={app + i.id} value={i.id}>
                    {i.title} · {app}
                  </option>
                )),
              )}
              {Object.keys(work.variables).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </datalist>
            <label className="inline-check">
              <input
                type="checkbox"
                checked={n.once}
                onChange={(e) => update({ once: e.target.checked })}
              />
              مرة واحدة فقط
            </label>
            <div className="inspector-divider" />
            <div className="section-label">
              <strong>شروط التنفيذ</strong>
              <button
                onClick={() =>
                  update({
                    conditions: [
                      ...n.conditions,
                      { key: "found", op: "eq", value: true },
                    ],
                  })
                }
              >
                ＋
              </button>
            </div>
            <select
              value={n.logic}
              onChange={(e) =>
                update({ logic: e.target.value as StoryNode["logic"] })
              }
            >
              <option value="and">تحقق الكل · AND</option>
              <option value="or">تحقق أي واحد · OR</option>
              <option value="not">عدم تحقق الكل · NOT</option>
            </select>
            {n.conditions.map((c, i) => (
              <div className="condition-editor" key={i}>
                <input
                  aria-label="متغير الشرط"
                  value={c.key}
                  onChange={(e) =>
                    update({
                      conditions: n.conditions.map((x, j) =>
                        j === i ? { ...x, key: e.target.value } : x,
                      ),
                    })
                  }
                />
                <select
                  value={c.op}
                  onChange={(e) =>
                    update({
                      conditions: n.conditions.map((x, j) =>
                        j === i
                          ? { ...x, op: e.target.value as Condition["op"] }
                          : x,
                      ),
                    })
                  }
                >
                  {["eq", "neq", "gt", "lt", "includes"].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
                <TypedValue
                  value={c.value}
                  set={(value) =>
                    update({
                      conditions: n.conditions.map((x, j) =>
                        j === i ? { ...x, value } : x,
                      ),
                    })
                  }
                />
                <button
                  aria-label="حذف الشرط"
                  onClick={() =>
                    update({
                      conditions: n.conditions.filter((_, j) => j !== i),
                    })
                  }
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            <div className="section-label">
              <strong>الإجراءات</strong>
              <button
                onClick={() =>
                  update({
                    actions: [
                      ...n.actions,
                      {
                        type: "notification",
                        key: "",
                        value: "ظهر دليل جديد",
                      },
                    ],
                  })
                }
              >
                ＋
              </button>
            </div>
            {n.actions.map((a, i) => (
              <div className="action-editor" key={i}>
                <select
                  value={a.type}
                  onChange={(e) =>
                    update({
                      actions: n.actions.map((x, j) =>
                        j === i
                          ? { ...x, type: e.target.value as Action["type"] }
                          : x,
                      ),
                    })
                  }
                >
                  {[
                    "variable",
                    "unlock",
                    "hide",
                    "notification",
                    "message",
                    "time",
                    "ending",
                    "choice",
                    "clue",
                    "call",
                  ].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <input
                  placeholder="الهدف / المتغير / App ID"
                  value={a.key}
                  onChange={(e) =>
                    update({
                      actions: n.actions.map((x, j) =>
                        j === i ? { ...x, key: e.target.value } : x,
                      ),
                    })
                  }
                />
                <TypedValue
                  value={a.value}
                  set={(value) =>
                    update({
                      actions: n.actions.map((x, j) =>
                        j === i ? { ...x, value } : x,
                      ),
                    })
                  }
                />
                <button
                  className="danger text-button"
                  onClick={() =>
                    update({ actions: n.actions.filter((_, j) => j !== i) })
                  }
                >
                  حذف الإجراء
                </button>
              </div>
            ))}
            <button
              className="danger secondary"
              onClick={() => {
                onChange((w) => {
                  w.nodes = w.nodes
                    .filter((x) => x.id !== n.id)
                    .map((x) => ({
                      ...x,
                      next: x.next.filter((id) => id !== n.id),
                    }));
                });
                setSelected("");
              }}
            >
              حذف العقدة
            </button>
          </>
        ) : (
          <div className="inspector-empty">
            <p>اضغط على عقدة لتعديل الحدث والشروط والإجراءات.</p>
            <small>
              اسحب نقطة الوصل بين العقد لإنشاء فرع، واحذف الوصلة المحددة بزر Delete. العقد التالية للعقدة المحددة تصبح خيارات اللاعب.
            </small>
          </div>
        )}
      </aside>
    </div>
  );
}
function TypedValue({
  value,
  set,
}: {
  value: string | number | boolean;
  set: (v: string | number | boolean) => void;
}) {
  return (
    <div className="typed-value">
      <select
        aria-label="نوع القيمة"
        value={typeof value}
        onChange={(e) =>
          set(
            e.target.value === "boolean"
              ? true
              : e.target.value === "number"
                ? 0
                : "",
          )
        }
      >
        <option value="string">نص</option>
        <option value="number">القيمة</option>
        <option value="boolean">منطقي</option>
      </select>
      {typeof value === "boolean" ? (
        <select
          value={String(value)}
          onChange={(e) => set(e.target.value === "true")}
        >
          <option>true</option>
          <option>false</option>
        </select>
      ) : (
        <input
          value={value}
          type={typeof value === "number" ? "number" : "text"}
          onChange={(e) =>
            set(
              typeof value === "number"
                ? Number(e.target.value)
                : e.target.value,
            )
          }
        />
      )}
    </div>
  );
}
