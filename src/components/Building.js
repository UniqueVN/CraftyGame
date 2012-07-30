Crafty.c('Building',
{
	init: function()
	{
		this.requires("Static, Faction");
		this.bind("Appeared", this._addBuilding);
		this.bind("Remove", this._removeBuilding);
		return this;
	},

	_addBuilding : function()
	{
		this._world.AddBuilding(this);
	},

	_removeBuilding : function()
	{
		this._world.RemoveBuilding(this);
	}
});
