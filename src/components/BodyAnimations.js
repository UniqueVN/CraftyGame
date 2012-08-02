Crafty.c('BodyAnimations',
{
	_currentWalkAnim : null,
	_walkAnimSpeed : 10,
	_bodyAnimData : null,

	_currentActionAnim : null,
	_currentActionAnimData : null,
	_currentActionAnimFrameTotal : 0,
	_currentActionAnimFrame : 0,

	init: function()
	{
		this.requires("SpriteAnimation");
		this.bind("EnterFrame", this._updateBodyAnim);
	},

	// TODO: rows temporary [ up, left, down, right ]
	WalkAnimation : function(length, rows, speed, start)
	{
		this._walkAnimSpeed = speed;
		var lastFrame = length - 1;

		//setup animations

		this.animate("walk_left", start, rows[1], lastFrame)
			.animate("walk_right", start, rows[3], lastFrame)
			.animate("walk_up", start, rows[0], lastFrame)
			.animate("walk_down", start, rows[2], lastFrame)
			.bind("NewDirection", this._playWalkAnim);
		return this;
	},

	ActionAnimation : function(name, row, length, interval, steps)
	{
		if (this._bodyAnimData === null)
			this._bodyAnimData = {};

		var newData = { length : length, interval : interval };
		this._bodyAnimData[name] = newData;

		this.animate(name + "_up", 0, row, length - 1)
			.animate(name + "_left", 0, row + steps, length - 1)
			.animate(name + "_down", 0, row + 2 * steps, length - 1)
			.animate(name + "_right", 0, row + 3 * steps, length - 1)
	},

	PlayActionAnim : function(name, dir)
	{
		var data = this._bodyAnimData[name];
		if (!data)
			throw ("cannot find body anim", name);

		var total = data.length * data.interval;
		this._currentActionAnim = name + "_" + this._getAnimDir(dir);
		this._currentActionAnimData = data;
		this._currentActionAnimFrameTotal = total;
		this._currentActionAnimFrame = -1; // starting in -1, and will be incremented first in next frame, then playing the anim
	},

	IsPlayingActionAnim : function(name)
	{
		return this._currentActionAnim != null;
	},

	_updateBodyAnim : function()
	{
		// only update anim if we currently have one, otherwise, the anim should already be stopped
		if (this._currentWalkAnim != null || this._currentActionAnim != null)
		{
			if (this._currentActionAnim != null)
			{
				this._currentActionAnimFrame++;
				if (this._currentActionAnimFrame >= this._currentActionAnimFrameTotal)
				{
					this._currentActionAnim = null;
					this.reset();
				}
			}

			if (Crafty.DrawManager.onScreen({ _x : this.x, _y : this.y, _w : this.w, _h : this.h }))
			{
				if (this._currentActionAnim != null)
				{
					if (!this.isPlaying(this._currentActionAnim))
					{
						this.stop().playanim(this._currentActionAnim, this._currentActionAnimData.interval, 0, this._currentActionAnimFrame);
					}
				}
				else if (this._currentWalkAnim != null)
				{
					if (!this.isPlaying(this._currentWalkAnim))
					{
						this.stop().animate(this._currentWalkAnim, this._walkAnimSpeed, -1);
					}
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
		if (direction.x < -0.5)
		{
			this._currentWalkAnim = "walk_left";
		}
		else if (direction.x > 0.5)
		{
			this._currentWalkAnim = "walk_right";
		}
		else if (direction.y < 0)
		{
			this._currentWalkAnim = "walk_up";
		}
		else if (direction.y > 0)
		{
			this._currentWalkAnim = "walk_down";
		}
		else
		{
			this._currentWalkAnim = null;
			if (this._currentActionAnim == null)
				this.reset();
		}
	},

	_getAnimDir : function(dir)
	{
		if (dir.x < -0.70711)
		{
			return "left";
		}
		else if (dir.x > 0.70711)
		{
			return "right";
		}
		else if (dir.y < 0)
		{
			return "up";
		}
		else //if (dir.y > 0)
		{
			return "down";
		}
	}
});
