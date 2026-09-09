import React, { useState } from "react";

function classifyReviewMove(item) {
  if (!item || typeof item.pointLoss !== "number") return "Unknown";
  if (item.pointLoss >= 6) return "Blunder";
  if (item.pointLoss >= 3) return "Mistake";
  if (item.pointLoss >= 1.5) return "Inaccuracy";
  if (item.pointLoss >= 0.5) return "Good";
  return "Excellent";
}

function buildBasicReview(evalHistory) {
  const reviewedMoves = (evalHistory || []).filter(
    item => typeof item.pointLoss === "number"
  );

  const pivotalMoves = reviewedMoves
    .filter(item => item.pointLoss >= 3)
    .sort((a, b) => b.pointLoss - a.pointLoss);

  const goodMoves = reviewedMoves.filter(item => item.pointLoss < 1.5);
  const mistakes = reviewedMoves.filter(
    item => item.pointLoss >= 3 && item.pointLoss < 6
  );
  const blunders = reviewedMoves.filter(item => item.pointLoss >= 6);

  return {
    reviewedMoveCount: reviewedMoves.length,
    pivotalMoves,
    strengths: [
      goodMoves.length > 0
        ? `You played ${goodMoves.length} good or excellent moves.`
        : "Not enough strong moves detected yet.",
      "You are reviewing with move-by-move engine feedback.",
      "Your game has enough structure to compare actual moves with AI candidates."
    ],
    weaknesses: [
      blunders.length > 0
        ? `You had ${blunders.length} blunder-level moves.`
        : "No blunder-level move detected yet.",
      mistakes.length > 0
        ? `You had ${mistakes.length} mistake-level moves.`
        : "No major mistake-level move detected yet.",
      "Strategic pattern analysis will be added after full-game review backend is implemented."
    ],
    recommendations: [
      "Review every move with point loss above 3 points.",
      "For each pivotal move, compare your move with KataGo's first and second choices.",
      "Check whether the mistake came from local fighting, weak group defense, or whole-board direction.",
      "Do not review only the final bad move. Look 3-5 moves before the fight started.",
      "Use branches to test alternative continuations.",
      "Prefer moves that fix your weak groups while keeping pressure on the opponent.",
      "When score lead is already good, avoid unnecessary complications."
    ]
  };
}

export default function TeachingReview({
  history,
  evalHistory,
  currentIndex,
  setCurrentIndex,
  onClose
}) {
  const [review, setReview] = useState(null);
  const [selectedMoveNumber, setSelectedMoveNumber] = useState(null);

  const runBasicReview = () => {
    const result = buildBasicReview(evalHistory);
    setReview(result);
  };

  const jumpToMove = (moveNumber) => {
    setSelectedMoveNumber(moveNumber);

    if (typeof setCurrentIndex === "function") {
      setCurrentIndex(moveNumber);
    }
  };

  return (
    <div className="teaching-review-panel">
      <div className="teaching-review-header">
        <div>
          <h2>Teaching / Game Review</h2>
          <p>
            Review mode is separate from play mode. Use this after finishing a game or loading an SGF.
          </p>
        </div>

        <button onClick={onClose}>
          Close Review
        </button>
      </div>

      <div className="teaching-review-actions">
        <button onClick={runBasicReview}>
          Run Basic Review
        </button>
      </div>

      {!review ? (
        <div className="teaching-empty-state">
          <p>
            No review generated yet. Click <strong>Run Basic Review</strong>.
          </p>
        </div>
      ) : (
        <div className="teaching-review-content">
          <section>
            <h3>Summary</h3>
            <p>
              <strong>Reviewed moves:</strong> {review.reviewedMoveCount}
            </p>
          </section>

          <section>
            <h3>Pivotal Moves</h3>

            {review.pivotalMoves.length === 0 ? (
              <p>No pivotal moves detected from current evaluation data.</p>
            ) : (
              <ol>
                {review.pivotalMoves.slice(0, 10).map(item => {
                  const quality = classifyReviewMove(item);

                  return (
                    <li
                      key={`pivotal-${item.moveNumber}`}
                      className={
                        selectedMoveNumber === item.moveNumber
                          ? "teaching-move-item active"
                          : "teaching-move-item"
                      }
                      onClick={() => jumpToMove(item.moveNumber)}
                    >
                      <strong>Move {item.moveNumber}</strong>
                      {" - "}
                      {quality}
                      {" - "}
                      {item.pointLoss.toFixed(1)} pts lost
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section>
            <h3>Top 3 Strengths</h3>
            <ul>
              {review.strengths.map((item, index) => (
                <li key={`strength-${index}`}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Top 3 Weaknesses</h3>
            <ul>
              {review.weaknesses.map((item, index) => (
                <li key={`weakness-${index}`}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Recommendations</h3>
            <ol>
              {review.recommendations.map((item, index) => (
                <li key={`recommendation-${index}`}>{item}</li>
              ))}
            </ol>
          </section>
        </div>
      )}
    </div>
  );
}
