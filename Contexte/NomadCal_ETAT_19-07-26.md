# ÉTAT DU PROJET NOMADCAL
*Document VIVANT — l'établi : SEULEMENT le chantier actif, les vérifs ouvertes, la reprise. Le déjà-fait scellé vit dans le JOURNAL/ACQUIS. Dernière MAJ : 19/07/2026 SOIR (**CHANTIER PÉRIODES CLOS** — C #39 + C-bis #40 mergés ; table rase des doublons + migration des notes par restauration ; **10 notes retrouvées, prouvé à l'écran** ; plus de jumeaux au brut ; lot A devenu SANS OBJET).*

---

## ✅ CHANTIER PÉRIODES NOMADBOOK — TERMINÉ (19-07)
*De l'alerte « 6 notes disparues » (matin, iPhone solo) à « 10 notes rangées » (soir, desk). ZÉRO perte de bout en bout. Chaîne : INVESTIGUER → PROPFIND → briefs cousin → C #39 → C-bis #40 → table rase capitaine → migration par restauration.*

### Ce qui a été fait, dans l'ordre
1. **LOT C — identité figée (#39, mergé).** `updatePeriodEvent` préserve l'UID (paramètre) au lieu de le dériver du basename ; 7 sites note↔période alignés sur `period.href`. Découverte : la bascule venait de `syncNoteCount` à CHAQUE ajout de note (pas de l'édition).
2. **C-bis — 8ᵉ site (#40, mergé).** Le lot C avait MANQUÉ un compteur dans `App.jsx` (IIFE `noteCount` du pied de page, resté sur `cur.uid`). Fix : `cur.uid → cur.href`, +1/−1. Prouvé au brut (UID inchangé après note test) + à l'écran (pastille réapparaît). **Les 8 sites sont désormais sur `href`.**
3. **TABLE RASE (capitaine, à la main).** Toutes les périodes supprimées dans NomadBook, puis **5 périodes recréées proprement** (une par saison). → plus AUCUN jumeau. Prouvé au PROPFIND : **5 ressources, une par période**, fraîches (PRODID //NomadCal//FR, DTSTAMP 19/07 ~19h17-19h19).
4. **MIGRATION DES NOTES (lot B, par restauration).** Backup exporté → periodId des 11 notes réécrits sur le **href complet** du survivant (`/1012673262/calendars/nomadcal-oc/rapport-2026-09-07.ics` pour Juil–Sept, `.../rapport-2026-07-06.ics` pour Juin–Juil) → restauré via Settings. **Résultat prouvé à l'écran : 10 notes visibles dans Juil–Sept + 1 dans Juin–Juil.** BINGO.

### Leçons-clés de ce chantier
- **La clé du filtre = le HREF COMPLET** (`/1012673262/calendars/nomadcal-oc/rapport-<fin>.ics`), PAS la forme courte `rapport-<fin>`. Prouvé par une note test qui s'affiche (son periodId = href complet). Ne jamais deviner la forme de la clé : la relever sur une note VISIBLE.
- **Preview ≠ Prod = bacs localStorage séparés** (isolation WKWebView). Tester la migration se fait sur le BON bac (prod), après force-refresh. Une pastille vue en preview n'est pas la prod.
- **Le CODE passe en prod au merge (#40), pas les DONNÉES.** Corriger les notes = geste de données séparé (export/corriger/restaurer), pas un déploiement.
- **Table rase capitaine = alternative au lot A.** Supprimer + recréer proprement (à la main, geste maîtrisé) a REMPLACÉ le dédoublonnage iCloud chirurgical. Plus simple, sans brief EXÉCUTER lourd, sans DELETE ciblé. LOT A devenu SANS OBJET (plus de jumeaux).
- **Migration par restauration > migration par code.** Aucun code embarqué jetable (Neon réécrira), réversible (ancien backup = filet), résultat visible à l'écran. « Minimum de code V1 » respecté.
- **Recréer une période génère un nouvel UID mais le MÊME href slug** (dérivé de la date de fin, inchangée) -> le filtre `href` reste stable. C'est pour ça que l'alignement tient.

### Reste à faire (léger, cosmétique)
- **Supprimer les notes de test** : « Test B » et « TEST C1 – à supprimer » si elle traîne (dans le backup restauré, alignées mais à retirer à la main).
- **Doublon iCal Juin–Juil (02/06->06/07)** = FANTÔME de cache Mac (PROPFIND ne montre qu'1 ressource). À ignorer, se purge côté Apple (OFF/ON du calendrier sur ce device). NE PAS supprimer depuis iCal.
- **Refresh d'affichage auto après modif** (grille NC affiche en retard, OK après refresh manuel). Chantier cosmétique connu, pas prioritaire.

---

## LEÇON MÉTHODE MAJEURE (19-07) — SESSIONS COUSIN = CLOUD, PAS LOCAL
*Une soirée entière perdue là-dessus. À NE JAMAIS re-découvrir.*
- **Le cousin (Claude Code) ne peut pousser/ouvrir une PR QUE depuis une session CLOUD** (VM Anthropic, proxy GitHub provisionné au boot). Une session **Desktop LOCALE** tourne sur le Mac, sans proxy -> `git push` échoue (`could not read Username`), pas de `$GH_TOKEN`, remote non réécrit.
- **Repère visuel infaillible : l'icône de BRANCHE à côté du fil** dans la liste des sessions = session cloud rattachée à un repo = canal OK. Pas d'icône = pas de canal.
- **Comment ouvrir une session cloud :** (a) `claude.ai/code` dans le navigateur + **sélecteur de repo -> NomadCal** (toujours cloud) ; ou (b) clic droit sur un fil -> **Ouvrir dans -> Cloud**.
- **Prérequis une fois :** la **Claude GitHub App** doit être autorisée sur le compte avec accès au repo `NomadCal` (github.com/apps/claude -> Configure). Fait le 19/07.
- **Test tuyau (5 s, avant tout brief lourd) :** `echo $GH_TOKEN` -> doit dire `proxy-injected` · `git remote -v` -> réécrit vers `127.0.0.1:...` · le repo était **déjà cloné** à l'arrivée (le cousin ne clone pas lui-même).
- **Sécurité :** JAMAIS de PAT/token collé dans le chat. Le canal se règle côté connecteur/interface.
- **Corollaire édition à la main :** pour un fix trivial (1 ligne), on PEUT éditer directement sur github.com (crée la PR sans push local) — mais c'est le capitaine qui fait le travail de l'exécutant (régression de méthode). À réserver aux dépannages.

---

## AUTRES CHANTIERS CALENDRIER (hors périodes — priorité à réarbitrer)
- **Sélecteur d'étendue + delete d'occurrence** (`EXDATE` / split de série / édition master). Ferme « supprimer une occurrence efface la série » (href hérité). GROS chantier ÉCRITURE — cadrage + brief avec carburant.
- **Bug C — event à cheval sur minuit** (`App.jsx:643-644`, rendu sans clip). Pur affichage, réversible, aucune sacrée. Petit filler sûr.
- **Périodes en all-day sur 2 jours** (NomadBook). `DTEND=endISO+1` = pattern all-day standard CORRECT ; si défaut c'est au RENDU. Distinct du periodId.
- **Refresh d'affichage auto après modif** (grille en retard). INVESTIGUER léger.

## DISCIPLINE / GARDE-FOUS (calendrier)
- **Bug B ALLÉGÉE (#38).** Reste : ne pas supprimer une occurrence isolée d'un récurrent (efface la série) tant que le sélecteur d'étendue n'est pas fait.
- **Fantôme iCal / export client :** cache par-appareil, seul le brut PROPFIND fait foi. Ne jamais supprimer un suspect fantôme depuis iCal sans l'avoir prouvé au brut.
- **iCloud 503 :** observation suspendue. **Cache PWA iOS :** force-refresh Safari avant de soupçonner le code. **Web Inspector :** vérifier titre/URL avant d'inspecter (boussole).

## ROADMAP RÉCURRENCE ÉTAGÉE (objectif ferme sortie publique)
A1 intervalle libre OK. Restent, chacun sa PR : **A2** multi-jours hebdo · **A3** positionnel mensuel · **A4** jours du mois par numéro · **COUNT**. Modèle = compositeur Apple 2 étages.

## BUGS RÉCURRENCE
- **A OK** (exception RFC + offline). **B OK** (#38). **C — reste** (affichage minuit, filler sûr).

## RESTE À FAIRE POUR V1 (ordre — à réarbitrer)
1. ~~Couche 2~~ · ~~bug A~~ · ~~récurrence-édition~~ · ~~EventForm A1~~ · ~~fix B~~ · **~~périodes C #39~~ · ~~C-bis #40~~ · ~~table rase + migration notes~~** -> **FAITS.**
2. Nettoyage notes de test (Test B, TEST C1). Fantôme iCal Juin–Juil (se purge seul).
3. **Sélecteur d'étendue + delete d'occurrence** (`EXDATE`) — avec carburant.
4. **Bug C** (affichage minuit, filler sûr).
5. Paliers récurrence **A2->A4 + COUNT**.
6. Nettoyage events de test + γ. 7. EYROLLES (23/07, 2 UID). 8. Drag & drop. 9. Vues jour/mois/année. 10. **Fonction rapport NomadBook** *(débloquée — les notes sont enfin rangées par période)*. 11. Settings + cosmétique.

## ITEMS EN FILE
- Défauts synchro de fond : B1/B3/B4/γ. Défaut « refresh manuel ». Dette « deux `toISO` divergents ».
- **Porté au README quand on codera :** periodId filtre `href` complet + UID préservé (C #39 / C-bis #40).
- **Sécurité :** mot de passe d'app iCloud régénéré + reco faciale (14-07). OK
- Cosmétique FERMÉ jusqu'à V1.

## LIGNE PRODUIT — POUR NEON (~fin août)
- **Les périodes NomadBook sont un FEATURE NC, pas un cadeau iCloud** que l'user emporte en désinstallant (rapport, archivage 12 mois, accès par lien vivent DANS NC). -> à Neon, les périodes deviennent des objets **backend NC** ; iCloud = simple fenêtre. Principe directeur d'archi, PAS à coder avant Neon.

## REPRENDRE — RITUEL
1. **Carburant session à Claude.** 2. Lire cet État + README.
- **NE RIEN coder/merger sans go explicite d'Olivier.**
- **Sessions cousin = CLOUD (icône branche).** Vérifier le tuyau (`echo $GH_TOKEN` = `proxy-injected`) avant tout brief lourd.
- **Backups de référence :** export 20h56 (11 notes, filet) + backup corrigé restauré (11 notes sur href complet). Ne couvrent pas `nb_periods_cache`.
- **Prochain sujet probable :** nettoyage notes de test, puis arbitrer entre sélecteur d'étendue et paliers récurrence.
