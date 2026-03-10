```javascript
// ==UserScript==
// @name         Danhvux Hub Full
// @match        https://*.k12online.vn/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function(){
'use strict';

//////////////////////////////////////////////////
// CONFIG
//////////////////////////////////////////////////

let currentSpeed=2;

const accounts=[
{u:"NHAP_TEN_VAO_DAY",p:"NHAP_MAT_KHAU_VAO_DAY"}
];

//////////////////////////////////////////////////
// LOGIN
//////////////////////////////////////////////////

function deepFill(el,value){

el.focus();
el.value=value;

['focus','keydown','keypress','input','keyup','change','blur']
.forEach(e=>{
el.dispatchEvent(new Event(e,{bubbles:true}));
});

}

function autoLogin(){

const inputs=document.querySelectorAll("input");

let user,password;

inputs.forEach(i=>{

const t=i.type?.toLowerCase();

if(t==="password") password=i;

if(t==="text"||t==="email"){
if(!user) user=i;
}

});

if(user&&password){

deepFill(user,accounts[0].u);

setTimeout(()=>{

deepFill(password,accounts[0].p);

setTimeout(()=>{

document
.querySelector("button[type=submit]")?.click();

},400);

},400);

}

}

//////////////////////////////////////////////////
// PANEL
//////////////////////////////////////////////////

function createHub(){

if(document.getElementById("danhvuxHub")) return;

const html=`

<div id="danhvuxHub" style="
position:fixed;
top:10px;
right:10px;
z-index:999999;
background:#11111b;
color:#cdd6f4;
padding:15px;
border-radius:12px;
border:2px solid #f5e0dc;
width:280px;
font-family:sans-serif;
box-shadow:0 10px 40px rgba(0,0,0,0.8);
">

<h3 style="margin:0;text-align:center;color:#f5e0dc;">
Danhvux Hub
</h3>

<div style="margin-top:10px;font-size:12px;">
Speed: <b id="spdTxt">x2</b>
</div>

<input id="spdRange"
type="range"
min="1"
max="20"
value="2"
style="width:100%;margin-top:5px;">

<div id="jumpBox" style="
margin-top:15px;
font-size:11px;
background:#181825;
padding:8px;
border-radius:8px;
border:1px solid #313244;
max-height:120px;
overflow-y:auto;
">
Đang khởi động hub...
</div>

<button id="btnLogin" style="
margin-top:10px;
width:100%;
background:#a6e3a1;
border:none;
padding:10px;
border-radius:8px;
cursor:pointer;
font-weight:bold;
">
AUTO LOGIN
</button>

<div style="
margin-top:8px;
font-size:9px;
text-align:center;
color:#585b70;
">
Phím H để ẩn/hiện
</div>

</div>
`;

document.body.insertAdjacentHTML("beforeend",html);

//////////////////////////////////////////////////
// SPEED CONTROL
//////////////////////////////////////////////////

const range=document.getElementById("spdRange");

range.oninput=e=>{

currentSpeed=parseInt(e.target.value);

document.getElementById("spdTxt").innerText="x"+currentSpeed;

const v=document.querySelector("video");

if(v) v.playbackRate=currentSpeed;

};

document.getElementById("btnLogin").onclick=autoLogin;

}

//////////////////////////////////////////////////
// TYPEWRITER LOG SYSTEM
//////////////////////////////////////////////////

let logQueue=[];
let logRunning=false;

function hubLog(text,color){

logQueue.push({text,color});

if(!logRunning) runLog();

}

function runLog(){

if(logQueue.length===0){

logRunning=false;
return;

}

logRunning=true;

const item=logQueue.shift();

const box=document.getElementById("jumpBox");

const line=document.createElement("div");

if(item.color) line.style.color=item.color;

box.appendChild(line);

let i=0;

function type(){

if(i<item.text.length){

line.textContent+=item.text[i];
i++;

box.scrollTop=box.scrollHeight;

setTimeout(type,20);

}else{

setTimeout(runLog,400);

}

}

type();

}

//////////////////////////////////////////////////
// WELCOME LOG
//////////////////////////////////////////////////

function welcomeLogs(){

hubLog("⚡ Danhvux Hub đang khởi động...","#a6e3a1");

setTimeout(()=>{
hubLog("🔍 Đang quét hệ thống bài học...");
},700);

setTimeout(()=>{
hubLog("🎬 Kiểm tra video...");
},1400);

setTimeout(()=>{
hubLog("📊 Chuẩn bị dữ liệu...");
},2000);

setTimeout(()=>{
hubLog("🚀 Hub sẵn sàng","#a6e3a1");
},2600);

}

//////////////////////////////////////////////////
// SCAN LESSONS <100%
//////////////////////////////////////////////////

function scanLessons(){

let lessons=[];

document
.querySelectorAll("a,div,span,tr,li")
.forEach(el=>{

const txt=(el.innerText||"").trim();

if(!txt.includes("%")) return;

const m=txt.match(/(\d+)%/);

if(!m) return;

const percent=parseInt(m[1]);

if(percent<100){

const link=
el.querySelector("a")?.href ||
el.getAttribute("href");

const title=txt.split("\n")[0].trim();

lessons.push({title,percent,link,el});

}

});

const unique=[
...new Map(lessons.map(x=>[x.title,x])).values()
];

if(unique.length===0){

hubLog("✔ Không phát hiện bài chưa học","#a6e3a1");
return;

}

hubLog("⚠ Phát hiện "+unique.length+" bài chưa học","#f38ba8");

unique.forEach(item=>{

hubLog("• "+item.title+" ("+item.percent+"%)","#f38ba8");

});

}

//////////////////////////////////////////////////
// VIDEO LOOP
//////////////////////////////////////////////////

function videoLoop(){

const v=document.querySelector("video");

if(v){

v.muted=true;

if(v.playbackRate!==currentSpeed)
v.playbackRate=currentSpeed;

if(v.ended)
document.querySelector(".btn-next,.next-lesson,.next-item")?.click();

}

}

//////////////////////////////////////////////////
// START
//////////////////////////////////////////////////

function start(){

createHub();

setTimeout(()=>{

welcomeLogs();

setTimeout(()=>{

scanLessons();

setInterval(scanLessons,5000);

setInterval(videoLoop,1000);

},3500);

},800);

setTimeout(autoLogin,2500);

}

if(document.readyState==="loading"){
document.addEventListener("DOMContentLoaded",start);
}else{
start();
}

//////////////////////////////////////////////////
// HOTKEY
//////////////////////////////////////////////////

window.addEventListener("keydown",e=>{

if(e.key.toLowerCase()==="h"){

const p=document.getElementById("danhvuxHub");

if(p)
p.style.display=
p.style.display==="none"?"block":"none";

}

});

})();
```
