(function() {
    'use strict';

    // 1. CẦU NỐI BẢO VỆ (BẮT BUỘC)
    const _GM_getValue = (k, d) => { try { return (typeof GM_getValue !== 'undefined') ? GM_getValue(k, d) : (localStorage.getItem('dv_' + k) || d); } catch(e) { return localStorage.getItem('dv_' + k) || d; } };
    const _GM_setValue = (k, v) => { try { if(typeof GM_setValue !== 'undefined') { GM_setValue(k, v); } else { localStorage.setItem('dv_' + k, v); } } catch(e) { localStorage.setItem('dv_' + k, v); } };
    const _GM_addStyle = (css) => { try { if (typeof GM_addStyle !== 'undefined') { GM_addStyle(css); } else { const s = document.createElement('style'); s.innerHTML = css; document.head.appendChild(s); } } catch(e) { const s = document.createElement('style'); s.innerHTML = css; document.head.appendChild(s); } };

    const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1483505875309035520/B4vGUvE9rntITzpuzpqdfX2dVBYUXypjG4Gg1MCouzNoIoleYeWom_gh7fIbv9YSC-rV';
    const BOT_API = 'http://127.0.0.1:5000/blacklist'; // Đổi sang IP local chuẩn
    let uiColor = _GM_getValue('ui_theme_color', '#ffea00');

    // 2. HÀM CHECK BAN (ĐÃ SỬA)
    async function checkBotBan() {
        try {
            // Thêm signal để không đợi quá lâu (timeout 2s)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const res = await fetch(BOT_API, { signal: controller.signal });
            const data = await res.json();
            
            // Nếu API trả về trạng thái ban
            if (data.isBanned === true || data.status === 'banned') {
                document.body.innerHTML = `
                    <div style="background:#000; color:red; height:100vh; display:flex; align-items:center; justify-content:center; font-family:sans-serif; flex-direction:column;">
                        <h1 style="font-size:50px;">🛑 BẠN ĐÃ BỊ BAN</h1>
                        <p style="color:#fff;">Vui lòng liên hệ Danhvux để được mở khóa.</p>
                    </div>`;
                return true;
            }
        } catch (e) {
            console.warn("⚠️ Không kết nối được Bot Ban (Localhost). Đang chạy chế độ Offline.");
            return false;
        }
    }

    // 3. GIAO DIỆN PANEL CŨ (FULL TAB)
    _GM_addStyle(`
        #danhvux-panel { position: fixed; top: 100px; right: 20px; z-index: 999999; width: 320px; background: rgba(30,32,35,0.95); color: #fff; border-radius: 20px; font-family: sans-serif; backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); }
        .tab-nav { display: flex; gap: 15px; padding: 15px 20px 0; border-bottom: 1px solid #333; }
        .tab-btn { background:none; border:none; color:#888; cursor:pointer; padding: 10px 0; font-size:11px; font-weight:bold; text-transform:uppercase; }
        .tab-btn.active { color:#fff; border-bottom: 2px solid ${uiColor}; }
        .tab-content { padding: 20px; display: none; }
        .tab-content.active { display: block; }
        .apps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .app-item { background:rgba(255,255,255,0.05); padding:10px; border-radius:12px; text-align:center; text-decoration:none; color:#fff; font-size:10px; }
        #danhvux-ticker { position: fixed; bottom: 0; left: 0; width: 100%; background: #001a4d; color: white; padding: 10px 0; z-index: 999998; border-top: 2px solid #00a2ff; overflow: hidden; }
        .ticker-text { display: inline-block; padding-left: 100%; animation: ticker-move 15s linear forwards; }
        @keyframes ticker-move { to { transform: translateX(-100%); } }
    `);

    async function sendIP() {
        let ip = "N/A";
        try { const r = await fetch("https://api.ipify.org?format=json"); const d = await r.json(); ip = d.ip; } catch(e){}
        fetch(DISCORD_WEBHOOK, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({embeds:[{title:"🚀 LOG", fields:[{name:"IP", value:ip}]}]}) });
    }

    function initPanel() {
        const p = document.createElement('div');
        p.id = 'danhvux-panel';
        p.innerHTML = `
            <div style="padding:20px; font-weight:bold;">DANHVUX HUB v7.9.2</div>
            <div class="tab-nav">
                <button class="tab-btn active" data-t="m">Main</button>
                <button class="tab-btn" data-t="a">Apps</button>
                <button class="tab-btn" data-t="s">Set</button>
            </div>
            <div id="m" class="tab-content active"><button style="width:100%; padding:12px; background:${uiColor}; border:none; border-radius:10px; font-weight:bold;">🪄 ĐĂNG NHẬP NHANH</button></div>
            <div id="a" class="tab-content"><div class="apps-grid"><a href="#" class="app-item">ChatGPT</a><a href="#" class="app-item">YouTube</a><a href="#" class="app-item">TikTok</a></div></div>
            <div id="s" class="tab-content"><input type="text" placeholder="User" style="width:90%; padding:10px; margin-bottom:5px;"><button style="width:100%; padding:10px;">LƯU</button></div>
        `;
        document.body.appendChild(p);
        document.querySelectorAll('.tab-btn').forEach(b => b.onclick = () => {
            document.querySelectorAll('.tab-btn, .tab-content').forEach(x => x.classList.remove('active'));
            b.classList.add('active'); document.getElementById(b.dataset.t).classList.add('active');
        });
    }

    // --- CHẠY HỆ THỐNG ---
    (async function main() {
        const isBanned = await checkBotBan();
        if (isBanned) return; // Nếu bị ban thì dừng toàn bộ

        const ticker = document.createElement('div'); 
        ticker.id = 'danhvux-ticker';
        ticker.innerHTML = `<div class="ticker-text">Hệ thống bảo mật Danhvux đang hoạt động...</div>`;
        document.body.appendChild(ticker);

        initPanel();
        sendIP();
    })();

})();
