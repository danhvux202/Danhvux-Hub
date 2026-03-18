(function() {
    'use strict';

    // Thay thế GM_addStyle bằng JS thuần
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        #dv-hub {
            position: fixed; top: 100px; right: 20px; z-index: 999999;
            width: 320px; background: rgba(25, 25, 30, 0.95);
            color: #fff; border-radius: 20px; font-family: sans-serif;
            backdrop-filter: blur(15px); border: 1px solid #ffea00;
            animation: float 5s ease-in-out infinite; padding: 20px;
        }
        .btn-main { width: 100%; padding: 12px; border: none; border-radius: 12px; background: #ffea00; color: #000; font-weight: 900; cursor: pointer; margin-top: 10px; }
    `;
    document.head.appendChild(style);

    // Tạo giao diện
    const panel = document.createElement('div');
    panel.id = 'dv-hub';
    panel.innerHTML = `
        <div style="font-size:20px; font-weight:900; color:#ffea00; margin-bottom:10px;">DANHVUX HUB</div>
        <div style="font-size:12px; color:#aaa; margin-bottom:15px;">Version 16 - Loader Mode</div>
        <button class="btn-main" id="btnTest">ĐĂNG NHẬP NHANH</button>
        <div style="margin-top:20px; display:grid; grid-template-columns: repeat(3,1fr); gap:10px;">
            <a href="https://tiktok.com" target="_blank" style="text-decoration:none; color:#fff; font-size:10px; text-align:center;">🎵<br>TikTok</a>
            <a href="https://chatgpt.com" target="_blank" style="text-decoration:none; color:#fff; font-size:10px; text-align:center;">🤖<br>GPT</a>
            <a href="https://youtube.com" target="_blank" style="text-decoration:none; color:#fff; font-size:10px; text-align:center;">📺<br>YouTube</a>
        </div>
    `;
    document.body.appendChild(panel);

    document.getElementById('btnTest').onclick = () => alert("Hub đã hoạt động!");
    
    console.log("✅ Danhvux Hub: Giao diện đã sẵn sàng!");
})();
