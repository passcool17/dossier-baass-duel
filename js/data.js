/** Données du jeu. Les citations sont des extraits mot pour mot du document. */

export const VERSION = 'baass-duel-v1';
export const SAVE_KEY = 'baass.duel.v1';
export const SETTINGS_KEY = 'baass.duel.settings.v1';

export const DISCLAIMER =
  "Ceci est un plan de gestion de recherche (décembre 2008), pas une preuve de physique nouvelle ni d’engin extraterrestre. L’histoire du jeu est une fiction.";

export const DISCLAIMER_SHORT = "Plan, pas une preuve.";

export const DOCUMENT_META = {
  title: 'BAASS Project Management Plan (Overview Paper)',
  date: '2 décembre 2008',
  contract: 'HHM402-08-C-0072',
  org: 'Bigelow Aerospace Advanced Space Studies (BAASS)',
  sponsor: 'DIA, programme AAWSAP',
  pages: 49,
  file: 'DOW-UAP-D168.pdf',
};

export const CREDIT =
  "Inspiré des mécaniques de Watergate (Matthias Cramer, Frosted Games/Capstone) — aucune affiliation. Règles, textes et illustrations originaux. Pas de thème Nixon ni Watergate.";

/** Pistes de contrôle (tire-à-la-corde). */
export const TRACKS = [
  {
    "id": "dynamique",
    "name": "Dynamique",
    "short": "Dyn.",
    "areas": [
      "Lift",
      "Propulsion",
      "Control"
    ],
    "hint": "Lift, Propulsion, Control"
  },
  {
    "id": "energie",
    "name": "Énergie & translation",
    "short": "Énerg.",
    "areas": [
      "Power Generation",
      "Spatial/Temporal Translation"
    ],
    "hint": "Power Generation, Spatial/Temporal Translation"
  },
  {
    "id": "structure",
    "name": "Structure",
    "short": "Struct.",
    "areas": [
      "Materials",
      "Configuration/Structure",
      "Signature Reduction"
    ],
    "hint": "Materials, Configuration/Structure, Signature Reduction"
  },
  {
    "id": "humain",
    "name": "Humain & armement",
    "short": "Humain",
    "areas": [
      "Human Interface",
      "Human Effects",
      "Armament",
      "Other"
    ],
    "hint": "Human Interface, Human Effects, Armament, Other"
  },
  {
    "id": "programmes",
    "name": "Programmes",
    "short": "Prog.",
    "projects": true,
    "hint": "Les 9 projets du plan (Physics, Engagement, Cooperation, Campus, Database, Oral History, Blue Book Materials, Northern Tier, Colares)"
  }
];

export const INFORMANTS = [
  {
    "id": "4",
    "label": "AAP Person 4",
    "pdfPage": 3
  },
  {
    "id": "7",
    "label": "AAP Person 7",
    "pdfPage": 3
  },
  {
    "id": "5",
    "label": "AAP Person 5",
    "pdfPage": 30
  },
  {
    "id": "8",
    "label": "AAP Person 8",
    "pdfPage": 15
  },
  {
    "id": "57",
    "label": "AAP Person 57",
    "pdfPage": 24
  },
  {
    "id": "58",
    "label": "AAP Person 58",
    "pdfPage": 24
  }
];

export const LIENS_TO_WIN = 3;
export const SECRECY_TO_WIN = 6;
export const REDACT_TO_WIN = 3;
export const MAX_ROUNDS = 8;
export const HAND_SIZE = 5;
export const PLAYS_PER_ROUND = 2;
export const TRACK_MIN = -4;
export const TRACK_MAX = 4;

export const AREAS = [
  'Lift',
  'Propulsion',
  'Control',
  'Power Generation',
  'Spatial/Temporal Translation',
  'Materials',
  'Configuration/Structure',
  'Signature Reduction',
  'Human Interface',
  'Human Effects',
  'Armament',
  'Other',
];

export const PROJECTS = [
  'Project Physics',
  'Project Engagement',
  'Project Cooperation',
  'Project Campus',
  'Project Database',
  'Project Oral History',
  'Project Blue Book Materials',
  'Project Northern Tier',
  'Project Colares',
];

export const TRACK_OF_AREA = {
  "Lift": "dynamique",
  "Propulsion": "dynamique",
  "Control": "dynamique",
  "Power Generation": "energie",
  "Spatial/Temporal Translation": "energie",
  "Materials": "structure",
  "Configuration/Structure": "structure",
  "Signature Reduction": "structure",
  "Human Interface": "humain",
  "Human Effects": "humain",
  "Armament": "humain",
  "Other": "humain"
};

/**
 * Cartes. `quote` est un extrait verbatim (y compris coquilles d’OCR du PDF).
 * `pdfPage` = page du fichier PDF (1–49).
 * `summary` = court résumé en français, sans ajouter de faits.
 * `fiction` = rappel si la mécanique (pas la citation) est une fiction.
 * `action` et `value` sont des mécaniques de fiction.
 */
