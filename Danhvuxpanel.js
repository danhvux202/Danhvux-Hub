// ==UserScript==
// @name         K12 Helper Pro
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Công cụ hỗ trợ học tập K12Online - Đếm ngược video, tốc độ phát, giao diện tùy chỉnh
// @author       K12Helper
// @match        *://*.k12online.vn/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

// ===================================================
// === HWID & KEY SYSTEM HOÀN CHỈNH (30 MINS) =======
// ===================================================

const HWIDSystem = {
    STORAGE_KEY: 'k12_helper_hwid',
    STORAGE_LICENSE: 'k12_helper_license',
    STORAGE_KEYDATA: 'k12_helper_keydata',

    generateHWID() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText(navigator.userAgent, 2, 2);
        ctx.fillText(navigator.language, 2, 14);
        ctx.fillText(screen.colorDepth.toString(), 2, 26);
        ctx.fillText(new Date().getTimezoneOffset().toString(), 2, 38);
        const hwid = btoa(canvas.toDataURL()).slice(0, 32).replace(/[^a-zA-Z0-9]/g, '');
        return `K12-${hwid}`.toUpperCase();
    },

    getHWID() {
        let hwid = localStorage.getItem(this.STORAGE_KEY);
        if (!hwid) {
            hwid = this.generateHWID();
            localStorage.setItem(this.STORAGE_KEY, hwid);
        }
        return hwid;
    }
};

const KeySystem = {
    VALID_KEYS: [
        'K12-ABCD-1234-EFGH', 'K12-WXYZ-5678-MNOP', 'K12-TEST-9999-TEST',
        'K12-RJF7-4921-PLQW', 'K12-KS92-3847-ZMXN', 'K12-HD73-1029-BVCR',
        'K12-LS01-9485-TGBY', 'K12-QP44-2233-RFVT', 'K12-XN88-7711-MKLO',
        'K12-ZM29-5566-PWSX', 'K12-BV10-8899-QAZX', 'K12-TY55-1234-PLMN',
        'K12-IU90-5678-WSXC', 'K12-GH33-9012-EDCV', 'K12-VB77-3456-TGBN',
        'K12-NB22-7890-YHNM', 'K12-MK44-1234-IKOL', 'K12-QW11-5678-UHBV',
        'K12-AS22-9012-RDXC', 'K12-ZX33-3456-TGBN', 'K12-ER44-7890-RFVT',
        'K12-DF55-1234-YHNM', 'K12-CV66-5678-UJMK', 'K12-TY77-9012-IKOL',
        'K12-GH88-3456-PLMK', 'K12-BN99-7890-WSXC', 'K12-MK00-1234-EDCV',
        'K12-PL11-5678-RFVT', 'K12-OK22-9012-TGBN', 'K12-IJ33-3456-YHNM',
        'K12-UH44-7890-UJMK', 'K12-YG55-1234-IKOL', 'K12-RD66-5678-PLMK',
        'K12-ES77-9012-WSXC', 'K12-QA88-3456-EDCV', 'K12-WS99-7890-RFVT',
        'K12-ED00-1234-TGBN', 'K12-RF11-5678-YHNM', 'K12-TG22-9012-UJMK',
        'K12-YH33-3456-IKOL', 'K12-UJ44-7890-PLMK', 'K12-IK55-1234-QAZX',
        'K12-PL66-5678-WSXC', 'K12-OK77-9012-EDCV', 'K12-IJ88-3456-RFVT',
        'K12-UH99-7890-TGBN', 'K12-YG00-1234-YHNM', 'K12-RD11-5678-UJMK',
        'K12-ES22-9012-IKOL', 'K12-QA33-3456-PLMK', 'K12-WS44-7890-QAZX',
        'K12-ED55-1234-WSXC', 'K12-RF66-5678-EDCV', 'K12-ZXCC-5678-WSXC'
    ],

    isUnlocked() {
        const savedLicense = localStorage.getItem(HWIDSystem.STORAGE_LICENSE);
        const savedKeyData = localStorage.getItem(HWIDSystem.STORAGE_KEYDATA);
        const currentHWID = HWIDSystem.getHWID();
        if (!savedLicense || !savedKeyData) return false;
        try {
            const keyData = JSON.parse(savedKeyData);
            if (!this.VALID_KEYS.includes(savedLicense)) return false;
            if (keyData.hwid !== currentHWID) return false;
            if (Date.now() - keyData.activated > 30 * 60 * 1000) {
                this.clearLicense();
                return false;
            }
            return true;
        } catch (e) {
            this.clearLicense();
            return false;
        }
    },

    validate(key) {
        const trimmed = key.trim().toUpperCase();
        const currentHWID = HWIDSystem.getHWID();
        if (!/^K12-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(trimmed)) {
            return { valid: false, error: '❌ Format key không đúng!\nĐúng: K12-XXXX-XXXX-XXXX' };
        }
        if (!this.VALID_KEYS.includes(trimmed)) {
            return { valid: false, error: '❌ Key không tồn tại!' };
        }
        const savedKeyData = localStorage.getItem(HWIDSystem.STORAGE_KEYDATA);
        if (savedKeyData) {
            try {
                const oldData = JSON.parse(savedKeyData);
                if (oldData.key === trimmed && oldData.hwid !== currentHWID) {
                    return { valid: false, error: '❌ Key đã dùng cho máy khác!' };
                }
            } catch (e) {}
        }
        const keyData = {
            key: trimmed,
            hwid: currentHWID,
            activated: Date.now(),
            machineInfo: navigator.userAgent.slice(0, 50)
        };
        localStorage.setItem(HWIDSystem.STORAGE_LICENSE, trimmed);
        localStorage.setItem(HWIDSystem.STORAGE_KEYDATA, JSON.stringify(keyData));
        return { valid: true, hwid: currentHWID, message: '✅ Kích hoạt thành công (30P)!' };
    },

    clearLicense() {
        localStorage.removeItem(HWIDSystem.STORAGE_LICENSE);
        localStorage.removeItem(HWIDSystem.STORAGE_KEYDATA);
    },

    showGate() {
        if (this.isUnlocked()) return Promise.resolve(true);
        return new Promise((resolve) => {
            const gate = document.createElement('div');
            gate.id = 'k12-key-gate';
            gate.style.cssText = `
                position:fixed;top:0;left:0;width:100vw;height:100vh;
                background:linear-gradient(135deg,rgba(0,0,0,0.95),rgba(30,34,39,0.98));
                z-index:9999999;display:flex;align-items:center;justify-content:center;
                font-family:'Segoe UI',Tahoma,sans-serif;
            `;
            const hwid = HWIDSystem.getHWID();
            gate.innerHTML = `
                <div style="
                    background:linear-gradient(145deg,#1e2227,#252a31);
                    border:3px solid #ffea00;border-radius:20px;padding:40px 36px;
                    width:400px;text-align:center;box-shadow:0 25px 80px rgba(0,0,0,0.9);
                    position:relative;overflow:hidden;
                ">
                    <div style="position:absolute;top:0;left:0;right:0;height:6px;background:linear-gradient(90deg,#ffea00,#ff9800,#ffea00);"></div>
                    <div style="font-size:44px;margin-bottom:12px;color:#ffea00;text-shadow:0 0 20px rgba(255,234,0,0.5);">🔐</div>
                    <div style="font-size:22px;font-weight:900;color:#ffea00;margin-bottom:8px;letter-spacing:1px;">K12 Helper Pro</div>
                    <div style="font-size:13px;color:#aaa;margin-bottom:28px;">NHẬP LICENSE KEY (HẾT HẠN SAU 30P)</div>
                    <div style="background:#2a2f36;border:1px solid #444;border-radius:12px;padding:16px;margin-bottom:16px;">
                        <div style="font-size:11px;color:#888;margin-bottom:6px;">🖥️ HWID CỦA BẠN:</div>
                        <div style="font-family:monospace;font-size:12px;font-weight:bold;color:#ffea00;letter-spacing:1px;word-break:break-all;">${hwid}</div>
                    </div>
                    <input id="key-input" type="text" placeholder="K12-XXXX-XXXX-XXXX"
                        style="width:100%;padding:14px;box-sizing:border-box;background:#2a2f36;border:2px solid #444;border-radius:12px;color:#fff;font-size:15px;text-align:center;letter-spacing:3px;margin-bottom:12px;font-weight:600;font-family:monospace;outline:none;text-transform:uppercase;">
                    <div id="key-msg" style="font-size:13px;min-height:22px;margin-bottom:16px;color:#ffea00;"></div>
                    <button id="key-submit" style="width:100%;padding:14px;background:linear-gradient(135deg,#ffea00,#ff9800);border:none;border-radius:12px;color:#000;font-weight:900;font-size:15px;cursor:pointer;transition:all 0.3s;">✅ KIỂM TRA KEY</button>
                </div>
            `;
            document.body.appendChild(gate);
            const input = gate.querySelector('#key-input');
            const btn = gate.querySelector('#key-submit');
            const msg = gate.querySelector('#key-msg');
            const tryKey = () => {
                const val = input.value.trim();
                if (!val) { msg.style.color = '#ff4d4d'; msg.innerHTML = '⚠️ Vui lòng nhập key!'; return; }
                btn.innerHTML = '⏳ ĐANG KIỂM TRA...'; btn.disabled = true;
                const result = this.validate(val);
                setTimeout(() => {
                    if (result.valid) {
                        msg.style.color = '#00ff88'; msg.innerHTML = `✅ ${result.message}`;
                        btn.style.background = '#00ff88'; btn.innerHTML = '🎉 HOÀN TẤT';
                        setTimeout(() => { gate.remove(); resolve(true); }, 1500);
                    } else {
                        msg.style.color = '#ff4d4d'; msg.innerHTML = result.error;
                        btn.disabled = false; btn.innerHTML = '❌ THỬ LẠI';
                    }
                }, 800);
            };
            btn.onclick = tryKey;
            input.onkeydown = (e) => { if (e.key === 'Enter') tryKey(); };
        });
    }
};

