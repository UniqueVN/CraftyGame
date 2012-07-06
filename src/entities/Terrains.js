var TerrainDefinitions =
{
	Grass :
	{
		Sprites: ["grass1", "grass2", "grass3", "grass4"]
	},

	Flower :
	{
		Sprites: ["flower"]
	},

	Bush :
	{
		Sprites: ["bush1", "bush2"]
	},
	Rock :
	{
		Sprites: ["rock1", "rock2"]
	},
	Dirt :
	{
		Sprites: ["dirt0", "dirt1", "dirt2", "dirt3"]
	},
	Water :
	{
		Sprites: ["water0", "water1", "water2", "water3"]
	}
};

var Terrain = Class(
{
	constructor : function()
	{
		this._entities = [];
	},

	GetRandomSprite : function()
	{
		return this._entities[Crafty.math.randomInt(0, this._entities.length - 1)];
	}
});

var Terrains = Class(
{
	constructor : function()
	{
		for (var terrainName in TerrainDefinitions)
		{
			var terrainDef = TerrainDefinitions[terrainName];
			var terrain = new Terrain();

			var numSprites = terrainDef.Sprites.length;
			for (var i = 0; i < numSprites; i++)
			{
				terrain._entities[i] = Crafty.e("2D, " + terrainDef.Sprites[i]);
			}
			this[terrainName] = terrain;
		}
	}
});



