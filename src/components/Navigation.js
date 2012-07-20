Crafty.c('NavigationHandle',
{
	_pendingPath : null,
	_isNavigationPaused : false,
	_currentGoal : null,

	init : function()
	{
		if (!this.has("Body"))
			throw new Error("Must have body to move around!");
		this.bind("MoveFinished", this._movePointReached);
		this.bind("EnterFrame", this._updateNavigation);
		return this;
	},

	_updateNavigation : function()
	{
		if (this._currentGoal != null && !this._isNavigationPaused)
		{
			if (this._currentGoal.target)
			{
				var newCenter = this._currentGoal.target.GetCenter();
				if (Math3D.DistanceSq(this._currentGoal._goalCenter, newCenter) > 4)
					this.NavigateTo(this._currentGoal.target, this._currentGoal.radius);
			}
		}
	},

	NavigateTo : function(x, y)
	{
		var from = this.GetCenterRounded();
		var to = null;

		if (typeof x === 'object')
		{
			to = { target : x, radius : y };
			to._goalCenter = x.GetCenter();
		}
		else
		{
			to = { x: x, y : y };
		}

		this._currentGoal = to;

		this._pendingPath = NavigationManager.FindPath(from, to);
		this._onNavigationStarted();
		this._advancePath();
	},

	StopNavigation : function()
	{
		this._onNavigationEnded();
		this.StopMoving();
	},

	PauseNavigation : function()
	{
		this._isNavigationPaused = true;
		this.StopMoving();
	},

	ResumeNavigation : function()
	{
		this._isNavigationPaused = false;
		if (this._pendingPath != null && !this.IsMoving())
		{
			this._moveToNextPoint();
		}
	},

	IsNavigating : function()
	{
		return this._pendingPath != null;
	},

	IsNavigatingTo : function(x, y)
	{
		if (this._pendingPath === null || this._pendingPath.length <= 0)
			return false;

		if (arguments.length === 1)
		{
			var target = this._currentGoal.target || null;
			var result = ((target != null) && (x[0] === target[0]))
			return result;
		}

		var last = this._pendingPath[this._pendingPath.length - 1];
		return last.x === x && last.y === y;
	},

	_movePointReached : function()
	{
		if (this._pendingPath == null)
			return;

		this._pendingPath.shift();
		this._advancePath();
	},

	_advancePath : function()
	{
		if (this._pendingPath == null || this._pendingPath.length == 0)
		{
			this._finishedPath();
			return;
		}

		// try to smooth the path
		if (this._pendingPath.length >= 2)
		{
			var start = this.GetCenterRounded();
			var dir = { x: 0, y : 0 };

			for (var i = 0, prev = start; i < this._pendingPath.length; i++)
			{
				var current = this._pendingPath[i];
				var dx = current.x - prev.x;
				var dy = current.y - prev.y;

				if (dx * dir.x < 0 || dy * dir.y < 0)
					break;

				dir.x += dx;
				dir.y += dy;

				prev = current;
			}
			if (i >= 2) // TODO: line check to validate
				this._pendingPath.splice(0, i - 1);
		}

		if (!this._isNavigationPaused)
			this._moveToNextPoint();
	},

	_moveToNextPoint : function()
	{
		var nextPt = this._pendingPath[0];
		this.MoveTo(nextPt.x, nextPt.y);
	},

	_finishedPath : function()
	{
		this._onNavigationEnded();
	},

	_onNavigationStarted : function()
	{
	},

	_onNavigationEnded : function()
	{
		this._currentGoal = null;
		this._pendingPath = null;
	}
});

Crafty.c('AvoidanceHandle',
{
	_avoidanceCheckWaitFrames : 0,

	init: function()
	{
		this.requires("NavigationHandle");
		//this.bind("EnterFrame", this._updateAvoidance);
	},

	_updateAvoidance : function()
	{
		if (this._avoidanceCheckWaitFrames > 0)
		{
			this._avoidanceCheckWaitFrames--;
			return;
		}

		this._avoidanceCheckWaitFrames = 20;

		var center = this.GetCenter();
		var result = this._world.CollisionMap.RadiusCheck(center, this.GetRadius() + 0.5);
		var hits = result.hits;
		var avoid = { x : 0, y : 0 };
		for (var i = 0; i < hits.length; i++)
		{
			var other = hits[i].entity;
			if (other[0] === this[0])
				continue;

			var otherCenter = other.GetCenter();
			var toThis = Math3D.Direction(otherCenter, center);
			var push = this.MovementSpeed * 0.3;
			avoid.x += toThis.x * push;
			avoid.y += toThis.y * push;
		}

		this._avoidVelocity = avoid;
	}
});

