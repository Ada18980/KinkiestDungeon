"use strict";

/**
 * A class representing a directed graph. The graph consists of string nodes, and edges defined by string to/from
 * 2-tuples
 */
class DirectedGraph {
	/**
	 * @param {string[]} vertices
	 * @param {[string, string][]} edges
	 */
	constructor(vertices, edges) {
		this.vertices = vertices;
		this.size = vertices.length;
		this.edges = edges;
		this.adjacencyList = this.buildAdjacencyList();
	}

	/**
	 * Constructs and sets the adjacency list for this graph based on its edge definitions
	 * @returns {Record<string, string[]>} - The adjacency list for the graph
	 */
	buildAdjacencyList() {
		/** @type {Record<string, string[]>} */
		const adjacencyList = {};
		for (const v of this.vertices) {
			adjacencyList[v] = [];
		}
		for (const [v1, v2] of this.edges) {
			if (!adjacencyList[v1].includes(v2)) {
				adjacencyList[v1].push(v2);
			}
		}
		return adjacencyList;
	}

	/**
	 * Creates a new subgraph of this graph by removing a given vertex, along with all edges attached to that vertex
	 * @param {string} vertex - The vertex to remove
	 * @returns {DirectedGraph} - The subgraph of this graph obtained by removing the given vertex and all attached
	 * edges
	 */
	removeVertex(vertex) {
		return new DirectedGraph(
			this.vertices.filter(v => v !== vertex),
			this.edges.filter(e => e[0] !== vertex && e[1] !== vertex),
		);
	}

	/**
	 * Creates a new subgraph of this graph by keeping only the given vertices and any edges between them
	 * @param {string[]} vertices - The vertices to keep
	 * @returns {DirectedGraph} - The subgraph of this graph obtained by only keeping the given vertices and any edges
	 * between them
	 */
	subgraphFromVertices(vertices) {
		return new DirectedGraph(
			this.vertices.filter(v => vertices.includes(v)),
			this.edges.filter(e => vertices.includes(e[0]) && vertices.includes(e[1])),
		);
	}

	/**
	 * Calculates the strongly connected components of the graph using Tarjan's strongly connected components algorithm.
	 * See https://en.wikipedia.org/wiki/Tarjan%27s_strongly_connected_components_algorithm
	 * @returns {string[][]} - An array containing the strongly connected components of this graph, each represented as
	 * an array of vertex numbers
	 */
	getStronglyConnectedComponents() {
		let index = 0;
		const stack = [];
		const components = [];
		const vertexMap = {};
		for (const v of this.vertices) {
			vertexMap[v] = { vertex: v };
		}
		const allEdges = this.edges.map(([v1, v2]) => [vertexMap[v1], vertexMap[v2]]);

		const strongConnect = (v) => {
			v.index = index;
			v.lowLink = index;
			stack.push(v);
			v.onStack = true;
			index++;

			const successors = allEdges
				.filter(([v1, v2]) => v1 === v)
				.map(([v1, v2]) => v2);

			for (const w of successors) {
				if (w.index == null) {
					strongConnect(w);
					v.lowLink = Math.min(v.lowLink, w.lowLink);
				} else if (w.onStack) {
					v.lowLink = Math.min(v.lowLink, w.index);
				}
			}

			if (v.lowLink === v.index) {
				const scc = [];
				let w;
				do {
					w = stack.pop();
					w.onStack = false;
					scc.push(w.vertex);
				} while (w !== v);
				components.push(scc);
			}
		};

		for (const v of Object.values(vertexMap)) {
			if (v.index == null) {
				strongConnect(v);
			}
		}

		return components;
	}

	/**
	 * Finds all simple cycles in this graph using Johnson's algorithm (see https://epubs.siam.org/doi/10.1137/0204007)
	 * @returns {string[][]}
	 */
	findCycles() {
		const stack = [];
		const blocked = [];
		const blockMap = [];
		const cycles = [];
		/** @type {DirectedGraph} */
		let subgraph = this;
		let startVertex;
		let currentComponent;
		let componentGraph;

		for (let i = 0; i < this.size; i++) {
			blockMap.push([]);
		}

		const unblock = (v) => {
			blocked[v] = false;
			for (const w of blockMap[v]) {
				if (blocked[w]) unblock(w);
			}
		};

		const cycle = (v) => {
			let f = false;
			stack.push(v);
			blocked[v] = true;
			for (const w of componentGraph.adjacencyList[v]) {
				if (w === startVertex) {
					cycles.push(stack.concat(startVertex));
					f = true;
				} else if (!blocked[w]) {
					if (cycle(w)) {
						f = true;
					}
				}
			}
			if (f) {
				unblock(v);
			} else {
				for (const w of componentGraph.adjacencyList[v]) {
					if (!blockMap[w].includes(v)) {
						blockMap[w].push(v);
					}
				}
			}
			stack.pop();
			return f;
		};

		for (startVertex of this.vertices) {
			const connectedComponents = subgraph.getStronglyConnectedComponents();
			currentComponent = connectedComponents.find(c => c.includes(startVertex));
			componentGraph = subgraph.subgraphFromVertices(currentComponent);
			for (const vertex of currentComponent) {
				blocked[vertex] = false;
				blockMap[vertex] = [];
			}
			cycle(startVertex);
			subgraph = subgraph.removeVertex(startVertex);
		}

		return cycles;
	}
}
