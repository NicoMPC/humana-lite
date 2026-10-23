/**
 * Bibliothèque interne cheveux (transcrite depuis docs/CONTENU-CHEVEUX-V1.md,
 * section B) : formulations prêtes à sélectionner et personnaliser dans la
 * fiche routine finale, rubriques « Mes gestes & habitudes » (6) et « Mes
 * tips à ne pas oublier » (7). Ne pose pas de diagnostic, aide seulement à
 * rédiger vite pendant l'entretien.
 */

/** Gestes & habitudes, groupés par catégorie (banque de formulations). */
export const GESTES_HABITUDES_CHEVEUX = [
  {
    categorie: 'Jour de lavage / shampoing',
    items: [
      'Adapter la fréquence des lavages aux besoins réels du cuir chevelu.',
      'Faire un seul shampoing par lavage lorsque cela suffit.',
      'Faire deux shampoings uniquement lorsque cela est réellement nécessaire.',
      'Appliquer le shampoing principalement sur le cuir chevelu et les racines.',
      'Faire des sections pour mieux répartir le shampoing sur le cuir chevelu.',
      'Masser avec la pulpe des doigts sans griffer avec les ongles.',
      'Rincer soigneusement afin de ne pas laisser de résidus.',
      'Privilégier une eau tiède plutôt que très chaude.',
    ],
  },
  {
    categorie: 'Démêlage / manipulation',
    items: [
      'Démêler en douceur en commençant par les pointes puis remonter progressivement.',
      'Profiter de l’après-shampoing pour faciliter le démêlage si cela convient à la chevelure.',
      'Éviter de tirer sur les nœuds ou de démêler brutalement.',
      'Limiter les manipulations répétées lorsque les cheveux sont fragiles.',
      'Utiliser une brosse ou un peigne adapté à la nature et à l’épaisseur des cheveux.',
    ],
  },
  {
    categorie: 'Séchage / serviette',
    items: [
      'Utiliser une serviette microfibre ou une matière douce adaptée.',
      'Essorer en pressant ou en tamponnant sans frotter les cheveux.',
      'Éviter de garder les cheveux mouillés enfermés trop longtemps dans une serviette.',
      'Privilégier un séchage doux et maîtrisé.',
      'Ne pas se coucher avec les cheveux encore mouillés si cela favorise les nœuds, frottements ou inconforts.',
    ],
  },
  {
    categorie: 'Chaleur',
    items: [
      'Limiter l’utilisation du lisseur et des appareils très chauds.',
      'Utiliser une protection thermique avant toute exposition à la chaleur.',
      'Privilégier une température modérée adaptée aux cheveux.',
      'Utiliser le sèche-cheveux sur air froid ou tiède lorsque possible.',
      'Éviter de repasser plusieurs fois sur la même mèche.',
      'Espacer les coiffages chauffants autant que possible.',
    ],
  },
  {
    categorie: 'Nuit / protection',
    items: [
      'Adopter une coiffure protectrice pour dormir.',
      'Éviter les attaches trop serrées pendant la nuit.',
      'Utiliser une taie d’oreiller en soie ou satin adaptée.',
      'Utiliser un bonnet ou foulard de protection si cela convient à la coiffure.',
      'Protéger les longueurs des frottements pendant la nuit.',
      'Adapter la coiffure nocturne pour préserver les boucles et limiter les nœuds.',
    ],
  },
  {
    categorie: 'Coiffures / tractions',
    items: [
      'Éviter les coiffures très serrées et les tractions répétées.',
      'Varier l’emplacement des attaches pour ne pas solliciter toujours les mêmes zones.',
      'Privilégier des accessoires qui accrochent et cassent moins la fibre.',
      'Éviter de serrer excessivement élastiques, pinces ou coiffures protectrices.',
      'Relâcher régulièrement les cheveux lorsqu’ils sont souvent attachés.',
    ],
  },
  {
    categorie: 'Sport',
    items: [
      'Adapter l’attache pendant le sport afin de limiter frottements et tractions.',
      'Éviter de laisser la transpiration sécher longtemps sur le cuir chevelu si elle provoque de l’inconfort.',
      'Après le sport : rincer, laver ou faire un refresh selon les besoins du cuir chevelu et la fréquence des séances.',
      'Éviter de multiplier les shampoings agressifs uniquement à cause du sport.',
      'Prévoir une routine simplifiée les jours d’activité sportive fréquente.',
    ],
  },
  {
    categorie: 'Piscine / mer / baignade',
    items: [
      'Mouiller les cheveux à l’eau claire avant la baignade lorsque pertinent.',
      'Utiliser la protection capillaire recommandée avant la baignade.',
      'Rincer soigneusement les cheveux à l’eau claire après la piscine ou la mer.',
      'Ne pas laisser durablement chlore, sel ou eau de baignade sécher sur les cheveux.',
      'Prévoir un lavage ou un soin adapté après les baignades répétées.',
      'Attacher ou protéger les longueurs pendant la baignade si nécessaire.',
    ],
  },
  {
    categorie: 'Soleil / extérieur',
    items: [
      'Protéger les cheveux lors d’expositions solaires prolongées.',
      'Utiliser un chapeau, foulard ou accessoire de protection lorsque pertinent.',
      'Renforcer la protection des longueurs en période d’expositions répétées.',
      'Adapter hydratation et soins lorsque soleil, vent ou chaleur assèchent davantage les cheveux.',
    ],
  },
  {
    categorie: 'Produits / quantités',
    items: [
      'Commencer par une petite quantité de produit puis en ajouter seulement si nécessaire.',
      'Répartir les produits par sections pour une application plus homogène.',
      'Respecter les zones d’application : cuir chevelu, longueurs ou pointes selon le produit.',
      'Éviter d’accumuler trop de produits si les cheveux s’alourdissent facilement.',
      'Clarifier ou détoxifier ponctuellement lorsque les accumulations le nécessitent.',
      'Adapter la quantité de coiffants à l’épaisseur et à la longueur des cheveux.',
    ],
  },
  {
    categorie: 'Shampoing sec / fixants',
    items: [
      'Utiliser le shampoing sec ponctuellement plutôt que comme remplacement systématique du lavage.',
      'Éviter l’accumulation répétée de shampoing sec sur le cuir chevelu.',
      'Éliminer correctement les résidus lors du lavage suivant.',
      'Limiter les produits fixants très desséchants si la fibre devient sèche ou cassante.',
      'Privilégier une alternative de coiffage plus adaptée lorsque possible.',
    ],
  },
  {
    categorie: 'Accessoires / entretien',
    items: [
      'Nettoyer régulièrement brosses, peignes et accessoires.',
      'Laisser sécher correctement les produits solides entre deux utilisations.',
      'Utiliser un support adapté aux produits solides fragiles.',
      'Remplacer les accessoires abîmés susceptibles d’accrocher les cheveux.',
      'Veiller à la propreté des bonnets, foulards et taies utilisés au contact des cheveux.',
    ],
  },
];

