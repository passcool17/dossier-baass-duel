# Dossier BAASS : Duel

Jeu de cartes solo, sur téléphone, où **l’Enquête** affronte le **Secret DIA**. Inspiré **uniquement des mécaniques** de *Watergate* (Matthias Cramer, Frosted Games/Capstone) — aucune affiliation, aucun thème Nixon, aucun texte ni illustration repris.

**Jouer :** [passcool17.github.io/dossier-baass-duel](https://passcool17.github.io/dossier-baass-duel/)

## De quoi il s’agit

Toutes les cartes citent **mot pour mot** le *BAASS Project Management Plan* du 2 décembre 2008 (contrat HHM402-08-C-0072, DIA AAWSAP, 49 pages), avec le numéro de page. Les codes de caviardage (`1843(a)…`) et les mentions « AAP Person N » restent tels quels : on ne devine aucun nom.

**Ceci est un plan de gestion de recherche, pas une preuve** de physique nouvelle ni d’engin extraterrestre. L’histoire du jeu (enchères, liens, secret) est une fiction.

## Jouer

1. Chaque manche, les deux camps **enchérissent** avec une carte, pour sa **valeur**. Le plus haut a l’initiative et un élan.
2. Ensuite, chacun joue **deux cartes**, pour leur **action** ou leur **valeur** (tirer des jetons sur un tire-à-la-corde).
3. **L’Enquête** gagne en formant **3 liens** : un informateur « AAP Person N » relié à une piste **verrouillée à +4**. Pistes et informateurs ne se réutilisent pas.
4. Le **Secret DIA** (IA, trois niveaux) gagne en montant le secret à 6, en caviardant 3 pistes, ou à la fin de 8 manches.

Règles complètes : [GAME.md](GAME.md), [docs/SPEC.md](docs/SPEC.md).

Interface en français, tactile, prévue d’abord pour un écran 412×915. On peut l’ajouter à l’écran d’accueil (PWA). Le son se débloque au premier geste ; un bouton coupe le son.

## Développement

```bash
npm test          # citations vs PDF, règles, sauvegarde, sims
npm run sim       # 200 parties par difficulté
npm run serve     # http://localhost:8896
```

Les tests de citations sont tolérants aux versions de Poppler (comparaison des lettres ; on garde la sortie de `pdftotext` même si le code de retour n’est pas 0).
