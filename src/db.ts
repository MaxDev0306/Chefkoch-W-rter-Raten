import pg from 'pg'
import { RoundData } from './types';
require('dotenv').config()
const db = process.env.POSTGRES_DB;
const user = process.env.POSTGRES_USER;
const dbPassword = process.env.POSTGRES_PASSWORD;
const { Client } = pg

export const client = new Client({
    database: db,
    user: user,
    password: dbPassword,
    port: 5432
})

export function addWordToDB(word: string) {
    client.query("INSERT INTO library VALUES ($1)", [word])
    .then((res) => console.log(res))
}

export function getNextLetter(word: string, data: RoundData) {
    const preparedWord = word.replace(/_{1,}/g, '%');

    client.query<{word: string}>("SELECT word FROM library WHERE word LIKE %$1%", [preparedWord])
    .then((res) => {
        const letterScoreMap: Map<string, number> = new Map([])
        res.rows.forEach(({word}) => {
            for (let index = 0; index < word.length; index++) {
                const letter = word[index];
                const number = letterScoreMap.get(letter) ?? 0;
                letterScoreMap.set(letter, number + 1)
            }
        })

        const sorted = new Map([...letterScoreMap.entries()].sort((a, b) => a[1] - b[1]))

        Array.from(sorted.keys()).forEach((key) => {
            if (!data.guessed.includes(key)) {
                return key;
            }
        })
    })

    return null;
}