const { SHOW_ELEMENT, FILTER_ACCEPT, FILTER_REJECT } = NodeFilter;

export default class ValidityWalker {
  constructor(root) {
    this.root = root;
  }

  *[Symbol.iterator]() {
    let nodeIter = document.createNodeIterator(
      this.root,
      SHOW_ELEMENT,
      ValidityWalker.canValidate
    );
    let node;
    while ((node = nodeIter.nextNode())) {
      yield node;
    }
  }

  static for(root) {
    return new ValidityWalker(root);
  }

  static canValidate(node) {
    return 'setCustomValidity' in node ? FILTER_ACCEPT : FILTER_REJECT;
  }
}
