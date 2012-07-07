Crafty.c('NavigationHandle',
{
	_pendingPath : null,

	init : function()
	{
		if (!this.has("Body"))
			throw new Error("Must have body to move around!");
		this.bind("MoveFinished", this._movePointReached);
		return this;
	},

	NavigateTo : function(x, y)
	{
		var from = this.GetCenterRounded();
		var to = { x: x, y : y };
		this._pendingPath = NavigationManager.GetPathFinder().FindPath(from, to);
		this._advancePath();
	},

	StopNavigation : function()
	{
		this._pendingPath = null;
		this.StopMoving();
	},

	IsNavigating : function()
	{
		return this._pendingPath != null;
	},

	IsNavigatingTo : function(x, y)
	{
		if (this._pendingPath === null || this._pendingPath.length <= 0)
			return false;

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

		if (this._pendingPath.length >= 2)
		{
			var firstPt = this._pendingPath[0];
			var secondPt = this._pendingPath[1];
			var horizontal = firstPt.y == secondPt.y;
			for (var i = 2; i < this._pendingPath.length; i++)
			{
				var checkPt = this._pendingPath[i];
				var sameTrack = horizontal ? checkPt.y == firstPt.y : checkPt.x == firstPt.x;
				if (!sameTrack)
					break;
			}
			this._pendingPath.splice(0, i - 1);
		}

		var nextPt = this._pendingPath[0];
		this.MoveTo(nextPt.x, nextPt.y);
	},

	_finishedPath : function()
	{
		this._pendingPath = null;
	}
});

NavigationManager =
{
	_world : null,
	_pathFinders : [],
	_semantics : null,
	_interRegionPathFinder : null,

	SetWorld : function(world)
	{
		this._world = world;
		this._pathFinders.length = 0;
		this._semantics = new WorldPathSemantics(world);
		this._interRegionPathFinder = new PathFinder(new InterRegionPathSemantics(world));
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
		return new PathFinder(this._semantics);
	},

	GetInterRegionPathFinder : function()
	{
		return this._interRegionPathFinder;
	}
};

var WorldPathSemantics = Class(
{
	constructor : function(world)
	{
		this._world = world;
	},

	ReachedDestination : function(current, dest)
	{
		return current.x == dest.x && current.y == dest.y;
	},

	GetKey : function(point)
	{
		return point.y * this._world.MapWidth + point.x;
	},

	GetNeighbours : function(point)
	{
		return [
			{ x : point.x, y : point.y - 1 },
			{ x : point.x + 1, y : point.y },
			{ x : point.x, y : point.y + 1 },
			{ x : point.x - 1, y : point.y }
		]
	},

	GetMovementCost : function(from, to)
	{
		return 0.5;
	},

	GetHeuristicCost : function(current, dest)
	{
		return Math.abs(dest.x - current.x) + Math.abs(dest.y - current.y);
	}
});

var InterRegionPathSemantics = Class(
	{
		constructor : function(world)
		{
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
		this._semantics = semantics;
		this._nodes = {};
	},

	_newNode : function(point, parent, g, h, f)
	{
		var node = {};
		node.point = point;
		node.parent = parent;
		node.id = this._semantics.GetKey(point);
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
		if(this._semantics == null)
			throw("Exception: You have to provide semantics for the path finding");

		var path = [];
		var start = this._newNode(from, null, -1,-1,-1);
		var open = new PriorityQueue();
		open.push(start, 0);
		while(open.size() > 0)
		{
			var currentNode = open.pop();
			if(this._semantics.ReachedDestination(currentNode.point, to))
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

			var neighbours = this._semantics.GetNeighbours(currentNode.point);
			for (var i = 0; i < neighbours.length; i++)
			{
				var nextPoint = neighbours[i];
				var id = this._semantics.GetKey(nextPoint);
				var nextNode = this._nodes[id] || this._newNode(nextPoint, currentNode, -1, -1, -1);

				if (nextNode.closed)
					continue;

				var g = this._semantics.GetMovementCost(currentNode.point, nextPoint);
				if (nextNode.g >= 0 && nextNode.g <= g)
					continue;

				nextNode.parent = currentNode;
				nextNode.g = g;
				nextNode.h = this._semantics.GetHeuristicCost(nextPoint, to);
				nextNode.f = nextNode.g + nextNode.h;
				open.push(nextNode, nextNode.f);
			}
		}

		this._nodes = {};
		return path;
	}
});