
# ÉTAT DU PROJET NOMADCAL
*Document VIVANT — l'établi : SEULEMENT le chantier actif, les vérifs ouvertes, et la reprise. Le déjà-fait scellé vit dans le JOURNAL/ACQUIS. Dernière MAJ : 12/07/2026 (matin : conformité NC vs Apple observée au brut → NC quasi conforme ; **refonte EventForm CADRÉE** ; brique 2 = UNTIL décidé ; chantier « récurrences avancées » sorti en file).*

---

## 🎯 OÙ ON EN EST (charnière)
- **On est dans la couche 2 ÉCRITURE.** α est neutralisé et en prod (`ac0a025`) — le terrain d'écriture est sain.
- **Bug A : clos côté enquête.** Reproduit en réel + prouvé au brut iCloud (11-07). Écrasement pur de la série, une seule ressource serveur. Le « doublon » iCal = fantôme d'affichage Apple (cache local **par-appareil**, voir Journal). Correctif en réserve (ex-Brief 3), protocole lourd.
- **Chantier actif du 12-07 : refonte EventForm, MAINTENANT CADRÉE.** Observation au brut (3 events récurrents identiques Apple iPhone / Apple Desk / NC, `ZZ-TEST-REC`) → **NC est déjà quasi conforme à Apple**. La « refonte » est donc LÉGÈRE, pas un big-bang. Reste à en faire un brief cousin.

## 🧰 REFONTE EVENTFORM — CADRAGE COMPLET (prêt pour brief EXÉCUTER, go Olivier requis)
*Prérequis de testabilité (sans EventForm aligné Apple, pas de cas de test propres). Observation faite au brut le 12-07, serveur sain.*

**Constat conformité (PROUVÉ au brut) :** sur une récurrence hebdo simple, NC produit un VEVENT sain — `DTSTART;TZID=Europe/Paris` **identique** à Apple, structure OK, monte sans erreur sur iCloud. Écart unique = NC écrit `FREQ=WEEKLY;INTERVAL=1`, Apple écrit `FREQ=WEEKLY` nu (INTERVAL=1 = valeur par défaut → **équivalent RFC 5545**, juste bavard).

**Les 3 briques, décidées :**
1. **Roues (WheelSelect) — existent déjà** (Date jour/mois/année + Début hh/mm + Fin hh/mm). Vrai travail = **fiabiliser la roue des jours** : aujourd'hui `day` = toujours 01→31 → permet « 31 février » → date invalide. À rendre adaptative (28/29/30/31 selon mois + bissextile). **Racine corrigée UNE fois → la roue de fin de récurrence en hérite.**
2. **Fin de récurrence — DÉCIDÉ : `UNTIL` (date de fin), PAS de `COUNT`.** Motif terrain (capitaine) : le rythme réel = « toutes les X semaines le [jour] » + fin pensée en saison commerciale (année/semestre) → **toujours une date**. UI = 2 choix (« aucune fin » / « se termine le [date] », roue de date). **Format cible capturé au brut Apple :** `UNTIL=AAAAMMJJT215959Z` = fin de journée LOCALE convertie en **UTC + suffixe `Z`** (le 21:59:59 = 23:59:59 Paris été → UTC). ⚠️ **Point dur du futur brief :** calcul UTC **DST-safe** obligatoire (`getTime()`, jamais `.toISOString().slice(0,10)` — cf. doctrine Journal), sinon off-by-one près de minuit / changement d'heure.
3. **Nettoyage `INTERVAL=1` — DÉCIDÉ : on nettoie.** NC n'écrira `INTERVAL` que s'il est ≥ 2 (style épuré, aligné Apple).

**Emplacement repéré (timonier, lecture seule) :** le picker de fin va en zone **conditionnelle sous `Répéter`** (visible si `rrule` ≠ « Aucune »), réutilise `WheelSelect` en `['day','month','year']`. EventForm **n'est pas une sacrée** et n'en contient pas → chantier sans risque sur le cœur écriture.

**Séquence à la reprise :** cadrage complet → **brief EXÉCUTER** rédigé par le timonier → « OK go » cousin → **go explicite d'Olivier** → PR isolée + test preview → merge.

## 🧬 CHANTIER EN FILE — RÉCURRENCES AVANCÉES (sorti du lot, brainstorm dédié)
- **Sujet :** la liste `RECURRENCE_OPTIONS` actuelle est **plate** (18 options figées) et **asymétrique** (1er/2e/3e lundi, mais mardi→vendredi s'arrêtent au 2e ; samedi/dimanche absents ; pas de « dernier X »).
- **Modèle observé (captures Apple 12-07) :** Apple ne fait PAS une liste plate mais un **compositeur** à 2 étages — raccourcis (jours/semaines/mois/ans) + « Personnaliser » qui déploie, par fréquence, intervalle + **multi-jours** (L M M J V S D cochables) + positionnel (« le [premier] [jour] ») + jours du mois par numéro. Plus puissant, couvre l'infini sans liste à rallonge.
- **Déclencheur :** surtout si extension clientèle (**professions libérales** → récurrences plus riches). **À traiter en chantier à part**, pas dans la refonte EventForm V1. NON ouvert.

## 🔭 LES 3 BUGS RÉCURRENCE (3 PR séparées, une variable chacune) — après EventForm
Ordre recommandé (à trancher par le capitaine) : **C → B → A**.
- **Bug A — édition d'occurrence écrase la série. ✅ PROUVÉ TERRAIN iCLOUD (11-07).** `pushEvent` PUT sur href/UID du master, RRULE omise → série remplacée par event unique daté. Correctif = exception RFC 5545 (UID master + `RECURRENCE-ID`, pas d'`EXDATE`) = ex-Brief 3, EN RÉSERVE. Touche le corps de `pushEvent` → protocole lourd. Évitable par discipline.
- **Bug B — fantôme à la création (LE PLUS DANGEREUX).** `mergeEvents` (`mergeStrategy.js:14-20`) préserve le master-local `calflow-<ts>` → coexiste avec l'occurrence n°1 → doublon. Le fantôme EST la ressource master → DELETE dessus efface toute la série. Danger PASSIF (frappe à la création + sync, sans action). Prouvé localement ; iCloud non prouvé sans réseau. Zone cœur écriture → protocole maximal.
- **Bug C — event à cheval sur minuit mal affiché.** `App.jsx:643-644` : rendu sans clip par jour → recolle `startTime` (23:00) sur J+1. Pur AFFICHAGE, zéro donnée. Correctif = clip par jour. Le plus sûr (réversible, aucune sacrée).

