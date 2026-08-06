# JOURNAL / ACQUIS — NOMADCAL
*Classeur des leçons apprises à la dure et des chantiers scellés. Vit sur GitHub `Contexte/` UNIQUEMENT (jamais dans la connaissance du Projet — économie de contexte). On vient le consulter quand on est coincé : upload ponctuel au timonier, ou lecture directe par le cousin. Il grossit ; c'est normal. Pour l'avancement → ÉTAT. Pour le plan → ROADMAP. Pour la méthode → INSTRUCTIONS. Pour l'archi + doctrine résumée → README moteur (+ README racine du repo pour le détail exhaustif).*

---

## 🗺️ LOT R5 — MODÈLE DE DONNÉES PRÉ-NEON : PHASE PAPIER SCELLÉE (05→06-08-26)
*Zéro code, zéro PR, zéro intervention du cousin. Trois séances : brainstorm jalon 1 (D1→D5, 05-08 midi) · brainstorm jalon 2 (D6→D12, 05-08 soir) · relecture capitaine par scènes (06-08, d'où naissent D13, D14, D15 et l'amendement A1). Livrables : `NomadCal_R5_CARTE_060826_*.md` (carte d'architecture cible, 5 couches + registre D1–D15 en annexe) et `NomadSuite_DOCTRINE_ANNUAIRE_060826_*.md` (v2). **Ce qui suit est DÉCIDÉ, pas PROUVÉ** — la confrontation au code est le brief INVESTIGUER (14 questions), geste suivant.*

### 🎯 LE PARI CENTRAL — LA COUCHE QUI N'EXISTE PAS
La carte pose **5 couches** : sources de vérité · douane · **hub de données** · modules métier · interface. Quatre existent déjà, plus ou moins bien rangées. **Le hub n'existe pas** — c'est le pari, et c'est ce que Neon viendra habiter.

L'objet le plus important de la carte n'est pourtant pas le hub, c'est **le format pivot** : la forme d'un event (et demain d'un contact) une fois traduit, avant qu'il touche le hub.
> **Le hub ne voit jamais un TZID, un `href` ni un ETag.** Ce sont des mots de la langue iCloud. Il voit un event NomadCal, qui porte une identité NomadCal et une adresse chez son fournisseur d'origine — une adresse qu'il transporte sans jamais la lire.

C'est le pivot qui rend tout le reste bon marché : ajouter Outlook = écrire un traducteur qui produit le même pivot, rien d'autre ne bouge ; faire naître Neon en jumeau = un traducteur de plus, pas une refonte. **Le jour où un mot de la langue iCloud apparaît au-dessus de la douane, la carte est violée.**

### ⚖️ LES 15 DÉCISIONS — CE QUI A ÉTÉ TRANCHÉ, ET CE QUI A ÉTÉ ÉCARTÉ

**D1 — Fournisseur unique, un seul actif à la fois.** iCloud, Outlook ou Google, désigné à l'installation ; le découpage en calendriers internes suffit à séparer vie privée et vie pro. **Écarté : plusieurs comptes simultanés dans la même grille (« porte B »)** — le coût remonte jusque dans l'interface (chez qui part une création ? doublons ? déplacement d'un fournisseur à l'autre ?) pour un besoin que la plupart n'ont pas. **Reporté en service V3**, avec une nuance inscrite au moment même de la décision : ce service supposera quand même un traducteur — *l'IA ne devine pas un protocole*. Porte B n'est donc pas fermée, elle est **reportée et déguisée en service** ⇒ concevoir D1 pour ne pas la rendre impossible. C'est gratuit si D2 est respectée.

**D2 — Le traducteur et le douanier se séparent.** Ce que l'ébauche appelait « la porte iCloud » mélangeait **deux métiers** invisibles tant qu'il n'y a qu'un fournisseur : *traduire un protocole* (un traducteur par fournisseur) et *faire la douane* (valider, normaliser les dates, fusionner, mettre en file — **un seul douanier pour tous**). Raison : sans cette séparation, **trois fournisseurs = trois fois les mêmes bugs de date à corriger.** ⭐ **C'est la doctrine temporelle du lot T appliquée à l'architecture** — un bug de date corrigé chez le douanier est corrigé pour tous les fournisseurs d'un coup.

**D3 — Le départ est une fonction, pas un accident.** « Se désabonner » déclenche un protocole qui rend tout ce que l'app détient. **Portée V1 = les events** — presque une formalité, *et c'est exactement pourquoi il naît maintenant : une promesse qui naît petite mais tout de suite ne devient jamais impossible à tenir.* **Vertu inattendue : le protocole est une sonde d'architecture** — le jour où il devient difficile à écrire, c'est que quelque chose s'est refermé quelque part. **Écarté : le miroir permanent à vie** (deux destinations d'écriture pour toujours, et qui n'aurait de toute façon jamais sauvé les frais ni les rapports, qu'aucun fournisseur ne sait porter).

**D4 — Purge sur accusé de réception.** Ce qui est capturé hors-réseau part vers Neon au retour et disparaît du local **une fois la migration validée**. Le mot qui porte la décision est *« validée »* : **on ne supprime jamais sur la foi d'un envoi.** C'est la cicatrice localStorage retournée à l'endroit. *(Précision sans effet sur la décision : les photos ne transitent pas par localStorage — trop petit ; c'est IndexedDB. Même principe, deux magasins.)*

