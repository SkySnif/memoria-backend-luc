#!/usr/bin/env sh

# ============================================
# 🐼 MEMORIA - SQL Runner Utitlity
# ============================================
# Usage: ./scripts/run_sql.sh <path_to_file> [db_name] [db_user]
# ============================================

set -e

# Message colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Chargement des variables
#---------------------------------------------
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
    # Valeurs par défaut depuis le .env
    DEFAULT_DB_USER=${DB_APP_USER:-app_memoria}
    DEFAULT_DB_NAME=${DB_NAME:-memoria_db_dev}
else
    echo -e "${RED}❌ Error: .env file not found! ${NC}"
    exit 1
fi

# 2. Gestion des Arguments Dynamiques
#---------------------------------------------
FILE_PATH=$1
# Si $2 n'est pas fourni, on utilise le nom de DB du .env (qui est déjà stocké dans DEFAULT_DB_NAME)
TARGET_DB=${2:-$DEFAULT_DB_NAME}
# Si $3 n'est pas fourni, on utilise le user de DB du .env (qui est déjà stocké dans DEFAULT_DB_USER)
TARGET_USER=${3:-$DEFAULT_DB_USER}

# 3. Validation
#---------------------------------------------
if [ -z "$FILE_PATH" ]; then
    echo -e "${YELLOW}Usage:${NC} npm run db:run <file.sql> [db_name] [db_user]"
    echo -e "\n${BLUE}Exemples:${NC}"
    echo -e " Standard : ${NC}npm run db:run database/migration/tables/07_session.sql"
    echo -e " Systeme  : ${NC}npm run db:run database/migration/config/01_roles.sql postgres"
    exit 1
fi

if [ ! -f "$FILE_PATH" ]; then
    echo -e "${RED}❌ File not found: $FILE_PATH${NC}"
    exit 1
fi

# 4.
#---------------------------------------------
echo -e "${GREEN}🐼 MEMORIA - SQL Runner${NC}"
echo -e "📁 File:    ${YELLOW}$FILE_PATH${NC}"
echo -e "🗄️ Target:    ${BLUE}$TARGET_DB${NC} (as $TARGET_USER)"

# Exécution avec psql
# -v ON_ERROR_STOP=1 : Arrête tout de suite si erreur SQL
# -q : Quiet mode (moins de blabla par défaut, sauf erreurs/notices)
psql -v ON_ERROR_STOP=1 -U "$TARGET_USER" -d "$TARGET_DB" -f "$FILE_PATH"

# Vérification du code de retour (bien que set -e gère le crash, c'est bien pour le log visuel)
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Success! The script was excuted perfectly.${NC}"
else
    echo -e "${RED}❌ Error during execution.${NC}"
    exit 1
fi
