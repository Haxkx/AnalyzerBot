(() => {
  // ---- Configuration ----
  const STORAGE_KEY = "license_verified";
  const LICENSE_KEY_STORE = "license_key";
  const DEVICE_ID_STORE = "device_id";
  const FIREBASE_URL = "https://botproxcaptain-default-rtdb.firebaseio.com/users.json";
  const FIREBASE_USER_URL = "https://botproxcaptain-default-rtdb.firebaseio.com/users";
  
  // ---- Helper Functions ----
  function setVerified(val) {
    localStorage.setItem(STORAGE_KEY, val ? "1" : "");
  }
  
  function isVerified() {
    return localStorage.getItem(STORAGE_KEY) === "1";
  }
  
  function setLicenseKey(key) {
    if (key) localStorage.setItem(LICENSE_KEY_STORE, key);
    else localStorage.removeItem(LICENSE_KEY_STORE);
  }
  
  function getLicenseKey() {
    return localStorage.getItem(LICENSE_KEY_STORE) || "";
  }
  
  function getDeviceId() {
    let id = localStorage.getItem(DEVICE_ID_STORE);
    if (!id) {
      id = 'device-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now();
      localStorage.setItem(DEVICE_ID_STORE, id);
    }
    return id;
  }
  
  function getDaysRemaining(expiryDate) {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  // ---- UI Functions ----
  function injectStyles() {
    if (document.getElementById("licenseStyles")) return;
    
    const style = document.createElement('style');
    style.id = "licenseStyles";
    style.textContent = `
      #licenseOverlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(135deg, #0e1627 0%, #1a243a 100%);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        padding: 20px;
      }
      
      .license-container {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(20px);
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        padding: 40px;
        width: 100%;
        max-width: 500px;
        text-align: center;
        border: 1px solid rgba(255, 255, 255, 0.1);
        position: relative;
        overflow: hidden;
        animation: fadeInUp 0.6s ease-out;
      }
      
      .license-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #3b82f6, #10b981, #f59e0b);
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .license-title {
        color: #3b82f6;
        margin-bottom: 10px;
        font-size: 2rem;
        font-weight: 700;
      }
      
      .license-subtitle {
        color: #94a3b8;
        margin-bottom: 30px;
        font-size: 1.1rem;
      }
      
      .input-group {
        margin-bottom: 25px;
        text-align: left;
      }
      
      .input-label {
        display: block;
        margin-bottom: 8px;
        color: #cbd5e1;
        font-weight: 500;
      }
      
      .license-input {
        width: 100%;
        padding: 15px;
        border: 2px solid #334155;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.08);
        color: #f1f5f9;
        font-size: 1rem;
        transition: all 0.3s ease;
        box-sizing: border-box;
      }
      
      .license-input:focus {
        border-color: #3b82f6;
        outline: none;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      
      .license-btn {
        width: 100%;
        padding: 15px;
        border: none;
        border-radius: 10px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 15px;
        position: relative;
        overflow: hidden;
      }
      
      .license-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: 0.5s;
      }
      
      .license-btn:hover::before {
        left: 100%;
      }
      
      .btn-verify {
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
      }
      
      .btn-verify:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
      }
      
      .btn-contact {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
      }
      
      .btn-contact:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4);
      }
      
      .btn-tiktok {
        background: linear-gradient(135deg, #000000, #434343);
        color: white;
      }
      
      .btn-tiktok:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
      }
      
      .message-box {
        margin-top: 20px;
        padding: 15px;
        border-radius: 10px;
        font-weight: 500;
        display: none;
        animation: fadeIn 0.3s ease;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .message-success {
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid #10b981;
        color: #10b981;
      }
      
      .message-error {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid #ef4444;
        color: #ef4444;
      }
      
      .message-warning {
        background: rgba(245, 158, 11, 0.1);
        border: 1px solid #f59e0b;
        color: #f59e0b;
      }
      
      .license-info {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        padding: 20px;
        margin-top: 20px;
        text-align: left;
        display: none;
      }
      
      .info-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .info-label {
        color: #94a3b8;
        font-weight: 500;
      }
      
      .info-value {
        color: #f1f5f9;
        font-weight: 600;
      }
      
      .welcome-animation {
        animation: welcomePulse 2s ease-in-out;
      }
      
      @keyframes welcomePulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
      }
      
      .contact-buttons {
        display: flex;
        gap: 10px;
        margin-top: 20px;
      }
      
      .contact-buttons .license-btn {
        flex: 1;
        margin-bottom: 0;
      }
      
      @media (max-width: 600px) {
        .license-container {
          padding: 30px 20px;
        }
        
        .contact-buttons {
          flex-direction: column;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  function showLicenseUI() {
    if (document.getElementById('licenseOverlay')) return;
    
    injectStyles();
    
    const overlay = document.createElement('div');
    overlay.id = 'licenseOverlay';
    overlay.innerHTML = `
      <div class="license-container">
        <h1 class="license-title">License Verification</h1>
        <p class="license-subtitle">Enter your license key to access the application</p>
        
        <div class="input-group">
          <label class="input-label" for="licenseInput">License Key</label>
          <input 
            type="text" 
            id="licenseInput" 
            class="license-input" 
            placeholder="Enter your license key"
            autocomplete="off"
          >
        </div>
        
        <button class="license-btn btn-verify" id="verifyBtn">
          Verify License
        </button>
        
        <div class="contact-buttons">
          <button class="license-btn btn-contact" id="telegramBtn">
            Telegram
          </button>
          <button class="license-btn btn-tiktok" id="tiktokBtn">
            TikTok
          </button>
        </div>
        
        <div id="messageBox" class="message-box"></div>
        
        <div id="licenseInfo" class="license-info">
          <h3 style="color: #3b82f6; margin-bottom: 15px; text-align: center;">License Information</h3>
          <div class="info-item">
            <span class="info-label">User Name:</span>
            <span class="info-value" id="infoName">-</span>
          </div>
          <div class="info-item">
            <span class="info-label">Days Remaining:</span>
            <span class="info-value" id="infoDays">-</span>
          </div>
          <div class="info-item">
            <span class="info-label">Device Limit:</span>
            <span class="info-value" id="infoLimit">-</span>
          </div>
          <div class="info-item">
            <span class="info-label">Active Devices:</span>
            <span class="info-value" id="infoActive">-</span>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Event Listeners
    document.getElementById('verifyBtn').addEventListener('click', verifyLicense);
    document.getElementById('telegramBtn').addEventListener('click', () => {
      window.open('https://t.me/your_developer_username', '_blank');
    });
    document.getElementById('tiktokBtn').addEventListener('click', () => {
      window.open('https://tiktok.com/@your_developer_id', '_blank');
    });
    
    // Enter key support
    document.getElementById('licenseInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        verifyLicense();
      }
    });
  }
  
  function showMessage(message, type = 'info') {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
    messageBox.className = `message-box message-${type}`;
    messageBox.style.display = 'block';
  }
  
  function hideMessage() {
    const messageBox = document.getElementById('messageBox');
    messageBox.style.display = 'none';
  }
  
  function showLicenseInfo(userData) {
    const infoBox = document.getElementById('licenseInfo');
    const daysRemaining = getDaysRemaining(userData.expiryDate);
    
    document.getElementById('infoName').textContent = userData.name || 'User';
    document.getElementById('infoDays').textContent = daysRemaining > 0 ? daysRemaining : 'Expired';
    document.getElementById('infoLimit').textContent = userData.deviceLimit || 1;
    
    const activeDevices = userData.devices ? Object.keys(userData.devices).length : 0;
    document.getElementById('infoActive').textContent = activeDevices;
    
    infoBox.style.display = 'block';
  }
  
  // ---- License Verification Logic ----
  async function verifyLicense() {
    const licenseInput = document.getElementById('licenseInput');
    const verifyBtn = document.getElementById('verifyBtn');
    const licenseKey = licenseInput.value.trim();
    
    if (!licenseKey) {
      showMessage('Please enter your license key', 'error');
      return;
    }
    
    // Show loading state
    verifyBtn.textContent = 'Verifying...';
    verifyBtn.disabled = true;
    hideMessage();
    
    try {
      const response = await fetch(FIREBASE_URL);
      const users = await response.json();
      
      if (!users) {
        showMessage('No users found in database', 'error');
        return;
      }
      
      let userFound = null;
      let userUid = null;
      
      // Find user with matching license key
      for (const uid in users) {
        const user = users[uid];
        if (user.licenseKey && user.licenseKey.trim() === licenseKey) {
          userFound = user;
          userUid = uid;
          break;
        }
      }
      
      if (!userFound) {
        showMessage('Invalid license key. Please check and try again.', 'error');
        setVerified(false);
        setLicenseKey('');
        return;
      }
      
      // Check license status
      if (userFound.status !== 'Active') {
        showMessage('Your license is blocked or inactive.', 'error');
        setVerified(false);
        setLicenseKey('');
        return;
      }
      
      // Check expiration
      const daysRemaining = getDaysRemaining(userFound.expiryDate);
      if (daysRemaining <= 0) {
        showMessage('Your license has expired. Please renew.', 'error');
        setVerified(false);
        setLicenseKey('');
        return;
      }
      
      // Device limit check
      const deviceId = getDeviceId();
      const deviceLimit = userFound.deviceLimit || 1;
      const currentDevices = userFound.devices ? Object.keys(userFound.devices) : [];
      
      // Check if device is already registered
      const isDeviceRegistered = currentDevices.includes(deviceId);
      
      if (!isDeviceRegistered) {
        // Check if device limit reached
        if (currentDevices.length >= deviceLimit) {
          // Block the license if someone tries to exceed device limit
          await fetch(`${FIREBASE_USER_URL}/${userUid}/status.json`, {
            method: 'PUT',
            body: JSON.stringify('Blocked')
          });
          
          showMessage('Device limit exceeded! License has been blocked. Contact support.', 'error');
          setVerified(false);
          setLicenseKey('');
          return;
        }
        
        // Register new device
        await fetch(`${FIREBASE_USER_URL}/${userUid}/devices/${deviceId}.json`, {
          method: 'PUT',
          body: JSON.stringify({
            registered: new Date().toISOString(),
            lastActive: new Date().toISOString()
          })
        });
      } else {
        // Update last active time for existing device
        await fetch(`${FIREBASE_USER_URL}/${userUid}/devices/${deviceId}/lastActive.json`, {
          method: 'PUT',
          body: JSON.stringify(new Date().toISOString())
        });
      }
      
      // Success - license verified
      setVerified(true);
      setLicenseKey(licenseKey);
      
      // Show success message and license info
      showMessage(`Welcome back, ${userFound.name || 'User'}!`, 'success');
      showLicenseInfo(userFound);
      
      // Add welcome animation
      document.querySelector('.license-container').classList.add('welcome-animation');
      
      // Hide license UI after 3 seconds
      setTimeout(() => {
        const overlay = document.getElementById('licenseOverlay');
        if (overlay) {
          overlay.remove();
        }
      }, 3000);
      
    } catch (error) {
      console.error('License verification error:', error);
      showMessage('Error connecting to server. Please try again later.', 'error');
    } finally {
      verifyBtn.textContent = 'Verify License';
      verifyBtn.disabled = false;
    }
  }
  
  // ---- Main License Check ----
  async function checkLicenseStatus() {
    // If not verified, show license UI
    if (!isVerified()) {
      showLicenseUI();
      return;
    }
    
    // If verified, check license status in Firebase
    const licenseKey = getLicenseKey();
    if (!licenseKey) {
      setVerified(false);
      showLicenseUI();
      return;
    }
    
    try {
      const response = await fetch(FIREBASE_URL);
      const users = await response.json();
      
      let userFound = null;
      let userUid = null;
      
      // Find user with matching license key
      for (const uid in users) {
        const user = users[uid];
        if (user.licenseKey && user.licenseKey.trim() === licenseKey) {
          userFound = user;
          userUid = uid;
          break;
        }
      }
      
      if (!userFound || userFound.status !== 'Active') {
        setVerified(false);
        setLicenseKey('');
        showLicenseUI();
        return;
      }
      
      // Check expiration
      const daysRemaining = getDaysRemaining(userFound.expiryDate);
      if (daysRemaining <= 0) {
        setVerified(false);
        setLicenseKey('');
        showLicenseUI();
        return;
      }
      
      // Update device last active time
      const deviceId = getDeviceId();
      await fetch(`${FIREBASE_USER_URL}/${userUid}/devices/${deviceId}/lastActive.json`, {
        method: 'PUT',
        body: JSON.stringify(new Date().toISOString())
      });
      
      // License is valid, continue with application
      console.log('License verified successfully');
      
    } catch (error) {
      console.error('License status check error:', error);
      // On error, show license UI to re-verify
      setVerified(false);
      showLicenseUI();
    }
  }
  
  // ---- Initialize ----
  window.addEventListener('DOMContentLoaded', checkLicenseStatus);
  
  // Check license status every hour
  setInterval(checkLicenseStatus, 60 * 60 * 1000);
  
  // Export functions for global access if needed
  window.licenseManager = {
    checkLicenseStatus,
    verifyLicense,
    isVerified: () => isVerified()
  };
})();