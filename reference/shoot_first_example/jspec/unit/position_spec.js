describe 'Position'
  it 'takes x and y in its constructor'
  p = new SF.Position(1,2)
  p.x.should.be 1
  p.y.should.be 2
  end
end
