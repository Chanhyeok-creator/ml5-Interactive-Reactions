const maxStrokes = 5000;  // line 모드에서 최대 저장할 좌표 개수
let strokes = [];

let video;
let handPose;
let hands = [];

let mode = "line"; // "line", "text", "image" 모드 선택

// 글자 모드에서 그릴 텍스트 (원하는 텍스트로 변경 가능)
const drawText = "Hello!";

// 이미지 모드에서 사용할 이미지 (drawImage.png 파일을 프로젝트 폴더에 준비하세요)
let drawImg;

// 드로잉 기능의 On/Off 플래그
let isDrawingEnabled = true;

function preload() {
  handPose = ml5.handPose({ flipped: true });
  drawImg = loadImage('drawImage.png'); // 사용할 이미지 경로를 확인하세요.
}

function mousePressed() {
  strokes = []; // 마우스 클릭 시 캔버스를 초기화합니다.
}

function gotHands(results) {
  hands = results;
}

function setup() {
  // 캔버스 크기를 창 전체크기로 설정해서 캠 화면을 크게 표시합니다.
  createCanvas(windowWidth, windowHeight);
  
  // 웹캠 캡쳐 생성 시, 비디오 크기를 캔버스 크기에 맞게 조정합니다.
  video = createCapture(VIDEO, { flipped: true }); // 거울 모드
  video.size(width, height);
  video.hide();

  handPose.detectStart(video, gotHands);

  noStroke();
  textSize(100);
}

function draw() {
  // 비디오를 캔버스 전체 크기로 그림 (캠 화면이 크게 표시됨)
  image(video, 0, 0, width, height);

  // 드로잉 기능이 활성화 되어 있고, 손이 감지된 경우에만 좌표를 저장합니다.
  if (hands.length > 0 && isDrawingEnabled) {
    let hand = hands[0];
    let index = hand.index_finger_tip;
    
    // 현재 모드에 따라 해당 좌표와 모드를 strokes 배열에 등록합니다.
    strokes.push({ x: index.x, y: index.y, mode: mode });
    
    // 모드에 따라 최대 저장할 좌표 수 결정
    // "line" 모드: maxStrokes, "text"나 "image" 모드: 1
    let currentMaxStrokes = (mode === "line") ? maxStrokes : 1;
    while (strokes.length > currentMaxStrokes) {
      strokes.shift(); // 가장 오래된 좌표 제거 (text, image 모드에서는 모두 제거되어 1개만 남음)
    }
  }

  // 저장된 strokes 데이터를 현재 모드에 따라 그림
  for (let s of strokes) {
    if (s.mode === "line") {
      fill(0, 255, 0, 150);
      // line 모드인 경우, 원의 크기를 3배로 (10 -> 30) 그립니다.
      ellipse(s.x, s.y, 30);
    } else if (s.mode === "text") {
      fill(255, 0, 0);
      text(drawText, s.x, s.y);
    } else if (s.mode === "image") {
      // 이미지 모드의 경우, 중앙 정렬을 위해 좌표를 조금 조정합니다.
      image(drawImg, s.x - 240, s.y - 240, 480, 480);
    }
  }
  
  // 하단에 현재 모드와 드로잉 기능의 상태를 표시합니다.
  fill(255);
  rect(0, height - 40, 300, 40);
  fill(0);
  text("Mode: " + mode, 10, height - 10);
  text("Draw: " + (isDrawingEnabled ? "ON" : "OFF"), 150, height - 10);
}

// 키보드 입력에 따라 모드를 전환하거나 드로잉 기능을 토글합니다.
// L: 선 모드, T: 글자 모드, I: 이미지 모드, Z: 드로잉 On/Off 토글
function keyPressed() {
  if (key === 'l' || key === 'L') {
    mode = "line";
  } else if (key === 't' || key === 'T') {
    mode = "text";
  } else if (key === 'i' || key === 'I') {
    mode = "image";
  } else if (key === 'z' || key === 'Z') {
    isDrawingEnabled = !isDrawingEnabled; // 드로잉 기능 토글
  }
}