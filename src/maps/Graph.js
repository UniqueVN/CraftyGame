// ========================================================================================== //
// GRAPH
var Graph = Class({
	constructor: function() {
	    this.nodes = [];
	},

    generateGraphLayout: function(width, height, dx, dy) {
        //return this;
    },
	

	generateGraph: function(nodeCount, maxEdge) {
		this.populateNodes(nodeCount);
	},

	populateNodes: function(nodeCount) {
		for (var i = 0; i < nodeCount; i++) {
			this.nodes.push(new Node(i));
		}
	},
	
	// Check whether 2 nodes are connected
	isConnected: function(i0, i1) {
		if (this.nodes[i0] === undefined)
			return false;

		return this.nodes[i0].isConnectedTo(this.nodes[i1]);
	},

	debug: function() {
		debug.log("Graph: ", this);
		for (var i = 0; i < this.nodes.length; i++) {
			var str = i + " : ";
			var curNode = this.nodes[i];
			for (var j = 0; j < curNode.links.length; j++) {
				str += curNode.links[j].id + " ";
			}
			
			debug.log(str);
		}
	}
});

// ========================================================================================== //
// GENERAL TREE
var Tree = Class(Graph, {
	constructor: function() {
		Tree.$super.call(this);
		this.root = undefined;
	},
	
	populateNodes: function(nodeCount) {
		for (var i = 0; i < nodeCount; i++) {
			this.nodes.push(new TreeNode(i));
		}
	},

	generateDirectionalTree: function(depth, dirCount) {
		var nodeCount = depth * dirCount + 1;
		this.populateNodes(nodeCount);

		this.nodes[0].depth = 0;
		this.root = this.nodes[0];

		var t = 1;
		for (var i = 0; i < dirCount; i++)	{

			this.root.addChild(this.nodes[t]);
			this.nodes[t].parent = this.root;
			this.nodes[t].depth = 1;

			for (var j = 1; j < depth; j++) {
				this.nodes[t].addChild(this.nodes[t + 1]);
				this.nodes[t + 1].parent = this.nodes[t];
				this.nodes[t + 1].depth = j + 1;

				t++;
			}
			t++;
		}

		this.computeDepth(this.root);
		this.countLeaf(this.root);
	},

	generateGraph: function(nodeCount, maxEdge, maxDepth) {
		this.populateNodes(nodeCount);

		var t = 0;
		this.nodes[0].depth = 0;

		for (var i = 1; i < nodeCount; i++) {
			t = i - 1;
			// Possible parent id
			var parentIDs = [];
			for (var j = 0; j < i; j++) {
				var checkNode = this.nodes[j];
				// If the node is not a root then count its parent too
				var edgeCount = checkNode.getChildNum() + (checkNode.isRoot() ? 0 : 1);
				if (edgeCount < maxEdge && checkNode.depth < maxDepth) {
					parentIDs.push(j);
					// Randomly choose to either use this node or not
					// var d = Math.floor(Math.random() * 3);
					// if (d > 1) {
					// 	t = j;
					// 	break;
					// }
				}
			}
			t = parentIDs[Math.floor(Math.random() * parentIDs.length)];

			this.nodes[t].addChild(this.nodes[i]);
			this.nodes[i].parent = this.nodes[t];
			this.nodes[i].depth = this.nodes[t].depth + 1;
		}

		// for (var i = 1; i < nodeCount; i++) {
		// 	while (true) {
		// 		t = Math.floor(Math.random() * i);				

		// 		var checkNode = this.nodes[t];
		// 		var isRoot = checkNode.isRoot();
		// 		// If the node is not a root then count its parent too
		// 		var edgeCount = checkNode.getChildNum() + (isRoot ? 0 : 1);
		// 		if (edgeCount < maxEdge && !this.isConnected(t, i))
		// 			break;
		// 	}
			
		// 	this.nodes[t].addChild(this.nodes[i]);
		// 	this.nodes[i].parent = this.nodes[t];
		// }

		this.root = this.nodes[0];
		this.computeDepth(this.root);
		this.countLeaf(this.root);
	},

	computeDepth: function(node) {
		if (node === this.root)
			node.depth = 0;

		for (var i = node.links.length - 1; i >= 0; i--) {
			node.links[i].depth = node.depth + 1;
			this.computeDepth(node.links[i]);
		};
	},
	
	countLeaf: function(node) {
		if (node === undefined)
			return 0;

		if (node.leafCount >= 0)
			return node.leafCount;

		if (node.isLeaf()) {
			node.leafCount = 1;
			return node.leafCount;	
		}

		for (var i = node.links.length - 1; i >= 0; i--) {
			node.leafCount += this.countLeaf(node.links[i]);
		};

		return node.leafCount;
	}	
});

