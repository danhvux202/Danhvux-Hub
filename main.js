(function(){

"use strict";

let speed=2;

//////////////////////////////////////////////////
// HUB PANEL
//////////////////////////////////////////////////

function createHub(){

if(document.getElementById("dvxHub")) return;

const panel=document.createElement("div");
panel.id="dvxHub";

panel.innerHTML=`

<div class="title"> Danhvux Hub</div>

<div class="row">
🎬 Speed: <b id="speedTxt">x2</b>
</div>

<input id="speedRange" type="range" min="1" max="16" value="2">

<div id="status">🔍 Đang quét bài...</div>

<style>

#dvxHub{
position:fixed;
top:20px;
right:20px;
width:260px;
background:rgba(15,23,42,.9);
backdrop-filter:blur(10px);
padding:15px;
border-radius:16px;
color:white;
z-index:999999;
font-family:sans-serif;
box-shadow:0 10px 30px rgba(0,0,0,.5);
}

.title{
font-size:18px;
font-weight:bold;
text-align:center;
margin-bottom:10px;
}

.row{
margin-bottom:6px;
}

#speedRange{
width:100%;
margin-bottom:10px;
}

#status{
background:#111827;
padding:8px;
border-radius:8px;
font-size:13px;
cursor:pointer;
}

</style>
`;

document.body.appendChild(panel);

document.getElementById("speedRange").oninput=e=>{

speed=e.target.value;

document.getElementById("speedTxt").innerText="x"+speed;

const v=document.querySelector("video");
if(v) v.playbackRate=speed;

};

}

//////////////////////////////////////////////////
// SCAN LESSON
//////////////////////////////////////////////////

function scanLessons(){

const status=document.getElementById("status");
if(!status) return;

let lessons=[];

document.querySelectorAll("a").forEach(a=>{

const txt=a.innerText||"";

const m=txt.match(/(\d+)%/);

if(m){

const percent=parseInt(m[1]);

if(percent<100){

lessons.push({
title:txt.split("\n")[0],
link:a.href
});

}

}

});

if(lessons.length===0){

status.innerText="🎉 Đã hoàn thành";

return;

}

status.innerText="📚 "+lessons[0].title;

status.onclick=()=>{

window.location.href=lessons[0].link;

};

}

//////////////////////////////////////////////////
// VIDEO CONTROL
//////////////////////////////////////////////////

setInterval(()=>{

const v=document.querySelector("video");

if(v){

v.playbackRate=speed;

if(v.ended){

document.querySelector(".next-item,.btn-next")?.click();

}

}

},1500);

//////////////////////////////////////////////////
// RGB VINYL PLAYER
//////////////////////////////////////////////////

function createMusicDisc(){

if(document.getElementById("musicBox")) return;

const box=document.createElement("div");
box.id="musicBox";

box.innerHTML=`

<div id="vinylWrap">

<div id="vinyl">
<div class="label"></div>
</div>

</div>

<div id="musicUI">

<div id="musicBanner">🎵 Chưa phát nhạc</div>

<input id="musicUrl" placeholder="🎧 Dán link YouTube rồi Enter">

<iframe id="musicFrame" allow="autoplay"></iframe>

</div>

<style>

#musicBox{
position:fixed;
bottom:20px;
right:20px;
z-index:999999;
display:flex;
flex-direction:column;
align-items:center;
font-family:sans-serif;
}

#musicUI{
display:none;
flex-direction:column;
align-items:center;
}

#vinylWrap{
padding:6px;
border-radius:50%;
background:linear-gradient(
45deg,
red,
orange,
yellow,
lime,
cyan,
blue,
violet,
red
);
background-size:400% 400%;
animation:rgbMove 6s linear infinite;
cursor:pointer;
}

@keyframes rgbMove{
0%{background-position:0%}
100%{background-position:400%}
}

#vinyl{
width:90px;
height:90px;
border-radius:50%;
background:
radial-gradient(circle,#000 35%,#111 36%,#000 40%,#111 41%,#000 45%);
box-shadow:0 0 10px #000,inset 0 0 20px rgba(255,255,255,.1);
position:relative;
animation:spin 2.5s linear infinite;
animation-play-state:paused;
}

#vinyl::before{
content:"";
position:absolute;
inset:0;
border-radius:50%;
background:
repeating-radial-gradient(
circle,
rgba(255,255,255,.05) 0px,
rgba(255,255,255,.05) 1px,
transparent 2px,
transparent 4px
);
}

.label{
position:absolute;
width:24px;
height:24px;
background:#ef4444;
border-radius:50%;
top:50%;
left:50%;
transform:translate(-50%,-50%);
}

@keyframes spin{
from{transform:rotate(0)}
to{transform:rotate(360deg)}
}

#musicUrl{
margin-top:8px;
width:240px;
padding:6px;
border-radius:8px;
border:none;
background:#111;
color:white;
}

#musicFrame{
margin-top:8px;
width:240px;
height:135px;
border-radius:10px;
border:none;
}

#musicBanner{
margin-top:6px;
background:rgba(0,0,0,.75);
color:white;
font-size:12px;
padding:4px 8px;
border-radius:6px;
}

</style>
`;

document.body.appendChild(box);

const vinylWrap=document.getElementById("vinylWrap");
const vinyl=document.getElementById("vinyl");
const ui=document.getElementById("musicUI");
const frame=document.getElementById("musicFrame");
const input=document.getElementById("musicUrl");
const banner=document.getElementById("musicBanner");

vinylWrap.onclick=()=>{

ui.style.display=
ui.style.display==="none"?"flex":"none";

};

input.addEventListener("keydown",e=>{

if(e.key==="Enter"){

const url=input.value.trim();
if(!url) return;

frame.src=convertMusic(url);

vinyl.style.animationPlayState="running";

banner.innerText="🎶 Đang phát nhạc";

localStorage.setItem("dvxMusic",url);

}

});

const saved=localStorage.getItem("dvxMusic");

if(saved){

input.value=saved;

frame.src=convertMusic(saved);

vinyl.style.animationPlayState="running";

banner.innerText="🎶 Đang phát nhạc";

}

}

//////////////////////////////////////////////////
// LINK CONVERTER
//////////////////////////////////////////////////

function convertMusic(url){

let id="";

if(url.includes("watch?v=")){
id=url.split("watch?v=")[1].split("&")[0];
}

else if(url.includes("youtu.be/")){
id=url.split("youtu.be/")[1].split("?")[0];
}

if(!id) return "";

return `https://www.youtube.com/embed/${id}?autoplay=1`;

}

//////////////////////////////////////////////////
// START
//////////////////////////////////////////////////

function start(){

createHub();
createMusicDisc();
scanLessons();

setInterval(scanLessons,5000);

}

window.addEventListener("load",()=>{

setTimeout(start,2000);

});

//////////////////////////////////////////////////
// KEEP PANEL
//////////////////////////////////////////////////

setInterval(()=>{

if(!document.getElementById("dvxHub")) createHub();
if(!document.getElementById("musicBox")) createMusicDisc();

},3000);

})();
