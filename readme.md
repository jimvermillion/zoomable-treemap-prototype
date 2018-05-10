# Zoomable Treemap Prototype
## TypeScript, React, D3
Treemap Thoughts

Data: Finished
The data need not start in a hierarchical fashion. But it does need:
- reference to its own id
- reference to parent’s id
Then it should be coerced into hierarchy by stratify.

Layout: Finished
Done by d3.treemap() with tile, round, size, padding options

Features to complete:
Labels:
- size (if should be displayed at all)
- rotation (if there is space vertically)  
- good implementation for customizable <defs/> for dropshadow

Resizing: 
- Hopefully the <ResponsiveContainer/> will work to pass in `width and height`

zoom:
- It looks like there are a few ways to go about it, but perhaps using a scale will work best
- filtering data is also an option.
- state-wise, there is some logic to which Node we are zooming and what `showToDepth` to pass to the <Treemap/> component.

attribution:
- how does Evan do it?
    - can we apply this to ours
- figure it (discovery)
    - implement it.

prototype specific functionality:
- UI element such as a slider to control depth/breakdown
- click to zoom
