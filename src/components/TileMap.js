Crafty.c('TileMap', {
	_tiles: [],
	_row: 0,
	_col: 0,
	_tileSize: 1,
	_terrains : [ 'water', 'sand', 'dirt', 'grass', 'rock', 'bush'],
	_tileSprite: [],

	_width: 0,
	_height: 0,
    _graphs: {},
    _graphLayout: null,

    // TOP - DOWN - RIGHT - LEFT
    // TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT
	DIRECTION: [{x: 0, y: -1}, {x: 0, y: 1}, {x: 1, y: 0}, {x: -1, y: 0},
			    {x: -1, y: -1}, {x: 1, y: -1}, {x: -1, y: 1}, {x: 1, y: 1}],

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

    generateBeach: function(beachStart, beachSize) {
    	var i0 = beachStart;
    	var i1 = i0 + beachSize;

    	// Generate grass border
		for (var j = 0; j < this._col; j++) {
			this._tiles[i0][j] = {
				transition: this.terrains[3].GetSpriteByName("grassEdge1"),
				baseTile: this.terrains[1].GetGroundSprite()
			};
		}

    	// Generate beach sand
		for (var i = i0 + 1; i < i1; i++) {
			for (var j = 0; j < this._col; j++) {
				this._tiles[i][j] = this.terrains[1].GetGroundSprite();
			}
		}

    	// Generate sand border
		for (var j = 0; j < this._col; j++) {
			this._tiles[i1][j] = {
				transition: this.terrains[0].GetSpriteByName("waterEdge2"),
				baseTile: this.terrains[1].GetGroundSprite()
			};
		}

    	// Generate beach sand
		for (var i = i1 + 1; i < this._row; i++) {
			for (var j = 0; j < this._col; j++) {
				this._tiles[i][j] = this.terrains[0].GetGroundSprite();
			}
		}
    },

    generateBorder: function(cells) {
        // Generate real border
        // Check direct neighbor
        for (var i = 0; i < this._col; i++) {
        	for (var j = 0; j < this._row; j++) {
        		if (cells[i][j] > 0) {
        			for (var d = 0; d < 4; d++) {
        				var x = i + this.DIRECTION[d].x;
        				var y = j + this.DIRECTION[d].y;

        				if (x < 0 || x >= this._col || y < 0 || y >= this._row ||
        					cells[x][y] > 0)
        					continue;

        				cells[x][y] -= (1 << d);
        			}
        		}
        	}
        }
        // Check corner neighbor
        for (var i = 0; i < this._col; i++) {
        	for (var j = 0; j < this._row; j++) {
        		if (cells[i][j] > 0) {
        			for (var d = 4; d < 8; d++) {
        				var x = i + this.DIRECTION[d].x;
        				var y = j + this.DIRECTION[d].y;

        				if (x < 0 || x >= this._col || y < 0 || y >= this._row ||
        					cells[x][y] !== 0)
        					continue;
        				cells[x][y] = -(d * 3);
        			}
        		}
        	}
        }

        return cells;
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
        var BEACH_SIZE = 8;

        var pixelRenderer = new PixelRenderer("", this._col, this._row);
        // var pixelRenderer = new PixelRenderer("", this._col, this._row - WATER_PATCH - BEACH_PATCH);
        
        var graph = new BinaryTree();
        graph.generateGraph(NODE_COUNT);
        // graph.debug();

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

        // Initialize the tiles
		for (var i = 0; i < this._row; i++)
			this._tiles[i] = [];

		// cache them for the speedy!
		this.terrains = [];
		for (var i = 0; i < this._terrains.length; i++)	{
			this.terrains[i] = this.World.TerrainManager[this._terrains[i]];
		}


        var irregularShape = new ShapeGenerator();
        irregularShape.fillColor = 2;
        irregularShape.borderColor = 2;
        // irregularShape.borderColor = 1;
        graphRenderer.nodeRenderer = irregularShape;
        graphRenderer.draw();

        var cells = pixelRenderer.cells;
        this.generateBorder(cells);

        var t = 0;
        for (var i = 1; i < graphRenderer.nodes.length; i++) {
			var nodeCenter = graphRenderer.nodes[i];
			if (nodeCenter.y > graphRenderer.nodes[t].y)
				t = i;
        }

        var beachStart = graphRenderer.nodes[t].y + NODE_SIZE + 2;
        this.generateBeach(beachStart, BEACH_SIZE);

        var bShowTrees = gameContainer.conf.get("SHOW_TREES");
        var bShowRocks = gameContainer.conf.get("SHOW_ROCKS");

		// Paint tiles
		for (var i = 0; i < beachStart; i++){
			for (var j = 0; j < this._col; j++){
                var cellType = cells[j][i];
                if (cellType >= 0) {
                	// If it's a forest tile => add tree
                	if (cellType == 0) {
                		cellType = 3;
                		if (bShowTrees) {
		            		var t = Crafty.math.randomInt(0, 101);
		            		if (t > 100)
		            			this.CreateObject(Tree, j, i);
                		}
                	}
					this._tiles[i][j] = this.terrains[cellType].GetGroundSprite();
                }
                else {
                	// Add a rock at the border
                	if (bShowRocks)
                		this.CreateObject(Rock, j, i);
                	cellType = -cellType;
                	this._tiles[i][j] = { 
                		transition : this.terrains[3].GetSpriteByName("grassEdge" + cellType),
                		// HACK: Set a base tile
                		baseTile: this.terrains[2].GetGroundSprite(0)
                	};
                }
			}
		}

        // Add regions & spawn points
		var regions = [];
        for (var i = 0; i < graphRenderer.nodes.length; i++) {
			var nodeCenter = graphRenderer.nodes[i];
			regions[i] = this.World.AddRegion(nodeCenter.x, nodeCenter.y);
			this.World.AddSpawnPoint(graphRenderer.nodes[i]);
		}

		// Link regions
		for (var i = 0; i < graphRenderer.nodes.length; i++) {
			var thisRegion = regions[i];
			var node = graphRenderer.graph.nodes[i];
			thisRegion.Type = i == 0 ? RegionTypes.Temple : (node.isLeaf() ? RegionTypes.Nest : RegionTypes.Neutral);
			for (var linkIdx = 0; linkIdx < node.links.length; linkIdx++)
			{
				var otherIdx = node.links[linkIdx].id;
				thisRegion.AddNeighbour(regions[otherIdx]);
			}
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