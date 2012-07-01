Crafty.c('TileMap', {
	_tiles: [],
	_row: 0,
	_col: 0,
	_tileSize: 1,
	_tileNames:["grass1", "grass2", "grass3", "grass4", "flower", "bush1", "bush2", "rock1", "rock2", "dirt0", "dirt1", "dirt2", "dirt3"],
	_tileSprite: [],
	_tileType:[
		// GROUND TILES
		[0, 3],
		// WALL TILES
		[5, 6],
		// OBJECT TILES
		[7, 8],
        // MISC TILES
        [9, 12]
	],
	_width: 0,
	_height: 0,
    _graphs: [],
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

    plot: function(tiles, x, y, style, lineTile) {
        lineTile = lineTile | 1;
        
        if (!style)
        {
            tiles[y][x] = lineTile;
            return;
        }

        var x0 = x, y0 = y;
        if (style >= 2)
        {
            x0 = y; y0 = x;
            style -= 2;
        }

        if (style >= 1)
        {
            y0 = -y0;
            style = 0;
        }

        tiles[y0][x0] = lineTile;
    },

    drawLine: function(p0, p1, tiles, lineTile) {
        var x0 = p0.x,
            x1 = p1.x,
            y0 = p0.y,
            y1 = p1.y;
        var dx = x1 - x0;
        var dy = y1 - y0;
        var style = 0,
            D = 0;
        
        lineTile = lineTile | 1;

        this.plot(tiles, x0, y0, style);

        if (dx === 0) {
            D = (dy > 0 ? 1 : -1);
            var y = y0;
            while (y !== y1) {
                y += D;
                tiles[y][x0] = lineTile;
            }
            return;
        }
        if (dy === 0) {
            D = (dx > 0 ? 1 : -1);
            var x = x0;
            while (x !== x1) {
                x += D;
                tiles[y0][x] = lineTile;
            }
            return;
        }

        var tmp;
        if (dx < 0)
        {
            tmp = x0; x0 = x1; x1 = tmp;
            tmp = y0; y0 = y1; y1 = tmp;
            dx = -dx;
            dy = -dy;
        }

        if (dy < 0)
        {
            style += 1;
            dy = -dy;
            y0 = -y0;
            y1 = -y1;
        }

        if (dy > dx)
        {
            tmp = x0; x0 = y0; y0 = tmp;
            tmp = x1; x1 = y1; y1 = tmp;
            tmp = dx; dx = dy; dy = tmp;
            style += 2;
        }

        D = 2 * dy - dx;
        var x = x0,
            y = y0;
        for (x = x0 + 1; x <= x1; x++)
        {
            if (D > 0)
            {
                y++;
                D += 2 * (dy - dx);
            }
            else
            {
                D += 2 * dy;
            }
            this.plot(tiles, x, y, style, lineTile);
        }
    },

    fillRegion: function(tiles) {
//        var dx = [0, 0, 1, -1];
//        var dy = [1, -1, 0, 0];
        var dir = [{x:0, y:1}, {x:0, y:-1}, {x:1, y:0}, {x:-1, y:0}];
        var row = tiles.length;
        var col = tiles[0].length;

        // Start from the center of the region
        var x0 = row / 2;
        var y0 = row / 2;

        var stack = [];
        stack.push({x: x0, y: y0});
        tiles[x0][y0] = 2;
        // Breadth first search
        while (stack.length > 0)
        {
            var cell = stack.pop();

            for (var i = 0; i < dir.length; i++)
            {
                var x1 = cell.x + dir[i].x;
                var y1 = cell.y + dir[i].y;
                if (x1 >= 0 && x1 < row && y1 >= 0 && y1 < col)
                {
                    if (tiles[x1][y1] === 0)
                    {
                        tiles[x1][y1] = 2;
                        stack.push({x:x1, y:y1});
                    }
                }
            }
        }
    },
	
    generateRegion: function(col, row, patch){
        // tht062812: generate random points in the 4 border parts and connect them
        // http://roguebasin.roguelikedevelopment.org/index.php/Irregular_Shaped_Rooms
        var maxPointPerBorder = 5;
        var points = [];
        var maxCol = col - patch - 1,
            maxRow = row - patch - 1;

        // Create an empty maps
        var tiles = [];
        for (var i = 0; i < row; i++) {
            tiles[i] = [];
            for (var j = 0; j < col; j++) {
                tiles[i][j] = 0;
            }
        }

        // Generate top border
        var c = patch,
            r = 0,
            t = 0;
        while (c < maxCol && t < maxPointPerBorder)
        {
            // select a random column between the last column and the max column
            c = Crafty.math.randomInt(c + 1, maxCol);
            // select a random row in the patch
            r = Crafty.math.randomInt(0, patch - 1);
            points.push({x: c, y: r});
            t++;
        }
        // Generate right border
        r = patch;
        t = 0;
        while (r < maxRow && t < maxPointPerBorder)
        {
            // select a random row between the last row and the max row
            r = Crafty.math.randomInt(r + 1, maxRow);
            // select a random row in the patch
            c = Crafty.math.randomInt(1, patch) + col - patch - 1;
            points.push({x: c, y: r});
            t++;
        }
        // Generate bottom border
        c = maxCol;
        t = 0;
        while (c > patch && t < maxPointPerBorder)
        {
            // select a random column between the last column and the min column
            c = Crafty.math.randomInt(patch, c - 1);
            // select a random row in the patch
            r = Crafty.math.randomInt(1, patch) + row - patch - 1;
            points.push({x: c, y: r});
            t++;
        }
        // Generate left border
        r = maxRow;
        t = 0;
        while (r > patch && t < maxPointPerBorder)
        {
            // select a random row between the last row and the min row
            r = Crafty.math.randomInt(patch, r - 1);
            // select a random row in the patch
            c = Crafty.math.randomInt(0, patch - 1);
            points.push({x: c, y: r});
            t++;
        }

        // Generate border lines
        var borderPoints = [];
        for (var i = 0; i < points.length - 1; i++)
        {
            this.drawLine(points[i], points[i + 1], tiles);
        }
        this.drawLine(points[points.length - 1], points[0], tiles);

        this.fillRegion(tiles, patch);

//        this.debugShowMap(tiles);

        return tiles;
    },

    generateLayout: function(regionCount, row, col) {
        var mapTiles = [];
        for (var i = 0; i < row; i++) {
            mapTiles[i] = [];
            for (var j = 0; j < col; j++) {
                mapTiles[i][j] = 0;
            }
        }

        this._graphs = [];
        for (var i = 0; i < regionCount; i++) {
            this._graphs[i] = [];
        }
        for (var i = 0; i < regionCount; i++) {
            for (j = i + 1; j < regionCount; j++) {
            }
        }
    },

    addRegion: function(region, centerX, centerY) {
        var offsetX = centerX - region.length / 2;
        var offsetY = centerY - region[0].length / 2;
		
		if (offsetX < 0) offsetX = 0;
		if (offsetY < 0) offsetY = 0;

        console.log("AddRegion: centerX = " + centerX + " centerY = " + centerY +
                    " offsetX = " + offsetX + " offsetY = " + offsetY);

        for (var i = 0; i < region.length; i++) {
            for (var j = 0; j < region[i].length; j++) {
				if (region[i][j] === 1) {
//					tileID = Crafty.math.randomInt(this._tileType[2][0], this._tileType[2][1]);
//					this.CreateObject(MapEntity, this._tileNames[tileID], j + y0, i + x0);
					this._tiles[i + offsetY][j + offsetX] = Crafty.math.randomInt(this._tileType[1][0], this._tileType[1][1]);
				}
                else if (region[i][j] === 2) {
					this._tiles[i + offsetY][j + offsetX] = Crafty.math.randomInt(this._tileType[3][0], this._tileType[3][1]);
                }
            }
        }
    },
    
    processLayout: function() {
        console.log("LAYOUT IS DONE");
        
        var scale = 15;
        var offsetX = 10;
        var offsetY = 10;
		var regionW = 20;
		var regionH = 20;
        var patch = 2;
        
	   var currentBB = this._graphLayout.layout.getBoundingBox();
        
        var minX = this._width;
        var minY = this._height;
        
        var regionCenter = [];
        for (var i = 0; i < this._graphLayout.nodeCount; i++) {
            var centerX = this._graphLayout.layout.nodePoints[i].p.x - currentBB.bottomleft.x;
            var centerY = this._graphLayout.layout.nodePoints[i].p.y - currentBB.bottomleft.y;
            centerX = Math.floor(centerX * scale);
            centerY = Math.floor(centerY * scale);
            regionCenter[i] = {x: centerX, y: centerY};
            
            if (centerX - regionW / 2 < minX)
                minX = centerX - regionW / 2;
            if (centerY - regionH / 2 < minY)
                minY = centerY - regionH / 2;
        }

        for (var i = 0; i < this._graphLayout.nodeCount; i++) {
            regionCenter[i].x -= minX;
            regionCenter[i].y -= minY;
            
            if (regionCenter[i].x + regionW / 2 >= this._col)
                regionCenter[i].x = Math.floor(this._col - regionW / 2 - 1);
            if (regionCenter[i].y + regionH / 2 >= this._row)
                regionCenter[i].y = Math.floor(this._row - regionH / 2 - 1);
        }
        
        // Generate region for each node
        console.log("regionCenters: regionCenters.length = " + regionCenter.length, regionCenter);
        for (var i = 0; i < regionCenter.length; i++) {
            var patchRegion = this.generateRegion(regionW, regionH, patch);
            this.addRegion(patchRegion, regionCenter[i].x, regionCenter[i].y);
        }
		
        // Connect region based on edges info - Draw line connect center of regions
        var edges = this._graphLayout.graph.edges;
        for (var i = 0; i < edges.length; i++) {
            var p0 = edges[i].source.id;
            var p1 = edges[i].target.id;
            
            this.drawLine(regionCenter[p0], regionCenter[p1], this._tiles, 9);
        }
    },

	randomGenerate: function(col, row, tileSize) {
		this._row = row;
		this._col = col;
		this._tileSize = tileSize;

		// Generate gound tiles
		for (var i = 0; i < this._row; i++){
			this._tiles[i] = [];
			for (var j = 0; j < this._col; j++){
				this._tiles[i][j] = Crafty.math.randomInt(this._tileType[0][0], this._tileType[0][1]);
			}
		}
		
        var nodeCount = 7;
        var maxNeighbour = 3;
		var regionMapW = 9;
		var regionMapH = 6;

        this._graphLayout = Crafty.e("GraphLayout")
                    .generateGraph(nodeCount, maxNeighbour);
//                    .generateGraphLayout(regionMapW, regionMapH, regionW, regionH);
        this._graphLayout.generateGraphLayout(this.processLayout, this);
		var tileID = 0;
		
//        var patchRegion = this.generateRegion(30, 20);
//        this.addRegion(patchRegion, 20, 20);

		for (var i = 0; i < this._tileNames.length; i++) {
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