const https = require('https');
const express = require("express");
const app = express();
app.use(express.static("public"));


// No dependency request like function
function gets(url) {
  return new Promise((resolve, reject) => {
   https.get(url, (response) => {
   let body = ''
   response.on('data', (chunk) => body += chunk)
   response.on('end', () => resolve(body))
   }).on('error', reject)
  })
}

async function newCat() {
  const url = "https://api.thecatapi.com/v1/images/search?mime_types=jpg,png";
  const api = () => gets(url);
  const cat = JSON.parse(await api());
  if (cat[0]) {
    return cat[0];
  } else {
    return null;
  }
}

// listen for requests :)
const server = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + server.address().port);
});


// Websocket Server:
// We are using the external library 'ws' to set up the websockets on the server
// https://www.npmjs.com/package/ws
// In our code this is stored in the variable WebSocket.
var WebSocket = require("ws");

// Connect our Websocket server to our server variable to serve requests on the same port:
var wsServer = new WebSocket.Server({ server });

// This function will send a message to all clients connected to the websocket:
function broadcast(roomCode, data) {
  wsServer.clients.forEach(client => {
    if (client.roomCode === roomCode && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// This outer function will run each time the Websocket
// server connects to a new client:
wsServer.on("connection", ws => {
  ws.id = 'id-' + Math.random().toString(36).substr(2, 6);
  ws.roomCode = null;
  ws.roomSound = null;

  // This function will run every time the server recieves a message with that client.
  ws.on("message", async data => {

    console.log("\nMessage Received from ", ws.id);
    console.log(data);
    
    const messageData = JSON.parse(data)
    
    ws.roomCode = messageData.roomCode ? messageData.roomCode : ws.roomCode;
    ws.roomSound = messageData.roomSound ? messageData.rooMSound : ws.roomSound;
    
    switch(messageData.type) {
      case "requestNewCat":
        requestNewCat(ws);
        break;
      case "requestJoinRoom":
        requestJoinRoom(ws, messageData);
        break;
      case "sendCurrentCat":
        sendCurrentCat(messageData);
        break;
      default:
        console.log("Invalid message type:", messageData.type);
    }
    
  });

  ws.on("close", () => {
    console.log("Disconnected:", ws.id);
    // Here you could send a message to other clients that
    // this client has disconnected.
  });
});


async function requestNewCat(ws) {
  const newCatData = await newCat()
      
  console.log("** New Cat Data:");
  console.log(newCatData);


  const seconds = Math.floor(Math.random() * 170) + 30;
  broadcast(ws.roomCode, {
    type: "newCat",
    catData: newCatData,
    seconds: seconds
  })
}

function requestJoinRoom(ws, messageData) {
  ws.joinCode = Math.random().toString(36).substr(2, 6);
  wsServer.clients.forEach(client => {
    if (client.roomCode === messageData.newRoomCode && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: "requestCurrentCat",
        joinCode: ws.joinCode
      }));
    }
  });
  //
  ws.roomCode = messageData.newRoomCode;
}

function sendCurrentCat(messageData) {
  wsServer.clients.forEach(client => {
    if (client.joinCode === messageData.joinCode && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: "newCat",
        catData: messageData.catData,
        seconds: messageData.seconds,
        roomSound: messageData.roomSound
      }));
    }
  });
}