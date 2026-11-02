# Tally

> **A fast, keyboard-first desktop financial workspace for macOS**  
> Apple Human Interface Guidelines 감성의 미니멀한 인터페이스, Baselane 스타일의 장부 대조(Reconciliation), 다중 통화를 완벽 지원하는 100% 로컬 우선(Local-First) 오픈소스 데스크톱 가계부 스튜디오입니다.

---

## ✨ 핵심 기능 (Features)

- **💾 100% Mac 로컬 저장소 (Local-First & Zero Network Tracking)**:
  - 모든 장부 데이터는 외부 서버를 거치지 않고 내 맥의 로컬 파일(`~/Library/Application Support/Tally/tally_data.json`)에 안전하게 저장됩니다.
  - 헤더의 **'로컬 저장소'** 버튼이나 커맨드 팔레트에서 언제든 Finder로 내 데이터 파일을 열어볼 수 있습니다.
  - 원자적 파일 쓰기(Atomic Write)와 250ms 디바운스 I/O를 적용하여 전원 종료나 크래시 시에도 데이터 무결성을 보장합니다.
- **⚖️ Baselane식 장부 대조 및 검토 (Reconciliation & Review)**:
  - **2단계 검토 머신**: 모든 거래 내역에 `검토 필요(대기)` ➜ `검토 완료` 상태 지원
  - **원클릭 마이크로 버튼**: 피드와 시트에서 1-클릭으로 즉각 검토 상태 전환
  - **장부 대조 진행률 프로그레스 바**: 이번 달 확인 완료율(%) 및 "Inbox Zero" 성취 피드백
  - **3-Way 스마트 필터**: `[전체]` | `[⏳ 검토 필요 N]` | `[✓ 검토 완료 M]`
- **⌘K Command Menu**: Raycast / Linear 감성의 글로벌 커맨드 팔레트 지원 (`ESC` 키 및 닫기 버튼으로 간편히 닫기)
- **🌍 다중 통화 완벽 지원 (Multi-Currency)**:
  - **KRW (₩)**, **USD ($)**, **EUR (€)**, **JPY (¥)** 원클릭 즉시 전환
  - 헤더 퀵 토글(`₩ KRW` / `$ USD`) 및 커맨드 메뉴에서 언제든 변경
  - 소수점 금액(`$14.99`, `$0.99`) 완벽 지원 및 통화별 정밀 포맷팅
- **4 Pure Core Views**:
  1. **피드 (Timeline Feed)**: 잡음 없는 순수한 날짜별 영수증 피드 및 일별 지출 합산
  2. **달력 (Interactive Calendar)**: 일별 지출/수입 히트맵 & 짠테크 무지출 챌린지
  3. **시트 (Bulk Spreadsheet)**: `Tab` / `Enter`로 1분 만에 끝내는 대량 스프레드시트 및 일괄 검토 처리
  4. **인사이트 (Analytics & MoM)**: 전월 대비(MoM) 수익·지출 항목별 증감 분석(더 쓴 항목/덜 쓴 항목 듀얼 바 대조) & 결제수단 비중 통계
- **⚡ Raycast-Style Quick Entry**: "스타벅스 6200" 또는 "Blue Bottle 14.50" 자연어 한 줄 빠른 입력
- **🤖 스마트 문자/알림 파싱 (`⌘V`)**: 카드 승인 문자 및 결제 알림 자동 파싱
- **🔒 100% Zero Tracker & Zero Ad**: 외부 통신, 광고, 유료 구독 모델이 전혀 없는 순수 오픈소스
- **🌓 OLED Dark & Apple Canvas Light Theme**: 완벽한 다크/라이트 테마 전환
- **🍎 Apple Human Interface**: macOS 신호등 버튼과 겹침 없는 안전 영역(Safe inset, 84px) 설계

---

## ⌨️ 글로벌 단축키 (Keyboard Shortcuts)

| 단축키 | 동작 |
| :--- | :--- |
| **`⌘K`** | 커맨드 팔레트 열기 |
| **`⌘1` ~ `⌘4`** | 뷰 모드 즉시 전환 (피드 / 달력 / 시트 / 인사이트) |
| **`⌘N`** | 새 지출 항목 추가 |
| **`⌘V`** | 스마트 결제 문자/영수증 붙여넣기 |
| **`⌘E`** | 호환 엑셀 파일로 내보내기 |
| **`⌘T`** | 다크 / 라이트 모드 전환 |
| **`Tab`** | 시트 모드에서 다음 열 이동 (마지막 열에서 자동 행 추가) |

---

## 📦 간편 설치 (Installation via Homebrew)

Mac 사용자는 별도 다운로드 페이지를 열 필요 없이 터미널에서 한 줄로 즉시 설치할 수 있습니다:

```bash
brew install --cask dongchankim-io/tally/tally
```

최신 버전으로 업데이트할 때:
```bash
brew upgrade tally
```

---

## 🚀 빠른 시작 및 개발자 명령어 (Developer Workflow & Justfile)

이 프로젝트는 간편하고 일관된 빌드/배포를 위해 [`just`](https://github.com/casey/just) 작업 러너를 지원합니다.

```bash
# 1. 초기 환경 셋업 (Node, pnpm, Rust, gh CLI 상태 점검)
just init

# 2. 데스크톱 앱 개발 모드 실행 (핫 리로딩 지원)
just dev

# 3. 타입스크립트 및 Rust 컴파일 검증
just check

# 4. macOS .dmg 인스톨러 빌드 & SHA256 체크섬 생성
just build-dmg

# 5. GitHub Release 생성 및 .dmg 자동 업로드
just release

# 6. Homebrew Cask 포뮬러 자동 생성 및 Tap 리포지토리 배포
just publish-brew

# 7. 전체 릴리즈 파이프라인 일괄 실행 (check -> build-dmg -> release -> publish-brew)
just ship
```

---

## 🛠️ 기술 스택 (Tech Stack)

- **Framework**: React 19, TypeScript, Vite
- **Desktop Runtime**: Tauri v2 (Rust, macOS WKWebView, Native Overlay Titlebar, Atomic Local File I/O)
- **Task Runner**: Just
- **Styling**: Tailwind CSS, Lucide Icons, Glassmorphism
- **Storage Engine**: Mac Local JSON File (`app.getPath('userData')`), Atomic Disk Write, XLSX Engine
