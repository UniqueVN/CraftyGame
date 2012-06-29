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

	Create: function(map, entityName, x, y)
	{
		this.X = x;
		this.Y = y;
        this.name = entityName;
		this.Map = map;

		Crafty.e("2D, DOM, solid, SpriteAnimation, " + this.name)
			.attr({x: this.X * this.Map._tileSize, y: this.Y * this.Map._tileSize, z:2, w:this.Map._tileSize, h:this.Map._tileSize});
	}

});