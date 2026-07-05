# ÉTAT DU PROJET NOMADCAL
*Document VIVANT — l'établi : SEULEMENT le chantier actif, les vérifs ouvertes, et la reprise. Le déjà-fait scellé vit dans le JOURNAL/ACQUIS. Dernière MAJ : 05/07/2026 (couche 2 lecture mergée ; doc restructurée + méthode de MAJ).*

---

## 🎯 CHANTIER ACTIF — RESTRUCTURATION DE LA DOC (quasi bouclé)
- Découpage à 4 fichiers ✅ : Instructions (permanent) · README (lent) · **État** (établi, court) · **Journal/Acquis** (classeur, neuf).
- **Ventilation TRANCHÉE :** double jeu **connaissance du Projet + repo GitHub `/contexte/`** (dossier à la racine, isolé de `src/`).
- **Méthode MAJ TRANCHÉE :** à l'ÉVÉNEMENT (merge), **seulement les fichiers réellement touchés**, horodatage `JJ-MM-AA` dans le nom, geste apprenti en 3 temps (livraison → download = sauvegarde locale → upload Projet + copier-coller GitHub). Détails gravés dans les Instructions.
- **Reste à faire :** créer le dossier `/contexte/` et y déposer les 4 moteurs horodatés (geste d'Olivier, ou cousin).
- **Différé (autre chantier) :** essaimer les items transposables vers les autres contextes projet (dont remonter « une question à la fois » dans userPreferences).

## ✅ COUCHE 2 LECTURE — SCELLÉE ET MERGÉE EN PROD
- PR-a + PR-b mergées (`349ade1`). Détails complets → JOURNAL/ACQUIS. Test C3 en prod = 25/07 un seul event à 13h.
- **Vérifs restantes (non bloquantes) :**
  1. Non-régression : une série SANS aucune exception s'affiche comme avant (court-circuitée par `return events`, risque faible).
  2. Exception à la MÊME heure : retrait basé sur `RECURRENCE-ID` (pas `DTSTART`) — à sceller proprement.

## 🔭 PROCHAIN GROS CHANTIER — COUCHE 2 ÉCRITURE (RISQUÉE)
- **Prérequis avant de coder :** refaire les sauvegardes · PR isolée · protocole complet (pas d'allègement).
- **Hypothèse forte à clouer :** NC écrit des exceptions malformées (UID suffixé, sans `RECURRENCE-ID`/`EXDATE`) = fabrique à doublons iCloud. À prouver + corriger.

## 📋 RESTE À FAIRE POUR V1 (ordre)
1. ~~Couche 2 LECTURE~~ → **SCELLÉE.**
2. **Couche 2 ÉCRITURE** (voir ci-dessus).
3. **Nettoyage** events de test + **γ** (clearTombstone sur échec, sinon events supprimés réapparaissent).
4. **EYROLLES** (23/07, 2 UID — cas distinct, non couvert par le fix multi-VEVENT-même-UID).
5. Drag & drop (dépend écriture). 6. Vues jour/mois/année. 7. Rapport. 8. Settings + cosmétique.

## 📋 ITEMS EN FILE (pas urgents)
- **PR #31 (α, timeout 20 s, `9b0a126`)** : OUVERTE, en pause volontaire (jamais validée sur un vrai hang).
- Défauts synchro de fond : B1 (erreurs avalées `App.jsx:406`), B3 (garde anti-réentrance morte), B4 (couplage flush→lecture), γ (tombstone).
- **Défaut « refresh manuel »** : la synchro ne se rafraîchit pas seule → autre chantier (proche B1/B3/B4). Noté, pas touché.
- Tests récurrence (QCM 17) : reprendre APRÈS couche 2. Cosmétique = FERMÉ jusqu'à finition V1.

## 🟢 REPRENDRE EN DÉBUT DE SESSION
1. Lire cet État + le README. Consulter le JOURNAL/ACQUIS seulement si besoin.
2. Petites vérifs restantes (non bloquantes) : non-régression série sans exception + exception même heure.
3. Gros chantier possible : **couche 2 ÉCRITURE** (refaire sauvegardes avant, PR isolée, protocole complet).
- **NE RIEN coder/merger/appliquer sans le go explicite d'Olivier.**
