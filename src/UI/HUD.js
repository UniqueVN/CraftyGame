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

		this._barX = gameContainer.conf.get("INFO_BAR_X");
		this._barY = gameContainer.conf.get("INFO_BAR_Y");
		this._barH = gameContainer.conf.get("INFO_BAR_HEIGHT");
		this._barAnchor = gameContainer.conf.get("INFO_BAR_ANCHOR");
		if (this._barAnchor === "bottom")
		{
			this._barY = Crafty.viewport.height - this._barH - this._barY;
		}

		var bar = Crafty.e("2D, Color")
			.attr({x: this._barX, y: this._barY, z : 500, w : Crafty.viewport.width, h : this._barH})
			.color("rgba(0,0,0,0.75)");
		this._elements.push(bar);

		var render = this;
		Crafty.bind("DrawFrame", function()
		{
			render._update();
			render._draw();
		});

		this._hpX = gameContainer.conf.get("HEALTH_BAR_X");
		this._hpY = gameContainer.conf.get("HEALTH_BAR_Y");
		this._hpW = gameContainer.conf.get("HEALTH_BAR_WIDTH");
		this._hpH = gameContainer.conf.get("HEALTH_BAR_HEIGHT");
		this._bhpX = gameContainer.conf.get("BASE_HEALTH_BAR_X");
		this._bhpY = gameContainer.conf.get("BASE_HEALTH_BAR_Y");
		this._bhpW = gameContainer.conf.get("BASE_HEALTH_BAR_WIDTH");
		this._bhpH = gameContainer.conf.get("BASE_HEALTH_BAR_HEIGHT");

		this._pickupIconSize = gameContainer.conf.get("PICKUP_ICON_SIZE");
		this._pickupTexts = {};
		var pickups = PickupTypes.concat('soul');
		for (var i = 0; i < pickups.length; i++)
		{
			var pickup = pickups[i];
			var x = this._barX + 32 + i * this._pickupIconSize;
			var y = this._barY;
			var pickupIcon = Crafty.e("2D, coin_icon_" + pickup)
				.attr({ x : x, y : y + 20});
			var pickupText = Crafty.e("2D, TextEx")
				.attr({x: x + 32, y: y+32, z: 1000, w: this._pickupIconSize})
				.text("0")
				.textColor('#FFFFFF')
				.textFont({'size' : '14px', 'family': 'comic'});
			this._elements.push(pickupIcon);
			this._elements.push(pickupText);
			this._pickupTexts[pickup] = pickupText;
		}

		this._spellBarDirty = false;
		this._spellIcons = {};
		this._spellBarX = gameContainer.conf.get("SPELL_BAR_X");
		this._spellBarY = gameContainer.conf.get("SPELL_BAR_Y");
		this._spellIconSize = gameContainer.conf.get("SPELL_ICON_SIZE");

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
				
				data.key = Crafty.e("2D, TextEx")
					.attr({z: 1000, w: this._pickupIconSize})
					.text((i + 1) + "")
					.textColor('#0000FF')
					.textFont({'size' : '14px', 'family': 'comic'});

				this._spellIcons[spell] = data;
			}
			if (!data.visible)
			{
				this._elements.push(data.icon);
				this._elements.push(data.key);
				data.visible = true;
			}

			data.icon.x = this._barX + this._spellBarX + i * this._spellIconSize;
			data.icon.y = this._barY + this._spellBarY;
			data.key.x = data.icon.x;
			data.key.y = data.icon.y + 12;
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

		// Show other elements
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

		// Show miniMap
		var miniMap = this._world.MiniMap;
		miniMap.draw(ctx);

		// Show PLAYER's health bar
		this.ShowHealthBar(this._player, this._hpX, this._hpY, this._hpW, this._hpH);
		ctx.font = "20 pt MeriendaOne-Regular";
		ctx.fillStyle = '#ffffff';
		var x = this._barX + this._hpX;
		var y = this._barY + this._hpY;
		ctx.fillText("PLAYER", x - 4, y + 20);
		ctx.fillText("HP", x + 10, y + 40);

		// Show SHRINE's health bar
		this.ShowHealthBar(this._world.TempleRegion.Shrine.get("platform"), this._bhpX, this._bhpY, this._bhpW, this._bhpH);
		ctx.font = "20 pt MeriendaOne-Regular";
		ctx.fillStyle = '#ffffff';
		x = this._barX + this._bhpX;
		y = this._barY + this._bhpY;
		ctx.fillText("BASE", x + 1, y + 20);
		ctx.fillText("HP", x + 10, y + 40);
	},

	ShowHealthBar: function(entity, x0, y0, w, h)
	{
		var ctx = this._context;
		var curHP = entity._health;
		var maxHP = entity.MaxHealth;
		var hpPercent = Math.floor(curHP * 100 / maxHP);

		var x = this._barX + x0;
		var y = this._barY + y0;
		ctx.fillStyle = "#000000";
		ctx.beginPath();
		ctx.rect(x, y, w, h);
		ctx.fill();
		var h1 = Math.floor(hpPercent * h / 100);
		ctx.fillStyle = "#ff0000";
		ctx.beginPath();
		ctx.rect(x, y + h - h1, w, h1);
		ctx.fill();
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
