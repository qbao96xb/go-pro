import React, { useMemo, useState } from "react";

import AnalysisPanel from "./AnalysisPanel";
import VariationTree from "./VariationTree";

import {
  formatClockTime
} from "../utils/analysisUtils";

const METRIC_OPTIONS = [
  { key: "score", label: "Score", color: "#38bdf8" },
  { key: "winrate", label: "Win Rate", color: "#22c55e" },
  { key: "loss", label: "Point Loss", color: "#eab308" }
];

export default function RightPanel({
  settings,
  setSettings,
  appMode,
  isThinking,
  isReviewMode,
  analyzeCurrentPosition,
  reviewCurrentMove,

  displayedState,
  currentIndex,

  evalHistory,
  evalSummary,
  setChartMode,
  blackTime,
  whiteTime,
  activeColor,

  activeTab,
  setActiveTab,
  topMoves,

  createBranchFromTopMove,
  setBranchPreview,
  gameTree,
  selectTreeNode,

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
  const [visibleMetrics, setVisibleMetrics] = useState({
    score: true,
    winrate: true,
    loss: false
  });

  const [showSummary, setShowSummary] = useState(true);
  const [showEvalBlock, setShowEvalBlock] = useState(true);
  const [showBranchBlock, setShowBranchBlock] = useState(true);

  const shouldShowBranchBlock =
    isReviewMode || appMode === "teaching" || selectedPivotalMove;

  const toggleMetric = (metric) => {
    setVisibleMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));

    setChartMode(metric);
  };

  return (
    <aside className="right-panel">
      <PlayerInfoBlock
        settings={settings}
        displayedState={displayedState}
        blackTime={blackTime}
        whiteTime={whiteTime}
        activeColor={activeColor}
      />

      <EvaluationGraphBlock
        evalHistory={evalHistory}
        evalSummary={evalSummary}
        visibleMetrics={visibleMetrics}
        toggleMetric={toggleMetric}
        showSummary={showSummary}
        setShowSummary={setShowSummary}
        showEvalBlock={showEvalBlock}
        setShowEvalBlock={setShowEvalBlock}
        isThinking={isThinking}
      />

      {shouldShowBranchBlock && (
        <BranchTreeBlock
          gameTree={gameTree}
          selectTreeNode={selectTreeNode}
          showBranchBlock={showBranchBlock}
          setShowBranchBlock={setShowBranchBlock}
        />
      )}

      {settings.showAnalysisPanel !== false && (
        <AnalysisTabsBlock
          settings={settings}
          setSettings={setSettings}
          isThinking={isThinking}
          analyzeCurrentPosition={analyzeCurrentPosition}
          reviewCurrentMove={reviewCurrentMove}
          displayedState={displayedState}
          currentIndex={currentIndex}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          topMoves={topMoves}
          createBranchFromTopMove={createBranchFromTopMove}
          appMode={appMode}
          gameTree={gameTree}
          selectTreeNode={selectTreeNode}
          setBranchPreview={setBranchPreview}
          evalSummary={evalSummary}
          showReviewSummary={showReviewSummary}
          openAnalysisReview={openAnalysisReview}
          closeReviewSummary={closeReviewSummary}
          reviewRunning={reviewRunning}
          reviewProgress={reviewProgress}
          reviewReport={reviewReport}
          runWholeGameReview={runWholeGameReview}
          selectedPivotalMove={selectedPivotalMove}
          analyzePivotalMove={analyzePivotalMove}
        />
      )}
    </aside>
  );
}

function PlayerInfoBlock({
  settings,
  displayedState,
  blackTime,
  whiteTime,
  activeColor
}) {
  const blackCaptures = displayedState?.captures?.B ?? 0;
  const whiteCaptures = displayedState?.captures?.W ?? 0;

  return (
    <section className="right-panel-block play-info-block">
      <PlayerCard
        color="W"
        name={settings.whiteName || "White"}
        rank={settings.whiteRank || "?"}
        captures={whiteCaptures}
        time={whiteTime}
        activeColor={activeColor}
      />

      <PlayerCard
        color="B"
        name={settings.blackName || "Black"}
        rank={settings.blackRank || "?"}
        captures={blackCaptures}
        time={blackTime}
        activeColor={activeColor}
      />
    </section>
  );
}

