Crafty.c('TileMap', {
	_tiles: [],
	_row: 0,
	_col: 0,
	_tileSize: 1,
	_tileNames:["grass1", "grass2", "grass3", "grass4", "flower", "bush1", "bush2", "rock1", "rock2"],
	_tileSprite: [],
	_tileType:[
		// GROUND TILES
		[0, 3],
		// WALL TILES
		[5, 6],
		// OBJECT TILES
		[7, 8]
	],
	_width: 0,
	_height: 0,
	
	randomGenerate: function(col, row, tileSize) {
		this._row = row;
		this._col = col;
		this._tileSize = tileSize;
		
		// Generate gound tiles
		for (i = 0; i < this._row; i++){
			this._tiles[i] = [];
			for (j = 0; j < this._col; j++){
				//this._tiles[i][j] = Crafty.math.randomInt(0, this._tileNames.length - 1);
				this._tiles[i][j] = Crafty.math.randomInt(this._tileType[0][0], this._tileType[0][1]);
			}
		}
		
		var tileID = 0;
		
		// Generate border
		for (i = 1; i < this._row - 1; i++){
			tileID = Crafty.math.randomInt(this._tileType[1][0], this._tileType[1][1]);
			Crafty.e("2D, Canvas, solid, " + this._tileNames[tileID])
				.attr({x:0, y:i * this._tileSize, z:2, w:this._tileSize, h:this._tileSize});
			tileID = Crafty.math.randomInt(this._tileType[1][0], this._tileType[1][1]);
			Crafty.e("2D, Canvas, solid, " + this._tileNames[tileID])
				.attr({x:(this._col - 1) * this._tileSize, y:i * this._tileSize, z:2, w:this._tileSize, h:this._tileSize});
		}
		for (j = 0; j < this._col; j++){
			tileID = Crafty.math.randomInt(this._tileType[1][0], this._tileType[1][1]);
			Crafty.e("2D, Canvas, solid, " + this._tileNames[tileID])
				.attr({x: j * this._tileSize, y: 0, z: 2, w: this._tileSize, h:this._tileSize});
			tileID = Crafty.math.randomInt(this._tileType[1][0], this._tileType[1][1]);
			Crafty.e("2D, Canvas, solid, " + this._tileNames[tileID])
				.attr({x: j * this._tileSize, y: (this._row - 1) * this._tileSize, z: 2, w: this._tileSize, h:this._tileSize});
		}
		
		// Generate object
		for (i = 1; i < this._row - 1; i++)
		{
			for (j = 1; j < this._col - 1; j++)
			{
				var t = Crafty.math.randomInt(0, 50);
				if (t === 0)
				{
					tileID = Crafty.math.randomInt(this._tileType[2][0], this._tileType[2][1]);
					this.CreateObject(MapEntity, this._tileNames[tileID], j, i);
				}
			}
		}
		
		for (i = 0; i < this._tileNames.length; i++)
		{
			this._tileSprite[i] = Crafty.e("2D, Canvas, " + this._tileNames[i]).attr({x:-100, y: -100, z:-1});
		}
		
		this._width = this._tileSize * this._col;
		this._height = this._tileSize * this._row;
		
		this.ready = true;
		return this;
	},
	init: function() {
		this.requires("2D, Canvas");
		this.__coord = [0, 0, 100, 100];
		
		var draw = function (e) {
			var co = e.co,
				pos = e.pos,
				context = e.ctx;
				
			var tileEvent = { co: e.co, pos: e.pos, ctx: e.ctx};
			tileEvent.type = "canvas";
			
			var minX = -Crafty.viewport.x;
			var minY = -Crafty.viewport.y;
			var maxX = minX + Crafty.viewport.width;
			var maxY = minY + Crafty.viewport.height;
			
			var tx = 0,
				ty = 0,
				w = this._tileSize,
				h = this._tileSize;
				
			var i0 = Math.floor(minY / h);
			var i1 = Math.floor(maxY / h);
			var j0 = Math.floor(minX / w);
			var j1 = Math.floor(maxX / w);
			
			if (i0 < 0) i0 = 0;
			if (j0 < 0) j0 = 0;
			if (i1 > this._row - 1) i1 = this._row - 1;
			if (j1 > this._col - 1) j1 = this._col - 1;
			
			for (i = i0; i <= i1; i++){
				for (j = j0; j <= j1; j++){
					
					tx = j * w;
					ty = i * h;
					//var tile = Crafty.c(this._tileNames[this._tiles[i][j]]);
					var tile = this._tileSprite[this._tiles[i][j]];
					//console.log("Drawing tile: ", tile);

					tileEvent.co.x = tile.__coord[0];
					tileEvent.co.y = tile.__coord[1];
					tileEvent.co.w = tile.__coord[2];
					tileEvent.co.h = tile.__coord[3];
					tileEvent.pos._x = tx;
					tileEvent.pos._y = ty;
					tileEvent.pos._w = w;
					tileEvent.pos._h = h;
					tile.trigger("Draw", tileEvent);
				}
			}
		};

		this.bind("Draw", draw).bind("RemoveComponent", function (id) {
			if (id === "TileMap") this.unbind("Draw", draw);
		});
	},

	CreateObject : function(type, entityName, x, y)
	{
		var newObj = new type();
		newObj.Create(this, entityName, x, y);

		//TODO: update collision map
		//TODO: add to a list

		return newObj;
	}
});