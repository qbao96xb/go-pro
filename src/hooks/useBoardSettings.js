import { useEffect, useState } from "react";

export const GO_RANK_OPTIONS = [
  "30k", "29k", "28k", "27k", "26k", "25k", "24k", "23k", "22k", "21k",
  "20k", "19k", "18k", "17k", "16k", "15k", "14k", "13k", "12k", "11k",
  "10k", "9k", "8k", "7k", "6k", "5k", "4k", "3k", "2k", "1k",
  "1d", "2d", "3d", "4d", "5d", "6d", "7d", "8d", "9d"
];

export function rankToBotPower(rank) {
  if (!rank || typeof rank !== "string") return 0.5;

  const value = Number.parseInt(rank, 10);

  if (rank.endsWith("k")) {
    // 30k = very weak, 1k = strong kyu
    return roundPower(Math.max(0.05, Math.min(0.74, (31 - value) / 42)));
  }

  if (rank.endsWith("d")) {
    // 1d to 9d
    return roundPower(Math.max(0.76, Math.min(1, 0.76 + value * 0.026)));
  }

  return 0.5;
}

export function botPowerToVisits(power) {
  const normalized = Math.max(0.05, Math.min(1, Number(power) || 0.5));

  if (normalized >= 0.98) return 1800;
  if (normalized >= 0.9) return 1200;
  if (normalized >= 0.8) return 800;
  if (normalized >= 0.65) return 500;
  if (normalized >= 0.5) return 300;
  if (normalized >= 0.35) return 160;
  if (normalized >= 0.2) return 80;
  return 30;
}

export function applyBotPlayerInfo(settings) {
  const next = {
    ...settings
  };

  const botName = next.botName || "KataGo";
  const botRank = next.botRank || "?";

  if (next.blackType === "bot") {
    next.blackName = botName;
    next.blackRank = botRank;
    next.botColor = "B";
  }

  if (next.whiteType === "bot") {
    next.whiteName = botName;
    next.whiteRank = botRank;
    next.botColor = "W";
  }

  return next;
}

function roundPower(value) {
  return Math.round(value * 100) / 100;
}

export const DEFAULT_GAME_SETTINGS = {
  userId: "default-user",

  blackType: "human",
  whiteType: "bot",
  blackName: "You",
  whiteName: "KataGo",
  blackRank: "?",
  whiteRank: "9k",

  botName: "KataGo",
  botRank: "9k",
  botColor: "W",
  botPower: rankToBotPower("9k"),
  botPowerPreset: "custom",
  maxVisits: botPowerToVisits(rankToBotPower("9k")),

  rules: "japanese",
  komi: 6.5,
  handicap: 0,

  timeSystem: "none",
  mainTimeMinutes: 10,
  byoYomiSeconds: 30,
  byoYomiPeriods: 3,

  showTopMoves: true,
  showTerritory: false,
  showAnalysisPanel: true,
  showCoordinates: true,
  showLastMoveMarker: true,
  showHoverGhostStone: true,
  autoAnalyzeAfterMove: true
};

export const DEFAULT_ENGINE_SETTINGS = {
  katagoPath: "",
  modelPath: "",
  configPath: "",
  analysisConfigPath: "",
  defaultMaxVisits: 300,
  defaultTimeLimit: 2.0,
  useOwnership: true,
  reportAnalysisWinratesAs: "BLACK"
};

export default function useBoardSettings() {
  const [settings, setSettings] = useState(DEFAULT_GAME_SETTINGS);
  const [engineSettings, setEngineSettings] = useState(DEFAULT_ENGINE_SETTINGS);

  useEffect(() => {
    const saved = localStorage.getItem("goTutorEngineSettings");

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      setEngineSettings(prev => ({
        ...prev,
        ...parsed
      }));
    } catch (err) {
      console.error("Failed to load engine settings:", err);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("goTutorGeneralSettings");

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      setSettings(prev => {
        const merged = {
          ...prev,
          ...parsed
        };

        return applyBotPlayerInfo(merged);
      });
    } catch (err) {
      console.error("Failed to load general settings:", err);
    }
  }, []);

  return {
    settings,
    setSettings,
    engineSettings,
    setEngineSettings
  };
}
