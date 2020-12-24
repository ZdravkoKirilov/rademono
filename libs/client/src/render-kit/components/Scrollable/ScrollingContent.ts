import {
  RzPoint, RzElementPrimitiveProps, createElement, RzDraggableProps, RzDraggable,
  CustomComponent
} from "../../internal";

export type ScrollingContentProps = {
  startPosition: RzPoint;
  currentPosition: RzPoint;

  onScroll?: (point: RzPoint) => void;
};

export class ScrollingContent extends CustomComponent<ScrollingContentProps> {

  render() {
    const { startPosition, currentPosition, onScroll, children } = this.props;

    return createElement<RzDraggableProps>(
      RzDraggable,
      {
        startPosition,
        render: () => {
          return createElement<RzElementPrimitiveProps>(
            'container',
            {
              styles: { x: currentPosition.x, y: currentPosition.y },
              name: 'InnerScrollWrapper'
            },
            children,
          );
        },
        onDragMove: onScroll
      }
    );
  }
  
};
