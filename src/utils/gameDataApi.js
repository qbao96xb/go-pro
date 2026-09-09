import {
  movesToSgf
} from "./sgfUtils";

export async function autoSaveFinishedGame({
  userId,
  moves,
  settings,
  result = ""
}) {
  if (!moves || moves.length === 0) return;

  try {
    const sgf = movesToSgf({
      moves,
      blackName: settings.blackName || "Black",
      whiteName: settings.whiteName || "White",
      blackRank: settings.blackRank || "?",
      whiteRank: settings.whiteRank || "?",
      komi: settings.komi || 6.5,
      rules: settings.rules || "japanese",
      result,
      date: new Date().toISOString().slice(0, 10)
    });

    await fetch("/api/games/auto-save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: userId || "default-user",
        sgf,
        createdAt: new Date().toISOString(),
        metadata: {
          blackName: settings.blackName,
          whiteName: settings.whiteName,
          blackRank: settings.blackRank,
          whiteRank: settings.whiteRank,
          botRank: settings.botRank,
          botPower: settings.botPower,
          movesCount: moves.length
        }
      })
    });
  } catch (err) {
    console.warn("Auto-save finished game failed:", err);
  }
}

export async function fetchRankEstimate(userId = "default-user") {
  const response = await fetch(`/api/rank-estimate/${userId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch rank estimate");
  }

  return response.json();
}
