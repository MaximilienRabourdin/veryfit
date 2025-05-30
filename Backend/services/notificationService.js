const { db } = require("../config/firebaseAdmin");
const { sendEmailToDestinataire, sendEmailToFit } = require("../utils/email");

/**
 * Service de gestion des notifications de contrôle périodique
 * Vérifie quotidiennement les dossiers qui atteignent 6 mois
 */
class NotificationService {
  
  /**
   * Vérifier et traiter toutes les notifications programmées
   */
  static async processScheduledNotifications() {
    try {
      console.log("🔄 Début du traitement des notifications programmées...");
      
      const now = new Date();
      
      // Récupérer toutes les tâches programmées en attente
      const tasksSnapshot = await db.collection('scheduled_tasks')
        .where('type', '==', 'controle_periodique')
        .where('status', '==', 'pending')
        .where('scheduledDate', '<=', now)
        .get();
      
      if (tasksSnapshot.empty) {
        console.log("ℹ️ Aucune notification de contrôle périodique à traiter");
        return { processed: 0, errors: 0 };
      }
      
      let processed = 0;
      let errors = 0;
      
      for (const taskDoc of tasksSnapshot.docs) {
        try {
          const task = taskDoc.data();
          console.log(`📋 Traitement du dossier ${task.dossierId}...`);
          
          await this.sendControlePeriodiqueNotification(task);
          
          // Marquer la tâche comme traitée
          await taskDoc.ref.update({
            status: 'completed',
            processedAt: now
          });
          
          processed++;
          console.log(`✅ Notification envoyée pour le dossier ${task.dossierId}`);
          
        } catch (error) {
          console.error(`❌ Erreur traitement dossier ${taskDoc.data().dossierId}:`, error);
          
          // Marquer comme erreur et programmer un retry
          await taskDoc.ref.update({
            status: 'error',
            lastError: error.message,
            retryCount: (taskDoc.data().retryCount || 0) + 1,
            nextRetry: new Date(Date.now() + 24 * 60 * 60 * 1000) // Retry dans 24h
          });
          
          errors++;
        }
      }
      
      console.log(`✅ Traitement terminé: ${processed} notifications envoyées, ${errors} erreurs`);
      return { processed, errors };
      
    } catch (error) {
      console.error("❌ Erreur lors du traitement des notifications:", error);
      throw error;
    }
  }
  
  /**
   * Envoyer la notification de contrôle périodique disponible
   */
  static async sendControlePeriodiqueNotification(task) {
    try {
      const { dossierId, destinataireEmail, destinataireNom, dossierName, produits } = task;
      
      // Récupérer le dossier pour vérification
      const dossierRef = db.collection("dossiers").doc(dossierId);
      const dossierSnap = await dossierRef.get();
      
      if (!dossierSnap.exists) {
        throw new Error(`Dossier ${dossierId} introuvable`);
      }
      
      const dossier = dossierSnap.data();
      
      // Vérifier si la notification n'a pas déjà été envoyée
      if (dossier.controlePeriodiqueNotificationSent) {
        console.log(`ℹ️ Notification déjà envoyée pour le dossier ${dossierId}`);
        return;
      }
      
      // Mettre à jour le statut des produits
      const produitsUpdated = dossier.produits.map(produit => ({
        ...produit,
        controlePeriodiqueStatus: 'available',
        documents: {
          ...produit.documents,
          controlePeriodique: {
            ...produit.documents.controlePeriodique,
            status: "à remplir"
          }
        }
      }));
      
      // Créer la notification dans Firestore
      await db.collection("notifications").add({
        type: "controle_periodique_available",
        dossierId: dossierId,
        message: `🔔 Contrôle périodique maintenant disponible pour le dossier "${dossierName}"`,
        read: false,
        createdAt: new Date(),
        targetRole: "revendeur",
        targetEmail: destinataireEmail
      });
      
      // Mettre à jour le dossier
      await dossierRef.update({ 
        produits: produitsUpdated,
        controlePeriodiqueNotificationSent: true,
        controlePeriodiqueNotificationDate: new Date()
      });
      
      // Envoyer l'email au revendeur
      if (destinataireEmail) {
        await this.sendEmailToRevendeur({
          email: destinataireEmail,
          nom: destinataireNom,
          dossier: dossier,
          dossierId: dossierId,
          produits: produits
        });
      }
      
      // Notifier FIT
      await this.sendEmailToFitAdmin({
        dossier: dossier,
        dossierId: dossierId,
        revendeur: destinataireNom || destinataireEmail
      });
      
    } catch (error) {
      console.error(`❌ Erreur envoi notification pour ${task.dossierId}:`, error);
      throw error;
    }
  }
  
