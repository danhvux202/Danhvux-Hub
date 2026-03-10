// ==UserScript==
// @name         Danhvux Hub Loader
// @match        https://*.k12online.vn/*
// @run-at       document-end
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function(){

const key = atob(
"aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2RhbmhodnV4MjAyL0RhbmhodnV4LUh1Yi9tYWluL21haW4uanM="
);

const url = key + "?v=" + Date.now();

GM_xmlhttpRequest({

method:"GET",

url:url,

onload:function(res){

try{

(new Function(res.responseText))();

}catch(e){

console.error("Hub Load Error",e);

}

}

});

})();
