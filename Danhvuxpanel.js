// ==UserScript==
// @name         Danhvux Panel (Security Pro)
// @version      8.0.0
// @match        *://k12online.vn/*
// @match        *://*.k12online.vn/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      localhost
// @connect      127.0.0.1
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // --- CẤU HÌNH ---
    const DISCORD_WEBHOOK = 'THAY_URL_WEBHOOK_CUA_BAN_TAI_DAY'; 
    const BOT_BLACKLIST_API = 'https://discord.com/api/webhooks/1483505875309035520/B4vGUvE9rntITzpuzpqdfX2dVBYUXypjG4Gg1MCouzNoIoleYeWom_gh7fIbv9YSC-rV';
    
    let uiWidth = GM_getValue('ui_width', 320);
    let uiColor = GM_getValue('ui_theme_color', '#ffea00');

    // --- CSS GIAO DIỆN ---
    GM_addStyle(`
        #danhvux-panel {
            position: fixed; top: 100px; right: 20px; z-index: 999999;
            width: ${uiWidth}px; background: rgba(30, 32, 35, 0.95);
            color: #ffffff; border-radius: 20px; font-family: sans-serif;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(20px); transition: 0.3s;
        }
        #danhvux-panel.hidden { transform: scale(0.8); opacity: 0; pointer-events: none; }
        #k12-header { padding: 25px 20px 10px; cursor: move; position: relative; }
        .mac-dots { position: absolute; top: 18px; right: 20px; display: flex; gap: 7px; }
        .dot { width: 12px; height: 12px; border-radius: 50%; }
        .close-dot { background: #ff5f57; cursor: pointer; } 
        .min-dot { background: #febc2e; } .max-dot { background: #28c840; }
        .tab-nav { display: flex; gap: 18px; padding: 0 20px; border-bottom: 1px solid rgba(255,255,255,0.05); position: relative; }
        .tab-btn { background: none; border: none; color: #808080; cursor: pointer; font-size: 11px; font-weight: 700; padding: 12px 0; text-transform: uppercase; }
        .tab-btn.active { color: #fff; }
        #tab-indicator { position: absolute; bottom: -1px; height: 2px; background: ${uiColor}; transition: 0.3s; box-shadow: 0 0 8px ${uiColor}; }
        .tab-content { padding: 20px; display: none; max-height: 380px; overflow-y: auto; }
        .tab-content.active { display: block; }
        .auto-login-btn { width: 100%; padding: 14px; border: none; border-radius: 12px; background: ${uiColor}; color: #000; font-weight: 800; cursor: pointer; margin-top: 10px; }
        input, textarea { width: 100%; padding: 12px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 10px; margin-bottom: 10px; box-sizing: border-box; }
        #danhvux-ticker { position: fixed; bottom: 0; left: 0; width: 100%; background: #001a4d; color: white; padding: 12px 0; z-index: 999998; border-top: 2px solid #00a2ff; overflow: hidden; white-space: nowrap; }
        .ticker-text { display: inline-block; padding-left: 100%; animation: ticker-move 18s linear forwards; }
        @keyframes ticker-move { to { transform: translateX(-100%); } }
    `);

    // --- HÀM HỆ THỐNG ---

    // 1. Gửi Log Webhook (Theo dõi API)
    async function sendLog(action, detail = "") {
        try {
            const ipRes = await fetch("https://api.ipify.org?format=json").then(r => r.json()).catch(() => ({ip: "Unknown"}));
            const data = {
                embeds: [{
                    title: `🛡️ DANHVUX API TRACKER`,
                    color: action === "BANNED" ? 15158332 : 3066993,
                    fields: [
                        { name: "Hành động", value: `\`${action}\``, inline: true },
                        { name: "Địa chỉ IP", value: `\`${ipRes.ip}\``, inline: true },
                        { name: "Chi tiết", value: detail || "Không có" },
                        { name: "Trang web", value: window.location.href }
                    ],
                    footer: { text: "Danhvux Security System • " + new Date().toLocaleString() }
                }]
            };
            fetch(DISCORD_WEBHOOK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        } catch (e) { console.error("Webhook Error"); }
    }

    // 2. Kiểm tra Blacklist từ Bot Discord (Localhost)
    async function checkBan() {
        try {
            const ipRes = await fetch("https://api.ipify.org?format=json").then(r => r.json());
            const userIP = ipRes.ip;

            // Gọi API từ Bot Python
            const response = await fetch(BOT_BLACKLIST_API).then(r => r.json()).catch(() => []);
            
            if (response.includes(userIP)) {
                sendLog("BANNED", `Người dùng IP ${userIP} đã cố gắng truy cập nhưng bị chặn.`);
                document.documentElement.innerHTML = `
                    <body style="background:#000; color:red; display:flex; align-items:center; justify-content:center; height:100vh; font-family:sans-serif;">
                        <div style="text-align:center;">
                            <h1>🛑 TRUY CẬP BỊ CHẶN</h1>
                            <p>IP: ${userIP} đã bị liệt vào danh sách cấm.</p>
                        </div>
                    </body>`;
                return true;
            }
        } catch (e) {
            console.log("⚠️ Bot Offline - Chế độ bảo mật cục bộ.");
        }
        return false;
    }

    // 3. Khởi tạo Giao diện
    function createPanel() {
        const panel = document.createElement('div');
        panel.id = 'danhvux-panel';
        panel.innerHTML = `
            <div id="k12-header">
                <div style="font-size: 20px; font-weight: 900;">Danhvux Panel</div>
                <div class="mac-dots">
                    <div class="dot close-dot" onclick="document.getElementById('danhvux-panel').classList.add('hidden')"></div>
                    <div class="dot min-dot"></div><div class="dot max-dot"></div>
                </div>
                <div class="tab-nav">
                    <button class="tab-btn active" data-target="main-tab">Main</button>
                    <button class="tab-btn" data-target="report-tab">Report</button>
                    <button class="tab-btn" data-target="settings-tab">Settings</button>
                    <div id="tab-indicator"></div>
                </div>
            </div>
            <div id="main-tab" class="tab-content active">
                <button class="auto-login-btn" id="runAutoLogin">🪄 ĐĂNG NHẬP NHANH</button>
            </div>
            <div id="report-tab" class="tab-content">
                <textarea id="report-text" placeholder="Nội dung báo cáo..."></textarea>
                <button class="auto-login-btn" id="sendReport">GỬI BÁO CÁO</button>
            </div>
            <div id="settings-tab" class="tab-content">
                <input type="text" id="k12_u" placeholder="Username" value="${GM_getValue('k12_username','')}">
                <input type="password" id="k12_p" placeholder="Password" value="${GM_getValue('k12_password','')}">
                <button class="auto-login-btn" id="saveSet">LƯU CẤU HÌNH</button>
            </div>
        `;
        document.body.appendChild(panel);

        // --- SỰ KIỆN ---
        
        // Chuyển tab
        const indicator = document.getElementById('tab-indicator');
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.tab-btn, .tab-content').forEach(x => x.classList.remove('active'));
                btn.classList.add('active'); 
                document.getElementById(btn.dataset.target).classList.add('active');
                indicator.style.width = btn.offsetWidth + 'px';
                indicator.style.left = btn.offsetLeft + 'px';
            };
        });

        // Đăng nhập nhanh
        document.getElementById('runAutoLogin').onclick = () => {
            document.querySelectorAll('input[type="text"]').forEach(i => i.value = GM_getValue('k12_username',''));
            document.querySelectorAll('input[type="password"]').forEach(i => i.value = GM_getValue('k12_password',''));
            sendLog("AUTO_LOGIN", "Người dùng sử dụng tính năng đăng nhập nhanh.");
        };

        // Lưu cài đặt
        document.getElementById('saveSet').onclick = () => {
            GM_setValue('k12_username', document.getElementById('k12_u').value);
            GM_setValue('k12_password', document.getElementById('k12_p').value);
            sendLog("SAVE_SETTINGS", "Cập nhật tài khoản đăng nhập trên Panel.");
            alert("Đã lưu!");
        };

        // Gửi báo cáo
        document.getElementById('sendReport').onclick = () => {
            const msg = document.getElementById('report-text').value;
            if(msg.trim()) sendLog("USER_REPORT", msg);
        };

        // Kéo thả
        let drag = false, x, y;
        document.getElementById('k12-header').onmousedown = (e) => { drag = true; x = e.clientX - panel.offsetLeft; y = e.clientY - panel.offsetTop; };
        document.onmousemove = (e) => { if(drag) { panel.style.left = (e.clientX - x) + 'px'; panel.style.top = (e.clientY - y) + 'px'; } };
        document.onmouseup = () => drag = false;

        // Phím tắt Alt + Z
        window.addEventListener('keydown', (e) => { if (e.altKey && e.code === 'KeyZ') panel.classList.toggle('hidden'); });
    }

    // --- KHỞI CHẠY ---
    async function init() {
        const isBanned = await checkBan();
        if (isBanned) return;

        createPanel();
        sendLog("PANEL_OPEN", "Người dùng đã truy cập và mở Panel.");
    }

    init();
})();
