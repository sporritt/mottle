require 'fileutils'

task :default => [:dist]

BuildDir = 'build'
JsDir = 'js'
Version = '0.1'
Libraries = [ 'jquery' ]

desc "Builds the concatenated JS files"
task :dist do
	
	puts 'Cleaning up/creating build directory...'
	Dir.mkdir BuildDir if !Dir.exists? BuildDir
	FileUtils.rm_rf "#{BuildDir}/#{Version}" if Dir.exists? "#{BuildDir}/#{Version}"	
	Dir.mkdir "#{BuildDir}/#{Version}"

	Libraries.each { |lib| 
		out_filename = "#{lib}.touch-adapter-all-#{Version}.js"
		puts "#{lib} : concatenating Javascript files into #{out_filename}"
	  	out_file = File.new("#{BuildDir}/#{Version}/#{out_filename}", "w")

	  	["touch-adapter-#{Version}.js", "#{lib}.touch-adapter-#{Version}.js"].each { |f| 
	  		out_file.puts File.open("#{JsDir}/#{f}", "r").read
	  	}
	  	out_file.close	
	}  
	  
end