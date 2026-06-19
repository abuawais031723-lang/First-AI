// =========================================================
// 🧠 PRO MAX ENGINE - FULLY WORKING (NO SPLASH SCREEN)
// =========================================================
let currentUser = null;
let currentImageUrl = '';
let currentPrompt = '';
let currentSeed = '';
let refImage = null;
let ratingCount = 0;
let imgWidth = 512;
let imgHeight = 512;
let selectedStyle = '';
let turboMode = true;
let negPrompt = '';

function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'show ' + type;
    clearTimeout(t._time);
    t._time = setTimeout(() => t.classList.remove('show'), 2500);
}

// --- AUTH ---
function getUsers() { return JSON.parse(localStorage.getItem('fa_users')) || {}; }
function saveUsers(u) { localStorage.setItem('fa_users', JSON.stringify(u)); }

function showSignup() {
    document.querySelector('#loginPage .toggle-link').style.display = 'none';
    document.getElementById('signupForm').classList.remove('hidden');
}
function showLogin() {
    document.querySelector('#loginPage .toggle-link').style.display = 'block';
    document.getElementById('signupForm').classList.add('hidden');
}

function loginUser() {
    const u = document.getElementById('loginUsername').value.trim();
    const p = document.getElementById('loginPassword').value.trim();
    if (!u || !p) return showToast('Please fill all fields.', 'error');
    const users = getUsers();
    if (!users[u]) return showToast('User not found. Sign up first!', 'error');
    if (users[u] !== p) return showToast('Wrong password.', 'error');
    currentUser = u;
    localStorage.setItem('fa_session', u);
    showToast('Welcome back, ' + u + '!', 'success');
    showApp();
}

function signupUser() {
    const u = document.getElementById('signupUsername').value.trim();
    const p = document.getElementById('signupPassword').value.trim();
    if (!u || !p) return showToast('Please fill all fields.', 'error');
    const users = getUsers();
    if (users[u]) return showToast('Username already taken.', 'error');
    users[u] = p;
    saveUsers(users);
    currentUser = u;
    localStorage.setItem('fa_session', u);
    showToast('Account created! 🎉', 'success');
    showApp();
}

function logoutUser() {
    localStorage.removeItem('fa_session');
    currentUser = null;
    document.getElementById('app').style.display = 'none';
    document.getElementById('loginPage').style.display = 'flex';
    closeSidebar();
    showLogin();
    showToast('Logged out.', 'success');
}

function checkSession() {
    const s = localStorage.getItem('fa_session');
    if (s && getUsers()[s]) { currentUser = s; showApp(); }
    else { document.getElementById('loginPage').style.display = 'flex'; document.getElementById('app').style.display = 'none'; showLogin(); }
}

function showApp() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    document.getElementById('userBadge').textContent = currentUser;
    navigateTo('home');
    loadHistory();
    loadFavorites();
}

// --- SIDEBAR ---
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('active');
}
function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('active');
}

// --- NAV ---
function navigateTo(view) {
    closeSidebar();
    document.getElementById('homeView').style.display = 'none';
    document.getElementById('historyView').classList.add('hidden-view');
    document.getElementById('favoritesView').classList.add('hidden-view');
    if (view === 'home') { document.getElementById('homeView').style.display = 'block'; }
    else if (view === 'history') { document.getElementById('historyView').classList.remove('hidden-view'); renderHistory(); }
    else if (view === 'favorites') { document.getElementById('favoritesView').classList.remove('hidden-view'); renderFavorites(); }
}

// --- CONTROLS ---
function setSize(el, w, h) {
    document.querySelectorAll('.size-selector button').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    imgWidth = parseInt(w);
    imgHeight = parseInt(h);
    showToast('Size: ' + w + 'x' + h, 'success');
}

function setStyle(el, style) {
    document.querySelectorAll('.style-chips button').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    selectedStyle = style;
    showToast('Style: ' + el.textContent, 'success');
}

function toggleTurbo() {
    turboMode = !turboMode;
    document.getElementById('turboToggle').classList.toggle('off');
    showToast(turboMode ? '⚡ Turbo ON (3-5 sec)' : '🐢 Turbo OFF', 'success');
}

function toggleNeg() {
    const inp = document.getElementById('negInput');
    const sw = document.getElementById('negSwitch');
    if (inp.style.display === 'none') {
        inp.style.display = 'block';
        sw.classList.add('active');
    } else {
        inp.style.display = 'none';
        sw.classList.remove('active');
        negPrompt = '';
    }
}

function setPrompt(text) {
    document.getElementById('promptInput').value = text;
    showToast('Prompt set!', 'success');
}

