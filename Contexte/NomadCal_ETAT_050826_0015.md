# ÉTAT DU PROJET NOMADCAL
*Document VIVANT — l'établi : SEULEMENT le chantier actif, les vérifs ouvertes, la reprise. Règle de VIDANGE : chantier scellé → migre au JOURNAL le jour même, l'État ne garde qu'une ligne de renvoi. Cible : ~1 page. **Vidange effectuée le 04-08 minuit** : le rapport d'audit du lot T (43 sites, tableaux, motifs grep) a migré au Journal en version essentielle, comme prévu au scellement de la PR-A. Dernière MAJ : 04-08-26 minuit (lot T CLOS — #46 mergé, testé au réel, Vercel Ready).*

---

## 🔨 CHANTIER ACTIF — AUCUN
*Le lot T est clos. Le prochain lot est à ouvrir par décision capitaine (→ ROADMAP).*

**Trois portes ouvertes, dans l'ordre suggéré par la Roadmap :**
- **Brainstorm « RÉORDONNER VERS NEON »** — le plus structurant, non tranché (voir § BRAINSTORMS).
- **Lot E** (EventForm : date de fin en mode horaire) — brainstorm design requis avant, à fusionner avec R2.
- **R5 + H** (modèle de données pré-Neon · chantier données hub) — chantiers de **papier et de données**, parfaits à carburant bas, **prérequis écrits de Neon, non commencés**.

## ✅ LOT T — CLOS LE 04-08-26 (PR #46 en prod)
*Récit complet, décisions, inventaire, certification parseur et leçons → **JOURNAL** (`Contexte/`).*
- **Audit 43 sites** : A:31 · B:8 · C:2 · corrigés:2. **Zéro fautif en zone sacrée.**
- **2 décisions produit gravées** : fuseau → **heure de Paris par décision** (douteux C1 fermé, zéro ligne de code) · famille 1a → périmètre **« Z seul »**.
- **Inventaire terrain** (4 bruts) : zéro `Z`, zéro TZID exotique, zéro `UNTIL` d'event. Google **et** Outlook écrivent en `TZID=Europe/Paris`. **Population de la famille 1a : nulle, mesurée.**
- **CERTIFIER parseur : 3 OUI** — VTIMEZONE inerte · TZID lu en heure murale (prouvé au code) · TRIGGER inerte. **Trouvaille : brèche `DESCRIPTION` de VALARM.**
- **PR #46 (`adbab38`)** : famille 2, 2 fichiers, +10/−7, hors zone sacrée. **Testée au réel** (horloge basculée au 7 sept. 23h58, bascule observée à 00h00, zéro écriture). Vercel Ready 12 s.
- **Sortie du lot** : la règle unique est portée aux **INSTRUCTIONS** (§ DOCTRINE TEMPORELLE, règles 7 et 8). Vérifiée au scellement.

## 🧾 DETTES TRACÉES (file d'attente complète → ROADMAP)
**Issues du lot T :**
- **Famille 1a — strip du `Z`** (`caldav.js:168` parseDate · `:152` EXDATE) : fautif au code, **population exposée nulle mesurée**, cas de test **non fabricable** (ni Apple ni NomadCal ne produisent un event `Z`). ⚠️ Correction partielle INTERDITE : les deux sites se corrigent **ensemble** (doctrine #44). `EXDATE` → à reprendre avec **R3**.
- **Famille 1b — `caldav.js:294` (`curISO`)** : reliquat de la classe #44, effet nul prouvé. Part avec 1a.
- **Dette TZID exotique** (`caldav.js:107-111`) : `get()` jette le fuseau nommé → un TZID étranger est lu en heure de Paris. **Non corrigée sciemment.**
- **Brèche `DESCRIPTION` de VALARM** (`caldav.js:109` + `:122` + `:145`) : pour un event **sans description propre**, la `DESCRIPTION` de son alarme (souvent `REMINDER` chez Outlook) atterrit dans les **notes de l'event**. Chemin réel au code, cas non observé. Même mécanisme théorique sur `SUMMARY`.
- **Clause morte `caldav.js:163`** · **Repli `caldav.js:105`** (bouché par le UID `:160`, pas par le découpage — à surveiller si `:160` est relâché).
- **Note lot E** : le gabarit all-day de NomadCal écrit `DTEND = DTSTART` là où Apple écrit exclusif. Affichage correct constaté (repli du #43), non conforme RFC pour un client tiers.

**Antérieures :** Dette #41 (VEVENT dégénéré masqué à tort) · Dette popover cellule vide · Garde `syncing` mort (⚠️ correctif toucherait la frontière sacrée, non arbitré).

## ⚠️ VIGILANCES OUVERTES
- **⭐ LE JOUR DE FIN D'UNE PÉRIODE N'A AUCUNE PÉRIODE COURANTE** (observé à l'écran pendant le test du 04-08, à 23h58 le 7 sept.). C'est la conséquence assumée de la borne à minuit local — mais **le jour de fin est justement le jour de compilation du rapport**. Actée sur le papier, **vue à l'écran = perspective changée**. → à instruire, raccrocher au **lot R4**.
- **Notes déjà mal rattachées** : la PR #46 corrige **l'avenir**, elle ne re-rattache pas les notes historiquement liées à la mauvaise période. **Existe-t-il de telles notes ? Personne ne le sait.** Question ouverte, non instruite.
- **`TEST MINUIT` reste dans `ZZ-TEST-REC`** (Apple natif, jeu. 6 août 23h30 → ven. 7 août 01h45, récurrent hebdo). Seul cas exerçant la segmentation. ⚠️ **Ne jamais l'éditer depuis NomadCal** (lot E). ⚠️ Il ne teste **rien** en famille 1a.
- **NomadCal ne peut pas CRÉER un event à cheval sur minuit** (`EventForm.jsx:236`) → **lot E**.
- **Fantôme iCal Juin–Juil** = cache Mac. À IGNORER. **NE PAS supprimer depuis iCal.**
- **Events de test à purger** : `Allday &` (`PRODID //NomadCal//FR`) — cosmétique, quand tu veux.
- **Branches à supprimer via GitHub UI** : `claude/nomadcal-t-famille2` (#46, mergée) · `claude/nomadcal-cloud-c-bis-7wq1tx` (#41). Inoffensives. ⚠️ Le proxy cousin refuse `git push --delete` (403 de politique) → geste capitaine.
- **Bruit de déploiement** : chaque push de doc sur `main` (`Contexte/*.md`) déclenche un déploiement Vercel en production. Sans conséquence, juste du bruit dans la liste.

## 🧠 BRAINSTORMS À OUVRIR (non décidés)
- **⭐ RÉORDONNER LA ROADMAP VERS NEON** : les congés (jusqu'au 01/09) referment la fenêtre de risque terrain. Deux lectures à ne pas confondre — **avancer la DATE** de Neon (déconseillé : R5, H et K sont des prérequis écrits, non commencés ; Neon est une bascule d'archi, pas un lot ; débordement possible sur la reprise terrain du 01/09) vs **accélérer le CHEMIN** (tout ce qui n'est pas prérequis passe en dette, les congés servent R5 + H + brainstorm EventForm — chantiers de papier et de données, sans session cousin, sans PR à tester). **Non tranché.**
- **Brainstorm EVENTFORM** (lot E, à fusionner avec R2) · **Brainstorm MÉTHODE** (03-08) · **Brainstorm R4** (dont la question du jour de fin ci-dessus).

## ✅ RENVOIS (scellé, détail au JOURNAL)
- **Lot T CLOS (04-08, #46)** · **Lot R1 CLOS (04-08, 4 PR)** · **Lot N + déménagement doc CLOS (03-08)** · **Charte Orchard SCELLÉE (30-07)** · **Chantier périodes NomadBook CLOS (19-07)** · **Récurrence** : bug A (#35/#36), bug B (#38), EventForm A1+UNTIL (#37).

## 💾 BACKUPS DE RÉFÉRENCE
- Export natif Settings 6 clés : 16/07 12:49 · 19/07 20:56 (11 notes) · backup corrigé restauré.
- ⚠️ Ne couvrent PAS `nb_periods_cache` ni les events (`cf_events` exclus).

## 🧭 REPRENDRE — RITUEL
1. **Olivier donne le carburant session.**
2. Claude lit **cet État + la ROADMAP** → résume → attend le go.
- **NE RIEN coder/merger sans go explicite d'Olivier.**
- **Sessions cousin = CLOUD** (icône branche ⎇) + test tuyau avant brief lourd. *(Un brief lecture seule n'en a pas besoin.)*
- **BRIEFS : un seul bloc, jamais imbriqué · cas de test fixé DANS le brief · brief autoportant** (→ Instructions).
- **⏱️ Repères de temps : « maintenant » / « à la reprise »**, jamais un repère d'horloge inventé.
- **▶️ REPRISE : aucun chantier en cours.** Ouvrir le **brainstorm « réordonner vers Neon »** (le plus structurant) ou attaquer **R5 / H** en filler. Décision capitaine.
