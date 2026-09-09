import { useCallback, useMemo, useState } from "react";

import {
  createEmptyBoard,
  xyToCoord,
  coordToXY,
  playMoveOnBoard
} from "../utils/goUtils";

const createInitialState = () => ({
  board: createEmptyBoard(),
  moves: [],
  captures: { B: 0, W: 0 },
  feedback: "New game. Black to play."
});

export default function useLinearGame() {
  const [history, setHistory] = useState([createInitialState()]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const currentState = useMemo(() => {
    return history[currentIndex] || history[history.length - 1] || createInitialState();
  }, [history, currentIndex]);

  const signMap = currentState.board;
  const moves = currentState.moves;
  const isAtLatestMove = currentIndex === history.length - 1;

  const pushState = useCallback((newState) => {
    const nextIndex = newState.moves.length;

    setHistory(prev => [
      ...prev.slice(0, nextIndex),
      newState
    ]);

    setCurrentIndex(nextIndex);
  }, []);

  const resetLinearGame = useCallback(() => {
    setHistory([createInitialState()]);
    setCurrentIndex(0);
    setGameOver(false);
  }, []);

  const goToLinearMove = useCallback((index) => {
    setCurrentIndex(() => {
      const target = Math.max(0, Math.min(index, history.length - 1));
      return target;
    });
  }, [history.length]);

  const resignGame = useCallback(() => {
    if (gameOver) return;

    const currentTurn = moves.length % 2 === 0 ? "B" : "W";
    setGameOver(true);

    setHistory(prev => {
      const copy = [...prev];

      copy[currentIndex] = {
        ...copy[currentIndex],
        feedback: `${currentTurn} resigned. Game over.`
      };

      return copy;
    });
  }, [gameOver, moves, currentIndex]);

  const buildHumanMove = useCallback((x, y) => {
    const currentTurn = moves.length % 2 === 0 ? "B" : "W";
    const color = currentTurn === "B" ? 1 : -1;

    const previousBoard =
      history.length >= 2 ? history[history.length - 2].board : null;

    const moveResult = playMoveOnBoard(signMap, x, y, color, previousBoard);

    if (!moveResult.legal) {
      return {
        legal: false,
        reason: moveResult.reason
      };
    }

    const coord = xyToCoord(x, y);
    const newMoves = [...moves, [currentTurn, coord]];
    const newCaptures = { ...currentState.captures };

    if (currentTurn === "B") {
      newCaptures.B += moveResult.captured;
    } else {
      newCaptures.W += moveResult.captured;
    }

    return {
      legal: true,
      currentTurn,
      moveResult,
      nextState: {
        board: moveResult.board,
        moves: newMoves,
        captures: newCaptures,
        feedback: `You played ${currentTurn} ${coord}.`
      }
    };
  }, [moves, history, signMap, currentState]);

  const loadMoves = useCallback((loadedMoves = []) => {
    const nextHistory = [createInitialState()];
    let board = createEmptyBoard();
    let captures = { B: 0, W: 0 };

    for (let i = 0; i < loadedMoves.length; i += 1) {
      const [colorLetter, coord] = loadedMoves[i];
      const color = colorLetter === "B" ? 1 : -1;
      const previousBoard =
        i >= 1 ? nextHistory[nextHistory.length - 2]?.board : null;

      if (!coord || coord.toLowerCase() === "pass") {
        const newMoves = [...nextHistory[nextHistory.length - 1].moves, [colorLetter, "pass"]];

        nextHistory.push({
          board,
          moves: newMoves,
          captures,
          feedback: `${colorLetter} passed.`
        });

        continue;
      }

      const xy = coordToXY(coord);

      if (!xy) {
        console.warn(`Skipped invalid SGF move: ${colorLetter} ${coord}`);
        continue;
      }

      const [x, y] = xy;
      const moveResult = playMoveOnBoard(board, x, y, color, previousBoard);

      if (!moveResult.legal) {
        console.warn(`Skipped illegal SGF move ${i + 1}: ${colorLetter} ${coord}`, moveResult.reason);
        continue;
      }

      const newCaptures = { ...captures };

      if (colorLetter === "B") {
        newCaptures.B += moveResult.captured;
      } else {
        newCaptures.W += moveResult.captured;
      }

      const newMoves = [...nextHistory[nextHistory.length - 1].moves, [colorLetter, coord]];

      board = moveResult.board;
      captures = newCaptures;

      nextHistory.push({
        board,
        moves: newMoves,
        captures,
        feedback: `Loaded move ${i + 1}: ${colorLetter} ${coord}.`
      });
    }

    setHistory(nextHistory);
    setCurrentIndex(nextHistory.length - 1);
    setGameOver(false);

    return nextHistory;
  }, []);

  return {
    history,
    setHistory,
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
    resignGame,
    buildHumanMove,
    loadMoves
  };
}
