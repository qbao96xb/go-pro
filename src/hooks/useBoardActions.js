import { useCallback } from "react";

import {
  movesToSgf,
  downloadTextFile,
  parseSimpleSgfMoves
} from "../utils/sgfUtils";

export default function useBoardActions({
  appMode,
  setAppMode,
  isThinking,

  settings,

  moves,
  signMap,
  currentState,
  gameOver,
  setGameOver,
  isAtLatestMove,

  resetLinearGame,
  resetAnalysis,
  resetReviewTree,
  clearReviewReport,
  loadMoves,

  setBranches,
  clearBranchState,
  setSelectedPivotalMove,
  setPendingReviewJump,
  setActiveTab,
  setShowTeachingReview,
  setShowReviewSummary,
  setShowSettings,

  pushState,
  playBotMove,
  resignLinearGame
}) {
  const resetGame = useCallback(() => {
    resetLinearGame();
    resetAnalysis();
    resetReviewTree();
    clearReviewReport();

    setBranches([]);
    clearBranchState();

    setSelectedPivotalMove(null);
    setPendingReviewJump(null);

    setActiveTab("best");
    setShowTeachingReview(false);
    setShowReviewSummary(false);
  }, [
    resetLinearGame,
    resetAnalysis,
    resetReviewTree,
    clearReviewReport,
    setBranches,
    clearBranchState,
    setSelectedPivotalMove,
    setPendingReviewJump,
    setActiveTab,
    setShowTeachingReview,
    setShowReviewSummary
  ]);

  const startNewGame = useCallback(() => {
    if (isThinking) return;

    resetGame();
    setAppMode("play");
    setShowSettings(false);
  }, [
    isThinking,
    resetGame,
    setAppMode,
    setShowSettings
  ]);

  const saveGame = useCallback(() => {
    const sgf = movesToSgf({
      moves,
      blackName: settings.blackName,
      whiteName: settings.whiteName,
      komi: settings.komi,
      rules: settings.rules
    });

    localStorage.setItem("goTutorAutosaveSgf", sgf);
    alert("Game saved locally.");
  }, [
    moves,
    settings
  ]);

  const saveGameAs = useCallback(() => {
    const sgf = movesToSgf({
      moves,
      blackName: settings.blackName,
      whiteName: settings.whiteName,
      komi: settings.komi,
      rules: settings.rules
    });

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-");

    downloadTextFile(`go-tutor-${timestamp}.sgf`, sgf);
  }, [
    moves,
    settings
  ]);

  const loadGame = useCallback(() => {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = ".sgf,application/x-go-sgf,text/plain";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const text = await file.text();
      const loadedMoves = parseSimpleSgfMoves(text);

      if (loadedMoves.length === 0) {
        alert("No moves found in this SGF.");
        return;
      }

      const loadedHistory = loadMoves(loadedMoves);

      resetAnalysis();
      resetReviewTree();
      clearReviewReport();

      setAppMode("play");
      setActiveTab("info");
      setSelectedPivotalMove(null);
      setPendingReviewJump(null);
      clearBranchState();

      alert(`Loaded ${loadedHistory.length - 1} moves from SGF.`);
    };

    input.click();
  }, [
    loadMoves,
    resetAnalysis,
    resetReviewTree,
    clearReviewReport,
    setAppMode,
    setActiveTab,
    setSelectedPivotalMove,
    setPendingReviewJump,
    clearBranchState
  ]);

  const passMove = useCallback(async () => {
    if (appMode !== "play") return;
    if (isThinking || gameOver) return;

    if (!isAtLatestMove) {
      alert("Go to the latest move before passing.");
      return;
    }

    const currentTurn = moves.length % 2 === 0 ? "B" : "W";
    const newMoves = [...moves, [currentTurn, "pass"]];

    const bothPassed =
      newMoves.length >= 2 &&
      newMoves[newMoves.length - 1][1] === "pass" &&
      newMoves[newMoves.length - 2][1] === "pass";

    const nextState = {
      board: signMap,
      moves: newMoves,
      captures: currentState.captures,
      feedback: bothPassed
        ? "Both players passed. Game over."
        : `${currentTurn} passed.`
    };

    pushState(nextState);

    if (bothPassed) {
      setGameOver(true);
      return;
    }

    const nextTurn = newMoves.length % 2 === 0 ? "B" : "W";
    const nextPlayerType =
      nextTurn === "B" ? settings.blackType : settings.whiteType;

    if (nextPlayerType === "bot") {
      await playBotMove(nextState);
    }
  }, [
    appMode,
    isThinking,
    gameOver,
    isAtLatestMove,
    moves,
    signMap,
    currentState,
    settings,
    pushState,
    setGameOver,
    playBotMove
  ]);

  const resignGame = useCallback(() => {
    if (appMode !== "play") return;

    resignLinearGame();
  }, [
    appMode,
    resignLinearGame
  ]);

  return {
    resetGame,
    startNewGame,
    saveGame,
    saveGameAs,
    loadGame,
    passMove,
    resignGame
  };
}
