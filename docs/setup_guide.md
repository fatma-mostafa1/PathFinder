# Setup Guide

## Prerequisites

- Node.js and npm
- Python 3.11+
- Expo Go or an Android/iOS emulator

## Frontend

```powershell
cd PathFinder\frontend
npm install
npx expo start
```

## Backend

```powershell
cd PathFinder\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

## Connect Frontend to Backend

```powershell
cd PathFinder\frontend
$env:EXPO_PUBLIC_API_MODE='backend'
$env:EXPO_PUBLIC_API_BASE_URL='http://localhost:8000'
npx expo start
```

For a physical phone, replace `localhost` with your computer's LAN IP address.

## Demo Account

The mock frontend mode accepts any valid email and a password with at least six characters. Backend mode requires registration first.
