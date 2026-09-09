import { useCallback, useEffect } from "react";

import {
  coordToXY
} from "../utils/goUtils";

export default function useReviewActions({
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
}) {
  const clearBranchState = useCallback(() => {
    setSelectedBranchId(null);
    setBranchPreview(null);
  }, [
    setSelectedBranchId,
    setBranchPreview
  ]);

  const openBestMovesTab = useCallback(() => {
    setActiveTab("best");
  }, [
    setActiveTab
  ]);

  const enterReviewModeAtMove = useCallback((moveNumber) => {
    const targetIndex = Math.max(0, moveNumber);

    if (!isReviewMode) {
      setPendingReviewJump(targetIndex);
      enterReviewTree("review");
      return;
    }

    goToTreeMoveNumber(targetIndex);
  }, [
    isReviewMode,
    enterReviewTree,
    goToTreeMoveNumber,
    setPendingReviewJump
  ]);

  const createBranchFromTopMove = useCallback(
    async (topMove) => {
      if (isThinking || !topMove?.move) return;

      if (!isReviewMode) {
        alert("Please choose a pivotal move first. The app will enter Review Mode, then you can create branches.");
        return;
      }

      const shouldAnalyzeBranch = appMode === "teaching";

      if (topMove.move.toLowerCase() === "pass") {
        await createTreeMove(null, null, shouldAnalyzeBranch);
        openBestMovesTab();
        return;
      }

      const xy = coordToXY(topMove.move);
      if (!xy) return;

      await createTreeMove(xy[0], xy[1], shouldAnalyzeBranch);
      openBestMovesTab();
    },
    [
      appMode,
      isReviewMode,
      isThinking,
      createTreeMove,
      openBestMovesTab
    ]
  );

  const openAnalysisReview = useCallback(async () => {
    setShowReviewSummary(true);
    setActiveTab("review");

    if (!reviewReport && !reviewRunning) {
      await runWholeGameReview();
    }
  }, [
    reviewReport,
    reviewRunning,
    runWholeGameReview,
    setShowReviewSummary,
    setActiveTab
  ]);

  const closeReviewSummary = useCallback(() => {
    setShowReviewSummary(false);
    setSelectedPivotalMove(null);

    setActiveTab(prev => prev === "review" ? "best" : prev);
  }, [
    setShowReviewSummary,
    setSelectedPivotalMove,
    setActiveTab
  ]);

  const analyzePivotalMove = useCallback(async (pivotalMove) => {
    if (!pivotalMove || isThinking) return;

    setIsThinking(true);

    try {
      const moveNumber = pivotalMove.moveNumber;

      // For Move N, analyze position after Move N-1.
      // This shows alternatives for the actual pivotal move.
      const beforeMoveIndex = Math.max(0, moveNumber - 1);
      const beforeState = history[beforeMoveIndex];

      if (!beforeState) {
        alert("Could not find the position before this move.");
        return;
      }

      const result = await analyzePosition(
        beforeState.moves,
        settings.showTerritory
      );

      showAnalysisResult(result, beforeState.board);

      if (!isReviewMode) {
        setPendingReviewJump(beforeMoveIndex);
        enterReviewTree("review");
      } else {
        goToTreeMoveNumber(beforeMoveIndex);
      }

      setSelectedPivotalMove({
        ...pivotalMove,
        analyzedAtMoveNumber: beforeMoveIndex,
        alternativesForMoveNumber: moveNumber,
        alternativesForColor: pivotalMove.move?.[0] ?? null,
        result
      });

      setShowReviewSummary(true);
      setActiveTab("best");
    } catch (err) {
      console.error("Pivotal move analysis failed:", err);
      alert("Failed to analyze this pivotal move.");
    } finally {
      setIsThinking(false);
    }
  }, [
    isThinking,
    isReviewMode,
    history,
    settings.showTerritory,
    analyzePosition,
    showAnalysisResult,
    enterReviewTree,
    goToTreeMoveNumber,
    setPendingReviewJump,
    setSelectedPivotalMove,
    setShowReviewSummary,
    setActiveTab,
    setIsThinking
  ]);

  useEffect(() => {
    if (!reviewReport?.pivotalMoves) return;

    applyPivotalMovesToTree(reviewReport.pivotalMoves);
  }, [
    reviewReport,
    applyPivotalMovesToTree
  ]);

  useEffect(() => {
    if (pendingReviewJump === null) return;
    if (!isReviewMode) return;
    if (!gameTree?.currentNodeId) return;

    goToTreeMoveNumber(pendingReviewJump);
    setPendingReviewJump(null);
  }, [
    pendingReviewJump,
    isReviewMode,
    gameTree,
    goToTreeMoveNumber,
    setPendingReviewJump
  ]);

  return {
    clearBranchState,
    openBestMovesTab,
    enterReviewModeAtMove,
    createBranchFromTopMove,
    openAnalysisReview,
    closeReviewSummary,
    analyzePivotalMove
  };
}
