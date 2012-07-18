MapEntity = BaseEntity.extend(
{
	Width : 1,
	Height : 1,
	Sprites : ['bush1'],

	initialize: function()
	{
		var entity = Crafty.e("2D, DOM, SpriteAnimation, Body, " + this._getRandomSprite())
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

SpawnPoint = MapEntity.extend(
{
	Width : 1,
	Height : 1,
	Creatures : [],
	Sprites : ['grave'],

	initialize: function()
	{
		var entity = Crafty.e("2D, DOM, Body, SpawnPoint, " + this._getRandomSprite())
			.attr({z:2, TileWidth:this.Width, TileHeight:this.Height})
			.Spawns(this.Creatures);
		this.set({'entity' : entity });
	}
});