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

    // Link RAW chuẩn đến file Danhvuxpanel.js của bạn
    const rawUrl = "https://raw.githubusercontent.com/danhvux202/Danhvux-Hub/main/Danhvuxpanel.js";

    console.log("%c[Danhvux Loader]%c Đang tải Panel...", "color:#ffea00;font-weight:bold;", "color:#fff;");

    GM_xmlhttpRequest({
        method: "GET",
        url: rawUrl + "?v=" + Date.now(), // Thêm thời gian để tránh bị lưu bản cũ (cache)
        onload: (res) => {
            try {
                // Chạy trực tiếp nội dung file từ GitHub
                new Function(res.responseText)();
                console.log("✅ Danhvux Hub: Đã tải xong!");
            } catch (e) {
                console.error("❌ Lỗi thực thi code từ GitHub:", e);
                // Nếu lỗi, thử hiển thị một phần nhỏ để debug
                console.log("Nội dung tải về được:", res.responseText.substring(0, 100));
            }
        },
        onerror: (err) => {
            console.error("❌ Không thể kết nối đến GitHub. Kiểm tra mạng hoặc link RAW.");
        }
    });
})();
