# Tally

> **A fast, keyboard-first desktop financial workspace for macOS**  
> 100% Local-first, privacy-focused bookkeeping studio crafted with Apple Human Interface Guidelines, Baselane-style transaction reconciliation, and multi-currency support. Built with Tauri v2 and React 19.

[![GitHub release](https://img.shields.io/github/v/release/dongchankim-io/tally?color=007AFF&style=flat-square)](https://github.com/dongchankim-io/tally/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Platform: macOS](https://img.shields.io/badge/Platform-macOS%20(Ventura%2B)-000000?style=flat-square&logo=apple)](https://github.com/dongchankim-io/tally)
[![Runtime: Tauri v2](https://img.shields.io/badge/Runtime-Tauri%20v2-24C8D8?style=flat-square&logo=tauri)](https://tauri.app/)

[**English**](#tally) | [**한국어 문서 (Korean Documentation)**](#-한국어-문서-korean-documentation)

---

## 📦 Installation

### Method 1: Via Homebrew (Recommended)

You can install Tally directly using Homebrew:

```bash
# Tap the repository and install
brew tap dongchankim-io/tally
brew install --cask tally
```

*Or via one-liner:*
```bash
brew install --cask dongchankim-io/tally/tally
```

To update Tally in the future:
```bash
brew upgrade tally
```

### Method 2: Direct Download (.dmg)

1. Download the latest `Tally-x.x.x-aarch64.dmg` from the [**GitHub Releases**](https://github.com/dongchankim-io/tally/releases/latest) page.
2. Open the `.dmg` and drag `Tally.app` into your `/Applications` folder.

---

## ✨ Features

- **💾 100% Local-First & Zero Tracking**:
  - All ledger entries are stored in a local JSON file (`~/Library/Application Support/Tally/tally_data.json`) on your Mac.
  - Zero cloud dependencies, zero external network requests, zero telemetry, and zero ads.
  - Safe atomic file writes (`.tmp` rename) with 250ms debounced disk I/O ensure corruption-free persistence across crashes.
  - Reveal data file directly in Finder anytime via the header button or Command Palette (`⌘K`).
- **⚖️ Baselane-Style Reconciliation & Review**:
  - **Two-Step Review State**: Every transaction stays `Pending Review` until verified as `Reviewed`.
  - **1-Click Micro Actions**: Rapidly toggle review status in timeline feed or bulk spreadsheet.
  - **Reconciliation Progress Bar**: Visual percentage tracking toward your monthly "Inbox Zero" milestone.
  - **3-Way Smart Filter**: Easily toggle between `[All]`, `[⏳ Pending N]`, and `[✓ Reviewed M]`.
- **⌘K Command Palette**:
  - Raycast/Linear-inspired global search and quick actions.
  - Press `⌘K` or click the search pill to jump anywhere instantly.
- **🌍 Multi-Currency Native**:
  - Seamless toggle between **KRW (₩)**, **USD ($)**, **EUR (€)**, and **JPY (¥)**.
  - Header quick toggle (`₩ KRW` / `$ USD`) and full decimal accuracy (`$14.99`, `$0.99`).
- **4 Dedicated Core Views**:
  1. **Feed (Timeline)**: Clean, chronological receipt timeline with daily subtotal summaries.
  2. **Calendar (Interactive)**: Heatmap calendar with day-by-day spend/income indicators & zero-spend day tracker.
  3. **Spreadsheet (Bulk)**: Fast tabular data entry with `Tab` / `Enter` keyboard flow and bulk reconciliation.
  4. **Analytics (MoM Insights)**: Month-over-month category breakdown, comparative dual delta bars, and payment method allocation.
- **⚡ Quick Natural Entry**: Enter transactions quickly in one line (e.g., `Starbucks 6200` or `Blue Bottle 14.50`).
- **🤖 Smart SMS & Notification Parser (`⌘V`)**: Paste bank SMS or credit card push notifications to auto-populate fields.
- **🌓 Dark & Light Modes**: OLED dark mode and Apple canvas light mode with automatic transition.
- **🍎 Apple Human Interface**: Clean macOS titlebar overlay (`Overlay` style) with traffic light clearance.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| **`⌘K`** | Open Command Palette |
| **`⌘1` ~ `⌘4`** | Switch views (Feed / Calendar / Sheet / Analytics) |
| **`⌘N`** | Add new transaction |
| **`⌘V`** | Open smart receipt/SMS paste modal |
| **`⌘E`** | Export data to Excel (.xlsx) |
| **`⌘T`** | Toggle Dark / Light theme |
| **`Tab`** | Move to next cell in Spreadsheet (auto-adds new row on last column) |
| **`ESC`** | Close modals and Command Palette |

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Desktop Runtime**: [Tauri v2](https://tauri.app/) (Rust, macOS WKWebView, Native Overlay Titlebar)
- **Task Runner**: [Just](https://github.com/casey/just)
- **Icons**: Lucide Icons
- **Storage**: Local filesystem JSON (`~/Library/Application Support/Tally/tally_data.json`), Atomic Write

---

## 🚀 Developer Workflow

This repository uses [`just`](https://github.com/casey/just) for reproducible build and release tasks.

```bash
# 1. Initialize environment (Node, pnpm, Rust, gh CLI)
just init

# 2. Run desktop app in development mode with HMR
just dev

# 3. Static type checks (TypeScript + Rust)
just check

# 4. Package macOS .dmg and calculate SHA256
just build-dmg

# 5. Create GitHub Release and upload DMG asset
just release

# 6. Update and commit Homebrew Cask formula
just publish-brew

# 7. Complete release pipeline (check -> build-dmg -> release -> publish-brew)
just ship
```

---
---

# 🇰🇷 한국어 문서 (Korean Documentation)

> **Tally — 맥(macOS) 사용자를 위한 가장 빠른 로컬 우선 데스크톱 가계부**  
> 외부 서버 전송이 전혀 없는 100% 로컬 저장소, Apple Human Interface Guidelines 감성의 미니멀한 UI, Baselane 스타일의 장부 대조(Reconciliation), 다중 통화를 완벽 지원하는 오픈소스 금융 스튜디오입니다.

---

## 📦 설치 방법

### 방법 1: Homebrew로 설치 (가장 추천)

터미널에서 아래 명령어를 입력하여 즉시 설치할 수 있습니다:

```bash
# 탭 등록 및 설치
brew tap dongchankim-io/tally
brew install --cask tally
```

*또는 한 줄 명령어로 바로 설치:*
```bash
brew install --cask dongchankim-io/tally/tally
```

최신 버전으로 업데이트할 때:
```bash
brew upgrade tally
```

### 방법 2: GitHub Releases에서 .dmg 직접 다운로드

1. [**GitHub Releases**](https://github.com/dongchankim-io/tally/releases/latest) 페이지에서 최신 `Tally-x.x.x-aarch64.dmg` 파일을 다운로드합니다.
2. 다운로드한 `.dmg` 파일을 열고 `Tally.app`을 `Applications` 폴더로 드래그합니다.

---

## ✨ 핵심 기능

- **💾 100% Mac 로컬 저장소 (Local-First & 제로 트래킹)**:
  - 모든 장부 데이터는 외부 클라우드로 전송되지 않고 내 맥의 로컬 파일(`~/Library/Application Support/Tally/tally_data.json`)에만 안전하게 보관됩니다.
  - 광고, 유료 구독 모델, 트래커가 전혀 없는 순수 오프라인 로컬 우선 아키텍처입니다.
  - 임시 파일 교체 방식의 원자적(Atomic) 쓰기와 250ms 디바운스를 적용하여 비정상 종료 시에도 데이터 손상을 방지합니다.
  - 헤더의 '로컬 저장소' 버튼이나 `⌘K` 메뉴를 통해 언제든 Finder에서 내 데이터 파일을 확인할 수 있습니다.
- **⚖️ Baselane 스타일 장부 대조 및 검토 (Reconciliation & Review)**:
  - **2단계 상태 관리**: 모든 거래는 '검토 필요(대기)' ➔ '검토 완료' 상태로 체계적으로 대조됩니다.
  - **원클릭 마이크로 버튼**: 피드와 시트에서 1-클릭으로 즉각 검토 완료 전환.
  - **진행률 프로그레스 바**: 이번 달 확인 완료율(%)과 "Inbox Zero" 달성 피드백 제공.
  - **3-Way 스마트 필터**: `[전체]` | `[⏳ 검토 필요 N]` | `[✓ 검토 완료 M]`
- **⌘K 글로벌 커맨드 팔레트**:
  - Raycast / Linear 스타일의 직관적인 단축키 검색 창 (`ESC`로 닫기).
- **🌍 다중 통화 지원 (Multi-Currency)**:
  - **KRW (₩)**, **USD ($)**, **EUR (€)**, **JPY (¥)** 원클릭 전환 및 소수점 금액(`$14.99`, `$0.99`) 지원.
- **4가지 코어 뷰**:
  1. **피드 (Timeline)**: 날짜별 타임라인 및 일별 지출 합산.
  2. **달력 (Interactive)**: 지출/수입 히트맵 & 짠테크 무지출 데이 체크.
  3. **시트 (Bulk Spreadsheet)**: `Tab` / `Enter` 키를 통한 초고속 엑셀형 대량 입력 및 일괄 검토.
  4. **인사이트 (Analytics & MoM)**: 전월 대비(MoM) 증감 대조 및 결제수단 비중 통계.
- **⚡ 한 줄 빠른 입력**: "스타벅스 6200" 또는 "블루보틀 14.50" 자연어 빠른 입력.
- **🤖 스마트 결제 알림/SMS 파싱 (`⌘V`)**: 카드 승인 문자 및 결제 알림 복사 후 즉시 자동 파싱.

---

## ⌨️ 글로벌 단축키

| 단축키 | 동작 |
| :--- | :--- |
| **`⌘K`** | 커맨드 팔레트 열기 |
| **`⌘1` ~ `⌘4`** | 뷰 모드 즉시 전환 (피드 / 달력 / 시트 / 인사이트) |
| **`⌘N`** | 새 지출 내역 입력창 열기 |
| **`⌘V`** | 스마트 결제 문자/영수증 붙여넣기 |
| **`⌘E`** | 엑셀(.xlsx) 파일로 내보내기 |
| **`⌘T`** | 다크 / 라이트 모드 전환 |
| **`Tab`** | 시트 모드에서 다음 셀 이동 (마지막 열에서 자동 행 추가) |
| **`ESC`** | 모달 및 팝업 닫기 |

---

## 🚀 개발자 가이드 (Justfile)

```bash
# 1. 초기 환경 셋업 (Node, pnpm, Rust, gh CLI 상태 점검)
just init

# 2. 데스크톱 앱 개발 모드 실행 (핫 리로딩 지원)
just dev

# 3. TypeScript 및 Rust 정적 타입 검사
just check

# 4. macOS .dmg 인스톨러 빌드 & SHA256 체크섬 생성
just build-dmg

# 5. GitHub Release 생성 및 .dmg 자동 업로드
just release

# 6. Homebrew Cask 포뮬러 갱신 및 Git 푸시
just publish-brew

# 7. 전체 릴리즈 파이프라인 일괄 실행 (check -> build-dmg -> release -> publish-brew)
just ship
```

---

## 📄 라이선스 (License)

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
