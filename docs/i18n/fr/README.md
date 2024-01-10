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
- [OVH](https://docs.dnscontrol.org/service-providers/providers/ovh)
- [deSEC](https://docs.dnscontrol.org/service-providers/providers/desec)

Les étapes à suivre pour obtenir les informations d'identification de chaque fournisseur de services sont listées sur les pages de documentation correspondantes.

Pour plus d'informations sur le fichier d'informations d'identification, veuillez visiter [cette page](https://docs.dnscontrol.org/commands/creds-json).

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
DNSCONTROL_LOCAL_CREDS=path_to_creds_file CRED_KEY=cred_name make check-creds
```

Cette commande effectue une petite opération pour vérifier les informations d'identification d'un fournisseur de services.

La variable d'environnement `DNSCONTROL_LOCAL_CREDS` doit être définie et doit contenir le chemin d'accès au fichier d'informations d'identification local (`creds.local.json`).

La variable d'environnement `CRED_KEY` doit être définie et doit contenir le nom des informations d'identification que vous souhaitez tester, tel que défini dans le fichier d'informations d'identification local (`creds.local.json`).

Exemple:
```sh
DNSCONTROL_LOCAL_CREDS=creds.local.json CRED_KEY=ovh make check-creds
```

### Prévisualiser les modifications à apporter
```sh
DNSCONTROL_LOCAL_CREDS=path_to_creds_file make preview
```

Cette commande lit la configuration et affiche les modifications à apporter, sans les appliquer.

La variable d'environnement `DNSCONTROL_LOCAL_CREDS` doit être définie et doit contenir le chemin d'accès au fichier d'informations d'identification local (`creds.local.json`).

### Appliquer les modifications
Par mesure de précaution, il n'est pas possible d'appliquer les modifications manuellement. Vous devez d'abord créer une demande de fusion de branches (*PR*), puis l'accepter.

## Modification de la configuration

La branche `master` est protégée, elle n'accepte que des soumissions (*commits*) provenant de demandes de fusion de branches.

Vous devez d'abord créer une branche dans laquelle vous soumettrez vos modifications, puis créer une demande de fusion de branches.

Les *secrets* sont définis comme *secrets* d'environnement sur GitHub et sont utilisés dans le fichier `creds.json`.

## TODO
- [ ] Développer un fournisseur de service pour [Spaceship](https://www.spaceship.com) &nbsp; [![X (formerly Twitter)](https://img.shields.io/twitter/follow/spaceship?label=%40spaceship&link=https%3A%2F%2Ftwitter.com%2Fspaceship)](https://twitter.com/spaceship) 
- [ ] Développer un fournisseur de service pour [Sav](https://www.sav.com) &nbsp; [![X (formerly Twitter)](https://img.shields.io/twitter/follow/usesav?label=%40usesav&link=https%3A%2F%2Ftwitter.com%2Fusesav)](https://twitter.com/usesav)

---

Bannière fournie par : https://siteground.com/ (merci à eux!)