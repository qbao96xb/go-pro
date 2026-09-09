import { useCallback, useMemo, useRef, useState } from "react";

import {
  createInitialGameTree,
  historyToGameTree,
  getCurrentNode,
  getMovesToNode,
  getNextMoveColorFromNode,
  addChildMove,
  createNodeId,
  getFirstChild,
  getNodeLine,
  getBranchAwareLine,
  findNodeByMoveNumberOnCurrentLine,
  markPivotalMovesOnMainLine
} from "../utils/gameTreeUtils";

import {
  createEmptyBoard,
  xyToCoord,
  playMoveOnBoard
} from "../utils/goUtils";

export default function useReviewTree({
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
}) {
  const reviewTreeInitializedRef = useRef(false);

  const [gameTree, setGameTree] = useState(() =>
    createInitialGameTree(createEmptyBoard)
  );

  const currentTreeNode = getCurrentNode(gameTree);
  const treeMoves = getMovesToNode(gameTree, gameTree.currentNodeId);

  const displayedTreeState = useMemo(() => ({
    board: currentTreeNode.board,
    moves: treeMoves,
    captures: currentTreeNode.captures,
    feedback:
      currentTreeNode.comment ||
      `Reviewing move ${currentTreeNode.moveNumber}.`
  }), [currentTreeNode, treeMoves]);

  const navigationLine = useMemo(() => {
    return getBranchAwareLine(gameTree, gameTree.currentNodeId);
  }, [gameTree]);

  const resetReviewTree = useCallback(() => {
    reviewTreeInitializedRef.current = false;
    setGameTree(createInitialGameTree(createEmptyBoard));
  }, []);

  const selectTreeNode = useCallback((nodeId) => {
    setGameTree(prev => {
      if (!prev.nodes[nodeId]) return prev;

      return {
        ...prev,
        currentNodeId: nodeId
      };
    });
  }, []);

  const enterReviewTree = useCallback((mode) => {
    if (isThinking) return;

    const tree = historyToGameTree(
      history,
      evalHistory,
      reviewTreeInitializedRef.current ? gameTree : null
    );

    if (appMode === "play") {
      tree.currentNodeId = history.length === 1
        ? "root"
        : `main-${history.length - 1}`;
    }

    reviewTreeInitializedRef.current = true;

    setGameTree(tree);
    setAppMode(mode);
    clearAnalysis();
  }, [
    appMode,
    isThinking,
    history,
    evalHistory,
    gameTree,
    setAppMode,
    clearAnalysis
  ]);

  const createTreeMove = useCallback(
    async (x, y, shouldAnalyze = false) => {
      if (!isReviewMode || isThinking) return;

      const parentNode = getCurrentNode(gameTree);
      const currentTurn = getNextMoveColorFromNode(gameTree, parentNode.id);

      const previousNode = parentNode.parentId
        ? gameTree.nodes[parentNode.parentId]
        : null;

      const isPass = x === null && y === null;
      const coord = isPass ? "pass" : xyToCoord(x, y);

      const moveResult = isPass
        ? {
            legal: true,
            board: parentNode.board,
            captured: 0
          }
        : playMoveOnBoard(
            parentNode.board,
            x,
            y,
            currentTurn === "B" ? 1 : -1,
            previousNode?.board || null
          );

      if (!moveResult.legal) {
        alert(moveResult.reason);
        return;
      }

      const captures = {
        ...parentNode.captures,
        [currentTurn]:
          parentNode.captures[currentTurn] + moveResult.captured
      };

      const childNode = {
        id: createNodeId(),
        parentId: parentNode.id,
        move: [currentTurn, coord],
        moveNumber: parentNode.moveNumber + 1,
        board: moveResult.board,
        captures,
        children: [],
        mainChildId: null,
        isMainLine: false,
        comment: `${appMode === "review" ? "Review" : "Teaching"}: ${currentTurn} ${coord}.`,
        eval: null
      };

      const nextTree = addChildMove(gameTree, parentNode.id, childNode);
      const selectedId = nextTree.currentNodeId;
      const selectedNode = nextTree.nodes[selectedId];

      setGameTree(nextTree);

      if (!shouldAnalyze || appMode !== "teaching") return;

      setIsThinking(true);

      try {
        const branchMoves = getMovesToNode(nextTree, selectedId);
        const result = await analyzePosition(
          branchMoves,
          settings.showTerritory
        );

        showAnalysisResult(result, selectedNode.board);

        setGameTree(prev => {
          if (!prev.nodes[selectedId]) return prev;

          return {
            ...prev,
            nodes: {
              ...prev.nodes,
              [selectedId]: {
                ...prev.nodes[selectedId],
                eval: result
              }
            }
          };
        });
      } catch (err) {
        console.error("Teaching branch analysis failed:", err);
      } finally {
        setIsThinking(false);
      }
    },
    [
      appMode,
      isReviewMode,
      isThinking,
      gameTree,
      analyzePosition,
      settings.showTerritory,
      showAnalysisResult,
      setIsThinking
    ]
  );

  const goToTreeMove = useCallback((index) => {
    const line = getBranchAwareLine(gameTree, gameTree.currentNodeId);
    const targetIndex = Math.max(0, Math.min(index, line.length - 1));
    const targetNode = line[targetIndex];

    if (!targetNode) return;

    setGameTree(prev => ({
      ...prev,
      currentNodeId: targetNode.id
    }));
  }, [gameTree]);

  const goToTreeMoveNumber = useCallback((moveNumber) => {
    const targetNode = findNodeByMoveNumberOnCurrentLine(
      gameTree,
      gameTree.currentNodeId,
      moveNumber
    );

    if (!targetNode) return;

    setGameTree(prev => ({
      ...prev,
      currentNodeId: targetNode.id
    }));
  }, [gameTree]);

  const applyPivotalMovesToTree = useCallback((pivotalMoves = []) => {
    setGameTree(prev => markPivotalMovesOnMainLine(prev, pivotalMoves));
  }, []);

  return {
    gameTree,
    setGameTree,
    currentTreeNode,
    treeMoves,
    displayedTreeState,
    navigationLine,
    enterReviewTree,
    resetReviewTree,
    selectTreeNode,
    createTreeMove,
    goToTreeMove,
    goToTreeMoveNumber,
  applyPivotalMovesToTree
  };
}
