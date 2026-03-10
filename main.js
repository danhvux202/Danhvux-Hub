(function(){
'use strict';

let currentSpeed=2;

//////////////////////////////////////////////////
// ACCOUNT
//////////////////////////////////////////////////

const accounts=[
{u:"USERNAME",p:"PASSWORD"}
];

//////////////////////////////////////////////////
// AUTO LOGIN
//////////////////////////////////////////////////

function fill(el,val){

if(!el) return;

el.focus();
el.value=val;

["input","change","keyup"].forEach(e=>{
el.dispatchEvent(new Event(e,{bubbles:true}));
});

}

function autoLogin(){

const inputs=[...document.querySelectorAll("input")];

const user=inputs.find(i=>i.type==="text"||i.type==="email");
const pass=inputs.find(i=>i.type==="password");

if(user&&pass){

fill(user,accounts[0].u);

setTimeout(()=>{

fill(pass,accounts[0].p);

setTimeout(()=>{
document.querySelector("button[type=submit]")?.click();
},400);

},400);

}

}

//////////////////////////////////////////////////
// HUB UI
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

<div style="display:flex;margin-top:8px;gap:4px">
<button id="tabHub" style="flex:1">HUB</button>
<button id="tabSubjects" style="flex:1">MÔN</button>
</div>

<div id="hubTab">

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
max-height:150px;
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

<div id="subjectTab" style="
display:none;
margin-top:8px;
background:#181825;
padding:8px;
border-radius:8px;
font-size:11px;
max-height:150px;
overflow:auto">
Scanning subjects...
</div>

</div>
`;

document.body.insertAdjacentHTML("beforeend",html);

//////////////////////////////////////////////////
// TAB
//////////////////////////////////////////////////

document.getElementById("tabHub").onclick=()=>{
hubTab.style.display="block";
subjectTab.style.display="none";
};

document.getElementById("tabSubjects").onclick=()=>{
hubTab.style.display="none";
subjectTab.style.display="block";
scanSubjects();
};

//////////////////////////////////////////////////
// SPEED
//////////////////////////////////////////////////

spdRange.oninput=e=>{

currentSpeed=parseInt(e.target.value);

spdTxt.innerText="x"+currentSpeed;

const v=document.querySelector("video");

if(v) v.playbackRate=currentSpeed;

};

btnLogin.onclick=autoLogin;

}

//////////////////////////////////////////////////
// SCAN LESSONS (SIDEBAR ONLY)
//////////////////////////////////////////////////

function scanLessons(){

const box=document.getElementById("jumpBox");
if(!box) return;

const sidebar=document.querySelector(".ant-tree,.tree,.sidebar");

if(!sidebar){
box.innerHTML="Sidebar not detected";
return;
}

let lessons=[];

sidebar.querySelectorAll("*").forEach(el=>{

const txt=(el.innerText||"").trim();

if(!txt.includes("%")) return;

const m=txt.match(/(\d+)%/);
if(!m) return;

const percent=parseInt(m[1]);

if(percent>=100) return;

let title=txt.replace(/\(\d+%\)/,"").trim();

if(title.length>60) title=title.slice(0,60);

let link=el.closest("a")?.href||null;

lessons.push({title,percent,link,el});

});

const unique=[...new Map(lessons.map(x=>[x.title,x])).values()];

box.innerHTML="";

if(unique.length===0){

box.innerHTML="🎉 All lessons completed";
return;

}

unique.forEach(item=>{

const div=document.createElement("div");

div.style.cssText=`
padding:6px;
margin-bottom:4px;
background:#313244;
border-radius:4px;
cursor:pointer;
border-left:3px solid #f38ba8;
`;

div.innerText=`⚡ ${item.title} (${item.percent}%)`;

div.onclick=()=>{

if(item.link){
window.location.href=item.link;
}else{
item.el.click();
}

};

box.appendChild(div);

});

}

//////////////////////////////////////////////////
// SCAN SUBJECTS
//////////////////////////////////////////////////

function scanSubjects(){

const box=document.getElementById("subjectTab");
if(!box) return;

let subjects=[];

document.querySelectorAll("div,span,a").forEach(el=>{

const txt=(el.innerText||"").trim();

if(!txt) return;

if(txt.includes("GV")||txt.includes("Giáo viên")){

const lines=txt.split("\n");

let subject=lines[0]?.trim();
let teacher="";

lines.forEach(l=>{

let m=l.match(/(?:GV|Giáo viên)[:\s]+(.+)/i);

if(m) teacher=m[1];

});

if(teacher && subject){

subjects.push(`${teacher} | ${subject}`);

}

}

});

const unique=[...new Set(subjects)];

box.innerHTML="";

if(unique.length===0){
box.innerHTML="No subjects found";
return;
}

unique.forEach(t=>{

const div=document.createElement("div");

div.style.cssText=`
padding:6px;
margin-bottom:4px;
background:#313244;
border-radius:4px;
`;

div.innerText=t;

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

setInterval(scanLessons,6000);

setInterval(videoLoop,1000);

},2000);

setTimeout(autoLogin,3000);

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

const hub=document.getElementById("danhvuxHub");

if(hub)
hub.style.display=
hub.style.display==="none"?"block":"none";

}

});

})();
