const cron = require('node-cron');
const NotificationService = require('../services/notificationService');

/**
 * Scheduler pour les contrôles périodiques
 * Vérifie quotidiennement les dossiers qui atteignent 6 mois
 */

console.log("🔄 Initialisation du scheduler de contrôles périodiques...");

// Vérifier tous les jours à 9h00 (heure serveur)
cron.schedule('0 9 * * *', async () => {
  console.log('🔔 [CRON] Démarrage vérification contrôles périodiques - ' + new Date().toISOString());
  
  try {
    // Traiter les notifications dues
    const mainResult = await NotificationService.processScheduledNotifications();
    console.log(`✅ [CRON] Notifications principales: ${mainResult.processed} envoyées, ${mainResult.errors} erreurs`);
    
    // Traiter les retry des tâches échouées
    const retryResult = await NotificationService.processFailedTasks();
    console.log(`🔄 [CRON] Retry: ${retryResult.retried} tâches reprises`);
    
    // Nettoyer les anciennes tâches (1 fois par semaine le lundi)
    const today = new Date().getDay(); // 1 = Lundi
    if (today === 1) {
      const cleanupResult = await NotificationService.cleanupOldTasks();
      console.log(`🧹 [CRON] Nettoyage: ${cleanupResult.cleaned} anciennes tâches supprimées`);
    }
    
    // Afficher les stats
    const stats = await NotificationService.getNotificationStats();
    console.log(`📊 [CRON] Stats: ${stats.pending} en attente, ${stats.completed} terminées, ${stats.error} en erreur, ${stats.overdue} en retard`);
    
    console.log('✅ [CRON] Traitement des contrôles périodiques terminé avec succès');
    
  } catch (error) {
    console.error('❌ [CRON] Erreur lors du traitement des contrôles périodiques:', error);
    
    // Envoyer un email d'alerte à l'équipe technique (optionnel)
    try {
      const { sendEmailToFit } = require('../utils/email');
      await sendEmailToFit({
        subject: '[ALERTE] Erreur système - Contrôles périodiques',
        html: `
          <h2>🚨 Erreur système détectée</h2>
          <p>Une erreur s'est produite lors du traitement automatique des contrôles périodiques :</p>
          <pre style="background-color: #f8f9fa; padding: 10px; border-radius: 5px;">${error.message}</pre>
          <p><strong>Date :</strong> ${new Date().toISOString()}</p>
          <p>Veuillez vérifier les logs du serveur.</p>
        `
      });
    } catch (emailError) {
      console.error('❌ [CRON] Impossible d\'envoyer l\'email d\'alerte:', emailError);
    }
  }
});

// Vérification au démarrage (pour test)
cron.schedule('*/5 * * * *', async () => {
  // Toutes les 5 minutes en développement seulement
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [DEV] Vérification test toutes les 5 minutes...');
    
    try {
      const stats = await NotificationService.getNotificationStats();
      if (stats.overdue > 0) {
        console.log(`⚠️ [DEV] ${stats.overdue} notifications en retard détectées`);
      }
    } catch (error) {
      console.error('❌ [DEV] Erreur vérification:', error);
    }
  }
});

// Endpoint manuel pour debug (à utiliser via API)
const processNow = async () => {
  console.log('🔄 [MANUAL] Traitement manuel des contrôles périodiques...');
  
  try {
    const result = await NotificationService.processScheduledNotifications();
    console.log(`✅ [MANUAL] ${result.processed} notifications envoyées, ${result.errors} erreurs`);
    return result;
  } catch (error) {
    console.error('❌ [MANUAL] Erreur traitement manuel:', error);
    throw error;
  }
};

module.exports = {
  processNow
};