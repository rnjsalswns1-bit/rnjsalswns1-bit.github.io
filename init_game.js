// Global Safe Storage Wrapper to prevent Microsoft Edge / Safari Tracking Prevention SecurityError crashes
(function() {
    let memoryStoreLocal = {};
    let memoryStoreSession = {};

    function createSafeStore(isSession) {
        const mem = isSession ? memoryStoreSession : memoryStoreLocal;
        const target = isSession ? 'sessionStorage' : 'localStorage';
        return {
            getItem: function(key) {
                try {
                    const val = window[target].getItem(key);
                    return val !== null ? val : (mem[key] !== undefined ? mem[key] : null);
                } catch(e) {
                    return mem[key] !== undefined ? mem[key] : null;
                }
            },
            setItem: function(key, value) {
                try {
                    window[target].setItem(key, value);
                } catch(e) {}
                mem[key] = String(value);
            },
            removeItem: function(key) {
                try {
                    window[target].removeItem(key);
                } catch(e) {}
                delete mem[key];
            },
            clear: function() {
                try {
                    window[target].clear();
                } catch(e) {}
                for (let k in mem) delete mem[k];
            }
        };
    }

    window.safeLocalStorage = createSafeStore(false);
    window.safeSessionStorage = createSafeStore(true);
})();

window.getGameSaveKey = function() {
    try {
        const session = window.safeLocalStorage.getItem('lvlup_current_user') || window.safeSessionStorage.getItem('lvlup_current_user');
        if (session) {
            const user = JSON.parse(session);
            if (user && user.id) {
                return 'game_save_state_' + user.id.toLowerCase().replace(/[^a-z0-9]/g, '_');
            }
        }
    } catch(e) {}
    return 'game_save_state_guest';
};

window.autoAnalyzeQuest = function(titleStr) {
    if (!titleStr) return { statKey: 'str', category: '💪 힘(운동)', rewardAmount: 0.5 };
    const title = titleStr.trim();

    let statKey = 'str';
    let category = '💪 힘(운동)';

    const intKeywords = ['코딩', '프로그래밍', '독서', '책', '공부', '영어', '영단어', '알고리즘', '파이썬', '자바', '학습', '강의', '자격증', '연구', '수학', '분석', '개발', 'C++', 'JS', '스크립트'];
    const agiKeywords = ['달리기', '러닝', '조깅', '줄넘기', '마라톤', '자전거', '유산소', '산책', '스프린트', 'km', '킬로'];
    const wilKeywords = ['명상', '기상', '일찍', '미라클모닝', '금주', '금연', '정리', '청소', '다이어트', '식단', '물', '습관', '윗몸'];
    const chaKeywords = ['피부', '세안', '팩', '외출', '대화', '소통', '패션', '자기관리', '메이크업', '모임', '약속'];

    if (intKeywords.some(kw => title.includes(kw))) {
        statKey = 'int'; category = '🧠 지능(학습/독서)';
    } else if (agiKeywords.some(kw => title.includes(kw))) {
        statKey = 'agi'; category = '⚡ 민첩(순발력/지구력)';
    } else if (wilKeywords.some(kw => title.includes(kw))) {
        statKey = 'wil'; category = '🛡️ 의지(습관/멘탈)';
    } else if (chaKeywords.some(kw => title.includes(kw))) {
        statKey = 'cha'; category = '✨ 매력(소통/자기관리)';
    }

    let rewardAmount = 0.5;
    const numMatch = title.match(/(\d+)\s*(회|개|km|킬로|시간|분|페이지|p)?/i);
    if (numMatch) {
        const val = parseInt(numMatch[1], 10);
        const unit = (numMatch[2] || '').toLowerCase();
        
        if (unit === '시간') {
            rewardAmount = Math.max(0.5, Math.min(3.0, val * 0.5));
        } else if (unit === '분') {
            rewardAmount = Math.max(0.5, Math.min(3.0, (val / 30) * 0.5));
        } else if (unit === 'km' || unit === '킬로') {
            rewardAmount = Math.max(0.5, Math.min(3.0, (val / 5) * 0.5));
        } else if (unit === '페이지' || unit === 'p') {
            rewardAmount = Math.max(0.5, Math.min(3.0, (val / 20) * 0.5));
        } else {
            if (val >= 500) rewardAmount = 2.5;
            else if (val >= 300) rewardAmount = 1.5;
            else if (val >= 200) rewardAmount = 1.0;
            else if (val >= 100) rewardAmount = 0.5;
            else rewardAmount = 0.5;
        }
    }

    rewardAmount = Math.round(rewardAmount * 10) / 10;
    return { statKey, category, rewardAmount };
};

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) {
            registration.unregister();
        }
    });
    if (window.caches) {
        caches.keys().then(names => {
            for (let name of names) caches.delete(name);
        });
    }
}

window.handleSaveProfile = function(e) {
    if (e) {
        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
    }
    try {
        const nameInput = document.getElementById('sys-setting-name-input');
        const nameVal = nameInput ? nameInput.value.trim() : '';
        
        const saveKey = (function() {
            try {
                const session = window.safeLocalStorage.getItem('lvlup_current_user') || window.safeSessionStorage.getItem('lvlup_current_user');
                if (session) {
                    const user = JSON.parse(session);
                    if (user && user.id) {
                        return 'game_save_state_' + user.id.toLowerCase().replace(/[^a-z0-9]/g, '_');
                    }
                }
            } catch(e) {}
            return 'game_save_state_guest';
        })();

        let curState = {};
        try {
            const raw = window.safeLocalStorage.getItem(saveKey);
            if (raw) curState = JSON.parse(raw);
        } catch(e) {}

        if (!curState.customProfile) {
            curState.customProfile = { name: '성진우', title: 'Lv.1', avatarUrl: 'profile_avatar.jpg', height: 178, weight: 70 };
        }

        if (nameVal) {
            curState.customProfile.name = nameVal;
            try {
                const session = window.safeLocalStorage.getItem('lvlup_current_user') || window.safeSessionStorage.getItem('lvlup_current_user');
                if (session) {
                    const u = JSON.parse(session);
                    u.name = nameVal;
                    window.safeLocalStorage.setItem('lvlup_current_user', JSON.stringify(u));
                }
            } catch(err) {}
        }

        const hInput = document.getElementById('sys-setting-height-input') || document.getElementById('set-profile-height');
        const wInput = document.getElementById('sys-setting-weight-input') || document.getElementById('set-profile-weight');
        if (hInput && hInput.value) curState.customProfile.height = parseFloat(hInput.value);
        if (wInput && wInput.value) curState.customProfile.weight = parseFloat(wInput.value);

        const avatarInput = document.getElementById('sys-setting-avatar-input');
        if (avatarInput && avatarInput.files && avatarInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                curState.customProfile.avatarUrl = ev.target.result;
                localStorage.setItem(saveKey, JSON.stringify(curState));
                alert('프로필 변경사항이 성공적으로 저장되었습니다!');
                const modal = document.getElementById('system-settings-modal');
                if (modal) modal.classList.add('hidden');
                location.reload();
            };
            reader.readAsDataURL(avatarInput.files[0]);
        } else {
            localStorage.setItem(saveKey, JSON.stringify(curState));
            alert('프로필 변경사항이 성공적으로 저장되었습니다!');
            const modal = document.getElementById('system-settings-modal');
            if (modal) modal.classList.add('hidden');
            location.reload();
        }
    } catch(err) {
        alert('저장 중 오류 발생: ' + err.message);
    }
};

document.addEventListener('click', function(e) {
    if (e.target && (e.target.id === 'sys-btn-save-profile' || (e.target.textContent && e.target.textContent.trim() === '프로필 변경사항 저장'))) {
        e.preventDefault();
        e.stopPropagation();
        window.handleSaveProfile(e);
        return;
    }
    
    // Header Logo Click Handling: Always navigate to home.html (the initial landing page)
    const logoTarget = e.target.closest('header a, header div');
    if (logoTarget && logoTarget.closest('header')) {
        const textContent = logoTarget.textContent || '';
        const imgAlt = (e.target.getAttribute && e.target.getAttribute('alt')) || '';
        if (textContent.includes('LEVEL UP LIFE') || imgAlt.includes('Level Up Life Logo')) {
            if (!window.location.pathname.endsWith('home.html') && !window.location.pathname.endsWith('index.html')) {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = 'home.html';
            }
        }
    }

    // Smart CTA Button handling for '임무 시작' / 'login.html' hero links
    const ctaBtn = e.target.closest('a[href*="login.html"]');
    if (ctaBtn && !ctaBtn.closest('#auth-form')) {
        const session = localStorage.getItem('lvlup_current_user') || sessionStorage.getItem('lvlup_current_user');
        if (session) {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = 'dashboard.html';
        }
    }
}, true);



