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

  zoomOut = (_, node) => {
    // Get zoom-out `depth`
    const showToDepth = (
      // If node is deeper than the root:
      node.depth > 0
      // Ascend 1 in the `depth` tree.
      ? node.depth - 1
      // Otherwise, use current depth.
      : this.state.showToDepth
    );

    // Go to grandparent, parent, or self if cannot zoom out further.
    const { id: rootNodeId } = (
      // Use grand parent.
      (node.parent && node.parent.parent)
      // Use parent if no grand parent.
      || node.parent
      // Use self if there are no ancestors.
      || node
    );

    // Update state.
    this.setState({
      rootNodeId,
      showToDepth,
    });
  }

  zoomIn = (_, node) => {
    // Get zoom-in `depth`
    const showToDepth = (
      // If height has room to zoom (0).
      node.height > 0
      // Descend 1 in the `depth` tree.
      ? node.depth + 1
      // Otherwise, use current depth.
      : this.state.showToDepth
    );

    // Update state.
    this.setState({
      rootNodeId: node.id,
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
        onClick={this.zoomIn}
        onDoubleClick={this.zoomOut}
        defsUrl="url(#dropshadow)"
        height={height}
        width={width}
      />
    );
  }
}