**D5 — File d'attente purgeable, cache de lecture non.** Le critère de tri est **la reconstructibilité**. File d'attente = seule copie existante ⇒ intouchable jusqu'à l'accusé. Cache de lecture (la semaine de RV, les notes récentes) = reconstructible depuis Neon ⇒ ne se purge pas, vieillit seul. **Le risque écarté :** purger le cache après migration viderait l'écran d'un utilisateur qui ouvre l'app **dans un sous-sol sans réseau** — c'est-à-dire la situation de terrain pour laquelle NomadCal existe.

**D6 — Deux étages en couche 3, et le critère est du capitaine.**
> **Un module est une intention d'ouverture.** « J'ouvre NomadCal pourquoi ? »

Modules : Calendrier · NomadTask · NomadBook · **Rapport** · Frais (V2). Services transverses : **Géoloc · IA** — personne n'ouvre l'app pour « faire de la géolocalisation ». **La géoloc naîtra avec les Frais (V2)**, son premier consommateur concret, pas avec NomadTour : *un service transverse a intérêt à naître au service d'un besoin réel plutôt qu'à être conçu dans le vide.* **NomadTour reste en zone d'attente** — nommé, non instruit : *ne pas l'instruire n'est pas ne pas le prévoir*, et sa seule présence change la question posée au cousin (non pas « comment marche NomadTour » mais « le hub permet-il d'ajouter un module plus tard sans redécouper les entités existantes ? »).

**D7 — Le Rapport est un module à part.** NomadBook **capture**, le Rapport **compose et archive**. Le critère qui tranche est **D5 lui-même** — deuxième application d'un principe sur un sujet sans rapport avec le hors-réseau, **bon signe pour un principe**. Le fait décisif vient du dossier fonction rapport : purge des notes APRÈS envoi confirmé + archivage 12 mois ⇒ **le rapport survit à ses sources** ; une fois les notes purgées il est la seule trace de la période, donc **non reconstructible** ⇒ il *copie* la matière, il ne pointe pas vers elle. **Ce que D7 ne dit PAS :** deux modules ≠ deux écrans lointains — le bouton « composer le rapport » peut vivre dans NomadBook. **La séparation est dans les données et les responsabilités, pas dans la navigation.**

**D8 — L'annuaire, jamais le carnet du téléphone.** Le constat déclencheur (capture EventForm du 05-08) : l'import de contact remplit Prénom, Nom, Entreprise, Adresse, Email, Téléphone — **que du texte lisible par un humain, zéro identifiant.** C'est la configuration exacte du lot H avant correction : un lien par le nom, qui casse au premier changement de raison sociale. Le problème plus grave, soulevé par le capitaine : NomadCal dépend d'une donnée **qu'il ne possède pas, ne contrôle pas et ne peut pas garantir** — *le carnet d'Olivier est structuré parce qu'il l'a structuré ; celui d'un autre représentant ne le sera pas.* **Écarté : le « script de mise en conformité du carnet »** — (a) une app web ne peut probablement pas écrire dans le carnet iOS *(à certifier)*, (b) surtout **NomadCal ne doit pas avoir d'opinion sur le carnet personnel de l'utilisateur**. Le « proxy » proposé par le capitaine est conservé — **c'est D2 appliqué aux contacts** — il lui manquait seulement une destination : l'annuaire. **Règle : on lit, on traduit, on range chez nous. Import, pas synchronisation.**

