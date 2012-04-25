require 'json'
require 'rake/clean'

# The buill of the process is based in two things.
#
#   DEVELOPMENT_FILES is a list of files that should be generated for development. This files include css from less, png sprites from .sprite files.
#   BUILDFILES is a list of files that will be sheeped to the final build. If you need to add some files to the build, add that to this list.
#
# To regenerate all the files, you need to remove the generated files.
#   rake clean will remove all the files in the CLEAN
#   rake clobber will remove all the files in the CLOBBER and CLEAN
#

# __     __         _       _     _
# \ \   / /_ _ _ __(_) __ _| |__ | | ___  ___
#  \ \ / / _` | '__| |/ _` | '_ \| |/ _ \/ __|
#   \ V / (_| | |  | | (_| | |_) | |  __/\__ \
#    \_/ \__,_|_|  |_|\__,_|_.__/|_|\___||___/
#

DEST = ENV["DEST"] || 'build'
directory DEST
CLEAN.add DEST


CURRENTCOMMIT=`git rev-parse --verify HEAD`.strip

# BUILDFILES without the build directory
DEVELOPMENT_FILES=FileList.new


#  ____        _
# |  _ \ _   _| | ___  ___
# | |_) | | | | |/ _ \/ __|
# |  _ <| |_| | |  __/\__ \
# |_| \_\\__,_|_|\___||___/
#
rule ".tar" => [proc{|name| name.gsub(/\..*/,'') }] do |t|
  level = t.source.split(//).count("/") + 1
  sh "cd #{t.source} ; tar -cf #{'../' * level}#{t.name} *"
end

rule ".css" => ".less" do |t|
  sh "lessc --yui-compress #{t.source} > #{t.name}"
end

rule '.png' => '.sprite' do |t|
  sh "spritopia #{t.source}"
end

rule '.json' => '.sprite' do |t|
  sh "spritopia #{t.source}"
end


#  _____ _ _        _     _     _
# |  ___(_) | ___  | |   (_)___| |_ ___
# | |_  | | |/ _ \ | |   | / __| __/ __|
# |  _| | | |  __/ | |___| \__ \ |_\__ \
# |_|   |_|_|\___| |_____|_|___/\__|___/
#

CONFIGFILES=`./bin/update_index --config-files`.split


CSSFROMLESS=FileList['css/**/*.less'].ext('.css')

#   ____             __ _         _____ _ _
#  / ___|___  _ __  / _(_) __ _  |  ___(_) | ___  ___
# | |   / _ \| '_ \| |_| |/ _` | | |_  | | |/ _ \/ __|
# | |__| (_) | | | |  _| | (_| | |  _| | | |  __/\__ \
#  \____\___/|_| |_|_| |_|\__, | |_|   |_|_|\___||___/
#                         |___/
file 'config/goals.json' => [ 'config/entities.json', 'docs/goals.csv', 'docs/subgoals.csv', 'bin/autogoal.js' ] do
  sh "./bin/autogoal.js"
end
CLOBBER.add('config/goals.json')

file 'js/config.js' => CONFIGFILES do |t|
  INSERTIONS = {
    'entityDefinitions' => [:reparse, 'entities.json'],
    'goals'             => [:oneline, 'goals.json'],
    'playerData'        => [:reparse, 'player.json'],
    'levels'            => [:reparse, 'levels.json'],
    'shopItems'         => [:reparse, 'shop.json'],
    'tutorial'          => [:reparse, 'tutorial.json'],
    'version'           => [:stringify, 'version']}

  options = INSERTIONS.map {|k,v|
    cmd = k == 'goals' ? '--oneline' : '--reparse'
    "--#{v[0].to_s} window.wooga.castle.#{k}:config/#{v[1]}"
  }.join(" ")

  sh "./bin/json_to_script -f #{t.name} #{options}"
end

CLOBBER.add 'js/config.js'

file 'config/version' => '.git/index' do |t|
  sh "printf #{CURRENTCOMMIT} > #{t.name}"
end

CLOBBER.add 'config/version'

#  ____             _ _
# / ___| _ __  _ __(_) |_ ___  ___
# \___ \| '_ \| '__| | __/ _ \/ __|
#  ___) | |_) | |  | | ||  __/\__ \
# |____/| .__/|_|  |_|\__\___||___/
#       |_|
SPRITEFILES=FileList['images/**/*.sprite']
GENERATEDSPRITE = SPRITEFILES.ext('.png') +  SPRITEFILES.ext('.json')

SPRITEFILES.each do |sprite|

  files_in_sprite = FileList.new.add(File.read(sprite).split).pathmap(File.dirname(sprite)+"/%p")

  file sprite.ext('.png') => [sprite] + files_in_sprite do |t|
    sh "spritopia #{t.prerequisites[0]}"
  end

  file sprite.ext('.json') => [sprite] + files_in_sprite do |t|
    sh "spritopia #{t.prerequisites[0]}"
  end

end


CLOBBER.add SPRITEFILES.ext(".png")
CLOBBER.add SPRITEFILES.ext(".json")

CLOBBER.add(CSSFROMLESS)


desc 'Update local files like index.html with the content of the config files, or the css from the less files'
task :default => (CSSFROMLESS + GENERATEDSPRITE << 'js/config.js')

#  ____        _ _     _
# | __ ) _   _(_) | __| |
# |  _ \| | | | | |/ _` |
# | |_) | |_| | | | (_| |
# |____/ \__,_|_|_|\__,_|
#
FILES_TO_COPY=FileList.new


JS_FROM_INDEX=`./bin/extract_files -e js index.html`.split
CSS_FROM_INDEX=`./bin/extract_files -e css index.html`.split
IMAGES_FROM_CSS=`./bin/extract_files -b css -p -e png -e gif -e jpg #{CSS_FROM_INDEX.join(" ").gsub(".css",".less")} | sort | uniq`.split
IMAGES_FROM_ENTITIES=`./bin/extract_files config/entities.json -e png -e jpg -e gif -p  -b images/entities/ | sort | uniq`.split
IMAGES_FROM_GOALS=`./bin/extract_files config/goals.json -e png -e jpg -e gif -p  -b images/entities/ | sort | uniq`.split
IMAGES_FROM_INDEX=`./bin/extract_files -e png -e jpg -e gif index.html | egrep  "images"  | sort | uniq`.split


STYLE_FILE_NAME='style.css'
JS_FILE_NAME='app.js'

file DEST + '/version' => [DEST, '.git/index'] do
  sh "printf #{CURRENTCOMMIT} > #{DEST}/version"
end

file DEST + '/index.html' => 'index.html' do
  sh "cat index.html | ./bin/only_one_css_or_script --js-name #{JS_FILE_NAME} > #{DEST}/index.html"
end


file DEST + '/app.js' => [DEST]+JS_FROM_INDEX.dup << 'index.html' << DEST do |t|
  sh "cat js/config.js > #{t.name}"
  sh "cat #{JS_FROM_INDEX.reject{|f| f =~ /\/config\.js/ }.join(" ")} | bin/yuicompressor --type js >> #{t.name}"
end

CORE_FILES=FileList['index.html', JS_FILE_NAME, 'version']

TEMPLATE_FILES=FileList["templates/**/*.html"]

directory DEST+"/templates"
TEMPLATE_FILES.each do |template|
  file DEST+'/'+template => [DEST+"/templates", template] do |t|
    cp template, t.name
    # sh "bin/htmlcompressor -o #{t.name} #{template}"
  end
end

FILES_TO_COPY.add CSS_FROM_INDEX
FILES_TO_COPY.add IMAGES_FROM_CSS
FILES_TO_COPY.add IMAGES_FROM_ENTITIES
FILES_TO_COPY.add IMAGES_FROM_GOALS
FILES_TO_COPY.add IMAGES_FROM_INDEX
FILES_TO_COPY.add "loading.html"
FILES_TO_COPY.add "ipad.html"
FILES_TO_COPY.add File.read('config/extra_build_files').split

# Say that the directories should be created automatically by rake
FILES_TO_COPY.pathmap("%d").uniq.each do |dir|
  directory DEST + "/" + dir
end

PNGCRUSH_INSTALLED=ENV["PNGCRUSH_INSTALLED"] || system('which pngcrush > /dev/null 2>&1') && `which pngcrush`.strip

PNGCRUSH_ARGUMENTS=ENV["PNGCRUSH_ARGUMENTS"] || "-q -rem alla"
FILES_TO_COPY.uniq.each do |file_to_copy|

  file DEST+"/"+file_to_copy => [file_to_copy.pathmap(DEST+"/%d"), file_to_copy] do |t|
    if PNGCRUSH_INSTALLED && PNGCRUSH_INSTALLED!="no" && t.name =~ /\.png$/i
      sh "#{PNGCRUSH_INSTALLED} #{PNGCRUSH_ARGUMENTS} #{t.prerequisites[1]} #{t.name}"
    else
      cp t.prerequisites[1], t.name
    end
  end

end

BUILD_FILES=(FILES_TO_COPY+CORE_FILES+TEMPLATE_FILES).pathmap(DEST+"/%p")

task :show_files do
  puts BUILD_FILES.join("\n")
end

desc 'Build the exact version that will be shipped to the wrapper'
task :all => BUILD_FILES

desc 'List files that are reference on the game, but doesn\'t exists'
task :check_missing_files do
  missing_files = FILES_TO_COPY - Dir['**/*']
  if missing_files.any?
    $stderr.puts "The game references some files that don't exists:"
    $stderr.puts missing_files.join(" ")
    $stderr.puts "Lets look for it.."
    missing_files.each do |miss|
      sh "grep -rin #{miss.pathmap("%f")} css images js docs index.html templates"
    end
    raise "File #{missing_files.join(" ")} not found"
  end
end

EXCLUDE_PATTERN=/^build|^config|\.less$|^test\/|^tasks\/|README\.md|Rakefile|^bin\/|^docs\//
desc "List the files that are not references from the game but are still present"
task :list_extra_files do
  manual_files = File.read('config/extra_build_files').split
  extra_files = FileList.new('**/*').exclude do |f|
    f =~ EXCLUDE_PATTERN || FILES_TO_COPY.include?(f) || SPRITEFILES.include?(f) || File.directory?(f) || manual_files.include?(f)
  end
  puts extra_files.to_a.join("\n")
end

file 'app.tar' => BUILD_FILES do |t|
  tar = File.expand_path('app.tar')
  sh "cd #{DEST} ; tar -cf #{tar} *"
end
CLEAN.add('app.tar')


#
# README.html
#
file "README.html" => "README.md" do
  sh "markdown README.md > README.html"
end
