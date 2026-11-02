# Tally

> **A fast, keyboard-first desktop financial workspace for macOS**  
> 100% Local-first, privacy-focused bookkeeping studio crafted with Apple Human Interface Guidelines, Baselane-style transaction reconciliation, and multi-currency support. Built with Tauri v2 and React 19.

[![GitHub release](https://img.shields.io/github/v/release/dongchankim-io/tally?color=007AFF&style=flat-square)](https://github.com/dongchankim-io/tally/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Platform: macOS](https://img.shields.io/badge/Platform-macOS%20(Ventura%2B)-000000?style=flat-square&logo=apple)](https://github.com/dongchankim-io/tally)
[![Runtime: Tauri v2](https://img.shields.io/badge/Runtime-Tauri%20v2-24C8D8?style=flat-square&logo=tauri)](https://tauri.app/)

[**English**](#tally) | [**한국어 문서 (Korean Documentation)**](#-한국어-문서-korean-documentation)

---

## 📦 Installation & Setup

### Method 1: Homebrew (Recommended)

Install Tally with a single terminal command:

```bash
brew install --cask dongchankim-io/tally/tally
```

*Or by tapping the repository first:*
```bash
brew tap dongchankim-io/tally
brew install --cask tally
```

#### Updating to the Latest Version:
```bash
brew upgrade tally
```

---

### Method 2: Direct Download (.dmg)

1. Download the latest `Tally-x.x.x-aarch64.dmg` from the [**GitHub Releases**](https://github.com/dongchankim-io/tally/releases/latest) page.
2. Double-click the downloaded `.dmg` file.
3. Drag **Tally.app** into your **Applications** folder.
4. Launch Tally from Spotlight (`⌘ Space` -> type `Tally`) or Launchpad.

> [!TIP]
> **macOS Gatekeeper First Launch**: Because Tally is an independent open-source project without a paid Apple Developer notarization certificate, macOS might show a warning on first launch. If prompted, simply **Right-click (Control-click) `Tally.app` in Finder -> Open -> Click Open**.

---

## 🗑️ Uninstallation Guide

Tally provides flexible uninstallation options depending on whether you want to preserve your financial data for future reinstallation or purge everything completely.

### Option 1: Complete Clean Uninstall (Zero Data Left Behind)

If you installed via Homebrew and want to permanently erase **the app, all ledger entries, settings, and cache files**:

```bash
brew uninstall --cask --zap tally
```

This automatically purges all of the following locations without leaving a single trace:
- `/Applications/Tally.app` (Application binary)
- `~/Library/Application Support/Tally` (Local financial database & JSON files)
- `~/Library/Application Support/com.tally.finance` (Tauri app metadata)
- `~/Library/Preferences/com.tally.finance.plist` (User preferences & state)
- `~/Library/Caches/com.tally.finance` (WKWebView cache)
- `~/Library/WebKit/com.tally.finance` (Local storage & IndexedDB)
- `~/Library/Saved Application State/com.tally.finance.savedState` (Window restoration cache)
- `~/Library/HTTPStorages/com.tally.finance` (Network session storage)

### Option 2: Remove App Only (Preserve Your Financial Data)

If you wish to uninstall the application but **keep your personal financial data** intact for future use:

```bash
brew uninstall --cask tally
```
Your local data file remains safely in `~/Library/Application Support/Tally/tally_data.json` and will be automatically reloaded if you reinstall Tally later.

### Option 3: Manual Removal (For Direct .dmg Users)

If you installed Tally by dragging the `.app` manually:
1. Open Finder, navigate to `/Applications`, and drag **Tally.app** to the Trash.
2. *(Optional — Complete Purge)* Run the following terminal command to remove all associated local data and settings:
   ```bash
   rm -rf ~/Library/Application\ Support/Tally \
          ~/Library/Application\ Support/com.tally.finance \
          ~/Library/Preferences/com.tally.finance.plist \
          ~/Library/Caches/com.tally.finance \
          ~/Library/WebKit/com.tally.finance \
          ~/Library/Saved\ Application\ State/com.tally.finance.savedState
   ```

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

## 📦 설치 및 업데이트 방법

### 방법 1: Homebrew로 설치 (가장 추천)

터미널에서 한 줄 명령어로 즉시 설치할 수 있습니다:

```bash
brew install --cask dongchankim-io/tally/tally
```

*또는 탭을 먼저 등록한 후 설치:*
```bash
brew tap dongchankim-io/tally
brew install --cask tally
```

#### 최신 버전으로 업데이트:
```bash
brew upgrade tally
```

---

### 방법 2: GitHub Releases에서 .dmg 직접 다운로드

1. [**GitHub Releases**](https://github.com/dongchankim-io/tally/releases/latest) 페이지에서 최신 `Tally-x.x.x-aarch64.dmg` 파일을 다운로드합니다.
2. 다운로드한 `.dmg` 파일을 더블클릭하여 마운트합니다.
3. **Tally.app**을 **Applications** 폴더로 드래그합니다.
4. Spotlight(`⌘ Space` ➔ `Tally` 입력) 또는 런치패드에서 앱을 실행합니다.

> [!TIP]
> **macOS 게이트키퍼(Gatekeeper) 첫 실행 안내**: Tally는 애플 개발자 유료 인증서를 구입하지 않고 오픈소스로 배포되는 무료 소프트웨어이므로, 최초 1회 실행 시 *"확인되지 않은 개발자가 배포했기 때문에 열 수 없습니다"*라는 경고가 뜰 수 있습니다. 이때는 당황하지 마시고 **Finder의 응용 프로그램 폴더에서 `Tally.app`을 마우스 우클릭(또는 Control+클릭) ➔ [열기] ➔ 팝업창에서 [열기]**를 클릭해 주시면 이후부터는 정상 실행됩니다.

---

## 🗑️ 제거 및 완전 삭제 방법 (Uninstallation)

Tally는 가계부 장부 데이터를 나중에 다시 쓸 수 있도록 남겨둘지, 아니면 단 하나의 흔적도 없이 완전히 날려버릴지에 따라 다양한 삭제 방식을 제공합니다.

### 방식 1: 흔적 없는 100% 완전 삭제 (데이터 + 설정 + 캐시 영구 삭제)

Homebrew로 설치했고, 개인 금융 데이터와 환경설정까지 맥에서 **완벽하게 영구 삭제**하고 싶을 때:

```bash
brew uninstall --cask --zap tally
```

위 명령어 하나로 아래 위치에 생성된 모든 파일이 단 1바이트도 남지 않고 자동 정리됩니다:
- `/Applications/Tally.app` (프로그램 본체)
- `~/Library/Application Support/Tally` (내 로컬 가계부 장부 데이터 JSON)
- `~/Library/Application Support/com.tally.finance` (Tauri 앱 메타데이터)
- `~/Library/Preferences/com.tally.finance.plist` (환경설정 파일)
- `~/Library/Caches/com.tally.finance` (웹뷰 렌더링 캐시)
- `~/Library/WebKit/com.tally.finance` (로컬 웹 스토리지/DB)
- `~/Library/Saved Application State/com.tally.finance.savedState` (창 상태 복원 캐시)
- `~/Library/HTTPStorages/com.tally.finance` (네트워크 세션 데이터)

### 방식 2: 앱만 삭제 (내 가계부 장부 데이터 보존)

프로그램만 지우고, **내가 기록한 가계부 내역 파일은 안전하게 남겨두고 싶을 때**:

```bash
brew uninstall --cask tally
```
내 장부 파일(`~/Library/Application Support/Tally/tally_data.json`)이 그대로 유지되므로, 나중에 Tally를 재설치하면 기존 가계부 내역이 자동으로 복원됩니다.

### 방식 3: 수동 설치 사용자 (.dmg)를 위한 삭제 방법

Homebrew 없이 `.dmg`로 직접 설치하셨던 경우:
1. Finder의 `/Applications` 폴더에서 **Tally.app**을 휴지통으로 이동합니다.
2. *(선택 — 모든 데이터까지 완전 정리할 경우)* 터미널에서 아래 명령어를 실행하여 잔여 설정 폴더를 삭제합니다:
   ```bash
   rm -rf ~/Library/Application\ Support/Tally \
          ~/Library/Application\ Support/com.tally.finance \
          ~/Library/Preferences/com.tally.finance.plist \
          ~/Library/Caches/com.tally.finance \
          ~/Library/WebKit/com.tally.finance \
          ~/Library/Saved\ Application\ State/com.tally.finance.savedState
   ```

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
