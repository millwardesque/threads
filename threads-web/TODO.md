# NEXT:

Bug: Stacking should not be combined outside of the thread
Bug: Render stacked graphs with transparency, and last

# BACKLOG

Refactor to chart config to have cleaner mechanism for overrides
Bug: Stacked-100% graphs should recompute when a sub-line is hidden (e.g. by clicking the legend)
Bug: Stacked-100% graphs don't seem to work with missing data?
Bug: Chart bottom gets hidden if drawn when screen has scrolled down (e.g. scroll down to look at filters, then reload page)

Calculated lines

-   Handle thrown errors
-   Use simpler placeholder extraction
-   Field validation should check for self-reference and valid thread-refs
-   Refresh calculated lines last
-   Refresh calculated lines when dependency lines change
-   What to do when a referenced tab is deleted
-   What to do when a non-referenced tab is deleted and the order changes
-   Divide single line by exploded lines
-   Divide exploded lines by single line

Don't reset zoom on param change
Focus on input fields when switching to adhoc / calculated thread tab
Calculated threads show filters common to all upstream threads
Maintain axes scale on line hide?
Don't show hidden lines when graph re-renders
Random sample from filters
Treat percentages as 0..1 range so calculated fields don't have to be manually multiplied by 100
Reset dimension exploder when changing threads
Visual throbber w/ pending requests somewhere when waiting for chart data
Local storage
Keyboard nav for selected-dot navigation in chart
Support more than one aggregator (e.g. W-o-W and Y-o-Y as a fainter line)
Reset zoom only clickable when zoom is in use
Notable dates per thread in sources to use as reference lines (or in tooltip?)
Null as 0 option for sources
Adhoc: Smarter date validation
Error banner
Reset dimension exploder when changing threads
Legend: Cmd+click: Only this item
Show empty graph instead of blank pane when no data is available for filter choices
Tab name is copied with tab # as well
Pause mode, or debouncing

Visual throbber somewhere when waiting for chart data

Make classes serializable
Use correct loader in redux

Bug: Zoom resets on smoothing change
Recreate graph when browser resizes

Filter selector

-   Option search
-   Collapsed by default
-   Grouped options

Lines:

-   Tooltips

Smoothing options

-   Centered average
-   Weekly average
-   Monthly average

Custom legend for adding Header to sub-lines in legend
Refactor axios into reusable async hook or thunks
Exploder to create new tabs
State when waiting for sources
Undo
Use StandaloneInput in EditableString (requires allowing StandaloneInput to be focused)
Replace redux
Persistent URLs / config loading from server
Annotation lines
Historical lines
Bug?: Switching to a different source with a default plot that has the same ID as the current plot. Will this refresh the line properly?
Share types between server and client (central shared lib?)
tsconfig to match work
axios fail error states
Use react-query
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
Log scale
Thread type selector in panel rather than as +button in tab list
Weekly instead of daily support
Move threads-server/data/datasources.json file out of git repo and load by value when starting the server
Dictionary key => value mappings (e.g. Yes/No)

Filters

-   Floats on top of content when expanded so blur works properly and content doesn't reflow
-   Type / search when expanded (standalone with new onChange handler to filter options)
-   Focus on search when expanded no matter how expansion happens
