/**
 * @private
 */
var prioritySortLow = function(a, b) {
	return b.priority - a.priority;
};

/**
 * @private
 */
var prioritySortHigh = function(a, b) {
	return a.priority - b.priority;
};

/*global PriorityQueue */
/**
 * @constructor
 * @class PriorityQueue manages a queue of elements with priorities. Default
 * is highest priority first.
 *
 * @param [options] If low is set to true returns lowest first.
 */
var PriorityQueue = function(options) {
	var contents = [];

	var sorted = false;
	var sortStyle;

	if(options && options.high) {
		sortStyle = prioritySortHigh;
	} else {
		sortStyle = prioritySortLow;
	}

	/**
	 * @private
	 */
	var sort = function() {
		contents.sort(sortStyle);
		sorted = true;
	};

	var self = {
		/**
		 * Removes and returns the next element in the queue.
		 * @member PriorityQueue
		 * @return The next element in the queue. If the queue is empty returns
		 * undefined.
		 *
		 * @see PrioirtyQueue#top
		 */
		pop: function() {
			if(!sorted) {
				sort();
			}

			var element = contents.pop();

			if(element) {
				return element.object;
			} else {
				return undefined;
			}
		},

		/**
		 * Returns but does not remove the next element in the queue.
		 * @member PriorityQueue
		 * @return The next element in the queue. If the queue is empty returns
		 * undefined.
		 *
		 * @see PriorityQueue#pop
		 */
		top: function() {
			if(!sorted) {
				sort();
			}

			var element = contents[contents.length - 1];

			if(element) {
				return element.object;
			} else {
				return undefined;
			}
		},

		/**
		 * @member PriorityQueue
		 * @param object The object to check the queue for.
		 * @returns true if the object is in the queue, false otherwise.
		 */
		includes: function(object) {
			for(var i = contents.length - 1; i >= 0; i--) {
				if(contents[i].object === object) {
					return true;
				}
			}

			return false;
		},

		/**
		 * @member PriorityQueue
		 * @returns the current number of elements in the queue.
		 */
		size: function() {
			return contents.length;
		},

		/**
		 * @member PriorityQueue
		 * @returns true if the queue is empty, false otherwise.
		 */
		empty: function() {
			return contents.length === 0;
		},

		/**
		 * @member PriorityQueue
		 * @param object The object to be pushed onto the queue.
		 * @param priority The priority of the object.
		 */
		push: function(object, priority) {
			contents.push({object: object, priority: priority});
			sorted = false;
		}
	};

	return self;
};

var Math3D =
{
	Scale : function(vector, scalar)
	{
		var newVec = {};
		newVec.x = vector.x * scalar;
		newVec.y = vector.y * scalar;
		return newVec;
	},

	Add : function(v1, v2)
	{
		var v = {};
		v.x = v1.x + v2.x;
		v.y = v1.y + v2.y;
		return v;
	},

	Delta : function(from, to)
	{
		var d = {};
		d.x = to.x - from.x;
		d.y = to.y - from.y;
		return d;
	},

	Direction : function(from, to)
	{
		var dir = this.Delta(from, to);
		return this.Normalize(dir);
	},

	Normalize : function(vector)
	{
		var x = vector.x;
		var y = vector.y;
		var l = Math.sqrt(x * x + y * y);
		if (l === 0)
		{
			vector.x = vector.y = 0;
		}
		else
		{
			vector.x /= l;
			vector.y /= l;
		}
		return vector;
	},

	GetNormal : function(vector)
	{
		var v = { x : vector.x, y : vector.y };
		this.Normalize(v);
		return v;
	},

	Distance : function(from, to)
	{
		var x = to.x - from.x;
		var y = to.y - from.y;
		return Math.sqrt(x * x + y * y);;
	},

	DistanceSq : function(from, to)
	{
		var x = to.x - from.x;
		var y = to.y - from.y;
		return x * x + y * y;
	},

	Dot : function(v1, v2)
	{
		return v1.x * v2.x + v1.y * v2.y;
	},

	Size : function(vector)
	{
		return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
	},

	SizeSq : function(vector)
	{
		return vector.x * vector.x + vector.y * vector.y;
	},

	ClosestPointOnSegment : function(start, end, point)
	{
		var a = Math3D.Delta(start, end);
		var b = Math3D.Delta(start, point);
		var p = Math3D.Dot(a, b);
		var la = Math3D.SizeSq(a);
		if (p <= 0)
		{
			return start;
		}
		else if (p >= la)
		{
			return end;
		}
		else
		{
			var k = p / la;
			return { x : start.x + a.x * k, y : start.y + a.y * k  };
		}
	}
};

var DirectionToString = function(dir)
{
	if (dir.x === 0 && dir.y === 0)
	{
		return "";
	}
	else if (dir.x < -0.70711)
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
};
