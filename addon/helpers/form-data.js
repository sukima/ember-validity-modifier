import { helper } from '@ember/component/helper';

export default helper(([cb]) => (e) => cb(new FormData(e.target), e));
