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
		Sprites: ["water0", "water1", "water2", "water3",
				  "waterEdge1", "waterEdge2", "waterEdge4", "waterEdge8",
				  "waterEdge12", "waterEdge15", "waterEdge18", "waterEdge21",
				  "waterEdge9", "waterEdge5", "waterEdge10", "waterEdge6",
				  "waterHole0", "waterHole1"
				  ]
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
	},

	GetSprite : function(index)
	{
		return this._entities[index];
	},

	GetSpriteByName : function(name)
	{
		for (var i = this._entities.length - 1; i >= 0; i--) {
			if (this._entities[i].name === name) {
				return this._entities[i];
			}
		};

		debug.log("CAN'T FIND SPRITE NAME: " + name);
		return this._entities[0];
	}
});

var TerrainManager = Class(
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
				terrain._entities[i].name = terrainDef.Sprites[i];
			}
			this[terrainName] = terrain;
		}
	}
});



