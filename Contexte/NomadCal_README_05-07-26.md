# README — NOMADCAL
*Description technique et vision du projet. Change lentement (stack, archi, repo). Pour l'avancement → fichier « État du projet ». Pour la méthode de collaboration → instructions du projet.*

---

## VISION
NomadCal est une PWA de calendrier, tâches et notes **pensée iPhone-first et terrain-first**, pour le travail de représentant commercial (commercial terrain) d'Olivier — librairies, chaînes culturelles (Cultura, Fnac, Furet du Nord), espaces culturels d'hypermarchés, nord de la France et région parisienne.

Principe directeur : **« ton agenda t'appartient — le filou libre ».** La complexité reste invisible pour l'utilisateur. Vue semaine native (absente du Calendrier iPhone d'Apple), tâches glissables, notes intégrées (NomadBook), gestion de tâches (NomadTask), et à terme calcul de frais par géolocalisation.

Olivier travaille **100 % sur iPhone, sur le terrain**, et se définit comme développeur débutant qui privilégie la compréhension à la vitesse.

## STACK TECHNIQUE
- **Front :** React, PWA.
- **Déploiement :** Vercel. Prod = `cal-flow-jade.vercel.app`.
- **Repo :** `Olivierclaverie-crypto/NomadCal` (public). Branche de travail : `claude/repository-review-3qmwxx`.
- **Calendrier :** synchro iCal / iCloud via CalDAV (events). Solide et fiable.
- **Stockage local (actuel) :** localStorage. Six clés : `nb_notes`, `nf4_notes`, `nb_periods`, `nb_syntheses` (non préfixées), `cf_tasks`, `cf_settings` (préfixées). `cf_auth` = la serrure, globale, jamais préfixée ni sauvegardée. `cf_events` = events, redondants avec iCloud, exclus de la sauvegarde.
- **Backend (planifié, ~fin août) :** Neon. Remplacera localStorage, réglera l'isolation des contextes WKWebView.

## FICHIERS CLÉS
- `src/utils/caldav.js` — moteur de récurrence et logique cœur. Contient les 4 fonctions sacrées (signatures intouchables) : `pushEvent`, `deleteEvent`, `syncCalendar`, `syncCalDAV`. Contient `expandRecurring` (expansion des séries récurrentes).
- `src/App.jsx` — orchestration, merge des events, fenêtre d'expansion (~15 mois : -3 mois / +1 an). Bug minuit localisé ~l.553.
- `src/components/Settings.jsx` — backup/restore, toggle du panneau debug.
- `src/components/DebugPanel.jsx` — panneau « Debug ICS » (lecture du cache d'events, diagnostic récurrence). Master toggle OFF par défaut.

## ARCHITECTURE — POINTS DE VIGILANCE
- **Isolation des contextes WKWebView** : chaque URL / raccourci PWA = un bac localStorage séparé. Cause racine des pertes de données. Résolu structurellement par Neon uniquement.
- **Cache PWA iOS** : sert l'ancien code après un deploy. Toujours force-refresh Safari avant de soupçonner le code.
- **Récurrence** : `expandRecurring` déplie les séries en occurrences ; chaque occurrence porte une copie du rawICS du master (dont le bloc VTIMEZONE, lourd). À garder en tête pour tout ce qui touche au rendu de masse.
- **DST-proofing** : comparaison d'instant absolu (`getTime()`) pour UNTIL ; helpers de date locale (`getFullYear/getMonth/getDate`) pour EXDATE — jamais `.toISOString().slice(0,10)` (produit des dates UTC → off-by-one).

## HISTORIQUE / OUTILS ANNEXES
- Apps pré-NomadCal, désormais fusionnées dedans : NotesFlow (`notes-flow-six.vercel.app`) et TaskFlow.
- Suivi des visites : fichier Excel fourni par l'employeur, mis à jour via script Python (icalendar + recurring-ical-events), déclenché par le mot-clé « MAJ Visites ».

## ROADMAP (résumé)
- **V1** — calendrier pro solide : récurrence couche 2, drag & drop, vues jour/mois/année, mise en forme rapport, complétion Settings, cosmétique.
- **V2** — frais + géolocalisation comme base de calcul.
- **V3** — IA (assistance, complexité invisible). Direction A (consommer l'IA) vs B (s'exposer en MCP) non tranchée.
