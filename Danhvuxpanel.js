(function() {
    'use strict';

    // 1. STYLE - Đảm bảo giao diện luôn đẹp và có hiệu ứng
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        #dv-hub {
            position: fixed; top: 100px; right: 20px; z-index: 999999;
            width: 320px; background: rgba(20, 20, 25, 0.98);
            color: #fff; border-radius: 20px; font-family: sans-serif;
            backdrop-filter: blur(10px); border: 1px solid #ffea00;
            animation: float 5s ease-in-out infinite; box-shadow: 0 10px 40px rgba(0,0,0,0.8);
            padding-bottom: 15px;
        }
        .dv-header { padding: 20px; cursor: move; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; }
        .tab-nav { display: flex; justify-content: space-around; background: rgba(0,0,0,0.3); padding: 5px 0; }
        .tab-btn { background: none; border: none; color: #777; cursor: pointer; font-weight: bold; font-size: 11px; padding: 10px; transition: 0.3s; }
        .tab-btn.active { color: #ffea00; border-bottom: 2px solid #ffea00; }
        .tab-content { padding: 20px; display: none; min-height: 200px; }
        .tab-content.active { display: block; }
        .btn-main { width: 100%; padding: 12px; border: none; border-radius: 10px; background: #ffea00; color: #000; font-weight: bold; cursor: pointer; margin-top: 10px; }
        .apps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
        .app-item { text-decoration: none; color: #fff; font-size: 10px; text-align: center; transition: 0.2s; }
        .app-item:hover { transform: translateY(-3px); color: #ffea00; }
        .app-icon { font-size: 24px; margin-bottom: 5px; display: block; }
        input { width: 100%; padding: 10px; margin-bottom: 10px; background: #222; border: 1px solid #444; color: #fff; border-radius: 8px; box-sizing: border-box; }
    `;
    document.head.appendChild(style);

    // 2. TẠO PANEL VỚI ĐẦY ĐỦ 4 TAB
    const panel = document.createElement('div');
    panel.id = 'dv-hub';
    panel.innerHTML = `
        <div class="dv-header">
            <span style="font-weight:900; letter-spacing:1px;">DANHVUX <span style="color:#ffea00">HUB</span></span>
            <span style="font-size:10px; color:#555;">v16.Final</span>
        </div>
        <div class="tab-nav">
            <button class="tab-btn active" data-t="tab-main">MAIN</button>
            <button class="tab-btn" data-t="tab-apps">APPS</button>
            <button class="tab-btn" data-t="tab-report">REPORT</button>
            <button class="tab-btn" data-t="tab-set">SET</button>
        </div>

        <div id="tab-main" class="tab-content active">
            <div style="font-size:12px; margin-bottom:10px; display:flex; justify-content:space-between;">
                <span>TỐC ĐỘ VIDEO:</span> <b id="speed-val" style="color:#ffea00">x1</b>
            </div>
            <input type="range" id="speed-range" min="1" max="16" step="0.5" value="1">
            <button class="btn-main" id="fast-login">🪄 ĐĂNG NHẬP NHANH</button>
        </div>

        <div id="tab-apps" class="tab-content">
            <div class="apps-grid">
                <a href="https://tiktok.com" target="_blank" class="app-item"><span class="app-icon">🎵</span>TikTok</a>
                <a href="https://chatgpt.com" target="_blank" class="app-item"><span class="app-icon">🤖</span>GPT</a>
                <a href="https://youtube.com" target="_blank" class="app-item"><span class="app-icon">📺</span>YouTube</a>
                <a href="https://facebook.com" target="_blank" class="app-item"><span class="app-icon">📘</span>FaceBook</a>
                <a href="https://messenger.com" target="_blank" class="app-item"><span class="app-icon">💬</span>Mess</a>
                <a href="https://google.com" target="_blank" class="app-item"><span class="app-icon">🔍</span>Google</a>
            </div>
        </div>

        <div id="tab-report" class="tab-content">
            <textarea id="rep-msg" style="width:100%; height:80px; background:#111; color:#fff; border:1px solid #333; border-radius:8px; padding:10px;" placeholder="Nhập nội dung báo lỗi..."></textarea>
            <button class="btn-main" id="send-rep" style="background:#333; color:#fff;">GỬI REPORT</button>
        </div>

        <div id="tab-set" class="tab-content">
            <input type="text" id="saved-u" placeholder="Tên đăng nhập K12..." value="${localStorage.getItem('dv_u') || ''}">
            <input type="password" id="saved-p" placeholder="Mật khẩu K12..." value="${localStorage.getItem('dv_p') || ''}">
            <button class="btn-main" id="save-info">LƯU CẤU HÌNH</button>
        </div>
    `;
    document.body.appendChild(panel);

    // 3. LOGIC ĐIỀU KHIỂN
    // Chuyển Tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn, .tab-content').forEach(x => x.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.t).classList.add('active');
        };
    });

    // Chỉnh tốc độ
    document.getElementById('speed-range').oninput = (e) => {
        const v = e.target.value;
        document.getElementById('speed-val').innerText = 'x' + v;
        if(document.querySelector('video')) document.querySelector('video').playbackRate = v;
    };

    // Lưu cấu hình
    document.getElementById('save-info').onclick = () => {
        localStorage.setItem('dv_u', document.getElementById('saved-u').value);
        localStorage.setItem('dv_p', document.getElementById('saved-p').value);
        alert("✅ Đã lưu thông tin!");
    };

    // Login nhanh
    document.getElementById('fast-login').onclick = () => {
        const u = localStorage.getItem('dv_u') || "";
        const p = localStorage.getItem('dv_p') || "";
        document.querySelectorAll('input[type="text"]').forEach(i => i.value = u);
        document.querySelectorAll('input[type="password"]').forEach(i => i.value = p);
    };

    // Kéo thả Panel
    let isDragging = false, offsetEventX, offsetEventY;
    panel.querySelector('.dv-header').onmousedown = (e) => {
        isDragging = true;
        offsetEventX = e.clientX - panel.offsetLeft;
        offsetEventY = e.clientY - panel.offsetTop;
    };
    document.onmousemove = (e) => {
        if(isDragging) {
            panel.style.left = (e.clientX - offsetEventX) + 'px';
            panel.style.top = (e.clientY - offsetEventY) + 'px';
            panel.style.right = 'auto';
        }
    };
    document.onmouseup = () => isDragging = false;

    console.log("🚀 Danhvux Hub: Đã nạp đầy đủ linh kiện vào Panel!");
})();
