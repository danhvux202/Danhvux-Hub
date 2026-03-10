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

if(!t) return;

if(t.includes("%")){

let p=parseInt(t.match(/(\d+)%/)?.[1]||"100");

if(p<100){

let link=
el.querySelector("a")?.href||
el.getAttribute("href");

let title=t.split("\n")[0]
.trim()
.substring(0,25);

if(title.length>2)
missing.push({title,link,el,p});

}

}

});

if(missing.length){

const unique=Array.from(
new Map(missing.map(x=>[x.title,x])).values()
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

if(target.link && target.link.startsWith("http"))
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
