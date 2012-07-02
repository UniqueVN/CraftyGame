Crafty.c('NavigationHandle',
{
	init : function()
	{
		if (!this.has("Body"))
			throw new Error("Must have body to move around!");
		return this;
	},

	NavigateTo : function(x, y)
	{
		var from = this.GetCenterTile();
		var to = { X: x, Y : y };
		var path = NavigationManager.GetPathFinder().FindPath(from, to);
	}
});

NavigationManager =
{
	_world : null,
	_pathFinders : [],
	_semantics : null,

	SetWorld : function(world)
	{
		this._world = world;
		this._pathFinders.length = 0;
		this._semantics = new WorldPathSemantics(world);
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
	}
}

WorldPathSemantics = Class.create(
{
	_world : null,

	initialize : function(world)
	{
		this._world = world;
	},

	ReachedDestination : function(current, dest)
	{
		return current.X == dest.X && current.Y == dest.Y;
	},

	GetKey : function(point)
	{
		return point.Y * this._world.TileWidth + point.X;
	},

	GetNeighbours : function(point)
	{
		return [
			{ X : point.X, Y : point.Y - 1 },
			{ X : point.X + 1, Y : point.Y },
			{ X : point.X, Y : point.Y + 1 },
			{ X : point.X - 1, Y : point.Y }
		]
	},

	GetMovementCost : function(from, to)
	{
		return 0.5;
	},

	GetHeuristicCost : function(current, dest)
	{
		return Math.abs(dest.X - current.X) + Math.abs(dest.Y - current.Y);
	}
});

PathFinder = Class.create(
{
	_semantics : null,
	_nodes : {},

	initialize : function(semantics)
	{
		this._semantics = semantics;
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
				path.push(to);
				while(currentNode.parent != null)
				{
					currentNode = currentNode.parent;
					path.unshift(currentNode.point);
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
				var nextNode = this._nodes[nextPoint] || this._newNode(nextPoint, currentNode, -1, -1, -1);

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