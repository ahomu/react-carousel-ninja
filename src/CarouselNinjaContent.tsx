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
  outerWidth?: number;
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
    const firstChild: Element = this.refs['child-0'] as any;
    this.setState({
      outerWidth : ReactDOM.findDOMNode(this).clientWidth,
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
    let transformDeclaration: string;

    // before calc innerWidth (first mount)
    if (this.state.innerWidth) {
      const baseOffsetX = this.state.innerWidth * this.props.select;
      transformDeclaration = `translate3d(-${baseOffsetX - this.state.deltaX}px, 0, 0)`;
    } else {
      const offsetPerPane = 100 / React.Children.count(this.props.children);
      transformDeclaration = `translate3d(-${offsetPerPane * this.props.select}%, 0, 0)`;
    }

    const widthOuterBwInner = (this.state.outerWidth - this.state.innerWidth) || 2;
    const style = {
      marginLeft : `${widthOuterBwInner / 2}px`,
      transform  : transformDeclaration
    };

    return (
      <div ref="outer"
           className={`${this.props.className} carousel-ninja__outer`}>
        <ul ref="inner"
            className={`carousel-ninja__inner ${this.state.dragging ? 'carousel-ninja__inner--dragging' : ''}`}
            style={style}
            onMouseDown={this.onMouseDown.bind(this)}
            onMouseMove={this.onMouseMove.bind(this)}
            onMouseUp={this.onMouseUp.bind(this)}
            onMouseLeave={this.onMouseLeave.bind(this)}>

          {React.Children.map(this.props.children, (child: React.ReactNode, i: number) => {
            const isSelectedChild = i === this.props.select;
            const className = `carousel-ninja__pane ${isSelectedChild ? this.props.activeClass : ''}`;

            return <li ref={`child-${i}`}
                       className={className}
                       key={i}
                       aria-hidden={isSelectedChild ? 'false' : 'true'}>{child}</li>;
          })}

        </ul>
      </div>
    );
  }
}