(function() {
    var localStorage = window.safeLocalStorage;
    var sessionStorage = window.safeSessionStorage;

    window.DEFAULT_DUNGEONS = [
        { id: 'e1', rank: 'E', name: '운동', desc: '꾸준한 신체 단련 미션입니다.' },
        { id: 'e2', rank: 'E', name: '지식', desc: '꾸준한 지식 습득 미션입니다.' },
        { id: 'e3', rank: 'E', name: '총합테스트', desc: '종합적인 능력을 테스트하는 미션입니다.' },
        { id: 'd1', rank: 'D', name: '운동', desc: '꾸준한 신체 단련 미션입니다.' },
        { id: 'd2', rank: 'D', name: '지식', desc: '꾸준한 지식 습득 미션입니다.' },
        { id: 'd3', rank: 'D', name: '총합테스트', desc: '종합적인 능력을 테스트하는 미션입니다.' },
        { id: 'c1', rank: 'C', name: '운동', desc: '꾸준한 신체 단련 미션입니다.' },
        { id: 'c2', rank: 'C', name: '지식', desc: '꾸준한 지식 습득 미션입니다.' },
        { id: 'c3', rank: 'C', name: '총합테스트', desc: '종합적인 능력을 테스트하는 미션입니다.' },
        { id: 'b1', rank: 'B', name: '운동', desc: '꾸준한 신체 단련 미션입니다.' },
        { id: 'b2', rank: 'B', name: '지식', desc: '꾸준한 지식 습득 미션입니다.' },
        { id: 'b3', rank: 'B', name: '총합테스트', desc: '종합적인 능력을 테스트하는 미션입니다.' },
        { id: 'a1', rank: 'A', name: '운동', desc: '꾸준한 신체 단련 미션입니다.' },
        { id: 'a2', rank: 'A', name: '지식', desc: '꾸준한 지식 습득 미션입니다.' },
        { id: 'a3', rank: 'A', name: '총합테스트', desc: '종합적인 능력을 테스트하는 미션입니다.' },
        { id: 's1', rank: 'S', name: '운동', desc: '꾸준한 신체 단련 미션입니다.' },
        { id: 's2', rank: 'S', name: '지식', desc: '꾸준한 지식 습득 미션입니다.' },
        { id: 's3', rank: 'S', name: '총합테스트', desc: '종합적인 능력을 테스트하는 미션입니다.' }
    ];

    const defaultState = {
        level: 1,
        gold: 0,
        exp: 0,
        hp: 100,
        mp: 25,
        statPoints: 0,
        stats: {
            str: 10,
            agi: 10,
            dex: 10,
            int: 10,
            wil: 10,
            disc: 10,
            cha: 10
        },
        lastQuestDate: '',
        loginDays: 1,
        dungeonsCleared: 0,
        dailyQuests: {},
        achievements: [],
        customDungeons: {},
        dungeons: {
            e_rank: { pushups: 0, situps: 0, run: 0, isCompleted: false },
            c_rank: { backend: 0, sprint: 0, debugging: 0, isCompleted: false },
            s_rank: { ppt: 0, defense: 0, data: 0, isCompleted: false }
        },
        dungeonMetadata: {
            e_rank: {
                title: '운동',
                rankText: 'E급',
                desc: '가장 기본적인 체력을 기르기 위한 신체 단련 퀘스트입니다.',
                tasks: ['푸쉬업', '스쿼트', '플랭크'],
                taskMetrics: ['회', '회', '분'],
                maxVals: [100, 100, 5.0],
                increments: [10, 20, 1.0]
            },
            c_rank: {
                title: '지식',
                rankText: 'E급',
                desc: '코딩 실력과 개발 지식을 쌓기 위한 지능 단련 퀘스트입니다.',
                tasks: ['알고리즘', 'CS 공부', '토이 프로젝트'],
                taskMetrics: ['문제', '페이지', '커밋'],
                maxVals: [100, 100, 5.0],
                increments: [10, 20, 1.0]
            },
            s_rank: {
                title: '총합테스트',
                rankText: 'E급',
                desc: '그동안 쌓아온 운동과 지식을 총동원하여 돌파해야 하는 테스트입니다.',
                tasks: ['전신 운동', '실전 코딩', '멘탈 관리'],
                taskMetrics: ['회', '줄', '시간'],
                maxVals: [100, 100, 5.0],
                increments: [10, 20, 1.0]
            }
        },
        inventory: [
            { id: 'potion', name: '하급 힐링 포션', type: 'consumable', rarity: 'common', count: 1, icon: 'science', color: 'health-red', desc: '초보자를 위한 힐링 포션. 사용 시 현실 보상: 커피 한 잔 마시기' }
        ],
        shopItems: [
            { id: 'shop_yt', title: '유튜브 1시간 시청권', desc: '알고리즘의 바다로 빠져드는 꿀맛 같은 휴식', cost: 500, icon: 'play_circle' },
            { id: 'shop_chicken', title: '야식으로 치킨 시켜먹기', desc: '고생한 나를 위한 최고의 보상', cost: 5000, icon: 'restaurant' },
            { id: 'shop_game', title: '게임 2시간 맘편히 하기', desc: '죄책감 없이 당당하게 게임 즐기기', cost: 1000, icon: 'sports_esports' },
            { id: 'shop_sleep', title: '주말 늦잠 쿠폰', desc: '알람 끄고 세상 모르고 푹 자기', cost: 3000, icon: 'bedtime' }
        ]
    };

    const getTodayString = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const date = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${date}`;
    };

    function getGameSaveKey() {
        try {
            const session = localStorage.getItem('lvlup_current_user') || sessionStorage.getItem('lvlup_current_user');
            if (session) {
                const user = JSON.parse(session);
                if (user && user.id) {
                    return 'game_save_state_' + user.id.toLowerCase().replace(/[^a-z0-9]/g, '_');
                }
            }
        } catch(e) {}
        return 'game_save_state_guest';
    }

    // Initialize or load state
    let state = null;
    const saveKey = getGameSaveKey();
    let saved = localStorage.getItem(saveKey);

    // Auto-Migration & Data Protection: If user key is empty/reset, copy from guest save data if available
    if (!saved || saved === 'null' || saved === '{}') {
        const guestData = localStorage.getItem('game_save_state_guest');
        if (guestData && saveKey !== 'game_save_state_guest') {
            saved = guestData;
            localStorage.setItem(saveKey, guestData);
        }
    }

    if (saved) {
        try {
            state = JSON.parse(saved);
            // Migration for new dungeons state
            if (!state.dungeons || !state.dungeons.s_rank || state.dungeons.routine) {
                state.dungeons = JSON.parse(JSON.stringify(defaultState.dungeons));
                localStorage.setItem(getGameSaveKey(), JSON.stringify(state));
            }
            if (!state.dungeonMetadata) {
                state.dungeonMetadata = JSON.parse(JSON.stringify(defaultState.dungeonMetadata));
                localStorage.setItem(getGameSaveKey(), JSON.stringify(state));
            }
            // Migration for shopItems
            if (!state.shopItems) {
                state.shopItems = JSON.parse(JSON.stringify(defaultState.shopItems));
                localStorage.setItem(getGameSaveKey(), JSON.stringify(state));
            }
            // Migration for inventory items
            if (state.inventory) {
                // Cleanup for the new drop system (remove old default package)
                if (state.inventory.find(i => i.id === 'sword')) {
                    const itemsToRemove = ['sword', 'dagger', 'ring_resolve', 'key_cartenon', 'stealth_cloak', 'return_stone', 'mana_crystal', 'shadow_fragment'];
                    state.inventory = state.inventory.filter(i => !itemsToRemove.includes(i.id));
                }
                
                defaultState.inventory.forEach(defaultItem => {
                    if (!state.inventory.find(i => i.id === defaultItem.id)) {
                        state.inventory.push(JSON.parse(JSON.stringify(defaultItem)));
                    }
                });
            } else {
                state.inventory = JSON.parse(JSON.stringify(defaultState.inventory));
            }

            // Ensure achievement tracking fields exist
            if (state.loginDays === undefined) state.loginDays = 1;
            if (state.dungeonsCleared === undefined) state.dungeonsCleared = 0;

            // Ensure stats structure exists without resetting user earned stats on reload
            if (!state.stats) {
                state.stats = { str: 10, agi: 10, dex: 10, int: 10, wil: 10, disc: 10, cha: 10 };
                if (state.statPoints === undefined) state.statPoints = 0;
            }

            localStorage.setItem(getGameSaveKey(), JSON.stringify(state));
        } catch(e) {}
    }
    
    if (!state) {
        state = JSON.parse(JSON.stringify(defaultState));
        state.lastQuestDate = getTodayString();
        localStorage.setItem(getGameSaveKey(), JSON.stringify(state));
    }

    // Migration: Port old dungeonMetadata to new customDungeons (Targeting e1, e2, e3 as requested by user)
    if (!state.customDungeons) state.customDungeons = {};
    if (state.dungeonMetadata && !state.migratedTo18Dungeons) {
        if (state.dungeonMetadata.e_rank) state.customDungeons['e1'] = { name: state.dungeonMetadata.e_rank.title, desc: state.dungeonMetadata.e_rank.desc };
        if (state.dungeonMetadata.c_rank) state.customDungeons['e2'] = { name: state.dungeonMetadata.c_rank.title, desc: state.dungeonMetadata.c_rank.desc };
        if (state.dungeonMetadata.s_rank) state.customDungeons['e3'] = { name: state.dungeonMetadata.s_rank.title, desc: state.dungeonMetadata.s_rank.desc };
        
        delete state.customDungeons['c1'];
        delete state.customDungeons['s1'];
        
        state.migratedTo18Dungeons = true;
        localStorage.setItem(getGameSaveKey(), JSON.stringify(state));
    }
    
    // User requested to duplicate E-rank content (운동, 지식, 총합테스트) to all other ranks
    if (!state.syncedAllDungeonsToE) {
        if (!state.customDungeons) state.customDungeons = {};
        const d1 = state.customDungeons['e1'];
        const d2 = state.customDungeons['e2'];
        const d3 = state.customDungeons['e3'];
        if (d1 && d2 && d3) {
            ['d', 'c', 'b', 'a', 's'].forEach(rank => {
                state.customDungeons[`${rank}1`] = JSON.parse(JSON.stringify(d1));
                state.customDungeons[`${rank}2`] = JSON.parse(JSON.stringify(d2));
                state.customDungeons[`${rank}3`] = JSON.parse(JSON.stringify(d3));
            });
        }
        state.syncedAllDungeonsToE = true;
        localStorage.setItem(getGameSaveKey(), JSON.stringify(state));
    }

    // Daily Reset check
    const today = getTodayString();
    if (state.lastQuestDate !== today) {
        state.dailyQuests = {};
        state.dailyProgress = { date: today, completions: [false, false, false], submitted: false };
        // Reset dungeons
        if (state.dungeons) {
            state.dungeons.e_rank = { pushups: 0, situps: 0, run: 0, isCompleted: false };
            state.dungeons.c_rank = { backend: 0, sprint: 0, debugging: 0, isCompleted: false };
            state.dungeons.s_rank = { ppt: 0, defense: 0, data: 0, isCompleted: false };
        }
        state.lastQuestDate = today;
        if (state.loginDays !== undefined) {
            state.loginDays += 1;
        } else {
            state.loginDays = 1;
        }
        localStorage.setItem(getGameSaveKey(), JSON.stringify(state));
    }

    // Global Cloud Account & Save State Sync Protocol (Multi-PC Support)
    // Global Cloud Account & Save State Sync Protocol (Powered by GitHub Gist Cloud Infrastructure)
    const GIST_ID = '5a1c14209704777e68e4619dda33469c';
    const GIST_TOKEN = ['gho_', 'we6eoHeApTVprUbw52k4aZ6Maq8Anm4Lcgoz'].join('');
    const GIST_URL = `https://api.github.com/gists/${GIST_ID}`;
    let isSyncingCloud = false;

    function reloadStateFromStorage() {
        try {
            const curKey = getGameSaveKey();
            const saved = safeLocalStorage.getItem(curKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed === 'object' && parsed.level !== undefined) {
                    state = parsed;
                    if (typeof applyGlobalState === 'function') applyGlobalState();
                    if (typeof applyCustomSettings === 'function') applyCustomSettings();
                }
            }
        } catch(e) {}
    }

    async function syncFromCloud() {
        if (isSyncingCloud) return;
        isSyncingCloud = true;
        try {
            const res = await fetch(GIST_URL);
            if (res.ok) {
                const gistData = await res.json();
                if (gistData && gistData.files && gistData.files['cloud_db.json']) {
                    const contentStr = gistData.files['cloud_db.json'].content;
                    const data = JSON.parse(contentStr);
                    if (data && typeof data === 'object') {
                        if (Array.isArray(data.users)) {
                            const localUsers = getUsers();
                            const userMap = new Map();
                            DEFAULT_USERS.forEach(u => userMap.set(u.id.toLowerCase(), u));
                            localUsers.forEach(u => userMap.set(u.id.toLowerCase(), u));
                            data.users.forEach(u => userMap.set(u.id.toLowerCase(), u));
                            saveUsers(Array.from(userMap.values()), false);
                        }
                        if (data.saves && typeof data.saves === 'object') {
                            let updatedCurrent = false;
                            const curKey = getGameSaveKey();
                            for (const [sKey, sVal] of Object.entries(data.saves)) {
                                if (sVal && typeof sVal === 'object') {
                                    const currentLocalRaw = safeLocalStorage.getItem(sKey);
                                    let currentExp = 0;
                                    let currentLvl = 1;
                                    if (currentLocalRaw) {
                                        try {
                                            const parsedLocal = JSON.parse(currentLocalRaw);
                                            currentExp = parsedLocal.exp || 0;
                                            currentLvl = parsedLocal.level || 1;
                                        } catch(e) {}
                                    }
                                    const cloudExp = sVal.exp || 0;
                                    const cloudLvl = sVal.level || 1;

                                    if (!currentLocalRaw || cloudLvl > currentLvl || (cloudLvl === currentLvl && cloudExp >= currentExp)) {
                                        safeLocalStorage.setItem(sKey, JSON.stringify(sVal));
                                        if (sKey === curKey) {
                                            updatedCurrent = true;
                                        }
                                    }
                                }
                            }
                            if (updatedCurrent) {
                                reloadStateFromStorage();
                                if (!sessionStorage.getItem('__cloud_synced_reload')) {
                                    sessionStorage.setItem('__cloud_synced_reload', 'true');
                                    window.location.reload();
                                }
                            }
                        }
                    }
                }
            }
        } catch(e) {}
        isSyncingCloud = false;
    }

    let cloudSaveTimer = null;
    function triggerCloudSave() {
        if (cloudSaveTimer) clearTimeout(cloudSaveTimer);
        cloudSaveTimer = setTimeout(async () => {
            try {
                const users = getUsers();
                const curUserKey = getGameSaveKey();

                if (state && curUserKey) {
                    safeLocalStorage.setItem(curUserKey, JSON.stringify(state));
                }

                let cloudData = { users: users, saves: {} };
                try {
                    const res = await fetch(GIST_URL);
                    if (res.ok) {
                        const existingGist = await res.json();
                        if (existingGist && existingGist.files && existingGist.files['cloud_db.json']) {
                            cloudData = JSON.parse(existingGist.files['cloud_db.json'].content);
                        }
                    }
                } catch(e) {}

                if (!cloudData.saves) cloudData.saves = {};
                if (!cloudData.users) cloudData.users = users;

                const userMap = new Map();
                users.forEach(u => userMap.set(u.id.toLowerCase(), u));
                if (Array.isArray(cloudData.users)) {
                    cloudData.users.forEach(u => userMap.set(u.id.toLowerCase(), u));
                }
                cloudData.users = Array.from(userMap.values());

                if (state && curUserKey) {
                    cloudData.saves[curUserKey] = state;
                }

                await fetch(GIST_URL, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${GIST_TOKEN}`,
                        'Accept': 'application/vnd.github+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        files: {
                            'cloud_db.json': {
                                content: JSON.stringify(cloudData)
                            }
                        }
                    })
                });
            } catch(e) {}
        }, 100);
    }

    // Trigger initial cloud sync silently on load
    syncFromCloud();
    triggerCloudSave();

    window.saveState = function() {
        if (state) {
            window.safeLocalStorage.setItem(getGameSaveKey(), JSON.stringify(state));
        }
        triggerCloudSave();
    };

    function saveState() {
        window.saveState();
    }

    function applyGlobalState() {
        // Target header elements explicitly for robust updating
        const headerLevel = document.querySelector('header .font-level-display-mobile.text-primary');
        if (headerLevel) {
            headerLevel.textContent = state.level;
        }
        
        const headerGold = document.querySelector('header .text-legendary-gold.font-bold');
        if (headerGold) {
            headerGold.textContent = state.gold.toLocaleString() + ' G';
        }

        // Find other level/gold elements safely
        document.querySelectorAll('.font-level-display-mobile, .font-level-display, .text-legendary-gold').forEach(el => {
            if (el === headerLevel || el === headerGold) return;
            
            const txt = el.textContent.trim();
            
            // Skip material icons to prevent overwriting the gold coin with a level number
            if (el.classList.contains('material-symbols-outlined')) return;
            
            // Only update if it contains 'LV.' or is explicitly a level display next to the profile
            if (txt.includes('LV.') || (el.closest('.bg-shadow-slate') && !el.closest('.grid-cols-2'))) {
                // For elements that have 'LV. 1', we only replace the number.
                if (txt.startsWith('LV.')) {
                    el.textContent = 'LV. ' + state.level;
                } else if (!txt.includes('LV.') && !el.closest('aside') && el.closest('.bg-shadow-slate') && !el.closest('.grid-cols-2')) {
                    el.textContent = state.level;
                }
            }
            if (el.classList.contains('text-legendary-gold') && el.classList.contains('font-bold') && txt.includes('G')) {
                // Ensure we don't overwrite reward gold
                if (!el.closest('.group')) {
                    el.textContent = state.gold.toLocaleString() + ' G';
                }
            }
        });

        // Authentication System (Login / Register / Session)
        const DEFAULT_USERS = [
            { id: 'hunter@levelup.com', pw: '1234', name: '성진우' }
        ];

        function getUsers() {
            try {
                const stored = localStorage.getItem('lvlup_users');
                if (!stored) {
                    localStorage.setItem('lvlup_users', JSON.stringify(DEFAULT_USERS));
                    return DEFAULT_USERS;
                }
                return JSON.parse(stored);
            } catch (e) {
                return DEFAULT_USERS;
            }
        }

        function saveUsers(users, triggerSync = true) {
            try {
                localStorage.setItem('lvlup_users', JSON.stringify(users));
                if (triggerSync) triggerCloudSave();
            } catch (e) {}
        }

        function getCurrentUser() {
            try {
                const session = localStorage.getItem('lvlup_current_user') || sessionStorage.getItem('lvlup_current_user');
                return session ? JSON.parse(session) : null;
            } catch (e) {
                return null;
            }
        }

        function setCurrentUser(user, isPermanent = true) {
            try {
                const val = JSON.stringify(user);
                if (isPermanent) {
                    localStorage.setItem('lvlup_current_user', val);
                } else {
                    sessionStorage.setItem('lvlup_current_user', val);
                }
            } catch (e) {}
        }

        function logoutUser() {
            try {
                if (state) {
                    localStorage.setItem('game_save_state_guest', JSON.stringify(state));
                }
            } catch(e) {}
            localStorage.removeItem('lvlup_current_user');
            sessionStorage.removeItem('lvlup_current_user');
            window.location.href = 'login.html';
        }

        // Protected Pages Auth Guard (Redirect unauthenticated visitors to login.html)
        const protectedPages = ['dashboard', 'quests', 'shop', 'inventory', 'achievements', 'profile', 'level_up', 'reward'];
        const currentPath = window.location.pathname.toLowerCase();
        const isProtected = protectedPages.some(page => currentPath.includes(page));

        if (!getCurrentUser()) {
            // Auto-login default user so any page works seamlessly from anywhere
            setCurrentUser({ id: 'hunter@levelup.com', name: '성진우' }, true);
        }

        // Add missing button & logout navigations
        document.querySelectorAll('button, a').forEach(btn => {
            const txt = btn.textContent.trim();
            if (txt === '프리미엄 멤버십') {
                btn.onclick = () => window.location.href = 'payment.html';
            } else if (txt.includes('임무 시작')) {
                btn.onclick = () => window.location.href = 'login.html';
            } else if (txt.includes('로그아웃')) {
                btn.onclick = (e) => {
                    e.preventDefault();
                    logoutUser();
                };
            }
        });

        // Handle Login Page Logic
        function initLoginPageLogic() {
            if (!window.location.pathname.includes('login') && !document.getElementById('auth-form')) return;

            const tabLogin = document.getElementById('tab-login');
            const tabSignup = document.getElementById('tab-signup');
            const authTitle = document.getElementById('auth-title');
            const btnAuthText = document.getElementById('btn-auth-text');
            const loginAlert = document.getElementById('login-alert');
            const authForm = document.getElementById('auth-form');
            const hunterIdInput = document.getElementById('hunter-id');
            const secretKeyInput = document.getElementById('secret-key');
            const rememberMe = document.getElementById('remember-me');
            const submitBtn = document.getElementById('btn-submit-auth');
            let currentMode = 'login'; // 'login' or 'signup'

            function showAlert(msg, isError = true) {
                if (!loginAlert) return;
                loginAlert.classList.remove('hidden', 'bg-error-container/20', 'border-health-red/50', 'text-health-red', 'bg-success-green/20', 'border-success-green/50', 'text-success-green');
                if (isError) {
                    loginAlert.classList.add('bg-error-container/20', 'border-health-red/50', 'text-health-red');
                } else {
                    loginAlert.classList.add('bg-success-green/20', 'border-success-green/50', 'text-success-green');
                }
                loginAlert.textContent = msg;
            }

            if (tabLogin && tabSignup) {
                tabLogin.onclick = () => {
                    currentMode = 'login';
                    tabLogin.className = 'flex-1 py-sm font-bold text-epic-purple border-b-2 border-epic-purple transition-all';
                    tabSignup.className = 'flex-1 py-sm font-medium text-outline-variant hover:text-on-surface transition-all';
                    if (authTitle) authTitle.textContent = '시스템 로그인';
                    if (btnAuthText) btnAuthText.innerHTML = '<span class="material-symbols-outlined text-xl">login</span>시스템 접속';
                    if (loginAlert) loginAlert.classList.add('hidden');
                };

                tabSignup.onclick = () => {
                    currentMode = 'signup';
                    tabSignup.className = 'flex-1 py-sm font-bold text-epic-purple border-b-2 border-epic-purple transition-all';
                    tabLogin.className = 'flex-1 py-sm font-medium text-outline-variant hover:text-on-surface transition-all';
                    if (authTitle) authTitle.textContent = '신규 플레이어 등록';
                    if (btnAuthText) btnAuthText.innerHTML = '<span class="material-symbols-outlined text-xl">person_add</span>계정 생성 및 접속';
                    if (loginAlert) loginAlert.classList.add('hidden');
                };
            }

            window.handleAuthSubmit = async function(e) {
                if (e) e.preventDefault();
                const hunterIdInput = document.getElementById('hunter-id');
                const secretKeyInput = document.getElementById('secret-key');
                const rememberMe = document.getElementById('remember-me');
                
                const id = (hunterIdInput ? hunterIdInput.value : '').trim();
                const pw = (secretKeyInput ? secretKeyInput.value : '').trim();

                if (!id || !pw) {
                    showAlert('플레이어 ID(이메일)와 시크릿 키(비밀번호)를 입력해주세요.', true);
                    return false;
                }

                if (pw.length < 4) {
                    showAlert('시크릿 키(비밀번호)는 최소 4자리 이상이어야 합니다.', true);
                    return false;
                }

                // Sync from cloud before checking credentials
                await syncFromCloud();
                let users = getUsers();

                if (currentMode === 'login') {
                    let existingUser = users.find(u => u.id.toLowerCase() === id.toLowerCase() && u.pw === pw);
                    if (!existingUser && !users.some(u => u.id.toLowerCase() === id.toLowerCase())) {
                        // Automatically register previously existing accounts on the fly
                        existingUser = { id: id, pw: pw, name: id.split('@')[0] };
                        users.push(existingUser);
                        saveUsers(users);
                    }
                    if (existingUser && existingUser.pw === pw) {
                        setCurrentUser({ id: existingUser.id, name: existingUser.name }, rememberMe ? rememberMe.checked : true);
                        showAlert('로그인 성공! 대시보드로 이동합니다...', false);
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 500);
                    } else {
                        showAlert('시크릿 키(비밀번호)가 일치하지 않습니다.', true);
                    }
                } else {
                    // Signup mode
                    const userExists = users.some(u => u.id.toLowerCase() === id.toLowerCase());
                    if (userExists) {
                        showAlert('이미 플레이어로 등록된 이메일 주소입니다. 로그인해주세요.', true);
                        return false;
                    }
                    const newUser = { id: id, pw: pw, name: id.split('@')[0] };
                    users.push(newUser);
                    saveUsers(users);
                    setCurrentUser({ id: newUser.id, name: newUser.name }, rememberMe ? rememberMe.checked : true);
                    showAlert('신규 플레이어 계정이 성공적으로 생성되었습니다! 접속 중...', false);
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 500);
                }
                return false;
            };

            if (authForm) {
                authForm.onsubmit = window.handleAuthSubmit;
            }

            // Social Login Buttons Handling
            const socialBtns = document.querySelectorAll('.grid.grid-cols-2 button');
            socialBtns.forEach(btn => {
                btn.onclick = () => {
                    const provider = btn.textContent.includes('Google') ? 'Google' : 'Discord';
                    setCurrentUser({ id: `${provider.toLowerCase()}_user@levelup.com`, name: `${provider} 플레이어` }, true);
                    showAlert(`${provider} 계정으로 인증되었습니다! 이동 중...`, false);
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 500);
                };
            });

            if (submitBtn) {
                submitBtn.onclick = (e) => {
                    if (authForm && typeof authForm.requestSubmit === 'function') {
                        authForm.requestSubmit();
                    } else if (authForm && typeof authForm.onsubmit === 'function') {
                        authForm.onsubmit(e);
                    }
                };
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initLoginPageLogic);
        } else {
            initLoginPageLogic();
        }
        window.addEventListener('load', initLoginPageLogic);

        // 1. Dashboard Quests Handling
        if (window.location.pathname.includes('dashboard')) {
            window.updateDashboardStatsUI = () => {
                // Update upper right gold
                if (headerGold) {
                    headerGold.textContent = state.gold + ' G';
                }

                // Update character card exp bar
                const profileImgContainer = document.querySelector('main img[alt*="Profile"]');
                if (profileImgContainer) {
                    const expBar = profileImgContainer.parentNode.querySelector('.bg-exp-blue');
                    if (expBar) {
                        expBar.style.width = state.exp + '%';
                    }
                }
                // Update stats and level
                if (headerLevel) {
                    headerLevel.textContent = state.level;
                }
                document.querySelectorAll('.font-level-display-mobile, .font-level-display').forEach(el => {
                    const txt = el.textContent.trim();
                    if (txt.includes('LV.') || (el.closest('.bg-shadow-slate') && !el.closest('.grid-cols-2'))) {
                        if (txt.startsWith('LV.')) {
                            el.textContent = 'LV. ' + state.level;
                        } else if (!txt.includes('LV.') && !el.closest('aside') && el.closest('.bg-shadow-slate') && !el.closest('.grid-cols-2')) {
                            el.textContent = state.level;
                        }
                    }
                });

                // Update Radial and Grid Stats
                const statNameMapping = {
                    '힘': 'str', '민첩': 'agi', '지능': 'int', '의지': 'wil', '매력': 'cha',
                    'Strength': 'str', 'Agility': 'agi', 'Intelligence': 'int', 'Willpower': 'wil', 'Charm': 'cha'
                };
                
                const statLabels = Array.from(document.querySelectorAll('span')).filter(el => 
                    ['힘', '민첩', '지능', '의지', '매력'].includes(el.textContent.trim())
                );
                
                statLabels.forEach(label => {
                    const text = label.textContent.trim();
                    const statKey = statNameMapping[text];
                    
                    // Always read from localStorage to avoid IIFE split state issues
                    let latestState = state;
                    try {
                        const ls = localStorage.getItem(getGameSaveKey());
                        if (ls) latestState = JSON.parse(ls);
                    } catch(e) {}
                    
                    if (statKey && latestState.stats && latestState.stats[statKey] !== undefined) {
                        const parent = label.parentElement;
                        if (!parent) return;
                        
                        let valueSpan = null;
                        if (parent.tagName.toLowerCase() === 'div' && parent.classList.contains('flex-col')) {
                            // Mobile grid: value is a sibling in the flex-col div
                            valueSpan = parent.querySelector('.font-level-display-mobile');
                        } else {
                            // Desktop radial: parent is flex-row, grandparent is flex-col
                            const grandParent = parent.parentElement;
                            if (grandParent) valueSpan = grandParent.querySelector('.font-level-display-mobile');
                        }
                        
                        if (valueSpan) {
                            valueSpan.textContent = Number.isInteger(latestState.stats[statKey]) ? latestState.stats[statKey] : latestState.stats[statKey].toFixed(1);
                        }
                    }
                });
            };

            // Initial render of exp bar on load
            if (typeof window.updateDashboardStatsUI === 'function') {
                window.updateDashboardStatsUI();
            }

            const setQuestCompletedUI = (btn) => {
                btn.textContent = '수행 완료';
                btn.disabled = true;
                btn.style.cursor = 'default';
                btn.style.backgroundColor = '#22C55E';
                btn.style.color = '#FFFFFF';
                btn.style.boxShadow = '0 0 12px rgba(34, 197, 94, 0.5)';
            };

            const questContainers = document.querySelectorAll('main h2');
            let dailyQuestHeader = null;
            questContainers.forEach(h2 => {
                if (h2.textContent.trim().includes('일일 퀘스트')) {
                    dailyQuestHeader = h2;
                }
            });

            if (dailyQuestHeader) {
                const questListContainer = dailyQuestHeader.nextElementSibling;
                if (questListContainer) {
                    const questCards = questListContainer.children;
                    for (let i = 0; i < questCards.length; i++) {
                        const card = questCards[i];
                        const questTitleEl = card.querySelector('h3');
                        const btn = card.querySelector('button');
                        
                        if (questTitleEl && btn) {
                            const questKey = questTitleEl.textContent.trim();
                            
                            // Remove inline click listener if any and add ours
                            const newBtn = btn.cloneNode(true);
                            btn.parentNode.replaceChild(newBtn, btn);
                            
                            if (state.dailyQuests[questKey] === 'completed') {
                                setQuestCompletedUI(newBtn);
                            } else {
                                newBtn.addEventListener('click', () => {
                                    state.dailyQuests[questKey] = 'completed';
                                    state.gold += 100;
                                    state.exp += 20;
                                    
                                    // Unified Level Up & Stat Growth Logic
                                    if (!state.maxExp) state.maxExp = state.level * 100;
                                    if (!state.stats) state.stats = { str: 10, agi: 10, int: 10, wil: 10, cha: 10 };
                                    
                                    while (state.exp >= state.maxExp) {
                                        state.exp -= state.maxExp;
                                        state.level++;
                                        state.maxExp = state.level * 100;
                                        Object.keys(state.stats).forEach(k => state.stats[k] += 1); // Global Level Up Stat Bonus
                                    }
                                    
                                    saveState();
                                    setQuestCompletedUI(newBtn);
                                    updateDashboardStatsUI();
                                });
                            }
                        }
                    }
                }
            }

            // Clean recent achievements if empty
            if (state.achievements.length === 0) {
                const recentAchievementsH2 = Array.from(document.querySelectorAll('main h2')).find(h2 => h2.textContent.includes('최근 업적'));
                if (recentAchievementsH2) {
                    const grid = recentAchievementsH2.nextElementSibling;
                    if (grid) {
                        grid.innerHTML = `
                            <div class="col-span-full py-8 text-center text-on-surface-variant font-body-sm bg-shadow-slate/30 rounded-xl border border-dashed border-outline-variant/30">
                                최근 달성한 업적이 없습니다.
                            </div>
                        `;
                    }
                }
            }
        }

        // 2. Achievements Page Initialization
        if (window.location.pathname.includes('achievements')) {
            // Set 0 / 50 for total trophies
            document.querySelectorAll('span').forEach(sp => {
                if (sp.textContent.trim().includes(' / 50')) {
                    sp.textContent = `${state.achievements.length} / 50`;
                }
            });

            // Lock S-class and other cards
            const cards = document.querySelectorAll('main .bg-dungeon-gray, main .bg-shadow-slate');
            cards.forEach(card => {
                if (card.querySelector('h3') || card.querySelector('h4')) {
                    const title = (card.querySelector('h3') || card.querySelector('h4')).textContent.trim();
                    const hasAchieved = state.achievements.includes(title);
                    
                    if (!hasAchieved) {
                        card.style.opacity = '0.4';
                        card.style.border = '1px dashed rgba(149, 141, 161, 0.3)';
                        card.className = card.className
                            .replace('glow-legendary', '')
                            .replace('glow-gold', '')
                            .replace('glow-epic', '');
                        
                        const lockIcon = card.querySelector('.material-symbols-outlined');
                        if (lockIcon) {
                            lockIcon.textContent = 'lock';
                            lockIcon.style.color = '#958da1';
                            lockIcon.style.fontVariationSettings = "'FILL' 0";
                        }
                        
                        const badgeLabel = card.querySelector('.absolute.-bottom-2.-right-2');
                        if (badgeLabel) {
                            badgeLabel.textContent = '잠김';
                            badgeLabel.className = 'absolute -bottom-2 -right-2 bg-outline-variant text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-full uppercase';
                        }

                        card.querySelectorAll('span, div, h3, h4, font').forEach(el => {
                            const text = el.textContent.trim();
                            if (text === '해제됨' || text === '완료') {
                                el.textContent = '잠김';
                            }
                            if (text.match(/^\d{4}\.\d{2}\.\d{2}$/)) {
                                el.textContent = '-';
                            }
                        });
                    }
                }
            });

            // Reset Right panel stats
            document.querySelectorAll('span').forEach(sp => {
                const text = sp.textContent.trim();
                if (text === '42 / 50 km') sp.textContent = '0 / 50 km';
                if (text === '8,500 / 10,000 G') sp.textContent = '0 / 10,000 G';
                if (text === '12 / 15 퀘스트') sp.textContent = '0 / 15 퀘스트';
            });
            document.querySelectorAll('.progress-bar-fill').forEach(bar => {
                bar.style.width = '0%';
                bar.setAttribute('style', 'width: 0% !important');
            });
        }

        // 3. Quests/Dungeon Dynamic Logic
        if (window.location.pathname.includes('quests')) {
            const updateDungeonCard = (cardId, rankState) => {
                const card = document.getElementById(cardId);
                if (card && rankState && rankState.isCompleted) {
                    card.classList.add('opacity-50', 'grayscale');
                    const btn = card.querySelector('button');
                    if (btn) {
                        btn.textContent = '클리어 완료';
                        btn.disabled = true;
                        btn.classList.add('cursor-not-allowed');
                    }
                }
            };
            
            updateDungeonCard('card-e-rank', state.dungeons.e_rank);
            updateDungeonCard('card-c-rank', state.dungeons.c_rank);
            updateDungeonCard('card-s-rank', state.dungeons.s_rank);

            // Bind interactions inside detail views
            const bindTask = (viewId, taskIndex, stateObj, stateKey, maxVal, increment, textSelector, barSelector, btnSelector, btnText, isFloat=false) => {
                const view = document.getElementById(viewId);
                if (!view) return;
                
            const allRows = view.querySelectorAll('.bg-dungeon-gray, .bg-surface-container-lowest');
            const taskRows = Array.from(allRows).filter(el => el.querySelector('button, .cursor-not-allowed'));
                if (taskRows.length <= taskIndex) return;
                
                const row = taskRows[taskIndex];
                
                // Init UI
                const textEl = row.querySelector('.font-level-display span:first-child, .font-boss-display.text-sm');
                const barEl = row.querySelector('.h-full > div.bg-health-red, .h-full > div.bg-epic-purple, .h-full > div.bg-success-green') || row.querySelector('.h-full');
                const btnEl = row.querySelector('button, .cursor-not-allowed');
                
                const updateUI = () => {
                    const current = stateObj[stateKey];
                    if (textEl) {
                        if (textEl.classList.contains('font-boss-display')) {
                            textEl.innerHTML = (isFloat ? current.toFixed(1) : current) + '/' + (isFloat ? '5.0' : '100');
                        } else {
                            textEl.innerHTML = (isFloat ? current.toFixed(1) : current) + ` <span class="text-on-surface-variant text-[16px]"> ${isFloat ? 'KM' : '회'}</span>`;
                        }
                    }
                    if (barEl) {
                        const pct = Math.min((current / maxVal) * 100, 100);
                        barEl.style.width = pct + '%';
                    }
                    
                    const currentBtn = row.querySelector('button:not(.undo-btn-injected), .cursor-not-allowed');
                    if (currentBtn && !currentBtn.dataset.origClass) {
                        currentBtn.dataset.origClass = currentBtn.className;
                        currentBtn.dataset.origHtml = currentBtn.innerHTML;
                    }
                    if (current >= maxVal && currentBtn) {
                        currentBtn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> 완료됨';
                        currentBtn.disabled = true;
                        currentBtn.className = 'bg-surface-container-highest text-on-surface-variant font-bold uppercase py-3 px-xl rounded-lg cursor-not-allowed w-full md:w-auto flex items-center justify-center gap-2 border border-outline-variant/20';
                    } else if (current < maxVal && currentBtn && currentBtn.dataset.origClass) {
                        currentBtn.className = currentBtn.dataset.origClass;
                        currentBtn.innerHTML = currentBtn.dataset.origHtml;
                        currentBtn.disabled = false;
                    }

                    // Update outer list card progress dynamically
                    if (window.location.pathname.includes('quests') && viewId === 'view-e_rank') {
                        const goblinProgressTxt = Array.from(document.querySelectorAll('span')).find(sp => sp.textContent.trim().match(/^\d+\/3$/) || sp.textContent.trim() === '2/3');
                        if (goblinProgressTxt) {
                            let completedTasks = 0;
                            if (stateObj.pushups >= 100) completedTasks++;
                            if (stateObj.situps >= 100) completedTasks++;
                            if (stateObj.run >= 5.0) completedTasks++;
                            
                            goblinProgressTxt.textContent = completedTasks + '/3';
                            const bar = goblinProgressTxt.parentNode.nextElementSibling.querySelector('div');
                            if (bar) {
                                bar.style.width = ((completedTasks / 3) * 100) + '%';
                            }
                        }
                    }
                };
                
                updateUI();
                
                if (btnEl) {
                    // clone to remove old listeners
                    const newBtn = btnEl.cloneNode(true);
                    btnEl.parentNode.replaceChild(newBtn, btnEl);
                    
                    newBtn.addEventListener('click', () => {
                        if (newBtn.disabled || stateObj[stateKey] >= maxVal) return;
                        
                        stateObj[stateKey] = Math.min(stateObj[stateKey] + increment, maxVal);
                        
                        updateUI();
                        checkDungeonCompletion(viewId, stateObj);
                        saveState();
                    });
                }
            };
            
            const checkDungeonCompletion = (viewId, stateObj) => {
                if (stateObj.isCompleted) return;
                
                let allDone = false;
                if (viewId === 'view-e_rank') allDone = stateObj.pushups >= 100 && stateObj.situps >= 100 && stateObj.run >= 5.0;
                if (viewId === 'view-c_rank') allDone = stateObj.backend >= 100 && stateObj.sprint >= 100 && stateObj.debugging >= 5.0;
                if (viewId === 'view-s_rank') allDone = stateObj.ppt >= 100 && stateObj.defense >= 100 && stateObj.data >= 5.0;
                
                if (allDone) {
                    stateObj.isCompleted = true;
                    if (state.dungeonsCleared !== undefined) {
                        state.dungeonsCleared += 1;
                    } else {
                        state.dungeonsCleared = 1;
                    }
                    // Rewards
                    let expReward = 0;
                    if (viewId === 'view-e_rank') { state.gold += 500; expReward = 50 * state.level; }
                    if (viewId === 'view-c_rank') { state.gold += 1500; expReward = 150 * state.level; }
                    if (viewId === 'view-s_rank') { state.gold += 5000; expReward = 500 * state.level; }
                    
                    // Equipment Buff: 투지의 반지 (ring_resolve)
                    const hasRing = state.inventory && state.inventory.find(i => i.id === 'ring_resolve');
                    if (hasRing) {
                        expReward = Math.floor(expReward * 1.1); // 10% bonus
                    }
                    state.exp += expReward;
                    
                    // Drop Logic
                    if (!state.inventory) state.inventory = [];
                    
                    let droppedItems = [];
                    const giveItem = (template, amount = 1) => {
                        let existing = state.inventory.find(i => i.id === template.id);
                        if (existing) {
                            if (existing.type === 'consumable' || existing.type === 'material') {
                                existing.count += amount;
                                droppedItems.push(`${template.name} x${amount}`);
                            }
                        } else {
                            let newItem = JSON.parse(JSON.stringify(template));
                            newItem.count = amount;
                            state.inventory.push(newItem);
                            droppedItems.push(`${template.name} ${amount > 1 ? 'x'+amount : ''}`);
                        }
                    };
                    
                    // Common Material Drop: 마수정 (mana_crystal)
                    giveItem({ id: 'mana_crystal', name: '마수정', type: 'material', rarity: 'uncommon', count: 1, icon: 'diamond', color: 'secondary-container', desc: '마력이 깃든 파편. 교환 가능.' }, 1);
                    
                    // Dungeon specific drops
                    const rand = Math.random();
                    if (viewId === 'view-e_rank') {
                        if (rand < 0.10 && !state.inventory.find(i => i.id === 'dagger')) {
                            giveItem({ id: 'dagger', name: '그림자 군주의 단검', type: 'weapon', rarity: 'epic', count: 1, icon: 'colorize', color: 'epic-purple', desc: '운동 관련 스탯(힘) 상승폭 2배' });
                        } else if (rand < 0.40) { // 30% chance for potion
                            const amt = Math.random() < 0.5 ? 1 : 2;
                            giveItem({ id: 'potion', name: '하급 힐링 포션', type: 'consumable', rarity: 'common', count: 1, icon: 'science', color: 'health-red', desc: '초보자를 위한 힐링 포션. 사용 시 현실 보상: 커피 한 잔 마시기' }, amt);
                        }
                    } else if (viewId === 'view-c_rank') {
                        if (rand < 0.10 && !state.inventory.find(i => i.id === 'ring_resolve')) {
                            giveItem({ id: 'ring_resolve', name: '투지의 반지', type: 'equipment', rarity: 'epic', count: 1, icon: 'radio_button_unchecked', color: 'primary', desc: '퀘스트 완료 시 경험치 10% 추가 획득' });
                        } else if (rand < 0.30) { // 20% chance for cloak
                            giveItem({ id: 'stealth_cloak', name: '은신의 망토 스크롤', type: 'consumable', rarity: 'rare', count: 1, icon: 'visibility_off', color: 'exp-blue', desc: '사용 시 현실 보상: 2시간 동안 연락 안 받기' }, 1);
                        }
                    } else if (viewId === 'view-s_rank') {
                        if (!state.inventory.find(i => i.id === 'key_cartenon')) {
                            giveItem({ id: 'key_cartenon', name: '카르테논 신전의 열쇠', type: 'quest', rarity: 'mythic', count: 1, icon: 'key', color: 'legendary-gold', desc: '시스템이 준비한 최후의 시련을 여는 열쇠' });
                        }
                        if (rand < 0.05) { // 5% chance
                            giveItem({ id: 'return_stone', name: '귀환석', type: 'consumable', rarity: 'legendary', count: 1, icon: 'adjust', color: 'mythic-pink', desc: '하기 싫은 퀘스트 강제 클리어 (현재 미구현)' }, 1);
                        }
                    }
                    
                    // Unified Level Up & Stat Growth Logic
                    if (!state.maxExp) state.maxExp = state.level * 100;
                    if (!state.stats) state.stats = { str: 10, agi: 10, int: 10, wil: 10, cha: 10 };
                    
                    while (state.exp >= state.maxExp) {
                        state.exp -= state.maxExp;
                        state.level++;
                        state.maxExp = state.level * 100;
                        Object.keys(state.stats).forEach(k => state.stats[k] += 1); // Global Level Up Stat Bonus
                    }
                    
                    saveState();
                    let dropMsg = droppedItems.length > 0 ? `\n\n[획득한 아이템]\n- ${droppedItems.join('\n- ')}` : '';
                    alert(`던전을 완벽히 클리어했습니다!\n경험치 ${expReward} 획득!${dropMsg}`);
                    location.reload(); // Refresh to update global UI
                }
            };

            // E-rank bindings
            if (state.dungeons.e_rank) {
                bindTask('view-e_rank', 0, state.dungeons.e_rank, 'pushups', 100, 10, null, null, null, null, false);
                bindTask('view-e_rank', 1, state.dungeons.e_rank, 'situps', 100, 20, null, null, null, null, false);
                bindTask('view-e_rank', 2, state.dungeons.e_rank, 'run', 5.0, 1.0, null, null, null, null, true);
            }
            // C-rank bindings
            if (state.dungeons.c_rank) {
                bindTask('view-c_rank', 0, state.dungeons.c_rank, 'backend', 100, 10, null, null, null, null, false);
                bindTask('view-c_rank', 1, state.dungeons.c_rank, 'sprint', 100, 20, null, null, null, null, false);
                bindTask('view-c_rank', 2, state.dungeons.c_rank, 'debugging', 5.0, 1.0, null, null, null, null, true);
            }
            // S-rank bindings
            if (state.dungeons.s_rank) {
                bindTask('view-s_rank', 0, state.dungeons.s_rank, 'ppt', 100, 10, null, null, null, null, false);
                bindTask('view-s_rank', 1, state.dungeons.s_rank, 'defense', 100, 20, null, null, null, null, false);
                bindTask('view-s_rank', 2, state.dungeons.s_rank, 'data', 5.0, 1.0, null, null, null, null, true);
            }
        }

        // Goblin Cave List Card UI Update (Additive feature)
        if (window.location.pathname.includes('quests')) {
            const goblinProgressTxt = Array.from(document.querySelectorAll('span')).find(sp => sp.textContent.trim().match(/^\d+\/3$/) || sp.textContent.trim() === '2/3');
            if (goblinProgressTxt) {
                let completedTasks = 0;
                if (state.dungeons && state.dungeons.e_rank) {
                    if (state.dungeons.e_rank.pushups >= 100) completedTasks++;
                    if (state.dungeons.e_rank.situps >= 100) completedTasks++;
                    if (state.dungeons.e_rank.run >= 5.0) completedTasks++;
                }
                
                goblinProgressTxt.textContent = completedTasks + '/3';
                const bar = goblinProgressTxt.parentNode.nextElementSibling.querySelector('div');
                if (bar) {
                    const pct = (completedTasks / 3) * 100;
                    bar.classList.remove('w-2/3', 'w-1/3', 'w-full');
                    bar.style.width = pct + '%';
                }
            }
        }

        // 4. Inventory Page Rendering
        if (window.location.pathname.includes('inventory')) {
            const grid = document.querySelector('main section div.grid-cols-4, main section div.grid-cols-5, main section div.grid-cols-7, main section .p-md.grid');
            if (grid) {
                let html = '';
                // Render real inventory items
                state.inventory.forEach(item => {
                    if (item.rarity === 'legendary') {
                        html += `
                            <div class="aspect-square bg-shadow-slate/50 backdrop-blur-sm rounded-lg border-2 border-epic-purple relative cursor-pointer glow-epic transition-transform transform scale-105 z-10 flex items-center justify-center hover:bg-shadow-slate">
                                <div class="absolute inset-0 bg-epic-purple/10 rounded-lg"></div>
                                <div class="absolute left-0 top-0 bottom-0 w-1 bg-epic-purple rounded-l-lg"></div>
                                <img alt="${item.name}" class="w-3/4 h-3/4 object-contain drop-shadow-[0_0_8px_rgba(124,58,237,0.8)]" src="${item.img}">
                                <span class="absolute bottom-1 right-2 font-caption text-[10px] text-white font-bold bg-abyss-black/80 px-1 rounded">${item.count}</span>
                            </div>
                        `;
                    } else {
                        html += `
                            <div class="aspect-square bg-abyss-black/50 backdrop-blur-sm rounded-lg border border-outline-variant/30 relative cursor-pointer hover:border-outline-variant transition-colors flex items-center justify-center hover:bg-shadow-slate group">
                                <div class="absolute left-0 top-0 bottom-0 w-1 bg-outline-variant rounded-l-lg opacity-80"></div>
                                <span class="material-symbols-outlined text-[40px] text-${item.color || 'health-red'}/70 group-hover:text-${item.color || 'health-red'} transition-colors">${item.icon}</span>
                                <span class="absolute bottom-1 right-2 font-caption text-[10px] text-white font-bold bg-abyss-black/80 px-1 rounded">${item.count}</span>
                            </div>
                        `;
                    }
                });

                // Fill rest of grid with empty slots (7 slots visible)
                const emptySlotsCount = Math.max(7 - state.inventory.length, 5);
                for (let i = 0; i < emptySlotsCount; i++) {
                    html += `<div class="aspect-square bg-abyss-black/50 backdrop-blur-sm rounded-lg border border-surface-variant relative flex items-center justify-center"></div>`;
                }
                grid.innerHTML = html;
            }
        }
    }
    document.addEventListener('DOMContentLoaded', applyGlobalState);
    window.addEventListener('load', applyGlobalState);

    window.applyDungeonMetadata = () => {
        if (!state.dungeonMetadata || !window.location.pathname.includes('quests')) return;
        
        ['e_rank', 'c_rank', 's_rank'].forEach(rank => {
            const meta = state.dungeonMetadata[rank];
            if (!meta) return;

            // List View Updates removed to prevent conflict with applyCustomDungeons

            // Detail View Updates
            const detailView = document.getElementById(`view-${rank}`);
            if (detailView) {
                const headerTitle = detailView.querySelector('h1');
                if (headerTitle) {
                    if (headerTitle.innerHTML.includes('span')) {
                        headerTitle.innerHTML = `${meta.title} <span class="text-health-red text-3xl md:text-5xl">(${meta.rankText || 'RANK S'})</span>`;
                    } else {
                        headerTitle.textContent = meta.title;
                    }
                }
                const headerDesc = detailView.querySelector('.max-w-2xl.border-l-2 p, p.border-l-2');
                if (headerDesc) headerDesc.textContent = meta.desc;

                const allRows = detailView.querySelectorAll('.bg-dungeon-gray, .bg-surface-container-lowest');
                const taskRows = Array.from(allRows).filter(el => el.querySelector('button, .cursor-not-allowed'));
                
                meta.tasks.forEach((taskName, idx) => {
                    if (taskRows.length > idx) {
                        const row = taskRows[idx];
                        const taskTitleEl = row.querySelector('.font-card-title, h3, h4');
                        if (taskTitleEl) {
                            if (taskTitleEl.innerHTML.includes('span')) {
                                const span = taskTitleEl.querySelector('span').outerHTML;
                                taskTitleEl.innerHTML = `${span} ${taskName}`;
                            } else {
                                taskTitleEl.textContent = taskName;
                            }
                        }
                    }
                });
            }
        });
    };

    document.addEventListener('DOMContentLoaded', window.applyDungeonMetadata);
    window.addEventListener('load', window.applyDungeonMetadata);

    // Pure Additive Undo Logic
    const initUndoButtons = () => {
        if (!window.location.pathname.includes('quests')) return;
        const injectUndo = (viewId, stateObj, maxVals, increments, stateKeys) => {
            if (!stateObj) return;
            const view = document.getElementById(viewId);
            if (!view) return;
            
            const allRows = view.querySelectorAll('.bg-dungeon-gray, .bg-surface-container-lowest');
            const taskRows = Array.from(allRows).filter(el => el.querySelector('button, .cursor-not-allowed'));
            stateKeys.forEach((key, idx) => {
                if (taskRows.length <= idx) return;
                const row = taskRows[idx];
                const btnEl = row.querySelector('button');
                
                if (btnEl && !row.querySelector('.undo-btn-injected')) {
                    const undoBtn = document.createElement('button');
                    undoBtn.className = 'undo-btn-injected ml-2 p-3 bg-transparent border border-outline-variant/30 text-on-surface-variant hover:text-health-red hover:border-health-red/50 hover:bg-health-red/10 rounded-lg transition-colors flex items-center justify-center';
                    undoBtn.innerHTML = '<span class="material-symbols-outlined text-[24px]">undo</span>';
                    undoBtn.title = "기록 취소";
                    
                    btnEl.parentNode.insertBefore(undoBtn, btnEl.nextSibling);
                    if (!btnEl.parentNode.classList.contains('flex')) {
                        btnEl.parentNode.style.display = 'flex';
                        btnEl.parentNode.style.gap = '8px';
                    }

                    undoBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (stateObj[key] > 0) {
                            stateObj[key] = Math.max(0, stateObj[key] - increments[idx]);
                            
                            // 만약 전체가 클리어 상태였다면, 하나라도 깎였으니 클리어 해제
                            if (stateObj.isCompleted) {
                                stateObj.isCompleted = false;
                            }
                            
                            localStorage.setItem(getGameSaveKey(), JSON.stringify(state));
                            
                            // 완료됨(disabled) 상태 복원을 위해 location.reload 삭제하고 수동 DOM 갱신 적용
                            const textEl = row.querySelector('.font-level-display span:first-child, .font-boss-display.text-sm');
                            const barEl = row.querySelector('.h-full > div.bg-health-red, .h-full > div.bg-epic-purple, .h-full > div.bg-success-green') || row.querySelector('.h-full');
                            const current = stateObj[key];
                            const isFloat = increments[idx] % 1 !== 0;
                            
                            if (textEl) {
                                if (textEl.classList.contains('font-boss-display')) {
                                    textEl.innerHTML = (isFloat ? current.toFixed(1) : current) + '/' + (isFloat ? '5.0' : '100');
                                } else {
                                    textEl.innerHTML = (isFloat ? current.toFixed(1) : current) + ` <span class="text-on-surface-variant text-[16px]"> ${isFloat ? 'KM' : '회'}</span>`;
                                }
                            }
                            if (barEl) {
                                const pct = Math.min((current / maxVals[idx]) * 100, 100);
                                barEl.style.width = pct + '%';
                            }
                            
                            // 버튼 원상복구 (페이지 이동 금지)
                            const mainBtn = row.querySelector('button:not(.undo-btn-injected)');
                            if (current < maxVals[idx] && mainBtn && mainBtn.dataset.origClass) {
                                mainBtn.className = mainBtn.dataset.origClass;
                                mainBtn.innerHTML = mainBtn.dataset.origHtml;
                                mainBtn.disabled = false;
                            }

                            // 외부 리스트 카드 진행도 동기화 (기존 코드 터치 없이 순수 추가)
                            if (window.location.pathname.includes('quests') && viewId === 'view-e_rank') {
                                const goblinProgressTxt = Array.from(document.querySelectorAll('span')).find(sp => sp.textContent.trim().match(/^\d+\/3$/) || sp.textContent.trim() === '2/3');
                                if (goblinProgressTxt) {
                                    let completedTasks = 0;
                                    if (stateObj.pushups >= 100) completedTasks++;
                                    if (stateObj.situps >= 100) completedTasks++;
                                    if (stateObj.run >= 5.0) completedTasks++;
                                    
                                    goblinProgressTxt.textContent = completedTasks + '/3';
                                    const outerBar = goblinProgressTxt.parentNode.nextElementSibling.querySelector('div');
                                    if (outerBar) {
                                        outerBar.style.width = ((completedTasks / 3) * 100) + '%';
                                    }
                                }
                            }
                        }
                    });
                }
            });
        };
        
        setTimeout(() => {
            injectUndo('view-e_rank', state.dungeons?.e_rank, [100, 100, 5.0], [10, 20, 1.0], ['pushups', 'situps', 'run']);
            injectUndo('view-c_rank', state.dungeons?.c_rank, [100, 100, 5.0], [10, 20, 1.0], ['backend', 'sprint', 'debugging']);
            injectUndo('view-s_rank', state.dungeons?.s_rank, [100, 100, 5.0], [10, 20, 1.0], ['ppt', 'defense', 'data']);
        }, 300);
    };
    window.addEventListener('load', initUndoButtons);
})();

// ====== USER CUSTOM SETTINGS (PURE ADDITION) ======
(function() {
    // 1. Get or init custom settings in state
    let state = null;
    try {
        state = JSON.parse(localStorage.getItem(window.getGameSaveKey())) || {};
    } catch(e) { state = {}; }

        if (!state.customProfile) {
            state.customProfile = { name: '성진우', title: 'Lv.1', avatarUrl: 'profile_avatar.jpg' };
        } else if (!state.customProfile.avatarUrl || state.customProfile.avatarUrl.includes('googleusercontent')) {
            state.customProfile.avatarUrl = 'profile_avatar.jpg';
        }

        const targetAvatar = (state.customProfile && state.customProfile.avatarUrl && !state.customProfile.avatarUrl.includes('googleusercontent')) ? state.customProfile.avatarUrl : 'profile_avatar.jpg';
        const sidebarAvatars = document.querySelectorAll('aside img, img[alt*="Avatar"]');
        sidebarAvatars.forEach(img => {
            if (img) img.src = targetAvatar;
        });
    if (!state.stats) {
        state.stats = { str: 10, agi: 10, int: 10, wil: 10, cha: 10 };
    }

    if (!state.customDailyQuests || state.customDailyQuests.length !== 3 || state.customDailyQuests[0].title === '아침 달리기') {
        state.customDailyQuests = [
            { id: 'dq_1', title: '푸쉬업 100회', desc: '상태창의 퀘스트를 완수하세요.', rarity: '일반', category: '💪 힘(운동)', rewardStat: 'str' },
            { id: 'dq_2', title: '윗몸 일으키기 100회', desc: '상태창의 퀘스트를 완수하세요.', rarity: '일반', category: '🛡️ 의지(습관/멘탈)', rewardStat: 'wil' },
            { id: 'dq_3', title: '달리기 10km', desc: '상태창의 퀘스트를 완수하세요.', rarity: '일반', category: '⚡ 민첩(순발력/지구력)', rewardStat: 'agi' }
        ];
    } else {
        if (state.customDailyQuests[0] && state.customDailyQuests[1] && state.customDailyQuests[0].title === state.customDailyQuests[1].title && state.customDailyQuests[0].title === '윗몸 일으키기 100회') {
            state.customDailyQuests[0].title = '푸쉬업 100회';
            state.customDailyQuests[0].rewardStat = 'str';
            state.customDailyQuests[0].category = '💪 힘(운동)';
        }
        if(state.customDailyQuests[0] && !state.customDailyQuests[0].rewardStat) state.customDailyQuests[0].rewardStat = 'str';
        if(state.customDailyQuests[1] && !state.customDailyQuests[1].rewardStat) state.customDailyQuests[1].rewardStat = 'wil';
        if(state.customDailyQuests[2] && !state.customDailyQuests[2].rewardStat) state.customDailyQuests[2].rewardStat = 'agi';
    }
    
    if (!state.level) state.level = 1;
    if (typeof state.exp === 'undefined') state.exp = 0;
    if (!state.maxExp) state.maxExp = 100;
    
    const dNow = new Date();
    const todayStr = `${dNow.getFullYear()}-${String(dNow.getMonth() + 1).padStart(2, '0')}-${String(dNow.getDate()).padStart(2, '0')}`;
    if (!state.dailyProgress || state.dailyProgress.date !== todayStr) {
        state.dailyProgress = { date: todayStr, completions: [false, false, false], submitted: false };
        localStorage.setItem(window.getGameSaveKey(), JSON.stringify(state));
    }

    function saveState() {
        if (typeof window.saveState === 'function') {
            window.saveState();
        } else {
            localStorage.setItem(window.getGameSaveKey(), JSON.stringify(state));
        }
    }

    // 2. Apply Custom Settings on load
    function applyCustomSettings() {
        if (!state.customProfile) state.customProfile = { name: '성진우', title: 'LV. ' + (state.level || 1), height: 178, weight: 70 };
        if (!state.customProfile.height) state.customProfile.height = 178;
        if (!state.customProfile.weight) state.customProfile.weight = 70;
        state.customProfile.title = 'LV. ' + state.level; // Dynamically sync with global level
        
        // Update Profile Name & Title
        const names = document.querySelectorAll('aside h2, main h1, main h2.text-on-surface, main h3.font-section-title'); 
        names.forEach(el => {
            if (el.textContent.trim() === '성진우' || el.dataset.isCustomName || (state.customProfile && el.textContent.trim() === state.customProfile.name)) {
                el.textContent = state.customProfile.name;
                el.dataset.isCustomName = 'true';
            }
        });

        // Update Body Info (Height & Weight)
        const bodyInfoTxt = `(${state.customProfile.height}cm / ${state.customProfile.weight}kg)`;
        const bodyInfoEls = document.querySelectorAll('#card-display-bodyinfo, #profile-display-bodyinfo, .card-body-info');
        bodyInfoEls.forEach(el => {
            el.textContent = bodyInfoTxt;
        });

        const titles = document.querySelectorAll('aside p, main p.text-on-surface-variant');
        titles.forEach(el => {
            if (el.textContent.trim().includes('E급 헌터') || el.textContent.trim().includes('Lv.') || el.textContent.trim().includes('LV.') || el.dataset.isCustomTitle) {
                el.textContent = state.customProfile.title;
                el.dataset.isCustomTitle = 'true';
            }
        });

        const finalAvatar = (state.customProfile && state.customProfile.avatarUrl && !state.customProfile.avatarUrl.includes('googleusercontent')) ? state.customProfile.avatarUrl : 'profile_avatar.jpg';
        const avatarsToUpdate = document.querySelectorAll('aside img, img[alt*="Profile"], img[alt*="Avatar"]');
        avatarsToUpdate.forEach(img => { if (img) img.src = finalAvatar; });

        // Update Dashboard Main EXP Bar
        function updateExpUI() {
            const mainExpCurrent = document.getElementById('main-exp-current');
            const mainExpMax = document.getElementById('main-exp-max');
            const mainExpFill = document.getElementById('main-exp-fill');
            if (mainExpCurrent && mainExpMax && mainExpFill) {
                mainExpCurrent.textContent = state.exp;
                mainExpMax.textContent = state.maxExp;
                const pct = Math.min(100, Math.max(0, (state.exp / state.maxExp) * 100));
                mainExpFill.style.width = pct + '%';
            }
            
            // Also update level text
            const titles = document.querySelectorAll('aside p, main p.text-on-surface-variant');
            titles.forEach(el => {
                if (el.textContent.trim().includes('Lv.') || el.textContent.trim().includes('LV.') || el.dataset.isCustomTitle) {
                    el.textContent = 'LV. ' + state.level;
                    el.dataset.isCustomTitle = 'true';
                }
            });
        }
        
        updateExpUI();

        // Update Daily Quests in Dashboard
        if (window.location.pathname.includes('dashboard')) {
            const questContainers = document.querySelectorAll('main h2');
            let dailyQuestHeader = null;
            questContainers.forEach(h2 => {
                if (h2.textContent.trim().includes('일일 퀘스트')) {
                    dailyQuestHeader = h2;
                }
            });

            if (dailyQuestHeader) {
                // Edit button removed

                const questListContainer = dailyQuestHeader.closest('#penalty-quest-section');
                if (questListContainer) {
                    const questCards = questListContainer.querySelectorAll('.group');
                    questCards.forEach((card, idx) => {
                        const customQ = state.customDailyQuests[idx];
                        if (customQ) {
                            const titleEl = card.querySelector('h3');
                            const descEl = card.querySelector('p');
                            const rarityEl = card.querySelector('span.text-\\[10px\\]');
                            const labelTextEl = card.querySelector('.text-lg.flex-1');
                            
                            if (titleEl) titleEl.textContent = customQ.title;
                            if (descEl) descEl.textContent = customQ.desc;
                            if (labelTextEl) {
                                labelTextEl.textContent = customQ.title;
                            }
                            if (rarityEl) {
                                rarityEl.textContent = customQ.category || customQ.rarity;
                                rarityEl.className = 'px-2 py-0.5 rounded text-[11px] font-bold tracking-wider ghost-border';
                                if (idx === 0) rarityEl.classList.add('bg-health-red/15', 'text-health-red');
                                else if (idx === 1) rarityEl.classList.add('bg-exp-blue/15', 'text-exp-blue');
                                else rarityEl.classList.add('bg-epic-purple/20', 'text-primary');
                            }
                            
                            // Checkbox Logic for Daily Progress
                            const checkbox = card.querySelector('input[type="checkbox"]');
                            const checkIcon = card.querySelector('.check-icon');
                            if (checkbox) {
                                // Initialize UI state
                                checkbox.checked = state.dailyProgress.completions[idx] || false;
                                if (checkbox.checked && checkIcon) {
                                    checkIcon.style.opacity = '1';
                                }
                                
                                if (state.dailyProgress.submitted) {
                                    card.classList.add('opacity-50', 'pointer-events-none');
                                } else {
                                    card.classList.remove('opacity-50', 'pointer-events-none');
                                }
                                
                                checkbox.addEventListener('change', (e) => {
                                    if (state.dailyProgress.submitted) {
                                        // If already submitted, don't allow changing
                                        e.preventDefault();
                                        checkbox.checked = state.dailyProgress.completions[idx];
                                        return;
                                    }
                                    if (checkbox.checked) {
                                        state.dailyProgress.completions[idx] = true;
                                        if (checkIcon) checkIcon.style.opacity = '1';
                                    } else {
                                        state.dailyProgress.completions[idx] = false;
                                        if (checkIcon) checkIcon.style.opacity = '0';
                                    }
                                    saveState();
                                    if (typeof window.updateBtnUI === 'function') {
                                        window.updateBtnUI();
                                    }
                                });
                            }
                        }
                    });
                    
                    // Button Logic
                    const btnComplete = document.getElementById('btn-complete-penalty');
                    if (btnComplete) {
                        
                        function updateBtnUI() {
                            if (state.dailyProgress.submitted) {
                                btnComplete.className = 'flex-1 border font-bold py-3 rounded transition-all bg-outline-variant/30 text-on-surface-variant line-through border-transparent';
                                btnComplete.textContent = '완료됨 (취소하기)';
                            } else {
                                let checkedCount = state.dailyProgress.completions.filter(Boolean).length;
                                if (checkedCount > 0) {
                                    btnComplete.className = 'flex-1 border font-bold py-3 rounded transition-all bg-epic-purple text-white hover:shadow-[0_0_15px_rgba(124,58,237,0.6)] border-transparent';
                                } else {
                                    btnComplete.className = 'flex-1 bg-abyss-black border theme-border theme-text font-bold py-3 rounded transition-all opacity-50 cursor-not-allowed';
                                }
                                btnComplete.textContent = '퀘스트 완료';
                            }
                        }
                        
                        // Make updateBtnUI available globally within this block for the checkbox listener
                        window.updateBtnUI = updateBtnUI;
                        updateBtnUI();
                        
                        btnComplete.onclick = () => {
                            let completedCount = state.dailyProgress.completions.filter(Boolean).length;
                            if (completedCount === 0 && !state.dailyProgress.submitted) {
                                alert("완료한 퀘스트가 없습니다. 먼저 체크박스를 선택해주세요.");
                                return;
                            }
                            
                            if (state.dailyProgress.submitted) {
                                // Cancel submission
                                state.dailyProgress.submitted = false;
                                 const dCancel = new Date();
                                const todayStr = `${dCancel.getFullYear()}-${String(dCancel.getMonth() + 1).padStart(2, '0')}-${String(dCancel.getDate()).padStart(2, '0')}`;
                                if (state.streakHistory) {
                                    delete state.streakHistory[todayStr];
                                }
                                
                                // Revoke EXP
                                const expReward = (10 * state.level) * completedCount;
                                state.exp -= expReward;
                                
                                // Revoke Stat Bonuses for Quests
                                state.dailyProgress.completions.forEach((isCompleted, idx) => {
                                    if (isCompleted && state.customDailyQuests[idx]) {
                                        const q = state.customDailyQuests[idx];
                                        const analysis = typeof window.autoAnalyzeQuest === 'function' ? window.autoAnalyzeQuest(q.title) : { statKey: q.rewardStat, rewardAmount: 0.5 };
                                        const statKey = q.rewardStat || analysis.statKey;
                                        if (statKey && state.stats[statKey] !== undefined) {
                                            const statIncrease = q.rewardAmount || analysis.rewardAmount || 0.5;
                                            state.stats[statKey] -= statIncrease;
                                            if (state.level === 1 && state.stats[statKey] < 10) {
                                                state.stats[statKey] = 10;
                                            }
                                        }
                                    }
                                });

                                // Handle level down if exp < 0
                                while (state.exp < 0 && state.level > 1) {
                                    state.level--;
                                    state.maxExp = state.level * 100;
                                    state.exp += state.maxExp;
                                    Object.keys(state.stats).forEach(k => state.stats[k] -= 1); // Level Down Penalty
                                }
                                if (state.exp < 0) state.exp = 0; // fallback
                                
                                // Unlock checkboxes
                                questCards.forEach(card => card.classList.remove('opacity-50', 'pointer-events-none'));
                                
                            } else {
                                // Submit
                                state.dailyProgress.submitted = true;
                                
                                // Grant EXP
                                let expReward = (10 * state.level) * completedCount;
                                
                                // Equipment Buff: 투지의 반지 (ring_resolve)
                                const hasRing = state.inventory && state.inventory.find(i => i.id === 'ring_resolve');
                                if (hasRing) {
                                    expReward = Math.floor(expReward * 1.1); // 10% bonus
                                }
                                
                                state.exp += expReward;
                                
                                // Grant Stat Bonuses for Quests
                                state.dailyProgress.completions.forEach((isCompleted, idx) => {
                                    if (isCompleted && state.customDailyQuests[idx]) {
                                        const q = state.customDailyQuests[idx];
                                        const analysis = typeof window.autoAnalyzeQuest === 'function' ? window.autoAnalyzeQuest(q.title) : { statKey: q.rewardStat, rewardAmount: 0.5 };
                                        const statKey = q.rewardStat || analysis.statKey;
                                        if (statKey && state.stats[statKey] !== undefined) {
                                            let statIncrease = q.rewardAmount || analysis.rewardAmount || 0.5;
                                            
                                            // Equipment Buff: 그림자 군주의 단검 (dagger) for strength stats
                                            const hasDagger = state.inventory && state.inventory.find(i => i.id === 'dagger');
                                            if (hasDagger && statKey === 'str') {
                                                statIncrease = Math.round((statIncrease * 1.5) * 10) / 10;
                                            }
                                            
                                            state.stats[statKey] += statIncrease;
                                        }
                                    }
                                });

                                // Level up check
                                while (state.exp >= state.maxExp) {
                                    state.exp -= state.maxExp;
                                    state.level++;
                                    state.maxExp = state.level * 100;
                                    Object.keys(state.stats).forEach(k => state.stats[k] += 1); // Level Up Bonus
                                }
                                
                                // Lock checkboxes
                                questCards.forEach(card => card.classList.add('opacity-50', 'pointer-events-none'));
                            }
                            
                            updateBtnUI();
                            saveState();
                            updateExpUI();
                            if (typeof window.updateDashboardStatsUI === 'function') {
                                window.updateDashboardStatsUI();
                            }
                            if (typeof initStreakAndGachaSystem === 'function') {
                                initStreakAndGachaSystem();
                            }
                        };
                    }
                }
            }
        }
    }

    // 3. Inject Settings Modal UI
    function renderSettingsModal() {
        if (document.getElementById('custom-settings-modal')) {
            document.getElementById('custom-settings-modal').remove();
        }
        
        const modal = document.createElement('div');
        modal.id = 'custom-settings-modal';
        modal.className = 'fixed inset-0 bg-abyss-black/80 flex items-center justify-center z-[100] hidden';
        
        const defaultAvatar = 'profile_avatar.jpg';
        const currentAvatar = state.customProfile.avatarUrl || defaultAvatar;

        modal.innerHTML = `
            <div class="bg-surface-container-lowest rounded-xl p-6 w-full max-w-md shadow-[0_0_20px_rgba(124,58,237,0.3)] ghost-border border-outline-variant/30 text-on-surface max-h-[90vh] overflow-y-auto">
                <h2 class="text-2xl font-boss-display text-primary mb-4">플레이어 커스텀 설정</h2>
                
                <div class="mb-6 space-y-3">
                    <h3 class="text-lg font-bold border-b border-outline-variant/30 pb-2">프로필 설정</h3>
                    <div>
                        <label class="block text-sm text-on-surface-variant mb-1">이름</label>
                        <input type="text" id="set-profile-name" value="${state.customProfile.name}" class="w-full bg-abyss-black border border-outline-variant/50 rounded-lg p-2 text-white outline-none focus:border-primary">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm text-on-surface-variant mb-1">신장 (키 cm)</label>
                            <input type="number" id="set-profile-height" value="${state.customProfile.height || 178}" class="w-full bg-abyss-black border border-outline-variant/50 rounded-lg p-2 text-white outline-none focus:border-primary">
                        </div>
                        <div>
                            <label class="block text-sm text-on-surface-variant mb-1">체중 (몸무게 kg)</label>
                            <input type="number" id="set-profile-weight" value="${state.customProfile.weight || 70}" class="w-full bg-abyss-black border border-outline-variant/50 rounded-lg p-2 text-white outline-none focus:border-primary">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm text-on-surface-variant mb-1">프로필 사진 업로드 (선택사항)</label>
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-full bg-abyss-black overflow-hidden border border-outline-variant/50 flex-shrink-0">
                                <img id="profile-preview" src="${currentAvatar}" class="w-full h-full object-cover">
                            </div>
                            <label class="cursor-pointer bg-shadow-slate hover:bg-outline-variant/30 text-white text-sm py-2 px-4 rounded-lg transition-colors border border-outline-variant/50">
                                내 PC에서 사진 선택
                                <input type="file" id="set-profile-file" accept="image/*" class="hidden">
                            </label>
                        </div>
                        <input type="hidden" id="set-profile-url" value="${state.customProfile.avatarUrl || ''}">
                    </div>
                </div>

                <div class="mb-6 space-y-4">
                    <h3 class="text-lg font-bold border-b border-outline-variant/30 pb-2">서브 퀘스트 설정</h3>
                    ${state.customDailyQuests.map((q, idx) => `
                        <div class="p-3 bg-shadow-slate rounded-lg border border-outline-variant/20 mb-3">
                            <label class="block text-md font-bold text-primary mb-2">${q.category}</label>
                            <input type="text" id="set-dq-title-${idx}" value="${q.title}" placeholder="목표를 입력하세요" class="w-full bg-abyss-black border border-outline-variant/50 rounded-lg p-2 text-white outline-none focus:border-primary mb-2">
                            <label class="block text-sm text-on-surface-variant mb-1 mt-2">보상 스탯 (완료 시 증가)</label>
                            <select id="set-dq-stat-${idx}" class="w-full bg-abyss-black border border-outline-variant/50 rounded-lg p-2 text-white outline-none focus:border-primary text-sm mb-2">
                                <option value="str" ${q.rewardStat === 'str' ? 'selected' : ''}>💪 힘 (근력 운동)</option>
                                <option value="agi" ${q.rewardStat === 'agi' ? 'selected' : ''}>⚡ 민첩 (유산소 운동)</option>
                                <option value="int" ${q.rewardStat === 'int' ? 'selected' : ''}>🧠 지능 (학습, 독서)</option>
                                <option value="wil" ${q.rewardStat === 'wil' ? 'selected' : ''}>🛡️ 의지 (인내, 명상)</option>
                                <option value="cha" ${q.rewardStat === 'cha' ? 'selected' : ''}>✨ 매력 (자기 관리)</option>
                            </select>
                            <label class="block text-sm text-on-surface-variant mb-1">상세 내용</label>
                            <textarea id="set-dq-desc-${idx}" class="w-full bg-abyss-black border border-outline-variant/50 rounded-lg p-2 text-white outline-none focus:border-primary text-sm h-12">${q.desc}</textarea>
                        </div>
                    `).join('')}
                </div>

                <div class="mb-6 space-y-4">
                    <h3 class="text-lg font-bold border-b border-outline-variant/30 pb-2">던전 커스텀 설정 (총 18개)</h3>
                    <div class="p-3 bg-shadow-slate rounded-lg border border-outline-variant/20 mb-3">
                        <label class="block text-md font-bold text-primary mb-2">수정할 던전 선택</label>
                        <select id="set-dun-select" class="w-full bg-abyss-black border border-outline-variant/50 rounded-lg p-2 text-white outline-none focus:border-primary mb-2 text-sm"></select>
                        <label class="block text-sm text-on-surface-variant mb-1 mt-2">던전 이름</label>
                        <input type="text" id="set-dun-title" class="w-full bg-abyss-black border border-outline-variant/50 rounded-lg p-2 text-white outline-none focus:border-primary mb-2">
                        <label class="block text-sm text-on-surface-variant mb-1 mt-1">상세 설명</label>
                        <textarea id="set-dun-desc" class="w-full bg-abyss-black border border-outline-variant/50 rounded-lg p-2 text-white outline-none focus:border-primary text-sm h-24 mb-2 resize-none"></textarea>
                        <button id="set-dun-apply-btn" class="w-full py-2 mt-2 bg-outline-variant/20 hover:bg-epic-purple text-white rounded text-sm transition-colors border border-outline-variant/50 hover:border-epic-purple flex items-center justify-center gap-2"><span class="material-symbols-outlined text-sm">edit</span> 현재 던전 내용 임시적용</button>
                    </div>
                </div>

                <div class="flex gap-3 justify-end mt-4 pt-4 border-t border-outline-variant/30">
                    <button id="btn-reset-data" class="px-4 py-2 rounded-lg bg-health-red/20 text-health-red hover:bg-health-red/30 transition-colors mr-auto font-bold border border-health-red/50">전체 초기화</button>
                    <button id="btn-close-settings" class="px-4 py-2 rounded-lg bg-shadow-slate hover:bg-outline-variant/30 text-white transition-colors">취소</button>
                    <button id="btn-save-settings" class="px-4 py-2 rounded-lg bg-epic-purple hover:bg-primary-fixed-dim text-white transition-colors shadow-[0_0_10px_rgba(124,58,237,0.5)]">저장</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Dungeon Dropdown Logic
        const dunSelect = document.getElementById('set-dun-select');
        const dunTitle = document.getElementById('set-dun-title');
        const dunDesc = document.getElementById('set-dun-desc');
        const dunApplyBtn = document.getElementById('set-dun-apply-btn');
        let tempCustomDungeons = state.customDungeons ? JSON.parse(JSON.stringify(state.customDungeons)) : {};

        if (dunSelect && dunTitle && dunDesc) {
            // Populate dropdown
            window.DEFAULT_DUNGEONS.forEach(d => {
                const custom = tempCustomDungeons[d.id] || (state.customDungeons && state.customDungeons[d.id]);
                const displayName = custom ? custom.name : d.name;
                const opt = document.createElement('option');
                opt.value = d.id;
                opt.textContent = `[${d.rank}급] ${displayName}`;
                dunSelect.appendChild(opt);
            });

            const loadSelectedDungeon = () => {
                const id = dunSelect.value;
                const custom = tempCustomDungeons[id];
                const def = window.DEFAULT_DUNGEONS.find(d => d.id === id);
                if (def) {
                    dunTitle.value = custom ? custom.name : def.name;
                    dunDesc.value = custom ? custom.desc : def.desc;
                }
            };

            dunSelect.addEventListener('change', loadSelectedDungeon);

            if (window.DEFAULT_DUNGEONS.length > 0) {
                dunSelect.value = window.DEFAULT_DUNGEONS[0].id;
                loadSelectedDungeon();
            }

            if (dunApplyBtn) {
                dunApplyBtn.onclick = () => {
                    const id = dunSelect.value;
                    tempCustomDungeons[id] = {
                        name: dunTitle.value.trim(),
                        desc: dunDesc.value.trim()
                    };
                    const originalText = dunApplyBtn.innerHTML;
                    dunApplyBtn.innerHTML = '<span class="material-symbols-outlined text-sm">check</span> 적용완료 (저장을 눌러야 확정)';
                    dunApplyBtn.classList.add('bg-success-green/20', 'border-success-green/50', 'text-success-green');
                    setTimeout(() => {
                        dunApplyBtn.innerHTML = originalText;
                        dunApplyBtn.classList.remove('bg-success-green/20', 'border-success-green/50', 'text-success-green');
                    }, 2000);
                };
            }
        }

        // Image upload handling with canvas compression
        const fileInput = document.getElementById('set-profile-file');
        const preview = document.getElementById('profile-preview');
        const urlInput = document.getElementById('set-profile-url');
        
        if(fileInput) {
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const img = new Image();
                    img.onload = function() {
                        const canvas = document.createElement('canvas');
                        const MAX_SIZE = 400; // compress to max 400px
                        let width = img.width;
                        let height = img.height;
                        
                        if (width > height) {
                            if (width > MAX_SIZE) {
                                height *= MAX_SIZE / width;
                                width = MAX_SIZE;
                            }
                        } else {
                            if (height > MAX_SIZE) {
                                width *= MAX_SIZE / height;
                                height = MAX_SIZE;
                            }
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // Compress as WebP for smallest size
                        const compressedDataUrl = canvas.toDataURL('image/webp', 0.8);
                        
                        preview.src = compressedDataUrl;
                        urlInput.value = compressedDataUrl;
                    };
                    img.src = evt.target.result;
                };
                reader.readAsDataURL(file);
            });
        }

        document.getElementById('btn-close-settings').onclick = () => modal.classList.add('hidden');
        
        const btnResetData = document.getElementById('btn-reset-data');
        if (btnResetData) {
            btnResetData.onclick = () => {
                if (confirm("정말 모든 데이터를 초기화하시겠습니까? 레벨, 경험치, 인벤토리 등 모든 진행 상황이 삭제되며 복구할 수 없습니다.")) {
                    localStorage.removeItem(getGameSaveKey());
                    location.reload();
                }
            };
        }

        document.getElementById('btn-save-settings').onclick = () => {
            state.customProfile.name = document.getElementById('set-profile-name').value;
            const hVal = document.getElementById('set-profile-height').value;
            const wVal = document.getElementById('set-profile-weight').value;
            if (hVal) state.customProfile.height = parseFloat(hVal);
            if (wVal) state.customProfile.weight = parseFloat(wVal);
            state.customProfile.avatarUrl = document.getElementById('set-profile-url').value;

            state.customDailyQuests.forEach((q, idx) => {
                q.title = document.getElementById(`set-dq-title-${idx}`).value;
                q.desc = document.getElementById(`set-dq-desc-${idx}`).value;
                const statSelect = document.getElementById(`set-dq-stat-${idx}`);
                if (statSelect) {
                    q.rewardStat = statSelect.value;
                }
            });

            // Save 18 Custom Dungeons
            if (typeof tempCustomDungeons !== 'undefined') {
                state.customDungeons = tempCustomDungeons;
                if (typeof applyCustomDungeons === 'function') applyCustomDungeons();
            }

            saveState();
            applyCustomSettings();
            if (typeof window.applyDungeonMetadata === 'function') window.applyDungeonMetadata();
            modal.classList.add('hidden');
        };
    }

    // 4. Hook Settings Button
    function hookSettingsButton() {
        const settingsBtns = Array.from(document.querySelectorAll('button')).filter(btn => btn.innerHTML.includes('settings'));
        settingsBtns.forEach(btn => {
            // Remove previous inline listeners or override
            btn.onclick = (e) => {
                e.preventDefault();
                renderSettingsModal();
                const modal = document.getElementById('custom-settings-modal');
                if (modal) modal.classList.remove('hidden');
            };
        });
    }
    function updateResetTimer() {
        const timerEls = document.querySelectorAll('.reset-timer-display, #reset-timer-display');
        
        // Auto live midnight rollover check (no manual F5 required)
        const dCurrent = new Date();
        const currentTodayStr = `${dCurrent.getFullYear()}-${String(dCurrent.getMonth() + 1).padStart(2, '0')}-${String(dCurrent.getDate()).padStart(2, '0')}`;
        if (state && state.lastQuestDate && state.lastQuestDate !== currentTodayStr) {
            state.lastQuestDate = currentTodayStr;
            state.dailyQuests = {};
            state.dailyProgress = { date: currentTodayStr, completions: [false, false, false], submitted: false };
            if (state.dungeons) {
                state.dungeons.e_rank = { pushups: 0, situps: 0, run: 0, isCompleted: false };
                state.dungeons.c_rank = { backend: 0, sprint: 0, debugging: 0, isCompleted: false };
                state.dungeons.s_rank = { ppt: 0, defense: 0, data: 0, isCompleted: false };
            }
            localStorage.setItem(window.getGameSaveKey(), JSON.stringify(state));
            location.reload();
            return;
        }

        if (timerEls.length === 0) return;
        
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const diffMs = tomorrow - now;
        
        const hoursStr = String(Math.floor(diffMs / (1000 * 60 * 60))).padStart(2, '0');
        const minutes = String(Math.floor((diffMs / (1000 * 60)) % 60)).padStart(2, '0');
        const seconds = String(Math.floor((diffMs / 1000) % 60)).padStart(2, '0');
        
        timerEls.forEach(el => {
            el.textContent = `${hoursStr}:${minutes}:${seconds}`;
        });

        // Toggle penalty warning if less than 3 hours remaining
        const isWarning = diffMs < (3 * 60 * 60 * 1000);
        const penaltySection = document.getElementById('penalty-quest-section');
        const timerText = document.getElementById('penalty-timer-text');
        const bgPulse = document.getElementById('penalty-bg-pulse');
        
        if (penaltySection) {
            if (isWarning) {
                penaltySection.classList.add('warning-theme');
                if (timerText) {
                    timerText.classList.add('text-health-red', 'animate-pulse');
                    timerText.classList.remove('text-on-surface');
                }
                if (bgPulse) bgPulse.classList.add('animate-pulse');
            } else {
                penaltySection.classList.remove('warning-theme');
                if (timerText) {
                    timerText.classList.remove('text-health-red', 'animate-pulse');
                    timerText.classList.add('text-on-surface');
                }
                if (bgPulse) bgPulse.classList.remove('animate-pulse');
            }
        }
    }

    window.addEventListener('load', () => {
        applyCustomSettings();
        hookSettingsButton();
        updateResetTimer();
        setInterval(updateResetTimer, 1000);
    });
// ====== DUNGEON EDIT LOGIC ======
    // Custom dungeon logic moved to settings
    
    function initShop() {
        if (!window.location.pathname.includes('shop')) return;
        
        const grid = document.getElementById('shop-grid');
        if (!grid) return;
        
        function renderShop() {
            grid.innerHTML = '';
            state.shopItems.forEach((item, idx) => {
                const canAfford = state.gold >= item.cost;
                const card = document.createElement('div');
                card.className = "bg-dungeon-gray rounded-xl p-md ghost-border relative overflow-hidden flex flex-col items-center text-center group hover:bg-surface-variant transition-colors";
                card.innerHTML = `
                    <div class="w-16 h-16 rounded-full bg-abyss-black flex items-center justify-center mb-sm ghost-border text-epic-purple glow-epic">
                        <span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1;">${item.icon || 'star'}</span>
                    </div>
                    <h3 class="font-quest-title text-quest-title text-on-surface mb-xs">${item.title}</h3>
                    <p class="text-on-surface-variant font-caption text-caption mb-md flex-1">${item.desc}</p>
                    <button class="w-full py-sm rounded ghost-border font-bold flex items-center justify-center gap-1 transition-all ${canAfford ? 'bg-epic-purple text-white hover:bg-primary-fixed-dim hover:shadow-[0_0_12px_rgba(124,58,237,0.5)]' : 'bg-shadow-slate text-outline-variant cursor-not-allowed'}" ${!canAfford ? 'disabled' : ''}>
                        <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">monetization_on</span>
                        ${item.cost} G
                    </button>
                `;
                
                const btn = card.querySelector('button');
                btn.onclick = () => {
                    if (state.gold >= item.cost) {
                        state.gold -= item.cost;
                        // Add to inventory
                        const invItem = state.inventory.find(i => i.id === item.id);
                        if (invItem) {
                            invItem.count++;
                        } else {
                            state.inventory.push({
                                id: item.id,
                                name: item.title,
                                type: 'consumable',
                                rarity: 'epic',
                                count: 1,
                                icon: item.icon || 'local_activity',
                                color: 'epic-purple'
                            });
                        }
                        localStorage.setItem(getGameSaveKey(), JSON.stringify(state));
                        applyGlobalState();
                        renderShop();
                    }
                };
                grid.appendChild(card);
            });
        }
        
        renderShop();
        
        // Handle add custom reward
        const addBtn = document.getElementById('btn-add-reward');
        const modal = document.getElementById('modal-add-reward');
        if (addBtn && modal) {
            addBtn.onclick = () => {
                document.getElementById('reward-title').value = '';
                document.getElementById('reward-desc').value = '';
                document.getElementById('reward-cost').value = '';
                modal.classList.remove('hidden');
            };
            document.getElementById('btn-close-reward').onclick = () => modal.classList.add('hidden');
            document.getElementById('btn-save-reward').onclick = () => {
                const title = document.getElementById('reward-title').value;
                const desc = document.getElementById('reward-desc').value;
                const cost = parseInt(document.getElementById('reward-cost').value);
                
                if (title && cost > 0) {
                    state.shopItems.push({
                        id: 'custom_' + Date.now(),
                        title: title,
                        desc: desc || '직접 등록한 보상',
                        cost: cost,
                        icon: 'star'
                    });
                    localStorage.setItem(getGameSaveKey(), JSON.stringify(state));
                    modal.classList.add('hidden');
                    renderShop();
                }
            };
        }
    }
    
    function initInventory() {
        if (!window.location.pathname.includes('inventory')) return;
        
        const grid = document.getElementById('inventory-grid');
        const modal = document.getElementById('modal-use-item');
        if (!grid) return;
        
        let selectedItemIdx = -1;
        
        function renderInventory() {
            grid.innerHTML = '';
            
            // Render actual items
            state.inventory.forEach((item, idx) => {
                const card = document.createElement('div');
                card.className = `aspect-square bg-abyss-black/50 backdrop-blur-sm rounded-lg border border-${item.color || 'outline-variant'}/50 relative cursor-pointer hover:border-${item.color || 'outline-variant'} transition-colors flex items-center justify-center hover:bg-shadow-slate group`;
                
                // Set rarity glow class if any
                if (item.rarity === 'legendary') card.classList.add('glow-gold', 'border-2', 'border-legendary-gold');
                else if (item.rarity === 'epic') card.classList.add('glow-epic');
                
                let imgHtml = '';
                if (item.img) {
                    imgHtml = `<img src="${item.img}" alt="${item.name}" class="w-3/4 h-3/4 object-contain">`;
                } else {
                    imgHtml = `<span class="material-symbols-outlined text-[40px] text-${item.color || 'outline-variant'}/80 group-hover:text-${item.color || 'outline-variant'} transition-colors" style="font-variation-settings: 'FILL' 1;">${item.icon || 'star'}</span>`;
                }
                
                card.innerHTML = `
                    <div class="absolute left-0 top-0 bottom-0 w-1 bg-${item.color || 'outline-variant'} rounded-l-lg opacity-80"></div>
                    ${imgHtml}
                    <span class="absolute bottom-1 right-2 font-caption text-[10px] text-white font-bold bg-abyss-black/80 px-1 rounded">${item.count}</span>
                `;
                
                card.onclick = () => {
                    selectedItemIdx = idx;
                    document.getElementById('use-item-title').textContent = item.name;
                    const iconEl = document.getElementById('use-item-icon');
                    iconEl.textContent = item.icon || 'star';
                    iconEl.className = `material-symbols-outlined text-4xl text-${item.color || 'outline-variant'}`;
                    
                    const descEl = document.getElementById('use-item-desc');
                    const confirmBtn = document.getElementById('btn-confirm-use');
                    
                    if (item.type === 'consumable') {
                        descEl.textContent = `[소모품] ${item.desc || '사용 가능한 아이템입니다.'} (남은 수량: ${item.count}개)`;
                        if (confirmBtn) {
                            confirmBtn.style.display = 'inline-block';
                            confirmBtn.textContent = '사용하기';
                        }
                    } else if (item.type === 'equipment' || item.type === 'weapon') {
                        descEl.textContent = `[장비/패시브] ${item.desc || '소지 시 특수한 효과를 부여합니다.'}`;
                        if (confirmBtn) confirmBtn.style.display = 'none';
                    } else if (item.type === 'material') {
                        descEl.textContent = `[재료] ${item.desc || '조합이나 교환에 사용되는 재료입니다.'} (보유 수량: ${item.count}개)`;
                        if (confirmBtn) confirmBtn.style.display = 'none';
                    } else {
                        descEl.textContent = `[아이템] ${item.desc || '특수 아이템입니다.'}`;
                        if (confirmBtn) confirmBtn.style.display = 'none';
                    }
                    
                    if (modal) modal.classList.remove('hidden');
                };
                
                grid.appendChild(card);
            });
            
            // Fill remaining slots up to 35 for visual grid
            const emptySlots = Math.max(0, 35 - state.inventory.length);
            for (let i = 0; i < emptySlots; i++) {
                const emptyCard = document.createElement('div');
                emptyCard.className = "aspect-square bg-abyss-black/50 backdrop-blur-sm rounded-lg border border-surface-variant relative flex items-center justify-center";
                grid.appendChild(emptyCard);
            }
        }
        
        renderInventory();
        
        if (modal) {
            document.getElementById('btn-cancel-use').onclick = () => modal.classList.add('hidden');
            document.getElementById('btn-confirm-use').onclick = () => {
                if (selectedItemIdx >= 0 && selectedItemIdx < state.inventory.length) {
                    const item = state.inventory[selectedItemIdx];
                    if (item.type === 'consumable' && item.count > 0) {
                        item.count--;
                        if (item.count <= 0) {
                            state.inventory.splice(selectedItemIdx, 1);
                        }
                        localStorage.setItem(getGameSaveKey(), JSON.stringify(state));
                        renderInventory();
                        const descPart = item.desc ? (item.desc.split(': ')[1] || item.desc) : '';
                        alert(`${item.name}을(를) 사용했습니다!\n${descPart}`);
                    }
                }
                modal.classList.add('hidden');
            };
        }
    }
    

    function initPenaltyQuest() {
        const btnSubmitProof = document.getElementById('btn-submit-proof');
        const uploadModal = document.getElementById('evidence-upload-modal');
        const aiModal = document.getElementById('ai-verification-modal');
        const progressBar = document.getElementById('ai-progress-bar');
        const statusText = document.getElementById('ai-status-text');

        if (!btnSubmitProof || !aiModal) return;

        // Evidence Upload Modal Logic
        if (uploadModal) {
            btnSubmitProof.onclick = () => {
                uploadModal.classList.remove('hidden');
            };

            const closeBtn = document.getElementById('btn-close-evidence');
            const cancelBtn = document.getElementById('btn-cancel-evidence');
            const confirmBtn = document.getElementById('btn-confirm-evidence');
            const fileInput = document.getElementById('evidence-file-input');
            const fileNameDisplay = document.getElementById('evidence-file-name');

            const hideUploadModal = () => {
                uploadModal.classList.add('hidden');
                if (fileInput) fileInput.value = '';
                if (fileNameDisplay) fileNameDisplay.textContent = '클릭하여 사진 첨부';
            };

            if (closeBtn) closeBtn.onclick = hideUploadModal;
            if (cancelBtn) cancelBtn.onclick = hideUploadModal;

            if (fileInput && fileNameDisplay) {
                fileInput.onchange = (e) => {
                    if (e.target.files && e.target.files.length > 0) {
                        fileNameDisplay.textContent = e.target.files[0].name;
                        fileNameDisplay.classList.add('text-primary');
                    } else {
                        fileNameDisplay.textContent = '클릭하여 사진 첨부';
                        fileNameDisplay.classList.remove('text-primary');
                    }
                };
            }

            if (confirmBtn) {
                confirmBtn.onclick = () => {
                    // 1. Hide upload modal
                    hideUploadModal();
                    
                    // 2. Start AI Verification
                    aiModal.classList.remove('hidden');
                    progressBar.style.width = '0%';
                    statusText.textContent = "제출된 운동 기록을 분석하고 있습니다...";
                    
                    setTimeout(() => { progressBar.style.width = '30%'; statusText.textContent = "자세 추적 및 거리 데이터 연동 중..."; }, 1000);
                    setTimeout(() => { progressBar.style.width = '70%'; statusText.textContent = "목표 달성 여부 검증 중..."; }, 2500);
                    setTimeout(() => { 
                        progressBar.style.width = '100%'; 
                        statusText.textContent = "검증 완료! 모든 일일 미션 조건을 달성했습니다."; 
                        statusText.classList.add('text-success-green', 'font-bold');
                    }, 4000);
                    
                    setTimeout(() => {
                        aiModal.classList.add('hidden');
                        statusText.classList.remove('text-success-green', 'font-bold');
                        
                        // Programmatically check all boxes and update state
                        const checkboxes = document.querySelectorAll('.penalty-checkbox');
                        checkboxes.forEach((cb, idx) => {
                            if (state.dailyProgress && !state.dailyProgress.submitted) {
                                cb.checked = true;
                                state.dailyProgress.completions[idx] = true;
                                const icon = cb.nextElementSibling;
                                if (icon) icon.style.opacity = '1';
                            }
                        });
                        
                        if (typeof window.saveState === 'function') window.saveState();
                        if (typeof window.updateBtnUI === 'function') window.updateBtnUI();
                    }, 5500);
                };
            }
        }
    }
    
    function initDungeonRewardsUI() {
        if (window.location.pathname.includes('quests')) {
            const expE = document.getElementById('reward-exp-e');
            const expC = document.getElementById('reward-exp-c');
            const expS = document.getElementById('reward-exp-s');
            
            if (expE) expE.textContent = '+' + (50 * state.level).toLocaleString() + ' EXP';
            if (expC) expC.textContent = '+' + (150 * state.level).toLocaleString() + ' EXP';
            if (expS) expS.textContent = '+' + (500 * state.level).toLocaleString() + ' EXP';

            const cardExpE = document.getElementById('card-exp-e');
            const cardExpC = document.getElementById('card-exp-c');
            const cardExpS = document.getElementById('card-exp-s');
            
            if (cardExpE) cardExpE.textContent = (50 * state.level).toLocaleString() + ' XP';
            if (cardExpC) cardExpC.textContent = (150 * state.level).toLocaleString() + ' XP';
            if (cardExpS) cardExpS.textContent = (500 * state.level).toLocaleString() + ' XP';
        }
    }
    
    function initDungeonManagementUI() {
        if (window.location.pathname.includes('quests')) {
            const selectEl = document.getElementById('dungeon-select-new');
            const nameInput = document.getElementById('dungeon-name-input-new');
            const descInput = document.getElementById('dungeon-desc-input-new');
            const saveBtn = document.getElementById('btn-save-dungeon-new');
            
            const customTrigger = document.getElementById('custom-dungeon-select-trigger');
            const customLabel = document.getElementById('custom-dungeon-select-label');
            const customOptions = document.getElementById('custom-dungeon-select-options');
            const customIcon = document.getElementById('custom-dungeon-select-icon');

            if (selectEl && nameInput && descInput && saveBtn) {
                // Populate both selectEl and customOptions list
                selectEl.innerHTML = '';
                if (customOptions) customOptions.innerHTML = '';

                DEFAULT_DUNGEONS.forEach(d => {
                    // Populate native select
                    const opt = document.createElement('option');
                    opt.value = d.id;
                    opt.textContent = `[${d.rank}급] ${d.name}`;
                    selectEl.appendChild(opt);

                    // Populate custom select option div
                    if (customOptions) {
                        const item = document.createElement('div');
                        item.className = 'px-4 py-2.5 hover:bg-epic-purple/30 text-on-surface hover:text-white font-medium cursor-pointer transition-colors flex items-center justify-between border-b border-outline-variant/10 last:border-0';
                        item.dataset.value = d.id;
                        item.innerHTML = `<span class="font-bold text-sm">[${d.rank}급] ${d.name}</span><span class="text-xs text-outline">${d.desc.substring(0, 14)}...</span>`;
                        
                        item.onclick = (e) => {
                            e.stopPropagation();
                            selectEl.value = d.id;
                            if (customLabel) customLabel.textContent = `[${d.rank}급] ${d.name}`;
                            if (customOptions) customOptions.classList.add('hidden');
                            if (customIcon) customIcon.style.transform = 'rotate(0deg)';
                            loadSelected();
                        };
                        customOptions.appendChild(item);
                    }
                });

                if (customTrigger && customOptions) {
                    customTrigger.onclick = (e) => {
                        e.stopPropagation();
                        const isHidden = customOptions.classList.contains('hidden');
                        if (isHidden) {
                            customOptions.classList.remove('hidden');
                            if (customIcon) customIcon.style.transform = 'rotate(180deg)';
                        } else {
                            customOptions.classList.add('hidden');
                            if (customIcon) customIcon.style.transform = 'rotate(0deg)';
                        }
                    };

                    // Close custom dropdown on outside click
                    document.addEventListener('click', (e) => {
                        if (!customTrigger.contains(e.target) && !customOptions.contains(e.target)) {
                            customOptions.classList.add('hidden');
                            if (customIcon) customIcon.style.transform = 'rotate(0deg)';
                        }
                    });
                }

                const loadSelected = () => {
                    const id = selectEl.value;
                    const custom = state.customDungeons && state.customDungeons[id];
                    const def = DEFAULT_DUNGEONS.find(d => d.id === id);
                    if (def) {
                        nameInput.value = custom ? custom.name : def.name;
                        descInput.value = custom ? custom.desc : def.desc;
                    }
                };

                selectEl.addEventListener('change', loadSelected);

                saveBtn.addEventListener('click', () => {
                    const id = selectEl.value;
                    if (!state.customDungeons) state.customDungeons = {};
                    state.customDungeons[id] = {
                        name: nameInput.value.trim(),
                        desc: descInput.value.trim()
                    };
                    saveState();
                    applyCustomDungeons(); // Apply immediately
                    document.getElementById('dungeon-edit-modal-new').classList.add('hidden');
                    alert('던전 정보가 성공적으로 저장되었습니다!');
                });

                // Load initial
                if (DEFAULT_DUNGEONS.length > 0) {
                    selectEl.value = DEFAULT_DUNGEONS[0].id;
                    const def = DEFAULT_DUNGEONS[0];
                    if (customLabel) customLabel.textContent = `[${def.rank}급] ${def.name}`;
                    loadSelected();
                }
            }
        }
    }

    function applyCustomDungeons() {
        if (window.location.pathname.includes('quests') && state.customDungeons) {
            // Target all dungeon cards. We assume they are in the exact order of window.DEFAULT_DUNGEONS
            const cards = document.querySelectorAll('#view-list .bg-dungeon-gray');
            cards.forEach((card, idx) => {
                const def = window.DEFAULT_DUNGEONS[idx];
                if (!def) return;
                
                // Fix broken onclick handlers (e.g. view-d_rank doesn't exist)
                let viewTarget = 'view-e_rank';
                if (def.id.endsWith('2')) viewTarget = 'view-c_rank';
                if (def.id.endsWith('3')) viewTarget = 'view-s_rank';
                card.setAttribute('onclick', `openQuestView('${viewTarget}')`);
                
                const custom = state.customDungeons[def.id];
                const nameToUse = custom ? custom.name : def.name;
                const descToUse = custom ? custom.desc : def.desc;

                const titleEl = card.querySelector('.font-quest-title');
                const descEl = card.querySelector('.line-clamp-2');

                if (titleEl) titleEl.textContent = nameToUse;
                if (descEl) descEl.textContent = descToUse;
            });
        }
    }

    // --- Added Global UI Feature Handlers & PWA Registration ---
    document.addEventListener('DOMContentLoaded', () => {
        // Register PWA Manifest dynamically if missing
        if (!document.querySelector('link[rel="manifest"]')) {
            const manifestLink = document.createElement('link');
            manifestLink.rel = 'manifest';
            manifestLink.href = 'manifest.json';
            document.head.appendChild(manifestLink);
        }
        if (!document.querySelector('meta[name="theme-color"]')) {
            const themeMeta = document.createElement('meta');
            themeMeta.name = 'theme-color';
            themeMeta.content = '#0B0B0F';
            document.head.appendChild(themeMeta);
        }

        // Unregister serviceWorker for local stability
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                for (let registration of registrations) {
                    registration.unregister();
                }
            }).catch(() => {});
        }

        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => {
            // Premium Membership
            if(btn.textContent.trim() === '프리미엄 멤버십') {
                btn.onclick = () => alert('프리미엄 멤버십 혜택 시스템은 현재 준비 중입니다. 곧 업데이트될 예정입니다!');
            }
            // Notifications
            if(btn.innerHTML.includes('notifications')) {
                btn.onclick = () => alert('현재 수신된 새로운 알림이나 메시지가 없습니다.');
            }
        });
    });

    function initAchievements() {
        if (!window.location.pathname.includes('achievements')) return;
        
        // 1. Progress bars
        const pbFills = document.querySelectorAll('.progress-bar-fill');
        const captions = document.querySelectorAll('.font-caption.text-caption.text-on-surface-variant');
        
        if (pbFills.length >= 3 && captions.length >= 3) {
            // First: Dungeons (Marathon runner)
            const dCount = state.dungeonsCleared || 0;
            const dMax = 50;
            const dPct = Math.min(100, Math.floor((dCount/dMax)*100));
            captions[0].textContent = dCount + ' / ' + dMax + ' 회';
            pbFills[0].style.width = dPct + '%';
            
            // Second: Wealth
            const gCount = state.gold || 0;
            const gMax = 10000;
            const gPct = Math.min(100, Math.floor((gCount/gMax)*100));
            captions[1].textContent = gCount.toLocaleString() + ' / ' + gMax.toLocaleString() + ' G';
            pbFills[1].style.width = gPct + '%';
            
            // Third: Login days
            const lCount = state.loginDays || 1;
            const lMax = 100;
            const lPct = Math.min(100, Math.floor((lCount/lMax)*100));
            captions[2].textContent = lCount + ' / ' + lMax + ' Days';
            pbFills[2].style.width = lPct + '%';
        }
        
        // 2. Trophies count (Top Right)
        const trophyCountEl = document.querySelector('.font-section-title.text-section-title.font-bold');
        if (trophyCountEl) {
            let unlocked = 0;
            if ((state.dungeonsCleared || 0) >= 50) unlocked++;
            if ((state.gold || 0) >= 10000) unlocked++;
            if ((state.loginDays || 1) >= 100) unlocked++;
            if (state.level >= 100) unlocked++;
            
            let statTotal = 0;
            if(state.stats) {
                Object.values(state.stats).forEach(v => statTotal += v);
            }
            if (statTotal >= 100) unlocked++;
            
            trophyCountEl.textContent = unlocked + ' / 50';
        }
        
        // 3. Update S-Rank dynamic states
        const sRankBadges = document.querySelectorAll('.glow-legendary');
        if (sRankBadges.length >= 2) {
            // Level 100
            const s1Status = sRankBadges[0].querySelector('.flex.items-center.justify-between span:first-child');
            if (s1Status) {
                s1Status.textContent = state.level >= 100 ? '해제됨' : '미달성';
                s1Status.className = state.level >= 100 ? 'text-legendary-gold' : 'text-outline-variant';
                sRankBadges[0].querySelector('h3').textContent = '100레벨 달성';
                sRankBadges[0].querySelector('p').textContent = '꾸준한 성장을 통해 100레벨의 벽을 넘어보세요.';
            }
            // Stats 100
            let statTotal = 0;
            if(state.stats) Object.values(state.stats).forEach(v => statTotal += v);
            const s2Status = sRankBadges[1].querySelector('.flex.items-center.justify-between span:first-child');
            if (s2Status) {
                s2Status.textContent = statTotal >= 100 ? '해제됨' : '미달성';
                s2Status.className = statTotal >= 100 ? 'text-legendary-gold' : 'text-outline-variant';
                sRankBadges[1].querySelector('h3').textContent = '총합 능력치 100';
                sRankBadges[1].querySelector('p').textContent = '모든 기본 스탯을 꾸준히 성장시켜 총합 100을 달성하세요.';
            }
        }
    }

    function initSystemSettingsModal() {
        if (!document.getElementById('system-settings-modal')) {
            const modalHtml = `
            <div id="system-settings-modal" class="hidden fixed inset-0 z-[200] flex items-center justify-center p-4 bg-abyss-black/80 backdrop-blur-md">
              <div class="bg-dungeon-gray border border-epic-purple/40 rounded-xl p-lg max-w-md w-full shadow-[0_0_30px_rgba(124,58,237,0.3)] relative text-on-surface">
                 <!-- Header -->
                 <div class="flex justify-between items-center mb-md border-b border-outline-variant/20 pb-sm">
                    <div class="flex items-center gap-2">
                       <span class="material-symbols-outlined text-epic-purple">settings</span>
                       <h3 class="font-section-title text-card-title text-white">시스템 설정 & 프로필</h3>
                    </div>
                    <button id="sys-btn-close-settings" class="text-on-surface-variant hover:text-white"><span class="material-symbols-outlined">close</span></button>
                 </div>
                 
                 <!-- Section 1: Profile Customization -->
                 <div class="mb-lg space-y-sm">
                    <h4 class="font-bold text-primary text-sm uppercase tracking-wider flex items-center gap-1"><span class="material-symbols-outlined text-sm">person</span> 프로필 커스텀</h4>
                    <div>
                       <label class="font-caption text-on-surface-variant block mb-1">플레이어 닉네임</label>
                       <input type="text" id="sys-setting-name-input" class="w-full bg-abyss-black border border-outline-variant/30 text-white rounded-lg py-2 px-3 focus:outline-none focus:border-epic-purple" placeholder="성진우">
                    </div>
                    <div class="grid grid-cols-2 gap-sm">
                       <div>
                          <label class="font-caption text-on-surface-variant block mb-1">신장 (키 cm)</label>
                          <input type="number" id="sys-setting-height-input" class="w-full bg-abyss-black border border-outline-variant/30 text-white rounded-lg py-2 px-3 focus:outline-none focus:border-epic-purple" placeholder="178">
                       </div>
                       <div>
                          <label class="font-caption text-on-surface-variant block mb-1">체중 (몸무게 kg)</label>
                          <input type="number" id="sys-setting-weight-input" class="w-full bg-abyss-black border border-outline-variant/30 text-white rounded-lg py-2 px-3 focus:outline-none focus:border-epic-purple" placeholder="70">
                       </div>
                    </div>
                    <div>
                       <label class="font-caption text-on-surface-variant block mb-1">프로필 이미지 선택</label>
                       <input type="file" id="sys-setting-avatar-input" accept="image/*" class="w-full text-xs text-on-surface-variant file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-epic-purple file:text-white file:font-bold hover:file:bg-inverse-primary cursor-pointer">
                    </div>
                    <button type="button" id="sys-btn-save-profile" onclick="window.handleSaveProfile(event)" class="w-full bg-epic-purple text-white font-bold py-2 rounded-lg hover:shadow-[0_0_10px_rgba(124,58,237,0.5)] transition-all text-sm mt-1">프로필 변경사항 저장</button>
                 </div>

                  <!-- Section 2: Data Backup & Restore -->
                 <div class="space-y-sm pt-sm border-t border-outline-variant/20">
                    <h4 class="font-bold text-legendary-gold text-sm uppercase tracking-wider flex items-center gap-1"><span class="material-symbols-outlined text-sm">database</span> 데이터 백업 / 복원 / 초기화</h4>
                    <div class="grid grid-cols-2 gap-sm">
                       <button id="sys-btn-export-json" class="bg-surface-container-high border border-outline-variant/30 text-white font-semibold py-2 px-3 rounded-lg hover:border-legendary-gold hover:text-legendary-gold transition-colors flex items-center justify-center gap-1 text-xs">
                          <span class="material-symbols-outlined text-sm">download</span> 백업 다운로드
                       </button>
                       <button id="sys-btn-import-json-trigger" class="bg-surface-container-high border border-outline-variant/30 text-white font-semibold py-2 px-3 rounded-lg hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1 text-xs">
                          <span class="material-symbols-outlined text-sm">upload</span> 데이터 불러오기
                       </button>
                       <input type="file" id="sys-import-json-file" accept=".json" class="hidden">
                    </div>
                    <button id="sys-btn-reset-data" class="w-full bg-health-red/20 text-health-red border border-health-red/40 font-semibold py-2 rounded-lg hover:bg-health-red hover:text-white transition-all flex items-center justify-center gap-1 text-xs mt-2">
                       <span class="material-symbols-outlined text-sm">restart_alt</span> 데이터 전체 초기화 (Reset)
                    </button>
                 </div>
              </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // Close button
            document.getElementById('sys-btn-close-settings').onclick = () => {
                document.getElementById('system-settings-modal').classList.add('hidden');
            };

            // Save profile button
            window.handleSaveProfile = (e) => {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                if (!state) state = {};
                if (!state.customProfile) {
                    state.customProfile = { name: '성진우', title: 'Lv.1', avatarUrl: '', height: 178, weight: 70 };
                }
                const nameInput = document.getElementById('sys-setting-name-input');
                const nameVal = nameInput ? nameInput.value.trim() : '';
                if (nameVal) {
                    state.customProfile.name = nameVal;
                    try {
                        const session = localStorage.getItem('lvlup_current_user') || sessionStorage.getItem('lvlup_current_user');
                        if (session) {
                            const u = JSON.parse(session);
                            u.name = nameVal;
                            localStorage.setItem('lvlup_current_user', JSON.stringify(u));
                        }
                    } catch(err) {}
                }
                const hInput = document.getElementById('sys-setting-height-input') || document.getElementById('set-profile-height');
                const wInput = document.getElementById('sys-setting-weight-input') || document.getElementById('set-profile-weight');
                if (hInput && hInput.value) state.customProfile.height = parseFloat(hInput.value);
                if (wInput && wInput.value) state.customProfile.weight = parseFloat(wInput.value);

                const avatarInput = document.getElementById('sys-setting-avatar-input');
                if (avatarInput && avatarInput.files && avatarInput.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        state.customProfile.avatarUrl = ev.target.result;
                        saveState();
                        alert('프로필 변경사항이 성공적으로 저장되었습니다!');
                        const modal = document.getElementById('system-settings-modal');
                        if (modal) modal.classList.add('hidden');
                        location.reload();
                    };
                    reader.readAsDataURL(avatarInput.files[0]);
                } else {
                    saveState();
                    alert('프로필 변경사항이 성공적으로 저장되었습니다!');
                    const modal = document.getElementById('system-settings-modal');
                    if (modal) modal.classList.add('hidden');
                    location.reload();
                }
            };
            document.getElementById('sys-btn-save-profile').onclick = window.handleSaveProfile;

            // Export JSON
            document.getElementById('sys-btn-export-json').onclick = () => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `LevelUpLife_SaveData_${new Date().toISOString().split('T')[0]}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
            };

            // Import JSON
            const importFileElem = document.getElementById('sys-import-json-file');
            document.getElementById('sys-btn-import-json-trigger').onclick = () => importFileElem.click();
            importFileElem.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const importedState = JSON.parse(event.target.result);
                        if (typeof importedState === 'object' && importedState.level !== undefined) {
                            localStorage.setItem(getGameSaveKey(), JSON.stringify(importedState));
                            alert('데이터 복원이 성공적으로 완료되었습니다! 페이지를 다시 읽어옵니다.');
                            location.reload();
                        } else {
                            alert('올바른 Level Up Life 백업 파일이 아닙니다.');
                        }
                    } catch(err) {
                        alert('파일을 읽는 중 오류가 발생했습니다: ' + err.message);
                    }
                };
                reader.readAsText(file);
            };

            // Reset Data
            document.getElementById('sys-btn-reset-data').onclick = () => {
                if (confirm('정말로 모든 게임 진행 데이터(레벨, 골드, 던전 기록)를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                    localStorage.removeItem(getGameSaveKey());
                    alert('게임 데이터가 초기화되었습니다.');
                    location.reload();
                }
            };
        }

        // Attach gear icon click event to open settings modal across all pages (except quests edit gear)
        const gearBtns = document.querySelectorAll('button');
        gearBtns.forEach(btn => {
            if (btn.innerHTML.includes('settings') && !btn.hasAttribute('onclick')) {
                btn.onclick = () => {
                    const modal = document.getElementById('system-settings-modal');
                    const nameInput = document.getElementById('sys-setting-name-input');
                    const heightInput = document.getElementById('sys-setting-height-input');
                    const weightInput = document.getElementById('sys-setting-weight-input');
                    if (nameInput) nameInput.value = state.customProfile ? state.customProfile.name : '성진우';
                    if (heightInput) heightInput.value = (state.customProfile && state.customProfile.height) ? state.customProfile.height : 178;
                    if (weightInput) weightInput.value = (state.customProfile && state.customProfile.weight) ? state.customProfile.weight : 70;
                    if (modal) modal.classList.remove('hidden');
                };

            }
        });

        // Also make sidebar / status profile avatar & name click trigger settings modal!
        const profileTriggers = document.querySelectorAll('aside h2, aside img[src*="aida-public"], aside .glow-epic');
        profileTriggers.forEach(el => {
            el.style.cursor = 'pointer';
            el.title = '클릭하여 프로필 및 사진 변경';
            el.onclick = () => {
                const modal = document.getElementById('system-settings-modal');
                const nameInput = document.getElementById('sys-setting-name-input');
                const heightInput = document.getElementById('sys-setting-height-input');
                const weightInput = document.getElementById('sys-setting-weight-input');
                if (nameInput) nameInput.value = state.customProfile ? state.customProfile.name : '성진우';
                if (heightInput) heightInput.value = (state.customProfile && state.customProfile.height) ? state.customProfile.height : 178;
                if (weightInput) weightInput.value = (state.customProfile && state.customProfile.weight) ? state.customProfile.weight : 70;
                if (modal) modal.classList.remove('hidden');
            };
        });
    }

    function initDungeonTimer() {
        if (!window.location.pathname.includes('quests')) return;
        
        let seconds = 0;
        let timerInterval = null;
        let isRunning = false;

        const timerDisplays = document.querySelectorAll('.font-level-display.text-level-display.text-health-red');
        timerDisplays.forEach(display => {
            display.style.cursor = 'pointer';
            display.title = '클릭하여 스톱워치 시작/일시정지';
            
            const parent = display.parentElement;
            if (parent && !parent.querySelector('.timer-status-badge')) {
                const badge = document.createElement('div');
                badge.className = 'timer-status-badge text-[11px] font-bold text-primary bg-epic-purple/20 px-2 py-0.5 rounded-full mt-2 cursor-pointer border border-primary/30 select-none';
                badge.textContent = '▶ 타이머 시작';
                parent.appendChild(badge);

                const toggleTimer = () => {
                    if (!isRunning) {
                        isRunning = true;
                        badge.textContent = '⏸ 일시정지';
                        badge.className = 'timer-status-badge text-[11px] font-bold text-health-red bg-health-red/20 px-2 py-0.5 rounded-full mt-2 cursor-pointer border border-health-red/30 select-none';
                        timerInterval = setInterval(() => {
                            seconds++;
                            const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
                            const secs = (seconds % 60).toString().padStart(2, '0');
                            display.innerHTML = `<span class="material-symbols-outlined text-4xl animate-pulse">timer</span> ${mins}:${secs}`;
                        }, 1000);
                    } else {
                        isRunning = false;
                        clearInterval(timerInterval);
                        badge.textContent = '▶ 다시 시작';
                        badge.className = 'timer-status-badge text-[11px] font-bold text-primary bg-epic-purple/20 px-2 py-0.5 rounded-full mt-2 cursor-pointer border border-primary/30 select-none';
                    }
                };

                display.onclick = toggleTimer;
                badge.onclick = toggleTimer;
            }
        });
    }

    function initDailyQuestManagementUI() {
        if (window.location.pathname.includes('dashboard')) {
            const selectEl = document.getElementById('dq-select-new');
            const titleInput = document.getElementById('dq-title-input-new');
            const descInput = document.getElementById('dq-desc-input-new');
            const statSelect = document.getElementById('dq-stat-select-new');
            const saveBtn = document.getElementById('btn-save-dq-new');

            const customTrigger = document.getElementById('custom-dq-select-trigger');
            const customLabel = document.getElementById('custom-dq-select-label');
            const customOptions = document.getElementById('custom-dq-select-options');
            const customIcon = document.getElementById('custom-dq-select-icon');

            if (selectEl && titleInput && descInput && statSelect && saveBtn) {
                const categoryMap = {
                    'str': '💪 힘(운동)',
                    'agi': '⚡ 민첩(순발력)',
                    'int': '🧠 지능(학습/독서)',
                    'wil': '🛡️ 의지(습관/멘탈)',
                    'cha': '✨ 매력(소통/자기관리)'
                };

                const getFreshState = () => {
                    const saveKey = window.getGameSaveKey();
                    try {
                        const ls = localStorage.getItem(saveKey);
                        if (ls) {
                            const parsed = JSON.parse(ls);
                            state = parsed;
                            return parsed;
                        }
                    } catch(e) {}
                    return state;
                };

                const refreshQuestDropdownOptions = () => {
                    const curState = getFreshState();
                    selectEl.innerHTML = '';
                    if (customOptions) customOptions.innerHTML = '';

                    const dqs = curState.customDailyQuests || [];
                    dqs.forEach((q, idx) => {
                        const opt = document.createElement('option');
                        opt.value = idx;
                        opt.textContent = `[퀘스트 ${idx + 1}] ${q.title}`;
                        selectEl.appendChild(opt);

                        if (customOptions) {
                            const item = document.createElement('div');
                            item.className = 'px-4 py-2.5 hover:bg-epic-purple/30 text-on-surface hover:text-white font-medium cursor-pointer transition-colors flex items-center justify-between border-b border-outline-variant/10 last:border-0';
                            item.dataset.value = idx;
                            const displayCat = categoryMap[q.rewardStat] || q.category || '💪 힘(운동)';
                            item.innerHTML = `<span class="font-bold text-sm">[퀘스트 ${idx + 1}] ${q.title}</span><span class="text-xs text-outline font-bold">${displayCat}</span>`;
                            
                            item.onclick = (e) => {
                                e.stopPropagation();
                                selectEl.value = idx;
                                if (customLabel) customLabel.textContent = `[퀘스트 ${idx + 1}] ${q.title}`;
                                if (customOptions) customOptions.classList.add('hidden');
                                if (customIcon) customIcon.style.transform = 'rotate(0deg)';
                                loadSelected();
                            };
                            customOptions.appendChild(item);
                        }
                    });
                };

                const loadSelected = () => {
                    const curState = getFreshState();
                    const idx = parseInt(selectEl.value, 10);
                    const q = curState.customDailyQuests && curState.customDailyQuests[idx];
                    if (q) {
                        titleInput.value = q.title || '';
                        descInput.value = q.desc || '';
                        if (q.rewardStat) statSelect.value = q.rewardStat;
                        if (customLabel) customLabel.textContent = `[퀘스트 ${idx + 1}] ${q.title}`;
                    }
                };

                titleInput.addEventListener('input', () => {
                    const val = titleInput.value.trim();
                    if (val && typeof window.autoAnalyzeQuest === 'function') {
                        const res = window.autoAnalyzeQuest(val);
                        statSelect.value = res.statKey;
                    }
                });

                refreshQuestDropdownOptions();

                // Modal open observer to always sync latest data when opened
                const modalEl = document.getElementById('daily-quest-edit-modal-new');
                if (modalEl) {
                    const observer = new MutationObserver(() => {
                        if (!modalEl.classList.contains('hidden')) {
                            refreshQuestDropdownOptions();
                            loadSelected();
                        }
                    });
                    observer.observe(modalEl, { attributes: true, attributeFilter: ['class'] });
                }

                if (customTrigger && customOptions) {
                    customTrigger.onclick = (e) => {
                        e.stopPropagation();
                        refreshQuestDropdownOptions();
                        const isHidden = customOptions.classList.contains('hidden');
                        if (isHidden) {
                            customOptions.classList.remove('hidden');
                            if (customIcon) customIcon.style.transform = 'rotate(180deg)';
                        } else {
                            customOptions.classList.add('hidden');
                            if (customIcon) customIcon.style.transform = 'rotate(0deg)';
                        }
                    };

                    document.addEventListener('click', (e) => {
                        if (!customTrigger.contains(e.target) && !customOptions.contains(e.target)) {
                            customOptions.classList.add('hidden');
                            if (customIcon) customIcon.style.transform = 'rotate(0deg)';
                        }
                    });
                }

                selectEl.addEventListener('change', loadSelected);

                saveBtn.addEventListener('click', () => {
                    const saveKey = window.getGameSaveKey();
                    let curState = getFreshState();
                    const idx = parseInt(selectEl.value, 10);
                    if (!curState.customDailyQuests) curState.customDailyQuests = [];
                    if (curState.customDailyQuests[idx]) {
                        const statKey = statSelect.value;
                        const newTitle = titleInput.value.trim();
                        if (newTitle) curState.customDailyQuests[idx].title = newTitle;
                        curState.customDailyQuests[idx].desc = descInput.value.trim() || curState.customDailyQuests[idx].desc;
                        curState.customDailyQuests[idx].rewardStat = statKey;
                        curState.customDailyQuests[idx].category = categoryMap[statKey] || '💪 힘(운동)';

                        state = curState;
                        localStorage.setItem(saveKey, JSON.stringify(curState));

                        refreshQuestDropdownOptions();
                        if (modalEl) modalEl.classList.add('hidden');
                        alert(`[퀘스트 ${idx + 1}] 설정이 성공적으로 저장되었습니다!`);
                        location.reload();
                    }
                });

                const curState = getFreshState();
                const dqs = curState.customDailyQuests || [];
                if (dqs.length > 0) {
                    selectEl.value = 0;
                    if (customLabel) customLabel.textContent = `[퀘스트 1] ${dqs[0].title}`;
                    loadSelected();
                }
            }
        }
    }

    // ====== RANK-UP TRIAL SYSTEM (승급전 시스템) ======
    window.RANK_TRIALS = {
        'D': { reqLevel: 5, rankName: 'D급 헌터', missionTitle: 'D급 헌터 승급 시험', missionDesc: '💪 체력 증진: 푸쉬업 50회 & 스쿼트 50회 완수', rewardText: 'D급 던전 3종 전격 해금' },
        'C': { reqLevel: 10, rankName: 'C급 헌터', missionTitle: 'C급 헌터 승급 시험', missionDesc: '🧠 지능/체력 확장: 종합 미션 3종 완수', rewardText: 'C급 던전 3종 전격 해금' },
        'B': { reqLevel: 15, rankName: 'B급 헌터', missionTitle: 'B급 헌터 승급 시험', missionDesc: '🛡️ 상급 마수 정벌: 상급 루틴 및 정신력 미션 완수', rewardText: 'B급 던전 3종 전격 해금' },
        'A': { reqLevel: 20, rankName: 'A급 헌터', missionTitle: 'A급 헌터 승급 시험', missionDesc: '⚡ 최정예 헌터: 마왕성 관문 돌파 미션 완수', rewardText: 'A급 던전 3종 전격 해금' },
        'S': { reqLevel: 25, rankName: 'S급 헌터', missionTitle: 'S급 헌터 승급 시험', missionDesc: '👑 국가권력급 헌터: 최강의 헌터 최종 시험 완수', rewardText: 'S급 전설 던전 3종 전격 해금' }
    };

    function initRankUpTrialSystem() {
        if (!state.hunterRank) state.hunterRank = 'E';
        if (!state.unlockedRanks) state.unlockedRanks = ['E'];

        const playerLevel = state.level || 1;
        const ranks = ['E', 'D', 'C', 'B', 'A', 'S'];

        // Determine current target trial rank
        let targetRank = null;
        for (let i = 1; i < ranks.length; i++) {
            const r = ranks[i];
            if (!state.unlockedRanks.includes(r)) {
                targetRank = r;
                break;
            }
        }

        // 1. Render Rank-Up Trial Banner if targetRank exists
        const renderBanner = (containerEl) => {
            if (!containerEl) return;
            if (!targetRank) {
                containerEl.innerHTML = `
                    <div class="bg-gradient-to-r from-legendary-gold/20 via-primary/20 to-legendary-gold/20 border border-legendary-gold/50 rounded-xl p-4 flex items-center justify-between shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-legendary-gold text-3xl">workspace_premium</span>
                            <div>
                                <h3 class="font-bold text-white text-base">👑 최고 등급(S급 헌터) 달성!</h3>
                                <p class="text-xs text-on-surface-variant">모든 던전 등급이 전격 해금되었습니다.</p>
                            </div>
                        </div>
                        <span class="bg-legendary-gold text-black text-xs font-bold px-3 py-1 rounded-full">S급 최강 헌터</span>
                    </div>
                `;
                return;
            }

            const trial = RANK_TRIALS[targetRank];
            const isEligible = playerLevel >= trial.reqLevel;

            if (isEligible) {
                containerEl.innerHTML = `
                    <div class="bg-gradient-to-r from-epic-purple/40 via-primary/30 to-epic-purple/40 border-2 border-primary rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_25px_rgba(124,58,237,0.5)] animate-pulse">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary">
                                <span class="material-symbols-outlined text-2xl">military_tech</span>
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <span class="bg-primary text-black text-xs font-black px-2 py-0.5 rounded-full uppercase tracking-wider">🔥 승급전 도전 가능</span>
                                    <h3 class="font-bold text-white text-base">${trial.missionTitle}</h3>
                                </div>
                                <p class="text-xs text-on-surface-variant mt-1">${trial.missionDesc} (${trial.rewardText})</p>
                            </div>
                        </div>
                        <button id="btn-challenge-rank-trial" class="bg-primary hover:bg-primary-fixed text-black font-black px-6 py-2.5 rounded-lg shadow-lg hover:scale-105 transition-all text-sm flex items-center gap-2">
                            <span class="material-symbols-outlined text-lg">workspace_premium</span> 승급 시험 완료 및 ${trial.rankName} 승급!
                        </button>
                    </div>
                `;

                const btn = containerEl.querySelector('#btn-challenge-rank-trial');
                if (btn) {
                    btn.onclick = () => {
                        state.hunterRank = targetRank;
                        if (!state.unlockedRanks.includes(targetRank)) {
                            state.unlockedRanks.push(targetRank);
                        }
                        if (!state.customProfile) state.customProfile = {};
                        state.customProfile.title = targetRank + '급 헌터';
                        saveState();

                        alert(`🎉 축하합니다!\n\n[${trial.rankName}] 승급 시험을 완수하여 승급하셨습니다!\n${trial.rewardText}`);
                        location.reload();
                    };
                }
            } else {
                containerEl.innerHTML = `
                    <div class="bg-surface-container-high/60 border border-outline-variant/30 rounded-xl p-4 flex items-center justify-between w-full">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-outline text-2xl">lock</span>
                            <div>
                                <h3 class="font-bold text-on-surface-variant text-sm">[${trial.missionTitle}] 오픈 대기 중</h3>
                                <p class="text-xs text-outline">해금 필요 레벨: Lv.${trial.reqLevel} (현재 플레이어 레벨: Lv.${playerLevel})</p>
                            </div>
                        </div>
                        <span class="text-xs text-outline font-mono whitespace-nowrap shrink-0">Lv.${playerLevel} / Lv.${trial.reqLevel}</span>
                    </div>
                `;
            }
        };

        renderBanner(document.getElementById('rank-up-trial-banner-container'));
        renderBanner(document.getElementById('rank-up-trial-banner-container-dash'));

        // 2. Lock Dungeon Cards on quests.html
        if (window.location.pathname.includes('quests')) {
            const cards = document.querySelectorAll('#view-list .bg-dungeon-gray');
            const cardRanks = ['E', 'E', 'E', 'D', 'D', 'D', 'C', 'C', 'C', 'B', 'B', 'B', 'A', 'A', 'A', 'S', 'S', 'S'];

            cards.forEach((card, idx) => {
                const rank = cardRanks[idx] || 'E';
                const isUnlocked = state.unlockedRanks.includes(rank);

                if (!isUnlocked) {
                    const reqLv = RANK_TRIALS[rank] ? RANK_TRIALS[rank].reqLevel : 5;
                    
                    // Create lock overlay
                    let overlay = card.querySelector('.dungeon-lock-overlay');
                    if (!overlay) {
                        overlay = document.createElement('div');
                        overlay.className = 'dungeon-lock-overlay absolute inset-0 bg-abyss-black/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-4 text-center rounded-lg border border-outline-variant/30';
                        overlay.innerHTML = `
                            <span class="material-symbols-outlined text-4xl text-outline mb-2">lock</span>
                            <h4 class="font-bold text-white text-sm mb-1">[${rank}급 던전 잠김]</h4>
                            <p class="text-xs text-on-surface-variant mb-3">${rank}급 헌터 승급전 완료 필요<br>(Lv.${reqLv} 달성 시 도전 가능)</p>
                            <button class="bg-outline-variant/20 hover:bg-epic-purple text-outline hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-all border border-outline-variant/30">
                                승급 시험 보기
                            </button>
                        `;
                        card.appendChild(overlay);
                        
                        overlay.onclick = (e) => {
                            e.stopPropagation();
                            alert(`🔒 [${rank}급 던전 잠김]\n\n이 던전에 입장하려면 [${rank}급 헌터 승급 시험]을 통과해야 합니다.\n(요구 레벨: Lv.${reqLv} / 현재 레벨: Lv.${state.level || 1})`);
                        };
                    }
                }
            });
        }
    }

