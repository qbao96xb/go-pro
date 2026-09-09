import React, { useCallback, useEffect, useState } from "react";

import {
  autoSaveFinishedGame
} from "./utils/gameDataApi";

import useBoardRenderer from "./hooks/useBoardRenderer";
import useMoveHandlers from "./hooks/useMoveHandlers";
import useKataGoAnalysis from "./hooks/useKataGoAnalysis";
import useReviewTree from "./hooks/useReviewTree";
import useLinearGame from "./hooks/useLinearGame";
import useWholeGameReview from "./hooks/useWholeGameReview";
import useGameClock from "./hooks/useGameClock";
import useBoardSettings from "./hooks/useBoardSettings";
import useBoardActions from "./hooks/useBoardActions";
import useBoardNavigation from "./hooks/useBoardNavigation";
import useReviewActions from "./hooks/useReviewActions";
import useManualAnalysis from "./hooks/useManualAnalysis";

import BoardLayout from "./components/BoardLayout";

const VERTEX_SIZE = 36;

function Board() {
  // ---------------------------------------------------------------------------
  // App mode
  // ---------------------------------------------------------------------------
  const [appMode, setAppMode] = useState("play");
  const isReviewMode = appMode === "review" || appMode === "teaching";

  // ---------------------------------------------------------------------------
  // Branch / review state
  // ---------------------------------------------------------------------------
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [branchPreview, setBranchPreview] = useState(null);
  const [selectedPivotalMove, setSelectedPivotalMove] = useState(null);
  const [pendingReviewJump, setPendingReviewJump] = useState(null);

  // ---------------------------------------------------------------------------
  // UI state
  // ---------------------------------------------------------------------------
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("best");
  const [isThinking, setIsThinking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEngineSettings, setShowEngineSettings] = useState(false);
  const [showTeachingReview, setShowTeachingReview] = useState(false);
  const [showReviewSummary, setShowReviewSummary] = useState(false);
  const [showGeneralSettings, setShowGeneralSettings] = useState(false);

  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------
  const {
    settings,
    setSettings,
    engineSettings,
    setEngineSettings
  } = useBoardSettings();

  // ---------------------------------------------------------------------------
  // Linear game
  // ---------------------------------------------------------------------------
  const {
    history,
    currentIndex,
    setCurrentIndex,
    gameOver,
    setGameOver,
    currentState,
    signMap,
    moves,
    isAtLatestMove,
    pushState,
    resetLinearGame,
    goToLinearMove,
    resignGame: resignLinearGame,
    buildHumanMove,
    loadMoves
  } = useLinearGame();

  // ---------------------------------------------------------------------------
  // KataGo analysis
  // ---------------------------------------------------------------------------
  const {
    evalHistory,
    chartMode,
    setChartMode,
    topMoves,
    setTopMoves,
    ownership,
    setOwnership,
    evalSummary,
    analyzePosition,
    recordEvaluation,
    showAnalysisResult,
    restoreEvaluationFromNode,
    restoreLatestLinearEvaluation,
    clearAnalysis,
    resetAnalysis
  } = useKataGoAnalysis({
    settings,
    engineSettings
  });

  // ---------------------------------------------------------------------------
  // Whole-game review
  // ---------------------------------------------------------------------------
  const {
    reviewRunning,
    reviewProgress,
    reviewReport,
    runWholeGameReview,
    clearReviewReport
  } = useWholeGameReview({
    history,
    evalHistory,
    analyzePosition
  });

  // ---------------------------------------------------------------------------
  // Review tree
  // ---------------------------------------------------------------------------
  const {
    gameTree,
    currentTreeNode,
    displayedTreeState,
    navigationLine,
    enterReviewTree,
    resetReviewTree,
    selectTreeNode,
    createTreeMove,
    goToTreeMove,
    goToTreeMoveNumber,
    applyPivotalMovesToTree
  } = useReviewTree({
    appMode,
    setAppMode,
    isReviewMode,
    isThinking,
    setIsThinking,
    settings,
    history,
    evalHistory,
    analyzePosition,
    showAnalysisResult,
    clearAnalysis
  });

  // ---------------------------------------------------------------------------
  // Displayed state
  // ---------------------------------------------------------------------------
  const {
    displayedState,
    displayedBoard,
    displayedMoves
  } = useDisplayedGameState({
    isReviewMode,
    displayedTreeState,
    currentState
  });

  // ---------------------------------------------------------------------------
  // Manual analysis
  // ---------------------------------------------------------------------------
  const {
    analyzeCurrentPosition
  } = useManualAnalysis({
    isThinking,
    setIsThinking,
    displayedState,
    settings,
    analyzePosition,
    showAnalysisResult,
    recordEvaluation
  });

  // ---------------------------------------------------------------------------
  // Review current move
  // ---------------------------------------------------------------------------
  const reviewCurrentMove = useReviewCurrentMove({
    isThinking,
    setIsThinking,
    displayedState,
    displayedMoves,
    isReviewMode,
    navigationLine,
    history,
    settings,
    analyzePosition,
    showAnalysisResult,
    setSelectedPivotalMove,
    setActiveTab
  });

  // ---------------------------------------------------------------------------
  // Clock
  // ---------------------------------------------------------------------------
  const {
    blackTime,
    whiteTime,
    activeColor
  } = useGameClock({
    settings,
    appMode,
    gameOver,
    isThinking,
    moves: displayedMoves
  });

  // ---------------------------------------------------------------------------
  // Auto-save completed games
  // ---------------------------------------------------------------------------
  useAutoSaveFinishedGame({
    gameOver,
    moves,
    settings
  });

  // ---------------------------------------------------------------------------
  // Review actions
  // ---------------------------------------------------------------------------
  const {
    clearBranchState,
    createBranchFromTopMove,
    openAnalysisReview,
    closeReviewSummary,
    analyzePivotalMove
  } = useReviewActions({
    appMode,
    isReviewMode,
    isThinking,
    setIsThinking,

    history,
    settings,

    reviewReport,
    reviewRunning,
    runWholeGameReview,

    analyzePosition,
    showAnalysisResult,

    enterReviewTree,
    createTreeMove,
    goToTreeMoveNumber,
    applyPivotalMovesToTree,

    gameTree,

    pendingReviewJump,
    setPendingReviewJump,

    setSelectedBranchId,
    setBranchPreview,
    setSelectedPivotalMove,
    setActiveTab,
    setShowReviewSummary
  });

  // ---------------------------------------------------------------------------
  // Clear branch preview when returning to play mode
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (appMode !== "play") return;

    clearBranchState();

    if (activeTab === "branches") {
      setActiveTab("best");
    }
  }, [
    appMode,
    activeTab,
    clearBranchState
  ]);

  // ---------------------------------------------------------------------------
  // Move handlers
  // ---------------------------------------------------------------------------
  const {
    playBotMove,
    handleVertexClick
  } = useMoveHandlers({
    appMode,
    isThinking,
    setIsThinking,

    gameOver,
    showSettings,
    showEngineSettings,
    showTeachingReview,

    isAtLatestMove,
    moves,
    history,
    settings,

    pushState,
    buildHumanMove,

    analyzePosition,
    recordEvaluation,
    showAnalysisResult,

    setTopMoves,
    setOwnership,

    createTreeMove
  });

  // ---------------------------------------------------------------------------
  // Board actions
  // ---------------------------------------------------------------------------
  const {
    startNewGame,
    saveGame,
    saveGameAs,
    loadGame,
    passMove,
    resignGame
  } = useBoardActions({
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
  });

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------
  const {
    goToMove,
    jumpToMoveNumber
  } = useBoardNavigation({
    isReviewMode,
    goToLinearMove,
    goToTreeMove,
    goToTreeMoveNumber,
    navigationLine,
    history,
    currentTreeNode,
    currentIndex,
    showSettings,
    showEngineSettings,
    showTeachingReview,
    clearBranchState
  });

  // ---------------------------------------------------------------------------
  // Review-mode effects
  // ---------------------------------------------------------------------------
  useRestoreTreeEvaluation({
    appMode,
    isReviewMode,
    currentTreeNode,
    restoreEvaluationFromNode
  });

  useAutoWholeGameReview({
    isReviewMode,
    reviewReport,
    reviewRunning,
    history,
    runWholeGameReview
  });

  // ---------------------------------------------------------------------------
  // Mode switching
  // ---------------------------------------------------------------------------
  const switchMode = useCallback((mode) => {
    if (isThinking || mode === appMode) return;

    if (mode === "play") {
      setAppMode("play");
      setCurrentIndex(history.length - 1);
      clearBranchState();
      setShowTeachingReview(false);
      setTopMoves([]);
      setOwnership(null);
      setSelectedPivotalMove(null);
      setActiveTab("best");

      restoreLatestLinearEvaluation(history);
      return;
    }

    if (mode === "review" || mode === "teaching") {
      enterReviewTree(mode);
      clearBranchState();
      setShowTeachingReview(false);
      setActiveTab(showReviewSummary ? "review" : "best");
    }
  }, [
    appMode,
    isThinking,
    history,
    enterReviewTree,
    restoreLatestLinearEvaluation,
    setCurrentIndex,
    setTopMoves,
    setOwnership,
    clearBranchState,
    showReviewSummary
  ]);

  // ---------------------------------------------------------------------------
  // Board renderer
  // ---------------------------------------------------------------------------
  const containerRef = useBoardRenderer({
    signMap: displayedBoard,
    vertexSize: VERTEX_SIZE,
    onVertexClick: handleVertexClick
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <BoardLayout
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}

      appMode={appMode}
      switchMode={switchMode}

      settings={settings}
      setSettings={setSettings}

      showSettings={showSettings}
      setShowSettings={setShowSettings}
      showEngineSettings={showEngineSettings}
      setShowEngineSettings={setShowEngineSettings}
      showTeachingReview={showTeachingReview}
      setShowTeachingReview={setShowTeachingReview}

      engineSettings={engineSettings}
      setEngineSettings={setEngineSettings}

      isReviewMode={isReviewMode}
      currentTreeNode={currentTreeNode}
      navigationLine={navigationLine}

      currentIndex={currentIndex}
      history={history}
      isThinking={isThinking}
      gameOver={gameOver}
      isAtLatestMove={isAtLatestMove}

      jumpToMoveNumber={jumpToMoveNumber}
      goToMove={goToMove}
      passMove={passMove}
      resignGame={resignGame}

      containerRef={containerRef}
      ownership={ownership}
      topMoves={topMoves}
      displayedMoves={displayedMoves}
      displayedState={displayedState}

      evalHistory={evalHistory}
      evalSummary={evalSummary}
      chartMode={chartMode}
      setChartMode={setChartMode}

      activeTab={activeTab}
      setActiveTab={setActiveTab}

      branches={branches}
      selectedBranchId={selectedBranchId}
      branchPreview={branchPreview}
      createBranchFromTopMove={createBranchFromTopMove}
      clearBranchPreview={clearBranchState}
      setBranchPreview={setBranchPreview}

      gameTree={gameTree}
      selectTreeNode={selectTreeNode}

      startNewGame={startNewGame}
      setCurrentIndex={setCurrentIndex}

      saveGame={saveGame}
      saveGameAs={saveGameAs}
      loadGame={loadGame}

      blackTime={blackTime}
      whiteTime={whiteTime}
      activeColor={activeColor}

      showReviewSummary={showReviewSummary}
      setShowReviewSummary={setShowReviewSummary}
      openAnalysisReview={openAnalysisReview}
      closeReviewSummary={closeReviewSummary}

      reviewRunning={reviewRunning}
      reviewProgress={reviewProgress}
      reviewReport={reviewReport}
      runWholeGameReview={runWholeGameReview}
      clearReviewReport={clearReviewReport}
      reviewCurrentMove={reviewCurrentMove}

      selectedPivotalMove={selectedPivotalMove}
      analyzePivotalMove={analyzePivotalMove}
      analyzeCurrentPosition={analyzeCurrentPosition}

      showGeneralSettings={showGeneralSettings}
      setShowGeneralSettings={setShowGeneralSettings}
    />
  );
}

