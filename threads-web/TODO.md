# NEXT

# BACKLOG
Adhoc: Smarter date validation
Bug: Make classes serializable
Bug: Reset sub-numbering in tabs and legend when unexploding
Bug: Missing data with no values within dates

Bug: Clearing name in tab doesn't reset to use fallback

Error banner

Tabs:
* Bug: Chart redraws on tab change

* Bug: Blinking cursor in adhoc text box isn't visible

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

Equator lines
* Formula input box
* Validate formula
* Units input box
* Compute values
* Draw as dotted line
* Legend as dotted line
* What to do when a referenced tab is deleted
* Divide single line by exploded lines
* Divide exploded lines by single line

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
Megaselect for searching sources / plots by name
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
