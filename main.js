(function(){
"use strict";

let speed = 2;

//////////////////////////////////////////////////////
// TẠO HUB
//////////////////////////////////////////////////////

function createHub(){

if(document.getElementById("danhvuxHub")) return;

const hub = document.createElement("div");

hub.id="danhvuxHub";

hub.style=`
position:fixed;
top:20px;
right:20px;
width:300px;
background:#0b0d1a;
border-radius:14px;
padding:16px;
color:white;
z-index:999999;
border:2px solid #ff4f87;
font-family:sans-serif;
box-shadow:0 15px 40px rgba(0,0,0,.6)
`;

hub.innerHTML=`

<h2 style="text-align:center;margin:0 0 10px 0">
Danhvux Hub
</h2>

<div style="font-size:13px;margin-bottom:4px">
Tốc độ: <b id="spdTxt">x2</b>
</div>

<input id="spdSlider" type="range" min="1" max="16" value="2"
style="width:100%">

<div id="scanBox" style="
margin-top:10px;
background:#141627;
padding:8px;
border-radius:8px;
max-height:160px;
overflow:auto;
font-size:12px
">
Đang quét bài học...
</div>

<button id="autoLogin" style="
margin-top:10px;
width:100%;
padding:10px;
background:#9bd39b;
border:none;
border-radius:8px;
font-weight:bold;
cursor:pointer
">
TỰ ĐỘNG ĐĂNG NHẬP
</button>
`;

document.body.appendChild(hub);

//////////////////////////////////////////////////////
// SPEED
//////////////////////////////////////////////////////

document.getElementById("spdSlider").oninput=e=>{

speed=parseInt(e.target.value);

document.getElementById("spdTxt").innerText="x"+speed;

let v=document.querySelector("video");
if(v) v.playbackRate=speed;

};

}

//////////////////////////////////////////////////////
// QUÉT BÀI
//////////////////////////////////////////////////////

function scanLessons(){

let box=document.getElementById("scanBox");
if(!box) return;

let items=[...document.querySelectorAll(".ant-tree-node-content-wrapper")];

let lessons=[];

items.forEach(el=>{

let text=el.innerText.trim();

let m=text.match(/\((\d+)%\)/);

if(!m) return;

let percent=parseInt(m[1]);

if(percent>=100) return;

let name=text.replace(/\(\d+%\)/,"").trim();

lessons.push({
name,
percent,
el
});

});

//////////////////////////////////////////////////////
// HIỂN THỊ
//////////////////////////////////////////////////////

if(lessons.length===0){

box.innerHTML="✔ Không còn bài chưa học";

return;

}

box.innerHTML="";

lessons.forEach(ls=>{

let div=document.createElement("div");

div.style=`
padding:6px;
margin-bottom:4px;
background:#2b2f4a;
border-radius:6px;
cursor:pointer
`;

div.innerText=`⚡ ${ls.name} (${ls.percent}%)`;

div.onclick=()=>{
ls.el.click();
};

box.appendChild(div);

});

}

//////////////////////////////////////////////////////
// VIDEO AUTO
//////////////////////////////////////////////////////

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

//////////////////////////////////////////////////////
// AUTO LOGIN
//////////////////////////////////////////////////////

function autoLogin(){

let user=document.querySelector("input[type=text],input[type=email]");
let pass=document.querySelector("input[type=password]");

if(!user || !pass) return;

user.value="USERNAME";
pass.value="PASSWORD";

user.dispatchEvent(new Event("input",{bubbles:true}));
pass.dispatchEvent(new Event("input",{bubbles:true}));

setTimeout(()=>{
document.querySelector("button[type=submit]")?.click();
},500);

}

//////////////////////////////////////////////////////
// START
//////////////////////////////////////////////////////

function start(){

createHub();

setTimeout(()=>{

scanLessons();

setInterval(scanLessons,4000);

setInterval(videoLoop,1000);

},2000);

}

if(document.readyState==="loading")
document.addEventListener("DOMContentLoaded",start);
else
start();

//////////////////////////////////////////////////////
// HOTKEY
//////////////////////////////////////////////////////

window.addEventListener("keydown",e=>{

if(e.key.toLowerCase()==="h"){

let hub=document.getElementById("danhvuxHub");

hub.style.display=
hub.style.display==="none"
?"block":"none";

}

});

})();
