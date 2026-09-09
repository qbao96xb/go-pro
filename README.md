# Go Teaching and Playing App

A web-based Go application for playing, reviewing, and studying Go games with AI-powered analysis from the KataGo engine.

This project provides an interactive Go board, game navigation, review mode, teaching mode, and position analysis. It is designed to help players understand their moves, compare alternatives, and improve through AI feedback.

---

## Features

- Interactive 19x19 Go board
- Human move input
- Bot/AI-assisted play
- Move history and navigation
- Review mode for analyzing completed games
- Teaching mode for guided learning
- KataGo-powered position analysis
- Best move suggestions
- Winrate and evaluation tracking
- Ownership/territory visualization
- Whole-game review
- Branch and variation exploration
- Auto-save support for completed games

---

## Technology Stack

### Frontend

- React
- JavaScript
- CSS
- Custom React hooks for board logic, navigation, analysis, and game state management

### Backend

- Python
- FastAPI
- KataGo analysis engine
- Subprocess-based communication with KataGo

---

## Project Structure

```text
go-pro/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── Board.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── README.md
│
├── backend/
│   ├── main.py
│   └── katago_wrapper.py
│
└── analysis_logs/
```

---

## Main Application Logic

The main board logic is implemented in:

```text
frontend/src/Board.js
```

`Board.js` acts as the central controller of the application. It connects the game state, board rendering, move handling, KataGo analysis, review system, and user interface.

---

## What `Board.js` Does

### 1. App Modes

The app supports multiple modes:

- **Play mode** - normal gameplay
- **Review mode** - analyze a game after or during play
- **Teaching mode** - guided review and learning mode

The current mode is controlled by:

```javascript
const [appMode, setAppMode] = useState("play");
```

---

### 2. Game State Management

The app tracks:

- Board position
- Move history
- Current move index
- Game-over state
- Current player state
- Sign map for board rendering

This is handled mainly through the custom hook:

```javascript
useLinearGame()
```

---

### 3. KataGo Analysis

The app uses KataGo to analyze Go positions and provide AI feedback.

KataGo analysis supports:

- Best move suggestions
- Winrate evaluation
- Ownership/territory estimation
- Evaluation history
- Current-position analysis
- Whole-game review

This is handled through:

```javascript
useKataGoAnalysis()
```

and backend endpoints such as:

```text
POST /analyze
```

---

### 4. Whole-Game Review

The app can review an entire game and identify important moments.

This is handled through:

```javascript
useWholeGameReview()
```

The review system can analyze the sequence of moves and generate a report for teaching or self-study.

---

### 5. Review Tree and Variations

The app supports branching variations during review.

This allows users to:

- Explore alternative moves
- Compare KataGo suggestions
- Study different continuations
- Navigate through review branches

This is handled through:

```javascript
useReviewTree()
```

---

### 6. Move Handling

Player moves and bot moves are handled by:

```javascript
useMoveHandlers()
```

This controls:

- Human board clicks
- Legal move placement
- Bot responses
- Updating board state
- Triggering analysis after moves

---

### 7. Board Rendering

The Go board is rendered using:

```javascript
useBoardRenderer()
```

This hook draws the current board state and connects board clicks to move handling.

---

### 8. Game Actions

The app supports common game actions such as:

- Start new game
- Save game
- Save game as
- Load game
- Pass
- Resign

These are handled by:

```javascript
useBoardActions()
```

---

### 9. Navigation

Users can move backward and forward through the game history.

Navigation is handled by:

```javascript
useBoardNavigation()
```

Supported navigation includes:

- Go to previous move
- Go to next move
- Jump to a specific move number
- Navigate through review-tree variations

---

### 10. Auto-Saving Finished Games

When a game is completed, the app can automatically save the finished game.

This logic is implemented in:

```javascript
useAutoSaveFinishedGame()
```

---

## Backend and KataGo Integration

The backend is implemented with FastAPI.

Main backend files:

```text
backend/main.py
backend/katago_wrapper.py
```

### `main.py`

Defines the FastAPI server and the `/analyze` endpoint.

The endpoint receives a Go position and sends it to KataGo for analysis.

### `katago_wrapper.py`

Manages communication with the KataGo process.

It:

- Starts KataGo in analysis mode
- Sends JSON requests to KataGo
- Reads KataGo responses
- Handles timeouts
- Returns analysis results to the frontend

---

## KataGo Requirements

To use the AI analysis features, KataGo must be installed locally.

You also need:

- KataGo executable
- KataGo config file
- KataGo model file

Example backend paths can be configured in `main.py` or through environment variables:

```text
KATAGO_PATH
KATAGO_CONFIG
KATAGO_MODEL
```

Example:

```bash
export KATAGO_PATH="/opt/homebrew/bin/katago"
export KATAGO_CONFIG="/path/to/analysis_example.cfg"
export KATAGO_MODEL="/path/to/katago-model.bin.gz"
```

---

## Running the Frontend

Go to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React app:

```bash
npm start
```

The app will usually run at:

```text
http://localhost:3000
```

---

## Running the Backend

Go to the backend folder:

```bash
cd backend
```

Install Python dependencies:

```bash
pip install fastapi uvicorn pydantic
```

Start the backend server:

```bash
uvicorn main:app --reload
```

The backend will usually run at:

```text
http://localhost:8000
```

You can test the backend health endpoint:

```text
http://localhost:8000/health
```

---

## Development Notes

- Do not commit `node_modules/` to GitHub.
- Use `.gitignore` to exclude generated files and local dependencies.
- KataGo model files can be large and should usually not be committed.
- Local machine-specific paths should be replaced with environment variables before deployment.

Recommended `.gitignore` entries:

```gitignore
node_modules/
.env
__pycache__/
*.pyc
analysis_logs/
*.log
*.bin.gz
.DS_Store
```

---

## Purpose

This project is built as a Go learning and analysis tool. It combines interactive gameplay with KataGo-powered review features, allowing players to study their games, test alternative moves, and improve their understanding of Go strategy.
