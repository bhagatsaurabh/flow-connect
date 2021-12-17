import { LinkedListNode } from "./linked-list";
import { LinkedList } from "./linked-list";

export class SelfOrganizingArray<T> {
  private list: LinkedList<T>;
  get array(): T[] { return this.list.toArray() };
  get forEach() { return this.array.forEach }

  constructor(public comparator: (a: T, b: T) => number, source?: Array<T>) {
    this.list = source ? new LinkedList(comparator, source) : new LinkedList(comparator);
  }

  push(data: T) {
    let newNode = new LinkedListNode(data);
    let curr = this.list.tail;
    while (curr !== null && this.comparator(curr.data, data) >= 0) {
      curr = curr.prev;
    }

    if (curr === null) this.list.prepend(data);
    else {
      newNode.next = curr.next;
      newNode.prev = curr;
      curr.next = newNode;
      if (newNode.next) newNode.next.prev = newNode;
    }
  }
}
