describe 'PhysicalObject'
  before_each
     po = new SF.PhysicalObject({x: 1, y: 1, width: 2, height: 2});
     po2 = new SF.PhysicalObject({x: 2, y: 2, width: 2, height: 3}); //should collide with po
     po3 = new SF.PhysicalObject({x: 5, y: 5, width: 2, height: 3}); //should not collide with po or po2
  end

  it 'has some properties'
    po.x.should.eql 1
    po.y.should.eql 1
    po.width.should.eql 2
    po.height.should.eql 2
  end

  describe 'collides_with(po)'
    it 'returns true/false when the passed in object collides/doesnt collide with the receiver of collides_with'
      po.collides_with(po2).should.eql true
      po.collides_with(po3).should.eql false
      po2.collides_with(po3).should.eql false
    end
  end
end
