Rock = MapEntity.extend(
{
	Sprites : ['rock1', 'rock2']
});

Tree =  MapEntity.extend({
	Width : 1,
	Height : 1,

	initialize: function()
	{
		var tops  = ['treetop0', 'treetop1', 'treetop2', 'treetop3'];
		var trunks = ['treetrunk0', 'treetrunk1'];

		// Choose random tree's trunk & top
		var trunkIndex = Crafty.math.randomInt(0, 1);
		var topIndex = trunkIndex * 2 + Crafty.math.randomInt(0, 1);

		var entity = Crafty.e("2D, DOM, Body, " + trunks[trunkIndex])
			.attr({z:2, TileWidth:this.Width, TileHeight:this.Height});
		var topentity = Crafty.e("2D, DOM, Body, " + tops[topIndex])
			.attr({z:3, TileWidth:this.Width, TileHeight:this.Height});

		this.set({'entity' : entity });
		this.set({'topentity' : topentity });
	},

	Appear: function(world, x, y)
	{
		this.getEntity().Appear(world, x, y);
		this.get("topentity").Appear(world, x, y - 2);
		return this;
	},
});