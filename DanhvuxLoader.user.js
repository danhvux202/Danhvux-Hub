// ==UserScript==
// @name         Danhvux Hub Loader
// @match        *://k12online.vn/*
// @match        *://*.k12online.vn/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @connect      raw.githubusercontent.com
// @connect      localhost
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    // Dán cái Link RAW bạn vừa lấy ở Bước 3 vào đây
    const rawUrl = "https://raw.githubusercontent.com/danhvux202/Danhvux-Hub/main/Danhvuxpanel.js";

    GM_xmlhttpRequest({
        method: "GET",
        url: rawUrl + "?v=" + Date.now(),
        onload: (res) => {
            try {
                new Function(res.responseText)();
                console.log("✅ Đã tải Panel thành công!");
            } catch (e) { console.error("Lỗi thực thi:", e); }
        }
    });
})();
