"use strict";

import db from "../config/database.js";
import AppEvent from "../entities/AppEventEntity.js";

/**
 * AppEventRepository
 *
 * Règles :
 * - Append-only (INSERT + READ)
 * - Aucune mise à jour
 * - Aucune suppression directe
 * - Lecture uniquement via vues SQL
 *
 * @see docs/architecture.md
 */
class AppEventRepository {
  /**
   * Enregistre un événement applicatif
   *
   * @param {Object} data
   * @param {string|[]} data.userId
   * @param {string} data.eventCategory
   * @param {string} data.eventType
   * @param {string} data.severity
   * @param {string} data.message
   * @param {Object} [data.metadata]
   *
   * @returns {Promise<AppEvent>}
   */
  static async create(data) {
    const query = /*sql*/ `
      INSERT INTO app_events (
        user_id,
        event_category,
        event_type,
        severity,
        message,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id_event,
        user_id,
        event_category,
        event_type,
        severity,
        message,
        metadata,
        created_at;
    `;

    const values = [
      data.userId ?? [],
      data.eventCategory,
      data.eventType,
      data.severity,
      data.message,
      data.metadata ?? {},
    ];

    const { rows } = await db.query(query, values);
    return new AppEvent(rows[0]);
  }

  /**
   * Historique des événements d’un utilisateur
   *
   * @param {string} userId
   * @param {number} [limit=50]
   * @returns {Promise<AppEvent[]|[]>}
   * @see database/views/v_user_app_events_view.sql
   */
  static async findByUserId(userId, limit = 50) {
    const query = /*sql*/ `
      SELECT *
      FROM v_user_app_events
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2;
    `;

    const { rows } = await db.query(query, [userId, limit]);
    if (rows.length === 0) return [];
    return rows.map((row) => new AppEvent(row));
  }

  /**
   * Événements critiques (admin / monitoring)
   *
   * @param {number} [limit=100]
   * @returns {Promise<AppEvent[]|[]>}
   * @see database/views/v_app_events_critical_view.sql
   */
  static async findCritical(limit = 100) {
    const query = /*sql*/ `
      SELECT *
      FROM v_app_events_critical
      ORDER BY created_at DESC
      LIMIT $1;
    `;

    const { rows } = await db.query(query, [limit]);
    if (rows.length === 0) return [];
    return rows.map((row) => new AppEvent(row));
  }
}

export default AppEventRepository;
