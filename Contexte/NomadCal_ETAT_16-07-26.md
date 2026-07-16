# ÉTAT DU PROJET NOMADCAL
*Document VIVANT — l'établi : SEULEMENT le chantier actif, les vérifs ouvertes, la reprise. Le déjà-fait scellé vit dans le JOURNAL/ACQUIS. Dernière MAJ : 16/07/2026 (**ALERTE NOMADBOOK — notes invisibles : ZÉRO PERTE prouvée**, cause racine `periodId` trouvée au code, terrain rouvre une 2ᵉ piste → investigation à finir en DESK. Garde-fous périodes ACTIFS.).*

---

## 🚨 CHANTIER OUVERT 16-07 — NOMADBOOK : NOTES INVISIBLES (`periodId`)
*Alerte terrain (iPhone solo, 100 % carburant). Aucune écriture décidée. Rien de mergé.*

### ✅ VERDICT QUI COMPTE : ZÉRO PERTE (PROUVÉ)
- **Brut de substitution = export natif Settings du 16/07 12:49** (pas de Web Inspector sur iPhone). **10 notes vivantes** en stockage (06/07 → 16/07), texte intact.
- Le piège « sauvegarde basée sur un affichage tronqué » **ne s'est PAS refermé** : la note « marché » écrite APRÈS l'incident n'a rien gravé de mauvais — les 9 autres ont survécu. **NomadBook réécrit le tableau complet, pas le tableau vu à l'écran.**
- **« Rendu ≠ stockage » — démonstration parfaite.** Symptôme = 6 notes disparues de l'affichage ; réalité = pur rangement.
- **Tâches terminées « disparues » = FAUSSE ALERTE** : 7 tâches `done:true` + réglage `showDone:false` → NC obéit. Caché ≠ perdu.

### 🔎 CAUSE RACINE — PROUVÉE AU CODE (rapport cousin, INVESTIGUER lecture seule)
- **Filtre = égalité STRICTE** `note.periodId === currentPeriod.uid` (`NomadBook.jsx:468-469` ; idem compteurs `:475`, `:789`, `:856`). Un `periodId` non identique = note **invisible**.
- **La note FIGE l'étiquette à sa création** : `const periodId = currentPeriod?.uid || "pending"` (`NomadBook.jsx:601-602`). Si le `.uid` change ensuite, la note **ne migre pas**.
- **DEUX producteurs incohérents du `UID` de période :**

| Geste | Ligne | UID écrit dans le VEVENT | Format |
|---|---|---|---|
| **créer** (`createPeriodEvent`) | `caldavCalendar.js:242` | `nomadcal-rapport-<ts>@nomadcal` | UID iCloud |
| **éditer** (`updatePeriodEvent`) | `caldavCalendar.js:276` | `href.split("/").pop().replace(".ics","")` → `rapport-<endISO>` | slug de fichier |

- **`updatePeriodEvent` ne CONSERVE pas l'UID : il le RECALCULE depuis le nom de fichier** → la période **change d'identité**. `getPeriodEvents` relit `UID` du VEVENT (`:373`) → `currentPeriod.uid` bascule → le filtre se réoriente.
- **Métaphore :** on repeint le numéro sur la porte du tiroir sans repasser sur les étiquettes des dossiers. Rien n'est perdu — plus rien ne se retrouve.
- **Verdict cousin = lecture (a)** : UNE période dont l'identité bascule (PAS deux objets distincts). *Le timonier pariait (b) → **s'est trompé**. Le doute était inscrit dans le brief au lieu d'être gravé → leçon du 13/07 resservie.*

### 📦 LA DONNÉE (export 16/07)
- **9 notes dans la période EN COURS** (fin 07/09), coupées en **2 identités** : **7** `rapport-2026-09-07` (slug) + **2** `nomadcal-rapport-1782035089446@nomadcal` (UID).
- **1 note** dans `rapport-2026-07-06` = période **passée**, rangement **légitime** (⚠️ ce n'est PAS un 3ᵉ tiroir parasite — correction d'une erreur du timonier).
- **Pièce à conviction :** note `1783413716041` (07/07 **08:41**) → UID ; note `1783413811016` (07/07 **08:43**) → slug. **2 minutes, 2 identités.**
- **Cohérent au terrain :** à l'incident, **une seule** note portait l'UID (« Journée jeunesse ») → c'est bien elle qui restait affichée. ✅

