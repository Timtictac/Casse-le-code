# Lister les combinaisons d'une somme

L'IA répond « somme des 3 cartes de gauche = 7 » ? Cela paraît vague, mais il y a en fait **peu de façons** d'atteindre exactement 7. Voici une méthode systématique pour toutes les énumérer à la main.

## Le format de la situation

La main de l'IA est triée du plus petit au plus grand. La question concerne les 3 cartes de gauche. On peut représenter ça ainsi :

$$\underbrace{\square \;\; \square \;\; \square}_{\,a\,+\,b\,+\,c\;=\;7\,} \;\;\; \square \;\; \square$$

Visuellement, la main mystère ressemble à ceci :

\? \? \? \? \?

Les **3 premières** doivent sommer à **7**, et on a la contrainte $a \le b \le c$ (puisque la main est triée). Les deux dernières peuvent valoir n'importe quoi de plus grand.

## L'algorithme à la main

L'idée : on **fixe la plus petite carte** $a$, puis on découpe le reste.

### Étape 1 — on commence avec $a = 0$

Il reste $b + c = 7$ avec $b \le c$. Le plus équilibré est $b = 3, c = 4$ (on coupe 7 en deux moitiés, en mettant le plus gros à droite) :

\0N \3B \4N

Puis on **déplace une unité de droite à gauche**, tant que la contrainte $b \le c$ tient :

\0N \2B \5N
\0N \1B \6N
\0N \0B \7N

On ne peut pas aller plus loin : le suivant serait $b = -1$. **4 combinaisons pour $a = 0$.**

### Étape 2 — on prend $a = 1$

Il reste $b + c = 6$ avec $1 \le b \le c$. Plus équilibré : $b = 3, c = 3$ :

\1N \3B \3N

Puis on déplace à gauche :

\1N \2B \4N
\1N \1B \5N

Ici on s'arrête : $b = 0$ violerait $a \le b$. **3 combinaisons pour $a = 1$.**

### Étape 3 — on prend $a = 2$

Il reste $b + c = 5$ avec $2 \le b \le c$. Plus équilibré : $b = 2, c = 3$ :

\2N \2B \3N

Puis :

\2N — impossible d'aller plus à gauche, $b = 1$ violerait $a \le b$. **1 combinaison pour $a = 2$.**

### Étape 4 — peut-on prendre $a = 3$ ?

Il faudrait $b + c = 4$ avec $3 \le b \le c$, donc $b \ge 3$ et $c \ge 3$, donc $b + c \ge 6$. Impossible. **On s'arrête.**

## Récapitulatif

| $a$ | $b$ | $c$ |
|---|---|---|
| 0 | 0 | 7 |
| 0 | 1 | 6 |
| 0 | 2 | 5 |
| 0 | 3 | 4 |
| 1 | 1 | 5 |
| 1 | 2 | 4 |
| 1 | 3 | 3 |
| 2 | 2 | 3 |

**8 combinaisons de valeurs**. Elles sont parfaitement énumérables à la main, et on n'en oublie aucune.

## Pourquoi cet ordre marche

À chaque étape, on garde une **invariante** : $a \le b \le c$. En partant de la répartition la plus équilibrée et en transférant une unité $c \to b$, on respecte automatiquement $b \le c$ jusqu'à l'égalité ou jusqu'à ce que $b$ rattrape $a$. Comme on incrémente $a$ d'une unité à chaque grand passage, on **balaye toutes les triplets** sans doublon.

## Et les couleurs ?

Cette énumération porte sur les **valeurs**. Pour chaque triplet :

- une valeur répétée (ex. \0N \0B \7N ou \1N \1B \5N) impose **une noire et une blanche** — il n'y a que deux exemplaires de chaque valeur ≠ 5.
- une valeur égale à 5 impose **du vert** (\5V).
- les autres valeurs peuvent être indépendamment \N ou \B.

**Astuce :** retirez aussi de l'énumération tout triplet qui utiliserait une carte que **vous** avez en main. Le paquet est partagé. Voir le tuto *Niveau 0* pour la mise en pratique.
