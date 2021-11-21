import { AVLTree, AVLTreeNode } from '../../../../src/utils/avl-tree';

describe('AVLTree Node', () => {
  it('should create a binary tree node given the data', () => {
    let avlTreeNode = new AVLTreeNode(165);
    expect(avlTreeNode).to.be.an.instanceof(AVLTreeNode);
    expect(avlTreeNode.data).to.be.equal(165);
    expect(avlTreeNode.left).to.be.null;
    expect(avlTreeNode.right).to.be.null;
  });
});

describe('AVL Tree', () => {
  let search = (root, value) => {
    if (root === null) return null;
    if (root.data[0].value === value) return root;
    if (value < root.data[0].value) return search(root.left, value);
    else return search(root.right, value);
  };
  let validate = (root, l, r) => {
    if (root == null) return true;

    if (l && root.data.value <= l.data.value) return false;
    if (r && root.data.value >= r.data.value) return false;

    return validate(root.left, l, root) && validate(root.right, root, r);
  };

  it('should create a avl tree given comparator and data-to-node mapper', () => {
    let avlTree = new AVLTree((a, b) => (a - b), data => data);

    expect(avlTree).to.be.an.instanceOf(AVLTree).have.property('root', null);
  });

  it('should add data to the tree and maintain structure', () => {
    let avlTree = new AVLTree((a, b) => (a.value - b.value), data => data.id);

    let node1 = avlTree.add({ value: 162, id: 0 });
    let node2 = avlTree.add({ value: 83, id: 1 });
    let node3 = avlTree.add({ value: 24, id: 2 });
    let node4 = avlTree.add({ value: 184, id: 3 });
    let node5 = avlTree.add({ value: 94, id: 4 });

    expect(search(avlTree.root, 162)).to.be.equal(node1);
    expect(search(avlTree.root, 184)).to.be.equal(node4);
    expect(search(avlTree.root, 83)).to.be.equal(node2);
    expect(search(avlTree.root, 94)).to.be.equal(node5);
    expect(search(avlTree.root, 24)).to.be.equal(node3);

    expect(validate(avlTree.root, null, null)).to.be.true;
  });

  it('should remove data from the tree and maintain structure', () => {
    let avlTree = new AVLTree((a, b) => (a.value - b.value), data => data.id);

    let set = new Set();
    for (let iter = 0; iter < 100; iter += 1) set.add(Math.round(Math.random() * 1000));
    set.forEach(item => avlTree.add({ value: item, id: item }));
    let arr = [...set];

    expect(validate(avlTree.root, null, null)).to.be.true;

    let randomItem = arr[Math.random() * (arr.length - 1)];
    avlTree.remove({ value: randomItem, id: randomItem });

    expect(validate(avlTree.root, null, null)).to.be.true;
    expect(search(avlTree.root, randomItem)).to.be.null;
  });

  it('should call given callback for every node', () => {
    let avlTree = new AVLTree((a, b) => (a.value - b.value), data => data.id);

    for (let iter = 0; iter < 25; iter += 1) {
      let item = Math.round(Math.random() * 1000);
      avlTree.add({ value: item, id: item });
    };

    let actionObj = { action: () => { } };
    let actionSpy = cy.spy(actionObj, 'action');
    avlTree.forEach(actionObj.action);
    expect(actionSpy).to.have.callCount(25);
  });

  it('should call given callback for every node in ascending order', () => {
    let avlTree = new AVLTree((a, b) => (a.value - b.value), data => data.id);

    for (let iter = 0; iter < 25; iter += 1) {
      let item = Math.round(Math.random() * 1000);
      avlTree.add({ value: item, id: item });
    };

    let arr = [];
    let actionObj = { action: (item) => arr.push(item.value) };
    let actionSpy = cy.spy(actionObj, 'action');
    avlTree.forEach(actionObj.action);
    expect(actionSpy).to.have.callCount(25);
    expect(arr).to.be.sorted((a, b) => (a - b));
  });
});
