THE GAME: MONK STORY

The game currently lacks a little bit in-game storytelling, but the basic premise is that a mage walked into a dead forest and start to investigate, soon he realizes that the great evil has been breeding their minions in this area and their power is growing every day. Out of curiosity and potential of utilizing this unknown power, the mage decided to single handedly defeat monsters, cleansing the forest and eventually uncover whatever is behind all this. Although this is only half true, the mage called in a dimension gate to summon his own minions from outer planes. Now two forces soon clash and the ultimate battle begins. On the side note, the mage also discovered strange artifacts throughout the forest, when the mage lay hand on those, it turns into something tree like or sometimes a statue with full of magic energy, those will act as sentry and immediately begin to attack enemies;

Controls:
* WASD: movements
* Mouse click: casting normal magic missile
* Hot key (1, 2): casting special spells when player gain it
* Drag and drop statue into summoning circle to create minion. When you die, you also need to drag your statue into the summoning circle too

Win/Lose
The game is sort of a mix up between tower defense, dota and castle fight game types.
* you win the game by defeating two bosses, they are nested in separate locations and constantly summoning minions. As soon as one of them defeated that nest will stop producing enemies
* you lose when your dimension gate is destroyed by the evil (you have no chance facing great evil alone, and there will need long before you can manage to create another gate, you will be forced to leave this forest, perhaps come back in another time)

Starting Setup
* you start in the middle of forest, you will see the dimension gate in the middle, three statues in front of it (those are teleported here by the gate), you can drag the statue into the summoning circles (indicated by yellow beams), once you drop it into  the circle, you will be charged with corresponding soul points (see bottom bar the numbers next to a face, you start with 1000 soul points), if you don't have the sufficient souls, the statue will not drop but pop back to the gate.
* Once dropped, the statute start to produce units, notice the progress when the colored body filled up, and unit is produced when full body is turned into color
* When you remove a statue from gate to circle, the statues will be shuffled and replenished, the remaining ones may or may not stay, so grab the one you really need first!
* You may also notice there are two summoning circles. That's because each is pointing to one of the enemy nest, the direction it faces pointing to the direction of the nest. so you can know the general location of the nest (however the route could be tricky), now you have to balance your troop for two different directions, if one is too weak, your base may be in danger.

Towers
* you may notice in your base and outside there are many liberated cups (those are ancient artifacts), you can click on them, and they will become essentially a tower
* note, build tower cost you soul points as well (500)

Units
unfortunately we didn't' have time to put in full set of the untis, you can find these threes for now
* highlander : melee units, cheap, cost 100
* mech : ranged unit, shoot assault rifle. cost 250
* dragon slayer: heavy infantry, very stable and powerful, cost 600

Souls:
* your primary source of the soul point is from killing monsters. each monster has small fixed amount of soul points
* the slain boss will provide you large amount of soul points, give you a big boost

Spells:
* the mage casting spells by collecting elements (see the amount you have on the bottom bar)
* the elements is dropped randomly from dead creatures (both monsters and your minions)
* there are currently three types of elements (dark, light and fire)
* with different combination, the mage can cast spells, here is the two spells currently implemented
** hellhounds :  3 fire + 1 light, 6 hounds will be released dealing AOE damage in a line
** lightning strike : 3 light + 1 dark, random lightning strike within an area

TECHNICAL:

Library:
* CraftyJS: http://craftyjs.com/ - game engine
* Backbone
* Jquery
* jsface
* modernizr
* require-jquery
* underscore

Art assets:
* Character animation: wulax [LPC] Medieval fantasy character sprites http://opengameart.org/content/lpc-medieval-fantasy-character-sprites
* Other characters and effects: Skorpio [LPC] Skorpio's SciFi Sprite Pack http://opengameart.org/content/lpc-skorpios-scifi-sprite-pack
* Weapons and others: daneeklu LPC Weapons: two bows, a spear and a trident http://opengameart.org/content/lpc-weapons-two-bows-a-spear-and-a-trident
* Environment : LPC art entry by Casper Nilsson
* Spells : daneeklu Extended LPC Magic pack http://opengameart.org/content/extended-lpc-magic-pack
* Spell icons: J. W. Bjerk Painterly Spell Icons http://opengameart.org/content/painterly-spell-icons-part-3
* Projectiles : from Battle of Wesnoth (using sprites of fireball, icemissile, magicmissle and fire arrow) http://wesnoth.org/

Project structure:
* index.html - run this file to start the game
* /src: folder contains all game's source codes
* /res: folder contains game resources, images

LICENSE:
 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
  
 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.
 
AUTHORS:
* THANG HONG TO - UniqueVN@gmail.com:
** Implement the tile map: auto-generate the map, minimap
** Implement the regions: base shrine, monster nest
** Others: healthbar, towers, trees ...
* JIA CHENG - chengjialeph@gmail.com:
** Implement the AI: path finding, target priority, boss AI
** Implement the spells
** Others: spell bar, soul system, summoning circle, statue ...
