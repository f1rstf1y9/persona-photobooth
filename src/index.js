// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet using p5.js
=== */
/* eslint-disable */

import { createPicker } from "picmo";
const rootElement = document.querySelector('#picker-container');

// Create the picker
const picker = createPicker({ rootElement });

// Grab elements, create settings, etc.
var isShooting = false;
var selected_emoji = '';
var selected_emoji_length = 0;
var colors = ['#FFE56F', '#C6EBEB', '#9D86BE', '#FE8575', '#EEC3D9', '#AED6DF', '#BFCFDD']

const photo = document.querySelector(".photo-canvas");
const timer = document.querySelector(".timer");

var video = document.querySelector("#video");
var canvas = document.querySelector("#canvas");
var ctx = canvas.getContext("2d");

let current_pose;
let poseX, poseY;
let w;

// The detected positions will be inside an array
let poses = [];
// Create a webcam capture
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
    video.srcObject = stream;
    video.play();
  });
}

function dist(x1, x2, y1, y2) {
  var a = x1 - x2;
  var b = y1 - y2;
  return Math.sqrt( a*a + b*b );
}

//// 촬영할때마다 reset해줄 요소들
function resetScreen() {
  selected_emoji = '';
  selected_emoji_length = 0;
  $('.Emoji_emoji__iKc1G').css('background-color', '#fff');
  $('.photo-canvas').hide();
  isShooting = false;
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
  if (poses.length == 1 && isShooting == false) {
    isShooting = true;
    $('.main-cam').show();
    const timecheck = async () => {
      for (let i = 3; i != 0; i--) {
        await _sleep(1000);
        timer.textContent = i;
        timer.style.display = 'block';
      }
      photo.getContext('2d').drawImage(video, 0, 0, photo.width, photo.height);
      
      if (poses.length == 0) {
        $('.error').show();
        //// 다음 촬영 준비
        $('.timer').hide();
        await _sleep(3000);
        $('.main-cam').hide();
        $('.error').hide();
        resetScreen();
        
      } else {
        current_pose = poses[0].pose;
        poseX = (current_pose.leftEye.x + current_pose.rightEye.x)/2;
        poseY = (current_pose.leftEye.y + current_pose.rightEye.y)/2;
        w = dist(current_pose.leftEar.x,current_pose.leftEar.y,current_pose.rightEar.x,current_pose.rightEar.y);
        let image_data_url = photo.toDataURL('image/jpeg');
        $('.emoji-picker').fadeIn();
        $('.photo-canvas').show();

        // 이모티콘 추가 대기
        for (let i = 10; i != 0; i--) {
          await _sleep(1000);
          timer.textContent = i;
          timer.style.display = 'block';
        }

        var context = photo.getContext('2d');
        var imageObj = new Image();
        
        // 이모티콘 붙이기
        imageObj.onload = function() {
          context.textAlign = "center";
          context.drawImage(imageObj, 0, 0);
          context.font = `${w*8/19}px Calibri`;
          context.fillText(`${selected_emoji}`, poseX, poseY - w/1.4);
          console.log(w/8, poseX, poseY);
          var dataURL = document.querySelector(".photo-canvas").toDataURL();

          //// 새 창 만들기 & 추가
          const temp = document.createElement("div");
          let n = Math.floor((Math.random() * 2))
          temp.innerHTML = `<div class="sub-win-${n}">
                              <div class="window-top">
                                <img src="src/img/sub-win_btn_${n}.svg" alt="">
                              </div>
                              <div class="window-btm">
                                <img src="${dataURL}" alt="">
                                <img src="src/img/sub-win_scroll_${n}.svg" alt="">
                              </div>
                            </div>`
          temp.setAttribute(
            'style',
            `left: ${Math.floor(( Math.random() * (innerWidth-320)))}px; top: ${Math.floor(( Math.random() * (innerHeight-240)))}px;`,
          );
          document.querySelector(".windows").append(temp);

        }
        imageObj.src = image_data_url;

        //// 다음 촬영 준비
        $('.timer').hide();
        $('.main-cam').hide();
        $('.emoji-picker').hide();
        await _sleep(3000);
        resetScreen();
      }
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


//// 이모지 선택 이벤트
picker.addEventListener('emoji:select', event => {
  if (selected_emoji_length < 4 && selected_emoji.includes(event.emoji) == false) {
    selected_emoji += event.emoji;
    selected_emoji_length += 1;
    console.log(selected_emoji, selected_emoji_length);
    $((`[data-emoji$=${event.emoji}]`)).css('border-radius', '0');
    $((`[data-emoji$=${event.emoji}]`)).css('background-color', '#E8569A');
  }
});
