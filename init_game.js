(function() {
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

    // Initialize or load state
    let state = null;
    const saved = localStorage.getItem('game_save_state');
    if (saved) {
        try {
            state = JSON.parse(saved);
            // Migration for new dungeons state
            if (!state.dungeons || !state.dungeons.s_rank || state.dungeons.routine) {
                state.dungeons = JSON.parse(JSON.stringify(defaultState.dungeons));
                localStorage.setItem('game_save_state', JSON.stringify(state));
            }
            if (!state.dungeonMetadata) {
                state.dungeonMetadata = JSON.parse(JSON.stringify(defaultState.dungeonMetadata));
                localStorage.setItem('game_save_state', JSON.stringify(state));
            }
            // Migration for shopItems
            if (!state.shopItems) {
                state.shopItems = JSON.parse(JSON.stringify(defaultState.shopItems));
                localStorage.setItem('game_save_state', JSON.stringify(state));
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

            localStorage.setItem('game_save_state', JSON.stringify(state));
        } catch(e) {}
    }
    
    if (!state) {
        state = JSON.parse(JSON.stringify(defaultState));
        state.lastQuestDate = getTodayString();
        localStorage.setItem('game_save_state', JSON.stringify(state));
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
        localStorage.setItem('game_save_state', JSON.stringify(state));
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
        localStorage.setItem('game_save_state', JSON.stringify(state));
    }

    // Daily Reset check
    const today = getTodayString();
    if (state.lastQuestDate !== today) {
        state.dailyQuests = {};
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
        localStorage.setItem('game_save_state', JSON.stringify(state));
    }

    function saveState() {
        localStorage.setItem('game_save_state', JSON.stringify(state));
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

        // Add missing button navigations
        document.querySelectorAll('button').forEach(btn => {
            const txt = btn.textContent.trim();
            if (txt === '프리미엄 멤버십') {
                btn.onclick = () => window.location.href = 'payment.html';
            } else if (txt === '임무 시작') {
                btn.onclick = () => window.location.href = 'quests.html';
            }
        });

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
                        const ls = localStorage.getItem('game_save_state');
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
                            
                            localStorage.setItem('game_save_state', JSON.stringify(state));
                            
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
        state = JSON.parse(localStorage.getItem('game_save_state')) || {};
    } catch(e) { state = {}; }

    if (!state.customProfile) {
        state.customProfile = { name: '성진우', title: 'Lv.1', avatarUrl: '' };
    } else if (state.customProfile.title === 'E급 헌터') {
        state.customProfile.title = 'Lv.1';
    }
    
    // Add default stats if not exists
    if (!state.stats) {
        state.stats = { str: 10, agi: 10, int: 10, wil: 10, cha: 10 };
    }

    if (!state.customDailyQuests || state.customDailyQuests.length !== 3 || state.customDailyQuests[0].title === '아침 달리기') {
        state.customDailyQuests = [
            { id: 'dq_1', title: '푸쉬업 100회', desc: '상태창의 퀘스트를 완수하세요.', rarity: '일반', category: '💪 힘(운동)', rewardStat: 'str' },
            { id: 'dq_2', title: '윗몸 일으키기 100회', desc: '상태창의 퀘스트를 완수하세요.', rarity: '일반', category: '💪 힘(운동)', rewardStat: 'str' },
            { id: 'dq_3', title: '달리기 10km', desc: '상태창의 퀘스트를 완수하세요.', rarity: '일반', category: '💪 힘(운동)', rewardStat: 'agi' }
        ];
    } else {
        // Enforce categories and add rewardStat if missing
        if(state.customDailyQuests[0]) { state.customDailyQuests[0].category = '💪 힘(운동)'; if(!state.customDailyQuests[0].rewardStat) state.customDailyQuests[0].rewardStat = 'str'; }
        if(state.customDailyQuests[1]) { state.customDailyQuests[1].category = '💪 힘(운동)'; if(!state.customDailyQuests[1].rewardStat) state.customDailyQuests[1].rewardStat = 'str'; }
        if(state.customDailyQuests[2]) { state.customDailyQuests[2].category = '💪 힘(운동)'; if(!state.customDailyQuests[2].rewardStat) state.customDailyQuests[2].rewardStat = 'agi'; }
    }
    
    if (!state.level) state.level = 1;
    if (typeof state.exp === 'undefined') state.exp = 0;
    if (!state.maxExp) state.maxExp = 100;
    
    const todayStr = new Date().toISOString().split('T')[0];
    if (!state.dailyProgress || state.dailyProgress.date !== todayStr) {
        state.dailyProgress = { date: todayStr, completions: [false, false, false], submitted: false };
    }

    function saveState() {
        localStorage.setItem('game_save_state', JSON.stringify(state));
    }

    // 2. Apply Custom Settings on load
    function applyCustomSettings() {
        state.customProfile.title = 'LV. ' + state.level; // Dynamically sync with global level
        
        // Update Profile Name & Title
        const names = document.querySelectorAll('aside h2, main h2.text-on-surface, main h3.font-section-title'); 
        names.forEach(el => {
            if (el.textContent.trim() === '성진우' || el.dataset.isCustomName) {
                el.textContent = state.customProfile.name;
                el.dataset.isCustomName = 'true';
            }
        });

        const titles = document.querySelectorAll('aside p, main p.text-on-surface-variant');
        titles.forEach(el => {
            if (el.textContent.trim().includes('E급 헌터') || el.textContent.trim().includes('Lv.') || el.textContent.trim().includes('LV.') || el.dataset.isCustomTitle) {
                el.textContent = state.customProfile.title;
                el.dataset.isCustomTitle = 'true';
            }
        });

        if (state.customProfile.avatarUrl) {
            const avatars = document.querySelectorAll('img[alt*="Profile"], aside img[src*="aida-public"]');
            avatars.forEach(img => img.src = state.customProfile.avatarUrl);
        }

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
                                
                                // Revoke EXP
                                const expReward = (10 * state.level) * completedCount;
                                state.exp -= expReward;
                                
                                // Revoke Stat Bonuses for Quests
                                state.dailyProgress.completions.forEach((isCompleted, idx) => {
                                    if (isCompleted && state.customDailyQuests[idx]) {
                                        const statKey = state.customDailyQuests[idx].rewardStat;
                                        if (statKey && state.stats[statKey] !== undefined) {
                                            state.stats[statKey] -= 0.5;
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
                                        const statKey = state.customDailyQuests[idx].rewardStat;
                                        if (statKey && state.stats[statKey] !== undefined) {
                                            let statIncrease = 0.5;
                                            
                                            // Equipment Buff: 그림자 군주의 단검 (dagger) for strength stats
                                            const hasDagger = state.inventory && state.inventory.find(i => i.id === 'dagger');
                                            if (hasDagger && statKey === 'str') {
                                                statIncrease = 1.0;
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
        
        const defaultAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQsPOWFcfYf7WAkzip9pYWBWl0L4qORIoh4EMa_FoPtwNnNNLQavbKltrGbpW2aUFYBEhXdZL-_O8bqRVKXgrbh7JgXInecWz8xYp9xxRIuoPC3zxI9XCv3rzjMXoOF8o8fn4_t1SWA8AAcsChxyfGyFA631ihqv9IBfZtD5PWf3VUGABfVrnySkJbXWVozoTsk8HLrATVghEGmHSevm2pWdxKb5RVH6jszadDhcfY6DJHHWtx3r-ovv9wMH0Gm9D1FUjllQ6niFo';
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
                    localStorage.removeItem('game_save_state');
                    location.reload();
                }
            };
        }

        document.getElementById('btn-save-settings').onclick = () => {
            state.customProfile.name = document.getElementById('set-profile-name').value;
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
                        localStorage.setItem('game_save_state', JSON.stringify(state));
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
                    localStorage.setItem('game_save_state', JSON.stringify(state));
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
                        localStorage.setItem('game_save_state', JSON.stringify(state));
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

            if (selectEl && nameInput && descInput && saveBtn) {
                // Populate dropdown
                selectEl.innerHTML = '';
                DEFAULT_DUNGEONS.forEach(d => {
                    const opt = document.createElement('option');
                    opt.value = d.id;
                    opt.textContent = `[${d.rank}급] ${d.name}`;
                    selectEl.appendChild(opt);
                });

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

        // Register Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(() => {});
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
                    <div>
                       <label class="font-caption text-on-surface-variant block mb-1">프로필 이미지 선택</label>
                       <input type="file" id="sys-setting-avatar-input" accept="image/*" class="w-full text-xs text-on-surface-variant file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-epic-purple file:text-white file:font-bold hover:file:bg-inverse-primary cursor-pointer">
                    </div>
                    <button id="sys-btn-save-profile" class="w-full bg-epic-purple text-white font-bold py-2 rounded-lg hover:shadow-[0_0_10px_rgba(124,58,237,0.5)] transition-all text-sm mt-1">프로필 변경사항 저장</button>
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
            document.getElementById('sys-btn-save-profile').onclick = () => {
                const nameInput = document.getElementById('sys-setting-name-input').value.trim();
                if (nameInput) {
                    state.customProfile.name = nameInput;
                }
                const avatarInput = document.getElementById('sys-setting-avatar-input');
                if (avatarInput.files && avatarInput.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        state.customProfile.avatarUrl = e.target.result;
                        saveState();
                        applyCustomSettings();
                        alert('프로필 닉네임 및 이미지가 저장되었습니다!');
                        document.getElementById('system-settings-modal').classList.add('hidden');
                    };
                    reader.readAsDataURL(avatarInput.files[0]);
                } else {
                    saveState();
                    applyCustomSettings();
                    alert('프로필 닉네임이 저장되었습니다!');
                    document.getElementById('system-settings-modal').classList.add('hidden');
                }
            };

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
                            localStorage.setItem('game_save_state', JSON.stringify(importedState));
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
                    localStorage.removeItem('game_save_state');
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
                    if (nameInput) nameInput.value = state.customProfile ? state.customProfile.name : '성진우';
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
                if (nameInput) nameInput.value = state.customProfile ? state.customProfile.name : '성진우';
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

    window.addEventListener('load', initDungeonRewardsUI);
    window.addEventListener('load', initPenaltyQuest);
    window.addEventListener('load', initDungeonManagementUI);
    window.addEventListener('load', applyCustomDungeons);
    window.addEventListener('load', initShop);
    window.addEventListener('load', initInventory);
    window.addEventListener('load', initAchievements);
    window.addEventListener('load', initSystemSettingsModal);
    window.addEventListener('load', initDungeonTimer);
})();