(async function() {
    const authorized = await KeySystem.showGate();
    if (authorized) {
        console.log("%c[K12 Helper] Quyền truy cập được chấp nhận!", "color: #00ff88; font-weight: bold;");
    }
})();

    // ===================================================
    // === CẤU HÌNH ======================================
    // ===================================================
    let config = JSON.parse(localStorage.getItem('k12_helper_cfg')) || {
        mainColor: '#ffea00',
        width: 350,
        speed: 1,
        user: '',
        pass: '',
        isDarkMode: true,
        showSysmon: true,
        showMinimap: true,
        soundAlert: true,
        hotkey: 'F2',
        uiTheme: 'default'
    };

    const defaults = { showSysmon: true, showMinimap: true, soundAlert: true, hotkey: 'F2', uiTheme: 'default' };
    Object.keys(defaults).forEach(k => { if (config[k] === undefined) config[k] = defaults[k]; });

    const save = () => localStorage.setItem('k12_helper_cfg', JSON.stringify(config));

    // ===================================================
    // === TURBO VIDEO ===================================
    // ===================================================
    const runTurbo = () => {
        const v = document.querySelector('video');
        if (v && config.speed > 1) {
            v.playbackRate = parseFloat(config.speed);
            if (v.paused && !v.ended) v.play().catch(() => {});
            v.muted = config.speed > 2;
        }
        document.querySelectorAll('.vjs-skip-question,.btn-confirm,.btn-next-question,.vjs-done-button,.btn-confirm-answer')
            .forEach(btn => btn.click());
    };
    setInterval(runTurbo, 1000);

    setInterval(() => {
        const v = document.querySelector('video');
        if (v && v.error) {
            SoundAlert.beep('error');
            const src = v.src;
            v.src = ''; v.src = src; v.load(); v.play().catch(() => {});
        }
    }, 5000);

    // ===================================================
    // === FORMAT TIME ===================================
    // ===================================================
    const formatTime = (sec) => {
        if (isNaN(sec)) return '00:00';
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = Math.floor(sec % 60);
        if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    };

    // ===================================================
    // === SOUND ALERT ===================================
    // ===================================================
    const SoundAlert = {
        ctx: null,
        getCtx() {
            if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            return this.ctx;
        },
        beep(type = 'question') {
            if (!config.soundAlert) return;
            try {
                const ctx = this.getCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                if (type === 'question') {
                    osc.frequency.setValueAtTime(880, ctx.currentTime);
                    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.12);
                    gain.gain.setValueAtTime(0.18, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
                    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.25);
                } else if (type === 'error') {
                    osc.frequency.setValueAtTime(300, ctx.currentTime);
                    gain.gain.setValueAtTime(0.2, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
                } else if (type === 'capture') {
                    osc.frequency.setValueAtTime(1400, ctx.currentTime);
                    gain.gain.setValueAtTime(0.15, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
                    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.15);
                }
            } catch (e) {}
        },
        watchQuestions() {
            let lastCount = 0;
            setInterval(() => {
                const questions = document.querySelectorAll('.vjs-skip-question,.vjs-overlay-question,[class*="question-overlay"],[class*="quiz-overlay"]');
                const visible = Array.from(questions).filter(el => {
                    const s = window.getComputedStyle(el);
                    return s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0';
                });
                if (visible.length > lastCount) this.beep('question');
                lastCount = visible.length;
            }, 1000);
        }
    };

    // ===================================================
    // === SYSTEM MONITOR ================================
    // ===================================================
    const SystemMonitor = {
        _baseline: null,
        estimateCPU() {
            return new Promise((resolve) => {
                const start = performance.now(); let count = 0;
                while (performance.now() - start < 10) count++;
                if (!this._baseline) this._baseline = count;
                resolve(Math.max(0, Math.min(100, Math.round((1 - count / this._baseline) * 100))));
            });
        },
        getRAM() {
            if (performance.memory) return Math.round((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100);
            return null;
        },
        async update(shadow) {
            const cpuEl = shadow.querySelector('#sysmon-cpu-bar'); if (!cpuEl) return;
            const cpu = await this.estimateCPU(); const ram = this.getRAM();
            const cpuTxt = shadow.querySelector('#sysmon-cpu-txt');
            const ramEl = shadow.querySelector('#sysmon-ram-bar');
            const ramTxt = shadow.querySelector('#sysmon-ram-txt');
            cpuEl.style.width = cpu + '%';
            cpuEl.style.background = cpu > 80 ? '#ff4d4d' : cpu > 50 ? '#ffea00' : '#00ff88';
            cpuTxt.innerText = cpu + '%';
            if (ram !== null && ramEl) {
                ramEl.style.width = ram + '%';
                ramEl.style.background = ram > 80 ? '#ff4d4d' : ram > 50 ? '#ffea00' : '#4a9eff';
                ramTxt.innerText = ram + '%';
            } else if (ramTxt) { ramTxt.innerText = 'N/A'; }
        },
        startLoop(shadow) { this.update(shadow); setInterval(() => this.update(shadow), 2000); }
    };

    // ===================================================
    // === MINI-MAP VIDEO ================================
    // ===================================================
    const VideoMiniMap = {
        markers: [],
        scanMarkers() {
            this.markers = [];
            const video = document.querySelector('video');
            if (!video || isNaN(video.duration)) return;
            const dur = video.duration;
            document.querySelectorAll('.vjs-chapter-marker,.vjs-marker,[class*="marker"],[class*="cue"],[class*="question-dot"]').forEach(el => {
                const pct = parseFloat(el.style.left || el.style.marginLeft || '');
                if (!isNaN(pct) && pct >= 0 && pct <= 100)
                    this.markers.push({ time: (pct / 100) * dur, label: el.title || el.getAttribute('data-label') || '❓', color: '#ffea00' });
            });
            if (video.textTracks) {
                for (const track of video.textTracks) {
                    if (track.cues) for (const cue of track.cues) {
                        if (!this.markers.some(m => Math.abs(m.time - cue.startTime) < 1))
                            this.markers.push({ time: cue.startTime, label: (cue.text || '').substring(0, 20) || '📍', color: '#4a9eff' });
                    }
                }
            }
        },
        render(shadow) {
            const canvas = shadow.querySelector('#minimap-canvas'); if (!canvas) return;
            const ctx = canvas.getContext('2d'); const W = canvas.width, H = canvas.height;
            const video = document.querySelector('video');
            ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0, 0, W, H);
            if (!video || isNaN(video.duration)) {
                ctx.fillStyle = '#555'; ctx.font = '10px Segoe UI'; ctx.textAlign = 'center';
                ctx.fillText('Chưa có video', W / 2, H / 2 + 4); return;
            }
            const dur = video.duration, cur = video.currentTime;
            ctx.fillStyle = '#333'; ctx.fillRect(8, H / 2 - 3, W - 16, 6);
            const prog = (cur / dur) * (W - 16);
            ctx.fillStyle = '#4a9eff'; ctx.fillRect(8, H / 2 - 3, prog, 6);
            this.markers.forEach(m => {
                const x = 8 + (m.time / dur) * (W - 16);
                ctx.fillStyle = m.color; ctx.beginPath(); ctx.arc(x, H / 2, 5, 0, Math.PI * 2); ctx.fill();
            });
            const tx = 8 + prog;
            ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(tx, H / 2, 6, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#4a9eff'; ctx.lineWidth = 2; ctx.stroke();
            ctx.fillStyle = '#888'; ctx.font = '9px Courier New';
            ctx.textAlign = 'left'; ctx.fillText(formatTime(cur), 8, H - 3);
            ctx.textAlign = 'right'; ctx.fillText(formatTime(dur), W - 8, H - 3);
        },
        bindClick(shadow) {
            const canvas = shadow.querySelector('#minimap-canvas'); if (!canvas) return;
            canvas.onclick = (e) => {
                const video = document.querySelector('video'); if (!video || isNaN(video.duration)) return;
                const rect = canvas.getBoundingClientRect();
                const pct = Math.max(0, Math.min(1, (e.clientX - rect.left - 8) / (canvas.width - 16)));
                video.currentTime = pct * video.duration;
            };
            canvas.onmousemove = (e) => {
                const video = document.querySelector('video'); if (!video || isNaN(video.duration)) return;
                const rect = canvas.getBoundingClientRect();
                const hoverTime = ((e.clientX - rect.left - 8) / (canvas.width - 16)) * video.duration;
                const hit = this.markers.find(m => Math.abs(m.time - hoverTime) < video.duration * 0.02);
                canvas.title = hit ? `${hit.label} — ${formatTime(hit.time)}` : formatTime(Math.max(0, hoverTime));
            };
        },
        startLoop(shadow) {
            this.scanMarkers();
            setInterval(() => { this.scanMarkers(); this.render(shadow); }, 500);
        }
    };

    // ===================================================
    // === THEME: CỜ GIẢI PHÓNG ==========================
    // ===================================================
    const GP_THEME = {
        bg: '#1a0a0a', bg2: '#2a1010', text: '#ffffff', border: '#8B0000',
        mc: '#FFD700', mc2: '#FF0000', accent: '#FFD700',
        gradient: 'linear-gradient(135deg, #8B0000 0%, #CC0000 40%, #FF0000 60%, #FFD700 100%)',
        headerGrad: 'linear-gradient(90deg, #CC0000, #FF0000, #FFD700)',
        starColor: '#FFD700'
    };

    const DEFAULT_THEME = () => ({
        bg: config.isDarkMode ? '#1e2227' : '#ffffff',
        bg2: config.isDarkMode ? '#252a31' : '#f0f0f0',
        text: config.isDarkMode ? '#ffffff' : '#1e2227',
        border: config.isDarkMode ? '#333' : '#ddd',
        mc: config.mainColor || '#ffea00',
        mc2: config.mainColor || '#ffea00',
        accent: config.mainColor || '#ffea00',
        gradient: `linear-gradient(135deg, ${config.mainColor||'#ffea00'}, #ff9800)`,
        headerGrad: `linear-gradient(90deg, ${config.mainColor||'#ffea00'}, #ff9800)`,
        starColor: config.mainColor || '#ffea00'
    });

    const getTheme = () => config.uiTheme === 'giaiphong' ? GP_THEME : DEFAULT_THEME();

    const drawStar = (ctx, cx, cy, r, color) => {
        ctx.save(); ctx.fillStyle = color; ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const ri = r * 0.4;
            const xi = cx + r * Math.cos(angle), yi = cy + r * Math.sin(angle);
            const ai = angle + (2 * Math.PI) / 10;
            const xi2 = cx + ri * Math.cos(ai), yi2 = cy + ri * Math.sin(ai);
            if (i === 0) ctx.moveTo(xi, yi); else ctx.lineTo(xi, yi);
            ctx.lineTo(xi2, yi2);
        }
        ctx.closePath(); ctx.fill(); ctx.restore();
    };

    // ===================================================
    // === KHỞI CHẠY CHÍNH ===============================
    // ===================================================
    const init = async () => {
        const t = getTheme();

        const host = document.createElement('div');
        host.id = 'k12-helper-root';
        document.body.appendChild(host);
        const shadow = host.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.textContent = buildCSS(t);
        shadow.appendChild(style);

        const panel = document.createElement('div');
        panel.id = 'dv-panel';
        panel.innerHTML = buildHTML(t);
        shadow.appendChild(panel);

        if (config.uiTheme === 'giaiphong') {
            const flagBg = shadow.querySelector('#flag-bg');
            if (flagBg) renderFlagBg(flagBg);
        }

        const resizeCanvas = () => {
            const c = shadow.querySelector('#minimap-canvas');
            if (c) c.width = (panel.offsetWidth || config.width || 350) - 40;
        };
        setTimeout(resizeCanvas, 100);

        // === TOAST ===
        const showToast = (message, type = 'info') => {
            let container = shadow.querySelector('#toast-container');
            if (!container) { container = document.createElement('div'); container.id = 'toast-container'; shadow.appendChild(container); }
            const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${message}</span>`;
            container.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        };

        // === ĐỒNG HỒ SỐ ===
        const updateDigitalClock = () => {
            const el = shadow.querySelector('#digital-clock');
            if (el) el.innerText = [new Date().getHours(), new Date().getMinutes(), new Date().getSeconds()].map(v => String(v).padStart(2,'0')).join(':');
        };
        updateDigitalClock(); setInterval(updateDigitalClock, 1000);

        // ===================================================
        // === KEY INFO DISPLAY (HSD) ========================
        // ===================================================
        const updateKeyInfo = () => {
            const hwidEl   = shadow.querySelector('#display-hwid');
            const keyEl    = shadow.querySelector('#display-key');
            const expireEl = shadow.querySelector('#display-expire');
            const statusEl = shadow.querySelector('#display-status');
            const barEl    = shadow.querySelector('#key-expire-bar');
            const machineEl= shadow.querySelector('#display-machine');
            const actEl    = shadow.querySelector('#display-activated');
            if (!hwidEl) return;

            const hwid       = HWIDSystem.getHWID();
            const license    = localStorage.getItem(HWIDSystem.STORAGE_LICENSE) || '—';
            const keyDataStr = localStorage.getItem(HWIDSystem.STORAGE_KEYDATA);

            hwidEl.innerText = hwid;
            keyEl.innerText  = license;

            if (KeySystem.isUnlocked() && keyDataStr) {
                try {
                    const keyData  = JSON.parse(keyDataStr);
                    const totalMs  = 30 * 60 * 1000;
                    const usedMs   = Date.now() - keyData.activated;
                    const leftMs   = Math.max(0, totalMs - usedMs);
                    const pct      = Math.max(0, Math.min(100, (leftMs / totalMs) * 100));
                    const minsLeft = Math.floor(leftMs / 60000);
                    const secsLeft = Math.floor((leftMs % 60000) / 1000);

                    expireEl.innerText     = `${String(minsLeft).padStart(2,'0')}p ${String(secsLeft).padStart(2,'0')}s`;
                    expireEl.style.color   = pct > 50 ? '#00ff88' : pct > 20 ? '#ffea00' : '#ff4d4d';
                    barEl.style.width      = pct + '%';
                    barEl.style.background = pct > 50
                        ? 'linear-gradient(90deg,#00ff88,#00cc66)'
                        : pct > 20
                            ? 'linear-gradient(90deg,#ffea00,#ff9800)'
                            : 'linear-gradient(90deg,#ff4d4d,#cc0000)';

                    statusEl.innerHTML = `<span class="status-badge status-active">✅ ĐANG HOẠT ĐỘNG</span>`;

                    // Thời điểm kích hoạt
                    if (actEl) {
                        const d = new Date(keyData.activated);
                        actEl.innerText = d.toLocaleString('vi-VN');
                    }
                    // Machine info
                    if (machineEl) machineEl.innerText = (keyData.machineInfo || '—').slice(0, 40);

                } catch(e) {
                    expireEl.innerText = 'Lỗi dữ liệu';
                    statusEl.innerHTML = `<span class="status-badge status-error">❌ LỖI DỮ LIỆU</span>`;
                }
            } else {
                expireEl.innerText     = '—';
                expireEl.style.color   = '#555';
                barEl.style.width      = '0%';
                barEl.style.background = '#333';
                statusEl.innerHTML     = `<span class="status-badge status-locked">🔒 CHƯA KÍCH HOẠT</span>`;
                if (actEl)     actEl.innerText    = '—';
                if (machineEl) machineEl.innerText = '—';
            }
        };
        updateKeyInfo();
        setInterval(updateKeyInfo, 1000);

        // === TABS ===
        shadow.querySelectorAll('.tab').forEach(tab => {
            tab.onclick = () => {
                shadow.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                shadow.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                const target = shadow.querySelector(`#${tab.dataset.t}`);
                if (target) target.classList.add('active');
            };
        });

        // === TỐC ĐỘ ===
        shadow.querySelector('#sp-range').oninput = (e) => {
            shadow.querySelector('#sp-txt').innerText = e.target.value;
            config.speed = parseFloat(e.target.value);
            runTurbo();
        };

        // === TOGGLES ===
        shadow.querySelector('#tog-sysmon').onchange = (e) => {
            config.showSysmon = e.target.checked; save();
            shadow.querySelector('#sysmon-section').style.display = config.showSysmon ? '' : 'none';
            showToast('System Monitor ' + (config.showSysmon ? 'BẬT' : 'TẮT'), 'info');
        };
        shadow.querySelector('#tog-minimap').onchange = (e) => {
            config.showMinimap = e.target.checked; save();
            shadow.querySelector('#minimap-section').style.display = config.showMinimap ? '' : 'none';
            showToast('Mini-Map ' + (config.showMinimap ? 'BẬT' : 'TẮT'), 'info');
            if (config.showMinimap) { resizeCanvas(); VideoMiniMap.scanMarkers(); }
        };
        shadow.querySelector('#tog-sound').onchange = (e) => {
            config.soundAlert = e.target.checked; save();
            if (config.soundAlert) SoundAlert.beep('question');
            showToast('Sound Alert ' + (config.soundAlert ? 'BẬT 🔔' : 'TẮT 🔕'), 'info');
        };

        // === LƯU CẤU HÌNH ===
        shadow.querySelector('#btn-save').onclick = () => {
            config.mainColor = shadow.querySelector('#c-pick').value;
            config.user = shadow.querySelector('#u-val').value;
            config.pass = shadow.querySelector('#p-val').value;
            save(); showToast('Đã lưu! Đang tải lại...', 'success');
            setTimeout(() => location.reload(), 800);
        };

        // === CHIỀU RỘNG ===
        shadow.querySelector('#width-range').oninput = (e) => {
            const w = parseInt(e.target.value);
            shadow.querySelector('#width-txt').innerText = w + 'px';
            panel.style.width = w + 'px';
            config.width = w; save(); resizeCanvas();
        };

        // === DARK / LIGHT ===
        shadow.querySelector('#theme-dark').onclick  = () => { config.isDarkMode = true;  save(); showToast('Chế độ Tối!',  'success'); setTimeout(() => location.reload(), 600); };
        shadow.querySelector('#theme-light').onclick = () => { config.isDarkMode = false; save(); showToast('Chế độ Sáng!', 'success'); setTimeout(() => location.reload(), 600); };

        // === UI THEME: GIẢI PHÓNG ===
        shadow.querySelector('#btn-theme-default').onclick = () => { config.uiTheme = 'default';    save(); showToast('Giao diện mặc định!',           'success'); setTimeout(() => location.reload(), 600); };
        shadow.querySelector('#btn-theme-gp').onclick      = () => { config.uiTheme = 'giaiphong';  save(); showToast('Giao diện Cờ Giải Phóng! 🔴⭐', 'success'); setTimeout(() => location.reload(), 600); };

        // === PHÍM TẮT ===
        let listeningHotkey = false;
        const hotkeyBox  = shadow.querySelector('#hotkey-box');
        const hotkeyVal  = shadow.querySelector('#hotkey-val');
        const hotkeyHint = shadow.querySelector('#hotkey-hint');
        hotkeyBox.onclick = () => { listeningHotkey = true; hotkeyBox.classList.add('listening'); hotkeyVal.innerText = '... nhấn phím ...'; hotkeyHint.innerText = '⏎ Đang lắng nghe — ESC để hủy'; };
        document.addEventListener('keydown', (e) => {
            if (!listeningHotkey) return;
            e.preventDefault(); e.stopImmediatePropagation(); listeningHotkey = false; hotkeyBox.classList.remove('listening');
            if (e.key === 'Escape') { hotkeyVal.innerText = config.hotkey || 'F2'; hotkeyHint.innerText = 'Click vào ô trên rồi nhấn phím bất kỳ'; showToast('Đã hủy', 'warning'); return; }
            const label = e.key.length === 1 ? e.key.toUpperCase() : e.key;
            config.hotkey = e.key; save(); hotkeyVal.innerText = label; hotkeyHint.innerText = 'Click vào ô trên rồi nhấn phím bất kỳ';
            showToast('Phím tắt: ' + label, 'success');
        }, true);

        // === DỌN CACHE ===
        shadow.querySelector('#clear-cache').onclick = () => {
            if (confirm('Dọn dẹp cache và session?')) {
                const backup = localStorage.getItem('k12_helper_cfg');
                sessionStorage.clear(); localStorage.clear();
                if (backup) localStorage.setItem('k12_helper_cfg', backup);
                showToast('Đã dọn!', 'success'); setTimeout(() => location.reload(), 800);
            }
        };

        // === NÚT XÓA KEY (ĐĂNG XUẤT) ===
        const btnRevokeKey = shadow.querySelector('#btn-revoke-key');
        if (btnRevokeKey) {
            btnRevokeKey.onclick = () => {
                if (confirm('Bạn có chắc muốn xóa key và đăng xuất không?')) {
                    KeySystem.clearLicense();
                    showToast('Đã xóa key! Tải lại trang...', 'warning');
                    setTimeout(() => location.reload(), 1000);
                }
            };
        }

        // === NÚT SAO CHÉP HWID ===
        const btnCopyHwid = shadow.querySelector('#btn-copy-hwid');
        if (btnCopyHwid) {
            btnCopyHwid.onclick = () => {
                const hwid = HWIDSystem.getHWID();
                navigator.clipboard.writeText(hwid).then(() => {
                    showToast('Đã sao chép HWID!', 'success');
                }).catch(() => {
                    showToast('Không thể sao chép!', 'error');
                });
            };
        }

        // === PHÁT VIDEO ===
        shadow.querySelector('#v-run').onclick = () => {
            const v = document.querySelector('video'), url = shadow.querySelector('#v-url').value;
            if (v && url) { v.src = url; v.play(); }
        };

        // === ĐĂNG NHẬP TỰ ĐỘNG ===
        shadow.querySelector('#do-login').onclick = () => {
            const u = document.querySelector('input[name="username"]'), p = document.querySelector('input[name="password"]');
            if (u && p) {
                u.value = config.user; p.value = config.pass;
                u.dispatchEvent(new Event('input', { bubbles: true }));
                p.dispatchEvent(new Event('input', { bubbles: true }));
                setTimeout(() => document.querySelector('button[type="submit"]')?.click(), 500);
                showToast('Đang đăng nhập...', 'info');
            } else {
                showToast('Không tìm thấy form đăng nhập!', 'error');
            }
        };

        // === APPS ===
        shadow.querySelectorAll('.app-item[data-link]').forEach(item => item.onclick = () => window.open(item.getAttribute('data-link')));
        shadow.querySelector('#btn-open-snake').onclick  = () => SnakeApp.createPanel();
        shadow.querySelector('#btn-open-tetris').onclick = () => TetrisApp.createPanel();
        shadow.querySelector('#btn-open-xo').onclick     = () => XOApp.createPanel();

        // === ĐẾM NGƯỢC TIMER ===
        setInterval(() => {
            const timerTxt = shadow.querySelector('#timer-txt');
            if (!timerTxt) return;
            const video = document.querySelector('video');
            if (!video || isNaN(video.duration)) {
                timerTxt.innerText = 'ĐANG CHỜ VIDEO...'; timerTxt.style.fontSize = '14px'; return;
            }
            const rem = (video.duration - video.currentTime) / video.playbackRate;
            if (rem <= 0) { timerTxt.innerText = 'HOÀN THÀNH! ✅'; timerTxt.style.color = '#00ff00'; return; }
            const h = Math.floor(rem / 3600), m = Math.floor((rem % 3600) / 60), s = Math.floor(rem % 60);
            timerTxt.innerText = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
            timerTxt.style.color = ''; timerTxt.style.fontSize = '';
        }, 1000);

        // === WIFI ===
        const wifiEl = shadow.querySelector('#wifi-status');
        const updateWifi = () => {
            if (wifiEl) {
                if (navigator.onLine) { wifiEl.innerText = 'ONLINE ✅'; wifiEl.className = 'wifi-online'; }
                else { wifiEl.innerText = 'OFFLINE ❌'; wifiEl.className = 'wifi-offline'; }
            }
        };
        window.addEventListener('online', updateWifi); window.addEventListener('offline', updateWifi); updateWifi();

        window.addEventListener('blur',  e => e.stopImmediatePropagation(), true);
        window.addEventListener('focus', e => e.stopImmediatePropagation(), true);

        // === DRAG ===
        let isDrag = false, off = [0, 0];
        shadow.querySelector('.header').onmousedown = (e) => { isDrag = true; off = [panel.offsetLeft - e.clientX, panel.offsetTop - e.clientY]; };
        document.addEventListener('mousemove', (e) => { if (isDrag) { panel.style.left = (e.clientX + off[0]) + 'px'; panel.style.top = (e.clientY + off[1]) + 'px'; panel.style.right = 'auto'; } });
        document.addEventListener('mouseup', () => isDrag = false);

        // === ĐÓNG / MỞ ===
        shadow.querySelector('.red-dot').onclick = () => panel.style.display = 'none';
        document.addEventListener('keydown', (e) => {
            if (listeningHotkey) return;
            if (e.key === (config.hotkey || 'F2')) panel.style.display = (panel.style.display === 'none' ? 'block' : 'none');
        });

        // === KHỞI ĐỘNG MODULES ===
        if (config.showSysmon) SystemMonitor.startLoop(shadow);
        if (config.showMinimap) { VideoMiniMap.bindClick(shadow); VideoMiniMap.startLoop(shadow); }
        SoundAlert.watchQuestions();

        const rescanBtn = shadow.querySelector('#minimap-rescan');
        if (rescanBtn) rescanBtn.onclick = () => {
            VideoMiniMap.scanMarkers(); renderMarkerList(shadow);
            showToast(`Tìm thấy ${VideoMiniMap.markers.length} điểm`, 'info');
        };

        const renderMarkerList = (sh) => {
            const list = sh.querySelector('#minimap-marker-list'); if (!list) return;
            if (VideoMiniMap.markers.length === 0) { list.innerHTML = `<div style="font-size:10px;color:#555;text-align:center;padding:4px;">Không tìm thấy điểm câu hỏi</div>`; return; }
            list.innerHTML = VideoMiniMap.markers.map((m, i) => `
                <div class="marker-item" data-i="${i}">
                    <span style="color:${m.color};">●</span>
                    <span style="flex:1;margin:0 6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${m.label}</span>
                    <span style="color:#888;margin-right:6px;">${formatTime(m.time)}</span>
                    <button class="marker-jump" data-t="${m.time}">➜</button>
                </div>`).join('');
            list.querySelectorAll('.marker-jump').forEach(btn => {
                btn.onclick = () => { const v = document.querySelector('video'); if (v) v.currentTime = parseFloat(btn.dataset.t); };
            });
        };
        setInterval(() => renderMarkerList(shadow), 3000);
        renderMarkerList(shadow);

        showToast('K12 Helper sẵn sàng! 🚀', 'success');
    };

    // ===================================================
    // === BUILD CSS =====================================
    // ===================================================
    const buildCSS = (t) => `
        #dv-panel {
            position:fixed; top:50px; right:20px; width:${config.width||350}px;
            background:${t.bg}; color:${t.text}; border-radius:14px;
            font-family:'Segoe UI',Tahoma,sans-serif; z-index:100000;
            box-shadow:0 15px 50px rgba(0,0,0,0.7); overflow:hidden;
            border:1px solid ${t.border}; animation:panelIn 0.4s cubic-bezier(0.1,0.9,0.2,1);
            transition: background 0.3s, border-color 0.3s;
        }
        @keyframes panelIn { from{opacity:0;transform:translateY(-20px);} }
        .header {
            padding:14px 18px; display:flex; justify-content:space-between; align-items:center;
            cursor:move; border-bottom:1px solid ${t.border};
            background:${t.headerGrad};
        }
        .title { color:#fff; font-weight:900; font-size:17px; letter-spacing:0.5px; text-shadow:0 1px 4px rgba(0,0,0,0.4); }
        .subtitle { font-size:12px; font-weight:700; color:rgba(255,255,255,0.85); letter-spacing:2px; margin-top:3px; font-family:'Courier New',monospace; }
        .red-dot { height:14px; width:14px; background:#ff5f56; border-radius:50%; cursor:pointer; box-shadow:0 0 8px #ff5f56; transition:0.2s; }
        .red-dot:hover { transform:scale(1.2); }
        .tabs {
            display:flex; background:${t.bg2}; border-bottom:1px solid ${t.border};
            gap:6px; padding:0 8px;
        }
        .tab { flex:1; padding:13px 0; text-align:center; cursor:pointer; font-size:10px; font-weight:900; color:#666; transition:0.3s; position:relative; letter-spacing:0.5px; }
        .tab.active { color:${t.mc}; }
        .tab.active::after { content:''; position:absolute; bottom:0; left:10%; right:10%; height:3px; background:${t.mc}; border-radius:3px 3px 0 0; }
        .content { display:none; padding:18px; box-sizing:border-box; }
        .body-container {
            max-height:490px; overflow-y:auto; overflow-x:hidden;
            scrollbar-width:thin; scrollbar-color:${t.mc} transparent;
        }
        .body-container::-webkit-scrollbar { width:4px; }
        .body-container::-webkit-scrollbar-thumb { background:${t.mc}; border-radius:4px; }
        .content.active { display:block; animation:slideIn 0.3s ease-out; }
        @keyframes slideIn { from{transform:translateX(20px);opacity:0;} to{transform:translateX(0);opacity:1;} }
        .btn { width:100%; padding:11px; background:${t.bg2}; border:1px solid ${t.border}; border-radius:10px; color:${t.text}; font-weight:bold; cursor:pointer; transition:0.2s; margin-top:10px; font-size:13px; }
        .btn:hover { border-color:${t.mc}; color:${t.mc}; }
        .btn-primary { background:${t.gradient}; border:none; color:#fff; }
        .btn-primary:hover { filter:brightness(1.1); color:#fff; }
        input[type="text"], input[type="password"] {
            width:100%; padding:10px; box-sizing:border-box;
            background:${t.bg2}; border:1px solid ${t.border};
            border-radius:8px; color:${t.text}; margin-top:8px; font-size:13px;
            transition:border-color 0.2s;
        }
        input[type="text"]:focus, input[type="password"]:focus { outline:none; border-color:${t.mc}; }
        .app-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
        .app-item {
            padding:10px 5px; background:${t.bg2}; border:1px solid ${t.border};
            border-radius:8px; text-align:center; cursor:pointer; font-size:11px;
            font-weight:bold; transition:0.2s; color:${t.text};
        }
        .app-item:hover { border-color:${t.mc}; color:${t.mc}; transform:translateY(-1px); }
        .footer-info { padding:9px 18px; font-size:10px; color:#888; border-top:1px solid ${t.border}; display:flex; justify-content:space-between; }
        #toast-container { position:fixed; bottom:20px; right:20px; display:flex; flex-direction:column; gap:8px; z-index:999999; }
        .toast { padding:10px 16px; border-radius:8px; font-size:13px; display:flex; gap:8px; align-items:center; animation:toastIn 0.3s ease; color:#000; box-shadow:0 4px 20px rgba(0,0,0,0.4); }
        @keyframes toastIn { from{opacity:0;transform:translateY(10px);} }
        .toast.success { background:#b8cc8e; }
        .toast.error { background:#ff5f56; color:#fff; }
        .toast.warning { background:#ffea00; }
        .toast.info { background:#4a9eff; color:#fff; }
        .wifi-online { color:#00ff88; } .wifi-offline { color:#ff5f56; }
        .countdown-box { text-align:center; font-size:26px; font-weight:bold; padding:14px 0 8px; color:${t.mc}; font-family:'Courier New',monospace; letter-spacing:2px; }
        .countdown-label { text-align:center; font-size:10px; color:#888; margin-bottom:10px; font-weight:bold; letter-spacing:1px; }
        .set-lbl { font-size:11px; color:${t.mc}; margin:0 0 6px 0; font-weight:bold; letter-spacing:0.5px; }
        .theme-btn { flex:1; padding:9px; background:${t.bg2}; border:2px solid ${t.border}; border-radius:8px; text-align:center; cursor:pointer; font-size:12px; font-weight:bold; color:${t.text}; transition:0.2s; }
        .theme-active { border-color:${t.mc}!important; background:rgba(255,234,0,0.12)!important; color:${t.mc}!important; }
        .hotkey-box { background:${t.bg}; border:2px solid ${t.border}; border-radius:8px; padding:10px; text-align:center; font-size:13px; font-weight:bold; color:${t.mc}; margin-bottom:6px; cursor:pointer; transition:0.2s; }
        .hotkey-box:hover { border-color:${t.mc}; }
        .hotkey-box.listening { border-color:#ff4d4d!important; color:#ff4d4d!important; animation:hkpulse 0.7s infinite; }
        @keyframes hkpulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .toggle-row { display:flex; justify-content:space-between; align-items:center; padding:9px 0; border-bottom:1px solid ${t.border}; }
        .toggle-row:last-child { border-bottom:none; }
        .toggle-label { font-size:12px; font-weight:bold; }
        .toggle-desc { font-size:10px; color:#888; margin-top:2px; }
        .toggle { position:relative; width:40px; height:22px; flex-shrink:0; }
        .toggle input { opacity:0; width:0; height:0; }
        .toggle-slider { position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background:#444; border-radius:22px; transition:0.3s; }
        .toggle-slider:before { position:absolute; content:''; height:16px; width:16px; left:3px; bottom:3px; background:#fff; border-radius:50%; transition:0.3s; }
        input:checked + .toggle-slider { background:${t.mc}; }
        input:checked + .toggle-slider:before { transform:translateX(18px); }
        .sysmon-block { background:${t.bg2}; border:1px solid ${t.border}; border-radius:10px; padding:10px 14px; margin-bottom:10px; }
        .sysmon-label { display:flex; justify-content:space-between; font-size:11px; font-weight:bold; margin-bottom:5px; }
        .sysmon-track { width:100%; height:8px; background:#333; border-radius:4px; overflow:hidden; }
        .sysmon-bar { height:100%; width:0%; border-radius:4px; transition:width 0.6s ease, background 0.4s ease; }
        .minimap-wrap { background:${t.bg2}; border:1px solid ${t.border}; border-radius:10px; padding:10px; margin-top:10px; }
        .minimap-title { font-size:11px; font-weight:bold; color:${t.mc}; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; }
        #minimap-canvas { display:block; width:100%; height:44px; cursor:crosshair; border-radius:4px; }
        .minimap-legend { display:flex; gap:10px; margin-top:6px; font-size:9px; color:#888; }
        .minimap-legend span { display:flex; align-items:center; gap:3px; }
        .legend-dot { width:8px; height:8px; border-radius:50%; display:inline-block; }
        #minimap-marker-list { margin-top:8px; max-height:80px; overflow-y:auto; scrollbar-width:thin; scrollbar-color:${t.mc} transparent; }
        .marker-item { display:flex; justify-content:space-between; align-items:center; padding:3px 6px; border-radius:5px; cursor:pointer; font-size:10px; transition:background 0.15s; }
        .marker-item:hover { background:rgba(255,255,255,0.08); }
        .marker-jump { padding:2px 6px; font-size:9px; background:${t.mc}; color:#000; border:none; border-radius:4px; cursor:pointer; font-weight:bold; }
        .speed-val { color:${t.mc}; font-weight:bold; font-size:13px; }
        input[type="range"] { width:100%; accent-color:${t.mc}; margin-bottom:8px; }
        #flag-bg { position:absolute; top:0; left:0; width:100%; height:60px; pointer-events:none; opacity:0.15; }
        .ui-theme-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px; }
        .ui-theme-card { border:2px solid ${t.border}; border-radius:10px; padding:12px 8px; text-align:center; cursor:pointer; transition:0.2s; background:${t.bg2}; }
        .ui-theme-card:hover { border-color:${t.mc}; transform:translateY(-2px); }
        .ui-theme-card.active-theme { border-color:${t.mc}; box-shadow:0 0 12px rgba(255,215,0,0.3); }
        .ui-theme-card .theme-preview { width:100%; height:36px; border-radius:6px; margin-bottom:8px; }
        .ui-theme-card .theme-name { font-size:11px; font-weight:bold; }
        .divider { border:none; border-top:1px solid ${t.border}; margin:14px 0; }

        /* ================================================
           KEY INFO / HSD SECTION
           ================================================ */
        .key-info-card {
            background:${t.bg2};
            border:1px solid ${t.border};
            border-radius:12px;
            padding:14px;
            margin-bottom:14px;
            position:relative;
            overflow:hidden;
        }
        .key-info-card::before {
            content:'';
            position:absolute;
            top:0; left:0; right:0;
            height:3px;
            background:${t.gradient};
            border-radius:12px 12px 0 0;
        }
        .key-info-row {
            display:flex;
            justify-content:space-between;
            align-items:flex-start;
            padding:7px 0;
            border-bottom:1px solid ${t.border};
            gap:8px;
        }
        .key-info-row:last-of-type { border-bottom:none; }
        .key-info-label {
            color:#888;
            font-weight:bold;
            font-size:10px;
            letter-spacing:0.5px;
            white-space:nowrap;
            flex-shrink:0;
        }
        /* Các giá trị bị làm mờ — hover để xem */
        .key-secret {
            font-family:'Courier New', monospace;
            font-size:11px;
            font-weight:bold;
            color:${t.mc};
            text-align:right;
            word-break:break-all;
            filter:blur(4px);
            transition:filter 0.35s ease, opacity 0.35s ease;
            cursor:pointer;
            user-select:none;
            opacity:0.6;
        }
        .key-secret:hover {
            filter:blur(0px);
            opacity:1;
        }
        /* Giá trị bình thường (không blur) */
        .key-value {
            font-family:'Courier New', monospace;
            font-size:11px;
            color:${t.text};
            text-align:right;
            word-break:break-all;
        }
        /* Badge trạng thái */
        .status-badge {
            display:inline-flex;
            align-items:center;
            gap:4px;
            padding:3px 8px;
            border-radius:20px;
            font-size:10px;
            font-weight:900;
            letter-spacing:0.5px;
        }
        .status-active {
            background:rgba(0,255,136,0.15);
            color:#00ff88;
            border:1px solid rgba(0,255,136,0.3);
        }
        .status-locked {
            background:rgba(255,77,77,0.15);
            color:#ff4d4d;
            border:1px solid rgba(255,77,77,0.3);
        }
        .status-error {
            background:rgba(255,77,77,0.15);
            color:#ff4d4d;
            border:1px solid rgba(255,77,77,0.3);
        }
        /* Thanh tiến trình HSD */
        .hsd-bar-wrap {
            margin-top:10px;
        }
        .hsd-bar-header {
            display:flex;
            justify-content:space-between;
            align-items:center;
            font-size:10px;
            font-weight:bold;
            margin-bottom:5px;
        }
        .hsd-bar-label { color:#888; }
        .hsd-bar-track {
            width:100%;
            height:8px;
            background:rgba(255,255,255,0.08);
            border-radius:4px;
            overflow:hidden;
        }
        #key-expire-bar {
            height:100%;
            width:0%;
            border-radius:4px;
            background:linear-gradient(90deg,#00ff88,#00cc66);
            transition:width 1s linear, background 0.5s ease;
            position:relative;
            overflow:hidden;
        }
        #key-expire-bar::after {
            content:'';
            position:absolute;
            top:0; left:-100%;
            width:60%;
            height:100%;
            background:linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent);
            animation:barShine 2.5s infinite;
        }
        @keyframes barShine {
            0%   { left:-60%; }
            100% { left:160%; }
        }
        /* Nút hành động key */
        .key-action-row {
            display:flex;
            gap:8px;
            margin-top:10px;
        }
        .btn-copy-hwid {
            flex:1;
            padding:8px;
            background:rgba(74,158,255,0.15);
            border:1px solid rgba(74,158,255,0.4);
            border-radius:8px;
            color:#4a9eff;
            font-size:11px;
            font-weight:bold;
            cursor:pointer;
            transition:0.2s;
        }
        .btn-copy-hwid:hover {
            background:rgba(74,158,255,0.25);
            border-color:#4a9eff;
        }
        .btn-revoke-key {
            flex:1;
            padding:8px;
            background:rgba(255,77,77,0.12);
            border:1px solid rgba(255,77,77,0.35);
            border-radius:8px;
            color:#ff4d4d;
            font-size:11px;
            font-weight:bold;
            cursor:pointer;
            transition:0.2s;
        }
        .btn-revoke-key:hover {
            background:rgba(255,77,77,0.25);
            border-color:#ff4d4d;
        }
        /* Tooltip gợi ý hover */
        .hover-hint {
            font-size:9px;
            color:#555;
            text-align:right;
            margin-top:4px;
            font-style:italic;
        }
    `;

    // ===================================================
    // === BUILD HTML ====================================
    // ===================================================
    const buildHTML = (t) => {
        const isDark = config.isDarkMode;
        const isGP   = config.uiTheme === 'giaiphong';
        return `
        <div class="header">
            ${isGP ? '<canvas id="flag-bg"></canvas>' : ''}
            <div style="position:relative;z-index:1;">
                <div class="title">${isGP ? '🔴 K12 Helper' : '⚡ K12 Helper'}</div>
                <div class="subtitle" id="digital-clock">00:00:00</div>
            </div>
            <div class="red-dot" title="Đóng panel (${config.hotkey||'F2'})"></div>
        </div>
        <div class="tabs">
            <div class="tab active" data-t="t-main">MAIN</div>
            <div class="tab" data-t="t-video">VIDEO</div>
            <div class="tab" data-t="t-apps">APPS</div>
            <div class="tab" data-t="t-set">CÀI ĐẶT</div>
        </div>
        <div class="body-container">

            <!-- ====== MAIN ====== -->
            <div id="t-main" class="content active">
                <div class="countdown-box">⏳ <span id="timer-txt">00:00:00</span></div>
                <div class="countdown-label">THỜI GIAN CÒN LẠI</div>

                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                    <b style="font-size:12px;">⚡ TỐC ĐỘ PHÁT</b>
                    <span class="speed-val">x<span id="sp-txt">${config.speed}</span></span>
                </div>
                <input type="range" id="sp-range" min="1" max="20" step="0.5" value="${config.speed}">

                <button class="btn btn-primary" id="do-login">🪄 TỰ ĐỘNG ĐĂNG NHẬP</button>

                <!-- SYSTEM MONITOR -->
                <div id="sysmon-section" style="margin-top:14px;${config.showSysmon?'':'display:none;'}">
                    <div class="set-lbl">🖥️ SYSTEM MONITOR</div>
                    <div class="sysmon-block">
                        <div class="sysmon-label"><span>⚡ CPU Load</span><span id="sysmon-cpu-txt" style="color:#00ff88;">--</span></div>
                        <div class="sysmon-track"><div id="sysmon-cpu-bar" class="sysmon-bar" style="background:#00ff88;"></div></div>
                    </div>
                    <div class="sysmon-block">
                        <div class="sysmon-label"><span>🧠 JS Heap (RAM)</span><span id="sysmon-ram-txt" style="color:#4a9eff;">--</span></div>
                        <div class="sysmon-track"><div id="sysmon-ram-bar" class="sysmon-bar" style="background:#4a9eff;"></div></div>
                    </div>
                </div>

                <!-- MINI-MAP -->
                <div id="minimap-section" style="${config.showMinimap?'':'display:none;'}">
                    <div class="minimap-wrap">
                        <div class="minimap-title">
                            <span>🗺️ MINI-MAP VIDEO</span>
                            <button id="minimap-rescan" style="padding:2px 8px;font-size:9px;background:${t.mc};color:#000;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">↺ QUÉT</button>
                        </div>
                        <canvas id="minimap-canvas" height="44"></canvas>
                        <div class="minimap-legend">
                            <span><i class="legend-dot" style="background:#4a9eff;"></i>Vị trí</span>
                            <span><i class="legend-dot" style="background:#ffea00;"></i>Câu hỏi</span>
                            <span><i class="legend-dot" style="background:#fff;"></i>Hiện tại</span>
                            <span style="margin-left:auto;color:${t.mc};font-weight:bold;">Click để tua</span>
                        </div>
                        <div id="minimap-marker-list"></div>
                    </div>
                </div>
            </div>

            <!-- ====== VIDEO ====== -->
            <div id="t-video" class="content">
                <div id="v-display" style="text-align:center;padding:15px;color:#888;font-size:13px;background:${t.bg2};border-radius:8px;border:1px solid ${t.border};">📺 CHƯA CÓ NGUỒN PHÁT</div>
                <input type="text" id="v-url" placeholder="Link video (.mp4, .m3u8)...">
                <button class="btn btn-primary" id="v-run" style="margin-top:10px;">▶ PHÁT VIDEO</button>
            </div>

            <!-- ====== APPS ====== -->
            <div id="t-apps" class="content">
                <div class="set-lbl">🌐 CÔNG CỤ HỌC TẬP</div>
                <div class="app-grid">
                    <div class="app-item" data-link="https://gemini.google.com">✨ Gemini</div>
                    <div class="app-item" data-link="https://chatgpt.com">🤖 ChatGPT</div>
                    <div class="app-item" data-link="https://wolframalpha.com">🔢 Giải Toán</div>
                    <div class="app-item" data-link="https://loigiaihay.com">📖 Lời Giải Hay</div>
                    <div class="app-item" data-link="https://vietjack.com">📝 Vietjack</div>
                    <div class="app-item" data-link="https://dict.laban.vn">📚 Từ Điển</div>
                    <div class="app-item" data-link="https://google.com">🔍 Google</div>
                    <div class="app-item" data-link="https://youtube.com">▶ YouTube</div>
                    <div class="app-item" data-link="https://gptgo.ai">🔮 Search+AI</div>
                </div>
                <hr class="divider">
                <div class="set-lbl">🎮 MINI GAMES</div>
                <div class="app-grid">
                    <div class="app-item" id="btn-open-snake"  style="background:linear-gradient(45deg,#ffea00,#ff9800);color:#000;border:none;">🐍 SNAKE</div>
                    <div class="app-item" id="btn-open-tetris" style="background:linear-gradient(45deg,#00c6ff,#0072ff);color:#fff;border:none;">🧱 TETRIS</div>
                    <div class="app-item" id="btn-open-xo"     style="background:linear-gradient(45deg,#f953c6,#b91d73);color:#fff;border:none;">🎮 X-O</div>
                </div>
            </div>

            <!-- ====== SETTINGS ====== -->
            <div id="t-set" class="content">

                <!-- ============================================
                     KEY & HẠN SỬ DỤNG
                     ============================================ -->
                <p class="set-lbl">🔑 KEY & HẠN SỬ DỤNG</p>
                <div class="key-info-card">

                    <!-- Trạng thái -->
                    <div class="key-info-row">
                        <span class="key-info-label">📡 TRẠNG THÁI</span>
                        <span id="display-status"><span class="status-badge status-locked">🔒 CHƯA KÍCH HOẠT</span></span>
                    </div>

                    <!-- HWID -->
                    <div class="key-info-row">
                        <span class="key-info-label">🖥️ HWID</span>
                        <span class="key-secret" id="display-hwid" title="Di chuột để hiện HWID">••••••••••••</span>
                    </div>

                    <!-- Key -->
                    <div class="key-info-row">
                        <span class="key-info-label">🔑 KEY</span>
                        <span class="key-secret" id="display-key" title="Di chuột để hiện Key">••••-••••-••••</span>
                    </div>

                    <!-- Thời điểm kích hoạt -->
                    <div class="key-info-row">
                        <span class="key-info-label">📅 KÍCH HOẠT LÚC</span>
                        <span class="key-value" id="display-activated" style="font-size:10px;">—</span>
                    </div>

                    <!-- Còn lại -->
                    <div class="key-info-row" style="border-bottom:none;">
                        <span class="key-info-label">⏳ CÒN LẠI</span>
                        <span id="display-expire" style="font-size:13px;font-weight:900;color:#555;font-family:'Courier New',monospace;">—</span>
                    </div>

                    <!-- Thanh tiến trình HSD -->
                    <div class="hsd-bar-wrap">
                        <div class="hsd-bar-header">
                            <span class="hsd-bar-label">⬛ Thời gian đã dùng</span>
                            <span class="hsd-bar-label">⬜ Còn lại</span>
                        </div>
                        <div class="hsd-bar-track">
                            <div id="key-expire-bar"></div>
                        </div>
                    </div>

                    <!-- Gợi ý hover -->
                    <div class="hover-hint">🖱️ Di chuột vào HWID / KEY để xem</div>

                    <!-- Nút hành động -->
                    <div class="key-action-row">
                        <button class="btn-copy-hwid" id="btn-copy-hwid">📋 SAO CHÉP HWID</button>
                        <button class="btn-revoke-key" id="btn-revoke-key">🗑️ XÓA KEY</button>
                    </div>
                </div>

                <hr class="divider">

                <!-- UI THEME -->
                <p class="set-lbl">🎨 GIAO DIỆN UI</p>
                <div class="ui-theme-grid">
                    <div id="btn-theme-default" class="ui-theme-card ${!isGP?'active-theme':''}">
                        <div class="theme-preview" style="background:linear-gradient(135deg,#1e2227,#252a31);border:1px solid #333;"></div>
                        <div class="theme-name" style="color:${!isGP?t.mc:'#888'};">⚡ Mặc định</div>
                    </div>
                    <div id="btn-theme-gp" class="ui-theme-card ${isGP?'active-theme':''}">
                        <canvas id="flag-preview-canvas" width="120" height="36" style="width:100%;height:36px;border-radius:6px;display:block;margin-bottom:8px;"></canvas>
                        <div class="theme-name" style="color:${isGP?'#FFD700':'#888'};">🔴 Cờ Giải Phóng</div>
                    </div>
                </div>

                <p class="set-lbl">🎨 MÀU CHỦ ĐẠO</p>
                <input type="color" id="c-pick" style="width:100%;height:35px;margin-bottom:14px;border-radius:8px;border:1px solid ${t.border};cursor:pointer;background:${t.bg2};" value="${config.mainColor}">

                <p class="set-lbl">🌓 GIAO DIỆN SÁNG/TỐI</p>
                <div style="display:flex;gap:8px;margin-bottom:14px;">
                    <div id="theme-dark"  class="theme-btn ${isDark?'theme-active':''}">🌙 Tối</div>
                    <div id="theme-light" class="theme-btn ${!isDark?'theme-active':''}">☀️ Sáng</div>
                </div>

                <p class="set-lbl">📐 CHIỀU RỘNG PANEL</p>
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:11px;">
                    <span style="color:#888;">Hẹp</span>
                    <span id="width-txt" style="color:${t.mc};font-weight:bold;">${config.width||350}px</span>
                    <span style="color:#888;">Rộng</span>
                </div>
                <input type="range" id="width-range" min="260" max="480" step="10" value="${config.width||350}">

                <p class="set-lbl">⌨️ PHÍM TẮT MỞ/ĐÓNG</p>
                <div id="hotkey-box" class="hotkey-box">
                    Nhấn để đổi phím: <span id="hotkey-val">${config.hotkey||'F2'}</span>
                </div>
                <div id="hotkey-hint" style="font-size:10px;color:#888;text-align:center;margin-bottom:14px;">
                    Click vào ô trên rồi nhấn phím bất kỳ
                </div>

                <p class="set-lbl">🧩 WIDGET & TÍNH NĂNG</p>
                <div style="background:${t.bg2};border:1px solid ${t.border};border-radius:10px;padding:10px 14px;margin-bottom:14px;">
                    <div class="toggle-row">
                        <div><div class="toggle-label">🖥️ System Monitor</div><div class="toggle-desc">Hiển thị CPU & RAM</div></div>
                        <label class="toggle"><input type="checkbox" id="tog-sysmon" ${config.showSysmon?'checked':''}><span class="toggle-slider"></span></label>
                    </div>
                    <div class="toggle-row">
                        <div><div class="toggle-label">🗺️ Mini-Map Video</div><div class="toggle-desc">Thanh timeline & câu hỏi</div></div>
                        <label class="toggle"><input type="checkbox" id="tog-minimap" ${config.showMinimap?'checked':''}><span class="toggle-slider"></span></label>
                    </div>
                    <div class="toggle-row">
                        <div><div class="toggle-label">🔔 Sound Alert</div><div class="toggle-desc">Bíp khi có câu hỏi</div></div>
                        <label class="toggle"><input type="checkbox" id="tog-sound" ${config.soundAlert?'checked':''}><span class="toggle-slider"></span></label>
                    </div>
                </div>

                <p class="set-lbl">👤 TÀI KHOẢN (Đăng nhập tự động)</p>
                <input type="text"     id="u-val" placeholder="Tài khoản..." value="${config.user||''}">
                <input type="password" id="p-val" placeholder="Mật khẩu..."  value="${config.pass||''}">
                <button class="btn btn-primary" id="btn-save" style="margin-top:12px;">💾 LƯU CẤU HÌNH</button>
                <button class="btn" id="clear-cache" style="border-color:#ff4d4d;color:#ff4d4d;margin-top:8px;">🧹 DỌN CACHE & FIX LAG</button>
            </div>

        </div>
        <div class="footer-info">
            <div>⚡ K12 Helper Pro v1.0</div>
            <div>📡 <span id="wifi-status">...</span></div>
        </div>
        `;
    };

    // Vẽ cờ Mặt Trận GP
    const renderFlagBg = (canvas) => {
        const ctx = canvas.getContext('2d');
        const W = canvas.width || 350, H = canvas.height || 60;
        canvas.width = W; canvas.height = H;
        ctx.fillStyle = '#005BBB'; ctx.fillRect(0, 0, W, H / 2);
        ctx.fillStyle = '#D62027'; ctx.fillRect(0, H / 2, W, H / 2);
        drawStar(ctx, W / 2, H / 2, Math.min(H * 0.42, 24), '#FFD700');
    };

    if (document.readyState === 'complete') init();
    else window.addEventListener('load', init);

    setTimeout(() => {
        const host = document.getElementById('k12-helper-root');
        if (!host || !host.shadowRoot) return;
        const shadow = host.shadowRoot;

        const previewCanvas = shadow.querySelector('#flag-preview-canvas');
        if (previewCanvas) {
            previewCanvas.width = 120; previewCanvas.height = 36;
            const ctx = previewCanvas.getContext('2d');
            ctx.fillStyle = '#005BBB'; ctx.fillRect(0, 0, 120, 18);
            ctx.fillStyle = '#D62027'; ctx.fillRect(0, 18, 120, 18);
            drawStar(ctx, 60, 18, 12, '#FFD700');
        }

        if (config.uiTheme === 'giaiphong') {
            const flagBg = shadow.querySelector('#flag-bg');
            if (flagBg) {
                const panel = shadow.querySelector('#dv-panel');
                flagBg.width = panel?.offsetWidth || 350;
                flagBg.height = 60;
                renderFlagBg(flagBg);
            }
        }
    }, 300);

    // ===================================================
    // === SNAKE GAME ====================================
    // ===================================================
    const SnakeApp = {
        panel:null, gameInterval:null, currentDir:'RIGHT', isDragging:false, offset:[0,0],
        createPanel() {
            if (document.getElementById('snake-game-panel')) return;
            this.panel = document.createElement('div'); this.panel.id = 'snake-game-panel';
            this.panel.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:420px;background:#1a1a1a;border:2px solid #ffea00;border-radius:12px;z-index:9999999;padding:15px;color:white;text-align:center;box-shadow:0 0 40px rgba(0,0,0,0.8);font-family:'Segoe UI',Tahoma,sans-serif;`;
            this.panel.innerHTML = `
                <div id="snake-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;cursor:move;padding:5px;border-bottom:1px solid #333;">
                    <span style="font-weight:bold;color:#ffea00;">🐍 SNAKE GAME</span>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span style="font-size:12px;">Best: <b id="snakeBest" style="color:#ffea00;">0</b></span>
                        <button id="close-snake" style="background:none;border:none;color:#ff4d4d;cursor:pointer;font-size:25px;line-height:1;">&times;</button>
                    </div>
                </div>
                <canvas id="snakeCanvas" width="400" height="400" style="background:#000;display:block;margin:0 auto;border:1px solid #333;border-radius:4px;"></canvas>
                <div style="margin-top:12px;display:flex;justify-content:space-around;align-items:center;">
                    <div>Score: <b id="snakeScore" style="color:#ffea00">0</b></div>
                    <button id="startSnake" style="background:#ffea00;color:#000;border:none;padding:8px 20px;border-radius:6px;cursor:pointer;font-weight:bold;">▶ START</button>
                    <div style="font-size:10px;color:#666;">← → ↑ ↓ để di chuyển</div>
                </div>`;
            document.body.appendChild(this.panel);
            const h = document.getElementById('snake-header');
            h.onmousedown = (e) => { this.isDragging=true; this.offset=[this.panel.offsetLeft-e.clientX,this.panel.offsetTop-e.clientY]; };
            document.addEventListener('mousemove',(e)=>{ if(this.isDragging){this.panel.style.left=(e.clientX+this.offset[0])+'px';this.panel.style.top=(e.clientY+this.offset[1])+'px';this.panel.style.transform='none';}});
            document.addEventListener('mouseup',()=>{this.isDragging=false;});
            document.getElementById('close-snake').onclick=()=>this.destroy();
            document.getElementById('startSnake').onclick=()=>this.startGame();
            this.keyHandler=(e)=>{if([37,38,39,40].includes(e.keyCode)){e.preventDefault();this.changeDirection(e.keyCode);}};
            document.addEventListener('keydown',this.keyHandler);
        },
        changeDirection(k){if(k===37&&this.currentDir!=='RIGHT')this.currentDir='LEFT';else if(k===38&&this.currentDir!=='DOWN')this.currentDir='UP';else if(k===39&&this.currentDir!=='LEFT')this.currentDir='RIGHT';else if(k===40&&this.currentDir!=='UP')this.currentDir='DOWN';},
        startGame(){
            const canvas=document.getElementById('snakeCanvas'),ctx=canvas.getContext('2d'),box=20;
            let snake=[{x:10*box,y:10*box}],food={x:Math.floor(Math.random()*19+1)*box,y:Math.floor(Math.random()*19+1)*box},score=0;
            this.currentDir='RIGHT'; if(this.gameInterval)clearInterval(this.gameInterval);
            document.getElementById('startSnake').innerText='↺ RESTART';
            this.gameInterval=setInterval(()=>{
                ctx.fillStyle='#0a0a0a';ctx.fillRect(0,0,400,400);
                snake.forEach((s,i)=>{ctx.fillStyle=i===0?'#ffea00':'#b8cc8e';ctx.fillRect(s.x+1,s.y+1,box-2,box-2);});
                ctx.fillStyle='#ff4d4d';ctx.beginPath();ctx.arc(food.x+box/2,food.y+box/2,box/2-1,0,Math.PI*2);ctx.fill();
                let sX=snake[0].x,sY=snake[0].y;
                if(this.currentDir==='LEFT')sX-=box;if(this.currentDir==='UP')sY-=box;if(this.currentDir==='RIGHT')sX+=box;if(this.currentDir==='DOWN')sY+=box;
                if(sX===food.x&&sY===food.y){score++;document.getElementById('snakeScore').innerText=score;food={x:Math.floor(Math.random()*19+1)*box,y:Math.floor(Math.random()*19+1)*box};}else snake.pop();
                const head={x:sX,y:sY};
                if(sX<0||sX>=400||sY<0||sY>=400||snake.some(s=>s.x===head.x&&s.y===head.y)){
                    clearInterval(this.gameInterval);
                    const best=parseInt(document.getElementById('snakeBest').innerText)||0;
                    if(score>best)document.getElementById('snakeBest').innerText=score;
                    ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,150,400,100);
                    ctx.fillStyle='#ff4d4d';ctx.font='bold 28px Segoe UI';ctx.textAlign='center';ctx.fillText('GAME OVER',200,195);
                    ctx.fillStyle='#ffea00';ctx.font='16px Segoe UI';ctx.fillText('Score: '+score,200,225);
                    return;}
                snake.unshift(head);
            },120);
        },
        destroy(){if(this.gameInterval)clearInterval(this.gameInterval);document.removeEventListener('keydown',this.keyHandler);if(this.panel)this.panel.remove();this.panel=null;}
    };

    // ===================================================
    // === TETRIS GAME ===================================
    // ===================================================
    const TetrisApp = {
        panel:null,gameInterval:null,isDragging:false,offset:[0,0],board:[],currentPiece:null,nextPiece:null,score:0,linesCleared:0,gameRunning:false,
        COLS:10,ROWS:20,BLOCK:24,
        PIECES:[{shape:[[1,1,1,1]],color:'#00f5ff'},{shape:[[1,1],[1,1]],color:'#ffea00'},{shape:[[0,1,0],[1,1,1]],color:'#c800ff'},{shape:[[1,0,0],[1,1,1]],color:'#ff9800'},{shape:[[0,0,1],[1,1,1]],color:'#4a9eff'},{shape:[[0,1,1],[1,1,0]],color:'#00ff88'},{shape:[[1,1,0],[0,1,1]],color:'#ff4d4d'}],
        createPanel(){
            if(document.getElementById('tetris-panel'))return;
            this.panel=document.createElement('div');this.panel.id='tetris-panel';
            this.panel.style.cssText=`position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:320px;background:#1a1a1a;border:2px solid #00c6ff;border-radius:12px;z-index:9999999;padding:15px;color:white;text-align:center;box-shadow:0 0 40px rgba(0,198,255,0.4);font-family:'Segoe UI',Tahoma,sans-serif;user-select:none;`;
            this.panel.innerHTML=`<div id="tetris-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;cursor:move;padding:5px;border-bottom:1px solid #333;"><span style="font-weight:bold;color:#00c6ff;">🧱 TETRIS</span><button id="close-tetris" style="background:none;border:none;color:#ff4d4d;cursor:pointer;font-size:25px;line-height:1;">&times;</button></div><div style="display:flex;gap:10px;justify-content:center;align-items:flex-start;"><canvas id="tetrisCanvas" width="${this.COLS*this.BLOCK}" height="${this.ROWS*this.BLOCK}" style="background:#0a0a0a;border:1px solid #333;border-radius:4px;display:block;"></canvas><div style="display:flex;flex-direction:column;gap:8px;min-width:70px;"><div style="background:#252a31;border-radius:8px;padding:8px;font-size:10px;color:#888;">NEXT</div><canvas id="tetrisNext" width="80" height="80" style="background:#0a0a0a;border:1px solid #333;border-radius:4px;"></canvas><div style="background:#252a31;border-radius:8px;padding:8px;"><div style="font-size:10px;color:#888;">SCORE</div><div id="tetrisScore" style="font-size:20px;font-weight:bold;color:#00c6ff;">0</div></div><div style="background:#252a31;border-radius:8px;padding:8px;"><div style="font-size:10px;color:#888;">LINES</div><div id="tetrisLines" style="font-size:20px;font-weight:bold;color:#00ff88;">0</div></div><button id="startTetris" style="background:#00c6ff;color:#000;border:none;padding:8px;border-radius:6px;cursor:pointer;font-weight:bold;font-size:12px;">START</button><div style="font-size:9px;color:#555;line-height:1.8;">← → Di chuyển<br>↑ Xoay<br>↓ Nhanh<br>Space Rơi ngay</div></div></div>`;
            document.body.appendChild(this.panel);
            const h=document.getElementById('tetris-header');h.onmousedown=(e)=>{this.isDragging=true;this.offset=[this.panel.offsetLeft-e.clientX,this.panel.offsetTop-e.clientY];};
            document.addEventListener('mousemove',(e)=>{if(this.isDragging){this.panel.style.left=(e.clientX+this.offset[0])+'px';this.panel.style.top=(e.clientY+this.offset[1])+'px';this.panel.style.transform='none';}});
            document.addEventListener('mouseup',()=>{this.isDragging=false;});
            document.getElementById('close-tetris').onclick=()=>this.destroy();document.getElementById('startTetris').onclick=()=>this.startGame();
            this.keyHandler=(e)=>{if(!this.gameRunning)return;if([37,38,39,40,32].includes(e.keyCode))e.preventDefault();if(e.keyCode===37)this.move(-1,0);if(e.keyCode===39)this.move(1,0);if(e.keyCode===40)this.move(0,1);if(e.keyCode===38)this.rotate();if(e.keyCode===32)this.hardDrop();};
            document.addEventListener('keydown',this.keyHandler);
        },
        initBoard(){this.board=Array.from({length:this.ROWS},()=>Array(this.COLS).fill(0));},
        randomPiece(){const p=this.PIECES[Math.floor(Math.random()*this.PIECES.length)];return{shape:p.shape.map(r=>[...r]),color:p.color,x:Math.floor(this.COLS/2)-Math.floor(p.shape[0].length/2),y:0};},
        validMove(piece,dx,dy,shape){const s=shape||piece.shape;for(let r=0;r<s.length;r++)for(let c=0;c<s[r].length;c++){if(!s[r][c])continue;const nx=piece.x+c+dx,ny=piece.y+r+dy;if(nx<0||nx>=this.COLS||ny>=this.ROWS)return false;if(ny>=0&&this.board[ny][nx])return false;}return true;},
        move(dx,dy){if(this.validMove(this.currentPiece,dx,dy)){this.currentPiece.x+=dx;this.currentPiece.y+=dy;this.draw();return true;}return false;},
        rotate(){const s=this.currentPiece.shape;const r=s[0].map((_,i)=>s.map(row=>row[i]).reverse());if(this.validMove(this.currentPiece,0,0,r)){this.currentPiece.shape=r;this.draw();}},
        hardDrop(){while(this.move(0,1)){}this.lockPiece();},
        lockPiece(){const p=this.currentPiece;p.shape.forEach((row,r)=>{row.forEach((val,c)=>{if(val)this.board[p.y+r][p.x+c]=p.color;});});this.clearLines();this.currentPiece=this.nextPiece;this.nextPiece=this.randomPiece();this.drawNext();if(!this.validMove(this.currentPiece,0,0)){clearInterval(this.gameInterval);this.gameRunning=false;setTimeout(()=>alert('GAME OVER!\nScore: '+this.score+'\nLines: '+this.linesCleared),100);}this.draw();},
        clearLines(){let cleared=0;for(let r=this.ROWS-1;r>=0;r--){if(this.board[r].every(c=>c!==0)){this.board.splice(r,1);this.board.unshift(Array(this.COLS).fill(0));cleared++;r++;}}if(cleared>0){const pts=[0,100,300,500,800];this.score+=pts[cleared]||800;this.linesCleared+=cleared;document.getElementById('tetrisScore').innerText=this.score;document.getElementById('tetrisLines').innerText=this.linesCleared;}},
        draw(){const canvas=document.getElementById('tetrisCanvas');if(!canvas)return;const ctx=canvas.getContext('2d');const B=this.BLOCK;ctx.fillStyle='#0a0a0a';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='#111';ctx.lineWidth=0.5;for(let r=0;r<this.ROWS;r++)for(let c=0;c<this.COLS;c++)ctx.strokeRect(c*B,r*B,B,B);this.board.forEach((row,r)=>{row.forEach((color,c)=>{if(color){ctx.fillStyle=color;ctx.fillRect(c*B+1,r*B+1,B-2,B-2);ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(c*B+1,r*B+1,B-2,4);}});});if(this.currentPiece){let ghost={...this.currentPiece,shape:this.currentPiece.shape.map(r=>[...r])};while(this.validMove(ghost,0,1))ghost.y++;ghost.shape.forEach((row,r)=>{row.forEach((val,c)=>{if(val){ctx.fillStyle='rgba(255,255,255,0.07)';ctx.fillRect((ghost.x+c)*B+1,(ghost.y+r)*B+1,B-2,B-2);}});});this.currentPiece.shape.forEach((row,r)=>{row.forEach((val,c)=>{if(val){ctx.fillStyle=this.currentPiece.color;ctx.fillRect((this.currentPiece.x+c)*B+1,(this.currentPiece.y+r)*B+1,B-2,B-2);ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fillRect((this.currentPiece.x+c)*B+1,(this.currentPiece.y+r)*B+1,B-2,4);}});});}},
        drawNext(){const canvas=document.getElementById('tetrisNext');if(!canvas||!this.nextPiece)return;const ctx=canvas.getContext('2d');ctx.fillStyle='#0a0a0a';ctx.fillRect(0,0,80,80);const B=16,s=this.nextPiece.shape,ox=Math.floor((5-s[0].length)/2),oy=Math.floor((5-s.length)/2);s.forEach((row,r)=>{row.forEach((val,c)=>{if(val){ctx.fillStyle=this.nextPiece.color;ctx.fillRect((ox+c)*B+1,(oy+r)*B+1,B-2,B-2);}});});},
        startGame(){this.initBoard();this.score=0;this.linesCleared=0;this.gameRunning=true;document.getElementById('tetrisScore').innerText='0';document.getElementById('tetrisLines').innerText='0';document.getElementById('startTetris').innerText='↺ RESTART';this.currentPiece=this.randomPiece();this.nextPiece=this.randomPiece();this.drawNext();if(this.gameInterval)clearInterval(this.gameInterval);this.gameInterval=setInterval(()=>{if(!this.move(0,1))this.lockPiece();},500);this.draw();},
        destroy(){if(this.gameInterval)clearInterval(this.gameInterval);document.removeEventListener('keydown',this.keyHandler);if(this.panel)this.panel.remove();this.panel=null;this.gameRunning=false;}
    };

    // ===================================================
    // === X-O GAME ======================================
    // ===================================================
    const XOApp = {
        panel:null,isDragging:false,offset:[0,0],board:[],playerTurn:true,gameOver:false,playerScore:0,botScore:0,drawScore:0,difficulty:'hard',
        createPanel(){
            if(document.getElementById('xo-panel'))return;
            this.panel=document.createElement('div');this.panel.id='xo-panel';
            this.panel.style.cssText=`position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:340px;background:#1a1a1a;border:2px solid #f953c6;border-radius:12px;z-index:9999999;padding:15px;color:white;text-align:center;box-shadow:0 0 40px rgba(249,83,198,0.4);font-family:'Segoe UI',Tahoma,sans-serif;user-select:none;`;
            this.panel.innerHTML=`<div id="xo-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;cursor:move;padding:5px;border-bottom:1px solid #333;"><span style="font-weight:bold;color:#f953c6;">🎮 X-O vs BOT</span><button id="close-xo" style="background:none;border:none;color:#ff4d4d;cursor:pointer;font-size:25px;line-height:1;">&times;</button></div><div style="display:flex;justify-content:center;gap:8px;margin-bottom:10px;"><button id="diff-easy" style="flex:1;padding:6px;background:#252a31;border:1px solid #555;border-radius:6px;color:#fff;cursor:pointer;font-size:11px;font-weight:bold;">😊 DỄ</button><button id="diff-hard" style="flex:1;padding:6px;background:#f953c6;border:1px solid #f953c6;border-radius:6px;color:#fff;cursor:pointer;font-size:11px;font-weight:bold;">🤖 KHÓ</button></div><div style="display:flex;justify-content:space-around;margin-bottom:12px;background:#252a31;border-radius:8px;padding:8px;"><div style="text-align:center;"><div style="font-size:22px;">❌</div><div style="font-size:10px;color:#888;">BẠN</div><div id="xo-score-p" style="font-size:20px;font-weight:bold;color:#ff4d4d;">0</div></div><div style="text-align:center;"><div style="font-size:22px;">🤝</div><div style="font-size:10px;color:#888;">HÒA</div><div id="xo-score-d" style="font-size:20px;font-weight:bold;color:#ffea00;">0</div></div><div style="text-align:center;"><div style="font-size:22px;">⭕</div><div style="font-size:10px;color:#888;">BOT</div><div id="xo-score-b" style="font-size:20px;font-weight:bold;color:#4a9eff;">0</div></div></div><div id="xo-status" style="margin-bottom:10px;font-size:14px;font-weight:bold;color:#f953c6;min-height:20px;">Lượt của bạn (❌)</div><div id="xo-board" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px;"></div><button id="xo-restart" style="width:100%;padding:10px;background:linear-gradient(45deg,#f953c6,#b91d73);color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:bold;font-size:13px;">🔄 CHƠI LẠI</button>`;
            document.body.appendChild(this.panel);
            const h=document.getElementById('xo-header');h.onmousedown=(e)=>{this.isDragging=true;this.offset=[this.panel.offsetLeft-e.clientX,this.panel.offsetTop-e.clientY];};
            document.addEventListener('mousemove',(e)=>{if(this.isDragging){this.panel.style.left=(e.clientX+this.offset[0])+'px';this.panel.style.top=(e.clientY+this.offset[1])+'px';this.panel.style.transform='none';}});
            document.addEventListener('mouseup',()=>{this.isDragging=false;});
            document.getElementById('close-xo').onclick=()=>this.destroy();
            document.getElementById('xo-restart').onclick=()=>this.newGame();
            document.getElementById('diff-easy').onclick=()=>{this.difficulty='easy';document.getElementById('diff-easy').style.background='#f953c6';document.getElementById('diff-easy').style.borderColor='#f953c6';document.getElementById('diff-hard').style.background='#252a31';document.getElementById('diff-hard').style.borderColor='#555';this.newGame();};
            document.getElementById('diff-hard').onclick=()=>{this.difficulty='hard';document.getElementById('diff-hard').style.background='#f953c6';document.getElementById('diff-hard').style.borderColor='#f953c6';document.getElementById('diff-easy').style.background='#252a31';document.getElementById('diff-easy').style.borderColor='#555';this.newGame();};
            this.newGame();
        },
        newGame(){this.board=Array(9).fill('');this.playerTurn=true;this.gameOver=false;this.renderBoard();this.setStatus('Lượt của bạn (❌)');},
        renderBoard(){const boardEl=document.getElementById('xo-board');if(!boardEl)return;boardEl.innerHTML='';this.board.forEach((val,i)=>{const cell=document.createElement('div');cell.style.cssText=`width:100%;padding-top:100%;position:relative;background:#252a31;border:2px solid #333;border-radius:10px;cursor:${(!val&&!this.gameOver&&this.playerTurn)?'pointer':'default'};transition:all 0.15s;`;const inner=document.createElement('div');inner.style.cssText=`position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:900;line-height:1;`;if(val==='X'){inner.innerText='❌';cell.style.borderColor='#ff4d4d';}else if(val==='O'){inner.innerText='⭕';cell.style.borderColor='#4a9eff';}if(!val&&!this.gameOver&&this.playerTurn){cell.onmouseenter=()=>cell.style.background='#2e3540';cell.onmouseleave=()=>cell.style.background='#252a31';cell.onclick=()=>this.playerMove(i);}cell.appendChild(inner);boardEl.appendChild(cell);});},
        setStatus(msg){const el=document.getElementById('xo-status');if(el)el.innerText=msg;},
        playerMove(i){if(this.board[i]||this.gameOver||!this.playerTurn)return;this.board[i]='X';this.playerTurn=false;this.renderBoard();const win=this.checkWin('X');if(win){this.highlightWin(win);this.playerScore++;document.getElementById('xo-score-p').innerText=this.playerScore;this.setStatus('🎉 BẠN THẮNG!');this.gameOver=true;return;}if(this.board.every(c=>c)){this.drawScore++;document.getElementById('xo-score-d').innerText=this.drawScore;this.setStatus('🤝 HÒA!');this.gameOver=true;return;}this.setStatus('🤖 Bot đang suy nghĩ...');setTimeout(()=>this.botMove(),400);},
        botMove(){if(this.gameOver)return;let move;if(this.difficulty==='easy'){const empty=this.board.map((v,i)=>v?null:i).filter(v=>v!==null);move=empty[Math.floor(Math.random()*empty.length)];}else{move=this.minimax(this.board,'O',0).index;}if(move===undefined||move===null)return;this.board[move]='O';this.playerTurn=true;this.renderBoard();const win=this.checkWin('O');if(win){this.highlightWin(win);this.botScore++;document.getElementById('xo-score-b').innerText=this.botScore;this.setStatus('😢 BOT THẮNG!');this.gameOver=true;return;}if(this.board.every(c=>c)){this.drawScore++;document.getElementById('xo-score-d').innerText=this.drawScore;this.setStatus('🤝 HÒA!');this.gameOver=true;return;}this.setStatus('Lượt của bạn (❌)');},
        minimax(board,player,depth){const win=this.checkWin('O',board);if(win)return{score:10-depth};const lose=this.checkWin('X',board);if(lose)return{score:depth-10};const empty=board.map((v,i)=>v?null:i).filter(v=>v!==null);if(empty.length===0)return{score:0};const moves=[];for(const i of empty){const nb=[...board];nb[i]=player;const result=this.minimax(nb,player==='O'?'X':'O',depth+1);moves.push({index:i,score:result.score});}if(player==='O')return moves.reduce((best,m)=>m.score>best.score?m:best,{score:-Infinity});else return moves.reduce((best,m)=>m.score<best.score?m:best,{score:Infinity});},
        checkWin(player,board){const b=board||this.board;const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];for(const line of lines)if(line.every(i=>b[i]===player))return line;return null;},
        highlightWin(line){const boardEl=document.getElementById('xo-board');if(!boardEl)return;const cells=boardEl.children;line.forEach(i=>{if(cells[i]){cells[i].style.background='rgba(249,83,198,0.25)';cells[i].style.borderColor='#f953c6';}});},
        destroy(){if(this.panel)this.panel.remove();this.panel=null;}
    };

})();