// ========================================================================================== //
// BINARY TREE
var BinaryTree = Class(Graph, {
	constructor: function() {
		BinaryTree.$super.call(this);
	},
	
	generateGraph: function(nodeCount) {
		this.populateNodes(nodeCount);
		var t = 0;
		for (var i = 1; i < nodeCount; i++) {
			while (this.nodes[t].isFull() || this.isConnected(t, i)) {
				t = Math.floor(Math.random() * i);
			}
			
			this.nodes[t].addChild(this.nodes[i]);
		}

		this.root = this.nodes[0];
	},

	makeTreeRightHeavy: function(node){
		var leftNode = node.leftNode();
		var rightNode = node.rightNode();
		
		var left = 0;
		if (leftNode !== undefined) {
			left = leftNode.leafCount;
			this.makeTreeRightHeavy(leftNode);
		}

		var right = 0;
		if (rightNode !== undefined) {
			right = rightNode.leafCount;
			this.makeTreeRightHeavy(rightNode);
		}
		
		// Swap node's children if it's not right-heavy
		if (left > right)
			node.swapChildren();
	},

	populateNodes: function(nodeCount) {
		for (var i = 0; i < nodeCount; i++) {
			this.nodes.push(new BinaryNode(i));
		}
	}
});

// ========================================================================================== //
// NODE
var Node = Class({
	constructor: function(id) {
		this.id = id;
		this.x = 0;
		this.y = 0;
		// size of the node's region
		this.w = 0;
		this.h = 0;

		this.links = [];
	},

	setPosition: function(_x, _y) {
		this.x = _x;
		this.y = _y;
	},

	connectTo: function(node) {
		if (this.isConnectedTo(node))
			return;

		this.links.push(node);
	},

	isConnectedTo: function(node) {
		return (this.links.indexOf(node) > -1);
	}
});

// ========================================================================================== //
// TREE NODE
var TreeNode = Class(Node, {
	constructor: function(id) {
		TreeNode.$super.call(this, id);

		this.leafCount = -1;
		this.depth = -1;
		this.parent = null;
	},

	addChild: function(node) {
		this.links.push(node);
		return true;
	},

	getChildNum: function() {
		return this.links.length;
	},

	isRoot: function() {
		return this.parent === null;
	},

	isLeaf: function() {
		return (this.links.length === 0);
	}
});

// ========================================================================================== //
// BINARY NODE
var BinaryNode = Class(TreeNode, {
	constructor: function(id) {
		BinaryNode.$super.call(this, id);
	},

	addChild: function(node) {
		if (this.isFull())
			return false;

		return BinaryNode.$super.addChild.call(this, node);
	},

	leftNode: function() {
		return this.links[0];
	},

	rightNode: function() {
		return this.links[1];
	},

	isFull: function() {
		return (this.links.length === 2);
	},

	swapChildren: function() {
		var tmp = this.links[0];
		this.links[0] = this.right[1];
		this.links[1] = tmp;
	},

	invertOffsetX: function() {
		this.x = -this.x;

		if (this.links[0])
			this.links[0].invertOffsetX();
		if (this.links[1])
			this.links[1].invertOffsetX();
	},

	transposeOffset: function() {
		var tmp = this.x;
		this.x = this.y;
		this.y = tmp;

		if (this.links[0])
			this.links[0].transposeOffset();
		if (this.links[1])
			this.links[1].transposeOffset();
	}
});

// ========================================================================================== //
// GRAPH LAYOUT
var GraphLayout = Class({
	constructor: function(graph, nodeSize) {
		this.graph = graph;
		this.nodeSize = (nodeSize === undefined ? 1 : nodeSize);
		// this.nodePos = this.graph.nodePos;
	},

	createLayout: function() {
	}
});

