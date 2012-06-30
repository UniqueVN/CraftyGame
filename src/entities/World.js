function World()
{
	//////////////////////////////////////////////////////////////////////////////////////////
	// Member Variables
	//////////////////////////////////////////////////////////////////////////////////////////

	this.TileSize = gameContainer.conf.get("TILE_SIZE");
	this.MapWidth = gameContainer.conf.get("MAP_WIDTH");
	this.MapHeight = gameContainer.conf.get("MAP_HEIGHT");
	this.PhysicalWidth = this.TileSize * this.MapWidth;
	this.PhysicalHeight = this.TileSize * this.MapHeight;

	this._staticEntities = [];
	this._terrainMap = [];

	//////////////////////////////////////////////////////////////////////////////////////////
	// Functions
	//////////////////////////////////////////////////////////////////////////////////////////

	this.InitMapData = function()
	{
		for (var i = 0; i < this.MapWidth; i++)
			this._terrainMap[i] = [];
	};

	this.AddStaticEntity = function(entity)
	{
		var staticEntityInfo =
		{
			Id : this._staticEntities.length,
			Entity : entity,
			Bounds : entity.GetBounds()
		}
		this._staticEntities.push(staticEntityInfo);

		for (var i = 0; i < staticEntityInfo.Bounds.length; i++)
		{
			var pos = staticEntityInfo.Bounds[i];
			this._terrainMap[pos.X][pos.Y] = entity;
		}
	};

	//////////////////////////////////////////////////////////////////////////////////////////
	// Initialization
	//////////////////////////////////////////////////////////////////////////////////////////

	this.InitMapData();

	this.TileMap = Crafty.e("2D, Canvas, TileMap")
		.attr({x: 0, y: 0, z: 0, w:this.PhysicalWidth, h:this.PhysicalHeight, World : this})
		.randomGenerate(this.MapWidth, this.MapHeight, this.TileSize);

	return this;
}