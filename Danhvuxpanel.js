// ==UserScript==
// @name         K12 Helper Pro - Danhvux Port 8000 (No Discord)
// @namespace    http://tampermonkey.net/
// @version      21.9
// @description  Giữ nguyên 100% bản gốc, nâng cấp x20 thực tế, Bypass Question + Toast Notifications.
// @author       Danhvux
// @match        *://*.k12online.vn/*
// @grant        GM_xmlhttpRequest
// @connect      localhost
// ==/UserScript==

(function() {
    'use strict';

    // === CẤU HÌNH HỆ THỐNG ===
    const BLACKLIST_API = 'http://localhost:8000/blacklist';

    let config = JSON.parse(localStorage.getItem('k12_ult_cfg')) || {
        mainColor: '#ffea00', width: 320, speed: 1, user: '', pass: '', isDarkMode: true
    };

    const save = () => localStorage.setItem('k12_ult_cfg', JSON.stringify(config));

    // === TOAST NOTIFICATIONS SYSTEM ===
    const createToastContainer = () => {
        if (document.getElementById('toast-container')) return;
        
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed; top: 80px; right: 20px; z-index: 100001;
            display: flex; flex-direction: column; gap: 10px; max-width: 350px;
            pointer-events: none;
        `;
        document.body.appendChild(toastContainer);
    };

    const showToast = (message, type = 'info', duration = 4000) => {
        createToastContainer();
        const container = document.getElementById('toast-container');
        
        const toast = document.createElement('div');
        toast.style.cssText = `
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white; padding: 16px 20px; border-radius: 12px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.3); transform: translateX(400px);
            opacity: 0; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(10px); border-left: 4px solid rgba(255,255,255,0.3);
            font-family: 'Segoe UI', sans-serif; font-size: 14px; line-height: 1.4;
            max-width: 350px; word-wrap: break-word;
        `;
        
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 20px;">${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                <span style="flex: 1;">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: rgba(255,255,255,0.2); border: none; border-radius: 50%;
                    width: 24px; height: 24px; cursor: pointer; color: white;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 16px; opacity: 0.8; transition: opacity 0.2s;
                " onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8">×</button>
            </div>
        `;
        
        container.appendChild(toast);
        
        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });
        
        // Auto remove
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 400);
        }, duration);
    };

    // --- HÀM TURBO X20 & BYPASS (CHẠY THỰC TẾ) ---
    const runTurbo = () => {
        const v = document.querySelector('video');
        if (v && config.speed > 1) {
            v.playbackRate = parseFloat(config.speed);
            if (v.paused && !v.ended) v.play();
        }
        // Tự động nhấn các nút câu hỏi của K12
        document.querySelectorAll('.vjs-skip-question, .btn-confirm, .btn-next-question, .vjs-done-button').forEach(btn => btn.click());
    };
    setInterval(runTurbo, 1000);

    // --- HÀM KIỂM TRA IP & BLACKLIST ---
    let bannedList = [];
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
                            bannedList = JSON.parse(response.responseText);
                            if (bannedList.includes(userIP)) {
                                renderBannedScreen(userIP);
                                resolve(false);
                            } else { 
                                showToast(`✅ Truy cập được cấp cho IP: ${userIP.slice(0,7)}...`, 'success');
                                resolve(true); 
                            }
                        } catch(e) { 
                            console.error('Blacklist check failed:', e);
                            resolve(true); 
                        }
                    },
                    onerror: () => { 
                        showToast('⚠️ Không thể kiểm tra blacklist (offline)', 'warning');
                        resolve(true); 
                    }
                });
            })
            .catch(() => { 
                showToast('⚠️ Không thể lấy IP (offline)', 'warning');
                resolve(true); 
            });
        });
    };

    const renderBannedScreen = (ip) => {
        document.body.innerHTML = `
            <div style="height:100vh; background:#0d1117; color:#ff4d4d; display:flex; align-items:center; justify-content:center; flex-direction:column; font-family:sans-serif; text-align:center;">
                <h1 style="font-size:60px; margin:0;">🚫 BANNED</h1>
                <p style="font-size:20px; color:#c9d1d9;">IP của bạn (<b>${ip}</b>) đã bị cấm truy cập Panel.</p>
            </div>`;
        showToast('🚫 Bạn đã bị cấm truy cập!', 'error', 6000);
    };

    // --- KHỞI TẠO GIAO DIỆN CHÍNH ---
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
                    transition: height 0.4s ease; border: 1px solid var(--border);
                }
                .header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; cursor: move; }
                .header .title { color: var(--mc); font-weight: bold; font-size: 18px; }
                .dots { display: flex; gap: 8px; }
                .dot { height: 12px; width: 12px; border-radius: 50%; cursor: pointer; }
                .red { background: #ff5f56; } .yellow { background: #ffbd2e; } .green { background: #27c93f; }
                .tabs { display: flex; background: var(--bg-tab); padding: 0 5px; border-bottom: 1px solid var(--border); justify-content: space-around; overflow-x: auto; }
                .tab { padding: 12px 10px; cursor: pointer; font-size: 10px; color: var(--text-sec); font-weight: 900; position: relative; transition: 0.3s; white-space: nowrap; }
                .tab.active { color: var(--mc); }
                .tab.active::after { content: ''; position: absolute; bottom: 0; left: 10px; right: 10px; height: 3px; background: var(--mc); border-radius: 3px 3px 0 0; }
                .content { display: none; padding: 20px; box-sizing: border-box; }
                .content.active { display: block; }
                .row-speed { display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 5px; }
                .val-right { color: var(--mc); font-weight: bold; font-size: 16px; }
                .slider { width: 100%; height: 5px; background: var(--border); border-radius: 5px; appearance: none; margin: 10px 0 25px 0; outline: none; }
                .slider::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; background: ${isDark ? '#fff' : 'var(--mc)'}; border-radius: 50%; cursor: pointer; }
                .video-placeholder { width: 100%; height: 130px; background: #000; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #444; font-size: 12px; font-style: italic; margin-bottom: 15px; border: 1px dashed #333; }
                .app-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
                .app-item { background: var(--bg-input); padding: 12px 5px; border-radius: 10px; cursor: pointer; border: 1px solid var(--border); text-align: center; }
                input[type=text], input[type=password] { width: 100%; padding: 12px; background: var(--bg-input); border: 1px solid var(--border); color: var(--text); border-radius: 8px; margin-bottom: 12px; box-sizing: border-box; }
                .btn { width: 100%; padding: 14px; background: #b8cc8e; border: none; border-radius: 12px; color: #1e2227; font-weight: bold; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
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
                    <div class="video-placeholder" id="v-display">video source</div>
                    <input type="text" id="v-url" placeholder="Link video .mp4...">
                    <button class="btn" style="background:#444; color:#fff" id="v-run">PHÁT VIDEO</button>
                </div>
                <div id="t-apps" class="content">
                    <div class="app-grid">
                        <div class="app-item" onclick="window.open('https://gemini.google.com')">✨ Gemini</div>
                        <div class="app-item" onclick="window.open('https://chatgpt.com')">🤖 GPT</div>
                        <div class="app-item" onclick="window.open('https://messenger.com')">💬 Msg</div>
                        <div class="app-item" onclick="window.open('https://facebook.com')">📘 FB</div>
                        <div class="app-item" onclick="window.open('https://youtube.com')">🔴 YT</div>
                        <div class="app-item" onclick="window.open('https://tiktok.com')">🎵 TT</div>
                    </div>
                </div>
                <div id="t-set" class="content">
                    <div class="switch-row"><span>DARK MODE</span><label class="switch"><input type="checkbox" id="mode-toggle" ${config.isDarkMode ? 'checked' : ''}><span class="slider-switch"></span></label></div>
                    <input type="color" id="c-pick" style="width:100%; height:40px; background:none; border:none;" value="${config.mainColor}">
                    <input type="range" id="w-range" class="slider" min="280" max="600" value="${config.width}">
                    <input type="text" id="u-val" placeholder="Username..." value="${config.user}">
                    <input type="password" id="p-val" placeholder="Password..." value="${config.pass}">
                    <button class="btn btn-save" id="btn-save">LƯU CÀI ĐẶT</button>
                </div>
            </div>
            <div class="footer">DANHVUX • K12 HELPER v21.9</div>
        `;
        document.body.appendChild(panel);

        const $ = (id) => panel.querySelector(id);
        const adjustHeight = () => {
            const active = panel.querySelector('.content.active');
            if (active) panel.style.height = (panel.querySelector('.header').offsetHeight + panel.querySelector('.tabs').offsetHeight + active.scrollHeight + 35) + 'px';
        };

        // Tab switching
        panel.querySelectorAll('.tab').forEach(tab => {
            tab.onclick = () => {
                panel.querySelectorAll('.tab, .content').forEach(el => el.classList.remove('active'));
                tab.classList.add('active');
                $(`#${tab.dataset.t}`).classList.add('active');
                adjustHeight();
            };
        });

        // Event handlers
        $('#mode-toggle').onchange = (e) => { 
            config.isDarkMode = e.target.checked; 
            updateCSS(); 
            save(); 
            showToast(`🌙 Dark mode đã được ${config.isDarkMode ? 'bật' : 'tắt'}`, 'success');
        };
        
        $('#sp-range').oninput = (e) => { 
            $('#sp-txt').innerText = e.target.value; 
            config.speed = parseFloat(e.target.value); 
            runTurbo(); 
            showToast(`⚡ Tốc độ: x${e.target.value}`, 'info', 2000);
        };
        
        $('#w-range').oninput = (e) => { 
            config.width = parseInt(e.target.value); 
            panel.style.width = config.width + 'px'; 
        };
        
        $('#btn-save').onclick = () => {
