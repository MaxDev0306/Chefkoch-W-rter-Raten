import {io} from 'socket.io-client';
require('dotenv').config()
const SECRET = process.env.BOT_SECRET;
import { InitData, ResultData, RoundData } from './types';
const socket = io('https://games.uhno.de', {
  transports: ['websocket']
});

const chars = ['E', 'N', 'I', 'S', 'R', 'A', 'T', 'D', 'H', 'U', 'L', 'C', 'G', 'M', 'O', 'B', 'W', 'F', 'K', 'Z', 'P', 'V','J', 'Y', 'X', 'Q'];
let guesChoices = [...chars];
const VoulRegex = RegExp('/[AEIOU]/gm');
let roundsPlayed = 0;
let PointTotal = 0;
let guesThisRound = 0;

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
}

function result(data: ResultData) {
  PointTotal += data.players[0].score;

    console.log('---------------------------------')
    console.log('Word', data.word)
    console.log('Score', data.players[0].score)

    guesChoices = [...chars]
}

function round(data: RoundData, callback: (guess: string) => void) {
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
  const gues = guesChoices[0];

  if (guesThisRound < 3) {
    return getFirstVoul(gues, data);
  }

    // ck/ch erkennen
    if (data.word.includes('CH')) {
      return getFirstVoul(gues ,data)
    }

    if (data.word.includes('C')) {
      if (!data.word.includes('CH') && !data.guessed.includes('K')){
        return 'K'
      }
      if (!data.word.includes('CK') && !data.guessed.includes('H')){
        return 'H'
      }
    }


    // *ung erkennen
    if (data.word.includes('UN') && !data.guessed.includes('N')) {
      return 'N'
    }

    if (data.word.includes('U') && data.word.includes('N') && !data.guessed.includes('G')) {
      return 'G'
    }


    // *lig/lich erkennen

    if (!data.guessed.includes('L') && data.word.includes('I') && (data.word.includes('G') || data.word.includes('C') || data.word.includes('H'))) {
      return 'L';
    }

    if (data.word.includes('LI') && !data.guessed.includes('C')) {
      return 'C'
    }

    if (data.word.includes('LIC') && !data.guessed.includes('H')) {
      return 'H'
    }

    if (data.word.includes('L') && !data.guessed.includes('I') && data.word.includes('G')) {
      return 'I';
    }

    if (data.word.includes('LI') && !data.guessed.includes('G')) {
      return 'G';
    }

    // (h/k)eit
    if (data.word.includes('EIT')) {
      if (!data.guessed.includes('H')) {
        return 'H'
      }

      if (!data.guessed.includes('K')) {
        return 'K'
      }
    }

    if ((data.word.includes('HEI') || data.word.includes('KEI')) && !data.guessed.includes('T')) {
      return 'T'
    }

    if((data.word.includes('UE') || data.word.includes('UA') || data.word.includes('UO') || data.word.includes('UI')) && !data.guessed.includes('Q')){
      return 'Q'
    }

    if ((data.word.includes('ER') || data.word.includes('ER')) && !data.guessed.includes('V')) {
      return 'V'
    }

    guesChoices.forEach((letter) => {
      if (data.word.includes(letter + letter)) {
        return getFirstVoul(gues, data);
      }
    })

    return gues;
}