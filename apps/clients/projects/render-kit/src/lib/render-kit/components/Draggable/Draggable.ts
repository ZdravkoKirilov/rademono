import {
  createElement, RzElementPrimitiveProps, RzPoint, GenericEventHandler, CustomComponent,
  RzRenderedNode
} from "../../internal";

export type RzDraggableProps = {
  onDragEnd?: (position: RzPoint) => void;
  onDragMove?: (position: RzPoint) => void;
  startPosition: RzPoint;
  render: (points: RzPoint) => RzRenderedNode;
};

export class RzDraggable extends CustomComponent<RzDraggableProps> {

  dragStartPosition: RzPoint | undefined;
  activeDragPosition: RzPoint | undefined;
  dragStartPositionStatic: RzPoint | undefined;

  handlePointerDown: GenericEventHandler = event => {
    const { startPosition } = this.props;

    event.stopPropagation();

    const eventPosition = event.position!;

    const dragStart = {
      x: eventPosition.x - startPosition.x,
      y: eventPosition.y - startPosition.y,
    }; // that's the offset inside of the graphic itself. e.g.: click inside the sprite in coordinates 30,25

    this.dragStartPosition = dragStart;
    this.dragStartPositionStatic = { x: startPosition.x, y: startPosition.y };
    this.activeDragPosition = { ...startPosition };
  }

  handlePointerMove: GenericEventHandler = event => {
    const { onDragMove } = this.props;

    event.stopPropagation();

    if (this.dragStartPosition) {
      const newPosition = event.position!;
      const newPositionWithOffset = {
        x: newPosition.x - this.dragStartPosition.x,
        y: newPosition.y - this.dragStartPosition.y,
      };

      onDragMove && onDragMove(newPositionWithOffset);
      this.activeDragPosition = newPositionWithOffset;
    }
  }

  handleDragEnd: GenericEventHandler = event => {
    const { onDragEnd } = this.props;

    event.stopPropagation();

    if (
      this.activeDragPosition &&
      dragWasReal(this.dragStartPositionStatic!, this.activeDragPosition) &&
      onDragEnd
    ) {
      onDragEnd(this.activeDragPosition);
    }

    this.dragStartPosition = undefined;
    this.activeDragPosition = undefined;
    // force update?
  }

  render() {

    const { render, children, startPosition } = this.props;

    return (
      createElement<RzElementPrimitiveProps>(
        'container',
        {
          onPointerDown: this.handlePointerDown,
          onPointerMove: this.handlePointerMove,
          onPointerUp: this.handleDragEnd,
          onPointerOut: this.handleDragEnd,
          onPointerUpOutside: this.handleDragEnd,
          onBlur: this.handleDragEnd,
        },
        render ? render(this.activeDragPosition || startPosition) : children,
      )
    );

  }

}

const dragWasReal = (initial: RzPoint, result: RzPoint) => {
  const validDragX = Math.abs(initial.x - result.x) > 0;
  const validDragY = Math.abs(initial.y - result.y) > 0;
  return validDragX && validDragY;
};