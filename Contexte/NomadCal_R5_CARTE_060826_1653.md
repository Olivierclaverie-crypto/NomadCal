# NOMADCAL · LOT R5 — CARTE D'ARCHITECTURE CIBLE
*Itération 3 — carte **relue et validée par le capitaine** (relecture par scènes, 06-08-26). 06-08-26, heure de livraison à reporter dans le nom du fichier.*
*Ce fichier **remplace** : `NomadCal_R5_CARTE_ITER2_060826_HHMM.md` · `NomadCal_R5_DECISIONS_050826_1200.md` (jalon 1) · `NomadCal_R5_DECISIONS_050826_1930.md` (jalon 2). Le registre des décisions D1–D15 est en annexe ; le récit complet des jalons migre au Journal.*
*Fichier de brainstorm consolidé — n'est PAS un moteur. Sa matière rejoindra le Journal au scellement définitif de R5 (après le retour du brief INVESTIGUER).*

---

## STATUT

- Lot R5 : **ouvert**. Phase papier **achevée** : la carte a été relue couche par couche par le capitaine, chaque couche validée sur scènes concrètes de tournée. Trois acquis sont nés de la relecture elle-même : **D13** (dissolution du lot K), **D14** (prospection), **D15** (la fiche se tend).
- Le cousin **n'est pas intervenu** : rien ici n'est confronté au code. **Décidé ≠ prouvé.** Le geste suivant est le **brief INVESTIGUER** (14 questions, § dédié).
- Les points *« à certifier »* sont recopiés dans la liste INVESTIGUER (autoportance du futur brief).

## VERDICTS DE RELECTURE (06-08-26)

| Section | Verdict capitaine |
|---|---|
| Couche 0 — sources de vérité | **Juste** (5 scènes) |
| Couche 1 — la douane | **Juste** (4 scènes) |
| Couche 2 — le hub | **Juste** après correction : la scène « statut » confondait statut d'event et statut d'annuaire → **D14** |
| Couche 3 — modules, deux étages | **Juste** (4 scènes) |
| Couche 4 — l'interface | **Juste avec amendement** : outils de preuve sous clé |
| 9 principes + protocole de départ + voile de rechange | **Juste** |
| Voyages 1 et 2 | **Justes** après réponse à la question « la fiche créée est-elle transmise au fournisseur ? » → **D15** |
| Liste INVESTIGUER | Consolidée à 14 questions |

---

## COUCHE 0 — LES SOURCES DE VÉRITÉ
*Là où tes données dorment quand l'app est fermée.*

**Règle de la couche :** chaque champ de donnée a UNE source reine, écrite noir sur blanc. Deux sources qui se croient reines du même champ = le début de toutes tes frayeurs.

### Le fournisseur de calendrier actif — *iCloud aujourd'hui* (D1)
Une **case générique** : le fournisseur que l'utilisateur a désigné à l'installation — iCloud, Outlook ou Google. **Un seul actif à la fois** ; le découpage en calendriers internes suffit à séparer vie privée et vie professionnelle.
- Chez Olivier, c'est iCloud, et rien ne change au quotidien : le brut PROPFIND fait foi, jamais l'écran d'iCal.
- Sa destinée : quand Neon règnera, le fournisseur devient une **fenêtre** — un miroir pour que l'iPhone continue d'afficher, plus une vérité.
- **Porte B (plusieurs comptes simultanés) : écartée**, reportée en service V3. La carte ne la rend pas impossible — gratuit tant que D2 est respectée : ajouter un fournisseur, c'est ajouter un traducteur, jamais rouvrir le hub.
- Interdit : aucun module métier ne lui parle en direct.

### Neon (backend) — *case à pourvoir*
La future vérité centrale et le hub de toute la NomadSuite. Royaume étendu : il portera aussi **l'annuaire** (fiches Client et Interlocuteur, D9) et **les statuts** des rendez-vous (D12 : fonction 100 % Neon). Naissance en jumeau — voir la voile de rechange.

### IndexedDB — photos — *existe*
Le vestiaire des photos de terrain (compressées, max 1600 px), servies via `getPhotoURL`. À terme les photos montent dans Neon (archivage 12 mois du rapport) ; IndexedDB reste le cache local.

### Le stockage local, coupé en deux — *rôle rétrogradé et précisé* (D4, D5)
Le stockage local (localStorage pour le texte, IndexedDB pour les photos — même principe, deux magasins) sert **deux choses qu'il ne faut pas confondre, et une seule se purge** :

| | Contenu | Sort |
|---|---|---|
| **File d'attente** | Ce qui vient d'être créé sur le terrain, pas encore chez Neon. **Seule copie existante.** | Purge **dès l'accusé de réception** — jamais sur la foi d'un envoi (D4). |
| **Cache de lecture** | La semaine de RV, les notes récentes, les photos à revoir. **Reconstructible depuis Neon.** | **Ne se purge pas.** Vieillit et se renouvelle seul. |

