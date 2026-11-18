#!/usr/bin/env bash
# Backup harian SQL Server (Opsi A). Jadwalkan via crontab VM:
#   0 2 * * * /opt/kmk/deploy/scripts/backup-db.sh >> /var/log/kmk-backup.log 2>&1
set -euo pipefail
source "$(dirname "$0")/../../.env"
STAMP=$(date +%Y%m%d_%H%M)
docker exec kmk-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -C \
  -Q "BACKUP DATABASE [$DB_NAME] TO DISK = N'/var/opt/mssql/backup/${DB_NAME}_${STAMP}.bak' WITH INIT, COMPRESSION"
echo "[$(date)] backup ${DB_NAME}_${STAMP}.bak selesai"
