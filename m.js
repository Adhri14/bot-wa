const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const express = require('express')
const socketIO = require('socket.io')
const http = require('http')

const app = express();
const server = http.createServer(app)
const io = socketIO(server)

const SESSION_FILE_PATH = './session.json'

let sessionConfig

if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionConfig = require(SESSION_FILE_PATH)
}

app.get('/', (req, res) => {
  res.sendFile('index.html', {root: __dirname})
})

const client = new Client({puppeteer: {headless: true}, session: sessionConfig});



client.on('authenticated', session => {
  console.log('AUTHENTICATED', session)
  sessionConfig = session
  fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function(err) {
    if (err) {
      console.log(err)
    }
  })
})



client.on('message', msg => {
    if (msg.body == '!ping') {
        msg.reply('pong');
    }
});

client.initialize();

io.on('connection', function(socket) {
  socket.emit('message', 'Connecting...')
  client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url)
      socket.emit('message', 'QR Code received, scan please!')
    })
  });
  client.on('ready', () => {
    socket.emit('message', 'Whatsapp is ready')
  });
})

server.listen(8000, function() {
  console.log('App running in server http://localhost:'+8000)
})