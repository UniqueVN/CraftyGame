Crafty.c("TextEx", {
	_text: "",
	_textFont: null,
	ready: true,

	init: function () {
		this.requires("2D");

		this._textFont =
		{
			"type": "",
			"weight": "",
			"size": "",
			"family": ""
		};

		this.bind("Draw", function (e) {
			var font = this._textFont["type"] + ' ' + this._textFont["weight"] + ' ' +
				this._textFont["size"] + ' ' + this._textFont["family"];

			if (e.type === "DOM") {
				var el = this._element,
					style = el.style;

				style.color = this._textColor;
				style.font = font;
				el.innerHTML = this._text;
			} else if (e.type === "canvas") {
				var context = e.ctx,
					metrics = null;

				context.save();

				context.fillStyle = this._textColor || "rgb(0,0,0)";
				context.font = font;

				context.translate(this.x, this.y + this.h);
				context.fillText(this._text, 0, 0);

				metrics = context.measureText(this._text);
				this._w = Math.max(metrics.width, this._w);

				context.restore();
			}
		});
	},

	/**@
	 * #.text
	 * @comp Text
	 * @sign public this .text(String text)
	 * @sign public this .text(Function textgenerator)
	 * @param text - String of text that will be inserted into the DOM or Canvas element.
	 *
	 * This method will update the text inside the entity.
	 * If you use DOM, to modify the font, use the `.css` method inherited from the DOM component.
	 *
	 * If you need to reference attributes on the entity itself you can pass a function instead of a string.
	 *
	 * @example
	 * ~~~
	 * Crafty.e("2D, DOM, Text").attr({ x: 100, y: 100 }).text("Look at me!!");
	 *
	 * Crafty.e("2D, DOM, Text").attr({ x: 100, y: 100 })
	 *     .text(function () { return "My position is " + this._x });
	 *
	 * Crafty.e("2D, Canvas, Text").attr({ x: 100, y: 100 }).text("Look at me!!");
	 *
	 * Crafty.e("2D, Canvas, Text").attr({ x: 100, y: 100 })
	 *     .text(function () { return "My position is " + this._x });
	 * ~~~
	 */
	text: function (text) {
		if (!text) return this._text;
		if (typeof(text) == "function")
			this._text = text.call(this);
		else
			this._text = text;
		this.trigger("Change");
		return this;
	},

	/**@
	 * #.textColor
	 * @comp Text
	 * @sign public this .textColor(String color, Number strength)
	 * @param color - The color in hexidecimal
	 * @param strength - Level of opacity
	 *
	 * Modify the text color and level of opacity.
	 *
	 * @example
	 * ~~~
	 * Crafty.e("2D, DOM, Text").attr({ x: 100, y: 100 }).text("Look at me!!")
	 *   .textColor('#FF0000');
	 *
	 * Crafty.e("2D, Canvas, Text").attr({ x: 100, y: 100 }).text('Look at me!!')
	 *   .textColor('#FF0000', 0.6);
	 * ~~~
	 * @see Crafty.toRGB
	 */
	textColor: function (color, strength) {
		this._strength = strength;
		this._textColor = Crafty.toRGB(color, this._strength);
		this.trigger("Change");
		return this;
	},

	/**@
	 * #.textFont
	 * @comp Text
	 * @triggers Change
	 * @sign public this .textFont(String key, * value)
	 * @param key - Property of the entity to modify
	 * @param value - Value to set the property to
	 *
	 * @sign public this .textFont(Object map)
	 * @param map - Object where the key is the property to modify and the value as the property value
	 *
	 * Use this method to set font property of the text entity.
	 *
	 * @example
	 * ~~~
	 * Crafty.e("2D, DOM, Text").textFont({ type: 'italic', family: 'Arial' });
	 * Crafty.e("2D, Canvas, Text").textFont({ size: '20px', weight: 'bold' });
	 *
	 * Crafty.e("2D, Canvas, Text").textFont("type", "italic");
	 * Crafty.e("2D, Canvas, Text").textFont("type"); // italic
	 * ~~~
	 */
	textFont: function (key, value) {
		if (arguments.length === 1) {
			//if just the key, return the value
			if (typeof key === "string") {
				return this._textFont[key];
			}

			if (typeof key === "object") {
				for (propertyKey in key) {
					this._textFont[propertyKey] = key[propertyKey];
				}
			}
		} else {
			this._textFont[key] = value;
		}

		this.trigger("Change");
		return this;
	}
});


var DebugRender = Class(
{
	constructor : function()
	{
		if (!Crafty.support.canvas)
			return;

		var c = document.createElement("canvas");
		c.id = 'DebugCanvas';
		c.width = Crafty.viewport.width;
		c.height = Crafty.viewport.height;
		c.style.position = 'absolute';
		c.style.left = "0px";
		c.style.top = "0px";
		c.style.zIndex = '1000';
		Crafty.stage.elem.appendChild(c);
		this._debugContext = c.getContext('2d');

		var render = this;

		Crafty.bind("DrawFrame", function() {render._drawDebug();} );
	},

	_drawDebug : function()
	{
		this._debugContext.clearRect(0, 0, Crafty.viewport.width, Crafty.viewport.height);
		var rect = Crafty.viewport.rect();
		var q = Crafty.map.search(rect);
		var l = q.length;

		for (var i = 0; i < l; i++)
		{
			var current = q[i];
			current.trigger("DrawDebug", { ctx : this._debugContext });
		}
	}
});

