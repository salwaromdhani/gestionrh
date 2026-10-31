# GestionRH – Application de gestion des ressources humaines

## Présentation du projet

GestionRH est une application web de gestion des ressources humaines développée avec Spring Boot et MySQL.

Elle permet de centraliser et de gérer les informations relatives aux employés, aux départements, aux postes, aux compétences, aux congés et aux contrats.

## Fonctionnalités principales

- Gestion des employés : ajout, consultation, modification et suppression.
- Gestion des départements.
- Gestion des postes et des salaires.
- Gestion des compétences.
- Gestion des congés.
- Gestion des contrats.
- Consultation des données à travers une interface web.
- API REST pour les opérations CRUD.

## Technologies utilisées

| Technologie | Utilisation |
|---|---|
| Java | Langage de programmation |
| Spring Boot | Développement backend |
| Spring Data JPA | Gestion de la persistance |
| MySQL | Base de données |
| Maven | Gestion des dépendances |
| HTML / CSS / JavaScript | Interface utilisateur |
| Postman | Tests des API REST |

## Architecture du projet

```text
gestion-rh/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/gestionrh/
│   │   │       ├── model/
│   │   │       ├── repository/
│   │   │       ├── service/
│   │   │       ├── controller/
│   │   │       └── exception/
│   │   └── resources/
│   │       ├── static/
│   │       └── application.properties
│   └── test/
├── pom.xml
└── README.md
```

## Installation et exécution

1. Cloner le repository :

```bash
git clone https://github.com/salwaromdhani/gestionrh.git
```

2. Créer une base de données MySQL.

3. Configurer la connexion à MySQL dans `application.properties`.

4. Installer les dépendances Maven.

5. Lancer l'application Spring Boot.

## Tests API REST

Les API REST sont testées avec Postman à travers les méthodes HTTP :

- GET : consulter les données.
- POST : ajouter des données.
- PUT : modifier des données.
- DELETE : supprimer des données.

## Auteur

**Saloua Romdhani**

Projet académique – Gestion des ressources humaines.
