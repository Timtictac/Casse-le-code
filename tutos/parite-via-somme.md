# Déduire la parité depuis une somme

Une question de somme **n'est pas qu'une question de somme** : elle vous renseigne aussi, *gratuitement*, sur la **parité** des cartes concernées.

## Le principe

La parité d'une somme dépend uniquement du **nombre de cartes impaires** qu'on additionne. En notation modulaire :

$$\Bigl(\underbrace{c_1 + c_2 + \dots + c_k}_{\text{cartes interrogées}}\Bigr) \bmod 2 \;=\; (\text{nombre de } c_i \text{ impaires}) \bmod 2$$

Autrement dit :

- somme **paire** ⇔ nombre de cartes impaires **pair** (0, 2, 4…)
- somme **impaire** ⇔ nombre de cartes impaires **impair** (1, 3, 5)

Les cartes paires (0, 2, 4, 6, 8) ne changent jamais la parité de la somme. Seules les impaires (1, 3, 5, 7, 9) la font basculer.

## Exemple sur 3 cartes

Vous demandez « somme des 3 cartes du milieu » et l'IA répond **14** (pair).

Donc parmi ces 3 cartes, il y a **0 ou 2 cartes impaires** :

- 3 paires + 0 impaire ✓
- 1 paire + 2 impaires ✓
- 3 impaires ✗ (somme serait impaire)
- 2 paires + 1 impaire ✗

Si la réponse avait été 13 (impair), c'eût été l'inverse : **1 ou 3 cartes impaires**.

## Pourquoi c'est utile

Même sans connaître les valeurs exactes, vous savez **combien de cartes impaires** se cachent dans la zone interrogée. Couplé à :

- une autre question de somme sur une zone qui **chevauche** la première,
- ou une question de couleur (\1N \3B \7N… toutes impaires en \N et \B),

vous obtenez très vite la position des cartes impaires.

## Astuce : la somme totale

La question « somme totale » sur les 5 cartes vous donne d'un coup la **parité du nombre total d'impaires** dans la main. Comme il y a 5 cartes :

| somme totale | nb impaires possible |
|---|---|
| paire | 0, 2 ou 4 |
| impaire | 1, 3 ou 5 |

C'est moins précis qu'une question ciblée, mais ça reste une information de structure très exploitable.
