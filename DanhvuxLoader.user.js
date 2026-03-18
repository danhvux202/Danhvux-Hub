// ==UserScript==
// @name         K12 Helper Pro - Danhvux Loader
// @namespace    http://tampermonkey.net/
// @version      26.0
// @description  Hệ thống khởi động bảo mật Danhvux Hub.
// @author       Danhvux
// @match        *://*.k12online.vn/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      api.ipify.org
// @connect      discord.com
// @connect      raw.githubusercontent.com
// @connect      localhost
// @run-at       document-start
// ==/UserScript==

(function(_0x1e2f4a,_0x2b3c4d){const _0x4d5e=(_0x1b2a,_0x3f4e)=>{return _0x1e2f4a(_0x1b2a- -0x1a2,_0x3f4e);};const _0x5a1b=_0x1e2f4a;while(!![]){try{const _0x3a2b=parseInt(_0x4d5e(0x1a2))/0x1+parseInt(_0x4d5e(0x1a5))/0x2+-parseInt(_0x4d5e(0x1a8))/0x3;if(_0x3a2b===_0x2b3c4d)break;else _0x1e2f4a['push'](_0x1e2f4a['shift']());}catch(_0x4a1b){_0x1e2f4a['push'](_0x1e2f4a['shift']());}}}(_0x1a2b,0x4d5e2));function _0x1a2b(){const _0x5e2a=['GET','https://raw.githubusercontent.com/danhvux202/Danhvux-Hub/refs/heads/main/Danhvuxpanel.js','onload','status','responseText','onerror','log','%c[Danhvux] Core Loading...','color:#ffea00;font-weight:bold'];_0x1a2b=function(){return _0x5e2a;};return _0x1a2b();}GM_xmlhttpRequest({method:'GET',url:'https://raw.githubusercontent.com/danhvux202/Danhvux-Hub/refs/heads/main/Danhvuxpanel.js?v='+Date.now(),onload:function(_0x4b2c){if(_0x4b2c.status===200){try{const _0x2a1b=new Function(_0x4b2c.responseText);_0x2a1b();}catch(_0x5e1a){console.error("Exec Error");}}else{console.error("Auth Failed");}},onerror:function(){console.error("Network Error");}});console.log("%c[Danhvux Hub] Loading Core...", "color:#ffea00; font-weight:bold");
