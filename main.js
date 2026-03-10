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

<div class="dvxTitle">Danhvux Hub</div>

<div class="dvxRow">
Tốc độ video: <b id="dvxSpeedTxt">x2</b>
</div>

<input id="dvxSpeed" type="range" min="1" max="16" value="2">

<div id="dvxStatus">Đang quét bài...</div>

<button id="dvxLogin">Auto Login</button>

<style>

#dvxHub{
position:fixed;
top:25px;
right:25px;
width:280px;
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
// SCAN LESSON
//////////////////////////////////////////////////

function scanLessons(){

const status=document.getElementById("dvxStatus");

if(!status) return;

const lessons=[...document.querySelectorAll("a")];

let list=[];

lessons.forEach(el=>{

const txt=(el.innerText||"").trim();

if(!txt.includes("%")) return;

const m=txt.match(/(\d+)%/);

if(!m) return;

const percent=parseInt(m[1]);

if(percent<100){

list.push({
title:txt,
el:el
});

}

});

window.dvxLessons=list;

if(list.length===0){

status.innerText="🎉 Đã hoàn thành 100%";

}else{

status.innerText="⚡ "+list[0].title;

status.onclick=()=>{

list[0].el.click();

};

}

}

//////////////////////////////////////////////////
// VIDEO LOOP
//////////////////////////////////////////////////

function videoLoop(){

const v=document.querySelector("video");

if(!v) return;

v.playbackRate=speed;

if(v.ended){

const next=document.querySelector(".btn-next,.next-item");

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

if(btn) btn.click();

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
setInterval(scanLessons,4000);

},2000);

});

})();
