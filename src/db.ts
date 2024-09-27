import pg from 'pg'
require('dotenv').config()
const db = process.env.POSTGRES_DB;
const user = process.env.POSTGRES_USER;
const dbPassword = process.env.POSTGRES_PASSWORD;


const { Client } = pg
const client = new Client({
    database: db,
    user: user,
    password: dbPassword,
    port: 5432
})
client.connect()
.then(() => console.log('Connect to db: '))

client.query('SELECT $1::text as message', ['Hello world!'])
.then((res) => console.log(res.rows[0].message))