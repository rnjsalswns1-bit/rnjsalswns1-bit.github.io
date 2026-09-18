# Level Up Life - Firebase Authentication & Firestore 멀티 디바이스 연동 및 가이드 문서

이 프로젝트는 **GitHub Pages** 환경에서 실행되는 웹 애플리케이션으로, **Firebase Authentication 및 Cloud Firestore**를 백엔드로 사용하여 **어떤 PC/모바일에서 접속하더라도 로그인한 계정의 최신 게임 데이터(레벨, EXP, 골드, 스탯, 프로필, 퀘스트, 인벤토리 등)가 보안 규칙하에 안전하게 연동**되도록 구조화되어 있습니다.

---

## 📍 1. Firebase 설정값 입력 위치 (필수 설정 항목)

본인의 Firebase 프로젝트 설정값을 입력하는 정확한 파일과 코드 위치는 다음과 같습니다:

* **파일 경로**: [`firebase_config.js`](file:///c:/Users/user/OneDrive/Desktop/Level%20up/firebase_config.js)
* **수정 위치**: 13번째 ~ 20번째 줄 `window.firebaseConfig` 객체

```javascript
// firebase_config.js (줄 13-20)
window.firebaseConfig = {
    apiKey: "여기에_본인의_API_KEY_입력",
    authDomain: "본인프로젝트.firebaseapp.com",
    projectId: "본인프로젝트_ID",
    storageBucket: "본인프로젝트.appspot.com",
    messagingSenderId: "발급받은_SENDER_ID",
    appId: "발급받은_APP_ID"
};
```

> 💡 **안내**: `firebase_config.js`에 실제 설정값이 입력되지 않은 초기 상태(`YOUR_FIREBASE_API_KEY` 등)에서는 안전하게 **로컬 모드(safeLocalStorage)**로 작동하며, 화면에 설정 요구 알림이 표시됩니다.

---

## 🛠️ 2. Firebase 콘솔 설정 순서 (Firebase Console Step-by-Step)

### Step 1: [Firebase 콘솔](https://console.firebase.google.com/) 접속 및 프로젝트 생성
1. Google 계정으로 로그인 후 **[프로젝트 추가]** 클릭
2. 프로젝트 이름 입력 (예: `levelup-life`) 후 생성 완료

### Step 2: 웹 앱(Web App) 등록 및 Config 복사
1. 프로젝트 개요 화면 중앙의 **웹 아이콘(`</>`)** 클릭
2. 앱 닉네임 입력 후 **[앱 등록]** 클릭
3. 생성된 `firebaseConfig` 6개 항목을 [`firebase_config.js`](file:///c:/Users/user/OneDrive/Desktop/Level%20up/firebase_config.js) 파일의 13~20번째 줄에 복사/붙여넣기

### Step 3: Firebase Authentication (이메일/비밀번호) 활성화
1. 좌측 메뉴 **[빌드] → [Authentication]** 선택
2. **[시작하기]** 클릭 후 **[이메일/비밀번호]** 공급업체 선택
3. **[사용 설정]** 토글을 키고 **[저장]** 클릭

### Step 4: Cloud Firestore 데이터베이스 생성 및 엄격한 보안 규칙 설정
1. 좌측 메뉴 **[빌드] → [Firestore Database]** 선택
2. **[데이터베이스 만들기]** 클릭 (위치: `asia-northeast3 (서울)` 추천)
3. 데이터베이스 생성 완료 후 상단 **[규칙 (Rules)]** 탭으로 이동
4. 기존 규칙을 삭제하고 **아래 보안 규칙**을 복사하여 붙여넣은 뒤 **[게시 (Publish)]** 클릭:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Firebase Auth UID 기반 사용자 본인 전용 데이터 접근 보안 규칙
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🔒 3. 보안 인증 및 저장 구조 설계

1. **Firebase Authentication 연동**:
   - `firebase.auth().createUserWithEmailAndPassword(email, password)` (신규 가입)
   - `firebase.auth().signInWithEmailAndPassword(email, password)` (로그인)
   - 로그인 성공 시 표준 **Firebase Auth UID** (`request.auth.uid`)가 생성됩니다.

2. **Firestore 데이터 저장 경로**:
   - 문서 경로: `users/{auth.currentUser.uid}`
   - 저장 payload: `gameState` (전체 게임 상태), `userUid`, `updatedAt`, `lastSavedAtStr`
   - 타 사용자는 본인의 Auth UID 문서에 접근 및 변경이 불가능합니다.

---

## 🔄 4. 데이터 로드 및 마이그레이션 정책

1. **Cloud Sync**: Firebase Auth 로그인 완료 시 Firestore `users/{auth.currentUser.uid}` 문서를 자동으로 읽어와 최신 데이터를 복원합니다.
2. **First-Time Migration**: 신규 디바이스나 클라우드 데이터가 없는 계정의 경우 local save state를 Firestore에 자동 전송하여 데이터 손실을 방지합니다.
3. **Offline Fallback**: 네트워크 장애 시 로컬 임시 저장(`safeLocalStorage`) 후 화면 toast 알림을 표시합니다.

---

## 🧪 5. PC A → PC B 멀티 디바이스 연동 검증 방법

1. [`firebase_config.js`](file:///c:/Users/user/OneDrive/Desktop/Level%20up/firebase_config.js)에 본인의 실제 Firebase API 설정값을 입력합니다.
2. PC A에서 [login.html](file:///c:/Users/user/OneDrive/Desktop/Level%20up/login.html) 접속 후 신규 계정 생성 및 게임 진행
3. Firestore Console에서 `users/{Firebase Auth UID}` 문서가 실제로 생성되었는지 확인
4. PC B에서 동일한 이메일/비밀번호로 로그인 시 PC A의 게임 데이터가 100% 동일하게 로드됨을 확인
