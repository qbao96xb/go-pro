import { useCallback } from "react";

import {
  coordToXY,
  playMoveOnBoard
} from "../utils/goUtils";

export default function useMoveHandlers({
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
}) {
  const playBotMove = useCallback(
    async (baseState) => {
      setIsThinking(true);

      try {
        const result = await analyzePosition(
          baseState.moves,
          settings.showTerritory
        );

        const blackWinrate = result.rootInfo?.winrate ?? null;
        const candidates = result.moveInfos || [];

        setTopMoves([]);
        setOwnership(null);
        recordEvaluation(baseState.moves, result, null);

        if (candidates.length === 0) return;

        const botColorLetter = baseState.moves.length % 2 === 0 ? "B" : "W";
        const botColor = botColorLetter === "B" ? 1 : -1;
        const botCoord = candidates[0].move;

        if (!botCoord || botCoord.toLowerCase() === "pass") {
          const newMoves = [...baseState.moves, [botColorLetter, "pass"]];

          pushState({
            board: baseState.board,
            moves: newMoves,
            captures: baseState.captures,
            feedback: `KataGo passed as ${botColorLetter}.`
          });

          return;
        }

        const xy = coordToXY(botCoord);
        if (!xy) return;

        const [botX, botY] = xy;

        const previousBoard =
          history[baseState.moves.length - 1]?.board || null;

        const moveResult = playMoveOnBoard(
          baseState.board,
          botX,
          botY,
          botColor,
          previousBoard
        );

        if (!moveResult.legal) return;

        const newMoves = [...baseState.moves, [botColorLetter, botCoord]];
        const newCaptures = { ...baseState.captures };

        if (botColorLetter === "B") {
          newCaptures.B += moveResult.captured;
        } else {
          newCaptures.W += moveResult.captured;
        }

        const winText =
          blackWinrate === null
            ? "unknown"
            : `${(blackWinrate * 100).toFixed(1)}%`;

        pushState({
          board: moveResult.board,
          moves: newMoves,
          captures: newCaptures,
          feedback: `KataGo played ${botColorLetter} ${botCoord}. Black win rate before reply: ${winText}.`
        });

        try {
          const afterBotResult = await analyzePosition(
            newMoves,
            settings.showTerritory
          );

          showAnalysisResult(afterBotResult, moveResult.board);
          recordEvaluation(newMoves, afterBotResult, botColorLetter);
        } catch (analysisErr) {
          console.error("Post-bot analysis failed:", analysisErr);
        }
      } catch (err) {
        console.error("Bot move failed:", err);
      } finally {
        setIsThinking(false);
      }
    },
    [
      analyzePosition,
      settings.showTerritory,
      history,
      pushState,
      setTopMoves,
      setOwnership,
      recordEvaluation,
      showAnalysisResult,
      setIsThinking
    ]
  );

  const handleVertexClick = useCallback(
    async (evt, [x, y]) => {
      if (
        isThinking ||
        (appMode === "play" && gameOver) ||
        showSettings ||
        showEngineSettings ||
        showTeachingReview
      ) {
        return;
      }

      if (appMode === "play") {
        if (!isAtLatestMove) {
          alert("You are viewing an old move. Go to the latest move before playing.");
          return;
        }

        const currentTurn = moves.length % 2 === 0 ? "B" : "W";
        const currentPlayerType =
          currentTurn === "B" ? settings.blackType : settings.whiteType;

        if (currentPlayerType !== "human") return;

        const builtMove = buildHumanMove(x, y);

        if (!builtMove.legal) {
          alert(builtMove.reason);
          return;
        }

        const {
          currentTurn: playedColor,
          moveResult,
          nextState
        } = builtMove;

        const newMoves = nextState.moves;

        pushState(nextState);
        setTopMoves([]);
        setOwnership(null);

        const nextTurn = newMoves.length % 2 === 0 ? "B" : "W";
        const nextPlayerType =
          nextTurn === "B" ? settings.blackType : settings.whiteType;

        if (nextPlayerType === "bot") {
          await playBotMove(nextState);
          return;
        }

        if (settings.autoAnalyzeAfterMove) {
          try {
            const result = await analyzePosition(
              newMoves,
              settings.showTerritory
            );

            showAnalysisResult(result, moveResult.board);
            recordEvaluation(newMoves, result, playedColor);
          } catch (err) {
            console.error("Human move analysis failed:", err);
          }
        }

        return;
      }

      if (appMode === "review") {
        await createTreeMove(x, y, false);
        return;
      }

      if (appMode === "teaching") {
        await createTreeMove(x, y, true);
      }
    },
    [
      appMode,
      isThinking,
      gameOver,
      showSettings,
      showEngineSettings,
      showTeachingReview,
      isAtLatestMove,
      moves,
      settings,
      pushState,
      buildHumanMove,
      playBotMove,
      analyzePosition,
      recordEvaluation,
      showAnalysisResult,
      createTreeMove,
      setTopMoves,
      setOwnership
    ]
  );

  return {
    playBotMove,
    handleVertexClick
  };
}
