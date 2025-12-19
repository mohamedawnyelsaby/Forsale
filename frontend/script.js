/* Global Variables */
:root {
  --primary: #FFD700;
  --accent: #00f2ff;
  --glass-bg: rgba(255,255,255,0.05);
  --glass-border: rgba(255,255,255,0.1);
  --text-main: #ffffff;
  --text-muted: #a0a0a0;
  --radius: 14px;
  --bg-dark: #0a1128;
  --success-color: #2ECC71;
  --danger: #FF5252;
  --pi-purple: #9453A9;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  width: 100%; max-width: 100vw; overflow-x: hidden;
  background: radial-gradient(circle at top left, #1a2e44 0%, #000 100%);
  font-family: 'Segoe UI', Tahoma, sans-serif;
  color: var(--text-main);
  min-height: 100vh;
}

body { padding-top: 80px; padding-bottom: 70px; }

.content-wrapper {
  padding: 0 15px;
  width: 100%;
  margin: 0 auto;
}

.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
}

/* Auth Container */
#auth-container {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle, #1a2e44 0%, #000 100%);
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 20px; z-index: 2000;
}

.auth-logo {
  font-size: 35px; font-weight: 900; color: var(--primary);
  margin-bottom: 10px;
}

.auth-card {
  background: var(--glass-bg); backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border); border-radius: var(--radius);
  padding: 25px; width: 100%; max-width: 400px; text-align: center;
}

.input-group {
  position: relative; margin-bottom: 15px;
}

.input-group input {
  width: 100%; padding: 12px 45px 12px 15px;
  border-radius: 50px; border: 1px solid var(--glass-border);
  background: rgba(255,255,255,0.05); color: white; font-size: 14px;
}

.input-group i {
  position: absolute; right: 15px; top: 14px; color: var(--accent);
}

.main-btn {
  width: 100%; padding: 14px; border-radius: 50px; border: none;
  background: var(--primary); color: black; font-weight: 700;
  font-size: 16px; cursor: pointer; margin-top: 10px;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  transition: transform 0.3s;
}

.main-btn:hover { transform: translateY(-2px); }

.pi-btn {
  background: linear-gradient(90deg, var(--pi-purple), #612F74);
  color: white;
}

.fingerprint-scan {
  font-size: 40px; color: var(--accent); margin: 20px 0;
  cursor: pointer; animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

/* Header */
.fixed-header-wrapper {
  position: fixed; top: 0; left: 0; width: 100%; z-index: 100;
}

.header {
  padding: 15px 0; background: rgba(10,17,40,0.95);
  border-bottom: 1px solid var(--glass-border);
}

.header .content-wrapper {
  display: flex; justify-content: space-between; align-items: center;
}

.logo {
  font-size: 22px; font-weight: 900; color: var(--primary);
  display: flex; align-items: center; gap: 8px;
}

.ai-badge {
  font-size: 10px; background: var(--accent); color: var(--bg-dark);
  padding: 2px 6px; border-radius: 4px; font-weight: bold;
}

.icon-btn {
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  color: white; width: 35px; height: 35px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: 0.2s;
}

.icon-btn.primary { background: var(--primary); color: black; }

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px; width: 100%;
}

.product-card {
  overflow: hidden; display: flex; flex-direction: column;
  cursor: pointer; transition: 0.2s;
}

.product-card:hover { transform: translateY(-3px); }

.p-img-box {
  width: 100%; height: 140px; background: #000; position: relative;
}

.p-img-box img { width: 100%; height: 100%; object-fit: cover; }

.ai-tag {
  position: absolute; top: 8px; left: 8px;
  background: rgba(0,0,0,0.7); color: var(--accent);
  font-size: 10px; padding: 3px 8px; border-radius: 4px;
  border: 1px solid var(--accent);
}

.p-details { padding: 10px; }

.p-name {
  font-size: 13px; font-weight: bold;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.p-price {
  color: var(--primary); font-weight: bold; font-size: 15px;
}

/* Modals */
#product-detail-modal, #checkoutModal, #settingsModal, #ordersModal,
#walletModal, #notificationsModal, #ai-upload-modal {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: var(--bg-dark); z-index: 200; overflow-y: auto;
  display: none; padding-bottom: 140px;
}

#logyAiModal {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: var(--bg-dark); z-index: 600; display: none;
  flex-direction: column;
}