function PlayerCard({
  color,
  name,
  rank,
  captures,
  time,
  activeColor
}) {
  const isBlack = color === "B";
  const isActive = activeColor === color;

  return (
    <div
      className={[
        "player-card",
        isBlack ? "black-player-card" : "white-player-card",
        isActive ? "active-player-card" : ""
      ].join(" ")}
    >
      <div
        className={isBlack
          ? "stone-icon black-stone-icon"
          : "stone-icon white-stone-icon"}
      />

      <div className="player-card-name">
        {name} <span>[{rank}]</span>
      </div>

      <div className="player-card-caps">
        Caps: {captures}
      </div>

      <div className="player-card-time">
        {formatClockTime(time)}
      </div>
    </div>
  );
}

function EvaluationGraphBlock({
  evalHistory,
  evalSummary,
  visibleMetrics,
  toggleMetric,
  showSummary,
  setShowSummary,
  showEvalBlock,
  setShowEvalBlock,
  isThinking
}) {
  return (
    <section className={`right-panel-block eval-graph-block ${!showEvalBlock ? "collapsed-right-block" : ""}`}>
      <div className="eval-header-row">
        <MetricTabs
          visibleMetrics={visibleMetrics}
          toggleMetric={toggleMetric}
        />

        <button
          className="mini-collapse-button"
          onClick={() => setShowEvalBlock(prev => !prev)}
        >
          {showEvalBlock ? "Collapse" : "Expand"}
        </button>

        {isThinking && (
          <div className="analysis-status">
            <span className="spinner-dot" />
            Analyzing
          </div>
        )}
      </div>

      {showEvalBlock && (
        <>
          <InteractiveEvalChart
            evalHistory={evalHistory}
            visibleMetrics={visibleMetrics}
          />

          <button
            className="summary-toggle-button"
            onClick={() => setShowSummary(prev => !prev)}
          >
            {showSummary ? "Hide summary" : "Show summary"}
          </button>

          {showSummary && (
            <EvaluationSummary evalSummary={evalSummary} />
          )}
        </>
      )}
    </section>
  );
}

function MetricTabs({
  visibleMetrics,
  toggleMetric
}) {
  return (
    <div className="metric-tabs">
      {METRIC_OPTIONS.map(metric => (
        <button
          key={metric.key}
          className={visibleMetrics[metric.key] ? "active" : ""}
          style={{
            borderColor: metric.color,
            color: visibleMetrics[metric.key] ? metric.color : "#94a3b8"
          }}
          onClick={() => toggleMetric(metric.key)}
        >
          {metric.label}
        </button>
      ))}
    </div>
  );
}

function BranchTreeBlock({
  gameTree,
  selectTreeNode,
  showBranchBlock,
  setShowBranchBlock
}) {
  return (
    <section className={`right-panel-block branch-tree-block ${!showBranchBlock ? "collapsed-right-block" : ""}`}>
      <div className="right-block-title-row">
        <strong>Variation Tree</strong>

        <button
          className="mini-collapse-button"
          onClick={() => setShowBranchBlock(prev => !prev)}
        >
          {showBranchBlock ? "Collapse" : "Expand"}
        </button>
      </div>

      {showBranchBlock && (
        <>
          <VariationTree
            gameTree={gameTree}
            currentNodeId={gameTree?.currentNodeId}
            onSelectNode={selectTreeNode}
          />

          <div className="small-text" style={{ marginTop: "8px" }}>
            Click a branch node to jump there. Click a suggested move below to create a new branch.
          </div>
        </>
      )}
    </section>
  );
}

