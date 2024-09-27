import {io} from 'socket.io-client';
require('dotenv').config()
const SECRET = process.env.BOT_SECRET;
const socket = io('https://games.uhno.de', {
  transports: ['websocket']
});

socket.on('connect', () => {
  // dein Bot ist verbunden
  socket.emit('authenticate', SECRET, (success: boolean) => {
    console.log('connected: ', success)
  });
});
socket.on('disconnect', () => {
  console.log('disconected')
});