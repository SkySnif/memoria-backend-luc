#!/usr/bin/env sh

# ============================================
# 🐼 MEMORIA - DB Initialization Script
# ============================================

set

# --------------------------------------------
# Colors
# --------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "${GREEN}🐼 Memoria - Database Initialization${NC}\n"

# --------------------------------------------
# Load environment variables
# --------------------------------------------
if [ ! -f .env ]; then
    echo "${RED}❌ Error: .env file not found!${NC}"
    exit 1
fi

export $(grep -v '^#' .env | xargs)

DB_USER=${DB_USER:-postgres}
DB_APP_USER=${DB_APP_USER:-app_memoria}
DB_NAME=${DB_NAME:-memoria_db_dev}

# --------------------------------------------
# Helpers
# --------------------------------------------

execute_sql() {
    file=$1
    description=$2
    db=$3
    host=$4
    port=$5
    user=$6

    echo "${YELLOW}➜${NC} $description"

    PGPASSWORD="${DB_PASSWORD}" \
    psql -v ON_ERROR_STOP=1 -h "${host}" -p "${port}" -U "$user" -d "$db" -f "$file"
    
}

execute_directory() {
    dir=$1
    db=$2
    host=$3
    port=$4
    user=$5

    [ ! -d "$dir" ] && return

    echo "${GREEN}📂 Folder: $dir${NC}"
    for file in $(find "$dir" -maxdepth 1 -name "*.sql" | sort); do
        execute_sql "$file" "Executing $(basename "$file")" "$db" "${host}" "${port}" "$user" 
            
    done
}


check_db_connection() 
{
    local p_host="$1"
    local p_port="$2"
    local p_user="$3"
    local p_password="$4"
    local p_dbname="$5"

    echo "${GREEN}Check database connection for ${p_user} on ${p_host}:${p_port}"
    PGPASSWORD="${p_password}" psql -h "${p_host}" -p "${p_port}" -U "${p_user}" -d "${p_dbname}" -c '\q'
    # >/dev/null 2>&1
}

# ============================================
# Phase 0 — Database creation (SUPERUSER)
# ============================================
echo "${GREEN}📦 Phase 0: Database Check${NC}"

PGPASSWORD="${DB_PASSWORD}" \
psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME" || \
PGPASSWORD="${DB_PASSWORD}" \
createdb \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    "${DB_NAME}"

# ============================================
# Phase 1 — Roles & Core config (SUPERUSER)
# ============================================
echo "\n${GREEN}⚙️ Phase 1: Core Configuration${NC}"

execute_sql "database/migrations/config/01_add_roles_app.sql" \
            "Creating application role" \
            "postgres" \
            "${DB_HOST}" \
            "${DB_PORT}" \
            "${DB_USER}"

execute_sql "database/migrations/config/03_add_extensions.sql" \
            "Installing extensions" \
            "${DB_NAME}" \
            "${DB_HOST}" \
            "${DB_PORT}" \
            "${DB_USER}"

execute_sql "database/migrations/config/04_add_types.sql" \
            "Creating custom types" \
            "${DB_NAME}" \
            "${DB_HOST}" \
            "${DB_PORT}" \
            "${DB_USER}"

# ============================================
# Phase 2 — Triggers (SUPERUSER ✅)
# ============================================
echo "\n${GREEN}🛠️ Phase 2: Triggers${NC}"
execute_directory "database/triggers" \
            "${DB_NAME}" \
            "${DB_HOST}" \
            "${DB_PORT}" \
            "${DB_USER}"

# ============================================
# Phase 3 — Tables (SUPERUSER ✅)
# ============================================
echo "\n${GREEN}🗄️ Phase 3: Tables${NC}"
execute_directory "database/migrations/tables" \
            "${DB_NAME}" \
            "${DB_HOST}" \
            "${DB_PORT}" \
            "${DB_USER}"
# ============================================
# Phase 4 — Permissions (SUPERUSER)
# ============================================
echo "\n${GREEN}🔐 Phase 4: Permissions${NC}"
execute_sql "database/migrations/config/02_add_permissions_roles_app.sql" \
            "Granting permissions" \
            "${DB_NAME}" \
            "${DB_HOST}" \
            "${DB_PORT}" \
            "${DB_USER}"

# ============================================
# Phase 5 — Seeds (APP USER)
# ============================================
echo "\n${GREEN}🌱 Phase 5: Seed Data${NC}"
printf "Insert seed data? (y/N) : "
read -r reply
if echo "$reply" | grep -Eq '^[YyOo]$'; then
    execute_directory "database/seeders"  \
            "${DB_NAME}" \
            "${DB_HOST}" \
            "${DB_PORT}" \
            "${DB_USER}"
fi

# ============================================
# Phase 6 — Views (APP USER)
# ============================================
echo "\n${GREEN}📊 Phase 6: Views${NC}"
execute_directory "database/views" \
            "${DB_NAME}" \
            "${DB_HOST}" \
            "${DB_PORT}" \
            "${DB_USER}"

echo "\n${GREEN}✅ Memoria database is ready!${NC}"
