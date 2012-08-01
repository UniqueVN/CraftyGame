var Button = Class({
	constructor: function(context, text, x, y, w, h, onClickFunc) {
		this.context = context;
		this.text = text;
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;

		this.bgSprite = Crafty.e("2D, DOM, Mouse, buttonNormal");
		this.lbText = Crafty.e("2D, DOM, Text").text(this.text);
		// this.bgSprite = Crafty.e("2D, DOM, Mouse, buttonNormal")
		// 	.attr({z:10000});
		// this.lbText = Crafty.e("2D, DOM, Text")
		// 	.attr({w: 100, h: 20, x: 100, y: 100, z:10001})
		// 	.text(this.text);

		if (onClickFunc)
			this.bgSprite.bind('Click', onClickFunc);
		this.bgSprite.bind('Click', this.onClick.bind(this));

	    // must bind to visual updated but not BodyMoved, otherwise could cause the map redraw twice
	    this.bgSprite.bind("EnterFrame", this.updatePosition.bind(this));
	},

	updatePosition: function()
	{
		var x0 = -Crafty.viewport._x + this.x;
		var y0 = -Crafty.viewport._y + this.y;

		// debug.log(this + " updatePosition: x0 = " + x0 + " y0 = " + y0);
		this.bgSprite.attr({x: x0, y: y0});
		this.lbText.attr({x: x0 + 10, y: y0 + 3});
	},

	onClick: function() {
		debug.log("Button - " + this.text + " - clicked");
	}
});