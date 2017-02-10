var randomMessages = [
    "I'm coming to get you!",
    "Beep boop",
    "This one will get you for sure!",
    "By Tyr this is a great move",
    `A worse provision
    no man can take from table
    than too much beer-bibbing:
    for the more he drinks
    the less control he has
    of his own mind.`,
    `Never break the peace which good men and true make between thee and others.`,
    `A tale is but half told when only one person tells it.`,
    `No one is a total fool if he can be silent.`,
    
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
