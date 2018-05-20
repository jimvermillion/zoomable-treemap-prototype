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
* [x] size (if should be displayed at all)
* [x] rotation (if there is space vertically)  
* [x] good implementation for customizable <defs/> for dropshadow

Resizing: 
* [x] Hopefully the <ResponsiveContainer/> will work to pass in `width and height`

zoom:
* [x] Scale x/y to zoom
* [x] state-wise, there is some logic to which Node we are zooming and what `showToDepth` to pass to the <Treemap/> component.
* [x] Adding event handlers would be necessary and it would be smart to handle them here, including double-click.

possible performance enhancements:
* [x] filtering data is also an option. Could filter by only the descendants of zoomed node whose `depth` is less than that of `showToDepth`.

attribution:
* [x] how does Evan do it?
    * [x] can we apply this to ours
* [x] figure it (discovery)
    * [x] implement it.
    
animation:
* [x] Investigate if using <Animate /> would make sense.
* [x] Refactor anything that can be consumed by Treemap.tsx into its own class.
* [x] Compile a list of everything that we would like to be animated.
* [x] Use <Animate /> more to figure out exactly how to fine tune animation.
* [x] Organize anything that can be animated into a dataProcessor function.
* [x] Use react-move <NodeGroup /> that uses the data processor to animate the treemap in the way already established in IHME-UI react-move branches.

zoom logic: 
* [ ] when at a leaf, zoom out should go to direct parent?

prototype specific functionality:
* [ ] UI element such as a slider to control depth/breakdown
* [x] click to zoom

## Animation notes:
### List of things one might want to animate:
- x0, x1, y0, y1 of the cells
- Text size/rotation
- Introduction of child cells
- attribution amount <- independently
- cell fill color change

### Still TODO:
* [ ] Don't render attribution if no value is given
  * [ ] Clean up attribution field accessors
* [ ] use propResolver where available, streamline what gets fed to components.
  * [ ] implement `keyField` rest of common accessors.
* [x] Implement selected cells (sort data putting selected cells last)
* [ ] Implement onmouseover/hover for focused node.
* [ ] get rid of `any`s where possible. 
