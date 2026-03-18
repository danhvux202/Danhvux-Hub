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
    
    // Giao diện và logic Panel (Bản v16 đã hợp nhất)
    // Tự động bỏ qua check nếu Bot chưa bật để Panel vẫn hiện
    const BOT_API = 'http://localhost:5000/blacklist';

    function initPanel() {
        console.log("Danhvux Hub is starting...");
        
        // Đoạn này bạn dán toàn bộ phần tạo Giao diện (GM_addStyle và document.createElement)
        // mà mình đã gửi ở bản v16 phía trên vào.
        
        // Ví dụ một đoạn test nhanh:
        const testDiv = document.createElement('div');
        testDiv.innerHTML = '<div style="position:fixed;top:20px;left:20px;z-index:9999;background:yellow;padding:10px;color:black;border-radius:10px;font-weight:bold;">DANHVUX HUB ĐÃ CHẠY!</div>';
        document.body.appendChild(testDiv);
    }

    // Kiểm tra Bot, nếu Bot lỗi thì vẫn hiện Panel
    GM_xmlhttpRequest({
        method: "GET",
        url: BOT_API,
        onload: (res) => initPanel(),
        onerror: () => initPanel() 
    });
})();
