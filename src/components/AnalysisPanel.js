import React, { useMemo, useRef, useState } from "react";

import { buildTutorExplanation } from "../utils/tutorUtils";

import TutorExplanationPanel from "./TutorExplanationPanel";
import ReviewSummaryPanel from "./ReviewSummaryPanel";

function AnalysisPanel({
  settings,
  setSettings,
  isThinking,
  analyzeCurrentPosition,
  reviewCurrentMove,

  currentState,
  currentIndex,
  activeTab,
  setActiveTab,
  topMoves,
  createBranchFromTopMove,
  appMode,
  setBranchPreview,

  evalSummary,

  showReviewSummary,
  openAnalysisReview,
  closeReviewSummary,
  reviewRunning,
  reviewProgress,
  reviewReport,
  runWholeGameReview,
  selectedPivotalMove,
  analyzePivotalMove
}) {
  const moves = currentState?.moves || [];
  const recentMoves = moves.slice(-10);
  const lastMove = moves.length > 0 ? moves[moves.length - 1] : null;
  const nextTurn = moves.length % 2 === 0 ? "B" : "W";
  const gamePhase = getGamePhase(moves.length);

  const [selectedAlternativeMove, setSelectedAlternativeMove] = useState(null);
  const previewTimerRef = useRef(null);

  const toggleTab = (tabName) => {
    setActiveTab(activeTab === tabName ? null : tabName);
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const tutorExplanation = useMemo(() => {
    return buildTutorExplanation({
      selectedPivotalMove,
      alternativeMove: selectedAlternativeMove,
      evalSummary,
      currentState
    });
  }, [
    selectedPivotalMove,
    selectedAlternativeMove,
    evalSummary,
    currentState
  ]);

  const stopPvPreview = () => {
    if (previewTimerRef.current) {
      window.clearInterval(previewTimerRef.current);
      previewTimerRef.current = null;
    }

    setBranchPreview(null);
  };

  const startPvPreview = (move) => {
    if (!move?.move) return;

    stopPvPreview();

    const pv = Array.isArray(move.pv) && move.pv.length > 0
      ? move.pv
      : [move.move];

    const normalizedPv =
      pv[0]?.toLowerCase?.() === move.move.toLowerCase()
        ? pv
        : [move.move, ...pv];

    let previewLength = 1;

    setBranchPreview({
      rootMove: move.move,
      moves: normalizedPv.slice(0, previewLength)
    });

    previewTimerRef.current = window.setInterval(() => {
      previewLength += 1;

      setBranchPreview({
        rootMove: move.move,
        moves: normalizedPv.slice(0, previewLength)
      });

      if (previewLength >= Math.min(10, normalizedPv.length)) {
        window.clearInterval(previewTimerRef.current);
        previewTimerRef.current = null;
      }
    }, 350);
  };

  return (
    <aside className="analysis-panel compact-analysis-panel">
      <AnalysisTabs
        activeTab={activeTab}
        toggleTab={toggleTab}
        showReviewSummary={showReviewSummary}
        openAnalysisReview={openAnalysisReview}
      />

      {!activeTab && (
        <div className="analysis-tab-content collapsed-tab-content">
          Tabs hidden. Click a tab to show it.
        </div>
      )}

      {activeTab === "review" && (
        <ReviewTab
          reviewRunning={reviewRunning}
          reviewProgress={reviewProgress}
          reviewReport={reviewReport}
          selectedPivotalMove={selectedPivotalMove}
          runWholeGameReview={runWholeGameReview}
          closeReviewSummary={closeReviewSummary}
          analyzePivotalMove={analyzePivotalMove}
        />
      )}

      {activeTab === "info" && (
        <InfoTab
          currentState={currentState}
          currentIndex={currentIndex}
          nextTurn={nextTurn}
          gamePhase={gamePhase}
          recentMoves={recentMoves}
          totalMoves={moves.length}
        />
      )}

      {activeTab === "best" && (
        <BestMovesTab
          topMoves={topMoves}
          appMode={appMode}
          selectedPivotalMove={selectedPivotalMove}
          tutorExplanation={tutorExplanation}
          setSelectedAlternativeMove={setSelectedAlternativeMove}
          startPvPreview={startPvPreview}
          stopPvPreview={stopPvPreview}
          createBranchFromTopMove={createBranchFromTopMove}
        />
      )}

      {activeTab === "details" && (
        <DetailsTab
          appMode={appMode}
          moves={moves}
          currentIndex={currentIndex}
          nextTurn={nextTurn}
          lastMove={lastMove}
          gamePhase={gamePhase}
          isThinking={isThinking}
          reviewCurrentMove={reviewCurrentMove}
        />
      )}

      {activeTab === "options" && (
        <OptionsTab
          settings={settings}
          updateSetting={updateSetting}
          isThinking={isThinking}
          analyzeCurrentPosition={analyzeCurrentPosition}
        />
      )}
    </aside>
  );
}

function AnalysisTabs({
  activeTab,
  toggleTab,
  showReviewSummary,
  openAnalysisReview
}) {
  return (
    <div className="analysis-tabs">
      <button
        className={activeTab === "info" ? "active" : ""}
        onClick={() => toggleTab("info")}
      >
        Info
      </button>

      <button
        className={activeTab === "best" ? "active" : ""}
        onClick={() => toggleTab("best")}
      >
        Best
      </button>

      <button
        className={activeTab === "review" ? "active" : ""}
        onClick={() => {
          if (!showReviewSummary) {
            openAnalysisReview();
          } else {
            toggleTab("review");
          }
        }}
      >
        Review
      </button>

      <button
        className={activeTab === "details" ? "active" : ""}
        onClick={() => toggleTab("details")}
      >
        Details
      </button>

      <button
        className={activeTab === "options" ? "active" : ""}
        onClick={() => toggleTab("options")}
      >
        Options
      </button>
    </div>
  );
}

function ReviewTab({
  reviewRunning,
  reviewProgress,
  reviewReport,
  selectedPivotalMove,
  runWholeGameReview,
  closeReviewSummary,
  analyzePivotalMove
}) {
  return (
    <div className="analysis-tab-content">
      <ReviewSummaryPanel
        compact
        reviewRunning={reviewRunning}
        reviewProgress={reviewProgress}
        reviewReport={reviewReport}
        selectedPivotalMove={selectedPivotalMove}
        onRunReview={runWholeGameReview}
        onClose={closeReviewSummary}
        onAnalyzePivotalMove={analyzePivotalMove}
      />
    </div>
  );
}

function InfoTab({
  currentState,
  currentIndex,
  nextTurn,
  gamePhase,
  recentMoves,
  totalMoves
}) {
  return (
    <div className="analysis-tab-content">
      <div className="info-card">
        <h4>Current Position</h4>

        <InfoRow label="Current move" value={currentIndex} />
        <InfoRow label="Next turn" value={nextTurn === "B" ? "Black" : "White"} />
        <InfoRow label="Game phase" value={gamePhase} />
        <InfoRow label="Black captures" value={currentState?.captures?.B ?? 0} />
        <InfoRow label="White captures" value={currentState?.captures?.W ?? 0} />
      </div>

      <div className="info-card">
        <h4>Last 10 Moves</h4>

        {recentMoves.length === 0 && (
          <p className="muted-text">No moves yet.</p>
        )}

        {recentMoves.map((move, index) => {
          const moveNumber = totalMoves - recentMoves.length + index + 1;

          return (
            <MoveHistoryRow
              key={`${moveNumber}-${move[0]}-${move[1]}`}
              moveNumber={moveNumber}
              move={move}
            />
          );
        })}
      </div>
    </div>
  );
}

function BestMovesTab({
  topMoves,
  appMode,
  selectedPivotalMove,
  tutorExplanation,
  setSelectedAlternativeMove,
  startPvPreview,
  stopPvPreview,
  createBranchFromTopMove
}) {
  return (
    <div className="analysis-tab-content">
      {selectedPivotalMove && (
        <SelectedPivotalCard selectedPivotalMove={selectedPivotalMove} />
      )}

      {selectedPivotalMove && (
        <TutorExplanationPanel
          explanation={tutorExplanation}
          onClose={() => setSelectedAlternativeMove(null)}
        />
      )}

      <div className="best-move-list">
        {topMoves.length === 0 && (
          <p className="muted-text">No analysis yet.</p>
        )}

        {topMoves.map((move, index) => (
          <BestMoveItem
            key={`${move.move}-${index}`}
            move={move}
            index={index}
            appMode={appMode}
            setSelectedAlternativeMove={setSelectedAlternativeMove}
            startPvPreview={startPvPreview}
            stopPvPreview={stopPvPreview}
            createBranchFromTopMove={createBranchFromTopMove}
          />
        ))}
      </div>
    </div>
  );
}

function SelectedPivotalCard({
  selectedPivotalMove
}) {
  return (
    <div className="info-card selected-pivotal-card">
      <h4>Alternatives for Pivotal Move</h4>

      <div className="small-text">
        Reviewing position before{" "}
        <strong>
          {selectedPivotalMove.label || `move ${selectedPivotalMove.moveNumber}`}
        </strong>.
      </div>

      <div className="small-text">
        Suggested alternatives are for{" "}
        <strong>
          Move {selectedPivotalMove.alternativesForMoveNumber || selectedPivotalMove.moveNumber}
          {selectedPivotalMove.alternativesForColor
            ? `, ${selectedPivotalMove.alternativesForColor} to play`
            : ""}
        </strong>.
      </div>

      <div className="small-text">
        Hover a suggested move to preview the next line. Click “Create branch” to explore it.
      </div>
    </div>
  );
}

function BestMoveItem({
  move,
  index,
  appMode,
  setSelectedAlternativeMove,
  startPvPreview,
  stopPvPreview,
  createBranchFromTopMove
}) {
  return (
    <div
      className="best-move-item"
      onMouseEnter={() => {
        setSelectedAlternativeMove(move);
        startPvPreview(move);
      }}
      onMouseLeave={stopPvPreview}
    >
      <div>
        <strong>
          {index + 1}. {move.move}
        </strong>

        <div className="small-text">
          Score:{" "}
          {typeof move.scoreLead === "number"
            ? move.scoreLead.toFixed(1)
            : "-"}
          {" "} | Policy:{" "}
          {typeof move.policy === "number"
            ? `${(move.policy * 100).toFixed(1)}%`
            : "-"}
        </div>

        {Array.isArray(move.pv) && move.pv.length > 0 && (
          <div className="small-text pv-preview-text">
            PV: {move.pv.slice(0, 8).join(" ")}
          </div>
        )}
      </div>

      {(appMode === "review" || appMode === "teaching") && (
        <button
          className="try-variation-button"
          onClick={() => {
            setSelectedAlternativeMove(move);
            createBranchFromTopMove(move);
          }}
        >
          Create branch
        </button>
      )}
    </div>
  );
}

function DetailsTab({
  appMode,
  moves,
  currentIndex,
  nextTurn,
  lastMove,
  gamePhase,
  isThinking,
  reviewCurrentMove
}) {
  return (
    <div className="analysis-tab-content">
      <div className="info-card">
        <h4>Position Details</h4>

        <InfoRow label="Mode" value={appMode} />
        <InfoRow label="Total moves" value={moves.length} />
        <InfoRow label="Current index" value={currentIndex} />
        <InfoRow label="Next player" value={nextTurn === "B" ? "Black" : "White"} />
        <InfoRow label="Last move" value={lastMove ? `${lastMove[0]} ${lastMove[1]}` : "-"} />
        <InfoRow label="Game phase" value={gamePhase} />
      </div>

      <div className="info-card">
        <h4>Move Review</h4>

        <p className="small-text">
          Reanalyze this move and check whether it was important.
        </p>

        <button
          className="analysis-now-button"
          disabled={isThinking || !reviewCurrentMove}
          onClick={reviewCurrentMove}
        >
          {isThinking ? "Analyzing..." : "Review this move"}
        </button>
      </div>

      <div className="info-card">
        <h4>Move History</h4>

        {moves.length === 0 && (
          <p className="muted-text">No moves yet.</p>
        )}

        <div className="move-history-grid">
          {moves.map((move, index) => (
            <MoveHistoryRow
              key={`${index}-${move[0]}-${move[1]}`}
              moveNumber={index + 1}
              move={move}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function OptionsTab({
  settings,
  updateSetting,
  isThinking,
  analyzeCurrentPosition
}) {
  return (
    <div className="analysis-tab-content">
      <div className="info-card analysis-options-card">
        <h4>Analysis Options</h4>

        <OptionCheckbox
          label="Show top moves on board"
          checked={settings.showTopMoves}
          onChange={value => updateSetting("showTopMoves", value)}
        />

        <OptionCheckbox
          label="Show expected territory"
          checked={settings.showTerritory}
          onChange={value => updateSetting("showTerritory", value)}
        />

        <OptionCheckbox
          label="Show coordinates"
          checked={settings.showCoordinates}
          onChange={value => updateSetting("showCoordinates", value)}
        />

        <OptionCheckbox
          label="Show last move marker"
          checked={settings.showLastMoveMarker}
          onChange={value => updateSetting("showLastMoveMarker", value)}
        />

        <OptionCheckbox
          label="Show hover ghost stone"
          checked={settings.showHoverGhostStone}
          onChange={value => updateSetting("showHoverGhostStone", value)}
        />

        <OptionCheckbox
          label="Auto-analyze after move"
          checked={settings.autoAnalyzeAfterMove}
          onChange={value => updateSetting("autoAnalyzeAfterMove", value)}
        />

        <button
          className="analysis-now-button"
          disabled={isThinking}
          onClick={analyzeCurrentPosition}
        >
          {isThinking ? "Analyzing..." : "Analyze current position"}
        </button>
      </div>
    </div>
  );
}

function OptionCheckbox({
  label,
  checked,
  onChange
}) {
  return (
    <label className="analysis-option-row">
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={event => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

function InfoRow({
  label,
  value
}) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MoveHistoryRow({
  moveNumber,
  move
}) {
  return (
    <div className="small-text move-history-row">
      <span>{moveNumber}.</span>
      <strong>{move[0]}</strong>
      <span>{move[1]}</span>
    </div>
  );
}

function getGamePhase(moveCount) {
  if (moveCount < 50) return "Opening";
  if (moveCount < 150) return "Middle game";
  return "Endgame";
}

export default AnalysisPanel;
