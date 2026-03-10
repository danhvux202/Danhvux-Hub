// ==UserScript==
// @name         Danhvux Hub Loader
// @namespace    https://github.com/danhvux
// @version      1.0
// @description  Loader for Danhvux Hub
// @author       Danhvux
// @match        https://*.k12online.vn/*
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function(){

const url = "https://raw.githubusercontent.com/danhvux202/Danhvux-Hub/main/main.js?t=" + Date.now();

GM_xmlhttpRequest({
method:"GET",
url:url,
onload:function(r){
try{
eval(r.responseText);
}catch(e){
console.error("Hub load error",e);
}
}
});

})();
