import {io} from 'socket.io-client';
require('dotenv').config()
const SECRET = process.env.BOT_SECRET;
import { InitData, ResultData, RoundData } from './types';
const socket = io('https://games.uhno.de', {
  transports: ['websocket']
});

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

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
    console.log(data)
}

function result(data: ResultData) {
    console.log(data)
}

function round(data: RoundData, callback: (guess: string) => void) {
    console.log(data)
    const letterIndex = Math.random() * 26
    callback(chars.charAt(letterIndex))
}