// ========================================================================================== //
// GRID CENTER LAYOUT
var GridLayout = Class(GraphLayout, {
	constructor: function(graph, nodeSize) {
		GridLayout.$super.call(this, graph, nodeSize);
	},

	placeNode: function(node) {
		// Try to place the child nodes in either 1 of the 8 location arround the node
		// * * *
		// * O *
		// * * *

		var x0 = node.x;
		var y0 = node.y;

		var DIRECTION = [{x: 0, y: 1}, {x: 1, y: 0}, {x:-1, y:0}, {x: 0, y: -1},
						 {x: 1, y: 1}, {x: 1, y: -1}, {x: -1, y: 1}, {x: -1, y: -1}];

		if (node !== this.graph.root) {
			// SHUFFLE the direction list
			for (var i = 1; i < DIRECTION.length; i++) {
				// if (i === 4)
				// 	continue;
				// var t = i > 4 ? 4 : 0;
				// var j = random(t, i - 1);
				var j = random(0, i - 1);

				var tmp = DIRECTION[i];
				DIRECTION[i] = DIRECTION[j];
				DIRECTION[j] = tmp;
			}
		}

		for (var i = 0; i < node.links.length; i++) {
			var x1, y1;
			// Select an empty place in the grid
			for (var d = 0; d < DIRECTION.length; d++) {
				x1 = x0 + DIRECTION[d].x;
				y1 = y0 + DIRECTION[d].y;

				if (x1 >= 0 && y1 >= 0 && x1 < this.grid.length && y1 < this.grid.length &&
					this.grid[x1][y1] === 0 && this.canConnect(x0, y0, x1, y1)) {
					break;
				}
			}

			var childNode = node.links[i];

			childNode.x = x1;
			childNode.y = y1;
			this.grid[x1][y1] = 1;

			this.lines.push(x0, y0, x1, y1);
		}

		// Only layout the child node's children after all the direct children are placed
		for (var i = 0; i < node.links.length; i++) {
			this.placeNode(node.links[i]);
		}
	},

	canConnect: function(x0, y0, x1, y1) {
		// Check to see if any line cut this line
		for (var i = 0; i < this.lines.length; i++) {
			var bCut = false;
		}

		return true;
	},

	createGrid: function() {
		var nodeCount = this.graph.nodes.length;

		this.grid = [];
		for (var i = 0; i < nodeCount; i++) {
			this.grid[i] = [];
			for (var j = 0; j < nodeCount; j++) {
				this.grid[i][j] = 0;
			}
		}

		this.lines =[];
	},

	createLayout: function() {
		this.createGrid();

		var nodeCount = this.graph.nodes.length;
		var nodeSize = this.nodeSize;
		var root = this.graph.root;
		root.x = Math.floor(nodeCount / 2);
		root.y = Math.floor(nodeCount / 2);
		this.grid[root.x][root.y] = 1;

		this.placeNode(root);

		var minX = root.x;
		var minY = root.y;

		// Found the boundary
		for (var i = this.graph.nodes.length - 1; i >= 0; i--) {
			var node = this.graph.nodes[i];
			if (node.x < minX) minX = node.x;
			if (node.y < minY) minY = node.y;
		};

		debug.log(minX, minY);

		// Fix the offset for the nodes
		for (var i = this.graph.nodes.length - 1; i >= 0; i--) {
			var node = this.graph.nodes[i];
			node.x = (node.x - minX) * nodeSize;
			node.y = (node.y - minY) * nodeSize;
		};

		debug.log(this.graph.nodes);
	}

});

// ========================================================================================== //
// HORIZONTAL VERIZONTAL LAYOUT
var HVLayout = Class(GraphLayout, {
	constructor: function(graph, nodeSize) {
		HVLayout.$super.call(this, graph, nodeSize);
	},
	
	computeNodeSize: function(node) {
		var s = this.nodeSize;
		if (node === undefined)
			return {w: 0, h: 0};
		
		var leftNode = node.leftNode();
		var rightNode = node.rightNode();
			
		// Create layout for left node
		var leftSize = this.computeNodeSize(leftNode);
		// Create layout for right node
		var rightSize = this.computeNodeSize(rightNode);
		
		var layoutSize = {w: 0, h: 0};
		layoutSize.w = Math.max(leftSize.w, s) + rightSize.w;
		layoutSize.h = Math.max(leftSize.h + s, rightSize.h);

		// Change size of current node
		//node.SetSize(layoutSize);
		// Set offset for child nodes
		if (leftNode !== undefined) {
			leftNode.setPosition(0, s);
		}
		// _Put other tree to the right of current node's position
		if (rightNode !== undefined) {
			rightNode.setPosition(Math.max(leftSize.w, s), 0);
		}

		return layoutSize;
	},
	
	computeLayoutPos: function(node) {
		var x0 = node.x;
		var y0 = node.y;

		for (var i = node.links.length - 1; i >= 0; i--) {
			var checkNode = node.links[i];
			checkNode.x += x0;
			checkNode.y += y0;
			
			this.computeLayoutPos(checkNode);
		}
	},

	createLayout: function() {
		this.computeNodeSize(this.graph.root);
		this.computeLayoutPos(this.graph.root);
		// this.graph.nodePos = this.nodePos;
	}
});

