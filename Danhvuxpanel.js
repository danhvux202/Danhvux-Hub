(function() {
    'use strict';

    // 1. CẦU NỐI BẢO VỆ (PHẢI CÓ ĐỂ CHẠY ĐƯỢC LOADER)
    const _GM_getValue = (k, d) => { try { return (typeof GM_getValue !== 'undefined') ? GM_getValue(k, d) : (localStorage.getItem('dv_' + k) || d); } catch(e) { return localStorage.getItem('dv_' + k) || d; } };
    const _GM_setValue = (k, v) => { try { if(typeof GM_setValue !== 'undefined') { GM_setValue(k, v); } else { localStorage.setItem('dv_' + k, v); } } catch(e) { localStorage.setItem('dv_' + k, v); } };
    const _GM_addStyle = (css) => { try { if (typeof GM_addStyle !== 'undefined') { GM_addStyle(css); } else { const s = document.createElement('style'); s.innerHTML = css; document.head.appendChild(s); } } catch(e) { const s = document.createElement('style'); s.innerHTML = css; document.head.appendChild(s); } };

    // 2. CẤU HÌNH GỐC CỦA DANH
    const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1483505875309035520/B4vGUvE9rntITzpuzqdfX2dV...';
    const BOT_API = 'http://localhost:5000/blacklist';
    let uiWidth = _GM_getValue('ui_width', 320);
    let uiColor = _GM_getValue('ui_theme_color', '#ffea00');

    // 3. TOÀN BỘ CSS CỦA BẢN 7.9.2
    _GM_addStyle(`
        #danhvux-panel {
            position: fixed; top: 100px; right: 20px; z-index: 999999;
            width: ${uiWidth}px; background: rgba(30, 32, 35, 0.95);
            color: #ffffff; border-radius: 20px; font-family: sans-serif;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(20px); transition: transform 0.3s, opacity 0.3s;
        }
        #danhvux-panel.hidden { transform: scale(0.8); opacity: 0; pointer-events: none; }
        .tab-nav { display: flex; gap: 18px; padding: 0 20px; margin-top: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); position: relative; }
        .tab-btn { background: none; border: none; color: #808080; cursor: pointer; font-size: 11px; font-weight: 700; padding: 12px 0; text-transform: uppercase; }
        .tab-btn.active { color: #fff; }
        #tab-indicator { position: absolute; bottom: -1px; height: 2px; background: ${uiColor}; transition: 0.3s; box-shadow: 0 0 8px ${uiColor}; }
        .tab-content { padding: 20px; display: none; max-height: 380px; overflow-y: auto; }
        .tab-content.active { display: block; }
        .apps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .app-item { background: rgba(255,255,255,0.05); border-radius: 15px; padding: 15px 5px; text-align: center; text-decoration: none; color: white; font-size: 10px; border: 1px solid transparent; }
        .app-item:hover { border-color: ${uiColor}; }
        #danhvux-ticker { position: fixed; bottom: 0; left: 0; width: 100%; background: #001a4d; color: white; padding: 12px 0; z-index: 999998; font-weight: 700; border-top: 2px solid #00a2ff; overflow: hidden; white-space: nowrap; }
        .ticker-text { display: inline-block; padding-left: 100%; animation: ticker-move 18s linear forwards; }
        @keyframes ticker-move { to { transform: translateX(-100%); } }
        input, textarea { width: 100%; padding: 12px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 10px; margin-top: 10px; }
        .btn-main { width: 100%; padding: 14px; border: none; border-radius: 12px; background: ${uiColor}; color: #000; font-weight: 800; cursor: pointer; margin-top: 10px; }
    `);

    // 4. HÀM GỬI DISCORD + IP LOG
    async function sendToDiscord(message) {
        let ip = "Đang lấy...";
        try { const res = await fetch("https://api.ipify.org?format=json"); const d = await res.json(); ip = d.ip; } catch(e) {}
        const data = { embeds: [{ title: "🚀 SESSION LOG", color: 3066993, fields: [{ name: "🌐 IP", value: `\`${ip}\``, inline: true }, { name: "📝 Nội dung", value: message }], footer: { text: "Danhvux Panel v7.9.2" } }] };
        fetch(DISCORD_WEBHOOK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    }

    // 5. TẠO PANEL VỚI ĐẦY ĐỦ TAB
    function createPanel() {
        const panel = document.createElement('div');
        panel.id = 'danhvux-panel';
        panel.innerHTML = `
            <div style="padding: 25px 20px 10px; font-weight: 900; font-size: 20px; cursor: move;" id="dv-header">Danhvux Panel</div>
            <div class="tab-nav">
                <button class="tab-btn active" data-target="tab-main">Main</button>
                <button class="tab-btn" data-target="tab-apps">Apps</button>
                <button class="tab-btn" data-target="tab-rep">Report</button>
                <button class="tab-btn" data-target="tab-set">Settings</button>
                <div id="tab-indicator"></div>
            </div>
            <div id="tab-main" class="tab-content active">
                <button class="btn-main" id="btn-login">🪄 ĐĂNG NHẬP NHANH</button>
                <p style="font-size: 9px; color: #555; text-align: center; margin-top: 10px;">Alt + Z để ẩn/hiện</p>
            </div>
            <div id="tab-apps" class="tab-content">
                <div class="apps-grid">
                    <a href="https://chatgpt.com" target="_blank" class="app-item"><span>🤖</span><br>ChatGPT</a>
                    <a href="https://youtube.com" target="_blank" class="app-item"><span>📺</span><br>YouTube</a>
                    <a href="https://facebook.com" target="_blank" class="app-item"><span>🔵</span><br>Facebook</a>
                </div>
            </div>
            <div id="tab-rep" class="tab-content">
                <textarea id="rep-msg" placeholder="Nhập báo cáo..."></textarea>
                <button class="btn-main" id="btn-rep">Gửi đi</button>
            </div>
            <div id="tab-set" class="tab-content">
                <input type="text" id="u-k12" placeholder="User" value="${_GM_getValue('k12_u','')}">
                <input type="password" id="p-k12" placeholder="Pass" value="${_GM_getValue('k12_p','')}">
                <button class="btn-main" id="btn-save">Lưu cấu hình</button>
            </div>
        `;
        document.body.appendChild(panel);

        // Logic Tab
        const indicator = document.getElementById('tab-indicator');
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.tab-btn, .tab-content').forEach(x => x.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(btn.dataset.target).classList.add('active');
                indicator.style.width = btn.offsetWidth + 'px'; indicator.style.left = btn.offsetLeft + 'px';
            };
        });

        // Event Buttons
        document.getElementById('btn-save').onclick = () => {
            _GM_setValue('k12_u', document.getElementById('u-k12').value);
            _GM_setValue('k12_p', document.getElementById('p-k12').value);
            alert("Đã lưu!");
        };
        document.getElementById('btn-login').onclick = () => {
            document.querySelectorAll('input[type="text"]').forEach(i => i.value = _GM_getValue('k12_u',''));
            document.querySelectorAll('input[type="password"]').forEach(i => i.value = _GM_getValue('k12_p',''));
        };
        document.getElementById('btn-rep').onclick = () => sendToDiscord(document.getElementById('rep-msg').value);

        // Kéo thả & Hotkey
        window.onkeydown = (e) => { if(e.altKey && e.code === 'KeyZ') panel.classList.toggle('hidden'); };
    }

    // 6. BẢNG TIN (TICKER) CỦA DANH
    function manageTicker() {
        const ticker = document.createElement('div'); ticker.id = 'danhvux-ticker';
        ticker.innerHTML = `<div class="ticker-text">Chúc Danh một ngày tốt lành. ⚠️ KHÔNG ĐƯỢC SAO CHÉP PANEL ⚠️</div>`;
        document.body.appendChild(ticker);
        setTimeout(() => { ticker.style.opacity = '0'; setTimeout(()=>ticker.remove(), 1000); }, 15000);
    }

    // KHỞI CHẠY
    setTimeout(() => {
        manageTicker();
        createPanel();
        sendToDiscord("🚀 **Hệ thống Danhvux Hub đã Online!**");
    }, 2000);
})();
