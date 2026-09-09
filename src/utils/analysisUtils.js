import {
  BOARD_SIZE,
  coordToXY
} from "./goUtils";

export const TOP_MOVE_DISPLAY_LIMIT = 20;
export const TOP_MOVE_LABEL_LIMIT = 6;
export const TERRITORY_CONFIDENCE_THRESHOLD = 0.55;

export function normalizeTopMoves(moveInfos, board = null) {
  const validMoves = (moveInfos || [])
    .filter(move => move.move && move.move.toLowerCase() !== "pass")
    .map(move => {
      const xy = coordToXY(move.move);
      if (!xy) return null;

      const [x, y] = xy;

      if (board && board[y][x] !== 0) return null;

      return {
        ...move,
        x,
        y,
        scoreLead: typeof move.scoreLead === "number" ? move.scoreLead : null,
        policy: typeof move.prior === "number" ? move.prior : null
      };
    })
    .filter(Boolean)
    .slice(0, TOP_MOVE_DISPLAY_LIMIT);

  if (validMoves.length === 0) return [];

  const scoreValues = validMoves
    .map(move => move.scoreLead)
    .filter(value => typeof value === "number");

  const maxScore = scoreValues.length ? Math.max(...scoreValues) : 0;
  const minScore = scoreValues.length ? Math.min(...scoreValues) : 0;
  const range = Math.max(0.01, maxScore - minScore);

  return validMoves.map((move, index) => {
    const normalized =
      move.scoreLead === null
        ? 0.4
        : (move.scoreLead - minScore) / range;

    return {
      ...move,
      rank: index + 1,
      intensity: 0.05 + normalized * 0.22
    };
  });
}

export function normalizeOwnership(rawOwnership) {
  if (!rawOwnership || !Array.isArray(rawOwnership)) return [];

  const points = [];

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const index = y * BOARD_SIZE + x;
      const value = rawOwnership[index];

      if (typeof value !== "number") continue;

      if (Math.abs(value) < TERRITORY_CONFIDENCE_THRESHOLD) continue;

      points.push({
        x,
        y,
        owner: value > 0 ? "B" : "W",
        confidence: Math.abs(value)
      });
    }
  }

  return points;
}

export function classifyPointLoss(pointLoss) {
  if (pointLoss === null || pointLoss === undefined) return "-";
  if (pointLoss < 0.5) return "Excellent";
  if (pointLoss < 1.5) return "Good";
  if (pointLoss < 3.0) return "Inaccuracy";
  if (pointLoss < 6.0) return "Mistake";
  return "Blunder";
}

export function estimatePointLoss(previousEval, currentEval, playedColor) {
  if (!previousEval || !currentEval) return null;

  if (
    typeof previousEval.scoreLead !== "number" ||
    typeof currentEval.scoreLead !== "number"
  ) {
    return null;
  }

  const rawLoss =
    playedColor === "B"
      ? previousEval.scoreLead - currentEval.scoreLead
      : currentEval.scoreLead - previousEval.scoreLead;

  return Math.max(0, rawLoss);
}

export function getBotPowerConfig(botPower) {
  const configs = {
    beginner: {
      label: "Beginner",
      rank: "20k",
      maxVisits: 30,
      timeLimit: 0.3,
      description: "Very weak and fast. Good for absolute beginners."
    },
    weak: {
      label: "Weak",
      rank: "10k",
      maxVisits: 80,
      timeLimit: 0.6,
      description: "Weak amateur level."
    },
    normal: {
      label: "Normal",
      rank: "5k",
      maxVisits: 300,
      timeLimit: 1.5,
      description: "Default balanced strength."
    },
    strong: {
      label: "Strong",
      rank: "1d",
      maxVisits: 900,
      timeLimit: 3.0,
      description: "Strong amateur level."
    },
    dan: {
      label: "Dan",
      rank: "5d",
      maxVisits: 1800,
      timeLimit: 5.0,
      description: "High dan-level analysis."
    },
    max: {
      label: "Maximum",
      rank: "AI",
      maxVisits: 5000,
      timeLimit: 10.0,
      description: "Very strong but slower."
    }
  };

  return configs[botPower] || configs.normal;
}

export const BOT_POWER_OPTIONS = [
  { value: "beginner", label: "Beginner - 20k" },
  { value: "weak", label: "Weak - 10k" },
  { value: "normal", label: "Normal - 5k" },
  { value: "strong", label: "Strong - 1d" },
  { value: "dan", label: "Dan - 5d" },
  { value: "max", label: "Maximum - AI" }
];

export const TIME_SYSTEM_OPTIONS = [
  { value: "none", label: "No clock" },
  { value: "absolute", label: "Absolute time" },
  { value: "byoyomi", label: "Japanese Byo-yomi" }
];

export function formatClockTime(seconds) {
  if (seconds === null || seconds === undefined) return "--:--";

  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const restSeconds = safeSeconds % 60;

  return `${minutes}:${String(restSeconds).padStart(2, "0")}`;
}

export function rankToBotPower(rank) {
  if (!rank || typeof rank !== "string") return 0.5;

  const value = Number.parseInt(rank, 10);

  if (rank.endsWith("k")) {
    // 30k weakest, 1k close to dan.
    return Math.max(0.05, Math.min(0.75, (31 - value) / 40));
  }

  if (rank.endsWith("d")) {
    // 1d to 9d.
    return Math.max(0.75, Math.min(1, 0.75 + value * 0.025));
  }

  return 0.5;
}

export function getBotDisplayName(settings) {
  const botName = settings.botName || "KataGo";
  const botRank = settings.botRank || settings.botStrength || "9d";

  return `${botName}`;
}

export function applyBotPlayerInfo(settings) {
  const botName = settings.botName || "KataGo";
  const botRank = settings.botRank || "9d";

  if (settings.botColor === "B") {
    return {
      ...settings,
      blackName: botName,
      blackRank: botRank
    };
  }

  return {
    ...settings,
    whiteName: botName,
    whiteRank: botRank
  };
}
