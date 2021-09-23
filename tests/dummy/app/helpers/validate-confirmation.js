import Helper from '@ember/component/helper';

const getElement = (id) => document.getElementById(id);

export function validateConfirmation([passwordFieldId]) {
  return ({ value }) => getElement(passwordFieldId).value === value
    ? []
    : ['Confirmation must match password'];
}

export default Helper.helper(validateConfirmation);
