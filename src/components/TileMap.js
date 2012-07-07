Crafty.c('TileMap', {
	_tiles: [],
	_row: 0,
	_col: 0,
	_tileSize: 1,
	_terrains : [ 'Water', 'Bush', 'Dirt', 'Grass', 'Rock' ],
	_tileSprite: [],

	_width: 0,
	_height: 0,
    _graphs: {},
    _graphLayout: null,

    debugShowMap: function(tiles) {
        var debugStr = "";
        for (var i = 0; i < tiles.length; i++)
        {
            for (var j = 0; j < tiles[i].length; j++)
            {
                debugStr += tiles[i][j];
            }
            debugStr += "\n";
        }

        console.log(debugStr);
    },

    swap: function(p0, p1) {
        var tmp;
        tmp = p0.x; p0.x = p1.x; p1.x = tmp;
        tmp = p0.y; p0.y = p1.y; p1.y = tmp;
    },

	randomGenerate: function(col, row, tileSize) {
		this._row = row;
		this._col = col;
		this._tileSize = tileSize;

        var GRAPH_SCALE = 42;
        var GRAPH_OFFSET_X = 25;
        var GRAPH_OFFSET_Y = 25;
        var NODE_SIZE = 20;
        var LINE_WIDTH = 2;
        var NODE_COUNT = 12;

        var pixelRenderer = new PixelRenderer("", this._col, this._row);
        
        var graph = new BinaryTree();
        graph.generateGraph(NODE_COUNT);
        graph.debug();

        this._graphs = graph;
        
        // graphLayout = new HVLayout(graph, NODE_SIZE);
        var graphLayout = new RecursiveWindingLayout(graph, 1);
        graphLayout.createLayout();

        var graphRenderer = new GraphRenderer(pixelRenderer);
        graphRenderer.scale = GRAPH_SCALE;
        graphRenderer.offsetX = GRAPH_OFFSET_X;
        graphRenderer.offsetY = GRAPH_OFFSET_Y;
        graphRenderer.nodeSize = NODE_SIZE;
        graphRenderer.lineColor = 2;
        graphRenderer.lineWidth = 3;
        graphRenderer.setGraph(graph);

        var irregularShape = new ShapeGenerator();
        irregularShape.fillColor = 2;
        irregularShape.borderColor = 2;
        // irregularShape.borderColor = 1;
        graphRenderer.nodeRenderer = irregularShape;
        graphRenderer.draw();

        // TOP - DOWN - RIGHT - LEFT
        // TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT
		var DIRECTION = [{x: 0, y: -1}, {x: 0, y: 1}, {x: 1, y: 0}, {x: -1, y: 0},
						 {x: -1, y: -1}, {x: 1, y: -1}, {x: -1, y: 1}, {x: 1, y: 1}];

        var cells = pixelRenderer.cells;
        // Generate real border
        // Check direct neighbor
        for (var i = 0; i < this._col; i++) {
        	for (var j = 0; j < this._row; j++) {
        		if (cells[i][j] > 0) {
        			for (var d = 0; d < 4; d++) {
        				var x = i + DIRECTION[d].x;
        				var y = j + DIRECTION[d].y;

        				if (x < 0 || x >= this._col || y < 0 || y >= this._row ||
        					cells[x][y] > 0)
        					continue;

        				// var c = Math.abs(cells[x][y]);

        				cells[x][y] -= (1 << d);
        				//if (cells[x][y] === 0)
        			}
        		}
        	}
        }
        // Check corner neighbor
        for (var i = 0; i < this._col; i++) {
        	for (var j = 0; j < this._row; j++) {
        		if (cells[i][j] > 0) {
        			for (var d = 4; d < 8; d++) {
        				var x = i + DIRECTION[d].x;
        				var y = j + DIRECTION[d].y;

        				if (x < 0 || x >= this._col || y < 0 || y >= this._row ||
        					cells[x][y] !== 0)
        					continue;
        				cells[x][y] = -(d * 3);
        			}
        		}
        	}
        }

		// cache them for the speedy!
		var terrains = [];
		for (var i = 0; i < this._terrains.length; i++)
		{
			terrains[i] = this.World.TerrainManager[this._terrains[i]];
		}

		// Paint tiles
		for (var i = 0; i < this._row; i++){
			this._tiles[i] = [];
			for (var j = 0; j < this._col; j++){
                var cellType = cells[j][i];
                if (cellType >= 0) {
					// this._tiles[i][j] = terrains[cellType].GetRandomSprite();
					this._tiles[i][j] = terrains[cellType].GetSprite(0);
                }
                else
                {
                	cellType = -cellType;
                	this._tiles[i][j] = { transition : terrains[0].GetSpriteByName("waterEdge" + cellType)};
                	// HACK: Set a base tile
                	this._tiles[i][j].baseTile = terrains[2].GetSprite(0);
                }
			}
		}

        // Add spawn points
        for (var i = 0; i < graphRenderer.nodes.length - 1; i++) {
            this.World.AddSpawnPoint(graphRenderer.nodes[i]);
        }

		this._width = this._tileSize * this._col;
		this._height = this._tileSize * this._row;
		
		this.ready = true;
		return this;
	},

	drawTile: function(tileEvent, tile, x, y, w, h) {
		tileEvent.co.x = tile.__coord[0];
		tileEvent.co.y = tile.__coord[1];
		tileEvent.co.w = tile.__coord[2];
		tileEvent.co.h = tile.__coord[3];
		tileEvent.pos._x = x;
		tileEvent.pos._y = y;
		tileEvent.pos._w = w;
		tileEvent.pos._h = h;
		tile.trigger("Draw", tileEvent);
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
			
			for (var i = i0; i <= i1; i++){
				for (var j = j0; j <= j1; j++){
					
					tx = j * w;
					ty = i * h;

					var tile = this._tiles[i][j];
					if (tile.baseTile)
					{
						this.drawTile(tileEvent, tile.baseTile, tx, ty, w, h);
						this.drawTile(tileEvent, tile.transition, tx, ty, w, h);
					}
					else
					{
						this.drawTile(tileEvent, tile, tx, ty, w, h);
					}
					//console.log("Drawing tile: ", tile);
				}
			}
		};

		this.bind("Draw", draw).bind("RemoveComponent", function (id) {
			if (id === "TileMap") this.unbind("Draw", draw);
		});
	},

	CreateObject : function(type, x, y)
	{
		return new type().Appear(this.World, x, y);
	}
});