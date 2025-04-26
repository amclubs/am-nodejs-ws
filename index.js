/**
 * YouTube Channel: https://youtube.com/@am_clubs
 * Telegram Group: https://t.me/am_clubs
 * GitHub Repository: https://github.com/amclubs
 * Blog(INTL): https://amclubs.blogspot.com
 * Blog(DOM): https://amclubss.com
 */

const net = require('net');
const { TextDecoder } = require('util');
const { WebSocket, createWebSocketStream } = require('ws');
const http = require('http');

// === Config ===
const UUID = process.env.UUID || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const PORT = process.env.PORT || 40001;
const DOMAIN = process.env.DOMAIN || 'localhost';

// === HTTP Server ===
const httpServer = http.createServer((req, res) => {
  if (req.url === '/sub') {
    const vlessURL = `vless://${UUID}@${DOMAIN}:443?encryption=none&security=tls&sni=${DOMAIN}&allowInsecure=1&type=ws&host=${DOMAIN}&path=%2F#amclubss.com`;
    const base64Content = Buffer.from(vlessURL).toString('base64');
    return sendText(res, 200, base64Content + '\n');
  }

  return sendText(res, 404, 'Not Found\n');
});

function sendText(res, status, text) {
  res.writeHead(status, { 'Content-Type': 'text/plain' });
  res.end(text);
}

httpServer.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});

// === WebSocket Server ===
const wss = new WebSocket.Server({ server: httpServer });

wss.on('connection', (ws) => {
  console.log('WebSocket connection established.');

  ws.on('message', (msg) => {
    if (!Buffer.isBuffer(msg) || msg.length < 18) {
      console.warn('Invalid message received.');
      return;
    }

    try {
      const VERSION = msg[0];
      const id = msg.slice(1, 17);

      if (!isValidUUID(id)) {
        console.warn('UUID validation failed.');
        return;
      }

      let offset = msg[17] + 19;
      const port = msg.readUInt16BE(offset); offset += 2;
      const type = msg[offset++];

      const host = parseHost(msg, type, offset);
      if (!host) {
        console.warn('Failed to parse host.');
        return;
      }

      console.log(`Connecting to ${host}:${port}`);
      ws.send(Buffer.from([VERSION, 0]));

      const duplex = createWebSocketStream(ws);
      const socket = net.connect({ host, port }, () => {
        socket.write(msg.slice(offset));
        duplex.on('error', err => console.error('Stream error:', err.message))
              .pipe(socket)
              .on('error', err => console.error('Socket error:', err.message))
              .pipe(duplex);
      });

      socket.on('error', err => console.error('Connection error:', err.message));

    } catch (err) {
      console.error('Error processing message:', err.message);
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
  });
});

function isValidUUID(buffer) {
  for (let i = 0; i < 16; i++) {
    const byte = parseInt(UUID.replace(/-/g, '').toLowerCase().substr(i * 2, 2), 16);
    if (buffer[i] !== byte) return false;
  }
  return true;
}

function parseHost(msg, type, offset) {
  if (type === 1) {
    // IPv4
    return Array.from(msg.slice(offset, offset + 4)).join('.');
  }

  if (type === 2) {
    // Domain name
    const length = msg[offset];
    return new TextDecoder().decode(msg.slice(offset + 1, offset + 1 + length));
  }

  if (type === 3) {
    // IPv6
    const segments = [];
    for (let i = 0; i < 8; i++) {
      const segment = msg.readUInt16BE(offset + i * 2).toString(16);
      segments.push(segment);
    }
    return segments.join(':');
  }

  return null;
}
