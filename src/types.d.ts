export type InitData = {
    id: string
    players: Player[]
    "log": [],
    "type": "INIT",
    "self": string
}

export type RoundData = {
    id: string,
    players: Player[],
    word: string,
    guessed: string[],
    log: Log[],
    type: "ROUND",
    self: string
}

export type ResultData = {
    id: string,
    players: Player[],
    word: string,
    guessed: string[]
    log: Log[]
    type: "RESULT",
    self: string
}

export type Log = {
    player: string,
    move: string
}

export type Player = {
    id: string,
    score: number
}