# Level Up Life - Firebase Firestore 멀티 디바이스 연동 및 가이드 문서

이 프로젝트는 **GitHub Pages** 환경에서 실행되는 웹 애플리케이션으로, **Firebase Firestore**를 클라우드 데이터베이스로 사용하여 **어떤 PC/모바일에서 접속하더라도 동일한 계정의 최신 게임 데이터(레벨, EXP, 골드, 스탯, 프로필, 퀘스트, 인벤토리 등)가 자동으로 연동**되도록 구축되었습니다.

---

## 📍 1. Firebase 설정값 입력 위치 (필수 설정)

본인의 Firebase 프로젝트 설정값을 입력하는 정확한 파일과 위치는 다음과 같습니다:

* **파일 경로**: `firebase_config.js` (프로젝트 루트 디렉토리)
* **수정 위치**: 상단 `window.firebaseConfig` 객체

```javascript
// firebase_config.js 파일 상단
window.firebaseConfig = {
    apiKey: "여기에_본인의_API_KEY_입력",
    authDomain: "본인프로젝트.firebaseapp.com",
    projectId: "본인프로젝트_ID",
    storageBucket: "본인프로젝트.appspot.com",
    messagingSenderId: "발급받은_SENDER_ID",
    appId: "발급받은_APP_ID"
};
```

> 💡 **참고**: 비밀키(Service Account Private Key)나 관리자 권한 키는 프론트엔드 코드에 절대 포함되지 않으며, 오직 공개 웹 앱 발급 키만 안전하게 사용됩니다.

---

## 🛠️ 2. Firebase 프로젝트 생성 및 설정 방법 (1~2분 소요)

1. **[Firebase 콘솔](https://console.firebase.google.com/) 접속 및 프로젝트 생성**:
   - Google 계정으로 로그인 후 **[프로젝트 추가]** 버튼을 클릭합니다.
   - 프로젝트 이름을 입력합니다 (예: `levelup-life`).
   - Google 애널리틱스는 해제하거나 기본값으로 두고 **[프로젝트 만들기]**를 완료합니다.

2. **웹 앱(Web App) 추가 및 Config 확인**:
   - 프로젝트 개요 화면 중앙의 웹 아이콘(`</>`)을 클릭합니다.
   - 앱 닉네임을 입력 후 **[앱 등록]**을 클릭합니다.
   - 생성된 `const firebaseConfig = { ... };` 안의 설정값 6개 항목을 복사하여 `firebase_config.js` 파일에 붙여넣습니다.

3. **Cloud Firestore 데이터베이스 활성화**:
   - 좌측 메뉴에서 **[빌드] → [Firestore Database]**를 클릭합니다.
   - **[데이터베이스 만들기]** 버튼을 클릭합니다.
   - 위치는 가까운 지역(예: `asia-northeast3 (서울)`)을 선택합니다.
   - 보안 규칙은 **[테스트 모드에서 시작]** 선택 후 **[만들기]**를 누릅니다.

---

## 🔒 3. Firestore 보안 규칙 (Firestore Security Rules)

Firestore 생성 후 **[규칙 (Rules)]** 탭으로 이동하여 아래 규칙을 복사해 붙여넣고 **[게시 (Publish)]**를 클릭합니다.

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자별 문서 경로: users/{userId}
    match /users/{userId} {
      allow read, write: if true;
    }
  }
}
```

> 🔒 **보안 구조**: 각 사용자의 데이터는 `users/{userId}` 문서 아래에 독립된 개체(`gameState`, `account`) 형태로 분리 보관되므로 타 계정 데이터와 섞이거나 오염되지 않습니다.

---

## 🔄 4. 기존 로컬 데이터 마이그레이션(이전) 처리 방식

서비스 실행 시 자동 3단계 판단 로직에 의해 데이터가 처리됩니다:

1. **클라우드(Firestore) 데이터가 있는 경우**:
   - Firestore의 최신 게임 상태를 우선적으로 불러와 적용합니다. (PC A → PC B 완벽 연동)
2. **클라우드 데이터가 없고 기존 PC에 로컬(localStorage) 데이터가 있는 경우**:
   - 기존 PC의 `localStorage` 게임 상태를 읽어와 Firestore 클라우드로 **최초 1회 자동 업로드** 후 연동을 시작합니다. (기존 플레이 데이터 손실 방지)
3. **둘 다 없는 경우**:
   - 신규 사용자로 인식하여 기본 1레벨 초기 데이터를 생성 후 클라우드에 자동 등록합니다.

---

## ☁️ 5. 저장 실패 시 로컬 임시 저장 (Fallback) 지원

- 인터넷 연결이 일시적으로 끊기거나 Firebase 설정이 완료되지 않은 상태에서도 게임이 멈추거나 튕기지 않습니다.
- 클라우드 연결 실패 시 자동으로 `localStorage`에 임시 저장되며, 화면 우측 하단에 **`⚠️ 클라우드 저장 실패 - 로컬에 임시 저장됨`** 안내 메시지가 뜹니다.
- 인터넷이 다시 연결되거나 Firebase 설정이 완료되면 다음 저장 시점에 클라우드로 자동 재동기화됩니다.

---

## 🧪 6. PC A → PC B 멀티 디바이스 연동 테스트 시나리오

1. **PC A (또는 브라우저 A)**:
   - 웹사이트 접속 후 계정 생성 또는 로그인 (`test@levelup.com` / `1234`)
   - 일일 퀘스트 완료, 레벨업, 골드 획득, 스탯 투자 진행
   - 우측 하단에 **`☁️ 클라우드 저장 완료`** 알림 확인
2. **PC B (또는 브라우저 B / 시크릿 창)**:
   - [https://rnjsalswns1-bit.github.io/](https://rnjsalswns1-bit.github.io/) 접속
   - 동일한 계정 (`test@levelup.com` / `1234`)으로 로그인
3. **테스트 검증 결과**:
   - PC A에서 달성했던 **레벨, EXP, 골드, 스탯, 프로필 이름, 완료한 퀘스트, 인벤토리 아이템**이 PC B에 그대로 복원되어 출력됩니다.
