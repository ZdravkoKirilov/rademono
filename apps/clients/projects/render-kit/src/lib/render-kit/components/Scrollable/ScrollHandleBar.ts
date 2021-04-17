import {
  RzPoint, RzElementPrimitiveProps, createElement, PrimitiveRectangleProps, RzDraggableProps,
  RzDraggable, CustomComponent
} from "../../internal";

export type ScrollHandleBarProps = {
  viewportHeight: number;

  totalHeight: number;

  startPosition: RzPoint;
  currentPosition: RzPoint;

  onScroll: (point: RzPoint) => void;
}

export class ScrollHandleBar extends CustomComponent<ScrollHandleBarProps> {

  render() {
    const { viewportHeight, totalHeight, currentPosition, startPosition, onScroll } = this.props;

    const globalRatio = viewportHeight / totalHeight;
    const gripHeight = viewportHeight * globalRatio;
    const top = currentPosition.y * globalRatio;

    return createElement<RzElementPrimitiveProps>(
      'container',
      null,

      createElement<PrimitiveRectangleProps>(
        'rectangle',
        {
          styles: {
            x: 0,
            y: 0,
            stroke_thickness: 2,
            stroke_color: '#4287f5',
            fill: '#ffff',
            width: 40,
            height: viewportHeight,
          }
        }
      ),

      createElement<RzDraggableProps>(
        RzDraggable,
        {
          startPosition,
          onDragMove: point => {
            onScroll({
              x: 0,
              y: point.y * (totalHeight / viewportHeight)
            })
          },
          render: () => {
            return createElement<PrimitiveRectangleProps>(
              'rectangle',
              {
                styles: {
                  x: 5,
                  y: top,
                  stroke_thickness: 1,
                  stroke_color: '#ffff',
                  fill: '#4287f5',
                  width: 30,
                  height: gripHeight,
                  border_radius: 5,
                }
              }
            )
          }
        }
      ),
      
    );

  }
}
