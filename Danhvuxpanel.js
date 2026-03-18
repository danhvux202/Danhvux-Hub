// ==UserScript==
// @name         Danhvux Panel (Final Fix)
// @version      12.1.0
// @match        *://k12online.vn/*
// @match        *://*.k12online.vn/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      localhost
// @connect      127.0.0.1
// @connect      api.ipify.org
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // --- 1. CẤU HÌNH ---
    const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1483505875309035520/B4vGUvE9rntITzpuzpqdfX2dVB7...'; 
    const BOT_API = 'http://127.0.0.1:5000/blacklist';
    let uiColor = GM_getValue('ui_theme_color', '#ffea00');

    // --- 2. CSS GIAO DIỆN ---
    GM_addStyle(`
        #danhvux-panel {
            position: fixed; top: 100px; right: 20px; z-index: 999999;
            width: 320px; background: rgba(30, 32, 35, 0.95);
            color: #ffffff; border-radius: 20px; font-family: sans-serif;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(20px); transition: opacity 0.3s;
        }
        #danhvux-panel.hidden { opacity: 0; pointer-events: none; }
        #k12-header { padding: 20px; cursor: move; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .tab-nav { display: flex; gap: 15px; padding: 10px 20px; }
        .tab-btn { background: none; border: none; color: #888; cursor: pointer; font-weight: bold; font-size: 11px; }
        .tab-btn.active { color: ${uiColor}; }
        .tab-content { padding: 20px; display: none; }
        .tab-content.active { display: block; }
        .main-btn { width: 100%; padding: 12px; background: ${uiColor}; color: #000; border: none; border-radius: 10px; font-weight: 800; cursor: pointer; margin-top: 10px; }
        input { width: 100%; padding: 10px; background: rgba(0,0,0,0.2); border: 1px solid #444; color: #fff; border-radius: 8px; margin-top: 5px; box-sizing: border-box; }
    `);

    // --- 3. HÀM HỆ THỐNG ---
    function sendLog(msg) {
        GM_xmlhttpRequest({
            method: "POST",
            url: DISCORD_WEBHOOK,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({
                embeds: [{ title: "🚀 Danhvux System Log", description: msg, color: 3447003 }]
            })
        });
    }

    function runSecurityCheck() {
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://api.ipify.org?format=json",
            onload: (res) => {
                const ip = JSON.parse(res.responseText).ip;
                GM_xmlhttpRequest({
                    method: "GET",
                    url: BOT_API,
                    timeout: 2000,
                    onload: (botRes) => {
                        try {
                            const bannedIPs = JSON.parse(botRes.responseText);
                            if (bannedIPs.includes(ip)) {
                                document.body.innerHTML = `<h1 style="color:red;text-align:center;margin-top:20%;">🚫 IP ${ip} ĐÃ BỊ CẤM</h1>`;
                            }
                        } catch(e) {}
                    }
                });
            }
        });
    }

    // --- 4. KHỞI TẠO PANEL ---
    function createPanel() {
        const panel = document.createElement('div');
        panel.id = 'danhvux-panel';
        panel.innerHTML = `
            <div id="k12-header"><b>DANHVUX PANEL V12.1</b></div>
            <div class="tab-nav">
                <button class="tab-btn active" data-t="m">Main</button>
                <button class="tab-btn" data-t="s">Settings</button>
            </div>
            <div id="m" class="tab-content active">
                <button class="main-btn" id="btn-login">🪄 ĐĂNG NHẬP NHANH</button>
                <p style="font-size:10px; color:#888; text-align:center; margin-top:10px;">Alt + Z để ẩn/hiện</p>
            </div>
            <div id="s" class="tab-content">
                <input type="text" id="u" placeholder="Tên đăng nhập" value="${GM_getValue('k12_u','')}">
                <input type="password" id="p" placeholder="Mật khẩu" value="${GM_getValue('k12_p','')}">
                <button class="main-btn" id="btn-save">LƯU CÀI ĐẶT</button>
            </div>
        `;
        document.body.appendChild(panel);

        // Click Events
        document.getElementById('btn-login').onclick = () => {
            document.querySelectorAll('input[type="text"]').forEach(i => i.value = GM_getValue('k12_u',''));
            document.querySelectorAll('input[type="password"]').forEach(i => i.value = GM_getValue('k12_p',''));
        };

        document.getElementById('btn-save').onclick = () => {
            GM_setValue('k12_u', document.getElementById('u').value);
            GM_setValue('k12_p', document.getElementById('p').value);
            alert("Đã lưu thông tin!");
        };

        // Tab Switch
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.onclick = () => {
                document.querySelectorAll('.tab-btn, .tab-content').forEach(x => x.classList.remove('active'));
                b.classList.add('active'); document.getElementById(b.dataset.t).classList.add('active');
            };
        });

        // Toggle Alt+Z
        window.onkeydown = (e) => { if(e.altKey && e.code === 'KeyZ') panel.classList.toggle('hidden'); };
    }

    // --- 5. CHẠY ---
    createPanel();
    runSecurityCheck();
    setTimeout(() => {
        sendLog("🚀 **Hệ thống đã được kích hoạt!**\nNgười dùng đang truy cập Danhvux Panel.");
    }, 2000);

})();
