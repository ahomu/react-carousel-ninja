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
    evt.preventDefault();
    this.setState({
      deltaX : evt.clientX - this.startCoordinate.x,
      deltaY : evt.clientY - this.startCoordinate.y
    });
  }

  onMouseUp(evt: MouseEvent) {
    if (!this.state.dragging) {
      return;
    }
    this.handleSwipe();
  }

  onMouseLeave(evt: MouseEvent) {
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
     * 選択された要素が見た目上の中央であるとして、その右側と左側にあるべき要素を分類する
     *
     * @example this.props.children = [0, 1, 2, 3, 4]
     *          this.props.select   = 3
     */
    const children: React.ReactNode[] = (React.Children as any).toArray(this.props.children);
    const halfSideSize = Math.floor(children.length / 2);

    // [0, 1, 2, *3*, 4] => [0, 1, 2]
    let leftward = children.slice(0, this.props.select);
    // [0, 1, 2, *3*, 4] => [4]
    let rightward = children.slice(this.props.select + 1, children.length);

    // 片側にある過剰分の要素を、もう片側に移して結合する
    if (leftward.length > halfSideSize) {
      // right:[4] + left:[0](, [1, 2]) => left:[1, 2]/ center:[3] / right:[4, 0]
      rightward = [].concat(rightward, leftward.splice(0, leftward.length - halfSideSize));
    } else if (rightward.length > halfSideSize) {
      // right:(2, 3, )[4] + left:[0] => left:[4, 0] / center:[1] / right:[2, 3]
      leftward = [].concat(rightward.splice(halfSideSize), leftward);
    }

    return (
        <div className={`${this.props.className} carousel-ninja__inner ${this.state.dragging ? 'carousel-ninja__inner--dragging' : ''}`}
             onMouseDown={this.onMouseDown.bind(this)}
             onMouseMove={this.onMouseMove.bind(this)}
             onMouseUp={this.onMouseUp.bind(this)}
             onMouseLeave={this.onMouseLeave.bind(this)}>

          {children.map((child: React.ReactNode, i: number) => {
            const isCenter = (i === this.props.select);
            let isLeftEdge = false;
            let isRightEdge = false;

            let arrangedPos: number;
            let calcFunction: string;

            // TODO multiple translateX で表現できないか？ calc() があると IE10, IE11 で transition されない
            // TODO 50% のかわりに ラッパーのwidth / 2で実数計算するとか？
            // 左側・右側・中央のいずれに属しているかで位置の指定を変更する
            if ((arrangedPos = leftward.indexOf(child)) !== -1) {
              // Leftward [0=1920, 1=1280, 2=640] 左側は配列の始点に向けてオフセットを大きくとる
              let baseTranslateX = (leftward.length - arrangedPos) * this.state.innerWidth
              calcFunction = `calc(50% - ${baseTranslateX - this.state.deltaX}px)`;
              isLeftEdge = arrangedPos === 0;
            } else if ((arrangedPos = rightward.indexOf(child)) !== -1) {
              // Rightward [0=640, 1=1280, 2=1920] 右側は配列の終点に向けてオフセットを大きくとる
              let baseTranslateX = (arrangedPos + 1) * this.state.innerWidth
              calcFunction = `calc(50% + ${baseTranslateX + this.state.deltaX}px)`;
              isRightEdge = arrangedPos === rightward.length - 1;
            } else {
              // Center
              calcFunction = `calc(50% + ${0 + this.state.deltaX}px)`;
            }

            const className = `carousel-ninja__pane ${isCenter ? this.props.activeClass : ''}`;
            const style = {
              left       : calcFunction,
              marginLeft : `-${this.state.innerWidth / 2}px`,
              opacity    : (isLeftEdge || isRightEdge) ? 0 : 1
            };

            return <div ref={`child-${i}`}
                        className={className}
                        key={i}
                        style={style}
                        aria-hidden={isCenter ? 'false' : 'true'}>{child}</div>;
          })}

        </div>
    );
  }
}
