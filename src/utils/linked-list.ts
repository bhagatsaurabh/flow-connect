import { Hooks } from "../core/hooks";

export class LinkedListNode<T> {
  prev: LinkedListNode<T>;
  next: LinkedListNode<T>;
  data: T;

  constructor(data?: T) {
    this.prev = null;
    this.next = null;
    this.data = data ? data : null;
  }
}

export class LinkedList<T> extends Hooks {
  head: LinkedListNode<T> = null;
  tail: LinkedListNode<T> = null;
  length: number = 0;

  constructor(public comparator: (a: T, b: T) => number) { super(); }

  prepend(data: T) {
    let newNode = new LinkedListNode(data);
    if (this.head === null) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.head.prev = newNode;
      newNode.next = this.head;
      this.head = newNode;
    }

    this.length += 1;
    this.call('prepend', this, newNode);
    return newNode;
  }
  append(data: T | LinkedListNode<T>) {
    let newNode = data instanceof LinkedListNode ? data : new LinkedListNode(data);
    if (this.tail === null) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      newNode.prev = this.tail;
      this.tail = newNode;
    }

    this.length += 1;
    this.call('append', this, newNode);
    return newNode;
  }
  search(data: T): LinkedListNode<T> {
    let curr = this.head;
    while (curr !== null) {
      if (this.comparator(curr.data, data) === 0) return curr;
      curr = curr.next;
    }
    return null;
  }
  removeFirst(hook: boolean = true): T {
    let removed;
    if (this.head === null) return null;
    else if (this.length === 1) {
      removed = this.head.data;
      this.head = null;
      this.tail = null;
    } else {
      removed = this.head.data;
      this.head.next.prev = null;
      this.head = this.head.next;
    }

    this.length -= 1;
    if (hook) this.call('removefirst', this, removed);
    return removed;
  }
  removeLast(): T {
    let removed;
    if (this.tail === null) return null;
    else if (this.length === 1) {
      removed = this.tail.data;
      this.head = null;
      this.tail = null;
    } else {
      removed = this.tail.data;
      this.tail.prev.next = null;
      this.tail = this.tail.prev;
    }

    this.length -= 1;
    this.call('removelast', this, removed);
    return removed;
  }
  get(index: number): T {
    if (index >= this.length) return null;
    else if (index === 0) return this.head ? this.head.data : null;
    else if (index === (this.length - 1)) return this.tail ? this.tail.data : null;
    else {
      let count = 0;
      let curr = this.head;
      while (curr !== null) {
        if (count === index) return curr.data;
        count += 1;
        curr = curr.next;
      }
      return null;
    }
  }
  forEach(callback: (node: LinkedListNode<T>) => void) {
    let curr = this.head;
    while (curr !== null) {
      callback(curr);
      curr = curr.next;
    }
  }
  toArray(): T[] {
    let data: T[] = [];
    this.forEach(node => data.push(node.data));
    return data;
  }
}
