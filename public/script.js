// State variables:
var roomCode = null;
var roomSound = 1;
var currentCat = null;
var currentSeconds = null;

// DOM elements:
const cat = document.getElementById("cat");
const countdown = document.getElementById("countdown");
const roomCodeSpan = document.getElementById("room-code");
const roomCodeInput = document.getElementById("room-code-input");
const soundElement = document.getElementById("sound");

/* - - - - - - - - - -
   Setup Websocket:
  - - - - - - - - - - */

// Match websocket protocol to page protocol (ws/http or wss/https):
var wsProtocol = window.location.protocol == "https:" ? "wss" : "ws";

// Set up new websocket connection to server
var connection = new WebSocket(`${wsProtocol}://${window.location.hostname}`);

// Log successful connection
connection.onopen = function() {
  console.log("Websocket connected!");
  
  // Auto generate new room on new connection
  createRoom();
};

// Set this function to run every time the websocket receives a message from the server:
// Each message will have data that represents a player that has moved.
connection.onmessage = function(message) {
  
  const parsedMessageData = JSON.parse(message.data);
  console.log("Parsed Message Data:");
  console.log(parsedMessageData);
  
  if (parsedMessageData.type === "newCat") {
     if (parsedMessageData.catData && parsedMessageData.seconds) {
       showNewCat(parsedMessageData.catData, parsedMessageData.seconds);
     } 
  }
  
  if (parsedMessageData.type === "requestCurrentCat") {
    if (parsedMessageData.joinCode) {
      sendCurrentCat(parsedMessageData.joinCode)
    }
  }
};

function createRoom() {
  roomCode = Math.random().toString(36).substr(2, 6);
  roomCodeSpan.innerHTML = roomCode;
  roomSound = Math.ceil(Math.random() * 7);
  connection.send(
    JSON.stringify({
      type: "newRoom",
      roomCode: roomCode,
      roomSound: roomSound
    })
  );
}

function requestJoinRoom() {
  roomCode = roomCodeInput.value;
  roomCodeSpan.innerHTML = roomCode;
  connection.send(
    JSON.stringify({
      type: "requestJoinRoom",
      newRoomCode: roomCode
    })
  );
}

function requestNewCat() {
  connection.send(
    JSON.stringify({
      type: "requestNewCat",
      roomCode: roomCode
    })
  )
}

function sendCurrentCat(joinCode) {
  connection.send(
    JSON.stringify({
      type: "sendCurrentCat",
      joinCode: joinCode,
      catData: {url: currentCat},
      seconds: currentSeconds
    })
  )
}


async function showNewCat(catData, seconds) {
  
  console.log("showNewCat()");
  console.log(catData);
  console.log(seconds);
  
  try {
    if (catData) {
      cat.innerHTML = `<img class="cat-image" src=${catData.url} />`;
      currentCat = catData.url;
    }   
    countdown.innerHTML = `<span id="seconds-remaining">${seconds}</span> seconds remaining`
    const secondsRemaining = document.getElementById("seconds-remaining");
    
    const timer = setInterval(() => {
      seconds--;
      currentSeconds = seconds;
      if (seconds === -1) {
        soundElement.play();
        countdown.innerHTML = "";
        cat.innerHTML = "";
        clearInterval(timer);
        return;
      }
      secondsRemaining.innerHTML = seconds;
    }, 1000)
   
  } catch (error) {
    cat.innerHTML = "";
    console.log("Error in showNewCat()");
    console.log(error);
  }
}

function playSound() {
  const soundElement = document.getElementById('sound');
  soundElement.play();
}