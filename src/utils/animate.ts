import get from 'lodash-es/get';
import includes from 'lodash-es/includes';
import map from 'lodash-es/map';
import reduce from 'lodash-es/reduce';
import {
  PlainObject,
  Transition,
} from 'react-move';

import {
  AnimateProp,
  AnimationPhaseMethod,
  AnimationProcessorFunction,
  DatumProcessor,
} from '../types';

export function animationStartFactory(
  animate: AnimateProp,
  processor: DatumProcessor<any, any>,
): AnimationProcessorFunction<PlainObject> {
  // Upon initialization, `start` cannot animate, but is required by `react-move`
  const METHOD = 'start';
  return (data: any, index: number) => {
    return reduce(
      processor(data),
      (accum, value, key) => {
        const userMethod = get(animate, [key, METHOD]);

        const resolvedStartState = {
          [key]: value,
          ...(userMethod && userMethod(value, data, index)),
        };

        return {
          ...accum,
          ...resolvedStartState,
        };
      },
      {},
    );
  };
}

export function getMethodIfExists(
  methodMap: AnimateProp,
  key: string,
): AnimationPhaseMethod {
  const potentialMethod = get(methodMap, [key]);
  return (
    typeof potentialMethod === 'function'
    ? potentialMethod
    : null
  );
}

function defaultProcessor(
  processor: DatumProcessor<any, any>,
): AnimationProcessorFunction<Transition>  {
  return (datum) => reduce(
    processor(datum),
    (accum, value, key) => ({
      ...accum,
      [key]: [value],
    }),
    {},
  );
}

// A factory for each animation method: `enter` | `update` | `leave`;
export function animationProcessorFactory(
  animate: AnimateProp,
  animatableKeys: string[],
  processor: DatumProcessor<any, any>,
  method: 'start' | 'enter' | 'update' | 'leave',
): AnimationProcessorFunction<PlainObject | Transition> {
  const NON_ANIMATABLE_METHOD = 'start';

  if (method === NON_ANIMATABLE_METHOD) {
    return animationStartFactory(animate, processor);
  }

  // Please the TypeScript compiler.
  // Animation Processor just wraps processed values in an array.
  if (typeof animate === 'boolean') {
    return defaultProcessor(processor);
  }

  return (datum, index) => {
    const {
      events: rootEvents,
      timing: rootTiming,
      ...specificAnimationMethods,
    } = animate;

    // Process datum, apply default animation, which can be overridden by user methods.
    return map(
      processor(datum),
      (value, key) => {
        if (includes(animatableKeys, key)) {
          // Override root animate `events` and `timing` properties.
          // ie, `animate.events` can be overridden by `animate.fill.events`.
          const events = get(specificAnimationMethods, [key, 'events'], rootEvents);
          const timing = get(specificAnimationMethods, [key, 'timing'], rootTiming);

          // A user defined animation method, agnostic to animation phase.
          // ie, `animate.fill`
          const phaseAgnosticMethod = getMethodIfExists(
            specificAnimationMethods,
            key,
          );

          // A user defined animation method. ie, `animate.fill.update`
          const userMethod = get(specificAnimationMethods, [key, method], phaseAgnosticMethod);

          // return applied animate defaults that can be overridden by user for respective `key`.
          return {
            [key]: [value],
            events,
            timing,
            ...(userMethod && userMethod(value, datum, index)),
          };
        }

        // Return non-animation object with accumulator.
        return { [key]: value };
      },
    );
  };
}
