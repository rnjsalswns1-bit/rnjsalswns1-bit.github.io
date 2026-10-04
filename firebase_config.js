/**
 * Level Up Life - Firebase Authentication & Firestore Cloud Sync Module
 * 
 * Configured for project: level-up-life-11dbe
 */

// 1. Firebase Configuration
window.firebaseConfig = {
    apiKey: "AIzaSyBw9pAS2oD7XPgdbnVN06oo0mvxiW08zNU",
    authDomain: "level-up-life-11dbe.firebaseapp.com",
    projectId: "level-up-life-11dbe",
    storageBucket: "level-up-life-11dbe.firebasestorage.app",
    messagingSenderId: "1040581542507",
    appId: "1:1040581542507:web:e0a7d66524257e32bc272e",
    measurementId: "G-54M2XJ4E98"
};

// Global Firebase handles
window.firebaseApp = null;
window.auth = null;
window.db = null;
window.isFirebaseReady = false;
window._authListenerAttached = false;

// Helper to check if credentials have been replaced with real user project keys
function hasRealFirebaseConfig() {
    return window.firebaseConfig && 
           window.firebaseConfig.projectId && 
           !window.firebaseConfig.projectId.includes("YOUR_PROJECT") &&
           window.firebaseConfig.apiKey &&
           !window.firebaseConfig.apiKey.includes("YOUR_FIREBASE_API_KEY");
}
window.hasRealFirebaseConfig = hasRealFirebaseConfig;

// Simple SHA-256 Hash helper as a local fallback
async function hashPassword(password) {
    if (!password) return '';
    try {
        const msgUint8 = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
        return btoa(password);
    }
}
window.hashPassword = hashPassword;

// Status Notification Banner
function showCloudStatusToast(message, isSuccess = true) {
    let toast = document.getElementById('cloud-status-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cloud-status-toast';
        toast.className = 'fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition-all duration-300 transform translate-y-10 opacity-0 flex items-center gap-2';
        document.body.appendChild(toast);
    }
    
    if (isSuccess) {
        toast.style.backgroundColor = 'rgba(34, 197, 94, 0.9)';
        toast.style.color = '#ffffff';
    } else {
        toast.style.backgroundColor = 'rgba(239, 68, 68, 0.9)';
        toast.style.color = '#ffffff';
    }
    
    toast.innerHTML = message;
    toast.classList.remove('translate-y-10', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    
    if (window.cloudToastTimer) clearTimeout(window.cloudToastTimer);
    window.cloudToastTimer = setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-10', 'opacity-0');
    }, 3500);
}
window.showCloudStatusToast = showCloudStatusToast;

// Initialize Firebase App, Auth & Firestore SDK
function initFirebaseApp() {
    if (window.firebaseApp && window.db && window.auth) {
        window.isFirebaseReady = true;
        setupFirebaseAuthListener();
        return true;
    }
    try {
        if (typeof firebase !== 'undefined' && hasRealFirebaseConfig()) {
            if (!firebase.apps.length) {
                window.firebaseApp = firebase.initializeApp(window.firebaseConfig);
            } else {
                window.firebaseApp = firebase.app();
            }
            window.auth = firebase.auth();
            window.db = firebase.firestore();
            window.isFirebaseReady = true;
            console.log("☁️ Firebase Authentication & Firestore connected successfully.");
            setupFirebaseAuthListener();
            return true;
        }
    } catch (e) {
        console.warn("⚠️ Firebase Initialization Warning:", e.message);
    }
    window.isFirebaseReady = false;
    return false;
}
window.initFirebaseApp = initFirebaseApp;

// Debounced Cloud Save Handler (300ms)
let cloudSaveDebounceTimer = null;

/**
 * Gets active UID (Firebase Auth UID or local session user UID)
 */
function getActiveUserId() {
    if (window.auth && window.auth.currentUser && window.auth.currentUser.uid) {
        return window.auth.currentUser.uid;
    }
    try {
        const sessionStr = localStorage.getItem('lvlup_current_user') || sessionStorage.getItem('lvlup_current_user');
        if (sessionStr) {
            const u = JSON.parse(sessionStr);
            if (u.uid) return u.uid;
            if (u.id && !u.id.includes('@')) return u.id;
        }
    } catch(e) {}
    return null;
}
window.getActiveUserId = getActiveUserId;

/**
 * Saves current game state to Firebase Firestore: users/{userId}
 * Uses Firebase Auth UID strictly for Firestore rules compatibility.
 */
