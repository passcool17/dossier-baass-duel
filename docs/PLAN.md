# Plan — Dossier BAASS : Duel

1. Spec courte (`docs/SPEC.md`) et réutilisation de l’approche dossier-baass (modules ES, PWA versionnée, sauvegarde, tests Node, workflow Pages, citations vérifiées, test PDF tolérant à Poppler).
2. Copier `source/DOW-UAP-D168.pdf` et `.txt` sans les modifier. Recopier `js/quotes.js`. Reprendre les 24 citations déjà vérifiées ; ajouter informateurs et cartes DIA uniquement avec des passages vérifiés page par page.
3. Moteur pur (`js/engine.js`) : enchère, élan, action/valeur, pistes ±3, liens, secret, fin de partie, sérialisation. IA (`js/ai.js`) à trois niveaux. Simulations (`js/sim.js`) pour ajuster l’équilibre vers 65/45/25.
4. Interface tactile (`js/ui.js`, `style.css`) : accueil, tutoriel, règles, plateau, feuilles de carte, victoire/défaite, verrouillage paysage. Son, sauvegarde, service worker.
5. Tests Node : citations vs PDF, numéros AAP Person présents dans le document, règles, victoire et défaite des deux camps, sauvegarde, sims. Puis QA manuelle en Chrome 412×915 (tactile) sur l’URL publique, captures, comparaison des hachages après déploiement.
6. Dépôt public `passcool17/dossier-baass-duel`, push normal, GitHub Pages par Actions. Ne pas toucher à `dossier-baass` sauf lecture.
