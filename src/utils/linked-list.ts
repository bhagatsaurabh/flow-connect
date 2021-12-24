import { Hooks } from "../core/hooks";

export class List<T> extends Hooks {
  head: ListNode<T> = null;
  tail: ListNode<T> = null;
  length: number = 0;

  constructor(public comparator?: (a: T, b: T) => number, source?: Array<T>) {
    super();
    if (source) source.forEach(value => this.append(value));
  }

  prepend(data: T) {
    let newNode = new ListNode(data);
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
  append(data: T | ListNode<T>) {
    let newNode = data instanceof ListNode ? data : new ListNode(data);
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
  addAfter(data: T, node: ListNode<T>): ListNode<T> {
    let newNode = new ListNode<T>(data);
    newNode.next = node.next;
    newNode.prev = node;
    node.next = newNode;
    if (newNode.next) newNode.next.prev = newNode;
    if (node === this.tail) this.tail = newNode;
    this.length += 1;

    return newNode;
  }
  addBefore(data: T, node: ListNode<T>): ListNode<T> {
    let newNode = new ListNode<T>(data);
    newNode.prev = node.prev;
    newNode.next = node;
    node.prev = newNode;
    if (newNode.prev) newNode.prev.next = newNode;
    if (node === this.head) this.head = newNode;
    this.length += 1;

    return newNode;
  }
  delete(node: ListNode<T>) {
    if (this.length === 1) {
      this.head = null;
      this.tail = null;
    }
    else if (node === this.head)
      this.removeFirst();
    else if (node === this.tail)
      this.removeLast();
    else {
      if (node.prev) node.prev.next = node.next;
      if (node.next) node.next.prev = node.prev;
      this.length -= 1;
    }
  }
  searchHead(callback: (node: ListNode<T>) => boolean): ListNode<T> {
    let curr = this.head;
    while (curr !== null) {
      if (callback(curr)) return curr;
      curr = curr.next;
    }
    return null;
  }
  searchTail(callback: (node: ListNode<T>) => boolean): ListNode<T> {
    let curr = this.tail;
    while (curr !== null) {
      if (callback(curr)) return curr;
      curr = curr.prev;
    }
    return null;
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

  forEach(callback: (node: ListNode<T>) => void) {
    let curr = this.head;
    while (curr !== null) {
      callback(curr);
      curr = curr.next;
    }
  }
  map(callback: (node: ListNode<T>) => any): any[] {
    let mapped: any[] = [];
    this.forEach(node => mapped.push(callback(node)));
    return mapped;
  }
  toArray(): T[] {
    let data: T[] = [];
    this.forEach(node => data.push(node.data));
    return data;
  }
  toString(): string {
    return this.toArray().join(', ');
  }
}

export class ListNode<T> {
  prev: ListNode<T>;
  next: ListNode<T>;
  data: T;

  constructor(data?: T) {
    this.prev = null;
    this.next = null;
    this.data = data ? data : null;
  }
}
