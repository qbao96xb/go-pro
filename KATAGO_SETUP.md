# KataGo Setup Guide

This project uses KataGo as the Go analysis engine.

KataGo is required for:

- AI move analysis
- Winrate evaluation
- Ownership estimation
- Whole-game review
- Bot move suggestions

---

## 1. Install KataGo

Download KataGo from the official GitHub repository:

https://github.com/lightvector/KataGo/releases

Choose the version suitable for your operating system:

- macOS
- Windows
- Linux

After downloading, make sure the KataGo executable works from your terminal.

Example:

```bash
katago version
```

If this command does not work, you may need to provide the full path to the KataGo executable.

---

## 2. Download a KataGo model

Download a neural network model from:

https://katagotraining.org/networks/

The model file usually ends with:

```text
.bin.gz
```

Example:

```text
kata1-b28c512nbt-s13255194368-d5935380940.bin.gz
```

Do not commit model files to GitHub because they are large.

---

## 3. Prepare a KataGo config file

KataGo needs a configuration file for analysis mode.

You can use the example config included with KataGo, usually named:

```text
analysis_example.cfg
```

Keep this file somewhere on your computer.

---

## 4. Create backend environment file

Inside the backend folder, create:

```text
backend/.env
```

Add your local paths:

```env
KATAGO_PATH=/path/to/katago
KATAGO_CONFIG=/path/to/analysis_example.cfg
KATAGO_MODEL=/path/to/katago-model.bin.gz
```

Example on macOS:

```env
KATAGO_PATH=/opt/homebrew/bin/katago
KATAGO_CONFIG=/Users/yourname/Games/Katago/analysis_example.cfg
KATAGO_MODEL=/Users/yourname/Games/Katago/kata1-model.bin.gz
```

Important: Do not commit `.env` to GitHub.

---

## 5. Create `.env.example`

Inside the backend folder, create:

```text
backend/.env.example
```

Add:

```env
KATAGO_PATH=/path/to/katago
KATAGO_CONFIG=/path/to/analysis_example.cfg
KATAGO_MODEL=/path/to/katago-model.bin.gz
```

This file is safe to commit.

---

## 6. Install backend dependencies

From the backend folder:

```bash
cd backend
pip install fastapi uvicorn pydantic python-dotenv
```

---

## 7. Start the backend

From the backend folder:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The backend should start at:

```text
http://127.0.0.1:8000
```

Check health:

```text
http://127.0.0.1:8000/health
```

---

## 8. Start the frontend

From the frontend folder:

```bash
cd frontend
npm install
npm start
```

The frontend usually starts at:

```text
http://localhost:3000
```

---

## 9. Security notes

Do not commit:

- `.env`
- KataGo model files
- local absolute paths
- logs
- API keys
- private config files

Recommended `.gitignore` entries:

```gitignore
.env
.env.*
!.env.example

*.bin.gz
models/
katago/

analysis_logs/
*.log
```

---

## 10. Troubleshooting

### KataGo command not found

Use the full path to KataGo in `.env`:

```env
KATAGO_PATH=/opt/homebrew/bin/katago
```

### Backend says missing environment variables

Make sure:

- `.env` is inside `backend/`
- `python-dotenv` is installed
- `main.py` contains:

```python
from dotenv import load_dotenv

load_dotenv()
```

### Backend starts but analysis fails

Check:

- The model path is correct
- The config path is correct
- The KataGo executable path is correct
- The model file has not been moved or renamed
