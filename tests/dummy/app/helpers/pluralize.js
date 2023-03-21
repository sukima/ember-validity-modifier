import Helper from '@ember/component/helper';

export function plurlaize([count, singular], { plural, number }) {
  let message = count === 1 ? singular : plural || `${singular}s`;
  return number === false ? message : `${count} ${message}`;
}

export default Helper.helper(plurlaize);
