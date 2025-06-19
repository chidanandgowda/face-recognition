const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const resultText = document.getElementById('result');

let blinked = false;
let countdown;
let timerId;

// Setup FaceMesh
const faceMesh = new FaceMesh({ locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
}});
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
faceMesh.onResults(onResults);

// Start webcam
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  video.srcObject = stream;
  startCountdown();  // Start countdown once webcam is on
});

// Start camera processing
const camera = new Camera(video, {
  onFrame: async () => {
    await faceMesh.send({ image: video });
  },
  width: 320,
  height: 240
});
camera.start();

function onResults(results) {
  if (blinked || !results.multiFaceLandmarks) return;

  const landmarks = results.multiFaceLandmarks[0];
  const top = landmarks[33];
  const bottom = landmarks[159];
  const eyeDist = Math.abs(top.y - bottom.y);

  if (eyeDist < 0.01) {
    blinked = true;
    clearTimeout(timerId);  // Stop timeout
    resultText.innerText = "✅ Blink detected. Verifying...";
    captureImage();
  }
}

function captureImage() {
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const dataURL = canvas.toDataURL('image/png');

  fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataURL })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      resultText.innerText = `✅ Welcome, ${data.user}!`;
    } else {
      resultText.innerText = "❌ Login failed. Face not recognized.";
    }
  });
}

function startCountdown() {
  let timeLeft = 5;
  resultText.innerText = `Please blink within ${timeLeft} seconds...`;

  countdown = setInterval(() => {
    timeLeft -= 1;
    if (timeLeft > 0) {
      resultText.innerText = `Please blink within ${timeLeft} seconds...`;
    }
  }, 1000);

  timerId = setTimeout(() => {
    clearInterval(countdown);
    if (!blinked) {
      resultText.innerText = "⏱ Blink not detected in time. Try again.";
      resetState();
    }
  }, 5000);
}

function resetState() {
  blinked = false;
  setTimeout(() => {
    startCountdown();  // Restart process
  }, 2000);
}