export const CARDS = [
  {
    "id": "area-lift",
    "side": "player",
    "kind": "area",
    "area": "Lift",
    "track": "dynamique",
    "title": "Lift (portance)",
    "quote": "the twelve following areas: (1) lift, (2) Propulsion, (3) control, (4) Power Generation, (5) Spatial/Temporal Translation, (6) Materials, (7) Configuration/Structure, (8) Signature Reduction (Optical/lR/RF/Acoustic), (9)Human Interface, (10) Human effects, (11) Armament (RF and DEW), and {12) Other areas in support of 1-11.",
    "pdfPage": 7,
    "summary": "Le plan énumère douze domaines d’étude pour le rapport final prévu en septembre 2009. « Lift » (portance) est le premier de la liste. C’est un sujet à traiter, pas un résultat déjà obtenu.",
    "value": 2,
    "action": {
      "kind": "pullFixed",
      "track": "dynamique",
      "amount": 2
    },
    "actionText": "Tire la piste Dynamique de 2 vers toi.",
    "printedPage": "1"
  },
  {
    "id": "area-propulsion",
    "side": "player",
    "kind": "area",
    "area": "Propulsion",
    "track": "dynamique",
    "title": "Propulsion",
    "quote": "we will conduct a detailed evaluation on said data to mine it for information pertaining to Lift, Propulsion, Control, Power Generation, Spatial Temporal Translation, Materials, Configuration/Structure, Signature reduction, or Armaments.",
    "pdfPage": 13,
    "summary": "BAASS propose d’analyser, avec l’aide de la DIA et de NORAD, des données de trajectoire et de vitesse pour en tirer de l’information sur plusieurs domaines, dont la propulsion. Encore une fois, c’est un projet d’étude.",
    "value": 3,
    "action": {
      "kind": "pullFixed",
      "track": "dynamique",
      "amount": 2
    },
    "actionText": "Tire la piste Dynamique de 2 vers toi.",
    "printedPage": "7"
  },
  {
    "id": "area-control",
    "side": "player",
    "kind": "area",
    "area": "Control",
    "track": "dynamique",
    "title": "Control (contrôle)",
    "quote": "the matter of #3, Control, as in the operators of these very advanced spacecraft and possibly the source or sources of these craft.",
    "pdfPage": 11,
    "summary": "Dans les recommandations, le domaine n° 3 (contrôle) est relié à une question : qui piloterait ces engins, et d’où viendraient-ils. Le texte pose la question ; il n’y répond pas.",
    "value": 3,
    "action": {
      "kind": "pullFixed",
      "track": "dynamique",
      "amount": 2
    },
    "actionText": "Tire la piste Dynamique de 2 vers toi.",
    "printedPage": "5"
  },
  {
    "id": "area-power",
    "side": "player",
    "kind": "area",
    "area": "Power Generation",
    "track": "energie",
    "title": "Power Generation",
    "quote": "The 12 Technical Studies addressed: Lift, Propulsion, Control, Power Generation, Spatial/Temporal Translation, Materials, Configuration/Structure, Signature Reduction, Human Interface, Human Effects, Armament and Other Areas.",
    "pdfPage": 16,
    "summary": "En novembre 2008, Earthtech a remis 12 études techniques qui couvrent notamment la production d’énergie. Le même passage dit que plusieurs approches proposées sont « highly theoretical ».",
    "value": 4,
    "action": {
      "kind": "pullFixed",
      "track": "energie",
      "amount": 2
    },
    "actionText": "Tire la piste Énergie & translation de 2 vers toi.",
    "printedPage": "10"
  },
  {
    "id": "area-spatial",
    "side": "player",
    "kind": "area",
    "area": "Spatial/Temporal Translation",
    "track": "energie",
    "title": "Spatial/Temporal Translation",
    "quote": "Many of the approaches recommended in the 12 Earthtech Technical Studies are highly theoretical.",
    "pdfPage": 16,
    "summary": "Les études Earthtech, qui incluent la « translation spatiale/temporelle », sont décrites comme très théoriques. Le plan ne prétend pas qu’une telle technologie est déjà maîtrisée.",
    "value": 4,
    "action": {
      "kind": "pullFixed",
      "track": "energie",
      "amount": 2
    },
    "actionText": "Tire la piste Énergie & translation de 2 vers toi.",
    "printedPage": "10"
  },
  {
    "id": "area-materials",
    "side": "player",
    "kind": "area",
    "area": "Materials",
    "track": "structure",
    "title": "Materials (matériaux)",
    "quote": "Until actual materials are obtained, we must rely on more indirect means.",
    "pdfPage": 19,
    "summary": "Pour le Project Engagement, BAASS écrit qu’en attendant d’obtenir de vrais matériaux, il faudra se contenter de moyens indirects. Le document constate donc l’absence de ces matériaux au moment du plan.",
    "value": 3,
    "action": {
      "kind": "pullFixed",
      "track": "structure",
      "amount": 2
    },
    "actionText": "Tire la piste Structure de 2 vers toi.",
    "printedPage": "13"
  },
  {
    "id": "area-config",
    "side": "player",
    "kind": "area",
    "area": "Configuration/Structure",
    "track": "structure",
    "title": "Configuration/Structure",
    "quote": "This project will cover all twelve technical areas.",
    "pdfPage": 16,
    "summary": "Le Project Physics doit couvrir les douze domaines, y compris configuration et structure. C’est le mandat du projet, pas une description d’un engin déjà examiné.",
    "value": 3,
    "action": {
      "kind": "pullFixed",
      "track": "structure",
      "amount": 2
    },
    "actionText": "Tire la piste Structure de 2 vers toi.",
    "printedPage": "10"
  },
  {
    "id": "area-signature",
    "side": "player",
    "kind": "area",
    "area": "Signature Reduction",
    "track": "structure",
    "title": "Signature Reduction",
    "quote": "These would apply to #11, Armaments, #8, Signature Reduction, and #10, Human Effects.",
    "pdfPage": 11,
    "summary": "Le plan relie des incidents rapportés près d’installations nucléaires à trois domaines d’étude : armement, réduction de signature, et effets sur l’humain. Il recommande d’obtenir ces données ; il ne les présente pas ici.",
    "value": 2,
    "action": {
      "kind": "pullFixed",
      "track": "structure",
      "amount": 2
    },
    "actionText": "Tire la piste Structure de 2 vers toi.",
    "printedPage": "5"
  },
  {
    "id": "area-interface",
    "side": "player",
    "kind": "area",
    "area": "Human Interface",
    "track": "humain",
    "title": "Human Interface",
    "quote": "This program would specifically relate to technical area #9 with possible collateral involvement of other technical areas.",
    "pdfPage": 19,
    "summary": "Le Project Engagement est surtout rattaché au domaine n° 9 (interface humaine), avec d’éventuels liens vers d’autres domaines. C’est le cadre du programme d’observation proposé.",
    "value": 3,
    "action": {
      "kind": "pullFixed",
      "track": "humain",
      "amount": 2
    },
    "actionText": "Tire la piste Humain & armement de 2 vers toi.",
    "printedPage": "13"
  },
  {
    "id": "area-effects",
    "side": "player",
    "kind": "area",
    "area": "Human Effects",
    "track": "humain",
    "title": "Human Effects",
    "quote": "concerns the effects upon humans (#10) who were in close proximity to the functioning of very advanced spacecraft in the Colares Island, Brazil incidents.",
    "pdfPage": 11,
    "summary": "Le domaine n° 10 (effets sur l’humain) est associé, dans les recommandations, aux incidents de l’île de Colares (Brésil). BAASS demande à la DIA de récupérer des dossiers auprès de l’armée de l’air brésilienne.",
    "value": 3,
    "action": {
      "kind": "pullFixed",
      "track": "humain",
      "amount": 2
    },
    "actionText": "Tire la piste Humain & armement de 2 vers toi.",
    "printedPage": "5"
  },
  {
    "id": "area-armament",
    "side": "player",
    "kind": "area",
    "area": "Armament",
    "track": "humain",
    "title": "Armament (RF et DEW)",
    "quote": "Other important data for Agency acquisition pertain to effects upon nuclear facilities where anomalous spacecraft were in close proximity: such as those incidences at RAF Bentwaters, England, Malmstrom AFB in Montana and several others over the years.",
    "pdfPage": 11,
    "summary": "Le plan demande l’accès à des données déjà détenues par le gouvernement sur des incidents près d’installations nucléaires (RAF Bentwaters, Malmstrom AFB, etc.). Ces noms sont cités comme exemples à documenter, pas comme preuves démontrées dans ce texte.",
    "value": 4,
    "action": {
      "kind": "pullFixed",
      "track": "humain",
      "amount": 2
    },
    "actionText": "Tire la piste Humain & armement de 2 vers toi.",
    "printedPage": "5"
  },
  {
    "id": "area-other",
    "side": "player",
    "kind": "area",
    "area": "Other",
    "track": "humain",
    "title": "Other areas",
    "quote": "This Project Manager Report (PMR) fulfills the requirement to submit a report as part of the Advanced Aerospace Weapon System Application contract HHM402-08-C-0072.",
    "pdfPage": 7,
    "summary": "Le document est un rapport de gestion de projet exigé par le contrat « Advanced Aerospace Weapon System Application » HHM402-08-C-0072. Le 12e domaine (« Other ») sert d’appui aux onze autres.",
    "value": 2,
    "action": {
      "kind": "pullFixed",
      "track": "humain",
      "amount": 2
    },
    "actionText": "Tire la piste Humain & armement de 2 vers toi.",
    "printedPage": "1"
  },
  {
    "id": "proj-physics",
    "side": "player",
    "kind": "project",
    "project": "Project Physics",
    "track": "programmes",
    "title": "Project Physics",
    "quote": "Project Physics was mandated by the DIA to study the current research on all twelve technical areas. Earthtech and its subcontractors will deliver approximately 24 in depth position papers targeted to twelve technical areas by July 31, 2009.",
    "pdfPage": 8,
    "summary": "Projet mandaté par la DIA : faire le point sur la recherche déjà en cours dans les douze domaines. Earthtech doit livrer environ 24 textes d’ici le 31 juillet 2009.",
    "value": 4,
    "action": {
      "kind": "pullFixed",
      "track": "programmes",
      "amount": 2
    },
    "actionText": "Tire la piste Programmes de 2 vers toi."
  },
  {
    "id": "proj-engagement",
    "side": "player",
    "kind": "project",
    "project": "Project Engagement",
    "track": "programmes",
    "title": "Project Engagement",
    "quote": "Project Engagement will locate and secure small geographic areas that experience very frequent displays of advanced aerospace vehicles. The purpose is to directly observe and measure advanced aerospace vehicle performance.",
    "pdfPage": 8,
    "summary": "Le projet vise à trouver et sécuriser de petites zones où des engins seraient souvent observés, pour les mesurer sur place. C’est un plan d’observation, pas un compte rendu d’observation déjà faite.",
    "value": 3,
    "action": {
      "kind": "pullFixed",
      "track": "programmes",
      "amount": 2
    },
    "actionText": "Tire la piste Programmes de 2 vers toi."
  },
  {
    "id": "proj-cooperation",
    "side": "player",
    "kind": "project",
    "project": "Project Cooperation",
    "track": "programmes",
    "title": "Project Cooperation",
    "quote": "Project Cooperation requires the full cooperation between the DIA and BAASS and lays out the expected frameworks and specifics of this cooperation. This necessitates the help and cooperation from the DIA in assisting BAASS to obtain the high value film, hardware, relevant materials and information that are essential to the successful completion of this project.",
    "pdfPage": 8,
    "summary": "Ce projet décrit le cadre de coopération demandé entre la DIA et BAASS, surtout pour obtenir films, matériel et informations déjà détenus. Le texte insiste sur le fait que cette aide est jugée essentielle.",
    "value": 4,
    "action": {
      "kind": "pullFixed",
      "track": "programmes",
      "amount": 2
    },
    "actionText": "Tire la piste Programmes de 2 vers toi."
  },
  {
    "id": "proj-campus",
    "side": "player",
    "kind": "project",
    "project": "Project Campus",
    "track": "programmes",
    "title": "Project Campus",
    "quote": "Project Campus will seek to stimulate, motivate and encourage the senior levels of the academic community in the United States to seriously study advanced aerospace vehicles and their performances.",
    "pdfPage": 8,
    "summary": "Le projet veut convaincre des universitaires américains d’étudier sérieusement ces questions. C’est un programme de mobilisation du milieu universitaire, annoncé pour 2008 et au-delà.",
    "value": 2,
    "action": {
      "kind": "pullFixed",
      "track": "programmes",
      "amount": 2
    },
    "actionText": "Tire la piste Programmes de 2 vers toi."
  },
  {
    "id": "proj-database",
    "side": "player",
    "kind": "project",
    "project": "Project Database",
    "track": "programmes",
    "title": "Project Database",
    "quote": "Project Database will bring together all existing data from multiple separate databases on advanced aerospace vehicle performances in the United States, and ultimately in other countries for the past 60 years. This new database will be searchable by keywords that address all twelve technical areas.",
    "pdfPage": 8,
    "summary": "L’idée est de fusionner plusieurs bases de données existantes (États-Unis, puis d’autres pays, sur environ 60 ans) en une base consultable selon les douze domaines techniques.",
    "value": 3,
    "action": {
      "kind": "pullFixed",
      "track": "programmes",
      "amount": 2
    },
    "actionText": "Tire la piste Programmes de 2 vers toi."
  },
  {
    "id": "proj-oral",
    "side": "player",
    "kind": "project",
    "project": "Project Oral History",
    "track": "programmes",
    "title": "Project Oral History",
    "quote": "Project Oral History will contact and record interviews with dozens of highly placed individuals from industry and the military who have had direct knowledge of film evidence, physical material evidence, hardware itself, biological tissue and other material as they pertain to advanced aerial technology in the United States over the past several decades.",
    "pdfPage": 9,
    "summary": "Le projet prévoit d’enregistrer des entrevues avec des personnes bien placées dans l’industrie et l’armée, au sujet de films, de matériel ou de tissus. C’est un programme d’histoire orale à mener, pas le contenu de ces entrevues.",
    "value": 3,
    "action": {
      "kind": "pullFixed",
      "track": "programmes",
      "amount": 2
    },
    "actionText": "Tire la piste Programmes de 2 vers toi."
  },
  {
    "id": "proj-bluebook",
    "side": "player",
    "kind": "project",
    "project": "Project Blue Book Materials",
    "track": "programmes",
    "title": "Project Blue Book Materials",
    "quote": "Project Blue Book Materials will obtain the case files and associated trace materials with the help of DIA of multiple high value cases involving advanced aerospace vehicles that were never included in Project Blue Book presumably because they were deemed too sensitive.",
    "pdfPage": 9,
    "summary": "BAASS veut obtenir, avec l’aide de la DIA, des dossiers et traces qui, selon le texte, n’auraient pas été versés au Project Blue Book officiel, jugés trop sensibles. Le plan exprime cette hypothèse et cette demande d’accès.",
    "value": 3,
    "action": {
      "kind": "pullFixed",
      "track": "programmes",
      "amount": 2
    },
    "actionText": "Tire la piste Programmes de 2 vers toi."
  },
  {
    "id": "proj-northern",
    "side": "player",
    "kind": "project",
    "project": "Project Northern Tier",
    "track": "programmes",
    "title": "Project Northern Tier",
    "quote": "Project Northern Tier will obtain all the information and case files pertaining to dozens of cases in which advanced aerospace vehicles flew over restricted air force bases containing nuclear weapons, hovered over weapon storage depots and interfered with functional integrity of ICBM missile systems during the 1960s and 1970s.",
    "pdfPage": 9,
    "summary": "Le projet vise à rassembler les dossiers d’incidents des années 1960–1970 près de bases nucléaires américaines (survol, vol stationnaire, interférence rapportée avec des ICBM). Le plan veut obtenir ces dossiers ; il ne les joint pas.",
    "value": 4,
    "action": {
      "kind": "pullFixed",
      "track": "programmes",
      "amount": 2
    },
    "actionText": "Tire la piste Programmes de 2 vers toi."
  },
  {
    "id": "proj-colares",
    "side": "player",
    "kind": "project",
    "project": "Project Colares",
    "track": "programmes",
    "title": "Project Colares",
    "quote": "Project Colares will obtain materials and case files, with help from the DIA, from an extensive series of advanced aerospace incidents, many of which caused death and injury to indigenous inhabitants, occurring on Colares Island in the Northern area of Brazil in 1977. The Brazilian Air Force conducted an investigation and obtained multiple photographs, instrumented detection and eyewitness testimony, much of which pointed to potentially hostile activity by the advanced aerospace vehicles.",
    "pdfPage": 9,
    "summary": "BAASS demande l’aide de la DIA pour obtenir les dossiers de l’armée de l’air brésilienne sur une série d’incidents en 1977 à l’île de Colares (photos, mesures, témoignages, blessures rapportées). Encore un plan d’acquisition de documents.",
    "value": 4,
    "action": {
      "kind": "pullFixed",
      "track": "programmes",
      "amount": 2
    },
    "actionText": "Tire la piste Programmes de 2 vers toi."
  },
  {
    "id": "roswell-affidavit",
    "side": "player",
    "kind": "roswell",
    "title": "Affidavit scellé de 2002",
    "quote": "2002 SEALED AFFIDAVIT OF 1843(a)(2), 1843(a)(1)(B)",
    "pdfPage": 45,
    "summary": "L’annexe 2 du plan joint un affidavit scellé de 2002. Le nom du déclarant est caviardé et porté comme « 1843(a)(2), 1843(a)(1)(B) ». On ne devine pas ce nom. C’est un témoignage joint au dossier, pas une vérification par BAASS.",
    "value": 4,
    "action": {
      "kind": "pullAny",
      "amount": 2
    },
    "actionText": "Tire n’importe quelle piste de 2 vers toi."
  },
  {
    "id": "roswell-pio",
    "side": "player",
    "kind": "roswell",
    "title": "Officier d’information, juillet 1947",
    "quote": "In July, 1947, I was stationed at the Roswell Army Air Base In Roswell, New Mexico, serving as the base Public Information Officer.",
    "pdfPage": 45,
    "summary": "Le déclarant de l’affidavit écrit qu’en juillet 1947 il était officier d’information publique à la base aérienne de Roswell, au Nouveau-Mexique. C’est son récit, daté de 2002.",
    "value": 3,
    "action": {
      "kind": "pullAny",
      "amount": 2
    },
    "actionText": "Tire n’importe quelle piste de 2 vers toi."
  },
  {
    "id": "roswell-debris",
    "side": "player",
    "kind": "roswell",
    "title": "Débris « paper thin yet extremely strong »",
    "quote": "Pieces which resembled metal foll, paper thin yet extremely strong. and pieces with unusual markings along their length were handled from man to man, each voicing their opinion. No one was able to identify the crash debris.",
    "pdfPage": 45,
    "summary": "L’affidavit décrit des morceaux ressemblant à une feuille de métal, « fins comme du papier mais extrêmement résistants », et des marques inhabituelles. Personne, selon le déclarant, n’a pu identifier ces débris. Graphie « foll » conservée telle quelle (OCR). C’est un témoignage, pas une analyse de laboratoire.",
    "value": 5,
    "action": {
      "kind": "pullAny",
      "amount": 3
    },
    "actionText": "Tire n’importe quelle piste de 3 vers toi."
  },
  {
    "id": "info-4",
    "side": "player",
    "kind": "informant",
    "person": "4",
    "title": "AAP Person 4",
    "quote": "Staff AAP Person 4 Administrator",
    "pdfPage": 3,
    "summary": "La page du personnel liste « AAP Person 4 » à côté de la mention « Administrator ». Aucun nom n’est donné. C’est une désignation caviardée, pas une identification.",
    "value": 3,
    "action": {
      "kind": "placeAndLink",
      "person": "4"
    },
    "actionText": "Place AAP Person 4. Si tu as verrouillé une piste (+4) encore libre, forme un lien avec elle.",
    "fiction": "Mécanique de fiction : le document ne désigne pas cette personne comme informateur. Seule la désignation « AAP Person N » est réelle ; on ne devine aucun nom."
  },
  {
    "id": "info-7",
    "side": "player",
    "kind": "informant",
    "person": "7",
    "title": "AAP Person 7",
    "quote": "AAP Person 7 Deputy Administrator",
    "pdfPage": 3,
    "summary": "La même page liste « AAP Person 7 » à côté de « Deputy Administrator ». Aucun nom n’est donné.",
    "value": 3,
    "action": {
      "kind": "placeAndLink",
      "person": "7"
    },
    "actionText": "Place AAP Person 7. Si tu as verrouillé une piste (+4) encore libre, forme un lien avec elle.",
    "fiction": "Mécanique de fiction : le document ne désigne pas cette personne comme informateur. Seule la désignation « AAP Person N » est réelle ; on ne devine aucun nom."
  },
  {
    "id": "info-5",
    "side": "player",
    "kind": "informant",
    "person": "5",
    "title": "AAP Person 5",
    "quote": "BAASS Deputy Administrator IAAP Person 5",
    "pdfPage": 30,
    "summary": "Une composition d’équipe mentionne « AAP Person 5 » (graphie « IAAP » conservée, telle que dans l’extrait). Aucun nom n’est donné.",
    "value": 3,
    "action": {
      "kind": "placeAndLink",
      "person": "5"
    },
    "actionText": "Place AAP Person 5. Si tu as verrouillé une piste (+4) encore libre, forme un lien avec elle.",
    "fiction": "Mécanique de fiction : le document ne désigne pas cette personne comme informateur. Seule la désignation « AAP Person N » est réelle ; on ne devine aucun nom."
  },
  {
    "id": "info-8",
    "side": "player",
    "kind": "informant",
    "person": "8",
    "title": "AAP Person 8",
    "quote": "Earthtech and bylAAP Person 8 Icovered an enormous number of possible directions as they sought to address the above 12 technical areas.",
    "pdfPage": 15,
    "summary": "Le plan indique que des textes soumis par MUFON, Earthtech et « AAP Person 8 » visaient les douze domaines techniques. Graphies « bylAAP » et « Icovered » conservées (extrait). Aucun nom n’est donné.",
    "value": 4,
    "action": {
      "kind": "placeAndLink",
      "person": "8"
    },
    "actionText": "Place AAP Person 8. Si tu as verrouillé une piste (+4) encore libre, forme un lien avec elle.",
    "fiction": "Mécanique de fiction : le document ne désigne pas cette personne comme informateur. Seule la désignation « AAP Person N » est réelle ; on ne devine aucun nom."
  },
  {
    "id": "info-57",
    "side": "player",
    "kind": "informant",
    "person": "57",
    "title": "AAP Person 57",
    "quote": "Deputy BAASS Administrator IAAP Person 57 IAAP Person 58",
    "pdfPage": 24,
    "summary": "Pour le Project Cooperation, le plan mentionne en soutien « AAP Person 57 » et « AAP Person 58 » (graphie « IAAP » conservée). Aucun nom n’est donné.",
    "value": 4,
    "action": {
      "kind": "placeAndLink",
      "person": "57"
    },
    "actionText": "Place AAP Person 57. Si tu as verrouillé une piste (+4) encore libre, forme un lien avec elle.",
    "fiction": "Mécanique de fiction : le document ne désigne pas cette personne comme informateur. Seule la désignation « AAP Person N » est réelle ; on ne devine aucun nom."
  },
  {
    "id": "info-58",
    "side": "player",
    "kind": "informant",
    "person": "58",
    "title": "AAP Person 58",
    "quote": "Deputy BAASS Administrator IAAP Person 57 IAAP Person 58",
    "pdfPage": 24,
    "summary": "Même passage : « AAP Person 58 » est cité avec « AAP Person 57 » parmi les personnes en soutien de l’administrateur, pour le Project Cooperation. Aucun nom n’est donné.",
    "value": 3,
    "action": {
      "kind": "placeAndLink",
      "person": "58"
    },
    "actionText": "Place AAP Person 58. Si tu as verrouillé une piste (+4) encore libre, forme un lien avec elle.",
    "fiction": "Mécanique de fiction : le document ne désigne pas cette personne comme informateur. Seule la désignation « AAP Person N » est réelle ; on ne devine aucun nom."
  },
  {
    "id": "dia-conf-10",
    "side": "dia",
    "kind": "redaction",
    "title": "Barre de caviardage",
    "quote": "This information is proprietary and confidential and cannot be disseminated or used without prior written consent from the Operating Manager of BAASS",
    "pdfPage": 10,
    "summary": "Mention répétée dans le plan : l’information est propriétaire et confidentielle, et ne peut être diffusée sans consentement écrit. C’est une clause de confidentialité, pas une preuve.",
    "value": 3,
    "action": {
      "kind": "pullAny",
      "amount": 2
    },
    "actionText": "Tire une piste de 2 vers le Secret DIA."
  },
  {
    "id": "dia-conf-3",
    "side": "dia",
    "kind": "redaction",
    "title": "Non-dissémination",
    "quote": "This information is proprietary and confidential and cannot be disseminated",
    "pdfPage": 3,
    "summary": "Même clause de confidentialité, sur la page du personnel. Le plan interdit la diffusion de son contenu sans autorisation.",
    "value": 3,
    "action": {
      "kind": "pullAny",
      "amount": 2
    },
    "actionText": "Tire une piste de 2 vers le Secret DIA."
  },
  {
    "id": "dia-consent",
    "side": "dia",
    "kind": "redaction",
    "title": "Consentement écrit",
    "quote": "cannot be disseminated or used without prior written consent from the Operating Manager of BAASS",
    "pdfPage": 10,
    "summary": "La clause précise qu’il faut le consentement écrit du gestionnaire de BAASS pour utiliser ou diffuser l’information.",
    "value": 3,
    "action": {
      "kind": "pullTwoTracks",
      "amount": 1
    },
    "actionText": "Tire deux pistes différentes de 1 vers le Secret DIA."
  },
  {
    "id": "dia-1843-aff",
    "side": "dia",
    "kind": "redaction",
    "title": "Affidavit 1843(a)",
    "quote": "2002 SEALED AFFIDAVIT OF 1843(a)(2), 1843(a)(1)(B)",
    "pdfPage": 45,
    "summary": "L’annexe joint un affidavit scellé dont le nom est remplacé par les codes de caviardage 1843(a)(2) et 1843(a)(1)(B). On ne devine pas ce nom.",
    "value": 2,
    "action": {
      "kind": "pullStrong",
      "amount": 2
    },
    "actionText": "Tire une piste de 2 vers le Secret DIA (barre noire)."
  },
  {
    "id": "dia-1843-name",
    "side": "dia",
    "kind": "secrecy",
    "title": "Code 1843(a)(2)",
    "quote": "I was aware that 1843(a)(2), 1843(a)(1)(B)",
    "pdfPage": 45,
    "summary": "Dans l’affidavit, un passage conserve les codes de caviardage 1843(a)(2) et 1843(a)(1)(B) à la place d’un nom. On les laisse tels quels.",
    "value": 4,
    "action": {
      "kind": "secrecyOrPull",
      "amount": 2
    },
    "actionText": "Monte le secret de 1, ou tire une piste de 2."
  },
  {
    "id": "dia-restricted",
    "side": "dia",
    "kind": "redaction",
    "title": "Bases restreintes",
    "quote": "advanced aerospace vehicles flew over restricted air force bases containing nuclear weapons, hovered over weapon storage depots and interfered with functional integrity of ICBM missile systems",
    "pdfPage": 9,
    "summary": "Le Project Northern Tier prévoit d’obtenir des dossiers sur des cas, dans les années 1960 et 1970, impliquant des bases aériennes restreintes et des armes nucléaires. C’est un objectif d’acquisition de dossiers.",
    "value": 4,
    "action": {
      "kind": "pullAny",
      "amount": 2
    },
    "actionText": "Tire une piste de 2 vers le Secret DIA."
  },
  {
    "id": "dia-natsec",
    "side": "dia",
    "kind": "secrecy",
    "title": "Sécurité nationale",
    "quote": "All of these cases potentially provide evidence of a threat to the national security of the United States.",
    "pdfPage": 9,
    "summary": "Le plan affirme que ces cas « pourraient » fournir des indices d’une menace pour la sécurité nationale. C’est une justification du projet, pas une conclusion établie.",
    "value": 2,
    "action": {
      "kind": "secrecy",
      "amount": 1
    },
    "actionText": "Monte le secret de 1."
  },
  {
    "id": "dia-sensitive",
    "side": "dia",
    "kind": "secrecy",
    "title": "Jugés trop sensibles",
    "quote": "were never included in Project Blue Book presumably because they were deemed too sensitive",
    "pdfPage": 9,
    "summary": "Le plan dit que certains dossiers n’auraient pas été inclus dans le Project Blue Book, « probablement » parce qu’ils étaient jugés trop sensibles. C’est une hypothèse du plan.",
    "value": 3,
    "action": {
      "kind": "secrecyOrPull",
      "amount": 2
    },
    "actionText": "Monte le secret de 1, ou tire une piste de 2."
  },
  {
    "id": "dia-trust",
    "side": "dia",
    "kind": "secrecy",
    "title": "Confiance des commanditaires",
    "quote": "BAASS appreciates the high level of trust that has been bestowed on the organization by the sponsors/DIA",
    "pdfPage": 4,
    "summary": "Dans la préface, BAASS remercie les commanditaires et la DIA pour la confiance accordée. C’est un remerciement, pas un résultat scientifique.",
    "value": 1,
    "action": {
      "kind": "secrecy",
      "amount": 1
    },
    "actionText": "Monte le secret de 1."
  },
  {
    "id": "dia-threat-us",
    "side": "dia",
    "kind": "redaction",
    "title": "Menace possible",
    "quote": "some of these advanced aerospace craft may represent a threat to the security of the United States including its airspace and nuclear facilities",
    "pdfPage": 4,
    "summary": "La préface justifie l’étude par la possibilité que certains engins représentent une menace pour la sécurité des États-Unis. Le mot « may » (peuvent) marque une hypothèse.",
    "value": 4,
    "action": {
      "kind": "pullTwoTracks",
      "amount": 1
    },
    "actionText": "Tire deux pistes différentes de 1 vers le Secret DIA."
  },
  {
    "id": "dia-secure",
    "side": "dia",
    "kind": "secrecy",
    "title": "Transmission sécurisée",
    "quote": "the length of time required for DIA staff to secure these materials and to pass them in a secure manner to appropriately cleared BAAS$ staff",
    "pdfPage": 34,
    "summary": "Pour les dossiers absents du Project Blue Book, le plan prévoit que le personnel de la DIA les transmette de façon sécurisée à des employés BAASS dûment habilités. Graphie « BAAS$ » conservée (extrait).",
    "value": 3,
    "action": {
      "kind": "secrecyIfLocked",
      "amount": 2
    },
    "actionText": "Si une piste est déjà caviardée : +1 secret. Sinon, tire une piste de 2."
  },
  {
    "id": "dia-classified",
    "side": "dia",
    "kind": "redaction",
    "title": "Fichiers classifiés",
    "quote": "arrange for access from the Brazilian air force of the full set of classified files concerning the Colares Island events",
    "pdfPage": 38,
    "summary": "Le Project Colares prévoit de demander l’accès, via la DIA, à un ensemble de fichiers classifiés de l’armée de l’air brésilienne. C’est un objectif, pas un accès déjà obtenu.",
    "value": 3,
    "action": {
      "kind": "pullAny",
      "amount": 2
    },
    "actionText": "Tire une piste de 2 vers le Secret DIA."
  },
  {
    "id": "dia-1843-colares",
    "side": "dia",
    "kind": "secrecy",
    "title": "Caviardage 1843(a)",
    "quote": "Hence, she is 1843(a}(2}",
    "pdfPage": 38,
    "summary": "Un passage sur une médecin liée aux incidents de Colares est caviardé avec le code 1843(a)(2). La graphie « 1843(a}(2} » est celle de l’extrait. On ne devine ni le nom ni le reste de la phrase.",
    "value": 2,
    "action": {
      "kind": "secrecy",
      "amount": 1
    },
    "actionText": "Monte le secret de 1."
  },
  {
    "id": "dia-acquisition",
    "side": "dia",
    "kind": "redaction",
    "title": "Acquisition DIA",
    "quote": "For DIA, the acquisition of the data files known to be excluded from Project Bluebook",
    "pdfPage": 11,
    "summary": "Le plan recommande que la DIA acquière des dossiers « connus pour avoir été exclus » du Project Blue Book. C’est une recommandation d’acquisition.",
    "value": 3,
    "action": {
      "kind": "pullTwoTracks",
      "amount": 1
    },
    "actionText": "Tire deux pistes différentes de 1 vers le Secret DIA."
  },
  {
    "id": "dia-lanl",
    "side": "dia",
    "kind": "redaction",
    "title": "Dossiers à LANL",
    "quote": "presently resides at LANL (BAASS affiliated personnel have the precise files numbers and locations of these files at LANL)",
    "pdfPage": 11,
    "summary": "Le plan affirme que certains de ces dossiers se trouveraient au LANL, et que du personnel affilié à BAASS en connaîtrait les cotes. Ce n’est pas une reproduction de ces dossiers.",
    "value": 4,
    "action": {
      "kind": "pullAny",
      "amount": 2
    },
    "actionText": "Tire une piste de 2 vers le Secret DIA."
  },
  {
    "id": "dia-remain",
    "side": "dia",
    "kind": "redaction",
    "title": "Localiser le reste",
    "quote": "it may take significant time, possibly extending past 2010/2011 to locate and secure the remainder",
    "pdfPage": 34,
    "summary": "Le plan reconnaît qu’il peut falloir du temps, éventuellement au-delà de 2010-2011, pour localiser et sécuriser le reste des dossiers.",
    "value": 3,
    "action": {
      "kind": "pullAny",
      "amount": 2
    },
    "actionText": "Tire une piste de 2 vers le Secret DIA."
  },
  {
    "id": "dia-medical",
    "side": "dia",
    "kind": "redaction",
    "title": "Dossiers médicaux",
    "quote": "secure an entire set of files, including medical records, pertaining to the three month \"invasion\" by advanced aerospace vehicles in 1977",
    "pdfPage": 11,
    "summary": "Le plan recommande que la DIA contacte l’armée de l’air brésilienne pour obtenir un ensemble de dossiers, y compris médicaux, sur les incidents de 1977. Les guillemets autour de « invasion » sont dans le document.",
    "value": 2,
    "action": {
      "kind": "pullStrong",
      "amount": 2
    },
    "actionText": "Tire une piste de 2 vers le Secret DIA (barre noire)."
  },
  {
    "id": "dia-cover",
    "side": "dia",
    "kind": "secrecy",
    "title": "Couverture",
    "quote": "This information is proprietary and confidential and cannot be disseminated",
    "pdfPage": 10,
    "summary": "Rappel de la clause de confidentialité du plan, utilisée ici comme une carte de secret (mécanique de fiction).",
    "value": 1,
    "action": {
      "kind": "secrecy",
      "amount": 1
    },
    "actionText": "Monte le secret de 1."
  }
];

export const PLAYER_DECK = CARDS.filter((c) => c.side === 'player');
export const DIA_DECK = CARDS.filter((c) => c.side === 'dia');

export function cardById(id) {
  return CARDS.find((c) => c.id === id) || null;
}

export function trackById(id) {
  return TRACKS.find((t) => t.id === id) || null;
}

export function informantById(id) {
  return INFORMANTS.find((p) => p.id === id) || null;
}
