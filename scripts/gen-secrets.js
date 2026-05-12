// scripts/gen-secrets.js
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env");

const PROD_MODE = process.argv.includes("--prod");

// ════════════════════════════════════════════
// Génération des secrets
// ════════════════════════════════════════════
const secrets = {
  SESSION_SECRET: crypto.randomBytes(64).toString("hex"),
  CSRF_SECRET: crypto.randomBytes(64).toString("hex"),
  DB_PASSWORD: crypto.randomBytes(24).toString("base64url"),
  DB_APP_PASSWORD: crypto.randomBytes(24).toString("base64url"),
};

// ════════════════════════════════════════════
// Mode PROD : juste afficher (sans guillemets)
// ════════════════════════════════════════════
if (PROD_MODE) {
  console.log("\n🔐 Secrets générés pour la production\n");
  console.log("Copie ces valeurs dans le panneau de variables d'environnement");
  console.log("de ton hébergeur (PaaS, panel admin, etc.)\n");
  console.log("⚠️  Ne PAS mettre de guillemets autour des valeurs.\n");
  for (const [key, value] of Object.entries(secrets)) {
    console.log(`${key}=${value}`);
  }
  console.log("\n⚠️  NE JAMAIS commiter ces valeurs dans Git !");
  console.log(
    "⚠️  Pense à synchroniser DB_PASSWORD et DB_APP_PASSWORD côté hébergeur\n",
  );
  process.exit(0);
}

// ════════════════════════════════════════════
// Mode DEV : mise à jour du .env local (avec guillemets simples)
// ════════════════════════════════════════════
if (!fs.existsSync(envPath)) {
  console.error(`❌ Fichier .env introuvable : ${envPath}`);
  console.error("Crée-le d'abord à partir de .env.example");
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, "utf-8");

for (const [key, value] of Object.entries(secrets)) {
  const regex = new RegExp(`^${key}=.*$`, "m");
  const newLine = `${key}='${value}'`;

  if (envContent.match(new RegExp(`^${key}=`, "m"))) {
    envContent = envContent.replace(regex, newLine);
  } else {
    console.warn(`⚠️  ${key} non trouvée dans .env, ajoutée à la fin`);
    envContent += `\n${newLine}`;
  }
}

fs.writeFileSync(envPath, envContent, "utf-8");

console.log("\n✅ Fichier .env mis à jour avec succès !\n");
console.log("📋 Secrets générés :\n");
for (const [key, value] of Object.entries(secrets)) {
  console.log(`  ${key}='${value}'`);
}
console.log(
  "\n⚠️  Pense à synchroniser DB_PASSWORD et DB_APP_PASSWORD côté hébergeur",
);
console.log(
  "⚠️  Et à mettre à jour DATABASE_URL avec le nouveau DB_APP_PASSWORD\n",
);
