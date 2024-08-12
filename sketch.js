// these variable are use to control text
let font;
let points = [];
let r = 15; 
let angle = 0;

// these variable are use to control image
let watcherGif;
let detectedImage; 

// these variable are use to control text change, for example, from 'monitoring' to 'human detected'
let currentMessage = ''; 
let displayMessage = 'monitoring'; 
let messageTimeout; 
let showTime = 5000; // how long to show detected result

//variable about WebSocket
let socket; 

function preload() {
  font = loadFont("fonts/Roboto-Regular.ttf");
  watcherGif = loadImage("https://files.seeedstudio.com/wiki/Watcher_to_P5js/watcher.gif"); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // create WebSocket connection
  socket = new WebSocket('ws://127.0.0.1:3000');

  // monitoring server message
  socket.onmessage = (event) => {
      let data = JSON.parse(event.data);
      console.log('message from server:', data);

      // extract content and image url from data
      let message = data.content.content;
      let image_url = data.content.image_url;
      if (message) {
          console.log('extract message:', message);
          updateMessage(message);
      } 
      if (image_url) {
        detectedImage = loadImage(image_url, watcherGif => {
            console.log('load image successfully:', watcherGif);
        }, err => {
            console.error('load image fail:', err);
        });
    }
  };
}

function updateMessage(message) {
  if (typeof message !== 'string') {
      console.error('message is not string:', message);
      return; 
  }
  currentMessage = message;
  displayMessage = message;

  // set timer to update message "monitoring"
  if (messageTimeout) {
      clearTimeout(messageTimeout);
  }
  messageTimeout = setTimeout(() => {
      displayMessage = 'monitoring';
  }, showTime);

  //draw message
  let bounds = font.textBounds(displayMessage, 0, 0, 200);// get bounds of message showing
  let x = (width - bounds.w) / 2; // message vertical position
  let y = (height + bounds.h) / 1.5; // message horizontal position
  points = font.textToPoints(displayMessage, x, y, 200, {
      sampleFactor: 0.1,
      simplifyThreshold: 0
  });
  angleMode(DEGREES);//change angle mode from radians to degrees, make the effect more beatiful
}


function draw() {
  background(0);//set background to dark color

  image(watcherGif, (width - watcherGif.width) / 2, (height - watcherGif.height) / 7, 500, 500); // show watcher Gif

  fill(255, 105, 180); // set message color to pink
  noStroke(); // 不显示边框

  for (let i=0; i<points.length; i++) {
    ellipse(points[i].x + r*sin(angle + i*10), points[i].y, 10, 10);
  }
  angle += 10;

  // update message every time
  if (displayMessage !== currentMessage) {
    let bounds = font.textBounds(displayMessage, 0, 0, 200);
    let x = (width - bounds.w) / 2; // message vertical position
    let y = (height + bounds.h) / 1.5; // message hocizontal position

    points = font.textToPoints(displayMessage, x, y, 200, {
        sampleFactor: 0.1,
        simplifyThreshold: 0
    });
    angleMode(DEGREES);//change angle mode from radians to degrees, make the effect more beatiful
    currentMessage = displayMessage; // update current message
  }

  // when detect human, show detected image
  if (displayMessage !== 'monitoring' && detectedImage) {
    let diameter = 370; // diameter of circle
    let x = (width - diameter) / 1.98; // detected image vertical position
    let y = (height - diameter) / 3.83; // detected image horizontal position

    // make the detected image as a circle format
    let mask = createGraphics(diameter, diameter);
    mask.ellipse(diameter / 2, diameter / 2, diameter, diameter);
    mask.loadPixels();
    // use mask
    detectedImage.mask(mask);
    // show image
    image(detectedImage, x, y, diameter, diameter);
  } 
}

// window size will change when canvas change
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}