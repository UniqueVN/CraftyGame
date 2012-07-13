Crafty.c('AI',
{

	init: function()
	{
		this.requires("NavigationHandle");

		this._goals = [];
		this._goals.push(new Goal_AttackEnemy(this));
		this._goals.push(new Goal_DestroyTemple(this));

		this.bind("EnterFrame", this._think);
	},

	_think : function(e)
	{
		var frame = e.frame;

		for (var i = 0; i < this._goals.length; i++)
			this._goals[i].Update(frame);

		for (var i = 0; i < this._goals.length; i++)
		{
			var goal = this._goals[i];
			if (goal.IsActive)
			{
				goal.Behave(frame);
				break;
			}
		}
	},

	SetDestinationRegion : function(start, end)
	{
		for (var i = 0; i < this._goals.length; i++)
		{
			var goal = this._goals[i];
			if (goal.SetDestinationRegion)
				goal.SetDestinationRegion(start, end);
		}
	}
});

var Goal = Class(
{
	constructor : function(entity)
	{
		this._entity = entity;
		this.IsActive = false;
		this._nextUpdateFrame = 0;
		this._thinkRate = 5;
	},

	Update : function(frame)
	{
		if (frame >= this._nextUpdateFrame || frame < this._nextUpdateFrame - this._thinkRate)
		{
			this.Think();
			this._nextUpdateFrame = frame + this._thinkRate;
		}
	},

	Think : function() {},

	Behave : function(frame) {}
});

var Goal_DestroyTemple = Class(Goal,
{
	constructor : function(entity)
	{
		Goal_DestroyTemple.$super.call(this, entity);

		this._destinationRegion = null;
		this._marchingPath = [];
	},

	SetDestinationRegion : function(start, end)
	{
		this._destinationRegion = end;

		var path = NavigationManager.GetInterRegionPathFinder().FindPath(start, end);
		this._marchingPath = [];
		// skip first one (start region)
		for (var i = 1; i < path.length; i++)
		{
			var region = path[i];
			this._marchingPath.push(region.Center);
		}

		if (this._marchingPath.length > 0)
			this.IsActive = true;
	},

	Think : function()
	{
		if (this._marchingPath.length > 0)
		{
			var nextCheckpoint = this._marchingPath[0];
			var center = this._entity.GetCenter();
			if (Math.abs(nextCheckpoint.x - center.x) + Math.abs(nextCheckpoint.y - center.y) <= 10)
			{
				this._marchingPath.shift();
				if (this._marchingPath.length == 0)
					this.IsActive = false;
			}
		}
	},

	Behave : function(frame)
	{
		if (!this._entity.IsNavigating() && this._marchingPath.length > 0)
		{
			var nextCheckpoint = this._marchingPath[0];
			this._entity.NavigateTo(nextCheckpoint.x, nextCheckpoint.y);
		}
	}
});

var Goal_AttackEnemy = Class(Goal,
{
	constructor : function(entity)
	{
		Goal_AttackEnemy.$super.call(this, entity);

		this._target = null;
		this._nextAttackFrame = 0;
	},

	Think : function()
	{
		if (!this.IsActive)
		{
			var enemies = this._entity.GetEnemies();
			var myCenter = this._entity.GetCenter();

			for (var i = 0; i < enemies.length; i++)
			{
				var enemy = enemies[i];
				if (enemy.IsWithinBoxRange(myCenter, 10))
				{
					this._target = enemy;
					this.IsActive = true;
					break;
				}
			}
		}
	},

	Behave : function(frame)
	{
		if (this._target != null)
		{
			var selfCenter = this._entity.GetCenter();
			var targetCenter = this._target.GetCenter();

			var distToTarget = Math3D.Distance(selfCenter, targetCenter);

			if (distToTarget > 20)
			{
				this.IsActive = false;
				return;
			}


			if (distToTarget > 3)
			{
				var targetLoc = this._target.GetCenterRounded();
				if (!this._entity.IsNavigatingTo(targetLoc.x, targetLoc.y))
				{
					this._entity.NavigateTo(targetLoc.x, targetLoc.y);
				}
			}
			else
			{
				if (this._entity.IsNavigating())
					this._entity.StopNavigation();
			}

			if (distToTarget <= 10)
			{
				if (frame >= this._nextAttackFrame)
				{
					this._nextAttackFrame = frame + 50;
					var data = { dir : Math3D.Direction(selfCenter, targetCenter) };
					this._entity.UseAbility('Primary', data);
				}
			}
		}
	}
});
