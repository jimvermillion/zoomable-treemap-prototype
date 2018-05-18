import eq from 'lodash-es/eq';
import includes from 'lodash-es/includes';
import reduce from 'lodash-es/reduce';

// From IHME-UI
export function stateFromPropUpdates(propUpdates, prevProps, nextProps, state, context) {
  return reduce(propUpdates, (acc, value, key) => {
    return value(acc, key, prevProps, nextProps, context);
  }, state);
}

export function propsChanged(prevProps, nextProps, propsToCompare, propsToOmit, comparator = eq) {
  return !reduce(propsToCompare || Object.keys(nextProps), (acc, prop) => {
    return acc && (includes(propsToOmit, prop) || comparator(prevProps[prop], nextProps[prop]));
  }, true);
}
