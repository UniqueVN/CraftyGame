var MapEntity = BaseEntity.extend(
{
	Width : 1,
	Height : 1,
	Sprites : ['bush1'],
	bUseCanvas: true,

	initialize: function()
	{
		var drawType = (this.bUseCanvas ? "Canvas" : "DOM");
		var entity = Crafty.e("2D, SpriteAnimation, Body, Static, " + drawType + ", " + this._getRandomSprite())
			.attr({z:2, TileWidth:this.Width, TileHeight:this.Height});
		this.set({'entity' : entity });
	},

	Appear: function(world, x, y)
	{
		this.getEntity().Appear(world, x, y);
		return this;
	},

	_getRandomSprite : function()
	{
		if (this.Sprites.length > 0)
			return this.Sprites[Crafty.math.randomInt(0, this.Sprites.length - 1)];
		return "";
	}

});