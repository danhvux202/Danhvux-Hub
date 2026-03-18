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

    // Link RAW đến file main.js của bạn trên GitHub
    const rawUrl = "https://raw.githubusercontent.com/danhvux202/Danhvux-Hub/main/main.js";

    console.log("%c[Danhvux Loader]%c Đang tải Danhvux Hub từ GitHub...", "color:#ffea00;font-weight:bold;", "color:#fff;");

    GM_xmlhttpRequest({
        method: "GET",
        // Thêm timestamp Date.now() để ép trình duyệt không cache bản cũ
        url: rawUrl + "?v=" + Date.now(),
        onload: (res) => {
            try {
                // Thực thi code từ GitHub
                new Function(res.responseText)();
                console.log("%c[Danhvux Hub]%c Đã khởi chạy thành công!", "color:#ffea00;font-weight:bold;", "color:#fff;");
            } catch (e) {
                console.error("[Loader Error]: Lỗi thực thi logic Panel!", e);
            }
        },
        onerror: (err) => {
            console.error("[Loader Error]: Không thể kết nối đến Server GitHub!");
        }
    });
})();
