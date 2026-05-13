# Improve Desktop Post Reading Layout

## Goal

Make desktop post reading pages feel less cramped and more balanced. The current layout places article text on the left, the table of contents near the middle, and leaves a large empty area to the right.

## What I Already Know

* User reports the current desktop post page feels cramped.
* User points to `https://blog.hikarilan.life/thinking/3250/why-i-believe-junior-tech-jobs-will-gone/` as a more comfortable reference layout.
* This is a Hugo site using the Blowfish theme with local overrides under `assets/css/custom.css` and project layouts under `layouts/`.
* Scope should stay limited to post reading layout unless inspection shows the shared container style is the real cause.

## Assumptions

* The target is desktop/tablet-wide reading pages; mobile should remain single-column and readable.
* The preferred direction is a centered article column with TOC acting as a side rail instead of occupying the middle of the viewport.
* Existing theme behavior should be preserved as much as possible.

## Open Questions

* None blocking yet; derive exact layout implementation from the current theme structure and the reference page.

## Requirements

* Article content should not be pinned to the far left on desktop.
* The main text column should have a comfortable maximum width for long-form reading.
* The TOC should remain available on desktop without creating a large awkward blank area.
* Changes must not degrade mobile layout.

## Acceptance Criteria

* [x] On a desktop viewport, article body and TOC occupy a visually balanced reading region.
* [x] The article body is not squeezed by a middle-positioned TOC.
* [x] Mobile layout remains single-column with no horizontal overflow.
* [x] Hugo build succeeds.
* [x] Visual measurement confirms the article/TOC pair is centered better than the current `x=64` article start at `1440px`.

## Definition of Done

* Relevant frontend specs/guidelines reviewed.
* Layout implementation follows existing theme override patterns.
* Local build or equivalent verification passes.
* Visual check performed for desktop and mobile viewports.

## Out of Scope

* Redesigning the full theme, homepage, list pages, or content typography beyond what is needed for reading layout.
* Changing article content.
* Replacing the Blowfish theme.

## Technical Notes

* Reference page: `https://blog.hikarilan.life/thinking/3250/why-i-believe-junior-tech-jobs-will-gone/`
* Research notes: [`research/layout-comparison.md`](research/layout-comparison.md)
* Initial likely files to inspect: `assets/css/custom.css`, `layouts/`, `config/`, and Blowfish article templates/CSS under `themes/blowfish/`.

## Technical Approach

Use the existing local `layouts/_default/single.html` override and `assets/css/custom.css`. Add stable page-specific wrapper classes around the article body section and TOC/content columns, then replace the broad left-aligned flex behavior with a centered desktop grid. Keep existing mobile order and mobile TOC behavior intact.
