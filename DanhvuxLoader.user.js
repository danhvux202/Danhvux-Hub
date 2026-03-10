// ==UserScript==
// @name         Danhvux Hub Loader
// @match        https://*.k12online.vn/*
// @run-at       document-end
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function(){

const url =
"https://raw.githubusercontent.com/danhvux202/Danhvux-Hub/main/main.js?"+Date.now();

GM_xmlhttpRequest({
method:"GET",
url:url,
onload:r=>{

new Function(r.responseText)();

}
});

})();
