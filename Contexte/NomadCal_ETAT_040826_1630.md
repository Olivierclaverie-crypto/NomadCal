# ÉTAT DU PROJET NOMADCAL
*Document VIVANT — l'établi : SEULEMENT le chantier actif, les vérifs ouvertes, la reprise. Règle de VIDANGE : chantier scellé → migre au JOURNAL le jour même, l'État ne garde qu'une ligne de renvoi. Cible : ~1 page — **exceptionnellement dépassée** : le rapport d'audit du lot T loge ici le temps du chantier (décision capitaine 04-08 : conservé INTÉGRAL jusqu'au scellement de la PR-A), il migrera au Journal (condensé) à ce moment-là. Dernière MAJ : 04-08-26 16h30 (CONSEILLER scellé · 2 décisions gravées · inventaire terrain · CERTIFIER parseur · PR-A décidée).*

---

## 🔨 CHANTIER ACTIF — LOT T : AUDIT TEMPOREL 360° (étape 3/3)
**Chaîne : ~~INVESTIGUER~~ ✅ → ~~CONSEILLER~~ ✅ → ~~décision capitaine~~ ✅ → EXÉCUTER (prochain geste).**

### ⚖️ LES 2 DÉCISIONS GRAVÉES (capitaine, 04-08 après-midi)

**1. FUSEAU DE RÉFÉRENCE → OPTION (a) : NomadCal vit en heure de Paris, PAR DÉCISION.**
- `Europe/Paris` codé en dur dans `pushEvent.js` (`:14, :17, :126, :129, :133`) n'est **pas un bug** : c'est la doctrine produit assumée. Le **douteux C1 est FERMÉ** — ce site quitte la catégorie C et devient un **A documenté**.
- Coût : **zéro ligne de code**. Zone sacrée **jamais touchée**. **Totalement réversible** (aucune donnée n'est marquée différemment).
- Motifs : Neon (~fin août) rebattra le multi-device — toute plomberie posée avant serait réécrite · le défaut résiduel (voyage hors fuseau + device basculé + saisie sur place) est quasi théorique sur le terrain réel (nord France / région parisienne) · options (b) fuseau du device et (c) réglage configurable exigeaient toutes deux `pushEvent` (PR isolée zone sacrée) **plus un bloc VTIMEZONE joint** exigé par la RFC — spécimen vu au brut : ~100 lignes de règles depuis 1891.
- ➡️ **Doctrine portée aux INSTRUCTIONS** (§ DOCTRINE TEMPORELLE, règle 7).

**2. PÉRIMÈTRE FAMILLE 1a → « Z SEUL ». TZID exotique en DETTE.**
- `Z` n'est pas un fuseau : c'est l'**instant absolu**, format d'échange universel. Le lire = du JS pur, sans dépendance. Un TZID arbitraire = machinerie de fuseaux (Intl) — hors doctrine d'une app mono-fuseau assumé.
- **Dette tracée** : `caldav.js:107-111` (`get()` jette le préfixe entier, TZID compris) → un `TZID=America/New_York:...T140000` est lu 14h00 **Paris**. Cause connue, non corrigée sciemment.

### 🔬 INVENTAIRE TERRAIN DES FORMATS (04-08, lecture seule DebugPanel) — LE RÉSULTAT QUI RECENTRE LE LOT

**4 bruts réels, 4 producteurs distincts. ZÉRO `Z` dans un DTSTART/DTEND. ZÉRO TZID exotique. ZÉRO `UNTIL` d'event.**

| Origine | Format des dates | Note |
|---|---|---|
| NomadCal (`PRODID //NomadCal//FR`) | date-seule (all-day) | reste de test |
| Apple / suggestion Booking | date-seule | `DTEND` exclusif (conforme) |
| **Outlook / Teams — vraie invitation** (`ORGANIZER`+`ATTENDEE`, `X-MICROSOFT-*`) | **`TZID=Europe/Paris`** | producteur cible n°1 de l'audit |
| **Google** (via suggestion Apple, `URL` → `…@google.com`) | **`TZID=Europe/Paris`** | producteur cible n°2 de l'audit |

- ⭐ **Les DEUX producteurs que l'audit désignait comme déclencheurs de la famille 1a écrivent en TZID, pas en `Z`.** Et ce TZID-là, NomadCal le lit JUSTE (heure murale = Paris sur un device français).
- **Conséquence : la famille 1a a une population exposée NULLE, mesurée au brut.** Le code reste fautif *dans l'absolu* (`:168` jette le `Z`) — c'est un **piège armé que personne ne déclenche**.
- **Douteux C2 (`UNTIL` sans `Z`) éclairé** : les seuls `UNTIL` trouvés vivent dans les blocs VTIMEZONE et portent tous un `Z`. Aucun `UNTIL` d'event externe en vue.
- ⚠️ **Ce que l'inventaire ne prouve pas** : 4 échantillons ne sont pas un recensement exhaustif. Il mesure une **tendance forte**, pas une impossibilité.

### ✅ CERTIFIER PARSEUR ICS — 3 OUI (scellé 04-08, `origin/main @ a1de1bd` ≡ `14d5918` sur `src/` et `api/`)
*Déclenché par l'inventaire : deux structures jamais examinées portaient des dates en `Z`.*

- **POINT 1 — VTIMEZONE inerte : OUI.** `caldav.js:78` et `:104` — regex `BEGIN:VEVENT[\s\S]*?END:VEVENT`, quantifieur **non-gourmand** → un bloc VTIMEZONE (avant ou après le VEVENT) ne peut jamais entrer dans un bloc capturé. Ses `RRULE`/`UNTIL=…Z` sont hors de portée.
  - ⚠️ **Nuance consignée** : le repli `:105` scanne le **fichier entier** si aucun VEVENT n'est présent. Ce chemin est bouché par `:160` (`if (!uid || !dtstart) return null`) — un VTIMEZONE a des `DTSTART`, jamais de `UID`. **Le verrou tient par le UID, pas par le découpage.** Un relâchement futur de `:160` rouvrirait ce chemin.
- **POINT 2 — TZID jeté, heure murale locale : OUI.** `caldav.js:110` (`line.replace(/^[^:]+:/, "")`) : `[^:]+` ne peut pas contenir de `:` → `DTSTART;TZID=Europe/Paris` est consommé entier, la valeur nue sort en heure murale. **Prouvé au code, plus seulement constaté à l'écran.**
  - **Le nom du fuseau n'est exploité NULLE PART en lecture** : détruit `:110`, `:152`, `:168`, jamais lu. En écriture, `Europe/Paris` est une **constante émise**, pas une lecture. ➡️ NomadCal est **déjà** mono-fuseau de fait ; la décision (a) nomme un état existant.
- **POINT 3 — TRIGGER inerte : OUI, mais l'hypothèse du timonier était fausse dans son raisonnement.** La VALARM n'est **pas** ignorée : le non-gourmand s'arrête à `END:VEVENT`, pas à `END:VALARM` → **ses lignes SONT scannées**. Ce qui protège, c'est le filtrage par **liste fermée de clés** (`:109`, `startsWith(key+":"|key+";")`) — `TRIGGER` n'en fait pas partie. La date `19760401T005545Z` est inerte.

### ▶️ PROCHAIN GESTE — BRIEF EXÉCUTER **PR-A** (famille 2)
**Décision capitaine : PR-A SEULE. Famille 1a + 1b en dette tracée.**

- **Contenu** : les 5 sites de la famille 2 (`new Date("YYYY-MM-DD")` = minuit UTC). Fichiers : `src/components/NomadBook.jsx` + `src/App.jsx:771`. Ordre de grandeur ≈ **+8/−8**, 2 fichiers. **Zone sacrée : NON.**
- **⚠️ POURQUOI ELLE PART EN PREMIER — écart majeur corrigé par le CONSEILLER** : l'audit qualifiait ces sites d'affichage. **FAUX.** `getPeriodStatus` (`NomadBook:114`) alimente `currentPeriod` (`:463`), dont le `href` sert de `periodId` à la création d'une note (`:602`) **et déclenche `syncNoteCount`, qui ÉCRIT sur l'event de période iCloud** (`:607-608`). ➡️ **une note saisie entre 00h et 02h (CEST) le premier jour d'une période est rattachée à la période PRÉCÉDENTE** — défaut de **donnée**, persistant, pas d'écran.
- **⭐ LA CARTE DES 3 IDIOMES (à porter TELLE QUELLE dans le brief — c'est elle qui évite d'appliquer le bon remède au mauvais site) :**
  1. **Affichage** (`NomadBook.jsx:108-109`, `fmt`/`fmtYear`) → idiome **pivot midi** (`new Date(iso + "T12:00:00")`), déjà présent 13× dans le repo.
  2. **Comparaison d'instant** (`NomadBook:114` `getPeriodStatus`, `App:771`, `NomadBook:110/118` `daysLeft`/`daysUntilStart`) → borne à **minuit LOCAL**. ⚠️ Le pivot midi y déplacerait la bascule à midi = **nouveau bug**.
  3. **« Aujourd'hui » en chaîne** (`NomadBook:222`) → **réutiliser `todayISO`** (`helpers.js:19`), existant, exporté, éprouvé. Réutilisation, pas invention.
- **⚠️ NUANCE SÉMANTIQUE À ACTER DANS LE BRIEF** : avec minuit local, `now < new Date(p.endISO)` **exclut entièrement le jour de fin**, là où le comportement actuel l'excluait « sauf 2 h ». Différence minime mais réelle — **à acter, pas à découvrir**.
- **RISQUE : aucun identifiant ne bouge.** Les `href` (`rapport-<fin>.ics`) sont fabriqués depuis les chaînes `endISO` du formulaire, **jamais depuis un objet `Date`**. Zéro clé, zéro slug, zéro tombstone.
- **CAS DE TEST FIXÉ — « FORMULAIRE VEILLE », ZÉRO ÉCRITURE** : ouvrir le formulaire « Nouvelle période » de NomadBook, observer, **annuler**. Rien n'est créé → pas besoin de `ZZ-TEST-REC`, rien écrit dans `nomadcal-oc`.
  - **Avant fix** (horloge device ~00h30 CEST) : le formulaire propose **la veille** · la période dont c'est le 1er jour n'est **pas** « En cours » · le compteur de notes du pied de page pointe la période précédente.
  - **Après fix** : date du jour · « En cours » dès minuit · compteur juste.
  - ⚠️ **Défaut SAISONNIER et NOCTURNE** : fenêtre 00h–02h CEST (00h–01h CET). Rien ne se reproduit à 15h. Deux voies honnêtes : veiller la fenêtre, ou **basculer l'horloge de l'iPhone** (Réglages → Général → Date et heure) — acceptable en **observation pure**, à **proscrire pour toute création d'event** pendant la bascule.
  - Le volet `fmt`/`fmtYear` (ouest d'UTC) **n'est pas reproductible depuis Paris** → validation par lecture, assumée comme telle.

---

## 📄 RAPPORT D'AUDIT COMPLET (43 sites, preuves, motifs grep rejouables)
*Conservé INTÉGRAL sur décision capitaine (04-08) jusqu'au scellement de la PR-A. Migrera au Journal condensé à ce moment.*

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

## C — DOUTEUX (2) → **LES DEUX SONT MAINTENANT TRANCHÉS OU ÉCLAIRÉS (04-08)**

| Site | Extrait | Ce qui manquait pour trancher | **Statut 04-08** |
|---|---|---|---|
| `src/sync/pushEvent.js:13-17, 125-133` | `DTSTART;TZID=Europe/Paris:${fmt(ev.startDate)}T…` | Syntaxe RFC correcte, mais le fuseau est **codé en dur** : l'heure murale du device est étiquetée `Europe/Paris` quel que soit le fuseau réel de l'appareil. Correct si la doctrine est « l'app vit en heure de Paris » ; faux si le capitaine crée des events avec un device basculé sur un fuseau étranger. **Manque : la décision produit sur le fuseau de référence en déplacement.** (Fichier en zone sacrée — lu seulement.) | ✅ **FERMÉ — décision (a) gravée.** Devient un **A documenté**. |
| `src/utils/caldav.js:265-272` | `untilTs = Date.UTC(+u.slice(0,4), …)` | Un `UNTIL` **avec `Z`** (le cas RFC, et ce que produit `EventForm`) est correct. Un `UNTIL` flottant sans `Z` (producteur non conforme) serait lu comme UTC → série arrêtée ~2 h trop tôt ; un `UNTIL` date-seule est complété à 23:59:59**Z**. **Manque : un échantillon réel d'UNTIL non-`Z` dans les calendriers du capitaine** pour dire si le cas existe. | 🟡 **ÉCLAIRÉ** — inventaire : aucun `UNTIL` d'event externe trouvé ; les seuls `UNTIL` vus (VTIMEZONE) portent tous un `Z`. Reste théorique. |

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

---

## 🧾 DETTES TRACÉES (file d'attente Roadmap ✅)
**Issues du lot T (04-08) :**
- **Famille 1a — strip du `Z`** (`caldav.js:168` parseDate · `:152` EXDATE) : fautif au code, **population exposée nulle mesurée**. Cas de test **non fabricable** (ni Apple ni NomadCal ne produisent un event `Z`). ⚠️ Correction partielle INTERDITE : `parseDate` et `EXDATE` se corrigent **ensemble** (doctrine #44).
- **Famille 1b — `caldav.js:294` (`curISO`)** : reliquat de la classe #44 (helper `toISO` UTC), pas du strip du `Z`. Effet nul prouvé. Part avec 1a.
- **Dette TZID exotique** (`caldav.js:107-111`) : `get()` jette le fuseau nommé → un TZID étranger est lu en heure de Paris. **Non corrigée sciemment** (décision périmètre « Z seul »).
- **Brèche `DESCRIPTION` de VALARM** (`caldav.js:109` + `:122` + `:145`) : `get()` prend la **première** ligne qui matche. Une VALARM `ACTION:DISPLAY` porte réglementairement sa propre `DESCRIPTION` (souvent `REMINDER` chez Outlook) → pour un event **sans description propre**, celle de l'alarme atterrit dans les **notes de l'event**. Cas non présent dans les 4 bruts (l'event Outlook avait sa propre description) mais **le chemin existe au code**. Même mécanisme théorique sur `SUMMARY` (alarmes `ACTION:EMAIL`). **Hors lot T.**
- **Clause morte `caldav.js:163`** : `dtstart.includes("VALUE=DATE")` ne peut jamais être vrai (`get()` a déjà jeté les paramètres). Sans effet, **trompeur à la lecture**.
- **Repli `caldav.js:105`** : scanne le fichier entier si aucun VEVENT. Bouché par `:160` (UID) — **le verrou tient par le UID, pas par le découpage**. À surveiller si `:160` est un jour relâché.
- **Note lot E** : le gabarit all-day de NomadCal écrit `DTEND = DTSTART` (`caldav.js` / event de test observé au brut) là où Apple écrit exclusif (`DTSTART:20260707` / `DTEND:20260709`). **Affichage correct constaté** (le repli du #43 couvre), donc pas un bug vécu — mais non conforme RFC pour un client tiers.

**Antérieures :** Dette #41 (VEVENT dégénéré masqué à tort — aucun producteur connu) · Dette popover cellule vide (préexistante) · Garde `syncing` mort (⚠️ correctif toucherait la frontière sacrée, non arbitré).

## ⚠️ VIGILANCES OUVERTES
- **Notes déjà mal rattachées** : le fix PR-A corrige **l'avenir**, il ne re-rattache pas les notes historiquement liées à la mauvaise période. **Existe-t-il de telles notes ? Personne ne le sait.** Question ouverte, non instruite.
- **`TEST MINUIT` reste dans `ZZ-TEST-REC`** (Apple natif, jeu. 6 août 23h30 → ven. 7 août 01h45, récurrent hebdo). Seul cas exerçant la segmentation. ⚠️ **Ne jamais l'éditer depuis NomadCal** (le formulaire écraserait sa date de fin — lot E). ⚠️ **Il ne teste RIEN en famille 1a** (Apple natif = TZID, il traverse la zone sans la toucher).
- **NomadCal ne peut pas CRÉER un event à cheval sur minuit** (`EventForm.jsx:236`) → **lot E**.
- **Fantôme iCal Juin–Juil** = cache Mac. À IGNORER. **NE PAS supprimer depuis iCal.**
- **Events de test à purger** : `Allday &` (`PRODID //NomadCal//FR`, reste de tests) — cosmétique, quand tu veux.
- **Branche `claude/nomadcal-cloud-c-bis-7wq1tx` (#41)** : supprimable via GitHub UI, inoffensive.

## 🧠 BRAINSTORMS À OUVRIR (non décidés)
- **⭐ RÉORDONNER LA ROADMAP VERS NEON** (soulevé 04-08) : les congés (jusqu'au 01/09) referment la fenêtre de risque terrain. Deux lectures distinctes à ne pas confondre — **avancer la DATE** de Neon (déconseillé : R5, H et K sont des prérequis écrits, non commencés ; débordement possible sur la reprise terrain) vs **accélérer le CHEMIN** (tout ce qui n'est pas prérequis passe en dette, les congés servent R5 + H + brainstorm EventForm — chantiers de papier et de données, parfaits à carburant bas, sans session cousin). **Non tranché.**
- **Brainstorm EVENTFORM** (lot E) · **Brainstorm MÉTHODE** (03-08) · **Brainstorm R2** (compositeur récurrence, à fusionner avec EventForm).

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
- **▶️ REPRISE IMMÉDIATE : lancer le brief EXÉCUTER PR-A** (rédigé le 04-08, prêt à coller en session cousin cloud). Chaîne : brief → avis-avant-code du cousin → **go explicite du capitaine** → PR → test terrain (fenêtre 00h–02h ou horloge basculée, observation pure) → merge → scellement au Journal.
