import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Phone } from "./Phone";
import { validateWork, type Work } from "./schema";
import "./styles.css";
function Player() {
  const [work, setWork] = useState<Work | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("./work.json")
      .then((r) => {
        if (!r.ok) throw Error("ينقص work.json");
        return r.json();
      })
      .then((x) => {
        const w = validateWork(x);
        document.title = w.title;
        setWork(w);
      })
      .catch((e) => setError(String(e)));
  }, []);
  return (
    <main className="standalone-player">
      {work ? (
        <>
          <div className="player-title">
            <h1>{work.title}</h1>
          </div>
          <Phone work={work} />
          <p className="player-footnote">
            {work.description}
            <br />
            يُحفظ التقدّم في هذا المتصفح · FoundPhone Studio
          </p>
        </>
      ) : (
        <p>{error || "جارٍ فتح القصة…"}</p>
      )}
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<Player />);
