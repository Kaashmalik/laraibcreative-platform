#!/bin/bash

# Database Migration Script
# Handles database migrations and schema updates

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Database Migration Script"
echo "=========================================="
echo ""

# Configuration
MONGODB_URI="${MONGODB_URI:-}"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Step 1: Create backup
echo "Step 1: Creating database backup..."
echo "-----------------------------------"

if [ -z "$MONGODB_URI" ]; then
  echo -e "${RED}❌ MONGODB_URI not set${NC}"
  exit 1
fi

mkdir -p "$BACKUP_DIR"

BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}"

echo "Creating backup to: $BACKUP_FILE"
mongodump --uri="$MONGODB_URI" --out="$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Backup created successfully${NC}"
else
  echo -e "${RED}❌ Backup failed${NC}"
  exit 1
fi

# Step 2: Verify backup
echo ""
echo "Step 2: Verifying backup..."
echo "---------------------------"
if [ -d "$BACKUP_FILE" ]; then
  BACKUP_SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
  echo -e "${GREEN}✅ Backup verified (Size: $BACKUP_SIZE)${NC}"
else
  echo -e "${RED}❌ Backup verification failed${NC}"
  exit 1
fi

# Step 3: Run migrations
echo ""
echo "Step 3: Running migrations..."
echo "------------------------------"
echo "Note: Migrations are handled automatically by the application"
echo "on startup. This script ensures backups are created first."

# Step 4: Verify indexes
echo ""
echo "Step 4: Verifying database indexes..."
echo "--------------------------------------"
echo "Indexes will be created/verified on next application startup"

# Step 5: Migration summary
echo ""
echo "=========================================="
echo "Migration Summary"
echo "=========================================="
echo ""
echo "Backup Location: $BACKUP_FILE"
echo "Backup Size: $BACKUP_SIZE"
echo ""
echo "Next Steps:"
echo "1. Deploy application update"
echo "2. Application will create/update indexes on startup"
echo "3. Monitor application logs for migration status"
echo ""
echo "To restore backup if needed:"
echo "mongorestore --uri=\"\$MONGODB_URI\" $BACKUP_FILE"

