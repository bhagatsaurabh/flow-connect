export class BinarySearchTree<T> {
  root: BinaryTreeNode<T>;
  action: (item: T) => void;
  dataRefToTreeNode: { [key: string]: BinaryTreeNode<T> };

  constructor(public comparator: (a: T, b: T) => Number, public dataToTreeNodeMapper: (data: T) => string) {
    this.root = null;
    this.dataRefToTreeNode = {};
  }

  add(data: T) {
    let newNode = new BinaryTreeNode(data);
    this.dataRefToTreeNode[this.dataToTreeNodeMapper(data)] = newNode;

    if (this.root === null) this.root = newNode;
    else this._insert(this.root, newNode);
  }
  private _insert(root: BinaryTreeNode<T>, newNode: BinaryTreeNode<T>) {
    if (this.comparator(newNode.data, root.data) < 0) {
      if (root.left === null) {
        root.left = newNode;
        newNode.parent = root;
      } else this._insert(root.left, newNode);
    } else {
      if (root.right === null) {
        root.right = newNode;
        newNode.parent = root;
      } else this._insert(root.right, newNode);
    }
  }

  remove(dataRef: T): boolean {
    let treeNode = this.dataRefToTreeNode[this.dataToTreeNodeMapper(dataRef)];
    if (!treeNode) return false;
    delete this.dataRefToTreeNode[this.dataToTreeNodeMapper(dataRef)];

    if (treeNode.parent) {
      if (treeNode.parent.left === treeNode) {
        if (treeNode.left === null && treeNode.right === null) {
          treeNode.parent.left = null;
          return true;
        }

        if (treeNode.left === null) {
          treeNode.right.parent = treeNode.parent;
          treeNode.parent.left = treeNode.right;
          return true;
        } else if (treeNode.right === null) {
          treeNode.left.parent = treeNode.parent;
          treeNode.parent.left = treeNode.left;
          return true;
        }

        this._deleteMinNode(treeNode);
      } else {
        if (treeNode.left === null && treeNode.right === null) {
          treeNode.parent.right = null;
          return true;
        }

        if (treeNode.left === null) {
          treeNode.right.parent = treeNode.parent;
          treeNode.parent.right = treeNode.right;
          return true;
        } else if (treeNode.right === null) {
          treeNode.left.parent = treeNode.parent;
          treeNode.parent.right = treeNode.left;
          return true;
        }

        this._deleteMinNode(treeNode);
      }
    } else {
      if (treeNode.left === null && treeNode.right === null) {
        this.root = null;
        return true;
      }

      if (treeNode.left === null) {
        treeNode.right.parent = treeNode.parent;
        this.root = treeNode.right;
        return true;
      } else if (treeNode.right === null) {
        treeNode.left.parent = treeNode.parent;
        this.root = treeNode.left;
        return true;
      }

      this._deleteMinNode(treeNode);
    }
  }

  private _deleteMinNode(node: BinaryTreeNode<T>) {
    let min = this.findMinNode(node.right);
    node.data = min.data;
    if (min.parent.left === min) {
      min.parent.left = null;
    } else {
      min.parent.right = null;
    }
  }

  findMinNode(node: BinaryTreeNode<T>): BinaryTreeNode<T> {
    if (node.left === null) return node;
    else return this.findMinNode(node.left);
  }

  forEach(action: (item: T) => void) {
    this.action = action;
    this._inorder(this.root);
  }

  private _inorder(node: BinaryTreeNode<T>) {
    if (node !== null) {
      this._inorder(node.left);
      this.action(node.data);
      this._inorder(node.right);
    }
  }
  private _reverseInorder(node: BinaryTreeNode<T>) {
    if (node !== null) {
      this._inorder(node.right);
      this.action(node.data);
      this._inorder(node.left);
    }
  }
}

export class BinaryTreeNode<T> {
  left: BinaryTreeNode<T>;
  right: BinaryTreeNode<T>;
  parent: BinaryTreeNode<T>;

  constructor(public data: T) {
    this.left = null;
    this.right = null;
    this.parent = null;
  }
}