### ⚠️ CE QUE LA THÈSE (a) N'EXPLIQUE PAS — LE TERRAIN ROUVRE (b)
- **La bascule fait l'ALLER-RETOUR.** (a) prédit un sens unique (UID → slug à l'édition). Or la note « marché » du **16/07** porte… **l'UID**, puis une resync a fait disparaître les 2 notes UID. **Ça rebascule à chaque resync**, pas une fois.
- **Olivier n'a AUCUN souvenir d'édition de période le 07/07 ~08h42** → la thèse (a) perd son déclencheur sur ce cas.
- **DOUBLON DE PÉRIODES OBSERVÉ (terrain) : dans la grille NomadBook ET dans iCal — TRIPLON sur nov–déc.** ⚠️ **HYPOTHÈSE, PAS PREUVE** : iCal ment (doctrine 11/07) et NC affiche son cache avant iCloud → **aucune des deux fenêtres n'est juge**. Seul le brut tranchera.
- **Mécanisme suspecté (hypothèse) :** `const currentPeriod = periods.find(p=>getPeriodStatus(p)==="current") || periods[0]` (`NomadBook.jsx:463`) = **prend le PREMIER qui colle**. Avec des jumeaux dans la liste (un UID, un slug), `currentPeriod` dépend de **qui arrive premier** → **pile ou face à chaque resync**.
- **Deux sources de `periods`, l'une après l'autre :** cache `nb_periods_cache` au démarrage (`:530-532`) **PUIS** iCloud qui écrase (`:557`). Le 07/07 08:41→08:43 = **la fenêtre de resync**, pas une édition.
- **Origine plausible des jumeaux (hypothèse) :** changement de protocole de création des périodes + allers-retours event iCloud ↔ event NC (localStorage).
- **Famille connue :** cache local qui ment contre la vérité serveur (le fantôme iCal, en plus petit) **+** identité qui dérape local ↔ iCloud (cousine de A et B).
- **⚠️ Les périodes ne passent PAS par `mergeStrategy.js`** → le fix B (#38) ne les a jamais protégées. Tuyauterie propre : `caldavCalendar.js` + `nb_periods_cache`.

### ➡️ CONSÉQUENCE SUR LE FIX (acté)
**Réparer `updatePeriodEvent` seul NE GUÉRIT PAS.** Ça empêche de fabriquer de **nouveaux** jumeaux ; ça ne **range pas** ceux qui existent déjà, et ça ne départage pas `.find()`. Un fix qui rassure sans soigner. **Pistes du cousin (non tranchées, aucun brief EXÉCUTER ouvert) :** (1) *source* — `updatePeriodEvent` conserve l'UID existant ; (2) *robustesse* — filtrer sur une clé stable (href / endISO) + **migration** ré-étiquetant les notes orphelines.

---

## 🛟 GARDE-FOUS ACTIFS — NOMADBOOK (à respecter jusqu'au verdict brut)
- 🚨 **AUCUNE période éditée, supprimée ou créée — ni dans NC, ni dans iCal.** `NomadBook.jsx:655` : `setNotes(prev=>prev.filter(n=>n.periodId!==p.uid))` → **supprimer une période EFFACE les notes qui y sont rangées**, sans avertissement. Devant un triplon, le réflexe « j'en vire deux » est **le piège** : chaque jumeau tient une part des notes.
- 🚨 **AUCUNE purge de notes. AUCUN rapport généré.** La fonction rapport ramasse par période → rapport **amputé** ; + purge = **la perte réelle** (celle évitée le 16/07).
- **Filet = export natif du 16/07 12:49** (à conserver). ⚠️ Il couvre les **notes**, **PAS** `nb_periods_cache`.
- Éditer une période **reste** un déclencheur prouvé de bascule d'identité, même si ce n'est pas le seul.

---

## ✅ SCELLÉ (14→15-07) — passera au JOURNAL/ACQUIS
- **Récurrence-édition OK — PR 1 (#35 exception) + PR 2 (#36 enqueue offline).** Édition d'occurrence online+offline → 1 href / 2 VEVENT, master intact.
- **EVENTFORM MERGÉ (#37) — 3 lots prouvés au brut.** LOT 1 roue des jours adaptative (bissextile, clamp) · LOT 2 intervalle libre A1 `composeRRule` + `parseRRuleToUI` · LOT 3 UNTIL DST-safe + `INTERVAL=1` jamais écrit. Brut : `FREQ=WEEKLY;UNTIL=…215959Z;INTERVAL=6;BYDAY=TH` ✅.
- **FIX BUG B MERGÉ (#38) — fantôme mort.** `mergeStrategy.js` seul (`+7/−1`) : `roundTrippedMasters` (Set des `masterUid` iCloud) + condition `!(e.rrule && roundTrippedMasters.has(e.id))` sur la branche `_pending`. Zéro sacrée, zéro DELETE ajouté, non-récurrent inchangé. **PROUVÉ AU BRUT — 4 scénarios, zéro perte.**

## ⚠️ CE QUE LE FIX B NE COUVRE PAS (acté, sujet distinct)
Le fix retire le **fantôme**. **Mais supprimer une occurrence *normale* efface encore la série** (toutes héritent `href = calflow-<ts>.ics`). → chantier sélecteur d'étendue.

## 🎯 DEUX CHANTIERS OUVERTS — **PRIORITÉ À TRANCHER (capitaine)**
1. **NomadBook `periodId`** (ci-dessus). Investigation à finir **en DESK**. Impact : notes invisibles + fonction rapport bloquée.
2. **Sélecteur d'étendue + delete d'occurrence** (priorité décidée le 15-07, **avant l'alerte**). « celui-là / suivants / toute la série » : `EXDATE` (ou exception `CANCELLED`), **split de série** (`UNTIL` + nouvelle série), édition master. Ferme le piège « supprimer une occurrence efface la série ». **GROS chantier ÉCRITURE — à ouvrir AVEC carburant.** Cadrage + brief à faire.
- **Bug C — event à cheval sur minuit** (`App.jsx:643-644`, rendu sans clip). Pur affichage, réversible, aucune sacrée. **Petit filler sûr**, pas un prérequis.

## 🩹 CHANTIERS SÉPARÉS (une variable chacun)
- **Périodes en all-day sur 2 jours** (NomadBook). Défaut d'affichage. **Piste NON prouvée :** `DTEND` exclusif. Distinct du `periodId` — ne pas mélanger.
- **Refresh d'affichage auto après modif** (défaut refresh manuel). Données saines, pur affichage. INVESTIGUER léger.

## 🛟 DISCIPLINE / GARDE-FOUS (calendrier)
- **Bug B : ALLÉGÉE (fix #38).** Le fantôme n'existe plus. **Reste :** ne pas supprimer une **occurrence isolée** d'un récurrent (efface la série via href hérité) tant que le sélecteur d'étendue n'est pas fait. Si besoin : supprimer la série entière depuis NC + recréer.
- **Fantôme iCal :** cache par-appareil, seul le **brut** fait foi.
- **iCloud 503 :** observation suspendue. **Cache PWA iOS :** force-refresh Safari avant de soupçonner le code.

## 🧬 ROADMAP RÉCURRENCE ÉTAGÉE (objectif ferme sortie publique)
A1 intervalle libre ✅ (EventForm). Restent, chacun sa PR, avant sortie publique : **A2** multi-jours hebdo (`BYDAY=MO,TH`) · **A3** positionnel mensuel · **A4** jours du mois par numéro · **COUNT** (fin par nombre). Modèle cible = compositeur Apple 2 étages.

## 🔭 BUGS RÉCURRENCE
- **A ✅ corrigé** (exception RFC + offline). **B ✅ corrigé** (#38, fantôme mort). **C — reste** (affichage minuit, filler sûr).

## 📋 RESTE À FAIRE POUR V1 (ordre — à réarbitrer avec le chantier NomadBook)
1. ~~Couche 2~~ · ~~bug A~~ · ~~récurrence-édition PR1+2~~ · ~~EventForm A1~~ · ~~verdict + fix B~~ → **FAITS.**
2. **NomadBook `periodId`** — investigation desk à finir, puis cadrage fix. *(nouveau, 16-07)*
3. **Sélecteur d'étendue + delete d'occurrence** (`EXDATE`) — à ouvrir avec carburant.
4. **Bug C** (affichage minuit, filler sûr).
5. Paliers récurrence **A2→A4 + COUNT**.
6. Nettoyage events de test + γ. 7. EYROLLES (23/07, 2 UID). 8. Drag & drop. 9. Vues jour/mois/année. 10. **Fonction rapport NomadBook** *(dépend du fix `periodId`)*. 11. Settings + cosmétique.

## 📋 ITEMS EN FILE
- Défauts synchro de fond : B1/B3/B4/γ. Défaut « refresh manuel ». Dette « deux `toISO` divergents ».
- **À porter au README quand on CODERA les fix :** rendu multi-jour sans clip (`App.jsx:643` → bug C) ; `op:"exception"` de la file (PR 2) ; `composeRRule` + `untilFromLocalDate` DST-safe (EventForm) ; `mergeEvents` ne préserve plus le master `_pending` récurrent round-trippé (#38) ; **`periodId` : filtre strict `:469` + UID recalculé `caldavCalendar.js:276`**.
- **🔐 Sécurité :** mot de passe d'app iCloud régénéré + sécurisé (reco faciale) le 14-07. ✅
- Tests récurrence (QCM 17) après les fix. Cosmétique FERMÉ jusqu'à V1. Essaimage méthode briefing/deux jauges vers autres projets.

## 🟢 REPRENDRE — POINTS OUVERTS NOMADBOOK (desk)
1. **Brut des périodes** (Web Inspector, PROPFIND) : **combien de ressources réelles** par période ? → tranche **(a) / (b) / les deux**. ⚠️ Un **export ICS depuis iCal = copie du CLIENT** (donc du cache, celui qui a menti le 11/07) → utile, mais **le PROPFIND prime**. Les deux ensemble = idéal.
2. **Q6 et Q7 du brief : JAMAIS RÉPONDUES** par le cousin (contrat de sortie non rempli). **Q6** = la fonction rapport ramasse-t-elle par `periodId` ? **Q7** = les notes invisibles sont-elles **atteignables** par un chemin existant de l'UI ? *(C'étaient les 2 qui servaient le plus vite.)*
3. **Compteurs de notes par carte de période** (`:789`, `:856` = `notes.filter(n=>n.periodId===p.uid).length`). **Lecture gratuite, jouable même sur iPhone** : chaque carte dit combien de notes lui appartiennent → sur le triplon, on VOIT les tiroirs (ex. 7 / 2 / 0).
4. Puis seulement : **cadrage du fix** (source + robustesse + migration), brief EXÉCUTER → cousin OK go → go Olivier → PR.

## 🟢 REPRENDRE — RITUEL
1. **Carburant session à Claude.** 2. Lire cet État + README.
- **Atelier de test :** `ZZ-TEST-REC` (`1925D1D3-…`) contient `Test flush`, `Test rec`, `Test RC`, `Test`, etc. — **à nettoyer** (supprimer les séries entières depuis NC).
- **Briefs provisoires à jeter** (chantiers scellés) : PR 2, EventForm, INVESTIGUER B, fix B. **À GARDER :** rapport INVESTIGUER `periodId` du 16-07 (chantier vivant).
- **NE RIEN coder/merger sans go explicite d'Olivier.**
