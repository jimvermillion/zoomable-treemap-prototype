import {
  hierarchy,
  nest,
} from 'd3';
import React from 'react';

interface TreemapProps {
  data: any[],
};

export default class Treemap extends React.PureComponent<TreemapProps> {
  render() {
    console.log(dataUtil(this.props.data));
    return <h1>I am a Treemap</h1>;
  }
}

function dataUtil(data) {
  const nestedData = nest()
    .key(d => d.region)
    .key(d => d.subregion)
    .key(d => d.country)
    .key(d => d.state)
    .entries(data);

  const hierarchichalData = hierarchy(nestedData, d => {
    console.log(d);
    return d.values;
  })
    .eachBefore(function(d) {
      const parent = d.parent ? d.parent.id : '';
      d.id = parent + d.data.name;
    })
    .sum(d => {
      console.log(d)
      return d.value;
    })
    .sort((a, b) => b.height - a.height || b.value - a.value);

  return hierarchichalData;
}