let video;
let canvas; // Define canvas variable

function setup() {
  canvas = createCanvas(640, 480); // Create canvas and assign it to the canvas variable
  canvas.parent('videoContainer'); // Set parent element if needed

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // Load face-api.js models
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
  ]).then(startVideo);
}

function startVideo() {
  video.elt.addEventListener('play', () => {
    const displaySize = { width: 640, height: 480 };
    faceapi.matchDimensions(canvas.elt, displaySize);

    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video.elt, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      background(255); // Clear the canvas
      // Draw the face-api.js detections
      if (resizedDetections && resizedDetections.length > 0) {
        faceapi.draw.drawDetections(canvas.elt, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas.elt, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas.elt, resizedDetections);
      }
    }, 100);
  });
}

function draw() {
  // Draw the video frame
  image(video, 0, 0, 640, 480);
}
