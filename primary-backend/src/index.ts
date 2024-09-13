import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(userSocket: WebSocket) {
  userSocket.on('error', console.error);

  userSocket.on('message', function message(data) {
    console.log(message);
    wss.clients.forEach((client) => {
      if (client !== userSocket && client.readyState === WebSocket.OPEN) {
          client.send(data);
      }
  });
  });

  userSocket.send('something');
});