**D9 — L'annuaire est discret, pas secret.** Position initiale du capitaine : NomadGuess invisible, sur Neon, chiffré. **Validé sans réserve :** ne jamais écrire chez l'utilisateur · autorisation explicite · chiffrement fort — *ce ne sont pas ses données à lui, ce sont celles de ses clients*, des tiers qui n'ont jamais entendu parler de NomadCal. **Amendé sur l'invisibilité complète, pour trois raisons :** aucun recours en cas d'erreur (le lot H, mais sans tableur pour s'en sortir) · un nouveau client n'est dans aucun carnet le jour où on le rencontre · détenir des données de tiers dans un endroit que le responsable ne peut pas consulter est juridiquement indéfendable et heurte D3. ⭐ **La ligne juste, formulée en séance :** ce que le capitaine refusait, ce n'est pas que l'utilisateur *puisse* voir l'annuaire — c'est qu'il ait à **s'en occuper**. D'où **la trappe : un endroit de consultation et de réparation, pas une pièce à vivre.**

**D10 — Un client se crée dans l'annuaire, avec raccourci depuis l'event.** *« Un nouveau client doit avoir des fondations solides dans l'environnement NomadSuite. »* **Écarté : la création silencieuse d'une fiche depuis l'EventForm** — un client portera des frais, des rapports, des tournées, un historique de CA ; le créer à la volée depuis un champ de titre fabriquerait **des fiches creuses à rattraper plus tard : la dette exacte du lot H.** Le raccourci du capitaine supprime le seul défaut de l'option : le **vrai formulaire** s'ouvre depuis l'event, sans perdre le fil, puis retour au RV. Import initial **par sélection de groupes** ; écartés : le tri automatique par règles (l'app se trompera sans que l'utilisateur sache pourquoi) et le remplissage à l'usage seul (annuaire vide au démarrage).

**D11 — Clé interne ≠ IdC, et NUCLI → IdC.** Le renommage n'est pas cosmétique, c'est une **généralisation** : *NomadCal ne connaît pas la nature de l'identifiant, il connaît sa fonction.* Coût faible maintenant, élevé plus tard. **Le fait qui impose la séparation :** beaucoup d'utilisateurs n'auront aucun identifiant client — **une clé absente pour la moitié des utilisateurs n'est pas une clé.** D'où : clé interne (générée, invisible, toujours, non modifiable) vs IdC (saisi ou importé, facultatif, visible, modifiable).
> **L'IdC n'est pas l'identité du client, c'est son passeport vers le monde extérieur.** Un client peut vivre sans passeport tant qu'il ne franchit pas la frontière.

**Acquis conservé : l'IdC est du TEXTE, jamais un nombre** (zéros initiaux) — la règle particulière devient générale. Mise en correspondance des champs à l'import : **option A, déclarée par l'utilisateur, non bloquante** ; écartée, la convention NomadCal imposée qui obligerait chacun à réorganiser son carnet avant de commencer. ⭐ **Ce que les captures Contacts du 05-08 ont prouvé :** aucun champ identifiant dans vCard et impossible d'en créer un (le détournement du champ *Profession* est un choix informé, pas un bricolage) · le carnet du capitaine réalise **déjà** Client + Interlocuteurs (le modèle mental est bon, c'est l'outil qui ne suit pas) · **les « défauts de conception » sont des règles, pas du chaos — une machine peut apprendre une règle, elle ne peut pas deviner laquelle.** D'où l'option A. Format d'export retenu : **vCard** ; écartés `.abbu` (archive propriétaire, enferme l'utilisateur, contraire à D1) et PDF (image de texte, illisible pour une machine).

