import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as debounce from 'debounce';

const DURATION_DEBOUNCE_RESIZE = 300;
const DELTA_PERCENTAGE_SWIPE   = .2;

const DIRECTION_RIGHT = 0;
const DIRECTION_LEFT  = 1;

interface CarouselNinjaContentProps extends React.Props<CarouselNinjaContent> {
  className?: string;
  activeClass?: string;
  select: number;
  onSelect? : (nextI: number, curtI: number) => void;
  onSwipeLeft? : (nextI: number) => void;
  onSwipeRight? : (nextI: number) => void;
}

interface CarouselNinjaContentState {
  innerWidth?: number;
  dragging?: boolean;
  deltaX?: number;
  deltaY?: number;
}

export default class CarouselNinjaContent extends React.Component<CarouselNinjaContentProps, CarouselNinjaContentState> {

  static defaultProps = {
    className    : '',
    activeClass  : 'is-active',
    select       : 0,
    onSelect     : () => {},
    onSwipeLeft  : () => {},
    onSwipeRight : () => {}
  };

  state = {
    outerWidth : 0,
    innerWidth : 0,
    dragging   : false,
    deltaX     : 0,
    deltaY     : 0
  };

  startCoordinate: {
    x: number,
    y: number
  } = {
    x : 0,
    y : 0
  };

  calculateWidth() {
    const firstChild: Element = this.refs[`child-${this.props.select}`] as any;
    this.setState({
      innerWidth : firstChild.clientWidth
    });
  }

  onMouseDown(evt: MouseEvent) {
    this.startCoordinate = {
      x : evt.clientX,
      y : evt.clientY
    };

    this.setState({
      dragging   : true
    });
  }

  onMouseMove(evt: MouseEvent) {
    if (!this.state.dragging) {
      return;
    }
    this.setState({
      deltaX : evt.clientX - this.startCoordinate.x,
      deltaY : evt.clientY - this.startCoordinate.y
    });
  }

  onMouseUp() {
    if (!this.state.dragging) {
      return;
    }
    this.handleSwipe();
  }

  onMouseLeave() {
    if (!this.state.dragging) {
      return;
    }
    this.handleSwipe();
  }

  handleSwipe() {
    const deltaAbsX = Math.abs(this.state.deltaX);
    const threshold = this.state.innerWidth * DELTA_PERCENTAGE_SWIPE;

    if (deltaAbsX > threshold) {

      const direction = this.state.deltaX > -1 ? DIRECTION_RIGHT : DIRECTION_LEFT;

      if (direction === DIRECTION_LEFT) {
        this.props.onSwipeLeft(this.props.select + 1);
      } else if (direction === DIRECTION_RIGHT) {
        this.props.onSwipeRight(this.props.select - 1);
      }

    }

    // reset
    this.startCoordinate = {
      x : 0,
      y : 0
    };
    this.setState({
      dragging : false,
      deltaX   : 0,
      deltaY   : 0
    });
  }

  onResize = debounce((evt: Event) => {
    this.calculateWidth();
  }, DURATION_DEBOUNCE_RESIZE);

  componentDidMount() {
    this.calculateWidth();
    window.addEventListener('resize', this.onResize);
  }

  componentWillReceiveProps(nextProps: CarouselNinjaContentProps) {
    if (this.props.onSelect) {
      this.props.onSelect(nextProps.select, this.props.select);
    }
  }

  shouldComponentUpdate(nextProps: CarouselNinjaContentProps, nextState: CarouselNinjaContentState) {
    return false ||
      nextProps.select !== this.props.select ||
      nextProps.children !== this.props.children ||
      nextState !== this.state
    ;
  }

  componentWillUnmount() {
    window.addEventListener('resize', this.onResize);
  }

  render() {
    /**
     * @example this.props.children = [0, 1, 2, 3, 4]
     *          this.props.select   = 3
     */
    const children: React.ReactNode[] = (React.Children as any).toArray(this.props.children);
    const halfSideSize = Math.floor(children.length / 2);

    // [0, 1, 2, 3, 4] => [0, 1, 2]
    let leftSide = children.slice(0, this.props.select);
    // [0, 1, 2, 3, 4] => [3]
    let center = children.slice(this.props.select, this.props.select + 1);
    // [0, 1, 2, 3, 4] => [4]
    let rightSide = children.slice(this.props.select + 1, children.length);

    if (leftSide.length > halfSideSize) {
      // right:[4] + left:[0](, [1, 2]) => left:[1, 2] / right:[4, 0]
      rightSide = [].concat(rightSide, leftSide.splice(0, leftSide.length - halfSideSize));
    } else if (rightSide.length > halfSideSize) {
      // right:(2, 3, )[4] + left:[0] => left:[4, 0] / right:[2, 3]
      leftSide = [].concat(rightSide.splice(halfSideSize), leftSide);
    }
    // left + center + right => [1, 2, 3, 4, 0]
    const arranged = [].concat(leftSide, center, rightSide);

    return (
        <div className={`${this.props.className} carousel-ninja__inner ${this.state.dragging ? 'carousel-ninja__inner--dragging' : ''}`}
             onMouseDown={this.onMouseDown.bind(this)}
             onMouseMove={this.onMouseMove.bind(this)}
             onMouseUp={this.onMouseUp.bind(this)}
             onMouseLeave={this.onMouseLeave.bind(this)}>

          {children.map((child: React.ReactNode, i: number) => {
            const isSelectedChild = (i === this.props.select);
            const arrangedPosition = arranged.indexOf(child);

            let calcFunction: string;
            if (arrangedPosition < halfSideSize) {
              // half of left
              let baseTranslateX = (halfSideSize - arrangedPosition) * this.state.innerWidth;
              calcFunction = `calc(50% - ${baseTranslateX - this.state.deltaX}px)`;
            } else if (arrangedPosition > halfSideSize) {
              // half of right
              let baseTranslateX = (arrangedPosition - halfSideSize) * this.state.innerWidth;
              calcFunction = `calc(50% + ${baseTranslateX + this.state.deltaX}px)`;
            } else {
              // center
              calcFunction = `calc(50% + ${0 + this.state.deltaX}px)`;
            }

            const className = `carousel-ninja__pane ${isSelectedChild ? this.props.activeClass : ''}`;
            const style = {
              left       : calcFunction,
              marginLeft : `-${this.state.innerWidth / 2}px`,
              opacity    : (arrangedPosition === 0 || (arrangedPosition + 1) === children.length) ? 0 : 1
            };

            return <div ref={`child-${i}`}
                        className={className}
                        key={i}
                        style={style}
                        aria-hidden={isSelectedChild ? 'false' : 'true'}>{child}</div>;
          })}

        </div>
    );
  }
}
