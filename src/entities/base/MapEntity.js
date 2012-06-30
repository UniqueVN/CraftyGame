MapEntity = BaseEntity.extend(
{
	Width : 1,
	Height : 1,
	Sprites : ['bush1'],

	initialize: function()
	{
		var sprite = "";
		if (this.Sprites.length > 0)
			sprite = this.Sprites[Crafty.math.randomInt(0, this.Sprites.length - 1)];

		var entity = Crafty.e("2D, Body, DOM, SpriteAnimation, " + sprite)
			.attr({z:2, TileWidth:this.Width, TileHeight:this.Height});
		this.set({'entity' : entity });
	},

	Appear: function(world, x, y)
	{
		this.getEntity().Appear(world, x, y);
	}
});