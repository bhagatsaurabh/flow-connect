import { AVLTree, AVLTreeNode } from '../../src/utils/avl-tree';

describe('AVLTree Node', () => {
  it('should create a binary tree node given the data', () => {
    let avlTreeNode = new AVLTreeNode<number>([165]);
    expect(avlTreeNode).toBeInstanceOf(AVLTreeNode);
    expect(avlTreeNode.data).toStrictEqual([165]);
    expect(avlTreeNode.left).toBeNull();
    expect(avlTreeNode.right).toBeNull();
  });
});

describe('AVL Tree', () => {
  let search = (root: any, value: any): any => {
    if (root === null) return null;
    if (root.data[0].value === value) return root;
    if (value < root.data[0].value) return search(root.left, value);
    else return search(root.right, value);
  };
  let validate = (root: any, l: any, r: any): any => {
    if (root == null) return true;

    if (l && root.data.value <= l.data.value) return false;
    if (r && root.data.value >= r.data.value) return false;

    return validate(root.left, l, root) && validate(root.right, root, r);
  };

  it('should create an avl tree given comparator and data-to-node mapper', () => {
    let avlTree = new AVLTree((a: number, b: number) => (a - b), data => data.toString());

    expect(avlTree).toBeInstanceOf(AVLTree);
    expect(avlTree).toHaveProperty('root', null);
  });

  it('should add data to the tree and maintain structure', () => {
    let avlTree = new AVLTree((a: any, b: any) => (a.value - b.value), data => data.id);

    let node1 = avlTree.add({ value: 162, id: 0 });
    let node2 = avlTree.add({ value: 83, id: 1 });
    let node3 = avlTree.add({ value: 24, id: 2 });
    let node4 = avlTree.add({ value: 184, id: 3 });
    let node5 = avlTree.add({ value: 94, id: 4 });

    expect(search(avlTree.root, 162)).toStrictEqual(node1)
    expect(search(avlTree.root, 184)).toStrictEqual(node4);
    expect(search(avlTree.root, 83)).toStrictEqual(node2);
    expect(search(avlTree.root, 94)).toStrictEqual(node5);
    expect(search(avlTree.root, 24)).toStrictEqual(node3);

    expect(validate(avlTree.root, null, null)).toStrictEqual(true);
  });

  it('should remove data from the tree and maintain structure', () => {
    let avlTree = new AVLTree((a: any, b: any) => (a.value - b.value), data => data.id);

    let set = new Set();
    for (let iter = 0; iter < 100; iter += 1) set.add(Math.round(Math.random() * 1000));
    set.forEach(item => avlTree.add({ value: item, id: item }));
    let arr = [...set];

    expect(validate(avlTree.root, null, null)).toStrictEqual(true);

    let randomItem = arr[Math.random() * (arr.length - 1)];
    avlTree.remove({ value: randomItem, id: randomItem });

    expect(validate(avlTree.root, null, null)).toStrictEqual(true);
    expect(search(avlTree.root, randomItem)).toBeNull();
  });

  it('should call given callback for every node', () => {
    let avlTree = new AVLTree((a: any, b: any) => (a.value - b.value), data => data.id);

    for (let iter = 0; iter < 25; iter += 1) {
      let item = Math.round(Math.random() * 1000);
      avlTree.add({ value: item, id: item });
    }

    let actionObj = { action: () => { } };
    let actionSpy = jest.spyOn(actionObj, 'action');
    avlTree.forEach(actionObj.action);
    expect(actionSpy).toHaveBeenCalledTimes(25);
  });

  it('should call given callback for every node in ascending order', () => {
    let avlTree = new AVLTree((a: any, b: any) => (a.value - b.value), data => data.id);

    for (let iter = 0; iter < 25; iter += 1) {
      let item = Math.round(Math.random() * 1000);
      avlTree.add({ value: item, id: item });
    }

    let arr: any[] = [];
    let actionObj = { action: (item: any) => arr.push(item.value) };
    let actionSpy = jest.spyOn(actionObj, 'action');
    avlTree.forEach(actionObj.action);
    expect(actionSpy).toHaveBeenCalledTimes(25);
    expect(arr).toEqual([...arr].sort((a, b) => a - b));
  });
});
