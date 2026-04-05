// ==UserScript==
// @name         K12 Helper Pro - Danhvux Port 8000 (With Toast)
// @namespace    http://tampermonkey.net/
// @version      21.10
// @description  Giữ nguyên 100% bản gốc, nâng upgrade x20 thực tế, Bypass Question + Toast Notifications + Perfect Apps
// @author       Danhvux
// @match        *://*.k12online.vn/*
// @grant        GM_xmlhttpRequest
// @connect      localhost
// ==/UserScript==

(function() {
    'use strict';

    const BLACKLIST_API = 'http://localhost:8000/blacklist';
    let config = JSON.parse(localStorage.getItem('k12_ult_cfg')) || {
        mainColor: '#ffea00', width: 320, speed: 1, user: '', pass: '', isDarkMode: true, toastPos: 'top-right'
    };
    const save = () => localStorage.setItem('k12_ult_cfg', JSON.stringify(config));

    const runTurbo = () => {
        const v = document.querySelector('video');
        if (v && config.speed > 1) {
            v.playbackRate = parseFloat(config.speed);
            if (v.paused && !v.ended) v.play();
        }
        document.querySelectorAll('.vjs-skip-question, .btn-confirm, .btn-next-question, .vjs-done-button').forEach(btn => btn.click());
    };
    setInterval(runTurbo, 1000);

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
            <div style="height:100vh; background:#0d1117; color:#ff4d4d; display:flex; align-items:center; justify-content:center; flex-direction:column; font-family:sans-serif; text-align:center;">
                <h1 style="font-size:60px; margin:0;">🚫 BANNED</h1>
                <p style="font-size:20px; color:#c9d1d9;">IP của bạn (<b>${ip}</b>) đã bị cấm truy cập Panel.</p>
            </div>`;
    };

    const showToast = (message, type = 'info', duration = 3000) => {
        const isDark = config.isDarkMode;
        const pos = config.toastPos;
        
        document.querySelectorAll('.toast').forEach(t => t.remove());

        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed; z-index: 999999;
            display: flex; flex-direction: column; gap: 12px;
            pointer-events: none;
        `;
        
        const positions = {
            'top-right': 'top: 20px; right: 20px;',
            'top-left': 'top: 20px; left: 20px;',
            'bottom-right': 'bottom: 20px; right: 20px;',
            'bottom-left': 'bottom: 20px; left: 20px;',
        };
        container.style.cssText += positions[pos] || positions['top-right'];

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.style.cssText = `
            min-width: 280px; max-width: 360px;
            padding: 16px 20px;
            background: ${isDark ? '#1e2227' : '#ffffff'};
            color: ${isDark ? '#ffffff' : '#1e2227'};
            border-radius: 12px;
            box-shadow: 0 8px 24px ${isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.15)'};
            font-family: 'Segoe UI', 'Roboto', sans-serif;
            font-size: 14px;
            display: flex; align-items: center; gap: 14px;
            opacity: 0; transform: translateY(-20px) scale(0.95);
            animation: toastIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        `;

        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️', loading: '⏳' };
        toast.innerHTML = `
            <span style="font-size: 20px; flex-shrink: 0;">${icons[type] || icons.info}</span>
            <span style="flex: 1; word-wrap: break-word;">${message}</span>
            <span class="toast-close" style="cursor: pointer; font-size: 18px; color: ${isDark ? '#777' : '#999'};">✕</span>
        `;

        container.appendChild(toast);
        document.body.appendChild(container);

        if (!document.getElementById('toast-anim-css')) {
            const animStyle = document.createElement('style');
            animStyle.id = 'toast-anim-css';
            animStyle.innerHTML = `
                @keyframes toastIn {
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes toastOut {
                    to { opacity: 0; transform: translateY(-20px) scale(0.95); }
                }
            `;
            document.head.appendChild(animStyle);
        }

        toast.querySelector('.toast-close').onclick = () => {
            toast.style.animation = 'toastOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        };

        if (duration > 0) {
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.style.animation = 'toastOut 0.3s forwards';
                    setTimeout(() => toast.remove(), 300);
                }
            }, duration);
        }
    };

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
                
                /* PERFECT APPS GRID */
                .app-grid { 
                    display: grid; 
                    grid-template-columns: repeat(3, 1fr); 
                    gap: 12px; 
                    margin-top: 5px;
                }
                .app-item { 
                    background: var(--bg-input); 
                    padding: 14px 8px; 
                    border-radius: 12px; 
                    cursor: pointer; 
                    border: 1px solid var(--border); 
                    text-align: center; 
                    font-size: 11px; 
                    font-weight: 600; 
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    gap: 6px;
                    line-height: 1.2;
                    position: relative;
                    overflow: hidden;
                }
                .app-item::before {
                    content: attr(data-tooltip);
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--bg);
                    color: var(--text);
                    padding: 6px 10px;
                    border-radius: 6px;
                    font-size: 10px;
                    white-space: nowrap;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.2s ease;
                    margin-bottom: 8px;
                    border: 1px solid var(--border);
                    box-shadow: 0 4px 12px var(--shadow);
                }
                .app-item:hover::before {
                    opacity: 1;
                    visibility: visible;
                    transform: translateX(-50%) translateY(-4px);
                }
                .app-item:hover {
                    background: var(--mc) !important; 
                    color: #000 !important; 
                    transform: translateY(-3px); 
                    box-shadow: 0 8px 20px var(--shadow);
                    border-color: var(--mc);
                }
                .app-item:active {
                    transform: translateY(-1px) scale(0.98);
                }
                
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
                <div class="tab" data-t="t-apps">🔗 APPS</div>
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
                        <div class="app-item" data-tooltip="Google Gemini AI" onclick="window.open('https://gemini.google.com')" title="Google Gemini AI">
                            ✨<div>Gemini AI</div>
                        </div>
                        <div class="app-item" data-tooltip="ChatGPT" onclick="window.open('https://chatgpt.com')" title="ChatGPT">
                            🤖<div>ChatGPT</div>
                        </div>
                        <div class="app-item" data-tooltip="Messenger" onclick="window.open('https://messenger.com')" title="Messenger">
                            💬<div>Messenger</div>
                        </div>
                        <div class="app-item" data-tooltip="Facebook" onclick="window.open('https://facebook.com')" title="Facebook">
                            📘<div>Facebook</div>
                        </div>
                        <div class="app-item" data-tooltip="YouTube" onclick="window.open('https://youtube.com')" title="YouTube">
                            🎥<div>YouTube</div>
                        </div>
                        <div class="app-item" data-tooltip="TikTok" onclick="window.open('https://tiktok.com')" title="TikTok">
                            🎵<div>TikTok</div>
                        </div>
                    </div>
                </div>
                <div id="t-set" class="content">
                    <div class="switch-row"><span>DARK MODE</span><label class="switch"><input type="checkbox" id="mode-toggle" ${config.isDarkMode ? 'checked' : ''}><span class="slider-switch"></span></label></div>
                    <div class="switch-row"><span>TOAST POSITION</span>
                        <select id="toast-pos" style="padding: 8px; background: var(--bg-input); border: 1px solid var(--border); color: var(--text); border-radius: 6px;">
                            <option value="top-right" ${config.toastPos === 'top-right' ? 'selected' : ''}>Top Right</option>
                            <option value="top-left"
