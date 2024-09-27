import {io} from 'socket.io-client';
import { InitData, ResultData, RoundData } from './types';
const SECRET = process.env.BOT_SECRET ?? "9fbe0698-a12b-49d4-8567-99ebea250409";
const socket = io('https://games.uhno.de', {
  transports: ['websocket']
});

console.log(SECRET)

socket.on('connect', () => {
  // dein Bot ist verbunden
  socket.emit('authenticate', SECRET, (success: boolean) => {
    console.log('connected: ', success)

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

function round(data: RoundData) {
    console.log(data)
}