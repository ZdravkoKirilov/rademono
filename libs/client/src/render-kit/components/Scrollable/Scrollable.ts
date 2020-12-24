import {
  createElement, RzElementPrimitiveProps, RzPoint, CustomComponent, RzRenderedNode,
  DidUpdatePayload
} from '../../internal';

import { RzScrollBoundary, enforceBoundary, scrollWasReal } from './helpers';
import { ScrollHandleBar, ScrollHandleBarProps } from "./ScrollHandleBar";
import { ScrollingContentProps, ScrollingContent } from "./ScrollingContent";

export type RzScrollableProps = {
  width: number;
  height: number;
  boundary: RzScrollBoundary;
  horizontal?: boolean;
  swipeContent?: boolean;

  renderBar?: (data: ScrollHandleBarProps) => RzRenderedNode;

  controlledPosition?: RzPoint;
  controlledStartPosition?: RzPoint;
  onScroll?: (points: RzPoint) => void;
}

type State = {
  currentScrollPosition: RzPoint;
  totalHeight: number;
}

export class RzScrollable extends CustomComponent<RzScrollableProps, State> {

  lastScrollPosition: RzPoint;

  didUpdate(payload: DidUpdatePayload<RzScrollableProps>) {

    if (this.props.controlledPosition && this.props.controlledPosition !== payload.prev.props.controlledPosition) {

      this.setState({ currentScrollPosition: this.props.controlledPosition });
      this.lastScrollPosition = this.props.controlledPosition;
    }
  }

  render() {

    const { height, width, controlledStartPosition, boundary, onScroll, swipeContent, children,
      renderBar } = this.props;
    const { currentScrollPosition, totalHeight } = this.state;
    const { lastScrollPosition } = this;

    const handleBarProps: ScrollHandleBarProps = {
      viewportHeight: height,
      totalHeight,
      startPosition: controlledStartPosition || { x: 0, y: 0 },
      currentPosition: currentScrollPosition,
      onScroll: point => {
        const withBoundary = enforceBoundary(point, boundary);

        if (scrollWasReal(withBoundary, lastScrollPosition)) {
          onScroll && onScroll(withBoundary);
          this.lastScrollPosition = withBoundary;
          this.setState({ currentScrollPosition: withBoundary });
        }
      }
    };

    return createElement<RzElementPrimitiveProps>(
      'container',
      {
        styles: { x: 0, y: 0, mask: [0, 0, width, height] },
        name: 'OuterScrollWrapper'
      },
      createElement<RzElementPrimitiveProps>(
        'container',
        {
          /*           ref: component => {
                      const dimensions = (component as BasicComponent).getSize();
                      if (dimensions) {
                        setTotalHeight(dimensions.height);
                      }
                    }, */
        },
        createElement<ScrollingContentProps>(
          ScrollingContent,
          {
            startPosition: controlledStartPosition || { x: 0, y: 0 },
            currentPosition: currentScrollPosition,
            onScroll: swipeContent && onScroll ? (point: RzPoint) => {
              const withBoundary = enforceBoundary(point, boundary);

              if (scrollWasReal(withBoundary, lastScrollPosition)) {
                onScroll(withBoundary);
                this.setState({ currentScrollPosition: withBoundary });
                this.lastScrollPosition = withBoundary;
              }
            } : undefined,
          },
          children,
        ),
      ),
      createElement<RzElementPrimitiveProps>(
        'container',
        { styles: { x: width, y: 0 } },
        renderBar ? renderBar(handleBarProps) : createElement<ScrollHandleBarProps>(
          ScrollHandleBar,
          handleBarProps,
        )
      )
    );
  }


}
