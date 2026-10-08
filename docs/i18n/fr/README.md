# Mes zones DNS
![Banner](https://newblog.siteground.com/en/wp-content/uploads/sites/2/2021/07/DNS_blog-post-1200x600-1.jpg)

[![en](https://img.shields.io/badge/lang-en-red.svg)](../../../README.md)
[![fr](https://img.shields.io/badge/lang-fr-blue.svg)](./README.md)


Ce dépôt contient une configuration reproductible de la zone DNS pour chaque domaine dont je dispose.

La configuration est gérée via [`dnscontrol`](https://github.com/StackExchange/dnscontrol) et déployée par une [`GitHub Action`](https://github.com/wblondel/dnscontrol-action) lors de fusions dans la branche `master`.

Toutes les modifications d'entrées DNS sont faites via ce dépôt.

## Configuration

Clonez ce dépôt et créez un fichier `creds.local.json` à la racine.

Ensuite, configurez les identifiants pour:
- [Cloudflare](https://docs.dnscontrol.org/provider/cloudflareapi)
- [deSEC](https://docs.dnscontrol.org/service-providers/providers/desec)
- [Dynadot](https://docs.dnscontrol.org/provider/dynadot)
- [OVH](https://docs.dnscontrol.org/service-providers/providers/ovh)
- [Spaceship](https://docs.dnscontrol.org/provider/spaceship)

Les étapes à suivre pour obtenir les informations d'identification de chaque fournisseur de services sont listées sur les pages de documentation correspondantes.

Pour plus d'informations sur le fichier d'informations d'identification, veuillez visiter [cette page](https://docs.dnscontrol.org/commands/creds-json).

Ensuite, créez un fichier `.env` avec l'emplacement du fichier d'informations d'identification local :
```
DNSCONTROL_LOCAL_CREDS=creds.local.json
```

## Usage

Docker est requis car `dnscontrol` est utilisé via Docker.

Pour obtenir la liste des commandes disponibles, exécutez `make help` (ou `make`).

### Obtenir la version de DNSControl
```sh
make version
```

Cette commande vous permet de savoir rapidement quelle version de DNSControl est utilisée.

### Vérifier et valider dnsconfig.js
```sh
make check
```

Cette commande vous permet de vérifier et valider la syntaxe de la configuration des zones DNS.

### Vérifier les informations d'identifications des fournisseurs de services
```sh
CRED_KEY=cred_name make check-creds
```

Cette commande effectue une petite opération pour vérifier les informations d'identification d'un fournisseur de services.

La variable d'environnement `CRED_KEY` doit être définie et doit contenir le nom des informations d'identification que vous souhaitez tester, tel que défini dans le fichier d'informations d'identification local (`creds.local.json`).

Exemple:
```sh
CRED_KEY=ovh make check-creds
```

### Prévisualiser les modifications à apporter
```sh
make preview
```

Cette commande lit la configuration et affiche les modifications à apporter, sans les appliquer.

### Appliquer les modifications
Par mesure de précaution, il n'est pas possible d'appliquer les modifications manuellement. Vous devez d'abord créer une demande de fusion de branches (*PR*), puis l'accepter.

## Vérifications de santé des domaines

Le workflow [Domain health](../../../.github/workflows/domain-health.yml) exécute [`scripts/domain-health.sh`](../../../scripts/domain-health.sh) tous les jours, et à la demande depuis l'onglet *Actions*. Pour chaque domaine de `domains/`, il vérifie que :

- le domaine se résout via un résolveur qui valide DNSSEC (Google Public DNS). Une chaîne de confiance rompue, par exemple un enregistrement DS chez le registrar qui ne correspond plus aux clés de la zone, fait échouer la résolution avec `SERVFAIL`. Lorsque Google est injoignable, ou que sa réponse semble anormale (une erreur, ou un domaine marqué `// DNSSEC: on` qui ne se valide pas), Cloudflare (`1.1.1.1`) est aussi interrogé avant que quoi que ce soit n'échoue : il prend le relais quand Google est en panne, un problème que les deux voient est un échec, et des résolveurs en désaccord ne donnent qu'un avertissement. Un résolveur en panne n'est plus interrogé pendant le reste de l'exécution, de sorte qu'une panne ne la ralentit pas ;
- DNSSEC est toujours activé pour les domaines qui doivent l'avoir. Marquez un tel domaine avec un commentaire `// DNSSEC: on` dans son fichier de `domains/` : il échoue alors si ses réponses ne sont plus validées. Un domaine validé sans ce commentaire ne provoque qu'un avertissement ;
- le domaine n'expire pas bientôt, d'après le serveur RDAP du registre (les dates sont en UTC). Il y a un avertissement en dessous de 60 jours et un échec en dessous de 21 jours : un échec signifie donc qu'un renouvellement est urgent ;
- les données RDAP du registre sont saines. Le domaine devrait avoir un verrou de transfert chez le registrar (avertissement sinon). Ses serveurs de noms doivent appartenir au fournisseur DNS déclaré dans son fichier avec `DnsProvider(DSP_...)` : lorsque vous ajoutez un fournisseur dans `globals/providers.js`, ajoutez ses serveurs de noms dans `provider_nameservers` dans le script, sinon la vérification ne fait qu'avertir. Un domaine marqué `// DNSSEC: on` doit aussi avoir un enregistrement DS au registre.

Sur `master`, un domaine en échec ouvre une issue (voir [Issues GitHub](#issues-github)) et l'exécution reste verte : elle n'échoue que lorsque la surveillance elle-même est tombée en panne. Les avertissements apparaissent sur la page de statut et dans l'exécution, mais n'ouvrent pas d'issue. Dans une exécution lancée sur une autre branche, une vérification en échec fait échouer l'exécution.

Pour l'exécuter en local, vous avez besoin de `curl` et `jq` :
```sh
scripts/domain-health.sh
```

Les variables d'environnement `WARN_DAYS` et `FAIL_DAYS` modifient les deux seuils d'expiration (60 et 21 jours par défaut).

### Page de statut

Le même workflow publie les résultats sous forme de page de statut, construite à partir de [`site/`](../../../site) et déployée avec GitHub Pages. Elle liste tous les domaines, ceux en échec en premier, et affiche un avertissement lorsque ses données ont plus de 36 heures, ce qui signifie que le workflow planifié a cessé de s'exécuter. La page n'est déployée que depuis `master`.

La page affiche aussi le registrar et le fournisseur DNS de chaque domaine, lus dans son fichier de `domains/` : la constante `REG_` de l'appel `D()` et les `DnsProvider(DSP_...)`. Pour un registrar que `dnscontrol` ne prend pas en charge, déclaré avec `REG_NONE`, écrivez son nom dans un commentaire `// Registrar: Nom` dans le fichier. Les noms affichés viennent de `label` dans le script : ajoutez-y les constantes que vous ajoutez dans `globals/providers.js`, sinon un nom est construit à partir de la constante (`REG_FOO_BAR` est affiché « Foo bar »).

GitHub Pages doit utiliser **GitHub Actions** comme source (*Settings > Pages > Build and deployment > Source*).

Pour prévisualiser la page en local :
```sh
JSON_OUTPUT=site/status.json scripts/domain-health.sh
python3 -m http.server --directory site
```

Ouvrez ensuite http://localhost:8000.

## Détection de dérive DNS

Le workflow [DNS drift](../../../.github/workflows/dns-drift.yml) s'exécute toutes les nuits, et à la demande depuis l'onglet *Actions*. Il exécute `dnscontrol preview --expect-no-changes` auprès des fournisseurs, et échoue si les enregistrements en ligne diffèrent de ceux de ce dépôt, par exemple après une modification faite dans le tableau de bord d'un fournisseur. Les serveurs de noms définis chez les registrars que `dnscontrol` gère sont comparés aussi. Rien n'est modifié chez les fournisseurs.

Lorsque des enregistrements dérivent, une issue est ouverte pour chaque domaine qui diffère (voir [Issues GitHub](#issues-github)), et le résumé de l'exécution liste les enregistrements ([`scripts/dns-drift-report.sh`](../../../scripts/dns-drift-report.sh) l'écrit). Pour conserver une modification, mettez à jour les fichiers de `domains/` pour qu'ils y correspondent. Pour l'annuler, relancez la dernière exécution de *Push DNS changes* sur `master`.

Le workflow utilise les mêmes secrets que *Push DNS changes*. Les exécutions de ce dépôt sont publiques : le rapport masque donc le secret `HOME_IP` s'il apparaît dans un enregistrement.

## Issues GitHub

Un problème trouvé par le workflow *Domain health* ou *DNS drift* est signalé par une issue GitHub (un ticket), pour qu'un problème qui dure des semaines coûte deux notifications (une à son ouverture, une à sa résolution) au lieu d'une notification d'échec d'exécution chaque jour.

- Il y a une issue par domaine en échec et par workflow, avec le label `domain-health` ou `dns-drift`, assignée au propriétaire du dépôt, ce qui le notifie. Les avertissements n'ouvrent jamais d'issue : ils n'apparaissent que sur la page de statut.
- Tant que le problème dure, chaque exécution rafraîchit l'issue en la modifiant, ce qui ne notifie personne.
- Une fois le problème disparu, l'exécution ferme l'issue avec un commentaire.
- [`scripts/sync-issues.sh`](../../../scripts/sync-issues.sh) s'en charge, à la fin des exécutions planifiées et manuelles sur `master`. Ces exécutions restent vertes quand un domaine échoue. Elles échouent, et GitHub envoie sa notification habituelle d'échec d'exécution, quand la surveillance elle-même est tombée en panne : la vérification ne s'est pas terminée (rien n'est jamais fermé dans ce cas), ou GitHub a refusé de mettre à jour les issues.
- Les issues sont publiques comme le dépôt : le secret `HOME_IP` y est donc masqué, et ce qui provient du DNS ou des résolveurs est affiché dans des blocs de code.

## Signal de vie (*heartbeat*)

Les deux workflows planifiés (*Domain health* et *DNS drift*) peuvent envoyer un signal à un service de surveillance, comme [Healthchecks.io](https://healthchecks.io), à chaque exécution. Le service vous alerte lorsque les signaux s'arrêtent, ce qui permet de découvrir qu'une planification s'est arrêtée silencieusement. Rien d'autre ne le signalerait, et la page de statut ne le montre que si vous l'ouvrez. GitHub désactive par exemple les workflows planifiés d'un dépôt public après 60 jours sans activité.

[`scripts/heartbeat.sh`](../../../scripts/heartbeat.sh) envoie le signal à la fin de chaque exécution planifiée ou manuelle sur `master`, quel que soit le résultat des vérifications : une vérification en échec ouvre une issue, le signal indique seulement que le workflow s'est exécuté. Les exécutions sur demande de fusion de branches n'envoient jamais de signal.

Pour le mettre en place, créez une vérification par workflow dans le service, avec une période de 1 jour et un délai de grâce de quelques heures (6, par exemple), et choisissez où il vous alerte. Enregistrez ensuite leurs URL de signal comme secrets de ce dépôt :
```sh
gh secret set HEARTBEAT_DOMAIN_HEALTH_URL   # Domain health, s'exécute à 06:17 UTC
gh secret set HEARTBEAT_DNS_DRIFT_URL       # DNS drift, s'exécute à 03:41 UTC
```

`gh secret set` demande la valeur : elle ne se retrouve donc pas dans l'historique de votre shell. Une URL de signal permet à n'importe qui d'envoyer des signaux pour sa vérification : gardez-la secrète. Tant qu'un secret n'est pas défini, l'exécution n'affiche qu'une notice. Un service de surveillance en panne ne fait pas non plus échouer l'exécution, le signal affiche simplement un avertissement.

## Modification de la configuration

La branche `master` est protégée, elle n'accepte que des soumissions (*commits*) provenant de demandes de fusion de branches.

Vous devez d'abord créer une branche dans laquelle vous soumettrez vos modifications, puis créer une demande de fusion de branches.

Les scripts de `scripts/`, les workflows de `.github/workflows/` et le JavaScript de la page de statut dans `site/` sont analysés à chaque demande de fusion de branches par le workflow [Lint](../../../.github/workflows/lint.yml), avec [ShellCheck](https://www.shellcheck.net), [actionlint](https://github.com/rhysd/actionlint) et [Biome](https://biomejs.dev). Les autres fichiers `.js` sont de la configuration `dnscontrol` : ils ne sont donc pas analysés. Pour vérifier vos modifications avant de les pousser, lancez la même chose en local (Docker est requis, et seuls les fichiers suivis par Git sont analysés : faites donc d'abord un `git add` des nouveaux fichiers) :
```sh
scripts/lint.sh
```

La page de statut affiche du texte qui provient des enregistrements DNS et des résolveurs : son JavaScript ne doit donc définir que du texte. Utiliser `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval()` ou `new Function()` fait aussi échouer la vérification.

Les versions des trois outils sont épinglées par tag et par digest dans [`docker/lint.Dockerfile`](../../../docker/lint.Dockerfile). Ce fichier n'est jamais construit : il ne liste les images que sous forme de lignes `FROM`, pour que Dependabot propose leurs mises à jour dans une demande de fusion de branches (la vérification Lint s'exécute sur celle-ci : toute nouvelle anomalie apparaît donc avant que vous ne la fusionniez), et `scripts/lint.sh` y lit les images. Conservez son format `FROM image AS name`.

Les *secrets* sont définis comme *secrets* d'environnement sur GitHub et sont utilisés dans le fichier `creds.json`.

---

Bannière fournie par : https://siteground.com/ (merci à eux!)
