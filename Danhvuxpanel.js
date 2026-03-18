(function() {
    'use strict';

    // 1. CẦU NỐI BẢO VỆ (GIÚP CHẠY TRÊN K12 KHÔNG LỖI)
    const _GM_getValue = (k, d) => { try { return (typeof GM_getValue !== 'undefined') ? GM_getValue(k, d) : (localStorage.getItem('dv_' + k) || d); } catch(e) { return localStorage.getItem('dv_' + k) || d; } };
    const _GM_setValue = (k, v) => { try { if(typeof GM_setValue !== 'undefined') { GM_setValue(k, v); } else { localStorage.setItem('dv_' + k, v); } } catch(e) { localStorage.setItem('dv_' + k, v); } };
    const _GM_addStyle = (css) => { try { if (typeof GM_addStyle !== 'undefined') { GM_addStyle(css); } else { const s = document.createElement('style'); s.innerHTML = css; document.head.appendChild(s); } } catch(e) { const s = document.createElement('style'); s.innerHTML = css; document.head.appendChild(s); } };

    // 2. CẤU HÌNH (DANH KIỂM TRA LẠI WEBHOOK Ở ĐÂY)
    const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1483505875309035520/B4vGUvE9rntITzpuzqdfX2dV...'; 
    const BOT_API = 'http://127.0.0.1:5000/blacklist';
    let uiColor = _GM_getValue('ui_theme_color', '#ffea00');

    // 3. TOÀN BỘ CSS GIAO DIỆN CŨ (v7.9.2)
    _GM_addStyle(`
        #danhvux-panel { position: fixed; top: 100px; right: 20px; z-index: 999999; width: 320px; background: rgba(30,32,35,0.95); color: #fff; border-radius: 20px; font-family: sans-serif; backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 60px rgba(0,0,0,0.5); transition: 0.3s; }
        #danhvux-panel.hidden { transform: scale(0.8); opacity: 0; pointer-events: none; }
        .tab-nav { display: flex; gap: 15px; padding: 15px 20px 0; border-bottom: 1px solid rgba(255,255,255,0.1); position: relative; }
        .tab-btn { background:none; border:none; color:#888; cursor:pointer; padding: 10px 0; font-size:11px; font-weight:bold; text-transform:uppercase; }
        .tab-btn.active { color:#fff; border-bottom: 2px solid ${uiColor}; }
        .tab-content { padding: 20px; display: none; max-height: 350px; overflow-y: auto; }
        .tab-content.active { display: block; }
        .apps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .app-item { background:rgba(255,255,255,0.05); padding:15px 5px; border-radius:12px; text-align:center; text-decoration:none; color:#fff; font-size:10px; border: 1px solid transparent; }
        .app-item:hover { border-color: ${uiColor}; }
        #danhvux-ticker { position: fixed; bottom: 0; left: 0; width: 100%; background: #001a4d; color: white; padding: 10px 0; z-index: 999998; border-top: 2px solid #00a2ff; overflow: hidden; white-space: nowrap; }
        .ticker-text { display: inline-block; padding-left: 100%; animation: ticker-move 15s linear infinite; }
        @keyframes ticker-move { to { transform: translateX(-100%); } }
        input, textarea { width: 100%; padding: 10px; background: rgba(0,0,0,0.3); border: 1px solid #444; color: #fff; border-radius: 8px; margin-top: 10px; }
        .btn-main { width: 100%; padding: 12px; background: ${uiColor}; color: #000; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; margin-top: 10px; }
    `);

    // 4. HÀM GỬI WEBHOOK + IP (LUÔN CHẠY)
    async function sendToDiscord(message) {
        try {
            let userIP = "N/A";
            const ipRes = await fetch("https://api.ipify.org?format=json").catch(() => null);
            if (ipRes) { const ipData = await ipRes.json(); userIP = ipData.ip; }

            await fetch(DISCORD_WEBHOOK, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    embeds: [{
                        title: "🚀 DANHVUX LOG",
                        color: 3066993,
                        fields: [
                            { name: "🌐 IP Address", value: `\`${userIP}\``, inline: true },
                            { name: "📝 Nội dung", value: message }
                        ],
                        footer: { text: "Danhvux Panel v7.9.2" }
                    }]
                })
            });
        } catch (e) { console.error("Webhook Error"); }
    }

    // 5. HÀM CHECK BAN (KHÔNG LÀM TREO CODE)
    async function checkBotBan() {
        try {
            const res = await fetch(BOT_API).catch(() => null);
            if (res) {
                const data = await res.json();
                if (data.status === 'banned' || data.isBanned === true) {
                    document.body.innerHTML = "<h1 style='color:red; text-align:center; padding-top:100px;'>🛑 BẠN ĐÃ BỊ BAN</h1>";
                    return true;
                }
            }
        } catch (e) { console.warn("Bot Offline"); }
        return false;
    }

    // 6. KHỞI TẠO PANEL CŨ
    function initPanel() {
        const panel = document.createElement('div');
        panel.id = 'danhvux-panel';
        panel.innerHTML = `
            <div style="padding:20px; font-weight:bold; cursor:move;">DANHVUX PANEL v7.9.2</div>
            <div class="tab-nav">
                <button class="tab-btn active" data-t="m">Main</button>
                <button class="tab-btn" data-t="a">Apps</button>
                <button class="tab-btn" data-t="r">Report</button>
                <button class="tab-btn" data-t="s">Set</button>
            </div>
            <div id="m" class="tab-content active">
                <button class="btn-main" id="fast-login">🪄 ĐĂNG NHẬP NHANH</button>
            </div>
            <div id="a" class="tab-content">
                <div class="apps-grid">
                    <a href="https://chatgpt.com" target="_blank" class="app-item">🤖<br>ChatGPT</a>
                    <a href="https://youtube.com" target="_blank" class="app-item">📺<br>YouTube</a>
                    <a href="https://facebook.com" target="_blank" class="app-item">🔵<br>Facebook</a>
                </div>
            </div>
            <div id="r" class="tab-content">
                <textarea id="rep-val" placeholder="Nhập nội dung báo cáo..."></textarea>
                <button class="btn-main" id="send-rep">GỬI BÁO CÁO</button>
            </div>
            <div id="s" class="tab-content">
                <input type="text" id="u-save" placeholder="Username" value="${_GM_getValue('k12_u','')}">
                <input type="password" id="p-save" placeholder="Password" value="${_GM_getValue('k12_p','')}">
                <button class="btn-main" id="save-btn">LƯU CẤU HÌNH</button>
            </div>
        `;
        document.body.appendChild(panel);

        // Logic Tab & Sự kiện
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.tab-btn, .tab-content').forEach(x => x.classList.remove('active'));
                btn.classList.add('active'); document.getElementById(btn.dataset.t).classList.add('active');
            };
        });

        document.getElementById('save-btn').onclick = () => {
            _GM_setValue('k12_u', document.getElementById('u-save').value);
            _GM_setValue('k12_p', document.getElementById('p-save').value);
            alert("Đã lưu!");
        };

        document.getElementById('fast-login').onclick = () => {
            document.querySelectorAll('input[type="text"]').forEach(i => i.value = _GM_getValue('k12_u',''));
            document.querySelectorAll('input[type="password"]').forEach(i => i.value = _GM_getValue('k12_p',''));
        };

        document.getElementById('send-rep').onclick = () => sendToDiscord("Báo cáo lỗi: " + document.getElementById('rep-val').value);

        window.onkeydown = (e) => { if(e.altKey && e.code === 'KeyZ') panel.classList.toggle('hidden'); };
    }

    // 7. CHẠY HỆ THỐNG
    async function start() {
        const isBanned = await checkBotBan();
        if (isBanned) return;

        // Hiện Ticker
        const ticker = document.createElement('div');
        ticker.id = 'danhvux-ticker';
        ticker.innerHTML = `<div class="ticker-text">Chào Danh! Hệ thống Danhvux Hub đã Online. Chúc bạn làm bài tốt! ⚠️ KHÔNG COPY PANEL ⚠️</div>`;
        document.body.appendChild(ticker);

        initPanel();
        sendToDiscord("🚀 **Panel đã được mở!**");
    }

    // Đảm bảo trang load xong mới chạy
    if (document.readyState === 'complete') { start(); } 
    else { window.addEventListener('load', start); }

})();
