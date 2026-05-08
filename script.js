// =========================================================================
// SYSTEM BOOT SEQUENCE
// =========================================================================
(async function initBootSequence() {
    const bootScreen = document.getElementById('boot-screen');
    const bootText = document.getElementById('boot-text');
    
    if (!bootScreen || !bootText) return;

    // Check if already booted in this session
    if (sessionStorage.getItem('hasBooted') === 'true') {
        bootScreen.classList.add('hidden');
        return;
    }

    // Start boot sequence
    document.body.classList.add('is-booting');
    
    const lines = [
        "Initializing kernel...",
        "[ OK ] Started Device Manager.",
        "[ OK ] Mounted Virtual File System.",
        "[ OK ] Reached target Basic System.",
        "Starting Network Configuration...",
        "[ OK ] Started Network Configuration.",
        "Mounting Core Assets...",
        "[ OK ] Loaded CSS and JS Modules.",
        "Connecting to secure server... TCP/IP Handshake established.",
        "Fetching Profile Data (Takami Tenshi)...",
        "[ OK ] Profile Data loaded successfully.",
        "Verifying security protocols...",
        "[ OK ] Access Granted.",
        "Starting User Interface..."
    ];

    let currentLine = 0;

    function printLine() {
        if (currentLine < lines.length) {
            bootText.innerHTML += lines[currentLine] + "<br>";
            currentLine++;
            // Random delay between 50ms and 150ms for realistic typing effect
            setTimeout(printLine, Math.random() * 100 + 50);
        } else {
            // Sequence finished, wait 500ms then fade out
            setTimeout(() => {
                bootScreen.classList.add('hidden');
                document.body.classList.remove('is-booting');
                sessionStorage.setItem('hasBooted', 'true');
            }, 500);
        }
    }

    // Start printing after a tiny initial delay
    setTimeout(printLine, 200);
})();

// Scroll Animations Observer
let currentLanyardData = null;
let isBubbleManuallyHidden = false;

const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            if (entry.target.classList.contains('skill-box')) {
                animateSkillBars(entry.target);
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-up, .section').forEach((el) => {
    observer.observe(el);
});

function animateSkillBars(container) {
    const bars = container.querySelectorAll('.skill-fill');
    bars.forEach(bar => {
        const progress = bar.dataset.progress;
        if (progress) {
            setTimeout(() => {
                bar.style.width = progress + '%';
            }, 200);
        }
    });
}

// Active Nav Link updating while scrolling
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href && href.includes('#' + id)) {
                    link.classList.add('active');
                }
            });
        }
    });
}, { threshold: 0.4, rootMargin: "0px" });

sections.forEach(section => {
    navObserver.observe(section);
});

// Custom Smooth Scroll Function
function smoothScrollTo(targetSelector, duration = 500) {
    const target = document.querySelector(targetSelector);
    if (!target) return;

    const offset = 60;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = target.getBoundingClientRect().top;
    const targetPosition = elementRect - bodyRect - offset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

// Smooth scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        e.preventDefault();
        smoothScrollTo(targetId);
        history.pushState(null, null, targetId);
    });
});

// Theme Toggle Logic
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const themeIcon = themeToggle.querySelector('i');

const savedTheme = localStorage.getItem('theme');
const bgVideoDark = document.getElementById('bg-video-dark');
const bgVideoLight = document.getElementById('bg-video-light');

function toggleBgVideo(isLight) {
    if (isLight) {
        bgVideoDark.pause();
        bgVideoLight.play().catch(() => {});
    } else {
        bgVideoLight.pause();
        bgVideoDark.play().catch(() => {});
    }
}

if (savedTheme === 'light') {
    body.classList.add('light-theme');
    themeIcon.className = 'fas fa-sun';
    toggleBgVideo(true);
} else if (savedTheme === 'dark') {
    body.classList.remove('light-theme');
    themeIcon.className = 'fas fa-moon';
    toggleBgVideo(false);
} else {
    // Idea 5: Auto-theme based on time (6 AM to 6 PM is Light Theme)
    const hour = new Date().getHours();
    const isDayTime = hour >= 6 && hour < 18;
    if (isDayTime) {
        body.classList.add('light-theme');
        themeIcon.className = 'fas fa-sun';
        toggleBgVideo(true);
    } else {
        body.classList.remove('light-theme');
        themeIcon.className = 'fas fa-moon';
        toggleBgVideo(false);
    }
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    const isLight = body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    themeIcon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
    toggleBgVideo(isLight);
});

