# 이호민 ♥ 김은정 모바일 청첩장

> **2027년 3월 28일 일요일 오후 1시 10분**  
> **규수당 문래점 (SK리더스뷰 2층) 카이타스홀**

PC · 태블릿 · 갤럭시 폴드(접힘/펼침) · 모바일을 모두 지원하는 에디토리얼 2단 스플릿 반응형 모바일 청첩장입니다.  
**Next.js (App Router) + Tailwind CSS + Framer Motion + Firebase (Firestore & Storage) + Vercel** 기반으로 24시간 안정적으로 운영할 수 있도록 구성되어 있습니다.

---

## 1. 계좌번호 · 연락처 · 문구 수정하기

- **6인 계좌번호 & 6인 연락처**: 코드를 수정하실 필요 없이 **`/deleteenterad` 관리자 페이지 → `계좌 · 연락처 설정` 탭**에서 직접 입력·저장하시면 청첩장 화면에 실시간으로 반영됩니다.
  - 계좌번호에 하이픈(`-`)을 포함해 입력하셔도 **복사 버튼 클릭 시 숫자만 자동으로 클립보드에 복사**됩니다.
  - 카카오페이 송금 링크를 입력하면 카카오페이 버튼이 자동으로 표시됩니다.
- **모시는 글·예식 정보·사진 순서**: **`src/config/wedding.ts`** 파일에서 언제든 수정하실 수 있습니다.

---

## 2. 배경음악 (YouTube BGM) 설정

- 청첩장 BGM은 공식 **YouTube IFrame Player API**를 통해 지정된 유튜브 영상(`https://www.youtube.com/watch?v=IpcqMYxQXZY`)을 인라인 반복 재생합니다.
- 다른 유튜브 영상으로 교체하시려면 `src/config/wedding.ts`의 `bgm.youtubeVideoId` 값만 변경하시면 됩니다.
- 네트워크 오프라인 환경이나 영상 임베드 제한 발생 시에도 버튼이 멈추지 않도록 자체 왈츠 신시사이저가 자동 폴백됩니다.

---

## 3. Windows 로컬 개발환경 설치 (처음 설치 시)

현재 PC에 `Node.js`와 `Git`이 없다면 PowerShell에서 아래 두 줄만 실행하면 한 번에 설치됩니다.

```powershell
winget install OpenJS.NodeJS.LTS
winget install Git.Git
```

설치 후 **터미널(또는 VS Code / Antigravity)을 한 번 재시작**한 뒤 프로젝트 폴더(`G:\invitation FD`)에서 실행하세요:

```powershell
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` (청첩장), `http://localhost:3000/deleteenterad` (관리자 페이지, 기본 비밀번호 `0328`)를 확인할 수 있습니다.

---

## 4. Google Firebase (무료 Spark) + Vercel Blob (무료 · 카드 불필요) 연동

카드 등록 없이 100% 무료로 모든 기능(방명록 · RSVP · 계좌/연락처 · 하객 스냅 사진 업로드)을 운영할 수 있습니다.

### A. Firebase Firestore 설정 (방명록 · RSVP · 계좌/연락처 · 스냅 목록)
1. [Firebase 콘솔](https://console.firebase.google.com/)에서 새 프로젝트를 생성합니다 (무료 **Spark 요금제** 그대로 사용).
2. 좌측 메뉴 **`빌드 > Firestore Database`** → **`데이터베이스 만들기`** → **`Standard 에디션`** → 위치 **`asia-northeast3 (서울)`** → 프로덕션 모드로 생성.
3. 프로젝트 설정 > **내 앱 > 웹(`</>`) 앱 추가** 후 표시되는 `firebaseConfig` 6개 값을 `.env.local`(및 Vercel 환경 변수)에 입력합니다.
4. Firestore `규칙` 탭에 `firestore.rules`를 붙여넣고 `게시`합니다.
5. **관리자 서버 키 발급 (비밀번호만으로 `/deleteenterad` 운영용)**:
   - Firebase 콘솔 **`프로젝트 설정 > 서비스 계정`** 탭 → **`새 비공개 키 생성`** 클릭 (JSON 파일 다운로드).
   - 다운로드한 JSON 파일 내용을 그대로 복사해 Vercel **`Settings > Environment Variables`** 에 **`FIREBASE_SERVICE_ACCOUNT_KEY`** 이름으로 추가 후 `Redeploy`하세요.

### B. Vercel Blob 설정 (하객 스냅 사진 저장소 — 카드 불필요)
1. [Vercel 대시보드](https://vercel.com/)에서 배포된 프로젝트 선택 → 상단 **`Storage`** 탭 클릭.
2. **`Create Database` → `Blob`** 선택 → **Public** 접근 모드로 스토어 생성 후 프로젝트에 연결.
3. 연결 즉시 **`BLOB_READ_WRITE_TOKEN`** 환경 변수가 Vercel 프로젝트에 자동 등록되어, 재배포 후 바로 하객 스냅 사진 업로드가 작동합니다!

---

## 5. GitHub 연동 → Vercel 24시간 실시간 자동 배포

원본 고화질 사진 폴더(`resources/`, 약 230MB)는 `.gitignore`에 제외되어 있으며, 웹 최적화된 `public/images/wedding/` (총 약 8MB)만 배포되므로 빠르고 가볍게 업로드됩니다.

```powershell
git init
git add .
git commit -m "feat: 이호민 김은정 모바일 청첩장 제작"
git branch -M main
git remote add origin https://github.com/<내아이디>/<레포이름>.git
git push -u origin main
```

1. [Vercel](https://vercel.com/)에 GitHub 계정으로 로그인 → **Add New Project** → 방금 푸시한 GitHub 저장소 선택.
2. **Environment Variables**에 `.env.local`의 환경 변수(`NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL`)를 그대로 입력.
3. **Deploy** 클릭!
4. 이후 `src/config/wedding.ts`를 수정하고 `git push`만 하면 **Vercel이 자동으로 실시간 재배포**하며, 24시간 무중단으로 운영됩니다.
