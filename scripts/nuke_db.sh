#!/usr/bin/env sh

# ============================================
# 🐼 MEMORIA - FULL NUKE SCRIPT
# Action: Supprime entièrement la base ET le rôle
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Chargement des variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
    # Pour nuke, on a besoin du compte super-utilisateur (souvent postgres)
    DB_SUPERUSER=${POSTGRES_USER:-postgres}
    DB_NAME=${POSTGRES_DB:-memoria_db_dev}
    APP_ROLE="app_memoria"
else
    echo -e "${RED}❌ .env file missing!${NC}"
    exit 1
fi

echo -e "${RED}☢️  NUCLEAR OPTION: FULL SYSTEM WIPE${NC}\n"
echo -e "${YELLOW}This will delete:${NC}"
echo -e "- Database: ${RED}$DB_NAME${NC}"
echo -e "- Role: ${RED}$APP_ROLE${NC}"
echo -e "\n${RED}EVERYTHING WILL BE LOST!${NC}"
printf "Type 'NUKE' to confirm execution: "
read -r REPLY

if [ "$REPLY" != "NUKE" ]; then
    echo -e "${GREEN}✓ Operation aborted. Safety first!${NC}"
    exit 0
fi

echo -e "\n${RED}🚀 Commencing Countdown...${NC}"

# 2. Suppression de la base de données
# L'option (FORCE) déconnecte les utilisateurs actifs (Postgres 13+)
echo -e "${YELLOW}➜ Dropping database $DB_NAME...${NC}"
psql -U "$DB_SUPERUSER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME (FORCE);"

# 3. Suppression du rôle (Nettoyage en profondeur)
echo -e "${YELLOW}➜ Cleaning up dependencies for role $APP_ROLE...${NC}"
# On se connecte à la DB 'postgres' pour réinitialiser les droits globaux
psql -U "$DB_SUPERUSER" -d postgres -c "
    -- Retire tous les privilèges et objets appartenant au rôle dans la base courante
    DROP OWNED BY $APP_ROLE;
" || echo -e "${YELLOW}⚠️ Notice: No owned objects found to drop.${NC}"

echo -e "${YELLOW}➜ Dropping role $APP_ROLE...${NC}"
psql -U "$DB_SUPERUSER" -d postgres -c "DROP ROLE IF EXISTS $APP_ROLE;"

echo -e "${GREEN}✨ Total destruction complete. System is clean.${NC}\n"

# 4. Proposition de renaissance
printf "${YELLOW}Would you like to rebuild everything from scratch? (y/N): ${NC}"
read -r REBUILD

if [[ "$REBUILD" =~ ^[OoYy]$ ]]; then
    # On appelle le script d'initialisation
    if [ -f "./scripts/init_db.sh" ]; then
        bash ./scripts/init_db.sh
    else
        echo -e "${RED}❌ init_db.sh not found!${NC}"
    fi
else
    echo -e "System left empty."
fi
