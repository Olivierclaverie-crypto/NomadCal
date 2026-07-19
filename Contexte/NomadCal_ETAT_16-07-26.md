# ÉTAT DU PROJET NOMADCAL
*Document VIVANT — l'établi : SEULEMENT le chantier actif, les vérifs ouvertes, la reprise. Le déjà-fait scellé vit dans le JOURNAL/ACQUIS. Dernière MAJ : 19/07/2026 (**LOT C MERGÉ #39** — identité des périodes figée, prouvé au brut ; découverte : la bascule venait de `syncNoteCount` à CHAQUE ajout de note ; brut serveur = 10 ressources réelles (5 paires) ; **lots B puis A restent à faire** ; pastille onglet Notes à investiguer).*

---

## 🚧 CHANTIER EN COURS — NOMADBOOK : DÉDOUBLONNER LES PÉRIODES + RATTRAPER LES NOTES

### ✅ LOT C — FIGER L'IDENTITÉ DES PÉRIODES — MERGÉ (#39, 19-07)
*« Arrêter l'hémorragie ». PR isolée, prouvée au brut sur preview AVANT merge.*
- **C1 — `updatePeriodEvent` préserve le vrai UID** (paramètre) au lieu de le dériver du basename du href. `href.split("/").pop().replace(".ics","")` (`caldavCalendar.js:276`) **supprimé**. `syncNoteCount` propage l'UID.
- **C2 — tous les filtres note↔période alignés sur `period.href`** (clé stable, préservée par `:290`) : `NomadBook.jsx` `:469`, `:475`, `:601` (fabrication), `:633`, `:655`, `:789`, `:856`. **7 sites** (les 4 du brief + `:633`/`:655` remontés par le cousin + fabrication `:601`).
- **PR #39** — `+12 / −11`, 2 fichiers (`caldavCalendar.js` + `NomadBook.jsx`). 4 sacrées intactes, `createPeriodEvent` inchangé, zéro écriture/suppression iCloud.
- **PREUVE AU BRUT (preview `9f36424`, ressource `nomadcal-rapport-1782035089446@nomadcal`) :** après ajout d'une note de test → `getetag mrg6ps2h→mrg6ps2i`, `DTSTAMP 20260716→20260719T153852Z` (PUT frais confirmé) **MAIS `UID` INCHANGÉ** (`…1782035089446@nomadcal`, PAS devenu `rapport-2026-09-07`). ✅ **C1 prouvé** : le geste qui faisait basculer l'UID ne le fait plus. Note de test **survit au refresh** → ✅ **C2 prouvé** (figée sur `href`, retrouvée par le filtre).
- **Attendu, pas un échec :** les notes ANCIENNES (ancien `periodId`) restent invisibles → c'est le **LOT B** qui les rattrape. Le compteur `📊 Notes saisies` du bloc est passé 2→1 (les 2 anciennes ne matchent plus `href`, la note neuve = 1) → cohérent avec le fix.

### 🔑 DÉCOUVERTE MAJEURE (résout le mystère du 16/07)
- **La bascule d'UID venait de `syncNoteCount`, à CHAQUE ajout de note** — PAS de l'édition manuelle. `syncNoteCount` (`caldavCalendar.js:405`) appelle `updatePeriodEvent` (`:406`), déclenché à chaque note (`NomadBook.jsx:608`). → écrire une note réécrivait l'UID de sa propre période → détachait les notes précédentes. **La note « marché » du 16/07 n'a pas disparu par une édition fantôme : l'écrire a suffi.** C1 corrige les DEUX chemins (ajout + édition) d'un coup.

### 🩺 CAUSE RACINE (prouvée au code, INVESTIGUER 16/07 + verdicts cousin 19/07)
- Filtre STRICT `note.periodId === currentPeriod.uid` (`:469`) ; note fige la clé à sa création (`:601`) ; `currentPeriod = periods.find(...)` (`:463`) pioche UN jumeau ; `periods` = cache (`:530`) PUIS iCloud (`:557`).
- **DEUX maladies distinctes** (verdict cousin) : (1) **bascule d'UID** — 1 ressource change d'identité (`updatePeriodEvent:276`, code vivant) → réglé par LOT C. (2) **jumeaux** — 2 href réels par période (origine externe/manuelle) → à ranger au LOT A.

