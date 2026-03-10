(function(){
'use strict';

let tocDoVideo = 2;

//////////////////////////////////////////////////
// TÀI KHOẢN
//////////////////////////////////////////////////

const taiKhoan=[
{u:"USERNAME",p:"PASSWORD"}
];

//////////////////////////////////////////////////
// TỰ ĐỘNG ĐĂNG NHẬP
//////////////////////////////////////////////////

function dienInput(el,val){

if(!el) return;

el.focus();
el.value=val;

["input","change","keyup"].forEach(e=>{
el.dispatchEvent(new Event(e,{bubbles:true}));
});

}

function tuDongDangNhap(){

const user=document.querySelector("input[type=text],input[type=email]");
const pass=document.querySelector("input[type=password]");

if(user && pass){

dienInput(user,taiKhoan[0].u);

setTimeout(()=>{

dienInput(pass,taiKhoan[0].p);

setTimeout(()=>{
document.querySelector("button[type=submit]")?.click();
},500);

},500);

}

}

//////////////////////////////////////////////////
// TẠO PANEL HUB
//////////////////////////////////////////////////

function taoHub(){

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
Tốc độ video: <b id="txtTocDo">x2</b>
</div>

<input id="rangeTocDo" type="range" min="1" max="20" value="2" style="width:100%">

<div id="hopBaiHoc" style="
margin-top:10px;
background:#181825;
padding:8px;
border-radius:8px;
font-size:11px;
max-height:170px;
overflow:auto">
Đang quét bài học...
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
TỰ ĐỘNG ĐĂNG NHẬP
</button>

</div>
`;

document.body.insertAdjacentHTML("beforeend",html);

//////////////////////////////////////////////////
// ĐIỀU CHỈNH TỐC ĐỘ VIDEO
//////////////////////////////////////////////////

const spd=document.getElementById("rangeTocDo");

spd.oninput=e=>{

tocDoVideo=parseInt(e.target.value);

document.getElementById("txtTocDo").innerText="x"+tocDoVideo;

const v=document.querySelector("video");
if(v) v.playbackRate=tocDoVideo;

};

document.getElementById("btnLogin").onclick=tuDongDangNhap;

}

//////////////////////////////////////////////////
// QUÉT BÀI HỌC CHƯA 100%
//////////////////////////////////////////////////

function quetBaiHoc(){

const box=document.getElementById("hopBaiHoc");
if(!box) return;

const nodes=document.querySelectorAll(".ant-tree-node-content-wrapper");

let danhSach=[];

nodes.forEach(node=>{

const text=node.innerText.trim();

const m=text.match(/\((\d+)%\)/);
if(!m) return;

const percent=parseInt(m[1]);

if(percent>=100) return;

const ten=text.replace(/\(\d+%\)/,"").trim();

danhSach.push({
title:ten,
percent:percent,
node:node
});

});

box.innerHTML="";

if(danhSach.length===0){

box.innerHTML="🎉 Tất cả bài học đã hoàn thành";
return;

}

danhSach.forEach(item=>{

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
// TỰ ĐỘNG VIDEO
//////////////////////////////////////////////////

function tuDongVideo(){

const v=document.querySelector("video");

if(!v) return;

v.muted=true;

if(v.playbackRate!==tocDoVideo)
v.playbackRate=tocDoVideo;

if(v.ended){

document.querySelector(
".btn-next,.next-item,.ant-btn-primary"
)?.click();

}

}

//////////////////////////////////////////////////
// KHỞI ĐỘNG
//////////////////////////////////////////////////

function batDau(){

taoHub();

setTimeout(()=>{

quetBaiHoc();

setInterval(quetBaiHoc,5000);

setInterval(tuDongVideo,1000);

},2000);

setTimeout(tuDongDangNhap,3000);

}

if(document.readyState==="loading"){
document.addEventListener("DOMContentLoaded",batDau);
}else{
batDau();
}

//////////////////////////////////////////////////
// PHÍM TẮT ẨN HIỆN HUB
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
