// ==UserScript==
// @name         Danhvux Hub Loader
// @namespace    https://github.com/danhvux
// @version      1.0.0
// @description  Loader for Danhvux Hub
// @author       Danhvux
// @match        https://*.k12online.vn/*
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/danhvux202/Danhvux-Hub/main/DanhvuxLoader.user.js
// @downloadURL  https://raw.githubusercontent.com/danhvux202/Danhvux-Hub/main/DanhvuxLoader.user.js
// ==/UserScript==

(function () {
'use strict';

const SCRIPT_URL =
"https://raw.githubusercontent.com/danhvux202/Danhvux-Hub/main/main.js?t=" + Date.now();

GM_xmlhttpRequest({
method:"GET",
url:SCRIPT_URL,
onload:function(res){

try{
eval(res.responseText);
}catch(e){
console.error("Hub load error:", e);
}

}
});

})();
