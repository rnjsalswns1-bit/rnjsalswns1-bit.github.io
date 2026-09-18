/**
 * Level Up Life - Firebase Firestore Multi-Device Cloud Sync Module
 * 
 * Instructions:
 * 1. Create a free Firebase project at https://console.firebase.google.com/
 * 2. Create a Cloud Firestore Database in Test Mode or Production Mode.
 * 3. Copy your Web App configuration into the `firebaseConfig` object below.
 */

// 1. User Editable Firebase Configuration
window.firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Global Firebase state & UI Notification helper
window.firebaseApp = null;
window.db = null;
window.isFirebaseReady = false;

// Simple SHA-256 Hash helper to avoid storing plain-text passwords in Firestore
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
    }, 3000);
}
window.showCloudStatusToast = showCloudStatusToast;

// Initialize Firebase SDK dynamically if CDN scripts are present or loaded
function initFirebaseApp() {
    if (window.firebaseApp && window.db) {
        window.isFirebaseReady = true;
        return true;
    }
    try {
        if (typeof firebase !== 'undefined' && window.firebaseConfig && window.firebaseConfig.projectId && !window.firebaseConfig.projectId.includes('YOUR_PROJECT')) {
            if (!firebase.apps.length) {
                window.firebaseApp = firebase.initializeApp(window.firebaseConfig);
            } else {
                window.firebaseApp = firebase.app();
            }
            window.db = firebase.firestore();
            window.isFirebaseReady = true;
            console.log("☁️ Firebase Firestore connected successfully.");
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
 * Saves current game state to Firebase Firestore: users/{userId}
 */
window.saveGameToCloud = async function(state, forcedUserId = null) {
    const sessionStr = localStorage.getItem('lvlup_current_user') || sessionStorage.getItem('lvlup_current_user');
    let userId = forcedUserId;
    if (!userId && sessionStr) {
        try {
            const u = JSON.parse(sessionStr);
            userId = u.id;
        } catch(e) {}
    }
    
    if (!userId) return false;
    const cleanUserId = userId.toLowerCase().trim();
    const saveKey = 'game_save_state_' + cleanUserId.replace(/[^a-z0-9]/g, '_');

    // Always ensure local backup in safeLocalStorage first
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
                showCloudStatusToast("⚠️ 로컬 임시 저장 완료 (Firebase 설정 필요)", false);
                resolve(false);
                return;
            }

            try {
                const userDocRef = window.db.collection('users').doc(cleanUserId);
                const payload = {
                    gameState: state,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastSavedAtStr: new Date().toISOString()
                };

                await userDocRef.set(payload, { merge: true });
                showCloudStatusToast("☁️ 클라우드 저장 완료", true);
                resolve(true);
            } catch (e) {
                console.error("Firebase Cloud Save Error:", e);
                showCloudStatusToast("⚠️ 클라우드 저장 실패 - 로컬에 임시 저장됨", false);
                resolve(false);
            }
        }, 300);
    });
};

/**
 * Loads game state from Firebase Firestore: users/{userId}
 * Strategy:
 * 1. Cloud data exists -> Use Cloud data
 * 2. Cloud data missing + LocalStorage exists -> Upload LocalStorage to Cloud -> Use Cloud
 * 3. Neither exists -> Return null (will fall back to default)
 */
window.loadGameFromCloud = async function(userId) {
    if (!userId) return null;
    const cleanUserId = userId.toLowerCase().trim();
    const saveKey = 'game_save_state_' + cleanUserId.replace(/[^a-z0-9]/g, '_');

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
                // Save retrieved cloud state into local storage for offline resiliency
                try {
                    if (window.safeLocalStorage) {
                        window.safeLocalStorage.setItem(saveKey, JSON.stringify(cloudState));
                    }
                } catch(e) {}
                console.log("☁️ Successfully loaded save data from Cloud Firestore.");
                return cloudState;
            }
        }

        // If Cloud has no save state, but LocalStorage has data -> Migrate Local data to Cloud
        if (localSaveData) {
            console.log("🔄 Migrating local save data to Cloud Firestore for new device setup...");
            await window.saveGameToCloud(localSaveData, cleanUserId);
            return localSaveData;
        }
    } catch (e) {
        console.error("Firebase Cloud Load Error:", e);
        showCloudStatusToast("⚠️ 클라우드 로드 실패 - 로컬 데이터 사용", false);
    }

    return localSaveData;
};

// Attempt initializing Firebase on script load
document.addEventListener('DOMContentLoaded', () => {
    initFirebaseApp();
});