- **Le critère de tri est la reconstructibilité** (principe 9). Le test de terrain : *« si je perds ce téléphone, cette donnée existe-t-elle ailleurs ? »* Oui → cache. Non → file d'attente, intouchable jusqu'à l'accusé.
- Le risque écarté : purger le cache après migration viderait l'écran d'un utilisateur qui ouvre l'app **dans un sous-sol sans réseau** — la situation de terrain pour laquelle NomadCal existe.
- Cicatrice : l'isolation WKWebView. Ce bloc reste la raison d'être de Neon.

### Le carnet de contacts de l'utilisateur — *hors les murs* (D8, élargi par D14)
Une source d'un genre nouveau : **dans la carte mais hors de chez nous**. Le carnet iOS (ou Google, ou Outlook) de l'utilisateur est une **source d'alimentation** de l'annuaire — jamais une source directe d'un event, jamais une destination.
- **On lit, on traduit, on range chez nous. Import, pas synchronisation.** Le carnet reste intact quoi qu'il arrive.
- **D14 élargit la famille : les fichiers plats (Excel/CSV)** — un fichier de prospects fourni par une direction s'injecte par le même geste. Même statut exact : source d'alimentation, import unique, jamais de synchronisation.
- La raison de fond : NomadCal ne peut pas dépendre d'une donnée **qu'il ne possède pas, ne contrôle pas et ne peut pas garantir**.
- **Sens unique nuancé par D15 :** NomadCal n'écrit jamais dans le carnet — mais il sait **tendre** une fiche (vCard au partage système, voir couche 4). L'écriture finale est le geste de l'utilisateur, dans l'interface d'Apple.
- *À certifier :* une app web ne lit probablement pas le carnet en direct — elle reçoit un fichier que l'utilisateur lui donne (`.vcf`).

**↕ Ce qui circule ici :** des fichiers ICS, des lignes de base, des octets de photo, des vCards, des fichiers plats — jamais rien que l'utilisateur voit directement.

---

## COUCHE 1 — LA DOUANE
*Le seul endroit qui a le droit de parler aux sources. La zone sacrée — devenue un vrai quartier, avec deux métiers.*

**Règle de la couche (D2) :** une frontière technique, pas une promesse — et derrière la frontière, **deux métiers qui ne se mélangent pas**. Traduire un protocole est un métier par fournisseur ; faire la douane est un métier unique. Sans cette séparation, trois fournisseurs = trois fois les mêmes bugs de date à corriger. C'est la doctrine temporelle appliquée à l'architecture.

### Les traducteurs — *un par fournisseur* (D2)
Chaque traducteur parle **une** langue étrangère et une seule : le CalDAV d'Apple, l'API de Microsoft, celle de Google. Il connaît les TZID, les `href`, les ETags, les bizarreries de son fournisseur — et il est **le seul à les connaître**.
- **Traducteur iCloud** — *existe* : l'actuel `caldav.js` + les 4 fonctions sacrées. Geste cible : sortir `syncCalendar`/`syncCalDAV` d'`App.jsx` pour que la frontière devienne un dossier, plus un numéro de ligne à vérifier.
- **Traducteur Neon** — *case à pourvoir* : la jumelle. ETag/If-Match naît ici. Le reste de l'app ne sait pas quel traducteur a servi — c'est ce qui rend le jumeau possible.
- **Traducteurs Outlook et Google** — *cases à pourvoir, vides en V1* : la carte leur réserve la place, rien de plus. *À certifier : l'état exact de Microsoft Graph et de l'API Google Calendar — affirmé de mémoire, donc suspect.*
- **Traducteurs de contacts** — *cases à pourvoir (chantier NomadGuess)* : vCard d'abord, fichiers plats (D14), Google/Outlook ensuite. Destination : l'annuaire.

### Le douanier — *un seul pour tous* (D2)
Trois responsabilités sous un seul chapeau, côté NomadCal de la frontière :
- **Valider et normaliser** — la douane temporelle vit ici : les dates se convertissent en entrant et en sortant, une seule fois, à un seul endroit. Les 3 idiomes (pivot midi · minuit local · `todayISO`) sont ses outils. Un bug de date corrigé chez lui est corrigé pour tous les fournisseurs d'un coup.
- **Fusionner** — `mergeStrategy` : quand le serveur et le téléphone racontent deux versions, il décide sans rien perdre. Règle cible : TOUTE donnée passe par lui, zéro tuyauterie parallèle. Cicatrice : les périodes NomadBook ont leur tuyau à part — le fix anti-fantôme (#38) ne les protège pas.
- **Mettre en file** — la boîte d'envoi (`pendingQueue` + tombstones) : c'est **la file d'attente** de la couche 0, vue côté douane. Une seule boîte pour tous les traducteurs ; elle note vers quelle source chaque geste doit partir ; elle se vide **sur accusé de réception**, jamais sur la foi d'un envoi.

### ⭐ LE FORMAT PIVOT — l'objet central de la carte (D2)
La forme d'un event (et demain d'un contact) **une fois traduit, avant qu'il touche le hub** :

