#!/usr/bin/env node

/**
 * Script de vérification de la configuration LeadPilot
 * Vérifie que toutes les variables d'environnement sont configurées
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configuration dotenv
dotenv.config();

console.log('🔍 Vérification de la configuration LeadPilot...\n');

// Fonction pour vérifier si une variable d'environnement existe
function checkEnvVar(name, required = true, description = '') {
  const value = process.env[name];
  const status = value ? '✅' : '❌';
  const statusText = value ? 'Configuré' : required ? 'MANQUANT' : 'Optionnel';
  
  console.log(`${status} ${name}: ${statusText}`);
  if (description) {
    console.log(`   ${description}`);
  }
  
  if (required && !value) {
    console.log(`   ⚠️  Cette variable est requise pour le fonctionnement de l'application`);
  }
  
  return !!value;
}

// Fonction pour vérifier la configuration de l'environnement
function checkEnvironment() {
  console.log('\n🌍 Configuration de l\'environnement...');
  
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isSupabase = !!process.env.SUPABASE_URL;
  
  console.log(`  📊 Environnement: ${nodeEnv}`);
  
  if (isSupabase) {
    console.log(`  🗄️  Supabase configuré: ${process.env.SUPABASE_URL}`);
  } else if (nodeEnv === 'development') {
    console.log('  🛠️  Mode développement local');
  } else {
    console.log('  🌐 Mode production');
  }
}

// Fonction pour vérifier la base de données
function checkDatabase() {
  console.log('\n🗄️  Configuration de la base de données...');
  
  const hasDatabaseUrl = checkEnvVar('DATABASE_URL', true, 'URL de connexion PostgreSQL');
  
  if (hasDatabaseUrl) {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl.includes('supabase')) {
      console.log('  ✅ Configuration Supabase détectée');
    } else if (dbUrl.includes('localhost')) {
      console.log('  ✅ Configuration locale détectée');
    } else {
      console.log('  ✅ Configuration externe détectée');
    }
  }
}

// Fonction pour vérifier l'authentification
function checkAuthentication() {
  console.log('\n🔐 Configuration de l\'authentification...');
  
  checkEnvVar('SESSION_SECRET', true, 'Secret pour les sessions utilisateur');
  checkEnvVar('GOOGLE_CLIENT_ID', false, 'Client ID Google OAuth');
  checkEnvVar('GOOGLE_CLIENT_SECRET', false, 'Client Secret Google OAuth');
  checkEnvVar('GOOGLE_REDIRECT_URI', false, 'URL de redirection Google OAuth');
}

// Fonction pour vérifier les paiements
function checkPayments() {
  console.log('\n💳 Configuration des paiements...');
  
  const hasStripeKey = checkEnvVar('STRIPE_SECRET_KEY', true, 'Clé secrète Stripe');
  checkEnvVar('STRIPE_WEBHOOK_SECRET', false, 'Secret webhook Stripe (à configurer après déploiement)');
  
  if (hasStripeKey) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey.startsWith('sk_live_')) {
      console.log('  ⚠️  Mode PRODUCTION Stripe détecté');
    } else if (stripeKey.startsWith('sk_test_')) {
      console.log('  ✅ Mode TEST Stripe détecté');
    }
  }
}

// Fonction pour vérifier les services externes
function checkExternalServices() {
  console.log('\n🔗 Services externes...');
  
  checkEnvVar('OPENAI_API_KEY', false, 'Clé API OpenAI pour le scoring IA');
  checkEnvVar('APOLLO_API_KEY', false, 'Clé API Apollo pour la génération de leads');
}

// Fonction pour vérifier Supabase
function checkSupabase() {
  console.log('\n☁️  Configuration Supabase...');
  
  const hasSupabaseUrl = checkEnvVar('SUPABASE_URL', false, 'URL du projet Supabase');
  checkEnvVar('SUPABASE_ANON_KEY', false, 'Clé anonyme Supabase');
  checkEnvVar('SUPABASE_SERVICE_ROLE_KEY', false, 'Clé de service Supabase');
  
  if (hasSupabaseUrl) {
    console.log('  ✅ Supabase configuré pour la base de données');
  }
}

// Fonction pour afficher les URLs de déploiement
function showDeploymentUrls() {
  console.log('\n🌐 URLs de déploiement...');
  console.log('  📍 URL publique: https://your-domain.vercel.app');
  console.log('  🔗 URL JavaScript autorisée: https://your-domain.vercel.app');
  console.log('  🔄 URL de redirection Google: https://your-domain.vercel.app/api/oauth/google/callback');
  console.log('  📡 URL webhook Stripe: https://your-domain.vercel.app/api/stripe-webhook');
  console.log('\n  💡 Remplacez "your-domain" par votre nom de projet Vercel');
}

// Fonction pour afficher les prochaines étapes
function showNextSteps() {
  console.log('\n📋 Prochaines étapes...');
  console.log('  1. Créer les tables: npm run db:push');
  console.log('  2. Tester localement: npm run dev');
  console.log('  3. Déployer sur Vercel: vercel');
  console.log('  4. Configurer les webhooks Stripe');
  console.log('  5. Finaliser Google OAuth');
}

// Vérifications principales
let allGood = true;

try {
  checkEnvironment();
  checkDatabase();
  checkAuthentication();
  checkPayments();
  checkSupabase();
  checkExternalServices();
  
  showDeploymentUrls();
  showNextSteps();
  
  console.log('\n🎯 Résumé de la vérification...');
  
  // Vérifier les variables critiques
  const criticalVars = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'STRIPE_SECRET_KEY'
  ];
  
  const missingCritical = criticalVars.filter(varName => !process.env[varName]);
  
  if (missingCritical.length === 0) {
    console.log('  ✅ Configuration critique complète');
    console.log('  🚀 Prêt pour le déploiement !');
  } else {
    console.log('  ❌ Variables critiques manquantes:');
    missingCritical.forEach(varName => {
      console.log(`     - ${varName}`);
    });
    allGood = false;
  }
  
} catch (error) {
  console.error('  ❌ Erreur lors de la vérification:', error.message);
  allGood = false;
}

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('🎉 Configuration validée avec succès !');
} else {
  console.log('⚠️  Certaines configurations nécessitent votre attention.');
}
console.log('='.repeat(50));

process.exit(allGood ? 0 : 1);
