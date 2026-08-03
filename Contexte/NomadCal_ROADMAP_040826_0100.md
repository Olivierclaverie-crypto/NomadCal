# ROADMAP — NOMADCAL
*Moteur de PLANIFICATION : la source unique du « quoi, dans quel ordre, en combien de PR ». Organisée en LOTS BATCHÉS selon la doctrine de batch (→ Instructions) : batch autorisé hors zone sacrée, une variable à la fois STRICT près des sacrées. Chaque lot précise son risque, ses briefs, et si un BRAINSTORM est requis avant. L'ordre est une SUGGESTION — le capitaine réarbitre à chaque ouverture de lot. Dernière MAJ : 04-08-26 (lot R1 CLOS → 2 lots neufs : T audit temporel, E EventForm).*

---

## 🧭 VUE D'ENSEMBLE (ordre suggéré)
**~~R1~~ CLOS → T → E → R2 → R3 → R4**, avec **R5 et H en fillers** (carburant bas : c'est de la parole/des données, pas du code), **K juste avant Neon**, puis **pivot Neon → phase DESK**.
Arbitrage ouvert : **T (audit temporel) peut passer avant tout le reste** — il ferme une classe de bugs qui a coûté des semaines. **E (EventForm date de fin) peut fusionner avec R2**, qui touche déjà EventForm.

| Lot | Contenu | Zone sacrée ? | Briefs | Brainstorm avant ? |
|---|---|---|---|---|
| ~~N~~ | ~~Nettoyage manuel~~ | — | — | **CLOS 03-08** |
| ~~R1~~ | ~~Batch affichage (3 défauts)~~ | Non | — | **CLOS 04-08 (4 PR)** |
| **T** | **Audit temporel 360° (dates/heures/fuseaux/DST)** | À déterminer | INVESTIGUER large → CONSEILLER → EXÉCUTER batché | **Oui** (cadrage périmètre) |
| **E** | **EventForm : date de fin en mode horaire** | Non (`pushEvent` = relais fidèle) | INVESTIGUER→CONSEILLER puis EXÉCUTER | **Oui** (design UI, cf. brainstorm EventForm) |
| **R2** | Compositeur récurrence A2→A4 + COUNT | Non (`pushEvent` intacte) | CERTIFIER→PROPOSER puis EXÉCUTER (1–2 PR) | **Oui, court** (design UI) |
| **R3** | Sélecteur d'étendue + delete occurrence (EXDATE) | **OUI** | Protocole complet, PR isolée, JAMAIS batché | **Oui** (cadrage carburant) |
| **R4** | Fonction rapport NomadBook | Non (nouveau module) | INVESTIGUER→CONSEILLER puis EXÉCUTER par tranches | **Oui** (choix techniques) |
| **R5** | Modèle de données pré-Neon (intègre NUCLI) | Non (papier) | Aucun (brainstorm pur) | **C'EST** un brainstorm |
| **H** | Chantier données hub (vcf, Cowork→NUCLI, audit) | Non (zéro code NomadCal) | Audit timonier lecture seule | Non (cadré 29-07, note Boucle) |
| **K** | NUCLI dans EventForm | À déterminer (X-prop ICS ?) | INVESTIGUER puis EXÉCUTER | Non (INVESTIGUER tranche) |

## 📅 JALONS (recalés 04-08-26)
- **J1 — CONSOMMÉ (03/04-08)** : lot **N** + déménagement doc + **lot R1 entier** (4 PR en prod). *Le rapport manuel #2, initialement prévu ici, est REPORTÉ.*
- **J2 — Congés (longues sessions)** : **T** (audit temporel) → **E + R2** (EventForm, éventuellement fusionnés) · **R5 + H en fillers** (soirs carburant bas) · **R3** si carburant devant soi. **Brainstorms méthode et EventForm à ouvrir ici.**
- **J3 — Fin août/septembre** : **rapport manuel #2 le 07/09** (fin des congés 01/09 — une ou deux notes de plus, période plus représentative ; = certification-terrain R4) · lot **K** (NUCLI, dernier geste pré-pivot) → **NEON** (le pivot — R5 l'aura préparé).
- **J4 — Automne (post-Neon)** : phase **DESK** (D2→D3→D4) · pont automatique Tableau de bord ↔ NomadCal (étage 3 de la Boucle).
- **DÉCISION GRAVÉE : desk = POST-Neon.** Seul étage anticipable : **ETag/If-Match**.

---

## ~~LOT N — NETTOYAGE~~ ✅ CLOS 03-08-26
*Notes de test supprimées, events de test + γ dans `ZZ-TEST-REC`, EYROLLES traité. Zéro code. → JOURNAL.*

## ~~LOT R1 — BATCH AFFICHAGE~~ ✅ CLOS 04-08-26 (4 PR)
*Le batch « 3 défauts en 1 PR » a éclaté en 4 PR et débusqué une cause racine. Récit complet → JOURNAL.*
- **Item 2** (doublon transitoire) → **#41**. Cause = clé de déduplication mal formée, PAS un « refresh manquant » (le diagnostic de cette Roadmap était FAUX, corrigé ici).
- **Item 3** (bande all-day sur 2 jours) → **#43**. 3 sites + prédicat partagé + repli. Cas **nominal**, pas limite : toute période NomadBook est all-day mono-jour.
- **Item 1** (event à cheval sur minuit) → **#44 (cause racine fuseau) + #45 (segments jour)**. Voir lot T ci-dessous : la cause n'était pas au rendu.
- **Découverte adjacente** → lot **E** ci-dessous.

---

## LOT T — AUDIT TEMPOREL 360° (NOUVEAU — décision capitaine 04-08-26)
*Déclencheur : le bug C n'était PAS un défaut de rendu mais une **conversion UTC appliquée à des dates construites en local** (`caldav.js:347` + `:364`, corrigé au #44). La règle « jamais `.toISOString().slice(0,10)` » était écrite au Journal DEPUIS LE DÉBUT et n'avait jamais été appliquée à `expandRecurring`. **Une règle écrite n'est pas une règle appliquée.***

**Le mal :** cette famille de défaut a été corrigée **au coup par coup** (UNTIL, EXDATE, `expandRecurring`…) sans jamais être **balayée**. Chaque résurgence coûte des heures de diagnostic parce que le symptôme est illisible.

**⚠️ Deux pièges à ne pas oublier dans l'audit :**
1. **Le défaut est SAISONNIER.** Fenêtre de bascule : **00h–02h en CEST (été), 00h–01h en CET (hiver)**. Un cas rejoué en janvier peut ne rien reproduire. → **auditer le CODE, pas l'écran.**
2. **Deux `toISO` HOMONYMES.** `helpers.js:13-18` = **local, correct** (celui qu'importe `App.jsx`) · `caldav.js:211-214` = **UTC**, privé au module. Ne pas les confondre en lisant un appel.

**Périmètre : TOUS les fichiers, TOUS les dossiers.** Tout ce qui touche de près ou de loin aux dates, heures, fuseaux, DST, comparaisons de dates, formats ISO, `Date`, `getTime`, `toISOString`, `toTimeString`, `TZID`.

**Chaîne :** INVESTIGUER large (inventaire exhaustif : `file:line` → convention utilisée → UTC voulu ou fautif) → **CONSEILLER** (regroupement par famille, ordre, risque) → décision capitaine → **EXÉCUTER batché par famille** (hors zone sacrée) ou PR isolée (si sacrée touchée).

**Déjà connu, à intégrer sans re-chercher :**
- `caldav.js:294` (`curISO`, borne de sortie de boucle) : **fautif mais inoffensif** (décalage d'un jour sur un horizon d'un an). Listé au #44, **non touché**, il attend ici.
- Dette historique « deux `toISO` divergents » (11-07) : **partiellement soldée** par #44 (`:347`, `:364`). Le reste vit dans ce lot.
- `helpers.js:19` (`todayISO`) et `:34` (`getWeekDays`) : **corrects**, construction locale.

**Sortie attendue :** un inventaire + une **règle unique** portée aux INSTRUCTIONS (déjà rédigée, § DOCTRINE TEMPORELLE) pour que la classe ne renaisse pas.

## LOT E — EVENTFORM : DATE DE FIN EN MODE HORAIRE (NOUVEAU — découverte 03-08-26)
*Découvert en instruisant R1. **PROUVÉ au code ET à l'écran** : NomadCal ne peut pas CRÉER un event qui déborde sur minuit.*
- **Le défaut** : `EventForm.jsx:236` **recolle activement** `endDate` sur `startDate` à chaque changement de date, et **aucun champ de date de fin n'existe en mode horaire** (le champ « Au », `:270-274`, est réservé à la branche all-day). 3 points d'entrée convergent : `EventForm.jsx:73`, `App.jsx:630`, `App.jsx:502`.
- **Conséquence** : les fixes de rendu #44/#45 servent aujourd'hui les seuls events venus d'Apple. Le capitaine ne peut toujours pas saisir un RV qui déborde depuis NomadCal.
- **Zone sacrée : NON.** `pushEvent.js:17` n'est qu'un **relais fidèle** (`DTEND;TZID=…:${fmt(ev.endDate||ev.startDate)}T${endTime}`) — rien à corriger dedans.
- **⚠️ Fusion probable avec R2** : les deux touchent EventForm. Trois chantiers convergent sur ce fichier — **E** (date de fin), **R2** (compositeur récurrence), **K** (NUCLI). Trois passages = trois fois le risque de régression.
- **→ BRAINSTORM EVENTFORM (demandé par le capitaine 04-08)** : concevoir la cible UNE fois, en tenant compte des perspectives NomadSuite, puis **livrer en tranches**. ⚠️ Le mot « refonte » est à manier avec prudence : Neon arrive fin août, doctrine « minimum de code V1 ».

## LOT R2 — COMPOSITEUR RÉCURRENCE (objectif FERME sortie publique)
*A1 (intervalle libre) déjà en prod (#37). Restent : **A2** multi-jours hebdo · **A3** positionnel mensuel · **A4** jours du mois par numéro · **COUNT**. Modèle = compositeur Apple 2 étages.*
- **Batchable** : tout vit dans `composeRRule` / `parseRRuleToUI` / UI EventForm — `rrule` reste une string, `pushEvent` inchangée (prouvé au #37). Cible : **1–2 PR**.
- **Brainstorm AVANT (court)** : design UI du compositeur 2 étages (quels étages, quelles roues, comment COUNT cohabite avec UNTIL — Apple les rend exclusifs). **À fusionner avec le brainstorm EventForm du lot E.**
- **Rappels format (acquis #37)** : UNTIL = fin de journée locale → UTC + `Z` (`…215959Z`), DST-safe via `getTime()` · `INTERVAL=1` jamais écrit · positionnels déjà LISIBLES, il s'agit de les rendre COMPOSABLES.

## LOT R3 — SÉLECTEUR D'ÉTENDUE + DELETE D'OCCURRENCE (LOURD — zone sacrée)
*Ferme le risque : « supprimer une occurrence efface la série » (href hérité). GROS chantier ÉCRITURE.*
- **Contenu** : sélecteur d'étendue (cette occurrence / à partir de / toute la série) + delete d'occurrence via `EXDATE` + split de série + édition master.
- **Protocole COMPLET** : brainstorm de cadrage → INVESTIGUER → CONSEILLER (EXDATE vs split) → décision capitaine → EXÉCUTER en PR isolée(s), une variable à la fois. **JAMAIS batché.**
- **Rappels** : EXDATE en date LOCALE · mécanique voisine du GET-modify-PUT (#35) · fonction voisine plutôt que branche dans une sacrée · tests dans `ZZ-TEST-REC`, cas créés en Apple natif.
- ⚠️ **Attendre le lot T** : ce lot manipule intensivement des dates. L'ouvrir avant l'audit temporel, c'est bâtir sur la classe de bugs qu'on vient d'identifier.

## LOT R4 — FONCTION RAPPORT NOMADBOOK
*DÉBLOQUÉ depuis le rangement des périodes (19-07). Cycle complet prouvé À LA MAIN (06-07). **Simulation #2 REPORTÉE au 07/09** (congés jusqu'au 01/09) = certification-terrain de ce lot.*

**En une phrase :** fin de période, NomadBook transforme les notes de terrain (texte + photos + dictée) en une **synthèse PDF envoyée au chef puis archivée**. Aujourd'hui simulé main ; à terme un bouton.

**Acquis de cadrage (29-07)** : la date de fin de période (slug `rapport-<fin>.ics`) = identité TECHNIQUE ; le moment de génération = geste LIBRE du capitaine. **Le futur bouton ne sera jamais esclave de la date.**

**Squelette stable (5 rubriques)** : CLIENT · MARCHÉ · CONCURRENCE · ALERTES · OUTILS. Une photo peut s'intégrer dans une rubrique.

**Les 6 specs prouvées :**
1. Les notes portent des **photos** → tirées via `getPhotoURL` (IndexedDB, `photoStore.js`). *Socle existant.*
2. **Format conteneur PDF** (texte + image ensemble). *Prouvé main.*
3. **Archivage 12 mois, accès par lien par user.**
4. **Nommage auto-classant** + **taille photo réglable**.
5. **Purge des notes APRÈS envoi CONFIRMÉ** (jamais avant). Aujourd'hui MANUELLE.
6. **Icône « état vide »** : SVG maison, née sous **charte Orchard**. *Cosmétique — fermé jusqu'à V1.*

- **Brainstorm AVANT** : lib PDF côté client, archivage/lien 12 mois (pré ou post-Neon ?), automatisation de la purge et son garde-fou. Puis INVESTIGUER→CONSEILLER → décision → EXÉCUTER **par tranches**.

## LOT R5 — MODÈLE DE DONNÉES PRÉ-NEON (brainstorm pur, filler)
- Poser sur papier : events, notes, périodes, photos, **NUCLI**, users.
- Ligne produit actée : **les périodes = objets backend NC**, iCloud = fenêtre.
- Trancher (papier) : source maître par champ · format NUCLI (mode texte confirmé côté tableaux ; vérifier Contacts iPhone).
- Alimente : Neon (~fin août) + écran de décision RV + pont Boucle.

## LOT H — CHANTIER DONNÉES HUB (zéro code NomadCal, filler congés)
*Étages 1+2 de la Boucle client (→ note `NomadSuite_NOTE_VISION_BOUCLE_*`).*
- **H1 (Olivier)** : renommage vcf « clients importants » → **« clients »**.
- **H2 (Olivier, Cowork)** : correction MAJ Visites — rapprochement **Nom/Prénom → NUCLI**. LE déverrouillage.
- **H3 (timonier, lecture seule)** : **audit croisé par NUCLI** — Tableau de bord × Tableau visites × vcf clients.
- **Garde-fous** : Tableau visites = IMMUABLE · Nom/Prénom = données de production NomadMail.
- **Ordre interne :** H2 avant H3.

## LOT K — NUCLI DANS EVENTFORM (calé JUSTE AVANT Neon)
- **Contenu** : champ NUCLI dans EventForm, importé du carnet Contacts.
- **Question à trancher par INVESTIGUER** : où vit le NUCLI d'un event ? localStorage seul = perdu au round-trip. Pour survivre : propriété custom dans l'ICS (ex. `X-NOMADCAL-NUCLI`) → territoire de `pushEvent`.
- **Prérequis** : format NUCLI confirmé (lot H) · modèle R5 posé · **et désormais : la cible EventForm arbitrée au brainstorm du lot E.**

---

## 🖥️ PHASE DESK (POST-NEON — décision gravée 29-07-26)
| Étage | Contenu | Dépendance |
|---|---|---|
| **D1** | Données partagées entre appareils | **= Neon** |
| **D2** | **ETag/If-Match** sur les écritures | ⚠️ Territoire `pushEvent` = zone sacrée, PR isolée. **Anticipable avant desk.** |
| **D3** | UI grand écran | Pur rendu, batchable |
| **D4** | Auth multi-device | S'appuie sur Neon |
- **Ordre suggéré : D2 → D3 → D4.**

---

## 📥 FILE D'ATTENTE (non lotis, à raccrocher quand un lot s'ouvre)
- **Dette #41** — `mergeRecurrenceExceptions` utilise `masterUid` dans la clé de masquage : un VEVENT dégénéré (portant à la fois `RRULE` et `RECURRENCE-ID`) serait masqué à tort. **Aucun producteur connu. Non bloquant.**
- **Dette popover cellule vide** — un 3ᵉ `setPopover` (handler de cellule vide, hors du map des events) dont le `ev` ne se résout à aucune liaison locale. **Préexistant**, signalé par le cousin, non touché. À arbitrer.
- **Garde `syncing` mort** — `runSync` (`syncService.js`) teste `if (syncing) return;` mais **aucun** de ses 6 appelants (`App.jsx:247, 252, 488, 802, 871, 920`) ne le passe → réentrance possible. ⚠️ Son correctif **toucherait la frontière sacrée**. Non arbitré, jamais ouvert.
- `caldav.js:294` (`curISO`) — fautif mais inoffensif → **absorbé par le lot T**.
- Défauts synchro de fond : B1/B3/B4/γ.
- Drag & drop · vues jour/mois/année · complétion Settings · cosmétique (FERMÉ jusqu'à V1).
- **Brainstorm MÉTHODE** (demandé 03-08) : fixer le cas de test avant le brief (piste 1, déjà portée aux Instructions) · scripts de test automatisés (piste 2 — réaliste sur la **logique**, pas sur la fenêtre : ni le timonier ni le cousin n'ont accès à iCloud) · audit ciblé (piste 3).

## 🔭 APRÈS V1
- **V2** : frais + géolocalisation.
- **V3** : IA (assistance, complexité invisible). Direction A (consommer) vs B (s'exposer en MCP) non tranchée.
- **NomadSuite** (hub & spokes : NomadCal · NomadGuess · NomadMail autour du hub Excel→Neon, écran de décision RV, NUCLI) → **VISION** (GitHub `Contexte/`) + **note Boucle client**.
