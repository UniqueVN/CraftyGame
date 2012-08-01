var HUD = Class(
{
	constructor : function(world)
	{
		if (!Crafty.support.canvas)
			return;

		this._world = world;
		this._setPlayer();

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
			.attr({x : 0, y : 0, z : 500, w : Crafty.viewport.width, h : 56})
			.color("rgba(0,0,0,0.75)");
		this._elements.push(bar);

		var render = this;
		Crafty.bind("DrawFrame", function()
		{
			render._update();
			render._draw();
		});

		this._pickupTexts = {};
		var pickups = PickupTypes.concat('soul');
		for (var i = 0; i < pickups.length; i++)
		{
			var pickup = pickups[i];
			var x = 32 + i * 80;
			var y = 12;
			var pickupIcon = Crafty.e("2D, coin_icon_" + pickup)
				.attr({ x : x, y : y });
			var pickupText = Crafty.e("2D, TextEx")
				.attr({x: x + 32, y: y+20, z: 1000, w: 80})
				.text("0")
				.textColor('#FFFFFF')
				.textFont({'size' : '14px', 'family': 'comic'});
			this._elements.push(pickupIcon);
			this._elements.push(pickupText);
			this._pickupTexts[pickup] = pickupText;
		}

		this._spellBarDirty = false;
		this._spellIcons = {};
		this._spellBarX = 512;
		this._spellBarY = 4;
		this._spellIconSize = 64;

		Crafty.bind("HeroReborn", function() { render._setPlayer(); });
	},

	_setPlayer : function()
	{
		var render = this;
		this._player = this._world.Player;
		this._player.bind("SpellChanged", function(){ render._spellBarDirty = true; });

		// Set up announcement
		this._announcement = "";
	},

	Announce: function(announceStr)
	{
		this._announcement = announceStr;
	},

	StopAnnouncement: function()
	{
		this._announcement = "";
	},

	_update : function()
	{
		for (var name in this._player.Pickups)
		{
			this._pickupTexts[name].text(this._player.Pickups[name].toString());
		}

		if (this._spellBarDirty)
		{
			this._spellBarDirty = false;
			this._updateSpellBar();
		}
	},

	_updateSpellBar : function()
	{
		var spells = this._player.ActiveSpells;
		var numSpells = spells.length;
		for (var i = 0; i < numSpells; i++)
		{
			var spell = spells[i];
			var data = this._spellIcons[spell];
			if (data === undefined)
			{
				data = {};
				data.icon = Crafty.e("2D, " + this._player.GetSpellIcon(spell));
				data.visible = false;
				this._spellIcons[spell] = data;
			}
			if (!data.visible)
			{
				this._elements.push(data.icon);
				data.visible = true;
			}

			data.icon.x = this._spellBarX + i * this._spellIconSize;
			data.icon.y = this._spellBarY;
		}

		for (var spell in this._spellIcons)
		{
			var data = this._spellIcons[spell];
			if (data.visible && !this._player.IsSpellActive(spell))
			{
				data.visible = false;
				for (var i = 0; i < this._elements.length; i++)
				{
					if (this._elements[i][0] === data.icon[0])
						break;
				}

				if (i < this._elements.length)
					this._elements.splice(i, 1);
			}
		}
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
			var coord = elem.__coord || [0, 0, 0, 0];
			var co =
			{
				x: coord[0],
				y: coord[1],
				w: coord[2],
				h: coord[3]
			};
			elem.trigger("Draw", { type: "canvas", pos: pos, co: co, ctx: ctx });
		}

		if (this._announcement !== "")
		{
			ctx.lineWidth = 5;
			// TODO: don't hardcode
			var fontSize = 50;
			ctx.font = fontSize + "pt MeriendaOne-Regular";
			var x = Crafty.viewport.width / 2;
			var y = Crafty.viewport.height / 2;
			// ctx.strokeStyle = 'red';
			// ctx.strokeText(this._announcement, x, y);
			ctx.textAlign = "center";
			ctx.fillStyle = '#D70500';
			ctx.fillText(this._announcement, x, y);
		}
	},

	GameOver: function()
	{
		this.Announce("Base destroyed!!!\n We're doom!!!");

		var w = 90;
		var h = 30;
		var x = (Crafty.viewport.width - w) / 2;
		var y = (Crafty.viewport.height - h) / 2 + 50;

		var onBtnRestartClick = function() {
			window.location.reload();
		};

		var btnRestart = new Button(this._context, "Restart", x, y, w, h, onBtnRestartClick);
		// var btnRestart = new Button(this._context, "Restart", x, y, w, h);
		// var btnRestart = new Button(this._context, "Restart", 100, 100);

	}
});
