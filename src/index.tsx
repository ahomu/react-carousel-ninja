/// <reference path="../typings/bundle.d.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as throttle from 'throttleit';
import CarouselNinjaContainer from './CarouselNinjaContainer';
import CarouselNinjaSelector from './CarouselNinjaSelector';

const DURATION_THROTTLE_KEYUP = 150;

const KEYCODE_LEFT  = 37;
const KEYCODE_RIGHT = 39;

interface CarouselNinjaProps extends React.Props<CarouselNinja> {
  className?: string;
  activeClass?: string;
  onSelect?: (prevI: number, nextI: number) => void;
}

class CarouselNinja extends React.Component<CarouselNinjaProps, any> {

  static defaultProps = {
    className   : '',
    activeClass : ' is-active',
    onSelect    : () => {},
  };

  state = {
    currentSelect : 2
  };

  updateSelect(select: number) {
    const lastIndex = React.Children.count(this.props.children) - 1;
    if (select < 0) {
      this.setState({
        currentSelect : lastIndex
      });
    } else if (select > lastIndex) {
      this.setState({
        currentSelect : 0
      });
    } else {
      this.setState({
        currentSelect : select
      });
    }
  }

  onKeyUp = throttle((e: KeyboardEvent) => {
    switch(e.keyCode) {
      case KEYCODE_LEFT:
        this.updateSelect(this.state.currentSelect - 1);
        break;
      case KEYCODE_RIGHT:
        this.updateSelect(this.state.currentSelect + 1);
        break;
    }
  }, DURATION_THROTTLE_KEYUP);

  onSelectChange(nextI: number, curtI: number) {
    this.props.onSelect(nextI, curtI);
  }

  onClickSelector(selectI: number) {
    this.updateSelect(selectI);
  }

  onSwipeLeft(nextI: number) {
    this.updateSelect(nextI);
  }

  onSwipeRight(nextI: number) {
    this.updateSelect(nextI);
  }

  render() {
    // TODO [aria-controls]

    return (
      <div tabIndex={0} className={this.props.className} onKeyUp={this.onKeyUp.bind(this)}>
        <CarouselNinjaContainer activeClass={this.props.activeClass}
                                select={this.state.currentSelect}
                                onSelect={this.onSelectChange.bind(this)}
                                onSwipeLeft={this.onSwipeLeft.bind(this)}
                                onSwipeRight={this.onSwipeRight.bind(this)}>
          {this.props.children}
        </CarouselNinjaContainer>

        <CarouselNinjaSelector activeClass={this.props.activeClass}
                               select={this.state.currentSelect}
                               length={React.Children.count(this.props.children)}
                               onSelect={this.onSelectChange.bind(this)}
                               onClickSelector={this.onClickSelector.bind(this)} />
      </div>
    );
  }
}

ReactDOM.render(<CarouselNinja className="myCarousel">
  <article className="myPane" id="first"><img width="640" height="480" src="http://lorempixel.com/640/479/cats/" /></article>
  <article className="myPane" id="second"><img width="640" height="480" src="http://lorempixel.com/639/480/cats/" /></article>
  <article className="myPane" id="third"><img width="640" height="480" src="http://lorempixel.com/639/479/cats/" /></article>
  <article className="myPane" id="fourth"><img width="640" height="480" src="http://lorempixel.com/640/478/cats/" /></article>
  <article className="myPane" id="fifth"><img width="640" height="480" src="http://lorempixel.com/638/480/cats/" /></article>
</CarouselNinja>, document.getElementById('app'));

export {
  CarouselNinja,
  CarouselNinjaContainer,
  CarouselNinjaSelector
};
