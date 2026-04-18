# 프로젝트 컨텍스트 — 띠별 일일 운세 서비스

## 프로젝트 개요
한국 사용자를 대상으로 한 웹 기반 띠별 일일 운세 서비스입니다.
사용자가 생년월일을 입력하거나 12지신 중 하나를 직접 선택하면,
오늘의 운세(총평·재물운·애정운·건강운)를 화면에 보여줍니다.

## 기술 스택
- **Framework**: Next.js 16 (App Router, TypeScript)
- **ORM / DB**: Prisma + SQLite (프로덕션 전환 시 PostgreSQL)
- **Styling**: Vanilla CSS (Glassmorphism 다크모드 테마)
- **달력 변환**: `korean-lunar-calendar` (양력↔음력/간지 오프라인 변환)
- **LLM**: 현재 Mock — 프로덕션에서는 OpenAI 또는 Gemini API 연동 예정

## 핵심 디렉토리 구조
```
src/
├── app/
│   ├── api/fortunes/route.ts   # 운세 조회 API (인메모리 캐싱 포함)
│   ├── globals.css              # 전역 스타일
│   ├── layout.tsx               # Root Layout
│   └── page.tsx                 # 메인 UI (생년월일 입력 + 12지신 그리드 + 결과 카드)
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
├── batch-generate.ts            # 30일치 운세 사전 생성 배치 스크립트
자료/                              # 사전 조사 문서 및 PDF 가이드라인
```

## 운세 생성 파이프라인 (generator.ts)
운세 텍스트는 아래 4단계로 생성됩니다:
1. **달력 컨텍스트 추출**: `lunar-calendar.ts`로 음력/간지/절기 정보 획득
2. **상성 점수 산출**: `zodiac-relations.ts`로 띠 × 일진 관계 분석 → 점수 보정
3. **프롬프트 조립**: `prompts.ts`의 시스템/사용자 프롬프트에 동적 변수 주입
4. **LLM 호출 → 후처리**: 금지어 필터링, 글자 수 검증 후 DB 저장

## 코딩 컨벤션 및 주의사항
- **언어**: 한국어 UI, 코드 주석은 한국어 가능, 변수명은 영문
- **스타일**: Tailwind 미사용. Vanilla CSS만 사용 (`globals.css` 내 CSS 변수 체계)
- **DB 변경**: `prisma/schema.prisma` 수정 후 반드시 `npx prisma db push` 실행
- **운세 콘텐츠 안전**: 극단적 흉운·질병·파산 등 공포 조장 표현 절대 금지 (법적 면책 정책)
- **띠 계산 정책**: MVP에서는 양력 연도 기준. 입춘/음력 기준은 향후 고도화 예정
- **캐싱**: API 응답은 인메모리 캐시 (1시간 TTL). 자정에 다음날 캐시 워밍 예정

## 자주 사용하는 명령어
```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npx prisma db push   # 스키마 변경 적용
npx tsx prisma/seed.ts          # 12지신 초기 데이터 적재
npx tsx scripts/batch-generate.ts  # 30일치 운세 배치 생성
```

@AGENTS.md
