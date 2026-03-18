// ==UserScript==
// @name         K12 Helper Pro - Danhvux Loader v26.2
// @namespace    http://tampermonkey.net/
// @version      26.2
// @description  Hệ thống nạp lõi Danhvux Hub từ Cloud.
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

    // Link GitHub của bạn (Đã được mã hóa nhẹ bằng Base64 để tránh bot scan link)
    const _0x4f22 = "aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2Rhbmh2dXgyMDIvRGFuaHZ1eC1IdWIvcmVmcy9oZWFkcy9tYWluL0Rhbmh2dXhwYW5lbC5qcw==";
    const _0x1a2s = atob(_0x4f22);

    // Hiển thị thông báo nạp hệ thống trong Console
    console.log("%c[Danhvux Hub]%c Đang kết nối máy chủ bảo mật...", "color:#ffea00;font-weight:bold", "color:#fff");

    // Hàm gọi code từ GitHub
    GM_xmlhttpRequest({
        method: "GET",
        url: _0x1a2s + "?cache=" + Date.now(), // Thêm tham số chống lưu cache cũ
        onload: function(response) {
            if (response.status === 200) {
                try {
                    // Thực thi code từ xa
                    const remoteCode = new Function(response.responseText);
                    remoteCode();
                    console.log("%c[Danhvux Hub]%c Đã nạp lõi thành công!", "color:#27c93f;font-weight:bold", "color:#fff");
                } catch (err) {
                    console.error("[Danhvux Error] Lỗi thực thi: ", err);
                }
            } else {
                console.error("[Danhvux Error] Không thể tải dữ liệu từ GitHub.");
            }
        },
        onerror: function() {
            console.error("[Danhvux Error] Lỗi kết nối mạng.");
        }
    });
})();