**D12 — L'ICS redevient propre.** Le **statut** d'event (en attente / à confirmer / confirmé) existe **pour être vu en couleur** : c'est un langage visuel de NomadCal ⇒ **fonction 100 % Neon**. *Nuance sur « Apple ne nous fait pas de cadeau » : ce n'est pas de la mauvaise volonté, c'est qu'un format standard de trente ans a été conçu pour des rendez-vous, pas pour les concepts de NomadCal.* La conclusion tient : **on ne bricole pas nos idées dans les cases des autres.** L'IdC n'entre pas non plus ⇒ **les deux tiroirs de l'annotation capitaine sont refermés** (occuper la zone *invités* ? arbitrer entre statuts et IdC ?) : plus rien à détourner, et aucun traducteur Outlook/Google à bricoler. **`SUMMARY` = Nom + Ville**, ni IdC ni statut. **Le titre est un libellé historique gelé** à la création — mais **rapports et recherches passent par la référence, jamais par le texte du titre**. **Trois écrans à ne pas confondre** *(rendu ≠ stockage)* : bloc de grille, popover et formulaire sont du **rendu libre** ; seul le `SUMMARY` est de la donnée stockée qui sort de NomadCal.
> **L'ICS transporte l'agenda, le fichier complet transporte le métier.**

⭐ **Point de doctrine tranché en séance :** on ne garde pas l'IdC hors de l'ICS *pour que l'utilisateur perde quelque chose en partant* — ce serait contraire à D3. On le garde hors de l'ICS **par propreté**, le confort vient en prime. *On ne retient pas les gens en gardant leurs données en otage, on les retient parce que l'outil est bon.*

### 🔍 CE QUE LA RELECTURE A PRODUIT (06-08) — TROIS ACQUIS DE PLUS
*La carte a été relue **couche par couche, sur scènes concrètes de tournée**. Verdicts : couches 0, 1, 3 justes · couche 2 juste **après correction** (une scène confondait statut d'event et statut d'annuaire) · couche 4 juste **avec amendement** · principes, protocole de départ et voile de rechange justes. **La relecture n'a pas validé un texte : elle a fabriqué trois décisions neuves.***