// ========================================================================================== //
// RECURSIVE WINDING LAYOUT
var RecursiveWindingLayout = Class(HVLayout, {
	constructor: function(graph, nodeSize) {
		RecursiveWindingLayout.$super.call(this, graph, nodeSize);		
	},
	
	findRightNode: function() {
		var totalNodes = this.graph.nodes.length;
		var limitNodes = Math.sqrt(totalNodes * Math.log(totalNodes));
		var node = this.graph.root;

		var totalLeaf = this.graph.countLeaf(this.graph.root);
		if (totalLeaf < limitNodes)
			return node;
			
		while (node.leafCount > totalLeaf - limitNodes) {
			var rightNode = node.rightNode();
			if (rightNode === undefined || rightNode.leafCount <= totalLeaf - limitNodes)
				break;
				
			node = rightNode;
		}
		return node;
	},
	
	createLayout: function() {
		// Turn the tree into right-heavy tree
		var rootNode = this.graph.root;
		this.graph.makeTreeRightHeavy(rootNode);
		this.graph.countLeaf(rootNode);
		this.graph.computeDepth(rootNode);
		
		var s = this.nodeSize;

		//BinNode* rightNode = root->RightNode();
		var rightNode = this.findRightNode();
		var rlNode = rightNode.leftNode();
		var rrNode = rightNode.rightNode();
		
		// Vertical combine 2 subtrees
		var rlSize = this.computeNodeSize(rlNode);
		var rrSize = this.computeNodeSize(rrNode);
		if (rlNode !== undefined) {
			rlNode.setPosition(s, 0);
		}
		if (rrNode !== undefined) {
			rrNode.setPosition(0, Math.max(rlSize.h, s));
		}

		if (rightNode.depth == 0) {
		}
		else if (rightNode.depth == 1) {
			var leftNode = rootNode.leftNode();
			var leftSize = this.computeNodeSize(leftNode);
			
			if (leftNode !== undefined) {
				this.transposeOffset(leftNode);
				leftNode.setPosition(Math.max(rlSize.w + s, rrSize.w), 0);
			}
			
			rightNode.setPosition(0, s);
		}
		else {
			var node = rootNode;
			var leftNode;
			var size;
			var offset = {x: 0, y: 0};
			var rOffset = {x: 0, y: 0};
			while (node.rightNode() !== rightNode) {
				leftNode = node.leftNode();
				size = this.computeNodeSize(leftNode);
				
				if (leftNode !== undefined)
					leftNode.setPosition(0, s);
					
				if (nodeID !== 0)
					node.setPosition(offset.x, offset.y);

				node = node.rightNode();

				offset.x = Math.max(size.w, s);
				rOffset.y = Math.max(rOffset.y, size.h + s);
			}
			
			// Place T[k-1]
			node.setPosition(offset.x, offset.y);
			leftNode = node.leftNode();
			size = this.computeNodeSize(leftNode);
			if (leftNode !== undefined) {
				leftNode.transposeOffset();
				leftNode.setPosition(s, 0);
			}
			
			// Place T' & T''
			rOffset.y = Math.max(rOffset.y, size.y);
			rightNode.setPosition(rOffset.x, rOffset.y);
			if (rlNode !== undefined)
				rlNode.invertOffsetX();
			if (rrNode !== undefined)
				rrNode.invertOffsetX();
		}

		this.computeLayoutPos(rootNode);
	}
});

