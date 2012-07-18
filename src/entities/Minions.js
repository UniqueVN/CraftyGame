Minion = Creature.extend({
	Faction : Factions.Monk
});

PlatinumWorrior = Minion.extend(
{
	Sprites : ['armorWhite'],
	Speed : 0.08,
	WalkAnimationFrames: 9
});