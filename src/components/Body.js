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
		this._world = world;
		this._tileX = x;
		this._tileY = y;

		this.x = x * world.TileSize;
		this.y = y * world.TileSize;
		this.w = this.TileWidth * world.TileSize;
		this.h = this.TileHeight * world.TileSize;

		if (this.IsStatic)
			world.AddStaticEntity(this);

		this.trigger("Change");
		this.trigger("Appeared");
	},

	GetBounds : function()
	{
		return [{X : this._tileX, Y : this._tileY}];
	}
});