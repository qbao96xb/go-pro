import React from "react";

export default function EngineSettingsModal({
  engineSettings,
  setEngineSettings,
  onClose
}) {
  const saveEngineSettings = () => {
    localStorage.setItem(
      "goTutorEngineSettings",
      JSON.stringify(engineSettings)
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
        <h2>Engine Settings</h2>

        <div className="form-row">
          <label>KataGo Path</label>
          <input
            type="text"
            placeholder="/path/to/katago"
            value={engineSettings.katagoPath}
            onChange={(e) =>
              setEngineSettings({
                ...engineSettings,
                katagoPath: e.target.value
              })
            }
          />
        </div>

        <div className="form-row">
          <label>Model Path</label>
          <input
            type="text"
            placeholder="/path/to/model.bin.gz"
            value={engineSettings.modelPath}
            onChange={(e) =>
              setEngineSettings({
                ...engineSettings,
                modelPath: e.target.value
              })
            }
          />
        </div>

        <div className="form-row">
          <label>Config Path</label>
          <input
            type="text"
            placeholder="/path/to/gtp_config.cfg"
            value={engineSettings.configPath}
            onChange={(e) =>
              setEngineSettings({
                ...engineSettings,
                configPath: e.target.value
              })
            }
          />
        </div>

        <div className="form-row">
          <label>Analysis Config</label>
          <input
            type="text"
            placeholder="/path/to/analysis_config.cfg"
            value={engineSettings.analysisConfigPath}
            onChange={(e) =>
              setEngineSettings({
                ...engineSettings,
                analysisConfigPath: e.target.value
              })
            }
          />
        </div>

        <div className="form-row">
          <label>Default Visits</label>
          <input
            type="number"
            min="1"
            max="10000"
            value={engineSettings.defaultMaxVisits}
            onChange={(e) =>
              setEngineSettings({
                ...engineSettings,
                defaultMaxVisits: Number(e.target.value)
              })
            }
          />
        </div>

        <div className="form-row">
          <label>Default Time Limit</label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            value={engineSettings.defaultTimeLimit}
            onChange={(e) =>
              setEngineSettings({
                ...engineSettings,
                defaultTimeLimit: Number(e.target.value)
              })
            }
          />
        </div>

        <div className="form-row">
          <label>Ownership</label>
          <select
            value={engineSettings.useOwnership ? "yes" : "no"}
            onChange={(e) =>
              setEngineSettings({
                ...engineSettings,
                useOwnership: e.target.value === "yes"
              })
            }
          >
            <option value="yes">Enabled</option>
            <option value="no">Disabled</option>
          </select>
        </div>

        <div className="form-row">
          <label>Winrate Perspective</label>
          <select
            value={engineSettings.reportAnalysisWinratesAs}
            onChange={(e) =>
              setEngineSettings({
                ...engineSettings,
                reportAnalysisWinratesAs: e.target.value
              })
            }
          >
            <option value="BLACK">Black</option>
            <option value="WHITE">White</option>
            <option value="SIDETOMOVE">Side to move</option>
          </select>
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>
            Cancel
          </button>

          <button onClick={saveEngineSettings}>
            Save Engine Settings
          </button>
        </div>
      </div>
    </div>
  );
}
