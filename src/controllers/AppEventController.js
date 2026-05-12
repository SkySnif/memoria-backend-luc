"use strict";

import AppEventAdminService from "../services/AppEventAdminService.js";

/**
 * AppEventController
 * ------------------
 * Controller ADMIN pour l’exploitation des événements applicatifs
 *
 * ⚠️ Aucune émission d’événement ici
 * ⚠️ Accès réservé aux administrateurs
 *
 * @see docs/architecture.md
 */
class AppEventController {
  /**
   * 📊 Statistiques globales
   * GET /admin/events/stats
   */
  async stats(req, res) {
    try {
      const stats = await AppEventAdminService.getStats();

      res.status(200).json(stats);
    } catch (error) {
      console.error("❌ AppEventController.stats", error);
      res.status(500).json({
        error: "Erreur lors du chargement des statistiques",
      });
    }
  }

  /**
   * 📜 Liste paginée des événements
   * GET /admin/events
   */
  async index(req, res) {
    try {
      const limit = Number(req.query.limit) || 50;
      const offset = Number(req.query.offset) || 0;

      const events = await AppEventAdminService.listEvents({ limit, offset });

      res.status(200).json({
        limit,
        offset,
        count: events.length,
        events,
      });
    } catch (error) {
      console.error("❌ AppEventController.index", error);
      res.status(500).json({
        error: "Erreur lors du chargement des événements",
      });
    }
  }

  /**
   * 🔎 Détail d’un événement
   * GET /admin/events/:id
   */
  async show(req, res) {
    try {
      const { id } = req.params;

      const event = await AppEventAdminService.getEventById(id);

      res.status(200).json(event);
    } catch (error) {
      console.error("❌ AppEventController.show", error);

      if (error.code === "NOT_FOUND") {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({
        error: "Erreur lors du chargement de l’événement",
      });
    }
  }

  /**
   * 🗑️ Suppression exceptionnelle d’un événement
   * DELETE /admin/events/:id
   */
  async destroy(req, res) {
    try {
      const { id } = req.params;

      await AppEventAdminService.deleteEvent({
        eventId: id,
        actorUserId: req.user?.id || null,
      });

      res.status(200).json({
        message: "Événement supprimé avec succès",
      });
    } catch (error) {
      console.error("❌ AppEventController.destroy", error);

      if (error.code === "NOT_FOUND") {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({
        error: "Erreur lors de la suppression",
      });
    }
  }

  /**
   * 🧹 Nettoyage des événements anciens
   * POST /admin/events/cleanup
   */
  async cleanup(req, res) {
    try {
      const { days = 90 } = req.body;

      const result = await AppEventAdminService.cleanupOldEvents({
        days: Number(days),
      });

      res.status(200).json({
        message: `${result.deletedCount} événements supprimés.`,
        cutoffDate: result.cutoffDate,
      });
    } catch (error) {
      console.error("❌ AppEventController.cleanup", error);

      res.status(500).json({
        error: "Erreur lors du nettoyage : " + error.message,
      });
    }
  }
}

export default new AppEventController();
