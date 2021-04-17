import { RzPoint } from "../../internal";

export type RzScrollBoundary = {
  maxX: number;
  maxY: number;

  minX: number;
  minY: number;
}

export const enforceBoundary = (source: RzPoint, boundary: RzScrollBoundary): RzPoint => {
  if (boundary) {
    const { x, y } = source;
    const appliedX = x < boundary.minX ? boundary.minX : x > boundary.maxX ? boundary.maxX : x;
    const appliedY = y < boundary.minY ? boundary.minY : y > boundary.maxY ? boundary.maxY : y;

    return { x: appliedX, y: appliedY };
  }
  return source;
};

export const scrollWasReal = (newPoint: RzPoint, currentPoint: RzPoint) =>
  currentPoint.x !== newPoint.x || currentPoint.y !== newPoint.y;