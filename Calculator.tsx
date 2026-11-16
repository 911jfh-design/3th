import "./native-apps.css";
import { useState } from "react";
import { Clock, Calculator, Delete, ChevronLeft } from "lucide-react";
import { calculate } from "./calculatorMath";
import { useSkinState } from "../skinState";
import type { Item, UiValue } from "../schema";
export function NativeCalculator(p: {
  items: Item[];
  onRead: (i: Item) => void;
  ui?: Record<string, UiValue>;
  onUi?: (key: string, value: UiValue) => void;
}) {
  const [value, set] = useSkinState<string>(p, "display", "0"),
    [history, setHistory] = useSkinState<string[]>(p, "history", []);
  const [left, setLeft] = useState<number | null>(null),
    [op, setOp] = useState(""),
    [fresh, setFresh] = useState(false),
    [repeat, setRepeat] = useState<{ op: string; n: number } | null>(null),
    [panel, setPanel] = useState("");
  const press = (k: string) => {
    if (k === "AC") {
      set("0");
      setLeft(null);
      setOp("");
      setFresh(false);
      setRepeat(null);
      return;
    }
    if (k === "⌫") {
      set(value === "خطأ" || value.length < 2 ? "0" : value.slice(0, -1));
      return;
    }
    if (k === "±") {
      set(String(-Number(value)));
      return;
    }
    if (k === "%") {
      set(String(Number(value) / 100));
      return;
    }
    if (["+", "−", "×", "÷"].includes(k)) {
      const n = Number(value);
      if (!Number.isFinite(n)) return;
      const next =
        left !== null && op && !fresh ? calculate(left, n, op) : value;
      set(next);
      setLeft(Number(next));
      setOp(k);
      setFresh(true);
      return;
    }
    if (k === "=") {
      const operation = op || repeat?.op,
        b = left !== null ? Number(value) : repeat?.n,
        a = left ?? Number(value);
      if (operation && b !== undefined) {
        const result = calculate(a, b, operation);
        set(result);
        setHistory(
          [...history, `${a} ${operation} ${b} = ${result}`].slice(-50),
        );
        setRepeat({ op: operation, n: b });
        setLeft(null);
        setOp("");
        setFresh(true);
      }
      return;
    }
    if (fresh || value === "خطأ") {
      set(k === "." ? "0." : k);
      setFresh(false);
    } else if (!(k === "." && value.includes(".")))
      set(value === "0" && k !== "." ? k : (value + k).slice(0, 15));
  };
  return (
    <div className="calculator native-calculator">
      <header className="calc-toolbar">
        <button aria-label="سجل العمليات" onClick={() => setPanel("history")}>
          <Clock size={26} />
        </button>
        <button aria-label="وضع الآلة الحاسبة" onClick={() => setPanel("mode")}>
          <Calculator size={25} />
        </button>
      </header>
      <output
        aria-live="polite"
        style={{ fontSize: value.length > 9 ? 42 : value.length > 6 ? 54 : 68 }}
      >
        {value}
      </output>
      <div className="calc-keypad">
        {[
          "⌫",
          "AC",
          "%",
          "÷",
          "7",
          "8",
          "9",
          "×",
          "4",
          "5",
          "6",
          "−",
          "1",
          "2",
          "3",
          "+",
          "±",
          "0",
          ".",
          "=",
        ].map((k, i) => (
          <button
            key={k}
            className={
              (i < 3 ? "calc-function " : "") +
              (i % 4 === 3 ? "calc-operator " : "") +
              (op === k ? "calc-selected" : "")
            }
            aria-label={k === "⌫" ? "حذف​" : k === "±" ? "تبديل الإشارة" : k}
            onClick={() => press(k)}
          >
            {k === "⌫" ? <Delete size={32} /> : k}
          </button>
        ))}
      </div>
      {panel && (
        <div className="calc-history">
          <header>
            <button onClick={() => setPanel("")}>
              <ChevronLeft />
              رجوع
            </button>
            <strong>{panel === "history" ? "السجل" : "الآلة الحاسبة"}</strong>
            {panel === "history" && (
              <button onClick={() => setHistory([])}>مسح​</button>
            )}
          </header>
          {panel === "history" ? (
            <>
              <div className="calc-history-list">
                {history
                  .slice()
                  .reverse()
                  .map((v, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        set(v.split(" = ").at(-1) || "0");
                        setPanel("");
                      }}
                    >
                      {v}
                    </button>
                  ))}
                {p.items.map((i) => (
                  <button key={i.id} onClick={() => p.onRead(i)}>
                    {i.title}
                  </button>
                ))}
                {!history.length && !p.items.length && <p>لا توجد عمليات</p>}
              </div>
            </>
          ) : (
            <button className="calc-mode-option" onClick={() => setPanel("")}>
              أساسي ✓
            </button>
          )}
        </div>
      )}
    </div>
  );
}
