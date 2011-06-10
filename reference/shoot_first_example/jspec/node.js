require.paths.unshift('jspec', '/Users/gabe/.gem/ruby/1.8/gems/jspec-4.3.2/lib', '/Library/Ruby/Gems/1.8/gems/jspec-4.3.2/lib', 'lib')
require('jspec')
require('unit/spec.helper')
require('jspec.growl')
SF = require('shoot_first/shoot_first')

JSpec
  .exec('jspec/unit/physical_object_spec.js')
  .exec('jspec/unit/player_spec.js')
  .exec('jspec/unit/game_spec.js')
  .run({ reporter: JSpec.reporters.Terminal, fixturePath: 'spec/fixtures', failuresOnly: true })
  .report()


