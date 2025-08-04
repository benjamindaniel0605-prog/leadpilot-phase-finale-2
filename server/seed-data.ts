import { storage } from "./storage";

export const frenchEmailTemplates = [
  // FREE TEMPLATES (1)
  {
    name: "Introduction Simple",
    subject: "Bonjour [PRENOM] - Une solution pour [ENTREPRISE]",
    content: `Bonjour [PRENOM],

Je me permets de vous contacter car je pense que [ENTREPRISE] pourrait être intéressée par notre solution.

Nous aidons les entreprises comme la vôtre à [BENEFICE_PRINCIPAL]. 

Seriez-vous disponible pour un échange de 15 minutes cette semaine ?

Cordialement,
[EXPEDITEUR]`,
    plan: "free",
    category: "introduction",
    variables: ["PRENOM", "ENTREPRISE", "BENEFICE_PRINCIPAL", "EXPEDITEUR"]
  },

  // STARTER TEMPLATES (5)
  {
    name: "Approche Problème-Solution",
    subject: "[PRENOM], comment [ENTREPRISE] peut économiser [MONTANT]€/an",
    content: `Bonjour [PRENOM],

Les entreprises comme [ENTREPRISE] perdent en moyenne [MONTANT]€ par an à cause de [PROBLEME].

Nous avons développé une solution qui permet de :
✓ [BENEFICE_1]
✓ [BENEFICE_2] 
✓ [BENEFICE_3]

[CLIENT_REFERENCE] a déjà économisé [RESULTAT] grâce à notre approche.

Auriez-vous 15 minutes pour en discuter ?

Bien à vous,
[EXPEDITEUR]`,
    plan: "starter",
    category: "probleme-solution",
    variables: ["PRENOM", "ENTREPRISE", "MONTANT", "PROBLEME", "BENEFICE_1", "BENEFICE_2", "BENEFICE_3", "CLIENT_REFERENCE", "RESULTAT", "EXPEDITEUR"]
  },
  {
    name: "Référence Client",
    subject: "Comment [CLIENT_REFERENCE] a obtenu [RESULTAT]",
    content: `Bonjour [PRENOM],

J'espère que vous allez bien.

Je travaille avec [CLIENT_REFERENCE] depuis [DUREE] et nous avons obtenu des résultats remarquables :

→ [RESULTAT_1]
→ [RESULTAT_2]
→ [RESULTAT_3]

Étant donné que [ENTREPRISE] évolue dans le même secteur, je me demandais si vous pourriez être intéressé par une approche similaire.

Disponible pour un appel cette semaine ?

[EXPEDITEUR]`,
    plan: "starter",
    category: "reference",
    variables: ["PRENOM", "CLIENT_REFERENCE", "RESULTAT", "DUREE", "RESULTAT_1", "RESULTAT_2", "RESULTAT_3", "ENTREPRISE", "EXPEDITEUR"]
  },
  {
    name: "Question Provocante",
    subject: "[PRENOM], est-ce que [ENTREPRISE] perd de l'argent sur [DOMAINE] ?",
    content: `Bonjour [PRENOM],

Une question rapide : combien [ENTREPRISE] dépense-t-elle actuellement pour [DOMAINE] ?

La plupart des entreprises de votre secteur surestiment leurs coûts de [POURCENTAGE]%.

Nous avons aidé [NB_CLIENTS]+ entreprises à réduire ces coûts tout en améliorant [BENEFICE].

Voulez-vous savoir comment ?

Réponse simple : Oui/Non

[EXPEDITEUR]`,
    plan: "starter",
    category: "question",
    variables: ["PRENOM", "ENTREPRISE", "DOMAINE", "POURCENTAGE", "NB_CLIENTS", "BENEFICE", "EXPEDITEUR"]
  },
  {
    name: "Urgence Temporelle",
    subject: "Derniers jours pour [OPPORTUNITE] - [ENTREPRISE]",
    content: `[PRENOM],

Je voulais vous prévenir rapidement.

Nous clôturons notre programme [PROGRAMME] le [DATE], et il ne reste que [NB_PLACES] places.

Ce programme permet aux entreprises comme [ENTREPRISE] de :
• [AVANTAGE_1]
• [AVANTAGE_2]
• [AVANTAGE_3]

Intéressé ? Un appel de 10 minutes suffit pour voir si c'est adapté.

Répondez-moi avant [DATE_LIMITE].

[EXPEDITEUR]`,
    plan: "starter",
    category: "urgence",
    variables: ["PRENOM", "OPPORTUNITE", "ENTREPRISE", "PROGRAMME", "DATE", "NB_PLACES", "AVANTAGE_1", "AVANTAGE_2", "AVANTAGE_3", "DATE_LIMITE", "EXPEDITEUR"]
  },
  {
    name: "Compliment + Valeur",
    subject: "Impressionné par [REUSSITE] de [ENTREPRISE]",
    content: `Bonjour [PRENOM],

Je viens de voir [REUSSITE] de [ENTREPRISE] - félicitations !

Cette croissance me rappelle [CLIENT_SIMILAIRE] avec qui nous travaillons. Ils ont réussi à [RESULTAT_CLIENT] grâce à notre solution.

Étant donné votre trajectoire, je pense que vous pourriez être intéressé par une approche similaire pour [OBJECTIF].

Qu'en pensez-vous ? 15 minutes pour en discuter ?

Cordialement,
[EXPEDITEUR]`,
    plan: "starter",
    category: "compliment",
    variables: ["PRENOM", "REUSSITE", "ENTREPRISE", "CLIENT_SIMILAIRE", "RESULTAT_CLIENT", "OBJECTIF", "EXPEDITEUR"]
  },

  // PRO TEMPLATES (15 additional - showing first 5)
  {
    name: "Multi-Touch Séquence 1",
    subject: "5 minutes pour transformer [PROCESSUS] chez [ENTREPRISE] ?",
    content: `[PRENOM],

Vous dirigez [ENTREPRISE] depuis [DUREE] - respect pour cette réussite.

Je me demandais : comment gérez-vous actuellement [PROCESSUS] ?

La plupart des dirigeants comme vous perdent [TEMPS]h/semaine sur ce sujet.

Notre solution permet de diviser ce temps par [DIVISEUR] tout en améliorant [QUALITE].

Exemple concret : [CLIENT_EXEMPLE] a économisé [ECONOMIE] en [DUREE_RESULTATS].

Curieux d'en savoir plus ? 5 minutes au téléphone suffisent.

[EXPEDITEUR]
P.S: Je vous enverrai un audit gratuit de votre [PROCESSUS] si ça peut aider.`,
    plan: "pro",
    category: "multi-touch",
    variables: ["PRENOM", "PROCESSUS", "ENTREPRISE", "DUREE", "TEMPS", "DIVISEUR", "QUALITE", "CLIENT_EXEMPLE", "ECONOMIE", "DUREE_RESULTATS", "EXPEDITEUR"]
  },
  {
    name: "Insight Sectoriel",
    subject: "Tendance [SECTEUR] : impact sur [ENTREPRISE] ?",
    content: `Bonjour [PRENOM],

Je viens de terminer une étude sur le secteur [SECTEUR] - les résultats sont surprenants.

3 insights clés qui m'ont frappé :

1. [INSIGHT_1]
2. [INSIGHT_2]  
3. [INSIGHT_3]

Ces changements vont probablement impacter [ENTREPRISE], surtout au niveau [DOMAINE_IMPACT].

Nous avons aidé [NB_ENTREPRISES] entreprises de votre secteur à s'adapter à ces évolutions.

Voulez-vous que je vous partage l'étude complète + notre plan d'adaptation ?

Disponible pour un échange cette semaine.

[EXPEDITEUR]`,
    plan: "pro",
    category: "insight",
    variables: ["PRENOM", "SECTEUR", "ENTREPRISE", "INSIGHT_1", "INSIGHT_2", "INSIGHT_3", "DOMAINE_IMPACT", "NB_ENTREPRISES", "EXPEDITEUR"]
  },
  {
    name: "Objection Prevention",
    subject: "Pourquoi [ENTREPRISE] dit probablement non (et c'est OK)",
    content: `[PRENOM],

Je vais être direct : vous allez probablement dire "non" à ma proposition.

Et c'est compréhensible car :
• Vous avez déjà essayé [SOLUTION_ALTERNATIVE] 
• Votre équipe est débordée
• Ce n'est peut-être pas le bon moment

Mais voici pourquoi [CLIENT_REFERENCE] pensait la même chose... avant d'obtenir [RESULTAT] en [DUREE].

La différence ? Notre approche [APPROCHE_UNIQUE].

Si je me trompe sur [ENTREPRISE], ignorez cet email.
Si j'ai raison, accordez-moi 10 minutes pour vous prouver le contraire.

[EXPEDITEUR]`,
    plan: "pro",
    category: "objection",
    variables: ["PRENOM", "ENTREPRISE", "SOLUTION_ALTERNATIVE", "CLIENT_REFERENCE", "RESULTAT", "DUREE", "APPROCHE_UNIQUE", "EXPEDITEUR"]
  },
  {
    name: "Audit Gratuit",
    subject: "Audit gratuit [DOMAINE] pour [ENTREPRISE] - 48h",
    content: `Bonjour [PRENOM],

Proposition simple : je vous offre un audit gratuit de [DOMAINE] chez [ENTREPRISE].

Pourquoi gratuit ? Car [RAISON_STRATEGIQUE].

L'audit révèle généralement :
→ [DECOUVERTE_1]
→ [DECOUVERTE_2]
→ [DECOUVERTE_3]

Résultat en 48h maximum. Sans engagement.

[CLIENT_EXEMPLE] a découvert qu'ils perdaient [PERTE] par mois - problème résolu en [DUREE_RESOLUTION].

Intéressé ? Répondez "OUI" et je lance l'analyse.

[EXPEDITEUR]
[ENTREPRISE_EXPEDITEUR]`,
    plan: "pro",
    category: "audit",
    variables: ["PRENOM", "DOMAINE", "ENTREPRISE", "RAISON_STRATEGIQUE", "DECOUVERTE_1", "DECOUVERTE_2", "DECOUVERTE_3", "CLIENT_EXEMPLE", "PERTE", "DUREE_RESOLUTION", "EXPEDITEUR", "ENTREPRISE_EXPEDITEUR"]
  },
  {
    name: "Storytelling Échec",
    subject: "Comment j'ai failli ruiner [CLIENT_EXEMPLE] (et ce que ça m'a appris)",
    content: `[PRENOM],

Je dois vous raconter mon plus gros échec.

Il y a [PERIODE], j'ai conseillé [CLIENT_EXEMPLE] sur [DOMAINE]. 

Mon approche était [APPROCHE_INCORRECTE]. Résultat ? [ECHEC_RESULTAT].

J'ai failli détruire leur [ASPECT_IMPACTE].

Heureusement, nous avons pu inverser la situation avec [NOUVELLE_APPROCHE]. 
Final : [RESULTAT_FINAL] en [DUREE].

Cette expérience m'a appris [LECON_APPRISE].

Pourquoi je vous raconte ça ? Car [ENTREPRISE] me rappelle [CLIENT_EXEMPLE] avant notre intervention.

Éviter cette erreur vous intéresse ?

[EXPEDITEUR]`,
    plan: "pro",
    category: "storytelling",
    variables: ["PRENOM", "CLIENT_EXEMPLE", "PERIODE", "DOMAINE", "APPROCHE_INCORRECTE", "ECHEC_RESULTAT", "ASPECT_IMPACTE", "NOUVELLE_APPROCHE", "RESULTAT_FINAL", "DUREE", "LECON_APPRISE", "ENTREPRISE", "EXPEDITEUR"]
  }
];

