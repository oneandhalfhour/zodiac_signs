아래처럼 접근하면 됩니다. 핵심은 **이 서비스를 “점술 엔진”으로 만들지, 아니면 “12띠 기준의 일일 콘텐츠 서비스”로 만들지 먼저 정하는 것**입니다. 한국에서 말하는 띠는 사람이 태어난 해의 지지를 동물 이름으로 상징한 민속 개념이고, 12띠가 있으며 지지는 천간과 결합해 60갑자를 이룹니다. 즉, 가장 단순한 서비스는 “쥐띠~돼지띠 12개 결과를 매일 보여주는 구조”이고, 더 깊게 가면 같은 용띠라도 갑진·임진처럼 60갑자나 출생연도 차이를 반영하는 구조로 확장할 수 있습니다. 또 십이지신은 한국의 민속·불교적 배경과도 연결되어 있어서, 단순 재미 요소를 넘어서 한국 사용자에게는 꽤 익숙한 문화 코드입니다. ([한국민족문화대백과사전][1])

## 1. 먼저 알아야 할 사전 지식

### 1) 서비스 범위를 먼저 고정해야 합니다

띠별 매일 운세 서비스는 크게 두 종류입니다.

첫째는 **콘텐츠형 서비스**입니다. 오늘 날짜 기준으로 쥐띠, 소띠, 범띠… 12개 운세를 보여주는 형태입니다. 이 경우 사용자 생년월일이 없어도 되고, 사용자가 자기 띠를 직접 선택하게 하면 됩니다.
둘째는 **개인화형 서비스**입니다. 사용자의 출생연도나 생년월일을 받아서 자동으로 띠를 계산하고, 나아가 음력/양력, 경계일, 나이대까지 반영합니다.

실무적으로는 **MVP를 콘텐츠형으로 시작하는 것이 훨씬 낫습니다.** 이유는 간단합니다. 띠별 매일 운세는 본질적으로 하루에 12개의 결과만 있으면 서비스가 돌아가고, 개인정보 이슈와 출생일 경계 정책 문제를 크게 줄일 수 있기 때문입니다.

### 2) 달력과 역법을 이해해야 합니다

한국의 현행 공식 역법은 그레고리력이고, 한국천문연구원(KASI)은 월별 음양력 서비스에서 양력-음력 대조 정보를 제공하고 있습니다. 이 서비스의 공개 범위는 `-59년 2월 ~ 2050년 12월`입니다. 또한 공공데이터포털의 KASI 음양력 API는 음력 연월일, 윤달 여부, 요일, 간지(세차/일진), 율리우스적일까지 제공하며 무료이고 이용허락범위 제한이 없습니다. 따라서 한국형 띠/간지 기반 서비스를 만들 때 가장 먼저 붙잡아야 할 기준 데이터는 KASI 쪽입니다. ([KASI Astronomy][2])

여기서 중요한 건 **“띠 계산 기준일” 정책**입니다. 한국 문화에서 설은 음력 1월 1일, 입춘은 24절기의 첫 절기이자 보통 양력 2월 4일경으로 인식됩니다. 그래서 1월생, 2월초생 사용자는 “나는 어느 띠냐”에서 혼선이 생길 수 있습니다. 이 문제는 사주형 서비스로 갈수록 더 민감해집니다. 그래서 서비스 초반에는 **아예 띠를 사용자가 직접 선택하게 하고**, 자동 계산 기능은 나중에 붙이는 편이 안정적입니다. 자동 계산을 붙일 때는 반드시 “양력 연도 기준 / 설 기준 / 입춘 기준 중 무엇을 쓰는지” 정책 문구를 명시해야 합니다. ([한국민족문화대백과사전][3])

### 3) 24절기·공휴일·기념일을 알아야 합니다

띠별 운세 문장을 매일 똑같이 보이지 않게 하려면 날짜 맥락이 필요합니다. 이때 가장 유용한 것이 **24절기, 공휴일, 명절, 잡절**입니다. KASI 특일 정보 API는 국경일, 공휴일, 기념일, 24절기, 잡절 정보를 날짜와 함께 제공합니다. 또 월력요항은 달력 제작 기준이 되는 공식 발표 자료입니다. 즉, 단순히 “오늘은 4월 18일”만 보는 것이 아니라 “오늘은 절기 직후인지, 명절 전후인지, 휴일인지”를 같이 보아야 문구가 살아납니다. ([Data.gov.au][4])

