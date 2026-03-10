(function(){

"use strict";

let speed = 2;

//////////////////////////////////////////////////
// PANEL
//////////////////////////////////////////////////

function createHub(){

if(document.getElementById("dvxHub")) return;

const panel=document.createElement("div");
panel.id="dvxHub";

panel.innerHTML=`

<div id="dvxHeader">Danhvux Hub</div>

<div class="dvxRow">
Tốc độ: <b id="dvxSpeedTxt">x2</b>
</div>

<input id="dvxSpeed" type="range" min="1" max="16" value="2">

<div id="dvxStatus">Đang quét bài học...</div>

<div id="dvxLessons"></div>

<div class="dvxBtns">
<button id="dvxScan">Quét lại</button>
<button id="dvxLogin">Auto Login</button>
</div>

<style>

#dvxHub{
position:fixed;
top:20px;
right:20px;
width:300px;
padding:16px;
border-radius:16px;
background:linear-gradient(180deg,#0b0d20,#0d1130);
color:white;
font-family:sans-serif;
z-index:999999;
border:2px solid #ff4fa3;
box-shadow:0 0 25px rgba(255,80,150,.6);
backdrop-filter:blur(10px);
}

#dvxHeader{
text-align:center;
font-size:22px;
font-weight:700;
margin-bottom:10px;
}

#dvxSpeed{
width:100%;
margin:6px 0 8px;
}

#dvxStatus{
background:#151938;
padding:8px;
border-radius:8px;
font-size:12px;
margin-bottom:6px;
}

#dvxLessons{
max-height:160px;
overflow:auto;
}

.dvxLesson{
background:#1f244f;
padding:6px;
border-radius:6px;
margin-bottom:4px;
cursor:pointer;
}

.dvxLesson:hover{
background:#2f3680;
}

.dvxBtns{
display:flex;
gap:6px;
margin-top:8px;
}

.dvxBtns button{
flex:1;
padding:8px;
border:none;
border-radius:8px;
cursor:pointer;
font-weight:600;
}

#dvxScan{background:#4da3ff;color:white;}
#dvxLogin{background:#8fd19e;color:white;}

</style>
`;

document.body.appendChild(panel);

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
