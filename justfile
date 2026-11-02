# Justfile for Tally - Keyboard-first macOS Financial Workspace

set shell := ["zsh", "-cu"]

# Default settings
VERSION := `node -p "require('./package.json').version"`
GITHUB_REPO := env_var_or_default("GITHUB_REPO", "dongchankim-io/tally")
TAP_REPO := env_var_or_default("TAP_REPO", "dongchankim-io/homebrew-tally")

# Default command: display available recipes
default:
    @just --list

# ------------------------------------------------------------------------------
# 🛠️ Initial Setup
# ------------------------------------------------------------------------------

# Setup developer environment (Node, pnpm, Rust, dependencies)
init:
    @echo "==> [1/4] Checking Node.js & pnpm..."
    @node -v
    @pnpm -v || npm i -g pnpm
    @echo "==> [2/4] Installing npm dependencies..."
    pnpm install
    @echo "==> [3/4] Checking Rust toolchain..."
    @which cargo >/dev/null 2>&1 || (echo "Rust is missing. Installing via rustup..." && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y)
    @source "$HOME/.cargo/env" 2>/dev/null || true && cargo --version
    @echo "==> [4/4] Verifying GitHub CLI (gh)..."
    @gh --version >/dev/null 2>&1 && gh auth status || echo "⚠️ gh CLI is not authenticated. Run 'gh auth login' to enable release commands."
    @echo "✅ Environment initialized successfully!"

# ------------------------------------------------------------------------------
# 🚀 Development & Quality
# ------------------------------------------------------------------------------

# Run the desktop app in development mode with hot reload
dev:
    @source "$HOME/.cargo/env" 2>/dev/null || true
    pnpm dev

# Run frontend in browser preview
dev-web:
    pnpm dev:web

# Run TypeScript and Rust compiler sanity checks
check:
    @echo "==> Checking TypeScript..."
    pnpm exec tsc --noEmit
    @echo "==> Checking Rust backend..."
    @source "$HOME/.cargo/env" 2>/dev/null || true
    cd src-tauri && cargo check
    @echo "✅ All type checks and Rust checks passed!"

# Clean build artifacts
clean:
    rm -rf dist release src-tauri/target/release/bundle
    @echo "🧹 Cleaned dist and release directories."

# ------------------------------------------------------------------------------
# 📦 Build & Packaging
# ------------------------------------------------------------------------------

# Build frontend production assets
build-web:
    pnpm build

# Build native macOS .app bundle
build-app:
    @source "$HOME/.cargo/env" 2>/dev/null || true
    pnpm build:app

# Build macOS .dmg package with drag-and-drop installer & checksum
build-dmg version=VERSION:
    @echo "==> Building Tally v{{version}} .dmg package..."
    @source "$HOME/.cargo/env" 2>/dev/null || true
    pnpm build:app
    @rm -rf release
    @mkdir -p release/dmg_staging
    @cp -R src-tauri/target/release/bundle/macos/Tally.app release/dmg_staging/
    @ln -s /Applications release/dmg_staging/Applications
    @hdiutil create -volname "Tally" -srcfolder release/dmg_staging -ov -format UDZO "release/Tally-{{version}}-aarch64.dmg"
    @rm -rf release/dmg_staging
    @cd release && shasum -a 256 "Tally-{{version}}-aarch64.dmg" > "Tally-{{version}}-aarch64.dmg.sha256"
    @echo "✅ DMG package created at release/Tally-{{version}}-aarch64.dmg"
    @echo "   SHA256: `cat release/Tally-{{version}}-aarch64.dmg.sha256`"

# ------------------------------------------------------------------------------
# 🌐 GitHub Release & Homebrew Publishing
# ------------------------------------------------------------------------------

