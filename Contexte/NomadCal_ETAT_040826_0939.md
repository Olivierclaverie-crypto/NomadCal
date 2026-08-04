# ÉTAT DU PROJET NOMADCAL
*Document VIVANT — l'établi : SEULEMENT le chantier actif, les vérifs ouvertes, la reprise. Règle de VIDANGE : chantier scellé → migre au JOURNAL le jour même, l'État ne garde qu'une ligne de renvoi. Cible : ~1 page — **exceptionnellement dépassée** : le rapport d'audit du lot T loge ici le temps du chantier, il migrera au Journal (condensé) au scellement. Dernière MAJ : 04-08-26, HHMM (lot T ouvert, INVESTIGUER scellé).*

---

## 🔨 CHANTIER ACTIF — LOT T : AUDIT TEMPOREL 360° (étape 1/3 faite)
**Chaîne : ~~INVESTIGUER~~ ✅ → CONSEILLER (prochain geste) → décision capitaine → EXÉCUTER.**

- **INVESTIGUER scellé** : rapport rendu par le cousin, audit sur `origin/main @ 14d5918`, lecture seule prouvée (`git status` vide). Condition d'arrêt (~60) jamais approchée.
- **Le décompte : 43 sites — A : 31 · B (fautifs) : 8 · C (douteux) : 2 · CORRIGÉ : 2.**
- **⭐ ZÉRO fautif en zone sacrée** → tout le futur EXÉCUTER est batchable par famille (doctrine de batch).
- **Les 8 fautifs = 2 familles seulement :**
  1. **« Strip du Z » à la lecture ICS** (`caldav.js:168` parseDate · `:152` EXDATE · `:294` curISO borné) — une heure UTC est traitée comme locale. Déclencheur : producteurs non-Apple (invitations Google/Outlook via iCloud). Cas EXDATE = le plus vicieux (occurrence supprimée peut réapparaître).
  2. **Famille 7 : `new Date("YYYY-MM-DD")` = minuit UTC** (5 sites, tous NomadBook/périodes : `NomadBook.jsx:114`, `:110/118`, `:222`, `:108-109` + `App.jsx:771`) — statut de période, compte J-x, date par défaut du formulaire, affichage. Fenêtre 00h–02h CEST, identique à R1.
