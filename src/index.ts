import {io} from 'socket.io-client';

require('dotenv').config()
const words = require('./words.json');

const SECRET = process.env.BOT_SECRET;
import {Callback, InitData, ResultData, RoundData} from './types';

const socket = io('https://games.uhno.de', {
    transports: ['websocket']
});
const test = ['E', 'N', 'I']
const test2 = ['S', 'R', 'A', 'T', 'D', 'O', 'U']
const first = ['E', 'N', 'I', 'S', 'R', 'A', 'T'];
const second = ['D', 'O', 'U']
const others = ['H', 'U', 'L', 'C', 'G', 'M', 'O', 'B', 'W', 'F', 'K', 'Z', 'P', 'V', 'J', 'Y', 'X', 'Q'];

socket.on('connect', () => {
    socket.emit('authenticate', SECRET, (success: boolean) => {
        console.log('connected: ', success)
    });
});

socket.on('data', (data, callback) => {
    switch (data.type) {
        case 'INIT':
            init(data);
            return;
        case 'RESULT':
            result(data);
            return;
        case 'ROUND':
            testAction(data, callback);
    }
});

socket.on('disconnect', () => {
    console.log('disconected')
});

function init(data: InitData) {
}

function result(data: ResultData) {
    console.log(data.word)
    console.log(data.guessed)
    console.log(data.players[0].score)
}

function round(data: RoundData, callback: Callback) {
    const guessed: string[] = data.guessed;
    const word: string = data.word;

    if (word.includes('NG')) {
        processGuessed(guessed, callback, 'U');
    }

    if (word.includes('ER')) {
        processGuessed(guessed, callback, 'V');
    }

    if (word.includes('ICH')) {
        processGuessed(guessed, callback, 'L');
    }

    if (word.includes('EIT')) {
        processGuessed(guessed, callback, 'H');
        processGuessed(guessed, callback, 'K');
    }

    first.forEach((character: string) => {
        processGuessed(guessed, callback, character);
    });

    if (word.includes('E')) {
        processGuessed(guessed, callback, 'I');
        processGuessed(guessed, callback, 'U');
    }

    if (word.includes('A')) {
        processGuessed(guessed, callback, 'U');
    }

    second.forEach((character: string) => {
        processGuessed(guessed, callback, character);
    });

    if (word.includes('S')) {
        processGuessed(guessed, callback, 'C');
        processGuessed(guessed, callback, 'T');
        processGuessed(guessed, callback, 'P');
    }

    if (word.includes('C')) {
        processGuessed(guessed, callback, 'H');
        processGuessed(guessed, callback, 'K');
    }

    if (word.includes('N')) {
        processGuessed(guessed, callback, 'G');
    }

    if (word.includes('G')) {
        processGuessed(guessed, callback, 'E');
    }

    if (word.includes('UA') || word.includes('UO') || word.includes('UI') || word.includes('UE')) {
        processGuessed(guessed, callback, 'Q');
    }

    if (word.includes('OR')) {
        processGuessed(guessed, callback, 'V');
    }

    if (word.includes('AH')) {
        processGuessed(guessed, callback, 'Z')
    }

    others.forEach((character: string) => {
        processGuessed(guessed, callback, character);
    });
}

function testAction(data: RoundData, callback: Callback) {
    firstGuesses(data, callback);
    console.log(data.word)
    const frequentLetters: string[] = mostFrequentLetters(data.word);
    const filteredFrequentLetters = frequentLetters.filter((letter: string) => !data.guessed.includes(letter));
    filteredFrequentLetters.map((letter: string) => {
        processGuessed(data.guessed, callback, letter.toUpperCase());
    })
    lastGuesses(data, callback)
}

function processGuessed(guessed: string[], callback: Callback, character: string) {
    if (!guessed.includes(character)) {
        callback(character)
    }
}

function createRegexFromPattern(input: string) {
    const regexPattern = input.replace(/_/g, '.');
    return new RegExp(`^${regexPattern}$`, 'i');
}

function getSortedLetters(words: string) {
    const letterCount: any = {};

    for (const word of words) {
        for (const letter of word) {
            if (/[a-zA-Z]/.test(letter)) {
                const lowerLetter = letter.toLowerCase();
                letterCount[lowerLetter] = (letterCount[lowerLetter] || 0) + 1;
            }
        }
    }

    const sortedLetters = Object.entries(letterCount)
        .sort((a: any, b: any) => b[1] - a[1])
        .map(([letter]) => letter);

    return sortedLetters;
}

function firstGuesses(data: RoundData, callback: Callback) {
    if (data.word.includes('NG')) {
        processGuessed(data.guessed, callback, 'U');
    }

    if (data.word.includes('ER')) {
        processGuessed(data.guessed, callback, 'V');
    }

    if (data.word.includes('ICH')) {
        processGuessed(data.guessed, callback, 'L');
    }

    if (data.word.includes('EIT')) {
        processGuessed(data.guessed, callback, 'H');
        processGuessed(data.guessed, callback, 'K');
    }

    test.forEach((character: string) => {
        processGuessed(data.guessed, callback, character);
    });
}

function lastGuesses(data: RoundData, callback: Callback) {
    if (data.word.includes('E')) {
        processGuessed(data.guessed, callback, 'I');
        processGuessed(data.guessed, callback, 'U');
    }

    if (data.word.includes('A')) {
        processGuessed(data.guessed, callback, 'U');
    }

    test2.forEach((character: string) => {
        processGuessed(data.guessed, callback, character);
    });

    if (data.word.includes('S')) {
        processGuessed(data.guessed, callback, 'C');
        processGuessed(data.guessed, callback, 'T');
        processGuessed(data.guessed, callback, 'P');
    }

    if (data.word.includes('C')) {
        processGuessed(data.guessed, callback, 'H');
        processGuessed(data.guessed, callback, 'K');
    }

    if (data.word.includes('N')) {
        processGuessed(data.guessed, callback, 'G');
    }

    if (data.word.includes('G')) {
        processGuessed(data.guessed, callback, 'E');
    }

    if (data.word.includes('UA') || data.word.includes('UO') || data.word.includes('UI') || data.word.includes('UE')) {
        processGuessed(data.guessed, callback, 'Q');
    }

    if (data.word.includes('OR')) {
        processGuessed(data.guessed, callback, 'V');
    }

    if (data.word.includes('AH')) {
        processGuessed(data.guessed, callback, 'Z')
    }

    others.forEach((character: string) => {
        processGuessed(data.guessed, callback, character);
    });
}

function mostFrequentLetters(word: string) {
    const pattern = createRegexFromPattern(word);
    const matchingWords = words.filter((word: string) => pattern.test(word));
    return getSortedLetters(matchingWords)
}

