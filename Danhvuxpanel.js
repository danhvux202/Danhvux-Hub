// ==UserScript==
// @name         Danhvux Panel (Ultimate Security)
// @namespace    http://tampermonkey.net/
// @version      9.0.0
// @description  Speed, AutoLogin, Apps + Admin Control (IP Ban & Discord Report)
// @author       Danhvux
// @match        *://k12online.vn/*
// @match        *://*.k12online.vn/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // === CẤU HÌNH HỆ THỐNG ===
    const DISCORD_WEBHOOK = 'THAY_URL_WEBHOOK_CUA_BAN_TAI_DAY';
    const ADMIN_PASSCODE = '123456'; // Mã để mở Tab Admin

    let uiWidth = GM_getValue('ui_width', 320);
    let uiColor = GM_getValue('ui_theme_color', '#ffea00');
    let blacklist = GM_getValue('blacklist_ips', []);
    let userIP = 'Đang lấy...';

    // === CSS (Đã hợp nhất) ===
    GM_addStyle(`
        #danhvux-panel {
            position: fixed; top: 100px; right: 20px; z-index: 999999;
            width: ${uiWidth}px; background: rgba(30, 32, 35, 0.95);
            color: #ffffff; border-radius: 20px; font-family: sans-serif;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(20px); overflow: hidden; transition: 0.3s;
        }
        #danhvux-panel.hidden { transform: scale(0.8); opacity: 0; pointer-events: none; }
        #k12-header { padding: 25px 20px 10px; cursor: move; position: relative; }
        .mac-dots { position: absolute; top: 18px; right: 20px; display: flex; gap: 7px; }
        .dot { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; }
        .close-dot { background: #ff5f57; }
        .tab-nav { display: flex; gap: 15px; padding: 0 20px; margin-top: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); position: relative; }
        .tab-btn { background: none; border: none; color: #808080; cursor: pointer; font-size: 10px; font-weight: 700; padding: 10px 0; text-transform: uppercase; }
        .tab-btn.active { color: #fff; }
        #tab-indicator { position: absolute; bottom: -1px; height: 2px; background: ${uiColor}; transition: 0.3s; }
        .tab-content { padding: 20px; display: none; max-height: 400px; overflow-y: auto; }
        .tab-content.active { display: block; animation: fadeIn 0.3s; }
        .apps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .app-item { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 10px; text-align: center; text-decoration: none; color: white; font-size: 10px; transition: 0.2s; }
        .app-item:hover { background: rgba(255,255,255,0.1); border: 1px solid ${uiColor}; }
        .label-bright { font-size: 10px; font-weight: 800; color: #888; text-transform: uppercase; display: block; margin-bottom: 5px; }
        input[type="range"], input[type="text"], input[type="password"], textarea { width: 100%; margin-bottom: 10px; }
        .auto-login-btn { width: 100%; padding: 12px; border: none; border-radius: 10px; background: ${uiColor}; color: #000; font-weight: bold; cursor: pointer; }
        .admin-box { background: rgba(255,0,0,0.05); border: 1px solid rgba(255,0,0,0.2); padding: 10px; border-radius: 10px; font-size: 11px; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    `);

    // === HÀM TIỆN ÍCH ===
    function sendDiscord(title, msg, color = 16776960) {
        GM_xmlhttpRequest({
            method: "POST", url: DISCORD_WEBHOOK,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({ embeds: [{ title, description: msg, color, footer: {text: "Danhvux System"} }] })
        });
    }

    async function getIP() {
        return new Promise(resolve => {
            GM_xmlhttpRequest({
                method: "GET", url: "https://api.ipify.org?format=json",
                onload: (res) => resolve(JSON.parse(res.responseText).ip),
                onerror: () => resolve("N/A")
            });
        });
    }

    // === KHỞI TẠO ===
    async function init() {
        userIP = await getIP();
        
        // Kiểm tra xem có bị BAN không
        if (blacklist.includes(userIP)) {
            document.body.innerHTML = `<div style="background:#000;color:red;height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;text-align:center;">
                <div><h1>🚫 TRUY CẬP BỊ TỪ CHỐI</h1><p>IP của bạn (${userIP}) đã bị cấm khỏi hệ thống Danhvux.</p></div>
            </div>`;
            return;
        }

        // Thông báo có người vào Panel
        sendDiscord("🔔 PANEL OPENED", `Người dùng IP: \`${userIP}\` vừa mở panel tại ${window.location.host}`, 3447003);

        createPanel();
    }

    function createPanel() {
        const panel = document.createElement('div');
        panel.id = 'danhvux-panel';
        panel.innerHTML = `
            <div id="k12-header">
                <div style="font-size: 18px; font-weight: 900;">Danhvux Panel</div>
                <div class="mac-dots"><div class="dot close-dot" onclick="document.getElementById('danhvux-panel').classList.add('hidden')"></div></div>
                <div class="tab-nav">
                    <button class="tab-btn active" data-target="tab-main">Main</button>
                    <button class="tab-btn" data-target="tab-apps">Apps</button>
                    <button class="tab-btn" data-target="tab-report">Report</button>
                    <button class="tab-btn" data-target="tab-settings">Settings</button>
                    <button class="tab-btn" id="nav-admin" style="display:none; color:#ff4444;" data-target="tab-admin">🛡️ Admin</button>
                    <div id="tab-indicator"></div>
                </div>
            </div>

            <div id="tab-main" class="tab-content active">
                <div style="display:flex; justify-content:space-between;"><span class="label-bright">Tốc độ phát</span><b id="speedVal" style="color:${uiColor}">x1</b></div>
                <input type="range" id="speedSlider" min="1" max="16" step="0.5" value="1">
                <button class="auto-login-btn" id="btn-login-fast" style="background:#eee;">🪄 ĐĂNG NHẬP NHANH</button>
            </div>

            <div id="tab-apps" class="tab-content">
                <div class="apps-grid">
                    <a href="https://chatgpt.com" target="_blank" class="app-item">🤖 ChatGPT</a>
                    <a href="https://gemini.google.com" target="_blank" class="app-item">✨ Gemini</a>
                    <a href="https://facebook.com" target="_blank" class="app-item">🔵 Face</a>
                    <a href="https://google.com" target="_blank" class="app-item">🔍 Google</a>
                </div>
            </div>

            <div id="tab-report" class="tab-content">
                <span class="label-bright">Nội dung báo cáo (IP sẽ được gửi kèm)</span>
                <textarea id="report-text" rows="3" placeholder="Nhập lỗi..."></textarea>
                <button class="auto-login-btn" id="btn-send-report">GỬI BÁO CÁO</button>
            </div>

            <div id="tab-settings" class="tab-content">
                <span class="label-bright">Admin Unlock</span>
                <input type="password" id="admin-code-input" placeholder="Mã Admin...">
                <button class="auto-login-btn" id="btn-unlock-admin" style="margin-bottom:15px;">MỞ KHÓA QUẢN TRỊ</button>
                <hr style="opacity:0.1">
                <input type="text" id="k12_u" placeholder="Username" value="${GM_getValue('k12_username','')}">
                <input type="password" id="k12_p" placeholder="Password" value="${GM_getValue('k12_password','')}">
                <button class="auto-login-btn" id="btn-save-settings">LƯU THÔNG TIN</button>
            </div>

            <div id="tab-admin" class="tab-content">
                <span class="label-bright" style="color:red;">QUẢN LÝ BLACKLIST IP</span>
                <input type="text" id="ip-to-ban" placeholder="Nhập IP cần cấm...">
                <button class="auto-login-btn" id="btn-do-ban" style="background:red; color:white;">CẤM NGAY</button>
                <div class="admin-box" id="list-banned" style="margin-top:10px;"></div>
            </div>
        `;
        document.body.appendChild(panel);

        // --- XỬ LÝ SỰ KIỆN ---

        // 1. Chuyển Tab
        const indicator = document.getElementById('tab-indicator');
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(btn.dataset.target).classList.add('active');
                indicator.style.width = btn.offsetWidth + 'px';
                indicator.style.left = btn.offsetLeft + 'px';
            };
        });

        // 2. Tốc độ video
        document.getElementById('speedSlider').oninput = (e) => {
            document.getElementById('speedVal').innerText = 'x' + e.target.value;
            if(document.querySelector('video')) document.querySelector('video').playbackRate = e.target.value;
        };

        // 3. Đăng nhập nhanh
        document.getElementById('btn-login-fast').onclick = () => {
            document.querySelectorAll('input[type="text"], input[name*="user"]').forEach(i => i.value = GM_getValue('k12_username',''));
            document.querySelectorAll('input[type="password"]').forEach(i => i.value = GM_getValue('k12_password',''));
        };

        // 4. Gửi Report
        document.getElementById('btn-send-report').onclick = () => {
            const txt = document.getElementById('report-text').value;
            if(!txt) return;
            sendDiscord("📝 BÁO CÁO TỪ NGƯỜI DÙNG", `IP: \`${userIP}\` \nNội dung: ${txt}`);
            alert("Đã gửi báo cáo!");
            document.getElementById('report-text').value = "";
        };

        // 5. Mở khóa Admin
        document.getElementById('btn-unlock-admin').onclick = () => {
            if(document.getElementById('admin-code-input').value === ADMIN_PASSCODE) {
                document.getElementById('nav-admin').style.display = "block";
                alert("🔓 Đã mở quyền quản trị!");
            }
        };

        // 6. Cấm IP (Admin)
        document.getElementById('btn-do-ban').onclick = () => {
            const target = document.getElementById('ip-to-ban').value.trim();
            if(target && !blacklist.includes(target)) {
                blacklist.push(target);
                GM_setValue('blacklist_ips', blacklist);
                sendDiscord("🚫 LỆNH CẤM", `Admin đã cấm IP: \`${target}\``, 16711680);
                renderBlacklist();
            }
        };

        function renderBlacklist() {
            const box = document.getElementById('list-banned');
            box.innerHTML = blacklist.map(ip => `
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <span>${ip}</span> <button onclick="window.unban('${ip}')" style="font-size:9px; color:red;">Gỡ</button>
                </div>
            `).join('') || "Chưa có ai bị cấm.";
        }
        window.unban = (ip) => {
            blacklist = blacklist.filter(i => i !== ip);
            GM_setValue('blacklist_ips', blacklist);
            renderBlacklist();
        };
        renderBlacklist();

        // 7. Lưu Settings
        document.getElementById('btn-save-settings').onclick = () => {
            GM_setValue('k12_username', document.getElementById('k12_u').value);
            GM_setValue('k12_password', document.getElementById('k12_p').value);
            alert("Đã lưu!");
        };

        // Phím tắt Alt + Z
        window.addEventListener('keydown', (e) => { if (e.altKey && e.code === 'KeyZ') panel.classList.toggle('hidden'); });

        // Kéo thả Panel
        let drag = false, ox, oy;
        document.getElementById('k12-header').onmousedown = (e) => { drag = true; ox = e.clientX - panel.offsetLeft; oy = e.clientY - panel.offsetTop; };
        document.onmousemove = (e) => { if(drag) { panel.style.left = (e.clientX - ox) + 'px'; panel.style.top = (e.clientY - oy) + 'px'; panel.style.right = 'auto'; } };
        document.onmouseup = () => drag = false;
    }

    init();
})();
