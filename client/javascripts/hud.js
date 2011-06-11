(function() {
  $(function() {
    $("#player-name").html(prompt("What is your name?"));
    return $("#player-health-bar").css({
      width: '100%'
    });
  });
}).call(this);
