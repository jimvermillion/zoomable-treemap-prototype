import React from 'react';

import Treemap from '../components/treemap';

interface TreemapViewProps {
  data: any;
  height?: number;
  rootNodeId?: number | string;
  width?: number;
}

interface TreemapViewState {
  rootNodeId?: number | string;
  showToDepth: number;
}

export default class TreemapView extends React.PureComponent<
  TreemapViewProps,
  TreemapViewState
> {
  constructor(props) {
    super(props);
    this.state = { showToDepth: 0 };
  }

  onDoubleClick = (_, data) => {
    // Get zoom-out `depth`
    const showToDepth = data.depth > 0 ? data.depth - 1 : this.state.showToDepth;

    // Go to grandparent, parent, or self if cannot zoom out further.
    const ancestor = (
      // Use grand parent.
      (data.parent && data.parent.parent)
      // Use parent if no grand parent.
      || data.parent
      // Use self if there are no ancestors.
      || data
    );

    // Update state.
    this.setState({
      rootNodeId: ancestor.id,
      showToDepth,
    });
  }

  onClick = (_, data) => {
    // Get zoom-in `depth`
    const showToDepth = data.height > 0 ? data.depth + 1 : this.state.showToDepth;

    // Update state.
    this.setState({
      rootNodeId: data.id,
      showToDepth,
    });
  }

  render() {
    const {
      data,
      height,
      width,
    } = this.props;

    const {
      rootNodeId,
      showToDepth,
    } = this.state;

    return (
      <Treemap
        data={data}
        rootNodeId={rootNodeId}
        fieldAccessors={{ label: 'location_name' }}
        showToDepth={showToDepth}
        onClick={this.onClick}
        onDoubleClick={this.onDoubleClick}
        defsUrl="url(#dropshadow)"
        height={height}
        width={width}
      />
    );
  }
}
