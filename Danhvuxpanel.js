// ==UserScript==
// @name         K12 Helper Pro - Danhvux Port 8000 (Full Admin Mode)
// @namespace    http://tampermonkey.net/
// @version      21.4
// @description  Giữ nguyên 100% giao diện cũ, thêm Tab Admin quản lý IP khi nhập đúng Key.
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
    const ADMIN_KEY_SECRET = "HGXFxIAJDJIASXNAISXASAXZAX"; // KEY ĐỂ MỞ TAB ADMIN

    let config = JSON.parse(localStorage.getItem('k12_ult_cfg')) || {
        mainColor: '#ffea00', width: 320, speed: 1, user: '', pass: '', isDarkMode: true, adminKey: ''
    };

    let bannedIPs = []; 
    const save = () => localStorage.setItem('k12_ult_cfg', JSON.stringify(config));

    // --- HÀM ÉP TỐC ĐỘ & BỎ QUA CÂU HỎI (X20 THỰC TẾ) ---
    const turboEngine = () => {
        const v = document.querySelector('video');
        if (v && config.speed > 1) {
            v.playbackRate = parseFloat(config.speed);
            if (v.paused && !v.ended) v.play();
        }
        const skipButtons = document.querySelectorAll('.vjs-skip-question, .btn-confirm, .btn-next-question, .vjs-done-button');
        skipButtons.forEach(btn => btn.click());
        const overlay = document.querySelector('.vjs-question-display, .vjs-modal-dialog');
        if (overlay) { overlay.style.display = 'none'; if (v) v.play(); }
    };
    setInterval(turboEngine, 1000);

    // --- HÀM KIỂM TRA IP & BLACKLIST ---
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
                            bannedIPs = JSON.parse(response.responseText);
                            if (bannedIPs.includes(userIP)) {
                                renderBannedScreen(userIP);
                                resolve(false);
                            } else { resolve(true); }
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
            "username": "Danhvux System Log",
            "embeds": [{
                "title": "🛡️ Hệ thống Danhvux x20 + Admin Active",
                "color": parseInt(config.mainColor.replace('#', ''), 16),
                "fields": [
                    { "name": "🌐 IP", "value": `\`${ip}\``, "inline": true },
                    { "name": "🔑 Trạng thái Admin", "value": config.adminKey === ADMIN_KEY_SECRET ? "Đã kích hoạt" : "Chưa nhập Key", "inline": true }
                ],
                "footer": { "text": "Danhvux Panel • Port 8000 • " + new Date().toLocaleString('vi-VN') }
            }]
        };
        fetch(WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(msg) });
    };

    const renderBannedScreen = (ip) => {
        document.body.innerHTML = `<div style="height:100vh; background:#0d1117; color:#ff4d4d; display:flex; align-items:center; justify-content:center; flex-direction:column; font-family:sans-serif; text-align:center;"><h1>🚫 BANNED</h1><p>IP của bạn (<b>${ip}</b>) đã bị cấm.</p></div>`;
    };

    // --- KHỞI TẠO GIAO DIỆN CHÍNH (GIỮ NGUYÊN CSS) ---
    startSecuritySystem().then(accessGranted => {
        if (!accessGranted) return;

        const style = document.createElement('style');
        const updateCSS = () => {
            const isDark = config.isDarkMode;
            style.innerText = `
                :root { 
                    --mc: ${config.mainColor}; --w: ${config.width}px;
                    --bg: ${isDark ? '#1e2227' : '#ffffff'}; --bg-tab: ${isDark ? '#1a1d21' : '#f0f0f0'};
                    --bg-input: ${isDark ? '#252a31' : '#f9f9f9'}; --text: ${isDark ? '#ffffff' : '#1e2227'};
                    --text-sec: ${isDark ? '#777' : '#999'}; --border: ${isDark ? '#333' : '#ddd'};
                    --shadow: ${isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.1)'};
                }
                #dv-panel { position: fixed; top: 50px; right: 20px; width: var(--w) !important; background: var(--bg); color: var(--text); border-radius: 12px; font-family: 'Segoe UI', sans-serif; z-index: 100000; box-shadow: 0 10px 40px var(--shadow); overflow: hidden; transition: height 0.4s ease; border: 1px solid var(--border); }
                .header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; cursor: move; }
                .header .title { color: var(--mc); font-weight: bold; font-size: 18px; }
                .dots { display: flex; gap: 8px; }
                .dot { height: 12px; width: 12px; border-radius: 50%; cursor: pointer; }
                .red { background: #ff5f56; } .yellow { background: #ffbd2e; } .green { background: #27c93f; }
                .tabs { display: flex; background: var(--bg-tab); padding: 0 5px; border-bottom: 1px solid var(--border); justify-content: space-around; }
                .tab { padding: 12px 10px; cursor: pointer; font-size: 10px; color: var(--text-sec); font-weight: 900; position: relative; transition: 0.3s; }
                .tab.active { color: var(--mc); }
                .tab.active::after { content: ''; position: absolute; bottom: 0; left: 10px; right: 10px; height: 3px; background: var(--mc); border-radius: 3px 3px 0 0; }
                .content { display: none; padding: 20px; box-sizing: border-box; }
                .content.active { display: block; }
                .row-speed { display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 5px; }
                .val-right { color: var(--mc); font-weight: bold; font-size: 16px; }
                .slider { width: 100%; height: 5px; background: var(--border); border-radius: 5px; appearance: none; margin: 10px 0 25px 0; outline: none; }
                .slider::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; background: ${isDark ? '#fff' : 'var(--mc)'}; border-radius: 50%; cursor: pointer; }
                .app-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
                .app-item { background: var(--bg-input); padding: 12px 5px; border-radius: 10px; cursor: pointer; border: 1px solid var(--border); text-align: center; }
                input[type=text], input[type=password] { width: 100%; padding: 12px; background: var(--bg-input); border: 1px solid var(--border); color: var(--text); border-radius: 8px; margin-bottom: 12px; box-sizing: border-box; }
                .btn { width: 100%; padding: 14px; background: #b8cc8e; border: none; border-radius: 12px; color: #1e2227; font-weight: bold; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
                .btn-save { background: var(--mc) !important; color: #000; }
                .footer { text-align: center; font-size: 9px; color: var(--text-sec); padding: 10px; }
                .ip-list { max-height: 120px; overflow-y: auto; background: var(--bg-input); padding: 10px; border-radius: 8px; font-size: 11px; margin-bottom: 10px; border: 1px solid var(--border); }
                .ip-item { color: #ff5f56; border-bottom: 1px solid var(--border); padding: 5px 0; display: flex; justify-content: space-between; }
            `;
        };
        document.head.appendChild(style);
        updateCSS();

        const panel = document.createElement('div');
        panel.id = 'dv-panel';
        panel.innerHTML = `
            <div class="header">
                <div class="title">Danhvux Panel</div>
                <div class="dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
            </div>
            <div class="tabs">
                <div class="tab active" data-t="t-main">MAIN</div>
                <div class="tab" data-t="t-video">VIDEO</div>
                <div class="tab" data-t="t-apps">APPS</div>
                <div class="tab" data-t="t-set">SETTINGS</div>
                ${config.adminKey === ADMIN_KEY_SECRET ? '<div class="tab" data-t="t-admin" style="color:#ff5f56">ADMIN</div>' : ''}
            </div>
            <div class="body-container">
                <div id="t-main" class="content active">
                    <div class="row-speed"><b>Tốc độ</b><span class="val-right">x<span id="sp-txt">${config.speed}</span></span></div>
                    <input type="range" id="sp-range" class="slider" min="1" max="20" step="0.5" value="${config.speed}">
                    <button class="btn" id="do-login">🪄 AUTO LOGIN</button>
                </div>
                <div id="t-video" class="content">
                    <input type="text" id="v-url" placeholder="Link video .mp4...">
                    <button class="btn" style="background:#444; color:#fff" id="v-run">PHÁT VIDEO</button>
                </div>
                <div id="t-apps" class="content">
                    <div class="app-grid">
                        <div class="app-item" onclick="window.open('https://gemini.google.com')">✨ Gemini</div>
                        <div class="app-item" onclick="window.open('https://chatgpt.com')">🤖 GPT</div>
                        <div class="app-item" onclick="window.open('https://messenger.com')">💬 Msg</div>
                        <div class="app-item" onclick="window.open('https://facebook.com')">📘 FB</div>
                        <div class="app-item" onclick="window.open('https://youtube.com')">🔴 YT</div>
                        <div class="app-item" onclick="window.open('https://tiktok.com')">🎵 TT</div>
                    </div>
                </div>
                <div id="t-set" class="content">
                    <input type="password" id="admin-key-input" placeholder="Nhập Key Admin..." value="${config.adminKey}">
                    <input type="text" id="u-val" placeholder="Username..." value="${config.user}">
                    <input type="password" id="p-val" placeholder="Password..." value="${config.pass}">
                    <input type="color" id="c-pick" style="width:100%; height:40px; background:none; border:none;" value="${config.mainColor}">
                    <button class="btn btn-save" id="btn-save">LƯU CÀI ĐẶT</button>
                </div>
                <div id="t-admin" class="content">
                    <b style="color:#ff5f56; font-size: 13px;">BLACK LIST IP:</b>
                    <div class="ip-list" id="ip-list-box"> Đang tải... </div>
                    <button class="btn" id="refresh-ip" style="background:#333; color:white; font-size:10px">RELOAD SYSTEM</button>
                </div>
            </div>
            <div class="footer">DANHVUX • K12 HELPER</div>
        `;
        document.body.appendChild(panel);

        const $ = (id) => panel.querySelector(id);
        const adjustHeight = () => {
            const active = panel.querySelector('.content.active');
            if(active) panel.style.height = (panel.querySelector('.header').offsetHeight + panel.querySelector('.tabs').offsetHeight + active.scrollHeight + 35) + 'px';
        };

        const renderIPList = () => {
            const box = $('#ip-list-box');
            if(box) box.innerHTML = bannedIPs.length ? bannedIPs.map(ip => `<div class="ip-item"><span>${ip}</span> <span>🚫</span></div>`).join('') : 'Trống';
        };

        panel.querySelectorAll('.tab').forEach(tab => {
            tab.onclick = () => {
                panel.querySelectorAll('.tab, .content').forEach(el => el.classList.remove('active'));
                tab.classList.add('active');
                $(`#${tab.dataset.t}`).classList.add('active');
                if(tab.dataset.t === 't-admin') renderIPList();
                adjustHeight();
            };
        });

        $('#btn-save').onclick = () => {
            config.adminKey = $('#admin-key-input').value;
            config.user = $('#u-val').value;
            config.pass = $('#p-val').value;
            config.mainColor = $('#c-pick').value;
            save();
            updateCSS();
            alert('Đã lưu! Hệ thống sẽ reload để cập nhật Tab Admin.');
            location.reload();
        };

        $('#sp-range').oninput = (e) => { $('#sp-txt').innerText = e.target.value; config.speed = e.target.value; };
        $('#v-run').onclick = () => { const v = document.querySelector('video'); if (v) { v.src = $('#v-url').value; v.play(); } };
        $('#refresh-ip').onclick = () => location.reload();

        $('#do-login').onclick = () => {
            const u = document.querySelector('input[name="username"]'), p = document.querySelector('input[name="password"]');
            if(u && p) { u.value = config.user; p.value = config.pass; u.dispatchEvent(new Event('input',{bubbles:true})); p.dispatchEvent(new Event('input',{bubbles:true})); setTimeout(()=>document.querySelector('button[type="submit"]').click(), 500); }
        };

        // Kéo thả & Phím tắt
        let isDrag = false, off = [0,0];
        $('.header').onmousedown = (e) => { isDrag = true; off = [panel.offsetLeft - e.clientX, panel.offsetTop - e.clientY]; };
        document.onmousemove = (e) => { if(isDrag) { panel.style.left = (e.clientX + off[0]) + 'px'; panel.style.top = (e.clientY + off[1]) + 'px'; panel.style.right = 'auto'; } };
        document.onmouseup = () => isDrag = false;
        $('.red').onclick = () => panel.style.display = 'none';
        document.addEventListener('keydown', (e) => { if(e.key === 'F2') panel.style.display = 'block'; });

        setTimeout(adjustHeight, 100);
    });
})();