// Language Toggle Logic
const langToggle = document.getElementById('lang-toggle');
const langText = langToggle.querySelector('.lang-text');
const translatableElements = document.querySelectorAll('[data-vi]');
const translatableTitles = document.querySelectorAll('[data-vi-title]');

let currentLang = localStorage.getItem('lang') || 'vi';

const translations = {
    vi: {
        connecting: "Đang kết nối...",
        pleaseWait: "Vui lòng đợi",
        offline: "Ngoại tuyến",
        idle: "Hiện không hoạt động",
        zzz: "Zzz...",
        online: "Online"
    },
    en: {
        connecting: "Connecting...",
        pleaseWait: "Please wait",
        offline: "Offline",
        idle: "Currently inactive",
        zzz: "Zzz...",
        online: "Online"
    }
};

function updateLanguage(lang) {
    translatableElements.forEach(el => {
        const text = el.getAttribute(`data-${lang}`);
        if (text) {
            el.innerHTML = text;
        }
    });
    translatableTitles.forEach(el => {
        const title = el.getAttribute(`data-${lang}-title`);
        if (title) {
            el.setAttribute('title', title);
        }
    });
    langText.innerText = lang.toUpperCase();
    localStorage.setItem('lang', lang);
    currentLang = lang;

    if (currentLanyardData) {
        updateDiscordUI(currentLanyardData);
    }
}

if (currentLang === 'en') {
    updateLanguage('en');
}

langToggle.addEventListener('click', () => {
    const nextLang = currentLang === 'vi' ? 'en' : 'vi';
    updateLanguage(nextLang);
});

// UI Toggle Logic
const uiToggle = document.getElementById('ui-toggle');
const uiIcon = uiToggle.querySelector('i');

uiToggle.addEventListener('click', () => {
    body.classList.toggle('ui-hidden');
    const isHidden = body.classList.contains('ui-hidden');
    uiIcon.className = isHidden ? 'fas fa-eye-slash' : 'fas fa-eye';
});

// Live Discord Presence (Lanyard API)
const DISCORD_ID = '695181337241583687';
const BASE_BADGE_URL = "https://raw.githubusercontent.com/Debuggingss/discord-badges/master/pngs_named/";

function getBadges(flags) {
    if (!flags) return "";
    const badgeList = [];
    const FLAGS = {
        STAFF: [1 << 0, "staff.png", "Discord Staff"],
        PARTNER: [1 << 1, "partner.png", "Partnered Server Owner"],
        HYPESQUAD: [1 << 2, "hypesquad_events.png", "HypeSquad Events"],
        BUG_HUNTER_LEVEL_1: [1 << 3, "bughunter_1.png", "Discord Bug Hunter"],
        HOUSE_BRAVERY: [1 << 6, "bravery.png", "HypeSquad Bravery"],
        HOUSE_BRILLIANCE: [1 << 7, "brilliance.png", "HypeSquad Brilliance"],
        HOUSE_BALANCE: [1 << 8, "balance.png", "HypeSquad Balance"],
        EARLY_SUPPORTER: [1 << 9, "early_supporter.png", "Early Supporter"],
        BUG_HUNTER_LEVEL_2: [1 << 14, "bughunter_2.png", "Discord Bug Hunter Level 2"],
        ACTIVE_DEVELOPER: [1 << 22, "developer.png", "Active Developer"]
    };

    for (const key in FLAGS) {
        if ((flags & FLAGS[key][0]) === FLAGS[key][0]) {
            badgeList.push(`<img class="badge" src="${BASE_BADGE_URL}${FLAGS[key][1]}" alt="${FLAGS[key][2]}" title="${FLAGS[key][2]}" onerror="this.style.display='none'">`);
        }
    }
    return badgeList.join("");
}

