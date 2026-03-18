// ==UserScript==

// @name         Danhvux Panel (Privacy Report + Shortcut)

// @namespace    http://tampermonkey.net/

// @version      7.9.2

// @description  Báo cáo chỉ gửi IP/Nội dung + Phím tắt Alt+Z ẩn hiện

// @author       Danhvux

// @match        *://k12online.vn/*

// @match        *://*.k12online.vn/*

// @grant        GM_setValue

// @grant        GM_getValue

// @grant        GM_addStyle

// @grant        GM_xmlhttpRequest

// @run-at       document-end

// ==/UserScript==



(function() {

    'use strict';



    let uiWidth = GM_getValue('ui_width', 320);

    let uiColor = GM_getValue('ui_theme_color', '#ffea00');

    // THAY WEBHOOK CỦA BẠN VÀO ĐÂY

    const DISCORD_WEBHOOK = 'THAY_URL_WEBHOOK_CUA_BAN_TAI_DAY';



    GM_addStyle(`

        #danhvux-panel {

            position: fixed; top: 100px; right: 20px; z-index: 999999;

            width: ${uiWidth}px; background: rgba(30, 32, 35, 0.95);

            color: #ffffff; border-radius: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

            box-shadow: 0 20px 60px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);

            backdrop-filter: blur(20px); overflow: hidden; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s;

        }

        #danhvux-panel.hidden { transform: scale(0.8); opacity: 0; pointer-events: none; }



        #k12-header { padding: 25px 20px 10px; cursor: move; position: relative; }

        .mac-dots { position: absolute; top: 18px; right: 20px; display: flex; gap: 7px; }

        .dot { width: 12px; height: 12px; border-radius: 50%; }

        .close-dot { background: #ff5f57; } .min-dot { background: #febc2e; } .max-dot { background: #28c840; }



        .tab-nav { display: flex; gap: 18px; padding: 0 20px; margin-top: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); position: relative; }

        .tab-btn { background: none; border: none; color: #808080; cursor: pointer; font-size: 11px; font-weight: 700; padding: 12px 0; text-transform: uppercase; transition: 0.3s; }

        .tab-btn.active { color: #fff; }

        #tab-indicator { position: absolute; bottom: -1px; height: 2px; background: ${uiColor}; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 8px ${uiColor}; }



        .tab-content { padding: 20px; display: none; max-height: 380px; overflow-y: auto; }

        .tab-content.active { display: block; animation: fadeIn 0.3s ease; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }



        .apps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }

        .app-item { background: rgba(255,255,255,0.05); border-radius: 15px; padding: 15px 5px; text-align: center; text-decoration: none; color: white; border: 1px solid transparent; transition: 0.2s; }

        .app-item:hover { background: rgba(255,255,255,0.1); border-color: ${uiColor}44; transform: translateY(-2px); }

        .app-item span { display: block; font-size: 20px; margin-bottom: 5px; }

        .app-item small { font-size: 10px; font-weight: 600; opacity: 0.7; }



        .label-bright { font-size: 10px; font-weight: 800; color: #666; text-transform: uppercase; margin-bottom: 8px; display: block; }

        input[type="range"] { width: 100%; accent-color: ${uiColor}; margin: 10px 0 20px; cursor: pointer; }

        input[type="text"], input[type="password"], textarea { width: 100%; padding: 12px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 10px; margin-bottom: 10px; outline: none; font-size: 13px; }

        .auto-login-btn { width: 100%; padding: 14px; border: none; border-radius: 12px; background: ${uiColor}; color: #000; font-weight: 800; cursor: pointer; transition: 0.2s; }



        #danhvux-ticker { position: fixed; bottom: 0; left: 0; width: 100%; background: #001a4d; color: white; padding: 12px 0; z-index: 999998; font-weight: 700; border-top: 2px solid #00a2ff; overflow: hidden; white-space: nowrap; }

        .ticker-text { display: inline-block; padding-left: 100%; animation: ticker-move 18s linear forwards; }

        @keyframes ticker-move { to { transform: translateX(-100%); } }



        .lesson-card { background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; font-size: 12px; cursor: pointer; }

    `);



    // HÀM LẤY IP VÀ GỬI DISCORD

    async function sendToDiscord(message) {

        const status = document.getElementById('report-status');

        status.innerText = '⏳ Đang lấy địa chỉ mạng...';



        try {

            // Lấy IP từ dịch vụ bên thứ 3

            const ipResponse = await new Promise(resolve => {

                GM_xmlhttpRequest({

                    method: "GET",

                    url: "https://api.ipify.org?format=json",

                    onload: (res) => resolve(JSON.parse(res.responseText))

                });

            });



            const data = {

                embeds: [{

                    title: "🔔 BÁO CÁO MỚI",

                    color: parseInt(uiColor.replace('#', ''), 16),

                    fields: [

                        { name: "🌐 Địa chỉ IP", value: `\`${ipResponse.ip}\``, inline: true },

                        { name: "📝 Nội dung", value: message }

                    ],

                    footer: { text: "Danhvux Panel v7.9.2 • " + new Date().toLocaleString('vi-VN') }

                }]

            };



            GM_xmlhttpRequest({

                method: "POST",

                url: DISCORD_WEBHOOK,

                headers: { "Content-Type": "application/json" },

                data: JSON.stringify(data),

                onload: () => {

                    status.innerText = '✅ Đã gửi thành công!';

                    document.getElementById('report-text').value = '';

                }

            });

        } catch (e) {

            status.innerText = '❌ Lỗi hệ thống!';

        }

    }



    function createPanel() {

        const panel = document.createElement('div');

        panel.id = 'danhvux-panel';

        panel.innerHTML = `

            <div id="k12-header">

                <div style="font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">Danhvux Panel</div>

                <div class="mac-dots">

                    <div class="dot close-dot" onclick="this.closest('#danhvux-panel').classList.add('hidden')"></div>

                    <div class="dot min-dot"></div><div class="dot max-dot"></div>

                </div>

                <div class="tab-nav">

                    <button class="tab-btn active" data-target="main-tab">Main</button>

                    <button class="tab-btn" data-target="apps-tab">Apps</button>

                    <button class="tab-btn" data-target="report-tab">Report</button>

                    <button class="tab-btn" data-target="settings-tab">Settings</button>

                    <div id="tab-indicator"></div>

                </div>

            </div>

            <div id="main-tab" class="tab-content active">

                <div style="display:flex; justify-content:space-between; align-items:center;">

                    <span class="label-bright">Tốc độ phát</span>

                    <b id="speedValue" style="color:${uiColor}; font-size:14px;">x1</b>

                </div>

                <input type="range" id="speedSlider" min="1" max="16" step="0.5" value="1">

                <div id="main-lesson-list"></div>

                <button class="auto-login-btn" id="runAutoLogin" style="margin-top:10px; background:#e0e0e0; color:#111;">🪄 ĐĂNG NHẬP NHANH</button>

                <p style="font-size: 9px; color: #555; text-align: center; margin-top: 10px;">Mẹo: Nhấn <b>Alt + Z</b> để ẩn/hiện nhanh</p>

            </div>

            <div id="apps-tab" class="tab-content">

                <div class="apps-grid">

                    <a href="https://chatgpt.com" target="_blank" class="app-item"><span>🤖</span><small>ChatGPT</small></a>

                    <a href="https://gemini.google.com" target="_blank" class="app-item"><span>✨</span><small>Gemini</small></a>

                    <a href="https://youtube.com" target="_blank" class="app-item"><span>📺</span><small>YouTube</small></a>

                    <a href="https://facebook.com" target="_blank" class="app-item"><span>🔵</span><small>Facebook</small></a>

                    <a href="https://tiktok.com" target="_blank" class="app-item"><span>🎵</span><small>TikTok</small></a>

                    <a href="https://google.com" target="_blank" class="app-item"><span>🔍</span><small>Google</small></a>

                </div>

            </div>

            <div id="report-tab" class="tab-content">

                <span class="label-bright">Gửi báo cáo bảo mật</span>

                <textarea id="report-text" placeholder="Nhập lỗi hoặc ý kiến tại đây..."></textarea>

                <button class="auto-login-btn" id="sendReport">Gửi đi</button>

                <p id="report-status" style="font-size:10px; text-align:center; margin-top:10px; color:#888;"></p>

            </div>

            <div id="settings-tab" class="tab-content">

                <span class="label-bright">Độ rộng: <b id="widthVal">${uiWidth}px</b></span>

                <input type="range" id="setWidth" min="280" max="500" value="${uiWidth}">

                <span class="label-bright">Màu chủ đạo</span>

                <input type="color" id="setColor" value="${uiColor}" style="width:100%; height:40px; border:none; background:none; cursor:pointer;">

                <hr style="border:none; border-top:1px solid rgba(255,255,255,0.05); margin:20px 0;">

                <input type="text" id="k12_u" placeholder="Tên đăng nhập" value="${GM_getValue('k12_username','')}">

                <input type="password" id="k12_p" placeholder="Mật khẩu" value="${GM_getValue('k12_password','')}">

                <button class="auto-login-btn" id="saveSet">Lưu cài đặt</button>

            </div>

        `;

        document.body.appendChild(panel);



        // Phím tắt Alt + Z

        window.addEventListener('keydown', (e) => {

            if (e.altKey && e.code === 'KeyZ') {

                panel.classList.toggle('hidden');

            }

        });



        const indicator = document.getElementById('tab-indicator');

        const updateIndi = (btn) => { indicator.style.width = btn.offsetWidth + 'px'; indicator.style.left = btn.offsetLeft + 'px'; };

        setTimeout(() => updateIndi(document.querySelector('.tab-btn.active')), 300);



        document.querySelectorAll('.tab-btn').forEach(btn => {

            btn.onclick = () => {

                const target = document.getElementById(btn.dataset.target);

                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                btn.classList.add('active'); target.classList.add('active');

                updateIndi(btn);

            };

        });



        // Gửi báo cáo

        document.getElementById('sendReport').onclick = function() {

            const msg = document.getElementById('report-text').value;

            if(!msg.trim()) return;

            sendToDiscord(msg);

        };



        // Kéo thả & Resize

        let drag = false, x, y;

        document.getElementById('k12-header').onmousedown = (e) => { if(e.target.tagName !== 'BUTTON' && e.target.type !== 'range' && e.target.tagName !== 'TEXTAREA') { drag = true; x = e.clientX - panel.offsetLeft; y = e.clientY - panel.offsetTop; } };

        document.onmousemove = (e) => { if(drag) { panel.style.left = (e.clientX - x) + 'px'; panel.style.top = (e.clientY - y) + 'px'; panel.style.right = 'auto'; } };

        document.onmouseup = () => drag = false;



        document.getElementById('speedSlider').oninput = (e) => {

            document.getElementById('speedValue').innerText = 'x' + e.target.value;

            if(document.querySelector('video')) document.querySelector('video').playbackRate = e.target.value;

        };



        const sliderW = document.getElementById('setWidth');

        sliderW.oninput = () => { panel.style.width = sliderW.value + 'px'; document.getElementById('widthVal').innerText = sliderW.value + 'px'; };



        document.getElementById('saveSet').onclick = () => {

            GM_setValue('ui_width', sliderW.value);

            GM_setValue('ui_theme_color', document.getElementById('setColor').value);

            GM_setValue('k12_username', document.getElementById('k12_u').value);

            GM_setValue('k12_password', document.getElementById('k12_p').value);

            location.reload();

        };



        document.getElementById('runAutoLogin').onclick = () => {

             document.querySelectorAll('input[type="text"], input[name*="user"]').forEach(i => i.value = GM_getValue('k12_username',''));

             document.querySelectorAll('input[type="password"]').forEach(i => i.value = GM_getValue('k12_password',''));

        };

    }



    // Bảng tin (Logic 2 lần/ngày)

    function manageTicker() {

        const today = new Date().toLocaleDateString();

        if (GM_getValue('ticker_date', '') !== today) { GM_setValue('ticker_count', 0); GM_setValue('ticker_date', today); }

        if (GM_getValue('ticker_count', 0) < 2) {

            const ticker = document.createElement('div'); ticker.id = 'danhvux-ticker';

            ticker.innerHTML = `<div class="ticker-text">Chúc bạn một ngày học tập thật tốt. ⚠️ KHÔNG ĐƯỢC SAO CHÉP PANEL DƯỚI MỌI HÌNH THỨC ⚠️</div>`;

            document.body.appendChild(ticker); GM_setValue('ticker_count', GM_getValue('ticker_count', 0) + 1);

            setTimeout(() => { ticker.style.transition = '1s'; ticker.style.opacity = '0'; setTimeout(()=>ticker.remove(), 1000); }, 20000);

        }

    }



    setTimeout(() => { manageTicker(); createPanel(); }, 1000);

})();
