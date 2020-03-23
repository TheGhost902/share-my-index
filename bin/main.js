#! /usr/bin/env node
const fs = require('fs')
const path = require('path')
const express = require('express')
const morgan = require('morgan')
const open = require('open')
const WebSocket = require('ws')

const server = express()

server.use(morgan('dev'))

// main route
server.get('/', (req, res) => {
    // read users index.html
    fs.readFile('./index.html', 'utf8', (err, html) => {
        if (err) return console.error(err)

        const data = html.split('</body>')

        // read and embed websocket code for index.html
        fs.readFile(path.join(__dirname, 'ws.js'), 'utf8', (err, js) => {
            if (err) return console.error(err)

            const newData = data.join(`<script>${js}</script></body>`)

            fs.writeFile(path.join(__dirname, 'temp.html'), newData, 'utf8', err => {
                if (err) return console.error(err)

                // fead final file, and send it
                fs.readFile(path.join(__dirname, 'temp.html'), 'utf8', (err, modifiedHtml) => {
                    if (err) return console.error(err)

                    res.send(modifiedHtml)
                })
            })
        })
    })
})

// send other data (css, images, fonts...)
server.use(express.static('./'))

const wsServer = new WebSocket.Server(
    { noServer: true },
    () => console.log(`WebSocket server start...`)
)

server.get('/ws', (req) => {
    wsServer.handleUpgrade(req, req.socket, Buffer.alloc(0), ws => {
        console.log('WS: connected')

        fs.watch('./', { recursive: true }, (eType, fileName) => {
            ws.send(`WS: ${eType} file - ${fileName}`)
        })
    })
})

fs.readFile('./index.html', err => {
    if (err) return console.error('No index.html file in folder')

    server.listen(3000, async () => {
        console.log(`App on port 3000...`)

        await open('http://localhost:3000')
    })
})