import noop from 'lodash-es/noop';
import React from 'react';

export interface DoubleClickComponentProps {
  doubleClickTiming?: number;
  onClick?: (...args: any[]) => void;
  onDoubleClick?: (...args: any[]) => void;
}

export default class DoubleClickReactComponent<
  P extends DoubleClickComponentProps,
  S
>
extends React.Component<P, S> {
  static defaultProps: DoubleClickComponentProps = {
    doubleClickTiming: 250,
    onClick: noop,
    onDoubleClick: noop,
  };

  clickTimeout: NodeJS.Timer | number | null;

  componentDidMount() {
    this.clickTimeout = null;
  }

  clearAndNullTimeout() {
    clearTimeout(this.clickTimeout as number);
    this.clickTimeout = null;
  }

  onClick = (event, data, component) => {
    this.props.onClick(event, data, component);
    this.clearAndNullTimeout();
  }

  onDoubleClick = (event, data, component) => {
    this.props.onDoubleClick(event, data, component);
    this.clearAndNullTimeout();
  }

  handleClicks = (
    event,
    data,
    component,
  ) => {
    if (this.clickTimeout !== null) {
      this.onDoubleClick(event, data, component);
    } else {
      this.clickTimeout = setTimeout(() => {
        this.onClick(event, data, component);
      }, this.props.doubleClickTiming);
    }
  }
}
