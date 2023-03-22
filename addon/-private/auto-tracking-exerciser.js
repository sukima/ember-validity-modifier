const initializedElements = new WeakSet();

export default class AutoTrackingExerciser {
  #element;

  constructor(props, element) {
    this.props = props;
    this.#element = element;
  }

  runImmediatlyWhen(runImmediatly) {
    this.runImmediatly = runImmediatly;
    return this;
  }

  exercise(callback) {
    this.props.forEach((i) => i);
    let hasInitialized = initializedElements.has(this.#element);
    let shouldValidate = hasInitialized && this.props.length;
    initializedElements.add(this.#element);
    if (this.runImmediatly || shouldValidate) {
      callback(this.#element);
    }
  }

  static from(maybeProps, element) {
    return Array.isArray(maybeProps)
      ? new AutoTrackingExerciser(maybeProps, element)
      : new AutoTrackingExerciser([maybeProps], element);
  }
}
