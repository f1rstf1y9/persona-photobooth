// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet using p5.js
=== */
/* eslint-disable */


// Grab elements, create settings, etc.
var isShooting = false;
var selected_emoji = '';
colors = ['#FFE56F', '#C6EBEB', '#9D86BE', '#FE8575', '#EEC3D9', '#AED6DF', '#BFCFDD']

const photo = document.querySelector(".photo-canvas");
const timer = document.querySelector(".timer");

var video = document.querySelector("#video");
var canvas = document.querySelector("#canvas");
var ctx = canvas.getContext("2d");


// The detected positions will be inside an array
let poses = [];
// Create a webcam capture
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
    video.srcObject = stream;
    video.play();
  });
}


//// 촬영할때마다 reset해줄 요소들
function resetScreen() {
  selected_emoji = '';
  $('.photo-canvas').hide();
  isShooting = false;
  emojis = document.querySelectorAll('.btn-emoji');
  emojis.forEach((element)=>{
    element.style.background = 'none';
  })
}


// A function to draw the video and poses into the canvas.
// This function is independent of the result of posenet
// This way the video will not seem slow if poseNet
// is not detecting a position
function drawCameraIntoCanvas() {
  // Draw the video element into the canvas
  ctx.drawImage(video, 0, 0, 640, 480);
  // We can call both functions to draw all keypoints and the skeletons
  window.requestAnimationFrame(drawCameraIntoCanvas);

  const _sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
  //// 얼굴 인식 & 촬영 가능 여부 판단 후 촬영 시작
  if (poses.length >= 1 && isShooting == false) {
    isShooting = true;
    $('.main-cam').show();
    const timecheck = async () => {
      await _sleep(1000);
      timer.style.display = 'block';
      timer.textContent = 3
      await _sleep(1000);
      timer.textContent = 2;
      await _sleep(1000);
      timer.textContent = 1;
      await _sleep(1000);
      timer.textContent = 0;
      photo.getContext('2d').drawImage(video, 0, 0, photo.width, photo.height);
      let image_data_url = photo.toDataURL('image/jpeg');
      $('.emoji-modal').fadeIn();
      $('.photo-canvas').show();

      //// 이모티콘 추가 대기
      await _sleep(1000);
      timer.textContent = 5;
      await _sleep(1000);
      timer.textContent = 4;
      await _sleep(1000);
      timer.textContent = 3;
      await _sleep(1000);
      timer.textContent = 2;
      await _sleep(1000);
      timer.textContent = 1;
      await _sleep(1000);
      timer.textContent = 0;

      var context = photo.getContext('2d');
      var imageObj = new Image();
      
      imageObj.onload = function() {
        context.drawImage(imageObj, 0, 0);
        context.font = "30px Calibri";
        context.fillText(`${selected_emoji}`, 250, 100);

        var dataURL = document.querySelector(".photo-canvas").toDataURL();
        console.log(dataURL);

        //// 새 창 만들기 & 추가
        const temp = document.createElement("div");
        temp.innerHTML = `<div class="window-top" style="background: ${ colors[Math.floor((Math.random() * 7))] }"></div>
                          <img src="${dataURL}" alt="">`
        temp.setAttribute(
          'style',
          `left: ${Math.floor(( Math.random() * (innerWidth-320)))}px; top: ${Math.floor(( Math.random() * (innerHeight-240)))}px;`,
        );
        document.querySelector(".windows").append(temp);

      }
      imageObj.src = image_data_url;

      //// 다음 촬영 준비
      $('.timer').hide();
      $('.emoji-modal').hide();
      $('.main-cam').hide();
      await _sleep(3000);
      resetScreen();
    };
    timecheck();
  }
}
// Loop over the drawCameraIntoCanvas function
drawCameraIntoCanvas();

// Create a new poseNet method with a single detection
const poseNet = ml5.poseNet(video, modelReady);
poseNet.on("pose", gotPoses);

// A function that gets called every time there's an update from the model
function gotPoses(results) {
  poses = results;
}

function modelReady() {
  console.log("model ready");
  poseNet.multiPose(video);
}


//// 이모지 선택 시 배열 추가 및 배경 어둡게
$('.btn-emoji').click(function(){
  selected_emoji += $(this).text();
  $(this).css('background', 'rgba(52, 52, 52, 0.7)');
});