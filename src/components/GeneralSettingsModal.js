import React from "react";

export default function GeneralSettingsModal({
  settings,
  setSettings,
  onClose
}) {
  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveGeneralSettings = () => {
    localStorage.setItem(
      "goTutorGeneralSettings",
      JSON.stringify({
        showTopMoves: settings.showTopMoves,
        showTerritory: settings.showTerritory,
        showAnalysisPanel: settings.showAnalysisPanel,
        showCoordinates: settings.showCoordinates,
        showLastMoveMarker: settings.showLastMoveMarker,
        showHoverGhostStone: settings.showHoverGhostStone,
        autoAnalyzeAfterMove: settings.autoAnalyzeAfterMove
      })
    );

    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="modal"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>General Settings</h2>

        <div className="settings-checkbox-list">
          <label>
            <input
              type="checkbox"
              checked={settings.showTopMoves}
              onChange={(e) => updateSetting("showTopMoves", e.target.checked)}
            />
            Show top moves
          </label>

          <label>
            <input
              type="checkbox"
              checked={settings.showTerritory}
              onChange={(e) => updateSetting("showTerritory", e.target.checked)}
            />
            Show expected territory
          </label>

          <label>
            <input
              type="checkbox"
              checked={settings.showAnalysisPanel}
              onChange={(e) => updateSetting("showAnalysisPanel", e.target.checked)}
            />
            Show analysis panel
          </label>

          <label>
            <input
              type="checkbox"
              checked={settings.showCoordinates}
              onChange={(e) => updateSetting("showCoordinates", e.target.checked)}
            />
            Show board coordinates
          </label>

          <label>
            <input
              type="checkbox"
              checked={settings.showLastMoveMarker}
              onChange={(e) => updateSetting("showLastMoveMarker", e.target.checked)}
            />
            Show last move marker
          </label>

          <label>
            <input
              type="checkbox"
              checked={settings.showHoverGhostStone}
              onChange={(e) => updateSetting("showHoverGhostStone", e.target.checked)}
            />
            Show hover ghost stone
          </label>

          <label>
            <input
              type="checkbox"
              checked={settings.autoAnalyzeAfterMove}
              onChange={(e) => updateSetting("autoAnalyzeAfterMove", e.target.checked)}
            />
            Auto-analyze after each move
          </label>
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>
            Cancel
          </button>

          <button onClick={saveGeneralSettings}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
