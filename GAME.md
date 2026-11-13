# Dossier BAASS : Duel — comment jouer

Jeu de cartes solo contre une IA, inspiré **uniquement des mécaniques** de *Watergate* (Matthias Cramer, Frosted Games/Capstone) : tire-à-la-corde, cartes jouées pour l’action ou pour la valeur, enchère d’initiative, liaisons d’informateurs. Règles, textes et graphismes originaux. Aucun thème Nixon. Aucune affiliation.

**Note permanente :** le *BAASS Project Management Plan* (2 décembre 2008, contrat HHM402-08-C-0072) est un plan de gestion de recherche, **pas une preuve** de physique nouvelle ni d’engin extraterrestre. L’histoire du jeu est une fiction.

## But (~15 minutes)

- **L’Enquête** (toi) : former **3 liens**. Un lien relie un informateur « AAP Person N » à une piste que tu as **verrouillée à +4**. Chaque informateur et chaque piste ne servent qu’une fois.
- **Le Secret DIA** (IA) : porter le **secret à 6**, **caviarder 3 pistes** (jeton à −4), ou tenir jusqu’à la fin des **8 manches**.

## Plateau

Cinq pistes, cases −4 (Secret) à +4 (Enquête), départ à 0 :

| Piste | Contenu (tel que nommé dans le document) |
| --- | --- |
| Dynamique | Lift, Propulsion, Control |
| Énergie & translation | Power Generation, Spatial/Temporal Translation |
| Structure | Materials, Configuration/Structure, Signature Reduction |
| Humain & armement | Human Interface, Human Effects, Armament, Other |
| Programmes | les 9 projets (Physics, Engagement, Cooperation, Campus, Database, Oral History, Blue Book Materials, Northern Tier, Colares) |

À +4, la piste est tenue ; à −4, elle est caviardée. Un jeton à l’extrémité ne bouge plus.

Informateurs (fiction de jeu ; seules les désignations viennent du document) : AAP Person 4, 7, 5, 8, 57 et 58.

## Manche

1. **Enchère.** Chaque camp joue une carte **pour sa valeur**. La plus haute gagne l’initiative (joue en premier) et un **élan** d’une case. À égalité, on conserve l’initiative (l’Enquête au premier tour).
2. **Deux jeux** chacun, en alternance. Chaque carte se joue pour son **action** ou pour sa **valeur** (répartir autant de cases vers son camp, **au plus 2 par piste**).
3. Chaque camp pioche jusqu’à 5 cartes. Paquet vide : on mélange la défausse.

Main de départ : 5 cartes.

## Cartes

Chaque carte porte une **citation verbatim** du PDF, un numéro de page et un résumé en français. Codes `1843(a)…` et « AAP Person N » inchangés.

- **Paquet Enquête (30)** : 12 domaines techniques, 9 projets, 3 cartes de l’annexe Roswell (citations déjà vérifiées), 6 informateurs.
- **Paquet Secret DIA (18)** : clauses de confidentialité, restrictions, codes 1843, fichiers classifiés — joués comme barres de caviardage, montée du secret ou tirages.

Les effets (tirages, liens, secret) sont des mécaniques de fiction.

## Difficulté

Facile, Normal, Difficile : **mêmes règles**, IA de plus en plus précise. Taux visés pour un joueur heuristique : environ 65 / 45 / 25 %. Résultats obtenus (200 parties, graine 2026) :

- Facile : **61 %**
- Normal : **41,5 %**
- Difficile : **27,5 %**

L’ordre facile > normal > difficile est respecté. Le facile est un peu sous 65 % ; le difficile un peu au-dessus de 25 %.

## Paramètres de test

- `?debug=win` — écran de victoire
- `?debug=lose` — écran de défaite

## Ressources

| Ressource | Source | Note |
| --- | --- | --- |
| Citations | `source/DOW-UAP-D168.pdf` (document public, 49 pages, déc. 2008) | Extraets verbatim. Ne pas modifier le fichier. |
| Mécaniques | Inspirées de *Watergate* (Matthias Cramer, Frosted Games/Capstone) | Aucune affiliation ; pas de texte ni d’illustration repris. |
| Graphismes, sons | CSS, SVG, Web Audio, procéduraux | Originaux. Aucun individu réel dessiné. |