> **Le hub ne voit jamais un TZID, un `href` ni un ETag.** Ce sont des mots de la langue iCloud. Il voit un event NomadCal, qui porte une **identité NomadCal** et une **adresse chez son fournisseur d'origine** — une adresse qu'il transporte sans jamais la lire.

- C'est le format pivot qui rend D1 réversible : ajouter Outlook, c'est écrire un traducteur qui produit le même pivot. Rien d'autre ne bouge.
- C'est lui qui rend la voile de rechange bon marché : le traducteur Neon produit et consomme le même pivot que le traducteur iCloud.
- **Écrire la fiche du format pivot est un des travaux papier majeurs de R5** — avec les fiches d'entités de la couche 2.
- Le jour où un mot de la langue iCloud apparaît au-dessus de la douane, **la carte est violée**.

**↕ Ce qui circule ici :** du pivot — des objets propres, datés en local, identifiés, dont les mots étrangers ont été laissés au vestiaire de leur traducteur.

---

## COUCHE 2 — LE HUB DE DONNÉES
*Le vocabulaire commun : la seule définition de ce qu'est un Event, une Note, un Client.*

**Règle de la couche :** l'identité d'une chose se décide ici, à sa naissance, une fois pour toutes. Une clé n'est jamais dérivée de quelque chose qui peut bouger. C'est la couche qui n'existe pas encore — le pari central de la carte.

### Les entités à formaliser
**Event · Client · Interlocuteur · Note · Période · Photo · Tâche · Rapport** — et demain Position, Frais (V2).
Chaque entité aura sa fiche : champs, identité stable, source reine. Écrire ces fiches est **LE** travail papier de R5 ; elles deviennent le contrat que Neon implémente.

### La fiche Client — clé interne ≠ IdC (D11)
Le fait qui impose la séparation : beaucoup d'utilisateurs n'auront **aucun identifiant client** renseigné. Une clé absente pour la moitié des utilisateurs n'est pas une clé.

| | **Clé interne** | **IdC** |
|---|---|---|
| Origine | Générée par l'annuaire à la création | Saisie ou importée |
| Présence | **Toujours** | **Facultative** |
| Visible | Jamais | Oui, dans NomadCal |
| Modifiable | Non | Oui |
| Rôle | Relie event, note, frais, rapport au client | **Passeport** vers l'extérieur (NomadMail, tableau de bord) |

> L'IdC n'est pas l'identité du client, c'est son passeport. Un client peut vivre sans passeport tant qu'il ne franchit pas la frontière.

- **NUCLI → IdC partout.** NomadCal ne connaît pas la *nature* de l'identifiant (NUCLI Hachette chez Olivier, code maison ailleurs), il connaît sa *fonction*. **L'IdC est du TEXTE, jamais un nombre** (zéros initiaux).
- L'Interlocuteur est une fiche rattachée à un Client.
- Import : mise en correspondance des champs **déclarée par l'utilisateur, non bloquante** (option A) ; formats d'entrée vCard et fichiers plats (D14).
- **Statut d'annuaire (prospect / actif…) : écarté en V1** (D14). Un prospect importé devient une **fiche ordinaire** — même flux, mêmes tournées, mêmes rapports, aucun deuxième groupe, aucun calendrier renommé. Clause d'ouverture : si un vrai besoin prospecteur émerge, le statut serait une **donnée d'activité** requêtable côté Neon — jamais une structure du carnet. Étude de marché due avant tout engagement V2 (voir « ce qui reste ouvert »).

### L'Event qui référence (D12)
- L'event **référence un Client** (par clé interne), et **facultativement un Interlocuteur**.
- **`SUMMARY` = Nom + Ville. Ni IdC, ni statut, ni identifiant interne.** L'event part chez le fournisseur comme un rendez-vous ordinaire. On ne bricole pas nos idées dans les cases des autres.
- **Le titre est un libellé historique gelé** à la création. Si le client change d'enseigne, la fiche se met à jour, pas les events passés. Rapports et recherches passent par **la référence, jamais par le texte du titre**.
- **Le statut d'event (en attente / à confirmer / confirmé) est une fonction 100 % Neon.** Un langage visuel de NomadCal, qui n'a rien à faire chez un fournisseur qui ne le parle pas. *(Migration à ne pas perdre : les statuts qui vivent aujourd'hui dans la zone « invités » de l'ICS déménageront vers Neon — champ de la phase 3 de la voile de rechange.)* ⚠️ Ne pas confondre avec le statut d'annuaire (D14, ci-dessus) : deux notions, deux objets.

