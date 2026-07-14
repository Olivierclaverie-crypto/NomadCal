# ÉTAT DU PROJET NOMADCAL
*Document VIVANT — l'établi : SEULEMENT le chantier actif, les vérifs ouvertes, la reprise. Le déjà-fait scellé vit dans le JOURNAL/ACQUIS. Dernière MAJ : 14/07/2026 (**EVENTFORM MERGÉ** — 3 lots prouvés au brut ; **récurrence-édition OK** (PR 1+2) ; **verdict bug B = LOCAL** ; prochaine étape = **fix B** puis paliers récurrence A2→A4 + bugs C).*

---

## ✅ SCELLÉ CETTE SESSION (14-07) — passera au JOURNAL/ACQUIS
- **Récurrence-édition OK — PR 1 (#35 exception) + PR 2 (#36 enqueue offline) MERGÉES.** Édition d'occurrence (online + offline via `pendingQueue` `op:"exception"`) → 1 href / 2 VEVENT, master RRULE intact, exception `RECURRENCE-ID` locale sans `Z`. Prouvé au brut.
- **EVENTFORM MERGÉ — 3 lots, prouvés au brut.** Fichiers `WheelSelect.jsx` + `EventForm.jsx` + `constants.js`, zéro sacrée, `mergeStrategy` intouché.
  - **LOT 1 — roue des jours adaptative :** `daysInMonth` (28/29/30/31 + **bissextile**), clamp au changement de mois/année. Vérifié : février sans 30/31, bissextile OK. Header non régressé.
  - **LOT 2 — intervalle libre A1 :** `composeRRule({unit,interval,byday,until})`, `rrule` reste string, `pushEvent` intacte. `parseRRuleToUI` ajouté (pré-remplit l'UI à l'édition — non-régression clé). Input `number` pour N (garde-fou N≥1).
  - **LOT 3 — UNTIL DST-safe + nettoyage :** `untilFromLocalDate` (instant absolu, jamais `slice(0,10)`), `INTERVAL=1` jamais écrit.
  - **PREUVE BRUT (série NC « Test rec ») :** `FREQ=WEEKLY;UNTIL=20261015T215959Z;INTERVAL=6;BYDAY=TH` → INTERVAL=6 ✅, BYDAY=TH ✅, UNTIL avec `Z` DST-safe ✅ (15 oct = CEST → 21:59:59 UTC), pas d'INTERVAL=1. Lecture `expandRecurring` gère INTERVAL=6 **sans refresh** (occurrences 16/07, 27/08, 08/10 affichées).

## 🐞 VERDICT BUG B (INVESTIGUÉ 14-07, prouvé code) — **LOCAL, mais piège DELETE réel**
- **Prouvé (code, source en main) :** créer un récurrent dans NC = **UN seul PUT** (`calflow-<ts>.ics` avec RRULE) → iCloud n'a **qu'un href**, aucune fabrique-à-doublons serveur (13-07 confirmait). Le « fantôme » = le master `_pending` **préservé par `mergeEvents`** dans `cf_events` (local), qui coexiste avec l'occurrence n°1 développée.
- **⚠️ Nuance capitale :** ce fantôme *local* porte `href = calflow-<ts>.ics` = la **vraie ressource série** → **le supprimer déclenche un DELETE serveur qui efface la série.** Danger réel, même si le fantôme est local.
- **Route décidée (a) :** EventForm d'abord (fait) → **fix B après, PR séparée.** Fix = **≈ 1 condition** dans `mergeEvents` (ne pas préserver un master `_pending` récurrent quand ses occurrences `${id}_*` sont déjà dans `icloudIds`). Léger en code, **zone bug-prone → test rigoureux obligatoire.**
- **Discipline B d'ici le fix :** créer les récurrents **dans Apple natif** · **ne jamais supprimer un doublon de 1ʳᵉ occurrence** (supprimer = la série entière depuis NC).

## 🎯 CHANTIER ACTIF = FIX BUG B (route a, prochaine PR)
Brief EXÉCUTER à rédiger : `mergeStrategy.js`, 1 condition, périmètre étroit, test rigoureux (série NC → plus de doublon de 1ʳᵉ occurrence + piège DELETE désarmé, master + occurrences intacts). Zone sensible → protocole complet (cousin OK go + go Olivier).

## 🩹 CHANTIERS SÉPARÉS (une variable chacun)
- **Sélecteur d'étendue (édition ET suppression : « celui-là / suivants / toute la série »).** N'existe pas dans NC — reconfirmé 14-07 (supprimer un récurrent = toute la série, sans choix). Pas une régression. À traiter (UI). En attendant, « supprimer = série entière » est le geste **sûr** vis-à-vis de B.
- **Refresh d'affichage auto après modif** (défaut refresh manuel). Données saines, pur affichage. INVESTIGUER léger.

## 🧬 ROADMAP RÉCURRENCE ÉTAGÉE (objectif ferme sortie publique)
A1 intervalle libre ✅ (EventForm). Restent, chacun sa PR, avant sortie publique : **A2** multi-jours hebdo (`BYDAY=MO,TH`) · **A3** positionnel mensuel · **A4** jours du mois par numéro · **COUNT** (fin par nombre). Modèle cible = compositeur Apple 2 étages.

## 🔭 BUGS RÉCURRENCE RESTANTS
- **A ✅ corrigé** (exception RFC + offline).
- **B — LOCAL, piège DELETE réel.** = chantier actif (ci-dessus).
- **C — event à cheval sur minuit mal affiché** (`App.jsx:643-644`, rendu sans clip). Pur affichage, réversible, aucune sacrée. Le plus sûr.

## 🛟 GARDE-FOUS
- **B :** ne JAMAIS supprimer un doublon suspect depuis iCal/NC — CE geste efface la série. Supprimer la série entière depuis NC puis recréer si besoin.
- **Fantôme iCal :** cache par-appareil, seul le **brut** fait foi.
- **iCloud 503 :** observation suspendue. **Cache PWA iOS :** force-refresh Safari avant de soupçonner le code.

## 📋 RESTE À FAIRE POUR V1 (ordre)
1. ~~Couche 2~~ · ~~bug A~~ · ~~récurrence-édition PR1+2~~ · ~~EventForm A1~~ · ~~verdict B~~ → **FAITS.**
2. **Fix bug B** (route a, chantier actif).
3. **Bug C** (sûr). 4. **Sélecteur d'étendue** (UI). 5. Paliers récurrence **A2→A4 + COUNT**.
6. Nettoyage events de test + γ. 7. EYROLLES (23/07, 2 UID). 8. Drag & drop. 9. Vues jour/mois/année. 10. Fonction rapport NomadBook. 11. Settings + cosmétique.

## 📋 ITEMS EN FILE
- Défauts synchro de fond : B1/B3/B4/γ. Défaut « refresh manuel ». Dette « deux `toISO` divergents ».
- **À porter au README quand on CODERA les fix :** `mergeEvents` garde le master-local (→ fix B) ; rendu multi-jour sans clip (`App.jsx:643`) ; `op:"exception"` de la file (PR 2) ; `composeRRule` + `untilFromLocalDate` DST-safe (EventForm).
- **🔐 Sécurité (hors code) :** mot de passe d'app iCloud passé en clair le 14-07 → **à régénérer** (appleid.apple.com) puis ressaisir dans NC.
- Tests récurrence (QCM 17) après les fix. Cosmétique FERMÉ jusqu'à V1. Essaimage méthode briefing/deux jauges vers autres projets.

## 🟢 REPRENDRE
1. **Carburant session à Claude.** 2. Lire cet État + README.
3. **Chantier actif = fix bug B** (route a). Rédiger le brief EXÉCUTER (`mergeStrategy`, 1 condition, test rigoureux) → cousin OK go → go Olivier → PR.
- **Atelier de test :** `ZZ-TEST-REC` (`1925D1D3-…`) contient `Test flush`, `Test rec`, etc. avec exceptions — à nettoyer. Cas de test = série **fraîche** (Apple natif pour éviter le fantôme B ; NC quand on teste EventForm/écriture).
- **Briefs provisoires à jeter** (chantiers scellés) : PR 2, EventForm, INVESTIGUER B.
- **NE RIEN coder/merger sans go explicite d'Olivier.**
