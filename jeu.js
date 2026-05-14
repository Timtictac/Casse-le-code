// Logique de partie (port JS de jeu.py + serveur.py).
// Toute la partie tourne côté navigateur : pas de réseau.

import {
  deck,
  mainTriée,
  cléMain,
  mainsDepuis,
  questions as CATALOGUE,
  entropieSur,
} from './moteur.js';

// --- RNG seedable (mulberry32) ----------------------------------------------

function rngDepuisGraine(graine) {
  let a = (graine === undefined || graine === null)
    ? (Math.random() * 2 ** 32) >>> 0
    : (graine >>> 0);
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function sample(arr, n, rng) {
  const copie = arr.slice();
  shuffle(copie, rng);
  return copie.slice(0, n);
}

// --- Joueur ------------------------------------------------------------------

function multisetSoustraction(a, b) {
  // a et b sont des listes de cartes [v, c]. Retourne a \ b (multiset).
  const compte = new Map();
  for (const c of a) {
    const k = `${c[0]}${c[1]}`;
    compte.set(k, (compte.get(k) || 0) + 1);
  }
  for (const c of b) {
    const k = `${c[0]}${c[1]}`;
    if (compte.has(k)) {
      const n = compte.get(k) - 1;
      if (n <= 0) compte.delete(k);
      else compte.set(k, n);
    }
  }
  const reste = [];
  for (const [k, n] of compte) {
    const v = parseInt(k.slice(0, -1), 10);
    const coul = k.slice(-1);
    for (let i = 0; i < n; i++) reste.push([v, coul]);
  }
  return reste;
}

class Joueur {
  constructor(nom, main, estIa) {
    this.nom = nom;
    this.main = main;
    this.estIa = estIa;
    const reste = multisetSoustraction(deck, main);
    const { candidats, poids } = mainsDepuis(reste);
    this.candidats = candidats;
    this.poidsCand = poids;
    this.historique = [];
  }

  filtrer(question, réponse) {
    const nouvC = [];
    const nouvP = [];
    const cible = réponse === null ? '∅' : String(réponse);
    for (let i = 0; i < this.candidats.length; i++) {
      const r = question(this.candidats[i]);
      const k = r === null ? '∅' : String(r);
      if (k === cible) {
        nouvC.push(this.candidats[i]);
        nouvP.push(this.poidsCand[i]);
      }
    }
    this.candidats = nouvC;
    this.poidsCand = nouvP;
  }
}

// --- Stratégie IA ------------------------------------------------------------

function choisirQuestionIA(joueur, centre) {
  let meilleurI = 0;
  let meilleurH = -1;
  for (let i = 0; i < centre.length; i++) {
    const [, q] = centre[i];
    const H = entropieSur(q, joueur.candidats, joueur.poidsCand);
    if (H > meilleurH) {
      meilleurH = H;
      meilleurI = i;
    }
  }
  return { i: meilleurI, H: meilleurH };
}

function uneQuestionSépare(candidats, centre) {
  for (const [, q] of centre) {
    const vues = new Set();
    for (const m of candidats) {
      vues.add(String(q(m)));
      if (vues.size > 1) return true;
    }
  }
  return false;
}

function décisionIA(joueur, centre) {
  const n = joueur.candidats.length;
  if (n === 0) return { type: 'deviner', main: null };
  if (n === 1) return { type: 'deviner', main: joueur.candidats[0] };
  if (!centre.length || !uneQuestionSépare(joueur.candidats, centre)) {
    let i = 0;
    for (let k = 1; k < n; k++) if (joueur.poidsCand[k] > joueur.poidsCand[i]) i = k;
    return { type: 'deviner', main: joueur.candidats[i] };
  }
  if (n === 2) {
    let i = 0;
    for (let k = 1; k < n; k++) if (joueur.poidsCand[k] > joueur.poidsCand[i]) i = k;
    return { type: 'deviner', main: joueur.candidats[i] };
  }
  const { i, H } = choisirQuestionIA(joueur, centre);
  return { type: 'question', index: i, H };
}

// --- Mise en place d'une partie ---------------------------------------------

function tirerMainsEtCentre(rng) {
  const tirées = sample(deck, 10, rng);
  const mainH = mainTriée(tirées.slice(0, 5));
  const mainIA = mainTriée(tirées.slice(5, 10));
  const catalogue = shuffle(CATALOGUE.slice(), rng);
  const centre = catalogue.slice(0, 6);
  const pioche = catalogue.slice(6);
  return { mainH, mainIA, centre, pioche };
}

// --- État public (sérialisable pour le rendu) -------------------------------

function étatPublic(p, révélerIa = false) {
  return {
    id: p.id,
    main_humain: p.humain.main.map((c) => [c[0], c[1]]),
    main_ia: révélerIa ? p.ia.main.map((c) => [c[0], c[1]]) : null,
    taille_main_ia: p.ia.main.length,
    centre: p.centre.map(([nom]) => nom),
    taille_pioche: p.pioche.length,
    candidats_humain: p.humain.candidats.length,
    historique: p.historique,
    tour: p.tour,
    fini: p.fini,
    gagnant: p.gagnant,
    ia_terminée: p.ia_terminée,
    ia_correcte: p.ia_correcte,
    humain_correct: p.humain_correct ?? null,
  };
}

// État interne (non exporté tel quel — on ne renvoie que des snapshots publics).
let partieCourante = null;

function retirerEtRepiocher(p, idx) {
  p.centre.splice(idx, 1);
  if (p.pioche.length) p.centre.push(p.pioche.pop());
}

// --- API publique : mêmes 4 actions que l'ancien backend Flask --------------

export function nouvellePartie(graine) {
  const rng = rngDepuisGraine(graine);
  const { mainH, mainIA, centre, pioche } = tirerMainsEtCentre(rng);
  partieCourante = {
    id: Math.random().toString(36).slice(2, 10),
    humain: new Joueur('Vous', mainH, false),
    ia: new Joueur('IA', mainIA, true),
    centre,
    pioche,
    historique: [],
    tour: 'humain',
    fini: false,
    gagnant: null,
    ia_terminée: false,
    ia_correcte: false,
    humain_correct: null,
  };
  return étatPublic(partieCourante);
}

export function poserQuestion(idx) {
  const p = partieCourante;
  if (!p) throw new Error('aucune partie en cours');
  if (p.fini || p.tour !== 'humain') throw new Error("pas votre tour");
  if (!Number.isInteger(idx) || idx < 0 || idx >= p.centre.length) {
    throw new Error('index invalide');
  }
  const [nom, q] = p.centre[idx];
  const réponse = q(p.ia.main);
  p.humain.filtrer(q, réponse);
  p.humain.historique.push([nom, réponse]);
  p.historique.push({ qui: 'humain', question: nom, réponse: String(réponse) });
  retirerEtRepiocher(p, idx);
  p.tour = p.ia_terminée ? 'humain' : 'ia';
  return étatPublic(p);
}

export function deviner(cartesBrutes) {
  const p = partieCourante;
  if (!p) throw new Error('aucune partie en cours');
  if (p.fini || p.tour !== 'humain') throw new Error("pas votre tour");
  if (!Array.isArray(cartesBrutes) || cartesBrutes.length !== 5) {
    throw new Error('il faut 5 cartes');
  }
  const cartes = [];
  for (const c of cartesBrutes) {
    const v = parseInt(c[0], 10);
    const coul = String(c[1]);
    if (!'NBV'.includes(coul) || !(v >= 0 && v <= 9)) throw new Error('carte invalide');
    if (v === 5 && coul !== 'V') throw new Error('carte invalide');
    if (v !== 5 && coul === 'V') throw new Error('carte invalide');
    cartes.push([v, coul]);
  }
  // Vérifie que la main reste un sous-multiset du deck (ex. pas trois 5V).
  const reste = multisetSoustraction(deck, cartes);
  if (reste.length !== deck.length - 5) throw new Error('main impossible (hors deck)');

  const devinette = mainTriée(cartes);
  const correct = cléMain(devinette) === cléMain(p.ia.main);
  p.fini = true;
  p.humain_correct = correct;
  p.gagnant = (correct && !p.ia_correcte) ? 'humain' : 'ia';
  p.historique.push({
    qui: 'humain',
    question: 'Devine',
    réponse: devinette.map(([v, c]) => `${v}${c}`).join(' ') + (correct ? ' ✓' : ' ✗'),
  });
  return étatPublic(p, true);
}

export function tourIA() {
  const p = partieCourante;
  if (!p) throw new Error('aucune partie en cours');
  if (p.fini || p.tour !== 'ia') throw new Error("pas le tour de l'IA");

  const déc = décisionIA(p.ia, p.centre);
  if (déc.type === 'deviner') {
    const devinette = déc.main;
    const correct = cléMain(devinette) === cléMain(p.humain.main);
    p.ia_terminée = true;
    p.ia_correcte = correct;
    p.historique.push({
      qui: 'ia',
      question: 'Devine',
      réponse: devinette.map(([v, c]) => `${v}${c}`).join(' ') + (correct ? ' ✓' : ' ✗'),
    });
    p.tour = 'humain';
    return étatPublic(p);
  }

  const idx = déc.index;
  const [nom, q] = p.centre[idx];
  const réponse = q(p.humain.main);
  p.ia.filtrer(q, réponse);
  p.ia.historique.push([nom, réponse]);
  const entrée = { qui: 'ia', question: nom, réponse: String(réponse) };
  if (déc.H !== undefined && déc.H !== null) entrée.entropie = Math.round(déc.H * 100) / 100;
  p.historique.push(entrée);
  retirerEtRepiocher(p, idx);
  p.tour = 'humain';
  return étatPublic(p);
}
