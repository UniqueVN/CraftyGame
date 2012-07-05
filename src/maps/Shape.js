// ========================================================================================== //
// MISC
function random(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}
// ========================================================================================== //
// PIXELATED RENDERER
var PixelRenderer = Class({
	// $statics: {
	// 	EMPTY_PIXEL: "",
	// 	COLOR_PIXEL: ""
	// },

	constructor: function(canvasID, width, height) {
		this.canvas = document.getElementById(canvasID);
		if (this.canvas)
			this.context = this.canvas.getContext('2d');
		this.cellsize = 1;
		this.color = 1;

		// Generate the grid and cells inside it
		this.setSize(width, height);
	},

	setColor: function(color) {
		if (color === undefined || color === this.color)
			return;

		this.color = color;
	},

	setLineWidth: function(lineWidth) {
		if (!lineWidth || lineWidth === this.lineWidth)
			return;

		this.lineWidth = lineWidth;
	},

	setSize: function(width, height) {
		if (this.width === width && this.height === height)
			return;
		this.width = width;
		this.height = height;

		this.cells = [];
		for (var i = 0; i < this.width; i++) {
			this.cells.push([]);
			for (var j = 0; j < this.height; j++) {
				this.cells[i].push(0);
			};
		};
	},

	clear: function() {
		for (var i = this.width - 1; i >= 0; i--) {
			for (var j = this.height - 1; j >= 0; j--) {
				this.cells[i][j] = 0;
			}
		};
	},

	plot: function(x0, y0) {
		if (x0 < 0 || x0 >= this.width ||
			y0 < 0 || y0 >= this.height)
			return;

		this.cells[x0][y0] = this.color;

		if (this.lineWidth > 1) {
			var d = this.lineWidth / 2;
			for (var x = 0; x < d; x++) {
				for (var y = 0; y < d; y++) {
					this.cells[x0 + x][y0 + y] = this.color;
					this.cells[x0 + x][y0 - y] = this.color;
					this.cells[x0 - x][y0 - y] = this.color;
					this.cells[x0 - x][y0 - y] = this.color;
				}
			}
		}
	},

	drawLine: function(p0, p1, color, lineWidth) {
		this.setColor(color);
		this.setLineWidth(lineWidth);

		var x0 = p0.x, y0 = p0.y, x1 = p1.x, y1 = p1.y;
		var dx = x1 - x0,
			dy = y1 - y0;

		var sx = (dx > 0 ? 1 : -1);
		var sy = (dy > 0 ? 1 : -1);

		dx = Math.abs(dx);
		dy = Math.abs(dy);
		var err = dx - dy;
		this.plot(x0, y0);
		// this.drawCircle(x0, y0, this.lineWidth / 2);

		while (x0 !== x1 || y0 !== y1) {
			var e2 = err * 2;
			if (e2 > -dy) {
				err -= dy;
				x0 += sx;
			}
			if (e2 < dx) {
				err += dx;
				y0 += sy;
			}
			this.plot(x0, y0);
			// this.drawCircle(x0, y0, this.lineWidth / 2);
		}
	},

	drawPath: function(points, bClose, color, lineWidth) {
		if (points.length < 2)
			return;
			
		this.setColor(color);
		this.setLineWidth(lineWidth);

		var pointCount = points.length - 1;
		for (var i = 0; i < pointCount; i++){
			this.drawLine(points[i], points[i + 1]);
		}
		if (bClose){
			this.drawLine(points[pointCount], points[0]);
		}		
	},

	drawRectangle: function(x0, y0, width, height, color, lineWidth) {
		this.setColor(color);
		this.setLineWidth(lineWidth);

		for (var x = x0; x < x0 + width; x++) {
			for (var y = y0; y < y0 + height; y++) {
				this.plot(x, y);
			}
		}
	},

	drawCircle: function(x0, y0, r) {
		if (r <= 0)
			return;

		// var x = -r,
		// 	y = 0,
		// 	r0 = r;
		// 	err = 2 - 2 * r;

		// while (x < 0)
		// {
		// 	// Draw the border
		// 	this.plot(x0 - x, y0 + y);
		// 	this.plot(x0 - y, y0 - x);
		// 	this.plot(x0 + x, y0 - y);
		// 	this.plot(x0 + y, y0 + x);

		// 	// Fill in
		// 	// for (var x1 = ; x1)

		// 	r0 = err;
		// 	if (r0 <= y) {
		// 		y++;
		// 		err += y * 2 + 1;
		// 	}
		// 	if (r0 > x || err > y) {
		// 		x++;
		// 		err += x * 2 + 1;
		// 	}
		// }

		var x = r,
			y = 0,
			err = -r;

		while (x > y) {
			this.plot(x0 + x, y0 + y);
			this.plot(x0 - x, y0 + y);
			this.plot(x0 + x, y0 - y);
			this.plot(x0 - x, y0 - y);
			this.plot(x0 + y, y0 + x);
			this.plot(x0 - y, y0 + x);
			this.plot(x0 + y, y0 - x);
			this.plot(x0 - y, y0 - x);

			// Fill in
			this.drawLine({x: x0 + x, y: y0 - y}, {x: x0 + x, y: y0 + y});
			this.drawLine({x: x0 - x, y: y0 - y}, {x: x0 - x, y: y0 + y});
			this.drawLine({x: x0 + y, y: y0 - x}, {x: x0 + y, y: y0 + x});
			this.drawLine({x: x0 - y, y: y0 - x}, {x: x0 - y, y: y0 + x});

			y++;
			err += 2 * y - 1;
			if (err >= 0) {
				x--;
				err -= 2 * x + 1;
			}
		}
	}
});