function AnalysisTabsBlock({
  settings,
  setSettings,
  isThinking,
  analyzeCurrentPosition,
  reviewCurrentMove,

  displayedState,
  currentIndex,
  activeTab,
  setActiveTab,
  topMoves,
  createBranchFromTopMove,
  appMode,
  gameTree,
  selectTreeNode,
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
  return (
    <section className="right-panel-block analysis-tabs-block">
      <AnalysisPanel
        settings={settings}
        setSettings={setSettings}
        isThinking={isThinking}
        analyzeCurrentPosition={analyzeCurrentPosition}
        reviewCurrentMove={reviewCurrentMove}
        currentState={displayedState}
        currentIndex={currentIndex}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        topMoves={topMoves}
        createBranchFromTopMove={createBranchFromTopMove}
        appMode={appMode}
        gameTree={gameTree}
        selectTreeNode={selectTreeNode}
        setBranchPreview={setBranchPreview}
        evalSummary={evalSummary}
        showReviewSummary={showReviewSummary}
        openAnalysisReview={openAnalysisReview}
        closeReviewSummary={closeReviewSummary}
        reviewRunning={reviewRunning}
        reviewProgress={reviewProgress}
        reviewReport={reviewReport}
        runWholeGameReview={runWholeGameReview}
        selectedPivotalMove={selectedPivotalMove}
        analyzePivotalMove={analyzePivotalMove}
      />
    </section>
  );
}

function EvaluationSummary({
  evalSummary
}) {
  const blackWinrate = evalSummary?.blackWinrate;
  const scoreLead = evalSummary?.scoreLead;
  const lastMoveLoss = evalSummary?.lastMoveLoss;

  const winningPlayer =
    typeof scoreLead === "number"
      ? scoreLead >= 0
        ? "Black"
        : "White"
      : "-";

  const scoreText =
    typeof scoreLead === "number"
      ? scoreLead >= 0
        ? `B +${scoreLead.toFixed(1)}`
        : `W +${Math.abs(scoreLead).toFixed(1)}`
      : "-";

  const winrateText =
    typeof blackWinrate === "number"
      ? blackWinrate >= 0.5
        ? `Black ${(blackWinrate * 100).toFixed(1)}%`
        : `White ${((1 - blackWinrate) * 100).toFixed(1)}%`
      : "-";

  const lossText =
    typeof lastMoveLoss === "number"
      ? `${lastMoveLoss.toFixed(1)} pts`
      : "-";

  const scoreClipped =
    typeof scoreLead === "number" && Math.abs(scoreLead) > 40;

  return (
    <div className="evaluation-summary-under-chart">
      <SummaryLine label="Winning side" value={winningPlayer} />
      <SummaryLine label="Estimated win rate" value={winrateText} color="#22c55e" />
      <SummaryLine label="Estimated score" value={scoreText} color="#38bdf8" />
      <SummaryLine label="Last move loss" value={lossText} color="#eab308" />

      {scoreClipped && (
        <div className="summary-warning">
          Score is outside chart range and clipped visually.
        </div>
      )}
    </div>
  );
}

function SummaryLine({
  label,
  value,
  color
}) {
  return (
    <div className="summary-line">
      <span>{label}</span>
      <strong style={color ? { color } : undefined}>
        {value}
      </strong>
    </div>
  );
}

function InteractiveEvalChart({
  evalHistory,
  visibleMetrics
}) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const width = 360;
  const height = 210;

  const padding = {
    top: 20,
    right: 46,
    bottom: 28,
    left: 42
  };

  const metrics = useMemo(() => {
    return buildVisibleMetrics(visibleMetrics);
  }, [visibleMetrics]);

  if (!evalHistory || evalHistory.length === 0) {
    return (
      <div className="interactive-eval-chart empty-chart">
        No evaluation yet.
      </div>
    );
  }

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const xForIndex = (index) => {
    return padding.left + index * (chartWidth / Math.max(1, evalHistory.length - 1));
  };

  const yForValue = (value, min, max) => {
    const clampedValue = Math.max(min, Math.min(max, value));
    const range = Math.max(1, max - min);

    return padding.top + chartHeight - ((clampedValue - min) / range) * chartHeight;
  };

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const ratio = (mouseX - padding.left) / chartWidth;
    const rawIndex = Math.round(ratio * Math.max(1, evalHistory.length - 1));
    const nextIndex = Math.max(0, Math.min(evalHistory.length - 1, rawIndex));

    setHoverIndex(nextIndex);

    setTooltipPosition(
      getTooltipPosition({
        mouseX,
        mouseY,
        width,
        height
      })
    );
  };

  const hoverEntry = hoverIndex !== null ? evalHistory[hoverIndex] : null;
  const hoverX = hoverIndex !== null ? xForIndex(hoverIndex) : null;

  return (
    <div className="interactive-chart-wrapper">
      <svg
        className="interactive-eval-chart"
        viewBox={`0 0 ${width} ${height}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <ChartBackground
          padding={padding}
          chartWidth={chartWidth}
          chartHeight={chartHeight}
          width={width}
        />

        <ChartLines
          evalHistory={evalHistory}
          metrics={metrics}
          xForIndex={xForIndex}
          yForValue={yForValue}
        />

        {hoverX !== null && (
          <line
            x1={hoverX}
            y1={padding.top}
            x2={hoverX}
            y2={padding.top + chartHeight}
            className="chart-hover-line"
          />
        )}

        {hoverEntry && (
          <HoverPoints
            hoverEntry={hoverEntry}
            hoverX={hoverX}
            metrics={metrics}
            yForValue={yForValue}
          />
        )}
      </svg>

      {hoverEntry && (
        <ChartTooltip
          hoverEntry={hoverEntry}
          metrics={metrics}
          tooltipPosition={tooltipPosition}
        />
      )}
    </div>
  );
}

function buildVisibleMetrics(visibleMetrics) {
  return [
    {
      key: "score",
      label: "Score",
      color: "#38bdf8",
      getValue: entry =>
        typeof entry.scoreLead === "number" ? entry.scoreLead : null,
      min: -40,
      max: 40,
      format: value =>
        value >= 0
          ? `B +${value.toFixed(1)}`
          : `W +${Math.abs(value).toFixed(1)}`
    },
    {
      key: "winrate",
      label: "Win Rate",
      color: "#22c55e",
      getValue: entry =>
        typeof entry.blackWinrate === "number" ? entry.blackWinrate : null,
      min: 0,
      max: 100,
      format: value => `${value.toFixed(1)}% B`
    },
    {
      key: "loss",
      label: "Point Loss",
      color: "#eab308",
      getValue: entry =>
        typeof entry.pointLoss === "number" ? entry.pointLoss : null,
      min: 0,
      max: 10,
      format: value => `${value.toFixed(1)} pts`
    }
  ].filter(metric => visibleMetrics[metric.key]);
}

function getTooltipPosition({
  mouseX,
  mouseY,
  width,
  height
}) {
  const tooltipWidth = 150;
  const tooltipHeight = 86;

  const x =
    mouseX + tooltipWidth + 18 > width
      ? mouseX - tooltipWidth - 14
      : mouseX + 14;

  const y =
    mouseY + tooltipHeight + 18 > height
      ? mouseY - tooltipHeight - 14
      : mouseY + 14;

  return {
    x: Math.max(6, x),
    y: Math.max(6, y)
  };
}

function ChartBackground({
  padding,
  chartWidth,
  chartHeight,
  width
}) {
  return (
    <>
      <rect
        x={padding.left}
        y={padding.top}
        width={chartWidth}
        height={chartHeight / 2}
        className="chart-white-zone"
      />

      <rect
        x={padding.left}
        y={padding.top + chartHeight / 2}
        width={chartWidth}
        height={chartHeight / 2}
        className="chart-black-zone"
      />

      <line
        x1={padding.left}
        y1={padding.top + chartHeight / 2}
        x2={padding.left + chartWidth}
        y2={padding.top + chartHeight / 2}
        className="chart-zero-line"
      />

      <text x="8" y={padding.top + 6} className="chart-axis-label">
        100%
      </text>

      <text x="12" y={padding.top + chartHeight / 2 + 4} className="chart-axis-label">
        50%
      </text>

      <text x="12" y={padding.top + chartHeight} className="chart-axis-label">
        0%
      </text>

      <text x={width - 42} y={padding.top + 8} className="chart-axis-label">
        B+40
      </text>

      <text x={width - 34} y={padding.top + chartHeight / 2 + 4} className="chart-axis-label">
        Jigo
      </text>

      <text x={width - 42} y={padding.top + chartHeight} className="chart-axis-label">
        W+40
      </text>
    </>
  );
}

function ChartLines({
  evalHistory,
  metrics,
  xForIndex,
  yForValue
}) {
  return (
    <>
      {metrics.map(metric => {
        const points = evalHistory
          .map((entry, index) => {
            const value = metric.getValue(entry);
            if (typeof value !== "number") return null;

            return `${xForIndex(index)},${yForValue(value, metric.min, metric.max)}`;
          })
          .filter(Boolean)
          .join(" ");

        return (
          <polyline
            key={metric.key}
            points={points}
            fill="none"
            stroke={metric.color}
            className="chart-line"
          />
        );
      })}
    </>
  );
}

function HoverPoints({
  hoverEntry,
  hoverX,
  metrics,
  yForValue
}) {
  return (
    <>
      {metrics.map(metric => {
        const value = metric.getValue(hoverEntry);
        if (typeof value !== "number") return null;

        return (
          <circle
            key={`${metric.key}-hover`}
            cx={hoverX}
            cy={yForValue(value, metric.min, metric.max)}
            r="4"
            fill={metric.color}
          />
        );
      })}
    </>
  );
}

function ChartTooltip({
  hoverEntry,
  metrics,
  tooltipPosition
}) {
  return (
    <div
      className="chart-tooltip"
      style={{
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`
      }}
    >
      <div>
        <strong>Move {hoverEntry.moveNumber}</strong>
      </div>

      {metrics.map(metric => {
        const value = metric.getValue(hoverEntry);

        return (
          <div key={metric.key} style={{ color: metric.color }}>
            {metric.label}:{" "}
            <strong>
              {typeof value === "number" ? metric.format(value) : "-"}
            </strong>
          </div>
        );
      })}
    </div>
  );
}
