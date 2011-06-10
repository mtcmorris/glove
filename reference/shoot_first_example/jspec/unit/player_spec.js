describe 'Player'
  before_each
    player = new SF.Player({id: 1, coords:{x: 0, y: 0}, pos_rate_of_change: [0,0]})
  end

  it 'has an id'
    player.id.should.be 1
  end

  it 'has a position rate of change'
    player.pos_rate_of_change.should_not.be_undefined
  end

  it 'has the properties of a PhysicalObject' 
    player.x.should_not.be_undefined
  end

  describe 'set_position([x,y])'
    it 'updates player position to [x,y]'
      pre_move = player.coords
      player.x.should.be 0
      player.y.should.be 0

      player.set_position([1,2])
      player.x.should_be 1
      player.y.should_be 2
    end

    it 'updates player speed and direction' 
      player.pos_rate_of_change.should_eql [0,0]
      player.set_position([1,1])
      player.set_position([2,2])
      player.pos_rate_of_change.should_eql [1,1]
    end
  end

  describe 'get_predicted_coords()'
    it 'returns a position of where we think this player will be on the next tick, based on their pos_rate_of_change and current position'
      player.set_position([1,1])
      player.set_position([2,2])
      predicted = player.get_predicted_coords()
      predicted.x.should_eql 3
      predicted.y.should_eql 3
    end
  end

  describe 'tick()'
    before_each
      player.last_tick_self.x = 0
      player.last_tick_self.y = 0
      player.x = 5
      player.y = 10

      player.tick()
    end

    it 'updates pos_rate_of_change' 
      player.pos_rate_of_change.should_eql [5, 10]
    end
  end


  describe 'get_new_coords_for_move_dir(dir)'
    it 'returns new coords for the move in the specified direction'
      player.get_new_coords_for_move_dir('left').should_eql [SF.PLAYERSPEED * -1, player.y]
      player.get_new_coords_for_move_dir('right').should_eql [SF.PLAYERSPEED, player.y]
      player.get_new_coords_for_move_dir('up').should_eql [player.x, SF.PLAYERSPEED * -1]
      player.get_new_coords_for_move_dir('down').should_eql [player.x, SF.PLAYERSPEED]
    end
  end
end
