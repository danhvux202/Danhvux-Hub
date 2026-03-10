// ==UserScript==
// @name         Danhvux Hub Loader
// @match        https://*.k12online.vn/*
// @run-at       document-end
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function(){
'use strict';

function loadHub(){

const encoded =
"aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2Rhbmh2dXgyMDIvRGFuaHZ1eC1IdWIvbWFpbi9tYWluLmpz";

const url = atob(encoded)+"?v="+Date.now();

GM_xmlhttpRequest({

method:"GET",
url:url,

onload:r=>{

const run=()=>{

try{
new Function(r.responseText)();
}catch(e){
console.error("Hub error:",e);
}

};

if(document.readyState==="complete"){
run();
}else{
window.addEventListener("load",run);
}

}

});

}

loadHub();

})();
