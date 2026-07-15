# ÉTAT DU PROJET NOMADCAL
*Document VIVANT — l'établi : SEULEMENT le chantier actif, les vérifs ouvertes, la reprise. Le déjà-fait scellé vit dans le JOURNAL/ACQUIS. Dernière MAJ : 15/07/2026 (**FIX BUG B MERGÉ #38** — fantôme mort, prouvé au brut zéro perte ; A+B corrigés ; prochaine étape = **sélecteur d'étendue** (priorité), puis bug C).*

---

## ✅ SCELLÉ (14→15-07) — passera au JOURNAL/ACQUIS
- **Récurrence-édition OK — PR 1 (#35 exception) + PR 2 (#36 enqueue offline).** Édition d'occurrence online+offline → 1 href / 2 VEVENT, master intact.
- **EVENTFORM MERGÉ (#37) — 3 lots prouvés au brut.** LOT 1 roue des jours adaptative (bissextile, clamp) · LOT 2 intervalle libre A1 `composeRRule` + `parseRRuleToUI` · LOT 3 UNTIL DST-safe + `INTERVAL=1` jamais écrit. Brut : `FREQ=WEEKLY;UNTIL=…215959Z;INTERVAL=6;BYDAY=TH` ✅.
- **FIX BUG B MERGÉ (#38) — fantôme mort.** `mergeStrategy.js` seul (`+7/−1`) : `roundTrippedMasters` (Set des `masterUid` iCloud) + condition `!(e.rrule && roundTrippedMasters.has(e.id))` sur la branche `_pending`. Ne préserve plus le master pur récurrent **une fois round-trippé** → plus de doublon de 1ʳᵉ occurrence, piège du fantôme désarmé. Zéro sacrée, zéro DELETE ajouté, non-récurrent inchangé.
  - **PROUVÉ AU BRUT — 4 scénarios, zéro perte :** A (online → série entière, pas de doublon) · **B critique** (offline → master `_pending` préservé, rien ne s'évapore ; occurrences développées seulement au sync = normal) · C (non-récurrent inchangé) · D (plus de fantôme). Brut = 2 hrefs propres, 1 VEVENT chacun, RRULE intacte. iCloud conforme sur iCal.

## ⚠️ CE QUE LE FIX B NE COUVRE PAS (acté, sujet distinct)
Le fix retire le **fantôme**. **Mais supprimer une occurrence *normale* efface encore la série** (toutes héritent `href = calflow-<ts>.ics`). C'est la **suppression d'occurrence** → traité par le chantier actif ci-dessous.

## 🎯 CHANTIER ACTIF = SÉLECTEUR D'ÉTENDUE (priorité — décidée 15-07)
Ordre **décidé** (priorité produit) : **sélecteur d'étendue + delete d'occurrence** → puis **bug C** (filler sûr) → puis paliers récurrence. Motif : le sélecteur ferme le DERNIER danger suppression **et** lève une discipline qui pèse sur l'utilisateur (README) ; C n'est que cosmétique.
- **Sélecteur d'étendue (édition ET suppression : « celui-là / suivants / toute la série ») + delete d'occurrence.** GROS chantier, touche l'**ÉCRITURE** : delete d'une occurrence = `EXDATE` (ou exception `CANCELLED`) ; « les suivants » = **split de série** (`UNTIL` sur l'ancien master + nouvelle série) ; « tous » = édition master. Ferme le piège « supprimer une occurrence efface la série ». **Cadrage + brief à faire, à ouvrir AVEC carburant** (pas un chantier basse-jauge).
- **Bug C — event à cheval sur minuit** (`App.jsx:643-644`, rendu sans clip → recolle `startTime` sur J+1). Pur affichage, réversible, aucune sacrée. **Petit filler sûr, pas un prérequis.**

## 🩹 CHANTIERS SÉPARÉS (une variable chacun)
- **Refresh d'affichage auto après modif** (défaut refresh manuel). Données saines, pur affichage. INVESTIGUER léger.

## 🛟 DISCIPLINE / GARDE-FOUS
- **Bug B : ALLÉGÉE (fix #38).** Le fantôme n'existe plus. **Reste :** ne pas supprimer une **occurrence isolée** d'un récurrent (efface la série via href hérité) tant que le chantier sélecteur d'étendue / delete-occurrence n'est pas fait. Si besoin : supprimer la série entière depuis NC + recréer.
- **Fantôme iCal :** cache par-appareil, seul le **brut** fait foi.
- **iCloud 503 :** observation suspendue. **Cache PWA iOS :** force-refresh Safari avant de soupçonner le code.

## 🧬 ROADMAP RÉCURRENCE ÉTAGÉE (objectif ferme sortie publique)
A1 intervalle libre ✅ (EventForm). Restent, chacun sa PR, avant sortie publique : **A2** multi-jours hebdo (`BYDAY=MO,TH`) · **A3** positionnel mensuel · **A4** jours du mois par numéro · **COUNT** (fin par nombre). Modèle cible = compositeur Apple 2 étages.

## 🔭 BUGS RÉCURRENCE
- **A ✅ corrigé** (exception RFC + offline). **B ✅ corrigé** (#38, fantôme mort). **C — reste** (affichage minuit, filler sûr).

## 📋 RESTE À FAIRE POUR V1 (ordre)
1. ~~Couche 2~~ · ~~bug A~~ · ~~récurrence-édition PR1+2~~ · ~~EventForm A1~~ · ~~verdict + fix B~~ → **FAITS.**
2. **Sélecteur d'étendue + delete d'occurrence** (`EXDATE`) — chantier actif, à ouvrir avec carburant.
3. **Bug C** (affichage minuit, filler sûr).
4. Paliers récurrence **A2→A4 + COUNT**.
5. Nettoyage events de test + γ. 6. EYROLLES (23/07, 2 UID). 7. Drag & drop. 8. Vues jour/mois/année. 9. Fonction rapport NomadBook. 10. Settings + cosmétique.

## 📋 ITEMS EN FILE
- Défauts synchro de fond : B1/B3/B4/γ. Défaut « refresh manuel ». Dette « deux `toISO` divergents ».
- **À porter au README quand on CODERA les fix :** rendu multi-jour sans clip (`App.jsx:643` → bug C) ; `op:"exception"` de la file (PR 2) ; `composeRRule` + `untilFromLocalDate` DST-safe (EventForm) ; **`mergeEvents` ne préserve plus le master `_pending` récurrent round-trippé (#38)**.
- **🔐 Sécurité :** mot de passe d'app iCloud régénéré + sécurisé (reco faciale) le 14-07. ✅
- Tests récurrence (QCM 17) après les fix. Cosmétique FERMÉ jusqu'à V1. Essaimage méthode briefing/deux jauges vers autres projets.

## 🟢 REPRENDRE
1. **Carburant session à Claude.** 2. Lire cet État + README.
3. **Chantier actif = sélecteur d'étendue + delete d'occurrence** (priorité, GROS chantier écriture — `EXDATE`, split de série, édition master). **À ouvrir avec du carburant** : cadrage d'abord, puis brief EXÉCUTER → cousin OK go → go Olivier → PR. *(Bug C = petit filler sûr si fenêtre basse-jauge.)*
- **Atelier de test :** `ZZ-TEST-REC` (`1925D1D3-…`) contient `Test flush`, `Test rec`, `Test RC`, `Test`, etc. — **à nettoyer** (supprimer les séries entières depuis NC).
- **Briefs provisoires à jeter** (chantiers scellés) : PR 2, EventForm, INVESTIGUER B, **fix B**.
- **NE RIEN coder/merger sans go explicite d'Olivier.**
