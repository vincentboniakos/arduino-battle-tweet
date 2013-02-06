var five = require("johnny-five"),
    twitter = require('ntwitter'),
    io = require('socket.io').listen(8080),
    board = new five.Board();

var twit = new twitter({
  consumer_key: 'here',
  consumer_secret: 'goes',
  access_token_key: 'your twitter',
  access_token_secret: 'keys'  
});

var hashtags = [];
var results = [];
var servo;

board.on("ready", function() {
  var red   = new five.Led(11);
  var blue  = new five.Led(6);
  servo     = new five.Servo(3);

  board.repl.inject({
    ledBlue: blue,
    ledRed: red,
    servo: servo
  });

  board.on('changeLight',function(results){
    var tot = results[hashtags[0]] + results[hashtags[1]];
    ledBlue.brightness(results[hashtags[0]]/tot * 255);
    ledRed.brightness(results[hashtags[1]]/tot * 255);
    servo.move(Math.floor(results[hashtags[0]]/tot * 175)+5);
  });


  board.on('tweet',function(data){
    if(typeof data.entities != 'undefined' ){
      for(var i = 0; i < data.entities.hashtags.length; i++){
        if(  hashtags.indexOf(data.entities.hashtags[i].text) >= 0 ){
          results[data.entities.hashtags[i].text]++;
            board.emit('changeLight',results);
            io.sockets.emit('update_counter', {score: [results[hashtags[0]],results[hashtags[1]]]}); 
        }
      }
    }
  });
});

//handle messages
io.sockets.on('connection', function (socket) {
  socket.on('setup_hashtags', function(message){
    console.log(message.hashtags);
    initTweetStream(message.hashtags);
  });
});

function initTweetStream(new_hashtags){
  //reset results
  hashtags = new_hashtags;
  results = [];
  for(var i = 0; i < hashtags.length; i++){
    results[hashtags[i]] = 0;
  }

  //init twitter stream search
  twit.stream(
    'statuses/filter',
    {'track': hashtags.join() },
    function(stream) {
        stream.on('data', function (data) {
            board.emit('tweet', data);
        });
  });

  if(typeof servo != 'undefined'){
    servo.center();
  }

}