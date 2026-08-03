# ÉTAT DU PROJET NOMADCAL
*Document VIVANT — l'établi : SEULEMENT le chantier actif, les vérifs ouvertes, la reprise. Règle de VIDANGE : chantier scellé → migre au JOURNAL le jour même, l'État ne garde qu'une ligne de renvoi. Cible : ~1 page. Dernière MAJ : 03-08-26 soir (lot R1 en cours — item 2 scellé, item 3 prêt à merger, item 1 rouvert).*

---

## 🔨 CHANTIER ACTIF — LOT R1 (batch affichage), EN COURS
Le batch initial « 3 défauts en 1 PR » a éclaté en 3 chantiers distincts. **Rien n'est perdu, tout est traçable.**

### ✅ Item 2 — doublon transitoire → **MERGÉ EN PROD (#41)**
- Cause réelle : **clé de déduplication mal formée** dans `mergeRecurrenceExceptions` (`caldav.js:435` écrivait `ex.id`, `:443` lisait `masterUid`). **Le diagnostic « refresh manquant » de la Roadmap était FAUX** — le refresh existe et est complet.
- Fix : `${ex.masterUid || ex.id}` — `+1/−1`, additif (le fallback préserve le cas iCloud octet pour octet).
- **Testé 5/5 au réel** par le capitaine, dont l'exception venue d'iCloud.

