// ==UserScript==
// @name         K12 Helper Pro - Danhvux Port 8000 (Fixed)
// @namespace    http://tampermonkey.net/
// @version      21.9.1
// @description  Bypass Question, Turbo Speed x20, Auto Login & Toast System.
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

    // --- HÀM TURBO X20 & BYPASS ---
    const runTurbo = () => {
        const v = document.querySelector('video');
        if (v && !v.paused) {
            v.playbackRate = parseFloat(config.speed);
        }
        // Tự động nhấn các nút câu hỏi của K12
        const selectors = ['.vjs-skip-question', '.btn-confirm', '.btn-next-question', '.vjs-done-button', '.btn-yes'];
        selectors.forEach(s => {
            const btn = document.querySelector(s);
            if (btn && btn.offsetParent !== null) btn.click();
        });
    };
    setInterval(runTurbo, 1000);

    // --- HÀM KIỂM TRA IP & SECURITY ---
    const startSecuritySystem = () => {
        return new Promise((resolve) => {
            fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => {
                const userIP = data.ip;
                GM_xmlhttpRequest({
                    method: "GET",
                    url: BLACKLIST_API + "?nocache=" + Date.now(),
                    onload: function(response) {
                        try {
                            const bannedList = JSON.parse(response.responseText);
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
            <div style="height:100vh; background:#0d1117; color:#ff4d4d; display:flex; align-items:center; justify-content:center; flex-direction:column; font-family:sans-serif; text-align:center; position:fixed; width:100%; z-index:999999;">
                <h1 style="font-size:60px; margin:0;">🚫 BANNED</h1>
                <p style="font-size:20px; color:#c9d1d9;">IP của bạn (<b>${ip}</b>) đã bị cấm truy cập Panel.</p>
            </div>`;
    };

    // --- TOAST NOTIFICATIONS ---
    const showToast = (message, type = 'info', duration = 3000) => {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        
        toast.innerHTML = `
            <span class="icon">${icons[type]}</span>
            <span class="msg">${message}</span>
            <span class="close">✕</span>
        `;

        container.appendChild(toast);
        const remove = () => {
            toast.style.animation = 'slideOut 0.3s forwards';
            toast.addEventListener('animationend', () => toast.remove());
        };
        toast.querySelector('.close').onclick = remove;
        if (duration > 0) setTimeout(remove, duration);
    };

    // --- KHỞI TẠO GIAO DIỆN ---
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
                }
                #dv-panel {
                    position: fixed; top: 50px; right: 20px; width: var(--w);
                    background: var(--bg); color: var(--text); border-radius: 12px;
                    font-family: 'Segoe UI', Tahoma, sans-serif; z-index: 100000;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.4); overflow: hidden;
                    border: 1px solid var(--border);
                }
                .header { padding: 15px; display: flex; justify-content: space-between; align-items: center; cursor: move; background: var(--bg-tab); }
                .header .title { color: var(--mc); font-weight: bold; }
                .tabs { display: flex; background: var(--bg-tab); border-bottom: 1px solid var(--border); }
                .tab { flex: 1; padding: 10px; text-align: center; cursor: pointer; font-size: 11px; font-weight: bold; color: var(--text-sec); }
                .tab.active { color: var(--mc); border-bottom: 2px solid var(--mc); }
                .content { display: none; padding: 15px; }
                .content.active { display: block; }
                .slider { width: 100%; margin: 10px 0; accent-color: var(--mc); }
                .btn { width: 100%; padding: 10px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 10px; transition: 0.2s; }
                .btn-primary { background: var(--mc); color: #000; }
                .btn-primary:hover { opacity: 0.8; }
                input[type=text], input[type=password] { width: 100%; padding: 8px; margin-bottom: 10px; border-radius: 5px; border: 1px solid var(--border); background: var(--bg-input); color: var(--text); box-sizing: border-box; }
                
                /* Toast CSS */
                #toast-container { position: fixed; top: 20px; right: 20px; z-index: 100001; }
                .toast { 
                    background: var(--bg); color: var(--text); padding: 12px 20px; border-radius: 8px; margin-bottom: 10px;
                    display: flex; align-items: center; gap: 10px; border-left: 5px solid var(--mc);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2); animation: slideIn 0.3s forwards;
                }
                @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
                @keyframes slideOut { to { transform: translateX(120%); } }
            `;
        };
        document.head.appendChild(style);
        updateCSS();

        const panel = document.createElement('div');
        panel.id = 'dv-panel';
        panel.innerHTML = `
            <div class="header">
                <div class="title">DANHVUX PRO</div>
                <div style="display:flex; gap:5px;">
                    <div class="dot yellow" style="width:12px; height:12px; background:#ffbd2e; border-radius:50%; cursor:pointer;"></div>
                    <div class="dot red" style="width:12px; height:12px; background:#ff5f56; border-radius:50%; cursor:pointer;"></div>
                </div>
            </div>
            <div class="tabs">
                <div class="tab active" data-t="t-main">MAIN</div>
                <div class="tab" data-t="t-video">VIDEO</div>
                <div class="tab" data-t="t-set">SETTING</div>
            </div>
            <div id="t-main" class="content active">
                <div style="display:flex; justify-content:space-between"><b>Tốc độ</b> <span style="color:var(--mc)">x<span id="sp-txt">${config.speed}</span></span></div>
                <input type="range" id="sp-range" class="slider" min="1" max="20" step="0.5" value="${config.speed}">
                <button class="btn btn-primary" id="do-login">🪄 AUTO LOGIN</button>
            </div>
            <div id="t-video" class="content">
                <input type="text" id="v-url" placeholder="Dán link .mp4 vào đây...">
                <button class="btn btn-primary" id="v-run">PHÁT VIDEO CUSTOM</button>
            </div>
            <div id="t-set" class="content">
                <label><input type="checkbox" id="mode-toggle" ${config.isDarkMode ? 'checked' : ''}> Dark Mode</label>
                <input type="color" id="c-pick" value="${config.mainColor}" style="width:100%; margin:10px 0;">
                <input type="text" id="u-val" placeholder="Username" value="${config.user}">
                <input type="password" id="p-val" placeholder="Password" value="${config.pass}">
                <button class="btn btn-primary" id="btn-save">LƯU CẤU HÌNH</button>
            </div>
            <div style="font-size:9px; text-align:center; padding:5px; opacity:0.5;">F2 để hiện lại Panel</div>
        `;
        document.body.appendChild(panel);

        // --- EVENTS ---
        const $ = (s) => panel.querySelector(s);

        panel.querySelectorAll('.tab').forEach(t => {
            t.onclick = () => {
                panel.querySelectorAll('.tab, .content').forEach(el => el.classList.remove('active'));
                t.classList.add('active');
                $(`#${t.dataset.t}`).classList.add('active');
            };
        });

        $('#sp-range').oninput = (e) => {
            config.speed = e.target.value;
            $('#sp-txt').innerText = config.speed;
            runTurbo();
        };

        $('#btn-save').onclick = () => {
            config.mainColor = $('#c-pick').value;
            config.user = $('#u-val').value;
            config.pass = $('#p-val').value;
            config.isDarkMode = $('#mode-toggle').checked;
            save();
            showToast('Đã lưu cấu hình!', 'success');
            setTimeout(() => location.reload(), 1000);
        };

        $('#do-login').onclick = () => {
            const u = document.querySelector('input[name="username"]');
            const p = document.querySelector('input[name="password"]');
            const btn = document.querySelector('button[type="submit"]');
            if (u && p && btn) {
                u.value = config.user;
                p.value = config.pass;
                u.dispatchEvent(new Event('input', { bubbles: true }));
                p.dispatchEvent(new Event('input', { bubbles: true }));
                showToast('Đang đăng nhập...', 'info');
                setTimeout(() => btn.click(), 500);
            } else {
                showToast('Không tìm thấy form đăng nhập!', 'error');
            }
        };

        // Kéo thả Panel
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

        showToast('K12 Helper Pro đã sẵn sàng!', 'success');
    });
})();
