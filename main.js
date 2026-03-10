(function(){
'use strict';

let currentSpeed = 2;

//////////////////////////////////////////////////
// ACCOUNT
//////////////////////////////////////////////////

const accounts = [
{u:"USERNAME",p:"PASSWORD"}
];

//////////////////////////////////////////////////
// AUTO LOGIN
//////////////////////////////////////////////////

function fill(el,val){
if(!el) return;

el.focus();
el.value = val;

["input","change","keyup"].forEach(e=>{
el.dispatchEvent(new Event(e,{bubbles:true}));
});
}

function autoLogin(){

const user=document.querySelector("input[type=text],input[type=email]");
const pass=document.querySelector("input[type=password]");

if(user && pass){

fill(user,accounts[0].u);

setTimeout(()=>{

fill(pass,accounts[0].p);

setTimeout(()=>{
document.querySelector("button[type=submit]")?.click();
},500);

},500);

}

}

//////////////////////////////////////////////////
// UI HUB
//////////////////////////////////////////////////

function createHub(){

if(document.getElementById("danhvuxHub")) return;

const html=`

<div id="danhvuxHub" style="
position:fixed;
top:10px;
right:10px;
width:300px;
background:#0f0f1a;
border-radius:12px;
padding:12px;
color:white;
z-index:999999;
border:2px solid #f38ba8;
font-family:sans-serif;
box-shadow:0 10px 40px rgba(0,0,0,.6);
">

<h3 style="margin:0;text-align:center">Danhvux Hub</h3>

<div style="font-size:12px;margin-top:8px">
Speed: <b id="spdTxt">x2</b>
</div>

<input id="spdRange" type="range" min="1" max="20" value="2" style="width:100%">

<div id="jumpBox" style="
margin-top:10px;
background:#181825;
padding:8px;
border-radius:8px;
font-size:11px;
max-height:160px;
overflow:auto">
Scanning lessons...
</div>

<button id="btnLogin" style="
margin-top:8px;
width:100%;
padding:10px;
background:#a6e3a1;
border:none;
border-radius:8px;
font-weight:bold;
cursor:pointer">
AUTO LOGIN
</button>

</div>
`;

document.body.insertAdjacentHTML("beforeend",html);

//////////////////////////////////////////////////
// SPEED CONTROL
//////////////////////////////////////////////////

const spd=document.getElementById("spdRange");

spd.oninput=e=>{

currentSpeed=parseInt(e.target.value);

document.getElementById("spdTxt").innerText="x"+currentSpeed;

const v=document.querySelector("video");
if(v) v.playbackRate=currentSpeed;

};

document.getElementById("btnLogin").onclick=autoLogin;

}

//////////////////////////////////////////////////
// SCAN LESSONS (K12 SIDEBAR)
//////////////////////////////////////////////////

function scanLessons(){

const box=document.getElementById("jumpBox");
if(!box) return;

const nodes=document.querySelectorAll(".ant-tree-node-content-wrapper");

let lessons=[];

nodes.forEach(node=>{

const titleEl=node.querySelector(".ant-tree-title");

if(!titleEl) return;

const text=titleEl.textContent.trim();

const m=text.match(/\((\d+)%\)/);
if(!m) return;

const percent=parseInt(m[1]);

if(percent>=100) return;

const title=text.replace(/\(\d+%\)/,"").trim();

lessons.push({
title:title,
percent:percent,
node:node
});

});

box.innerHTML="";

if(lessons.length===0){
box.innerHTML="🎉 Không còn bài chưa học";
return;
}

lessons.forEach(item=>{

const div=document.createElement("div");

div.style.cssText=`
padding:6px;
margin-bottom:4px;
background:#313244;
border-radius:6px;
cursor:pointer;
border-left:3px solid #f38ba8;
`;

div.textContent=`⚡ ${item.title} (${item.percent}%)`;

div.onclick=()=>{
item.node.click();
};

box.appendChild(div);

});

}

//////////////////////////////////////////////////
// VIDEO AUTO
//////////////////////////////////////////////////

function videoLoop(){

const v=document.querySelector("video");

if(!v) return;

v.muted=true;

if(v.playbackRate!==currentSpeed)
v.playbackRate=currentSpeed;

if(v.ended){

document.querySelector(
".btn-next,.next-item,.ant-btn-primary"
)?.click();

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

setTimeout(autoLogin,3000);

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

const hub=document.getElementById("danhvuxHub");

if(hub)
hub.style.display=
hub.style.display==="none"?"block":"none";

}

});

})();
