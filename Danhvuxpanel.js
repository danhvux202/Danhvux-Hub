// ==UserScript==
// @name         K12 Helper Pro - Danhvux v23.9 (Smooth Background Transition)
// @namespace    http://tampermonkey.net/
// @version      23.9
// @description  Full 6 Apps, Dynamic Height, Full Animation (Background & Switch), Cooldown.
// @author       Danhvux
// @match        *://*.k12online.vn/*
// @grant        GM_xmlhttpRequest
// @connect      api.ipify.org
// @connect      localhost
// ==/UserScript==

(function() {
    'use strict';

    const WEBHOOK_URL = 'https://discord.com/api/webhooks/1483505875309035520/B4vGUvE9ntITzpuzpqdfX2dVBYUXypjG4Gg1MCouzNoIoleYeWom_gh7fIbv9YSC-rV';
    const BLACKLIST_API = 'http://localhost:8000/blacklist';
    const COOLDOWN_TIME = 60 * 60 * 1000;

    let config = JSON.parse(localStorage.getItem('k12_ult_cfg')) || {
        mainColor: '#ffea00', width: 320, speed: 1, user: '', pass: '', isDarkMode: true
    };
    const save = () => localStorage.setItem('k12_ult_cfg', JSON.stringify(config));

    // --- SECURITY & COOLDOWN (1 HOUR) ---
    const startSecurity = () => {
        return new Promise((resolve) => {
            fetch('https://api.ipify.org?format=json').then(r => r.json()).then(data => {
                const userIP = data.ip;
                const lastSend = localStorage.getItem('k12_last_webhook');
                const now = Date.now();
                if (!lastSend || (now - lastSend) > COOLDOWN_TIME) {
                    fetch(WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ "username": "Danhvux Log", "embeds": [{"title": "🛡️ v23.9 Online", "color": parseInt(config.mainColor.replace('#', ''), 16), "fields": [{"name":"IP","value":userIP}]}]})});
                    localStorage.setItem('k12_last_webhook', now);
                }
                GM_xmlhttpRequest({ method: "GET", url: BLACKLIST_API + "?t=" + Date.now(), onload: (res) => {
                    try { if (JSON.parse(res.responseText).includes(userIP)) { document.body.innerHTML = "🚫 BANNED"; resolve(false); } else resolve(true); } catch(e) { resolve(true); }
                }, onerror: () => resolve(true) });
            }).catch(() => resolve(true));
        });
    };

    // --- UI ENGINE ---
    startSecurity().then(ok => {
        if (!ok) return;

        const style = document.createElement('style');
        const updateCSS = () => {
            const dark = config.isDarkMode;
            const animTime = '0.5s ease-in-out'; // Thời gian animation chuyển màu nền

            style.innerText = `
                :root { --mc: ${config.mainColor}; --w: ${config.width}px; --bg: ${dark ? '#1e2227' : '#ffffff'}; --bg-tab: ${dark ? '#1a1d21' : '#f0f0f0'}; --text: ${dark ? '#ffffff' : '#1e2227'}; --border: ${dark ? '#333' : '#ddd'}; }

                #dv-panel { position: fixed; top: 50px; right: 20px; width: var(--w) !important;
                    /* Animation đổi nền */
                    background: var(--bg); color: var(--text); border-color: var(--border); transition: height 0.35s ease-out, background ${animTime}, color ${animTime}, border ${animTime};
                    border-radius: 12px; font-family: 'Segoe UI', sans-serif; z-index: 100000; box-shadow: 0 10px 40px rgba(0,0,0,0.5); overflow: hidden; border: 1px solid; }

                .header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; cursor: move; }
                .header .title { color: var(--mc); font-weight: bold; font-size: 18px; }
                .dots { display: flex; gap: 8px; } .dot { height: 12px; width: 12px; border-radius: 50%; cursor: pointer; }
                .red { background: #ff5f56; } .yel { background: #ffbd2e; } .grn { background: #27c93f; }

                /* Animation đổi nền tab */
                .tabs { display: flex; background: var(--bg-tab); border-bottom: 1px solid var(--border); transition: background ${animTime}, border ${animTime}; position: relative; }
                .tab { flex:1; padding: 12px 0; text-align: center; cursor: pointer; font-size: 10px; font-weight: 900; color: #777; transition: 0.3s; z-index: 2; }
                .tab.active { color: var(--mc); }
                .tab-indicator { position: absolute; bottom: 0; height: 3px; background: var(--mc); transition: all 0.3s ease; border-radius: 3px; }

                .content-view { overflow: hidden; }
                .content-wrapper { display: flex; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); width: 400%; align-items: flex-start; }
                .content { width: 25%; padding: 20px; box-sizing: border-box; opacity: 0; transition: opacity 0.3s; pointer-events: none; }
                .content.active { opacity: 1; pointer-events: auto; }

                /* elements */
                .switch { position: relative; display: inline-block; width: 44px; height: 22px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider-sw { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #555; transition: .4s; border-radius: 34px; border: 1px solid rgba(255,255,255,0.1); }
                .slider-sw:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 2px; background: white; transition: .4s cubic-bezier(0.68, -0.55, 0.265, 1.55); border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
                input:checked + .slider-sw { background: var(--mc); border-color: transparent; }
                input:checked + .slider-sw:before { transform: translateX(20px); width: 18px; }
                input:focus + .slider-sw { box-shadow: 0 0 1px var(--mc); }

                /* Learning Status Adaptive */
                .status-container { background: rgba(0,0,0,0.15); border-radius: 8px; padding: 10px; margin-bottom: 15px; border: 1px solid var(--border); }
                .status-item { display: flex; align-items: center; justify-content: space-between; font-size: 11px; margin-bottom: 8px; padding: 5px; border-radius: 4px; overflow: hidden; }
                .status-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70%; transition: all 0.3s ease; }
                .status-item:hover .status-text { white-space: normal; max-width: 100%; }
                .status-btn { background: var(--mc); color: #000; padding: 3px 10px; border-radius: 5px; cursor: pointer; font-weight: bold; flex-shrink: 0; }

                .slider-range { width: 100%; height: 5px; background: var(--border); border-radius: 5px; appearance: none; margin: 10px 0 20px 0; outline: none; }
                .slider-range::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; background: #fff; border-radius: 50%; cursor: pointer; }
                .video-box { width: 100%; height: 80px; background: #000; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #555; font-size: 13px; margin-bottom: 15px; border: 1px solid #222; }

                input[type=text], input[type=password] { width: 100%; padding: 12px; background: rgba(0,0,0,0.1); border: 1px solid var(--border); color: var(--text); border-radius: 8px; margin-bottom: 10px; box-sizing: border-box; transition: color ${animTime}, background ${animTime}, border ${animTime}; }
                .btn { width: 100%; padding: 12px; background: #b8cc8e; border: none; border-radius: 12px; color: #1e2227; font-weight: bold; cursor: pointer; transition: transform 0.2s; }
                .btn:active { transform: scale(0.95); }
                .app-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
                .app-item { background: rgba(255,255,255,0.05); padding: 10px 5px; border-radius: 8px; cursor: pointer; border: 1px solid var(--border); text-align: center; font-size: 11px; font-weight: bold; transition: 0.2s; }
                .app-item:hover { border-color: var(--mc); color: var(--mc); }
                .footer { text-align:center; font-size:9px; color:#555; padding:8px; transition: color ${animTime}; }
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
                            <div id="status-list"><div style="font-size:10px; color:#666;">Đang quét...</div></div>
                        </div>
                        <div style="font-weight:bold; font-size:14px;">Tốc độ x<span id="sp-txt">${config.speed}</span></div>
                        <input type="range" id="sp-range" class="slider-range" min="1" max="16" step="0.5" value="${config.speed}">
                        <button class="btn" id="do-login">🪄 AUTO LOGIN</button>
                    </div>
                    <div class="content">
                        <div class="video-box">Video sẽ phát ở đây</div>
                        <input type="text" id="v-url" placeholder="Link video .mp4...">
                        <button class="btn" style="background:#444; color:#fff" id="v-run">PHÁT VIDEO SOURCE</button>
                    </div>
                    <div class="content">
                        <div class="app-grid">
                            <div class="app-item" onclick="window.open('https://gemini.google.com')">Gemini</div><div class="app-item" onclick="window.open('https://chatgpt.com')">GPT</div><div class="app-item" onclick="window.open('https://messenger.com')">Msg</div>
                            <div class="app-item" onclick="window.open('https://facebook.com')">FB</div><div class="app-item" onclick="window.open('https://youtube.com')">YT</div><div class="app-item" onclick="window.open('https://tiktok.com')">TikTok</div>
                        </div>
                    </div>
                    <div class="content">
                        <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-weight:bold; font-size:13px;">CHẾ ĐỘ TỐI <label class="switch"><input type="checkbox" id="mode-toggle" ${config.isDarkMode ? 'checked' : ''}><span class="slider-sw"></span></label></div>
                        <div style="font-weight:bold; font-size:13px; margin-bottom:5px;">MÀU CHỦ ĐẠO</div><input type="color" id="c-pick" style="height:35px; width:100%; border:none; background:none; cursor:pointer;" value="${config.mainColor}">
                        <div style="font-weight:bold; font-size:13px; margin-top:5px;">CHIỀU RỘNG HUB</div><input type="range" id="w-range" class="slider-range" min="280" max="600" value="${config.width}">
                        <input type="text" id="u-val" placeholder="User..." value="${config.user}"><input type="password" id="p-val" placeholder="Pass..." value="${config.pass}">
                        <button class="btn" id="btn-save" style="background:var(--mc); color:#000; font-size:14px;">LƯU CÀI ĐẶT</button>
                    </div>
                </div>
            </div>
            <div class="footer">DANHVUX • V23.9</div>
        `;
        document.body.appendChild(panel);

        // --- SCAN LOGIC (UPDATE HEIGHT DYNAMICALLY) ---
        const scan = () => {
            const list = document.getElementById('status-list');
            const items = document.querySelectorAll('.list-lesson-item');
            if (items.length === 0) { list.innerHTML = '<div style="font-size:10px;">Đang quét...</div>'; return; }
            let found = false; list.innerHTML = '';
            items.forEach((item, i) => {
                const pc = item.querySelector('.percent-complete')?.innerText || '0%';
                if (parseInt(pc) < 100) {
                    found = true;
                    const name = item.querySelector('.lesson-name')?.innerText || 'Bài học';
                    const d = document.createElement('div'); d.className = 'status-item';
                    d.innerHTML = `<span class="status-text">${name} (${pc})</span><span class="status-btn" onclick="document.querySelectorAll('.list-lesson-item')[${i}].click()">MỞ</span>`;
                    list.appendChild(d);
                }
            });
            if (!found) list.innerHTML = '<div style="font-size:10px; color:#27c93f;">🎉 Đã hoàn thành 100%!</div>';
            updateHeight();
        };
        setInterval(scan, 2500);

        // --- ANIMATION & HEIGHT ---
        const tabs = panel.querySelectorAll('.tab');
        const indicator = document.getElementById('indicator');
        const wrapper = document.getElementById('c-wrapper');
        const contents = panel.querySelectorAll('.content');

        const updateHeight = () => {
            const activeContent = panel.querySelector('.content.active');
            if (activeContent) {
                const headerH = panel.querySelector('.header').offsetHeight;
                const tabsH = panel.querySelector('.tabs').offsetHeight;
                const footerH = panel.querySelector('.footer').offsetHeight;
                panel.style.height = (headerH + tabsH + activeContent.scrollHeight + footerH) + 'px';
            }
        };

        const moveTab = (idx) => {
            const tabWidth = 100 / tabs.length;
            indicator.style.width = `calc(${tabWidth}% - 16px)`;
            indicator.style.left = `calc(${idx * tabWidth}% + 8px)`;
            wrapper.style.transform = `translateX(-${idx * 25}%)`;
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tabs[idx].classList.add('active');
            contents[idx].classList.add('active');
            setTimeout(updateHeight, 50);
        };

        tabs.forEach(tab => tab.onclick = () => moveTab(tab.dataset.idx));

        const $ = (id) => panel.querySelector(id);
        $('#w-range').oninput = (e) => { config.width = e.target.value; panel.style.setProperty('width', config.width + 'px', 'important'); };
        $('#mode-toggle').onchange = (e) => { config.isDarkMode = e.target.checked; updateCSS(); save(); setTimeout(updateHeight, 50); }; // Đợi tí rồi tính lại chiều cao
        $('#sp-range').oninput = (e) => { $('#sp-txt').innerText = e.target.value; config.speed = e.target.value; document.querySelectorAll('video').forEach(v => v.playbackRate = config.speed); };
        $('#btn-save').onclick = () => { config.mainColor = $('#c-pick').value; config.user = $('#u-val').value; config.pass = $('#p-val').value; save(); updateCSS(); alert('Đã lưu!'); };
        $('#v-run').onclick = () => { const v = document.querySelector('video'); if (v) { v.src = $('#v-url').value; v.play(); } };

        let drag = false, o = [0,0];
        $('.header').onmousedown = (e) => { drag = true; o = [panel.offsetLeft - e.clientX, panel.offsetTop - e.clientY]; };
        document.onmousemove = (e) => { if(drag) { panel.style.left = (e.clientX + o[0]) + 'px'; panel.style.top = (e.clientY + o[1]) + 'px'; panel.style.right = 'auto'; } };
        document.onmouseup = () => drag = false;
        $('.red').onclick = () => panel.style.display = 'none';
        document.addEventListener('keydown', (e) => { if(e.key === 'F2') panel.style.display = 'block'; });

        moveTab(0);
    });
})();