NavigationManager =
{
	_world : null,
	_pathFinders : [],
	Semantics : null,
	_interRegionPathFinder : null,
	_pathFinder : null,

	SetWorld : function(world)
	{
		this._world = world;
		this._pathFinders.length = 0;
		this.Semantics = new WorldPathSemantics(world);
		this._interRegionPathFinder = new PathFinder(new InterRegionPathSemantics(world));
		this._pathFinder = new PathFinder(null);

		this._semanticsLoc = new WorldPathSemantics_ToLocation(world);
		this._semanticsTargetTouch = new WorldPathSemantics_ToTargetTouch(world);
		this._semanticsTargetRanged = new WorldPathSemantics_ToTargetRanged(world);
	},

	FindPath : function(from, to)
	{
		var semantics = null;
		if (to.target)
		{
			semantics = to.radius > 0 ? this._semanticsTargetRanged : this._semanticsTargetTouch;
		}
		else
		{
			semantics = this._semanticsLoc;
		}

		this._pathFinder.Semantics = semantics;
		return this._pathFinder.FindPath(from, to);
	},

	GetPathFinder : function()
	{
		if (this._world == null)
			throw("Must link the navigation manager with the world before using it!");

		if (this._pathFinders.length == 0)
			this._pathFinders.push(this._createPathFinder());
		return this._pathFinders[0];
	},

	_createPathFinder : function()
	{
		return new PathFinder(this.Semantics);
	},

	GetInterRegionPathFinder : function()
	{
		return this._interRegionPathFinder;
	}
};

var PathSemantics = Class(
{
	constructor : function()
	{
	},

	PrePath : function(from, to)
	{
		return [ { point : from, cost : 0 } ];
	},

	PostPath : function(from, to, path)
	{

	},

	ReachedDestination : function(current, dest)
	{
		throw ("Not implemented!");
	},

	GetKey : function(point)
	{
		throw ("Not implemented!");
	},

	GetNeighbours : function(point)
	{
		throw ("Not implemented!");
	},

	GetMovementCost : function(from, to)
	{
		throw ("Not implemented!");
	},

	GetHeuristicCost : function(current, dest)
	{
		throw ("Not implemented!");
	}
});

var WorldPathSemantics = Class(PathSemantics,
{
	constructor : function(world)
	{
		WorldPathSemantics.$super.call(this);
		this._world = world;
	},

	ReachedDestination : function(current, dest)
	{
		throw ("Not implemented!");
	},

	GetKey : function(point)
	{
		return point.y * this._world.MapWidth + point.x;
	},

	GetNeighbours : function(point)
	{
		return [
			{ x : point.x, y : point.y - 1 },
			{ x : point.x + 1, y : point.y - 1 },
			{ x : point.x + 1, y : point.y },
			{ x : point.x + 1, y : point.y + 1 },
			{ x : point.x, y : point.y + 1 },
			{ x : point.x - 1, y : point.y + 1 },
			{ x : point.x - 1, y : point.y },
			{ x : point.x - 1, y : point.y - 1 }
		]
	},

	GetMovementCost : function(from, to)
	{
		var dx = to.x - from.x;
		var dy = to.y - from.y;
		return (dx === 0 || dy === 0) ? 0.5 : 0.7;
	},

	GetHeuristicCost : function(current, dest)
	{
		return Math.abs(dest.x - current.x) + Math.abs(dest.y - current.y);
	}
});


var WorldPathSemantics_ToLocation = Class(WorldPathSemantics,
{
	constructor : function(world)
	{
		WorldPathSemantics_ToLocation.$super.call(this, world);
	},

	ReachedDestination : function(current, dest)
	{
		return current.x == dest.x && current.y == dest.y;
	}
});

