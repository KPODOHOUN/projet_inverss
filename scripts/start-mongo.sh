#!/usr/bin/env bash
# Start a local MongoDB instance for IMC development if none is listening.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# Persisted under the project dir, not /tmp — /tmp gets wiped on reboot /
# session reset, which was silently deleting every account, investment and
# transaction each time.
DATA_DIR="${NELIAXA_MONGO_DATA:-$ROOT/.mongo-data}"
PORT="${NELIAXA_MONGO_PORT:-27017}"

if command -v mongosh >/dev/null 2>&1; then
  if mongosh --quiet "mongodb://127.0.0.1:${PORT}" --eval "db.runCommand({ ping: 1 })" >/dev/null 2>&1; then
    echo "MongoDB already running on port ${PORT}"
    exit 0
  fi
elif command -v mongo >/dev/null 2>&1; then
  if mongo --quiet "mongodb://127.0.0.1:${PORT}/admin" --eval "db.runCommand({ ping: 1 })" >/dev/null 2>&1; then
    echo "MongoDB already running on port ${PORT}"
    exit 0
  fi
fi

mkdir -p "${DATA_DIR}"
echo "Starting MongoDB (data: ${DATA_DIR}, port: ${PORT})..."
mongod \
  --dbpath "${DATA_DIR}" \
  --port "${PORT}" \
  --bind_ip 127.0.0.1 \
  --logpath "${DATA_DIR}/mongod.log" \
  --fork

echo "MongoDB started on port ${PORT}"
