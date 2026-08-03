# ÉTAT DU PROJET NOMADCAL
*Document VIVANT — l'établi : SEULEMENT le chantier actif, les vérifs ouvertes, la reprise. Règle de VIDANGE : chantier scellé → migre au JOURNAL le jour même, l'État ne garde qu'une ligne de renvoi. Cible : ~1 page. Dernière MAJ : 04-08-26, 01h00 (lot R1 CLOS, moteurs à jour).*

---

## 🔨 CHANTIER ACTIF — AUCUN
L'établi est vide. **Le lot R1 est CLOS** (4 PR en prod, testées au réel).

**Prochains sujets, dans l'ordre suggéré par la Roadmap :**
1. **Lot T — audit temporel 360°** (dates/heures/fuseaux/DST, tous fichiers). Le plus rentable : ferme la classe de bugs qui a coûté le plus de temps depuis le début du projet.
2. **Brainstorm EventForm** (lot E + R2 + K convergent sur le même fichier) — concevoir la cible UNE fois, livrer en tranches.
3. **Brainstorm méthode** (fixer le cas de test avant le brief · scripts de test · audit ciblé).

## 📌 CE QUI VIENT D'ÊTRE SCELLÉ (04-08, détail au JOURNAL)
- **#41** — item 2 : clé de déduplication mal formée dans `mergeRecurrenceExceptions`. Le diagnostic « refresh manquant » de la Roadmap était FAUX (corrigé).
- **#43** — item 3 : bande all-day sur 2 jours, 3 sites + prédicat partagé + repli. Cas **nominal** (toute période NomadBook était concernée).
- **#44** — 🔴 **LA CAUSE RACINE** : `caldav.js:347` et `:364` convertissaient en **UTC** des dates construites en **local** → date rabattue d'un jour dans la fenêtre 00h–02h (CEST). Corrigé via `toLocalISO`, déjà présent dans le fichier. **Défaut SAISONNIER** (invisible en hiver).
- **#45** — item 1 : segments jour + retrait du garde récurrent + **correctif popover** (sans lui, éditer depuis le bloc J+1 aurait écrit une exception au mauvais instant).
- **Ménage fait** : #42 fermée sans merge, 4 branches supprimées après preuve.

## 🧾 DETTES TRACÉES (portées en file d'attente Roadmap ✅)
- **Dette #41** (VEVENT dégénéré masqué à tort — aucun producteur connu) · **Dette popover cellule vide** (préexistante) · **Garde `syncing` mort** (⚠️ son correctif toucherait la frontière sacrée, non arbitré) · **`caldav.js:294`** (fautif mais inoffensif → absorbé par le lot T).

## ⚠️ VIGILANCES OUVERTES
- **`TEST MINUIT` reste dans `ZZ-TEST-REC`** (Apple natif, jeu. 6 août 23h30 → ven. 7 août 01h45, récurrent hebdo). **C'est le seul cas de test qui exerce la segmentation** — le conserver. ⚠️ **Ne jamais l'éditer depuis NomadCal** : le formulaire écraserait sa date de fin (lot E).
- **NomadCal ne peut pas CRÉER un event à cheval sur minuit** (`EventForm.jsx:236`, pas de champ date de fin en mode horaire). Prouvé au code et à l'écran. → **lot E**.
- **Fantôme iCal Juin–Juil** = cache Mac. À IGNORER. **NE PAS supprimer depuis iCal.**

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
- **Ordre de reprise suggéré :** (1) **lot T** (audit temporel) · (2) brainstorm **EventForm** · (3) brainstorm **méthode** · (4) R2.
