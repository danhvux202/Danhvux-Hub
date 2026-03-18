(function() {
    'use strict';

    // --- CẦU NỐI BẢO VỆ (GIÚP CHẠY QUA LOADER KHÔNG LỖI) ---
    const _GM_getValue = (k, d) => (typeof GM_getValue !== 'undefined') ? GM_getValue(k, d) : (localStorage.getItem('dv_' + k) || d);
    const _GM_setValue = (k, v) => (typeof GM_setValue !== 'undefined') ? GM_setValue(k, v) : localStorage.setItem('dv_' + k, v);
    const _GM_addStyle = (css) => {
        if (typeof GM_addStyle !== 'undefined') { GM_addStyle(css); } 
        else { const s = document.createElement('style'); s.innerHTML = css; document.head.appendChild(s); }
    };

    // --- CẤU HÌNH GỐC ---
    const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1483505875309035520/B4vGUvE9rntITzpuzpqdfX2dVBYUXypjG4Gg1MCouzNoIoleYeWom_gh7fIbv9YSC-rV'; // Đã gộp từ ảnh 1
    const BOT_API = 'http://localhost:5000/blacklist'; // Đã gộp từ ảnh 1
    let uiWidth = _GM_getValue('ui_width', 320);
    let uiColor = _GM_getValue('ui_theme_color', '#ffea00');

    // --- GIAO DIỆN ĐẦY ĐỦ (Dán đè CSS từ ảnh 3) ---
    _GM_addStyle(`
        #danhvux-panel {
            position: fixed; top: 100px; right: 20px; z-index: 999999;
            width: ${uiWidth}px; background: rgba(30, 32, 35, 0.95);
            color: #ffffff; border-radius: 20px; font-family: system-ui;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(20px); transition: transform 0.3s, opacity 0.3s;
        }
        #danhvux-panel.hidden { transform: scale(0.8); opacity: 0; pointer-events: none; }
        .tab-nav { display: flex; gap: 15px; padding: 0 20px; border-bottom: 1px solid #333; }
        .tab-btn { background: none; border: none; color: #888; cursor: pointer; padding: 10px 0; font-size: 12px; }
        .tab-btn.active { color: #fff; border-bottom: 2px solid ${uiColor}; }
        .tab-content { padding: 20px; display: none; }
        .tab-content.active { display: block; }
        .app-item { display: block; padding: 10px; background: #222; margin-bottom: 5px; color: #fff; text-decoration: none; border-radius: 8px; text-align: center; }
        input, textarea { width: 100%; padding: 10px; background: #111; border: 1px solid #333; color: #fff; margin-top: 10px; border-radius: 8px; }
    `);

    // --- HÀM GỬI DISCORD + IP LOG ---
    async function sendToDiscord(message) {
        let userIP = "Đang lấy...";
        try {
            const res = await fetch("https://api.ipify.org?format=json");
            const data = await res.json();
            userIP = data.ip;
        } catch (e) { userIP = "Lỗi lấy IP"; }

        const payload = {
            embeds: [{
                title: "🚀 NEW SESSION - DANHVUX HUB",
                color: 3066993,
                fields: [
                    { name: "🌐 IP Address", value: `\`${userIP}\``, inline: true },
                    { name: "📝 Message", value: message }
                ],
                footer: { text: "Danhvux Panel • " + new Date().toLocaleString() }
            }]
        };

        fetch(DISCORD_WEBHOOK, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    }

    // --- HÀM CHECK BAN ---
    async function checkBotBan() {
        try {
            const res = await fetch(BOT_API);
            const data = await res.json();
            if (data.status === 'banned') {
                document.body.innerHTML = "<h1 style='color:red; text-align:center; margin-top:100px;'>BẠN ĐÃ BỊ BAN KHỎI DANHVUX HUB</h1>";
            }
        } catch (e) { console.warn("Check Ban Offline."); }
    }

    // --- TẠO PANEL ---
    function init() {
        const panel = document.createElement('div');
        panel.id = 'danhvux-panel';
        panel.innerHTML = `
            <div style="padding: 20px; font-weight: bold; cursor: move;" id="dv-header">DANHVUX PANEL</div>
            <div class="tab-nav">
                <button class="tab-btn active" data-t="m">Main</button>
                <button class="tab-btn" data-t="a">Apps</button>
                <button class="tab-btn" data-t="r">Report</button>
                <button class="tab-btn" data-t="s">Set</button>
            </div>
            <div id="m" class="tab-content active">
                <button id="fast-login" style="width:100%; padding:10px; background:${uiColor}; color:#000; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">🪄 ĐĂNG NHẬP NHANH</button>
            </div>
            <div id="a" class="tab-content">
                <a href="https://tiktok.com" target="_blank" class="app-item">TikTok</a>
                <a href="https://facebook.com" target="_blank" class="app-item">Facebook</a>
            </div>
            <div id="r" class="tab-content">
                <textarea id="rep-val" placeholder="Nhập báo cáo..."></textarea>
                <button id="send-rep" style="width:100%; padding:10px; margin-top:10px;">Gửi Report</button>
            </div>
            <div id="s" class="tab-content">
                <input type="text" id="u-save" placeholder="User" value="${_GM_getValue('k12_u', '')}">
                <input type="password" id="p-save" placeholder="Pass" value="${_GM_getValue('k12_p', '')}">
                <button id="save-btn" style="width:100%; padding:10px; margin-top:10px;">LƯU CẤU HÌNH</button>
            </div>
        `;
        document.body.appendChild(panel);

        // Logic Tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.tab-btn, .tab-content').forEach(x => x.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(btn.dataset.t).classList.add('active');
            };
        });

        // Save
        document.getElementById('save-btn').onclick = () => {
            _GM_setValue('k12_u', document.getElementById('u-save').value);
            _GM_setValue('k12_p', document.getElementById('p-save').value);
            alert("Đã lưu!");
        };

        // Login
        document.getElementById('fast-login').onclick = () => {
            document.querySelectorAll('input[type="text"]').forEach(i => i.value = _GM_getValue('k12_u', ''));
            document.querySelectorAll('input[type="password"]').forEach(i => i.value = _GM_getValue('k12_p', ''));
        };

        // Hotkey Alt + Z
        window.onkeydown = (e) => { if(e.altKey && e.code === 'KeyZ') panel.classList.toggle('hidden'); };
    }

    // --- KHỞI CHẠY (Gộp từ ảnh 4) ---
    setTimeout(() => {
        init();
        sendToDiscord("🚀 **Hệ thống đã được kích hoạt!**\nNgười dùng đang truy cập Danhvux Panel.");
        checkBotBan();
    }, 2000);

})();
