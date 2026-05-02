# 프로젝트 컨텍스트 — 띠별 일일 운세 서비스

## 프로젝트 개요
한국 사용자를 대상으로 한 웹 기반 띠별 일일 운세 서비스입니다.
사용자가 생년월일을 입력하거나 12지신 중 하나를 직접 선택하면,
오늘의 운세(총평·재물운·애정운·건강운)를 화면에 보여줍니다.
날짜 선택 범위는 오늘 기준 ±7일(총 15일)이며, **GitHub Pages**에서 정적으로 서비스됩니다.

## 기술 스택
- **Framework**: Next.js 16 (App Router, TypeScript, `output: 'export'` 정적 빌드)
- **호스팅**: GitHub Pages (GitHub Actions 자동 배포, `basePath: '/zodiac_signs'`)
- **ORM / DB**: Prisma + SQLite (로컬 운세 생성 캐시 전용 — 서비스에 배포되지 않음)
- **Styling**: Vanilla CSS (Glassmorphism 다크모드 테마)
- **달력 변환**: `korean-lunar-calendar` (양력↔음력/간지 오프라인 변환)
- **LLM**: Anthropic Claude Haiku (`claude-haiku-4-5-20251001`)

## 핵심 디렉토리 구조
```
src/
├── app/
│   ├── globals.css              # 전역 스타일
│   ├── layout.tsx               # Root Layout
│   └── page.tsx                 # 메인 UI (날짜 선택 + 12지신 그리드 + 결과 카드)
├── lib/
│   ├── generator.ts             # 4단계 콘텐츠 생성 파이프라인 (핵심 엔진)
│   ├── lunar-calendar.ts        # 양력→음력/간지/절기 변환 유틸리티
│   ├── zodiac-relations.ts      # 12지신 × 일진 상성 엔진 (삼합/육합/상충/원진/형/파)
│   ├── lucky-elements.ts        # 오행 기반 행운 요소 산출 (색상/숫자/방향)
│   ├── prompts.ts               # LLM 시스템/사용자 프롬프트 정의
│   └── zodiac.ts                # 생년월일 → 띠 변환 유틸리티
prisma/
├── schema.prisma                # DB 스키마 (ZodiacSign, CalendarDate, DailyFortune)
├── seed.ts                      # 12지신 초기 데이터 적재
scripts/
├── batch-generate.ts            # 운세 생성 배치 스크립트 (SQLite 저장)
├── export-json.ts               # SQLite → public/data/ JSON 내보내기
└── seed-calendar.ts             # 달력 데이터 적재
public/
└── data/
    ├── index.json               # 이용 가능한 날짜 목록 (git 커밋 대상)
    └── fortunes/YYYY-MM-DD.json # 날짜별 12띠 운세 (git 커밋 대상)
.github/workflows/
└── deploy.yml                   # main 브랜치 푸시 → GitHub Pages 자동 배포
자료/                              # 사전 조사 문서 및 PDF 가이드라인
```

## 운세 생성 파이프라인 (generator.ts)
운세 텍스트는 아래 4단계로 생성됩니다:
1. **달력 컨텍스트 추출**: `lunar-calendar.ts`로 음력/간지/절기 정보 획득
2. **상성 점수 산출**: `zodiac-relations.ts`로 띠 × 일진 관계 분석 → 점수 보정
3. **프롬프트 조립**: `prompts.ts`의 시스템/사용자 프롬프트에 동적 변수 주입
4. **LLM 호출 → 후처리**: 금지어 필터링, 글자 수 검증 후 SQLite 저장

결과는 `scripts/export-json.ts`가 `public/data/fortunes/` JSON 파일로 내보냅니다.

## 코딩 컨벤션 및 주의사항
- **언어**: 한국어 UI, 코드 주석은 한국어 가능, 변수명은 영문
- **스타일**: Tailwind 미사용. Vanilla CSS만 사용 (`globals.css` 내 CSS 변수 체계)
- **DB 변경**: `prisma/schema.prisma` 수정 후 반드시 `npx prisma db push` 실행
- **운세 콘텐츠 안전**: 극단적 흉운·질병·파산 등 공포 조장 표현 절대 금지 (법적 면책 정책)
- **띠 계산 정책**: MVP에서는 양력 연도 기준. 입춘/음력 기준은 향후 고도화 예정
- **정적 사이트 제약**: API Route 추가 금지. `page.tsx`에서 Node.js 모듈 import 금지
- **fetch 경로**: `process.env.NEXT_PUBLIC_BASE_PATH` prefix 필수 (`/zodiac_signs` in prod)

## 자주 사용하는 명령어
```bash
npm run dev              # 개발 서버 실행
npm run build            # 정적 사이트 빌드 (out/ 생성)
npx prisma db push       # 스키마 변경 적용
npx tsx prisma/seed.ts   # 12지신 초기 데이터 적재
npm run seed:calendar    # 달력 데이터 적재
npm run batch            # 운세 생성 (SQLite 저장)
npm run export-json      # SQLite → public/data/ JSON 출력
npm run generate         # batch + export-json 한 번에 실행
```

@AGENTS.md
