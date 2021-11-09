# NEXT:
* Reset dimension exploder when changing threads
* Visual throbber w/ pending requests somewhere when waiting for chart data
* Local storage

# BACKLOG
Support more than one aggregator (e.g. W-o-W and Y-o-Y as a fainter line)
Reset zoom only clickable when zoom is in use
Notable dates per thread in sources to use as reference lines (or in tooltip?)
Null as 0 option for sources
Filter exploder => Create Toggle component based on Button
Adhoc: Smarter date validation
Error banner
Reset dimension exploder when changing threads
Legend: Cmd+click: Only this item
Show empty graph instead of blank pane when no data is available for filter choices
Tab name is copied with tab # as well
Pause mode, or grouping changes close together

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
Move threads-server/data/datasources.json file out of git repo and load by value when starting the server

Filters
* Floats on top of content when expanded so blur works properly and content doesn't reflow
* Type / search when expanded (standalone with new onChange handler to filter options)
* Focus on search when expanded no matter how expansion happens