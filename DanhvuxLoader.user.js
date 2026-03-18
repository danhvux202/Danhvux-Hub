// ==UserScript==
// @name         Danhvux Hub Loader
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Tải Danhvux Panel v16 từ Server GitHub
// @author       Danhvux
// @match        *://k12online.vn/*
// @match        *://*.k12online.vn/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @connect      raw.githubusercontent.com
// @connect      localhost
// @connect      127.0.0.1
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    function loadHub() {
        // Link GitHub của bạn (đã mã hóa Base64 để tránh bị soi)
        // Link gốc: https://raw.githubusercontent.com/danhvux202/Danhvux-Hub/main/main.js
        const encoded = "aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2Rhbmh2dXgyMDIvRGFuaHZ1eC1IdWIvbWFpbi9tYWluLmpz";
        const url = atob(encoded) + "?v=" + Date.now();

        console.log("%c[Danhvux Hub]%c Đang tải dữ liệu...", "color:#ffea00;font-weight:bold;", "color:#fff;");

        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            onload: (res) => {
                const run = () => {
                    try {
                        // Chạy code từ Server GitHub
                        new Function(res.responseText)();
                    } catch (e) {
                        console.error("[Hub Error]:", e);
                    }
                };

                if (document.readyState === "complete") {
                    run();
                } else {
                    window.addEventListener("load", run);
                }
            },
            onerror: (err) => {
                console.error("[Hub Loader]: Lỗi kết nối server GitHub!");
            }
        });
    }

    loadHub();
})();
