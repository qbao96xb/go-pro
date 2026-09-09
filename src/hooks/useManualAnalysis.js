import { useCallback } from "react";

export default function useManualAnalysis({
  isThinking,
  setIsThinking,
  displayedState,
  settings,
  analyzePosition,
  showAnalysisResult,
  recordEvaluation
}) {
  const analyzeCurrentPosition = useCallback(async () => {
    if (isThinking || !displayedState) return;

    setIsThinking(true);

    try {
      const result = await analyzePosition(
        displayedState.moves,
        settings.showTerritory
      );

      const playedColor =
        displayedState.moves.length === 0
          ? null
          : displayedState.moves[displayedState.moves.length - 1][0];

      showAnalysisResult(result, displayedState.board);
      recordEvaluation(displayedState.moves, result, playedColor);
    } catch (err) {
      console.error("Manual analysis failed:", err);
      alert("Failed to analyze current position.");
    } finally {
      setIsThinking(false);
    }
  }, [
    isThinking,
    setIsThinking,
    displayedState,
    settings.showTerritory,
    analyzePosition,
    showAnalysisResult,
    recordEvaluation
  ]);

  return {
    analyzeCurrentPosition
  };
}