  /**
   * Envoyer l'email au revendeur
   */
  static async sendEmailToRevendeur({ email, nom, dossier, dossierId, produits }) {
    try {
      const subject = `[VERIFIT] Contrôle périodique disponible - ${dossier.orderName}`;
      
      const produitsHtml = produits.map(p => 
        `<li><strong>${p.name}</strong> - N° série: ${p.numeroSerie || 'N/A'}</li>`
      ).join('');
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
            <h1>🔔 Contrôle périodique disponible</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f8f9fa;">
            <p>Bonjour <strong>${nom}</strong>,</p>
            
            <p>Le contrôle périodique est maintenant disponible pour le dossier suivant :</p>
            
            <div style="background-color: white; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;">
              <ul style="list-style: none; padding: 0;">
                <li><strong>📂 Dossier :</strong> ${dossier.orderName}</li>
                <li><strong>📅 Date de création :</strong> ${dossier.createdAt?.toDate?.()?.toLocaleDateString('fr-FR') || 'N/A'}</li>
                <li><strong>🏢 Client :</strong> ${dossier.client || 'N/A'}</li>
                <li><strong>📦 Produits concernés :</strong> ${produits.length} produit(s)</li>
              </ul>
            </div>
            
            <div style="background-color: white; padding: 15px; margin: 20px 0;">
              <h3>Produits à contrôler :</h3>
              <ul>${produitsHtml}</ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://veryfit.vercel.app/revendeur/dashboard" 
                 style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                🔍 Accéder au contrôle périodique
              </a>
            </div>
            
            <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4>📋 Que faire maintenant ?</h4>
              <ol>
                <li>Connectez-vous à votre espace revendeur</li>
                <li>Sélectionnez le dossier concerné</li>
                <li>Remplissez le formulaire de contrôle pour chaque produit</li>
                <li>Générez et téléchargez les certificats de contrôle</li>
              </ol>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              <strong>Important :</strong> Ce contrôle périodique est obligatoire et doit être effectué dans les meilleurs délais.
            </p>
            
            <p>Cordialement,<br>
            <strong>L'équipe VERIFIT</strong></p>
          </div>
          
          <div style="background-color: #343a40; color: white; padding: 10px; text-align: center; font-size: 12px;">
            Email automatique - Ne pas répondre
          </div>
        </div>
      `;
      
      await sendEmailToDestinataire({
        to: email,
        subject: subject,
        html: html
      });
      
      console.log(`✅ Email envoyé au revendeur ${email}`);
      
    } catch (error) {
      console.error("❌ Erreur envoi email revendeur:", error);
      throw error;
    }
  }
  
  /**
   * Notifier l'équipe FIT
   */
  static async sendEmailToFitAdmin({ dossier, dossierId, revendeur }) {
    try {
      const subject = `[FIT DOORS] Contrôle périodique disponible - ${dossier.orderName}`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">📊 Notification FIT - Contrôle périodique</h2>
          
          <p>Bonjour,</p>
          
          <p>Un <strong>contrôle périodique</strong> est maintenant disponible pour le dossier suivant :</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff;">
            <ul style="list-style: none; padding: 0;">
              <li><strong>📂 Dossier :</strong> ${dossier.orderName}</li>
              <li><strong>🆔 ID :</strong> ${dossierId}</li>
              <li><strong>📅 Date de création :</strong> ${dossier.createdAt?.toDate?.()?.toLocaleDateString('fr-FR') || 'N/A'}</li>
              <li><strong>🏢 Revendeur :</strong> ${revendeur}</li>
              <li><strong>📦 Produits :</strong> ${dossier.produits?.length || 0} produit(s)</li>
              <li><strong>📧 Email revendeur :</strong> ${dossier.revendeurEmail || 'N/A'}</li>
            </ul>
          </div>
          
          <p><strong>Action effectuée :</strong></p>
          <ul>
            <li>✅ Notification email envoyée au revendeur</li>
            <li>✅ Statut des produits mis à jour ("à remplir")</li>
            <li>✅ Formulaires de contrôle maintenant accessibles</li>
          </ul>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="https://veryfit.vercel.app/fit/orders/${dossierId}" 
               style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              📄 Consulter le dossier
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Le revendeur peut maintenant effectuer le contrôle périodique via son interface.
          </p>
          
          <p>Cordialement,<br>
          <strong>Système automatique VERIFIT</strong></p>
        </div>
      `;
      
      await sendEmailToFit({
        subject: subject,
        html: html
      });
      
      console.log("✅ Notification FIT envoyée");
      
    } catch (error) {
      console.error("❌ Erreur notification FIT:", error);
      throw error;
    }
  }
  