예를 들어,

* 설 전후에는 “가족, 새출발, 정리” 톤
* 입춘 무렵에는 “시작, 전환, 기운 상승” 톤
* 추석 전후에는 “관계, 귀향, 정산” 톤
* 월말/월초에는 “정리, 계획, 소비 관리” 톤

처럼 콘텐츠 규칙을 만들 수 있습니다. 이 부분은 데이터보다 **콘텐츠 설계 문제**에 가깝습니다.

### 4) 운세를 어떤 단위로 쪼갤지 알아야 합니다

띠별 일일 운세는 보통 한 문단만 보여주면 금방 식상해집니다. 따라서 최소한 아래 정도로 쪼개는 게 좋습니다.

* 총평
* 금전운
* 애정운
* 직장/학업운
* 건강운
* 오늘의 한마디
* 행운 요소(숫자, 색상, 방향, 시간대)
* 주의 요소(충동지출, 말실수, 일정 지연 등)

이 구조를 잡아두면 나중에 앱, 웹, 푸시, SNS 카드뉴스로 재가공하기 쉬워집니다.

### 5) 콘텐츠 생성 방식을 정해야 합니다

운세 데이터는 보통 세 방식 중 하나입니다.

**수동 편집형**
에디터가 매일 12개를 작성합니다. 품질은 좋지만 운영비가 큽니다.

**룰 기반 반자동형**
“띠 + 요일 + 절기 + 특일 + 카테고리” 규칙으로 초안을 만들고 사람이 검수합니다. 운영 밸런스가 가장 좋습니다.

**AI 생성형**
LLM으로 초안을 만들고 승인 후 발행합니다. 빠르지만, 문체 일관성·중복·과장 표현·불쾌한 문장 문제가 생길 수 있어 반드시 검수 체계가 필요합니다.

실무적으로는 **룰 기반 + AI 보조 + 최종 검수**가 가장 현실적입니다.

### 6) 개인정보와 문구 리스크를 알아야 합니다

생년월일이나 출생시를 저장하는 순간 개인정보가 되므로, 목적을 명확히 하고 최소 범위만 수집해야 하며 개인정보 처리방침도 공개해야 합니다. 개인정보보호위원회도 개인정보 처리방침을 법에 따라 수립·공개한다고 명시하고 있습니다. 또 운세 문구가 건강, 재정, 법률 결과를 단정하는 식으로 과장되면 표시광고 관련 리스크를 불러올 수 있으므로, 서비스 성격을 “참고용·엔터테인먼트성 콘텐츠”로 두는 편이 안전합니다. ([Law.go.kr][5])

---

## 2. DB를 설계할 때 꼭 필요한 핵심 요소

가장 중요한 원칙은 이것입니다.

**달력 데이터와 운세 콘텐츠 데이터를 분리**하고,
**운세 원문과 점수/메타데이터를 분리**하고,
**발행 버전과 수정 이력을 남기는 구조**로 가야 합니다.

### A. 기준 정보 테이블

#### 1) `zodiac_signs`

12띠 마스터입니다.

필수 컬럼 예시:

* `zodiac_id`
* `branch_code` (`ja`, `chuk`, `in`, `myo` ...)
* `animal_name_ko` (`쥐`, `소`, `범`, `토끼` ...)
* `display_name_ko` (`쥐띠`, `소띠` ...)
* `aliases` (`호랑이/범`, `원숭이/잔나비` 등)
* `order_no` (1~12)
* `emoji_or_icon`
* `is_active`

이 테이블이 필요한 이유는 한국어 표기가 생각보다 다양하기 때문입니다. 예를 들어 범띠/호랑이띠, 원숭이띠/잔나비띠 같은 별칭을 검색과 UI에서 다뤄야 합니다.

#### 2) `sexagenary_cycle`

60갑자 마스터입니다. 단순 띠 서비스에는 없어도 되지만, 확장성을 생각하면 처음부터 두는 편이 좋습니다.

필수 컬럼 예시:

