import React, { useState } from "react";

import TeachingReview from "./TeachingReview";
import EngineSettingsModal from "./EngineSettingsModal";
import NewGameModal from "./NewGameModal";
import RightPanel from "./RightPanel";
import BoardToolbar from "./BoardToolbar";
import GeneralSettingsModal from "./GeneralSettingsModal";

import BoardOverlay, {
  OVERLAY_BOARD_PADDING,
  OVERLAY_VERTEX_SIZE
} from "./BoardOverlay";

export default function BoardLayout({
  sidebarOpen,
  setSidebarOpen,

  appMode,
  switchMode,

  settings,
  setSettings,

  showSettings,
  setShowSettings,
  showEngineSettings,
  setShowEngineSettings,
  showTeachingReview,
  setShowTeachingReview,

  engineSettings,
  setEngineSettings,
  showGeneralSettings,
  setShowGeneralSettings,

  isReviewMode,
  currentTreeNode,
  navigationLine,

  currentIndex,
  history,
  isThinking,
  gameOver,
  isAtLatestMove,

  goToMove,
  jumpToMoveNumber,
  passMove,
  resignGame,

  containerRef,
  ownership,
  topMoves,
  displayedMoves,
  displayedState,

  evalHistory,
  evalSummary,
  chartMode,
  setChartMode,

  activeTab,
  setActiveTab,

  branches,
  selectedBranchId,
  branchPreview,
  createBranchFromTopMove,
  clearBranchPreview,
  setBranchPreview,

  gameTree,
  selectTreeNode,

  startNewGame,
  setCurrentIndex,

  saveGame,
  saveGameAs,
  loadGame,

  blackTime,
  whiteTime,
  activeColor,

  showReviewSummary,
  openAnalysisReview,
  closeReviewSummary,
  selectedPivotalMove,
  analyzePivotalMove,
  analyzeCurrentPosition,
  reviewCurrentMove,

  reviewRunning,
  reviewProgress,
  reviewReport,
  runWholeGameReview,

  clearReviewReport
}) {

  return (
    <div className={`app-shell ${sidebarOpen ? "" : "sidebar-hidden"}`}>
      <button
        className="hamburger-button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title="Show/hide menu"
      >
        ☰
      </button>

      <Sidebar
        appMode={appMode}
        switchMode={switchMode}
        settings={settings}
        setSettings={setSettings}
        setShowSettings={setShowSettings}
        setShowEngineSettings={setShowEngineSettings}
        setShowGeneralSettings={setShowGeneralSettings}
        openAnalysisReview={openAnalysisReview}
        saveGame={saveGame}
        saveGameAs={saveGameAs}
        loadGame={loadGame}
      />

      <BoardArea
        appMode={appMode}
        isReviewMode={isReviewMode}
        currentTreeNode={currentTreeNode}
        navigationLine={navigationLine}
        currentIndex={currentIndex}
        history={history}
        isThinking={isThinking}
        gameOver={gameOver}
        isAtLatestMove={isAtLatestMove}
        goToMove={goToMove}
        passMove={passMove}
        resignGame={resignGame}
        containerRef={containerRef}
        ownership={ownership}
        topMoves={topMoves}
        displayedMoves={displayedMoves}
        displayedState={displayedState}
        settings={settings}
        branchPreview={branchPreview}
      />

      <RightPanel
        settings={settings}
        setSettings={setSettings}
        appMode={appMode}
        isThinking={isThinking}
        isReviewMode={isReviewMode}
        displayedState={displayedState}
        currentIndex={currentIndex}
        currentTreeNode={currentTreeNode}
        navigationLine={navigationLine}
        history={history}
        evalHistory={evalHistory}
        blackTime={blackTime}
        whiteTime={whiteTime}
        activeColor={activeColor}
        evalSummary={evalSummary}
        chartMode={chartMode}
        setChartMode={setChartMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        topMoves={topMoves}
        branches={branches}
        selectedBranchId={selectedBranchId}
        branchPreview={branchPreview}
        createBranchFromTopMove={createBranchFromTopMove}
        clearBranchPreview={clearBranchPreview}
        setBranchPreview={setBranchPreview}
        gameTree={gameTree}
        selectTreeNode={selectTreeNode}
        showReviewSummary={showReviewSummary}
        openAnalysisReview={openAnalysisReview}
        closeReviewSummary={closeReviewSummary}
        reviewRunning={reviewRunning}
        reviewProgress={reviewProgress}
        reviewReport={reviewReport}
        runWholeGameReview={runWholeGameReview}
        selectedPivotalMove={selectedPivotalMove}
        analyzePivotalMove={analyzePivotalMove}
        analyzeCurrentPosition={analyzeCurrentPosition}
        reviewCurrentMove={reviewCurrentMove}
      />

      <ModalLayer
        showTeachingReview={showTeachingReview}
        setShowTeachingReview={setShowTeachingReview}
        history={history}
        evalHistory={evalHistory}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}

        showSettings={showSettings}
        setShowSettings={setShowSettings}
        settings={settings}
        setSettings={setSettings}
        startNewGame={startNewGame}

        showGeneralSettings={showGeneralSettings}
        setShowGeneralSettings={setShowGeneralSettings}

        showEngineSettings={showEngineSettings}
        setShowEngineSettings={setShowEngineSettings}
        engineSettings={engineSettings}
        setEngineSettings={setEngineSettings}
      />
    </div>
  );
}