/**
 * Mes tips à ne pas oublier (formulations courtes, au « je »).
 * Conseil d'utilisation interne (doc source) : en choisir 3 à 6 réellement
 * pertinents pour la cliente.
 */
export const TIPS_CHEVEUX = [
  'Mon shampoing s’applique surtout sur mon cuir chevelu, pas sur mes longueurs.',
  'Je protège mes longueurs pendant la nuit.',
  'Je masse mon cuir chevelu avec la pulpe des doigts, jamais avec les ongles.',
  'Je privilégie une coiffure protectrice qui ne tire pas sur mes racines.',
  'Je rince toujours soigneusement mes produits.',
  'Je varie mes attaches pour éviter les tractions toujours au même endroit.',
  'Je privilégie une eau tiède plutôt que très chaude.',
  'Je protège mes cheveux du soleil lors des expositions prolongées.',
  'Je commence toujours par une petite quantité de produit : j’en ajoute seulement si besoin.',
  'Je rince mes cheveux après la piscine ou la mer.',
  'Je fais des sections pour mieux répartir mes produits.',
  'Je pense à protéger mes cheveux avant une baignade lorsque cela est prévu dans ma routine.',
  'Je démêle mes cheveux en douceur, en commençant par les pointes.',
  'Après le sport, j’adapte lavage, rinçage ou refresh à l’état réel de mon cuir chevelu.',
  'Je profite de mon après-shampoing pour démêler si c’est ce qui convient le mieux à mes cheveux.',
  'Je n’utilise pas le shampoing sec pour repousser indéfiniment mes lavages.',
  'Je ne frotte pas mes cheveux avec ma serviette : je presse ou je tamponne.',
  'Je nettoie régulièrement ma brosse et mes accessoires.',
  'Je privilégie ma serviette microfibre pour limiter les frottements.',
  'Je laisse bien sécher mon shampoing solide entre deux utilisations.',
  'Mes coiffants s’appliquent sur le niveau d’humidité conseillé dans ma routine.',
  'Je respecte la fréquence de mes soins profonds : plus n’est pas toujours mieux.',
  'Si mes cheveux sont beaux entre deux lavages, je ne suis pas obligée de faire un refresh.',
  'Je respecte le temps de pose conseillé plutôt que de laisser systématiquement mes soins toute la nuit.',
  'Je n’ajoute pas de produit automatiquement : j’observe d’abord ce dont mes cheveux ont besoin.',
  'Je concentre les huiles et les soins riches là où mes cheveux en ont réellement besoin.',
  'Je protège mes cheveux avant d’utiliser de la chaleur.',
  'Je garde ma routine simple et régulière : la constance compte plus que l’accumulation de produits.',
  'Je privilégie une chaleur modérée et j’évite les passages répétés.',
  'Si un produit provoque un inconfort inhabituel, j’arrête son utilisation et je demande conseil.',
];
