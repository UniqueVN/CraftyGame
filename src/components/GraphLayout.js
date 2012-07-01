Crafty.c('GraphLayout', {
    graph: new Graph(),
    nodes: [],
    nodeCount: 0,    
    maxNeighbour: 0,    
    layout: null,
    neighbour: [],
    
    generateGraph: function(nodeCount, maxNeighbour) {
        this.nodeCount = nodeCount;
        this.maxNeighbour = maxNeighbour;

        for (var i = 0; i < this.nodeCount; i++) {
            var newNode = this.graph.newNode(i, {label: "Island_" + i});
            this.nodes.push(newNode);
            this.neighbour[i] = [];
        }

        for (var i = 0; i < this.nodeCount - 1; i++) {
            var j = i + 1;
            var t = this.neighbour[i].length;
            while (j < this.nodeCount - 1 && t < maxNeighbour) {
                j = Crafty.math.randomInt(j + 1, this.nodeCount - 1);
                if (this.neighbour[j] >= maxNeighbour)
                    continue;
                t++;
                this.neighbour[i].push(j);
                this.neighbour[j].push(i);
                this.graph.newEdge(this.nodes[i], this.nodes[j]);
            }
        }

        return this;
    },

    generateGraphLayout: function(OnDone, listener) {
        var stiffness = 500.0;
        var repulsion = 1500.0;
        var damping = 0.6;
        
        this.layout = new Layout.ForceDirected(this.graph, stiffness, repulsion, damping);
        this.layout.start(0.02, undefined, OnDone, listener);
        
        return this;
    }
});
