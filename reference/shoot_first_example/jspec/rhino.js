
load('/Users/gabe/.gem/ruby/1.8/gems/jspec-4.3.2/lib/jspec.js')
load('/Users/gabe/.gem/ruby/1.8/gems/jspec-4.3.2/lib/jspec.xhr.js')
load('jspec/unit/spec.helper.js')
load('lib/shoot_first/js/shoot_first.js')

JSpec
  .exec('jspec/unit/position_spec.js')
  .exec('jspec/unit/player_spec.js')
  .exec('jspec/unit/game_spec.js')
  .run({ reporter: JSpec.reporters.Terminal, fixturePath: 'jspec/fixtures' })
  .report()

