cask "tally" do
  version "1.0.0"
  sha256 "af1006566efc2c2429327a068b460cf5edf23a46239d548793da28b94807f4b6"

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
