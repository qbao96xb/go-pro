import { useCallback, useState } from "react";

function getMoveLabel(moveNumber, move) {
  if (!move) return `Move ${moveNumber}`;
  return `Move ${moveNumber}: ${move[0]} ${move[1]}`;
}

function getPhase(moveNumber) {
  if (moveNumber < 50) return "opening";
  if (moveNumber < 150) return "middle game";
  return "endgame";
}

function scoreLossForPlayer(prevScore, currentScore, playedColor) {
  if (typeof prevScore !== "number" || typeof currentScore !== "number") {
    return null;
  }

  const diff = currentScore - prevScore;

  // scoreLead is from Black perspective.
  // If Black played, losing points means scoreLead decreased.
  // If White played, losing points means scoreLead increased.
  if (playedColor === "B") {
    return Math.max(0, -diff);
  }

  if (playedColor === "W") {
    return Math.max(0, diff);
  }

  return Math.abs(diff);
}

function classifyMistake(loss) {
  if (loss >= 8) return "critical";
  if (loss >= 4) return "major";
  if (loss >= 2) return "moderate";
  return "minor";
}

function buildStrengths({ analyzedMoves, pivotalMoves }) {
  const total = analyzedMoves.length || 1;

  const minorRatio =
    analyzedMoves.filter(m => (m.pointLoss ?? 0) < 2).length / total;

  const openingMistakes =
    pivotalMoves.filter(m => m.phase === "opening" && m.pointLoss >= 4).length;

  const endgameMistakes =
    pivotalMoves.filter(m => m.phase === "endgame" && m.pointLoss >= 3).length;

  const strengths = [];

  if (minorRatio >= 0.65) {
    strengths.push("You kept many moves close to the engine recommendation, showing stable basic direction.");
  }

  if (openingMistakes <= 1) {
    strengths.push("Your opening was relatively stable, with few large early losses.");
  }

  if (endgameMistakes <= 1) {
    strengths.push("Your endgame did not contain many large point-loss mistakes.");
  }

  if (strengths.length < 3) {
    strengths.push("You created several playable positions instead of collapsing immediately after one mistake.");
  }

  if (strengths.length < 3) {
    strengths.push("Your move choices show enough consistency for productive review and improvement.");
  }

  return strengths.slice(0, 3);
}

function buildWeaknesses({ pivotalMoves }) {
  const weaknesses = [];

  const openingCount = pivotalMoves.filter(m => m.phase === "opening").length;
  const middleCount = pivotalMoves.filter(m => m.phase === "middle game").length;
  const endgameCount = pivotalMoves.filter(m => m.phase === "endgame").length;

  if (middleCount >= openingCount && middleCount >= endgameCount && middleCount > 0) {
    weaknesses.push("Most serious losses happened in the middle game, likely from fighting direction, shape, or local judgment.");
  }

  if (openingCount > middleCount && openingCount > 0) {
    weaknesses.push("Several early losses appeared in the opening, suggesting direction-of-play and fuseki choices need review.");
  }

  if (endgameCount > middleCount && endgameCount > 0) {
    weaknesses.push("Several losses appeared in the endgame, suggesting endgame counting and sente/gote judgment need work.");
  }

  const criticalCount = pivotalMoves.filter(m => m.severity === "critical").length;

  if (criticalCount > 0) {
    weaknesses.push("There were critical point swings where one local decision changed the game evaluation significantly.");
  }

  if (pivotalMoves.length >= 5) {
    weaknesses.push("You had repeated medium-to-large losses, so consistency is currently a bigger issue than one single blunder.");
  }

  if (weaknesses.length < 3) {
    weaknesses.push("Some moves may have focused too much on local fighting while missing larger board-value alternatives.");
  }

  if (weaknesses.length < 3) {
    weaknesses.push("Your shape and follow-up choices should be checked around the pivotal moves.");
  }

  return weaknesses.slice(0, 3);
}

