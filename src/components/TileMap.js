Crafty.c('TileMap', {
	_tiles: [],
	_row: 0,
	_col: 0,
	_tileSize: 1,
	_terrains : [ 'water', 'sand', 'dirt', 'grass', 'fence', 'rock', 'flower', 'cherryTree', 'deadTree', 'bush'],
	_tileSprite: [],
	_width: 0,
	_height: 0,
    _graphs: {},
    _graphLayout: null,
    _bufferWidth: 34,
    _bufferHeight: 36,
    _buffer: null,
    _miniMap: null,

    // TOP - DOWN - RIGHT - LEFT
    // TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT
	DIRECTION: [{x: 0, y: -1}, {x: 0, y: 1}, {x: 1, y: 0}, {x: -1, y: 0},
			    {x: -1, y: -1}, {x: 1, y: -1}, {x: -1, y: 1}, {x: 1, y: 1}],

    debugShowMap: function(tiles) {
        var debugStr = "";
        for (var i = 0; i < tiles.length; i++) {
            for (var j = 0; j < tiles[i].length; j++) {
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
			this._tiles[i0][j].push(this.terrains[1].GetGroundSprite());
			this._tiles[i0][j].push(this.terrains[3].GetSpriteByName("grassEdge1"));
			this.cells[j][i0] = 1;
		}

    	// Generate beach sand
		for (var i = i0 + 1; i < i1; i++) {
			for (var j = 0; j < this._col; j++) {
				this._tiles[i][j].push(this.terrains[1].GetGroundSprite());
				this.cells[j][i] = 1;
			}
		}

    	// Generate sand border
		for (var j = 0; j < this._col; j++) {
			// this._tiles[i1][j].push(this.terrains[1].GetGroundSprite());
			// this._tiles[i1][j].push(this.terrains[0].GetSpriteByName("waterEdge2"));
			this._tiles[i1][j].push(this.terrains[0].GetGroundSprite());
			this._tiles[i1][j].push(this.terrains[1].GetSpriteByName("sandEdge1"));
			this.cells[j][i1] = 1;
		}

    	// Generate water
		for (var i = i1 + 1; i < this._row; i++) {
			for (var j = 0; j < this._col; j++) {
				this._tiles[i][j].push(this.terrains[0].GetGroundSprite());
				this.cells[j][i] = 0;
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

        var GRAPH_SCALE = 45;
        var GRAPH_OFFSET_X = 25;
        var GRAPH_OFFSET_Y = 25;
        var NODE_SIZE = 12;
        var TREE_NODE_SIZE = 8;
        var LEAF_NODE_SIZE = 18;
        var ROOT_NODE_SIZE = 16;
        var LINE_WIDTH = 2;
        var NODE_COUNT = 12;
        var BEACH_SIZE = 8;

        var pixelRenderer = new PixelRenderer("", this._col, this._row);
        // var pixelRenderer = new PixelRenderer("", this._col, this._row - WATER_PATCH - BEACH_PATCH);
        
        // var graph = new BinaryTree();
        // graph.generateGraph(NODE_COUNT);
        var graph = new Tree();
        graph.generateGraph(NODE_COUNT, 4, 2);
        // graph.debug();

        this._graphs = graph;
        
        // graphLayout = new HVLayout(graph, NODE_SIZE);
        // var graphLayout = new RecursiveWindingLayout(graph, 1);
        var graphLayout = new GridLayout(graph, 1);
        graphLayout.createLayout();

        var graphRenderer = new TreeRenderer(pixelRenderer);
        graphRenderer.nodeSize = TREE_NODE_SIZE;
        graphRenderer.leafSize = LEAF_NODE_SIZE;
        graphRenderer.rootSize = ROOT_NODE_SIZE;
        // var graphRenderer = new GraphRenderer(pixelRenderer);
        // graphRenderer.nodeSize = NODE_SIZE;
        graphRenderer.scale = GRAPH_SCALE;
        graphRenderer.offsetX = GRAPH_OFFSET_X;
        graphRenderer.offsetY = GRAPH_OFFSET_Y;
        graphRenderer.lineColor = 2;
        graphRenderer.lineWidth = 3;
        graphRenderer.setGraph(graph);

        this._graphRenderer = graphRenderer;

        // Initialize the tiles
		for (var i = 0; i < this._row; i++) {
			this._tiles[i] = [];
			for (var j = 0; j < this._col; j++) {
				this._tiles[i][j] = [];
			}
		}

		this._trees = [];
		for (var i = 0; i < this._row; i++) {
			this._trees[i] = [];
			for (var j = 0; j < this._col; j++) {
				this._trees[i][j] = -1;
			}
		}

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

        this.cells = pixelRenderer.cells;
        var cells = this.cells;
        this.generateBorder(cells);

        var t = 0;
        for (var i = 1; i < graphRenderer.nodes.length; i++) {
			var nodeCenter = graphRenderer.nodes[i];
			if (nodeCenter.y > graphRenderer.nodes[t].y)
				t = i;
        }
        // Generate a beach under the last ground tiles
        var beachStart = graphRenderer.nodes[t].y + NODE_SIZE + 2;
        // for (var i = cells.length - 1; i >= beachStart; i--) {
        // 	var bEmpty = true;
        // 	for (var j = cells[i].length - 1; j >= 0; j--) {
        // 		if (cells[i][j] !== 0) {
        // 			bEmpty = false;
        // 			break;
        // 		}
        // 	};

        // 	if (bEmpty) {
        // 		beachStart = i;
        // 	}
        // };
        this.generateBeach(beachStart, BEACH_SIZE);

        var bShowTrees = gameContainer.conf.get("SHOW_TREES");

		// Paint tiles
		for (var i = 0; i < beachStart; i++){
			for (var j = 0; j < this._col; j++){
                var cellType = cells[j][i];
                if (cellType >= 0) {
                	// If it's a forest tile => add tree
                	if (cellType === 0) {
                		cellType = 3;
                		cells[j][i] = 3;
                	}

					this._tiles[i][j].push(this.terrains[cellType].GetGroundSprite());
                	if (cellType === 3) {
                		// Add a flower at a random forest tile
		            	var t = Crafty.math.randomInt(0, 101);
                		if (t > 95)
							this._tiles[i][j].push(this.terrains[6].GetRandomSprite());

                		if (bShowTrees) {
		            		t = Crafty.math.randomInt(0, 101);
		            		if (t > 95) {
		            			// TODO: Must implement a tree renderer
		            			// HACK: choose a random tree and add it to the right tile
		            			// Compute the top-left corner of the tree
		            			// var i0 = Math.max(i - 2, 0);
		            			// var j0 = Math.max(j - 3, 0);
		            			// this._tiles[i0][j0].push(this.terrains[7].GetRandomSprite());
		            			this._trees[i][j] = Crafty.math.randomInt(0, 1);
		            		}
		            		else {
		            			this._trees[i][j] = -1;	
		            		}
                		}
                	}
                }
                else {
                	cellType = -cellType;
                	this._tiles[i][j].push(this.terrains[2].GetGroundSprite());
                	this._tiles[i][j].push(this.terrains[3].GetSpriteByName("grassEdge" + cellType));
                	// Add a flower at the border
                	this._tiles[i][j].push(this.terrains[6].GetRandomSprite());

                	this.cells[j][i] = 2;
                }
			}
		}

		this.setupRegions();

		this._width = this._tileSize * this._col;
		this._height = this._tileSize * this._row;

		this.createBufferCanvas();
		
		this.ready = true;
		return this;
	},

	setupRegions: function() {
		var graphRenderer = this._graphRenderer;

        // Add regions & spawn points
		var regions = [];
        for (var i = 0; i < graphRenderer.nodes.length; i++) {
			var node = graphRenderer.graph.nodes[i];
			var nodeType = node.isRoot() ? RegionTypes.Base : 
											(node.isLeaf() ? RegionTypes.Nest: RegionTypes.Neutral);
			var nodeCenter = graphRenderer.nodes[i];

			regions[i] = this.World.AddRegion(this, i, nodeType, nodeCenter);

			if (nodeType === RegionTypes.Neutral)
				this.CreateObject(TowerBase, nodeCenter.x, nodeCenter.y);
			else if (nodeType === RegionTypes.Base)
				this.World.AddSpawnPoint(nodeCenter);
		}

		// Link regions
		for (var i = 0; i < graphRenderer.nodes.length; i++) {
			var thisRegion = regions[i];
			var node = graphRenderer.graph.nodes[i];
			for (var linkIdx = 0; linkIdx < node.links.length; linkIdx++)
			{
				var otherIdx = node.links[linkIdx].id;
				thisRegion.AddNeighbour(regions[otherIdx]);
			}
        }
	},

	createBufferCanvas: function() {
		if (!this._buffer)
			this._buffer = new TileMapBuffer(this, this._bufferHeight, this._bufferWidth);
		this._buffer.updateViewport();
		this._treeManager = new TreeManager();
		// debug.log("createBufferCanvas: " + this.buffer + " context: " + this.bufferContext);

		// var miniMapWidth = gameContainer.conf.get("MINI_MAP_WIDTH");
		// var miniMapHeight = gameContainer.conf.get("MINI_MAP_HEIGHT");
		// this._miniMap = new MiniMap(this.cells, this._tileSize, 2, miniMapWidth, miniMapHeight);
		// this._miniMap.x = gameContainer.conf.get("MINI_MAP_X");
		// this._miniMap.y = gameContainer.conf.get("MINI_MAP_Y");
	},

	drawTrees: function(context) {
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

				var treeID = this._trees[i][j];
				if (treeID >= 0) {
					this._treeManager.draw(context, treeID, tx, ty);
				}
			}
		}
	},

	init: function() {
		this.requires("2D, Canvas");
		this.__coord = [0, 0, 100, 100];
		
		var draw = function (e) {
			var co = e.co,
				pos = e.pos,
				context = e.ctx;

			this._buffer.updateViewport();
			this._buffer.draw(context);

			this.drawTrees(context);

			// this._miniMap.draw(context);
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

// ========================================================================================== //
// TILE MAP BUFFERS
var TileMapBuffer = Class({
	constructor: function(tileMap, row, col) {
		this.row = row;
		this.col = col;
		// Top-left of the buffer in the global map
		this.rowBegin = 0;
		this.colBegin = 0;

		this.tileMap = tileMap;

		var w = col * tileMap._tileSize;
		var h = row * tileMap._tileSize;
		this.width = w;
		this.height = h;

		this.curRenderer = null;
		this.tmpRenderer = null;
	},

	switchRenderer: function() {
		var tmp = this.curRenderer;
		this.curRenderer = this.tmpRenderer;
		this.tmpRenderer = tmp;
	},

	drawTile: function(tile, x, y, w, h) {
		this.curRenderer.context.drawImage(tile.img, //image element
						 tile.__coord[0], //x position on sprite
						 tile.__coord[1], //y position on sprite
						 w, //width on sprite
						 h, //height on sprite
						 x, //x position on canvas
						 y, //y position on canvas
						 w, //width on canvas
						 h //height on canvas
						 );
	},

	drawTileToCanvas: function(i, j, i0, j0) {
		var w = this.tileMap._tileSize;
		var h = this.tileMap._tileSize;
		var tx = (j - j0) * w;
		var ty = (i - i0) * h;

		var tiles = this.tileMap._tiles[i][j];
		var l = tiles.length;
		for (var i = 0; i < l; i++) {
			this.drawTile(tiles[i], tx, ty, w, h);
		}
	},

	updateViewport: function() {
		var minX = -Crafty.viewport.x;
		var minY = -Crafty.viewport.y;

		var tileMap = this.tileMap;
		var tileSize = tileMap._tileSize;

		var r0 = this.rowBegin;
		var r1 = Math.min(tileMap._row, r0 + this.row) - 1;
		var c0 = this.colBegin;
		var c1 = Math.min(tileMap._col, c0 + this.col) - 1;

		// Calculate the new region
		var i0 = Math.max(Math.floor(minY / tileSize), 0);
		var i1 = Math.min(tileMap._row, i0 + this.row) - 1;
		var j0 = Math.max(Math.floor(minX / tileSize), 0);
		var j1 = Math.min(tileMap._col, j0 + this.col) - 1;

		if (r0 === i0 && r1 === i1 && c0 === j0 && c1 === j1)
			return;

		if (this.curRenderer === null) {
			this.curRenderer = new Renderer(this.width, this.height);
			for (var i = i0; i <= i1; i++) {
				for (var j = j0; j <= j1; j++) {
					this.drawTileToCanvas(i, j, i0, j0);
				}
			}
		}
		// Copy the overlap region
		else {
			if (i0 <= r1 && j0 <= c1 && r0 <= i1 && c0 <= j1) {
				var x0 = Math.max(j0, c0);
				var y0 = Math.max(i0, r0);
				var x1 = Math.min(j1, c1);
				var y1 = Math.min(i1, r1);

				var srcX = (x0 - c0) * tileSize;
				var srcY = (y0 - r0) * tileSize;
				var destX = (x0 - j0) * tileSize;
				var destY = (y0 - i0) * tileSize;
				var w = (x1 - x0 + 1) * tileSize;
				var h = (y1 - y0 + 1) * tileSize;

				// Create a new Renderer and copy the overlap region to it
				if (!this.tmpRenderer)
					this.tmpRenderer = new Renderer(this.width, this.height);
				// var newRenderer = new Renderer(this.width, this.height);
				this.tmpRenderer.context.drawImage(this.curRenderer.canvas,
					srcX, srcY, w, h,
					destX, destY, w, h);

				this.switchRenderer();
			}

			// Find the overlap between old buffer and the new one
			// If the viewport move to the left then we need to update the left part
			if (i0 < r0) {
				r1 = r0 - 1;
				r0 = i0;
			}
			// Otherwise update the right part
			else {
				r0 = r1 + 1;
				r1 = i1;
			}
			// If the viewport move up then we need to update the up part
			if (j0 < c0) {
				c1 = c0 - 1;
				c0 = j0;
			}
			// Otherwise update the right part
			else {
				c0 = c1 + 1;
				c1 = j1;
			}

			// Draw the vertical patch
			for (var i = r0; i <= r1; i++) {
				for (var j = j0; j <= j1; j++) {
					this.drawTileToCanvas(i, j, i0, j0);
				}
			}

			// Draw the horizontal patchs
			for (var j = c0; j <= c1; j++) {
				for (var i = i0; i <= i1; i++) {
					this.drawTileToCanvas(i, j, i0, j0);
				}
			}
		}

		this.rowBegin = i0;
		this.colBegin = j0;
	},

	// Draw this buffer to a context
	draw: function(context) {
		var x = this.colBegin * this.tileMap._tileSize;
		var y = this.rowBegin * this.tileMap._tileSize;

		context.drawImage(this.curRenderer.canvas, x, y);
	}
});
