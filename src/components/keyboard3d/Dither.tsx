import React, { forwardRef, useEffect, useMemo } from 'react';
import { DitherEffect, DitherEffectOptions } from './DitherEffect';

export interface DitherProps extends DitherEffectOptions {}

export const Dither = forwardRef<DitherEffect, DitherProps>((props, ref) => {
  const effect = useMemo(
    () =>
      new DitherEffect({
        colorLight: props.colorLight,
        colorDark: props.colorDark,
        scale: props.scale,
        contrast: props.contrast,
        brightness: props.brightness,
      }),
    []
  );

  useEffect(() => {
    if (props.colorLight) effect.setColorLight(props.colorLight);
  }, [props.colorLight, effect]);

  useEffect(() => {
    if (props.colorDark) effect.setColorDark(props.colorDark);
  }, [props.colorDark, effect]);

  useEffect(() => {
    if (props.scale !== undefined) effect.setScale(props.scale);
  }, [props.scale, effect]);

  useEffect(() => {
    if (props.contrast !== undefined) effect.setContrast(props.contrast);
  }, [props.contrast, effect]);

  useEffect(() => {
    if (props.brightness !== undefined) effect.setBrightness(props.brightness);
  }, [props.brightness, effect]);

  return <primitive ref={ref} object={effect} dispose={null} />;
});

Dither.displayName = 'Dither';