if (gameContainer.conf.get("ENABLE_DEBUG"))
{
	Crafty.c("DebugRendering",
	{
		init : function()
		{
			this.bind("DrawDebug", function(data)
			{
				var ctx = data.ctx;
				ctx.beginPath();

				var center = this.GetCenterRounded();
				var realCenter = this.GetCenterReal();
				var x = Crafty.viewport.x + (center.x + 0.5) * this._world.TileSize;
				var y = Crafty.viewport.y + (center.y + 0.5) * this._world.TileSize;
				var w = this.TileWidth * this._world.TileSize * 0.5;
				var h = this.TileHeight * this._world.TileSize * 0.5;

				ctx.strokeStyle = NavigationManager.IsTileClaimedBy(center, this) ?
					"red" : "white";

				var pts = [
					[ x - w, y - h ],
					[ x + w, y - h ],
					[ x + w, y + h ],
					[ x - w, y + h ]
				];

				for (var i = 0; i < 4; i++)
				{
					ctx.lineTo(pts[i][0], pts[i][1]);
				}
				//ctx.moveTo(Crafty.viewport.x + realCenter.x, Crafty.viewport.x + realCenter.y);
				//ctx.lineTo(Crafty.viewport.x + x, Crafty.viewport.x + y);
				ctx.closePath();

				var claimed = NavigationManager.GetClaimedTile(this);
				if (claimed != null)
				{
					var cx = Crafty.viewport.x + (claimed.x + 0.5) * this._world.TileSize;
					var cy = Crafty.viewport.y + (claimed.y + 0.5) * this._world.TileSize;
					ctx.moveTo(cx, cy);
					ctx.lineTo(x, y);
				}

				ctx.stroke();
			});
		}
	});
}


// ========================================================================================== //
// Renderer
var Renderer = Class({
	constructor: function(width, height) {
		this.canvas = document.createElement('canvas');
		this.canvas.width = width;
		this.canvas.height = height;
		this.context = this.canvas.getContext('2d');

		this.color = "";
		this.lineWidth = 1;
	},

	setColor: function(color) {
		if (color === undefined || color === this.color)
			return;

		this.color = color;
		this.context.fillStyle = color;
	},

	setLineWidth: function(lineWidth) {
		if (!lineWidth || lineWidth === this.lineWidth)
			return;

		this.lineWidth = lineWidth;
		this.context.lineWidth = lineWidth;
	},

	unload: function() {
		// TODO: Must remove the canvas element from the document
		this.canvas = null;
		this.context = null;
	},
	
	clear: function(color) {
		var context = this.context;
		context.fillStyle = color;
		context.beginPath();
		context.rect(0, 0, this.canvas.width, this.canvas.height);
		context.closePath();
		context.fill();
	},

	drawRectangle: function(x, y, width, height, color, lineWidth) {
		var context = this.context;

		this.setColor(color);
		this.setLineWidth(lineWidth);

		context.beginPath();
		context.rect(x, y, width, height);
		context.fill();
		context.stroke();
	},
	
	drawImage: function(image, x, y) {
        this.context.drawImage(image, x, y);
	}
});

// ========================================================================================== //
// MINI MAP
var MiniMap = Class(Renderer, {
	constructor: function(tiles, tileSize, pixelSize, frameWidth, frameHeight) {
		var width = tiles.length;
		var height = tiles[0].length;
		this.width = width;
		this.height = height;
		MiniMap.$super.call(this, width * pixelSize, height * pixelSize);

		this.x = 0;
		this.y = 0;
		this.frameWidth = frameWidth;
		this.frameHeight = frameHeight;

		this.tileSize = tileSize;
		this.pixelSize = pixelSize;
		this.tiles = tiles;
		this.generate();
	},

	generate: function() {
		var COLORS = ["#0246FE", "#FFDF42", "#FE8714", "#00CE54", "#00ffff", "#ffffff"];
		var width = this.width;
		var height = this.height;
		var tiles = this.tiles;
		var pixelSize = this.pixelSize;

		this.clear(COLORS[0]);

		for (var i = 0; i < width; i++) {
			var x0 = pixelSize * i;
			for (var j = 0; j < height; j++) {
				var y0 = pixelSize * j;

				var color = COLORS[tiles[i][j]];
				this.drawRectangle(x0, y0, pixelSize, pixelSize, color, 0);
			}
		}
	},

	draw: function(context) {
		var offsetX = -Crafty.viewport.x;
		var offsetY = -Crafty.viewport.y;
		var x = Math.max(Math.floor(offsetX / this.tileSize), 0) * this.pixelSize;
		var y = Math.max(Math.floor(offsetY / this.tileSize), 0) * this.pixelSize;

		var w = this.frameWidth;
		var h = this.frameHeight;
		context.drawImage(this.canvas, 
			x, y, w, h,
			this.x + offsetX, this.y + offsetY, w, h);
	}
});
