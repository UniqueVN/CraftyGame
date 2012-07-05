Crafty.c('TileMap', {
	_tiles: [],
	_row: 0,
	_col: 0,
	_tileSize: 1,
	_tileNames:["grass1", "grass2", "grass3", "grass4", 
                "flower", 
                "bush1", "bush2", 
                "rock1", "rock2", 
                "dirt0", "dirt1", "dirt2", "dirt3",
                "water0", "water1", "water2", "water3"],
	_tileSprite: [],
	_tileType:[
        // EMPTY TILES
        [13, 16],
        // BORDER TILES
        [5, 6],
		// GROUND TILES
		[0, 3],
        // MISC TILES
        [9, 12],
        // OBJECT TILES
        [7, 8]
	],
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

        var pixelRenderer = new PixelRenderer("", this._row, this._col);
        
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
        graphRenderer.lineColor = 3;
        graphRenderer.lineWidth = 3;
        graphRenderer.setGraph(graph);

        var irregularShape = new ShapeGenerator();
        irregularShape.fillColor = 2;
        irregularShape.borderColor = 1;

        graphRenderer.nodeRenderer = irregularShape;
        
        graphRenderer.draw();

        var cells = pixelRenderer.cells;

        // Create sprites for tiles
        for (var i = 0; i < this._tileNames.length; i++) {
            this._tileSprite[i] = Crafty.e("2D, Canvas, " + this._tileNames[i]).attr({x:-100, y: -100, z:-1});
        }

		// Paint tiles
		for (var i = 0; i < this._row; i++){
			this._tiles[i] = [];
			for (var j = 0; j < this._col; j++){
                var cellType = cells[i][j];
				this._tiles[i][j] = Crafty.math.randomInt(this._tileType[cellType][0], this._tileType[cellType][1]);
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

	CreateObject : function(type, x, y)
	{
		return new type().Appear(this.World, x, y);
	}
});