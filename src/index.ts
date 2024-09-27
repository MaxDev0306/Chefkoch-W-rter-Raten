import {io} from 'socket.io-client';
require('dotenv').config()
const SECRET = process.env.BOT_SECRET;
import { InitData, ResultData, RoundData } from './types';
const socket = io('https://games.uhno.de', {
  transports: ['websocket']
})
socket.on('connect', () => {
  // dein Bot ist verbunden
  socket.emit('authenticate', SECRET, (success: boolean) => {
    console.log('connected: ', success)
  });
});
socket.on('disconnect', () => {
  console.log('disconected')
});


const alphabet: string[] = ["E","N","R","S","T","I","A","H","L","n","e","n","e","n","e","n",]
const guessed: string[] = []
const score: number = 0;


socket.on('data', (data, callback:(guess:string)=> void) => {
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

function init(data: InitData) {
    console.log(data)
}

function result(data: ResultData) {
    console.log(data)
}

function round(data: RoundData,callback:(guess:string)=> void) {
    console.log(data)
    callback("e")
}