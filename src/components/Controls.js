Crafty.c('MouseControl',
{
	init : function()
	{
		if (!this.has("NavigationHandle"))
			throw ("MouseMoveControl relies on NavigationHandle to move the dude around!");

		this.bind("MapClick", this._mapClick);

		return this;
	},

	_mapClick : function(e)
	{
		var tileX = Math.floor(e.realX / this._world.TileSize);
		var tileY = Math.floor(e.realY / this._world.TileSize);

		console.log("Move to ", tileX, tileY);

		this.NavigateTo(tileX, tileY);
	}
});
