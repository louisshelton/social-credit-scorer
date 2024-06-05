let video; 
let detections = []; 
let faceData = {}; 
let socialStatus = ""; 
let socialCredit = 50; 
let captured = false; 
let options = ["mortgage", "loan", "discount", "holiday"];
let randomOption = "";

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  startFaceDetection();
}

function draw() {
  background(220);
  image(video, 0, 0, width, height);

  // Draw face detections
  for (let i = 0; i < detections.length; i++) {
    const detection = detections[i];
    let boxColor = color(0, 255, 0); // Default color
    if (socialStatus === "High") {
      boxColor = color(0, 255, 0); // Green
    } else if (socialStatus === "Medium") {
      boxColor = color(255, 255, 0); // Yellow
    } else if (socialStatus === "Low") {
      boxColor = color(255, 0, 0); // Red
    }
    stroke(boxColor);
    strokeWeight(4);
    noFill();
    rect(detection.x, detection.y, detection.width, detection.height);
    noStroke();
    fill(boxColor);
    
    // Calculate text position relative to the box
    let textX = detection.x + 10; 
    let textY = detection.y + 10; 
    
    textSize(13);
    textAlign(LEFT, CENTER);
    text("Social Status: " + socialStatus, textX, textY);
    text("Social Credit: " + socialCredit, textX, textY + 20);
    if (socialStatus == "Low") {
      text("terminated", textX, textY + 40);
    } else if (socialStatus == "High") {
      text("congrats you get a " + randomOption, textX, textY + 40);
    }
  }
}

async function startFaceDetection() {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
  ]);

  setInterval(async () => {
    const detectedFaces = await faceapi.detectAllFaces(video.elt, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();
    console.log(detectedFaces); 
    if (detectedFaces.length > 0) {
      const expressions = detectedFaces[0].expressions;
      faceData = {
        "neutral": expressions.neutral,
        "happy": expressions.happy,
        "sad": expressions.sad,
        "angry": expressions.angry,
        "fearful": expressions.fearful,
        "disgusted": expressions.disgusted,
        "surprised": expressions.surprised
      };
      updateSocialStatusAndCredit();
    }
    detections = detectedFaces.map(face => ({
      x: face.detection.box.x,
      y: face.detection.box.y,
      width: face.detection.box.width,
      height: face.detection.box.height
    }));
  }, 100);
}

function updateSocialStatusAndCredit() {
  let score = 0;
  score += map(faceData.happy, 0, 1, 0, 10); 
  score -= map(faceData.sad, 0, 1, 0, 10); 
  score -= map(faceData.angry, 0, 1, 0, 10); 
  score -= map(faceData.neutral, 0, 1, 0, 10); 

  socialCredit = constrain(socialCredit + score, 0, 100);

  if (socialCredit >= 70) {
    socialStatus = "High";
    captured = false; 
    randomOption = random(options); // Pick a random option for high status
  } else if (socialCredit >= 40) {
    socialStatus = "Medium";
    captured = false; 
  } else {
    socialStatus = "Low";
    if (!captured && socialCredit <= 0) {
      captureFaceArea(detections[0]);
      captured = true; 
    }
  }
}

function captureFaceArea(detection) {
  let faceImage = get(detection.x, detection.y, detection.width, detection.height);
  faceImage.save('face_capture.png');
}