// Add more templates to reach 30 total...
export const additionalProTemplates = [
  {
    name: "Comparaison Concurrentielle",
    subject: "Pourquoi [CONCURRENT] a choisi [SOLUTION] (et pas [ENTREPRISE]) ?",
    content: `[PRENOM],

Question délicate mais importante.

[CONCURRENT] vient d'adopter [SOLUTION] pour [OBJECTIF]. Ils prévoient [BENEFICE_CONCURRENT] d'ici [DELAI].

En tant que leader du secteur, [ENTREPRISE] devrait-elle s'inquiéter ?

Notre analyse montre que :
• [POINT_1]
• [POINT_2]
• [POINT_3]

Voulez-vous connaître leur stratégie exacte + comment faire mieux ?

[EXPEDITEUR]`,
    plan: "pro",
    category: "competition",
    variables: ["PRENOM", "CONCURRENT", "SOLUTION", "ENTREPRISE", "OBJECTIF", "BENEFICE_CONCURRENT", "DELAI", "POINT_1", "POINT_2", "POINT_3", "EXPEDITEUR"]
  },
  {
    name: "Relance Intelligent",
    subject: "Re: [SUJET_ORIGINAL] - Une dernière idée",
    content: `[PRENOM],

Pas de réponse à mon email précédent - je comprends, vous êtes occupé.

Une dernière idée avant de vous laisser tranquille :

Et si [ENTREPRISE] pouvait [BENEFICE] sans [CONTRAINTE] ?

[CLIENT_CAS] y est arrivé grâce à [METHODE_SPECIFIQUE].

Si ça vous intéresse : répondez "DÉTAILS"
Sinon : répondez "STOP" et je n'insisterai plus.

Fair deal ?

[EXPEDITEUR]`,
    plan: "pro",
    category: "relance",
    variables: ["PRENOM", "SUJET_ORIGINAL", "ENTREPRISE", "BENEFICE", "CONTRAINTE", "CLIENT_CAS", "METHODE_SPECIFIQUE", "EXPEDITEUR"]
  },
  {
    name: "Invitation Événement",
    subject: "Invitation privée : [EVENEMENT] pour dirigeants [SECTEUR]",
    content: `Bonjour [PRENOM],

J'organise un petit-déjeuner privé le [DATE] sur le thème : "[THEME]".

Format intime : 8 dirigeants max du secteur [SECTEUR].

Au programme :
→ [CONTENU_1]
→ [CONTENU_2]
→ [CONTENU_3]

Intervenants : [EXPERT_1] et [EXPERT_2].

Lieu : [LIEU] à [VILLE]

Compte tenu du profil de [ENTREPRISE], votre présence enrichirait les échanges.

Disponible ? Réponse rapide nécessaire (places limitées).

[EXPEDITEUR]`,
    plan: "pro",
    category: "evenement",
    variables: ["PRENOM", "EVENEMENT", "SECTEUR", "DATE", "THEME", "CONTENU_1", "CONTENU_2", "CONTENU_3", "EXPERT_1", "EXPERT_2", "LIEU", "VILLE", "ENTREPRISE", "EXPEDITEUR"]
  },
  {
    name: "Étude de Cas Détaillée",
    subject: "Cas client : [CLIENT] passe de [AVANT] à [APRES] en [DUREE]",
    content: `[PRENOM],

Étude de cas qui pourrait vous intéresser :

[CLIENT_DETAILLE] ([SECTEUR_CLIENT], [TAILLE_CLIENT] employés) avait le même défi que beaucoup d'entreprises : [DEFI_COMMUN].

Situation initiale :
• [SITUATION_1]
• [SITUATION_2]
• [SITUATION_3]

Notre intervention :
Phase 1 : [PHASE_1] (Semaines 1-2)
Phase 2 : [PHASE_2] (Semaines 3-6)
Phase 3 : [PHASE_3] (Semaines 7-8)

Résultats après [DUREE_TOTALE] :
✓ [RESULTAT_1]
✓ [RESULTAT_2]
✓ [RESULTAT_3]

ROI : [ROI] sur [PERIODE_ROI].

[ENTREPRISE] a-t-elle des défis similaires ?

[EXPEDITEUR]`,
    plan: "pro",
    category: "etude-cas",
    variables: ["PRENOM", "CLIENT", "AVANT", "APRES", "DUREE", "CLIENT_DETAILLE", "SECTEUR_CLIENT", "TAILLE_CLIENT", "DEFI_COMMUN", "SITUATION_1", "SITUATION_2", "SITUATION_3", "PHASE_1", "PHASE_2", "PHASE_3", "DUREE_TOTALE", "RESULTAT_1", "RESULTAT_2", "RESULTAT_3", "ROI", "PERIODE_ROI", "ENTREPRISE", "EXPEDITEUR"]
  },
  {
    name: "Question Sondage",
    subject: "Sondage rapide : comment [ENTREPRISE] gère [PROBLEMATIQUE] ?",
    content: `[PRENOM],

Sondage express (30 secondes max) :

Comment [ENTREPRISE] gère-t-elle actuellement [PROBLEMATIQUE] ?

A) [OPTION_A]
B) [OPTION_B]  
C) [OPTION_C]
D) Autre (précisez)

Pourquoi cette question ? 

Je prépare un benchmark pour [RAISON_BENCHMARK]. Vos réponses m'aideraient énormément.

En échange : je partage les résultats consolidés + nos recommandations pour votre secteur.

Réponse en un clic : A, B, C ou D ?

Merci d'avance,
[EXPEDITEUR]`,
    plan: "pro",
    category: "sondage",
    variables: ["PRENOM", "ENTREPRISE", "PROBLEMATIQUE", "OPTION_A", "OPTION_B", "OPTION_C", "RAISON_BENCHMARK", "EXPEDITEUR"]
  }
];

