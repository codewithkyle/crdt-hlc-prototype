import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import crypto from 'crypto';

const server = createServer({});
const wss = new WebSocketServer({ server });

const ledger = [];

wss.on('connection', function connection(ws) {
    ws.id = crypto.randomUUID();

    ws.on('error', console.error);

    ws.on('message', function message(data) {
        const message = data.toString();
        console.log('Received:', message);
        ledger.push(message);
        broadcast(message, ws.id);
    });

    for (const message of ledger) {
        ws.send(message, ws);
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
