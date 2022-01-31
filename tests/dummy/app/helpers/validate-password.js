import Helper from '@ember/component/helper';

export function validatePassword() {
  return ({ value }) => {
    let requirements = [
      [/.{6,}/, 'Password must be at least six characters long.'],
      [/[0-9]/, 'Password must contain at least one number.'],
      [/[a-z]/, 'Password must contain at least one lowercase letter.'],
      [/[A-Z]/, 'Password must contain at least one uppercase letter.'],
      [/[^a-zA-Z0-9\s]/, 'Password must contain at least one special character.'],
    ];
    return requirements
      .map(([predicate, message]) => predicate.test(value) ? null : message)
      .filter(Boolean);
  };
}

export default Helper.helper(validatePassword);
