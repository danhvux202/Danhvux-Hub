// ==UserScript==
// @name         K12 Helper Pro - Danhvux (Final Shadow Edition)
// @namespace    http://tampermonkey.net/
// @version      27.0
// @description  Bypass 100% SecurityError, Check K12 User, Discord Webhook Fix
// @author       Danhvux
// @match        *://*.k12online.vn/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // === CẤU HÌNH DISCORD WEBHOOK ===
    const DISCORD_WEBHOOK = 'URL_WEBHOOK_CUA_BAN'; 

    let config = JSON.parse(localStorage.getItem('k12_ult_cfg')) || {
        mainColor: '#ffea00', width: 320, speed: 1, user: '', pass: '', isDarkMode: true, toastPos: 'top-right'
    };
    const save = () => localStorage.setItem('k12_ult_cfg', JSON.stringify(config));

    // --- HÀM LẤY TÊN TÀI KHOẢN K12 ---
    const getK12User = () => {
        const nameEl = document.querySelector('.user-name, .profile-name, .name-user, #user-info, .username');
        return (nameEl && nameEl.innerText.trim()) ? nameEl.innerText.trim() : (config.user || "Khách");
    };

    // --- GỬI LOG QUA FETCH (KHÔNG CẦN GM_XMLHTTPREQUEST) ---
    const sendDiscordLog = async (userName) => {
        if (!DISCORD_WEBHOOK || DISCORD_WEBHOOK.includes('URL_WEBHOOK')) return;
        const payload = {
            embeds: [{
                title: "🛡️ K12 HELPER - LOG",
                color: parseInt(config.mainColor.replace('#', ''), 16) || 16771840,
                fields: [
                    { name: "👤 K12 User", value: `**${userName}**`, inline: true },
                    { name: "📍 URL", value: window.location.href, inline: false }
                ],
                footer: { text: "Danhvux Security • " + new Date().toLocaleString() }
            }]
        };
        try {
            await fetch(DISCORD_WEBHOOK, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } catch (e) { console.warn("Discord Log Fail"); }
    };

    // --- LOGIC GỐC CỦA BẠN (GIỮ NGUYÊN) ---
    const runTurbo = () => {
        const v = document.querySelector('video');
        if (v && config.speed > 1) {
            v.playbackRate = parseFloat(config.speed);
            if (v.paused && !v.ended) v.play();
        }
        document.querySelectorAll('.vjs-skip-question, .btn-confirm, .btn-next-question, .vjs-done-button').forEach(btn => btn.click());
    };
    setInterval(runTurbo, 1000);

    // --- KHỞI TẠO GIAO DIỆN (SỬ DỤNG SHADOW DOM ĐỂ TRÁNH LỖI CSSRULES) ---
    const initPanel = () => {
        const currentUser = getK12User();
        sendDiscordLog(currentUser);

        // Tạo một container bí mật để chứa Panel
        const host = document.createElement('div');
        host.id = 'dv-helper-root';
        document.body.appendChild(host);
        const shadow = host.attachShadow({mode: 'open'});

        const isDark = config.isDarkMode;
        const panel = document.createElement('div');
        panel.id = 'dv-panel';
        
        // Nhúng trực tiếp CSS vào Shadow Root để K12 không bao giờ chạm tới được
        const style = document.createElement('style');
        style.textContent = `
            :host { --mc: ${config.mainColor}; --w: ${config.width}px; --bg: ${isDark ? '#1e2227' : '#ffffff'}; --text: ${isDark ? '#ffffff' : '#1e2227'}; }
            #dv-panel { position: fixed; top: 50px; right: 20px; width: var(--w); background: var(--bg); color: var(--text); border-radius: 12px; font-family: 'Segoe UI', sans-serif; z-index: 999999; box-shadow: 0 10px 40px rgba(0,0,0,0.5); overflow: hidden; border: 1px solid #333; }
            .header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; cursor: move; border-bottom: 1px solid #333; }
            .title { color: var(--mc); font-weight: bold; font-size: 18px; }
            .dots { display: flex; gap: 8px; }
            .dot { height: 12px; width: 12px; border-radius: 50%; cursor: pointer; }
            .red { background: #ff5f56; }
            .content { padding: 20px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .btn { width: 100%; padding: 14px; background: #b8cc8e; border: none; border-radius: 12px; color: #000; font-weight: bold; cursor: pointer; margin-top: 10px; }
            input[type=range] { width: 100%; cursor: pointer; }
            input[type=text], input[type=password] { width: 100%; padding: 10px; margin-top: 10px; border-radius: 8px; border: 1px solid #444; background: #252a31; color: #fff; box-sizing: border-box; }
            .footer { text-align: center; font-size: 10px; padding: 10px; color: #777; }
        `;

        panel.innerHTML = `
            <div class="header">
                <div class="title">Danhvux Panel</div>
                <div class="dots"><div class="dot red"></div></div>
            </div>
            <div class="content">
                <div class="row"><b>Tốc độ</b><span style="color:var(--mc)">x<span id="sp-txt">${config.speed}</span></span></div>
                <input type="range" id="sp-range" min="1" max="20" step="0.5" value="${config.speed}">
                <button class="btn" id="do-login">🪄 AUTO LOGIN</button>
                <hr style="border:0; border-top:1px solid #333; margin:15px 0;">
                <input type="color" id="c-pick" style="width:100%; height:30px;" value="${config.mainColor}">
                <input type="text" id="u-val" placeholder="Username..." value="${config.user}">
                <input type="password" id="p-val" placeholder="Password..." value="${config.pass}">
                <button class="btn" id="btn-save" style="background:var(--mc)">LƯU CÀI ĐẶT</button>
            </div>
            <div class="footer">USER: ${currentUser}</div>
        `;

        shadow.appendChild(style);
        shadow.appendChild(panel);

        // --- EVENT HANDLERS TRONG SHADOW DOM ---
        const $ = (id) => shadow.querySelector(id);
        
        $('#sp-range').oninput = (e) => { $('#sp-txt').innerText = e.target.value; config.speed = e.target.value; runTurbo(); };
        $('#btn-save').onclick = () => { 
            config.mainColor = $('#c-pick').value; 
            config.user = $('#u-val').value; 
            config.pass = $('#p-val').value; 
            save(); location.reload(); 
        };
        
        $('#do-login').onclick = () => {
            const u = document.querySelector('input[name="username"]'), p = document.querySelector('input[name="password"]');
            if(u && p) { 
                u.value = config.user; p.value = config.pass; 
                u.dispatchEvent(new Event('input',{bubbles:true})); p.dispatchEvent(new Event('input',{bubbles:true})); 
                setTimeout(()=>document.querySelector('button[type="submit"]').click(), 500); 
            }
        };

        // Kéo thả Panel
        let isDrag = false, off = [0,0];
        $('.header').onmousedown = (e) => { isDrag = true; off = [panel.offsetLeft - e.clientX, panel.offsetTop - e.clientY]; };
        document.addEventListener('mousemove', (e) => { if(isDrag) { panel.style.left = (e.clientX + off[0]) + 'px'; panel.style.top = (e.clientY + off[1]) + 'px'; } });
        document.addEventListener('mouseup', () => isDrag = false);
        $('.red').onclick = () => panel.style.display = 'none';
        document.addEventListener('keydown', (e) => { if(e.key === 'F2') panel.style.display = (panel.style.display === 'none' ? 'block' : 'none'); });
    };

    if (document.readyState === 'complete') initPanel();
    else window.addEventListener('load', initPanel);
})();