function buildRecommendations({ pivotalMoves }) {
  const recommendations = [
    "Review the top 3 pivotal moves first, not every move equally.",
    "For each mistake, compare your move with the engine's top move and ask what changed globally.",
    "Before starting a local fight, check whether a bigger move exists elsewhere.",
    "When attacking, ask whether you are gaining profit, building strength, or only chasing.",
    "When defending, prefer moves that also create future sente or territory.",
    "Study the principal variation for 3-5 moves after each pivotal move.",
    "Track whether your losses come mostly from opening, middle game, or endgame.",
    "Practice reading short forcing sequences before playing contact or cut moves."
  ];

  const hasManyMiddleGame =
    pivotalMoves.filter(m => m.phase === "middle game").length >= 3;

  if (hasManyMiddleGame) {
    recommendations.unshift("Focus on middle-game fighting direction: do not fight locally unless the result improves your global position.");
  }

  return recommendations.slice(0, 10);
}

export default function useWholeGameReview({
  history,
  evalHistory,
  analyzePosition
}) {
  const [reviewRunning, setReviewRunning] = useState(false);
  const [reviewProgress, setReviewProgress] = useState({
    current: 0,
    total: 0
  });
  const [reviewReport, setReviewReport] = useState(null);

  const runWholeGameReview = useCallback(async () => {
    if (reviewRunning || !history || history.length <= 1) return;

    const totalMoves = Math.max(0, history.length - 1);

    setReviewRunning(true);
    setReviewProgress({
      current: 0,
      total: totalMoves
    });

    const analyzedMoves = [];
    const pivotalMoves = [];

    try {
      for (let i = 1; i < history.length; i += 1) {
        const state = history[i];
        const moveNumber = state.moves.length;

        setReviewProgress({
          current: i,
          total: totalMoves
        });

        const result = await analyzePosition(state.moves, true);

        const currentScore = result.rootInfo?.scoreLead ?? null;
        const currentWinrate = result.rootInfo?.winrate ?? null;

        const previousEval =
          analyzedMoves.length > 0
            ? analyzedMoves[analyzedMoves.length - 1]
            : null;

        const lastMove =
          state.moves.length > 0
            ? state.moves[state.moves.length - 1]
            : null;

        const playedColor = lastMove?.[0] ?? null;

        const pointLoss = previousEval
          ? scoreLossForPlayer(previousEval.scoreLead, currentScore, playedColor)
          : null;

        const winrateSwing =
          previousEval && typeof previousEval.blackWinrate === "number" && typeof currentWinrate === "number"
            ? Math.abs(currentWinrate - previousEval.blackWinrate)
            : null;

        const analyzedMove = {
          moveNumber,
          move: lastMove,
          label: getMoveLabel(moveNumber, lastMove),
          phase: getPhase(moveNumber),
          scoreLead: currentScore,
          blackWinrate: currentWinrate,
          pointLoss,
          winrateSwing,
          result
        };

        analyzedMoves.push(analyzedMove);
        setReviewProgress({
          current: Math.min(i + 1, totalMoves),
          total: totalMoves
        });

        if (
          moveNumber > 0 &&
          (
            (typeof pointLoss === "number" && pointLoss >= 2) ||
            (typeof winrateSwing === "number" && winrateSwing >= 0.08)
          )
        ) {
          const topMove = result.moveInfos?.[0] ?? null;

          pivotalMoves.push({
            ...analyzedMove,
            severity: classifyMistake(pointLoss ?? 0),
            topMove
          });
        }
      }

      const sortedPivotalMoves = [...pivotalMoves]
        .sort((a, b) => (b.pointLoss ?? 0) - (a.pointLoss ?? 0))
        .slice(0, 12);

      const reportBase = {
        analyzedMoves,
        pivotalMoves: sortedPivotalMoves
      };

      setReviewReport({
        analyzedMoves,
        pivotalMoves: sortedPivotalMoves,
        strengths: buildStrengths(reportBase),
        weaknesses: buildWeaknesses(reportBase),
        recommendations: buildRecommendations(reportBase)
      });

      setReviewProgress({
        current: totalMoves,
        total: totalMoves
      });
    } catch (err) {
      console.error("Whole game review failed:", err);
      alert("Whole-game review failed. Please check KataGo/backend connection.");
    } finally {
      setReviewRunning(false);
    }
  }, [
    reviewRunning,
    history,
    analyzePosition
  ]);

  const clearReviewReport = useCallback(() => {
    setReviewReport(null);
    setReviewProgress({
      current: 0,
      total: 0
    });
  }, []);

  return {
    reviewRunning,
    reviewProgress,
    reviewReport,
    runWholeGameReview,
    clearReviewReport
  };
}