// ========================================================================================== //
// SHAPES GENERATOR
var ShapeGenerator = Class(PixelRenderer, {
	constructor: function(width, height) {
		ShapeGenerator.$super.call(this, "", width, height);

		this.fillColor = 2;
		this.borderColor = 1;
	},

    generate: function(col, row){
        // tht062812: generate random points in the 4 border parts and connect them
        // http://roguebasin.roguelikedevelopment.org/index.php/Irregular_Shaped_Rooms
        var maxPointPerBorder = 4;
        // Get the patch as 10% of the boundary
        var patch = Math.floor(0.2 * Math.min(col, row));
        var points = [];
        var maxCol = col - 1,
            maxRow = row - 1;

        this.clear();
        var cells = this.cells;

        // Generate top border
        var c = patch,
            r = 0,
            t = 0;
        while (c < maxCol && t < maxPointPerBorder)
        {
            // select a random column between the last column and the max column
            c = random(c + 1, maxCol);
            // select a random row in the patch
            r = random(0, patch - 1);
            points.push({x: c, y: r});
            t++;
        }
        // Generate right border
        r = patch;
        t = 0;
        while (r < maxRow && t < maxPointPerBorder)
        {
            // select a random row between the last row and the max row
            r = random(r + 1, maxRow);
            // select a random row in the patch
            c = random(1, patch) + col - patch - 1;
            points.push({x: c, y: r});
            t++;
        }
        // Generate bottom border
        c = maxCol;
        t = 0;
        while (c > patch && t < maxPointPerBorder)
        {
            // select a random column between the last column and the min column
            c = random(patch, c - 1);
            // select a random row in the patch
            r = random(1, patch) + row - patch - 1;
            points.push({x: c, y: r});
            t++;
        }
        // Generate left border
        r = maxRow;
        t = 0;
        while (r > patch && t < maxPointPerBorder)
        {
            // select a random row between the last row and the min row
            r = random(patch, r - 1);
            // select a random row in the patch
            c = random(0, patch - 1);
            points.push({x: c, y: r});
            t++;
        }

        this.setColor(this.borderColor);
        // Generate border lines
        this.drawPath(points, true);

        this.setColor(this.fillColor);
        this.fillShape();
    },

    fillShape: function() {
        var dir = [{x:0, y:1}, {x:0, y:-1}, {x:1, y:0}, {x:-1, y:0}];
        var cells = this.cells;
        var col = cells.length;
        var row = cells[0].length;

        // Start from the center of the region
        var x0 = col / 2;
        var y0 = row / 2;

        var stack = [];
        stack.push({x: x0, y: y0});
        this.plot(x0, y0);
        // Depth first search
        while (stack.length > 0)
        {
            var cell = stack.pop();

            for (var i = 0; i < dir.length; i++)
            {
                var x1 = cell.x + dir[i].x;
                var y1 = cell.y + dir[i].y;
                if (x1 >= 0 && x1 < row && y1 >= 0 && y1 < col)
                {
                    if (cells[x1][y1] === 0)
                    {
                        this.plot(x1, y1);
                        stack.push({x:x1, y:y1});
                    }
                }
            }
        }
    },

    draw: function(renderer, x0, y0, width, height) {
    	height = (height === undefined ? width : height);
    	this.setSize(width, height);
    	this.generate(width, height);

    	renderer.setLineWidth(1);

    	for (var x = 0; x < this.width; x++) {
    		for (var y = 0; y < this.height; y++) {
    			if (this.cells[x][y] !== 0) {
    				renderer.setColor(this.cells[x][y]);
    				renderer.plot(x0 + x, y0 + y);
    			}
    		}
    	}
    }
});