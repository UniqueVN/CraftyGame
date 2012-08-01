var Rock = MapEntity.extend(
{
	Sprites : ['rock1', 'rock2']
});

var MapTree = MapEntity.extend(
{
	Sprites : ['deadCherryTree0', 'deadCherryTree1'],
	TreeID: 0,

	initialize: function()
	{
		this.TreeID = Crafty.math.randomInt(0, this.Sprites.length - 1);
		var entity = Crafty.e("2D, Canvas, Body, Static, " + this.Sprites[this.TreeID])
			.attr({z:2, TileWidth: 1, TileHeight: 1});
		this.set({'entity' : entity });
	},

	Appear: function(world, x, y)
	{
		var TreeSize = [{w: 4, h: 4}, {w: 3, h: 4}];

		var w = TreeSize[this.TreeID].w;
		var h = TreeSize[this.TreeID].h;

		this.getEntity().Appear(world, x - Math.floor(w / 2), y);
		return this;
	},
});

var TreeManager = Class({
	constructor: function() {
		// var trees = ["cherryTree0", "cherryTree1"];
		                    // treetrunk1: [1, 0]
		// var trees = ["deadTree", "cherryTree0", "cherryTree1"];
		var trees = ["deadTree", "treeStump"];
		this.treeSprites = [];
		for (var i = 0; i < trees.length; i++) {
			this.treeSprites.push(Crafty.e(trees[i]));
		}
	},

	draw: function(context, treeID, x, y) {
		var treeSprite = this.treeSprites[treeID];
		var srcX = treeSprite.__coord[0];
		var srcY = treeSprite.__coord[1];
		var w = treeSprite.__coord[2];
		var h = treeSprite.__coord[3];
		var destX = x - Math.floor(w / 2);
		var destY = y - h;
		// Draw the tree
		context.drawImage(treeSprite.img,
			srcX, srcY, w, h,
			destX, destY, w, h);
	}
});