* `cycle_no` (1~60)
* `heavenly_stem_ko`
* `earthly_branch_ko`
* `ganji_ko` (`갑진`, `을사` 등)
* `yin_yang`
* `element`
* `zodiac_id`

이 테이블이 있으면 “같은 용띠라도 세대별로 다르게 보이게 하기”가 쉬워집니다.

#### 3) `solar_terms`

24절기 마스터입니다.

필수 컬럼 예시:

* `solar_term_id`
* `name_ko` (`입춘`, `우수`, `경칩` ...)
* `order_no`
* `description`
* `season_group`

이 테이블은 운세 문구 톤과 배너, 카드뉴스, 알림 제목에 매우 유용합니다.

---

### B. 날짜 기준 테이블

#### 4) `calendar_dates`

이 서비스의 사실상 중심 테이블입니다. 모든 화면과 배치 작업이 결국 이 테이블을 보게 됩니다.

필수 컬럼 예시:

* `solar_date` (PK)
* `solar_year`
* `solar_month`
* `solar_day`
* `weekday`
* `week_of_year`
* `lunar_year`
* `lunar_month`
* `lunar_day`
* `is_lunar_leap_month`
* `lunar_month_days`
* `ganji_year`
* `ganji_month`
* `ganji_day`
* `julian_day`
* `solar_term_id` (nullable)
* `is_public_holiday`
* `holiday_name`
* `is_weekend`
* `source_system`
* `source_version`
* `synced_at`

이 테이블은 왜 중요하냐면, 운세를 그날그날 계산하지 않고 **미리 날짜 속성을 정규화해서 저장**해두면 서비스가 훨씬 단순해지기 때문입니다.
예를 들어 `2026-04-18` 행 하나만 봐도,

* 토요일인지
* 음력 며칠인지
* 윤달인지
* 일진이 무엇인지
* 절기인지
* 공휴일인지

를 한 번에 알 수 있어야 합니다.

#### 5) `calendar_special_days`

하루에 특성이 여러 개 붙을 수 있으므로 별도 테이블이 좋습니다.

필수 컬럼 예시:

* `special_day_id`
* `solar_date`
* `kind` (`holiday`, `anniversary`, `solar_term`, `misc`)
* `name_ko`
* `is_public_holiday`
* `source`

예를 들어 어떤 날짜는 “공휴일 + 절기”가 동시에 될 수 있습니다. 이를 `calendar_dates`에 컬럼으로 다 박아넣기보다 별도 행으로 두는 게 확장성이 좋습니다.

---

### C. 운세 콘텐츠 테이블

#### 6) `daily_fortunes`

실제 사용자에게 보여줄 일별 운세 본문입니다.
하루 12개가 기본이므로 1년이면 `12 x 365 = 4,380행` 정도밖에 안 됩니다. 데이터량은 작지만 콘텐츠 품질이 핵심입니다.

필수 컬럼 예시:

* `fortune_id`
* `service_date`
* `zodiac_id`
* `headline`
* `summary_text`
* `overall_score`
* `love_score`
* `money_score`
* `work_score`
* `health_score`
* `lucky_color`
* `lucky_number`
* `lucky_direction`
* `lucky_time_slot`
* `caution_text`
* `recommended_action`
* `seo_title`
* `seo_description`
* `status` (`draft`, `reviewed`, `published`, `archived`)
* `version_no`
* `published_at`
* `created_by`
* `reviewed_by`

실무 팁은 `service_date + zodiac_id + version_no`에 유니크 제약을 두는 것입니다. 그래야 수정본, 재발행본, A/B 테스트 버전을 안전하게 관리할 수 있습니다.

#### 7) `daily_fortune_sections`

운세를 섹션 단위로 쪼개는 테이블입니다.

필수 컬럼 예시:

* `section_id`
* `fortune_id`
* `section_type` (`overall`, `money`, `love`, `work`, `health`, `tip`)
* `section_title`
* `body_text`
* `display_order`

이렇게 나누면 앱에서는 카드형 UI, 웹에서는 탭형 UI, 푸시에서는 요약형 UI로 각각 쉽게 재활용할 수 있습니다.

#### 8) `fortune_tags`

검색, 추천, 통계용 태그입니다.

