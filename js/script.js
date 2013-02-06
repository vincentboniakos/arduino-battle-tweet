function init() {
  
  //listen
  socket = io.connect('http://localhost', {port: 8080});

  $('form').submit(function(e){
    e.preventDefault();
    $('#hashtag_1_count').empty();
    $('#hashtag_2_count').empty();
    socket.emit('setup_hashtags', {hashtags: [$('#hashtag_1').val(),$('#hashtag_2').val()]});
  });

  socket.on('update_counter', function(e){
    $('#hashtag_1_count').text(e.score[0]);
    $('#hashtag_2_count').text(e.score[1]);
  });  

}