function updateDiscordUI(data) {
    if (!data) return;
    currentLanyardData = data;
    const user = data.discord_user;

    document.getElementById('lanyard-username').innerText = user.global_name || user.username;
    const disc = user.discriminator;
    document.getElementById('lanyard-discriminator').innerText = (disc && disc !== "0") ? `#${disc}` : "";

    let badgesHTML = getBadges(user.public_flags);
    const isAnimated = user.avatar && user.avatar.startsWith('a_');
    if (isAnimated && !badgesHTML.includes('nitro.png')) {
        badgesHTML += `<img class="badge" src="${BASE_BADGE_URL}nitro.png" alt="Nitro" title="Nitro" onerror="this.style.display='none'">`;
    }
    if (badgesHTML === "") {
        badgesHTML = `<i class="fab fa-discord" title="Discord User" style="color: #5865F2; font-size: 1.1rem;"></i>`;
    }
    document.getElementById('lanyard-badges').innerHTML = badgesHTML;

    const avatarExt = isAnimated ? 'gif' : 'webp';
    const avatarUrl = user.avatar
        ? `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${user.avatar}.${avatarExt}?size=160`
        : `https://ui-avatars.com/api/?name=${user.username}&background=1A1030&color=4DDDB8`;
    document.getElementById('lanyard-avatar').src = avatarUrl;

    const decor = document.getElementById('lanyard-decoration');
    if (user.avatar_decoration_data) {
        decor.src = `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png`;
        decor.style.display = 'block';
    } else {
        decor.style.display = 'none';
    }

    document.getElementById('lanyard-status').className = `discord-status-dot ${data.discord_status}`;

    const acts = data.activities || [];
    const activityEl = document.getElementById('lanyard-activity');
    const detailsEl = document.getElementById('lanyard-details');
    const icon = document.getElementById('lanyard-act-icon');
    const bubble = document.getElementById('lanyard-status-bubble');

    const gameAct = acts.find(a => a.type === 0);
    const customAct = acts.find(a => a.type === 4);

    if (customAct && customAct.state && data.discord_status !== 'offline') {
        const emojiStr = customAct.emoji ? (customAct.emoji.id ? `<img src="https://cdn.discordapp.com/emojis/${customAct.emoji.id}.${customAct.emoji.animated ? 'gif' : 'png'}" style="width:16px; height:16px; vertical-align:middle; margin-right:4px;">` : customAct.emoji.name + ' ') : '';
        bubble.innerHTML = emojiStr + customAct.state;
        if (!isBubbleManuallyHidden) {
            bubble.classList.add('show');
        } else {
            bubble.classList.remove('show');
        }
    } else {
        bubble.classList.remove('show');
    }

    let mainAct = gameAct || acts[0];

    if (mainAct) {
        if (mainAct.type === 4 && !gameAct) {
            activityEl.innerHTML = `${mainAct.emoji && mainAct.emoji.name ? mainAct.emoji.name + ' ' : ''}${mainAct.state || 'Custom Status'}`;
            detailsEl.innerText = "";
        } else {
            activityEl.innerText = mainAct.name;
            detailsEl.innerText = mainAct.details || mainAct.state || "";
        }

        if (mainAct.assets && mainAct.assets.large_image) {
            let imgId = mainAct.assets.large_image;
            icon.src = imgId.startsWith("mp:external")
                ? imgId.replace(/mp:external\/.*\/https\//, "https://")
                : `https://cdn.discordapp.com/app-assets/${mainAct.application_id}/${imgId}.png`;
            icon.style.display = 'block';
        } else {
            icon.style.display = 'none';
        }
    } else {
        const t = translations[currentLang];
        activityEl.innerText = data.discord_status === 'offline' ? t.offline : t.idle;
        detailsEl.innerText = data.discord_status === 'offline' ? "" : t.zzz;
        icon.style.display = 'none';
    }

    // =========================================================
    // UPDATE FULL WIDTH LIVE ACTIVITY CARD — SHOW ALL ACTIVITIES
    // =========================================================
    const liveActivityEl = document.getElementById('discord-live-activity');
    if (liveActivityEl) {
        if (data.discord_status === 'offline') {
            liveActivityEl.innerHTML = `<div class="activity-placeholder"><i class="fas fa-bed"></i><span>${currentLang === 'vi' ? 'Đang offline.' : 'Currently offline.'}</span></div>`;
        } else {
            // Filter out type 4 (Custom Status) — it's already shown as a bubble
            const visibleActs = acts.filter(a => a.type !== 4);

            if (visibleActs.length === 0) {
                liveActivityEl.innerHTML = `<div class="activity-placeholder"><i class="fas fa-coffee"></i><span>${currentLang === 'vi' ? 'Đang online nhưng không hoạt động gì.' : 'Online, not doing anything.'}</span></div>`;
            } else {
                let listHTML = '';
                visibleActs.forEach(act => {
                    listHTML += renderActivityItem(act);
                });
                liveActivityEl.innerHTML = `<div class="activity-list">${listHTML}</div>`;
            }
        }
    }
}

// Render a single activity item for the list
function renderActivityItem(act) {
    // Spotify (type 2)
    if (act.type === 2 && act.name === 'Spotify') {
        const albumArt = act.assets && act.assets.large_image
            ? act.assets.large_image.replace('spotify:', 'https://i.scdn.co/image/')
            : '';
        return `
            <div class="activity-item">
                <div class="activity-icon-container">
                    ${albumArt ? `<img src="${albumArt}" class="activity-large-image" alt="Album Art">` : '<i class="fab fa-spotify" style="font-size:2rem;margin:15px;color:#1DB954;"></i>'}
                    <div class="activity-small-image" style="background:#1DB954;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;"><i class="fab fa-spotify"></i></div>
                </div>
                <div class="activity-details">
                    <div class="activity-name" style="color:#1DB954;">Listening to Spotify</div>
                    <div class="activity-state">${act.details || ''}</div>
                    <div class="activity-details-text">by ${act.state || ''}</div>
                </div>
            </div>`;
    }

    // Game (type 0)
    if (act.type === 0) {
        let iconSrc = '';
        if (act.assets && act.assets.large_image) {
            const imgId = act.assets.large_image;
            iconSrc = imgId.startsWith("mp:external")
                ? imgId.replace(/mp:external\/.*\/https\//, "https://")
                : `https://cdn.discordapp.com/app-assets/${act.application_id}/${imgId}.png`;
        }
        let timeString = '';
        if (act.timestamps && act.timestamps.start) {
            const elapsed = Math.floor((Date.now() - act.timestamps.start) / 60000);
            timeString = elapsed > 0 ? `${elapsed}m elapsed` : 'Just started';
        }
        return `
            <div class="activity-item">
                <div class="activity-icon-container">
                    ${iconSrc ? `<img src="${iconSrc}" class="activity-large-image" alt="Game Icon">` : '<i class="fas fa-gamepad" style="font-size:2rem;margin:15px;color:var(--primary-color);"></i>'}
                    <div class="activity-small-image" style="background:var(--primary-color);display:flex;align-items:center;justify-content:center;color:#111;font-size:12px;"><i class="fas fa-gamepad"></i></div>
                </div>
                <div class="activity-details">
                    <div class="activity-name">${act.name}</div>
                    ${act.details ? `<div class="activity-state">${act.details}</div>` : ''}
                    ${act.state ? `<div class="activity-details-text">${act.state}</div>` : ''}
                    ${timeString ? `<div class="activity-time">${timeString}</div>` : ''}
                </div>
            </div>`;
    }

    // Streaming (type 1)
    if (act.type === 1) {
        return `
            <div class="activity-item">
                <div class="activity-icon-container">
                    <i class="fas fa-broadcast-tower" style="font-size:2rem;margin:15px;color:#9146FF;"></i>
                    <div class="activity-small-image" style="background:#9146FF;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;"><i class="fas fa-video"></i></div>
                </div>
                <div class="activity-details">
                    <div class="activity-name" style="color:#9146FF;">${act.name}</div>
                    ${act.details ? `<div class="activity-state">${act.details}</div>` : ''}
                    ${act.state ? `<div class="activity-details-text">${act.state}</div>` : ''}
                </div>
            </div>`;
    }

    // Generic fallback (Watching type 3, Competing type 5, etc.)
    const typeLabels = { 2: 'Listening to', 3: 'Watching', 5: 'Competing in' };
    const label = typeLabels[act.type] || '';
    return `
        <div class="activity-item">
            <div class="activity-icon-container">
                <i class="fas fa-circle-play" style="font-size:2rem;margin:15px;color:var(--secondary-color);"></i>
            </div>
            <div class="activity-details">
                <div class="activity-name">${label ? label + ' ' : ''}${act.name}</div>
                ${act.details ? `<div class="activity-state">${act.details}</div>` : ''}
                ${act.state ? `<div class="activity-details-text">${act.state}</div>` : ''}
            </div>
        </div>`;
}

function connectLanyard() {
    let dataReceived = false;
    const ws = new WebSocket('wss://api.lanyard.rest/socket');

    // Fallback: nếu sau 10 giây không nhận được data, hiện trạng thái offline
    const fallbackTimer = setTimeout(() => {
        if (!dataReceived) {
            const t = translations[currentLang];
            document.getElementById('lanyard-username').innerText = 'Takami Tenshi';
            document.getElementById('lanyard-activity').innerText = currentLang === 'vi' ? 'Chưa liên kết Lanyard' : 'Lanyard not linked';
            document.getElementById('lanyard-details').innerText = currentLang === 'vi' ? 'Join discord.gg/lanyard' : 'Join discord.gg/lanyard';
            document.getElementById('lanyard-status').className = 'discord-status-dot offline';
            document.getElementById('lanyard-avatar').src = 'https://ui-avatars.com/api/?name=Takami+Tenshi&background=1A1030&color=4DDDB8&size=160';
        }
    }, 10000);

    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.op === 1) {
            ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: DISCORD_ID } }));
            setInterval(() => ws.send(JSON.stringify({ op: 3 })), msg.d.heartbeat_interval);
        }
        if (msg.t === 'INIT_STATE' || msg.t === 'PRESENCE_UPDATE') {
            dataReceived = true;
            clearTimeout(fallbackTimer);
            updateDiscordUI(msg.d);
        }
    };

    ws.onclose = () => {
        setTimeout(connectLanyard, 5000);
    };

    ws.onerror = (err) => {
        console.error('Lanyard WS Error:', err);
    };
}