### 🟡 Item 3 — bande all-day sur 2 jours → **PR #43 OUVERTE, prête à merger**
- PR : `https://github.com/Olivierclaverie-crypto/NomadCal/pull/43`
- Preview : `https://cal-flow-git-claude-nomadcal-ad7fb7-olivier-claverie-s-projects.vercel.app`
- Commit `e965c88` (`+17/−6`, `src/App.jsx` seul) — **hash d'origine conservé**, extrait de #42 sans réécriture.
- Contenu : borne de fin rendue **exclusive** sur **3 sites** (507 / 518 / 524 — le 507 avait été manqué au premier passage) + **prédicat partagé** (une seule définition pour 507 et 518, pour ne pas recréer la divergence d'origine) + repli protégeant l'all-day sans `DTEND`.
- ⚠️ **Ce n'était PAS un cas limite** : `buildPeriodICS` écrit **toute** période NomadBook en all-day mono-jour → toutes s'affichaient sur 2 jours. Cas nominal.
- **RESTE À FAIRE (capitaine)** : force-refresh sur la preview → 3 contrôles (bande NomadBook sur **1 jour** · all-day **sans date de fin** toujours affiché · affichage NomadBook des périodes) → **merge**.

### 🔴 Item 1 — event à cheval sur minuit → **ROUVERT** (PR #42 ouverte, intacte)
- PR #42 conservée non mergée (`2cfad37`), branche `claude/nomadcal-r1-lot-a` conservée. Le commit 2 y dort.
- Option retenue : **B** (segments matérialisés dans la boucle jour) + correctif popover obligatoire (sans lui, éditer depuis le bloc J+1 écrirait une exception au mauvais instant = réouverture de la famille #41).
- **Constat de test : aucun effet visible.** Le cousin a d'abord conclu « dérivation jamais exercée », puis **s'est rétracté** au vu du brut.
- **2 QUESTIONS À INSTRUIRE AVANT TOUTE REPRISE :**
  1. **Sur quelle preview l'observation a-t-elle été faite ?** Seule celle de **#42** contient le commit 2. (Doctrine de la mauvaise preview — a déjà failli faire valider un faux positif au #35.)
  2. Le cas de test **TEST AD2** porte-t-il bien une `RRULE` ? Le brut collé en contient une (`FREQ=WEEKLY;UNTIL=20260831T215959Z`) mais le cousin ne l'a pas vue dans ce qui lui est parvenu → **le lui redire explicitement**, sinon angle d'attaque faussé.

## 🔑 DÉCOUVERTE MAJEURE (hors R1) — EventForm ne sait pas écrire un event à cheval
**PROUVÉ au code** : `EventForm.jsx:236` recolle activement `endDate` sur `startDate`, et **aucun champ de date de fin n'existe en mode horaire** (le champ « Au », l.270-274, est réservé à la branche all-day). Les 3 points d'entrée convergent (`EventForm.jsx:73`, `App.jsx:630`, `App.jsx:502`).
→ **NomadCal ne peut pas CRÉER un event qui déborde sur minuit.** Le fix de rendu (item 1) servirait donc un cas que le capitaine ne peut pas produire depuis l'app.
→ **Item d'ÉCRITURE, hors périmètre R1.** À loter séparément (probablement avant ou avec R2, qui touche déjà EventForm). `pushEvent.js:17` n'est qu'un relais fidèle — rien à corriger en zone sacrée.

## 🧾 DETTES TRACÉES (à porter en file d'attente Roadmap à la MAJ groupée)
- **Dette #41** — `mergeRecurrenceExceptions` utilise `masterUid` dans la clé de masquage : un VEVENT dégénéré (portant à la fois `RRULE` et `RECURRENCE-ID`) serait masqué à tort. **Aucun producteur connu. Non bloquant.**
- **Dette popover cellule vide** — un 3ᵉ `setPopover` (handler de cellule vide, hors du map des events) dont le `ev` ne se résout à aucune liaison locale. Signalé par le cousin, **préexistant**, non touché. À arbitrer.
- **Garde `syncing` mort** — `runSync` (`syncService.js`) teste `if (syncing) return;` mais **aucun** de ses 6 appelants ne le passe → réentrance possible. ⚠️ Son correctif **toucherait la frontière sacrée**. Non arbitré, jamais ouvert.

## 📌 EN ATTENTE DE MAJ ROADMAP + JOURNAL (après merge #43)
- **Rapport manuel #2 REPORTÉ au 07/09** (fin des congés 01/09) : quitte J1, rejoint J3.
- J1 consommé (Lot N + déménagement doc). **J2 (congés) = fin R1 → R2**, avec R5 + H en fillers.
- **Corriger la Roadmap sur l'item 2** : le diagnostic « refresh manquant » y est faux.
- Y porter les 3 dettes ci-dessus + le nouvel item **EventForm date de fin**.

## 🧭 MÉTHODE — POINT À BRAINSTORMER (demandé par le capitaine, 03-08 soir)
Le lot R1 a dérivé en chantier à tiroirs. **Cause identifiée : le cas de test n'a jamais été fixé noir sur blanc** (Apple natif ou NC ? récurrent ou pas ? quelle preview ?) — d'où la majeure partie des allers-retours.
- **Piste 1 :** fixer le cas de test **AVANT** d'écrire le brief, et l'inscrire DANS le brief (calendrier, créé où, quelle preview, quel écran attendu).
- **Piste 2 (capitaine) :** écrire des **scripts de test au contexte** pour automatiser la validation sur preview.
→ Brainstorm à part entière, à ouvrir en session dédiée.

## 🧹 RESTES LÉGERS (vigilance, aucune action)
- **Fantôme iCal Juin–Juil** = cache Mac (PROPFIND : 1 seule ressource). À IGNORER. **NE PAS supprimer depuis iCal.**

## ✅ RENVOIS (scellé, détail au JOURNAL)
- **Lot N + déménagement doc CLOS (03-08)** : zéro code, 4 moteurs en double, Journal + Vision sur GitHub seul.
- **Charte Orchard SCELLÉE (30-07)** · **Chantier périodes NomadBook CLOS (19-07)** · **Récurrence** : bug A (#35/#36), bug B (#38), EventForm A1+UNTIL (#37).

## 💾 BACKUPS DE RÉFÉRENCE
- Export natif Settings 6 clés : 16/07 12:49 · 19/07 20:56 (11 notes) · backup corrigé restauré.
- ⚠️ Ne couvrent PAS `nb_periods_cache` ni les events (`cf_events` exclus).

## 🧭 REPRENDRE — RITUEL
1. **Olivier donne le carburant session.**
2. Claude lit **cet État + la ROADMAP** → résume → attend le go.
- **NE RIEN coder/merger sans go explicite d'Olivier.**
- **Sessions cousin = CLOUD** (icône branche ⎇) + test tuyau avant brief lourd.
- ⚠️ **BRIEFS : UN SEUL BLOC, jamais de bloc imbriqué** (un ICS collé dans un brief l'a tronqué en deux le 03-08).
- **Ordre de reprise suggéré :** (1) tester + merger **#43** · (2) brainstorm **méthode/scripts de test** · (3) instruire l'item 1 (les 2 questions ci-dessus) · (4) MAJ groupée Roadmap + Journal.
