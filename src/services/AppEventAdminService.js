"use strict";

import AppEventRepository from "../repositories/PgAppEventRepository.js";

/**
 * AppEventAdminService
 * --------------------
 * Service ADMIN pour l'exploitation des AppEvents.
 *
 * Responsabilités :
 * - Statistiques
 * - Lecture avancée
 * - Nettoyage
 *
 * ⚠️ Ce service NE CRÉE PAS d'événements.
 * ⚠️ Aucune logique d'émission ici.
 *
 * @see docs/architecture.md
 */
class AppEventAdminService {
  /**
   * 📊 Statistiques globales système
   *
   * @returns {Promise<Object>}
   */
  static async getStats() {
    const [totalEvents, eventsByType, eventsByDay, topUsers, recentErrors] =
      await Promise.all([
        AppEventRepository.count(),
        AppEventRepository.countByType(),
        AppEventRepository.countByDay({ days: 30 }),
        AppEventRepository.topUsers({ limit: 10 }),
        AppEventRepository.findErrors({ limit: 50 }),
      ]);

    return {
      totalEvents,
      eventsByType,
      eventsByDay,
      topUsers,
      recentErrors,
    };
  }

  /**
   * 📜 Liste paginée des événements (admin)
   *
   * @param {Object} params
   * @param {number} [params.limit=50]
   * @param {number} [params.offset=0]
   * @returns {Promise<Array>}
   */
  static async listEvents({ limit = 50, offset = 0 } = {}) {
    return AppEventRepository.findAll({ limit, offset });
  }

  /**
   * 🔎 Récupère un événement par ID (admin)
   *
   * @param {string} eventId
   * @returns {Promise<Object>}
   */
  static async getEventById(eventId) {
    const event = await AppEventRepository.findById(eventId);
    if (!event) {
      const error = new Error("Événement introuvable");
      error.code = "NOT_FOUND";
      throw error;
    }
    return event;
  }

  /**
   * 🗑️ Suppression d'un événement (exceptionnelle)
   *
   * ⚠️ À utiliser avec parcimonie (RGPD / debug)
   *
   * @param {Object} params
   * @param {string} params.eventId
   * @param {string|null} params.actorUserId
   */
  static async deleteEvent({ eventId, actorUserId = null }) {
    const event = await AppEventRepository.findById(eventId);
    if (!event) {
      const error = new Error("Événement introuvable");
      error.code = "NOT_FOUND";
      throw error;
    }

    await AppEventRepository.delete(eventId);

    return event;
  }

  /**
   * 🧹 Nettoyage des événements anciens
   *
   * @param {Object} params
   * @param {number} params.days
   * @returns {Promise<{deletedCount:number, cutoffDate:Date}>}
   */
  static async cleanupOldEvents({ days }) {
    if (!Number.isInteger(days) || days < 1) {
      throw new Error("Nombre de jours invalide");
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const deletedCount = await AppEventRepository.deleteOlderThan(cutoffDate);

    return {
      deletedCount,
      cutoffDate,
    };
  }
}

export default AppEventAdminService;
