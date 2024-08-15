import { describe, test, expect } from 'vitest';
import { DirectedGraph } from '../directed-graph/directed-graph';

describe('DirectedGraph', () => {
    test('simple graph with no cycles', () => {
        const graph = new DirectedGraph<string>();

        graph.addVertex('E', { name: 'E', id: 'E' });
        graph.addVertex('A', { name: 'A', id: 'A' });
        graph.addVertex('B', { name: 'B', id: 'B' });
        graph.addVertex('C', { name: 'C', id: 'C' });
        graph.addVertex('D', { name: 'D', id: 'D' });

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

        graph.addVertex('E', { name: 'E', id: 'E' });
        graph.addVertex('A', { name: 'A', id: 'A' });
        graph.addVertex('B', { name: 'B', id: 'B' });
        graph.addVertex('C', { name: 'C', id: 'C' });
        graph.addVertex('D', { name: 'D', id: 'D' });

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

        graph.addVertex('E', { name: 'E', id: 'E' });
        graph.addVertex('A', { name: 'A', id: 'A' });
        graph.addVertex('B', { name: 'B', id: 'B' });
        graph.addVertex('C', { name: 'C', id: 'C' });
        graph.addVertex('D', { name: 'D', id: 'D' });

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

        graph.addVertex('B', { name: 'B', id: 'B' });
        graph.addVertex('A', { name: 'A', id: 'A' });

        graph.addEdge('B', 'A');

        // B -- A

        graph.addVertex('C', { name: 'C', id: 'C' });

        graph.addEdge('B', 'C');
        graph.addEdge('C', 'A');

        /**
         *  /-- C -\
         * B  ----  A
         *
         */

        graph.addVertex('D', { name: 'D', id: 'D' });

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

        graph.addVertex('C', { name: 'C', id: 'C' });
        graph.addVertex('A', { name: 'A', id: 'A' });
        graph.addVertex('B', { name: 'B', excludeFromSort: true, id: 'B' });

        graph.addEdge('A', 'B');
        graph.addEdge('B', 'C');

        const sorted = graph.topSort();

        expect(sorted).toEqual(['A', 'C']);
    });

    test('change the id, name and value of an existing vertex', () => {
        const graph = new DirectedGraph<string>();

        graph.addVertex('A', { name: 'A', id: 'A' });
        graph.addVertex('B', { name: 'B', id: 'B' });

        graph.addEdge('A', 'B');

        const original = graph.topSort();

        graph.changeId('B', 'C');
        graph.name('C', 'C');
        graph.value('C', 'C');

        const sorted = graph.topSort();

        expect(sorted).toEqual(['A', 'C']);
        expect(original).toEqual(['A', 'B']);
    });
});
