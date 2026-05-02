# 🐲 오늘의 띠별 운세

한국 사용자를 위한 웹 기반 **띠별 일일 운세 서비스**입니다.
생년월일을 입력하거나 12지신을 직접 선택하면, 명리학 상성 엔진이 산출한 오늘의 운세를 확인할 수 있습니다.

🌐 **서비스 URL**: https://tinkhub.github.io/zodiac_signs/

## ✨ 주요 기능

- 🎂 **생년월일 입력** → 띠 자동 계산 → 운세 표시
- 🐭 **12지신 직접 선택** → 즉시 운세 확인
- 📅 **날짜 선택** — 오늘 기준 ±7일(총 15일) 범위에서 날짜 이동
- 📊 **명리학 상성 분석** — 삼합, 육합, 상충, 원진, 형, 파, 비화 등 7가지 역학 관계
- 🎨 **오행 기반 행운 요소** — 색상, 숫자, 방향 자동 산출
- 🤖 **LLM 프롬프트 체이닝** — 규칙 엔진이 결정한 점수/방향을 Claude Haiku가 자연어로 구두화

## 🛠️ 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router, TypeScript, 정적 export) |
| 호스팅 | GitHub Pages (GitHub Actions 자동 배포) |
| ORM / DB | Prisma + SQLite (로컬 생성 캐시용) |
| Styling | Vanilla CSS (Glassmorphism 다크모드) |
| 달력 변환 | korean-lunar-calendar |
| LLM | Anthropic Claude Haiku |

## 🚀 로컬 개발 환경 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env
# .env 파일을 열어 ANTHROPIC_API_KEY를 입력하세요
```

### 3. DB 초기화

```bash
npx prisma db push
npx tsx prisma/seed.ts        # 12지신 마스터 데이터
npm run seed:calendar          # 달력 데이터 (3년치)
```

### 4. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

---

## 📦 운세 데이터 생성 및 배포

운세 텍스트는 로컬에서 생성해 JSON 파일로 저장한 뒤 GitHub에 푸시하면 자동으로 서비스에 반영됩니다.

### 워크플로 개요

```
로컬: npm run generate
  ├─ batch-generate.ts → SQLite에 운세 저장 (API 호출)
  └─ export-json.ts    → public/data/fortunes/*.json 출력

git push → GitHub Actions → npm run build → GitHub Pages 배포
```

### 운세 생성하기 (최초 또는 주기적 갱신)

```bash
# 최초 1회만 — DB가 비어있을 경우
npx tsx prisma/seed.ts
npm run seed:calendar

# 운세 생성 + JSON 파일 출력 (ANTHROPIC_API_KEY 필요)
npm run generate
# 또는 단계별 실행:
# npm run batch          ← SQLite에 저장
# npm run export-json    ← JSON 파일로 내보내기
```

`public/data/fortunes/YYYY-MM-DD.json` (날짜별 12띠 운세) 및  
`public/data/index.json` (이용 가능한 날짜 목록) 이 생성됩니다.

### GitHub에 푸시하여 배포

```bash
git add public/data/
git commit -m "fortune: $(date +%Y-%m-%d) 운세 추가"
git push origin main
```

푸시 후 GitHub Actions가 자동으로 정적 사이트를 빌드해 GitHub Pages에 배포합니다.  
진행 상황은 저장소 **Actions** 탭에서 확인할 수 있습니다.

### GitHub Pages 최초 설정 (저장소 최초 연결 시 1회)

저장소 **Settings → Pages → Source** 를 **"GitHub Actions"** 로 변경해야 합니다.

---

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── globals.css              # 전역 스타일 (다크모드)
│   ├── layout.tsx               # Root Layout
│   └── page.tsx                 # 메인 페이지 (날짜 선택 + 12지신 그리드)
├── lib/
│   ├── generator.ts             # 4단계 콘텐츠 생성 파이프라인
│   ├── lunar-calendar.ts        # 양력↔음력/간지 변환
│   ├── zodiac-relations.ts      # 12지신 상성 엔진
│   ├── lucky-elements.ts        # 오행 행운 요소 산출
│   ├── prompts.ts               # LLM 프롬프트 정의
│   └── zodiac.ts                # 생년월일 → 띠 변환
prisma/
├── schema.prisma                # DB 스키마
└── seed.ts                      # 초기 데이터
scripts/
├── batch-generate.ts            # 운세 생성 배치 스크립트
├── export-json.ts               # DB → JSON 파일 내보내기
└── seed-calendar.ts             # 달력 데이터 적재
public/
└── data/
    ├── index.json               # 이용 가능한 날짜 목록
    └── fortunes/
        └── YYYY-MM-DD.json      # 날짜별 12띠 운세 (커밋 대상)
.github/workflows/
└── deploy.yml                   # GitHub Actions 자동 배포
자료/                              # 사전 조사 문서 및 가이드라인
```

## 📜 면책 조항

본 운세 정보는 전통 명리학에 기반한 통계적 해석일 뿐이며, 법적, 의학적, 재정적 결정의 근거로 사용될 수 없는 **엔터테인먼트 목적의 콘텐츠**입니다.
