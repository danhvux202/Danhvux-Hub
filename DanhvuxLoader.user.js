// ==UserScript==
// @name         Danhvux Hub Loader
// @match        *://k12online.vn/*
// @match        *://*.k12online.vn/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      raw.githubusercontent.com
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    const url = "https://raw.githubusercontent.com/danhvux202/Danhvux-Hub/main/Danhvuxpanel.js?v=" + Date.now();

    GM_xmlhttpRequest({
        method: "GET",
        url: url,
        onload: (res) => {
            try {
                // Ép chạy code
                const run = new Function(res.responseText);
                run();
            } catch (e) {
                console.error("Lỗi thực thi file Main:", e);
            }
        }
    });
})();
