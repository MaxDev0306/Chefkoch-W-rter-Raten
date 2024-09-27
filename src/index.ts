import {io} from 'socket.io-client';
import {InitData, ResultData, RoundData} from './types';
import {appendFile, readFileSync} from "fs";

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


let alphabet: string[] = ["E","N","R","S","T","I","A","H","L","U","G","D","C","M","B","O","F","K","Z","P","W","V","Y","J","X","Q"]

let scores: number[] = []
let quote = 0

const wordlistString = readFileSync("./src/German-words-1600000-words-multilines.json", "utf-8")
const wordlist = JSON.parse(wordlistString)
const toUpper :string[] = []
wordlist.forEach((value: string) =>{
    toUpper.push(value.toUpperCase())
})


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
    appendFile("woerter.txt",data.word + "\n",() => {})
    console.log("word: " + data.word)
    console.log("score: " + data.players[0].score)
    console.log("guessed: " + data.guessed)
    scores.push(data.players[0].score)
    let count  = 0;
    scores.forEach((score: number) => {
        count += score
    })
    quote = count/scores.length
    console.log("quote: " + quote)

}

function round(data: RoundData,callback:(guess:string)=> void) {
    callback(guessNextLetter(data))
}




function findWords(word: string){

    const knownChars = new Set(Array.prototype.filter.call(word, (ch) => ch !== "_"))
    return toUpper.filter(
        (w: string) => {
            const wArray = w.split("")
            let result = true
            knownChars.forEach((char: string) => {
                if (!wArray.includes(char) || wArray.length < word.length) {
                    result = false;
                } else {
                }
            })
            return result;
        }
    )
}


function guessNextLetter(data: RoundData){
    // if(data.word.length > 2){
    //     const words = findWords(data.word)
    //     return findMostFrequentChar(words, data.guessed).toUpperCase()
    // }else{
        if(data.guessed.length === 0){
            return "E"
        }else if(data.word.includes("S_H") && !data.guessed.includes("C")){
            return "C"
        }else if(data.word.includes("UN") && !data.guessed.includes("G")){
            return "G"
        }else if(data.word.includes("OR") && !data.guessed.includes("V")){
            return "V"
        }
        else if(data.word.includes("Q") && !data.guessed.includes("U")){
            return "U"
        }else{
            let letter = ""
            alphabet.forEach((value) => {
                if(letter === "" && !data.guessed.includes(value)){
                    letter = value
                }
            })
            if(letter !== ""){
                return letter
            }else{
                return "E"
            }
        // }
    }






}


function findMostFrequentChar(words: string[], guessed: string[]): string {
    const charCount: { [key: string]: number } = {};

    words.forEach(word => {
        for (const char of word) {
            if (charCount[char]) {
                charCount[char]++;
            } else {
                charCount[char] = 1;
            }
        }
    });

    let mostFrequentChar = '';
    let maxCount = 0;

    for (const char in charCount) {
        if (charCount[char] > maxCount && !guessed.includes(char)) {
            maxCount = charCount[char];
            mostFrequentChar = char;
        }
    }

    return mostFrequentChar;
}