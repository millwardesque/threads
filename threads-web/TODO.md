# NEXT
Bug: Lines don't redraw when indexes change

# BACKLOG
Tabs:
* Bug: Chart redraws on tab change

Refactoring:
* Use Thunks
* Button component
* Move chart data extraction to hook

Filter selector
* Option search
* Collapsed by default
* Grouped options
* Explode filter

Lines:
* Tooltips


Custom legend for grouping sub-lines in legend
Refactor axios into reusable async hook or thunks
Clone / duplicate tab
State when waiting for sources
Undo
Update graph rather than redrawing it
Persistent URLs / config loading from server
Money formatting in axis
Equator lines
Annotation lines
Historical lines
Trailing average, etc.
Adhoc lines
Bug?: Switching to a new source with a default plot that has the same ID as the current plot. Will this refresh the line properly?
Auto-number sources
Share types between server and client (central shared lib?)
tsconfig to match work
axios fail error states
Short labels for plots and sources
Nicer filter selector
Megaselect for searching sources / plots by name)
Source / plot tags
Zoom
Source groups
Source maker
Line up axes on left side?
Check all threads' active filters after source filters change
Hide config bar
Common shared filters
max-width w/ text truncation based on number of tabs
I hate the duplication of functionality between EditableString and Tab
Support stacked and stacked-100% charts for exploded threads
Date range selector (default to trailing year)

Defensive (i.e. stuff I haven't observed but could be possible)
* Tab order should be deterministic and not change based on which tabs are present in the dictionary