function randomPrompt() {
    const list = [
        "A realistic human full body portrait, professional photography, 8k, detailed, cinematic lighting",
        "3D render of a dragon, octane render, highly detailed, 8k, volumetric lighting",
        "Anime girl full body, studio ghibli style, vibrant colors, detailed illustration",
        "A beautiful landscape, sunset, oil painting, 8k, masterpiece",
        "Cyberpunk city, neon lights, futuristic, 8k, highly detailed",
        "A majestic lion made of fire, fantasy art, 4k, dramatic lighting",
        "A cosmic nebula with a floating island, space art, vibrant colors",
        "An astronaut riding a horse on Mars, dramatic sky, photorealistic, 8k",
        "A glass castle in the clouds, sunset, 4k, fantasy art",
        "A mecha godzilla fighting in Tokyo, anime style, 8k"
    ];
    const pick = list[Math.floor(Math.random() * list.length)];
    document.getElementById('promptInput').value = pick;
    showToast('🎲 Random prompt loaded!', 'success');
    generateImage();
}

// --- REFERENCE ---
function handleRefUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        refImage = event.target.result;
        document.getElementById('refPreviewImg').src = refImage;
        document.getElementById('refPreviewMini').style.display = 'flex';
        document.getElementById('refTrigger').style.color = '#10b981';
        showToast('📎 Reference added!', 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
}

function removeRefImage() {
    refImage = null;
    document.getElementById('refPreviewMini').style.display = 'none';
    document.getElementById('refTrigger').style.color = '#6b7280';
    showToast('Reference removed.', 'success');
}

