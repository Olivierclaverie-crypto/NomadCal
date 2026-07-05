# ÉTAT DU PROJET NOMADCAL
*Document VIVANT — l'établi : SEULEMENT le chantier actif, les vérifs ouvertes, et la reprise. Le déjà-fait scellé vit dans le JOURNAL/ACQUIS. Dernière MAJ : 05/07/2026 (restructuration doc SCELLÉE + déposée sur GitHub ; lignée `main` #31/#32 clouée par le cousin ; α requalifié « live, spéculatif »).*

---

## 🎯 OÙ ON EN EST (charnière)
- **Restructuration doc : SCELLÉE et déposée.** 4 moteurs dans la connaissance du Projet + repo GitHub (dossier `Contexte/` à la racine). Détails → JOURNAL.
- **Pas de gros chantier de code actif :** on est à la charnière entre couche 2 LECTURE (scellée) et couche 2 ÉCRITURE (pas commencée).

## ⚠️ POINTS À TRAITER EN PRIORITÉ (reprise)
1. **Coquille casse :** dossier GitHub = `Contexte` (majuscule), Instructions écrivent `/contexte/` (minuscule). GitHub sensible à la casse → **harmoniser** (décider lequel gagne). ➡️ touche les Instructions (voir « passage Instructions » ci-dessous).
2. **Vérifs mineures lecture (non bloquantes) :**
   - Non-régression : série SANS aucune exception s'affiche comme avant (court-circuit `return events`, risque faible).
   - Exception à la MÊME heure : retrait basé sur `RECURRENCE-ID` (pas `DTSTART`) — à sceller proprement.

## ✅ COUCHE 2 LECTURE — SCELLÉE ET MERGÉE EN PROD
- PR-a (`70e595e`) + PR-b (`349ade1`), **en prod via le merge #31 (`4c2d5cc`)**. Test C3 = 25/07 un seul event à 13h. Détails + lignée complète → JOURNAL.

## 🔭 PROCHAIN GROS CHANTIER — COUCHE 2 ÉCRITURE (RISQUÉE)
- **TOUT PREMIER GESTE, avant le 1er PUT : trancher α (A ou B).** α est **live** (arrivé avec #31), **spéculatif**, **inoffensif en lecture** mais **DANGEREUX en écriture** : il borne TOUS les PUT à 20 s → un PUT réussi côté iCloud mais lent à répondre est cru échoué → ré-émis → **doublon iCloud**. Aggraverait la fabrique à doublons qu'on veut clouer. Reco cousin = **B** (timeout sur lecture seule PROPFIND/REPORT, jamais PUT/DELETE). Décision capitaine, PR isolée. Détail → JOURNAL.
- **Prérequis :** refaire les sauvegardes · PR isolée · protocole complet (pas d'allègement).
- **Hypothèse forte à clouer :** NC écrit des exceptions malformées (UID suffixé, sans `RECURRENCE-ID`/`EXDATE`) = fabrique à doublons iCloud. À prouver + corriger.

## 📋 RESTE À FAIRE POUR V1 (ordre)
1. ~~Couche 2 LECTURE~~ → **SCELLÉE.**
2. **Couche 2 ÉCRITURE** (α d'abord, voir ci-dessus).
3. **Nettoyage** events de test + **γ** (clearTombstone sur échec, sinon events supprimés réapparaissent).
4. **EYROLLES** (23/07, 2 UID — cas distinct, non couvert par le fix multi-VEVENT-même-UID).
5. Drag & drop (dépend écriture). 6. Vues jour/mois/année. 7. Rapport. 8. Settings + cosmétique.

## 📋 ITEMS EN FILE (pas urgents)
- **α (`9b0a126`) : N'EST PLUS « PR #31 en pause »** — il est **live en prod** (voir couche 2 écriture pour la décision A/B).
- Défauts synchro de fond : B1 (erreurs avalées `App.jsx:406`), B3 (garde anti-réentrance morte), B4 (couplage flush→lecture), γ (tombstone).
- **Défaut « refresh manuel »** : la synchro ne se rafraîchit pas seule → autre chantier (proche B1/B3/B4). Noté, pas touché.
- Tests récurrence (QCM 17) : reprendre APRÈS couche 2. Cosmétique = FERMÉ jusqu'à finition V1.
- **Au prochain passage Instructions** (2 modifs groupées) : (a) résoudre la casse `Contexte`/`contexte` ; (b) graver « préciser la jauge de capacité à la reprise ».

## 🟢 REPRENDRE EN DÉBUT DE SESSION
1. **Préciser la jauge de capacité à Claude** (ex. « il reste 37 % »).
2. Lire cet État + le README. Consulter le JOURNAL/ACQUIS seulement si besoin.
3. Traiter les points prioritaires : casse + vérifs mineures lecture.
4. Gros chantier possible : **couche 2 ÉCRITURE** → 1er geste = trancher α (A/B), puis backups frais, PR isolée, protocole complet.
- **NE RIEN coder/merger/appliquer sans le go explicite d'Olivier.**
