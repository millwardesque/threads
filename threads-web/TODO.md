# NEXT
Create source, and filter-change, update-thread actions to redux

# BACKLOG

## Waiting on Redux
Refactor
* Data-loading hooks?

Thread Config
* Rename
* Custom title
* Per-thread description / notes

Redux source filters
Undo

## Unblocked
Tabs:
* Tab order switches when changing tabs
* Bug: Don't lines redraw when switching tabs

Filter selector
* Value search
* Collapsed by default
* Grouped values
* Explode filter

Lines:
* Tooltips

Simplify active-thread andt thread interactions
Persistent URLs / config loading from server
Money formatting in axis
Annotation lines
Historical lines
Adhoc lines
Bug: Why does Axios get called twice? I think it's a setState / re-render on the loading state
Bug?: Switching to a new source with a default plot that has the same ID as the current plot. Will this refresh the line properly?
Auto-number sources
Share types between server and client (central shared lib?)
tsconfig to match work
axios fail error states
Short labels for plots and sources
Nicer filter selector
Megaselect for searching sources / plots by name)
Source / plot tags
Source groups
Source maker
Line up axes on left side?
Check all threads' active filters after source filters change
Hide config bar
Common shared filters
max-width w/ text truncation based on number of tabs

Defensive (i.e. stuff I haven't observed but could be possible)
* Tab order should be deterministic and not change based on which tabs are present in the dictionary