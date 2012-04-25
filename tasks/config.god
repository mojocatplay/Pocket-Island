APPLE_CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
CHROME_URL=ENV["CHROME_URL"] || "localhost:1111/capture"
IS_LINUX=RUBY_PLATFORM=~/linux/

chrome_path = case
when ENV["CHROME_PATH"]
  raise "CHROME_PATH env point to a not existing file" unless File.file?(ENV["CHROME_PATH"])
  ENV["CHROME_PATH"]
when File.file?(APPLE_CHROME_PATH)
  APPLE_CHROME_PATH
when system('which google-chrome 2>&1 > /dev/null')
  `which google-chrome`.strip
else
  raise "Chrome browser not found"
end

raise "buster-server not found" unless system('which buster-server 2>&1 > /dev/null')

God.watch do |w|
  w.name = "buster-server"
  w.group = "testing-server"
  w.start = `which buster-server`.strip
  w.keepalive
  w.log = "/tmp/mlm-god.log"
  # w.autostart = false
end

God.watch do |w|
  w.name = "chrome"
  w.group = "testing-server"
  w.start = "sleep 2 ; export DISPLAY=:10 ; rm -Rf /tmp/chrome_profile ; mkdir -p /tmp/chrome_profile ; exec \"#{chrome_path}\" --user-data-dir=/tmp/chrome_profile --no-first-run #{CHROME_URL}"
  w.log = "/tmp/mlm-god.log"
  w.keepalive
  # w.autostart = false
  # w.pid_file = '/tmp/mlm-chrome.pid'
end


if IS_LINUX
  God.watch do |w|
    w.name = "vncserver"
    w.start = "vncserver -geometry 1024x768 -depth 16 :10"
    #w.pid_file = '/var/lib/jenkins/.vnc/ci.mlm.wooga.com:3.id'
    w.stop = "vncserver -kill :10; rm /tmp/.X10-lock  /tmp/.X11-unix/X10; exit 0"
    w.log = "/tmp/vncserver-jenkins.10.log"
    w.keepalive
  end
end
