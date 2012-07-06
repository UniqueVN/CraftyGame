Crafty.c('BodyAnimations',
{
	_currentAnimation : null,

	init: function()
	{
	},

	WalkAnimation : function(length)
	{
		var lastFrame = length - 1;

		// TODO: make sure we don't bind this more than once!!
		this.bind("EnterFrame", this._updateBodyAnim);

		//setup animations
		this.requires("SpriteAnimation")
			.animate("walk_left", 0, 3, lastFrame)
			.animate("walk_right", 0, 1, lastFrame)
			.animate("walk_up", 0, 0, lastFrame)
			.animate("walk_down", 0, 2, lastFrame)
			.bind("NewDirection", this._playWalkAnim);
		return this;
	},

	_updateBodyAnim : function()
	{
		// only update anim if we currently have one, otherwise, the anim should already be stopped
		if (this._currentAnimation != null)
		{
			if (Crafty.DrawManager.onScreen({ _x : this.x, _y : this.y, _w : this.w, _h : this.h }))
			{
				if (!this.isPlaying(this._currentAnimation))
				{
					this.stop().animate(this._currentAnimation, 10, -1);
				}
			}
			else
			{
				this.reset();
			}
		}
	},

	_playWalkAnim : function(direction)
	{
		if (direction.x < 0)
		{
			this._currentAnimation = "walk_left";
		}
		else if (direction.x > 0)
		{
			this._currentAnimation = "walk_right";
		}
		else if (direction.y < 0)
		{
			this._currentAnimation = "walk_up";
		}
		else if (direction.y > 0)
		{
			this._currentAnimation = "walk_down";
		}
		else
		{
			this._currentAnimation = null;
			this.reset();
		}
	}

});
