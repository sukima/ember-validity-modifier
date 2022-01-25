import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

function utf8ToHex(str) {
  return Array.from(str)
    .map(
      c => c.charCodeAt(0) < 128
        ? c.charCodeAt(0).toString(16).padStart(2, '0')
        : encodeURIComponent(c).replace(/%/g,'').toLowerCase()
    )
    .join('');
}

export default class SequenceDiagram extends Component {
  @tracked loaded = false;
  @tracked loadedHeight;

  get payload() {
    return utf8ToHex(this.args.source);
  }

  get href() {
    return `https://www.planttext.com/api/plantuml/svg/~h${this.payload}`;
  }

  @action
  onLoaded({ target: img }) {
    this.loaded = true;
    this.loadedHeight = `${img.height}px`;
  }
}
