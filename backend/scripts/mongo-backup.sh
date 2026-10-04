#!/bin/bash
# Daily MongoDB backup — meant to run from cron on the production server.
# Restore with: mongorestore --gzip --archive=<file> --drop
set -euo pipefail

DB_NAME="neliaxa"
BACKUP_DIR="/var/backups/mongodb"
RETENTION_DAYS=14
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR"

mongodump --db "$DB_NAME" --gzip --archive="$BACKUP_DIR/${DB_NAME}-${TIMESTAMP}.gz"

find "$BACKUP_DIR" -name "${DB_NAME}-*.gz" -mtime "+${RETENTION_DAYS}" -delete

echo "[$(date -Iseconds)] Backup done: ${DB_NAME}-${TIMESTAMP}.gz"
