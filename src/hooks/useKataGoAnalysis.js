import { useCallback, useState } from "react";
import axios from "axios";

import {
  BOARD_SIZE
} from "../utils/goUtils";

import {
  normalizeTopMoves,
  classifyPointLoss,
  estimatePointLoss,
  getBotPowerConfig
} from "../utils/analysisUtils";

function extractRawOwnership(result) {
  if (Array.isArray(result?.ownership)) {
    return result.ownership;
  }

  if (Array.isArray(result?.rootInfo?.ownership)) {
    return result.rootInfo.ownership;
  }

  return null;
}

export default function useKataGoAnalysis({
  settings,
  engineSettings
}) {
  const [evalHistory, setEvalHistory] = useState([]);
  const [chartMode, setChartMode] = useState("score");
  const [topMoves, setTopMoves] = useState([]);
  const [ownership, setOwnership] = useState(null);
  const [evalSummary, setEvalSummary] = useState({
    blackWinrate: null,
    scoreLead: null,
    lastMoveLoss: null
  });

  const analyzePosition = useCallback(
    async (moveList, includeOwnership = false, overrideVisits = null) => {
      const botConfig = getBotPowerConfig(settings.botPower);

      const selectedVisits = Number(
        overrideVisits ?? settings.maxVisits ?? botConfig.maxVisits
      );

      const res = await axios.post("http://localhost:8000/analyze", {
        moves: moveList,
        boardXSize: BOARD_SIZE,
        boardYSize: BOARD_SIZE,
        rules: settings.rules,
        komi: Number(settings.komi),
        maxVisits: selectedVisits,
        timeLimit: botConfig.timeLimit,
        botPower: settings.botPower,
        includeOwnership,
        engineSettings
      });

      return res.data;
    },
    [settings, engineSettings]
  );

  const recordEvaluation = useCallback(
    (moveList, result, playedColor = null) => {
      const blackWinrate = result.rootInfo?.winrate ?? null;
      const scoreLead = result.rootInfo?.scoreLead ?? null;

      setEvalHistory(prev => {
        const previousEval = prev.length > 0 ? prev[prev.length - 1] : null;

        const currentEval = {
          moveNumber: moveList.length,
          blackWinrate:
            typeof blackWinrate === "number" ? blackWinrate * 100 : null,
          scoreLead,
          pointLoss: null,
          quality: "-"
        };

        if (playedColor) {
          const pointLoss = estimatePointLoss(
            previousEval,
            currentEval,
            playedColor
          );

          currentEval.pointLoss = pointLoss;
          currentEval.quality = classifyPointLoss(pointLoss);
        }

        setEvalSummary({
          blackWinrate,
          scoreLead,
          lastMoveLoss: currentEval.pointLoss
        });

        return [...prev, currentEval];
      });
    },
    []
  );

  const applyAnalysisResult = useCallback((result, board, playedColor = null, moveList = null) => {
    setTopMoves(normalizeTopMoves(result.moveInfos || [], board));
    setOwnership(extractRawOwnership(result));

    setEvalSummary({
      blackWinrate: result.rootInfo?.winrate ?? null,
      scoreLead: result.rootInfo?.scoreLead ?? null,
      lastMoveLoss: null
    });

    if (moveList) {
      recordEvaluation(moveList, result, playedColor);
    }
  }, [recordEvaluation]);

  const restoreEvaluationFromNode = useCallback((node, mode = "review") => {
    const result = node?.eval;

    setEvalSummary({
      blackWinrate: result?.rootInfo?.winrate ?? null,
      scoreLead: result?.rootInfo?.scoreLead ?? null,
      lastMoveLoss: result?.pointLoss ?? null
    });

    if ((mode === "review" || mode === "teaching") && result) {
      setTopMoves(normalizeTopMoves(result.moveInfos || [], node.board));
      setOwnership(extractRawOwnership(result));
    } else {
      setTopMoves([]);
      setOwnership(null);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setTopMoves([]);
    setOwnership(null);
    setEvalSummary({
      blackWinrate: null,
      scoreLead: null,
      lastMoveLoss: null
    });
  }, []);

  const resetAnalysis = useCallback(() => {
    setEvalHistory([]);
    setTopMoves([]);
    setOwnership(null);
    setEvalSummary({
      blackWinrate: null,
      scoreLead: null,
      lastMoveLoss: null
    });
    setChartMode("score");
  }, []);

  const restoreLatestLinearEvaluation = useCallback((history) => {
    const latestState = history[history.length - 1];
    const latest = [...evalHistory].reverse().find(
      entry => entry.moveNumber === latestState.moves.length
    );

    setEvalSummary({
      blackWinrate: Number.isFinite(latest?.blackWinrate)
        ? latest.blackWinrate / 100
        : null,
      scoreLead: latest?.scoreLead ?? null,
      lastMoveLoss: latest?.pointLoss ?? null
    });
  }, [evalHistory]);

  const showAnalysisResult = useCallback((result, board) => {
    setTopMoves(normalizeTopMoves(result.moveInfos || [], board));
    setOwnership(extractRawOwnership(result));

    setEvalSummary({
      blackWinrate: result.rootInfo?.winrate ?? null,
      scoreLead: result.rootInfo?.scoreLead ?? null,
      lastMoveLoss: null
    });
  }, []);

  return {
    evalHistory,
    setEvalHistory,
    chartMode,
    setChartMode,
    topMoves,
    setTopMoves,
    ownership,
    setOwnership,
    evalSummary,
    setEvalSummary,
    analyzePosition,
    recordEvaluation,
    applyAnalysisResult,
    restoreEvaluationFromNode,
    restoreLatestLinearEvaluation,
    showAnalysisResult,
    clearAnalysis,
    resetAnalysis
  };
}
