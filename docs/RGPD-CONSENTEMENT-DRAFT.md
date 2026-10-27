# Textes de consentement RGPD — DRAFT (option H)

**⚠️ Brouillon rédigé par Claude le 27/10/2026, PAS un texte juridique validé.**
Objectif : donner à Nathalie un premier jet exploitable tout de suite, à faire
relire et corriger par une vraie avocate avant toute mise en ligne. Deux textes
séparés, volontairement distincts : le RGPD impose qu'un consentement pour une
finalité donnée (ici, la collecte des données de diagnostic/santé) ne soit pas
mélangé avec un consentement pour une autre finalité (ici, l'usage en
communication) — on ne doit jamais pouvoir cocher les deux d'un coup.

Placeholders à remplir : `{BOUTIQUE_NOM}`, `{BOUTIQUE_ADRESSE}`,
`{BOUTIQUE_EMAIL}`, `{BOUTIQUE_TELEPHONE}`, `{PRENOM}` (reprend les champs
`doc.boutique` déjà présents dans `docs/CONTRACT.md`).

---

## 1. Consentement principal — collecte des données de diagnostic et des photos

*Obligatoire, à faire accepter avant tout diagnostic ou formulaire pré-rdv.
Les données de santé (allergies, grossesse, traitements) sont une catégorie
particulière de données : le consentement doit être explicite, spécifique,
et donné par une action positive claire (pas de case pré-cochée).*

> **Objet : votre consentement pour votre diagnostic personnalisé — {BOUTIQUE_NOM}**
>
> Bonjour {PRENOM},
>
> Avant de réaliser votre diagnostic personnalisé, nous avons besoin de votre
> accord pour collecter et conserver certaines informations vous concernant.
>
> **Qui collecte ces données ?**
> {BOUTIQUE_NOM}, {BOUTIQUE_ADRESSE} — contact : {BOUTIQUE_EMAIL} /
> {BOUTIQUE_TELEPHONE}.
>
> **Quelles données, et pourquoi ?**
> - Votre identité et vos coordonnées (nom, prénom, téléphone, e-mail,
>   adresse), pour vous recontacter et vous envoyer votre routine.
> - Les informations de votre diagnostic (cheveux, peau, mode de vie), y
>   compris, si vous les renseignez, des informations sur votre santé
>   (allergies, grossesse, traitements en cours) : uniquement pour vous
>   proposer une routine adaptée et éviter tout produit qui ne vous
>   conviendrait pas.
> - Les photos que vous nous transmettez (avant/après), pour suivre
>   l'évolution de votre routine avec vous.
>
> **Combien de temps conservons-nous ces données ?**
> [À définir avec Nathalie — proposition de départ : durée de la relation
> commerciale + 3 ans sans contact, puis suppression ou anonymisation.]
>
> **Qui y a accès ?**
> Uniquement {BOUTIQUE_NOM} (Nathalie et Jessie). Aucune donnée n'est vendue
> ni transmise à un tiers.
>
> **Vos droits**
> Vous pouvez à tout moment demander à consulter, corriger ou supprimer vos
> données, ou retirer ce consentement, en nous écrivant à {BOUTIQUE_EMAIL}.
> Le retrait de votre consentement n'affecte pas les diagnostics déjà
> réalisés, mais nous empêchera d'en faire de nouveaux.
>
> ☐ **J'accepte que {BOUTIQUE_NOM} collecte et conserve les informations
> ci-dessus pour établir mon diagnostic personnalisé.**
>
> Date : __________   Signature (ou réponse « j'accepte » à cet e-mail) : __________

---

## 2. Autorisation séparée — utilisation de la photo à des fins de communication

*Facultative, proposée au cas par cas (pas systématique), refusable sans
conséquence sur le service, révocable à tout moment. Jamais combinée avec le
consentement n°1 ci-dessus.*

> **Objet : autorisation d'utiliser votre photo — {BOUTIQUE_NOM}**
>
> Bonjour {PRENOM},
>
> Nous aimerions éventuellement utiliser une photo de votre résultat (avant/
> après) pour nos réseaux sociaux ou notre site, de façon à mettre en valeur
> notre travail. **C'est entièrement facultatif** : votre diagnostic et votre
> suivi se déroulent exactement de la même façon, que vous acceptiez ou non.
>
> Si vous acceptez :
> - La photo pourra être recadrée mais pas autrement modifiée.
> - [À préciser avec Nathalie : visage flouté/caché par défaut, ou visible
>   seulement avec accord explicite supplémentaire ?]
> - Vous pouvez retirer cette autorisation à tout moment, même après
>   publication, en nous écrivant à {BOUTIQUE_EMAIL} — nous retirerons la
>   photo dès que possible.
>
> ☐ **J'autorise {BOUTIQUE_NOM} à utiliser une photo de mon résultat pour sa
> communication (réseaux sociaux, site).**
> ☐ **Je ne souhaite pas que ma photo soit utilisée pour la communication.**
>
> Date : __________   Signature (ou réponse à cet e-mail) : __________

---

## Points laissés ouverts (à trancher avec Nathalie, puis l'avocate)

- Durée de conservation exacte (proposition de départ ci-dessus, à confirmer).
- Visage flouté par défaut sur les photos de communication, ou accord
  explicite supplémentaire pour un visage visible ?
- Canal du consentement en pratique : réponse à l'e-mail ("j'accepte"),
  case à cocher dans le formulaire pré-rdv, ou document signé en boutique ?
  Impacte le code (`soumettreFormulairePreRdv_`, fiche cliente du Lot 5).
