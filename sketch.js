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
  spinDir,
  blurriness,
  camMoveX,
  camMoveY,
  camMoveZ,
  infoFont,
  info = {};

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
  totalLayers = Math.floor(R.random_num(400,601));
  spaceBetweenTracks = R.random_num(2,41);
  hhue = Math.floor(R.random_num(0,361));
  rotateXamt = Math.floor(R.random_num(200,1001));
  spinDir = Math.round(R.random_num(0,1));
  if (spinDir < .5) { rotateXamt *= -1; }
 
  blurriness = (width>=height) ? width/1000 : height/1000;

  spaceBetweenTracks = blurriness*spaceBetweenTracks;

  // this is what makes it different outcomes at different screen sizes
  centerX = R.random_num(-width*.5,width*.5),
  centerY = R.random_num(-width*.5,width*.5);
  camMoveX = R.random_num(width*-.5,width*.5);
  camMoveY = R.random_num(width*-.5,width*.5);
  camMoveZ = R.random_num(width*-.25,width*.25);

  cam = createCamera();
  cam.move(camMoveX,camMoveY,camMoveZ);

  // background color
  backgroundColor = "rgb(13,13,13)";
  background(backgroundColor);
  
  // expand background color full screen, outside of canvas
  canvasElement.parentElement.style.backgroundColor = backgroundColor;

  info.totalLayers = totalLayers;
  info.spaceBetweenTracks = Math.round(spaceBetweenTracks);
  info.rotationAmount = rotateXamt;
  if (rotateXamt >= 0) { info.rotationDirection = "Clockwise"; } else { info.rotationDirection = "Counter Clockwise"; }
  info.birthHue = hhue;
  info.presentHue = (hhue+totalLayers)%360;
  info.initialCameraOffset = Math.round(camMoveX)+", "+Math.round(camMoveY)+", "+Math.round(camMoveZ);
  
}

