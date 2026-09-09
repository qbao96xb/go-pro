import { useEffect, useMemo, useState } from "react";

export default function useGameClock({
  settings,
  appMode,
  gameOver,
  isThinking,
  moves
}) {
  const initialSeconds =
    settings.timeSystem === "none"
      ? null
      : Number(settings.mainTimeMinutes || 0) * 60;

  const [blackTime, setBlackTime] = useState(initialSeconds);
  const [whiteTime, setWhiteTime] = useState(initialSeconds);

  const activeColor = useMemo(() => {
    return moves.length % 2 === 0 ? "B" : "W";
  }, [moves.length]);

  useEffect(() => {
    const nextInitialSeconds =
      settings.timeSystem === "none"
        ? null
        : Number(settings.mainTimeMinutes || 0) * 60;

    setBlackTime(nextInitialSeconds);
    setWhiteTime(nextInitialSeconds);
  }, [
    settings.timeSystem,
    settings.mainTimeMinutes
  ]);

  useEffect(() => {
    if (settings.timeSystem === "none") return;
    if (appMode !== "play") return;
    if (gameOver) return;
    if (isThinking) return;

    const interval = window.setInterval(() => {
      if (activeColor === "B") {
        setBlackTime(prev => Math.max(0, (prev ?? 0) - 1));
      } else {
        setWhiteTime(prev => Math.max(0, (prev ?? 0) - 1));
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [
    settings.timeSystem,
    appMode,
    gameOver,
    isThinking,
    activeColor
  ]);

  return {
    blackTime,
    whiteTime,
    activeColor
  };
}
