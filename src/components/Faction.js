Crafty.c('Faction',
{
	Faction : Factions.Neutral,

	init: function()
	{
		return this;
	},

	IsFriendly : function(other)
	{
		return other != null && this.Faction === other.Faction;
	},

	GetEnemies : function()
	{
		var enemyFaction = this._world.GetEnemyFaction(this.Faction);
		return this._world.GetFactionPawns(enemyFaction);
	},

	GetEnemyBuildings : function()
	{
		var enemyFaction = this._world.GetEnemyFaction(this.Faction);
		return this._world.GetFactionBuildings(enemyFaction);
	}
});