// ========================================================================================== //
// GRAPH RENDERER
var GraphRenderer = Class({
	constructor: function(renderer) {
		this.renderer = renderer;
		this.graph = {};

		this.lines = [];
		this.nodes = [];

		this.offsetX = 0;
		this.offsetY = 0;
		this.scale = 1;
		this.nodeSize = 1;

		this.lineColor = 0;
		this.nodeColor = 0;

		this.lineWidth = 1;

		this.nodeRenderer = undefined;
	},

	setGraph: function(graph) {
		if (!graph || this.graph === graph)
			return;

		this.graph = graph;

		this.lines = [];
		this.nodes = [];

		// Process graph
		// Generate node position
		for (var i = 0; i < this.graph.nodes.length; i++) {
			var node = this.graph.nodes[i];
			var p = { x: node.x, y: node.y };
			p.x = p.x * this.scale + this.offsetX;
			p.y = p.y * this.scale + this.offsetY;
			this.nodes.push(p);
		}
		// Generate lines
		for (var i = 0; i < this.graph.nodes.length; i++) {
			var curNode = this.graph.nodes[i];
			var t0 = i;
			for (var j = 0; j < curNode.links.length; j++) {
				var t1 = curNode.links[j].id;

				this.lines.push({p0: this.nodes[t0], p1: this.nodes[t1]});
			}
		}
	},

	draw: function(graph) {
		this.setGraph(graph);

		// Draw all the line
		this.renderer.setColor(this.lineColor);
		this.renderer.setLineWidth(this.lineWidth);
		for (var i = this.lines.length - 1; i >= 0; i--) {
			// this.renderer.drawLine(this.lines[i].p0, this.lines[i].p1);
			this.renderer.drawLine(this.lines[i].p0, this.lines[i].p1);
		};

		// Draw all the nodes
		this.renderer.setColor(this.nodeColor);
		for (var i = this.nodes.length - 1; i >= 0; i--) {
			var p = this.nodes[i];

			if (this.nodeRenderer === undefined)
				this.renderer.drawCircle(p.x, p.y, this.nodeSize, 1);
			else
				this.nodeRenderer.draw(this.renderer, p.x - this.nodeSize, p.y - this.nodeSize, 
										this.nodeSize * 2);
			// this.renderer.drawCircle(p.x, p.y, this.nodeSize * 2, NODE_COLOR);
			// this.renderer.setColor("#000000");
			// this.renderer.drawText(i + "", p.x - 5, p.y + 5);
		};
	}
});

// ========================================================================================== //
// TREE RENDERER
var TreeRenderer = Class(GraphRenderer, {
	constructor: function(renderer) {
		TreeRenderer.$super.call(this, renderer);

		this.leafSize = -1;
		this.rootSize = -1;
	},

	draw: function(graph) {
		this.setGraph(graph);

		// Draw all the line
		this.renderer.setColor(this.lineColor);
		this.renderer.setLineWidth(this.lineWidth);
		for (var i = this.lines.length - 1; i >= 0; i--) {
			// this.renderer.drawLine(this.lines[i].p0, this.lines[i].p1);
			this.renderer.drawLine(this.lines[i].p0, this.lines[i].p1);
		};

		// Draw all the nodes
		this.renderer.setColor(this.nodeColor);
		for (var i = this.nodes.length - 1; i >= 0; i--) {
			var p = this.nodes[i];

			var nodeSize = this.nodeSize;
			var checkNode = this.graph.nodes[i];
			if (checkNode.isLeaf())
				nodeSize = this.leafSize;
			else if (checkNode.isRoot())
				nodeSize = this.rootSize;

			if (this.nodeRenderer === undefined)
				this.renderer.drawCircle(p.x, p.y, nodeSize, 1);
			else
				this.nodeRenderer.draw(this.renderer, p.x - nodeSize, p.y - nodeSize, 
										nodeSize * 2);
			// this.renderer.drawCircle(p.x, p.y, this.nodeSize * 2, NODE_COLOR);
			// this.renderer.setColor("#000000");
			// this.renderer.drawText(i + "", p.x - 5, p.y + 5);
		};
	}
});

// ========================================================================================== //
// NODE RENDERER
// var NodeRenderer = Class({
// 	constructor: function(render) {
// 		this.render = renderer;
// 	},

// 	draw: function(x0, y0) {

// 	}
// });