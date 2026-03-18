// ==UserScript==
// @name         Danhvux Hub Loader
// @match        *://k12online.vn/*
// @match        *://*.k12online.vn/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    const url = "https://raw.githubusercontent.com/danhvux202/Danhvux-Hub/main/Danhvuxpanel.js?v=" + Date.now();

    GM_xmlhttpRequest({
        method: "GET",
        url: url,
        onload: (res) => {
            try {
                // Tạo một thẻ script để thực thi code thay vì dùng new Function
                const script = document.createElement('script');
                script.textContent = res.responseText;
                document.head.appendChild(script);
            } catch (e) {
                console.error("Lỗi thực thi:", e);
            }
        }
    });
})();
