"use strict";

import AppEventRepository from "../repositories/PgAppEventRepository.js";

/**
 * AppEventService
 * ---------------
 * Service transverse de journalisation applicative
 *
 * Règles :
 * - Append-only
 * - ÉMISSION UNIQUEMENT
 * - Aucun effet de bord
 *
 * @see docs/architecture.md
 */
class AppEventService {
  /**
   * 🔔 Log générique
   */
  static async log({
    userId = null,
    category,
    type,
    severity = "info",
    message,
    metadata = {},
  }) {
    return AppEventRepository.create({
      userId,
      eventCategory: category,
      eventType: type,
      severity,
      message,
      metadata,
    });
  }

  /**
   * Helpers intentionnels (lisibilité métier)
   */

  static async authSuccess(userId) {
    return this.log({
      userId,
      category: "auth",
      type: "login_success",
      message: "Connexion réussie",
    });
  }

  static async authFailure(email) {
    return this.log({
      category: "auth",
      type: "login_failure",
      severity: "warning",
      message: "Échec de connexion",
      metadata: { email },
    });
  }

  static async itemCreated(userId, itemId) {
    return this.log({
      userId,
      category: "item",
      type: "created",
      message: "Pépite créée",
      metadata: { itemId },
    });
  }

  static async shareCreated(userId, shareId) {
    return this.log({
      userId,
      category: "share",
      type: "created",
      message: "Pépite partagée",
      metadata: { shareId },
    });
  }
}

export default AppEventService;
