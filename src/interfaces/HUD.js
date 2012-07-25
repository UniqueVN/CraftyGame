var HUD = Class(
{
	constructor : function(world)
	{
		if (!Crafty.support.canvas)
			return;

		this._world = world;
		this._player = world.Player;

		var c = document.createElement("canvas");
		c.id = 'HUD';
		c.width = Crafty.viewport.width; // TODO: could limit the size of HUD (majority of it would be blank)
		c.height = Crafty.viewport.height;
		c.style.position = 'absolute';
		c.style.left = "0px";
		c.style.top = "0px";
		c.style.zIndex = '1000';
		Crafty.stage.elem.appendChild(c);
		this._context = c.getContext('2d');

		this._elements = [];

		var bar = Crafty.e("2D, Color")
			.attr({x : 0, y : 0, z : 500, w : Crafty.viewport.width, h : 48})
			.color("rgba(0,0,0,0.75)");
		this._elements.push(bar);

		this._pickupText = Crafty.e("2D, TextEx")
			.attr({x: 50, y: 32, z: 1000, w: 400})
			.text("Empty")
			.textColor('#FFFFFF')
			.textFont({'size' : '18px', 'family': 'comic'});

		this._elements.push(this._pickupText);

		var render = this;
		Crafty.bind("DrawFrame", function()
		{
			render._update();
			render._draw();
		});
	},

	_update : function()
	{
		var pickupStr = "";
		var pickups = this._player.Pickups;
		for (var name in pickups)
		{
			pickupStr += name + " : " + pickups[name] + " ";
		}
		this._pickupText.text(pickupStr);
	},

	_draw : function()
	{
		var ctx = this._context;
		ctx.clearRect(0, 0, Crafty.viewport.width, Crafty.viewport.height);

		for (var i = 0; i < this._elements.length; i++)
		{
			var elem = this._elements[i];
			var pos =
			{
				_x : elem.x,
				_y : elem.y,
				_w : elem.w,
				_h : elem.h
			};
			var co = elem.__coord;
			elem.trigger("Draw", { type: "canvas", pos: pos, co: co, ctx: ctx });
		}
	}
});
