/** @hidden */
export class AVLTree<T> {
  root: AVLTreeNode<T>;
  dataRefToTreeNode: { [key: string]: AVLTreeNode<T> };
  size: number;

  constructor(public comparator: (a: T, b: T) => number, public dataToTreeNodeMapper: (data: T) => string) {
    this.root = null;
    this.dataRefToTreeNode = {};
    this.size = 0;
  }

  height(node: AVLTreeNode<T>) {
    if (!node) return 0;
    return node.height;
  }
  rightRotate(node: AVLTreeNode<T>) {
    let newRoot = node.left;
    node.left = newRoot.right;
    newRoot.right = node;

    node.height = Math.max(node.left ? node.left.height : 0, node.right ? node.right.height : 0) + 1;
    newRoot.height = Math.max(newRoot.left ? newRoot.left.height : 0, newRoot.right ? newRoot.right.height : 0) + 1;

    return newRoot;
  }
  leftRotate(node: AVLTreeNode<T>) {
    let newRoot = node.right;
    node.right = newRoot.left;
    newRoot.left = node;

    node.height = Math.max(node.left ? node.left.height : 0, node.right ? node.right.height : 0) + 1;
    newRoot.height = Math.max(newRoot.left ? newRoot.left.height : 0, newRoot.right ? newRoot.right.height : 0) + 1;

    return newRoot;
  }
  getBalance(node: AVLTreeNode<T>) {
    if (!node) return 0;
    return (node.left ? node.left.height : 0) - (node.right ? node.right.height : 0);
  }

  add(data: T): AVLTreeNode<T> {
    let res: { node: AVLTreeNode<T> } = { node: null };
    this.root = this._insert(this.root, data, res);
    this.dataRefToTreeNode[this.dataToTreeNodeMapper(data)] = res.node;
    this.size += 1;
    return res.node;
  }
  private _insert(node: AVLTreeNode<T>, data: T, res: { node: AVLTreeNode<T> }): AVLTreeNode<T> {
    if (!node) {
      let newNode = new AVLTreeNode([data]);
      res.node = newNode;
      return newNode;
    }

    // Duplicate Keys
    if (this.comparator(data, node.data[0]) === 0) {
      node.data.push(data);
      res.node = node;
      return node;
    }

    if (this.comparator(data, node.data[0]) < 0) node.left = this._insert(node.left, data, res);
    else node.right = this._insert(node.right, data, res);

    node.height = 1 + Math.max(node.left ? node.left.height : 0, node.right ? node.right.height : 0);
    let balance = this.getBalance(node);

    if (balance > 1 && this.comparator(data, node.left.data[0]) < 0) return this.rightRotate(node);
    if (balance > 1 && this.comparator(data, node.left.data[0]) > 0) {
      node.left = this.leftRotate(node.left);
      return this.rightRotate(node);
    }
    if (balance < -1 && this.comparator(data, node.right.data[0]) > 0) return this.leftRotate(node);
    if (balance < -1 && this.comparator(data, node.right.data[0]) < 0) {
      node.right = this.rightRotate(node.right);
      return this.leftRotate(node);
    }

    return node;
  }

  remove(data: T): boolean {
    let res: { deleted: boolean } = { deleted: false };
    this.root = this._delete(this.root, data, res);
    delete this.dataRefToTreeNode[this.dataToTreeNodeMapper(data)];
    this.size -= 1;
    return res.deleted;
  }
  private _delete(node: AVLTreeNode<T>, data: T, res: { deleted: boolean }): AVLTreeNode<T> {
    if (!node) return node;

    if (this.comparator(data, node.data[0]) < 0) node.left = this._delete(node.left, data, res);
    else if (this.comparator(data, node.data[0]) > 0) node.right = this._delete(node.right, data, res);
    else {
      // Duplicate Keys
      if (node.data.length > 1) {
        let index = node.data.findIndex(currData => this.dataToTreeNodeMapper(currData) === this.dataToTreeNodeMapper(data));
        if (index > -1) {
          node.data.splice(index, 1);
          res.deleted = true;
        } else {
          res.deleted = false;
        }
        return node;
      } else {
        if (!node.left || !node.right) {
          let temp = null;
          if (!node.left) temp = node.right;
          else temp = node.left;

          if (!temp) {
            // temp = node;
            node = null;
          } else node = temp;
          res.deleted = true;
        } else {
          let temp = this.minValue(node.right);
          node.data = temp.data;
          node.right = this._delete(node.right, temp.data[0], res);
          res.deleted = true;
        }
      }
    }
    if (!node) return node;

    node.height = Math.max(node.left ? node.left.height : 0, node.right ? node.right.height : 0) + 1;
    let balance = this.getBalance(node);

    if (balance > 1 && this.getBalance(node.left) >= 0) return this.rightRotate(node);
    if (balance > 1 && this.getBalance(node.left) < 0) {
      node.left = this.leftRotate(node.left);
      return this.rightRotate(node);
    }
    if (balance < -1 && this.getBalance(node.right) <= 0) return this.leftRotate(node);
    if (balance < -1 && this.getBalance(node.right) > 0) {
      node.right = this.rightRotate(node.right);
      return this.leftRotate(node);
    }
    return node;
  }

  minValue(node: AVLTreeNode<T>) {
    let curr = node;
    while (curr.left) curr = curr.left;
    return curr;
  }
  forEach(action: (item: T) => void) {
    this._inorder(this.root, action);
  }

  private _inorder(node: AVLTreeNode<T>, action: (item: T) => void) {
    if (node !== null) {
      this._inorder(node.left, action);
      node.data.forEach(data => action(data));
      this._inorder(node.right, action);
    }
  }
  private _reverseInorder(node: AVLTreeNode<T>, action: (item: T) => void) {
    if (node !== null) {
      this._inorder(node.right, action);
      node.data.forEach(data => action(data));
      this._inorder(node.left, action);
    }
  }
}

/** @hidden */
export class AVLTreeNode<T> {
  height: number;
  left: AVLTreeNode<T>;
  right: AVLTreeNode<T>;

  constructor(public data: T[]) {
    this.height = 1;
    this.left = null;
    this.right = null;
  }
}