# Create a GitHub Release and upload the .dmg and checksum
release version=VERSION: (build-dmg version)
    @echo "==> Publishing Release v{{version}} to GitHub ({{GITHUB_REPO}})..."
    @test -f "release/Tally-{{version}}-aarch64.dmg" || (echo "DMG file not found. Run 'just build-dmg' first." && exit 1)
    @git tag -f "v{{version}}" 2>/dev/null || true
    @git push origin "v{{version}}" 2>/dev/null || echo "Note: Git remote tag push skipped if remote is not set yet."
    gh release create "v{{version}}" \
        "release/Tally-{{version}}-aarch64.dmg" \
        "release/Tally-{{version}}-aarch64.dmg.sha256" \
        --repo "{{GITHUB_REPO}}" \
        --title "Tally v{{version}}" \
        --notes "### ✨ What's New in Tally v{{version}}"$'\n'$'\n'"- 100% Local-First desktop financial workspace for macOS"$'\n'"- Baselane-style reconciliation & review"$'\n'"- Multi-currency support (KRW, USD, EUR, JPY)"$'\n'"- Lightning-fast < 11MB Tauri v2 native architecture"
    @echo "✅ GitHub Release v{{version}} published successfully!"

# Generate Homebrew Cask formula file (Casks/tally.rb)
cask version=VERSION:
    #!/usr/bin/env bash
    set -euo pipefail
    DMG="release/Tally-{{version}}-aarch64.dmg"
    if [ ! -f "$DMG" ]; then
        echo "DMG not found at $DMG. Running 'just build-dmg {{version}}' first..."
        just build-dmg "{{version}}"
    fi
    SHA=$(shasum -a 256 "$DMG" | awk '{print $1}')
    mkdir -p Casks
    printf '%s\n' \
      'cask "tally" do' \
      '  version "{{version}}"' \
      "  sha256 \"${SHA}\"" \
      '' \
      '  url "https://github.com/{{GITHUB_REPO}}/releases/download/v#{version}/Tally-#{version}-aarch64.dmg"' \
      '  name "Tally"' \
      '  desc "A fast, keyboard-first desktop financial workspace for macOS"' \
      '  homepage "https://github.com/{{GITHUB_REPO}}"' \
      '' \
      '  livecheck do' \
      '    url :url' \
      '    strategy :github_latest' \
      '  end' \
      '' \
      '  depends_on macos: :ventura' \
      '' \
      '  app "Tally.app"' \
      '' \
      '  zap trash: [' \
      '    "~/Library/Application Support/Tally",' \
      '    "~/Library/Application Support/com.tally.finance",' \
      '    "~/Library/Caches/com.tally.finance",' \
      '    "~/Library/HTTPStorages/com.tally.finance",' \
      '    "~/Library/Preferences/com.tally.finance.plist",' \
      '    "~/Library/Saved Application State/com.tally.finance.savedState",' \
      '    "~/Library/WebKit/com.tally.finance",' \
      '  ]' \
      'end' > Casks/tally.rb
    echo "✅ Homebrew Cask formula generated at Casks/tally.rb"
    cat Casks/tally.rb

# Publish cask formula to both this repo and homebrew-tap
publish-brew version=VERSION: (cask version)
    #!/usr/bin/env bash
    set -euo pipefail
    echo "==> [1/2] Updating Casks/tally.rb in {{GITHUB_REPO}}..."
    git add Casks/tally.rb
    if git diff --cached --quiet; then
        echo "Local Casks/tally.rb is already up to date."
    else
        git commit -m "chore(cask): update Tally cask to v{{version}}"
        git push origin HEAD 2>/dev/null || echo "Note: Run 'git push' to sync changes to remote."
    fi

    echo "==> [2/2] Updating {{TAP_REPO}}..."
    TEMP_DIR=$(mktemp -d)
    if gh repo clone "{{TAP_REPO}}" "$TEMP_DIR" 2>/dev/null; then
        mkdir -p "$TEMP_DIR/Casks"
        cp Casks/tally.rb "$TEMP_DIR/Casks/tally.rb"
        cd "$TEMP_DIR"
        git add Casks/tally.rb
        if git diff --cached --quiet; then
            echo "Tap repository is already up to date."
        else
            git commit -m "chore: update Tally cask to v{{version}}"
            git push origin HEAD
        fi
        rm -rf "$TEMP_DIR"
        echo "🎉 Successfully published Tally v{{version}} to {{TAP_REPO}}!"
    fi

    echo ""
    echo "Users can install Tally with:"
    echo "  brew install --cask dongchankim-io/tally/tally"

# Full release pipeline: check, build-dmg, release, and publish-brew
ship version=VERSION: (check) (release version) (publish-brew version)
    @echo "🚀 Ship pipeline complete for Tally v{{version}}!"
