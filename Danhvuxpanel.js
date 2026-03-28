// ==UserScript==
// @name         K12 Helper Pro - Danhvux Port 8000 (Turbo x20)
// @namespace    http://tampermonkey.net/
// @version      22.0
// @description  Kết nối Bot Discord qua Port 8000, hỗ trợ Turbo Speed x20 thực tế.
// @author       Danhvux
// @match        *://*.k12online.vn/*
// @grant        GM_xmlhttpRequest
// @connect      api.ipify.org
// @connect      localhost
// ==/UserScript==

(function() {
    'use strict';

    // === CẤU HÌNH HỆ THỐNG ===
    const WEBHOOK_URL = 'https://discord.com/api/webhooks/1483505875309035520/B4vGUvE9rntITzpuzpqdfX2dVBYUXypjG4Gg1MCouzNoIoleYeWom_gh7fIbv9YSC-rV';
    const BLACKLIST_API = 'http://localhost:8000/blacklist'; 

    let config = JSON.parse(localStorage.getItem('k12_ult_cfg')) || {
        mainColor: '#ffea00', width: 320, speed: 1, user: '', pass: '', isDarkMode: true
    };

    const save = () => localStorage.setItem('k12_ult_cfg', JSON.stringify(config));

    // --- HÀM TĂNG TỐC THỰC TẾ (TURBO ENGINE) ---
    const applyTurboSpeed = (speed) => {
        const videos = document.querySelectorAll('video');
        videos.forEach(v => {
            v.playbackRate = parseFloat(speed);
            // Bypass giới hạn mặc định của trình duyệt nếu cần
            if (v.playbackRate > 16) v.playbackRate = 16; 
            
            // Ép video không bị dừng khi mất focus
            v.onpause = () => { if(!v.ended) v.play(); };
        });
    };

    // Tự động duy trì tốc độ mỗi 2 giây (đề phòng K12 reset)
    setInterval(() => {
        if (config.speed > 1) applyTurboSpeed(config.speed);
    }, 2000);

    // --- BẢO MẬT & WEBHOOK (GIỮ NGUYÊN) ---
    const startSecuritySystem = () => {
        return new Promise((resolve) => {
            fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => {
                const userIP = data.ip;
                sendWebhookReport(userIP);
                GM_xmlhttpRequest({
                    method: "GET",
                    url: BLACKLIST_API + "?nocache=" + Date.now(),
                    onload: function(response) {
                        try {
                            const bannedList = JSON.parse(response.responseText);
                            if (bannedList.includes(userIP)) { renderBannedScreen(userIP); resolve(false); }
                            else { resolve(true); }
                        } catch(e) { resolve(true); }
                    },
                    onerror: () => resolve(true)
                });
            })
            .catch(() => resolve(true));
        });
    };

    const sendWebhookReport = (ip) => {
        const msg = {
            "username": "Danhvux Turbo Log",
            "embeds": [{
                "title": "⚡ Hệ thống Turbo x20 Kích hoạt",
                "color": parseInt(config.mainColor.replace('#', ''), 16),
                "fields": [
                    { "name": "🌐 IP", "value": `\`${ip}\``, "inline": true },
                    { "name": "🚀 Speed Set", "value": `\`x${config.speed}\``, "inline": true }
                ],
                "footer": { "text": "Danhvux Panel • Port 8000 • " + new Date().toLocaleString('vi-VN') }
            }]
        };
        fetch(WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(msg) });
    };

    const renderBannedScreen = (ip) => {
        document.body.innerHTML = `<div style="height:100vh; background:#0d1117; color:#ff4d4d; display:flex; align-items:center; justify-content:center; flex-direction:column; font-family:sans-serif;"><h1>🚫 BANNED</h1><p>IP: ${ip} bị từ chối.</p></div>`;
    };

    // --- GIAO DIỆN PANEL ---
    startSecuritySystem().then(accessGranted => {
        if (!accessGranted) return;

        const style = document.createElement('style');
        const updateCSS = () => {
            const isDark = config.isDarkMode;
            style.innerText = `
                :root { --mc: ${config.mainColor}; --w: ${config.width}px; --bg: ${isDark ? '#1e2227' : '#ffffff'}; --text: ${isDark ? '#ffffff' : '#1e2227'}; --border: ${isDark ? '#333' : '#ddd'}; }
                #dv-panel { position: fixed; top: 50px; right: 20px; width: var(--w); background: var(--bg); color: var(--text); border-radius: 12px; font-family: sans-serif; z-index: 100000; box-shadow: 0 10px 40px rgba(0,0,0,0.5); border: 1px solid var(--border); overflow: hidden; }
                .header { padding: 12px; background: rgba(0,0,0,0.1); display: flex; justify-content: space-between; cursor: move; border-bottom: 1px solid var(--border); }
                .tabs { display: flex; background: rgba(0,0,0,0.05); }
                .tab { flex: 1; padding: 10px; text-align: center; cursor: pointer; font-size: 11px; font-weight: bold; opacity: 0.6; }
                .tab.active { opacity: 1; border-bottom: 2px solid var(--mc); color: var(--mc); }
                .content { display: none; padding: 15px; }
                .content.active { display: block; }
                .slider { width: 100%; margin: 15px 0; accent-color: var(--mc); }
                .btn { width: 100%; padding: 10px; margin-top: 10px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; background: var(--mc); color: #000; }
                input[type=text], input[type=password] { width: 100%; padding: 8px; margin-bottom: 10px; background: rgba(0,0,0,0.1); border: 1px solid var(--border); color: var(--text); border-radius: 4px; box-sizing: border-box; }
            `;
        };
        document.head.appendChild(style);
        updateCSS();

        const panel = document.createElement('div');
        panel.id = 'dv-panel';
        panel.innerHTML = `
            <div class="header">
                <span style="color:var(--mc); font-weight:bold">Danhvux Turbo x20</span>
                <div style="display:flex; gap:5px"><div class="dot red" style="width:12px;height:12px;background:#ff5f56;border-radius:50%"></div></div>
            </div>
            <div class="tabs">
                <div class="tab active" data-t="t-main">TỐC ĐỘ</div>
                <div class="tab" data-t="t-set">CÀI ĐẶT</div>
            </div>
            <div id="t-main" class="content active">
                <div style="display:flex; justify-content:space-between"><b>Speed thực tế:</b> <span style="color:var(--mc)">x<span id="sp-txt">${config.speed}</span></span></div>
                <input type="range" id="sp-range" class="slider" min="1" max="20" step="0.5" value="${config.speed}">
                <p style="font-size:10px; color:gray">* Lưu ý: x20 có thể gây giật lag tùy cấu hình máy.</p>
                <button class="btn" id="do-login">AUTO LOGIN</button>
            </div>
            <div id="t-set" class="content">
                <input type="text" id="u-val" placeholder="User" value="${config.user}">
                <input type="password" id="p-val" placeholder="Pass" value="${config.pass}">
                <button class="btn" id="btn-save">LƯU CẤU HÌNH</button>
            </div>
        `;
        document.body.appendChild(panel);

        // --- LOGIC ĐIỀU KHIỂN ---
        const $ = (id) => panel.querySelector(id);

        $('#sp-range').oninput = (e) => {
            const val = e.target.value;
            $('#sp-txt').innerText = val;
            config.speed = val;
            applyTurboSpeed(val);
        };

        $('#btn-save').onclick = () => {
            config.user = $('#u-val').value;
            config.pass = $('#p-val').value;
            save();
            alert('Đã lưu!');
        };

        panel.querySelectorAll('.tab').forEach(tab => {
            tab.onclick = () => {
                panel.querySelectorAll('.tab, .content').forEach(el => el.classList.remove('active'));
                tab.classList.add('active');
                $(`#${tab.dataset.t}`).classList.add('active');
            };
        });

        // Kéo thả Panel
        let isDrag = false, off = [0,0];
        $('.header').onmousedown = (e) => { isDrag = true; off = [panel.offsetLeft - e.clientX, panel.offsetTop - e.clientY]; };
        document.onmousemove = (e) => { if(isDrag) { panel.style.left = (e.clientX + off[0]) + 'px'; panel.style.top = (e.clientY + off[1]) + 'px'; } };
        document.onmouseup = () => isDrag = false;
        $('.red').onclick = () => panel.style.display = 'none';
        document.addEventListener('keydown', (e) => { if(e.key === 'F2') panel.style.display = 'block'; });

    });
})();