var WorldPathSemantics_ToTargetTouch = Class(WorldPathSemantics,
{
	constructor : function(world)
	{
		WorldPathSemantics_ToTargetTouch.$super.call(this, world);
	},

	PrePath : function(from, to)
	{
		to._goal = { x : from.x, y : from.y };

		var target = to.target;
		var targetTile = target.GetCenterRounded();
		var starts = [];

		for (var dx = -1; dx <= 1; dx++)
		{
			var x = targetTile.x + dx;

			for (var dy = -1; dy <= 1; dy++)
			{
				if (dx === 0 && dy === 0)
					continue;

				var y = targetTile.y + dy;

				// TODO: check occupied

				var cost = (dx === 0 || dy === 0) ? 0 : 1.5;
				starts.push({ point : { x : x, y : y }, cost : cost });
			}
		}

		return starts;
	},

	ReachedDestination : function(current, dest)
	{
		var goal = dest._goal;
		return current.x == goal.x && current.y == goal.y;
	},

	GetHeuristicCost : function(current, dest)
	{
		return WorldPathSemantics_ToTargetTouch.$superp.GetHeuristicCost.call(this, current, dest._goal);
	},

	PostPath : function(from, to, path)
	{
		path.reverse();
	}
});

var WorldPathSemantics_ToTargetRanged = Class(WorldPathSemantics,
{
	constructor : function(world)
	{
		WorldPathSemantics_ToTargetRanged.$super.call(this, world);
	}
});

var InterRegionPathSemantics = Class(PathSemantics,
{
	constructor : function(world)
	{
		InterRegionPathSemantics.$super.call(this);
		this._world = world;
	},

	ReachedDestination : function(current, dest)
	{
		return current === dest;
	},

	GetKey : function(region)
	{
		return region.Id;
	},

	GetNeighbours : function(region)
	{
		return region.Neighbours;
	},

	GetMovementCost : function(from, to)
	{
		return 1.0;
	},

	GetHeuristicCost : function(current, dest)
	{
		return 0.0;
	}
});

var PathFinder = Class(
{
	constructor : function(semantics)
	{
		this.Semantics = semantics || null;
		this._nodes = {};
	},

	_newNode : function(point, parent, g, h, f)
	{
		var node = {};
		node.point = point;
		node.parent = parent;
		node.id = this.Semantics.GetKey(point);
		node.g = g;
		node.h = h;
		node.f = f;
		node.closed = false;
		this._nodes[node.id] = node;
		return node;
	},

	_getNode : function(point)
	{

	},

	FindPath : function(from, to)
	{
		if(this.Semantics === null)
			throw("Exception: You have to provide semantics for the path finding");

		var path = [];
		var open = new PriorityQueue();
		var starts = this.Semantics.PrePath(from, to);
		if (!starts)
			throw ("PrePath must return a list of starting points");

		for (var i = 0; i < starts.length; i++)
		{
			var start = starts[i];
			var g = start.cost;
			var h = this.Semantics.GetHeuristicCost(start.point, to)
			var f = g + h;
			var startNode = this._newNode(start.point, null, g, h, f);

			if (start.closed)
				startNode.closed = true;
			else
				open.push(startNode, f);
		}

		while(open.size() > 0)
		{
			var currentNode = open.pop();
			if(this.Semantics.ReachedDestination(currentNode.point, to))
			{
				while(currentNode != null)
				{
					path.unshift(currentNode.point);
					currentNode = currentNode.parent;
				}
				break;
			}

			if (currentNode.closed)
				continue;

			currentNode.closed = true;

			var neighbours = this.Semantics.GetNeighbours(currentNode.point);
			for (var i = 0; i < neighbours.length; i++)
			{
				var nextPoint = neighbours[i];
				var id = this.Semantics.GetKey(nextPoint);
				var nextNode = this._nodes[id] || this._newNode(nextPoint, currentNode, -1, -1, -1);

				if (nextNode.closed)
					continue;

				var g = this.Semantics.GetMovementCost(currentNode.point, nextPoint) + currentNode.g;
				if (nextNode.g >= 0 && nextNode.g <= g)
					continue;

				nextNode.parent = currentNode;
				nextNode.g = g;
				nextNode.h = this.Semantics.GetHeuristicCost(nextPoint, to);
				nextNode.f = nextNode.g + nextNode.h;
				open.push(nextNode, nextNode.f);
			}
		}

		this.Semantics.PostPath(from, to, path);
		this._nodes = {};
		return path;
	}
});