(function(){

"use strict";

let speed=2;

//////////////////////////
// PANEL UI
//////////////////////////

function createPanel(){

if(document.getElementById("dvxHub")) return;

const panel=document.createElement("div");
panel.id="dvxHub";

panel.innerHTML=`

<div class="dvxHeader">Danhvux Hub</div>

<div class="dvxRow">
Tốc độ video: <b id="dvxSpeedTxt">x2</b>
</div>

<input id="dvxSpeed" type="range" min="1" max="16" value="2">

<div id="dvxStatus">Đang quét bài học...</div>

<div class="dvxBtns">
<button id="dvxScan">Quét bài</button>
<button id="dvxAuto">Tự động vào bài</button>
<button id="dvxLogin">Auto Login</button>
</div>

<style>

#dvxHub{
position:fixed;
top:30px;
right:30px;
width:320px;
background:linear-gradient(145deg,#0f172a,#020617);
border-radius:18px;
padding:18px;
z-index:999999;
color:white;
font-family:sans-serif;
box-shadow:0 10px 30px rgba(0,0,0,.6);
}

.dvxHeader{
font-size:22px;
font-weight:bold;
text-align:center;
margin-bottom:10px;
}

.dvxRow{
margin-bottom:8px;
}

#dvxSpeed{
width:100%;
margin-bottom:10px;
}

#dvxStatus{
background:#111827;
padding:8px;
border-radius:8px;
margin-bottom:10px;
font-size:13px;
}

.dvxBtns{
display:flex;
flex-direction:column;
gap:6px;
}

.dvxBtns button{
padding:8px;
border:none;
border-radius:10px;
background:#22c55e;
color:white;
cursor:pointer;
font-weight:bold;
}

</style>
`;

document.body.appendChild(panel);

//////////////////////////
// SPEED
//////////////////////////

document.getElementById("dvxSpeed").oninput=e=>{

speed=e.target.value;
document.getElementById("dvxSpeedTxt").innerText="x"+speed;

const video=document.querySelector("video");
if(video) video.playbackRate=speed;

};

//////////////////////////
// BUTTONS
//////////////////////////

document.getElementById("dvxScan").onclick=scanLessons;
document.getElementById("dvxAuto").onclick=openUnfinished;
document.getElementById("dvxLogin").onclick=autoLogin;

}

//////////////////////////
// SCAN LESSON
//////////////////////////

function scanLessons(){

const status=document.getElementById("dvxStatus");

status.innerText="Đang quét bài...";

const lessons=[...document.querySelectorAll(".courseware-item,.lesson-item")];

let list=[];

lessons.forEach(el=>{

const text=el.innerText;

if(!text.includes("100%")){

list.push(el);

}

});

window.dvxLessons=list;

status.innerText="Tìm thấy "+list.length+" bài chưa học";

}

//////////////////////////
// AUTO OPEN
//////////////////////////

function openUnfinished(){

if(!window.dvxLessons || !window.dvxLessons.length){

scanLessons();

}

if(window.dvxLessons[0]){

window.dvxLessons[0].click();

}

}

//////////////////////////
// AUTO LOGIN
//////////////////////////

function autoLogin(){

const user=document.querySelector("input[type=text]");
const pass=document.querySelector("input[type=password]");
const btn=document.querySelector("button");

if(user && pass){

user.value=localStorage.dvxUser||"";
pass.value=localStorage.dvxPass||"";

if(btn) btn.click();

}

}

//////////////////////////
// VIDEO SPEED LOOP
//////////////////////////

setInterval(()=>{

const video=document.querySelector("video");

if(video){

video.playbackRate=speed;

}

},1000);

//////////////////////////

window.addEventListener("load",()=>{

setTimeout(createPanel,1500);

});

})();
