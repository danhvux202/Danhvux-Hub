(function(){
"use strict";

let speed = 2;

//////////////////////////////////////////////////////
// TẠO PANEL
//////////////////////////////////////////////////////

function createHub(){

if(document.getElementById("danhvuxHub")) return;

const hub=document.createElement("div");
hub.id="danhvuxHub";

hub.innerHTML=`

<div id="dvx-panel">

<div class="dvx-title">Danhvux Hub</div>

<div class="dvx-speed">
Tốc độ video: <span id="dvx-speed-text">x2</span>
</div>

<input id="dvx-speed" type="range" min="1" max="16" value="2">

<div class="dvx-stats">
Bài chưa học: <b id="dvx-count">0</b>
</div>

<div id="dvx-lessons">
Đang quét bài học...
</div>

<div class="dvx-buttons">
<button id="dvx-scan">Quét lại</button>
<button id="dvx-hide">Ẩn</button>
</div>

</div>

<style>

#dvx-panel{
position:fixed;
top:20px;
right:20px;
width:300px;
padding:18px;
border-radius:14px;
backdrop-filter:blur(10px);
background:rgba(10,12,30,.85);
color:white;
font-family:sans-serif;
z-index:999999;
border:2px solid #ff4fa3;
box-shadow:0 0 20px rgba(255,80,160,.6);
}

.dvx-title{
text-align:center;
font-size:20px;
font-weight:700;
margin-bottom:10px;
}

.dvx-speed{
font-size:13px;
margin-bottom:4px;
}

#dvx-speed{
width:100%;
margin-bottom:8px;
}

.dvx-stats{
font-size:12px;
margin-bottom:6px;
color:#ddd;
}

#dvx-lessons{
background:#12152d;
padding:8px;
border-radius:8px;
max-height:170px;
overflow:auto;
font-size:12px;
}

.dvx-lesson{
padding:6px;
margin-bottom:4px;
background:#1e2247;
border-radius:6px;
cursor:pointer;
transition:.2s;
}

.dvx-lesson:hover{
background:#2e3470;
}

.dvx-buttons{
display:flex;
gap:6px;
margin-top:10px;
}

.dvx-buttons button{
flex:1;
padding:8px;
border:none;
border-radius:8px;
cursor:pointer;
font-weight:600;
}

#dvx-scan{
background:#6ea8ff;
color:white;
}

#dvx-hide{
background:#ff6b8a;
color:white;
}

</style>
`;

document.body.appendChild(hub);

//////////////////////////////////////////////////////
// SPEED CONTROL
//////////////////////////////////////////////////////

document.getElementById("dvx-speed").oninput=e=>{

speed=parseInt(e.target.value);

document.getElementById("dvx-speed-text").innerText="x"+speed;

let v=document.querySelector("video");
if(v) v.playbackRate=speed;

};

//////////////////////////////////////////////////////
// BUTTONS
//////////////////////////////////////////////////////

document.getElementById("dvx-scan").onclick=scanLessons;

document.getElementById("dvx-hide").onclick=()=>{
document.getElementById("dvx-panel").style.display="none";
};

}

//////////////////////////////////////////////////////
// QUÉT BÀI
//////////////////////////////////////////////////////

function scanLessons(){

const box=document.getElementById("dvx-lessons");
const count=document.getElementById("dvx-count");

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

lessons.push({
name,
percent,
el
});

});

count.innerText=lessons.length;

if(lessons.length===0){

box.innerHTML="✔ Tất cả bài đã hoàn thành";

return;

}

box.innerHTML="";

lessons.forEach(ls=>{

let div=document.createElement("div");

div.className="dvx-lesson";

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
// START
//////////////////////////////////////////////////////

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

//////////////////////////////////////////////////////
// HOTKEY
//////////////////////////////////////////////////////

window.addEventListener("keydown",e=>{

if(e.key.toLowerCase()==="h"){

let panel=document.getElementById("dvx-panel");

panel.style.display=
panel.style.display==="none"
?"block":"none";

}

});

})();
