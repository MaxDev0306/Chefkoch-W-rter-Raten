import {io} from 'socket.io-client';
require('dotenv').config()
const SECRET = process.env.BOT_SECRET;
import { InitData, ResultData, RoundData } from './types';
const socket = io('https://games.uhno.de', {
  transports: ['websocket']
})
socket.on('connect', () => {
  socket.emit('authenticate', SECRET, (success: boolean) => {
    console.log('connected: ', success)
  });
});
socket.on('disconnect', () => {
  console.log('disconected')
});


let alphabet: string[] = ["E","N","R","S","T","I","A","H","L","U","G","D","C","M","B","O","F","K","Z","P","W","V","Y","J","X","Q"]


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
}

function result(data: ResultData) {
    console.log("word: " + data.word)
    console.log("score: " + data.players[0].score)
    console.log("guessed: " + data.guessed)
}

function round(data: RoundData,callback:(guess:string)=> void) {
    let called = false
    console.log(data.word)
    alphabet.forEach((value) => {
        if(!called && !data.guessed.includes(value)){
            callback(value)
            called = true
        }
    })
}