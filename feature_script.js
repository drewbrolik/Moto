/**
 * Calculate features for the given token data.
 * @param {Object} tokenData
 * @param {string} tokenData.tokenId - Unique identifier of the token on its contract.
 * @param {string} tokenData.hash - Unique hash generated upon minting the token.
 * @returns {Object} - A set of features in the format of key-value pair notation.
 * @note - This function is called by the ArtBlocks metadata server to generate the
 *         features for a given token. For more information, visit
 *         https://docs.prohibition.art/how-to-setup-features
 */
function calculateFeatures(tokenData) {
  const hash = tokenData.hash;
  const invocation = Number(tokenData.tokenId) % 1_000_000;

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

  var featureResponse = {}

  var
    totalLayers,
    spaceBetweenTracks = 10,
    hhue = 0,
    //centerX = 0,
    //centerY = 0,
    rotateXamt,
    spinDir,
    blurriness,
    R = new Random();

  // set random values for global variables
  totalLayers = Math.floor(R.random_num(400,601));
  featureResponse["Layers"] = totalLayers+"";

  spaceBetweenTracks = R.random_num(2,41);
  if (spaceBetweenTracks < 14) {
    featureResponse["Tracking"] = "Stretto"; // "Tight";
  } else if (spaceBetweenTracks < 28) {
    featureResponse["Tracking"] = "Normale"; // "Normal"
  } else {
    featureResponse["Tracking"] = "Aperto"; // "Open"
  }
  hhue = Math.floor(R.random_num(0,361));
  var birthColorName = hueToColor(hhue);
  featureResponse["Birth Color Family"] = birthColorName; // hhue+" ("+birthColorName+")";
  var presentColorName = hueToColor((hhue+totalLayers)%360);
  featureResponse["Present Color Family"] = presentColorName; // ((hhue+totalLayers)%360)+" ("+presentColorName+")";

  rotateXamt = Math.floor(R.random_num(200,1001));
  spinDir = Math.round(R.random_num(0,1));
  if (spinDir < .5) { rotateXamt *= -1; }
  //featureResponse["Rotate X Amt"] = rotateXamt+"";

  //blurriness = R.random_num(.5,1);
  //featureResponse["Blurriness"] = blurriness+"";

  /*var windowWidth = 1000;
  centerX = R.random_num(-windowWidth*.5,windowWidth*.5),
  centerY = R.random_num(-windowWidth*.5,windowWidth*.5);
  camMoveX = R.random_num(windowWidth*-.5,windowWidth*.5);
  camMoveY = R.random_num(windowWidth*-.5,windowWidth*.5);
  camMoveZ = R.random_num(windowWidth*-.25,windowWidth*.25);

  featureResponse["Cam Move Z"] = camMoveZ+"";*/
  
  return featureResponse;

  function hueToColor(hue) {
    var colorName;
    if (hue < 10) {
      colorName = "Rosso"; // "Red";
    } else if (hue < 30) {
      colorName = "Arancione"; // "Orange";
    } else if (hue < 55) {
      colorName = "Giallo"; // "Yellow";
    } else if (hue < 160) {
      colorName = "Verde"; // "Green";
    } else if (hue < 240) {
      colorName = "Blu"; // "Blue";
    } else if (hue < 290) {
      colorName = "Viola"; // "Purple";
    } else if (hue < 330) {
      colorName = "Rosa"; // "Pink";
    } else {
      colorName = "Rosso"; // "Red";
    }

    return colorName;
  }

}