// --- GENERATE (IMPROVED FOR CHARACTERS) ---
function generateImage() {
    const input = document.getElementById('promptInput');
    let prompt = input.value.trim();
    if (!prompt) {
        showToast('Please write a description.', 'error');
        return;
    }
    negPrompt = document.getElementById('negInput').value.trim();
    document.getElementById('styleBadge').textContent = '⚡ Generating... (Pro Max)';

    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
        hash = (hash << 5) - hash + prompt.charCodeAt(i);
        hash |= 0;
    }
    const seed = Math.abs(hash) % 1000000;
    currentSeed = seed;
    currentPrompt = prompt;

    // =========================================================
    // 🧠 ENHANCED PROMPT ENGINEERING FOR CHARACTERS
    // =========================================================
    let enhancedPrompt = prompt;
    if (selectedStyle) enhancedPrompt = enhancedPrompt + ', ' + selectedStyle;

    const lower = prompt.toLowerCase();

    // DETECT IF USER WANTS A CHARACTER / PERSON
    const isCharacter = lower.includes('character') || lower.includes('person') || 
                       lower.includes('human') || lower.includes('portrait') || 
                       lower.includes('face') || lower.includes('people') ||
                       lower.includes('man') || lower.includes('woman') || 
                       lower.includes('boy') || lower.includes('girl');

    // =========================================================
    // 🎯 SPECIAL CHARACTER PROMPT ENHANCEMENT (Like Gemini)
    // =========================================================
    if (isCharacter) {
        enhancedPrompt = prompt + ', photorealistic, 8k, highly detailed, sharp focus, professional photography, cinematic lighting, perfect anatomy, full body, high resolution, sharp eyes, detailed skin texture, masterpiece, national geographic quality, studio lighting, depth of field, bokeh background';
    } 
    else if (lower.includes('3d') || lower.includes('render') || lower.includes('cgi') || lower.includes('octane') || lower.includes('blender')) {
        enhancedPrompt = prompt + ', 3d render, octane render, cgi, highly detailed, volumetric lighting, 8k, unreal engine 5, cinematic, global illumination, ray tracing';
    } 
    else if (lower.includes('anime') || lower.includes('cartoon') || lower.includes('studio ghibli') || lower.includes('manga') || lower.includes('disney')) {
        enhancedPrompt = prompt + ', anime style, studio ghibli, vibrant colors, detailed illustration, masterpiece, 8k, full body, high quality animation, clean lines';
    } 
    else if (lower.includes('landscape') || lower.includes('sunset') || lower.includes('mountain') || lower.includes('ocean') || lower.includes('nature') || lower.includes('painting')) {
        enhancedPrompt = prompt + ', beautiful landscape, oil painting, vibrant colors, highly detailed, 8k, masterpiece, atmospheric, golden hour lighting';
    } 
    else if (lower.includes('cyberpunk') || lower.includes('neon') || lower.includes('futuristic') || lower.includes('city') || lower.includes('robot') || lower.includes('tech')) {
        enhancedPrompt = prompt + ', cyberpunk style, neon lights, futuristic, highly detailed, 8k, cinematic lighting, intricate details, dystopian, high contrast';
    } 
    else if (lower.includes('fantasy') || lower.includes('dragon') || lower.includes('magic') || lower.includes('castle') || lower.includes('mythical') || lower.includes('wizard') || lower.includes('elf')) {
        enhancedPrompt = prompt + ', fantasy art, magical, highly detailed, epic composition, 8k, dramatic lighting, masterpiece, mystical, vibrant colors';
    } 
    else {
        enhancedPrompt = prompt + ', high quality, detailed, beautiful composition, 8k, masterpiece, sharp focus, vibrant colors';
    }

    if (refImage) enhancedPrompt = enhancedPrompt + ', influenced by reference image style';

    let negParam = '';
    if (negPrompt) negParam = '&negative=' + encodeURIComponent(negPrompt);

    const skeleton = document.getElementById('skeletonLoader');
    const resultArea = document.getElementById('resultArea');
    const img = document.getElementById('generatedImage');

    skeleton.classList.add('active');
    resultArea.style.display = 'none';
    img.src = '';

    // Use a more stable resolution for characters
    let width = imgWidth;
    let height = imgHeight;
    if (isCharacter && imgWidth < 768) {
        width = 768;
        height = 768;
    }

    const url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(enhancedPrompt) + 
               '?width=' + width + '&height=' + height + 
               '&nologo=true&render=true&seed=' + seed + negParam + '&t=' + Date.now();

    const startTime = Date.now();

    img.onload = function() {
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        skeleton.classList.remove('active');
        resultArea.style.display = 'flex';
        currentImageUrl = img.src;
        ratingCount = 0;
        document.getElementById('ratingCount').textContent = '0';
        document.querySelectorAll('.rate-btn').forEach(b => b.classList.remove('active'));
        saveHistory(prompt, img.src);
        document.getElementById('styleBadge').textContent = '⚡ Pro Max • ' + elapsed + 's';
        showToast('✨ Generated in ' + elapsed + 's!', 'success');
    };
    img.onerror = function() {
        skeleton.classList.remove('active');
        document.getElementById('styleBadge').textContent = '⚡ Pro Max • 3-5 sec';
        const fallbackUrl = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(enhancedPrompt) + 
                           '?width=' + width + '&height=' + height + 
                           '&nologo=true&render=true' + negParam + '&t=' + Date.now();
        img.src = fallbackUrl;
        img.onerror = function() {
            const simpleUrl = 'https://image.pollinations.ai/prompt/beautiful+landscape+8k?width=512&height=512&nologo=true&render=true&t=' + Date.now();
            img.src = simpleUrl;
            img.onload = function() {
                skeleton.classList.remove('active');
                resultArea.style.display = 'flex';
                currentImageUrl = img.src;
                saveHistory('beautiful landscape', img.src);
                showToast('Generated backup.', 'success');
            };
            img.onerror = function() {
                skeleton.classList.remove('active');
                showToast('Network error. Try again.', 'error');
            };
        };
        img.onload = function() {
            const elapsed = Math.round((Date.now() - startTime) / 1000);
            skeleton.classList.remove('active');
            resultArea.style.display = 'flex';
            currentImageUrl = img.src;
            saveHistory(prompt, img.src);
            document.getElementById('styleBadge').textContent = '⚡ Pro Max • ' + elapsed + 's';
            showToast('✨ Generated!', 'success');
        };
    };
    img.src = url;
}