window.saveGameToCloud = async function(state, forcedUserId = null) {
    if (!state) return false;

    // Determine target UID: Always prioritize Auth UID if available
    let targetUid = null;
    if (window.auth && window.auth.currentUser) {
        targetUid = window.auth.currentUser.uid;
    } else if (forcedUserId && !forcedUserId.includes('@')) {
        targetUid = forcedUserId;
    } else {
        targetUid = getActiveUserId();
    }

    if (!targetUid) return false;
    const cleanUserId = targetUid.trim();
    const saveKey = window.getGameSaveKey ? window.getGameSaveKey() : ('game_save_state_' + cleanUserId.replace(/[^a-zA-Z0-9_-]/g, '_'));

    // Safe local backup
    try {
        if (window.safeLocalStorage && state) {
            window.safeLocalStorage.setItem(saveKey, JSON.stringify(state));
        }
    } catch(e) {}

    return new Promise((resolve) => {
        if (cloudSaveDebounceTimer) clearTimeout(cloudSaveDebounceTimer);
        cloudSaveDebounceTimer = setTimeout(async () => {
            const isReady = initFirebaseApp();
            if (!isReady) {
                showCloudStatusToast("⚠️ 로컬 저장 완료 (Firebase 연결 대기)", false);
                resolve(false);
                return;
            }

            try {
                let docId = cleanUserId;
                if (window.auth && window.auth.currentUser) {
                    docId = window.auth.currentUser.uid;
                }

                const userDocRef = window.db.collection('users').doc(docId);

                // Anti-overwrite protection: Don't overwrite higher level cloud progress with default level 1 state
                try {
                    const snap = await userDocRef.get();
                    if (snap.exists) {
                        const existing = snap.data();
                        if (existing && existing.gameState) {
                            const ex = existing.gameState;
                            if ((ex.level > state.level) || (ex.level === state.level && ex.exp > state.exp)) {
                                console.warn("⚠️ [Cloud Save] 클라우드 캐릭터가 더 높은 레벨입니다. 덮어쓰기를 중단하고 클라우드 상태를 로컬로 복원합니다.");
                                if (window.applyLoadedCloudState) {
                                    window.applyLoadedCloudState(ex);
                                }
                                resolve(true);
                                return;
                            }
                        }
                    }
                } catch(checkErr) {
                    // Ignore check errors and proceed with normal save
                }

                const payload = {
                    gameState: state,
                    userUid: docId,
                    userEmail: (window.auth && window.auth.currentUser) ? (window.auth.currentUser.email || '') : '',
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastSavedAtStr: new Date().toISOString()
                };

                await userDocRef.set(payload, { merge: true });
                showCloudStatusToast("☁️ 클라우드 저장 완료 (Firestore)", true);
                resolve(true);
            } catch (e) {
                console.error("Firebase Cloud Save Error:", e);
                showCloudStatusToast("⚠️ 클라우드 저장 실패: " + e.message, false);
                resolve(false);
            }
        }, 300);
    });
};

/**
 * Loads game state from Firebase Firestore: users/{userId}
 */
window.loadGameFromCloud = async function(userId = null) {
    let targetUid = null;
    if (window.auth && window.auth.currentUser) {
        targetUid = window.auth.currentUser.uid;
    } else if (userId && !userId.includes('@')) {
        targetUid = userId;
    } else {
        targetUid = getActiveUserId();
    }

    if (!targetUid) return null;
    const cleanUserId = targetUid.trim();
    const saveKey = window.getGameSaveKey ? window.getGameSaveKey() : ('game_save_state_' + cleanUserId.replace(/[^a-zA-Z0-9_-]/g, '_'));

    let localSaveData = null;
    try {
        const rawLocal = localStorage.getItem(saveKey) || (window.safeLocalStorage && window.safeLocalStorage.getItem(saveKey));
        if (rawLocal && rawLocal !== 'null' && rawLocal !== '{}') {
            localSaveData = JSON.parse(rawLocal);
        }
    } catch(e) {}

    const isReady = initFirebaseApp();
    if (!isReady) {
        return localSaveData;
    }

    try {
        let docId = cleanUserId;
        if (window.auth && window.auth.currentUser) {
            docId = window.auth.currentUser.uid;
        }

        const userDocRef = window.db.collection('users').doc(docId);
        const docSnap = await userDocRef.get();

        if (docSnap.exists) {
            const docData = docSnap.data();
            if (docData && docData.gameState) {
                const cloudState = docData.gameState;
                try {
                    if (window.safeLocalStorage) {
                        window.safeLocalStorage.setItem(saveKey, JSON.stringify(cloudState));
                    }
                } catch(e) {}
                console.log("☁️ Firestore 클라우드에서 저장 데이터를 성공적으로 불러왔습니다! (UID: " + docId + ", Lv." + (cloudState.level || 1) + ")");
                return cloudState;
            }
        }

        // Migrate local state to Firestore if doc doesn't exist and local data has genuine progress
        if (localSaveData && (localSaveData.level > 1 || localSaveData.exp > 0 || localSaveData.gold > 0)) {
            console.log("🔄 로컬 저장 데이터를 Firestore 클라우드로 마이그레이션 중...");
            await window.saveGameToCloud(localSaveData, docId);
            return localSaveData;
        }
    } catch (e) {
        console.error("Firebase Cloud Load Error:", e);
        showCloudStatusToast("⚠️ 클라우드 로드 실패 - 로컬 데이터 사용", false);
    }

    return localSaveData;
};

// Automatically listen to Firebase Auth session restoration and sync data
function setupFirebaseAuthListener() {
    if (window.auth && !window._authListenerAttached) {
        window._authListenerAttached = true;
        window.auth.onAuthStateChanged(async (user) => {
            if (user) {
                console.log("☁️ [Auth Listener] Firebase Auth 로그인 상태 확인됨:", user.email, "(UID:", user.uid, ")");
                try {
                    const session = (window.getCurrentUser && window.getCurrentUser()) || {};
                    session.id = user.email;
                    session.uid = user.uid;
                    if (!session.name) session.name = user.email.split('@')[0];
                    if (window.safeLocalStorage) {
                        window.safeLocalStorage.setItem('lvlup_current_user', JSON.stringify(session));
                    }
                } catch(e) {}

                if (typeof window.loadGameFromCloud === 'function') {
                    const cloudData = await window.loadGameFromCloud(user.uid);
                    if (cloudData && typeof window.applyLoadedCloudState === 'function') {
                        window.applyLoadedCloudState(cloudData);
                    }
                }
            }
        });
    }
}
window.setupFirebaseAuthListener = setupFirebaseAuthListener;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initFirebaseApp();
});
