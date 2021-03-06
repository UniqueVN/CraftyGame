Crafty.c('Damageable',
{
	MaxHealth : 100,

	init : function()
	{
		this.requires("Body");
		this.bind("Appeared", function()
		{
			this._health = this.MaxHealth;
		})
	},

	TakeDamage : function(damage)
	{
		if (damage < 0)
			throw ("not allowing negative damage!");

		this._health -= damage;
		if (this._health <= 0)
		{
			this._health = 0;
			this.destroy();
		}
		else
		{
			var center = this.GetCenterReal();
			var damageFloat = Crafty.e("2D, DOM, FloatingText")
				.attr({x : center.x - 16, y : center.y - 40, w : 100, z : 30000})
				.text("- " + damage)
				.textFont({family : 'Arial', size : "20px", weight: 'bold'})
				.StartFloating("#FF0000");
			this.attach(damageFloat);
		}
	}
});

Crafty.c("FloatingText",
{
	_floatingTextColor : "#FFFFFF",
	_floatingTextAlpha : 1.0,

	init : function()
	{
		this.requires('TextEx');
	},

	StartFloating : function(color)
	{
		this._floatingTextColor = color;
		this.textColor(color, 1.0);
		this._floatingTextAlpha = 1.0;
		this.bind("EnterFrame", function()
		{
			this._floatingTextAlpha -= 0.03;
			this.y -= 0.5;
			this.textColor(this._floatingTextColor, this._floatingTextAlpha);
			if (this._floatingTextAlpha <= 0)
				this.destroy();
		});
		return this;
	}
});