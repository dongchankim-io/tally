cask "tally" do
  version "1.0.0"
  sha256 "2202e26ddc3169b48ffbd2e823a27e4c065b7d0b98394a603aa33adb8b45075c"

  url "https://github.com/dongchankim-io/tally/releases/download/v#{version}/Tally-#{version}-aarch64.dmg"
  name "Tally"
  desc "A fast, keyboard-first desktop financial workspace for macOS"
  homepage "https://github.com/dongchankim-io/tally"

  livecheck do
    url :url
    strategy :github_latest
  end

  depends_on macos: ">= :ventura"

  app "Tally.app"

  zap trash: [
    "~/Library/Application Support/Tally",
    "~/Library/Preferences/com.tally.finance.plist",
    "~/Library/Saved Application State/com.tally.finance.savedState",
  ]
end
