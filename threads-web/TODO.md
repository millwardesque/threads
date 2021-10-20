# NEXT: Better multiselect
* Focus on multiselect on expand so blur works properly
* Chevron direction changed on collapsed / expanded
* Chevron click toggles collapsed / expanded
* Vertical divider (l-border?) between chevron and options
* Type / search when expanded
* Max-width on select
* Other threads not showing when explode is invoked on one thread?

# BACKLOG
Filter exploder => Create Toggle component based on Button
Add more FF sources
Adhoc: Smarter date validation
Error banner

Show empty graph instead of blank pane when no data is available for filter choices

Visual throbber somewhere when waiting for chart data

Make classes serializable
Use correct loader in redux

Bug: Zoom resets on smoothing change
Recreate graph when browser resizes

Filter selector
* Option search
* Collapsed by default
* Grouped options

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

Smoothing options
* Centered average
* Weekly average
* Monthly average

Custom legend for adding Header to sub-lines in legend
Refactor axios into reusable async hook or thunks
Clone / duplicate tab
State when waiting for sources
Undo

Use StandaloneInput in EditableString (requires allowing StandaloneInput to be focused)
Use Thunks
Persistent URLs / config loading from server
Annotation lines
Historical lines
Bug?: Switching to a different source with a default plot that has the same ID as the current plot. Will this refresh the line properly?
Share types between server and client (central shared lib?)
tsconfig to match work
axios fail error states
Short labels for plots and sources
Megaselect for searching sources / plots by name
Source / plot tags
Source groups
Source maker
Check all threads' active filters after source filters change
Hideable config bar
Common shared filters
max-width w/ text truncation based on number of tabs
I hate the duplication of functionality between EditableString and Tab
Support stacked and stacked-100% charts for exploded threads
Date range selector (default to trailing year)
Log scale
Thread type selector in panel rather than as +button in tab list
Weekly instead of daily support