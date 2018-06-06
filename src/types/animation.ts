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

export interface TreemapCellProcessedDatum {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  opacity: number;
  height: number;
  width: number;
}

export interface TreemapTextProcessedDatum {
  x_translate: number;
  y_translate: number;
  rotate: number;
  fontSize: number;
}

interface TreemapProcessedDatumAccessors {
  attributionFill: string;
  attributionValue: number;
  label: string;
}

export type TreemapProcessedDatum = (
  TreemapProcessedDatumAccessors
  & TreemapTextProcessedDatum
  & TreemapCellProcessedDatum
);

export type DatumProcessor<
  RawDatum,
  ProcessedDatum
> = (datum: RawDatum) => ProcessedDatum;

type AnimationPhase = 'enter' | 'update' | 'leave';
type AnimationStartProcessor = (phase: 'start') => (data: any, index: number) => PlainObject;
type AnimationPhaseProcessor = (phase: AnimationPhase) => (data: any, index: number) => Transition;
export type AnimationProcessor = AnimationStartProcessor & AnimationPhaseProcessor;
