// ==UserScript==
// @name         Danhvux Hub Loader - Official
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Loader chuẩn cho Danhvux Hub (Auto Update)
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

    // Link RAW chuẩn đến file Danhvuxpanel.js của bạn
    // Lưu ý: Phải có chữ "raw" ở giữa link
    const GITHUB_RAW_URL = "https://raw.githubusercontent.com/danhvux202/Danhvux-Hub/main/Danhvuxpanel.js";

    console.log("%c[Danhvux Hub]%c Đang kết nối server...", "color:#ffea00;font-weight:bold;", "color:#fff;");

    function startLoader() {
        GM_xmlhttpRequest({
            method: "GET",
            // Thêm tham số v=Date.now để ép GitHub trả về file mới nhất bạn vừa sửa
            url: GITHUB_RAW_URL + "?v=" + Date.now(),
            onload: function(response) {
                if (response.status === 200) {
                    try {
                        // Thực thi toàn bộ code JS từ GitHub
                        const script = new Function(response.responseText);
                        script();
                        console.log("%c[Danhvux Hub]%c Tải thành công!", "color:#00ff00;font-weight:bold;", "color:#fff;");
                    } catch (err) {
                        console.error("[Lỗi Nội Dung]: Code trong Danhvuxpanel.js có lỗi cú pháp!", err);
                    }
                } else {
                    console.error("[Lỗi Server]: Không tìm thấy file trên GitHub (404). Kiểm tra lại link RAW.");
                }
            },
            onerror: function(err) {
                console.error("[Lỗi Kết Nối]: Không thể tải code. Kiểm tra mạng hoặc GitHub.");
            }
        });
    }

    // Chạy Loader ngay lập tức
    startLoader();

})();
