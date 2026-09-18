/**
 * Level Up Life - Firebase Authentication & Firestore Cloud Sync Module
 * 
 * Instructions:
 * 1. Create a free Firebase project at https://console.firebase.google.com/
 * 2. Enable Firebase Authentication -> Email/Password provider.
 * 3. Create a Cloud Firestore Database in Production Mode with strict Auth rules.
 * 4. Copy your Web App configuration into the `firebaseConfig` object below (lines 13-20).
 */

// 1. User Editable Firebase Configuration (Required for Real Cloud Sync)
window.firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Global Firebase handles
window.firebaseApp = null;
window.auth = null;
window.db = null;
window.isFirebaseReady = false;

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
 * Gets active UID (Firebase Auth UID or local session user ID)
 */
function getActiveUserId() {
    if (window.auth && window.auth.currentUser) {
        return window.auth.currentUser.uid;
    }
    try {
        const sessionStr = localStorage.getItem('lvlup_current_user') || sessionStorage.getItem('lvlup_current_user');
        if (sessionStr) {
            const u = JSON.parse(sessionStr);
            if (u.uid) return u.uid;
            if (u.id) return u.id;
        }
    } catch(e) {}
    return null;
}
window.getActiveUserId = getActiveUserId;

/**
 * Saves current game state to Firebase Firestore: users/{userId}
 * Uses Firebase Auth UID when signed in.
 */
window.saveGameToCloud = async function(state, forcedUserId = null) {
    let userId = forcedUserId || getActiveUserId();
    if (!userId) return false;

    const cleanUserId = userId.trim();
    const saveKey = 'game_save_state_' + cleanUserId.replace(/[^a-zA-Z0-9_-]/g, '_');

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
                showCloudStatusToast("⚠️ 로컬 저장 완료 (Firebase API 키 설정 필요)", false);
                resolve(false);
                return;
            }

            try {
                const userDocRef = window.db.collection('users').doc(cleanUserId);
                const payload = {
                    gameState: state,
                    userUid: (window.auth && window.auth.currentUser) ? window.auth.currentUser.uid : cleanUserId,
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
    let targetUserId = userId || getActiveUserId();
    if (!targetUserId) return null;

    const cleanUserId = targetUserId.trim();
    const saveKey = 'game_save_state_' + cleanUserId.replace(/[^a-zA-Z0-9_-]/g, '_');

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
        const userDocRef = window.db.collection('users').doc(cleanUserId);
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
                console.log("☁️ Firestore에서 성공적으로 저장 데이터를 불러왔습니다.");
                return cloudState;
            }
        }

        // Migrate local state to Firestore if Firestore document is missing
        if (localSaveData) {
            console.log("🔄 로컬 저장 데이터를 Firestore 클라우드로 마이그레이션 중...");
            await window.saveGameToCloud(localSaveData, cleanUserId);
            return localSaveData;
        }
    } catch (e) {
        console.error("Firebase Cloud Load Error:", e);
        showCloudStatusToast("⚠️ 클라우드 로드 실패 - 로컬 데이터 사용", false);
    }

    return localSaveData;
};

// Attempt initializing Firebase on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initFirebaseApp();
});
