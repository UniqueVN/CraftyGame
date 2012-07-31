var Rock = MapEntity.extend(
{
	Sprites : ['rock1', 'rock2']
});

var TreeManager = Class({
	constructor: function() {
		// var trees = ["cherryTree0", "cherryTree1"];
		                    treetrunk1: [1, 0]
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