function Sidebar({
  appMode,
  switchMode,
  settings,
  setSettings,
  setShowSettings,
  setShowEngineSettings,
  setShowGeneralSettings,
  openAnalysisReview,
  saveGame,
  saveGameAs,
  loadGame
}) {
  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <aside className="sidebar">
      <h1 style={{ marginTop: "44px" }}>Go Tutor</h1>

      <div className="mode-indicator">
        Mode: <strong>{appMode}</strong>
      </div>

      <SidebarButton onClick={() => setShowSettings(true)}>
        New Game / Settings
      </SidebarButton>

      <SidebarButton onClick={saveGame}>
        Save Game
      </SidebarButton>

      <SidebarButton onClick={saveGameAs}>
        Save As SGF
      </SidebarButton>

      <SidebarButton onClick={loadGame}>
        Load Game
      </SidebarButton>

      <SidebarButton
        active={appMode === "play"}
        onClick={() => switchMode("play")}
      >
        Play Mode
      </SidebarButton>

      <SidebarButton
        active={appMode === "review"}
        onClick={() => switchMode("review")}
      >
        Review Mode
      </SidebarButton>

      <SidebarButton
        active={appMode === "teaching"}
        onClick={() => switchMode("teaching")}
      >
        Teaching Mode
      </SidebarButton>

      <SidebarButton onClick={openAnalysisReview}>
        AI Review / Analysis
      </SidebarButton>

      <SidebarButton onClick={() => setShowEngineSettings(true)}>
        Engine Settings
      </SidebarButton>

      <SidebarButton onClick={() => setShowGeneralSettings(true)}>
        General Settings
      </SidebarButton>

      <div className="toggle-row">
        <SidebarCheckbox
          label="Show top moves"
          checked={settings.showTopMoves}
          onChange={value => updateSetting("showTopMoves", value)}
        />

        <SidebarCheckbox
          label="Show territory"
          checked={settings.showTerritory}
          onChange={value => updateSetting("showTerritory", value)}
        />

        <SidebarCheckbox
          label="Show analysis panel"
          checked={settings.showAnalysisPanel}
          onChange={value => updateSetting("showAnalysisPanel", value)}
        />
      </div>
    </aside>
  );
}

