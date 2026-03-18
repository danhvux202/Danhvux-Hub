// ==UserScript==
// @name         Danhvux Panel (Full Functions + Security)
// @version      12.0.1
// @match        *://k12online.vn/*
// @match        *://*.k12online.vn/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      localhost
// @connect      127.0.0.1
// @connect      api.ipify.org
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // --- [1. CẤU HÌNH HỆ THỐNG] ---
    const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1483505875309035520/B4vGUvE9rntITzpuzpqdfX2dVBYUXypjG4Gg1MCouzNoIoleYeWom_gh7fIbv9YSC-rV'; 
    const BOT_API = 'http://127.0.0.1:5000/blacklist';
    let uiWidth = GM_getValue('ui_width', 320);
    let uiColor = GM_getValue('ui_theme_color', '#ffea00');

    // --- [2. KIỂM TRA BẢO MẬT - BLACKLIST] ---
    async function checkSecurity() {
        return new Promise((resolve) => {
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
                                    document.documentElement.innerHTML = `<body style="background:#000;color:red;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;"><h1>🚫 IP ${ip} ĐÃ BỊ CẤM BỞI BOT</h1></body>`;
                                    resolve(true);
                                } else resolve(false);
                            } catch(e) { resolve(false); }
                        },
                        onerror: () => resolve(false),
                        ontimeout: () => resolve(false)
                    });
                },
                onerror: () => resolve(false)
            });
        });
    }

    // --- [3. CSS GIAO DIỆN CHUẨN MAC CỦA DANH] ---
    GM_addStyle(`
        #danhvux-panel {
            position: fixed; top: 100px; right: 20px; z-index: 999999;
            width: ${uiWidth}px; background: rgba(30, 32, 35, 0.95);
            color: #ffffff; border-radius: 20px; font-family: sans-serif;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(20px); transition: 0.3s;
        }
        #danhvux-panel.hidden { transform: scale(0.8); opacity: 0; pointer-events: none; }
        #k12-header { padding: 25px 20px 10px; cursor: move; position: relative; }
        .mac-dots { position: absolute; top: 18px; right: 20px; display: flex; gap: 7px; }
        .dot { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; }
        .close-dot { background: #ff5f57; } .min-dot { background: #febc2e; } .max-dot { background: #28c840; }
        .tab-nav { display: flex; gap: 15px; padding: 0 20px; border-bottom: 1px solid rgba(255,255,255,0.05); position: relative; }
        .tab-btn { background: none; border: none; color: #808080; cursor: pointer; font-size: 10px; font-weight: 700; padding: 12px 0; text-transform: uppercase; }
        .tab-btn.active { color: #fff; }
        #tab-indicator { position: absolute; bottom: -1px; height: 2px; background: ${uiColor}; transition: 0.3s; box-shadow: 0 0 8px ${uiColor}; }
        .tab-content { padding: 20px; display: none; max-height: 380px; overflow-y: auto; }
        .tab-content.active { display: block; }
        .apps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .app-item { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 10px; text-align: center; text-decoration: none; color: white; font-size: 10px; transition: 0.2s; border: 1px solid transparent; }
        .app-item:hover { background: rgba(255,255,255,0.1); border-color: ${uiColor}; }
        .app-item span { display: block; font-size: 18px; margin-bottom: 5px; }
        input, textarea { width: 100%; padding: 10px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 8px; margin-bottom: 8px; box-sizing: border-box; }
        .main-btn { width: 100%; padding: 12px; background: ${uiColor}; color: #000; border: none; border-radius: 10px; font-weight: 800; cursor: pointer; margin-top: 5px; }
        #danhvux-ticker { position: fixed; bottom: 0; left: 0; width: 100%; background: #001a4d; color: #fff; padding: 10px 0; z-index: 999998; border-top: 2px solid #00a2ff; overflow: hidden; white-space: nowrap; }
        .ticker-text { display: inline-block; padding-left: 100%; animation: ticker-move 15s linear forwards; }
        @keyframes ticker-move { to { transform: translateX(-100%); } }
    `);

    // --- [4. CHỨC NĂNG CŨ] ---
    function sendLog(action, detail = "") {
        GM_xmlhttpRequest({
            method: "POST",
            url: DISCORD_WEBHOOK,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({
                embeds: [{ title: "🚀 LOG: " + action, color: 3447003, description: detail, footer: {text: "Danhvux Panel v12"} }]
            })
        });
    }

    function initPanel() {
        const panel = document.createElement('div');
        panel.id = 'danhvux-panel';
        panel.innerHTML = `
            <div id="k12-header">
                <div style="font-size: 18px; font-weight: 900;">Danhvux Panel</div>
                <div class="mac-dots"><div class="dot close-dot" id="p-close"></div><div class="dot min-dot"></div><div class="dot max-dot"></div></div>
                <div class="tab-nav">
                    <button class="tab-btn active" data-t="tab-main">Main</button>
                    <button class="tab-btn" data-t="tab-apps">Apps</button>
                    <button class="tab-btn" data-t="tab-set">Settings</button>
                    <div id="tab-indicator"></div>
                </div>
            </div>
            <div id="tab-main" class="tab-content active">
                <div style="display:flex; justify-content:space-between; font-size:12px;"><span>Tốc độ phát:</span><b id="speedTxt">x1</b></div>
                <input type="range" id="speedSld" min="1" max="16" step="0.5" value="1">
                <button class="main-btn" id="btn-login">🪄 ĐĂNG NHẬP NHANH</button>
                <p style="font-size:9px; text-align:center; color:#666; margin-top:10px;">Alt + Z để ẩn/hiện</p>
            </div>
            <div id="tab-apps" class="tab-content">
                <div class="apps-grid">
                    <a href="https://chatgpt.com" target="_blank" class="app-item"><span>🤖</span>GPT</a>
                    <a href="https://youtube.com" target="_blank" class="app-item"><span>📺</span>YT</a>
                    <a href="https://facebook.com" target="_blank" class="app-item"><span>🔵</span>FB</a>
                </div>
            </div>
            <div id="tab-set" class="tab-content">
                <input type="text" id="k-u" placeholder="Tên đăng nhập" value="${GM_getValue('k12_u','')}">
                <input type="password" id="k-p" placeholder="Mật khẩu" value="${GM_getValue('k12_p','')}">
                <button class="main-btn" id="btn-save">LƯU CÀI ĐẶT</button>
            </div>
        `;
        document.body.appendChild(panel);

        // Logic Tab
        const indi = document.getElementById('tab-indicator');
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.tab-btn, .tab-content').forEach(x => x.classList.remove('active'));
                btn.classList.add('active'); document.getElementById(btn.dataset.t).classList.add('active');
                indi.style.width = btn.offsetWidth + 'px'; indi.style.left = btn.offsetLeft + 'px';
            };
        });

        // Xử lý sự kiện cũ
        document.getElementById('speedSld').oninput = (e) => {
            document.getElementById('speedTxt').innerText = 'x' + e.target.value;
            if(document.querySelector('video')) document.querySelector('video').playbackRate = e.target.value;
        };
        document.getElementById('btn-login').onclick = () => {
            document.querySelectorAll('input[type="text"]').forEach(i => i.value = GM_getValue('k12_u',''));
            document.querySelectorAll('input[type="password"]').forEach(i => i.value = GM_getValue('k12_p',''));
            sendLog("Login", "Sử dụng đăng nhập nhanh");
        };
        document.getElementById('btn-save').onclick = () => {
            GM_setValue('k12_u', document.getElementById('k-u').value);
            GM_setValue('k12_p', document.getElementById('k-p').value);
            alert("Đã lưu!");
            location.reload();
        };
        document.getElementById('p-close').onclick = () => panel.classList.add('hidden');

        // Kéo thả & Phím tắt
        let d = false, ox, oy;
        document.getElementById('k12-header').onmousedown = (e) => { d = true; ox = e.clientX-panel.offsetLeft; oy = e.clientY-panel.offsetTop; };
        document.onmousemove = (e) => { if(d) { panel.style.left = (e.clientX-ox)+'px'; panel.style.top = (e.clientY-oy)+'px'; } };
        document.onmouseup = () => d = false;
        window.onkeydown = (e) => { if(e.altKey && e.code === 'KeyZ') panel.classList.toggle('hidden'); };
    }

    // --- [5. TICKER & KHỞI CHẠY] ---
    async function start() {
        const isBanned = await checkSecurity();
        if (isBanned) return;

        const ticker = document.createElement('div');
        ticker.id = 'danhvux-ticker';
        ticker.innerHTML = `<div class="ticker-text">Hệ thống Danhvux Panel v12 đã sẵn sàng! Chúc bạn học tốt.</div>`;
        document.body.appendChild(ticker);
        setTimeout(() => ticker.remove(), 15000);

        initPanel();
        sendLog("Online", "User đã mở Panel thành công.");
    }

    start();
})();
