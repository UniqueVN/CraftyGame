Crafty.c('Body',
{
	_world : null,
	_tileX : 0,
	_tileY : 0,

	TileWidth : 1,
	TileHeight : 1,

	IsStatic : true,

	init: function()
	{
		var entity = this;
		this.requires("2D");
		return this;
	},

	Appear: function(world, x, y)
	{
		if (!this.has("Sprite"))
			throw new Error("Must have Sprite for body!");

		this._world = world;
		this._tileX = x;
		this._tileY = y;

		var pos = this.GetSpritePosAtTile(x, y);
		this.x = pos.X;
		this.y = pos.Y;
		this.z = pos.Z;

		if (this.IsStatic)
			world.AddStaticEntity(this);

		this.trigger("Change");
		this.trigger("Appeared");
	},

	GetSpritePosAtTile : function(tileX, tileY)
	{
		var x = tileX * this._world.TileSize + (this.TileWidth * this._world.TileSize - this.w) / 2.0;
		var y = tileY * this._world.TileSize + this.TileHeight * this._world.TileSize - this.h;
		var z = tileY + this.TileHeight + 1; // add 1 padding with other things (like map, player), could be const
		return { X : x, Y : y, Z : z};
	},

	GetBounds : function()
	{
		var bounds = [];
		var r = this._tileX + this.TileWidth;
		var b = this._tileY + this.TileHeight;
		for (var x = this._tileX; x < r; x++)
		{
			for (var y = this._tileY; y < b; y++)
				bounds.push({X : x, Y : y});
		}

		return bounds;
	}
});