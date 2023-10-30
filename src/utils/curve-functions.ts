import { Position } from "../types/types";

export const getHorizontalCurve = (
  start: Position,
  end: Position,
): Position => ({
  x: (end.x - start.x) / 1.5,
  y: 0,
});

export const getVerticalCurve = (start: Position, end: Position): Position => ({
  x: 0,
  y: (end.y - start.y) / 1.5,
});

export const getDefaultCurve = (start: Position, end: Position): Position =>
  CurveFunctions.getVerticalCurve(start, end);

export const createDefaultPathString = (
  start: Position,
  end: Position,
  xCurve: number,
  yCurve: number,
): string =>
  `M ${start.x} ${start.y} C ${start.x + xCurve} ${start.y + yCurve}, ${
    end.x - xCurve
  } ${end.y - yCurve}, ${end.x} ${end.y}`;

export const createDraggingPathCurve = (
  start: Position,
  end: Position,
): string => {
  const { x: xCurve, y: yCurve } = CurveFunctions.getDefaultCurve(start, end);
  return CurveFunctions.createDefaultPathString(start, end, xCurve, yCurve);
};

export const CurveFunctions = {
  createNodePathCurve: createDraggingPathCurve,
  createDraggingPathCurve,
  getDefaultCurve,
  getHorizontalCurve,
  getVerticalCurve,
  createDefaultPathString,
} as const;
export type CurveFunctions = typeof CurveFunctions;

export const SetCurveFunction = <T extends keyof CurveFunctions>(
  name: T,
  value: CurveFunctions[T],
) => {
  CurveFunctions[name] = value;
};
