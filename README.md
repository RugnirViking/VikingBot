# VikingBot, a Generals.io bot.
The goal is to make a bot for generals.io in js.

Soon I will re-write this repo
VikingBot:

Strategy for the bot: 

We want to do the following moves in order of importance

  1 - if we can see a general, attack it
  
  2 - if we can't, move onto an enemy player's tile
  
  3 - if we can't see enemy players, move onto blank tiles
  
  4 - if we can't make any moves like this, move high army tiles to low army tiles. if we can see an enemy tile, move half when using 	       the general tile
  
  5 - failing that, make a random move
  
  6 - if we are well and truly stuck, do nothing 
  
      
      
TODO: Implement strategy #1
Improve pathing on #4

From the website:

This is an example of a basic Javascript implementation of a bot for [generals.io](http://generals.io). Read the tutorial associated with this bot at [dev.generals.io/api#tutorial](http://dev.generals.io/api#tutorial).

## Usage

```
git clone https://github.com/RugnirViking/VikingBot
node main.js
```
