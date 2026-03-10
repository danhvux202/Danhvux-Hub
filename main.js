(function(){

"use strict";

let speed=2;

const account={
user:"NHAP_TAI_KHOAN",
pass:"NHAP_MAT_KHAU"
};

//////////////////////////////////////////////////
// PANEL
//////////////////////////////////////////////////

function createPanel(){

if(document.getElementById("dvxHub")) return;

const panel=document.createElement("div");
panel.id="dvxHub";

panel.innerHTML=`

<div class="dvxTitle">🚀 Danhvux Hub</div>

<div class="dvxRow">
🎬 Tốc độ video: <b id="dvxSpeedTxt">x2</b>
</div>

<input id="dvxSpeed" type="range" min="1" max="16" value="2">

<div id="dvxStatus">🔍 Đang quét bài học...</div>

<button id="dvxLogin">🔐 Auto Login</button>

<style>

#dvxHub{
position:fixed;
top:25px;
right:25px;
width:300px;
background:linear-gradient(145deg,#0f172a,#020617);
color:white;
border-radius:16px;
padding:16px;
z-index:999999;
font-family:sans-serif;
box-shadow:0 10px 35px rgba(0,0,0,.6);
}

.dvxTitle{
font-size:20px;
font-weight:bold;
text-align:center;
margin-bottom:10px;
}

.dvxRow{
font-size:14px;
margin-bottom:6px;
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
margin-bottom:10px;
cursor:pointer;
}

button{
padding:8px;
border:none;
border-radius:8px;
background:#22c55e;
color:white;
cursor:pointer;
font-weight:bold;
width:100%;
}

</style>
`;

document.body.appendChild(panel);

//////////////////////////////////////////////////
// SPEED
//////////////////////////////////////////////////

document.getElementById("dvxSpeed").oninput=e=>{

speed=parseInt(e.target.value);

document.getElementById("dvxSpeedTxt").innerText="x"+speed;

const v=document.querySelector("video");
if(v) v.playbackRate=speed;

};

document.getElementById("dvxLogin").onclick=autoLogin;

}

//////////////////////////////////////////////////
// SCAN LESSON (FIXED)
//////////////////////////////////////////////////

function scanLessons(){

const status=document.getElementById("dvxStatus");

if(!status) return;

let lessons=[];

document.querySelectorAll("a,div,li").forEach(el=>{

const txt=(el.innerText||"").trim();

if(!txt.includes("%")) return;

const match=txt.match(/(\d+)%/);

if(!match) return;

const percent=parseInt(match[1]);

if(percent>=100) return;

const link=el.href || el.querySelector("a")?.href;

if(!link) return;

lessons.push({
title:txt.split("\n")[0],
link:link
});

});

const unique=[...new Map(lessons.map(x=>[x.title,x])).values()];

window.dvxLessons=unique;

if(unique.length===0){

status.innerText="🎉 Tất cả bài đã hoàn thành!";

return;

}

const first=unique[0];

status.innerText=`⚡ ${first.title} (${unique.length} bài chưa học)`;

status.onclick=()=>{

window.location.href=first.link;

};

}

//////////////////////////////////////////////////
// VIDEO LOOP
//////////////////////////////////////////////////

function videoLoop(){

const v=document.querySelector("video");

if(!v) return;

v.playbackRate=speed;

if(v.ended){

const next=document.querySelector(".btn-next,.next-item,.next-lesson");

if(next) next.click();

}

}

setInterval(videoLoop,1500);

//////////////////////////////////////////////////
// AUTO LOGIN
//////////////////////////////////////////////////

function autoLogin(){

const user=document.querySelector("input[type=text],input[type=email]");
const pass=document.querySelector("input[type=password]");
const btn=document.querySelector("button[type=submit]");

if(user && pass){

user.value=account.user;
pass.value=account.pass;

btn?.click();

}

}

//////////////////////////////////////////////////
// PANEL KHÔNG BAO GIỜ MẤT
//////////////////////////////////////////////////

setInterval(()=>{

if(!document.getElementById("dvxHub")){

createPanel();

}

},2000);

//////////////////////////////////////////////////
// START
//////////////////////////////////////////////////

window.addEventListener("load",()=>{

setTimeout(()=>{

createPanel();
scanLessons();

setInterval(scanLessons,5000);

},2000);

});

})();
