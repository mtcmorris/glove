watch( 'jspec/unit/(.*)\.js' )           {|md| test }
watch( 'lib/shoot_first/(.*)\.js' )      {|md| test }

watch( 'lib/shoot_first/(.*)\.coffee' ) {|md| compile_sf(md[0]) }
watch( 'server/(.*)\.coffee' ) {|md| compile(md[0]) }
watch( 'client/js/(.*)\.coffee' ) {|md| compile(md[0]) }

def compile_sf(file)
  puts 'Compiling ' + file.to_s
  system("coffee -c #{file}")
  test
end

def compile(file)
  puts 'Compiling ' + file.to_s
  system("coffee -c #{file}")
end

def test
  system('node jspec/node.js')
end

