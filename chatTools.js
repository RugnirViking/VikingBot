var randomMessages = [
    "I'm coming to get you!",
    "Beep boop",
    "This one will get you for sure!",
    "By Tyr this is a great move"
];
var mainString = "Beep Boop. I pine for the fjords! Enjoy the game.";
var losingString = "Beep Boop. The day is not in my favour. I am defeated! Well played.";
var winningString = "Beep Boop. Praise Odin! We are victorious. Well played.'";
module.exports = {
  getStartingString: function () {
    // whatever
    return mainString;
  },
  getLosingString: function () {
    return losingString;
  },
  getWinningString: function() {
    return winningString;
  },
  getRandomString: function(){
    var length = randomMessages.length;
    var index = Math.floor(Math.random()*randomMessages.length);
    return randomMessages[index];
  }
};
