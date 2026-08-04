# JOURNAL / ACQUIS — NOMADCAL
*Classeur des leçons apprises à la dure et des chantiers scellés. Vit sur GitHub `Contexte/` UNIQUEMENT (jamais dans la connaissance du Projet — économie de contexte). On vient le consulter quand on est coincé : upload ponctuel au timonier, ou lecture directe par le cousin. Il grossit ; c'est normal. Pour l'avancement → ÉTAT. Pour le plan → ROADMAP. Pour la méthode → INSTRUCTIONS. Pour l'archi + doctrine résumée → README moteur (+ README racine du repo pour le détail exhaustif).*

---

## 🕐 LOT T — AUDIT TEMPOREL 360° : SCELLÉ EN PROD (#46, 04-08-26)
*Le lot annoncé « EXÉCUTER batché par famille » s'est soldé en **1 SEULE PR** — parce qu'un inventaire terrain de 10 minutes a vidé la population de l'autre famille. **Un audit qui aboutit à « ne pas corriger maintenant, tracer » est un succès, pas une déception.** `pushEvent`/`deleteEvent` jamais touchées. Chaîne complète tenue : INVESTIGUER → CONSEILLER → décisions capitaine → CERTIFIER → EXÉCUTER → test terrain → merge.*

### 📊 LE RÉSULTAT DE L'AUDIT — 43 SITES, ZÉRO FAUTIF EN ZONE SACRÉE
**A (correct tel quel) : 31 · B (fautif) : 8 · C (douteux) : 2 · déjà corrigés (#44) : 2.** Audit mené sur `origin/main @ 14d5918`, lecture seule prouvée (`git status` vide), condition d'arrêt (~60 sites) jamais approchée.

**Les 8 fautifs, en 2 familles seulement :**
- **Famille 1a — strip du `Z` à la lecture ICS** (2 sites) : `caldav.js:168` (`parseDate`) et `:152` (`EXDATE`) jettent le suffixe `Z` d'une valeur UTC et la traitent en heure murale locale. Le cas `EXDATE` est le plus vicieux : une occurrence supprimée peut **réapparaître**. ⚠️ **Les deux se corrigent ENSEMBLE** (doctrine #44).
- **Famille 1b — `caldav.js:294` (`curISO`)** : reliquat de la classe #44 (helper `toISO` UTC), **pas** du strip du `Z`. Cause différente, même fichier. Effet nul prouvé (borne de sortie de boucle sur un horizon d'un an).
- **Famille 2 — `new Date("YYYY-MM-DD")` = minuit UTC** (5 sites, tous NomadBook/périodes) : `NomadBook.jsx:108-109` (`fmt`/`fmtYear`), `:110`/`:118` (`daysLeft`/`daysUntilStart`), `:114` (`getPeriodStatus`), `:222` (défaut du formulaire), `App.jsx:771` (IIFE `noteCount`). Fenêtre 00h–02h CEST, identique à R1.

**Les 2 douteux, tous deux fermés le 04-08 :** `pushEvent.js` (fuseau en dur → décision (a), voir ci-dessous) · `caldav.js:265-272` (`UNTIL` sans `Z` → éclairé par l'inventaire, reste théorique).

**Motifs grep rejouables** (sur `git grep -nE <motif> origin/main -- src api public`) : `\.toISOString\(|\.toLocaleDateString|\.toDateString\(` · `toUTCString|toGMTString` (0) · `getUTC[A-Z]` (0) · `Date\.UTC` · `\.getTime\(|Date\.parse` · `toTimeString|toLocaleTimeString|setU?T?C?Hours` · `TZID|timeZone|Intl\.DateTimeFormat|getTimezoneOffset` · `DTSTART|DTEND|UNTIL|EXDATE|RECURRENCE-ID` · `new Date\(` avec tri manuel + contrôle ciblé `new Date\([^)]*\+ *"T` (13 sites protégés).

### ⚖️ LES 2 DÉCISIONS PRODUIT GRAVÉES (capitaine)
- **FUSEAU → option (a) : NOMADCAL VIT EN HEURE DE PARIS, PAR DÉCISION.** `Europe/Paris` codé en dur dans `pushEvent.js` n'est **pas un bug**, c'est la doctrine assumée. **Coût zéro ligne**, zone sacrée jamais touchée, totalement réversible. Les options (b) fuseau du device et (c) réglage configurable exigeaient toutes deux `pushEvent` (PR isolée zone sacrée) **plus un bloc VTIMEZONE joint** exigé par la RFC — spécimen vu au brut le jour même : ~100 lignes de règles depuis 1891 (`PMT`, `WEST`, `WEMT`, la guerre, 1976…). Le capitaine a gravé (a) **avant** de voir ce pavé ; il l'a vu vingt minutes plus tard dans un vrai fichier Outlook. ➡️ Doctrine portée aux INSTRUCTIONS (règle 7).
- **PÉRIMÈTRE FAMILLE 1a → « Z SEUL ».** `Z` n'est pas un fuseau : c'est l'**instant absolu**, format d'échange universel — le lire est du JS pur. Un TZID arbitraire = machinerie de fuseaux (Intl), hors doctrine d'une app mono-fuseau assumé. **Dette tracée** : `caldav.js:107-111` (`get()` jette le préfixe entier, TZID compris).

### 🔬 L'INVENTAIRE TERRAIN — LE GESTE QUI A RECENTRÉ LE LOT (10 min, zéro écriture)
*Relevé du `rawICS` via le DebugPanel depuis l'iPhone. 4 bruts réels, 4 producteurs distincts.*

| Origine | Format des dates |
|---|---|
| NomadCal (`PRODID //NomadCal//FR`) | date-seule (all-day) |
| Apple / suggestion Booking | date-seule, `DTEND` **exclusif** (conforme) |
| **Outlook / Teams** (vraie invitation : `ORGANIZER`+`ATTENDEE`, `X-MICROSOFT-*`) | **`TZID=Europe/Paris`** |
| **Google** (via suggestion Apple, `URL` → `…@google.com`) | **`TZID=Europe/Paris`** |

- ⭐ **ZÉRO `Z` dans un DTSTART/DTEND. ZÉRO TZID exotique. ZÉRO `UNTIL` d'event.** Les **deux** producteurs que l'audit désignait comme déclencheurs de la famille 1a écrivent en **TZID**, pas en `Z` — et ce TZID-là, NomadCal le lit JUSTE.
- **Conséquence : la famille 1a a une population exposée NULLE, mesurée.** Le code reste fautif *dans l'absolu* — c'est un **piège armé que personne ne déclenche**. Elle passe en dette tracée au lieu d'être corrigée.
- ⚠️ **Ce que l'inventaire ne prouve PAS** : 4 échantillons ne sont pas un recensement. Il mesure une **tendance forte**, pas une impossibilité.
- **⭐ RÈGLE NÉE ICI — MESURER LA POPULATION AVANT DE CORRIGER.** Un défaut prouvé au code n'a pas forcément de cas dans le réel. **Le brut avant la priorité, pas seulement avant la cause.** → portée aux INSTRUCTIONS.

### ✅ CERTIFIER PARSEUR ICS — 3 OUI, ET UNE TROUVAILLE
*Déclenché par l'inventaire : deux structures jamais examinées (VTIMEZONE, VALARM) portaient des dates en `Z`. Lu sur `origin/main @ a1de1bd` ≡ `14d5918` sur `src/` et `api/`.*
- **POINT 1 — VTIMEZONE inerte : OUI.** `caldav.js:78` / `:104` — regex `BEGIN:VEVENT[\s\S]*?END:VEVENT`, quantifieur **non-gourmand** → un VTIMEZONE (avant ou après le VEVENT) ne peut jamais entrer dans un bloc capturé. ⚠️ **Nuance** : le repli `:105` scanne le **fichier entier** si aucun VEVENT ; ce chemin est bouché par `:160` (`if (!uid || !dtstart) return null`) — un VTIMEZONE a des `DTSTART`, jamais de `UID`. **Le verrou tient par le UID, pas par le découpage.**
- **POINT 2 — TZID jeté, heure murale locale : OUI.** `caldav.js:110` (`[^:]+` ne peut pas contenir de `:`). **Le nom du fuseau n'est exploité NULLE PART en lecture** (détruit `:110`, `:152`, `:168`). ➡️ NomadCal était **déjà** mono-fuseau de fait : la décision (a) **nomme un état existant**, elle ne l'impose pas.
- **POINT 3 — TRIGGER inerte : OUI, mais l'hypothèse du timonier était FAUSSE dans son raisonnement.** J'avais écrit « la VALARM est ignorée ». Elle ne l'est pas : le non-gourmand s'arrête à `END:VEVENT`, pas à `END:VALARM` → **ses lignes SONT scannées**. Ce qui protège, c'est le filtrage par **liste fermée de clés** (`:109`) — `TRIGGER` n'en fait pas partie.
- **⭐ LA TROUVAILLE — brèche `DESCRIPTION` de VALARM.** Puisque les lignes de la VALARM sont scannées et que `get()` prend la **première** ligne qui matche : une VALARM `ACTION:DISPLAY` porte réglementairement sa propre `DESCRIPTION` (souvent `REMINDER` chez Outlook) → pour un event **sans description propre**, celle de l'alarme atterrit dans les **notes de l'event** (`:122` → `:145`). Le brut Outlook du capitaine était à un cheveu du cas : sa VALARM porte bien `DESCRIPTION:REMINDER`, mais l'event avait sa propre description (le pavé Teams), qui vient avant. **Chemin réel au code, cas non observé.** → file d'attente. Même mécanisme théorique sur `SUMMARY` (alarmes `ACTION:EMAIL`).
- **Bon résultat, mauvaise raison** : c'est en corrigeant mon raisonnement que le cousin a trouvé la brèche. Une hypothèse fausse qui rend le bon verdict reste une hypothèse fausse — et la corriger paie.

### ✅ CE QUI EST EN PROD — PR #46 (`adbab38`, Vercel Ready 12 s)
*Base `origin/main @ 9b08e5e` · branche `claude/nomadcal-t-famille2` · **2 fichiers, +10/−7**.*
- **⭐ L'ÉCART MAJEUR DU CONSEILLER — la famille 2 n'est PAS de l'affichage.** L'audit l'avait qualifiée ainsi. **FAUX, et prouvé au code** : `getPeriodStatus` (`NomadBook:114`) alimente `currentPeriod` (`:463`), dont le `href` sert de `periodId` à la création d'une note (`:602`) **et déclenche `syncNoteCount`, qui ÉCRIT sur l'event de période iCloud** (`:607-608`). ➡️ **une note saisie entre 00h et 02h le premier jour d'une période partait sur la période PRÉCÉDENTE** — défaut de **donnée**, persistant. C'est ce qui a fait passer cette famille en tête de l'ordre.
- **⭐ LA CARTE DES 3 IDIOMES — le cœur du lot.** Cinq sites, une cause unique, **trois remèdes distincts**. Appliquer le mauvais au mauvais site crée un nouveau bug :
  1. **Affichage** d'une date-seule → **pivot midi** (`iso + "T12:00:00"`), modèle déjà présent 13× dans le repo.
  2. **Comparaison d'instant** (statut, J-x, « en cours ») → **minuit LOCAL**. Le pivot midi y déplacerait la bascule à midi.
  3. **« Aujourd'hui » en chaîne** → **réutiliser `todayISO`** (`helpers.js:19`). Réutilisation, pas invention.
  → portée aux INSTRUCTIONS (règle 8).
- **Le cousin a appliqué la doctrine #44 de lui-même** : les deux bornes de `getPeriodStatus` corrigées dans le même geste, et `App.jsx:771` maintenu **jumeau** du même prédicat — le motif exact du #43 (deux sites qui divergent parce qu'on n'en corrige qu'un).
- **Micro-écart signalé, pas tranché en silence** : `NomadBook.jsx` n'importait **rien** de `helpers.js` (il redéfinit `fmt`, `load`, `save` localement). Réutiliser `todayISO` exigeait donc une ligne d'import — diff porté de +9/−8 à +10/−7. Le cousin a proposé sa résolution et attendu le go plutôt que de recopier la construction en local (ce qui aurait contredit « réutilisation, pas invention »).
- **Une ligne de commentaire de doctrine** posée à côté de `fmt` (« date-seule = parse local obligatoire »). Hors des 5 sites, déclarée comme telle. **Gardée sciemment** : la règle existait au Journal depuis le début sans jamais avoir été appliquée à `expandRecurring` — une règle écrite **à côté de la ligne** se lit au moment où la main tremble.
- **Aucun identifiant ne bouge** (contrairement au #44) : les `href` (`rapport-<fin>.ics`) viennent des **chaînes** `endISO` du formulaire (`caldavCalendar.js:243`), jamais d'un objet `Date`. Vérifié et confirmé à l'avis-avant-code.

### 🌙 LE TEST TERRAIN — HORLOGE BASCULÉE, ZÉRO ÉCRITURE
*Cas « FORMULAIRE VEILLE » : on ouvre, on observe, on annule. Rien n'est créé, `ZZ-TEST-REC` pas nécessaire.*
- **Méthode** : Réglages → Général → Date et heure → réglage automatique **désactivé** → date posée au **7 sept. 2026, 23h58** (veille du premier jour de la période suivante) → observation de la bascule **en direct**.
- **PROUVÉ À L'ÉCRAN : à 00h00, « Rapport Septembre–Octobre » passe en PÉRIODE EN COURS.** Avant le fix il aurait fallu attendre 02h00. Le **titre en tête a suivi** (« Compilation le 05 oct. — J-27 ») → c'est bien `currentPeriod` qui bascule, donc **le chemin d'écriture est validé**, pas seulement un affichage. `daysLeft` juste (J-27), archivés propres, aucun doublon.
- **⚠️ PIÈGE RENCONTRÉ — l'écran du JOUR DE FIN.** À 23h58 le 7 sept., l'app affichait « Juin–Juillet 2026 » en « période en cours » avec badge « Dépassé », et Juin–Juillet apparaissait **en double**. Ce n'était **ni le fix ni un bug neuf** : le 7 sept. est le **jour de fin** de Juillet–Septembre, et avec la borne à minuit local ce jour est **exclu entièrement** → aucune période courante, l'app se rabat sur une ancienne. Comportement préexistant, hors fenêtre 00h–02h.
- **LEÇON — l'écran inattendu a failli faire conclure trop vite.** Trois causes étaient possibles (mauvaise date posée · état d'app incohérent · régression du fix) et **aucune preuve ne permettait de trancher**. La doctrine a servi : suspecter la CIBLE avant le code, et **exiger la date réelle du device** avant toute conclusion. Une fois la date confirmée (7 sept. 23h59), l'écran est devenu lisible d'un coup.
- **⭐ CONSÉQUENCE PRODUIT À INSTRUIRE (hors PR)** : le **jour de fin d'une période n'a aucune période courante** — or le 7 sept. est justement le **jour de compilation du rapport**. La nuance sémantique avait été actée sur le papier ; **la voir à l'écran change la perspective**. → file d'attente, à raccrocher au lot R4.
- **Non testé, déclaré tel quel** : le volet `fmt`/`fmtYear` (défaut visible seulement à l'ouest d'UTC, **non reproductible depuis Paris** → validé par LECTURE) · le compteur du pied de page (hors champ des captures).
- ⚠️ **Horloge remise en automatique immédiatement après.** Basculer l'horloge est acceptable en **observation pure** — jamais pour créer un event (horodatages faux poussés vers iCloud).

### 🧭 LEÇONS MÉTHODE
- **L'AVIS-AVANT-CODE A ENCORE PAYÉ — 3 écarts sur le rapport d'audit.** (1) La famille 2 requalifiée d'« affichage » en **« écriture »** — l'écart le plus lourd, il a changé l'ordre du lot. (2) `curISO` sorti de la famille 1a (cause différente : reliquat #44, pas strip du `Z`). (3) Le périmètre de 1a **sous-évalué** : `get()` jette le TZID **entier**, donc un TZID exotique est lu en heure de Paris — le cousin a refusé de trancher le périmètre Z/TZID et l'a renvoyé au capitaine. **Un rapport d'audit n'est pas une vérité gravée.**
- **LE TIMONIER S'EST TROMPÉ (encore).** L'hypothèse « la VALARM est ignorée » était fausse dans son mécanisme. Et j'ai relayé au capitaine la famille 2 comme du « confort d'écran » — c'était faux, et ça venait de mon relais, pas de l'audit.
- **⭐ REPÈRES DE TEMPS — leçon capitaine.** Le timonier a écrit « ce soir » trois fois dans une session de **16h30**, et a lu « je donne le go dans 2h34 » comme un délai serré alors que c'était l'heure du **ravito**. → règle portée aux INSTRUCTIONS : dire **« maintenant »**, **« à la reprise »** — jamais un repère d'horloge inventé.
- **LE CARBURANT EST TRANSVERSAL.** Avant de lancer un EXÉCUTER, compter la chaîne entière (brief → lecture → avis → code → PR → **test terrain** → merge), pas seulement la rédaction. **Ne jamais laisser une PR orpheline.**
- **UN BRIEF EST AUTOPORTANT.** Le cousin ne lit pas la conversation timonier↔capitaine, et `Contexte/` n'est pas forcément à jour. Sites, `file:line`, extraits de brut, décisions déjà prises : tout se **recopie dans le brief**. Jamais « voir le rapport dans l'État ».
- **INTERDIRE LE PATCH dans un CONSEILLER ou un CERTIFIER** : un brief non-EXÉCUTER qui revient avec du code prêt à coller est un EXÉCUTER déguisé — la décision du capitaine ne peut plus s'intercaler.
- **UN LOT PEUT RÉTRÉCIR.** Annoncé « batché par famille », soldé en **1 PR**. L'investigation sert à ça.

### 🧾 DETTES OUVERTES À LA SORTIE DU LOT (→ file d'attente Roadmap)
Famille 1a (`caldav.js:168` + `:152`, **ensemble**, `EXDATE` à reprendre avec R3) · Famille 1b (`:294`) · TZID exotique (`:107-111`, non corrigée **sciemment**) · Brèche `DESCRIPTION` VALARM · Clause morte `:163` · Repli `:105` (bouché par le UID) · Note lot E : gabarit all-day NomadCal écrit `DTEND = DTSTART` là où Apple écrit exclusif · **Notes déjà mal rattachées** : le fix corrige l'avenir, pas le passé — existe-t-il de telles notes ? **Personne ne le sait.**

---


## 🕐 LOT R1 — SCELLÉ EN PROD, ET LA CAUSE RACINE DES FUSEAUX ENFIN TROUVÉE (03→04-08-26)
*Le lot annoncé « 3 défauts d'affichage, 1 PR » a produit **4 PR** et débusqué une cause racine qui empoisonnait le projet depuis des semaines. Journée longue, protocole tenu de bout en bout, zéro merge de faux. `pushEvent`/`deleteEvent` jamais touchées.*

### 🔴 LA DÉCOUVERTE DU JOUR — `toISO` convertit en UTC des dates construites en LOCAL
- **Le défaut (#44, `caldav.js:347` + `:364`)** : `expandRecurring` recalcule les dates de chaque occurrence, puis les pose via `toISO` (`caldav.js:211-214`) qui fait `.toISOString().slice(0,10)` — donc **UTC**. Or `cand`/`occEnd` sont construits en heure **locale**. Pour une heure locale tombant dans la fenêtre où la date UTC est encore la veille (**00h–02h en CEST, 00h–01h en CET**), la date est **rabattue d'un jour**.
- **Conséquence sur `TEST MINUIT`** (jeu. 6 août 23h30 → ven. 7 août 01h45, récurrent) : `endDate` posé à `2026-08-06` au lieu de `2026-08-07`. L'occurrence **finit avant de commencer** → le filtre jour ne la propose jamais au 7, `durationToH` rend une valeur négative, écrasée par `Math.max(20,…)` = **le moignon de 20 px** observé depuis des semaines.
- **`endTime` restait juste** (`toTime` lit `toTimeString()`, local) → occurrence **incohérente**, moitié UTC moitié locale. C'est ce qui rendait le symptôme illisible.
- **Le bon helper existait déjà à 2 lignes de là** : `toLocalISO` (`caldav.js:215-219`), utilisé jusqu'ici uniquement pour la comparaison des `EXDATE` (`:351`). `toISO` n'avait jamais été corrigé.
- **⚠️ LE DÉFAUT EST SAISONNIER** (fait remonté par le cousin, non anticipé) : la même série en janvier (CET) sortait déjà une fin correcte — 01h45 tombe hors de la fenêtre d'une heure. **Rejouer le cas en hiver ne le reproduit pas.** D'où des semaines de diagnostics contradictoires.
- **Correction : les DEUX lignes, pas une.** Le cousin a démontré que corriger la seule fin (`:364`) transformerait un décalage *faux mais cohérent* en **débordement fantôme** : pour un récurrent commençant après minuit, `startDate` serait resté à J-1 pendant que `endDate` passait à J → l'occurrence franchirait un minuit fictif, que la segmentation (#45) découperait ensuite en deux blocs sur deux jours faux. `:347` (`candISO`, qui alimente `startDate`, `recurrenceDate`, `stableId` et les bornes) corrigé dans le même geste, sur arbitrage capitaine.
- **Effet de bord accepté** : le `stableId` change pour les occurrences commençant entre 00h et 02h locales (celles déjà fausses). Une occurrence de cette classe précédemment supprimée peut **réapparaître une fois**. Pour tout le reste, id rigoureusement inchangé.
- **Deux `toISO` HOMONYMES — ne jamais confondre** : `helpers.js:13-18` est **local et correct** (c'est celui qu'importe `App.jsx`) · `caldav.js:211-214` est **UTC**, privé au module. Reste fautif mais inoffensif : `caldav.js:294` (`curISO`, borne de sortie de boucle sur un horizon d'un an) → **laissé au lot d'audit temporel**.

### ✅ CE QUI EST EN PROD (4 PR, dans l'ordre)
- **#41 — item 2, doublon transitoire.** Cause réelle : **clé de déduplication mal formée** dans `mergeRecurrenceExceptions` — `caldav.js:435` **écrivait** `ex.id`, `:443` **lisait** `masterUid`. Elles ne coïncident que pour une exception venue d'iCloud (id brut = UID), jamais pour l'exception optimiste locale. Fix `${ex.masterUid || ex.id}` — `+1/−1`, **additif** (le fallback préserve le cas iCloud octet pour octet). **⚠️ Le diagnostic « refresh manquant » de la Roadmap était FAUX** : le refresh existe et est complet (optimistic `App.jsx:782` → persistance `:204-208` → `runSync` `:802` → `setEvents`). Testé 5/5 au réel.
- **#43 — item 3, bande all-day sur 2 jours.** Borne de fin rendue **exclusive** sur **3 sites** (507 / 518 / 524) — **le 507 avait été manqué au premier passage** (il portait la même comparaison inclusive *sans* le repli des deux autres : re-jeu du 8ᵉ site de C-bis). **Prédicat partagé** (une seule définition pour 507 et 518, pour ne pas recréer la divergence d'origine) + **repli « `startDate` + 1 jour »** pour l'all-day sans `DTEND` (sinon il **disparaissait**). ⚠️ **Pas un cas limite** : `buildPeriodICS` écrit **toute** période NomadBook en all-day mono-jour → toutes s'affichaient sur 2 jours. Cas nominal.
- **#44 — la cause racine ci-dessus.** `+2/−2`, `caldav.js` seul.
- **#45 — item 1, segments jour.** Le commit 2 de #42 **reposé par cherry-pick** sur le `main` à jour (branche neuve plutôt que rebase, pour ne pas réécrire l'historique de #42) : diff **identique au caractère près** à l'original, aucun conflit. Contenu : dérivation de segment dans la boucle jour (début réel ou minuit / fin réelle ou `"24:00"`), **retrait du garde `!e.isRecurring`**, pas de segment de queue vide, **correctif popover**. Testé **9/9** au réel.
- **Le correctif popover était OBLIGATOIRE** (remonté par le cousin, absent de mon brief) : l'objet rendu est passé tel quel à `setPopover`. Sans lui, éditer depuis le bloc J+1 aurait prérempli le formulaire à minuit → `RECURRENCE-ID` visant **minuit J+1** au lieu de **23h30 J** = **exception au mauvais instant**, soit très exactement la famille de défaut que #41 venait de fermer. Fix : les deux `setPopover` transmettent `ev._src || ev` (l'event d'origine). **On aurait échangé un défaut d'affichage contre une corruption de données.**

### 🧭 LEÇONS MÉTHODE — LA JOURNÉE A DÉRIVÉ, ET ON SAIT POURQUOI
- **CAUSE DE LA DÉRIVE : le cas de test n'a jamais été fixé noir sur blanc.** Apple natif ou NC ? récurrent ou pas ? quelle preview ? Le cousin a réclamé la série de référence dès le premier brief ; elle n'a été gravée qu'au 4ᵉ. **La majorité des allers-retours vient de là, pas du protocole.** → règle portée aux INSTRUCTIONS.
- **LE PROTOCOLE A PAYÉ TROIS FOIS.** (1) Mon brief #41 proposait d'aligner la clé sur `masterUid` **seul** — le cousin a vérifié avant d'obéir et trouvé que `parseEvents` ne pose **jamais** `masterUid` : la clé serait devenue `undefined@…` et **le masquage qui marchait aurait sauté**. (2) Le correctif popover, absent de mon brief, remonté par lui. (3) L'option 2 sur #44, refusée en option 1. **L'avis-avant-code n'est pas une formalité.**
- **LE TIMONIER S'EST TROMPÉ DEUX FOIS DE PLUS.** (a) La clé `masterUid` seule, ci-dessus. (b) « Le popover lit correctement 23:30 → 01:45, donc la donnée arrive juste jusqu'au rendu » → **FAUX** : le popover **n'affiche pas la date de fin**, donc l'erreur y est invisible. Ce que je prenais pour une preuve était **la signature même du défaut**. Leçon 13/07 resservie : prouver au brut, et savoir ce qu'un affichage ne montre PAS.
- **LE COUSIN S'EST RÉTRACTÉ HONNÊTEMENT.** Il avait conclu « la dérivation n'est jamais exercée car la donnée ne franchit pas minuit » ; au vu du `rawICS` il a écrit « **il me donne tort** » et repris son analyse. Puis il a refusé de compenser dans `App.jsx` : « masquer une donnée fausse au lieu de la réparer ». Bonne discipline.
- **⚠️ PIÈGE DE RÉDACTION — BLOC IMBRIQUÉ.** Un brief contenant un bloc d'ICS **à l'intérieur** du bloc de brief a été **tronqué en deux** à la copie. Le cousin l'a signalé, a exécuté ce qui était complet et **a refusé de deviner le reste**. → **RÈGLE : un brief = UN SEUL BLOC, jamais de bloc imbriqué.** Portée aux INSTRUCTIONS.
- **LA « MAUVAISE PREVIEW » A ENCORE FRAPPÉ — et a été levée par la preuve.** L'observation « rien le J+1 » avait d'abord été faite en **prod** (qui ne contient pas le commit 2). Le tableau de bord Vercel a tranché : le déploiement `2cfad37` était bien Ready sur la branche de #42 → l'observation refaite sur la bonne preview a **confirmé** le défaut. Doctrine appliquée : suspecter la cible AVANT le code, mais **prouver** au lieu de supposer.
- **UNE PR NON MERGÉE A QUAND MÊME SA PREVIEW.** Vercel déploie chaque branche poussée. Ne pas conclure « pas mergé donc pas testable ».
- **UNE BRANCHE ANTÉRIEURE À UN MERGE NE CONTIENT PAS CE MERGE.** #42 avait été créée avant #43 et #44 : la tester en l'état aurait reproduit l'ancien comportement. **Reposer le commit sur le `main` actuel AVANT de tester.**

### 🔑 DÉCOUVERTE ADJACENTE — EVENTFORM NE SAIT PAS ÉCRIRE UN EVENT À CHEVAL
**PROUVÉ au code** : `EventForm.jsx:236` **recolle activement** `endDate` sur `startDate` à chaque changement de date, et **aucun champ de date de fin n'existe en mode horaire** (le champ « Au », `:270-274`, est réservé à la branche all-day). Les 3 points d'entrée convergent (`EventForm.jsx:73`, `App.jsx:630`, `App.jsx:502`). Confirmé **à l'écran** par le capitaine (formulaire : DATE 06/08 · DÉBUT 23:30 · FIN 01:45 — une seule date).
→ **NomadCal ne peut pas CRÉER un event qui déborde sur minuit.** Le fix de rendu sert donc, pour l'instant, les seuls events venus d'Apple.
→ **Item d'ÉCRITURE, hors R1**, à loter avec/avant R2 (qui touche déjà EventForm). `pushEvent.js:17` n'est qu'un **relais fidèle** — rien à corriger en zone sacrée.

### 🧹 MÉNAGE (04-08, 00h45)
- **#42 fermée sans merge** (contenu en prod via #43 + #45), commentaire laissé sur la PR.
- **4 branches supprimées** après preuve : `r1-lot-a` (`2cfad37` — preuve **par contenu**, non-ancêtre car cherry-pické), `r1-item3` (`e965c88`), `r1-item1-tz` (`4262b4f`), `r1-item1-segments` (`d1c84ff`).
- **⚠️ Le proxy de la session cloud REFUSE `git push --delete` (403 = politique).** Le cousin a signalé sans contourner (conforme au README du proxy) ; suppression faite par le capitaine depuis l'interface GitHub (onglet Branches → corbeille).

---

## 🎨 CHARTE GRAPHIQUE ORCHARD — SCELLÉE (30-07-26)
*Brainstorm couleurs + typo en session pleine → charte transverse `Orchard_CHARTE_GRAPHIQUE_300726_1858.md` (Projets NomadCal + NomadMail + `Contexte/`). Elle fait loi sur TOUT le visuel Orchard ; son mode de déploiement est stipulé EN elle (le neuf naît conforme, l'existant migre au fil de l'eau, sans big-bang).*
- **9 couleurs, pas une de plus** : crème page `#FDF8F0` + olive voile `#F1EFDE` (fonds) · olive doré `#B5AE79` / Orchard `#7D7742` / profond `#4A4526` (structure) · corail Orchard `#E78067` + corail profond `#A8492F` (accent rare) · encre `#2B2A25` + encre douce `#6B675C` (débleuies). **Le bleu est débarqué.**
- **Corail certifié AU BRUT** : `#E78067` extrait au pixel d'une capture NomadMail (1 680 px purs, pas un choix à l'œil). Même mesure : crème page confirmé.
- **Signature Orchard** = bouton olive profond / texte corail Orchard, contraste MESURÉ 3,54:1 → **Bold ≥13px obligatoire**. La piste « corail profond sur olive » (1,69:1) rejetée sur mesure WCAG : le brut a tranché contre l'intuition, méthode assumée par le capitaine.
- **Gradation d'états SANS intermédiaire ambre** (olive → corail) = « la touche moderne », décision capitaine. Pas de 10ᵉ couleur.
- **Typo deux voix** : Phenomena titre et signale (Bold 700 · Regular 400 · Light 300), la système raconte (paragraphes SEULS). Le petit reste Phenomena : Regular + letter-spacing +0,3px, plancher 12px, jamais Light.
- **⚠️ LEÇON (le brut vaut aussi pour une police)** : le timonier a gravé une graisse « Medium 500 » qui N'EXISTE PAS dans la famille Phenomena — corrigé par le capitaine au réel des fichiers. 5 corrections en cascade (dont bouton signature promu Bold pour tenir le garde-fou WCAG). Graver = vérifier au réel d'abord, même en design.
- **Icônes : règle unifiée PAR TAILLE** (rendu ≤32px → stroke 2 · >32px → stroke 1.5) — réconcilie les pratiques divergentes NomadCal (1.5) / NomadMail (2). **Ancien duo bleu/or OBSOLÈTE**, migration au fil des retouches.
- **Polices déposées** : `public/fonts/` du repo (Light/Regular/Bold), licence conservée en local. Actifs de production = dans le code, jamais dans `Contexte/`.

## 📚 RÉORGANISATION DOC — SCELLÉE (29-07-26)
*Refonte de l'architecture des fichiers contexte pour réduire la consommation de tokens et accélérer les reprises.*
- **Nouvelle architecture :** 4 moteurs en double Projet + `Contexte/` (Instructions, README, État, **ROADMAP** — nouveau) · **Journal + Vision → GitHub `Contexte/` SEULEMENT** (le Journal était le plus gros poste de contexte permanent alors qu'il se consulte à la demande).
- **FONCTION_RAPPORT** fusionné dans la Roadmap (lot R4) — le fichier indépendant a rempli son rôle, supprimé partout après vérif capitaine.
- **Le README moteur devient SOURCE UNIQUE du technique** : sacrées, deux `caldav.js`, vigilances, + nouvelle section **DOCTRINE** (15 réflexes terrain extraits du Journal — le Journal garde le récit, le README garde les règles).
- **Règle de VIDANGE de l'État gravée** : chantier scellé → migre au Journal LE JOUR MÊME, l'État garde une ligne de renvoi. Cible ~1 page.
- **Doctrine de BATCH gravée aux Instructions** : une variable à la fois STRICT en zone sacrée ; batch par famille autorisé ailleurs (c'est l'isolation d'archi qui autorise, pas l'envie d'aller vite).
- **Taxonomie des 5 briefs + test tuyau cloud** montés des préférences/État vers les Instructions du projet.
- **Horodatage : passage à `JJMMAA_HHMM`** (heure de livraison incluse).

## ✅ PÉRIODES NOMADBOOK — CHANTIER COMPLET (C + C-bis + TABLE RASE + MIGRATION) — SCELLÉ (19-07-26 SOIR)
*Suite et FIN du chantier périodes. De « 6 notes disparues » (matin, iPhone) à « 10 notes rangées » (soir, desk). Zéro perte. `pushEvent`/`deleteEvent` jamais touchées.*

- **C-bis (#40, mergé) — le 8ᵉ site oublié.** Le lot C (#39) prétendait « 7 sites alignés » mais en avait manqué UN : le compteur de la pastille du pied de page, dans `App.jsx` (IIFE `noteCount`, `cur.uid`). Hors zone balayée par C (NomadBook.jsx + caldavCalendar.js). Fix `cur.uid -> cur.href`, +1/−1. Le cousin #39 l'a reconnu honnêtement (« mon "tous les filtres alignés" était inexact »). LEÇON : « tous les sites » n'est jamais sûr sans un grep hors de la zone évidente.
- **LA CLÉ DU FILTRE = HREF COMPLET, prouvé au brut de l'écran.** Après C-bis, les notes portant `rapport-2026-09-07` (forme courte) restaient INVISIBLES en prod. Une note test créée en prod a révélé sa vraie clé : `/1012673262/calendars/nomadcal-oc/rapport-<fin>.ics` (href COMPLET, avec `.ics`). Aucune des 10 notes historiques n'avait cette forme -> toutes invisibles. LEÇON : ne jamais deviner la forme d'une clé ; la relever sur une note qui S'AFFICHE (terrain-first).
- **PIÈGE PREVIEW/PROD.** Le test C-bis « pastille apparaît » avait été fait sur PREVIEW (bac localStorage isolé, quasi vide). En PROD (vrai bac, 10 notes), « aucune note ». Preview ≠ prod : bacs séparés (WKWebView). Toujours tester la migration sur le bac réel, après force-refresh.
- **TABLE RASE CAPITAINE = alternative élégante au lot A.** Plutôt que le dédoublonnage iCloud chirurgical (DELETE ciblé, brief lourd, irréversible), le capitaine a SUPPRIMÉ toutes les périodes dans NomadBook puis RECRÉÉ 5 périodes propres à la main. PROPFIND après : **5 ressources, une par période**, fraîches (PRODID //NomadCal//FR). Plus AUCUN jumeau. -> LOT A rendu SANS OBJET.
- **RECRÉATION -> nouvel UID mais MÊME href slug.** `createPeriodEvent` génère un UID neuf (`nomadcal-rapport-<nouveau_ts>@nomadcal`) mais le fichier reste `rapport-<endISO>.ics` (dérivé de la date de fin inchangée). Comme le filtre matche sur le HREF (pas l'UID), l'alignement des notes reste stable. C'est la clé de la manœuvre.
- **MIGRATION DES NOTES = par RESTAURATION, pas par code.** Export Settings -> periodId des 11 notes réécrits (par le timonier) sur le href complet du survivant -> restauré via Settings (« Restaurer les données »). Résultat prouvé à l'écran : **10 notes Juil–Sept + 1 Juin–Juil**. Avantages : zéro code jetable (Neon réécrira), réversible (ancien backup = filet), visible à l'écran. « Minimum de code V1 » respecté.
- **DOUBLON iCAL Juin–Juil = FANTÔME de cache Mac** (PROPFIND montre 1 seule ressource). Ignoré, se purge côté Apple. NE PAS supprimer depuis iCal (doctrine 11/07 : le brut prime, ne jamais supprimer un fantôme sans preuve).
- **RESTE (cosmétique) :** supprimer les notes de test (Test B, TEST C1). Fonction rapport NomadBook désormais DÉBLOQUÉE (notes rangées par période). *(Épilogue 03-08 : fait au lot N.)*

## 🧭 SESSIONS COUSIN = CLOUD, PAS DESKTOP LOCAL — CLOUÉ (19-07-26)
*Une soirée perdue à croire le « canal GitHub cassé ». Il n'était pas cassé : les fils cousin étaient ouverts au mauvais endroit.*
- **Le cousin (Claude Code) ne pousse/ouvre une PR QUE depuis une session CLOUD** (VM Anthropic, proxy GitHub `127.0.0.1:...` + `$GH_TOKEN=proxy-injected` provisionnés au boot). Une session **Desktop LOCALE** tourne sur le Mac : pas de proxy, `git push` -> `could not read Username`. Symptômes du fil local : `mdfind`/Spotlight, chemins `Library/CloudStorage/OneDrive...` = machine de l'user.
- **REPÈRE VISUEL : l'icône de BRANCHE à côté du fil = session cloud (canal OK).** Pas d'icône = local (pas de canal). À vérifier AVANT tout brief qui doit pousser.
- **Ouvrir une session cloud :** `claude.ai/code` + sélecteur repo -> NomadCal ; OU clic droit sur un fil -> Ouvrir dans -> Cloud.
- **Prérequis (une fois) :** Claude GitHub App autorisée sur le compte avec accès à NomadCal (github.com/apps/claude -> Configure).
- **Test tuyau (5 s) avant brief lourd :** `echo $GH_TOKEN` (=`proxy-injected`) · `git remote -v` (réécrit proxy) · repo déjà cloné à l'arrivée.
- **SÉCURITÉ : jamais de PAT dans le chat.** Le token proxy est injecté par l'environnement, non reproductible en collant un secret. Se règle côté interface/connecteur.
- **⚠️ LE PROXY REFUSE AUSSI CERTAINS GESTES (ajout 04-08)** : `git push --delete` d'une branche → **403 de politique**. Le README du proxy dit : ne pas réessayer, ne pas contourner, **signaler**. Geste à faire par le capitaine depuis l'interface GitHub.
- **La doctrine « mauvaise preview » (14/07) resservie en géant :** un fix qui « ne marche pas » -> suspecter la CIBLE (ici : le mauvais type de session, le mauvais repo OneDrive stale) avant de suspecter le fond.

## ✅ PÉRIODES NOMADBOOK — LOT C : IDENTITÉ FIGÉE — SCELLÉ EN PROD (#39, 19-07-26)
*Chantier NomadBook. Chaîne complète : alerte terrain 16/07 → INVESTIGUER code → PROPFIND serveur → INVESTIGUER→CONSEILLER cousin → brief EXÉCUTER → PR testée au brut → merge. `pushEvent`/`deleteEvent` jamais touchées.*

- **LE BUG, ENFIN COMPRIS.** Les notes NomadBook filtrent sur `note.periodId === currentPeriod.uid` (STRICT, `NomadBook.jsx:469`). L'UID d'une période était **réécrit** par `updatePeriodEvent` (`caldavCalendar.js:276` : `uid = href.split("/").pop().replace(".ics","")`) → la période changeait d'identité → les notes figées sur l'ancien UID (`:601`) devenaient invisibles.
- **DÉCOUVERTE-CLÉ (remontée par le cousin avant de coder) :** le déclencheur n'était PAS l'édition manuelle mais **`syncNoteCount`, appelé à CHAQUE ajout de note** (`caldavCalendar.js:405-406`, déclenché `NomadBook.jsx:608`). → écrire une note réécrivait l'UID de sa propre période. **Résout le mystère du 16/07** : la note « marché » n'a pas disparu par une édition fantôme à 8h42 ; l'écrire a suffi. Leçon : le déclencheur d'un bug peut être un geste anodin et fréquent, pas l'action « évidente ».
- **CE QUI EST EN PROD (#39, `+12/−11`, 2 fichiers) :**
  - **C1** — `updatePeriodEvent` reçoit `uid` en **paramètre** et le réémet tel quel ; `href.split(...)` supprimé (`:276`). `syncNoteCount` propage l'UID. → la bascule à l'ajout de note ET à l'édition est éliminée d'un coup (même chemin).
  - **C2** — **7 sites** de filtre note↔période alignés sur la clé stable `period.href` (préservée par `:290`, contient déjà l'endISO) : `:469`, `:475`, `:601` (fabrication), `:633`, `:655`, `:789`, `:856`. Le cousin a remonté `:633`/`:655` que le brief timonier avait oubliés (`:655` = `deletePeriod` : le laisser sur `.uid` aurait créé une incohérence supprimer↔afficher).
- **PREUVE AU BRUT (preview, ressource `…1782035089446@nomadcal`, ajout d'une note de test) :** `getetag mrg6ps2h→mrg6ps2i`, `DTSTAMP →20260719T153852Z` (PUT frais) **MAIS `UID` INCHANGÉ** — n'est PAS devenu `rapport-2026-09-07` comme avant le fix. Note de test **survit au refresh**. ✅ C1 + C2 prouvés.
- **DÉCISIONS CAPITAINE (scellées 19/07, valent pour B et A) :** survivant par paire = slug `rapport-<endISO>.ics` (clé dérivable) ; clé stable = `href` ; **3 lots séparés C→B→A**, A irréversible, B avant A.
- **LEÇON MÉTHODE — le timonier s'est trompé DEUX fois, rattrapé à chaque fois.** (1) Pari initial (b) « deux périodes distinctes » → INVESTIGUER 16/07 tranche (a) « une identité qui bascule » au code. (2) Puis le PROPFIND 19/07 ressuscite (b) au SERVEUR (jumeaux réels) — les deux étaient vrais. (3) Extrapolation « Apple réécrit l'UID depuis le basename » = NON prouvée, abandonnée après objection capitaine. **Le doute inscrit dans les briefs + l'objection du capitaine ont évité de graver du faux.**
- **ORIGINE DES JUMEAUX = ancienne + manuelle (témoin capitaine direct).** Doublons vus à plusieurs reprises AVANT l'incident du 16/07 → ce ne sont pas des enfants du bug `periodId`, mais son terreau.

## 🔬 BRUT PÉRIODES — 10 RESSOURCES RÉELLES + EXPORT CLIENT MENTEUR — CLOUÉ (19-07-26)
*PROPFIND nomadcal-oc au Web Inspector (desk). Lecture seule. Le juge = le PROPFIND, pas l'export.*
- **10 ressources = 5 périodes × 2 (paires).** Chaque paire partage la **date de fin** (même `endISO` → même slug de fichier), avec 2 href/UID distincts : un `nomadcal-rapport-<ts>@nomadcal` + un `rapport-<fin>` (PRODID //Apple). → jumeaux **réels sur iCloud**, pas fantômes.
- **Le champ `📊 Notes saisies` (description) porte le compteur au brut.** Juil–Sept : slug=7, UID=2 → cohérent avec l'export natif 16/07 (9 notes coupées 7/2). Zéro perte confirmée côté serveur.
- **EXPORT macOS `NomadCal_OC.ics` = COPIE CLIENT MENTEUSE.** 11 VEVENT, dont **3** pour Juil–Sept (PRODID //Apple//macOS, X-WR-ALARMUID empilés) → mais le PROPFIND n'en montre que **2**. Le 3ᵉ = fantôme de cache Mac. ⚠️ **Ne JAMAIS compter les jumeaux à supprimer depuis un export client** — uniquement au PROPFIND, href par href.
- **Les périodes ne passent PAS par `mergeStrategy.js`** → le fix B (#38) ne les protège pas. Tuyauterie propre : `caldavCalendar.js` + `nb_periods_cache`.

## ✅ RÉCURRENCE-ÉDITION + EVENTFORM + FIX B — SCELLÉS (14→15-07-26)
*Passés de l'État au Journal. Prouvés au brut, mergés, Vercel vert.*
- **Récurrence-édition OK — PR 1 (#35 `pushOccurrenceException`) + PR 2 (#36 enqueue offline).** Édition d'occurrence online+offline → 1 href / 2 VEVENT (master RRULE + exception `RECURRENCE-ID` heure murale locale sans `Z`), master intact. GET-modify-PUT sur href master, fonction voisine (pas de branche dans `pushEvent`).
- **EventForm MERGÉ (#37) — 3 lots au brut.** LOT 1 roue des jours adaptative (bissextile, clamp) · LOT 2 intervalle libre A1 `composeRRule` + `parseRRuleToUI` (`pushEvent` inchangée, `rrule` reste une string) · LOT 3 UNTIL DST-safe (`new Date(y,mo-1,d,23,59,59).toISOString()` → `…215959Z`) + `INTERVAL=1` jamais écrit. Brut : `FREQ=WEEKLY;UNTIL=…215959Z;INTERVAL=6;BYDAY=TH` ✅.
- **FIX BUG B MERGÉ (#38) — fantôme mort.** `mergeStrategy.js` seul (`+7/−1`) : `roundTrippedMasters` (Set des `masterUid` iCloud) + condition `!(e.rrule && roundTrippedMasters.has(e.id))` sur la branche `_pending`. Zéro sacrée, zéro DELETE ajouté. **4 scénarios au brut, zéro perte.** ⚠️ Ne couvre PAS : supprimer une occurrence *normale* efface encore la série (href hérité) → chantier sélecteur d'étendue (R3).

## ✅ FIX BUG A — PR #35 SCELLÉE EN PROD (14-07-26)
*Premier fix sur voisinage de sacrée mené de bout en bout via le trio. `pushEvent` jamais touchée.*
- **CE QUI EST EN PROD :** `pushOccurrenceException(ev,auth)` (fonction voisine, `src/sync/pushEvent.js`) + routage save handler (`App.jsx`, `editMode==="this"`) + export barrel (`index.js`). **`pushEvent` INTACTE**.
- **MÉCANIQUE = GET-modify-PUT** sur le href master : relire l'ICS existant → ajouter/remplacer le VEVENT exception (matching `RECURRENCE-ID`) → PUT. Master préservé à l'octet près (RRULE incluse), multi-exceptions natif.
- **PREUVE AU BRUT (preview, série fraîche Apple natif) :** 1 édition → 2 VEVENT ; 2ᵉ/3ᵉ → 3 puis 4 VEVENT, master toujours intact ; `RECURRENCE-ID;TZID=Europe/Paris:<origine>` heure murale locale, **pas de `Z`** ; offline → message de blocage, **zéro écriture**.
- **2 finitions avant merge (`ca19691`) :** `X-RECURRENCE-EXCEPTION` écrit en double → retiré · VEVENT exception uniformisé (`CREATED`/`LAST-MODIFIED`/`SEQUENCE:0`).
- **⚠️ LEÇON — la mauvaise preview a failli faire valider un faux positif.** Un brut montrait les 2 corrections ABSENTES → on inspectait l'**ANCIENNE preview**. Les DEUX absentes d'un coup = signal que ce n'est pas le code mais la cible. **Vérifier titre/URL du Web Inspector + force-refresh AVANT de conclure.**
- **DOUBLON D'AFFICHAGE POST-MODIF** → chantier séparé, devenu **item 2 du lot R1**, corrigé au #41 (04-08) — et la cause n'était PAS celle supposée ici.

## 🔎 BUG B NON REPRODUIT + CONFUSION A/B LEVÉE — CLOUÉ (13-07-26)
- **Création d'un récurrent = SAINE (PROUVÉ).** Brut = une seule `<response>`, master pur, `RRULE:FREQ=WEEKLY;INTERVAL=1`. Le doublon décrit par la fiche B **n'apparaît PAS côté serveur**.
- **Édition d'une occurrence = BUG A, pas B (PROUVÉ).** `UID` suffixé, **RRULE disparue** = écrasement du master.
- **CONFUSION A/B LEVÉE.** Deux bugs de « famille identité master↔occurrence » se ressemblent au vécu ; **seul le brut les sépare**.
- **CIBLE DU FIX A — PROUVÉE AU BRUT.** « même ressource / 2 VEVENT » (modèle A). Le brief initial disait « ressource séparée / 2 href » (modèle B) = **ERREUR de rédaction du timonier**, levée par le cousin PUIS tranchée au brut.
- **MÉCANIQUE TRANCHÉE = GET-modify-PUT.** Reconstruire le master depuis le state REJETÉ.
- **DÉCISION ARCHI = fonction voisine, PAS de branche dans la sacrée.**
- **ETag/If-Match OMIS en V1 mono-device (dette tracée) → OBLIGATOIRE avant version DESK.**

## 🩸 BUG A CONFIRMÉ TERRAIN iCLOUD + FANTÔME D'AFFICHAGE iCAL — CLOUÉ (11-07-26, soir)
- **Bug A = ÉCRASEMENT, prouvé.** Une seule `<response>`, un seul VEVENT sans RRULE → la série n'existe plus sur iCloud.
- **Le « doublon » d'iCal = FANTÔME D'AFFICHAGE APPLE.** Serveur = 1 ressource → cache local non resynchronisé.
- **⚠️ CACHE PAR-APPAREIL.** Purger le serveur ne rafraîchit pas chaque client ; nettoyage = geste **sur chaque appareil**.
- **Les 3 fenêtres, vérité au centre : iCloud = LA VÉRITÉ. NC = FIDÈLE. iCal = MENTAIT (cache).** *(Ajout 04-08 : le rapport peut s'inverser — sur `TEST MINUIT`, iCal disait vrai et NC mentait. La fenêtre tierce est un INDICE, jamais une preuve : seul le brut tranche.)*
- **EXCEPTION AU PROTOCOLE « ne jamais supprimer depuis iCal » — levée proprement** car le brut avait **prouvé** qu'aucune ressource réelle ne vivait derrière.
- **⚠️ Le fantôme n'est PAS effacé rétroactivement par un fix.**

## 🛑 RÈGLE — SERVEUR iCLOUD EN MAINTENANCE = OBSERVATION SUSPENDUE (12-07-26)
- **503 / « verrouillé » / « maintenance » = serveur absent.** Toute observation suspendue : bruts non fiables.
- **Event créé pendant le 503 = né corrompu** → à jeter.
- **Reprise :** vérifier qu'iCloud répond AVANT de recréer les cas de test.

## 🔬 INVESTIGATION LARGE « FABRIQUE À DOUBLONS » → 3 BUGS DISTINCTS — CLOUÉ (11-07-26)
- **Verdict racine : MULTIPLE, N = 3 bugs distincts.** Deux `toISO` divergents (`helpers.js:13` locale vs `caldav.js:211` UTC). *(⚠️ 04-08 : cette dette a MORDU — voir l'entrée R1 en tête. Elle était la cause racine du bug C.)*
- **Bug A** — édition d'occurrence écrase la série. ✅ Corrigé (#35).
- **Bug B** — fantôme à la création. ✅ Corrigé (#38).
- **Bug C** — event à cheval sur minuit. ✅ Corrigé (#44 cause racine + #45 segments, 04-08).
- **Leçon :** une intuition « racine commune » infirmée garde sa valeur — elle a déclenché la cartographie qui a séparé 3 bugs.

## ✅ α NEUTRALISÉ (SCOPÉ LECTURE SEULE) — SCELLÉ EN PROD (10-07-26)
- **Commit `ac0a025`** — `READ_METHODS = {PROPFIND, REPORT}` → timeout 20 s sur ces deux seulement. PUT / DELETE / MKCALENDAR → `fetch` nu. Risque de doublon iCloud ÉLIMINÉ. NB : PUT tunnelé en POST.

## 🧭 BRIEF EVENTFORM AVISÉ + ROADMAP RÉCURRENCE ÉTAGÉE — CADRÉ (12-07-26)
- **Roadmap récurrence = objectif FERME, chemin étagé.** Compositeur complet (A1→A4 + COUNT) = ticket d'entrée sortie publique, PAS optionnel. **A1 (intervalle libre) en V1.**
- **Le cousin AVISE (protocole payant).** LOT 2 jugé TRIVIAL. Calcul UNTIL DST-safe validé.
- **Décision design LOT 2 = « unité + champ N »** ; positionnels retirés de l'UI V1 mais **restent lisibles**.

## 🍏 CONFORMITÉ NC vs APPLE + BRIQUE 2 (UNTIL) — CLOUÉ (12-07-26)
- **NC déjà QUASI CONFORME à Apple (PROUVÉ).** Écart unique = verbosité (`INTERVAL=1`) → nettoyé (#37).
- **FORMAT UNTIL D'APPLE — CAPTURÉ :** `UNTIL=20260930T215959Z` = fin de journée LOCALE convertie en UTC + `Z`. DST-safe obligatoire (`getTime()`).
- **DÉCISION BRIQUE 2 : `UNTIL`, PAS `COUNT`** (rythme terrain = saison commerciale). *(COUNT reste au lot R2.)*

## 🔧 LEÇONS WEB INSPECTOR (méthode)
- **Clés localStorage PRÉFIXÉES, préfixe VARIABLE.** `Object.keys(localStorage)` d'abord.
- **Où taper une commande :** BAS de l'onglet **Console** (`>`).
- **`copy(x)` renvoie `undefined`** (normal) mais met au presse-papier.
- **La recherche du panneau ment sur les gros XML** → lire/compter à l'œil.
- **Requêtes CalDAV tunnelées en POST** vers `/api/caldav`.
- **Repère d'un event = sa ligne `SUMMARY:`** ; distinguer 2 jumeaux par leur `UID:`.
- **Ce qu'on surveille sur un PUT test = le champ ciblé, pas l'`getetag`.**
- **⚠️ Ajout 04-08 : le DebugPanel (`Réglages → debug`, `DebugPanel.jsx:91`) affiche le `rawICS` complet** — artefact décisif accessible depuis l'iPhone, sans desk ni Web Inspector.

## 🗺️ RÉCONCILIATION DOC ↔ ARCHI RÉELLE — SCELLÉE (06-07-26)
- **README racine = SOURCE D'ARCHI CERTIFIÉE** (`main` @ `7d7763a`). README moteur = ossature + renvoi.
- **`src/sync/`** = cœur offline-first / ÉCRITURE. **4 sacrées :** `pushEvent`/`deleteEvent` → `src/sync/pushEvent.js` ; `syncCalendar`/`syncCalDAV` → `src/App.jsx`. PAS dans `caldav.js`.
- `icons/` = 25 SVG. `NomadTask.jsx` (pas `TaskDrawer.jsx`).

## 🧬 LIGNÉE `main` — CLOUÉE PAR LE COUSIN (05-07-26)
- **#31 (`4c2d5cc`)** a tout amené en prod. **#32 (`b73e5c0`) jamais en prod.** ⚠️ Reverter `4c2d5cc` = INTERDIT.

---

## ✅ COUCHE 2 LECTURE — SCELLÉE (PR-a lit, PR-b fusionne)
- **PR-a (`70e595e`)** : `parseEvents` découpe TOUS les VEVENT (regex `/g`). **PR-b (`349ade1`)** : `mergeRecurrenceExceptions` au rendu, `RECURRENCE-ID` → `getTime()` local. ⚠️ Fusion au RENDU, pas dans la donnée.

## ✅ SYNCHRO — CLOSE ET MERGÉE EN PROD
- **Tunneling `e1e7763`** (#31). Prod 401 = clé révoquée → "Se déconnecter" · Preview 405 = Vercel bloque WebDAV → tunneling POST + `X-HTTP-Method-Override` · Preview 401 = coquilles → coller la clé.

## ✅ COUCHE 1 RÉCURRENCE — SCELLÉE
- DST-proofing : `getTime()` pour UNTIL ; helpers date locale pour EXDATE — jamais `.toISOString().slice(0,10)` (UTC → off-by-one). *(⚠️ 04-08 : cette règle existait DEPUIS LE DÉBUT et n'avait pas été appliquée à `expandRecurring` — d'où #44. Une règle écrite n'est pas une règle appliquée : d'où le lot d'audit temporel.)*

## 🧭 LEÇONS MÉTHODE (gravées — anti-perte de temps)
- **TOUJOURS se redonner le lien preview EXACT + vérifier le titre du Web Inspector** avant d'inspecter.
- **Lire le brut AVANT de conclure « aucune fenêtre n'a raison »** — souvent l'une est fidèle.
- **Inspecter la PROD est permis en LECTURE SEULE** quand l'état du bug y vit déjà. « Jamais la prod » vise l'ÉCRITURE.
- **Serveur en maintenance = observation suspendue.**
- **Export client (ICS iCal/macOS) = copie du CACHE**, peut mentir → le PROPFIND prime.
- **WeekCal ≠ Apple natif** pour la structure iCloud → cas de test dans Apple natif.
- **Le timonier aussi doit prouver au brut avant de graver une cause/cible.** Le doute s'inscrit dans le brief, ne se grave pas.
- **L'objection du capitaine est un garde-fou.**
- **⚠️ Ajout 04-08 : FIXER LE CAS DE TEST AVANT D'ÉCRIRE LE BRIEF, et l'inscrire DEDANS** (quel event, créé où, quel calendrier, quelle preview, quel écran attendu). Cause n°1 de la dérive du lot R1.
- **⚠️ Ajout 04-08 : un brief = UN SEUL BLOC, jamais de bloc imbriqué** (un ICS collé dans un brief l'a tronqué en deux).
- **⚠️ Ajout 04-08 : savoir ce qu'un affichage ne montre PAS.** Le popover n'affiche pas la date de fin → il « confirmait » une donnée en réalité fausse.
- **⭐ Ajout 04-08 (lot T) : MESURER LA POPULATION AVANT DE CORRIGER.** Un défaut prouvé au code n'a pas forcément de cas dans le réel. L'inventaire terrain (4 bruts, 10 min, zéro écriture) a fait passer une famille entière d'« urgente » à « dette tracée ». **Le brut avant la priorité, pas seulement avant la cause.**
- **⭐ Ajout 04-08 (lot T) : UN BRIEF EST AUTOPORTANT.** Le cousin ne lit pas la conversation timonier↔capitaine et `Contexte/` peut être en retard. Tout se recopie DANS le brief — jamais « voir le rapport dans l'État ».
- **⭐ Ajout 04-08 (lot T) : interdire explicitement le PATCH dans un CONSEILLER ou un CERTIFIER.** Sinon c'est un EXÉCUTER déguisé : la décision capitaine ne peut plus s'intercaler.
- **⭐ Ajout 04-08 (lot T) : le CARBURANT est TRANSVERSAL.** La session cousin puise au même réservoir. Compter la chaîne entière avant un EXÉCUTER (brief → avis → code → PR → **test terrain** → merge). **Jamais de PR orpheline.**
- **⭐ Ajout 04-08 (lot T) : REPÈRES DE TEMPS HONNÊTES.** Le timonier ne connaît pas l'heure du capitaine : dire « maintenant » / « à la reprise », jamais « ce soir » ou « demain ». Un repère d'horloge inventé crée de la confusion (et se lit à l'envers : « dans 2h34 » était l'heure du ravito, pas un délai).
- **⭐ Ajout 04-08 (lot T) : un ÉCRAN INATTENDU pendant un test n'est pas une preuve.** Sur le test PR-A, trois causes étaient possibles (mauvaise date posée · état d'app incohérent · régression) sans moyen de trancher. **Exiger la date réelle du device AVANT de conclure** — suspecter la cible avant le code, une fois de plus.

## 🗂️ ARTEFACTS DE RÉFÉRENCE
- **Certification archi : `main` @ `7d7763a`.**
- Commits/PR : `ac0a025` (α) · `4c2d5cc` (#31) · `e1e7763` (tunneling) · `70e595e` (PR-a) · `349ade1` (PR-b) · `ca19691` (#35) · #36 · #37 · #38 · #39 · #40 · **#41 (clé de masquage, `b6cca57`)** · **#43 (item 3, `e965c88`)** · **#44 (cause racine fuseau, `4262b4f`)** · **#45 (segments jour, `d1c84ff`)** · **#46 (lot T, famille 2, `adbab38` — base `9b08e5e`, branche `claude/nomadcal-t-famille2`)**. *(#42 fermée sans merge, contenu repris dans #45.)*
- **Calendrier de test : `ZZ-TEST-REC`** · **Calendrier périodes : `nomadcal-oc`**.
- **Cas de test R1 : `TEST MINUIT`** — Apple natif, `ZZ-TEST-REC`, jeu. 6 août 2026 23h30 → ven. 7 août 01h45, récurrent hebdo. **Le seul qui exerce la segmentation.** ⚠️ Ne pas l'éditer depuis NomadCal (le formulaire écraserait sa date de fin). ⚠️ **Il ne teste RIEN en famille 1a** (Apple natif = TZID).
- **Cas de test lot T : « FORMULAIRE VEILLE »** — aucun event, aucune écriture. Horloge du device posée à la **veille du 1er jour d'une période**, ~23h58 → observer la bascule à minuit. Reproductible à volonté, sans toucher à `ZZ-TEST-REC` ni à `nomadcal-oc`.
- Backups locaux : export natif Settings 6 clés (16/07 12:49 + 19/07 20h56, 11 notes) + backup corrigé restauré. ⚠️ ne couvrent pas `nb_periods_cache` ni `cf_events`.
