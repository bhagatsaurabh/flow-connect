import { BinaryTreeNode, BinarySearchTree } from '../../../../src/utils/binary-search-tree';

describe('BinaryTree Node', () => {
  it('should create a binary tree node given the data', () => {
    let binaryTreeNode = new BinaryTreeNode(165);
    expect(binaryTreeNode).to.be.an.instanceof(BinaryTreeNode);
    expect(binaryTreeNode.data).to.be.equal(165);
    expect(binaryTreeNode.left).to.be.null;
    expect(binaryTreeNode.right).to.be.null;
    expect(binaryTreeNode.parent).to.be.null;
  });
});

describe('Binary Search Tree', () => {
  let search = (root, value) => {
    if (root === null) return null;
    if (root.data.value === value) return root;
    if (value < root.data.value) return search(root.left, value);
    else return search(root.right, value);
  };
  let validate = (root, l, r) => {
    if (root == null) return true;

    if (l && root.data.value <= l.data.value) return false;
    if (r && root.data.value >= r.data.value) return false;

    return validate(root.left, l, root) && validate(root.right, root, r);
  };

  it('should create a binary search tree given comparator and data-to-node mapper', () => {
    let binarySearchTree = new BinarySearchTree((a, b) => (a - b), data => data);

    expect(binarySearchTree).to.be.an.instanceOf(BinarySearchTree).have.property('root', null);
  });

  it('should add data to the tree and maintain structure', () => {
    let binarySearchTree = new BinarySearchTree((a, b) => (a.value - b.value), data => data.id);

    let node1 = binarySearchTree.add({ value: 162, id: 0 });
    let node2 = binarySearchTree.add({ value: 83, id: 1 });
    let node3 = binarySearchTree.add({ value: 24, id: 2 });
    let node4 = binarySearchTree.add({ value: 184, id: 3 });
    let node5 = binarySearchTree.add({ value: 94, id: 4 });

    expect(search(binarySearchTree.root, 162)).to.be.equal(node1);
    expect(search(binarySearchTree.root, 184)).to.be.equal(node4);
    expect(search(binarySearchTree.root, 83)).to.be.equal(node2);
    expect(search(binarySearchTree.root, 94)).to.be.equal(node5);
    expect(search(binarySearchTree.root, 24)).to.be.equal(node3);

    expect(validate(binarySearchTree.root, null, null)).to.be.true;
  });

  it('should remove data from the tree and maintain structure', () => {
    let binarySearchTree = new BinarySearchTree((a, b) => (a.value - b.value), data => data.id);

    let set = new Set();
    for (let iter = 0; iter < 100; iter += 1) set.add(Math.round(Math.random() * 1000));
    set.forEach(item => binarySearchTree.add({ value: item, id: item }));
    let arr = [...set];

    expect(validate(binarySearchTree.root, null, null)).to.be.true;

    let randomItem = arr[Math.random() * (arr.length - 1)];
    binarySearchTree.remove({ value: randomItem, id: randomItem });

    expect(validate(binarySearchTree.root, null, null)).to.be.true;
    expect(search(binarySearchTree.root, randomItem)).to.be.null;
  });

  it('should call given callback for every node', () => {
    let binarySearchTree = new BinarySearchTree((a, b) => (a.value - b.value), data => data.id);

    for (let iter = 0; iter < 25; iter += 1) {
      let item = Math.round(Math.random() * 1000);
      binarySearchTree.add({ value: item, id: item });
    };

    let actionObj = { action: () => { } };
    let actionSpy = cy.spy(actionObj, 'action');
    binarySearchTree.forEach(actionObj.action);
    expect(actionSpy).to.have.callCount(25);
  });

  it('should call given callback for every node in ascending order', () => {
    let binarySearchTree = new BinarySearchTree((a, b) => (a.value - b.value), data => data.id);

    for (let iter = 0; iter < 25; iter += 1) {
      let item = Math.round(Math.random() * 1000);
      binarySearchTree.add({ value: item, id: item });
    };

    let arr = [];
    let actionObj = { action: (item) => arr.push(item.value) };
    let actionSpy = cy.spy(actionObj, 'action');
    binarySearchTree.forEach(actionObj.action);
    expect(actionSpy).to.have.callCount(25);
    expect(arr).to.be.sorted((a, b) => (a - b));
  });
});
