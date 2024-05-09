import { describe, test, expect } from 'vitest';
import { DirectedGraph } from '../directed-graph';

describe('DirectedGraph', () => {
    test('simple graph with no cycles', () => {
        const graph = new DirectedGraph<string>();

        graph.addVertex('A', { name: 'A' });
        graph.addVertex('B', { name: 'B' });
        graph.addVertex('C', { name: 'C' });
        graph.addVertex('D', { name: 'D' });
        graph.addVertex('E', { name: 'E' });

        graph.addEdge('A', 'B');
        graph.addEdge('B', 'C');
        graph.addEdge('C', 'D');
        graph.addEdge('D', 'E');

        // console.log('A -> B -> C -> D -> E');

        const sorted = graph.topSort();

        expect(sorted).toEqual(['A', 'B', 'C', 'D', 'E']);
    });

    test('single looped cycle throws an exception', () => {
        const graph = new DirectedGraph<string>();

        graph.addVertex('A', { name: 'A' });
        graph.addVertex('B', { name: 'B' });
        graph.addVertex('C', { name: 'C' });
        graph.addVertex('D', { name: 'D' });
        graph.addVertex('E', { name: 'E' });

        graph.addEdge('A', 'B');
        graph.addEdge('B', 'C');
        graph.addEdge('C', 'D');
        graph.addEdge('D', 'E');
        graph.addEdge('E', 'A');

        // console.log('A -> B -> C -> D -> E -> A');

        expect(() => graph.topSort()).toThrow();
    });

    test('partial cycle throws an exception', () => {
        const graph = new DirectedGraph<string>();

        graph.addVertex('A', { name: 'A' });
        graph.addVertex('B', { name: 'B' });
        graph.addVertex('C', { name: 'C' });
        graph.addVertex('D', { name: 'D' });
        graph.addVertex('E', { name: 'E' });

        graph.addEdge('A', 'B');
        graph.addEdge('B', 'C');
        graph.addEdge('C', 'D');
        graph.addEdge('D', 'E');
        graph.addEdge('E', 'C');

        // console.log('A -> B -> C -> D -> E -> C');

        expect(() => graph.topSort()).toThrow();
    });

    test('graph with multiple dependencies', () => {
        const graph = new DirectedGraph<string>();

        graph.addVertex('A', { name: 'A' });
        graph.addVertex('B', { name: 'B' });
        graph.addEdge('B', 'A');

        // B -- A

        graph.addVertex('C', { name: 'C' });

        graph.addEdge('B', 'C');
        graph.addEdge('C', 'A');

        /**
         *  /-- C -\
         * B  ----  A
         *
         */

        graph.addVertex('D', { name: 'D' });

        graph.addEdge('A', 'D');
        graph.addEdge('C', 'D');

        /**
         *  /-- C -\-----\
         * B  ----  A --- D
         *
         */

        const sorted = graph.topSort();

        // console.log('B -> C -> A -> D');

        expect(sorted).toEqual(['B', 'C', 'A', 'D']);
    });

    test('graph with a vertex that is skipped in the topological sort', () => {
        const graph = new DirectedGraph<string>();

        graph.addVertex('A', { name: 'A' });
        graph.addVertex('B', { name: 'B', excludeFromSort: true });
        graph.addVertex('C', { name: 'C' });

        graph.addEdge('A', 'B');
        graph.addEdge('B', 'C');

        const sorted = graph.topSort();

        expect(sorted).toEqual(['A', 'C']);
    });
});
