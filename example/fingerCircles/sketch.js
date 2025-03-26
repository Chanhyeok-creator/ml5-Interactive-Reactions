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

// 'c' 버튼을 눌렀을 때 변경할 색상을 저장합니다.
let lineColor;   // line 모드에 사용될 색 (초기값: 녹색)
let textColor;   // text 모드에 사용될 색 (초기값: 빨간색)

// line 모드일 때 좌표 추가 속도를 1.5배로 하기 위한 누적 변수
let extraStrokeAccumulator = 0;

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
  createCanvas(windowWidth, windowHeight);
  
  // 웹캠 캡쳐 생성 시, 비디오 크기를 캔버스 크기에 맞게 조정합니다.
  video = createCapture(VIDEO, { flipped: true }); // 거울 모드
  video.size(width, height);
  video.hide();

  handPose.detectStart(video, gotHands);

  noStroke();
  textSize(100);
  
  // 초기 색상을 설정합니다.
  lineColor = color(0, 255, 0, 150);   // 기존 녹색
  textColor = color(255, 0, 0);          // 기존 빨간색
}

// 손 데이터가 있을 때 strokes 배열을 업데이트합니다.
function updateStrokes() {
  if (hands && hands.length > 0 && isDrawingEnabled) {
    let hand = hands[0];
    // 손 데이터와 인덱스 팁 좌표가 있는지 확인
    if (hand && hand.index_finger_tip) {
      const indexPos = hand.index_finger_tip;
      
      // 기본 좌표 추가
      strokes.push({ x: indexPos.x, y: indexPos.y, mode: mode });
      
      // line 모드일 경우 추가로 좌표를 0.5회분 누적하여 평균 1.5회 추가하도록 함
      if (mode === "line") {
        extraStrokeAccumulator += 0.5;
        if (extraStrokeAccumulator >= 1) {
          strokes.push({ x: indexPos.x, y: indexPos.y, mode: mode });
          extraStrokeAccumulator -= 1;
        }
      }
      
      // 모드에 따라 최대 저장 좌표 수 제한 ("line": 최대 maxStrokes, 그 외: 1개)
      let currentMaxStrokes = (mode === "line") ? maxStrokes : 1;
      while (strokes.length > currentMaxStrokes) {
        strokes.shift(); // 오랜된 좌표 제거
      }
    }
  }
}

// 저장된 strokes 배열에 따라 드로잉합니다.
function renderStrokes() {
  for (let s of strokes) {
    if (s.mode === "line") {
      fill(lineColor);  // lineColor 사용
      ellipse(s.x, s.y, 30);
    } else if (s.mode === "text") {
      fill(textColor);  // textColor 사용
      text(drawText, s.x, s.y);
    } else if (s.mode === "image") {
      image(drawImg, s.x - 240, s.y - 240, 480, 480);
    }
  }
}

// 캔버스 하단에 현재 모드와 드로잉 ON/OFF 상태를 표시합니다.
function renderStatus() {
  fill(255);
  rect(0, height - 40, 300, 40);
  fill(0);
  text("Mode: " + mode, 10, height - 10);
  text("Draw: " + (isDrawingEnabled ? "ON" : "OFF"), 150, height - 10);
}

function draw() {
  // 웹캠 영상을 캔버스 전체에 그림
  image(video, 0, 0, width, height);
  
  updateStrokes();
  renderStrokes();
  renderStatus();
}

// 키보드 입력에 따라 모드를 전환하거나 드로잉 기능 및 색상을 토글합니다.
function keyPressed() {
  if (key === 'l' || key === 'L') {
    mode = "line";
  } else if (key === 't' || key === 'T') {
    mode = "text";
  } else if (key === 'i' || key === 'I') {
    mode = "image";
  } else if (key === 'z' || key === 'Z') {
    isDrawingEnabled = !isDrawingEnabled;
  } else if (key === 'c' || key === 'C') {
    // 'c' 버튼을 누르면 line, text 모드의 색상이 랜덤하게 변경됩니다.
    lineColor = color(random(255), random(255), random(255), 150);
    textColor = color(random(255), random(255), random(255));
  }
}