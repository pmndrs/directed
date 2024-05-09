import { describe, test, expect } from 'vitest';
import { Queue } from '../queue';

describe('Queue', () => {
    test('enqueue and dequeue', () => {
        const queue = new Queue<number>();

        queue.enqueue(1);
        queue.enqueue(2);
        queue.enqueue(3);

        expect(queue.size).toBe(3);

        expect(queue.dequeue()).toBe(1);
        expect(queue.dequeue()).toBe(2);
        expect(queue.dequeue()).toBe(3);
        expect(queue.dequeue()).toBeUndefined();

        expect(queue.size).toBe(0);
        expect(queue.isEmpty()).toBe(true);
    });

    test('peek reveals the head of the queue', () => {
        const queue = new Queue<number>();

        queue.enqueue(1);
        queue.enqueue(2);
        queue.enqueue(3);

        expect(queue.peek()).toBe(1);
        expect(queue.size).toBe(3);
    });

    test('create a queue with an initial capacity', () => {
        const queue = new Queue<number>(2);

        queue.enqueue(1);
        queue.enqueue(2);
        queue.enqueue(3);

        expect(queue.size).toBe(3);
        expect(queue.peek()).toBe(1);
    });
});
