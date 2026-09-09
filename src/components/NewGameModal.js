import React from "react";

import {
  TIME_SYSTEM_OPTIONS
} from "../utils/analysisUtils";

import {
  GO_RANK_OPTIONS,
  applyBotPlayerInfo,
  botPowerToVisits,
  rankToBotPower
} from "../hooks/useBoardSettings";

export default function NewGameModal({
  settings,
  setSettings,
  onCancel,
  onStartGame
}) {
  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updatePlayerType = (color, type) => {
    setSettings(prev => {
      const next = {
        ...prev,
        [color === "B" ? "blackType" : "whiteType"]: type
      };

      if (type === "bot") {
        if (color === "B") {
          next.whiteType = next.whiteType === "bot" ? "human" : next.whiteType;
        } else {
          next.blackType = next.blackType === "bot" ? "human" : next.blackType;
        }
      }

      return applyBotPlayerInfo(next);
    });
  };

  const updateBotRank = (rank) => {
    setSettings(prev => {
      const nextPower = rankToBotPower(rank);

      const next = {
        ...prev,
        botRank: rank,
        botPower: nextPower,
        botPowerPreset: "custom",
        maxVisits: botPowerToVisits(nextPower)
      };

      return applyBotPlayerInfo(next);
    });
  };

  const updateBotName = (name) => {
    setSettings(prev => {
      const next = {
        ...prev,
        botName: name
      };

      return applyBotPlayerInfo(next);
    });
  };

  const updateBotPower = (power) => {
    const numericPower = Number(power);

    setSettings(prev => ({
      ...prev,
      botPower: numericPower,
      botPowerPreset: "custom",
      maxVisits: botPowerToVisits(numericPower)
    }));
  };

  const botEnabled =
    settings.blackType === "bot" || settings.whiteType === "bot";

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div
        className="modal large-modal"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <h2>New Game Settings</h2>

        <section className="modal-section">
          <h3>Players</h3>

          <div className="form-row">
            <label>Black Player</label>
            <select
              value={settings.blackType}
              onChange={(event) => updatePlayerType("B", event.target.value)}
            >
              <option value="human">Human</option>
              <option value="bot">Bot</option>
            </select>
          </div>

          <div className="form-row">
            <label>Black Name</label>
            <input
              type="text"
              value={settings.blackName}
              disabled={settings.blackType === "bot"}
              onChange={(event) => updateSetting("blackName", event.target.value)}
            />
          </div>

          <div className="form-row">
            <label>Black Rank</label>
            <input
              type="text"
              value={settings.blackRank || "?"}
              disabled={settings.blackType === "bot"}
              onChange={(event) => updateSetting("blackRank", event.target.value)}
            />
          </div>

          <div className="form-row">
            <label>White Player</label>
            <select
              value={settings.whiteType}
              onChange={(event) => updatePlayerType("W", event.target.value)}
            >
              <option value="human">Human</option>
              <option value="bot">Bot</option>
            </select>
          </div>

          <div className="form-row">
            <label>White Name</label>
            <input
              type="text"
              value={settings.whiteName}
              disabled={settings.whiteType === "bot"}
              onChange={(event) => updateSetting("whiteName", event.target.value)}
            />
          </div>

          <div className="form-row">
            <label>White Rank</label>
            <input
              type="text"
              value={settings.whiteRank || "?"}
              disabled={settings.whiteType === "bot"}
              onChange={(event) => updateSetting("whiteRank", event.target.value)}
            />
          </div>
        </section>

        {botEnabled && (
          <section className="modal-section">
            <h3>Bot Strength</h3>

            <div className="form-row">
              <label>Bot Name</label>
              <input
                type="text"
                value={settings.botName || "KataGo"}
                onChange={(event) => updateBotName(event.target.value)}
              />
            </div>

            <div className="form-row">
              <label>Bot Rank</label>
              <select
                value={settings.botRank || "9k"}
                onChange={(event) => updateBotRank(event.target.value)}
              >
                {GO_RANK_OPTIONS.map(rank => (
                  <option key={rank} value={rank}>
                    {rank}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label>Bot Power</label>
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.01"
                value={Number(settings.botPower) || 0.5}
                onChange={(event) => updateBotPower(event.target.value)}
              />
            </div>

            <div className="bot-power-description">
              <strong>{settings.botName || "KataGo"} [{settings.botRank || "?"}]</strong>
              <br />
              Power: {Math.round((Number(settings.botPower) || 0.5) * 100)}%
              <br />
              Visits: {settings.maxVisits}
              <br />
              Tip: choosing a rank auto-fills bot name/rank in the player card.
            </div>

            <div className="form-row">
              <label>Max Visits</label>
              <input
                type="number"
                min="1"
                value={settings.maxVisits}
                onChange={(event) => updateSetting("maxVisits", Number(event.target.value))}
              />
            </div>
          </section>
        )}

        <section className="modal-section">
          <h3>Game Rules</h3>

          <div className="form-row">
            <label>Rules</label>
            <select
              value={settings.rules}
              onChange={(event) => updateSetting("rules", event.target.value)}
            >
              <option value="japanese">Japanese</option>
              <option value="chinese">Chinese</option>
              <option value="korean">Korean</option>
              <option value="aga">AGA</option>
              <option value="tromp-taylor">Tromp-Taylor</option>
            </select>
          </div>

          <div className="form-row">
            <label>Komi</label>
            <input
              type="number"
              step="0.5"
              value={settings.komi}
              onChange={(event) => updateSetting("komi", Number(event.target.value))}
            />
          </div>

          <div className="form-row">
            <label>Handicap</label>
            <input
              type="number"
              min="0"
              max="9"
              value={settings.handicap}
              onChange={(event) => updateSetting("handicap", Number(event.target.value))}
            />
          </div>
        </section>

        <section className="modal-section">
          <h3>Time Settings</h3>

          <div className="form-row">
            <label>Time System</label>
            <select
              value={settings.timeSystem}
              onChange={(event) => updateSetting("timeSystem", event.target.value)}
            >
              {TIME_SYSTEM_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {settings.timeSystem !== "none" && (
            <div className="form-row">
              <label>Main Time</label>
              <input
                type="number"
                min="1"
                value={settings.mainTimeMinutes}
                onChange={(event) => updateSetting("mainTimeMinutes", Number(event.target.value))}
              />
            </div>
          )}

          {settings.timeSystem === "byoyomi" && (
            <>
              <div className="form-row">
                <label>Byo-yomi Seconds</label>
                <input
                  type="number"
                  min="1"
                  value={settings.byoYomiSeconds}
                  onChange={(event) => updateSetting("byoYomiSeconds", Number(event.target.value))}
                />
              </div>

              <div className="form-row">
                <label>Byo-yomi Periods</label>
                <input
                  type="number"
                  min="1"
                  value={settings.byoYomiPeriods}
                  onChange={(event) => updateSetting("byoYomiPeriods", Number(event.target.value))}
                />
              </div>
            </>
          )}
        </section>

        <div className="modal-actions">
          <button onClick={onCancel}>
            Cancel
          </button>

          <button onClick={onStartGame}>
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
