# Checkyeerang

창원과학고등학교 도서부 출석 관리 웹 앱입니다. 도서관 Windows PC 한 대에서 사용하도록 설계하고 있습니다.

> 개발 중입니다. 현재 버전에는 관리자 인증이 구현되어 있지 않습니다. 실제 학생 정보로 운영하기 전에 권한 분리와 백업을 검증해야 합니다.

## Requirements

- Node.js (Next.js 16 지원 버전)
- PostgreSQL
- npm

## Development

1. PostgreSQL에 별도 개발용 데이터베이스를 준비합니다.
2. `.env`에 개발 DB의 `DATABASE_URL`을 설정합니다. 실제 비밀번호는 Git에 올리지 않습니다.
3. 의존성을 설치하고 개발 DB 마이그레이션을 실행합니다.

```powershell
npm ci
npx prisma generate
npx prisma migrate dev
npm run dev
```

브라우저에서 http://localhost:3000 을 엽니다. **운영 DB를 개발 환경에 연결하지 마세요.**

## Local Windows Deployment

도서관 PC에서만 사용할 때는 Next.js 서버를 루프백 주소로 제한합니다.

```powershell
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
npm run start
```

`npm run start`는 `127.0.0.1:3000`에서 실행됩니다. PostgreSQL도 외부 네트워크에 공개하지 마세요.

**운영 주의사항**

- Windows 학생용 계정에 DB 관리자 권한·서버 파일 수정 권한을 주지 않습니다.
- 관리자 인증이 완성되기 전까지 학생이 사용할 수 있는 운영 환경에 배포하지 않습니다.
- DB 마이그레이션 전에는 백업하고, 별도 DB에서 복구를 시험합니다.
- 재부팅 후 서버 자동 시작, 절전 모드, 장애 복구 절차는 배포 전에 확인해야 합니다.
- Prisma 마이그레이션은 개발 DB에서 검증한 뒤 운영 DB에 `migrate deploy`로 적용합니다.

## Git Workflow

- 개발 저장소: https://github.com/WhoSia/checkyeerang (`main`)
- 원본 저장소: https://github.com/pugmy/checkyeerang (`main`)
- 개발은 개인 저장소의 `main`에서 진행합니다.
- 동작을 확인한 변경만 원본 저장소에 전달합니다.
- 커밋명은 `Fix Attendance`, `Restrict Admin Access`처럼 간결한 Title Case를 사용합니다.
- GitHub Actions나 자동 배포는 사용하지 않습니다.

## Admin Login

관리자 기능은 기본적으로 차단됩니다. 최초 실행 전에 운영 PC에서 다음을 설정하세요.

```powershell
node scripts/create-admin-password.mjs
```

출력된 `ADMIN_PASSWORD_HASH`와 `ADMIN_SESSION_SECRET`을 운영 PC의 `.env.local`에 저장합니다. 비밀번호 원문과 환경변수는 Git에 올리지 마세요. 관리자 페이지(`/admin`)에 접근하면 로그인 화면으로 이동하며, 로그인 세션은 최대 8시간 유지됩니다.

관리자 비밀번호는 도서부장에게만 전달하고, 인계 시 새 비밀번호와 세션 서명 키를 발급하세요. 현 버전은 단일 관리자만 지원하며 로그인 시도 제한, 로그인 감사 로그, Windows 계정 분리와 데이터 복구는 운영 투입 전 추가 검증이 필요합니다.

## Operations To Finish

- 관리자 인증 및 서버 측 접근 통제
- 보충 승인과 미출석 연결
- 시험 기간·휴일 등 일정 예외 처리
- PostgreSQL 정기 백업 및 실제 복구 검증
- 도서부장 인수인계 절차
