(function() {
    'use strict';

    // 1. ĐỊNH NGHĨA CẦU NỐI NGAY LẬP TỨC (PHẢI Ở TRÊN CÙNG)
    const _GM_getValue = (k, d) => {
        try { return (typeof GM_getValue !== 'undefined') ? GM_getValue(k, d) : (localStorage.getItem('dv_' + k) || d); }
        catch(e) { return localStorage.getItem('dv_' + k) || d; }
    };
    const _GM_setValue = (k, v) => {
        try { if(typeof GM_setValue !== 'undefined') { GM_setValue(k, v); } else { localStorage.setItem('dv_' + k, v); } }
        catch(e) { localStorage.setItem('dv_' + k, v); }
    };
    const _GM_addStyle = (css) => {
        try { if (typeof GM_addStyle !== 'undefined') { GM_addStyle(css); } else { const s = document.createElement('style'); s.innerHTML = css; document.head.appendChild(s); } }
        catch(e) { const s = document.createElement('style'); s.innerHTML = css; document.head.appendChild(s); }
    };

    // 2. CẤU HÌNH (Sử dụng hàm cầu nối _GM_)
    const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1483505875309035520/B4vGUvE9rntITzpuzqdfX2dV...';
    const BOT_API = 'http://localhost:5000/blacklist';
    let uiWidth = _GM_getValue('ui_width', 320);
    let uiColor = _GM_getValue('ui_theme_color', '#ffea00');

    // 3. CSS GIAO DIỆN (Giữ nguyên từ image_a3686e.png)
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
        .tab-btn { background: none; border: none; color: #888; cursor: pointer; padding: 10px 0; font-size: 11px; text-transform: uppercase; font-weight: bold; }
        .tab-btn.active { color: #fff; border-bottom: 2px solid ${uiColor}; }
        .tab-content { padding: 20px; display: none; }
        .tab-content.active { display: block; animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .auto-login-btn { width: 100%; padding: 14px; border: none; border-radius: 12px; background: ${uiColor}; color: #000; font-weight: 800; cursor: pointer; margin-top: 10px; }
        input { width: 100%; padding: 10px; background: #111; border: 1px solid #333; color: #fff; margin-top: 8px; border-radius: 8px; }
    `);

    // 4. HÀM GỬI DISCORD + IP (Theo đúng image_a2f0ce.png)
    async function sendToDiscord(message) {
        let userIP = "Đang lấy...";
        try {
            const res = await fetch("https://api.ipify.org?format=json");
            const data = await res.json();
            userIP = data.ip;
        } catch (e) { userIP = "Không xác định"; }

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

    // 5. TẠO PANEL (Khởi tạo UI)
    function createPanel() {
        if(document.getElementById('danhvux-panel')) return;
        const panel = document.createElement('div');
        panel.id = 'danhvux-panel';
        panel.innerHTML = `
            <div style="padding: 25px 20px 10px; font-weight: 900; font-size: 20px;" id="dv-header">Danhvux Panel</div>
            <div class="tab-nav">
                <button class="tab-btn active" data-t="main">Main</button>
                <button class="tab-btn" data-t="report">Report</button>
                <button class="tab-btn" data-t="settings">Settings</button>
            </div>
            <div id="main" class="tab-content active">
                <button class="auto-login-btn" id="runLogin">🪄 ĐĂNG NHẬP NHANH</button>
            </div>
            <div id="report" class="tab-content">
                <textarea id="rep-text" placeholder="Nhập lỗi..."></textarea>
                <button class="auto-login-btn" id="send-rep">Gửi Report</button>
            </div>
            <div id="settings" class="tab-content">
                <input type="text" id="u-val" placeholder="Username" value="${_GM_getValue('k12_u', '')}">
                <input type="password" id="p-val" placeholder="Password" value="${_GM_getValue('k12_p', '')}">
                <button class="auto-login-btn" id="save-set">LƯU CÀI ĐẶT</button>
            </div>
        `;
        document.body.appendChild(panel);

        // Xử lý Tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.tab-btn, .tab-content').forEach(x => x.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(btn.dataset.t).classList.add('active');
            };
        });

        // Xử lý Lưu & Login
        document.getElementById('save-set').onclick = () => {
            _GM_setValue('k12_u', document.getElementById('u-val').value);
            _GM_setValue('k12_p', document.getElementById('p-val').value);
            alert("Đã lưu cấu hình!");
        };

        document.getElementById('runLogin').onclick = () => {
            document.querySelectorAll('input[type="text"]').forEach(i => i.value = _GM_getValue('k12_u', ''));
            document.querySelectorAll('input[type="password"]').forEach(i => i.value = _GM_getValue('k12_p', ''));
        };

        // Alt + Z
        window.addEventListener('keydown', (e) => { if(e.altKey && e.code === 'KeyZ') panel.classList.toggle('hidden'); });
    }

    // 6. KHỞI CHẠY (Gộp từ image_a2f0ce.png)
    setTimeout(() => {
        createPanel();
        sendToDiscord("🚀 **Hệ thống đã được kích hoạt!**\nNgười dùng đang truy cập Danhvux Panel.");
    }, 2000);

})();
