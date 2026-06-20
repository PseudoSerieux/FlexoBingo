import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import phrasesData from "./phrases.json";
// @ts-ignore
import victorySound from "./legends-never-die.ogg";
// @ts-ignore
import "./Bingo.css";

type GridSize = 4 | 5;
type Theme = "light" | "dark";

interface PhrasesDataType {
  people: Array<{ name: string; phrases: string[] }>;
  shared: string[];
}

interface BingoProps {
  /** Liste de phrases candidates. Par défaut, charge phrases.json */
  phrases?: string[];
  /** Taille de grille par défaut */
  defaultSize?: GridSize;
  /**
   * URL d'un fichier audio à jouer quand une ligne/colonne/diagonale est
   * complétée (ex: "/legends-never-die.ogg" placé dans le dossier public).
   * Si absent, un petit son de victoire est généré avec Web Audio API.
   */
  victorySoundUrl?: string;
}

interface Confetti {
  id: number;
  left: number;
  delay: number;
  duration: number;
  rotation: number;
  emoji: string;
}

const CONFETTI_EMOJIS = ["🎉", "🎊", "✨", "🥳"];

/** Récupère les phrases disponibles selon les personnes sélectionnées */
function getAvailablePhrases(
  data: PhrasesDataType,
  selectedPeople: Set<number>
): string[] {
  const phrases = new Set<string>();

  // Ajouter les phrases des personnes sélectionnées
  selectedPeople.forEach((idx) => {
    if (data.people[idx]) {
      data.people[idx].phrases.forEach((p) => phrases.add(p));
    }
  });

  // Toujours ajouter les phrases partagées
  data.shared.forEach((p) => phrases.add(p));

  return Array.from(phrases);
}

/** Mélange un tableau (Fisher-Yates) sans muter l'original. */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Génère un tableau de `size*size` phrases UNIQUES tirées du pool.
 * Les phrases {{FREE_CASE...}} sont utilisées en dernier recours si
 * le nombre de vraies phrases est insuffisant.
 */
function generateGrid(size: GridSize, pool: string[]): string[] {
  const needed = size * size;
  
  // Séparer les vraies phrases des FREE_CASE
  const realPhrases = pool.filter(p => !p.startsWith('{{FREE_CASE'));
  const freeCases = pool.filter(p => p.startsWith('{{FREE_CASE'));
  
  // Utiliser les vraies phrases en priorité
  let availablePhrases = Array.from(new Set(realPhrases));
  
  // Si manque de phrases, ajouter les FREE_CASE en dernier recours
  if (availablePhrases.length < needed) {
    availablePhrases = [...availablePhrases, ...freeCases];
  }
  
  const uniquePool = Array.from(new Set(availablePhrases));

  if (uniquePool.length < needed && (import.meta as any).env?.DEV) {
    console.warn(
      `[Bingo] Le pool ne contient que ${uniquePool.length} phrases uniques ` +
        `pour une grille de ${needed} cases : certaines cases resteront vides ` +
        `plutôt que de répéter une phrase. Ajoute des phrases dans phrases.json.`
    );
  }

  return shuffle(uniquePool).slice(0, needed);
}

/** Calcule les indices de toutes les lignes, colonnes et diagonales d'une grille carrée. */
function getLines(size: GridSize): number[][] {
  const lines: number[][] = [];

  for (let row = 0; row < size; row++) {
    lines.push(Array.from({ length: size }, (_, col) => row * size + col));
  }
  for (let col = 0; col < size; col++) {
    lines.push(Array.from({ length: size }, (_, row) => row * size + col));
  }
  lines.push(Array.from({ length: size }, (_, i) => i * size + i));
  lines.push(Array.from({ length: size }, (_, i) => i * size + (size - 1 - i)));

  return lines;
}

