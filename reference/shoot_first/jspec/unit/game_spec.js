describe 'Game'
  before_each
    game = new SF.Game();
  end

  it 'has players'
    game.players.should_not.be undefined
  end

  describe 'update_player_position()'
    it 'lets_players_move'
      player = game.connect('conid')
      coords_before_move = player.coords()

      coords_before_move.x.should.be 0
      coords_before_move.y.should.be 0
      game.update_player_position(player, [1,2])
      player.coords().x.should.be 1
      player.coords().y.should.be 2
    end
  end

  it 'tracks players with connect() and disconnect()' 
    var con_id = '123'

    //add a connection
    game.connect(con_id)
    game.connection_ids.should.include con_id
    game.players[con_id].should_not.be_undefined

    //remove a connection
    game.disconnect(con_id)
    game.connection_ids.should_not.include con_id
    game.players[con_id].should.be_undefined

    //add two connections
    game.connect(1)
    game.connect(2)
    game.connection_ids.should.include 1
    game.players[1].should_not.be_undefined
    game.connection_ids.should.include 2
    game.players[2].should_not.be_undefined

    game.players[1].x.should.eql 0
    game.players[1].y.should.eql 0

    //remove con 1 and con 2 should stay
    game.disconnect(1)
    game.connection_ids.should_not.include 1
    game.players[1].should.be_undefined
    game.connection_ids.should.include 2
    game.players[2].should_not.be_undefined
  end

  describe 'two players connected'
    before_each
      p1_con_id = '123'
      p2_con_id = '456'

      player_1 = game.connect(p1_con_id)
      player_2 = game.connect(p2_con_id)
    end

    describe '#gamestate'
      it 'returns the current gamestate'
        gs = game.gamestate();
        gs.players.should_not.be_undefined
        gs.tick.should.be 0

        players = gs.players
        players.should.include player_1
        players.should.include player_2

        move_msg = {type: 'update_my_position', data: [1,2], tick: 0}
        game.message(p1_con_id, move_msg)
        game.tick()

        gs = game.gamestate()
        gs.players.should.include player_1
        gs.players[0].position.should.be player_1.position
        gs.players[1].position.should.be player_2.position
      end
    end

    describe '#tick'
      it 'processes queued up messages'
        tick = game.current_tick
        player_1.coords().x.should.be 0

        game.message(p1_con_id, {type: 'update_my_position', data: [1,2], tick: 0})
        game.tick()

        player_1.coords().x.should.be 1
        player_1.coords().y.should.be 2
        game.messages.should.be_empty
      end

      it 'ticks each player'
        //TODO: implement me when you switch back to jasmine
      end

      it 'advances the game current_tick by 1'
        pre_tick = game.current_tick
        game.tick()
        game.current_tick.should.be pre_tick + 1
      end

      it 'adds the current gamestate snapshot to @gamestates'
        tick = game.current_tick
        game.tick()
        game.gamestates[tick].should_not.be_undefined
      end

      it 'returns the current gamestate as it stands after processing all messages in the queue'
        game.tick().should.eql game.gamestate()
      end
    end

    describe '#message'
      it 'handles move messages'
        move_msg = {type: 'update_my_position', data: [1,2], tick: 0}
        game.message(p1_con_id, move_msg)
        game.messages.should.include {connection_id: p1_con_id, body: move_msg, for_tick: 0}
      end
    end
  end
end
