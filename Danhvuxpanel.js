(function() {
    'use strict';

    // ==========================================
    // ⚙️ CẤU HÌNH HỆ THỐNG (MÃ CHUẨN)
    // ==========================================
    const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1483505875309035520/B4vGUvE9rntITzpuzqdfX2dV...'; 
    const uiColor = '#ffea00'; 

    // --- TẠO STYLE (THAY CHO GM_ADDSTYLE) ---
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        #dv-hub {
            position: fixed; top: 100px; right: 20px; z-index: 999999;
            width: 320px; background: rgba(25, 25, 30, 0.95);
            color: #fff; border-radius: 20px; font-family: 'Segoe UI', sans-serif;
            backdrop-filter: blur(15px); border: 1px solid ${uiColor};
            animation: float 6s ease-in-out infinite; box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            transition: 0.3s;
        }
        #dv-hub.hidden { opacity: 0; transform: scale(0.8); pointer-events: none; }
        .dv-header { padding: 25px 20px 10px; cursor: move; position: relative; }
        .dv-dots { position: absolute; top: 18px; left: 20px; display: flex; gap: 6px; }
        .dv-dot { width: 10px; height: 10px; border-radius: 50%; }
        .tab-nav { display: flex; justify-content: space-around; padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .tab-btn { background: none; border: none; color: #666; cursor: pointer; font-size: 10px; font-weight: 800; padding: 8px; border-radius: 8px; transition: 0.3s; }
        .tab-btn.active { color: ${uiColor}; background: rgba(255,234,0,0.1); }
        .tab-content { padding: 20px; display: none; min-height: 240px; }
        .tab-content.active { display: block; }
        .btn-main { width: 100%; padding: 12px; border: none; border-radius: 12px; background: ${uiColor}; color: #000; font-weight: 900; cursor: pointer; margin-top: 10px; transition: 0.2s; }
        .apps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
        .app-item { display: flex; flex-direction: column; align-items: center; text-decoration: none; color: #888; font-size: 10px; }
        .app-icon { width: 45px; height: 45px; background: #222; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 5px; border: 1px solid transparent; }
        .app-item:hover .app-icon { border-color: ${uiColor}; color: ${uiColor}; }
        input, textarea { width: 100%; padding: 10px; background: rgba(0,0,0,0.2); border: 1px solid #333; color: #fff; border-radius: 10px; margin-bottom: 10px; font-size: 12px; }
    `;
    document.head.appendChild(style);

    // --- KHỞI TẠO PANEL ---
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
            <div style="font-size:11px; margin-bottom:5px;">VIDEO SPEED: <b id="sV" style="color:${uiColor}">x1</b></div>
            <input type="range" id="sS" min="1" max="16" step="0.5" value="1" style="accent-color:${uiColor}; width:100%;">
            <button class="btn-main" id="btnL">🪄 ĐĂNG NHẬP NHANH</button>
            <p style="font-size:9px; color:#444; text-align:center; margin-top:20px;">Phím tắt: Alt + Z để ẩn/hiện</p>
        </div>

        <div id="a" class="tab-content">
            <div class="apps-grid">
                <a href="https://chatgpt.com" target="_blank" class="app-item"><div class="app-icon">🤖</div>GPT</a>
                <a href="https://tiktok.com" target="_blank" class="app-item"><div class="app-icon">🎵</div>TikTok</a>
                <a href="https://youtube.com" target="_blank" class="app-item"><div class="app-icon">📺</div>YouTube</a>
                <a href="https://facebook.com" target="_blank" class="app-item"><div class="app-icon">📘</div>FB</a>
                <a href="https://messenger.com" target="_blank" class="app-item"><div class="app-icon">💬</div>Mess</a>
                <a href="https://google.com" target="_blank" class="app-item"><div class="app-icon">🔍</div>Google</a>
            </div>
        </div>

        <div id="r" class="tab-content">
            <textarea id="rT" rows="4" placeholder="Nhập nội dung báo lỗi..."></textarea>
            <button class="btn-main" id="btnR" style="background:#333; color:#fff;">GỬI ĐẾN DISCORD</button>
        </div>

        <div id="s" class="tab-content">
            <label style="font-size:10px; color:#666;">TÀI KHOẢN K12</label>
            <input type="text" id="kU" placeholder="Tên đăng nhập..." value="${localStorage.getItem('dv_u')||''}">
            <label style="font-size:10px; color:#666;">MẬT KHẨU K12</label>
            <input type="password" id="kP" placeholder="Mật khẩu..." value="${localStorage.getItem('dv_p')||''}">
            <button class="btn-main" id="btnS">LƯU THÔNG TIN</button>
        </div>
    `;
    document.body.appendChild(panel);

    // --- LOGIC XỬ LÝ SỰ KIỆN ---
    // Chuyển Tab
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.onclick = () => {
            document.querySelectorAll('.tab-btn, .tab-content').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            document.getElementById(b.dataset.t).classList.add('active');
        };
    });

    // Speed Video
    document.getElementById('sS').oninput = (e) => {
        const val = e.target.value;
        document.getElementById('sV').innerText = 'x' + val;
        if(document.querySelector('video')) document.querySelector('video').playbackRate = val;
    };

    // Lưu Settings (Dùng localStorage thay cho GM_setValue)
    document.getElementById('btnS').onclick = () => {
        localStorage.setItem('dv_u', document.getElementById('kU').value);
        localStorage.setItem('dv_p', document.getElementById('kP').value);
        alert("✅ Đã lưu cấu hình thành công!");
    };

    // Đăng nhập nhanh
    document.getElementById('btnL').onclick = () => {
        const u = localStorage.getItem('dv_u') || "";
        const p = localStorage.getItem('dv_p') || "";
        document.querySelectorAll('input[type="text"], input[name*="user"]').forEach(i => i.value = u);
        document.querySelectorAll('input[type="password"]').forEach(i => i.value = p);
    };

    // Report Discord
    document.getElementById('btnR').onclick = () => {
        const content = document.getElementById('rT').value;
        if(!content) return alert("Vui lòng nhập nội dung!");
        fetch(DISCORD_WEBHOOK, {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({content: `📩 **BÁO LỖI MỚI:**\n${content}`})
        }).then(() => alert("🚀 Đã gửi báo cáo!"));
    };

    // Phím tắt & Kéo thả
    window.addEventListener('keydown', (e) => { if (e.altKey && e.code === 'KeyZ') panel.classList.toggle('hidden'); });
    let dr = false, ox, oy;
    panel.querySelector('.dv-header').onmousedown = (e) => { dr = true; ox = e.clientX-panel.offsetLeft; oy = e.clientY-panel.offsetTop; };
    document.onmousemove = (e) => { if(dr) { panel.style.left = (e.clientX-ox)+'px'; panel.style.top = (e.clientY-oy)+'px'; panel.style.right='auto'; } };
    document.onmouseup = () => dr = false;

    console.log("✅ Danhvux Hub: All features restored!");
})();
