import { modifier } from 'ember-modifier';

function updateProperty(element, property, value) {
  if (value) {
    element.style.setProperty(property, value);
  } else {
    element.style.removeProperty(property);
  }
}

export default modifier(function (element, [property, value]) {
  let oldValue = element.style.getPropertyValue(property);
  updateProperty(element, property, value);
  return () => updateProperty(element, property, oldValue);
});
