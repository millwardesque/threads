# NEXT

# BACKLOG
Tabs:
* Tab order switches when changing tabs
* Bug: Flicker on tab change

Refactoring:
* Use Thunks

Filter selector
* Option search
* Collapsed by default
* Grouped options
* Explode filter

Lines:
* Tooltips

Refactor axios into reusable async hook
State when waiting for sources
Undo
Update graph rather than redrawing it
Persistent URLs / config loading from server
Money formatting in axis
Annotation lines
Historical lines
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
Source groups
Source maker
Line up axes on left side?
Check all threads' active filters after source filters change
Hide config bar
Common shared filters
max-width w/ text truncation based on number of tabs
I hate the duplication of functionality between EditableString and Tab

Defensive (i.e. stuff I haven't observed but could be possible)
* Tab order should be deterministic and not change based on which tabs are present in the dictionary