function draw() {
  if (currentLayer >= totalLayers) {
    noLoop();
  } else {
    stroke("hsb("+hhue+",80%,80%)");
    strokeWeight(blurriness);
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

  if (key === 'i') {
    showStats();
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
  //trackWidth = (width>=height) ? width/1663*trackWidth : height/1663*trackWidth;
  trackWidth = blurriness*trackWidth;
  //let trackHeight = 5;
  let trackHeight = blurriness*5;
  
  for (let i = 0; i < 5; i++) {
    // main
    beginShape();
    vertex(x,y + blurriness*i * (trackHeight + spaceBetweenTracks));
    vertex(x+trackWidth,y + blurriness*i * (trackHeight + spaceBetweenTracks)-(spaceBetweenTracks*.5));
    vertex(x+trackWidth,y + blurriness*i * (trackHeight + spaceBetweenTracks)+trackHeight-(spaceBetweenTracks*.5));
    vertex(x,y + blurriness*i * (trackHeight + spaceBetweenTracks)+trackHeight);
    endShape(CLOSE);
    
  }
}

function drawTireTracks() {
  //let spacing = 40; // Spacing between each tire track
  let spacing = blurriness*40;

  for (let x = 0; x < width; x += spacing) {
    drawTireTrack(x+R.random_num(0,width), height / 2 - (blurriness*10));
    drawTireTrack(x+R.random_num(0,width), height / 2 + (blurriness*30));
  }
  
}

function showStats() {
  background(255,255,255,255);
  
  // Resetting transformations and camera
  resetMatrix(); // Resets 2D transformations
  camera(); // Resets 3D camera to default parameters
  rotateY(5.66);

  color(0);
  textSize(width / 40); // Size of the text based on screen width
  textAlign(LEFT,CENTER);
  textFont(infoFont);
  var textContent = JSON.stringify(info, null, 2);
  text(textContent, width * -1, height * -1, width * 1, height * 1); // Position and dimensions of the text

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

function preload() {
  // Base64 encoded version of a simple font (e.g., Arial)
  let fontData = "data:font/truetype;charset=utf-8;base64,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BQkFBggFCAgGCAgGCAgDBQgDCQgICAgGCAYICAkGCAgGAwYIBgAAAA0KBwAHBwMHCggKCgMFBQcHBQcDCggFCAgICAgICAgDAwcHBwgKCAgHCAcHCAgHCAgHCggICAgICAcICAoICAcFCgUHCAUICAcICAcICAMFCAMKCAgICAcIBwgICgcICAcDBwgHAAAADgsHAAcHBAcLCQsLBAUFBwcFBwQLCQUJCQkJCQkJCQQEBwcHCQsJCQcJBwcJCQcJCQcLCQkJCQkJBwkJCwkJBwULBQcJBQkJBwkJBwkJBAUJBAsJCQkJBwkHCQkLBwkJBwQHCQcAAAAPCwgACAgECAsJCwsEBgYICAYIBAsJBgkJCQkJCQkJBAQICAgJCwkJCAkICAkJCAkJCAsJCQkJCQkICQkLCQkIBgsGCAkGCQkICQkICQkEBgkECwkJCQkICQgJCQsICQkIBAgJCAAAABAMCAAICAQIDAoMDAQGBggIBggEDAoGCgoKCgoKCgoEBAgICAoMCgoICggICgoICgoIDAoKCgoKCggKCgwKCggGDAYICgYKCggKCggKCgQGCgQMCgoKCggKCAoKDAgKCggECAoIAAAAEQ0JAAkJBAkNCw0NBAYGCQkGCQQNCwYLCwsLCwsLCwQECQkJCw0LCwkLCQkLCwkLCwkNCwsLCwsLCQsLDQsLCQYNBgkLBgsLCQsLCQsLBAYLBA0LCwsLCQsJCwsNCQsLCQQJCwkAAAASDgkACQkFCQ4LDg4FBwcJCQcJBQ4LBwsLCwsLCwsLBQUJCQkLDgsLCQsJCQsLCQsLCQ4LCwsLCwsJCwsOCwsJBw4HCQsHCwsJCwsJCwsFBwsFDgsLCwsJCwkLCw4JCwsJBQkLCQAAABMOCgAKCgUKDgwODgUHBwoKBwoFDgwHDAwMDAwMDAwFBQoKCgwODAwKDAoKDAwKDAwKDgwMDAwMDAoMDA4MDAoHDgcKDAcMDAoMDAoMDAUHDAUODAwMDAoMCgwMDgoMDAoFCgwKAAAAFA8KAAoKBQoPDQ8PBQgICgoICgUPDQgNDQ0NDQ0NDQUFCgoKDQ8NDQoNCgoNDQoNDQoPDQ0NDQ0NCg0NDw0NCggPCAoNCA0NCg0NCg0NBQgNBQ8NDQ0NCg0KDQ0PCg0NCgUKDQoAAAAVEAsACwsFCxANEBAFCAgLCwgLBRANCA0NDQ0NDQ0NBQULCwsNEA0NCw0LCw0NCw0NCxANDQ0NDQ0LDQ0QDQ0LCBAICw0IDQ0LDQ0LDQ0FCA0FEA0NDQ0LDQsNDRALDQ0LBQsNCwAAABYRCwALCwYLEQ4REQYICAsLCAsGEQ4IDg4ODg4ODg4GBgsLCw4RDg4LDgsLDg4LDg4LEQ4ODg4ODgsODhEODgsIEQgLDggODgsODgsODgYIDgYRDg4ODgsOCw4OEQsODgsGCw4LAAAAFxEMAAwMBgwRDhERBgkJDAwJDAYRDgkODg4ODg4ODgYGDAwMDhEODgwODAwODgwODgwRDg4ODg4ODA4OEQ4ODAkRCQwOCQ4ODA4ODA4OBgkOBhEODg4ODA4MDg4RDA4ODAYMDgwAAAAYEgwADAwGDBIPEhIGCQkMDAkMBhIPCQ8PDw8PDw8PBgYMDAwPEg8PDA8MDA8PDA8PDBIPDw8PDw8MDw8SDw8MCRIJDA8JDw8MDw8MDw8GCQ8GEg8PDw8MDwwPDxIMDw8MBgwPDAAAAAAAAiYBkAAFAAECvAKKAAAAjwK8AooAAAHFADIBAwAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBbHRzAEAAICAQAu7/BgAAAu4A+gAAAAEAAAABAABS+rcfXw889QAAA+gAAAAAuqZ4/QAAAAC6pnj9AAD/BgJxAu4AAAADAAIAAQAAAAAAAQAAAu7/BgAAAu4AAAA+AnEAAQAAAAAAAAAAAAAAAAAAAGMAAQAAAGMAIAAFAAAAAAACAAgAQAAKAAAAYACnAAEAAQ==";
  infoFont = loadFont(fontData);
}