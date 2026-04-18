# 🐲 오늘의 띠별 운세

한국 사용자를 위한 웹 기반 **띠별 일일 운세 서비스**입니다.
생년월일을 입력하거나 12지신을 직접 선택하면, 명리학 상성 엔진이 산출한 오늘의 운세를 확인할 수 있습니다.

## ✨ 주요 기능

- 🎂 **생년월일 입력** → 띠 자동 계산 → 오늘 운세 표시
- 🐭 **12지신 직접 선택** → 즉시 운세 확인
- 📊 **명리학 상성 분석** — 삼합, 육합, 상충, 원진, 형, 파, 비화 등 7가지 역학 관계
- 🎨 **오행 기반 행운 요소** — 색상, 숫자, 방향 자동 산출
- 🤖 **LLM 프롬프트 체이닝** — 규칙 엔진이 결정한 점수/방향을 AI가 자연어로 구두화
- ⚡ **인메모리 캐싱** — 동일 날짜 반복 조회 시 즉시 응답

## 🛠️ 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router, TypeScript) |
| ORM / DB | Prisma + SQLite |
| Styling | Vanilla CSS (Glassmorphism 다크모드) |
| 달력 변환 | korean-lunar-calendar |
| LLM | OpenAI / Gemini API (현재 Mock) |

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env
# .env 파일을 열어 필요한 API Key를 입력하세요
```

### 3. DB 초기화 및 시드 데이터 적재

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 4. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

### 5. (선택) 30일치 운세 사전 생성

```bash
npx tsx scripts/batch-generate.ts
```

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── api/fortunes/route.ts   # 운세 조회 API
│   ├── globals.css              # 전역 스타일 (다크모드)
│   ├── layout.tsx               # Root Layout
│   └── page.tsx                 # 메인 페이지
├── lib/
│   ├── generator.ts             # 4단계 콘텐츠 생성 파이프라인
│   ├── lunar-calendar.ts        # 양력↔음력/간지 변환
│   ├── zodiac-relations.ts      # 12지신 상성 엔진
│   ├── lucky-elements.ts        # 오행 행운 요소 산출
│   ├── prompts.ts               # LLM 프롬프트 정의
│   └── zodiac.ts                # 생년월일 → 띠 변환
prisma/
│   ├── schema.prisma            # DB 스키마
│   └── seed.ts                  # 초기 데이터
scripts/
│   └── batch-generate.ts        # 배치 생성 스크립트
자료/                              # 사전 조사 문서 및 가이드라인
```

## 📜 면책 조항

본 운세 정보는 전통 명리학에 기반한 통계적 해석일 뿐이며, 법적, 의학적, 재정적 결정의 근거로 사용될 수 없는 **엔터테인먼트 목적의 콘텐츠**입니다.
