import { useCallback, useEffect } from "react";

export default function useBoardNavigation({
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
}) {
  const goToMove = useCallback(
    (index) => {
      if (!isReviewMode) {
        goToLinearMove(index);
        return;
      }

      goToTreeMove(index);
      clearBranchState();
    },
    [
      isReviewMode,
      goToLinearMove,
      goToTreeMove,
      clearBranchState
    ]
  );

  const jumpToMoveNumber = useCallback((moveNumber) => {
    if (!isReviewMode) {
      goToLinearMove(moveNumber);
      return;
    }

    goToTreeMoveNumber(moveNumber);
  }, [
    isReviewMode,
    goToLinearMove,
    goToTreeMoveNumber
  ]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;

      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable;

      if (isTyping) return;

      if (showSettings || showEngineSettings || showTeachingReview) return;

      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      event.preventDefault();

      const step = event.shiftKey ? 10 : 1;

      const maxIndex = isReviewMode
        ? Math.max(0, navigationLine.length - 1)
        : Math.max(0, history.length - 1);

      const currentMoveIndex = isReviewMode
        ? navigationLine.findIndex(node => node.id === currentTreeNode.id)
        : currentIndex;

      const nextIndex =
        event.key === "ArrowLeft"
          ? Math.max(0, currentMoveIndex - step)
          : Math.min(maxIndex, currentMoveIndex + step);

      if (currentMoveIndex >= 0) {
        goToMove(nextIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    goToMove,
    isReviewMode,
    navigationLine,
    history,
    currentTreeNode,
    currentIndex,
    showSettings,
    showEngineSettings,
    showTeachingReview
  ]);

  return {
    goToMove,
    jumpToMoveNumber
  };
}
