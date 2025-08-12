# ⚡ Configuration Rapide LeadPilot - Vercel

## 🎯 Résumé

**URL de votre application :** `https://get-leadpilot.vercel.app`

## 📋 Étapes de Configuration

### 1. Variables d'Environnement Vercel ✅

**Déjà configurées dans le README.md :**
- ✅ Base de données Supabase
- ✅ Clés Stripe (avec webhook secret)
- ✅ Google OAuth
- ✅ Services externes (OpenAI, Apollo)

### 2. Configuration Google OAuth 🔐

**À faire dans Google Cloud Console :**

1. Allez sur [console.cloud.google.com](https://console.cloud.google.com)
2. Sélectionnez votre projet LeadPilot
3. **APIs & Services** > **Credentials**
4. Modifiez votre **OAuth 2.0 Client ID**

**URLs à configurer :**
- **JavaScript origins :** `https://get-leadpilot.vercel.app`
- **Redirect URIs :** `https://get-leadpilot.vercel.app/api/oauth/google/callback`

### 3. Configuration Stripe Webhooks 💳

**À faire dans Stripe Dashboard :**

1. Allez sur [stripe.com/dashboard](https://stripe.com/dashboard)
2. **Developers** > **Webhooks**
3. **Add endpoint**
4. **URL :** `https://get-leadpilot.vercel.app/api/payments/webhook`
5. **Events :**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`

**Webhook secret déjà configuré :** `whsec_C8DcHXN1lhUaK6sq7BMNcgQmq482auJW`

### 4. URLs de Redirection Stripe 🎯

**Dans votre dashboard Stripe, configurez ces URLs :**

- **Starter Monthly :** `https://get-leadpilot.vercel.app/payment-success?plan=starter&yearly=false`
- **Starter Yearly :** `https://get-leadpilot.vercel.app/payment-success?plan=starter&yearly=true`
- **Pro Monthly :** `https://get-leadpilot.vercel.app/payment-success?plan=pro&yearly=false`
- **Pro Yearly :** `https://get-leadpilot.vercel.app/payment-success?plan=pro&yearly=true`
- **Growth Monthly :** `https://get-leadpilot.vercel.app/payment-success?plan=growth&yearly=false`
- **Growth Yearly :** `https://get-leadpilot.vercel.app/payment-success?plan=growth&yearly=true`

## 🧪 Test de la Configuration

### Test 1 : Application
- Allez sur : `https://get-leadpilot.vercel.app`
- Vérifiez que l'interface se charge

### Test 2 : Google OAuth
- Connectez-vous
- **Paramètres** > **Connexions Email**
- **Connecter avec Google**
- Vérifiez l'authentification

### Test 3 : Paiements Stripe
- **Upgrade** > Sélectionnez un plan
- Testez avec : `4242 4242 4242 4242`

## ✅ Checklist Finale

- [ ] Variables d'environnement Vercel configurées
- [ ] URLs Google OAuth mises à jour
- [ ] Webhook Stripe configuré
- [ ] URLs de redirection Stripe configurées
- [ ] Test de l'application réussi
- [ ] Test de Google OAuth réussi
- [ ] Test des paiements réussi

## 🆘 En cas de problème

1. **Vérifiez les logs Vercel** dans le dashboard
2. **Vérifiez les logs Stripe** dans les webhooks
3. **Vérifiez Google Cloud Console** pour les URLs OAuth
4. **Redéployez** si nécessaire

**Votre application LeadPilot est prête !** 🚀