function SidebarButton({
  active = false,
  onClick,
  children
}) {
  return (
    <button
      className={active ? "active" : ""}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function SidebarCheckbox({
  label,
  checked,
  onChange
}) {
  return (
    <label>
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={event => onChange(event.target.checked)}
      />
      {" "}
      {label}
    </label>
  );
}

function BoardArea({
  appMode,
  isReviewMode,
  currentTreeNode,
  navigationLine,
  currentIndex,
  history,
  isThinking,
  gameOver,
  isAtLatestMove,
  goToMove,
  passMove,
  resignGame,
  containerRef,
  ownership,
  topMoves,
  displayedMoves,
  displayedState,
  settings,
  branchPreview
}) {
  return (
    <main className="main-board-area">
      <BoardToolbar
        currentIndex={isReviewMode ? currentTreeNode.moveNumber : currentIndex}
        historyLength={isReviewMode ? navigationLine.length : history.length}
        isThinking={isThinking}
        gameOver={gameOver || appMode !== "play"}
        goToMove={goToMove}
        passMove={passMove}
        resignGame={resignGame}
      />

      <BoardCanvasArea
        containerRef={containerRef}
        ownership={ownership}
        topMoves={topMoves}
        displayedMoves={displayedMoves}
        displayedState={displayedState}
        settings={settings}
        branchPreview={branchPreview}
      />

      <StatusText
        appMode={appMode}
        currentIndex={currentIndex}
        isAtLatestMove={isAtLatestMove}
        feedback={displayedState.feedback}
      />
    </main>
  );
}

function BoardCanvasArea({
  containerRef,
  ownership,
  topMoves,
  displayedMoves,
  displayedState,
  settings,
  branchPreview
}) {
  const [hoverPoint, setHoverPoint] = useState(null);

  const nextMoveColor =
    displayedMoves.length % 2 === 0 ? "B" : "W";

  const handleBoardMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const x = Math.round((mouseX - OVERLAY_BOARD_PADDING) / OVERLAY_VERTEX_SIZE);
    const y = Math.round((mouseY - OVERLAY_BOARD_PADDING) / OVERLAY_VERTEX_SIZE);

    if (x < 0 || x >= 19 || y < 0 || y >= 19) {
      setHoverPoint(null);
      return;
    }

    setHoverPoint({ x, y });
  };

  const handleBoardMouseLeave = () => {
    setHoverPoint(null);
  };

  return (
    <div className="board-wrapper">
      <div
        className="board-overlay-container"
        onMouseMove={handleBoardMouseMove}
        onMouseLeave={handleBoardMouseLeave}
      >
        <div ref={containerRef} />

        <BoardOverlay
          settings={settings}
          ownership={ownership}
          topMoves={topMoves}
          branchPreview={branchPreview}
          currentMoves={displayedMoves}
          currentBoard={displayedState.board}
          hoverPoint={hoverPoint}
          nextMoveColor={nextMoveColor}
        />
      </div>
    </div>
  );
}

function StatusText({
  appMode,
  currentIndex,
  isAtLatestMove,
  feedback
}) {
  return (
    <div className="status-text">
      {feedback}

      {appMode !== "play" && (
        <div style={{ color: "#38bdf8", marginTop: "6px" }}>
          {appMode === "review"
            ? "Review mode: explore variations without changing the real game."
            : "Teaching mode: analyze mistakes and suggested alternatives."}
        </div>
      )}

      {appMode === "play" && !isAtLatestMove && (
        <div style={{ color: "#facc15", marginTop: "6px" }}>
          Viewing move {currentIndex}. Go to latest move to continue playing.
        </div>
      )}
    </div>
  );
}

function ModalLayer({
  showTeachingReview,
  setShowTeachingReview,
  history,
  evalHistory,
  currentIndex,
  setCurrentIndex,

  showSettings,
  setShowSettings,
  settings,
  setSettings,
  startNewGame,

  showGeneralSettings,
  setShowGeneralSettings,

  showEngineSettings,
  setShowEngineSettings,
  engineSettings,
  setEngineSettings
}) {
  return (
    <>
      {showTeachingReview && (
        <TeachingReview
          history={history}
          evalHistory={evalHistory}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          onClose={() => setShowTeachingReview(false)}
        />
      )}

      {showSettings && (
        <NewGameModal
          settings={settings}
          setSettings={setSettings}
          onCancel={() => setShowSettings(false)}
          onStartGame={startNewGame}
        />
      )}

      {showGeneralSettings && (
        <GeneralSettingsModal
          settings={settings}
          setSettings={setSettings}
          onClose={() => setShowGeneralSettings(false)}
        />
      )}

      {showEngineSettings && (
        <EngineSettingsModal
          engineSettings={engineSettings}
          setEngineSettings={setEngineSettings}
          onClose={() => setShowEngineSettings(false)}
        />
      )}
    </>
  );
}