  /**
   * Méthode pour traiter les tâches en erreur (retry)
   */
  static async processFailedTasks() {
    try {
      console.log("🔄 Traitement des tâches en erreur...");
      
      const now = new Date();
      
      const failedTasksSnapshot = await db.collection('scheduled_tasks')
        .where('type', '==', 'controle_periodique')
        .where('status', '==', 'error')
        .where('retryCount', '<', 3) // Maximum 3 tentatives
        .where('nextRetry', '<=', now)
        .get();
      
      if (failedTasksSnapshot.empty) {
        console.log("ℹ️ Aucune tâche en erreur à reprendre");
        return { retried: 0 };
      }
      
      let retried = 0;
      
      for (const taskDoc of failedTasksSnapshot.docs) {
        try {
          const task = taskDoc.data();
          console.log(`🔄 Nouvelle tentative pour le dossier ${task.dossierId}...`);
          
          await this.sendControlePeriodiqueNotification(task);
          
          // Marquer comme complété
          await taskDoc.ref.update({
            status: 'completed',
            processedAt: now,
            retriedAt: now
          });
          
          retried++;
          console.log(`✅ Retry réussi pour le dossier ${task.dossierId}`);
          
        } catch (error) {
          console.error(`❌ Retry échoué pour ${taskDoc.data().dossierId}:`, error);
          
          // Incrémenter le compteur de retry
          await taskDoc.ref.update({
            lastError: error.message,
            retryCount: (taskDoc.data().retryCount || 0) + 1,
            nextRetry: new Date(Date.now() + 24 * 60 * 60 * 1000) // Retry dans 24h
          });
        }
      }
      
      console.log(`✅ Retry terminé: ${retried} tâches reprises`);
      return { retried };
      
    } catch (error) {
      console.error("❌ Erreur lors du retry des tâches:", error);
      throw error;
    }
  }
  
  /**
   * Nettoyer les anciennes tâches terminées (plus de 30 jours)
   */
  static async cleanupOldTasks() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const oldTasksSnapshot = await db.collection('scheduled_tasks')
        .where('status', '==', 'completed')
        .where('processedAt', '<', thirtyDaysAgo)
        .limit(100)
        .get();
      
      if (oldTasksSnapshot.empty) {
        console.log("ℹ️ Aucune ancienne tâche à nettoyer");
        return { cleaned: 0 };
      }
      
      const batch = db.batch();
      let cleaned = 0;
      
      oldTasksSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        cleaned++;
      });
      
      await batch.commit();
      
      console.log(`✅ Nettoyage terminé: ${cleaned} anciennes tâches supprimées`);
      return { cleaned };
      
    } catch (error) {
      console.error("❌ Erreur lors du nettoyage:", error);
      throw error;
    }
  }
  
  /**
   * Obtenir les statistiques des notifications
   */
  static async getNotificationStats() {
    try {
      const tasksSnapshot = await db.collection('scheduled_tasks')
        .where('type', '==', 'controle_periodique')
        .get();
      
      const stats = {
        total: 0,
        pending: 0,
        completed: 0,
        error: 0,
        overdue: 0
      };
      
      const now = new Date();
      
      tasksSnapshot.docs.forEach(doc => {
        const task = doc.data();
        stats.total++;
        
        if (task.status === 'pending') {
          stats.pending++;
          if (new Date(task.scheduledDate?.toDate?.() || task.scheduledDate) < now) {
            stats.overdue++;
          }
        } else if (task.status === 'completed') {
          stats.completed++;
        } else if (task.status === 'error') {
          stats.error++;
        }
      });
      
      return stats;
      
    } catch (error) {
      console.error("❌ Erreur récupération statistiques:", error);
      throw error;
    }
  }
}

module.exports = NotificationService;