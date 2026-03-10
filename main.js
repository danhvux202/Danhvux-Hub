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

<div class="dvxTitle">🚀 Danhvux Hub</div>

<div class="dvxRow">
🎬 Speed: <b id="dvxSpeedTxt">x2</b>
</div>

<input id="dvxSpeed" type="range" min="1" max="16" value="2">

<div id="dvxStatus">🔍 Đang quét bài...</div>

<style>

#dvxHub{
position:fixed;
top:25px;
right:25px;
width:260px;
background:rgba(15,23,42,.85);
backdrop-filter:blur(12px);
border-radius:16px;
padding:15px;
color:white;
font-family:sans-serif;
z-index:999999;
box-shadow:0 10px 35px rgba(0,0,0,.6);
}

.dvxTitle{
font-size:18px;
font-weight:bold;
text-align:center;
margin-bottom:10px;
}

#dvxSpeed{
width:100%;
margin-bottom:10px;
}

#dvxStatus{
background:#111827;
padding:10px;
border-radius:8px;
font-size:13px;
cursor:pointer;
}

</style>
`;

document.body.appendChild(panel);

document.getElementById("dvxSpeed").oninput=e=>{

speed=e.target.value;
document.getElementById("dvxSpeedTxt").innerText="x"+speed;

const v=document.querySelector("video");
if(v) v.playbackRate=speed;

};

}

//////////////////////////////////////////////////
// SCAN LESSON
//////////////////////////////////////////////////

function scanLessons(){

const status=document.getElementById("dvxStatus");

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

status.innerText="🎉 Đã hoàn thành tất cả!";

}else{

status.innerText=`⚡ ${unique[0].title} (${unique.length} bài)`;


status.onclick=()=>{

window.location.href=unique[0].link;

};

}

}

//////////////////////////////////////////////////
// VIDEO SPEED
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
// MUSIC DISC
//////////////////////////////////////////////////

function createMusicDisc(){

if(document.getElementById("dvxMusic")) return;

const box=document.createElement("div");
box.id="dvxMusic";

box.innerHTML=`

<div id="dvxDisc"></div>

<div id="dvxPlayer">

<input id="dvxMusicUrl" placeholder="🎵 YouTube / Spotify link">

<div class="dvxControls">

<button id="dvxPlay">▶</button>
<button id="dvxPause">⏸</button>

</div>

<input id="dvxVol" type="range" min="0" max="1" step="0.01" value="1">

<iframe id="dvxFrame"></iframe>

</div>

<style>

#dvxMusic{
position:fixed;
bottom:25px;
right:25px;
z-index:999999;
display:flex;
flex-direction:column;
align-items:center;
}

#dvxDisc{
width:80px;
height:80px;
border-radius:50%;
background:
radial-gradient(circle,#444 25%,#000 26%,#111 40%,#000 41%);
box-shadow:0 0 10px #000;
cursor:pointer;
animation:spin 4s linear infinite;
animation-play-state:paused;
}

@keyframes spin{
from{transform:rotate(0deg)}
to{transform:rotate(360deg)}
}

#dvxPlayer{
margin-top:10px;
width:260px;
background:rgba(0,0,0,.85);
padding:10px;
border-radius:12px;
display:none;
}

#dvxPlayer input{
width:100%;
margin-bottom:6px;
border:none;
padding:6px;
border-radius:6px;
}

.dvxControls{
display:flex;
gap:6px;
margin-bottom:6px;
}

.dvxControls button{
flex:1;
border:none;
padding:6px;
border-radius:6px;
cursor:pointer;
background:#22c55e;
color:white;
}

#dvxFrame{
width:100%;
height:120px;
border:none;
border-radius:6px;
}

</style>
`;

document.body.appendChild(box);

const disc=document.getElementById("dvxDisc");
const player=document.getElementById("dvxPlayer");
const urlInput=document.getElementById("dvxMusicUrl");
const frame=document.getElementById("dvxFrame");

disc.onclick=()=>{

player.style.display=
player.style.display==="none"?"block":"none";

};

//////////////////////////////////////////////////
// LOAD SAVED MUSIC
//////////////////////////////////////////////////

const saved=localStorage.getItem("dvxMusic");

if(saved){

urlInput.value=saved;
frame.src=convertMusic(saved);
disc.style.animationPlayState="running";

}

//////////////////////////////////////////////////
// PLAY
//////////////////////////////////////////////////

document.getElementById("dvxPlay").onclick=()=>{

const url=urlInput.value.trim();

if(!url) return;

localStorage.setItem("dvxMusic",url);

frame.src=convertMusic(url);

disc.style.animationPlayState="running";

};

//////////////////////////////////////////////////
// PAUSE
//////////////////////////////////////////////////

document.getElementById("dvxPause").onclick=()=>{

frame.src="";
disc.style.animationPlayState="paused";

};

}

//////////////////////////////////////////////////
// CONVERT MUSIC LINK
//////////////////////////////////////////////////

function convertMusic(url){

if(url.includes("youtube")||url.includes("youtu.be")){

let id=url.split("v=")[1];

if(id) id=id.split("&")[0];

if(!id && url.includes("youtu.be/"))
id=url.split("youtu.be/")[1];

return "https://www.youtube.com/embed/"+id;

}

if(url.includes("spotify.com")){

return url.replace("track","embed/track");

}

return url;

}

//////////////////////////////////////////////////
// START
//////////////////////////////////////////////////

window.addEventListener("load",()=>{

setTimeout(()=>{

createHub();
createMusicDisc();
scanLessons();

setInterval(scanLessons,5000);

},2000);

});

//////////////////////////////////////////////////
// KEEP HUB
//////////////////////////////////////////////////

setInterval(()=>{

if(!document.getElementById("dvxHub")) createHub();
if(!document.getElementById("dvxMusic")) createMusicDisc();

},3000);

})();