// GROWTH TEMPLATES (30 total - adding the remaining ones)
export const growthTemplates = [
  {
    name: "Proposition de Partenariat",
    subject: "Partenariat stratégique : [ENTREPRISE] x [NOTRE_ENTREPRISE]",
    content: `[PRENOM],

Proposition de partenariat stratégique.

Contexte : [ENTREPRISE] excelle en [COMPETENCE_CLIENT], nous excellons en [NOTRE_COMPETENCE].

Opportunité identifiée : [OPPORTUNITE_MARCHE] représente [TAILLE_MARCHE] €/an.

Proposition de collaboration :
→ [ENTREPRISE] : [ROLE_CLIENT]
→ [NOTRE_ENTREPRISE] : [NOTRE_ROLE]
→ Revenus partagés : [REPARTITION]

Avantages pour [ENTREPRISE] :
• [AVANTAGE_1]
• [AVANTAGE_2]
• [AVANTAGE_3]

[CLIENT_PARTENAIRE] génère déjà [REVENUS_PARTENAIRE] avec ce modèle.

Intéressé par une discussion confidentielle ?

[EXPEDITEUR]
[TITRE_EXPEDITEUR]`,
    plan: "growth",
    category: "partenariat",
    variables: ["PRENOM", "ENTREPRISE", "NOTRE_ENTREPRISE", "COMPETENCE_CLIENT", "NOTRE_COMPETENCE", "OPPORTUNITE_MARCHE", "TAILLE_MARCHE", "ROLE_CLIENT", "NOTRE_ROLE", "REPARTITION", "AVANTAGE_1", "AVANTAGE_2", "AVANTAGE_3", "CLIENT_PARTENAIRE", "REVENUS_PARTENAIRE", "EXPEDITEUR", "TITRE_EXPEDITEUR"]
  },
  {
    name: "Acquisition/Investissement",
    subject: "Opportunité d'acquisition dans [SECTEUR] - [ENTREPRISE]",
    content: `Confidentiel - [PRENOM],

Nous représentons un fonds qui cherche à acquérir une entreprise comme [ENTREPRISE] dans les [DELAI] mois.

Critères recherchés :
✓ Secteur [SECTEUR]
✓ CA > [CA_MINIMUM] M€
✓ Croissance > [CROISSANCE]%
✓ Position dominante en [DOMAINE]

[ENTREPRISE] correspond parfaitement.

Valorisation préliminaire : [VALORISATION] x CA (soit ~[MONTANT_ESTIME] M€).

Notre approche :
• Conservation équipe dirigeante
• Accélération internationale
• Synergies avec portfolio

Intéressé par une discussion exploratoire ?

[EXPEDITEUR]
[FONDS_INVESTISSEMENT]`,
    plan: "growth",
    category: "acquisition",
    variables: ["PRENOM", "SECTEUR", "ENTREPRISE", "DELAI", "CA_MINIMUM", "CROISSANCE", "DOMAINE", "VALORISATION", "MONTANT_ESTIME", "EXPEDITEUR", "FONDS_INVESTISSEMENT"]
  }
];

