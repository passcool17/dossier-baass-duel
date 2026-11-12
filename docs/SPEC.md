# Dossier BAASS : Duel — spécification

Jeu de cartes solo contre une IA, inspiré **uniquement des mécaniques** de *Watergate* (Matthias Cramer, Frosted Games / Capstone) : tire-à-la-corde sur des pistes de preuves, cartes jouées pour leur **action** ou leur **valeur**, enchère d’initiative, liaison d’informateurs à une cible. Règles, textes et graphismes sont originaux. Aucun thème Nixon / Watergate. Aucune affiliation.

## Intention

Le joueur est **l’Enquête** : il relie des informateurs désignés uniquement « AAP Person N » (numéros réellement présents dans le document, aucun nom deviné) aux **12 domaines techniques** et aux **9 projets** du dossier BAASS, afin de former une **chaîne de divulgation**.

L’IA est le **Secret DIA** : elle joue des **barres de caviardage**, tire les jetons vers son camp, et vise une victoire par **piste de secret** ou par preuves entièrement caviardées.

Source : *BAASS Project Management Plan*, 2 décembre 2008, contrat HHM402-08-C-0072, DIA AAWSAP, 49 pages (`source/DOW-UAP-D168.pdf`).

**Note visible en permanence :** ceci est un plan de gestion de recherche de 2008, **pas une preuve** de physique nouvelle ni d’engin extraterrestre (« plan, pas une preuve »). L’histoire du jeu (camps, enchères, liaisons, secret) est une **fiction**.

## Règles

### But (~15 minutes)

- **Enquête** : obtenir **3 liens**. Un lien relie un informateur « AAP Person N » déjà placé à une piste que l’Enquête a **verrouillée** (jeton à +4). Chaque informateur et chaque piste ne servent qu’à un seul lien (il faut donc trois pistes distinctes).
- **Secret DIA** : porter la piste de **secret à 6**, **ou** caviarder entièrement **3 pistes** (jeton verrouillé à −3).
- **8 manches** maximum. Si personne n’a rempli sa condition de victoire, le dossier est classé : victoire du Secret DIA.

### Plateau

Cinq **pistes de contrôle** (tire-à-la-corde), cases −4 (Secret) à +4 (Enquête), départ à 0 :

| Piste | Contenu réel du document |
| --- | --- |
| Dynamique | Lift, Propulsion, Control |
| Énergie & translation | Power Generation, Spatial/Temporal Translation |
| Structure | Materials, Configuration/Structure, Signature Reduction |
| Humain & armement | Human Interface, Human Effects, Armament, Other |
| Programmes | les 9 projets (Physics, Engagement, Cooperation, Campus, Database, Oral History, Blue Book Materials, Northern Tier, Colares) |

Un jeton qui atteint +4 ou −4 est **verrouillé** et ne bouge plus. À +4 la preuve est tenue par l’Enquête ; à −4 elle est **caviardée**. Un jeu pour la valeur déplace au plus 2 cases sur une même piste.

**Informateurs** (fiction de jeu ; seules les désignations viennent du document) : AAP Person 4, 7, 5, 8, 57, 58.

### Manche

1. **Enchère d’initiative.** Chaque camp joue une carte de sa main **pour sa valeur** (pas son action). La plus haute valeur gagne l’initiative (joue en premier) et un **élan** : un tirage optionnel d’une case. Égalité : le camp qui a déjà l’initiative la conserve (à la première manche, l’Enquête).
2. **Phase de jeu.** En alternance, **2 cartes** chacun. Chaque carte se joue pour son **ACTION** (effet indiqué) ou pour sa **VALEUR** (répartir autant de cases de tirage que la valeur, vers son camp, sur des pistes non verrouillées).
3. **Rappel.** Chaque camp se défausse des cartes jouées et pioche jusqu’à 5. Paquet vide : on mélange la défausse.

Main de départ : 5 cartes.

### Cartes

Chaque carte cite un **passage verbatim** du PDF, avec numéro de page et un court résumé en français. Codes de caviardage (`1843(a)…`) et « AAP Person N » conservés tels quels.

- **Paquet Enquête** (30) : 12 domaines, 9 projets, 3 cartes Roswell (citations déjà vérifiées du dossier-baass), 6 informateurs (citations vérifiées portant un « AAP Person N » réel).
- **Paquet Secret DIA** (18) : citations sur le caractère confidentiel, les restrictions, les codes 1843, les fichiers classifiés — jouées comme barres de caviardage, montée du secret, ou tirages.

Les actions et valeurs sont des **mécaniques de fiction**. Une carte informateur le rappelle explicitement.

### Difficulté

Facile, Normal, Difficile : même règles, IA de plus en plus précise (enchères, blocages, caviardage, secret). Taux visés pour un joueur heuristique : environ **65 / 45 / 25 %**.

### Interface

Français, tactile, 412×915, cibles larges. On tape une carte, puis on choisit Action ou Valeur. Tutoriel interactif, écran des règles, son après le premier geste, bouton muet, sauvegarde automatique, PWA. Graphismes procéduraux (SVG/CSS) : aucun individu réel dessiné.

Crédit : inspiré des mécaniques de *Watergate* (Matthias Cramer, Frosted Games/Capstone) — aucune affiliation.
