(function() {
    'use strict';

    // 1. CẦU NỐI BẢO VỆ (PHẢI CÓ ĐỂ HIỆN PANEL)
    const _GM_getValue = (k, d) => { try { return (typeof GM_getValue !== 'undefined') ? GM_getValue(k, d) : (localStorage.getItem('dv_' + k) || d); } catch(e) { return localStorage.getItem('dv_' + k) || d; } };
    const _GM_setValue = (k, v) => { try { if(typeof GM_setValue !== 'undefined') { GM_setValue(k, v); } else { localStorage.setItem('dv_' + k, v); } } catch(e) { localStorage.setItem('dv_' + k, v); } };
    const _GM_addStyle = (css) => { try { if (typeof GM_addStyle !== 'undefined') { GM_addStyle(css); } else { const s = document.createElement('style'); s.innerHTML = css; document.head.appendChild(s); } } catch(e) { const s = document.createElement('style'); s.innerHTML = css; document.head.appendChild(s); } };

    // 2. CẤU HÌNH GỐC CỦA DANH
    const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1483505875309035520/B4vGUvE9rntITzpuzqdfX2dV...'; // Thay link thật của bạn
    const BOT_API_URL = 'http://127.0.0.1:5000/blacklist';
    let uiWidth = _GM_getValue('ui_width', 320);
    let uiColor = _GM_getValue('ui_theme_color', '#ffea00');

    // 3. TOÀN BỘ CSS (Giao diện chuẩn Mac của Danh)
    _GM_addStyle(`
        #danhvux-panel {
            position: fixed; top: 100px; right: 20px; z-index: 999999;
            width: ${uiWidth}px; background: rgba(30, 32, 35, 0.95);
            color: #ffffff; border-radius: 20px; font-family: sans-serif;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(20px); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s;
        }
        #danhvux-panel.hidden { transform: scale(0.8); opacity: 0; pointer-events: none; }
        #k12-header { padding: 25px 20px 10px; cursor: move; position: relative; }
        .mac-dots { position: absolute; top: 18px; right: 20px; display: flex; gap: 7px; }
        .dot { width: 12px; height: 12px; border-radius: 50%; }
        .close-dot { background: #ff5f57; cursor:pointer; } .min-dot { background: #febc2e; } .max-dot { background: #28c840; }
        .tab-nav { display: flex; gap: 18px; padding: 0 20px; margin-top: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); position: relative; }
        .tab-btn { background: none; border: none; color: #808080; cursor: pointer; font-size: 11px; font-weight: 700; padding: 12px 0; text-transform: uppercase; }
        .tab-btn.active { color: #fff; }
        #tab-indicator { position: absolute; bottom: -1px; height: 2px; background: ${uiColor}; transition: 0.3s; box-shadow: 0 0 8px ${uiColor}; }
        .tab-content { padding: 20px; display: none; max-height: 380px; overflow-y: auto; }
        .tab-content.active { display: block; }
        .apps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .app-item { background: rgba(255,255,255,0.05); border-radius: 15px; padding: 15px 5px; text-align: center; text-decoration: none; color: white; font-size: 10px; border: 1px solid transparent; display: flex; flex-direction: column; align-items: center; }
        .app-item:hover { background: rgba(255,255,255,0.1); border-color: ${uiColor}44; }
        .app-item span { font-size: 20px; margin-bottom: 5px; }
        input[type="range"] { width: 100%; accent-color: ${uiColor}; margin: 10px 0; }
        input[type="text"], input[type="password"], textarea { width: 100%; padding: 12px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 10px; margin-top: 10px; box-sizing: border-box; }
        .auto-login-btn { width: 100%; padding: 14px; border: none; border-radius: 12px; background: ${uiColor}; color: #000; font-weight: 800; cursor: pointer; margin-top: 15px; }
        #danhvux-ticker { position: fixed; bottom: 0; left: 0; width: 100%; background: #001a4d; color: white; padding: 12px 0; z-index: 999998; border-top: 2px solid #00a2ff; overflow: hidden; white-space: nowrap; }
        .ticker-text { display: inline-block; padding-left: 100%; animation: ticker-move 18s linear forwards; }
        @keyframes ticker-move { to { transform: translateX(-100%); } }
    `);

    // 4. HÀM GỬI WEBHOOK & BOT BAN (DÙNG FETCH THAY GM_)
    async function sendToDiscord(message) {
        try {
            let ip = "N/A";
            const ipRes = await fetch("https://api.ipify.org?format=json").catch(() => null);
            if(ipRes) { const d = await ipRes.json(); ip = d.ip; }
            await fetch(DISCORD_WEBHOOK, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    embeds: [{ title: "🔔 BÁO CÁO", color: 3066993, fields: [{ name: "🌐 IP", value: `\`${ip}\``, inline: true }, { name: "📝 Nội dung", value: message }] }]
                })
            });
        } catch (e) { console.warn("Lỗi Webhook."); }
    }

    async function checkSecurity() {
        try {
            const res = await fetch(BOT_API_URL).catch(() => null);
            if (!res) return;
            const bannedIPs = await res.json();
            const ipRes = await fetch("https://api.ipify.org?format=json").catch(() => null);
            if (ipRes) {
                const userData = await ipRes.json();
                if (bannedIPs.includes(userData.ip)) {
                    document.documentElement.innerHTML = `<body style="background:#000; color:red; display:flex; align-items:center; justify-content:center; height:100vh; text-align:center;"><h1>🚫 IP CỦA BẠN ĐÃ BỊ BAN</h1></body>`;
                    window.stop();
                }
            }
        } catch (e) { console.log("Bot Offline."); }
    }

    // 5. TẠO PANEL VỚI ĐẦY ĐỦ CÁC TAB CỦA DANH
    function init() {
        if(document.getElementById('danhvux-panel')) return;
        const panel = document.createElement('div');
        panel.id = 'danhvux-panel';
        panel.innerHTML = `
            <div id="k12-header">
                <div style="font-size: 20px; font-weight: 900;">Danhvux Panel</div>
                <div class="mac-dots">
                    <div class="dot close-dot" id="btn-close"></div>
                    <div class="dot min-dot"></div><div class="dot max-dot"></div>
                </div>
                <div class="tab-nav">
                    <button class="tab-btn active" data-t="main">Main</button>
                    <button class="tab-btn" data-t="apps">Apps</button>
                    <button class="tab-btn" data-t="rep">Report</button>
                    <button class="tab-btn" data-t="set">Settings</button>
                    <div id="tab-indicator"></div>
                </div>
            </div>
            <div id="main" class="tab-content active">
                <div style="display:flex; justify-content:space-between;"><span style="font-size:10px;">Tốc độ:</span><b id="speedVal">x1</b></div>
                <input type="range" id="speedSld" min="1" max="16" step="0.5" value="1">
                <button class="auto-login-btn" id="btn-auto">🪄 ĐĂNG NHẬP NHANH</button>
            </div>
            <div id="apps" class="tab-content">
                <div class="apps-grid">
                    <a href="https://chatgpt.com" target="_blank" class="app-item"><span>🤖</span>ChatGPT</a>
                    <a href="https://youtube.com" target="_blank" class="app-item"><span>📺</span>YouTube</a>
                    <a href="https://facebook.com" target="_blank" class="app-item"><span>🔵</span>FB</a>
                </div>
            </div>
            <div id="rep" class="tab-content">
                <textarea id="rep-msg" placeholder="Nhập lỗi..."></textarea>
                <button class="auto-login-btn" id="btn-send-rep">GỬI ĐI</button>
            </div>
            <div id="set" class="tab-content">
                <input type="text" id="k-u" placeholder="User" value="${_GM_getValue('k12_u','')}">
                <input type="password" id="k-p" placeholder="Pass" value="${_GM_getValue('k12_p','')}">
                <button class="auto-login-btn" id="btn-save">LƯU CÀI ĐẶT</button>
            </div>
        `;
        document.body.appendChild(panel);

        // Logic Tab & Xử lý sự kiện
        const indicator = document.getElementById('tab-indicator');
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.tab-btn, .tab-content').forEach(x => x.classList.remove('active'));
                btn.classList.add('active'); document.getElementById(btn.dataset.t).classList.add('active');
                indicator.style.width = btn.offsetWidth + 'px'; indicator.style.left = btn.offsetLeft + 'px';
            };
        });

        document.getElementById('btn-close').onclick = () => panel.classList.add('hidden');
        document.getElementById('btn-save').onclick = () => {
            _GM_setValue('k12_u', document.getElementById('k-u').value);
            _GM_setValue('k12_p', document.getElementById('k-p').value);
            alert("Đã lưu!");
        };
        document.getElementById('btn-auto').onclick = () => {
            document.querySelectorAll('input[type="text"]').forEach(i => i.value = _GM_getValue('k12_u',''));
            document.querySelectorAll('input[type="password"]').forEach(i => i.value = _GM_getValue('k12_p',''));
        };
        document.getElementById('speedSld').oninput = (e) => {
            document.getElementById('speedVal').innerText = 'x' + e.target.value;
            if(document.querySelector('video')) document.querySelector('video').playbackRate = e.target.value;
        };

        // Kéo thả
        let drag = false, ox, oy;
        document.getElementById('k12-header').onmousedown = (e) => { drag = true; ox = e.clientX - panel.offsetLeft; oy = e.clientY - panel.offsetTop; };
        document.onmousemove = (e) => { if(drag) { panel.style.left = (e.clientX - ox) + 'px'; panel.style.top = (e.clientY - oy) + 'px'; } };
        document.onmouseup = () => drag = false;

        // Alt + Z
        window.onkeydown = (e) => { if(e.altKey && e.code === 'KeyZ') panel.classList.toggle('hidden'); };
    }

    // 6. KHỞI CHẠY
    async function start() {
        await checkSecurity();
        const ticker = document.createElement('div');
        ticker.id = 'danhvux-ticker';
        ticker.innerHTML = `<div class="ticker-text">Hệ thống Danhvux Hub v12 đã sẵn sàng!</div>`;
        document.body.appendChild(ticker);
        setTimeout(() => ticker.remove(), 15000);
        
        init();
        sendToDiscord("🚀 **Panel v12 Online!**");
    }

    if (document.readyState === 'complete') start(); else window.addEventListener('load', start);

})();
