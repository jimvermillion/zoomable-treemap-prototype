import { HierarchyNode } from 'd3-hierarchy';
import React from 'react';

import Treemap, { TreemapDataAccessors } from './Treemap';

interface TreemapViewProps {
  data: HierarchyNode<any>;
  dataAccessors?: TreemapDataAccessors;
  height?: number;
  rootNodeId?: number | string;
  width?: number;
}

interface TreemapViewState {
  focused?: number | string;
  rootNodeId?: number | string;
  selection?: number[] | string[];
  showToDepth: number;
}

// Basic focused/selected styles for development.
const FOCUSED_STYLE = { stroke: 'red' };
const SELECTED_STYLE = { stroke: 'green' };

export default class TreemapView
extends React.PureComponent<
  TreemapViewProps,
  TreemapViewState
> {
  static defaultProps = {
    dataAccessors: {
      id: 'location_id',
      parentId: 'parent_location_id',
      label: 'location_name',
      attribution: {
        value: 'attribution',
      },
      value: 'value',
    },
  };

  constructor(props) {
    super(props);
    this.state = { showToDepth: 3 };
  }

  getParents = (node) => {
    if (!node.parent) {
      return [node.data.location_name];
    }
    return [...this.getParents(node.parent), node.data.location_name];
  }

  zoomOut = (_, node) => {
    // Is the Treemap at a leaf node that has siblings?
    const zoomedAsFarAsPossibleOnNonOnlyChild = (
      node.height === 0
      && node.id === this.state.rootNodeId
      && node.parent.children.length > 1
    );

    // Go to grandparent, parent, or self if cannot zoom out further.
    const rootNode = (
      // Use grand parent.
      (!zoomedAsFarAsPossibleOnNonOnlyChild && node.parent && node.parent.parent)
      // Use parent if no grand parent.
      || node.parent
      // Use self if there are no ancestors.
      || node
    );

    const depthToAscend = (
      zoomedAsFarAsPossibleOnNonOnlyChild
      ? 0
      : 1
    );

    // Get zoom-out `depth`
    const showToDepth = (
      // If node is deeper than the root:
      node.depth > 0
      // Ascend 1 in the `depth` tree.
      ? node.depth - depthToAscend
      // Otherwise, use current depth.
      : this.state.showToDepth
    );

    // Update state.
    this.setState({
      rootNodeId: rootNode.id,
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

  onMouseOver = (_, node) => {
    if (node.id !== this.state.focused) {
      this.setState({ focused: node.id });
    }
  }

  onMouseLeave = (_, node) => {
    if (node.id === this.state.focused) {
      this.setState({ focused: null });
    }
  }

  render() {
    const {
      data,
      dataAccessors,
      height,
      width,
    } = this.props;

    const {
      focused,
      rootNodeId,
      selection,
      showToDepth,
    } = this.state;

    return (
      <Treemap
        data={data}
        rootNodeId={rootNodeId}
        dataAccessors={dataAccessors}
        focused={focused}
        focusedStyle={FOCUSED_STYLE}
        showToDepth={showToDepth}
        onClick={this.zoomIn}
        onDoubleClick={this.zoomOut}
        onMouseOver={this.onMouseOver}
        onMouseLeave={this.onMouseLeave}
        defsUrl="url(#dropshadow)"
        selection={selection}
        selectedStyle={SELECTED_STYLE}
        height={height}
        width={width}
      />
    );
  }
}