async function initViewCounter() {
    const viewCountEl = document.getElementById('view-count');
    if (!viewCountEl) return;

    const hasBeenCounted = sessionStorage.getItem('page_viewed');

    try {
        const url = hasBeenCounted ? '/api/views?increment=false' : '/api/views';
        const response = await fetch(url);
        if (!response.ok) throw new Error('API error');

        const data = await response.json();
        if (data && typeof data.count === 'number') {
            viewCountEl.textContent = data.count.toLocaleString();
            if (!hasBeenCounted) {
                sessionStorage.setItem('page_viewed', 'true');
            }
            localStorage.setItem('last_known_views', data.count.toString());
            return;
        }
    } catch (err) {
        console.warn('View counter fallback activated:', err.message);
        const fallbackValue = localStorage.getItem('last_known_views') || "0";
        viewCountEl.textContent = Number(fallbackValue.replace(/,/g, '')).toLocaleString();
    }
}

// Background Music Player Logic
function initMusicPlayer() {
    const audio = document.getElementById('bg-music');
    const toggleBtn = document.getElementById('music-toggle-btn');
    const panel = document.getElementById('music-content');
    const playPauseBtn = document.getElementById('music-play-pause');
    const volumeSlider = document.getElementById('music-volume');

    if (!audio || !toggleBtn) return;

    audio.volume = 0.3;
    let isPanelOpen = false;
    let isPlaying = false;

    audio.volume = 0;

    setTimeout(() => {
        audio.play().then(() => {
            isPlaying = true;
            updatePlayState();

            let vol = 0;
            const fadeInterval = setInterval(() => {
                if (vol < 0.3) {
                    vol += 0.05;
                    audio.volume = vol;
                    volumeSlider.value = vol;
                } else {
                    clearInterval(fadeInterval);
                }
            }, 100);

        }).catch(e => {
            console.log('Autoplay prevented, waiting for interaction...', e);
            audio.volume = 0.3;
            volumeSlider.value = 0.3;

            const attemptAutoPlay = () => {
                if (!isPlaying) {
                    audio.play().then(() => {
                        isPlaying = true;
                        updatePlayState();
                    }).catch(err => console.log('Autoplay prevented', err));
                }
                document.removeEventListener('click', attemptAutoPlay);
                document.removeEventListener('keydown', attemptAutoPlay);
                document.removeEventListener('scroll', attemptAutoPlay);
            };

            document.addEventListener('click', attemptAutoPlay);
            document.addEventListener('keydown', attemptAutoPlay);
            document.addEventListener('scroll', attemptAutoPlay, { once: true });
        });
    }, 500);

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (panel.classList.contains('active') && !panel.contains(e.target) && !toggleBtn.contains(e.target)) {
            panel.classList.remove('active');
        }
    });

    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
        } else {
            audio.play();
            isPlaying = true;
        }
        updatePlayState();
    });

    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value;
    });

    function updatePlayState() {
        if (!playPauseBtn || !toggleBtn) return;
        const icon = playPauseBtn.querySelector('i');
        const btnIcon = toggleBtn.querySelector('i');

        if (isPlaying) {
            if (icon) icon.className = 'fas fa-pause';
            toggleBtn.classList.add('playing');
            if (btnIcon) btnIcon.className = 'fas fa-compact-disc fa-spin';
        } else {
            if (icon) icon.className = 'fas fa-play';
            toggleBtn.classList.remove('playing');
            if (btnIcon) btnIcon.className = 'fas fa-music';
        }
    }
}

