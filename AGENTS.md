<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 띠별 일일 운세 서비스 — 에이전트 가이드

## 프로젝트 요약
한국 사용자 대상 웹 기반 띠별 일일 운세 서비스.
Next.js 16 (App Router) + Prisma + SQLite + Vanilla CSS.
운세 생성은 명리학 상성 엔진(Rule Engine) + LLM 프롬프트 체이닝 구조.

## 핵심 아키텍처 규칙

### 운세 생성 파이프라인 (`src/lib/generator.ts`)
1. 달력 컨텍스트 추출 → 2. 상성 점수 산출 → 3. 프롬프트 조립 → 4. LLM 호출 + 후처리
- 점수와 길흉 방향은 **룰 엔진**(`zodiac-relations.ts`)에서 결정
- LLM은 결정된 점수/방향을 자연어로 **구두화(Verbalize)하는 역할에만 국한**
- 이 책임 분리를 절대 위반하지 말 것

### 콘텐츠 안전 정책
- 극단적 흉운, 생명 위협, 질병, 파산, 자살 등 **공포 조장 표현 절대 금지**
- 운세 문구는 "엔터테인먼트 목적의 콘텐츠"로서 법적 면책 대상
- 금지어 필터링 로직: `generator.ts` 내 `FORBIDDEN_WORDS` 배열 및 `sanitizeText()` 함수

### 스타일링
- **Tailwind CSS 사용 금지**. 반드시 Vanilla CSS만 사용 (`src/app/globals.css`)
- CSS 변수 체계 (`--bg-dark`, `--accent`, `--text-main` 등) 활용
- Glassmorphism 다크모드 테마 유지

### DB 작업
- ORM: Prisma. 스키마: `prisma/schema.prisma`
- 스키마 변경 시: `npx prisma db push` 후 확인
- `(serviceDate, zodiacId)` 복합 유니크 제약 필수 유지

### 달력/역법
- 음력·간지 변환: `korean-lunar-calendar` NPM 패키지 사용 (외부 API 호출 금지)
- 절기: `src/lib/lunar-calendar.ts` 내 근사치 테이블 사용
- 띠 계산: MVP는 양력 연도 기준 (`src/lib/zodiac.ts`)

### 파일별 역할
| 파일 | 역할 | 수정 시 주의 |
|------|------|------------|
| `zodiac-relations.ts` | 12×12 상성 매트릭스 | 명리학 규칙 변경 시에만 수정 |
| `lucky-elements.ts` | 오행→색상/숫자/방향 | 매핑 테이블 변경 시에만 수정 |
| `prompts.ts` | LLM 프롬프트 | 톤/글자수 제한 변경 시 수정 |
| `generator.ts` | 파이프라인 오케스트레이터 | 4단계 순서 변경 금지 |

## 자주 사용하는 명령어
```bash
npm run dev                        # 개발 서버
npm run build                      # 프로덕션 빌드
npx prisma db push                 # 스키마 적용
npx tsx prisma/seed.ts             # 12지신 초기 데이터
npx tsx scripts/batch-generate.ts  # 30일치 운세 배치 생성
```
