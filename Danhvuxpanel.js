(function() {
    'use strict';

    // 1. TẠO STYLE (Thay cho GM_addStyle)
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        #dv-hub {
            position: fixed; top: 100px; right: 20px; z-index: 999999;
            width: 320px; background: rgba(20, 20, 25, 0.98);
            color: #fff; border-radius: 20px; font-family: sans-serif;
            backdrop-filter: blur(10px); border: 1px solid #ffea00;
            animation: float 5s ease-in-out infinite; box-shadow: 0 10px 40px rgba(0,0,0,0.8);
        }
        .dv-header { padding: 20px; cursor: move; border-bottom: 1px solid #333; }
        .tab-btn { background: none; border: none; color: #777; cursor: pointer; font-weight: bold; padding: 10px; transition: 0.3s; }
        .tab-btn.active { color: #ffea00; border-bottom: 2px solid #ffea00; }
        .tab-content { padding: 20px; display: none; }
        .tab-content.active { display: block; }
        .btn-main { width: 100%; padding: 12px; border: none; border-radius: 10px; background: #ffea00; color: #000; font-weight: bold; cursor: pointer; margin-top: 10px; }
        .apps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .app-item { text-decoration: none; color: #fff; font-size: 10px; text-align: center; }
        input { width: 100%; padding: 8px; margin-bottom: 10px; background: #222; border: 1px solid #444; color: #fff; border-radius: 5px; }
    `;
    document.head.appendChild(style);

    // 2. TẠO GIAO DIỆN
    const panel = document.createElement('div');
    panel.id = 'dv-hub';
    panel.innerHTML = `
        <div class="dv-header"><b style="color:#ffea00">DANHVUX</b> HUB v16</div>
        <div style="display:flex; justify-content: space-around;">
            <button class="tab-btn active" data-t="tab1">MAIN</button>
            <button class="tab-btn" data-t="tab2">APPS</button>
            <button class="tab-btn" data-t="tab3">SET</button>
        </div>
        <div id="tab1" class="tab-content active">
            <div style="font-size:12px; margin-bottom:10px;">SPEED: <b id="val">x1</b></div>
            <input type="range" id="speed" min="1" max="16" step="0.5" value="1" style="width:100%">
            <button class="btn-main" id="autoLogin">🪄 ĐĂNG NHẬP NHANH</button>
        </div>
        <div id="tab2" class="tab-content">
            <div class="apps-grid">
                <a href="https://tiktok.com" target="_blank" class="app-item">🎵<br>TikTok</a>
                <a href="https://chatgpt.com" target="_blank" class="app-item">🤖<br>GPT</a>
                <a href="https://facebook.com" target="_blank" class="app-item">📘<br>FB</a>
            </div>
        </div>
        <div id="tab3" class="tab-content">
            <input type="text" id="u" placeholder="User">
            <input type="password" id="p" placeholder="Pass">
            <button class="btn-main" id="save">LƯU CẤU HÌNH</button>
        </div>
    `;
    document.body.appendChild(panel);

    // 3. LOGIC (Dùng localStorage thay cho GM_getValue)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn, .tab-content').forEach(x => x.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.t).classList.add('active');
        };
    });

    document.getElementById('speed').oninput = (e) => {
        const v = e.target.value;
        document.getElementById('val').innerText = 'x' + v;
        if(document.querySelector('video')) document.querySelector('video').playbackRate = v;
    };

    document.getElementById('save').onclick = () => {
        localStorage.setItem('dv_u', document.getElementById('u').value);
        localStorage.setItem('dv_p', document.getElementById('p').value);
        alert("Đã lưu!");
    };

    document.getElementById('autoLogin').onclick = () => {
        const u = localStorage.getItem('dv_u') || "";
        const p = localStorage.getItem('dv_p') || "";
        document.querySelectorAll('input[type="text"]').forEach(i => i.value = u);
        document.querySelectorAll('input[type="password"]').forEach(i => i.value = p);
    };

    // Kéo thả
    let drag = false, ox, oy;
    panel.querySelector('.dv-header').onmousedown = (e) => { drag = true; ox = e.clientX - panel.offsetLeft; oy = e.clientY - panel.offsetTop; };
    document.onmousemove = (e) => { if(drag) { panel.style.left = (e.clientX - ox) + 'px'; panel.style.top = (e.clientY - oy) + 'px'; } };
    document.onmouseup = () => drag = false;

    console.log("✅ Danhvux Hub: Loaded successfully!");
})();
