import {io} from 'socket.io-client';
import {appendFile, readFile} from "fs";
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

let chars: string[] = [];
let index = 0;

function init(data: InitData) {
    index = 0;

    console.log('Küche geöffnet...');

    chars = ['E', 'N', 'I', 'S', 'R', 'A', 'T', 'D', 'H', 'U', 'L', 'C', 'G', 'M', 'O', 'B', 'W', 'F', 'K', 'Z', 'P', 'V', 'J', 'Y', 'X', 'Q'];
}

function result(data: ResultData) {
    console.log('Küche geschlossen. Score: ', data.players[0].score, ' Versuche: ', index+1);

    appendFile('woerter.txt', data.word + ', \n', (err) => {
        if (err) console.log('Fehler');
    })
}

function getRandomInt(max:number) {
    return Math.floor(Math.random() * max);
}

function round(data: RoundData, callback: (e:string) => void) {
    let ownGuess = '';

    ownGuess = chars[index];

    console.log('Kochen... Wort: ', data.word, ', Versuch: ', ownGuess);
    index++;
    callback(ownGuess);
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