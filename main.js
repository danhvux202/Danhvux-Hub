// ==UserScript==
// @name         Danhvux Hub Ultimate
// @match        *://*.k12online.vn/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

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

<div class="title">🚀 Danhvux Hub</div>

<div class="row">
🎬 Speed: <b id="speedTxt">x2</b>
</div>

<input id="speedRange" type="range" min="1" max="16" value="2">

<div id="status">🔍 Đang quét bài...</div>

<style>

#dvxHub{
position:fixed;
top:25px;
right:25px;
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

document.querySelectorAll("a,div,li").forEach(el=>{

const txt=(el.innerText||"").trim();

if(!txt.includes("%")) return;

const m=txt.match(/(\d+)%/);
if(!m) return;

const percent=parseInt(m[1]);

if(percent<100){

const link=el.href || el.querySelector("a")?.href;

if(link){

lessons.push({
title:txt.split("\n")[0],
link:link
});

}

}

});

const unique=[...new Map(lessons.map(x=>[x.title,x])).values()];

if(unique.length===0){

status.innerText="🎉 Đã hoàn thành tất cả";

}else{

status.innerText=`📚 ${unique[0].title}`;

status.onclick=()=>{

window.location.href=unique[0].link;

};

}

}

//////////////////////////////////////////////////
// VIDEO CONTROL
//////////////////////////////////////////////////

setInterval(()=>{

const v=document.querySelector("video");

if(v){

v.playbackRate=speed;

if(v.ended){

document.querySelector(".btn-next,.next-item,.next-lesson")?.click();

}

}

},1500);

//////////////////////////////////////////////////
// MUSIC DISC (NO PLAYER)
//////////////////////////////////////////////////

function createMusicDisc(){

if(document.getElementById("musicBox")) return;

const box=document.createElement("div");
box.id="musicBox";

box.innerHTML=`

<div id="disc"></div>

<div id="musicBanner">🎵 Chưa phát nhạc</div>

<div id="playerUI">

<input id="musicUrl" placeholder="🎧 Dán link YouTube / Spotify">

<div class="controls">
<button id="playBtn">▶ Phát</button>
<button id="stopBtn">⏹ Dừng</button>
</div>

</div>

<iframe id="musicFrame"></iframe>

<style>

#musicBox{
position:fixed;
bottom:25px;
right:25px;
z-index:999999;
display:flex;
flex-direction:column;
align-items:center;
font-family:sans-serif;
}

#disc{
width:80px;
height:80px;
border-radius:50%;
background:
radial-gradient(circle,#444 20%,#000 21%,#111 40%,#000 41%);
cursor:pointer;
animation:spin 3s linear infinite;
animation-play-state:paused;
box-shadow:0 0 15px #000;
}

@keyframes spin{
from{transform:rotate(0deg)}
to{transform:rotate(360deg)}
}

#musicBanner{
margin-top:6px;
background:rgba(0,0,0,.75);
color:white;
font-size:12px;
padding:4px 8px;
border-radius:6px;
}

#playerUI{
display:none;
margin-top:8px;
width:220px;
background:rgba(0,0,0,.9);
padding:10px;
border-radius:12px;
}

#playerUI input{
width:100%;
padding:6px;
border:none;
border-radius:6px;
margin-bottom:6px;
}

.controls{
display:flex;
gap:6px;
}

.controls button{
flex:1;
padding:6px;
border:none;
border-radius:6px;
background:#22c55e;
color:white;
cursor:pointer;
}

#musicFrame{
width:0;
height:0;
border:0;
opacity:0;
position:absolute;
}

</style>
`;

document.body.appendChild(box);

const disc=document.getElementById("disc");
const player=document.getElementById("playerUI");
const frame=document.getElementById("musicFrame");
const banner=document.getElementById("musicBanner");
const input=document.getElementById("musicUrl");

disc.onclick=()=>{

player.style.display=
player.style.display==="none"?"block":"none";

};

document.getElementById("playBtn").onclick=()=>{

const url=input.value.trim();
if(!url) return;

frame.src=convertMusic(url);

disc.style.animationPlayState="running";

banner.innerText="🎶 Đang phát nhạc";

localStorage.setItem("dvxMusic",url);

};

document.getElementById("stopBtn").onclick=()=>{

frame.src="";
disc.style.animationPlayState="paused";

banner.innerText="⏹ Đã dừng";

};

const saved=localStorage.getItem("dvxMusic");

if(saved){

input.value=saved;
frame.src=convertMusic(saved);
disc.style.animationPlayState="running";
banner.innerText="🎶 Đang phát nhạc";

}

}

//////////////////////////////////////////////////
// CONVERT LINK
//////////////////////////////////////////////////

function convertMusic(url){

if(url.includes("youtube")||url.includes("youtu.be")){

let id=url.split("v=")[1];

if(id) id=id.split("&")[0];

if(!id && url.includes("youtu.be/"))
id=url.split("youtu.be/")[1];

return `https://www.youtube.com/embed/${id}?autoplay=1`;

}

if(url.includes("spotify.com")){

return url.replace("track","embed/track");

}

return url;

}

//////////////////////////////////////////////////
// START HUB
//////////////////////////////////////////////////

function startHub(){

createHub();
createMusicDisc();
scanLessons();

setInterval(scanLessons,5000);

}

window.addEventListener("load",()=>{

setTimeout(startHub,2000);

});

//////////////////////////////////////////////////
// KEEP HUB
//////////////////////////////////////////////////

setInterval(()=>{

if(!document.getElementById("dvxHub")) createHub();
if(!document.getElementById("musicBox")) createMusicDisc();

},3000);

})();