- **D13 — LE LOT K SE DISSOUT.** D12 referme la piste `X-NOMADCAL-NUCLI` que la Roadmap prêtait au lot K. La question du lot (« où vit l'identifiant d'un event pour survivre au round-trip ? ») a sa réponse : ⭐ **il ne voyage pas — il vit chez nous.** Moitié donnée → Neon/annuaire ; moitié interface (le champ dans l'EventForm) → brainstorm EventForm. **Coût accepté :** pas de rattachement client des events avant Neon. **Bénéfice :** zéro propriété custom, zéro PR en zone sacrée, zéro double migration. *Un lot qui disparaît parce qu'une décision d'architecture l'a rendu sans objet est un gain, pas une perte — comme le lot T qui avait rétréci le 04-08.*
- **D14 — LE PROSPECT EST UNE FICHE ORDINAIRE.** Pas de statut d'annuaire structurant en V1 : une fiche importée entre dans le flux normal — mêmes tournées, mêmes rapports, aucun deuxième groupe, aucun calendrier renommé. **La justification vient du principe 0 de la doctrine annuaire** (*identité ≠ activité*) : un statut est une donnée d'activité ; s'il naît un jour, il vivra côté Neon dans l'entité Client, **jamais comme structure du carnet**. D14 élargit aussi les sources d'alimentation aux **fichiers plats (Excel/CSV)** — un fichier de prospects fourni par une direction s'injecte par le même geste, même statut : import unique, jamais de synchronisation. **Clause d'ouverture :** une *étude marché prospection* est due **avant tout engagement V2**.
- **D15 — LA FICHE SE TEND, ELLE NE S'ÉCRIT PAS.** Bouton « Pousser vers mon carnet » : NomadCal génère une **vCard** et la tend au **partage système** ; c'est iOS qui ouvre la fiche, c'est l'utilisateur qui enregistre. ⭐ **NomadCal n'a jamais tenu le stylo** — D8 affiné : *jamais écrire, mais toujours savoir tendre.* Contenu : **l'identité nue** (enseigne, ville, adresse, téléphones, email, interlocuteur). Dehors : la clé interne (os du hub), le statut (donnée d'activité) et **l'IdC** — *le mapping identifiant→carnet est un savoir-faire NomadSuite, il ne se solde pas dans un geste de convenance.* La distinction avec D3 est nette : le bouton est une **convenance quotidienne**, le départ reste **intégral**, IdC compris. **Motivation :** NomadGuess étant quasi invisible, l'utilisateur doit comprendre que sa fiche NomadCal n'est pas dans son carnet — le bouton est la réponse honnête à cette divergence.
- **A1 (amendement) — LES OUTILS DE PREUVE PASSENT SOUS CLÉ.** Le DebugPanel et son `rawICS` : **l'observabilité fait partie de l'architecture, pas des bonus** — mais **invisibles par défaut**, réservés au capitaine et aux bêta-testeurs choisis. Application de « la complexité n'est jamais à la charge de l'utilisateur ». Mécanisme exact tranché post-Neon (« bêta-testeur choisi » suppose une notion de compte). *L'outil de preuve ne meurt jamais, mais il ne s'expose plus : c'est le capitaine qui distribue les lunettes.*

### 🧭 LES 9 PRINCIPES — CHAQUE CICATRICE DEVIENT UNE RÈGLE
*Le cœur transposable de la carte : huit des neuf principes sont des cicatrices de ce projet retournées en règles.*
1. **Une frontière technique, pas une promesse** *(cicatrice : « ce site est-il en zone sacrée ? », tranchée en comptant des lignes)*.
2. **Un nom = un rôle** *(cicatrice : les deux `toISO` homonymes)*.
3. **Une donnée = un seul chemin**, tout passe par le douanier *(cicatrice : les périodes hors `mergeStrategy`)*.
4. **L'identité se décide à la naissance**, jamais dérivée de ce qui peut bouger *(cicatrice : la clé note↔période découverte à la loupe en prod)*.
5. **Le temps passe une seule douane** *(cicatrice : la classe de bugs la plus coûteuse du projet)*.
6. **Les pièces s'ignorent entre elles** *(préventive : chaque frayeur passée vient d'un couplage invisible)*.
7. **La voile de rechange est à bord** — toute pièce critique a sa jumelle ou un repli écrit *(l'allégorie du capitaine, devenue règle)*.
8. **Le départ est une fonction, pas un accident.**
9. **Le critère de purge est la reconstructibilité** — appliqué **deux fois dès sa naissance** (stockage local ET statut du Rapport).

### ⛵ LA VOILE DE RECHANGE — NEON NAÎT EN JUMEAU (4 phases)
**① Neon observe** (copie de ce qui s'écrit, vérifiée au brut) → **② Neon compare** (l'app lit les deux sources et affiche les écarts — *chaque divergence est un bug trouvé AVANT la bascule*) → **③ Neon règne, champ par champ** (préséance basculée donnée par donnée, chaque bascule réversible ; candidats : les statuts d'event qui doivent quitter la zone invités de l'ICS, et les fiches d'annuaire qui naissent directement chez Neon) → **④ iCloud devient fenêtre.**
**Le prix, dit honnêtement :** pendant la cohabitation, deux endroits peuvent diverger ⇒ **la préséance s'écrit AVANT la phase 1, champ par champ.** Ce que D2 ajoute : **la porte Neon est un traducteur comme les autres, qui produit le même format pivot. Le jumeau coûte un traducteur, pas une refonte.**

### 💥 L'INCIDENT DU 05-08 — UNE HEURE D'ANNOTATIONS SUSPENDUE À UN ONGLET
Le fichier annotable livré le matin (`..._ANNOTABLE_050826_0900.html`) contenait **quatre apostrophes mal échappées** (`\\'` au lieu de `\'`, lignes 908, 921, 942, 951) ⇒ **erreur de syntaxe au chargement, script entier refusé par le navigateur**. Le formulaire restait remplissable (HTML natif), mais **ni la sauvegarde automatique, ni le compteur, ni l'export, ni la copie ne fonctionnaient**. Une heure d'annotations n'existait plus que dans l'onglet vivant. **Récupération intégrale** par script de sauvetage collé dans la console Safari du Mac (lecture seule du DOM, aucun rechargement). **Zéro perte.**
- ⭐ **Un livrable interactif n'est pas livré tant que ses boutons n'ont pas été cliqués.** Le rendu visuel correct ne prouve **rien** sur le script.
- ⭐ **Un indicateur d'état est un détecteur de panne.** Le compteur figé sur son texte initial (« 0 zone annotée pour l'instant ») a suffi à établir **en une question** que le script n'avait jamais tourné.
- ⭐ **Ne jamais recharger avant d'avoir extrait.** La règle « lecture seule par défaut » vaut aussi — surtout — en situation de sauvetage.

### 🧭 LEÇONS MÉTHODE DU LOT
- **DÉCIDÉ ≠ PROUVÉ.** Quinze décisions, zéro ligne de code lue. Chaque point affirmé de mémoire (API Outlook/Google, lecture du carnet iOS, limites de l'ICS, chaîne vCard, lecture d'un Excel côté PWA) a été **recopié en liste INVESTIGUER au lieu d'être gravé**. *Le doute s'inscrit dans le brief, il ne se grave pas.*
- **Un principe qui trouve une deuxième application sur un sujet étranger est un bon principe.** D5 (reconstructibilité), né du hors-réseau, a tranché tout seul la question « le Rapport est-il un sous-ensemble de NomadBook ? ».
- **Le critère du capitaine a battu le critère technique.** « Un module est une intention d'ouverture » a réglé en une phrase une taxonomie que le timonier découpait par nature de code — et il a réglé **NomadGuess par la même occasion** : personne n'ouvre l'app pour « faire de l'annuaire », donc l'annuaire n'est pas un module, il se **répartit** dans les couches (entités au hub · traducteurs à la douane · données sur Neon · trappe aux réglages). **Un résultat, pas un oubli.**
- **Relire, c'est produire.** La relecture par scènes concrètes n'a pas seulement validé : elle a fabriqué D13, D14, D15 et A1 — et corrigé une confusion (statut d'event vs statut d'annuaire) qu'aucune lecture linéaire n'aurait attrapée.
- **Une machine peut apprendre une règle, elle ne peut pas deviner laquelle** (D11, option A). Corollaire terrain : les « défauts de conception » d'un utilisateur sont souvent **des règles non écrites**.
- **La vérification par l'usage est un test d'architecture.** Deux voyages (la note de terrain, le RV client) ont été rejoués couche par couche. **Si un parcours oblige un module à contourner une couche, c'est la carte qui a un défaut — pas le parcours.**
- **Le carburant se gère aussi en séance papier.** La session de scellement a été coupée en pleine MAJ des moteurs, et le geste ③ (ce bloc) a dû être repris dans un fil neuf **à partir des fichiers, pas de la conversation**. Ils ont suffi. *Un jalon écrit dans un fichier survit à la fenêtre qui l'a produit — un jalon resté dans le fil, non.*

### 🧾 CE QUE LE LOT LAISSE OUVERT
- **Le brief INVESTIGUER — 14 questions, lecture seule** : extractibilité de la frontière sacrée (`syncCalendar`/`syncCalDAV` hors d'`App.jsx`) · inventaire des accès directs au stockage · les périodes peuvent-elles rejoindre le chemin commun · où le hub peut naître sans refonte · coût réel de la double porte · API Outlook/Google · limites de l'ICS · lecture du carnet iOS · extensibilité du hub (NomadTour) · place d'un module de tournée dans Neon · App Store et synchros non-iCloud · **fantômes du lot K** · **chaîne vCard sortante** · **fichiers plats entrants**.
- **Écart tracé (R4)** : le dossier fonction rapport fige 5 rubriques là où D7 grave « autant que d'utilisées » → à réconcilier au brainstorm R4.
- **Clause D14** : l'étude marché prospection est **due avant tout engagement V2** sur les statuts d'annuaire.
- **Zone non annotée** : Frais (V2) — la case existe, personne n'a posé de verdict dessus.

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
