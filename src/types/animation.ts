import {
  Events,
  PlainObject,
  Timing,
  Transition,
} from 'react-move';

/****************************
 *          Props           *
 ****************************/

type AnimationPhaseMethod = (processedData: any, data: any, index: number) => PlainObject;

interface AnimatableAttributePropObject {
  start?: AnimationPhaseMethod;
  enter?: AnimationPhaseMethod;
  update?: AnimationPhaseMethod;
  leave?: AnimationPhaseMethod;
  events?: Events;
  timing?: Timing;
}

interface AnimatePropObjectExtension {
  events?: Events;
  timing?: Timing;
}

interface AnimatePropObjectBase {
  [key: string]: AnimatableAttributePropObject | AnimationPhaseMethod;
}

type AnimatePropObject = AnimatePropObjectBase & AnimatePropObjectExtension;

export type AnimateProp = AnimatePropObject | boolean;

/***************************
 *          Util           *
 ***************************/

type RawDatum = any;
type ProcessedDatum = any;
export type DatumProcessor = (datum: RawDatum) => ProcessedDatum;

type AnimationPhase = 'enter' | 'update' | 'leave';
type AnimationStartProcessor = (phase: 'start') => (data: any, index: number) => PlainObject;
type AnimationPhaseProcessor = (phase: AnimationPhase) => (data: any, index: number) => Transition;
export type AnimationProcessor = AnimationStartProcessor & AnimationPhaseProcessor;
