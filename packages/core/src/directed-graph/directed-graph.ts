import { Queue } from '../queue/queue';
import type { VertexID } from './types';

// Vertex represents a vertex in a directed graph.
class Vertex<T> {
    public name: string;
    public value: T;
    public inEdges: Set<Vertex<T>>;
    public outEdges: Set<Vertex<T>>;
    public excludeFromSort: boolean = false;
    public id: VertexID;

    get outEdgeCount() {
        return this.outEdges.size;
    }

    get inEdgeCount() {
        return this.inEdges.size;
    }

    constructor(
        value: T,
        {
            name,
            excludeFromSort,
            id,
        }: { name?: string; excludeFromSort?: boolean; id: VertexID }
    ) {
        this.value = value;
        this.name = name ?? 'Vertex';

        this.inEdges = new Set();
        this.outEdges = new Set();

        this.excludeFromSort = excludeFromSort ?? false;
        this.id = id;
    }
}

// TODO: Add transitive reduction to clean up graph edges
// DirectedGraph represents a directed acyclic graph.
export class DirectedGraph<T> {
    private _vertices: Map<string | symbol, Vertex<T>>;
    private _topsort: T[];
    private _lastAddedVertex: Vertex<T> | null;

    constructor() {
        this._vertices = new Map<string | symbol, Vertex<T>>();
        this._topsort = [];

        this._lastAddedVertex = null;
    }

    // exists checks to see if a vertex exists for a given id
    exists(id: string | symbol) {
        const vertex = this._vertices.get(id);

        return vertex ? true : false;
    }

    hasEdge(from: VertexID, to: VertexID) {
        const fromVertex = this._vertices.get(from);
        const toVertex = this._vertices.get(to);

        if (!fromVertex || !toVertex) {
            return false;
        }

        return fromVertex.outEdges.has(toVertex);
    }

    // getVertex returns the vertex with the given id, or undefined if it does not exist.
    getVertex(id: VertexID) {
        return this._vertices.get(id);
    }

    // addVertex adds a vertex to the graph.
    addVertex(
        value: T,
        options: {
            name?: string;
            excludeFromSort?: boolean;
            id: VertexID;
        }
    ) {
        let existingVertex = this._vertices.get(options.id);

        if (existingVertex) {
            // vertex already exists in graph
            return existingVertex;
        }

        let vertex = new Vertex(value, options);

        this._vertices.set(vertex.id, vertex);

        this._lastAddedVertex = vertex;

        return vertex;
    }

    excludeFromSort(id: VertexID, exclude: boolean) {
        const vertex = this._vertices.get(id);

        if (!vertex) {
            return;
        }

        vertex.excludeFromSort = exclude;
    }

    name(id: VertexID, name: string) {
        const vertex = this._vertices.get(id);

        if (!vertex) {
            return;
        }

        vertex.name = name;
    }

    changeId(id: VertexID, newId: VertexID) {
        const vertex = this._vertices.get(id);

        if (!vertex) {
            return;
        }

        if (this._vertices.has(newId)) {
            throw new Error('New id already exists in graph');
        }

        vertex.id = newId;
        this._vertices.set(newId, vertex);
        this._vertices.delete(id);
    }

    value(id: VertexID, value: T) {
        const vertex = this._vertices.get(id);

        if (!vertex) {
            return;
        }

        vertex.value = value;
    }

    // removeVertex removes a vertex from the graph.
    removeVertex(id: VertexID) {
        const vertexToRemove = this._vertices.get(id);

        if (!vertexToRemove) {
            // vertex does not exist in graph
            return;
        }

        // remove vertex from all edges
        for (const vertex of vertexToRemove.inEdges) {
            vertex.outEdges.delete(vertexToRemove);
        }

        for (const vertex of vertexToRemove.outEdges) {
            vertex.inEdges.delete(vertexToRemove);
        }

        // repair the dependency link
        // add an edge from each inEdge to each outEdge of the removed vertex
        for (const inVertex of vertexToRemove.inEdges) {
            for (const outVertex of vertexToRemove.outEdges) {
                inVertex.outEdges.add(outVertex);
                outVertex.inEdges.add(inVertex);
            }
        }

        // remove vertex
        this._vertices.delete(id);
    }

    // addVertexToEndOfGraph adds a vertex to the graph and adds an edge to the last added vertex
    addVertexToEndOfGraph(
        value: T,
        options: { name?: string; excludeFromSort?: boolean; id: VertexID }
    ) {
        let lastVertex = this._lastAddedVertex;
        let newVertex = this.addVertex(value, options);

        this._lastAddedVertex = newVertex;

        if (!lastVertex) {
            return;
        }

        this.addEdge(lastVertex.id, newVertex.id);
    }

