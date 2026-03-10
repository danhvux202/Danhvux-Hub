(function(){
'use strict';

let currentSpeed = 2.0;
let welcomePlayed = false;
let tickerRunning = false;

const accounts=[{u:"NHAP_TEN_VAO_DAY",p:"NHAP_MAT_KHAU_VAO_DAY"}];

//////////////////////////////////////////////////
// LOGIN ENGINE
//////////////////////////////////////////////////

const deepFill=(el,value)=>{
if(!el) return;

el.focus();
el.value=value;

['focus','keydown','keypress','input','keyup','change','blur']
.forEach(type=>{
el.dispatchEvent(new Event(type,{bubbles:true}));
});
};

//////////////////////////////////////////////////
// SPEED LOCK
//////////////////////////////////////////////////

const lockSpeed=()=>{

const descriptor=
Object.getOwnPropertyDescriptor(
HTMLMediaElement.prototype,'playbackRate'
);

Object.defineProperty(
HTMLMediaElement.prototype,
'playbackRate',
{
get(){return descriptor.get.call(this);},
set(){descriptor.set.call(this,currentSpeed);}
}
);

};

lockSpeed();

//////////////////////////////////////////////////
// WELCOME TICKER
//////////////////////////////////////////////////

function welcomeTicker(){

if(welcomePlayed) return;

const box=document.getElementById("jumpBox");
if(!box) return;

welcomePlayed=true;
tickerRunning=true;

const oldContent=box.innerHTML;

box.style.position="relative";
box.style.overflow="hidden";

box.innerHTML=`
<div style="width:100%;height:20px;overflow:hidden;">
<div id="welcomeText"
style="
white-space:nowrap;
position:relative;
font-weight:bold;
color:#a6e3a1;
">
👋 CHÀO MỪNG BẠN ĐẾN VỚI DANHVUX PANEL
</div>
</div>
`;

const text=document.getElementById("welcomeText");

const boxWidth=box.offsetWidth;
const textWidth=text.scrollWidth;

let pos=boxWidth;

function move(){

pos-=1;

text.style.transform=`translateX(${pos}px)`;

if(pos>-textWidth){

requestAnimationFrame(move);

}else{

setTimeout(()=>{

box.innerHTML=oldContent;
tickerRunning=false;

},500);

}

}

move();

}

//////////////////////////////////////////////////
// PANEL UI
//////////////////////////////////////////////////

const createHub=()=>{

if(document.getElementById("danhvux-ultimate")) return;

const hubHTML=`
<div id="danhvux-ultimate" style="
position:fixed;
top:10px;
right:10px;
z-index:1000000;
background:#11111b;
color:#cdd6f4;
padding:15px;
border-radius:12px;
border:2px solid #f5e0dc;
width:280px;
font-family:sans-serif;
box-shadow:0 10px 40px rgba(0,0,0,0.8);
">

<h4 style="
margin:0;
color:#f5e0dc;
text-align:center;
border-bottom:1px solid #45475a;
padding-bottom:5px;">
TEST PANEL
</h4>

<div style="margin-top:10px;">

<div style="
font-size:11px;
display:flex;
justify-content:space-between;
margin-bottom:5px;">
<span>Tốc độ: <b id="spdTxt"
style="color:#a6e3a1;">x2</b></span>
</div>

<input type="range"
id="spdRange"
min="1"
max="100"
step="1"
value="2"
style="
width:100%;
cursor:pointer;
accent-color:#f5e0dc;
">

</div>

<div id="jumpBox" style="
margin-top:15px;
font-size:10px;
background:#181825;
padding:8px;
border-radius:8px;
border:1px solid #313244;
max-height:100px;
overflow-y:auto;">
Đang quét bài thiếu...
</div>

<div style="margin-top:10px;">

<button id="btnForceLogin"
style="
width:100%;
background:#a6e3a1;
color:#11111b;
border:none;
padding:12px;
border-radius:8px;
font-weight:bold;
cursor:pointer;">
🚀 AUTO LOGIN
</button>

</div>

<div style="
margin-top:10px;
font-size:9px;
color:#585b70;
text-align:center;">
Phím H: Ẩn / Hiện
</div>

</div>
`;

document.body.insertAdjacentHTML("beforeend",hubHTML);

setTimeout(welcomeTicker,600);

//////////////////////////////////////////////////
// SPEED CONTROL
//////////////////////////////////////////////////

document.getElementById("spdRange").oninput=(e)=>{

currentSpeed=parseFloat(e.target.value);

document.getElementById("spdTxt")
.innerText="x"+currentSpeed;

const v=document.querySelector("video");
if(v) v.playbackRate=currentSpeed;

};

//////////////////////////////////////////////////
// AUTO LOGIN
//////////////////////////////////////////////////

document.getElementById("btnForceLogin").onclick=()=>{

const inputs=document.querySelectorAll("input");

let uInp,pInp;

inputs.forEach(inp=>{

const type=inp.type?.toLowerCase();

if(type==="password") pInp=inp;

if(type==="text"||type==="email"){
if(!uInp) uInp=inp;
}

});

if(uInp&&pInp){

deepFill(uInp,accounts[0].u);

setTimeout(()=>{

deepFill(pInp,accounts[0].p);

setTimeout(()=>{

document
.querySelector("button[type=submit]")
?.click();

},400);

},400);

}else{

alert("Không tìm thấy form login");

}

};

};

//////////////////////////////////////////////////
// MAIN LOOP
//////////////////////////////////////////////////

const mainLoop=()=>{

if(tickerRunning) return;

const v=document.querySelector("video");

if(v){

v.muted=true;

if(v.playbackRate!==currentSpeed)
v.playbackRate=currentSpeed;

if(v.ended)
document.querySelector(".btn-next,.next-lesson,.next-item")?.click();

}

const jBox=document.getElementById("jumpBox");
if(!jBox) return;

let missing=[];

document
.querySelectorAll(".lesson-item,.fancytree-node,tr,li")
.forEach(el=>{

let t=el.innerText;

if(t.includes("%")){

let p=parseInt(
t.match(/(\d+)%/)?.[1]||"100"
);

if(p<100){

let link=
el.querySelector("a")?.href||
el.getAttribute("href");

let title=t.split("\n")[0]
.trim()
.substring(0,20);

if(title.length>2)
missing.push({title,link,el,p});

}

}

});

if(missing.length){

const unique=
Array.from(
new Map(missing.map(x=>[x.title,x]))
.values()
);

jBox.innerHTML=unique.map((item,i)=>`
<div class="force-jump"
data-idx="${i}"
style="
padding:6px;
margin-bottom:4px;
background:#313244;
border-radius:4px;
cursor:pointer;
color:#f5e0dc;
border-left:3px solid #f38ba8;">
⚡ ${item.title} (${item.p}%)
</div>
`).join("");

document.querySelectorAll(".force-jump")
.forEach(btn=>{

btn.onclick=function(){

const target=
unique[this.getAttribute("data-idx")];

if(target.link&&target.link.startsWith("http"))
window.location.href=target.link;

else{
target.el.scrollIntoView();
target.el.click();
}

};

});

}else{

jBox.innerHTML="🎉 Đã xong 100%!";

}

};

//////////////////////////////////////////////////
// START SYSTEM
//////////////////////////////////////////////////

if(document.readyState==="loading"){
document.addEventListener(
"DOMContentLoaded",
createHub
);
}else{
createHub();
}

window.addEventListener("keydown",(e)=>{

if(e.key.toLowerCase()==="h"){

const p=
document.getElementById(
"danhvux-ultimate"
);

if(p)
p.style.display=
p.style.display==="none"
?"block":"none";

}

});

setInterval(mainLoop,1000);

})();
