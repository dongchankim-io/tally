cask "tally" do
  version "1.0.0"
  sha256 "3a3af026d543888996fa8202566624f4505a50f38cd74d6cb2bdba0b39f9cf8e"

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
