import { storage } from "./storage";

export const frenchEmailTemplates = [
  // FREE PLAN - 1 template (Templates 1-1)
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

  // STARTER PLAN - 4 nouveaux templates (Templates 2-5)
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

  // PRO PLAN - 10 nouveaux templates (Templates 6-15)
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

// GROWTH PLAN - 15 nouveaux templates (Templates 16-30)
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
  },
  {
    name: "Révélation Exclusive",
    subject: "Information confidentielle sur [SECTEUR] - [ENTREPRISE] concernée",
    content: `[PRENOM],

Information exclusive que je ne peux partager qu'avec vous.

[ENTREPRISE_CONCURRENTE] prépare [MOUVEMENT_STRATEGIQUE] pour [DATE_PREVUE].

Impact probable sur [ENTREPRISE] :
→ [IMPACT_1]
→ [IMPACT_2]
→ [IMPACT_3]

Nous avons développé une contre-stratégie qui permet de :
• [CONTRE_MESURE_1]
• [CONTRE_MESURE_2]
• [CONTRE_MESURE_3]

Temps de réaction critique : [DELAI_ACTION].

Discussion urgente possible ?

[EXPEDITEUR]
Confidentiel`,
    plan: "growth",
    category: "exclusive",
    variables: ["PRENOM", "SECTEUR", "ENTREPRISE", "ENTREPRISE_CONCURRENTE", "MOUVEMENT_STRATEGIQUE", "DATE_PREVUE", "IMPACT_1", "IMPACT_2", "IMPACT_3", "CONTRE_MESURE_1", "CONTRE_MESURE_2", "CONTRE_MESURE_3", "DELAI_ACTION", "EXPEDITEUR"]
  },
  {
    name: "Méta-Analyse Sectorielle",
    subject: "Méta-analyse [SECTEUR] : 3 découvertes qui changent tout",
    content: `[PRENOM],

Méta-analyse de [NB_ETUDES] études sur le secteur [SECTEUR] - conclusions surprenantes.

3 découvertes majeures :

1. [DECOUVERTE_1] → Impact : [IMPACT_1]
2. [DECOUVERTE_2] → Impact : [IMPACT_2]  
3. [DECOUVERTE_3] → Impact : [IMPACT_3]

[POURCENTAGE]% des entreprises ignorent ces changements.

Pour [ENTREPRISE], cela signifie [SIGNIFICATION_SPECIFIQUE].

Actions recommandées d'ici [DELAI] :
• [ACTION_1]
• [ACTION_2]
• [ACTION_3]

Je présente ces résultats à [NB_DIRIGEANTS] dirigeants triés sur le volet.

Votre place est réservée - confirmation ?

[EXPEDITEUR]`,
    plan: "growth",
    category: "meta-analyse",
    variables: ["PRENOM", "NB_ETUDES", "SECTEUR", "DECOUVERTE_1", "IMPACT_1", "DECOUVERTE_2", "IMPACT_2", "DECOUVERTE_3", "IMPACT_3", "POURCENTAGE", "ENTREPRISE", "SIGNIFICATION_SPECIFIQUE", "DELAI", "ACTION_1", "ACTION_2", "ACTION_3", "NB_DIRIGEANTS", "EXPEDITEUR"]
  },
  {
    name: "Reverse Psychology",
    subject: "Pourquoi [ENTREPRISE] ne devrait PAS travailler avec nous",
    content: `[PRENOM],

Soyons honnêtes : [ENTREPRISE] ne devrait probablement PAS travailler avec nous.

Voici pourquoi :

❌ Vous êtes déjà [POSITION_ACTUELLE]
❌ Notre solution nécessite [EFFORT_REQUIS]
❌ Les résultats prennent [DUREE_RESULTATS] à se manifester
❌ [AUTRE_CONTRAINTE]

En revanche, si [ENTREPRISE] veut [OBJECTIF_AMBITIEUX] et accepte de [CONDITION_ACCEPTANCE], alors notre approche [APPROCHE_UNIQUE] pourrait générer [RESULTAT_POTENTIEL].

[CLIENT_EXEMPLE] était dans la même situation. Résultat : [TRANSFORMATION_OBTENUE].

Mais honnêtement ? Restez sur votre approche actuelle si elle vous convient.

Si elle ne vous convient plus, rappel possible.

[EXPEDITEUR]`,
    plan: "growth",
    category: "reverse",
    variables: ["PRENOM", "ENTREPRISE", "POSITION_ACTUELLE", "EFFORT_REQUIS", "DUREE_RESULTATS", "AUTRE_CONTRAINTE", "OBJECTIF_AMBITIEUX", "CONDITION_ACCEPTANCE", "APPROCHE_UNIQUE", "RESULTAT_POTENTIEL", "CLIENT_EXEMPLE", "TRANSFORMATION_OBTENUE", "EXPEDITEUR"]
  },
  {
    name: "Testimonial Détaillé",
    subject: "Témoignage [CLIENT] : \"Sans [SOLUTION], [ENTREPRISE_CLIENT] aurait fermé\"",
    content: `[PRENOM],

Témoignage client reçu hier - il fallait que je vous le partage.

[CLIENT_TEMOIN], [FONCTION] chez [ENTREPRISE_CLIENT] :

"Il y a [PERIODE], [ENTREPRISE_CLIENT] était dans une situation critique. [PROBLEME_CRITIQUE].

J'avais testé [SOLUTION_1], [SOLUTION_2], même [SOLUTION_3]. Rien ne fonctionnait.

En découvrant [NOTRE_SOLUTION], j'étais sceptique. Mais [RAISON_CONFIANCE].

Résultats après [DUREE] :
• [RESULTAT_1]
• [RESULTAT_2]
• [RESULTAT_3]

Sans cette solution, [ENTREPRISE_CLIENT] aurait fermé. C'est factuel."

[ENTREPRISE] fait face aux mêmes défis que [ENTREPRISE_CLIENT] avant notre intervention.

Curieux de connaître notre méthode ?

[EXPEDITEUR]`,
    plan: "growth",
    category: "testimonial",
    variables: ["PRENOM", "CLIENT", "SOLUTION", "ENTREPRISE_CLIENT", "CLIENT_TEMOIN", "FONCTION", "PERIODE", "PROBLEME_CRITIQUE", "SOLUTION_1", "SOLUTION_2", "SOLUTION_3", "NOTRE_SOLUTION", "RAISON_CONFIANCE", "DUREE", "RESULTAT_1", "RESULTAT_2", "RESULTAT_3", "ENTREPRISE", "EXPEDITEUR"]
  },
  {
    name: "Future-Pacing",
    subject: "[ENTREPRISE] en 2027 : 3 scénarios possibles",
    content: `[PRENOM],

Exercice de prospective : [ENTREPRISE] en 2027.

Scénario 1 - Status Quo :
[ENTREPRISE] continue son approche actuelle de [APPROCHE_ACTUELLE].
Résultat probable : [RESULTAT_STATUS_QUO]

Scénario 2 - Évolution graduelle :
[ENTREPRISE] adopte [EVOLUTION_GRADUELLE] sur [DUREE_EVOLUTION].
Résultat probable : [RESULTAT_EVOLUTION]

Scénario 3 - Transformation radicale :
[ENTREPRISE] révolutionne [DOMAINE_REVOLUTION] avec [NOTRE_APPROCHE].
Résultat probable : [RESULTAT_TRANSFORMATION]

Selon notre modèle prédictif, [ENTREPRISE] a [PROBABILITE]% de chances d'atteindre le Scénario 3 seule.

Avec notre accompagnement : [PROBABILITE_AVEC_NOUS]%.

Quel scénario visez-vous pour [ENTREPRISE] ?

[EXPEDITEUR]`,
    plan: "growth",
    category: "future-pacing",
    variables: ["PRENOM", "ENTREPRISE", "APPROCHE_ACTUELLE", "RESULTAT_STATUS_QUO", "EVOLUTION_GRADUELLE", "DUREE_EVOLUTION", "RESULTAT_EVOLUTION", "DOMAINE_REVOLUTION", "NOTRE_APPROCHE", "RESULTAT_TRANSFORMATION", "PROBABILITE", "PROBABILITE_AVEC_NOUS", "EXPEDITEUR"]
  },
  {
    name: "Behind-the-Scenes",
    subject: "Dans les coulisses de [CLIENT_MAJEUR] (confidentiel)",
    content: `[PRENOM],

Retour des coulisses de [CLIENT_MAJEUR] (avec leur autorisation).

La semaine dernière, réunion de crise chez [CLIENT_MAJEUR]. Sujet : [PROBLEME_CLIENT].

[DIRIGEANT_CLIENT] : "Comment [CONCURRENT] fait-il pour [PERFORMANCE_CONCURRENT] ?"

Ma réponse : "[EXPLICATION_TECHNIQUE]"

Résultat immédiat : [ACTION_ENTREPRISE] → [RESULTAT_IMMEDIAT].

Ce qui m'a frappé : [INSIGHT_STRATEGIQUE].

[ENTREPRISE] pourrait appliquer la même logique pour [APPLICATION_POSSIBLE].

Avantage potentiel : [AVANTAGE_ESTIMÉ] d'ici [DELAI_ESTIMATION].

Cette approche vous intéresse ?

[EXPEDITEUR]
P.S: [ANECDOTE_BONUS]`,
    plan: "growth",
    category: "behind-scenes",
    variables: ["PRENOM", "CLIENT_MAJEUR", "PROBLEME_CLIENT", "DIRIGEANT_CLIENT", "CONCURRENT", "PERFORMANCE_CONCURRENT", "EXPLICATION_TECHNIQUE", "ACTION_ENTREPRISE", "RESULTAT_IMMEDIAT", "INSIGHT_STRATEGIQUE", "ENTREPRISE", "APPLICATION_POSSIBLE", "AVANTAGE_ESTIMÉ", "DELAI_ESTIMATION", "EXPEDITEUR", "ANECDOTE_BONUS"]
  },
  {
    name: "Invitation Think Tank",
    subject: "Think Tank privé : L'avenir de [SECTEUR] (invitation exclusive)",
    content: `[PRENOM],

Invitation exclusive au Think Tank "[TITRE_THINK_TANK]".

Date : [DATE_EVENEMENT]
Lieu : [LIEU_PRESTIGIEUX]
Participants : [NB_PARTICIPANTS] dirigeants de [SECTEUR]

Thématiques :
• [THEMATIQUE_1]
• [THEMATIQUE_2]
• [THEMATIQUE_3]

Intervenants confirmés :
→ [EXPERT_1] ([EXPERTISE_1])
→ [EXPERT_2] ([EXPERTISE_2])
→ [EXPERT_3] ([EXPERTISE_3])

Format Chatham House Rules + workshop collaboratif.

Profil recherché pour [ENTREPRISE] :
✓ [CRITERE_1]
✓ [CRITERE_2]
✓ [CRITERE_3]

Cette réflexion collective influencera [IMPACT_SECTORIEL].

Participation ? Places limitées ([NB_PLACES] restantes).

[EXPEDITEUR]
[ORGANISATION]`,
    plan: "growth",
    category: "think-tank",
    variables: ["PRENOM", "SECTEUR", "TITRE_THINK_TANK", "DATE_EVENEMENT", "LIEU_PRESTIGIEUX", "NB_PARTICIPANTS", "THEMATIQUE_1", "THEMATIQUE_2", "THEMATIQUE_3", "EXPERT_1", "EXPERTISE_1", "EXPERT_2", "EXPERTISE_2", "EXPERT_3", "EXPERTISE_3", "ENTREPRISE", "CRITERE_1", "CRITERE_2", "CRITERE_3", "IMPACT_SECTORIEL", "NB_PLACES", "EXPEDITEUR", "ORGANISATION"]
  },
  {
    name: "Retournement Narratif",
    subject: "L'erreur que j'ai faite avec [ENTREPRISE_SIMILAIRE] (et comment l'éviter)",
    content: `[PRENOM],

Confession : j'ai fait une grosse erreur avec [ENTREPRISE_SIMILAIRE].

Contexte : [ENTREPRISE_SIMILAIRE] avait [SITUATION_SIMILAIRE], comme [ENTREPRISE] aujourd'hui.

Mon erreur : j'ai proposé [MAUVAISE_SOLUTION] au lieu de [BONNE_SOLUTION].

Conséquence : [CONSEQUENCE_NEGATIVE] pendant [DUREE_CONSEQUENCE].

Heureusement, nous avons pu corriger avec [SOLUTION_CORRECTIVE].
Résultat final : [RESULTAT_FINAL].

Cette expérience m'a appris [LECON_APPRISE].

Pour [ENTREPRISE], je ne ferais plus cette erreur. L'approche serait :

Phase 1 : [PHASE_1_CORRECTE]
Phase 2 : [PHASE_2_CORRECTE]  
Phase 3 : [PHASE_3_CORRECTE]

Éviter mon erreur avec [ENTREPRISE_SIMILAIRE] vous intéresse ?

[EXPEDITEUR]`,
    plan: "growth",
    category: "retournement",
    variables: ["PRENOM", "ENTREPRISE_SIMILAIRE", "SITUATION_SIMILAIRE", "ENTREPRISE", "MAUVAISE_SOLUTION", "BONNE_SOLUTION", "CONSEQUENCE_NEGATIVE", "DUREE_CONSEQUENCE", "SOLUTION_CORRECTIVE", "RESULTAT_FINAL", "LECON_APPRISE", "PHASE_1_CORRECTE", "PHASE_2_CORRECTE", "PHASE_3_CORRECTE", "EXPEDITEUR"]
  },
  {
    name: "Intelligence Économique",
    subject: "Intelligence économique : mouvement suspect dans [SECTEUR]",
    content: `Confidentiel - [PRENOM],

Mouvement suspect détecté dans [SECTEUR].

Observations récentes :
• [OBSERVATION_1]
• [OBSERVATION_2]
• [OBSERVATION_3]

Hypothèse : [HYPOTHESE_STRATEGIQUE].

Si confirmée, impact sur [ENTREPRISE] :
→ [IMPACT_COURT_TERME] (6 mois)
→ [IMPACT_MOYEN_TERME] (18 mois)
→ [IMPACT_LONG_TERME] (3 ans)

Actions préventives possibles :
1. [ACTION_PREVENTIVE_1]
2. [ACTION_PREVENTIVE_2]
3. [ACTION_PREVENTIVE_3]

Nous surveillons [NB_INDICATEURS] indicateurs pour [CLIENT_REFERENCE].

Mise en place de la veille pour [ENTREPRISE] ?

Discussion confidentielle recommandée.

[EXPEDITEUR]
[CABINET_INTELLIGENCE]`,
    plan: "growth",
    category: "intelligence",
    variables: ["PRENOM", "SECTEUR", "OBSERVATION_1", "OBSERVATION_2", "OBSERVATION_3", "HYPOTHESE_STRATEGIQUE", "ENTREPRISE", "IMPACT_COURT_TERME", "IMPACT_MOYEN_TERME", "IMPACT_LONG_TERME", "ACTION_PREVENTIVE_1", "ACTION_PREVENTIVE_2", "ACTION_PREVENTIVE_3", "NB_INDICATEURS", "CLIENT_REFERENCE", "EXPEDITEUR", "CABINET_INTELLIGENCE"]
  },
  {
    name: "Ultimate Value Stack",
    subject: "Package complet [ENTREPRISE] : [VALEUR_TOTALE]€ de valeur",
    content: `[PRENOM],

Package spécialement conçu pour [ENTREPRISE].

Contenu :
1. [SERVICE_1] (Valeur : [PRIX_1]€)
2. [SERVICE_2] (Valeur : [PRIX_2]€)
3. [SERVICE_3] (Valeur : [PRIX_3]€)
4. [SERVICE_4] (Valeur : [PRIX_4]€)
5. [BONUS_1] (Valeur : [PRIX_BONUS_1]€)
6. [BONUS_2] (Valeur : [PRIX_BONUS_2]€)

Valeur totale : [VALEUR_TOTALE]€

Investissement pour [ENTREPRISE] : [PRIX_FINAL]€
Économie : [ECONOMIE]€ ([POURCENTAGE_REDUCTION]%)

ROI estimé : [ROI]% sur [PERIODE_ROI].

Conditions :
→ [CONDITION_1]
→ [CONDITION_2]
→ [CONDITION_3]

Garantie : [GARANTIE_OFFERTE].

Places limitées : [NB_ENTREPRISES] entreprises max.

[ENTREPRISE] est pré-qualifiée.

Validation avant [DATE_LIMITE] ?

[EXPEDITEUR]`,
    plan: "growth",
    category: "value-stack",
    variables: ["PRENOM", "ENTREPRISE", "VALEUR_TOTALE", "SERVICE_1", "PRIX_1", "SERVICE_2", "PRIX_2", "SERVICE_3", "PRIX_3", "SERVICE_4", "PRIX_4", "BONUS_1", "PRIX_BONUS_1", "BONUS_2", "PRIX_BONUS_2", "PRIX_FINAL", "ECONOMIE", "POURCENTAGE_REDUCTION", "ROI", "PERIODE_ROI", "CONDITION_1", "CONDITION_2", "CONDITION_3", "GARANTIE_OFFERTE", "NB_ENTREPRISES", "DATE_LIMITE", "EXPEDITEUR"]
  },
  // Templates 29 et 30 pour atteindre 30 au total
  {
    name: "Approche Consultative Ultime",
    subject: "Diagnostic stratégique gratuit pour [ENTREPRISE] - 72h",
    content: `[PRENOM],

Diagnostic stratégique complet offert à [ENTREPRISE].

Méthode : [METHODOLOGIE_EXCLUSIVE] développée sur [NB_ANNEES] ans.

Analyse complète en 72h :
→ Audit [DOMAINE_1] (Valeur : [PRIX_AUDIT_1]€)
→ Benchmark concurrentiel [DOMAINE_2] (Valeur : [PRIX_AUDIT_2]€)
→ Plan d'action 90 jours (Valeur : [PRIX_PLAN]€)
→ Accompagnement mise en œuvre (Valeur : [PRIX_ACCOMPAGNEMENT]€)

Valeur totale : [VALEUR_DIAGNOSTIC]€

Conditions : [CONDITION_DIAGNOSTIC]

Pourquoi gratuit ? [RAISON_GRATUIT].

[CLIENT_PRECEDENT] a obtenu [RESULTAT_CLIENT] grâce à ce diagnostic.

Planning limité : [NB_DIAGNOSTICS] diagnostics/mois max.

[ENTREPRISE] est éligible - confirmation avant [DATE_LIMITE] ?

[EXPEDITEUR]
[CABINET_CONSEIL]`,
    plan: "growth",
    category: "diagnostic",
    variables: ["PRENOM", "ENTREPRISE", "METHODOLOGIE_EXCLUSIVE", "NB_ANNEES", "DOMAINE_1", "PRIX_AUDIT_1", "DOMAINE_2", "PRIX_AUDIT_2", "PRIX_PLAN", "PRIX_ACCOMPAGNEMENT", "VALEUR_DIAGNOSTIC", "CONDITION_DIAGNOSTIC", "RAISON_GRATUIT", "CLIENT_PRECEDENT", "RESULTAT_CLIENT", "NB_DIAGNOSTICS", "DATE_LIMITE", "EXPEDITEUR", "CABINET_CONSEIL"]
  },
  {
    name: "Email de Clôture Définitive",
    subject: "Dernière communication - [ENTREPRISE] x [NOTRE_ENTREPRISE]",
    content: `[PRENOM],

C'est ma dernière communication concernant [SUJET_PRINCIPAL].

Bilan de nos échanges :
• [DATE_1] : [ECHANGE_1]
• [DATE_2] : [ECHANGE_2]  
• [DATE_3] : [ECHANGE_3]

Votre position : [POSITION_CLIENT]
Notre proposition : [NOTRE_PROPOSITION]

Je respecte votre décision de [DECISION_CLIENT].

Trois scénarios pour la suite :

1) [ENTREPRISE] change d'avis → Contact direct : [CONTACT_DIRECT]
2) Opportunité future → Je vous recontacte dans [DELAI_FUTUR]
3) Referral → Si vous connaissez une entreprise intéressée par [SOLUTION]

[ENTREPRISE] restera dans mon estime pour [RAISON_RESPECT].

Succès pour vos projets futurs !

[EXPEDITEUR]

P.S: [MESSAGE_FINAL_POSITIF]`,
    plan: "growth",
    category: "cloture",
    variables: ["PRENOM", "ENTREPRISE", "NOTRE_ENTREPRISE", "SUJET_PRINCIPAL", "DATE_1", "ECHANGE_1", "DATE_2", "ECHANGE_2", "DATE_3", "ECHANGE_3", "POSITION_CLIENT", "NOTRE_PROPOSITION", "DECISION_CLIENT", "CONTACT_DIRECT", "DELAI_FUTUR", "SOLUTION", "RAISON_RESPECT", "EXPEDITEUR", "MESSAGE_FINAL_POSITIF"]
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
    // Check if templates already exist
    const existingTemplates = await storage.getTemplates();
    if (existingTemplates.length > 0) {
      console.log(`✅ Templates already seeded (${existingTemplates.length} found)`);
      return true;
    }

    // Seed all templates with correct plan distribution
    const allTemplates = [
      ...frenchEmailTemplates,
      ...additionalProTemplates,
      ...growthTemplates
    ];

    for (const template of allTemplates) {
      await storage.createTemplate(template);
    }
    
    console.log(`✅ Seeded ${allTemplates.length} French email templates`);
    console.log(`📊 Distribution: 1 Free + 4 Starter + 10 Pro + 15 Growth = 30 total`);
    
    return true;
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    return false;
  }
}