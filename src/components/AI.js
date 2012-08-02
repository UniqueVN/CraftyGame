Crafty.c('AI',
{
	AIProfile : null,

	init: function()
	{
		this.requires("NavigationHandle");

		this._goals = [];
		this._activeGoal = null;
		this.bind("Appeared", function()
		{
			if (this.AIProfile === null)
				throw ("AI has no profile!");

			var goals = this.AIProfile.Goals;
			for (var i = 0; i < goals.length; i++)
			{
				this._goals.push(new goals[i](this));
			}
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

		var chosenGoal = null;
		for (var i = 0; i < this._goals.length; i++)
		{
			var goal = this._goals[i];
			if (goal.Priority > 0)
			{
				if (chosenGoal === null || goal.Priority > chosenGoal.Priority)
					chosenGoal = goal;
			}
		}

		if (chosenGoal != this._activeGoal)
		{
			if (this._activeGoal != null)
				this._activeGoal.Deactivate();

			this._activeGoal = chosenGoal;
			if (chosenGoal != null)
				chosenGoal.Activate();
		}

		if (this._activeGoal != null)
			this._activeGoal.Behave(frame);
	}
});

var Goal = Class(
{
	constructor : function(entity)
	{
		this._entity = entity;
		this.IsActive = false;
		this.Priority = 0;

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

	Activate : function()
	{
		this.IsActive = true;
	},

	Deactivate : function()
	{
		this.IsActive = false;
	},

	Behave : function(frame) {},

	_createAttackBehavior : function()
	{
		var primary = this._entity.GetAbility("Primary");
		if (primary)
		{
			switch (primary.BehaviorType)
			{
				case AbilityBehaviorType.Melee:
					return new Behavior_MeleeAttack(this._entity, primary);
				case AbilityBehaviorType.Ranged:
					return new Behavior_RangedAttack(this._entity, primary);
			}
		}
		throw ("no proper ability found!");
	}
});

var Goal_DestroyTemple = Class(Goal,
{
	constructor : function(entity)
	{
		Goal_DestroyTemple.$super.call(this, entity);

		this._destinationRegion = null;
		this._marchingPath = [];
		this._attackBehavior = this._createAttackBehavior();
		this._target = null;
		this._focus = entity.GetCenter();
	},

	SetDestinationRegion : function(start, end)
	{
		this._destinationRegion = end;

		var path = NavigationManager.GetInterRegionPathFinder().FindPath(this._entity, start, end);
		this._marchingPath = [];
		// skip the first region as well, so we have the starting point
		for (var i = 0; i < path.length; i++)
		{
			var region = path[i];
			this._marchingPath.push(region.Center);
		}

		if (this._marchingPath.length > 0)
			this._focus = this._marchingPath[0];

		this.Priority = 1;
	},

	Think : function()
	{
		var myCenter = this._entity.GetCenter();

		if (this._marchingPath.length > 1)
		{
			var start = this._marchingPath[0];
			var end = this._marchingPath[1];
			var closest = Math3D.ClosestPointOnSegment(start, end, myCenter);
			var startToClosest = Math3D.DistanceSq(start, closest);
			var startToFocus = Math3D.DistanceSq(start, this._focus);
			if (startToClosest > startToFocus)
			{
				this._focus = closest;
				var endToClosest = Math3D.Distance(end, closest);
				if (endToClosest <= 10)
				{
					this._marchingPath.shift();
					this._focus = this._marchingPath[0];
				}
			}
		}

		var distToFocus = Math3D.Distance(this._focus, myCenter);

		if (this.Priority === 1)
		{
			if (distToFocus > 30)
				this.Priority = 2;
		}
		else if (this.Priority >= 2)
		{
			if (distToFocus < 15)
				this.Priority = 1;
		}

		var buildings = this._entity.GetEnemyBuildings();
		if (this._target === null)
		{
			for (var i = 0; i < buildings.length; i++)
			{
				var building = buildings[i];
				if (building.IsWithinBoxRange(myCenter, 20))
				{
					this._target = building;
					break;
				}
			}
		}

	},

	Activate : function()
	{
		Goal_DestroyTemple.$superp.Activate.call(this);

		var center = this._entity.GetCenter();
		var cut = 0;
		var cutPoint = null;

		for (var i = 2; i < this._marchingPath.length; i++)
		{
			var start = this._marchingPath[i-1];
			var end = this._marchingPath[i];
			var closest = Math3D.ClosestPointOnSegment(start, end, center);

			// skip if out of bounds
			if ((closest.x === start.x && closest.y === start.y) ||
				(closest.x === end.x && closest.y === end.y))
				continue;

			var dist = Math3D.Distance(center, closest);
			if (dist <= 10)
			{
				cut = i - 1;
				cutPoint = closest;
			}
		}

		if (cut > 0)
		{
			this._marchingPath.splice(0, cut);
			this._focus = cutPoint;
		}
	},

	Behave : function(frame)
	{
		if (this._target != null)
		{
			if (!this._target.IsDestroyed)
				this._attackBehavior.Update(this._target);
			else
				this._target = null;
		}
		else
		{
			this._navigateToNextCheckPoint();
		}
	},

	_navigateToNextCheckPoint : function()
	{
		if (this._marchingPath.length > 2)
		{
			var next = this._marchingPath[1];
			if (!this._entity.IsNavigatingTo(next.x, next.y))
				this._entity.NavigateTo(next.x, next.y + 1);
		}
		else if (this._marchingPath.length > 0)
		{
			var center = this._entity.GetCenter();
			var end = this._marchingPath[this._marchingPath.length - 1];
			if (Math3D.Distance(center, end) > 14.5)
				this._entity.NavigateTo(end.x, end.y, 14);
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

		this._attackBehavior = this._createAttackBehavior();
	},

	Think : function()
	{
		if (this.Priority === 0 && this._attackBehavior)
		{
			var enemies = this._entity.GetEnemies();
			var myCenter = this._entity.GetCenter();

			for (var i = 0; i < enemies.length; i++)
			{
				var enemy = enemies[i];
				if (enemy.IsWithinBoxRange(myCenter, 20))
				{
					this._target = enemy;
					this.Priority = 1;
					break;
				}
			}
		}
	},

	Behave : function(frame)
	{
		if (this._target === null || this._target.IsDestroyed ||
			!this._attackBehavior.Update(this._target))
		{
			this.Priority = 0;
		}
	}
});

var Goal_Boss = Class(Goal,
{
	constructor : function(entity)
	{
		Goal_DestroyTemple.$super.call(this, entity);

		this._attackBehavior = this._createAttackBehavior();
		this._target = null;
		this._defenseCenter = entity.GetTile();
		this._retreating = false;
	},

	SetDestinationRegion : function(start, end)
	{
		this._defenseCenter = start.Center;
		this.Priority = 1;
	},

	Think : function()
	{
		if (!this._retreating)
		{
			var toCenter = Math3D.Distance(this._defenseCenter, this._entity.GetCenter());
			if (toCenter > 40)
			{
				this._retreating = true;
				this._target = null;
			}
		}
		else
		{
			var toCenter = Math3D.Distance(this._defenseCenter, this._entity.GetCenter());
			if (toCenter < 10)
				this._retreating = false;
		}

		if (this._target === null && !this._retreating)
		{
			var enemies = this._entity.GetEnemies();
			var myCenter = this._entity.GetCenter();

			for (var i = 0; i < enemies.length; i++)
			{
				var enemy = enemies[i];
				if (enemy.IsWithinBoxRange(myCenter, 20))
				{
					this._target = enemy;
					break;
				}
			}
		}

	},

	Behave : function(frame)
	{
		if (this._retreating)
		{
			var center = this._defenseCenter;
			if (!this._entity.IsNavigatingTo(center.x, center.y))
				this._entity.NavigateTo(center.x, center.y);
		}
		else if (this._target != null)
		{
			if (this._target.IsDestroyed || !this._attackBehavior.Update(this._target))
				this._target = null;
		}
		else
		{
			if (!this._entity.IsNavigating())
			{
				var center = this._defenseCenter;
				var dist = Math3D.Distance(center, this._entity.GetCenter());
				if (dist > 4)
				{
					this._entity.NavigateTo(center.x, center.y);
				}
			}
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

	constructor : function(entity, ability)
	{
		this._ability = ability;

		Behavior_Attack.$super.call(this, entity);
	},

	Update : function(target)
	{
		return false;
	}
});

var Behavior_RangedAttack = Class(Behavior_Attack,
{

	constructor : function(entity, ability)
	{
		Behavior_RangedAttack.$super.call(this, entity, ability);
		this._range = ability.MaxRange;
		this._attackCoolDown = 0;
	},

	Update : function(target)
	{
		if (this._attackCoolDown > 0)
			this._attackCoolDown--;

		var self = this._entity;
		var ability = this._ability;

		var selfCenter = self.GetCenter();
		var targetCenter = target.GetCenter();

		var distToTarget = Math3D.Distance(selfCenter, targetCenter);

		var outOfRange = distToTarget > this._range;
		var bCanShoot = true;
		if (self.has('NavigationHandle') )
		{
			if ((self.IsNavigating() || outOfRange) && !self.IsNavigatingTo(target))
			{
				self.NavigateTo(target, 8);
			}

			bCanShoot = !self.IsNavigating();
		}
		else if (outOfRange)
		{
			return false;
		}

		if (bCanShoot)
		{
			if (this._attackCoolDown <= 0)
			{
				this._attackCoolDown = 50;
				var data = { dir : Math3D.Direction(selfCenter, targetCenter) };
				self.UseAbility(ability, data);
			}
		}

		return true;
	}
});

var Behavior_MeleeAttack = Class(Behavior_Attack,
{
	constructor : function(entity, ability)
	{
		Behavior_MeleeAttack.$super.call(this, entity, ability);

		this._attackCoolDown = 0;
	},

	Update : function(target)
	{
		if (this._attackCoolDown > 0)
			this._attackCoolDown--;

		var self = this._entity;
		var ability = this._ability;

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

		return true;
	}
});