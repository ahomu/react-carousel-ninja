import * as React from 'react';
import ReactElement = __React.ReactElement;

interface CarouselSelectorProps extends React.Props<CarouselNinjaSelector> {
  activeClass?: string;
  select: number;
  length: number;
  onSelect?: (prevI: number, nextI: number) => void;
  onClickSelector?: (selectI: number) => void;
}

export default class CarouselNinjaSelector extends React.Component<CarouselSelectorProps, any> {

  static defaultProps = {
    activeClass     : ' is-active',
    select          : 0,
    length          : 0,
    onSelect        : () => {},
    onClickSelector : () => {},
  };

  componentWillReceiveProps(nextProps: CarouselSelectorProps) {
    if (this.props.onSelect) {
      this.props.onSelect(nextProps.select, this.props.select);
    }
  }

  shouldComponentUpdate(nextProps: CarouselSelectorProps) {
    return false ||
      nextProps.select !== this.props.select ||
      nextProps.children !== this.props.children
    ;
  }

  renderFromChildren() {
    return React.Children.map(this.props.children, (child: React.ReactNode, i: number) => {
      const isSelectedChild = i === this.props.select;
      let className = 'CarouselNinjaSelector__item';
      className += isSelectedChild ? this.props.activeClass : '';
      return (
        <li className={className}
            key={i}
            onClick={this.props.onClickSelector.bind(this, i)}
            aria-selected={isSelectedChild ? 'true' : 'false'}>
          {child}
        </li>
      );
    });
  }

  renderItemsBySelf() {
    const children: ReactElement<any>[] = [], iz = this.props.length;
    for (let i = 0; i < iz; i++) {
      let isSelectedChild = i === this.props.select;
      let className = 'CarouselNinjaSelector__item';
      className += isSelectedChild ? this.props.activeClass : '';
      children.push((
        <li className={className}
            key={i}
            onClick={this.props.onClickSelector.bind(this, i)}
            aria-selected={isSelectedChild ? 'true' : 'false'}>
          <button tabIndex={-1} />
        </li>
      ))
    }
    return children
  }

  render() {
    return (
      <ul className="CarouselNinjaSelector">
        {React.Children.count(this.props.children) ? this.renderFromChildren() : this.renderItemsBySelf()}
      </ul>
    );
  }
}