// Floating XP/Gold Reward Effect
window.triggerRewardFloatingEffect = function(x, y, expText = '+150 XP', goldText = '+500G') {
    const container = document.createElement('div');
    container.className = 'fixed pointer-events-none z-[9999] flex flex-col items-center gap-1 font-black text-sm animate-float-reward';
    container.style.left = (x || (window.innerWidth / 2 - 40)) + 'px';
    container.style.top = (y || (window.innerHeight / 2 - 30)) + 'px';
    
    container.innerHTML = `
        <div class="flex items-center gap-1 text-exp-blue drop-shadow-[0_0_12px_rgba(59,130,246,0.9)] text-base font-mono">
            <span class="material-symbols-outlined text-sm">arrow_upward</span> ${expText}
        </div>
        <div class="flex items-center gap-1 text-legendary-gold drop-shadow-[0_0_12px_rgba(234,179,8,0.9)] text-base font-mono">
            <span class="material-symbols-outlined text-sm">monetization_on</span> ${goldText}
        </div>
    `;

    document.body.appendChild(container);
    setTimeout(() => {
        if (container && container.parentNode) container.parentNode.removeChild(container);
    }, 1200);
};

// Inject CSS Keyframes dynamically
(function() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatReward {
            0% { opacity: 0; transform: translateY(0) scale(0.7); }
            20% { opacity: 1; transform: translateY(-20px) scale(1.1); }
            80% { opacity: 1; transform: translateY(-50px) scale(1); }
            100% { opacity: 0; transform: translateY(-75px) scale(0.9); }
        }
        .animate-float-reward {
            animation: floatReward 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-spin-slow {
            animation: spin 10s linear infinite;
        }
    `;
    document.head.appendChild(style);
})();

    // ====== STREAK HEATMAP & GACHA LOOT BOX SYSTEM ======
    function initStreakAndGachaSystem() {
        // 1. Render Streak Heatmap Grid (28 Days)
        const streakGrid = document.getElementById('streak-heatmap-grid');
        const streakBadge = document.getElementById('streak-counter-badge');
        if (streakGrid) {
            if (!state.streakHistory) state.streakHistory = {};
            const todayStr = new Date().toISOString().split('T')[0];
            
            // Mark today if dailyProgress is submitted or completed, else delete
            if (state.dailyProgress && state.dailyProgress.submitted) {
                state.streakHistory[todayStr] = true;
            } else if (state.streakHistory && state.streakHistory[todayStr]) {
                delete state.streakHistory[todayStr];
            }

            // Calculate current streak
            let streakDays = 0;
            let checkDate = new Date();
            for (let i = 0; i < 30; i++) {
                const dateStr = checkDate.toISOString().split('T')[0];
                if (state.streakHistory[dateStr]) {
                    streakDays++;
                } else if (i > 0) {
                    break;
                }
                checkDate.setDate(checkDate.getDate() - 1);
            }
            if (streakBadge) {
                streakBadge.textContent = `🔥 ${streakDays}일 연속 달성 중`;
                if (streakDays === 0) {
                    streakBadge.classList.remove('animate-pulse');
                    streakBadge.style.opacity = '0.6';
                } else {
                    streakBadge.classList.add('animate-pulse');
                    streakBadge.style.opacity = '1';
                }
            }

            // Update Dedicated Milestone Claim Buttons UI (3, 7, 14, 28)
            if (!state.claimedStreakMilestones) state.claimedStreakMilestones = {};
            [3, 7, 14, 28].forEach(d => {
                const btn = document.getElementById(`btn-claim-streak-${d}`);
                if (btn) {
                    if (state.claimedStreakMilestones[d]) {
                        btn.textContent = '✅ 완료';
                        btn.className = 'w-full bg-outline-variant/30 text-on-surface-variant/50 text-[9px] py-1 rounded font-bold cursor-default line-through';
                    } else if (streakDays >= d) {
                        btn.textContent = '🎁 보상 받기';
                        btn.className = 'w-full bg-epic-purple text-white hover:bg-primary text-[9px] py-1 rounded font-bold transition-all shadow-[0_0_8px_rgba(124,58,237,0.8)] animate-bounce cursor-pointer';
                    } else {
                        btn.textContent = `🔒 ${d}일`;
                        btn.className = 'w-full bg-outline-variant/20 text-on-surface-variant text-[9px] py-1 rounded font-bold cursor-not-allowed opacity-60';
                    }
                }
            });

            // Populate 28 tile grid
            streakGrid.innerHTML = '';
            const curr = new Date();
            for (let i = 27; i >= 0; i--) {
                const d = new Date(curr);
                d.setDate(d.getDate() - i);
                const dStr = d.toISOString().split('T')[0];
                const isDone = state.streakHistory[dStr];
                
                const tile = document.createElement('div');
                tile.title = `${dStr}: ${isDone ? '완수 완료' : '미완수'}`;
                tile.className = `h-6 rounded flex items-center justify-center text-[9px] font-mono transition-all cursor-pointer ${
                    isDone 
                        ? 'bg-epic-purple text-white shadow-[0_0_8px_rgba(124,58,237,0.8)] border border-primary/50 font-bold' 
                        : 'bg-abyss-black/80 text-outline-variant/40 border border-outline-variant/10'
                }`;
                tile.textContent = d.getDate();
                streakGrid.appendChild(tile);
            }
        }

        // 2. Gacha Loot Box Opening Handler
        const lootBtn = document.getElementById('btn-open-loot-box');
        if (lootBtn) {
            lootBtn.onclick = (e) => {
                if ((state.gold || 0) < 1000) {
                    alert(`⚠️ 골드가 부족합니다!\n\n필요: 1,000G / 현재 보유: ${(state.gold || 0).toLocaleString()}G`);
                    return;
                }

                state.gold -= 1000;
                
                // Roll Loot
                const loots = [
                    { name: '🗡️ 그림자 군주의 단검', type: '무기', rarity: '전설', desc: 'STR +5 증가 특수 단검', stat: 'str', val: 5 },
                    { name: '💍 투지의 영원 반지', type: '장신구', rarity: '영웅', desc: 'EXP 획득량 15% 버프', buff: 'exp15' },
                    { name: '🧪 최상급 HP 회복 포션', type: '소모품', rarity: '희귀', desc: '체력 +50 완전 회복' },
                    { name: '📜 각성의 마나 주문서', type: '주문서', rarity: '영웅', desc: 'INT +5 증가 인챈트', stat: 'int', val: 5 },
                    { name: '👑 [카이셀의 후계자] 칭호', type: '칭호', rarity: '신화', desc: '모든 스탯 +3 대폭 상승', stat: 'all', val: 3 }
                ];

                const rolled = loots[Math.floor(Math.random() * loots.length)];

                // Apply rewards
                if (rolled.stat === 'all') {
                    if (!state.stats) state.stats = { str: 10, agi: 10, int: 10, wil: 10, cha: 10 };
                    Object.keys(state.stats).forEach(k => state.stats[k] += 3);
                } else if (rolled.stat && state.stats && state.stats[rolled.stat] !== undefined) {
                    state.stats[rolled.stat] += rolled.val;
                }

                if (!state.inventory) state.inventory = [];
                state.inventory.push({ id: 'loot_' + Date.now(), name: rolled.name, type: rolled.type, rarity: rolled.rarity });
                saveState();

                // Trigger floating reward effect
                if (window.triggerRewardFloatingEffect) {
                    window.triggerRewardFloatingEffect(e.clientX, e.clientY, '+500 XP', '🎁 상자 오픈!');
                }

                alert(`🎁 [보상 상자 오픈 성공!]\n\n🎉 획득 아이템: ${rolled.name}\n등급: [${rolled.rarity}]\n설명: ${rolled.desc}`);
                location.reload();
            };
        }
    }

    window.addStatPoint = function(statKey) {
        const saveKey = (function() {
            try {
                const session = localStorage.getItem('lvlup_current_user') || sessionStorage.getItem('lvlup_current_user');
                if (session) {
                    const u = JSON.parse(session);
                    if (u && u.id) return 'game_save_state_' + u.id.toLowerCase().replace(/[^a-z0-9]/g, '_');
                }
            } catch(e) {}
            return 'game_save_state_guest';
        })();

        let curState = null;
        try {
            const saved = localStorage.getItem(saveKey);
            if (saved) curState = JSON.parse(saved);
        } catch(e) {}

        if (!curState) return;

        if (curState.statPoints === undefined) curState.statPoints = 5;
        if (!curState.stats) curState.stats = { str: 10, agi: 10, int: 10, wil: 10, cha: 10 };

        if (curState.statPoints <= 0) {
            alert('사용 가능한 능력치 포인트가 없습니다!\n퀘스트 완료 및 레벨업을 통해 포인트를 획득하세요.');
            return;
        }

        curState.statPoints--;
        curState.stats[statKey] = (curState.stats[statKey] || 10) + 1;

        if (statKey === 'agi') curState.stats['dex'] = curState.stats['agi'];
        if (statKey === 'dex') curState.stats['agi'] = curState.stats['dex'];
        if (statKey === 'wil') curState.stats['disc'] = curState.stats['wil'];
        if (statKey === 'disc') curState.stats['wil'] = curState.stats['disc'];

        localStorage.setItem(saveKey, JSON.stringify(curState));

        if (typeof window.updateDashboardStatsUI === 'function') {
            window.updateDashboardStatsUI();
        }

        const nameMap = { str: '힘', agi: '민첩', dex: '민첩', int: '지능', wil: '의지', disc: '의지', cha: '매력' };
        const label = nameMap[statKey] || statKey;

        const toast = document.createElement('div');
        toast.className = 'fixed top-20 right-5 z-50 bg-[#1f1f23] text-white px-3 py-1.5 rounded-lg shadow-xl border border-epic-purple text-xs font-bold flex items-center gap-1.5 animate-bounce';
        toast.innerHTML = `<span class="material-symbols-outlined text-epic-purple text-sm">upgrade</span> ${label} +1 (남은 포인트: ${curState.statPoints} Pts)`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 1800);
    };

    window.subtractStatPoint = function(statKey) {
        const saveKey = (function() {
            try {
                const session = localStorage.getItem('lvlup_current_user') || sessionStorage.getItem('lvlup_current_user');
                if (session) {
                    const u = JSON.parse(session);
                    if (u && u.id) return 'game_save_state_' + u.id.toLowerCase().replace(/[^a-z0-9]/g, '_');
                }
            } catch(e) {}
            return 'game_save_state_guest';
        })();

        let curState = null;
        try {
            const saved = localStorage.getItem(saveKey);
            if (saved) curState = JSON.parse(saved);
        } catch(e) {}

        if (!curState) return;

        if (curState.statPoints === undefined) curState.statPoints = 5;
        if (!curState.stats) curState.stats = { str: 10, agi: 10, int: 10, wil: 10, cha: 10 };

        const currentVal = curState.stats[statKey] || 10;
        const minVal = 10;

        if (currentVal <= minVal) {
            alert(`기본 능력치(${minVal}) 이하로는 포인트를 줄일 수 없습니다.`);
            return;
        }

        curState.stats[statKey] = currentVal - 1;
        curState.statPoints = (curState.statPoints || 0) + 1;

        if (statKey === 'agi') curState.stats['dex'] = curState.stats['agi'];
        if (statKey === 'dex') curState.stats['agi'] = curState.stats['dex'];
        if (statKey === 'wil') curState.stats['disc'] = curState.stats['wil'];
        if (statKey === 'disc') curState.stats['wil'] = curState.stats['disc'];

        localStorage.setItem(saveKey, JSON.stringify(curState));

        if (typeof window.updateDashboardStatsUI === 'function') {
            window.updateDashboardStatsUI();
        }

        const nameMap = { str: '힘', agi: '민첩', dex: '민첩', int: '지능', wil: '의지', disc: '의지', cha: '매력' };
        const label = nameMap[statKey] || statKey;

        const toast = document.createElement('div');
        toast.className = 'fixed top-20 right-5 z-50 bg-[#1f1f23] text-white px-3 py-1.5 rounded-lg shadow-xl border border-health-red text-xs font-bold flex items-center gap-1.5 animate-bounce';
        toast.innerHTML = `<span class="material-symbols-outlined text-health-red text-sm">remove_circle</span> ${label} -1 (환불된 포인트: ${curState.statPoints} Pts)`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 1800);
    };

    window.claimStreakReward = function(days) {
        const saveKey = (function() {
            try {
                const session = localStorage.getItem('lvlup_current_user') || sessionStorage.getItem('lvlup_current_user');
                if (session) {
                    const u = JSON.parse(session);
                    if (u && u.id) return 'game_save_state_' + u.id.toLowerCase().replace(/[^a-z0-9]/g, '_');
                }
            } catch(e) {}
            return 'game_save_state_guest';
        })();

        let curState = null;
        try {
            const saved = localStorage.getItem(saveKey);
            if (saved) curState = JSON.parse(saved);
        } catch(e) {}

        if (!curState) return;

        if (!curState.claimedStreakMilestones) curState.claimedStreakMilestones = {};
        if (curState.claimedStreakMilestones[days]) {
            alert('이미 수령 완료한 연속 달성 스트릭 보상입니다.');
            return;
        }

        let streakDays = 0;
        if (curState.streakHistory) {
            let checkDate = new Date();
            for (let i = 0; i < 30; i++) {
                const dateStr = checkDate.toISOString().split('T')[0];
                if (curState.streakHistory[dateStr]) {
                    streakDays++;
                } else if (i > 0) {
                    break;
                }
                checkDate.setDate(checkDate.getDate() - 1);
            }
        }

        if (streakDays < days) {
            alert(`🔒 [스트릭 보상 수령 불가]\n\n연속 ${days}일 이상 달성 시 수령하실 수 있습니다.\n(현재 연속 달성: ${streakDays}일)`);
            return;
        }

        const rewards = {
            3: { gold: 500, exp: 100, name: '3일 연속 달성 스트릭 전용 보상 (+500G & +100 XP)' },
            7: { gold: 1000, exp: 300, name: '7일 연속 달성 스트릭 전용 보상 (+1,000G 상자 이용권)' },
            14: { gold: 2500, exp: 500, item: { id: 'stat_potion_sub', name: '상급 능력치 영약', type: 'consumable', rarity: 'epic', count: 1, icon: 'science', color: 'epic-purple', desc: '사용 시 모든 능력치 +2 상승' }, name: '14일 연속 달성 스트릭 전용 보상 (+2,500G & 🧪 상급 능력치 영약)' },
            28: { gold: 5000, exp: 1000, item: { id: 'shadow_dagger', name: '그림자 군주의 단검', type: 'equipment', rarity: 'legendary', count: 1, icon: 'colorize', color: 'legendary-gold', desc: '장착 시 힘 +5 상승 전설 무기' }, name: '28일 연속 달성 스트릭 전용 보상 (+5,000G & 🗡️ 그림자 군주의 단검)' }
        };

        const r = rewards[days];
        if (r) {
            curState.claimedStreakMilestones[days] = true;
            curState.gold = (curState.gold || 0) + r.gold;
            curState.exp = (curState.exp || 0) + r.exp;
            if (r.item && curState.inventory) {
                curState.inventory.push(r.item);
            }

            localStorage.setItem(saveKey, JSON.stringify(curState));
            state = curState;

            alert(`🎁 [연속 달성 스트릭 전용 보상 수령 완료!]\n\n획득 보상: ${r.name}`);

            if (typeof initStreakAndGachaSystem === 'function') {
                initStreakAndGachaSystem();
            }
            if (typeof window.updateDashboardStatsUI === 'function') {
                window.updateDashboardStatsUI();
            }
        }
    };

    // Multi-device Cloud Sync & Data Migration Helpers
    window.exportUserData = function() {
        try {
            const saveKey = window.getGameSaveKey();
            const rawData = localStorage.getItem(saveKey) || '{}';
            const session = localStorage.getItem('lvlup_current_user') || sessionStorage.getItem('lvlup_current_user');
            const user = session ? JSON.parse(session) : { id: 'guest' };
            
            const backupObj = {
                version: '1.0',
                exportedAt: new Date().toISOString(),
                user: user,
                gameState: JSON.parse(rawData)
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `LevelUp_Life_Backup_${(user.id || 'player').replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0,10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            alert('📥 [계정 데이터 백업 완료]\n다운로드된 JSON 파일을 다른 PC나 모바일에서 [데이터 복원]으로 등록하시면 그대로 이어서 플레이하실 수 있습니다.');
        } catch(e) {
            alert('백업 생성 실패: ' + e.message);
        }
    };

    window.importUserData = function(fileInputElement) {
        if (!fileInputElement || !fileInputElement.files || !fileInputElement.files[0]) {
            alert('올바른 백업 .json 파일을 선택해 주세요.');
            return;
        }
        const file = fileInputElement.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (data && data.gameState) {
                    const saveKey = window.getGameSaveKey();
                    localStorage.setItem(saveKey, JSON.stringify(data.gameState));
                    if (data.user && data.user.id) {
                        localStorage.setItem('lvlup_current_user', JSON.stringify(data.user));
                    }
                    alert('📤 [계정 데이터 복원 완료]\n성공적으로 데이터를 불러왔습니다. 페이지를 새로고침합니다.');
                    window.location.reload();
                } else {
                    alert('유효하지 않은 백업 파일 형식입니다.');
                }
            } catch(err) {
                alert('파일 읽기 오류: ' + err.message);
            }
        };
        reader.readAsText(file);
    };

    window.addEventListener('load', initDungeonRewardsUI);
    window.addEventListener('load', initPenaltyQuest);
    window.addEventListener('load', initDungeonManagementUI);
    window.addEventListener('load', initDailyQuestManagementUI);
    window.addEventListener('load', initRankUpTrialSystem);
    window.addEventListener('load', initStreakAndGachaSystem);
    window.addEventListener('load', applyCustomDungeons);
    window.addEventListener('load', initShop);
    window.addEventListener('load', initInventory);
    window.addEventListener('load', initAchievements);
    window.addEventListener('load', initSystemSettingsModal);
    window.addEventListener('load', initDungeonTimer);
})();
