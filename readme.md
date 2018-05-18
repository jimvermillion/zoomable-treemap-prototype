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
* [ ] filtering data is also an option. Could filter by only the descendants of zoomed node whose `depth` is less than that of `showToDepth`.

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
* [ ] Organize anything that can be animated into a dataProcessor function.
* [ ] Use react-move <NodeGroup /> that uses the data processor to animate the treemap in the way already established in IHME-UI react-move branches.

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

### Current notes on animation challenges
This implementation is ~somewhat~ the equivalent of hard-coding what we want the animation to do. Which is pretty far from the peripheral goal of making the Treemap generic enough for IHME-UI. It would be good to put all animation decisions into a single datum processing function that can be passed to the animation NodeGroup. This will probably require some instance functions to be static class functions so that the Treemap component can get the same results that are currently derived from instance methods. 
* The datum processor should have an additional map that wraps any animation methods in an array.
* It may be good to actually return an array with each prop wrapped in an object and an array for (as the animation functions do in ihme-ui).
* The lower level components could be passed the calculated props, or calc themselves if they are not present.
* It is becoming more apparent that the data should be first top-filtered to its root node. This could help performance as well as tuning animation since I'm not convinced nodes currently `leave` the dom triggering that animation event.