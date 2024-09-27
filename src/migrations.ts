import {client} from './db';

const library: string[] = require('../words.json')

client.connect()
.then(() => console.log('Connect to db: '));

client.query("CREATE TABLE IF NOT EXISTS library (word VARCHAR PRIMARY KEY);")
.then((res) => console.log(res))

client.query("INSERT INTO library VALUES ($1)", [library.join(',')])
    .then((res) => console.log(res))
