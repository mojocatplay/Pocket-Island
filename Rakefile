require 'rubygems'
require 'bundler/setup'

VERBOSE=RakeFileUtils.verbose_flag
def SILENT(s); VERBOSE ? '' : s; end
def which(s); system("which #{s} >/dev/null 2>&1") ; end

import 'tasks/build.rake'
import 'tasks/lint.rake'