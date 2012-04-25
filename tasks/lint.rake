

desc 'Remove trailing spaces at the end of the line'
task :remove_trailing_spaces do
  files = FileList["**/*.js","**/*.html","**/*.less", "**/*.sprites"]
  sh %Q[ruby -p -i'' -e '$_.gsub!(/\\s+$/,"\\n")' #{ files.join(" ")}]
end


#
# Lint task
#
task :jslint do |t|
  lintfiles=`grep -rn '/\*jslint' js/ | cut -d':' -f1 | grep -v vendor`.split
  sh "jslint #{lintfiles.join(' ')}  | egrep -v 'is OK.$|^$' ; exit ${PIPESTATUS[0]}"
end

desc 'Look for syntax errors in the files'
task :lint => :jslint
