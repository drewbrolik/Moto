// declare variables that will be used globally
var
  currentLayer = 1,
  totalLayers,
  spaceBetweenTracks = 10,
  hhue = 0,
  R,
  centerX = 0,
  centerY = 0,
  rotateXamt,
  spinDir;

function setup() {
  // initial canvas setup
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(4);

  // resize canvas element in html
  var canvasElement = document.querySelector("canvas");
  canvasElement.style.cssText = '';
  if (canvasElement.parentElement.offsetWidth >= canvasElement.parentElement.offsetHeight) {
    canvasElement.style.width = "auto";
    canvasElement.style.height = "100%";
  } else {
    canvasElement.style.width = "100%";
    canvasElement.style.height = "auto";
  }

  // instance of Random class
  R = new Random();

  // set random values for global variables  
  totalLayers = Math.floor(R.random_num(400,601)),
  spaceBetweenTracks = R.random_num(2,41),
  hhue = Math.floor(R.random_num(0,361)),
  centerX = R.random_num(-width*.5,width*.5),
  centerY = R.random_num(-width*.5,width*.5);
  rotateXamt = Math.floor(R.random_num(200,1001));
  spinDir = Math.round(R.random_num(0,1));
  if (spinDir < .5) { rotateXamt *= -1; }

  cam = createCamera();
  cam.move(R.random_num(width*-.5,width*.5),R.random_num(width*-.5,width*.5),R.random_num(width*-.25,width*.25));

  // background color
  backgroundColor = "rgb(13,13,13)";
  background(backgroundColor);
  
  // expand background color full screen, outside of canvas
  canvasElement.parentElement.style.backgroundColor = backgroundColor;
  
}

function draw() {
  if (currentLayer >= totalLayers) {
    noLoop();
  } else {
    stroke("hsb("+hhue+",80%,80%)");
    strokeWeight((width >= height) ? width/1663 : height/1663);
    fill("hsb("+hhue+",80%,20%)");
    rotateZ(R.random_num(0,10));
    rotateX(rotateXamt*-1);
    scale(.5);
    drawTireTracks();
    currentLayer += 1;
    hhue = (hhue + 1) % 360;
  }
}

function keyTyped() {
  
  if (key === 's') {
    save(invocation+'_layer'+currentLayer+'_'+width+'x'+height+'.png');
  }
  
}

function windowResized() {
  var canvasElement = document.querySelector("canvas");
  canvasElement.style.cssText = '';
  if (canvasElement.parentElement.offsetWidth >= canvasElement.parentElement.offsetHeight) {
    canvasElement.style.width = "auto";
    canvasElement.style.height = "100%";
  } else {
    canvasElement.style.width = "100%";
    canvasElement.style.height = "auto";
  }
}

function drawTireTrack(x, y) {
  let trackWidth = R.random_num(10,30); //20;
  let trackHeight = 5;
  
  for (let i = 0; i < 5; i++) {
    // main
    beginShape();
    vertex(x,y + i * (trackHeight + spaceBetweenTracks));
    vertex(x+trackWidth,y + i * (trackHeight + spaceBetweenTracks)-(spaceBetweenTracks*.5));
    vertex(x+trackWidth,y + i * (trackHeight + spaceBetweenTracks)+trackHeight-(spaceBetweenTracks*.5));
    vertex(x,y + i * (trackHeight + spaceBetweenTracks)+trackHeight);
    endShape(CLOSE);
    
  }
}

function drawTireTracks() {
  let spacing = 40; // Spacing between each tire track
  
  for (let x = 0; x < width; x += spacing) {
    drawTireTrack(x+R.random_num(0,width), height / 2 - 10);
    drawTireTrack(x+R.random_num(0,width), height / 2 + 30);
  }
  
}

// easy access to hash and invocation (token ID)
const hash = tokenData.hash;
const invocation = Number(tokenData.tokenId) % 1_000_000;

// random class provided by Prohibition
// uses tokenData.hash for 'predicatably random' values
class Random {
  constructor() {
    this.useA = false;
    let sfc32 = function (uint128Hex) {
      let a = parseInt(uint128Hex.substring(0, 8), 16);
      let b = parseInt(uint128Hex.substring(8, 16), 16);
      let c = parseInt(uint128Hex.substring(16, 24), 16);
      let d = parseInt(uint128Hex.substring(24, 32), 16);
      return function () {
        a |= 0;
        b |= 0;
        c |= 0;
        d |= 0;
        let t = (((a + b) | 0) + d) | 0;
        d = (d + 1) | 0;
        a = b ^ (b >>> 9);
        b = (c + (c << 3)) | 0;
        c = (c << 21) | (c >>> 11);
        c = (c + t) | 0;
        return (t >>> 0) / 4294967296;
      };
    };
    // seed prngA with first half of tokenData.hash
    this.prngA = new sfc32(tokenData.hash.substring(2, 34));
    // seed prngB with second half of tokenData.hash
    this.prngB = new sfc32(tokenData.hash.substring(34, 66));
    for (let i = 0; i < 1e6; i += 2) {
      this.prngA();
      this.prngB();
    }
  }
  // random number between 0 (inclusive) and 1 (exclusive)
  random_dec() {
    this.useA = !this.useA;
    return this.useA ? this.prngA() : this.prngB();
  }
  // random number between a (inclusive) and b (exclusive)
  random_num(a, b) {
    return a + (b - a) * this.random_dec();
  }
  // random integer between a (inclusive) and b (inclusive)
  // requires a < b for proper probability distribution
  random_int(a, b) {
    return Math.floor(this.random_num(a, b + 1));
  }
  // random boolean with p as percent liklihood of true
  random_bool(p) {
    return this.random_dec() < p;
  }
  // random value in an array of items
  random_choice(list) {
    return list[this.random_int(0, list.length - 1)];
  }
}