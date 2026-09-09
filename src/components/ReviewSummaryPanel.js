import React from "react";

export default function ReviewSummaryPanel({
  compact = false,
  reviewRunning,
  reviewProgress,
  reviewReport,
  selectedPivotalMove,
  onRunReview,
  onClose,
  onAnalyzePivotalMove
}) {
  return (
    <div className={compact ? "review-summary-panel-embedded" : "review-summary-panel"}>
      <div className="review-summary-header">
        <div>
          <h2>AI Game Review</h2>
          <p>
            Whole-game analysis, pivotal moves, strengths, weaknesses, and study suggestions.
          </p>
        </div>

        <button onClick={onClose}>
          Close
        </button>
      </div>

      <div className="review-actions-row">
        <button
          onClick={onRunReview}
          disabled={reviewRunning}
        >
          {reviewRunning ? "Analyzing..." : "Run Whole Game Review"}
        </button>

        {reviewRunning && (
          <span className="review-progress-text">
            {reviewProgress.current} / {reviewProgress.total}
          </span>
        )}
      </div>

      {reviewRunning && (
        <div className="review-progress-bar">
          <div
            className="review-progress-fill"
            style={{
              width: `${
                reviewProgress.total > 0
                  ? (reviewProgress.current / reviewProgress.total) * 100
                  : 0
              }%`
            }}
          />
        </div>
      )}

      {!reviewReport && !reviewRunning && (
        <div className="review-empty-state">
          Run a whole-game review to identify important mistakes and training points.
        </div>
      )}

      {reviewReport && (
        <div className="review-summary-content">
          <section>
            <h3>Pivotal Moves</h3>

            {reviewReport.pivotalMoves.length === 0 && (
              <p className="muted-text">No pivotal moves found yet.</p>
            )}

            {reviewReport.pivotalMoves.map(move => {
              const selected =
                selectedPivotalMove?.moveNumber === move.moveNumber;

              return (
                <button
                  key={move.moveNumber}
                  className={`pivotal-move-item pivotal-${move.level} ${selected ? "selected" : ""}`}
                  onClick={() => onAnalyzePivotalMove(move)}
                >
                  <span>
                    Move {move.moveNumber}
                    {move.move ? ` - ${move.move[0]} ${move.move[1]}` : ""}
                  </span>

                  <strong>
                    Swing {move.scoreSwing.toFixed(1)}
                  </strong>
                </button>
              );
            })}
          </section>

          <section>
            <h3>Top Strengths</h3>

            <ul>
              {reviewReport.strengths.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Top Weaknesses</h3>

            <ul>
              {reviewReport.weaknesses.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Recommendations</h3>

            <ol>
              {reviewReport.recommendations.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ol>
          </section>
        </div>
      )}
    </div>
  );
}
