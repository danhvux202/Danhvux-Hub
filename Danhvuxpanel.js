(function() {
    'use strict';

    // --- CẤU HÌNH HỆ THỐNG ---
    const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1483505875309035520/B4vGUvE9rntITzpuzqdfX2dV...'; 
    const uiColor = '#ffea00'; // Màu vàng chanh huyền thoại của Danh

    // Thay thế GM_addStyle bằng mã chuẩn
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        #dv-hub {
            position: fixed; top: 100px; right: 20px; z-index: 999999;
            width: 320px; background: rgba(25, 25, 30, 0.95);
            color: #fff; border-radius: 20px; font-family: 'Segoe UI', sans-serif;
            backdrop-filter: blur(15px); border: 1px solid ${uiColor};
            animation: float 6s ease-in-out infinite; box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }
        .dv-header { padding: 25px 20px 10px; cursor: move; position: relative; }
        .tab-nav { display: flex; justify-content: space-around; padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .tab-btn { background: none; border: none; color: #666; cursor: pointer; font-size: 11px; font-weight: 800; padding: 8px; transition: 0.3s; }
        .tab-btn.active { color: ${uiColor}; border-bottom: 2px solid ${uiColor}; }
        .tab-content { padding: 20px; display: none; min-height: 220px; }
        .tab-content.active { display: block; }
        .btn-main { width: 100%; padding: 12px; border: none; border-radius: 12px; background: ${uiColor}; color: #000; font-weight: 900; cursor: pointer; margin-top: 10px; }
        .apps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .app-item { display: flex; flex-direction: column; align-items: center; text-decoration: none; color: #888; font-size: 10px; }
        .app-icon { width: 42px; height: 42px; background: #222; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 5px; border: 1px solid transparent; }
        input { width: 100%; padding: 10px; background: rgba(0,0,0,0.2); border: 1px solid #333; color: #fff; border-radius: 10px; margin-bottom: 8px; }
    `;
    document.head.appendChild(style);

    // --- TẠO GIAO DIỆN ---
    const panel = document.createElement('div');
    panel.id = 'dv-hub';
    panel.innerHTML = `
        <div class="dv-header">
            <div style="text-align:right; font-size:18px; font-weight:900;">DANHVUX <span style="color:${uiColor}">HUB</span></div>
        </div>
        <div class="tab-nav">
            <button class="tab-btn active" data-t="m">MAIN</button>
            <button class="tab-btn" data-t="a">APPS</button>
            <button class="tab-btn" data-t="s">SET</button>
        </div>
        <div id="m" class="tab-content active">
            <div style="font-size:11px; margin-bottom:5px;">SPEED: <b id="sV" style="color:${uiColor}">x1</b></div>
            <input type="range" id="sS" min="1" max="16" step="0.5" value="1" style="width:100%; accent-color:${uiColor}">
            <button class="btn-main" id="btnL">🪄 ĐĂNG NHẬP NHANH</button>
        </div>
        <div id="a" class="tab-content">
            <div class="apps-grid">
                <a href="https://tiktok.com" target="_blank" class="app-item"><div class="app-icon">🎵</div>TikTok</a>
                <a href="https://chatgpt.com" target="_blank" class="app-item"><div class="app-icon">🤖</div>GPT</a>
                <a href="https://youtube.com" target="_blank" class="app-item"><div class="app-icon">📺</div>YouTube</a>
                <a href="https://facebook.com" target="_blank" class="app-item"><div class="app-icon">📘</div>FB</a>
                <a href="https://messenger.com" target="_blank" class="app-item"><div class="app-icon">💬</div>Mess</a>
                <a href="https://google.com" target="_blank" class="app-item"><div class="app-icon">🔍</div>Google</a>
            </div>
        </div>
        <div id="s" class="tab-content">
            <input type="text" id="kU" placeholder="User K12">
            <input type="password" id="kP" placeholder="Pass K12">
            <button class="btn-main" id="btnS">LƯU CÀI ĐẶT</button>
        </div>
    `;
    document.body.appendChild(panel);

    // --- LOGIC XỬ LÝ (Thay thế GM_getValue bằng localStorage) ---
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

    document.getElementById('btnS').onclick = () => {
        localStorage.setItem('k12_u', document.getElementById('kU').value);
        localStorage.setItem('k12_p', document.getElementById('kP').value);
        alert("Đã lưu vào bộ nhớ trình duyệt!");
    };

    document.getElementById('btnL').onclick = () => {
        document.querySelectorAll('input[type="text"]').forEach(i => i.value = localStorage.getItem('k12_u') || '');
        document.querySelectorAll('input[type="password"]').forEach(i => i.value = localStorage.getItem('k12_p') || '');
    };

    console.log("✅ Danhvux Hub: Đã khôi phục giao diện Main!");
})();