.detail-header {
  position: sticky; top: 0; background: rgba(10,17,40,0.95);
  padding: 15px; z-index: 10; display: flex;
  justify-content: space-between; align-items: center;
  border-bottom: 1px solid var(--glass-border);
}

.detail-img { width: 100%; height: 200px; object-fit: cover; margin-bottom: 15px; }

.detail-title { font-size: 24px; font-weight: 700; margin-bottom: 5px; }

.detail-price { font-size: 28px; color: var(--primary); font-weight: 900; }

.ai-section-title {
  font-size: 16px; font-weight: bold; color: var(--accent);
  margin: 20px 0 10px; display: flex; align-items: center; gap: 8px;
}

.ai-price-card {
  padding: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;
}

.stat-box {
  text-align: center; padding: 10px; border-radius: 8px;
  border: 1px solid var(--glass-border); background: rgba(255,255,255,0.03);
}

.stat-box .value { font-size: 20px; font-weight: bold; margin-bottom: 3px; }

.stat-box .label { font-size: 11px; color: var(--text-muted); }

.buy-fixed-bar {
  position: fixed; bottom: 60px; width: 100%;
  background: rgba(10,17,40,0.95); backdrop-filter: blur(10px);
  padding: 10px 0; z-index: 20; border-top: 1px solid var(--glass-border);
}

.buy-btn {
  width: 100%; padding: 15px; border: none; border-radius: 50px;
  background: var(--primary); color: black; font-weight: bold;
  font-size: 16px; cursor: pointer; display: flex;
  justify-content: center; align-items: center; gap: 10px;
  transition: 0.2s;
}

.buy-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Settings */
.settings-group {
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  border-radius: var(--radius); padding: 15px; margin-bottom: 15px;
}

.settings-group h4 {
  color: var(--primary); margin-top: 0; margin-bottom: 15px;
  font-size: 16px; display: flex; align-items: center; gap: 8px;
}

/* Tabs */
.detail-tabs-container { padding: 15px; margin-top: 20px; }

.detail-tabs-scroll {
  display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px;
  margin-bottom: 15px; border-bottom: 1px solid var(--glass-border);
}

.detail-tab-item {
  padding: 10px 18px; border-radius: 25px;
  background: rgba(255,255,255,0.08); border: 1px solid transparent;
  font-size: 13px; color: var(--text-muted); cursor: pointer;
  transition: 0.3s; display: flex; align-items: center; gap: 8px;
}

.detail-tab-item.active {
  background: var(--primary); color: #000; font-weight: bold;
}

/* Footer Nav */
.footer-nav {
  position: fixed; bottom: 0; left: 0; width: 100%; height: 60px;
  background: rgba(10,17,40,0.95); backdrop-filter: blur(10px);
  border-top: 1px solid var(--glass-border); z-index: 500;
  display: flex; justify-content: space-around; align-items: center;
}

.nav-item {
  display: flex; flex-direction: column; align-items: center;
  color: var(--text-muted); font-size: 11px; cursor: pointer;
  transition: 0.2s; padding: 5px 0; min-width: 60px;
}

.nav-item i { font-size: 18px; margin-bottom: 3px; }

.nav-item.active { color: var(--primary); }

/* Chat */
.logy-chat-header {
  padding: 15px; background: rgba(10,17,40,0.95);
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid var(--glass-border);
}

.logy-chat-area {
  flex-grow: 1; padding: 15px; overflow-y: auto;
  display: flex; flex-direction: column; gap: 10px;
}

.logy-input-bar {
  padding: 10px 15px; background: rgba(10,17,40,0.95);
  border-top: 1px solid var(--glass-border);
  display: flex; gap: 10px; align-items: center;
}

.logy-input-bar input {
  flex-grow: 1; padding: 10px; border-radius: 20px;
  border: 1px solid var(--glass-border);
  background: rgba(255,255,255,0.05); color: white; font-size: 14px;
}

.logy-send-btn {
  background: var(--primary); color: black; width: 40px; height: 40px;
  border-radius: 50%; display: flex; align-items: center;
  justify-content: center; cursor: pointer;
}