export const exampleLeads = [
  {
    firstName: "Marie",
    lastName: "Dubois",
    email: "marie.dubois@techstart.fr",
    company: "TechStart",
    sector: "Tech/SaaS",
    position: "CEO",
    aiScore: 85,
    status: "new",
    source: "external",
    notes: "Startup en forte croissance, besoin de structurer leur sales process"
  },
  {
    firstName: "Pierre",
    lastName: "Martin",
    email: "p.martin@ecom-plus.com",
    company: "Ecom Plus",
    sector: "E-commerce",
    position: "Directeur Marketing",
    aiScore: 72,
    status: "contacted",
    source: "external",
    notes: "Cherche à améliorer son taux de conversion email"
  },
  {
    firstName: "Sophie",
    lastName: "Leroy",
    email: "sophie.leroy@consulting-pro.fr",
    company: "Consulting Pro",
    sector: "Services",
    position: "Associée",
    aiScore: 91,
    status: "qualified",
    source: "external",
    notes: "Très intéressée, a déjà un budget alloué"
  },
  {
    firstName: "Thomas",
    lastName: "Bernard",
    email: "thomas@innov-lab.fr",
    company: "Innov Lab",
    sector: "Tech/SaaS",
    position: "CTO",
    aiScore: 68,
    status: "new",
    source: "external",
    notes: "Profil technique, à orienter vers notre solution automation"
  },
  {
    firstName: "Amélie",
    lastName: "Rousseau",
    email: "amelie.rousseau@retail-chain.fr",
    company: "Retail Chain",
    sector: "E-commerce",
    position: "Head of Sales",
    aiScore: 79,
    status: "contacted",
    source: "external",
    notes: "Équipe de 15 commerciaux, gros potentiel volume"
  }
];

export async function seedDatabase() {
  console.log("🌱 Seeding database with French templates and example data...");
  
  try {
    // Seed all templates
    const allTemplates = [
      ...frenchEmailTemplates,
      ...additionalProTemplates,
      ...growthTemplates
    ];

    for (const template of allTemplates) {
      await storage.createTemplate(template);
    }
    
    console.log(`✅ Seeded ${allTemplates.length} French email templates`);
    
    // Note: We can't seed leads without a real user ID from authentication
    // This will be done when a user first accesses the dashboard
    
    return true;
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    return false;
  }
}