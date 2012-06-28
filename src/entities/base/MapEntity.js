MapEntity = BaseEntity.extend(
{
	default :
	{
		Width : 1,
		Height : 1
	},

	initialize: function()
	{

	},

	Create: function(map, x, y)
	{
		this.X = x;
		this.Y = y;
		this.Map = map;

		Crafty.e("2D, DOM, solid, SpriteAnimation, flower")//TODO: hard for now!!
			//.attr({x: j * this._tileSize, y: i * this._tileSize, z:2, w: this._tileSize, h:this._tileSize})
			.attr({x: this.X * this.Map._tileSize, y: this.Y * this.Map._tileSize, z:2, w:16, h:16})
			.animate("wind", 0, 1, 3)
			.animate("wind", 80, -1);
	}

});