export default function Bingo({
  defaultSize = 4
}: BingoProps) {
  const bingoData = phrasesData as PhrasesDataType;
  const [selectedPeople, setSelectedPeople] = useState<Set<number>>(
    new Set(Array.from({ length: Math.min(5, bingoData.people.length) }, (_, i) => i))
  );

  const availablePhrases = useMemo(
    () => getAvailablePhrases(bingoData, selectedPeople),
    [selectedPeople]
  );

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem("bingo-theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const [gridSize, setGridSize] = useState<GridSize>(defaultSize);
  const [cells, setCells] = useState<string[]>(() =>
    generateGrid(defaultSize, availablePhrases)
  );
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [started, setStarted] = useState(false);
  const [confettiBatch, setConfettiBatch] = useState<Confetti[]>([]);
  const [celebrating, setCelebrating] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const completedLinesRef = useRef<Set<number>>(new Set());
  const confettiIdRef = useRef(0);

  useEffect(() => {
    document.documentElement.setAttribute("data-bingo-theme", theme);
    window.localStorage.setItem("bingo-theme", theme);
  }, [theme]);

  const lines = useMemo(() => getLines(gridSize), [gridSize]);

  const completedLinesCount = useMemo(() => {
    return lines.filter((line) => line.every((idx) => checked.has(idx)))
      .length;
  }, [lines, checked]);

  const regenerate = useCallback(
    (size: GridSize) => {
      setCells(generateGrid(size, availablePhrases));
      setChecked(new Set());
      completedLinesRef.current = new Set();
      setConfettiBatch([]);
      setCelebrating(false);
    },
    [availablePhrases]
  );

  useEffect(() => {
    if (!started) {
      regenerate(gridSize);
    }
  }, [availablePhrases, gridSize, regenerate, started]);

  const handleSizeChange = (size: GridSize) => {
    setGridSize(size);
    regenerate(size);
    setStarted(false);
  };

  const handleShuffleClick = () => {
    regenerate(gridSize);
  };

  const handleStart = () => {
    setStarted(true);
  };

  const handleReplay = () => {
    regenerate(gridSize);
    setStarted(false);
  };

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  const triggerCelebration = useCallback(() => {
    const batch: Confetti[] = Array.from({ length: 28 }, () => ({
      id: confettiIdRef.current++,
      left: Math.random() * 100,
      delay: Math.random() * 0.3,
      duration: 1.6 + Math.random() * 1,
      rotation: Math.random() * 360,
      emoji: CONFETTI_EMOJIS[Math.floor(Math.random() * CONFETTI_EMOJIS.length)],
    }));
    setConfettiBatch(batch);
    setCelebrating(true);
    window.setTimeout(() => setCelebrating(false), 1400);
    window.setTimeout(() => setConfettiBatch([]), 2800);

    if (!isMuted) {
      const audio = new Audio(victorySound);
      audio.volume = 0.25;
      audio.play();
    }
  }, [isMuted]);

  const toggleCell = (index: number) => {
    if (!started) return;
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }

      const newlyCompleted = lines.filter(
        (line, i) =>
          line.every((idx) => next.has(idx)) &&
          !completedLinesRef.current.has(i)
      );

      if (newlyCompleted.length > 0) {
        lines.forEach((line, i) => {
          if (line.every((idx) => next.has(idx))) {
            completedLinesRef.current.add(i);
          } else {
            completedLinesRef.current.delete(i);
          }
        });
        triggerCelebration();
      } else {
        lines.forEach((line, i) => {
          if (!line.every((idx) => next.has(idx))) {
            completedLinesRef.current.delete(i);
          }
        });
      }

      return next;
    });
  };

  return (
    <div className="bingo">
      {confettiBatch.length > 0 && (
        <div className="bingo-confetti-layer" aria-hidden="true">
          {confettiBatch.map((c) => (
            <span
              key={c.id}
              className="bingo-confetti"
              style={{
                left: `${c.left}%`,
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.duration}s`,
                "--rot": `${c.rotation}deg`,
              } as React.CSSProperties}
            >
              {c.emoji}
            </span>
          ))}
        </div>
      )}

      <div className="bingo-people-selector">
        <span className="bingo-label">Personnes présentes (max 5)</span>
        <div className="bingo-people-checkboxes">
          {bingoData.people.map((person, idx) => (
            <label key={idx} className="bingo-checkbox-label">
              <input
                type="checkbox"
                checked={selectedPeople.has(idx)}
                onChange={(e) => {
                  const newSelected = new Set(selectedPeople);
                  if (e.target.checked) {
                    if (newSelected.size < 5) {
                      newSelected.add(idx);
                    }
                  } else {
                    newSelected.delete(idx);
                  }
                  setSelectedPeople(newSelected);
                  setStarted(false);
                }}
                disabled={started || (!selectedPeople.has(idx) && selectedPeople.size >= 5)}
              />
              <span>{person.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bingo-toolbar">
        <div className="bingo-size-picker">
          <span className="bingo-label">Taille</span>
          <div className="bingo-size-buttons">
            {([4, 5] as GridSize[]).map((size) => (
              <button
                key={size}
                type="button"
                className={`bingo-btn ${gridSize === size ? "is-active" : ""}`}
                disabled={started}
                onClick={() => handleSizeChange(size)}
              >
                {size}x{size}
              </button>
            ))}
          </div>
        </div>

        <div className="bingo-actions">
          {!started ? (
            <>
              <button
                type="button"
                className="bingo-btn"
                onClick={handleShuffleClick}
              >
                Mélanger
              </button>
              <button
                type="button"
                className="bingo-btn bingo-btn-primary"
                onClick={handleStart}
                disabled={selectedPeople.size > 5}
              >
                Lancer la partie
              </button>
            </>
          ) : (
            <button type="button" className="bingo-btn" onClick={handleReplay}>
              Rejouer
            </button>
          )}
          <button
            type="button"
            className="bingo-theme-toggle"
            onClick={() => setIsMuted(!isMuted)}
            aria-label={isMuted ? "Activer le son" : "Désactiver le son"}
            title={isMuted ? "Son désactivé" : "Son activé"}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
          <button
            type="button"
            className="bingo-theme-toggle"
            onClick={toggleTheme}
            aria-label={
              theme === "light" ? "Activer le mode nuit" : "Activer le mode jour"
            }
            title={theme === "light" ? "Mode nuit" : "Mode jour"}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </div>

      <div
        className={`bingo-grid ${celebrating ? "is-celebrating" : ""}`}
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
      >
        {cells.map((phrase, index) => {
          const isChecked = checked.has(index);
          return (
            <button
              key={index}
              type="button"
              className={[
                "bingo-cell",
                isChecked ? "is-checked" : "",
                started ? "" : "is-disabled",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => toggleCell(index)}
              disabled={!started}
            >
              {phrase}
            </button>
          );
        })}
      </div>

      <div className="bingo-footer">
        <p className="bingo-status">
          {!started
            ? "Choisis ta taille de grille, mélange si besoin, puis lance la partie."
            : `${checked.size} / ${cells.length} cases validées`}
        </p>
        {started && (
          <p className="bingo-lines-counter">
            <span className="bingo-lines-count">{completedLinesCount}</span>
            {" "}
            {completedLinesCount === 1 ? "ligne complète" : "lignes complètes"}
          </p>
        )}
      </div>
    </div>
  );
}