// =========================================================================
// MINECRAFT LIVE STATS
// =========================================================================
async function fetchMinecraftStats() {
    const statusEl = document.getElementById('mc-status');
    const statusTextEl = statusEl ? statusEl.querySelector('.status-text') : null;
    const playersEl = document.getElementById('mc-players');
    const versionEl = document.getElementById('mc-version');
    
    if (!statusEl || !playersEl || !versionEl) return;

    try {
        const response = await fetch('https://api.mcsrvstat.us/3/bucket.pikamc.vn:25172');
        const data = await response.json();

        if (data.online) {
            statusEl.className = 'status-indicator online';
            if (statusTextEl) {
                statusTextEl.setAttribute('data-vi', 'Online');
                statusTextEl.setAttribute('data-en', 'Online');
                statusTextEl.innerText = 'Online';
            }
            
            const onlinePlayers = data.players ? data.players.online : 0;
            const maxPlayers = data.players ? data.players.max : 0;
            playersEl.innerText = `${onlinePlayers}/${maxPlayers}`;
            
            versionEl.innerText = data.version || 'Unknown';
        } else {
            setMinecraftOffline(statusEl, statusTextEl, playersEl, versionEl);
        }
    } catch (error) {
        console.error('Failed to fetch Minecraft stats:', error);
        setMinecraftOffline(statusEl, statusTextEl, playersEl, versionEl);
    }
}