예시:

* `tag_id`
* `tag_name` (`대인관계`, `신중함`, `지출주의`, `기회포착`)

#### 9) `fortune_tag_map`

* `fortune_id`
* `tag_id`

이 구조가 있으면 “이번 달에 금전운 상승 태그가 많이 나온 띠” 같은 집계가 쉬워집니다.

---

### D. 생성 규칙 / CMS / 버전 관리

#### 10) `fortune_rules`

반자동 생성용 규칙 테이블입니다.

필수 컬럼 예시:

* `rule_id`
* `zodiac_id` (nullable 가능)
* `weekday`
* `solar_term_id`
* `special_day_kind`
* `season_group`
* `tone_type`
* `priority`
* `rule_expression`
* `active_from`
* `active_to`
* `is_active`

예를 들어:

* “토끼띠 + 월요일 + 절기 직후 = 새출발/정리 강조”
* “말띠 + 공휴일 전날 = 이동/약속/지출 주의”
  같은 규칙을 넣을 수 있습니다.

#### 11) `fortune_templates`

문장 템플릿 저장용입니다.

필수 컬럼 예시:

* `template_id`
* `category`
* `tone_type`
* `template_text`
* `variables_json`
* `is_active`

예를 들어
`"오늘은 {{keyword}}보다 {{action}}이 더 큰 성과로 이어집니다."`
같은 템플릿을 관리합니다.

#### 12) `fortune_versions`

원문 변경 이력을 남기는 테이블입니다.

필수 컬럼 예시:

* `version_id`
* `fortune_id`
* `version_no`
* `content_snapshot`
* `change_reason`
* `changed_by`
* `changed_at`

이 테이블이 있어야 “왜 오늘 운세 문구가 바뀌었는지” 추적할 수 추적할 수 있습니다.

#### 13) AI를 쓴다면 `generation_logs`

필수 컬럼 예시:

* `generation_id`
* `fortune_id`
* `model_name`
* `prompt_version`
* `prompt_hash`
* `input_variables`
* `raw_output`
* `postprocessed_output`
* `safety_check_result`
* `human_review_status`
* `generated_at`

AI를 쓰면서 이걸 안 남기면, 나중에 문제 문장이 나왔을 때 원인을 못 찾습니다.

---

### E. 사용자/운영 테이블

#### 14) `users`

회원 기능이 있을 때만 필요합니다.

필수 컬럼 예시:

* `user_id`
* `auth_provider`
* `nickname`
* `locale`
* `timezone`
* `marketing_consent`
* `created_at`

#### 15) `user_zodiac_profiles`

개인화 기능용입니다.

필수 컬럼 예시:

* `profile_id`
* `user_id`
* `selected_zodiac_id`
* `selection_mode` (`manual`, `birth_year_auto`, `birth_datetime_auto`)
* `birth_year` (nullable)
* `birth_date` (nullable)
* `birth_time` (nullable)
* `calendar_type` (`solar`, `lunar`)
* `boundary_policy` (`solar_year`, `lunar_new_year`, `ipchun`)
* `is_primary`

중요한 건 `selected_zodiac_id`와 `selection_mode`를 같이 두는 것입니다.
그래야 사용자가 직접 선택했는지, 자동 계산했는지 구분할 수 있습니다.

#### 16) `notification_settings`

* `user_id`
* `zodiac_id`
* `push_enabled`
* `delivery_time`
* `channel` (`app_push`, `email`, `kakao`)
* `quiet_hours`

#### 17) `exposure_logs`

* `log_id`
* `user_id` 또는 `anonymous_id`
* `fortune_id`
* `viewed_at`
* `clicked_share`
* `clicked_next`
* `stay_seconds`

이 데이터가 있어야 어떤 띠, 어떤 카테고리, 어떤 문체가 반응이 좋은지 알 수 있습니다.

#### 18) `ingestion_runs`

외부 달력 데이터를 가져온 기록입니다.

* `run_id`
* `source_name`
* `target_date_from`
* `target_date_to`
* `status`
* `records_inserted`
* `records_updated`
* `error_message`
* `executed_at`

배치 실패를 운영에서 잡기 쉬워집니다.

---

## 3. DB 설계에서 특히 중요한 실무 원칙

