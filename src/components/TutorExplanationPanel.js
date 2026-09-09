import React from "react";

export default function TutorExplanationPanel({
  explanation,
  onClose
}) {
  if (!explanation) {
    return (
      <div className="info-card tutor-explanation-card">
        <h4>AI Tutor</h4>
        <p className="muted-text">
          Select or hover an alternative move to see a teacher-style explanation.
        </p>
      </div>
    );
  }

  return (
    <div className="info-card tutor-explanation-card">
      <div className="tutor-explanation-header">
        <h4>{explanation.title}</h4>

        {onClose && (
          <button onClick={onClose}>
            Clear
          </button>
        )}
      </div>

      <div className="tutor-move-comparison">
        <div>
          <span>Original</span>
          <strong>{explanation.originalMove}</strong>
        </div>

        <div>
          <span>Suggested</span>
          <strong>{explanation.suggestedMove}</strong>
        </div>
      </div>

      <div className="tutor-facts-grid">
        <div>
          <span>Phase</span>
          <strong>{explanation.phase}</strong>
        </div>

        <div>
          <span>Severity</span>
          <strong>{explanation.severity}</strong>
        </div>

        <div>
          <span>Score swing</span>
          <strong>
            {typeof explanation.scoreSwing === "number"
              ? `${explanation.scoreSwing.toFixed(1)} pts`
              : "-"}
          </strong>
        </div>

        <div>
          <span>Policy</span>
          <strong>
            {typeof explanation.policy === "number"
              ? `${(explanation.policy * 100).toFixed(1)}%`
              : "-"}
          </strong>
        </div>
      </div>

      <section>
        <h5>Intuition</h5>

        {explanation.summary.map((item, index) => (
          <p key={index} className="small-text">
            {item}
          </p>
        ))}
      </section>

      <section>
        <h5>Why this move is better</h5>

        <ul>
          {explanation.keyReasons.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h5>Training advice</h5>

        <ul>
          {explanation.trainingAdvice.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      {explanation.pv.length > 0 && (
        <section>
          <h5>Expected continuation</h5>

          <div className="tutor-pv-line">
            {explanation.pv.join(" ")}
          </div>
        </section>
      )}
    </div>
  );
}
