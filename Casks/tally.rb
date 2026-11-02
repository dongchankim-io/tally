cask "tally" do
  version "1.1.1"
  sha256 "fa8a99f4858d1510896a792194cde8a713ccafc94c97398fdf46a59e444d7a6f"

  url "https://github.com/dongchankim-io/tally/releases/download/v#{version}/Tally-#{version}-aarch64.dmg"
  name "Tally"
  desc "A fast, keyboard-first desktop financial workspace for macOS"
  homepage "https://github.com/dongchankim-io/tally"

  livecheck do
    url :url
    strategy :github_latest
  end

  depends_on macos: :ventura

  app "Tally.app"

  zap trash: [
    "~/Library/Application Support/Tally",
    "~/Library/Application Support/com.tally.finance",
    "~/Library/Caches/com.tally.finance",
    "~/Library/HTTPStorages/com.tally.finance",
    "~/Library/Preferences/com.tally.finance.plist",
    "~/Library/Saved Application State/com.tally.finance.savedState",
    "~/Library/WebKit/com.tally.finance",
  ]
end