function useDisplayedGameState({
  isReviewMode,
  displayedTreeState,
  currentState
}) {
  const displayedState = isReviewMode ? displayedTreeState : currentState;

  return {
    displayedState,
    displayedBoard: displayedState.board,
    displayedMoves: displayedState.moves
  };
}

function useAutoSaveFinishedGame({
  gameOver,
  moves,
  settings
}) {
  const [lastAutoSavedMoveCount, setLastAutoSavedMoveCount] = useState(0);

  useEffect(() => {
    if (!gameOver) return;
    if (!moves || moves.length === 0) return;
    if (lastAutoSavedMoveCount === moves.length) return;

    autoSaveFinishedGame({
      userId: settings.userId || "default-user",
      moves,
      settings
    });

    setLastAutoSavedMoveCount(moves.length);
  }, [
    gameOver,
    moves,
    settings,
    lastAutoSavedMoveCount
  ]);

  useEffect(() => {
    if (moves.length === 0) {
      setLastAutoSavedMoveCount(0);
    }
  }, [
    moves.length
  ]);
}

function useReviewCurrentMove({
  isThinking,
  setIsThinking,
  displayedState,
  displayedMoves,
  isReviewMode,
  navigationLine,
  history,
  settings,
  analyzePosition,
  showAnalysisResult,
  setSelectedPivotalMove,
  setActiveTab
}) {
  return useCallback(async () => {
    if (isThinking || !displayedState) return;

    const moveNumber = displayedMoves.length;

    if (moveNumber <= 0) {
      alert("No move to review yet.");
      return;
    }

    setIsThinking(true);

    try {
      const beforeIndex = Math.max(0, moveNumber - 1);

      const beforeState = isReviewMode
        ? navigationLine[beforeIndex]
        : history[beforeIndex];

      if (!beforeState) {
        alert("Could not find the previous position.");
        return;
      }

      const reviewedMove = displayedMoves[displayedMoves.length - 1];

      const result = await analyzePosition(
        beforeState.moves,
        settings.showTerritory
      );

      showAnalysisResult(result, beforeState.board);

      setSelectedPivotalMove({
        moveNumber,
        move: reviewedMove,
        label: `Move ${moveNumber}: ${reviewedMove?.[0]} ${reviewedMove?.[1]}`,
        analyzedAtMoveNumber: beforeIndex,
        alternativesForMoveNumber: moveNumber,
        alternativesForColor: reviewedMove?.[0],
        result,
        manuallyReviewed: true
      });

      setActiveTab("best");
    } catch (err) {
      console.error("Current move review failed:", err);
      alert("Failed to review this move.");
    } finally {
      setIsThinking(false);
    }
  }, [
    isThinking,
    displayedState,
    displayedMoves,
    isReviewMode,
    navigationLine,
    history,
    analyzePosition,
    settings.showTerritory,
    showAnalysisResult,
    setSelectedPivotalMove,
    setActiveTab,
    setIsThinking
  ]);
}

function useRestoreTreeEvaluation({
  appMode,
  isReviewMode,
  currentTreeNode,
  restoreEvaluationFromNode
}) {
  useEffect(() => {
    if (!isReviewMode) return;

    restoreEvaluationFromNode(currentTreeNode, appMode);
  }, [
    appMode,
    isReviewMode,
    currentTreeNode,
    restoreEvaluationFromNode
  ]);
}

function useAutoWholeGameReview({
  isReviewMode,
  reviewReport,
  reviewRunning,
  history,
  runWholeGameReview
}) {
  useEffect(() => {
    if (!isReviewMode) return;
    if (reviewReport || reviewRunning) return;
    if (!history || history.length <= 1) return;

    runWholeGameReview();
  }, [
    isReviewMode,
    reviewReport,
    reviewRunning,
    history,
    runWholeGameReview
  ]);
}

export default Board;
