import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

const connectedUsers: {
  [key: string]: {
    ws: WebSocket,
    userName: string,
    role: string,
    room: string
  }
} = {};

wss.on('connection', function connection(userSocket: WebSocket) {
  userSocket.on('error', console.error);

  userSocket.on('close', (data: string) => {
    const parsedData = JSON.parse(data);

    whenUserLeaves(parsedData);
    console.log("user disconnected from the server")
  });

  const userId = randomId();
  const roomId = randomId();
  userSocket.on('message', (data: string) => {
    console.log(data);
    const parsedData = JSON.parse(data);
    console.log(parsedData);
    if (parsedData.type === "JOIN_OR_CREATE_ROOM") {
      connectedUsers[userId] = {
        ws: userSocket,
        userName: parsedData.userName,
        role: parsedData.role,
        room: parsedData.role == "guest" ? parsedData.roomId : roomId
      }
      userSocket.send(JSON.stringify({
        type: "JOIN_OR_CREATE_ROOM",
        message: `You joined ${parsedData.roomId}`,
        roomId: connectedUsers[userId].room
      }))
    }

    if (parsedData.type === "MESSAGE") {

      const message = parsedData.message;
      const roomId = parsedData.roomId;
      const sender = parsedData.sender;

      Object.values(connectedUsers).forEach((user) => {
        if (user.room === roomId) {
          user.ws.send(JSON.stringify({
            type: "MESSAGE",
            sender: sender,
            message: message
          }))
        }
      })
    }

    if (parsedData.type === "VIDEO_BUFFER") {
      const videoBuffer = parsedData.videoData;
      const roomId = parsedData.roomId;

      Object.keys(connectedUsers).forEach((connectedUserId) => {
        if (connectedUsers[connectedUserId].room == roomId && connectedUsers[connectedUserId].ws != userSocket) {
          connectedUsers[connectedUserId].ws.send(JSON.stringify({ type: "VIDEO_BUFFER", videoData: videoBuffer }));
        }
      })
    }

    if (parsedData.type === "LEAVE_ROOM") {
      whenUserLeaves(parsedData);
      userSocket.send(JSON.stringify({type:"LEAVE_ROOM", message: "You left the room"}))
    }

    console.log(connectedUsers);
  });

  const broadcast = (data: string) => {
    wss.clients.forEach((client) => {
      if (client !== userSocket && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

});

function randomId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function whenUserLeaves(parsedData: any) {
  const userName = parsedData.userName;
  const user = Object.values(connectedUsers).find(user => user.userName === userName);

  if (user) {
    const roomId = user.room;
    if (user.role === "host") {
      Object.values(connectedUsers).forEach(connectedUser => {
        if (connectedUser.room === roomId) {
          connectedUser.room = "000";
        }
      });
    } else {
      user.room = "000";
    }
  }
}