import { tracked } from '@glimmer/tracking';

const GET_BUCKET = Symbol('GET_BUCKET');
const SET_BUCKET = Symbol('SET_BUCKET');

export class ValiditySequence {
  constructor({ validateEvent, validatedEvent }) {
    this.validateEvent = validateEvent;
    this.validatedEvent = validatedEvent;
  }

  get initiator() {
    return this.validateEvent.type;
  }

  get errors() {
    return this.validatedEvent.detail.errors;
  }

  static from([validateEvent, validatedEvent]) {
    return new ValiditySequence({ validateEvent, validatedEvent });
  }
}

export class EventBucket {
  @tracked name;
  @tracked sequences = [];

  get size() {
    return this.sequences.length;
  }

  get lastSequence() {
    return this.sequences[this.size - 1];
  }

  constructor(name) {
    this.name = name;
  }

  addValiditySequence(sequence) {
    this.sequences = [...this.sequences, sequence];
  }

  registerAsValiditySequence(events) {
    let sequence = ValiditySequence.from(events);
    this.addValiditySequence(sequence);
    return sequence;
  }
}

export class BucketProxy {
  static Cell = class BucketProxyCell {
    @tracked value = new Map();
  };

  #bucketsCell = new BucketProxy.Cell();

  [SET_BUCKET](name, bucket) {
    let buckets = this.#bucketsCell.value;
    buckets.set(name, bucket);
    this.#bucketsCell.value = buckets;
  }

  [GET_BUCKET](name) {
    return this.#bucketsCell.value.get(name) ?? new EventBucket(name);
  }

  unknownProperty(prop) {
    return this[GET_BUCKET](prop);
  }

  static bucketFor(target, name) {
    return target[GET_BUCKET](name);
  }

  static update(target, name, bucket) {
    return target[SET_BUCKET](name, bucket);
  }
}
