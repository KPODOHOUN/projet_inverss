#!/usr/bin/env bash
# Démarre MongoDB + backend (5000) + frontend (3000) avec vérification.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

backend_ok() { curl -sf http://127.0.0.1:5000/api/health >/dev/null 2>&1; }
frontend_ok() { curl -sf http://127.0.0.1:3000/ >/dev/null 2>&1; }

cleanup() {
  echo ""
  echo "Arrêt des services IMC..."
  [[ -n "${BACKEND_PID:-}" ]] && kill "$BACKEND_PID" 2>/dev/null || true
  [[ -n "${FRONTEND_PID:-}" ]] && kill "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

bash scripts/start-mongo.sh

if backend_ok; then
  echo "✔ Backend déjà actif (port 5000)"
  BACKEND_PID=""
else
  echo "▶ Démarrage du backend (port 5000)..."
  npm run dev --prefix backend &
  BACKEND_PID=$!
  for _ in $(seq 1 30); do
    backend_ok && break
    sleep 1
  done
  if ! backend_ok; then
    echo "❌ Backend inaccessible. Vérifiez backend/.env et MongoDB."
    exit 1
  fi
  echo "✔ Backend prêt"
fi

if frontend_ok; then
  echo "✔ Frontend déjà actif (port 3000)"
  FRONTEND_PID=""
else
  echo "▶ Démarrage du frontend (port 3000)..."
  BROWSER=none npm start --prefix frontend &
  FRONTEND_PID=$!
  for _ in $(seq 1 60); do
    frontend_ok && break
    sleep 2
  done
  if ! frontend_ok; then
    echo "❌ Frontend inaccessible après 2 min. Consultez les logs ci-dessus."
    exit 1
  fi
  echo "✔ Frontend prêt"
fi

IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
echo ""
echo "════════════════════════════════════════════"
echo "  IMC est prêt"
echo "  PC  → http://localhost:3000/login"
echo "  LAN → http://${IP:-localhost}:3000/login"
echo ""
echo "  Admin : admin@imc.com / Admin123!"
echo "  (npm run seed si le compte n'existe pas)"
echo "════════════════════════════════════════════"
echo "Ctrl+C pour arrêter."

wait
