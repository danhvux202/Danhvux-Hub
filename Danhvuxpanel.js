// ==UserScript==
// @name         Danhvux Panel (Privacy Report + Shortcut + AntiBot)
// @namespace    http://tampermonkey.net/
// @version      7.9.4
// @description  Báo cáo chỉ gửi IP/Nội dung + Phím tắt Alt+Z ẩn hiện + AntiBot IP FIXED
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

    let uiWidth = GM_getValue('ui_width', 320);
    let uiColor = GM_getValue('ui_theme_color', '#ffea00');
    const DISCORD_WEBHOOK = 'THAY_URL_WEBHOOK_CUA_BAN_TAI_DAY';
    const BLACKLIST_API = 'http://localhost:5000/blacklist';
    let panelCreated = false;
    let isIPBanned = false;

    // CACHE KIỂM TRA IP (24h)
    function getCachedIPStatus() {
        const cache = GM_getValue('ip_blacklist_cache', {});
        const now = Date.now();
        if (cache.timestamp && (now - cache.timestamp) < 24*60*60*1000) {
            return cache.banned || false;
        }
        return null;
    }

    function setCachedIPStatus(banned) {
        GM_setValue('ip_blacklist_cache', {
            banned: banned,
            timestamp: Date.now(),
            checkedAt: new Date().toLocaleString('vi-VN')
        });
    }

    // KIỂM TRA BLACKLIST KHÔNG BLOCKING
    async function checkBlacklistAsync() {
        const cached = getCachedIPStatus();
        if (cached !== null) {
            console.log('📋 Sử dụng cache blacklist:', cached ? 'BANNED' : 'OK');
            return cached;
        }

        try {
            console.log('🔍 Đang kiểm tra blacklist...');
            
            const ipResponse = await new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: "https://api.ipify.org?format=json",
                    timeout: 5000,
                    onload: (res) => {
                        try {
                            resolve(JSON.parse(res.responseText));
                        } catch {
                            reject('Parse IP failed');
                        }
                    },
                    onerror: reject,
                    ontimeout: reject
                });
            });

            console.log('🌐 IP của bạn:', ipResponse.ip);

            const blacklistResponse = await new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: `${BLACKLIST_API}?ip=${ipResponse.ip}`,
                    timeout: 5000,
                    onload: (res) => {
                        try {
                            const data = JSON.parse(res.responseText);
                            resolve({ banned: !!data.banned, reason: data.reason || 'Không rõ' });
                        } catch {
                            resolve({ banned: false });
                        }
                    },
                    onerror: () => resolve({ banned: false }),
                    ontimeout: () => resolve({ banned: false })
                });
            });

            const isBanned = blacklistResponse.banned;
            setCachedIPStatus(isBanned);
            
            console.log('✅ Blacklist check:', isBanned ? 'BANNED' : 'OK');
            if (isBanned) console.log('❌ Lý do:', blacklistResponse.reason);
            
            return isBanned;
        } catch (e) {
            console.log('⚠️ Blacklist check failed, cho phép:', e);
            setCachedIPStatus(false);
            return false;
        }
    }

    GM_addStyle(`
        #danhvux-panel {
            position: fixed; top: 100px; right: 20px; z-index: 999999;
            width: ${uiWidth}px; background: rgba(30, 32, 35, 0.95);
            color: #ffffff; border-radius: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(20px); overflow: hidden; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s;
        }
        #danhvux-panel.hidden { transform: scale(0.8); opacity: 0; pointer-events: none; }
        #danhvux-panel.banned { background: rgba(100, 0, 0, 0.98) !important; border-color: #ff4444 !important; }

        #k12-header { padding: 25px 20px 10px; cursor: move; position: relative; }
        .mac-dots { position: absolute; top: 18px; right: 20px; display: flex; gap: 7px; }
        .dot { width: 12px; height: 12px; border-radius: 50%; }
        .close-dot { background: #ff5f57; } .min-dot { background: #febc2e; } .max-dot { background: #28c840; }

        .tab-nav { display: flex; gap: 18px; padding: 0 20px; margin-top: 15px; border-bottom: 1px solid rgba(255,255,0.05); position: relative; }
        .tab-btn { background: none; border: none; color: #808080; cursor: pointer; font-size: 11px; font-weight: 700; padding: 12px 0; text-transform: uppercase; transition: 0.3s; }
        .tab-btn.active { color: #fff; }
        #tab-indicator { position: absolute; bottom: -1px; height: 2px; background: ${uiColor}; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 8px ${uiColor}; }

        .tab-content { padding: 20px; display: none; max-height: 380px; overflow-y: auto; }
        .tab-content.active { display: block; animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

        .apps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .app-item { background: rgba(255,255,255,0.05); border-radius: 15px; padding: 15px 5px; text-align: center; text-decoration: none; color: white; border: 1px solid transparent; transition: 0.2s; }
        .app-item:hover { background: rgba(255,255,255,0.1); border-color: ${uiColor}44; transform: translateY(-2px); }
        .app-item span { display: block; font-size: 20px; margin-bottom: 5px; }
        .app-item small { font-size: 10px; font-weight: 600; opacity: 0.7; }

        .label-bright { font-size: 10px; font-weight: 800; color: #666; text-transform: uppercase; margin-bottom: 8px; display: block; }
        input[type="range"] { width: 100%; accent-color: ${uiColor}; margin: 10px 0 20px; cursor: pointer; }
        input[type="text"], input[type="password"], textarea { width: 100%; padding: 12px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 10px; margin-bottom: 10px; outline: none; font-size: 13px; }
        .auto-login-btn { width: 100%; padding: 14px; border: none; border-radius: 12px; background: ${uiColor}; color: #000; font-weight: 800; cursor: pointer; transition: 0.2s; }

        #danhvux-ticker { position: fixed; bottom: 0; left: 0; width: 100%; background: #001a4d; color: white; padding: 12px 0; z-index: 999998; font-weight: 700; border-top: 2px solid #00a2ff; overflow: hidden; white-space: nowrap; }
        .ticker-text { display: inline-block; padding-left: 100%; animation: ticker-move 18s linear forwards; }
        @keyframes ticker-move { to { transform: translateX(-100%); } }

        .ban-notice { 
            background: rgba(255,68,68,0.9) !important; 
            color: #fff !important; 
            text-align: center; 
            padding: 20px !important; 
            font-weight: 700; 
            font-size: 14px;
        }
        .ban-notice::before { content: "🚫 "; font-size: 20px; display: block; margin-bottom: 10px; }
        .status-indicator { position: absolute; top: 10px; right: 10px; font-size: 10px; padding: 4px 8px; border-radius: 12px; font-weight: 700; }
        .status-ok { background: rgba(40,200,64,0.2); color: #28c840; }
        .status-banned { background: rgba(255,68,68,0.3); color: #ff4444; }
    `);

    // HÀM SEND DISCORD (giữ nguyên)
    async function sendToDiscord(message) {
        const status = document.getElementById('report-status');
        status.innerText = '⏳ Đang lấy địa chỉ mạng...';

        try {
            const ipResponse = await new Promise(resolve => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: "https://api.ipify.org?format=json",
                    onload: (res) => resolve(JSON.parse(res.responseText))
                });
            });

            const data = {
                embeds: [{
                    title: "🔔 BÁO CÁO MỚI",
                    color: parseInt(uiColor.replace('#', ''), 16),
                    fields: [
                        { name: "🌐 Địa chỉ IP", value: `\`${ipResponse.ip}\``, inline: true },
                        { name: "📝 Nội dung", value: message }
                    ],
                    footer: { text: "Danhvux Panel v7.9.4 • AntiBot • " + new Date().toLocaleString('vi-VN') }
                }]
            };

            GM_xmlhttpRequest({
                method: "POST",
                url: DISCORD_WEBHOOK,
                headers: { "Content-Type": "application/json" },
                data: JSON.stringify(data),
                onload: () => {
                    status.innerText = '✅ Đã gửi thành công!';
                    document.getElementById('report-text').value = '';
                }
            });
        } catch (e) {
            status.innerText = '❌ Lỗi hệ thống!';
        }
    }

    // TẠO PANEL CHÍNH
    function createPanel() {
        if (panelCreated) return;
        panelCreated = true;

        const panel = document.createElement('div');
        panel.id = 'danhvux-panel';
        
        if (isIPBanned) {
            panel.classList.add('banned');
            panel.innerHTML = `
                <div id="k12-header" style="background: rgba(255,0,0,0.2);">
                    <div style="font-size: 20px; font-weight: 900; letter-spacing: -0.5px; color: #ffdddd;">🚫 IP BỊ BAN</div>
                    <div class="status-indicator status-banned">BANNED</div>
                </div>
                <div id="main-tab" class="tab-content active ban-notice">
                    <div>IP của bạn đã bị đưa vào danh sách đen!</div>
                    <div style="font-size: 12px; opacity: 0.9; margin-top: 10px;">
                        Vui lòng liên hệ admin để được gỡ bỏ.<br>
                        <b>Thời gian kiểm tra:</b> ${new Date().toLocaleString('vi-VN')}
                    </div>
                </div>
            `;
        } else {
            panel.innerHTML = `
                <div id="k12-header">
                    <div style="font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">Danhvux Panel</div>
                    <div class="status-indicator status-ok">✓ ANTI-BOT OK</div>
                    <div class="mac-dots">
                        <div class="dot close-dot" onclick="document.getElementById('danhvux-panel').classList.add('hidden')"></div>
                        <div class="dot min-dot"></div><div class="dot max-dot"></div>
                    </div>
                    <div class="tab-nav">
                        <button class="tab-btn active" data-target="main-tab">Main</button>
                        <button class="tab-btn" data-target="apps-tab">Apps</button>
                        <button class="tab-btn" data-target="report-tab">Report</button>
                        <button class="tab-btn" data-target="settings-tab">Settings</button>
                        <div id="tab-indicator"></div>
                    </div>
                </div>
                <!-- Các tab content giữ nguyên như cũ -->
                <div id="main-tab" class="tab-content active">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span class="label-bright">Tốc độ phát</span>
                        <b id="speedValue" style="color:${uiColor}; font-size:14px;">x1</b>
                    </div>
                    <input type="range" id="speedSlider" min="1" max="16" step="0.5" value="1">
                    <button class="auto-login-btn" id="runAutoLogin" style="margin:10px 0;">🪄 ĐĂNG NHẬP NHANH</button>
                    <p style="font-size: 9px; color: #555; text-align: center;">Mẹo: <b>Alt + Z</b> ẩn/hiện | <b>F5</b> refresh blacklist</p>
                </div>
                <div id="apps-tab" class="tab-content">
                    <div class="apps-grid">
                        <a href="https://chatgpt.com" target="_blank" class="app-item"><span>🤖</span><small>ChatGPT</small></a>
                        <a href="https://gemini.google.com" target="_blank" class="app-item"><span>✨</span><small>Gemini</small></a>
                        <a href="https://youtube.com" target="_blank" class="app-item"><span>📺</span><small>YouTube</small></a>
                        <a href="https://facebook.com" target="_blank" class="app-item"><span>🔵</span><small>Facebook</small></a>
                        <a href="https://tiktok.com" target="_blank" class="app-item"><span>🎵</span><small>TikTok</small></a>
                        <a href="https://google.com" target="_blank" class="app-item"><span>🔍</span><small>Google</small></a>
                    </div>
                </div>
                <div id="report-tab" class="tab-content">
                    <span class="label-bright">Gửi báo cáo bảo mật</span>
                    <textarea id="report-text" placeholder="Nhập lỗi hoặc ý kiến..."></textarea>
                    <button class="auto-login-btn" id="sendReport">🚀 Gửi đi</button>
                    <p id="report-status" style="font-size:10px; text-align:center; margin-top:10px; color:#888;"></p>
                </div>
                <div id="settings-tab" class="tab-content">
                    <span class="label-bright">Độ rộng: <b id="widthVal">${uiWidth}px</b></span>
                    <input type="range" id="setWidth" min="280" max="500" value="${uiWidth}">
                    <span class="label-bright">Màu chủ đạo</span>
                    <input type="color" id="setColor" value="${uiColor}" style="width:100%; height:40px;">
                    <button class="auto-login-btn" id="clearCache" style="background:#ff6b6b; margin-top:15px;">🗑️ Xóa cache IP</button>
                    <hr style="border:none; border-top:1px solid rgba(255,255,255,0.05); margin:20px 0;">
                    <input type="text" id="k12_u" placeholder="Tên đăng nhập" value="${GM_getValue('k12_username','')}">
                    <input type="password" id="k12_p" placeholder="Mật khẩu" value="${GM_getValue('k12_password','')}">
                    <button class="auto-login-btn" id="saveSet">💾 Lưu cài đặt</button>
                </div>
            `;
        }
        
        document.body.appendChild(panel);

        // ATTACH EVENTS (chỉ khi không bị ban)
        if (!isIPBanned) attachPanelEvents(panel);
    }

    function attachPanelEvents(panel) {
        // Phím tắt
        window.addEventListener('keydown', (e) => {
            if (e.altKey && e.code === 'KeyZ') panel.classList.toggle('hidden');
            if (e.code === 'F5') { location.reload(); } // Refresh blacklist
        });

        // Tab switching
        const indicator = document.getElementById('tab-indicator');
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.tab-btn').forEach
