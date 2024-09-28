import {io} from 'socket.io-client';
import {ResultData, RoundData} from './types';
import {appendFile} from "fs";

require('dotenv').config()
const SECRET = process.env.BOT_SECRET;
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

socket.on('data', (data, callback:(guess:string)=> void) => {
    switch (data.type) {
        case 'RESULT':
            result(data);
            return;
        case 'ROUND':
            round(data, callback);
    }
});

function result(data: ResultData) {
    appendFile("words.txt",data.word + "\n",() => {})

}

function round(data: RoundData,callback:(guess:string)=> void) {
    callback("!")
}



