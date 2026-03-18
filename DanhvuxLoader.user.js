// ==UserScript==
// @name         K12 Helper Pro - Loader System
// @namespace    http://tampermonkey.net/
// @version      25.5
// @description  Hệ thống tải từ GitHub - Bảo mật Webhook & API.
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

(function() {
    'use strict';

    // ĐƯỜNG DẪN ĐẾN FILE CODE CHÍNH TRÊN GITHUB CỦA BẠN
    // Lưu ý: Dùng link "Raw" (có raw.githubusercontent.com)
    const REMOTE_URL = 'https://raw.githubusercontent.com/USERNAME/REPO_NAME/main/k12_core.js?t=' + Date.now();

    console.log("%c[Danhvux]%c Đang tải lõi hệ thống...", "color:#ffea00; font-weight:bold", "color:#fff");

    GM_xmlhttpRequest({
        method: "GET",
        url: REMOTE_URL,
        onload: function(response) {
            if (response.status === 200) {
                // Thực thi code từ GitHub
                try {
                    eval(response.responseText);
                    console.log("%c[Danhvux]%c Hệ thống khởi động thành công!", "color:#27c93f; font-weight:bold", "color:#fff");
                } catch (e) {
                    console.error("Lỗi thực thi lõi:", e);
                }
            } else {
                alert("Không thể kết nối máy chủ GitHub. Vui lòng kiểm tra lại mạng!");
            }
        },
        onerror: function() {
            console.error("Lỗi tải script từ GitHub.");
        }
    });
})();
