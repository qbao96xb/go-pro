export function buildTutorExplanation({
  selectedPivotalMove,
  alternativeMove,
  evalSummary,
  currentState
}) {
  if (!selectedPivotalMove || !alternativeMove) {
    return null;
  }

  const originalMove = selectedPivotalMove.move;
  const originalText = originalMove
    ? `${originalMove[0]} ${originalMove[1]}`
    : "-";

  const alternativeText = alternativeMove.move || "-";

  const scoreLead =
    typeof alternativeMove.scoreLead === "number"
      ? alternativeMove.scoreLead
      : evalSummary?.scoreLead ?? null;

  const policy =
    typeof alternativeMove.policy === "number"
      ? alternativeMove.policy
      : null;

  const scoreSwing =
    typeof selectedPivotalMove.scoreSwing === "number"
      ? selectedPivotalMove.scoreSwing
      : null;

  const phase = getGamePhaseLabel(currentState?.moves?.length ?? 0);

  const severity = getSeverityLabel(scoreSwing);
  const direction = inferStrategicTheme(alternativeMove, selectedPivotalMove, currentState);

  return {
    title: `Why ${alternativeText} is suggested`,
    originalMove: originalText,
    suggestedMove: alternativeText,
    phase,
    severity,
    scoreSwing,
    scoreLead,
    policy,
    summary: buildSummaryText({
      originalText,
      alternativeText,
      scoreSwing,
      phase,
      direction
    }),
    keyReasons: buildKeyReasons({
      direction,
      phase,
      policy,
      scoreSwing
    }),
    trainingAdvice: buildTrainingAdvice({
      direction,
      phase
    }),
    pv: Array.isArray(alternativeMove.pv)
      ? alternativeMove.pv.slice(0, 10)
      : []
  };
}

function getGamePhaseLabel(moveCount) {
  if (moveCount < 50) return "Opening";
  if (moveCount < 150) return "Middle game";
  return "Endgame";
}

function getSeverityLabel(scoreSwing) {
  if (typeof scoreSwing !== "number") return "Unknown";
  if (scoreSwing >= 15) return "Critical";
  if (scoreSwing >= 7) return "Important";
  if (scoreSwing >= 3) return "Noticeable";
  return "Small";
}

function inferStrategicTheme(alternativeMove, selectedPivotalMove, currentState) {
  const move = alternativeMove?.move || "";
  const original = selectedPivotalMove?.move?.[1] || "";
  const moveCount = currentState?.moves?.length ?? 0;

  if (moveCount < 50) {
    return "opening direction";
  }

  if (isCornerOrSideMove(move) && !isCornerOrSideMove(original)) {
    return "urgent local stability";
  }

  if (!isCornerOrSideMove(move) && isCornerOrSideMove(original)) {
    return "global influence";
  }

  if (Array.isArray(alternativeMove?.pv) && alternativeMove.pv.length >= 6) {
    return "fighting sequence";
  }

  return "positional efficiency";
}

function isCornerOrSideMove(coord) {
  if (!coord || coord.toLowerCase() === "pass") return false;

  const letter = coord[0];
  const row = Number(coord.slice(1));

  const sideLetters = new Set(["A", "B", "C", "D", "Q", "R", "S", "T"]);

  return sideLetters.has(letter) || row <= 4 || row >= 16;
}

function buildSummaryText({
  originalText,
  alternativeText,
  scoreSwing,
  phase,
  direction
}) {
  const swingText =
    typeof scoreSwing === "number"
      ? `The engine detected about ${scoreSwing.toFixed(1)} points of swing around this moment.`
      : "The engine detected this as an important turning point.";

  return [
    `The original move ${originalText} appears to be less efficient than ${alternativeText}.`,
    swingText,
    `In the ${phase.toLowerCase()}, this usually means the important issue is ${direction}, not simply playing the locally obvious move.`
  ];
}

function buildKeyReasons({
  direction,
  phase,
  policy,
  scoreSwing
}) {
  const reasons = [];

  if (direction === "urgent local stability") {
    reasons.push("The suggested move likely handles an urgent local weakness before the opponent can profit from it.");
    reasons.push("It may defend shape, save important stones, or prevent a forcing sequence.");
  }

  if (direction === "global influence") {
    reasons.push("The suggested move likely values global influence or large-scale development more than the local exchange.");
    reasons.push("It may make future fights easier by improving the whole-board balance.");
  }

  if (direction === "fighting sequence") {
    reasons.push("The principal variation suggests this move works tactically over several follow-up moves.");
    reasons.push("The move probably changes the local fight result or avoids a bad forcing sequence.");
  }

  if (direction === "opening direction") {
    reasons.push("In the opening, direction and whole-board efficiency are often more important than short-term points.");
    reasons.push("The suggested move likely keeps balance between territory, influence, and future development.");
  }

  if (direction === "positional efficiency") {
    reasons.push("The suggested move is likely more efficient in shape, timing, or global value.");
    reasons.push("It avoids giving the opponent an easy profitable reply.");
  }

  if (typeof policy === "number" && policy >= 0.3) {
    reasons.push(`KataGo's policy strongly prefers this move, with about ${(policy * 100).toFixed(1)}% prior probability.`);
  }

  if (typeof scoreSwing === "number" && scoreSwing >= 10) {
    reasons.push("Because the swing is large, this is worth reviewing carefully as a likely rank-improvement pattern.");
  }

  if (phase === "Endgame") {
    reasons.push("In the endgame, small local mistakes can directly convert into point loss, so sente and exact local value matter.");
  }

  return reasons.slice(0, 5);
}

function buildTrainingAdvice({
  direction,
  phase
}) {
  const advice = [];

  if (direction === "urgent local stability") {
    advice.push("Before attacking elsewhere, ask: do any of my groups still need defense?");
    advice.push("Check whether the opponent has a forcing sequence against your weak stones.");
  }

  if (direction === "global influence") {
    advice.push("Compare the local profit with the biggest whole-board area.");
    advice.push("Ask whether your move helps future fights or only gains small local territory.");
  }

  if (direction === "fighting sequence") {
    advice.push("Read at least 3 to 5 moves ahead before choosing the fighting direction.");
    advice.push("Look for forcing moves first, then check whether your group remains connected and has liberties.");
  }

  if (direction === "opening direction") {
    advice.push("In the opening, avoid small local moves unless they are urgent.");
    advice.push("Prioritize corners, sides, extensions, and direction of play.");
  }

  if (direction === "positional efficiency") {
    advice.push("Ask whether your move is sente, improves shape, or fixes a weakness.");
    advice.push("Avoid moves that only look natural but give the opponent a bigger reply.");
  }

  if (phase === "Endgame") {
    advice.push("Estimate whether the move is sente or gote before playing.");
  }

  return advice.slice(0, 5);
}
