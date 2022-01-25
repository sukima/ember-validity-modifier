import Component from '@glimmer/component';
import { BucketProxy } from 'dummy/utils/validity-events-bucket';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ValidityEventsCapture extends Component {
  eventBuffers = new Map();
  @tracked eventBuckets = new BucketProxy();

  @action
  reset() {
    let { eventBuffers, eventBuckets } = this;
    eventBuffers.clear();
    eventBuckets = new BucketProxy();
    this.eventBuckets = eventBuckets;
  }

  @action
  recordEvent(event) {
    let { type, target: { name } } = event;
    let events = this.eventBuffers.get(name) ?? [];
    events.push(event);
    this.eventBuffers.set(name, events);
    if (type === 'validated') {
      this.flushEventBucket(name)
    }
  }

  flushEventBucket(name) {
    let { eventBuffers, eventBuckets } = this;
    let eventBuffer = eventBuffers.get(name);
    let eventBucket = BucketProxy.bucketFor(eventBuckets, name);
    eventBucket.registerAsValiditySequence(eventBuffer);
    BucketProxy.update(eventBuckets, name, eventBucket);
    this.eventBuckets = eventBuckets;
    this.eventBuffers.delete(name);
  }
}
