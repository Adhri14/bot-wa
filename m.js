const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

const SESSION_FILE_PATH = './session.json'

let sessionConfig

if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionConfig = require(SESSION_FILE_PATH)
}


const client = new Client({puppeteer: {headless: true}, session: sessionConfig});

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, {small: true});
});

client.on('authenticated', session => {
  console.log('AUTHENTICATED', session)
  sessionConfig = session
  fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function(err) {
    if (err) {
      console.log(err)
    }
  })
})

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {
    if (msg.body == '!ping') {
        msg.reply('pong');
    }
});

client.initialize();
 