const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
const PORT = 3000;

// Resolve cross-domain issues.
app.use(cors());
// Use the body-parser middleware to parse JSON data.
app.use(bodyParser.json());

let receivedData = {};

// create WebSocket server
const wss = new WebSocket.Server({ noServer: true });

//  WebSocket connection
wss.on('connection', (ws) => {
    console.log('client connected');

    // send message to client
    ws.send(JSON.stringify({ content: 'hello from server ~' }));

    // process received message
    ws.on('message', (message) => {
        console.log('message received:', message);
        // you can process message here
    });

    ws.on('close', () => {
        console.log('client disconnected');
    });
});

// make WebSocket server and HTTP server together
const server = app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
});

// add WebSocket server to HTTP server
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// POST interface
app.post('/api', (req, res) => {
    console.log('received POST data:', req.body);
    receivedData = req.body;

    // boardcast to all connected client
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ content: receivedData }));
        }
    });

    // response
    res.json({ message: 'data receive', receivedData: req.body });
});