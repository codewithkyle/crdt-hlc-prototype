import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import crypto from 'crypto';
import fs from "fs";

const server = createServer({});
const wss = new WebSocketServer({ server });

let ledger = [];

if (!fs.existsSync('log.txt')) {
    fs.writeFile('log.txt', '', function (err) {
        if (err) throw err;
    });
}
fs.readFile('log.txt', 'utf8', function(err, data) {
    if (err) throw err;
    ledger = data.split('\n');
    ledger.pop();
});

wss.on('connection', function connection(ws) {
    ws.id = crypto.randomUUID();

    ws.on('error', console.error);

    ws.on('message', function message(data) {
        const message = data.toString();
        console.log('Received:', message);
        ledger.push(message);
        fs.appendFile('log.txt', message + '\n', function (err) {
            if (err) throw err;
            broadcast(message, ws.id);
        });
    });

    for (const message of ledger) {
        ws.send(message);
    }

    function broadcast(message, senderId) {
        for (const client of wss.clients) {
            if (client.id === senderId) continue;
            client.send(message);
        }
    }
});

server.listen(8080);
console.log('Listening on http://localhost:8080');