    // addEdge adds an edge between two vertices.
    addEdge(from: VertexID, to: VertexID) {
        const fromVertex = this._vertices.get(from);
        const toVertex = this._vertices.get(to);

        if (!fromVertex || !toVertex) {
            // from or to vertex does not exist in graph
            // throw new Error("From or To value does not exist in graph")
            return;
        }

        if (
            fromVertex.outEdges.has(toVertex) &&
            toVertex.inEdges.has(fromVertex)
        ) {
            // edge already exists
            return;
        }

        fromVertex.outEdges.add(toVertex);
        toVertex.inEdges.add(fromVertex);
    }

    // removeEdge removes an edge between two vertices.
    removeEdge(from: VertexID, to: VertexID) {
        const fromVertex = this._vertices.get(from);
        const toVertex = this._vertices.get(to);

        if (!fromVertex || !toVertex) {
            // from or to vertex does not exist in graph
            // throw new Error("From or To value does not exist in graph");
            return;
        }

        if (
            !fromVertex.outEdges.has(toVertex) &&
            !toVertex.inEdges.has(fromVertex)
        ) {
            // edge does not exist
            return;
        }

        fromVertex.outEdges.delete(toVertex);
        toVertex.inEdges.delete(fromVertex);
    }

    // get sorted returns vertices in topological order
    get sorted() {
        return this._topsort;
    }

    // topSort returns the vertices in topological order using Kahn's algorithm
    topSort() {
        let inEdgeMap = new Map<Vertex<T>, number>();
        let queue = new Queue<Vertex<T>>();

        this._topsort = [];

        for (const vertex of this._vertices.values()) {
            inEdgeMap.set(vertex, vertex.inEdgeCount);

            if (vertex.inEdgeCount === 0) {
                queue.enqueue(vertex);
            }
        }

        if (queue.size === 0) {
            // graph has no vertices.  this could indicate a cycle as no vertices with 0 in-edges were found
            if (this._vertices.size !== 0) {
                throw new Error(
                    'No vertices with zero in-edges - Graph contains a cycle! Please check all depdencies and ensure that there are no circular dependencies.'
                );
            }

            // topsort called on an empty grpah
            this._topsort = [];
            return this._topsort;
        }

        let visited = new Set<Vertex<T>>();

        while (queue.size > 0) {
            // ts: nextVertex will always be valid here
            const nextVertex = queue.dequeue()!;
            visited.add(nextVertex);

            const count = inEdgeMap.get(nextVertex);

            if (count === 0 && !nextVertex.excludeFromSort) {
                this._topsort.push(nextVertex.value);
            }

            for (const edge of nextVertex.outEdges) {
                let inEdgeCount = inEdgeMap.get(edge);

                if (inEdgeCount !== undefined) {
                    inEdgeCount--;

                    inEdgeMap.set(edge, inEdgeCount);

                    if (inEdgeCount === 0) {
                        queue.enqueue(edge);
                    }
                }
            }
        }

        if (visited.size !== this._vertices.size) {
            // graph has a cycle
            throw new Error(
                'Graph contains a cycle! Please check all depedencies and ensure that there are no circular dependencies.'
            );

            // return this._topsort;
        }

        return this._topsort;
    }

    // Helper function to check if there's a path from `from` to `to` without using the direct edge.
    isPathWithoutDirectEdge(from: Vertex<T>, to: Vertex<T>): boolean {
        // Set to track visited vertices.
        let visited = new Set<Vertex<T>>();

        // Queue to implement BFS.
        let queue = [from];
        visited.add(from);

        while (queue.length > 0) {
            let current = queue.shift();

            // Check if we've reached the target.
            if (current === to) return true;

            // Traverse the outgoing edges.
            for (let neighbor of current!.outEdges) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
        }

        return false;
    }

    transitiveReduction() {
        // Go through each vertex in the graph.
        for (let fromVertex of this._vertices.values()) {
            let edgesToRemove = [];

            // Check each outgoing edge.
            for (let toVertex of fromVertex.outEdges) {
                if (this.isPathWithoutDirectEdge(fromVertex, toVertex)) {
                    edgesToRemove.push(toVertex);
                }
            }

            // Remove all identified redundant edges.
            for (let toVertex of edgesToRemove) {
                this.removeEdge(fromVertex.id, toVertex.id);
            }
        }
    }

    asciiVisualize() {
        for (let vertex of this._vertices.values()) {
            let connections = Array.from(vertex.outEdges)
                .map((v) => v.name)
                .join(', ');

            console.log(`${vertex.name} -> [${connections}]`);
        }
    }
}