### 📡 BRUT SERVEUR — PROUVÉ (PROPFIND nomadcal-oc, 19/07)
- **10 ressources réelles = 5 périodes × 2 (paires).** Thèse **(b) confirmée** (jumeaux réels iCloud) ET **(a) vraie** (bascule d'UID). Les deux cohabitent.
- Paires alignées par **date de fin** (même `endISO` → même slug) :

| Période | Jumeau UID `@nomadcal` (PRODID //NomadCal//FR ou //Apple) | Jumeau slug `rapport-<fin>` (PRODID //Apple) |
|---|---|---|
| Juin–Juil | `…1780419959323` | `rapport-2026-07-06` (12 notes) |
| **Juil–Sept (courante)** | `…1782035089446` (2 notes, //NomadCal//FR) | `rapport-2026-09-07` (7 notes) |
| Sept–Oct | `…1780249100225` | `rapport-2026-10-05` (0) |
| Oct–Nov | `…1780249139816` | `rapport-2026-11-02` (0) |
| Nov–Déc | `…1780334867453` | `rapport-2026-12-07` (0) |

- **Origine des jumeaux = ancienne + manuelle (témoin capitaine).** Doublons vus À PLUSIEURS REPRISES avant l'incident du 16/07. Probablement les allers-retours NC ↔ Apple lors du changement de protocole de création. NON tranché au code — et **pas nécessaire de trancher pour ranger**. L'hypothèse « Apple réécrit l'UID depuis le basename » du timonier = NON prouvée, abandonnée (le PRODID = dernier scribe, pas acte de naissance).
- **« Triplon » = artefact de cache CLIENT.** L'export macOS (`NomadCal_OC.ics`, PRODID //Apple//macOS) montrait **11 VEVENT** dont **3** pour Juil–Sept → mais le PROPFIND serveur n'en montre que **2**. Le 3ᵉ = fantôme de cache Mac (X-WR-ALARMUID empilés, dates identiques). Doctrine 11/07 : l'export client ment, le PROPFIND prime. ⚠️ **Ne JAMAIS compter les jumeaux à supprimer depuis un export client** — uniquement depuis le PROPFIND, href par href.

### 🎯 DÉCISIONS CAPITAINE SCELLÉES (19/07)
1. **Survivant par paire = la ressource slug `rapport-<endISO>.ics`** (clé dérivable, préservée par `:290`).
2. **Clé stable du filtre = `period.href`** (unique, contient déjà l'endISO, anti-collision). `endISO` = plan B si le cousin trouve une raison technique.
3. **3 lots SÉPARÉS, ordre imposé C → B → A** (pas de batch — A irréversible, B doit précéder A).

### 🔭 POINT OUVERT — PASTILLE ONGLET NOTES (pied de page)
- Après le test C1 : la note de test **s'affiche et survit au refresh** ✅ MAIS **pas de pastille** dans l'onglet Notes du pied de page grid.
- ⚠️ **HYPOTHÈSE, non tranchée.** Deux lectures : (1) bénin/transitoire (indicateur branché sur un autre calcul, faussé par l'état hybride ancien+neuf, se résout au LOT B) ; (2) **8ᵉ site de compteur oublié**, resté sur `.uid`. → **micro-INVESTIGUER cousin** : où est calculée la pastille, sur quelle clé, est-elle dans les 7 sites de C2 ?

---

## ➡️ RESTE À FAIRE — CHANTIER PÉRIODES (ordre)
1. **LOT B — migration des notes orphelines.** Ré-étiqueter les notes existantes (ancien `periodId` UID/slug) vers la **clé stable `href` du survivant**, AVANT toute suppression. Réversible (local + backup). → rattrape les 9 notes actuelles (7 slug + 2 UID sur Juil–Sept) + les autres périodes.
2. **LOT A — dédoublonnage iCloud.** Pour chaque paire, supprimer UN jumeau (garder le slug `rapport-<fin>.ics`). **IRRÉVERSIBLE.** ⚠️ Backup FRAIS obligatoire avant (export 6 clés + sauvegarde iCloud). ⚠️ `deletePeriod` (`:655`) efface les notes du tiroir supprimé → B DOIT être fait et vérifié avant A. Identifier le survivant au BRUT (href exact) avant tout DELETE.
3. **Pastille** — micro-INVESTIGUER (ci-dessus), à batcher avec d'autres micro-chantiers NomadBook tant qu'on y est.

---

## 🛟 GARDE-FOUS ACTIFS — NOMADBOOK (jusqu'à fin des lots B+A)
- 🚨 **AUCUNE période supprimée** (ni NC, ni iCal) tant que LOT B n'est pas fait+vérifié. `:655` efface les notes rangées dans la période supprimée. Devant les paires : ne PAS « en virer une » à la main.
- 🚨 **AUCUNE purge de notes. AUCUN rapport généré** (ramasse par période → amputé tant que B pas fait).
- **NomadBook est VERROUILLÉ sur `nomadcal-oc`** (pas de calendrier de test séparé ; NC crée/demande ce cal en attendant Neon). → tout test d'écriture se fait sur une période EXISTANTE (ajout de note), jamais en créant une période dans le vrai calendrier.
- **Filet notes = export natif Settings du 16/07 12:49** + un export FRAIS du 19/07 (6 clés). ⚠️ Ne couvre PAS `nb_periods_cache`. Le backup qui compte pour A = celui pris JUSTE avant A.
- **La note « TEST C1 – à supprimer »** vit dans la période courante (Juil–Sept) → à retirer après validation.

## 🧭 LIGNE PRODUIT — POUR NEON (~fin août)
- **Les périodes NomadBook sont un FEATURE NC, pas un cadeau iCloud** que l'user emporte en désinstallant sans payer (rapport, archivage 12 mois, accès par lien vivent DANS NC). → à l'arrivée de Neon, les périodes deviennent des objets **backend NC** ; iCloud = simple fenêtre d'affichage. Principe directeur d'archi, PAS à coder dans le fix de dédoublonnage (ne pas mélanger les horizons).

---

## 🎯 AUTRES CHANTIERS CALENDRIER (hors périodes)
- **Sélecteur d'étendue + delete d'occurrence** (`EXDATE` / split de série / édition master). Ferme « supprimer une occurrence efface la série » (href hérité). GROS chantier ÉCRITURE — cadrage + brief à faire, avec carburant. Priorité à réarbitrer avec le chantier périodes.
- **Bug C — event à cheval sur minuit** (`App.jsx:643-644`, rendu sans clip). Pur affichage, réversible, aucune sacrée. Petit filler sûr. *(T4 cousin 19/07 : PAS de la même famille que "période all-day 2 jours" — le DTEND exclusif des périodes est le pattern all-day CORRECT, coïncidence de surface.)*

## 🩹 CHANTIERS SÉPARÉS (une variable chacun)
- **Périodes en all-day sur 2 jours** (NomadBook). `DTEND = endISO+1` = pattern all-day standard correct (`buildPeriodICS`) → si défaut d'affichage, c'est au RENDU, pas au format. Distinct du `periodId`.
- **Refresh d'affichage auto après modif** (défaut refresh manuel). Données saines, pur affichage. INVESTIGUER léger.

## 🛟 DISCIPLINE / GARDE-FOUS (calendrier)
- **Bug B ALLÉGÉE (fix #38).** Reste : ne pas supprimer une occurrence isolée d'un récurrent (efface la série) tant que le sélecteur d'étendue n'est pas fait.
- **Fantôme iCal / export client :** cache par-appareil, seul le brut PROPFIND fait foi.
- **iCloud 503 :** observation suspendue. **Cache PWA iOS :** force-refresh Safari avant de soupçonner le code. **Web Inspector :** vérifier titre/URL avant d'inspecter (boussole).

## 🧬 ROADMAP RÉCURRENCE ÉTAGÉE (objectif ferme sortie publique)
A1 intervalle libre ✅. Restent, chacun sa PR : **A2** multi-jours hebdo · **A3** positionnel mensuel · **A4** jours du mois par numéro · **COUNT**. Modèle = compositeur Apple 2 étages.

## 🔭 BUGS RÉCURRENCE
- **A ✅** (exception RFC + offline). **B ✅** (#38). **C — reste** (affichage minuit, filler sûr).

## 📋 RESTE À FAIRE POUR V1 (ordre — à réarbitrer)
1. ~~Couche 2~~ · ~~bug A~~ · ~~récurrence-édition PR1+2~~ · ~~EventForm A1~~ · ~~verdict+fix B~~ · **~~périodes LOT C~~ (#39)** → **FAITS.**
2. **Périodes LOT B** (migration notes) puis **LOT A** (dédoublonnage, backup). + pastille.
3. **Sélecteur d'étendue + delete d'occurrence** (`EXDATE`) — avec carburant.
4. **Bug C** (affichage minuit, filler sûr).
5. Paliers récurrence **A2→A4 + COUNT**.
6. Nettoyage events de test + γ. 7. EYROLLES (23/07, 2 UID). 8. Drag & drop. 9. Vues jour/mois/année. 10. **Fonction rapport NomadBook** *(dépend des lots B+A)*. 11. Settings + cosmétique.

## 📋 ITEMS EN FILE
- Défauts synchro de fond : B1/B3/B4/γ. Défaut « refresh manuel ». Dette « deux `toISO` divergents ».
- **Porté au README quand on codera :** `periodId` filtre `href` + UID préservé (LOT C, #39) ; migration notes (LOT B à venir) ; dédoublonnage périodes (LOT A à venir).
- **🔐 Sécurité :** mot de passe d'app iCloud régénéré + reco faciale (14-07). ✅
- Tests récurrence (QCM 17) après les fix. Cosmétique FERMÉ jusqu'à V1.

## 🟢 REPRENDRE — RITUEL
1. **Carburant session à Claude.** 2. Lire cet État + README.
- **NE RIEN coder/merger sans go explicite d'Olivier.**
- **Briefs provisoires à jeter** (scellés) : INVESTIGUER `periodId` 16/07, INVESTIGUER→CONSEILLER paires 19/07, brief EXÉCUTER lot C. **À GARDER :** rien de provisoire en cours (le prochain sujet = cadrer LOT B).
- **Prochaine séquence cousin (fil neuf) :** (a) micro-INVESTIGUER pastille ; (b) cadrage brief LOT B (migration notes vers `href`) ; puis LOT A avec backup.
