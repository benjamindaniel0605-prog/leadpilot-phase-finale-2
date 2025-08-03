export const EMAIL_TEMPLATES = [
  // Free Plan Template
  {
    id: "template-1",
    name: "Template 1 – Découverte simple",
    subject: "Une idée rapide pour [Entreprise]",
    content: `Bonjour [Prénom],

Nous aidons des entreprises comme [Entreprise] à résoudre [Problème] rapidement grâce à [Produit].
Souhaitez-vous en discuter 5 minutes cette semaine ?

[Signature]`,
    plan: "free",
    category: "discovery",
    variables: ["Prénom", "Entreprise", "Problème", "Produit", "Signature"]
  },

  // Starter Plan Templates
  {
    id: "template-2",
    name: "Template 2 – Problème → Solution",
    subject: "[Entreprise] et [Problème] ?",
    content: `Bonjour [Prénom],

J'ai remarqué que [Entreprise] rencontre souvent [Problème]. Nous aidons des entreprises similaires à résoudre ce problème en [délai] sans [contrainte].

Souhaitez-vous qu'on en parle 10 min cette semaine ?

[Signature]`,
    plan: "starter",
    category: "problem-solution",
    variables: ["Prénom", "Entreprise", "Problème", "délai", "contrainte", "Signature"]
  },
  {
    id: "template-3",
    name: "Template 3 – Question simple",
    subject: "Vous gérez comment [Problème] ?",
    content: `Bonjour [Prénom],

Comment gérez-vous [Problème] actuellement chez [Entreprise] ?
Nous aidons [Entreprise similaire] à [résultat obtenu].
Intéressé pour en discuter ?

[Signature]`,
    plan: "starter",
    category: "question",
    variables: ["Prénom", "Problème", "Entreprise", "Entreprise similaire", "résultat obtenu", "Signature"]
  },
  {
    id: "template-4",
    name: "Template 4 – Chiffre choc",
    subject: "73% des entreprises comme [Entreprise]…",
    content: `Bonjour [Prénom],

73% des entreprises dans [secteur] rencontrent [Problème].
[Produit] permet de réduire ce problème de [X%] en [temps].
Vous voulez en parler ?

[Signature]`,
    plan: "starter",
    category: "statistics",
    variables: ["Prénom", "secteur", "Problème", "Produit", "X%", "temps", "Signature"]
  },
  {
    id: "template-5",
    name: "Template 5 – Email court",
    subject: "Une idée pour [Entreprise]",
    content: `Bonjour [Prénom],
On aide [Entreprise similaire] à [résultat] en [temps].
Ça vous tente d'en discuter ?

[Signature]`,
    plan: "starter",
    category: "short",
    variables: ["Prénom", "Entreprise similaire", "résultat", "temps", "Signature"]
  },
  {
    id: "template-6",
    name: "Template 6 – Petit rappel (follow-up)",
    subject: "Petit rappel :)",
    content: `Bonjour [Prénom],
Je reviens vers vous suite à mon précédent message.
Est-ce que c'est pertinent pour [Entreprise] ?

[Signature]`,
    plan: "starter",
    category: "follow-up",
    variables: ["Prénom", "Entreprise", "Signature"]
  },

  // Pro Plan Templates
  {
    id: "template-7",
    name: "Template 7 – Social Proof",
    subject: "Comment [Entreprise similaire] a résolu [Problème]",
    content: `Bonjour [Prénom],

Il y a 3 mois, [Entreprise similaire] faisait face à [Problème].
Avec [Produit], ils ont obtenu [résultat concret] en [temps].

Est-ce que ça pourrait aussi aider [Entreprise] ?

[Signature]`,
    plan: "pro",
    category: "social-proof",
    variables: ["Prénom", "Entreprise similaire", "Problème", "Produit", "résultat concret", "temps", "Entreprise", "Signature"]
  },
  {
    id: "template-8",
    name: "Template 8 – ROI orienté",
    subject: "Économiser [X] heures / mois sur [Problème]",
    content: `Bonjour [Prénom],

Nos clients économisent en moyenne [X] heures / mois grâce à [Produit].
Vous pensez que ça pourrait intéresser [Entreprise] ?

[Signature]`,
    plan: "pro",
    category: "roi",
    variables: ["Prénom", "X", "Problème", "Produit", "Entreprise", "Signature"]
  },
  {
    id: "template-9",
    name: "Template 9 – Urgence",
    subject: "À faire avant [date]",
    content: `Bonjour [Prénom],

Cette solution peut résoudre [Problème] pour [Entreprise] avant [date].
Voulez-vous qu'on en parle rapidement ?

[Signature]`,
    plan: "pro",
    category: "urgency",
    variables: ["Prénom", "Problème", "Entreprise", "date", "Signature"]
  },
  {
    id: "template-10",
    name: "Template 10 – Follow-up bénéfice",
    subject: "Gagner [Bénéfice] pour [Entreprise] ?",
    content: `Bonjour [Prénom],

En 2 phrases : [Produit] → [Bénéfice concret].
Vous pensez que ça vaut la peine d'en parler 5 minutes ?

[Signature]`,
    plan: "pro",
    category: "benefit",
    variables: ["Prénom", "Bénéfice", "Entreprise", "Produit", "Bénéfice concret", "Signature"]
  },

  // Growth Plan Templates (additional)
  {
    id: "template-11",
    name: "Template 11 – A/B test courte",
    subject: "Une idée pour [Entreprise]",
    content: `Bonjour [Prénom],
On aide [Entreprise similaire] à [résultat] en [temps].
Intéressé ?

[Signature]`,
    plan: "growth",
    category: "ab-test",
    variables: ["Prénom", "Entreprise", "Entreprise similaire", "résultat", "temps", "Signature"]
  },
  {
    id: "template-12",
    name: "Template 12 – A/B test storytelling",
    subject: "Comment [Entreprise similaire] a réussi",
    content: `Bonjour [Prénom],

Il y a quelques mois, [Entreprise similaire] rencontrait [Problème].
Avec [Produit], ils ont obtenu [résultat].
Ça pourrait aussi marcher pour [Entreprise].

[Signature]`,
    plan: "growth",
    category: "storytelling",
    variables: ["Prénom", "Entreprise similaire", "Problème", "Produit", "résultat", "Entreprise", "Signature"]
  }
] as const;

export type EmailTemplate = typeof EMAIL_TEMPLATES[number];
