import {io} from 'socket.io-client';
require('dotenv').config()
const SECRET = process.env.BOT_SECRET;
import { InitData, ResultData, RoundData } from './types';
import {client} from './db';

const socket = io('https://games.uhno.de', {
  transports: ['websocket']
});

const chars = ['E', 'N', 'I', 'S', 'R', 'A', 'T', 'D', 'H', 'U', 'L', 'C', 'G', 'M', 'O', 'B', 'W', 'F', 'K', 'Z', 'P', 'V','J', 'Y', 'X', 'Q'];
let guesChoices = [...chars];
const VoulRegex = RegExp('/[AEIOU]/gm');
let roundsPlayed = 0;
let PointTotal = 0;
let guesThisRound = 0;
const strategies: Map<string, number> = new Map([
  ['default', 0],
  ['first_vouls', 0],
  ['k_when_eit', 0],
  ['h_when_eit', 0],
  ['g_when_un', 0],
  ['c_when_li', 0],
  ['q_when_ue_ua_uo_ui', 0],
  ['l_when_i_and_g_c_h', 0],
  ['v_when_er_or', 0],
  ['add_voul_when_ck_or_ch', 0],
  ['k_when_c', 0],
  ['h_when_c', 0],
  ['h_when_lic', 0],
  ['i_when_l_and_g', 0],
  ['g_when_li', 0],
  ['t_when_hei_or_kei', 0],
  ['voul_when_double_kon', 0],
  ['error', 0]
])
let currentStrategie = '';
let lastScore = 0;

client.connect()
.then(() => console.log('Connect to db: '));

socket.on('connect', () => {
  // dein Bot ist verbunden
  socket.emit('authenticate', SECRET, (success: boolean) => {
    console.log('connected: ', success)

    socket.on('data', (data, callback) => {
        switch (data.type) {
          case 'INIT':
            init(data);
            return;
          case 'RESULT':
            result(data);
            return;
          case 'ROUND':
            round(data, callback);
        }
      });
  });
});
socket.on('disconnect', () => {
  console.log('disconected')
});

function init(data: InitData) {
    roundsPlayed ++;
    guesThisRound = 0;

    if (roundsPlayed % 10 === 0) {
      console.log('---------------------------------')
      console.log('Rounds Played: ', roundsPlayed)
      console.log('Average Score: ', PointTotal / roundsPlayed)
    }

    if (roundsPlayed % 30 === 0) {
      const sorted = new Map([...strategies.entries()].sort((a, b) => a[1] - b[1]))
      console.log('---------------------------------')
      const keys = Array.from(sorted.keys())
      keys.forEach((key) => {
        console.log(key, sorted.get(key))
      })
    }
}

function result(data: ResultData) {
  PointTotal += data.players[0].score;

    console.log('---------------------------------')
    console.log('Word', data.word)
    console.log('Score', data.players[0].score)

    guesChoices = [...chars]
}

function round(data: RoundData, callback: (guess: string) => void) {
  const lastStrategyScore = strategies.get(currentStrategie) ?? 0;
  if (data.players[0].score === lastScore) {
    strategies.set(currentStrategie, lastStrategyScore + 1);
  }
  
    lastScore = data.players[0].score;
    const gues = chooseLetter(data).toUpperCase();

    guesThisRound ++;
    callback(gues);
    removeLetterFromChoices(gues);
}

function removeLetterFromChoices(letter: string) {
  const index = guesChoices.indexOf(letter)
  if (index === -1) {
    return;
  }
  guesChoices.splice(index, 1)
}

function getFirstVoul(gues: string, data: RoundData): string {
  guesChoices.forEach((item) => {
    if (VoulRegex.test(item) && !data.guessed.includes(item)) {
      return item;
    }
  })

  return gues;
}

function chooseLetter(data: RoundData) {
  currentStrategie = 'default'
  const gues = guesChoices[0];
  if (!gues) {
    console.log('AHHH', guesChoices, data.guessed.length)
    currentStrategie = 'error'
    let intersection = chars.filter(x => data.guessed.includes(x));
    return intersection[0]
  }

  if (guesThisRound < 2) {
    currentStrategie = 'first_vouls'
    return getFirstVoul(gues, data);
  }

  if (data.word.includes('CH') || data.word.includes('CK')) {
    currentStrategie = 'add_voul_when_ck_or_ch'
    return getFirstVoul(gues ,data)
  }

  if (data.word.includes('UN') && !data.guessed.includes('G')) {
    currentStrategie = 'g_when_un'
    return 'G'
  }

  if (data.word.includes('EIT')) {
    if (!data.guessed.includes('K')) {
      currentStrategie = 'k_when_eit'
      return 'K'
    }
    
    if (!data.guessed.includes('H')) {
      currentStrategie = 'h_when_eit'
      return 'H'
    }
  }

  if (data.word.includes('LI') && !data.guessed.includes('C')) {
    currentStrategie = 'c_when_li'
    return 'C'
  }

  if ((data.word.includes('UA') || data.word.includes('UE') || data.word.includes('UI') || data.word.includes('UO')) && !data.guessed.includes('Q')) {
    currentStrategie = 'q_when_ue_ua_uo_ui'
    return 'Q'
  }

  if (!data.guessed.includes('L') && data.word.includes('I') && (data.word.includes('G') || data.word.includes('C') || data.word.includes('H'))) {
    currentStrategie = 'l_when_i_and_g_c_h'
    return 'L';
  }

  if ((data.word.includes('ER') || data.word.includes('ER')) && !data.guessed.includes('V')) {
    currentStrategie = 'v_when_er_or'
    return 'V'
  }


  // NOT SORTED

  if (data.word.includes('C')) {
    if (!data.word.includes('CH') && !data.guessed.includes('K')){
      currentStrategie = 'k_when_c'
      return 'K'
    }
    if (!data.word.includes('CK') && !data.guessed.includes('H')){
      currentStrategie = 'h_when_c'
      return 'H'
    }
  }

  if (data.word.includes('LIC') && !data.guessed.includes('H')) {
    currentStrategie = 'h_when_lic'
    return 'H'
  }

  if (data.word.includes('L') && !data.guessed.includes('I') && data.word.includes('G')) {
    currentStrategie = 'i_when_l_and_g'
    return 'I';
  }

  if (data.word.includes('LI') && !data.guessed.includes('G')) {
    currentStrategie = 'g_when_li'
    return 'G';
  }

  if ((data.word.includes('HEI') || data.word.includes('KEI')) && !data.guessed.includes('T')) {
    currentStrategie = 't_when_hei_or_kei'
    return 'T'
  }

  guesChoices.forEach((letter) => {
    if (data.word.includes(letter + letter)) {
      currentStrategie = 'voul_when_double_kon'
      return getFirstVoul(gues, data);
    }
  })

  return gues;
}