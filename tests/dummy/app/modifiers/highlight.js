import hljs from 'highlight.js';
import { modifier } from 'ember-modifier';

import javascript from 'highlight.js/lib/languages/javascript';
import handlebars from 'highlight.js/lib/languages/handlebars';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('handlebars', handlebars);

export default modifier(function highlight(element, _, { lang }) {
  if (lang) {
    element.classList.add(`language-${lang}`);
  }
  hljs.highlightElement(element);
});