function setMinecraftOffline(statusEl, statusTextEl, playersEl, versionEl) {
    statusEl.className = 'status-indicator offline';
    if (statusTextEl) {
        statusTextEl.setAttribute('data-vi', 'Offline');
        statusTextEl.setAttribute('data-en', 'Offline');
        statusTextEl.innerText = 'Offline';
    }
    playersEl.innerText = '--/--';
    versionEl.innerText = '--';
}

// =========================================================================
// CUSTOM CURSOR
// =========================================================================
function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    const cursorGlow = document.getElementById('custom-cursor-glow');
    
    if (!cursor || !cursorGlow) return;

    // Only enable if pointer is fine (not a touch device)
    if (window.matchMedia("(pointer: fine)").matches) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            
            // Adding a slight delay for the glow for a trailing effect
            setTimeout(() => {
                cursorGlow.style.left = e.clientX + 'px';
                cursorGlow.style.top = e.clientY + 'px';
            }, 50);
        });

        // Add hover effect to clickable elements
        const clickables = document.querySelectorAll('a, button, input, select, textarea, .clickable, .discord-avatar-container');
        clickables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hovering');
                cursorGlow.classList.add('hovering');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hovering');
                cursorGlow.classList.remove('hovering');
            });
        });
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initCustomCursor();
    connectLanyard();
    initViewCounter();
    initMusicPlayer();
    
    // Minecraft Stats Fetching
    fetchMinecraftStats();
    setInterval(fetchMinecraftStats, 60000);

    // Toggle Status Bubble by clicking Avatar
    const avatarContainer = document.querySelector('.discord-avatar-container');
    const statusBubble = document.getElementById('lanyard-status-bubble');
    if (avatarContainer && statusBubble) {
        avatarContainer.addEventListener('click', () => {
            isBubbleManuallyHidden = !isBubbleManuallyHidden;
            if (isBubbleManuallyHidden) {
                statusBubble.classList.remove('show');
            } else {
                if (currentLanyardData && currentLanyardData.activities) {
                    const customAct = currentLanyardData.activities.find(a => a.type === 4);
                    if (customAct && customAct.state && currentLanyardData.discord_status !== 'offline') {
                        statusBubble.classList.add('show');
                    }
                }
            }
        });
    }
});