### 날짜 테이블을 먼저 만들고, 운세는 그 위에 얹으세요

운세 서비스는 콘텐츠 서비스처럼 보이지만, 실제로는 **날짜 속성 모델링**이 절반입니다.
`calendar_dates`가 깨끗하면 나머지는 훨씬 쉬워집니다.

### “본문 텍스트”와 “구조화된 값”을 분리하세요

예를 들어 `overall_score=78`, `lucky_color=blue`, `caution_text=충동구매 주의`는 구조화된 값이고, 실제 운세 문단은 비정형 텍스트입니다. 이 둘을 한 컬럼에 뭉개면 나중에 통계, 검색, 추천, 카드 UI 구성이 매우 어려워집니다.

### “발행본”과 “초안”을 분리하세요

운세는 생각보다 수정이 잦습니다.
그래서 `status`, `version_no`, `published_at`, `reviewed_by` 같은 필드는 거의 필수입니다.

### 자동 계산보다 “사용자 선택”이 초기 서비스에 유리합니다

띠 자동 계산은 경계일, 음력/양력, 입춘 기준 문제를 바로 불러옵니다.
초기에는 홈 화면에서 12띠를 직접 선택하게 만들면, 서비스 출시가 훨씬 빨라지고 민원도 줄어듭니다.

---

## 4. 가장 현실적인 MVP 구조

처음부터 복잡하게 가지 말고 이렇게 가는 걸 권합니다.

### 1단계

* `zodiac_signs`
* `calendar_dates`
* `daily_fortunes`
* `daily_fortune_sections`

이렇게만으로도 서비스는 돌아갑니다.
사용자는 띠를 직접 고르고, 하루 12개 운세를 보여줍니다.

### 2단계

* `calendar_special_days`
* `solar_terms`
* `fortune_tags`
* `fortune_versions`

이 단계에서 “절기/명절 반영”, “검색/추천”, “수정 이력 관리”가 가능해집니다.

### 3단계

* `users`
* `user_zodiac_profiles`
* `notification_settings`
* `generation_logs`

이 단계부터 개인화, 푸시, AI 생성 운영으로 넘어갑니다.

---

## 5. 추천 결론

이 서비스를 한국 시장용으로 만들 때 가장 좋은 출발점은 다음입니다.

1. **처음엔 ‘개인 사주 서비스’가 아니라 ‘12띠 일일 콘텐츠 서비스’로 시작한다.**
2. **달력 기준 데이터는 KASI 음양력/특일 정보로 정규화한다.** ([Data.gov.au][6])
3. **사용자에게는 띠를 직접 선택하게 해서 경계일 문제를 피한다.**
4. **DB는 `기준정보 → 날짜 → 운세 본문 → 버전관리 → 사용자 확장` 순서로 설계한다.**
5. **AI를 쓰더라도 원문, 프롬프트 버전, 검수 상태를 반드시 기록한다.**

가장 중요한 한 줄로 정리하면,
**띠별 일일 운세 서비스의 본질은 “복잡한 점술 계산”보다 “정확한 날짜 데이터 + 일관된 콘텐츠 운영 + 확장 가능한 CMS/DB”에 있습니다.**

다음 단계로 바로 이어서, 이 구조를 바탕으로 **ERD 초안**이나 **MySQL/PostgreSQL용 테이블 DDL**까지 설계할 수 있습니다.

[1]: https://encykorea.aks.ac.kr/Article/E0017225 "띠 - 한국민족문화대백과사전"
[2]: https://astro.kasi.re.kr/life/pageView/5 "월별 음양력 | 생활천문관 | 천문우주지식정보"
[3]: https://encykorea.aks.ac.kr/Article/E0028997 "설 - 한국민족문화대백과사전"
[4]: https://www.data.go.kr/data/15012690/openapi.do "한국천문연구원_특일 정보 | 공공데이터포털"
[5]: https://law.go.kr/%EB%B2%95%EB%A0%B9/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4%EB%B3%B4%ED%98%B8%EB%B2%95?utm_source=chatgpt.com "개인정보 보호법"
[6]: https://www.data.go.kr/data/15012679/openapi.do "한국천문연구원_음양력 정보 | 공공데이터포털"
