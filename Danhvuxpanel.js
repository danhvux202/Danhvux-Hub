// ==UserScript==
// @name         K12 Helper Pro - Danhvux Port 8000 (Fixed)
// @namespace    http://tampermonkey.net/
// @version      21.9
// @description  Giữ nguyên 100% bản gốc, Bypass Question + Toast Notifications.
// @author       Danhvux
// @match        *://*.k12online.vn/*
// @grant        GM_xmlhttpRequest
// @connect      localhost
// @connect      api.ipify.org
// ==/UserScript==

(function() {
    'use strict';

    // === CẤU HÌNH HỆ THỐNG ===
    const BLACKLIST_API = 'http://localhost:8000/blacklist';

    let config = JSON.parse(localStorage.getItem('k12_ult_cfg')) || {
        mainColor: '#ffea00', width: 320, speed: 1, user: '', pass: '', isDarkMode: true
    };

    const save = () => localStorage.setItem('k12_ult_cfg', JSON.stringify(config));

    // --- HÀM TURBO X20 & BYPASS (FIXED SELECTOR) ---
    const runTurbo = () => {
        const v = document.querySelector('video');
        if (v && config.speed > 1) {
            v.playbackRate = parseFloat(config.speed);
            if (v.paused && !v.ended) v.play().catch(()=>{});
        }
        // Fix: Chỉ click khi nút thực sự hiển thị
        document.querySelectorAll('.vjs-skip-question, .btn-confirm, .btn-next-question, .vjs-done-button, .btn-yes').forEach(btn => {
            if(btn.offsetParent !== null) btn.click();
        });
    };
    setInterval(runTurbo, 1000);

    // --- HÀM KIỂM TRA IP (SỬA LỖI SYNTAX URL) ---
    const startSecuritySystem = () => {
        return new Promise((resolve) => {
            fetch('https://api.ipify.org?format=json') // Đã xóa dấu < > gây lỗi
            .then(res => res.json())
            .then(data => {
                const userIP = data.ip;
                GM_xmlhttpRequest({
                    method: "GET",
                    url: BLACKLIST_API + "?nocache=" + Date.now(),
                    onload: function(response) {
                        try {
                            let bannedList = JSON.parse(response.responseText);
                            if (Array.isArray(bannedList) && bannedList.includes(userIP)) {
                                renderBannedScreen(userIP);
                                resolve(false);
                            } else { resolve(true); }
                        } catch(e) { resolve(true); }
                    },
                    onerror: () => resolve(true)
                });
            })
            .catch(() => resolve(true));
        });
    };

    const renderBannedScreen = (ip) => {
        document.body.innerHTML = `
            <div style="height:100vh; background:#0d1117; color:#ff4d4d; display:flex; align-items:center; justify-content:center; flex-direction:column; font-family:sans-serif; text-align:center; position:fixed; width:100%; top:0; left:0; z-index:999999;">
                <h1 style="font-size:60px; margin:0;">🚫 BANNED</h1>
                <p style="font-size:20px; color:#c9d1d9;">IP của bạn (<b>${ip}</b>) đã bị cấm truy cập Panel.</p>
            </div>`;
    };

    // --- TOAST SYSTEM (GIỮ NGUYÊN STYLE) ---
    const showToast = (message, type = 'info', duration = 3000) => {
        const isDark = config.isDarkMode;
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
            
            const style = document.createElement('style');
            style.innerText = `
                #toast-container { position: fixed; top: 20px; right: 20px; z-index: 999999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
                .toast { pointer-events: auto; min-width: 250px; padding: 14px 18px; border-left: 4px solid; border-radius: 8px; font-family: 'Segoe UI', sans-serif; font-size: 14px; display: flex; align-items: center; gap: 12px; animation: slideIn 0.3s forwards; }
                .toast.success { border-color: #27c93f; } .toast.error { border-color: #ff5f56; } .toast.info { border-color: #4da6ff; }
                @keyframes slideIn { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
                @keyframes slideOut { to { opacity: 0; transform: translateX(100%); } }
            `;
            document.head.appendChild(style);
        }

        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.style.background = isDark ? '#1e2227' : '#fff';
        toast.style.color = isDark ? '#fff' : '#000';
        toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    };

    // --- UI PANEL (GIỮ NGUYÊN 100% GIAO DIỆN CỦA BẠN) ---
    startSecuritySystem().then(accessGranted => {
        if (!accessGranted) return;

        const style = document.createElement('style');
        const updateCSS = () => {
            const isDark = config.isDarkMode;
            style.innerText = `
                :root { 
                    --mc: ${config.mainColor}; --w: ${config.width}px;
                    --bg: ${isDark ? '#1e2227' : '#ffffff'}; --bg-tab: ${isDark ? '#1a1d21' : '#f0f0f0'};
                    --bg-input: ${isDark ? '#252a31' : '#f9f9f9'}; --text: ${isDark ? '#ffffff' : '#1e2227'};
                    --text-sec: ${isDark ? '#777' : '#999'}; --border: ${isDark ? '#333' : '#ddd'};
                    --shadow: ${isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.1)'};
                }
                #dv-panel {
                    position: fixed; top: 50px; right: 20px; width: var(--w) !important;
                    background: var(--bg); color: var(--text); border-radius: 12px;
                    font-family: 'Segoe UI', sans-serif; z-index: 100000;
                    box-shadow: 0 10px 40px var(--shadow); overflow: hidden;
                    border: 1px solid var(--border);
                }
                .header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; cursor: move; }
                .header .title { color: var(--mc); font-weight: bold; font-size: 18px; }
                .tabs { display: flex; background: var(--bg-tab); padding: 0 5px; border-bottom: 1px solid var(--border); justify-content: space-around; }
                .tab { padding: 12px 10px; cursor: pointer; font-size: 10px; color: var(--text-sec); font-weight: 900; position: relative; }
                .tab.active { color: var(--mc); }
                .content { display: none; padding: 20px; box-sizing: border-box; }
                .content.active { display: block; }
                .slider { width: 100%; height: 5px; background: var(--border); appearance: none; margin: 10px 0 25px 0; outline: none; }
                .slider::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; background: var(--mc); border-radius: 50%; cursor: pointer; }
                input[type=text], input[type=password] { width: 100%; padding: 12px; background: var(--bg-input); border: 1px solid var(--border); color: var(--text); border-radius: 8px; margin-bottom: 12px; box-sizing: border-box; }
                .btn { width: 100%; padding: 14px; background: var(--mc); border: none; border-radius: 12px; color: #000; font-weight: bold; cursor: pointer; }
            `;
        };
        document.head.appendChild(style);
        updateCSS();

        const panel = document.createElement('div');
        panel.id = 'dv-panel';
        panel.innerHTML = `
            <div class="header">
                <div class="title">Danhvux Panel</div>
                <div style="display:flex; gap:8px;"><div class="red" style="width:12px;height:12px;background:#ff5f56;border-radius:50%;cursor:pointer;"></div></div>
            </div>
            <div class="tabs">
                <div class="tab active" data-t="t-main">MAIN</div>
                <div class="tab" data-t="t-video">VIDEO</div>
                <div class="tab" data-t="t-set">SETTINGS</div>
            </div>
            <div class="body-container">
                <div id="t-main" class="content active">
                    <div style="display:flex; justify-content:space-between"><b>Tốc độ</b><span style="color:var(--mc)">x<span id="sp-txt">${config.speed}</span></span></div>
                    <input type="range" id="sp-range" class="slider" min="1" max="20" step="0.5" value="${config.speed}">
                    <button class="btn" id="do-login">🪄 AUTO LOGIN</button>
                </div>
                <div id="t-video" class="content">
                    <input type="text" id="v-url" placeholder="Link video .mp4...">
                    <button class="btn" id="v-run">PHÁT VIDEO</button>
                </div>
                <div id="t-set" class="content">
                    <div style="display:flex; justify-content:space-between; margin-bottom:15px;">DARK MODE <input type="checkbox" id="mode-toggle" ${config.isDarkMode ? 'checked' : ''}></div>
                    <input type="color" id="c-pick" style="width:100%; height:40px;" value="${config.mainColor}">
                    <input type="text" id="u-val" placeholder="Username..." value="${config.user}">
                    <input type="password" id="p-val" placeholder="Password..." value="${config.pass}">
                    <button class="btn" id="btn-save">LƯU CÀI ĐẶT</button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        // --- LOGIC XỬ LÝ (FIXED) ---
        const $ = (id) => panel.querySelector(id);
        
        panel.querySelectorAll('.tab').forEach(tab => {
            tab.onclick = () => {
                panel.querySelectorAll('.tab, .content').forEach(el => el.classList.remove('active'));
                tab.classList.add('active');
                $(`#${tab.dataset.t}`).classList.add('active');
            };
        });

        $('#sp-range').oninput = (e) => { 
            $('#sp-txt').innerText = e.target.value; 
            config.speed = e.target.value; 
        };

        $('#btn-save').onclick = () => { 
            config.mainColor = $('#c-pick').value; 
            config.user = $('#u-val').value; 
            config.pass = $('#p-val').value; 
            config.isDarkMode = $('#mode-toggle').checked;
            save(); 
            showToast('Đã lưu!', 'success');
            setTimeout(()=>location.reload(), 500);
        };

        $('#do-login').onclick = () => {
            const u = document.querySelector('input[name="username"]'), p = document.querySelector('input[name="password"]');
            if(u && p) { 
                u.value = config.user; p.value = config.pass; 
                u.dispatchEvent(new Event('input',{bubbles:true})); 
                p.dispatchEvent(new Event('input',{bubbles:true})); 
                setTimeout(()=>document.querySelector('button[type="submit"]').click(), 500);
                showToast('Đang đăng nhập...', 'info');
            } else showToast('Không thấy form!', 'error');
        };

        // Kéo thả & Ẩn hiện
        let isDrag = false, off = [0,0];
        $('.header').onmousedown = (e) => { isDrag = true; off = [panel.offsetLeft - e.clientX, panel.offsetTop - e.clientY]; };
        document.onmousemove = (e) => { if(isDrag) { panel.style.left = (e.clientX + off[0]) + 'px'; panel.style.top = (e.clientY + off[1]) + 'px'; panel.style.right = 'auto'; } };
        document.onmouseup = () => isDrag = false;
        $('.red').onclick = () => panel.style.display = 'none';
        document.addEventListener('keydown', (e) => { if(e.key === 'F2') panel.style.display = 'block'; });
    });
})();
