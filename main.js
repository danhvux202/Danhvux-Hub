(function(){

"use strict";

let speed = 2;

//////////////////////////////////////////////////
// PANEL
//////////////////////////////////////////////////

panel.innerHTML = `
<div class="dvx-card">

<div class="dvx-title">
⚡ Danhvux Hub
</div>

<div class="dvx-section">
<div class="dvx-label">Tốc độ video</div>

<div class="dvx-speed">
<input id="dvxSpeed" type="range" min="1" max="16" value="2">
<span id="dvxSpeedTxt">x2</span>
</div>
</div>

<div class="dvx-section">

<div class="dvx-status" id="dvxStatus">
<div class="dvx-loader"></div>
<span>Đang quét bài học...</span>
</div>

<div id="dvxLessons"></div>

</div>

<div class="dvx-buttons">

<button id="dvxScan">🔍 Quét lại</button>

<button id="dvxLogin">🔐 Auto Login</button>

</div>

</div>

<style>

#dvxHub{
position:fixed;
top:30px;
right:30px;
z-index:999999;
}

.dvx-card{

width:320px;
padding:20px;

border-radius:18px;

background:rgba(15,18,45,0.85);

backdrop-filter:blur(12px);

border:1px solid rgba(255,255,255,0.1);

box-shadow:
0 0 40px rgba(255,0,120,0.35),
0 0 10px rgba(255,0,120,0.2);

font-family:Segoe UI;
color:white;

animation:dvxPop .4s ease;

}

@keyframes dvxPop{
from{transform:scale(.9);opacity:0}
to{transform:scale(1);opacity:1}
}

.dvx-title{

font-size:22px;
font-weight:700;

text-align:center;

margin-bottom:16px;

background:linear-gradient(90deg,#ff4fa3,#6ea8ff);
-webkit-background-clip:text;
color:transparent;

}

.dvx-section{
margin-bottom:14px;
}

.dvx-label{
font-size:13px;
opacity:.8;
margin-bottom:6px;
}

.dvx-speed{
display:flex;
align-items:center;
gap:8px;
}

.dvx-speed input{
flex:1;
}

.dvx-status{

display:flex;
align-items:center;
gap:8px;

background:#11153a;

padding:8px;

border-radius:8px;

font-size:13px;

}

.dvx-loader{

width:14px;
height:14px;

border:2px solid #444;
border-top:2px solid #ff4fa3;

border-radius:50%;

animation:spin .8s linear infinite;

}

@keyframes spin{
to{transform:rotate(360deg)}
}

#dvxLessons{

max-height:160px;

overflow:auto;

margin-top:8px;

}

.dvxLesson{

padding:6px;

background:#1b2055;

border-radius:6px;

margin-bottom:4px;

cursor:pointer;

transition:.2s;

}

.dvxLesson:hover{
background:#2e36a3;
}

.dvx-buttons{

display:flex;
gap:8px;
margin-top:10px;

}

.dvx-buttons button{

flex:1;

border:none;

border-radius:10px;

padding:9px;

font-weight:600;

cursor:pointer;

transition:.2s;

}

#dvxScan{

background:linear-gradient(90deg,#4da3ff,#6ea8ff);
color:white;

}

#dvxLogin{

background:linear-gradient(90deg,#ff5d7a,#ff7aa2);
color:white;

}

button:hover{
transform:scale(1.05);
}

</style>
`;

//////////////////////////////////////////////////
// DRAG PANEL
//////////////////////////////////////////////////

let isDown=false,offX,offY;

panel.onmousedown=e=>{
isDown=true;
offX=e.offsetX;
offY=e.offsetY;
};

document.onmouseup=()=>isDown=false;

document.onmousemove=e=>{
if(!isDown) return;
panel.style.left=e.pageX-offX+"px";
panel.style.top=e.pageY-offY+"px";
};

//////////////////////////////////////////////////
// SPEED
//////////////////////////////////////////////////

document.getElementById("dvxSpeed").oninput=e=>{

speed=parseInt(e.target.value);

document.getElementById("dvxSpeedTxt").innerText="x"+speed;

let v=document.querySelector("video");
if(v) v.playbackRate=speed;

};

document.getElementById("dvxScan").onclick=scanLessons;

document.getElementById("dvxLogin").onclick=autoLogin;

}

//////////////////////////////////////////////////
// AUTO LOGIN
//////////////////////////////////////////////////

function autoLogin(){

let u=document.querySelector("input[type=text],input[type=email]");
let p=document.querySelector("input[type=password]");

if(!u || !p) return;

u.value="USERNAME";
p.value="PASSWORD";

u.dispatchEvent(new Event("input",{bubbles:true}));
p.dispatchEvent(new Event("input",{bubbles:true}));

setTimeout(()=>{
document.querySelector("button[type=submit]")?.click();
},500);

}

//////////////////////////////////////////////////
// SCAN LESSONS
//////////////////////////////////////////////////

function scanLessons(){

const box=document.getElementById("dvxLessons");
const status=document.getElementById("dvxStatus");

if(!box) return;

let nodes=[...document.querySelectorAll(".ant-tree-node-content-wrapper")];

let lessons=[];

nodes.forEach(el=>{

let text=el.innerText.trim();

let m=text.match(/\((\d+)%\)/);
if(!m) return;

let percent=parseInt(m[1]);

if(percent>=100) return;

let name=text.replace(/\(\d+%\)/,"").trim();

lessons.push({name,percent,el});

});

box.innerHTML="";

if(!lessons.length){

status.innerText="✔ Tất cả bài đã hoàn thành";

return;

}

status.innerText="Bài chưa học: "+lessons.length;

lessons.forEach(ls=>{

let div=document.createElement("div");

div.className="dvxLesson";

div.innerText=`⚡ ${ls.name} (${ls.percent}%)`;

div.onclick=()=>ls.el.click();

box.appendChild(div);

});

}

//////////////////////////////////////////////////
// VIDEO AUTO
//////////////////////////////////////////////////

function videoLoop(){

let v=document.querySelector("video");

if(!v) return;

v.muted=true;

if(v.playbackRate!==speed)
v.playbackRate=speed;

if(v.ended){

let next=document.querySelector(
".btn-next,.next-item,.ant-btn-primary"
);

if(next) next.click();

}

}

//////////////////////////////////////////////////
// START
//////////////////////////////////////////////////

function start(){

createHub();

setTimeout(()=>{

scanLessons();

setInterval(scanLessons,5000);

setInterval(videoLoop,1000);

},2000);

}

if(document.readyState==="loading")
document.addEventListener("DOMContentLoaded",start);
else
start();

//////////////////////////////////////////////////
// HOTKEY
//////////////////////////////////////////////////

window.addEventListener("keydown",e=>{

if(e.key.toLowerCase()==="h"){

let hub=document.getElementById("dvxHub");

hub.style.display=
hub.style.display==="none"
?"block":"none";

}

});

})();