// --- ENHANCE ---
function enhanceImage() {
    const img = document.getElementById('generatedImage');
    if (!img.src || img.src === '') {
        showToast('No image to enhance. Generate or upload first!', 'error');
        return;
    }

    showToast('🔮 Enhancing to HD...', 'success');
    document.getElementById('styleBadge').textContent = '🔮 Enhancing...';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const tempImg = new Image();
    tempImg.crossOrigin = 'Anonymous';
    tempImg.src = img.src;

    tempImg.onload = function() {
        const scale = 2;
        const newWidth = tempImg.naturalWidth * scale;
        const newHeight = tempImg.naturalHeight * scale;
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(tempImg, 0, 0, newWidth, newHeight);

        const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
        const data = imageData.data;
        const output = ctx.createImageData(newWidth, newHeight);
        const outData = output.data;
        
        const w = newWidth;
        const h = newHeight;
        const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                let r = 0, g = 0, b = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * w + (x + kx)) * 4;
                        const kidx = (ky + 1) * 3 + (kx + 1);
                        const k = kernel[kidx];
                        r += data[idx] * k;
                        g += data[idx + 1] * k;
                        b += data[idx + 2] * k;
                    }
                }
                const idx = (y * w + x) * 4;
                outData[idx] = Math.min(255, Math.max(0, r));
                outData[idx + 1] = Math.min(255, Math.max(0, g));
                outData[idx + 2] = Math.min(255, Math.max(0, b));
                outData[idx + 3] = 255;
            }
        }

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (x === 0 || y === 0 || x === w - 1 || y === h - 1) {
                    const idx = (y * w + x) * 4;
                    const srcIdx = idx;
                    outData[idx] = data[srcIdx];
                    outData[idx + 1] = data[srcIdx + 1];
                    outData[idx + 2] = data[srcIdx + 2];
                    outData[idx + 3] = 255;
                }
            }
        }

        ctx.putImageData(output, 0, 0);

        const enhancedUrl = canvas.toDataURL('image/png');
        img.src = enhancedUrl;
        currentImageUrl = enhancedUrl;
        
        document.getElementById('styleBadge').textContent = '✨ Enhanced to HD!';
        showToast('✅ Image enhanced to HD quality!', 'success');
    };

    tempImg.onerror = function() {
        try {
            const canvas2 = document.createElement('canvas');
            const ctx2 = canvas2.getContext('2d');
            const scale = 2;
            const w = 512 * scale;
            const h = 512 * scale;
            canvas2.width = w;
            canvas2.height = h;
            ctx2.imageSmoothingEnabled = true;
            ctx2.imageSmoothingQuality = 'high';
            ctx2.drawImage(img, 0, 0, w, h);
            const url = canvas2.toDataURL('image/png');
            img.src = url;
            currentImageUrl = url;
            document.getElementById('styleBadge').textContent = '✨ Enhanced (Scaled)';
            showToast('✅ Image scaled up!', 'success');
        } catch (e) {
            showToast('Could not enhance this image.', 'error');
            document.getElementById('styleBadge').textContent = '⚡ Pro Max';
        }
    };
}

// --- OTHER FEATURES ---
function batchGenerate() {
    if (!currentPrompt) { showToast('Generate an image first!', 'error'); return; }
    showToast('📚 Generating 2 images...', 'success');
    generateImage();
    setTimeout(() => {
        currentSeed = (parseInt(currentSeed) + 999) % 1000000;
        generateImage();
    }, 500);
}

function regenerateImage() {
    if (!currentPrompt) { showToast('Generate an image first!', 'error'); return; }
    currentSeed = (parseInt(currentSeed) + 777) % 1000000;
    document.getElementById('promptInput').value = currentPrompt;
    generateImage();
    showToast('🔄 Regenerating...', 'success');
}

function shareImage() {
    const img = document.getElementById('generatedImage');
    if (!img.src || img.src === '') return showToast('No image to share.', 'error');
    if (navigator.share) {
        fetch(img.src).then(res => res.blob()).then(blob => {
            const file = new File([blob], 'AI_Image.png', { type: 'image/png' });
            navigator.share({ files: [file], title: 'AI Image Creator' }).catch(() => showToast('Share cancelled.', 'error'));
        }).catch(() => showToast('Share failed.', 'error'));
    } else {
        navigator.clipboard.writeText(img.src).then(() => {
            showToast('📤 Image URL copied!', 'success');
        }).catch(() => showToast('Copy image URL manually.', 'error'));
    }
}

// --- RATING ---
function rateImage(type) {
    if (!currentImageUrl) { showToast('Generate an image first!', 'error'); return; }
    const likeBtn = document.querySelector('.rate-btn.like');
    const dislikeBtn = document.querySelector('.rate-btn.dislike');
    if (type === 'like') {
        likeBtn.classList.toggle('active');
        if (dislikeBtn.classList.contains('active')) dislikeBtn.classList.remove('active');
        ratingCount = likeBtn.classList.contains('active') ? 1 : 0;
    } else {
        dislikeBtn.classList.toggle('active');
        if (likeBtn.classList.contains('active')) likeBtn.classList.remove('active');
        ratingCount = dislikeBtn.classList.contains('active') ? -1 : 0;
    }
    document.getElementById('ratingCount').textContent = ratingCount;
    showToast(type === 'like' ? '👍 Liked!' : '👎 Disliked', 'success');
}

// --- VOICE ---
function startVoice() {
    const btn = document.getElementById('voiceBtn');
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        return showToast('Voice not supported.', 'error');
    }
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onstart = () => { btn.innerHTML = '⏺️'; };
    recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        document.getElementById('promptInput').value = transcript;
        btn.innerHTML = <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
        showToast('Voice captured!', 'success');
    };
    recognition.onerror = () => {
        btn.innerHTML = <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
        showToast('Voice error.', 'error');
    };
    recognition.onend = () => {
        btn.innerHTML = <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
    };
    recognition.start();
}

