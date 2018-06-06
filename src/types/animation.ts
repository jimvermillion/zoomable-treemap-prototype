import {
  Events,
  PlainObject,
  Timing,
} from 'react-move';

/****************************
 *          Props           *
 ****************************/

export type AnimationPhaseMethod = (processedData: any, data: any, index: number) => PlainObject;

interface AnimatableAttributePropObject {
  start?: AnimationPhaseMethod;
  enter?: AnimationPhaseMethod;
  update?: AnimationPhaseMethod;
  leave?: AnimationPhaseMethod;
  events?: Events;
  timing?: Timing;
}

export interface AnimatePropObjectExtension {
  events?: Events;
  timing?: Timing;
}

export interface AnimatePropObjectBase {
  [key: string]: AnimatableAttributePropObject | AnimationPhaseMethod;
}

export type AnimatePropObject = AnimatePropObjectBase & AnimatePropObjectExtension;

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

export interface TreemapProcessedDatum
extends TreemapCellProcessedDatum, TreemapTextProcessedDatum {
  attributionFill: string;
  attributionValue: number;
  label: string;
}

export type DatumProcessor<
  RawDatum,
  ProcessedDatum
> = (datum: RawDatum) => ProcessedDatum;

export type AnimationProcessorFunction<ReturnValue> = (data: any, index: number) => ReturnValue;

export type AnimationProcessor = (
  phase: string,
) => (data: any, index: number) => PlainObject;
