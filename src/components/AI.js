Crafty.c('AI',
{
	init: function()
	{
		this.requires("NavigationHandle");

		this._goals = [];
		this.bind("Appeared", function()
		{
			this._goals.push(new Goal_AttackEnemy(this));
			this._goals.push(new Goal_DestroyTemple(this));
		});

		this.bind("EnterFrame", this._think);
	},

	SetDestinationRegion : function(start, end)
	{
		for (var i = 0; i < this._goals.length; i++)
		{
			var goal = this._goals[i];
			if (goal.SetDestinationRegion)
				goal.SetDestinationRegion(start, end);
		}
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

		var path = NavigationManager.GetInterRegionPathFinder().FindPath(this._entity, start, end);
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

		this._primaryAbility = entity.GetAbility("Primary");
		if (this._primaryAbility)
		{
			switch (this._primaryAbility.BehaviorType)
			{
				case AbilityBehaviorType.Melee:
					this._attackBehavior = new Behavior_MeleeAttack(entity);
					break;
				case AbilityBehaviorType.Ranged:
					this._attackBehavior = new Behavior_RangedAttack(entity);
					break;
			}
		}
	},

	Think : function()
	{
		if (!this.IsActive && this._attackBehavior)
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
		if (this._target != null && !this._target.IsDestroyed)
		{
			this._attackBehavior.Update(this._entity, this._target, this._primaryAbility);
		}
		else
		{
			this.IsActive = false;
		}
	}
});

var Behavior = Class(
{
	constructor : function(entity)
	{
		this._entity = entity;
	}
});

var Behavior_Attack = Class(Behavior,
{

	constructor : function(entity)
	{
		Behavior_Attack.$super.call(this, entity);
	},

	Update : function(target)
	{

	}
});

var Behavior_RangedAttack = Class(Behavior_Attack,
{

	constructor : function(entity)
	{
		Behavior_RangedAttack.$super.call(this, entity);

		this._attackCoolDown = 0;
	},

	Update : function(self, target, ability)
	{
		if (this._attackCoolDown > 0)
			this._attackCoolDown--;

		var selfCenter = self.GetCenter();
		var targetCenter = target.GetCenter();

		var distToTarget = Math3D.Distance(selfCenter, targetCenter);

		if (distToTarget > 20)
		{
			this.IsActive = false;
			return;
		}

		if (!self.IsNavigatingTo(target))
		{
			if (this._entity.IsNavigating() || distToTarget > 12)
			{
				this._entity.NavigateTo(target, 6);
			}
			else
			{
				if (this._attackCoolDown <= 0)
				{
					this._attackCoolDown = 50;
					var data = { dir : Math3D.Direction(selfCenter, targetCenter) };
					self.UseAbility(ability, data);
				}
			}
		}
	}
});

var Behavior_MeleeAttack = Class(Behavior_Attack,
{
	constructor : function(entity)
	{
		Behavior_MeleeAttack.$super.call(this, entity);

		this._attackCoolDown = 0;
	},

	Update : function(self, target, ability)
	{
		if (this._attackCoolDown > 0)
			this._attackCoolDown--;

		var selfCenter = self.GetCenter();
		var targetCenter = target.GetCenter();

		var distToTarget = Math3D.Distance(selfCenter, targetCenter);

		if (!self.IsNavigatingTo(target))
		{
			if (distToTarget <= 1.5)
			{
				if (this._attackCoolDown <= 0)
				{
					this._attackCoolDown = 50;
					var data = { dir : Math3D.Direction(selfCenter, targetCenter) };
					self.UseAbility(ability, data);
				}
			}
			else
			{
				this._entity.NavigateTo(target, 0);
			}
		}
	}
});