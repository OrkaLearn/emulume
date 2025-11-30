let video;
let bodyPose;
let poses = [];
let connections;

function preload() {
  bodyPose = ml5.bodyPose();
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Create webcam capture with no fixed size
  video = createCapture(VIDEO, {flipped:true});
  video.hide();

  bodyPose.detectStart(video, gotPoses);
  connections = bodyPose.getSkeleton();
}

function gotPoses(results) {
  poses = results;
}

function draw() {
  /* VIDEO FEED START */
  background(255, 255, 255);

  // Webcam actual dimensions
  const vw = video.width;
  const vh = video.height;

  if (vw === 0 || vh === 0) return; // wait until video loads

  // Desired aspect ratio = 2:3 (width/height)
  const targetRatio = 2.5 / 3;

 
  const cropH = vh;
  const cropW = cropH * targetRatio;

  // Center crop area in webcam image
  const sx = (vw - cropW) / 2;
  const sy = (vh - cropH) / 2;

  // Scale output to fit canvas height (portrait style)
  const displayH = height;
  const displayW = displayH * targetRatio;

  // horizontal position on canvas
  const dx = 0;

  image(
    video,
    dx, 0, displayW, displayH,   // destination rectangle
    sx, sy, cropW, cropH         // source crop area
  );
  /* VIDEO FEED END */

  // Transform function: converts video coordinates to canvas coordinates
  function videoToCanvasCoords(videoX, videoY) {
    // Translate from video crop area
    let x = videoX - sx;
    let y = videoY - sy;
    
    // Scale to display size
    // The capture is created with `{flipped:true}` so the video frames are
    // already mirrored horizontally. The pose keypoints come from the
    // estimator in the video's coordinate space (mirrored), so to overlay
    // correctly we must flip the X coordinate when mapping into canvas
    // coordinates.
    x = (x / cropW) * displayW;
    // Flip horizontally relative to the destination rectangle.
    x = dx + displayW - x;
    y = (y / cropH) * displayH;
    
    return { x, y };
  }

  // CHECK SKELETON CONNECTIONS START
  // For each pose
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    // For each two points
    for (let j = 0; j < connections.length; j++) {
      let pointAIndex = connections[j][0];
      let pointBIndex = connections[j][1];
      let pointA = pose.keypoints[pointAIndex];
      let pointB = pose.keypoints[pointBIndex];
      if (pointA.confidence > 0.1 && pointB.confidence > 0.1) {
        let coordA = videoToCanvasCoords(pointA.x, pointA.y);
        let coordB = videoToCanvasCoords(pointB.x, pointB.y);
        stroke(255, 0, 0);
        strokeWeight(2);
        line(coordA.x, coordA.y, coordB.x, coordB.y);
      }
    }
  }
  // CHECK SKELETON CONNECTIONS END

  // DRAW KEYPOINTS START
  // Iterate through all the poses
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    // Iterate through all the keypoints for each pose
    for (let j = 0; j < pose.keypoints.length; j++) {
      let keypoint = pose.keypoints[j];
      // Only draw a circle if the keypoint's confidence is greater than 0.1
      if (keypoint.confidence > 0.1) {
        let coord = videoToCanvasCoords(keypoint.x, keypoint.y);
        fill(0, 255, 0);
        noStroke();
        circle(coord.x, coord.y, 10);
      }
    }
  }

  // DRAW KEYPOINTS END


}
