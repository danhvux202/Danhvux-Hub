// ==UserScript==
// @name         Danhvux Panel (Admin Edition)
// @namespace    http://tampermonkey.net/
// @version      8.5.0
// @description  Tích hợp quản lý IP và Blacklist trực tiếp trên Panel
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

    // --- CẤU HÌNH ---
    const DISCORD_WEBHOOK = 'THAY_URL_WEBHOOK_CUA_BAN_TAI_DAY';
    const ADMIN_PASSCODE = '123456'; // Thay đổi mã này để mở Tab Admin

    let uiColor = GM_getValue('ui_theme_color', '#ffea00');
    let blacklist = GM_getValue('blacklist_ips', []);
    let userIP = '';

    GM_addStyle(`
        /* Thêm style cho Tab Admin */
        .admin-box { background: rgba(255,0,0,0.1); border: 1px dashed red; padding: 10px; border-radius: 10px; margin-top: 10px; }
        .ip-item { display: flex; justify-content: space-between; font-size: 11px; padding: 5px 0; border-bottom: 1px solid #333; }
        .btn-ban { background: #ff4444; color: white; border: none; border-radius: 4px; padding: 2px 8px; cursor: pointer; }
        .btn-unban { background: #44ff44; color: black; border: none; border-radius: 4px; padding: 2px 8px; cursor: pointer; }
    `);

    // HÀM LẤY IP & KIỂM TRA TRUY CẬP
    async function checkAccess() {
        return new Promise(resolve => {
            GM_xmlhttpRequest({
                method: "GET",
                url: "https://api.ipify.org?format=json",
                onload: (res) => {
                    userIP = JSON.parse(res.responseText).ip;
                    if (blacklist.includes(userIP)) {
                        document.body.innerHTML = `<div style="color:white; background:black; height:100vh; display:flex; align-items:center; justify-content:center; font-family:sans-serif;">
                            <h1>🚫 IP (${userIP}) CỦA BẠN ĐÃ BỊ CẤM TRUY CẬP PANEL.</h1>
                        </div>`;
                        resolve(false);
                    }
                    resolve(true);
                }
            });
        });
    }

    // GỬI THÔNG BÁO DISCORD
    function logToDiscord(title, content, color = 16711680) {
        GM_xmlhttpRequest({
            method: "POST",
            url: DISCORD_WEBHOOK,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({
                embeds: [{
                    title: title,
                    description: content,
                    color: color,
                    footer: { text: "System Log - " + new Date().toLocaleString() }
                }]
            })
        });
    }

    async function init() {
        const canAccess = await checkAccess();
        if (!canAccess) return;

        const panel = document.createElement('div');
        panel.id = 'danhvux-panel';
        // (Phần HTML Panel bạn copy từ code cũ, chỉ thêm Tab Admin vào nav)
        panel.innerHTML = `
            <div id="k12-header">
                <div style="font-size: 18px; font-weight: 900;">Danhvux Panel <small style="font-size:10px; color:${uiColor}">v8.5</small></div>
                <div class="mac-dots">
                    <div class="dot close-dot" onclick="this.closest('#danhvux-panel').classList.add('hidden')"></div>
                </div>
                <div class="tab-nav">
                    <button class="tab-btn active" data-target="main-tab">Main</button>
                    <button class="tab-btn" data-target="settings-tab">Settings</button>
                    <button class="tab-btn" id="nav-admin" style="display:none;" data-target="admin-tab">🛡️ Admin</button>
                    <div id="tab-indicator"></div>
                </div>
            </div>

            <div id="main-tab" class="tab-content active">
                <span class="label-bright">IP CỦA BẠN: ${userIP}</span>
                <p>Chào mừng quay trở lại!</p>
            </div>

            <div id="settings-tab" class="tab-content">
                <span class="label-bright">Mã Admin (Để mở khóa tính năng cấm)</span>
                <input type="password" id="admin-unlock" placeholder="Nhập mã...">
                <button class="auto-login-btn" id="btn-unlock-admin">XÁC NHẬN</button>
            </div>

            <div id="admin-tab" class="tab-content">
                <span class="label-bright" style="color:#ff4444;">QUẢN LÝ BLACKLIST</span>
                <input type="text" id="target-ip" placeholder="Nhập IP muốn cấm...">
                <button class="auto-login-btn" style="background:#ff4444;" id="btn-ban-ip">CẤM IP NÀY</button>
                
                <div class="admin-box" id="blacklist-render">
                    </div>
            </div>
        `;
        document.body.appendChild(panel);

        // --- LOGIC XỬ LÝ ---

        // 1. Mở khóa Tab Admin
        document.getElementById('btn-unlock-admin').onclick = () => {
            if (document.getElementById('admin-unlock').value === ADMIN_PASSCODE) {
                document.getElementById('nav-admin').style.display = 'block';
                alert('🔓 Đã mở khóa quyền Admin!');
            } else {
                alert('❌ Sai mã xác nhận!');
            }
        };

        // 2. Cấm IP
        document.getElementById('btn-ban-ip').onclick = () => {
            const ip = document.getElementById('target-ip').value.trim();
            if (ip && !blacklist.includes(ip)) {
                blacklist.push(ip);
                GM_setValue('blacklist_ips', blacklist);
                logToDiscord("🚫 LỆNH CẤM MỚI", `IP **${ip}** đã bị cấm bởi Admin.`);
                renderBlacklist();
                alert('Đã cấm IP: ' + ip);
            }
        };

        // 3. Hiển thị danh sách cấm
        function renderBlacklist() {
            const container = document.getElementById('blacklist-render');
            container.innerHTML = blacklist.map(ip => `
                <div class="ip-item">
                    <span>${ip}</span>
                    <button class="btn-unban" data-ip="${ip}">Gỡ</button>
                </div>
            `).join('');

            container.querySelectorAll('.btn-unban').forEach(btn => {
                btn.onclick = () => {
                    const ipToRemove = btn.getAttribute('data-ip');
                    blacklist = blacklist.filter(i => i !== ipToRemove);
                    GM_setValue('blacklist_ips', blacklist);
                    logToDiscord("✅ GỠ CẤM", `IP **${ipToRemove}** đã được gỡ cấm.`);
                    renderBlacklist();
                };
            });
        }

        renderBlacklist();
        // (Thêm lại các logic tab-nav, drag-drop từ code cũ của bạn vào đây)
    }

    setTimeout(init, 1000);
})();
