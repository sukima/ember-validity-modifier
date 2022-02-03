import Component from '@glimmer/component';

const SHORT_COLUMN = 32;
const LONG_COLUMN = 64;

function truncate(str, column) {
  if (str.length <= column) { return str; }
  let truncated = str.substr(0, column);
  let ellipses = /[.!?]$/.test(truncated) ? '' : '…';
  return `${truncated}${ellipses}`;
}

export default class EventSequenceVisualizer extends Component {
  get latestInitiator() {
    return this.args.bucket.lastSequence.initiator;
  }

  get latestErrors() {
    return this.args.bucket.lastSequence.errors;
  }

  get latestCustomErrors() {
    return this.args.bucket.lastSequence.customErrors;
  }

  get plantUmlSource() {
    const shortStr = s => truncate(s, SHORT_COLUMN);
    const longStr = s => truncate(s, LONG_COLUMN);
    let { latestInitiator: eventName, latestErrors, latestCustomErrors } = this;
    let errors = latestErrors.length > 1
      ? `[\\n  '${latestErrors.map(longStr).join('\',\\n  \'')}'\\n]`
      : `['${latestErrors[0] || ''}']`;
    let customValidityMessage = latestCustomErrors[0]?.length > SHORT_COLUMN
      ? `\\n  '${shortStr(latestCustomErrors[0])}'\\n`
      : `'${latestCustomErrors[0] || ''}'`;
    return `
@startuml
participant DOM
participant ValidityModifier as "modifier"
participant ValidateEventHandler as "'${eventName}'\\nevent handler"
participant Validators as "check validators"
participant ValidatedEventHandler as "'validated'\\nevent handler"
DOM -> ValidityModifier : '${eventName}' event
ValidityModifier -> ValidateEventHandler
activate ValidateEventHandler
ValidateEventHandler -> Validators : await validators
activate Validators
ValidateEventHandler <- Validators : errors
deactivate Validators
DOM <- ValidateEventHandler : setCustomValidity(${customValidityMessage})
DOM <- ValidateEventHandler : dispatch 'validated' event
deactivate ValidateEventHandler
DOM -> ValidatedEventHandler : {{on 'validated' …}}
activate ValidatedEventHandler
DOM <- ValidatedEventHandler : detail: { errors: ${errors} }
deactivate ValidatedEventHandler
@enduml
    `;
  }

  get altText() {
    let { latestInitiator: eventName, latestErrors: errors } = this;
    return `
UML Diagram depicting the following sequence:
${eventName} is triggered and handled by the ${eventName} handler which checks
the validators.
The validators resolved with ${errors.length ? 'the following' : 'no'} errors.
${errors.join(' ')}
A validated event is dispatched. An ember 'on' helper handles the validated
event which has the previous errors on the events detail.errors property.
    `;
  }
}