- **Les 2 douteux :**
  - `pushEvent.js:13-17/125-133` — **fuseau `Europe/Paris` codé en dur** : pas un bug, une **DÉCISION PRODUIT à trancher par le capitaine** (que doit faire l'app si le device est dans un fuseau étranger ?). À inclure au CONSEILLER.
  - `caldav.js:265-272` — UNTIL sans `Z` : cas théorique, aucun producteur connu.
- **3 amendements du cousin acceptés à l'avis** (et ils ont payé) : famille 7 ajoutée · règle de comptage « 1 site = 1 usage logique » · nuance `api/*` (runtime serverless = UTC).

### 📄 RAPPORT D'AUDIT COMPLET (43 sites, preuves, motifs grep rejouables)

# RAPPORT — LOT T : AUDIT TEMPOREL 360°

**43 sites au total — A : 31 · B : 8 · C : 2 · CORRIGÉ : 2**

*Note de grille, actée avant lecture des tableaux : la catégorie A du brief (« UTC voulu et correct ») est lue ici comme « **correct tel quel** » — elle accueille aussi les sites où le **local** est voulu et juste, faute de catégorie dédiée. Chaque preuve dit lequel des deux. Un site = un usage logique (un gabarit ICS = 1 site), règle actée à l'avis.*

---

## B — FAUTIF (8)

| Site | Extrait | Preuve | Sacrée |
|---|---|---|---|
| `src/utils/caldav.js:168` (dans `parseDate`, 165-180) | `.replace(/^[^:]+:/, "").replace(/Z$/, "")` | Le suffixe `Z` d'un DTSTART/DTEND **UTC** est jeté et la valeur est traitée comme heure **murale locale**. Un VEVENT au format `...213000Z` (producteurs non-Apple relayés par iCloud : invitations Google/Outlook) s'affiche décalé de l'offset (2 h en CEST). Le chemin TZID, lui, est correct. | NON |
| `src/utils/caldav.js:152` (EXDATE, 150-158) | `.replace(/TZID=[^:]+:/, "").replace(/Z$/, "")` | Même strip du `Z` : la date extraite d'un EXDATE **UTC** est la date UTC tronquée, comparée en l.351 à `toLocalISO(cand)` (locale). Pour une occurrence 00h-02h locale exclue via EXDATE en `Z`, les jours diffèrent → **exclusion ratée, l'occurrence supprimée réapparaît**. Fenêtre identique à R1. | NON |
| `src/utils/caldav.js:294` | `const curISO = toISO(current);` | Re-classement demandé : **fautif** (date UTC comparée à `rangeEnd` local) mais à effet borné — en fuseau ≥ UTC la date UTC est ≤ la locale, donc la boucle s'arrête au plus une itération trop tard sur un horizon d'un an. Aucun champ de donnée n'en dérive. | NON |
| `src/components/NomadBook.jsx:114` | `now>=new Date(p.startISO)&&now<new Date(p.endISO)` | `getPeriodStatus` : chaîne date-seule parsée **UTC minuit** (spec ECMA) = 02h00 locale en CEST, comparée à `now` local → le statut « current » bascule à 02h00 au lieu de minuit. Fenêtre R1, famille 7. | NON |
| `src/App.jsx:771` | `periods.find(p=>now>=new Date(p.startISO)&&now<new Date(p.endISO))` | Même mélange, dans l'IIFE `noteCount` du pied de page : entre 00h et 02h, le compteur de notes se rattache à la mauvaise période. (Hors `syncCalendar`/`syncCalDAV`, qui vivent aux l.330-409.) | NON |
| `src/components/NomadBook.jsx:110, 118` | `Math.ceil((new Date(d)-new Date())/86400000)` | `daysLeft`/`daysUntilStart` : borne parsée UTC minuit, `now` local → le compte J-x et `urgencyStyle` (« Aujourd'hui » vs « J-1 ») sont décalés dans la fenêtre 00h-02h. | NON |
| `src/components/NomadBook.jsx:222` | `const today = new Date().toISOString().slice(0,10);` | « Aujourd'hui » calculé en **UTC** comme défaut de `startISO` du formulaire période : entre 00h et 02h CEST, le formulaire propose **la veille**. Motif exact de la classe R1, côté formulaire. | NON |
| `src/components/NomadBook.jsx:108-109` | `d => new Date(d).toLocaleDateString("fr-FR",…)` | `fmt`/`fmtYear` sont nourris de dates-seules (`p.startISO`/`endISO`, appels l.137, 175, 685, 826, 937) : parse UTC minuit + affichage local. Correct en fuseau ≥ UTC (Paris), affiche **la veille** sur un appareil à l'ouest d'UTC — plausible pour une app nomade. | NON |

## C — DOUTEUX (2)

| Site | Extrait | Ce qui manque pour trancher |
|---|---|---|
| `src/sync/pushEvent.js:13-17, 125-133` | `DTSTART;TZID=Europe/Paris:${fmt(ev.startDate)}T…` | Syntaxe RFC correcte, mais le fuseau est **codé en dur** : l'heure murale du device est étiquetée `Europe/Paris` quel que soit le fuseau réel de l'appareil. Correct si la doctrine est « l'app vit en heure de Paris » ; faux si le capitaine crée des events avec un device basculé sur un fuseau étranger. **Manque : la décision produit sur le fuseau de référence en déplacement.** (Fichier en zone sacrée — lu seulement.) |
| `src/utils/caldav.js:265-272` | `untilTs = Date.UTC(+u.slice(0,4), …)` | Un `UNTIL` **avec `Z`** (le cas RFC, et ce que produit `EventForm`) est correct. Un `UNTIL` flottant sans `Z` (producteur non conforme) serait lu comme UTC → série arrêtée ~2 h trop tôt ; un `UNTIL` date-seule est complété à 23:59:59**Z**. **Manque : un échantillon réel d'UNTIL non-`Z` dans les calendriers du capitaine** pour dire si le cas existe. |

## A — CORRECT TEL QUEL (31)

| Site | Extrait | Preuve |
|---|---|---|
| `src/components/EventForm.jsx:12-17` | `inst.toISOString().replace(…) // → 20260930T215959Z` | UNTIL exige l'UTC (RFC 5545) : fin de journée **locale** convertie en instant absolu — UTC voulu, DST-safe. |
| `src/components/EventForm.jsx:19-27` | `new Date(Date.UTC(…))` puis extraction locale | Inverse exact du précédent : aller-retour local→Z→local cohérent. UTC voulu. |
| `src/utils/caldav.js:406-419` | `return utc ? Date.UTC(…) : new Date(…).getTime();` | `recurrenceIdToInstant` : branche explicite `Z`/local, matching par **instants** — l'UTC est géré là où il est déclaré. |
| `src/utils/caldav.js:424` | `new Date(\`${e.startDate}T${e.startTime…}\`).getTime()` | `occurrenceInstant` : construction locale, homogène avec `expandRecurring` — local voulu. |
| `src/utils/caldav.js:215-219` | `toLocalISO` | Le helper local de référence de la classe — correct par construction. |
| `src/utils/caldav.js:221` | `d.toTimeString().slice(0,5)` | `toTime` est local — c'est lui qui gardait les **heures** justes pendant le bug R1. |
| `src/utils/caldav.js:283-284, 353` | `new Date(ev.startDate + "T" + …)` · `cand.getTime() + duration` | Bornes construites en local ; `duration` est une durée pure (non suspecte par doctrine du brief). |
| `src/utils/caldav.js:226-245, 335` | `new Date(year, month, day)` | `nthWeekdayOfMonth` + BYMONTHDAY : composants locaux — local voulu. |
| `src/sync/pushEvent.js:32, 139` | `DTSTAMP:${new Date().toISOString()…}Z` | Horodatage RFC : l'UTC est le format exigé. (Zone sacrée — lu seulement.) |
| `src/App.jsx:334-337, 380-383` · `src/utils/caldavCalendar.js:322-327` | `since.toISOString().replace(…)+"Z"` | Bornes `time-range` des REPORT CalDAV : la spec exige l'UTC suffixé `Z`. (Les sites App.jsx sont dans `syncCalendar`/`syncCalDAV` — lus seulement.) |
| `src/utils/caldavCalendar.js:93` | `dtstamp = new Date().toISOString()…+"Z"` | DTSTAMP — UTC voulu. |
| `src/utils/caldavCalendar.js:58-69` | `new Date(iso + "T12:00:00")` · `setDate(+1)` | `toCalDAVDate`/`toCalDAVDateNext` : parse protégé midi + arithmétique locale — local voulu. |
| `src/utils/caldavCalendar.js:76-80` | `new Date(startISO + "T12:00:00")` | `autoLabel` : parse protégé, affichage local. |
| `src/utils/caldavCalendar.js:107-108` | `DTSTART;VALUE=DATE:${dtstart}` | All-day en date-seule : aucun fuseau en jeu, conforme RFC. |
| `src/utils/caldavCalendar.js:370-386` | `dtstart.slice(0,4)+"-"+…` | `parsePeriodEvents` : pur découpage de chaînes, aucun objet Date — insensible au fuseau. |
| `src/utils/helpers.js:13-19` | `d.getFullYear()…` | `toISO`/`todayISO` **locaux** — l'homonyme sain de celui de `caldav.js` (distinction actée aux Instructions). |
| `src/utils/helpers.js:21-36` | `d.setHours(12,0,0,0)` · boucle 7 jours | `getWeekStart`/`getWeekDays` : composants locaux, le pivot midi absorbe la DST. |
| `src/utils/helpers.js:38-51` | `new Date(iso + "T12:00:00").toLocaleDateString(…)` | `fmtDay`/`fmtDayNum`/`fmtMonth`/`fmtWeekRange` : parse protégé — le modèle que la famille 7 devrait suivre partout. |
| `src/utils/helpers.js:77-85` | `if (eff && eff < t)` | `slideTasksToToday` : comparaisons **lexicales** de chaînes ISO sur `todayISO` local — sain. |
| `src/components/EventForm.jsx:9, 317` · `EventPopoverPaste.jsx:16-17` · `Header.jsx:43` | `new Date(iso + "T12:00:00")` | Parses protégés midi — local voulu. |
| `src/App.jsx:125, 434` · `FeedbackButton.jsx:77` · `NomadBook.jsx:602, 614, 994` · `Settings.jsx:90` | `new Date().toISOString()` | Horodatages **absolus** (createdAt/completedAt/date) : ISO complet avec `Z` = instant, pas date calendaire — UTC voulu. |
| `src/App.jsx:301` · `NomadBook.jsx:409, 917` · `Settings.jsx:102` | `new Date(x.createdAt).toLocaleDateString(…)` | Relecture de ces horodatages **complets** : parse d'instant + affichage local — correct (à distinguer de B `fmt`/`fmtYear`, nourris de dates-seules). |
| `src/components/NomadBook.jsx:478` | `sort((a,b)=>new Date(a.startISO)-new Date(b.startISO))` | Parse UTC **homogène des deux côtés** : l'offset s'annule, l'ordre est préservé — correct (fragile, mais juste). |
| `api/feedback.js:19` | `toLocaleString("fr-FR",{timeZone:"Europe/Paris"})` | Fuseau **explicite** sur runtime serverless UTC — exactement le bon pattern pour `api/*` (nuance actée à l'avis). |
| `src/App.jsx:82-85` | `d.setHours(0,0,0,0)` · `/86400000` | `getWeekNum` : composants locaux ; le `Math.round` absorbe l'heure de décalage DST. |
| `src/App.jsx:216-217` | `midnight.setHours(24,0,0,0)` | Timer de bascule de minuit — minuit **local**, voulu. |
| `src/App.jsx:223-225` | `toISO(in48h)` | Fenêtre 48 h : `toISO` est celui de `helpers` (local) — correct. |
| `src/App.jsx:289-295` | `today17.setHours(17,0,0,0)` | Seuil 17 h local comparé en instants — correct. |
| `src/App.jsx:434-436` | `toISO(new Date())` · `toLocaleTimeString("fr-FR",…)` | `completedDate`/`completedTime` locaux — correct. |
| `src/components/WheelSelect.jsx:17` | `new Date(+y, +m, 0).getDate()` | Jours dans le mois par composants locaux — correct. |
| `src/App.jsx:473-477, 590` · `NomadBook.jsx:622` | `d >= e.startDate && …` | Comparaisons lexicales de chaînes ISO (bande all-day, filtre jour, chevauchement de périodes) — le bon pattern, validé par R1. |

## CORRIGÉ (2)

| Site | Extrait | Statut |
|---|---|---|
| `src/utils/caldav.js:347` | `const candISO = toLocalISO(cand);` | Corrigé en #44 — référence de la classe (date de début d'occurrence). |
| `src/utils/caldav.js:364` | `endDate: toLocalISO(occEnd),` | Corrigé en #44 — référence de la classe (date de fin d'occurrence). |

---

## Motifs exécutés (exhaustivité rejouable)

Tous sur `git grep -nE <motif> origin/main -- src api public` (+ `*.js` racine ; `Contexte/*.md` hors périmètre code) :

1. `\.toISOString\(|\.toLocaleDateString|\.toDateString\(`
2. `toUTCString|toGMTString` → 0 · `getUTC[A-Z]` → 0 · `Date\.UTC`
3. `\.getTime\(|Date\.parse` (`Date.parse` → 0)
4. `toTimeString|toLocaleTimeString|setU?T?C?Hours` (`setUTCHours` → 0)
5. `TZID|timeZone|Intl\.DateTimeFormat|getTimezoneOffset|\bDST\b` (insensible à la casse ; `getTimezoneOffset` → 0)
6. `DTSTART|DTEND|UNTIL|EXDATE|RECURRENCE-ID`
7. *(famille 7, amendement accepté)* `new Date\(` avec tri manuel des arguments chaîne — plus contrôles ciblés `new Date\([^)]*\+ *"T` (13 sites protégés) et lecture en contexte de chaque hit non protégé.

Lectures en contexte : `caldav.js` (get/parseDate/EXDATE/expandRecurring/instants), `EventForm.jsx:9-45`, `NomadBook.jsx:105-118, 218-228` + appels de `fmt`, `App.jsx:214-230, 289-302`, `helpers.js` intégral, `pushEvent.js`, `caldavCalendar.js`, `api/*`, `public/sw.js` (aucun site), `vite.config.js` (aucun site).

**Constats saillants, sans recommandation** (l'interprétation revient au brief CONSEILLER) : les 8 B se répartissent en deux familles — le **strip du `Z`** à la lecture ICS (`parseDate`/EXDATE, nouvelle découverte, déclencheur = producteurs non-Apple) et la **famille 7** (`new Date` sur date-seule, 5 sites, tous côté NomadBook/périodes, fenêtre 00h-02h identique à R1). Aucun site B en zone sacrée. Condition d'arrêt non atteinte (43 sites logiques < 60), aucun doute bloquant de classement.

`CODE ÉCRIT : NON` · aucune branche, aucun commit, working tree propre (`git status` vide).

**Audit effectué sur `origin/main @ 14d5918`.**

## ▶️ PROCHAIN GESTE — BRIEF CONSEILLER (lot T, étape 2/3)
Le timonier rédige le CONSEILLER à partir du rapport ci-dessus. Attendu :
- **Regroupement par famille** (les 2 familles B + le sort des 2 C), **ordre**, **risque**, **découpage en PR batchées**.
- **Inclure la question produit du fuseau de référence** (`Europe/Paris` en dur) pour décision capitaine éclairée.
- Rappel doctrine : CONSEILLER = options × coûts + reco, **aucune action** ; JAMAIS fusionné avec EXÉCUTER (la décision capitaine s'intercale).

## 🧾 DETTES TRACÉES (file d'attente Roadmap ✅)
- **Dette #41** (VEVENT dégénéré masqué à tort — aucun producteur connu) · **Dette popover cellule vide** (préexistante) · **Garde `syncing` mort** (⚠️ correctif toucherait la frontière sacrée, non arbitré) · ~~`caldav.js:294`~~ → **re-classé fautif borné par l'audit, absorbé dans la famille « strip du Z » ci-dessus**.

## ⚠️ VIGILANCES OUVERTES
- **`TEST MINUIT` reste dans `ZZ-TEST-REC`** (Apple natif, jeu. 6 août 23h30 → ven. 7 août 01h45, récurrent hebdo). Seul cas exerçant la segmentation. ⚠️ **Ne jamais l'éditer depuis NomadCal** (le formulaire écraserait sa date de fin — lot E).
- **NomadCal ne peut pas CRÉER un event à cheval sur minuit** (`EventForm.jsx:236`) → **lot E**.
- **Fantôme iCal Juin–Juil** = cache Mac. À IGNORER. **NE PAS supprimer depuis iCal.**
- **Branche `claude/nomadcal-cloud-c-bis-7wq1tx` (#41)** : supprimable via GitHub UI, inoffensive.

## ✅ RENVOIS (scellé, détail au JOURNAL)
- **Lot R1 CLOS (04-08)** · **Lot N + déménagement doc CLOS (03-08)** · **Charte Orchard SCELLÉE (30-07)** · **Chantier périodes NomadBook CLOS (19-07)** · **Récurrence** : bug A (#35/#36), bug B (#38), EventForm A1+UNTIL (#37).

## 💾 BACKUPS DE RÉFÉRENCE
- Export natif Settings 6 clés : 16/07 12:49 · 19/07 20:56 (11 notes) · backup corrigé restauré.
- ⚠️ Ne couvrent PAS `nb_periods_cache` ni les events (`cf_events` exclus).

## 🧭 REPRENDRE — RITUEL
1. **Olivier donne le carburant session.**
2. Claude lit **cet État + la ROADMAP** → résume → attend le go.
- **NE RIEN coder/merger sans go explicite d'Olivier.**
- **Sessions cousin = CLOUD** (icône branche ⎇) + test tuyau avant brief lourd.
- **BRIEFS : un seul bloc, jamais imbriqué · cas de test fixé DANS le brief** (→ Instructions).
- **Reprise immédiate :** rédiger le **brief CONSEILLER lot T** à partir du rapport ci-dessus (pas besoin de re-briefer l'INVESTIGUER : il est scellé).
