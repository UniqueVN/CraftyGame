Crafty.c('Pawn',
{
	Faction : Factions.Neutral,

	init: function()
	{
		this.requires("Movable");
		this.bind("Appeared", this._addPawn);
		this.bind("Remove", this._removePawn);
		return this;
	},

	_addPawn : function()
	{
		this._world.AddPawn(this);
	},

	_removePawn : function()
	{
		this._world.RemovePawn(this);
	},

	IsFriendly : function(other)
	{
		return other != null && this.Faction === other.Faction;
	},

	GetEnemies : function()
	{
		var enemyFaction = this._world.GetEnemyFaction(this.Faction);
		return this._world.GetFactionPawns(enemyFaction);
	}
});