### Le lot K est dissous (D13 — tranché en relecture)
D12 referme la piste `X-NOMADCAL-NUCLI` que la Roadmap prêtait au lot K. Si l'IdC n'entre pas dans l'ICS et que la référence client est une donnée d'annuaire, la question de K (« où vit l'identifiant d'un event pour survivre au round-trip ? ») a sa réponse : **il ne voyage pas — il vit chez nous.**
- **La moitié donnée de K** part chez Neon/annuaire (D9–D12). **La moitié interface** (le champ dans l'EventForm) part au brainstorm EventForm (E+R2).
- **Coût accepté :** pas de rattachement client sur les events avant Neon.
- **Bénéfice :** zéro propriété custom, zéro PR zone sacrée, zéro double migration.
- À répercuter à la Roadmap au scellement : la ligne K sort.

### La douane temporelle — *doctrine gravée, inchangée*
UTC chez les sources, local dans l'app, conversion aux frontières uniquement — logée chez **le douanier** (couche 1), les 3 idiomes fournis par le hub. Cicatrice : 43 sites audités, deux `toISO` homonymes, une fenêtre nocturne saisonnière.

**↕ Ce qui circule ici :** des entités nommées, identifiées, en heure locale — prêtes à l'usage.

---

## COUCHE 3 — LES MODULES MÉTIER · DEUX ÉTAGES (D6)
*Les pièces du bateau : chacune fait UN métier, et se démonte sans arrêter le navire.*

**Règle de la couche :** les modules ne se connaissent pas entre eux. Chacun parle au hub, jamais à un autre module, jamais à la douane, jamais aux sources.

**Critère d'étage, décidé par le capitaine :**
> **Un module est une intention d'ouverture.** « J'ouvre NomadCal pourquoi ? » — je prends un RV, j'édite mon rapport, je prépare mes frais, j'ajoute une note.

| Étage | Cases |
|---|---|
| **Modules** (une intention d'ouverture) | Calendrier · NomadTask · NomadBook · **Rapport** · Frais (V2) |
| **Services transverses** (au service des intentions) | Géoloc · IA |
| **Zone d'attente** (nommé, non instruit) | NomadTour |

### Étage 1 — les modules
- **Calendrier** — *existe.* La vue semaine, la création de RV, les séries. À venir : compositeur R2, sélecteur d'étendue R3, date de fin en mode horaire (E).
- **NomadTask** — *existe.* Les tâches glissantes.
- **NomadBook** — *existe.* Le journal de terrain : il **capture**. Cicatrice : la période courante se demande au hub, plus jamais un calcul local (#46).
- **Rapport** — *case à pourvoir (R4), promue module à part* (D7). NomadBook capture, le Rapport **compose et archive**. Le critère qui tranche est D5 : purge des notes APRÈS envoi confirmé + archivage 12 mois ⇒ **le rapport survit à ses sources** — il *copie* la matière à sa production, il ne pointe pas vers elle. Il porte de la donnée propre (PDF, période, date d'envoi, destinataire, nom auto-classant). La règle « autant de rubriques que d'utilisées » lui appartient. **Ce que D7 ne dit pas :** deux modules ≠ deux écrans lointains ; le bouton « composer le rapport » peut vivre dans NomadBook. **La séparation est dans les données et les responsabilités, pas dans la navigation.**
- **Frais** — *case à pourvoir (V2), zone non annotée.* Le lecteur-croiseur : il LIT Events et Positions via le hub.

### Étage 2 — les services transverses
Personne n'ouvre l'app pour « faire de la géolocalisation » : la géoloc *sert* une intention, l'IA *assiste* des intentions. Services disponibles pour tous les modules, **sans écran propre**.
- **Géoloc** — *case à pourvoir.* **Naît avec les Frais (V2)**, son premier consommateur concret. Un service transverse naît au service d'un besoin réel, pas dans le vide. Quand NomadTour arrivera, il trouvera le service déjà là.
- **IA** — *case à pourvoir (V3).* Lit via le hub, propose, n'écrit qu'après accord — le protocole du trio appliqué à la machine. Direction A vs B non tranchée. C'est aussi ici que loge le « service second fournisseur » de D1, si la V3 le fait naître.

### Zone d'attente — NomadTour
Nommé dans la carte, sans case ni entité. *Ne pas l'instruire n'est pas ne pas le prévoir* : sa présence change la question posée au cousin — « **la structure du hub permet-elle d'ajouter un module plus tard sans redécouper les entités existantes ?** »

### Et NomadGuess, alors ?
**NomadGuess n'est pas une case de cette couche — et c'est un résultat, pas un oubli.** Personne n'ouvre l'app pour « faire de l'annuaire » (le critère D6 tranche tout seul). L'annuaire se répartit dans la carte : ses **entités** (Client, Interlocuteur) au hub · ses **traducteurs** (vCard, fichiers plats, Google, Outlook) à la douane · ses **données** sur Neon · sa **trappe** dans les réglages (couche 4). Le « chantier NomadGuess » (écran de correspondance, audit d'entrée, sélection par groupe, dédoublonnage…) est du logiciel qui se construira **au-dessus** de ces fondations, plus tard, sans rien remettre en cause.

**↕ Ce qui circule ici :** des demandes simples (« donne-moi la semaine du 12 », « la période courante », « la fiche de ce client ») et des gestes utilisateur.

---

## COUCHE 4 — L'INTERFACE
*Ce que tu vois et touches. Rien d'autre — le rendu n'est jamais le stockage.*

**Règle de la couche :** l'interface affiche et transmet tes gestes. Elle ne calcule pas de vérité, ne stocke rien, ne convertit pas de dates.

### Grille, formulaires, popovers — *existe*
- Charte Orchard au fil des retouches, `App.jsx` redevient chef d'orchestre, les sacrées déménagent à la douane.
- **L'EventForm puise dans l'annuaire, jamais dans le carnet du téléphone** (D8). Le champ contact devient une recherche dans les fiches Client/Interlocuteur du hub.
- **Un client se crée dans l'annuaire, avec raccourci depuis l'event** (D10) : le **vrai formulaire de fiche** — le même que par la trappe, un seul formulaire dans toute l'app — s'ouvre depuis l'EventForm, sans perdre le fil, puis retour au rendez-vous. Écartée : la création silencieuse de fiches creuses — la dette exacte du lot H.
- **Trois écrans à ne pas confondre** (D12, *rendu ≠ stockage*) : le bloc dans la grille, le popover et le formulaire sont du **rendu libre**, décidés plus tard en ergonomie. Seul le `SUMMARY` est de la donnée stockée qui sort de NomadCal.

### « Pousser vers mon carnet » — *la fiche se tend, ne s'écrit pas* (D15, né de la relecture)
En fin de création d'une fiche, un bouton **« Pousser vers mon carnet »** : NomadCal génère une **vCard** et la tend au **partage système**. C'est iOS qui ouvre la fiche et propose « Créer un nouveau contact » ; c'est l'utilisateur qui enregistre. **NomadCal n'a jamais tenu le stylo** — D8 affiné : *jamais écrire, mais toujours savoir tendre.*
- **Contenu de la vCard : l'identité nue** — enseigne, ville, adresse, téléphones, email, interlocuteur.
- **Dehors : la clé interne** (os du hub) · **le statut** (donnée d'activité) · **l'IdC** (le mapping identifiant→carnet est un savoir-faire NomadSuite, il ne se solde pas dans un geste de convenance).
- Distinction avec le protocole de départ : le bouton est une **convenance quotidienne** ; le départ (D3) reste **intégral** — le fichier complet du paquet contient tout, IdC compris.
- Motivation : NomadGuess étant quasi invisible, l'utilisateur doit comprendre que sa fiche NomadCal n'est pas dans son carnet — le bouton est la réponse honnête à cette divergence. *(À certifier : la chaîne vCard + Web Share sur Safari iOS — question 13.)*

### La trappe annuaire — *case à pourvoir, naît avec Neon* (D9)
Un endroit dans les réglages où **consulter** l'annuaire, **corriger** une fiche, en **créer** une, et un bouton **« mettre à jour depuis mon carnet »**. **Une trappe, pas une pièce à vivre** : le parcours quotidien n'y passe jamais.
- Les trois raisons d'exister : un recours en cas d'erreur · une porte d'entrée pour le client neuf qui n'est dans aucun carnet · la défendabilité juridique (détenir des données de tiers dans un endroit que le responsable ne peut pas consulter heurte D3).
- Restent gravés : jamais écrire chez l'utilisateur (au sens strict : jamais sans son geste, D15) · autorisation explicite · chiffrement fort — *ce ne sont pas ses données à lui, ce sont celles de ses clients.*
- Import initial : **sélection par groupe** à l'installation (D10). Écartés : tri automatique par règles, remplissage à l'usage seul.

### Les outils de preuve — *sous clé* (amendement de relecture)
Le DebugPanel et son rawICS : l'observabilité fait partie de l'architecture, pas des bonus. **Amendement gravé en relecture :** les outils de preuve existent toujours, mais **invisibles par défaut** — accessibles uniquement au capitaine et aux bêta-testeurs explicitement choisis. Application du principe « la complexité n'est jamais à la charge de l'utilisateur ». Le mécanisme exact (geste caché, code, activation par compte) est un détail d'implémentation, tranché quand la bêta élargie approchera — probablement post-Neon (« bêta-testeur choisi » suppose une notion de compte). *L'outil de preuve ne meurt jamais, mais il ne s'expose plus : c'est le capitaine qui distribue les lunettes.*

---

## LES 9 PRINCIPES — chaque cicatrice (ou décision) devient une règle

1. **Une frontière technique, pas une promesse.** La zone sacrée devient un module fermé. *(Cicatrice : « ce site est-il en zone sacrée ? », tranchée en comptant des lignes.)*
2. **Un nom = un rôle.** Plus jamais deux homonymes aux comportements opposés. *(Cicatrice : deux `toISO`.)*
3. **Une donnée = un seul chemin.** Tout passe par le douanier. Zéro tuyauterie parallèle. *(Cicatrice : les périodes hors `mergeStrategy`.)*
4. **L'identité se décide à la naissance.** Une clé n'est jamais dérivée de ce qui peut bouger — et l'entité Client la porte doublement : clé interne toujours, IdC en passeport. *(Cicatrice : la clé note↔période découverte à la loupe en prod.)*
5. **Le temps passe une seule douane.** UTC chez les sources, local dans l'app, conversion aux frontières. *(Cicatrice : la classe de bugs la plus coûteuse du projet.)*
6. **Les pièces s'ignorent entre elles.** Un module parle au hub, jamais à un autre module. *(Préventive : chaque frayeur passée vient d'un couplage invisible.)*
7. **La voile de rechange est à bord.** Toute pièce critique a sa jumelle prête ou un repli écrit. Neon naît comme ça. *(Ton allégorie, devenue règle.)*
8. **Le départ est une fonction, pas un accident** (D3). *Rien de ce que l'app détient ne doit être irrécupérable.* Sonde d'architecture : le jour où le protocole de départ devient difficile à écrire, quelque chose s'est refermé quelque part. — D15 en est le prolongement quotidien : la fiche aussi sait sortir.
9. **Le critère de purge est la reconstructibilité** (D5, appliqué deux fois dès sa naissance : le stockage local ET le statut du Rapport). Ce qui est reconstructible peut disparaître ; ce qui ne l'est pas ne se supprime que sur accusé de réception.

---

## LE PROTOCOLE DE DÉPART (D3)

« Se désabonner » déclenche un protocole automatique qui rend à l'utilisateur tout ce que l'app détient.
- **Portée par version : V1 = les events.** Presque une formalité — et c'est exactement pourquoi il naît maintenant : *une promesse qui naît petite mais tout de suite ne devient jamais impossible à tenir.* V2/V3 : frais, rapports, photos, à mesure que les fonctions arrivent.
- **Le paquet à deux étages** *(à certifier)* : un **ICS** réimportable partout + un **fichier complet** relisible par NomadCal si l'utilisateur revient. D12 fixe la ligne de partage : **l'ICS transporte l'agenda, le fichier complet transporte le métier** (IdC, références, statuts, rapports). Réserve assumée, prix du format standard : qui réimporte l'ICS seul ailleurs récupère ses rendez-vous sans le rattachement clients.
- **Doctrine :** on ne garde pas le métier hors de l'ICS pour que l'utilisateur perde quelque chose en partant — on le fait **par propreté**. *On ne retient pas les gens en gardant leurs données en otage, on les retient parce que l'outil est bon.* (D15 le prouve au quotidien : même une fiche seule sait sortir.)
- **Écarté :** le miroir permanent à vie.

---

## LA VOILE DE RECHANGE — comment Neon naît en jumeau *(4 phases)*

1. **Neon observe.** La porte Neon reçoit une copie de ce qui s'écrit. On vérifie au brut qu'elle stocke juste.
2. **Neon compare.** L'app lit les deux sources et affiche les écarts — chaque divergence est un bug trouvé AVANT la bascule.
3. **Neon règne, champ par champ.** La préséance bascule donnée par donnée, chaque bascule réversible. *(Champs candidats : les **statuts d'event** — qui doivent quitter la zone invités de l'ICS, D12 — et les **fiches d'annuaire**, qui naissent directement chez Neon, D9.)*
4. **iCloud devient fenêtre.** La vérité vit dans Neon ; le fournisseur reste le miroir qui alimente l'iPhone.

Le prix, dit honnêtement : pendant la cohabitation, deux endroits peuvent diverger — d'où la préséance écrite AVANT la phase 1, champ par champ. **Ce que D2 ajoute : la porte Neon est un traducteur comme les autres, qui produit le même format pivot.** Le jumeau coûte un traducteur, pas une refonte.

---

## VÉRIFICATION PAR L'USAGE — deux voyages *(validés en relecture)*

### Voyage 1 — la note de terrain
1. Tu dictes une note chez un libraire, avec une photo. → **Interface** (couche 4).
2. **NomadBook** la reçoit et demande au hub : « quelle est la période courante ? » → couche 3 vers 2.
3. Le **hub** répond avec l'identité stable de la période, range la Note, envoie la photo au vestiaire. → couche 2.
4. Le **douanier** met la mise à jour en file, le **traducteur** de la source reine la pousse — iCloud aujourd'hui, Neon demain, sans que NomadBook le sache. La file se vide **sur accusé de réception**. → couche 1 vers 0.
5. Fin de période : le module **Rapport** lit Notes et Photos via le hub, **copie** la matière, compose le PDF, archive, purge après envoi confirmé. Il n'a jamais parlé à NomadBook — et il survivra aux notes.

### Voyage 2 — le RV client *(exerce D8, D10, D11, D12, D15)*
1. Tu crées un RV. L'**EventForm** cherche le client **dans l'annuaire** — jamais dans le carnet du téléphone. → couche 4 vers 2.
2. Client absent ? Le **raccourci** ouvre le vrai formulaire de fiche, l'annuaire génère la **clé interne** (l'IdC attendra son passeport), retour au RV sans perdre le fil. Facultatif : **« Pousser vers mon carnet »** tend la vCard d'identité nue au partage système (D15). → couches 4 et 2.
3. L'event naît au hub : il **référence** le client par clé interne, facultativement un interlocuteur ; son titre est composé — **Nom + Ville** — et **gelé**. → couche 2.
4. Le **douanier** valide et met en file ; le **traducteur iCloud** fabrique un ICS **propre** — `SUMMARY` ordinaire, ni IdC, ni statut, ni référence — et le pousse. → couche 1 vers 0. Dans la fenêtre iCloud, c'est un rendez-vous parfaitement normal.
5. Au retour (sync), le traducteur relit l'ICS, le douanier fusionne : **le pivot retrouve son identité NomadCal, et l'identité porte la référence** — la référence n'a jamais voyagé, elle vivait chez nous.
6. Tu passes le RV en « confirmé » : Neon seul le sait, l'ICS n'a pas bougé d'un octet. Le code client arrive plus tard : trappe (D9), IdC collé en texte — aucun event à réécrire, la référence fait foi.
7. Deux ans plus tard, le client change d'enseigne : la fiche se met à jour, les events passés gardent leur libellé historique — et toutes les recherches les retrouvent quand même, par la référence.

**Si un jour un de ces parcours oblige un module à contourner une couche, c'est la carte qui a un défaut — pas le parcours.**

---

## CE QUE LE COUSIN DEVRA VÉRIFIER — matière du brief INVESTIGUER *(14 questions, lecture seule)*

**Héritées de l'ébauche 1 :**
1. **La frontière sacrée est-elle extractible ?** Sortir `syncCalendar`/`syncCalDAV` d'`App.jsx` : qu'est-ce qui s'y accroche réellement ?
2. **Qui lit le stockage en direct ?** Inventaire des accès localStorage/IndexedDB hors douane — la mesure du chemin unique à construire.
3. **Les périodes peuvent-elles rejoindre le chemin commun**, ou leur tuyauterie à part a-t-elle une raison qu'on ne voit pas d'ici ?
4. **Où le hub peut-il naître sans refonte ?** Atteignable par petites tranches, ou big-bang (auquel cas il attend Neon) ?
5. **Le coût réel de la double porte** : ce que la cohabitation iCloud+Neon demande à la boîte d'envoi et au fusionneur d'aujourd'hui.

**Certifications des jalons :**
6. **API Outlook (Microsoft Graph) et Google Calendar** : état exact, support CalDAV éventuel (D2 — affirmé de mémoire, suspect).
7. **Limites de l'ICS** : confirmation qu'il ne transporte pas les champs propres NomadCal → validation du paquet de départ à deux étages (D3).
8. **Carnet iOS** : confirmation qu'une app web ne peut pas le lire en direct — elle reçoit un fichier (D8).
9. **Extensibilité du hub** : ajouter un module plus tard (NomadTour) sans redécouper les entités existantes (D6).
10. **Place d'un module de tournée dans Neon** — question de forme, pas de fonction (D6).
11. **Déploiement App Store et synchronisations autres qu'iCloud** — question capitaine, annotations ébauche 1.

**Nées de la relecture :**
12. **Fantômes du lot K** (D13) : vérifier qu'**aucun reste de code** ne suppose une propriété custom NUCLI dans l'ICS — le lot est dissous, il ne doit pas laisser de fantôme.
13. **Chaîne vCard sortante** (D15) : une PWA peut-elle générer un `.vcf` et le tendre au **partage système iOS** (Web Share API + fichiers, support Safari réel) ? Le mécanisme a été affirmé en séance — plausible, pas prouvé.
14. **Fichiers plats entrants** (D14) : lire un Excel/CSV côté PWA pour l'import — faisable, avec quelle bibliothèque, quelles limites ?

---

## CE QUI RESTE OUVERT (hors carte, tracé)

- **Points métier locaux** (lots E, R2, R4) : tâche terminée effacée par le refresh iCloud (intuition : feat Neon) · rubriques du rapport « autant que d'utilisées » · swipe trop court confondu avec un tap · vues jour/mois/année · drag'n drop · EventForm (logo absent du champ contact) · versions bêta.
- **Zone non annotée** : Frais (V2) — la case existe, personne n'a posé de verdict dessus.
- **En file (brainstorms)** : « réordonner la roadmap vers Neon » (cette carte le nourrit : R5 avance, prérequis n°1) · EventForm (E+R2) · R4 · méthode · **⭐ Étude marché prospection** (D14 — session timonier + recherche web, due avant tout engagement V2 sur les statuts d'annuaire).
- **Au scellement définitif de R5** : corriger l'État (« chantier actif ») · sortir la ligne K de la Roadmap (D13) · migrer le récit des jalons + les leçons de session au Journal.

---

## ANNEXE — REGISTRE DES DÉCISIONS CAPITAINE D1–D15

*Une ligne par décision. Le récit complet (options écartées, scènes, arguments) vit au Journal.*

| # | Décision | Essence |
|---|---|---|
| **D1** | Fournisseur unique | Un seul fournisseur de calendrier actif à la fois (iCloud/Outlook/Google). Multi-comptes (porte B) → service V3. |
| **D2** | Traducteurs + douanier + pivot | Un traducteur par fournisseur, un douanier unique, un **format pivot** : le hub ne voit jamais TZID/href/ETag. |
| **D3** | Le départ est une fonction | Protocole de départ dès V1. Rien d'irrécupérable. Paquet 2 étages : ICS standard + fichier complet. |
| **D4** | Purge sur accusé | La purge locale n'a lieu qu'APRÈS accusé de réception — jamais sur la foi d'un envoi. |
| **D5** | Critère = reconstructibilité | File d'attente (seule copie) ≠ cache de lecture (reconstructible). Seul le reconstructible peut disparaître librement. |
| **D6** | Deux étages en couche 3 | Modules = intention d'ouverture · services transverses (Géoloc naît avec Frais, IA) · NomadTour en zone d'attente. |
| **D7** | Rapport module à part | Le rapport copie et survit à ses sources. Séparation de données, pas de navigation. |
| **D8** | Annuaire, pas carnet | L'EventForm puise dans l'annuaire NomadCal. Le carnet = source d'alimentation. Import, jamais synchronisation. Jamais écrire chez l'utilisateur. |
| **D9** | Trappe annuaire | Consulter/corriger/créer + « MAJ depuis mon carnet » dans les réglages. NomadGuess naît avec Neon. |
| **D10** | Vrai formulaire, raccourci | Une fiche se crée par le vrai formulaire, accessible en raccourci depuis l'event. Import initial par groupes. |
| **D11** | Clé interne ≠ IdC | Clé interne : générée, invisible, toujours. IdC : facultatif, texte, passeport. NUCLI → IdC partout. |
| **D12** | ICS propre | `SUMMARY` = Nom + Ville, ni IdC ni statut. Statut d'event 100 % Neon. Titre = libellé gelé ; la vérité = la référence. |
| **D13** | Le lot K se dissout | Moitié donnée → Neon/annuaire ; moitié interface → brainstorm EventForm. Coût accepté : pas de rattachement client avant Neon. Zéro X-prop, zéro PR sacrée. |
| **D14** | Le prospect est ordinaire | Pas de statut d'annuaire structurant en V1 : une fiche importée entre dans le flux normal. Sources élargies aux fichiers plats (Excel/CSV). Clause d'ouverture : étude marché prospection due avant tout engagement V2 — le statut serait alors une donnée d'activité Neon, jamais une structure du carnet. |
| **D15** | La fiche se tend | Bouton « Pousser vers mon carnet » = vCard au partage système, écrite par iOS sur le geste de l'utilisateur. Contenu : identité nue — sans clé interne, sans statut, **sans IdC** (le mapping est un savoir-faire NomadSuite). Le départ (D3) reste intégral, IdC compris. |
| **A1** | *(amendement)* Outils de preuve sous clé | Invisibles par défaut ; capitaine + bêta-testeurs choisis. Mécanisme tranché post-Neon. |

---

## PROCHAIN GESTE

La carte est validée papier. Séquence de scellement : ① consolidation doctrine annuaire (fichier séparé) → ② MAJ moteurs État + Roadmap → ③ bloc Journal (récit des jalons + leçons) → ④ **brief INVESTIGUER** pour le cousin, à partir des 14 questions ci-dessus. Session cousin : cloud confortable mais non obligatoire (lecture seule).