## 🧩 OPTION « DÉBUT DATÉ + FIN DATÉE » (piste candidate d'Olivier) — PARTIELLE
- Corrige la SAISIE NC d'events à cheval / multi-jours (`endDate` existe déjà, `EventForm.jsx:33` ; `pushEvent` sait sérialiser `endDate||startDate`, `pushEvent.js:16-17`). Aucune sacrée touchée.
- Laisse debout A, B, C (C entre par la LECTURE). À traiter à part. Recoupe partiellement la refonte EventForm.

## 🛟 GARDE-FOUS COMPORTEMENTAUX PROVISOIRES (en attendant les fix)
- **Bug A :** ne pas éditer une occurrence unique (pratique depuis ~3 mois).
- **Bug B :** ne **JAMAIS** supprimer un doublon suspect depuis iCal — c'est CE geste qui efface la série. Si besoin : supprimer la série entière depuis NC puis recréer.
- **Fantôme iCal (11-07) :** après un écrasement, iCal peut afficher une série morte que ni « actualiser » ni OFF/ON du calendrier iCloud ne dissolvent, **et le cache est par-appareil** (purgé sur un device, persiste sur l'autre). **Seul le brut Web Inspector fait foi.** Exception « supprimer depuis iCal » tolérée UNIQUEMENT si le brut a prouvé qu'aucune ressource ne vit derrière (cas 11-07 — voir Journal).
- **Serveur iCloud en 503 / maintenance / verrouillé :** **toute observation suspendue** — ne jamais diagnostiquer conformité / caches / sync dessus (bruts non fiables). Un event créé pendant le 503 peut rester coincé en local, jamais monté sur iCloud → inexploitable.

## 📋 RESTE À FAIRE POUR V1 (ordre)
1. ~~Couche 2 LECTURE~~ · ~~α neutralisé~~ · ~~investigation 3 bugs~~ · ~~bug A confirmé terrain~~ · ~~conformité NC vs Apple observée~~ · ~~cadrage EventForm~~ → **FAITS.**
2. **Refonte EventForm** (cadrée ci-dessus) : brief cousin à rédiger → go Olivier → PR.
3. **Corriger les 3 bugs :** C (sûr) → B (danger max, protocole lourd) → A (écriture RFC = ex-Brief 3).
4. **Nettoyage** events de test + **γ** (clearTombstone sur échec).
5. **EYROLLES** (23/07, 2 UID — cas distinct).
6. Drag & drop (dépend écriture). 7. Vues jour/mois/année. 8. **Récurrences avancées** (chantier en file ci-dessus). 9. Fonction rapport NomadBook (`NomadCal_FONCTION_RAPPORT_06-07-26.md`). 10. Settings + cosmétique.

## 📋 ITEMS EN FILE (pas urgents)
- Défauts synchro de fond : B1 (erreurs avalées `App.jsx:406`), B3 (garde anti-réentrance morte), B4 (couplage flush→lecture), γ (tombstone).
- **Défaut « refresh manuel »** : la synchro d'affichage ne se rafraîchit pas seule.
- **Dette « deux `toISO` divergents »** : `helpers.js:13` (locale) vs `caldav.js:211` (UTC). N'est PAS la cause des 3 bugs, mais `toISO` UTC dans `expandRecurring` (`caldav.js:347`) = off-by-one possible près de minuit → à surveiller. **NB :** recoupe le point dur UNTIL de la brique 2 (même famille de piège UTC/local).
- **À porter au README quand on CODERA les fix** : rendu multi-jour sans clip (`App.jsx:643`) ; `mergeEvents` garde le master-local ; deux `toISO` divergents.
- Tests récurrence (QCM 17) : après les fix. Cosmétique = FERMÉ jusqu'à V1.
- **Essaimage** des items transposables (méthode briefing, deux jauges) vers les autres projets.

## 🟢 REPRENDRE EN DÉBUT DE SESSION
1. **Préciser le carburant session à Claude** (ex. « il reste 58 % »).
2. Lire cet État + le README. Consulter le JOURNAL/ACQUIS seulement si besoin.
3. Chantier actif : **rédiger le brief EXÉCUTER EventForm** (briques décidées ci-dessus) — go explicite d'Olivier requis avant tout code. À défaut, corriger le **bug C** (le plus sûr). Backups + `ZZ-TEST-REC` avant tout PUT.
- **Atelier de test :** `1925D1D3-…` a servi aux 3 events de conformité (12-07). Nettoyage en cours. Cas de test du fix récurrence = série **fraîche** Apple natif, jamais un event déjà écrasé.
- **NE RIEN coder/merger/appliquer sans le go explicite d'Olivier.**
