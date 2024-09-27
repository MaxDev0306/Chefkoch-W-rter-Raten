import {io} from 'socket.io-client';
require('dotenv').config()
const SECRET = process.env.BOT_SECRET;
import { InitData, ResultData, RoundData } from './types';
const socket = io('https://games.uhno.de', {
  transports: ['websocket']
});
socket.on('connect', () => {
  socket.emit('authenticate', SECRET, (success: boolean) => {
    console.log('Bot connected: ', success)
  });
});

function init(data: InitData) {
    console.log(data)
}

function result(data: ResultData) {
    console.log(data)
}

function getRandomInt(max:number) {
    return Math.floor(Math.random() * max);
}

function round(data: RoundData, callback: (guess:string) => void) {
    console.log(data)

    const alphabet = 'BCFGHJKLMOPQUVWXYZ';
    const firstGuesses = "ENISRATD";

    let guess = firstGuesses[getRandomInt(firstGuesses.length - 1)];

    if (data.guessed.includes(guess) && !data.guessed.every(guessedChar => firstGuesses.includes(guessedChar))) {
        guess = firstGuesses[getRandomInt(firstGuesses.length - 1)];
    } else if (data.guessed.includes(guess)) {
        guess = alphabet[getRandomInt(alphabet.length - 1)];
    }

    callback(guess);
}

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

socket.on('disconnect', () => {
  console.log('Bot disconnected')
});