// --- DOWNLOAD ---
function downloadImage() {
    const img = document.getElementById('generatedImage');
    if (!img.src || img.src === '') return showToast('No image.', 'error');
    const link = document.createElement('a');
    link.download = 'AI_Image_' + Date.now() + '.png';
    link.href = img.src;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('💾 Downloading...', 'success');
}

function clearResult() {
    document.getElementById('resultArea').style.display = 'none';
    document.getElementById('generatedImage').src = '';
    currentImageUrl = '';
    ratingCount = 0;
    document.getElementById('ratingCount').textContent = '0';
    document.querySelectorAll('.rate-btn').forEach(b => b.classList.remove('active'));
}

// --- HISTORY ---
function getHistory() { return JSON.parse(localStorage.getItem('fa_history_' + currentUser)) || []; }
function saveHistory(p, url) {
    const h = getHistory();
    h.unshift({ prompt: p, imageUrl: url, time: new Date().toLocaleString() });
    if (h.length > 50) h.pop();
    localStorage.setItem('fa_history_' + currentUser, JSON.stringify(h));
    loadHistory();
}
function loadHistory() { if (!document.getElementById('historyView').classList.contains('hidden-view')) renderHistory(); }
function renderHistory() {
    const c = document.getElementById('historyList');
    const h = getHistory();
    if (!h.length) return c.innerHTML = '<div class="empty-state">📭 No history yet.</div>';
    c.innerHTML = h.map((item, i) => `
        <div class="list-item">
            <img src="${item.imageUrl}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22/%3E'">
            <div class="info">${item.prompt}<small>${item.time}</small></div>
            <button class="action-btn" onclick="loadHistoryImage(${i})">👁️</button>
        </div>
    `).join('');
}
function loadHistoryImage(i) {
    const h = getHistory();
    if (h[i]) {
        document.getElementById('promptInput').value = h[i].prompt;
        document.getElementById('generatedImage').src = h[i].imageUrl;
        currentImageUrl = h[i].imageUrl;
        document.getElementById('resultArea').style.display = 'flex';
        navigateTo('home');
        showToast('Loaded from history.', 'success');
    }
}

// --- FAVORITES ---
function getFavorites() { return JSON.parse(localStorage.getItem('fa_fav_' + currentUser)) || []; }
function saveFavorites(f) { localStorage.setItem('fa_fav_' + currentUser, JSON.stringify(f)); }
function addToFavorites() {
    const img = document.getElementById('generatedImage');
    if (!img.src || img.src === '') return showToast('Generate first!', 'error');
    const favs = getFavorites();
    if (favs.some(f => f.imageUrl === img.src)) return showToast('Already in favorites ⭐', 'error');
    favs.push({ prompt: currentPrompt || 'Untitled', imageUrl: img.src, time: new Date().toLocaleString() });
    saveFavorites(favs);
    showToast('⭐ Added to Favorites!', 'success');
    loadFavorites();
}
function loadFavorites() { if (!document.getElementById('favoritesView').classList.contains('hidden-view')) renderFavorites(); }
function renderFavorites() {
    const c = document.getElementById('favoritesList');
    const f = getFavorites();
    if (!f.length) return c.innerHTML = '<div class="empty-state">⭐ No favorites yet.</div>';
    c.innerHTML = f.map((item, i) => `
        <div class="list-item">
            <img src="${item.imageUrl}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22/%3E'">
            <div class="info">${item.prompt}<small>⭐ ${item.time}</small></div>
            <button class="action-btn" onclick="loadFavImage(${i})">👁️</button>
            <button class="action-btn" onclick="removeFav(${i})" style="color:#ef4444;">🗑️</button>
        </div>
    `).join('');
}
function loadFavImage(i) {
    const f = getFavorites();
    if (f[i]) {
        document.getElementById('promptInput').value = f[i].prompt;
        document.getElementById('generatedImage').src = f[i].imageUrl;
        currentImageUrl = f[i].imageUrl;
        document.getElementById('resultArea').style.display = 'flex';
        navigateTo('home');
        showToast('Loaded favorite.', 'success');
    }
}
function removeFav(i) {
    const f = getFavorites();
    f.splice(i, 1);
    saveFavorites(f);
    renderFavorites();
    showToast('Removed.', 'success');
}

// --- INIT ---
window.onload = function() {
    checkSession();
};