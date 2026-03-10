(function(){
'use strict';

//////////////////////////////////////////////////
// CONFIG
//////////////////////////////////////////////////

let currentSpeed = 2;
let welcomePlayed = false;

const accounts = [
{
u:"NHAP_TEN_VAO_DAY",
p:"NHAP_MAT_KHAU_VAO_DAY"
}
];

//////////////////////////////////////////////////
// SPEED LOCK MAX x20
//////////////////////////////////////////////////

(function(){

const d =
Object.getOwnPropertyDescriptor(
HTMLMediaElement.prototype,
"playbackRate"
);

if(!d) return;

Object.defineProperty(
HTMLMediaElement.prototype,
"playbackRate",
{
get(){return d.get.call(this);},
set(v){

if(v>20) v=20;

d.set.call(this,v);

}
}
);

})();

//////////////////////////////////////////////////
// AUTO LOGIN
//////////////////////////////////////////////////

function deepFill(el,value){

if(!el) return;

el.focus();
el.value=value;

[
'focus',
'keydown',
'keypress',
'input',
'keyup',
'change',
'blur'
].forEach(t=>{
el.dispatchEvent(
new Event(t,{bubbles:true})
);
});

}

function autoLogin(){

const user =
document.querySelector(
'input[type="text"],input[name="username"],#username'
);

const pass =
document.querySelector(
'input[type="password"],#password'
);

const btn =
document.querySelector(
'button[type="submit"],.btn-login'
);

if(!user || !pass) return;

const acc = accounts[0];

deepFill(user,acc.u);
deepFill(pass,acc.p);

setTimeout(()=>{
btn?.click();
},500);

}

//////////////////////////////////////////////////
// WELCOME TICKER
//////////////////////////////////////////////////

let tickerRunning=false;

function welcomeTicker(){

if(welcomePlayed) return;

const box=document.getElementById("jumpBox");
if(!box) return;

welcomePlayed=true;
tickerRunning=true;

const old=box.innerHTML;

box.innerHTML=`
<div style="overflow:hidden;height:20px;">
<div id="tickerText"
style="
white-space:nowrap;
font-weight:bold;
color:#a6e3a1;">
👋 CHÀO MỪNG BẠN ĐẾN VỚI DANHVUX HUB
</div>
</div>
`;

const text=document.getElementById("tickerText");

let pos=280;

function move(){

pos--;

text.style.transform=`translateX(${pos}px)`;

if(pos>-text.scrollWidth){

requestAnimationFrame(move);

}else{

setTimeout(()=>{

box.innerHTML=old;
tickerRunning=false;

},400);

}

}

move();

}

//////////////////////////////////////////////////
// PANEL UI
//////////////////////////////////////////////////

function createPanel(){

if(document.getElementById("danhvux-panel")) return;

const html = `
<div id="danhvux-panel" style="
position:fixed;
top:15px;
right:15px;
width:280px;
background:#11111b;
color:#cdd6f4;
border:2px solid #f5e0dc;
border-radius:12px;
padding:15px;
z-index:999999;
font-family:sans-serif;
box-shadow:0 10px 40px rgba(0,0,0,.8);
">

<h3 style="
margin:0;
text-align:center;
color:#f5e0dc;
border-bottom:1px solid #45475a;
padding-bottom:6px;">
Danhvux Panel
</h3>

<div style="margin-top:12px;font-size:12px;">
Tốc độ: <b id="speedTxt" style="color:#a6e3a1;">x2</b>
</div>

<input id="speedRange"
type="range"
min="1"
max="20"
value="2"
step="1"
style="width:100%;margin-top:6px;">

<div id="jumpBox" style="
margin-top:15px;
background:#181825;
border:1px solid #313244;
padding:8px;
border-radius:8px;
font-size:10px;
max-height:120px;
overflow:auto;">
Đang quét bài chưa làm...
</div>

<button id="loginBtn" style="
margin-top:10px;
width:100%;
padding:10px;
background:#f5c2e7;
color:#111;
border:none;
border-radius:8px;
font-weight:bold;
cursor:pointer;">
AUTO LOGIN
</button>

<button id="scanBtn" style="
margin-top:6px;
width:100%;
padding:10px;
background:#a6e3a1;
color:#111;
border:none;
border-radius:8px;
font-weight:bold;
cursor:pointer;">
QUÉT BÀI
</button>

<div style="
margin-top:8px;
font-size:9px;
text-align:center;
color:#6c7086;">
Nhấn H để ẩn / hiện panel
</div>

</div>
`;

document.body.insertAdjacentHTML("beforeend",html);

initPanel();

setTimeout(welcomeTicker,600);

}

//////////////////////////////////////////////////
// PANEL EVENTS
//////////////////////////////////////////////////

function initPanel(){

const range=document.getElementById("speedRange");

range.oninput=(e)=>{

currentSpeed=parseFloat(e.target.value);

document.getElementById("speedTxt").innerText="x"+currentSpeed;

const v=document.querySelector("video");
if(v) v.playbackRate=currentSpeed;

};

document.getElementById("loginBtn").onclick=autoLogin;

document.getElementById("scanBtn").onclick=scanLessons;

}

//////////////////////////////////////////////////
// SCAN LESSON
//////////////////////////////////////////////////

function scanLessons(){

const box=document.getElementById("jumpBox");

if(!box) return;

box.innerHTML="";

let found=0;

document.querySelectorAll("a,div,span").forEach(el=>{

const txt=el.innerText||"";

if(
txt.includes("Chưa làm")||
txt.includes("chưa làm")||
txt.includes("Incomplete")
){

found++;

const line=document.createElement("div");

line.textContent="• "+txt.trim();
line.style.color="#f38ba8";

box.appendChild(line);

}

});

if(found===0){

box.innerHTML="<span style='color:#a6e3a1'>✔ Không phát hiện bài thiếu</span>";

}

}

//////////////////////////////////////////////////
// VIDEO LOOP
//////////////////////////////////////////////////

function videoLoop(){

const v=document.querySelector("video");

if(!v) return;

v.muted=true;

if(v.playbackRate!==currentSpeed)
v.playbackRate=currentSpeed;

if(v.ended){

const next =
document.querySelector(".btn-next") ||
document.querySelector(".next-lesson") ||
document.querySelector(".next-item");

next?.click();

}

}

//////////////////////////////////////////////////
// HOTKEY
//////////////////////////////////////////////////

window.addEventListener("keydown",(e)=>{

if(e.key.toLowerCase()==="h"){

const p=document.getElementById("danhvux-panel");

if(!p) return;

p.style.display =
p.style.display==="none"
? "block":"none";

}

});

//////////////////////////////////////////////////
// START
//////////////////////////////////////////////////

function start(){

createPanel();

setInterval(videoLoop,1000);

setTimeout(scanLessons,2000);

setTimeout(autoLogin,1500);

}

if(document.readyState==="loading"){
document.addEventListener("DOMContentLoaded",start);
}else{
start();
}

})();
