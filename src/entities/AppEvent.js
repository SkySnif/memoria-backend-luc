"use strict";
/**
 * @fileoverview Modèle AppEvent - Gestion des événements applicatifs
 */
class AppEvent {
  constructor(data) {
    // Mapping SQL (snake_case) vers JS (camelCase)
    this.id = data.id_event;
    this.userId = data.user_id;
    this.eventCategory = data.event_category;
    this.eventType = data.event_type;
    this.severity = data.severity;
    this.message = data.message;
    this.metadata = data.metadata;
    this.createdAt = data.created_at;
  }

  /**
   * Crée une entité depuis une ligne PostgreSQL
   */
  static fromDatabase(row) {
    return row ? new AppEvent(row) : null;
  }

  /**
   * Crée une liste d'entités depuis des lignes PostgreSQL
   */
  static fromDatabaseList(rows) {
    return rows.map((row) => new AppEvent(row));
  }

  /**
   * Filtre les données sensibles pour l'exposition en API
   * @returns {object} - Objet AppEvent sans données sensibles
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      eventCategory: this.eventCategory,
      eventType: this.eventType,
      severity: this.severity,
      message: this.message,
      metadata: this.metadata,
      createdAt: this.createdAt,
    };
  }

  /**
   * Convertit l'objet AppEvent en chaîne de caractères JSON
   * @returns {string} - Chaîne de caractères JSON représentant l'objet AppEvent
   */
  toString() {
    return JSON.stringify(this.toJSON());
  }
}

export default AppEvent;
