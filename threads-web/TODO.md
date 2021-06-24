# NEXT
* Finish config appearance styling
* Tab order should be deterministic and not change based on which tabs are present in the dictionary
* Styling Close-tab button
* max-width w/ text truncation based on number of tabs
* Scroll through tabs list
* Active tab has more prominence no bottom border

# TODO

Refactor
* Data-loading hooks?

Bug: Select All on FilterSelect unhighlights everything

Tabs
* Don't requery when switching threads

Axis
* Format axis values with commas
* Merge axes of same unit together

Thread Config
* Undo
* Rename

General UI
* Loading page while loading sources

Filter selector
* Value search
* Collapsed by default
* Grouped values

Lines:
* Tooltips

Page
Explode

Persistent URLs
Title
Description / notes
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