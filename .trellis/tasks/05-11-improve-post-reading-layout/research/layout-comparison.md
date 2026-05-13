# Layout Comparison

## Reference Page

URL: `https://blog.hikarilan.life/thinking/3250/why-i-believe-junior-tech-jobs-will-gone/`

Measured with Playwright at `1440x900`:

* Left sidebar: `x=125`, `w=280`
* Main column: `x=405`, `w=910`
* Article card: `x=425`, `w=870`
* Post content: `x=455`, `w=810`

Takeaway: the reference page uses a balanced two-column composition where the left sidebar holds navigation/TOC and the article card occupies a broad central/right reading area. The right edge does not have a large unused void.

## Current Local Page

URL: `http://127.0.0.1:55137/posts/learning-rocksdb-day014-compaction-styles-and-write-stall/`

Measured with Playwright at `1440x900`:

* Body/main content area: `x=64`, `w=1312`
* Header: `x=64`, `w=778`
* Article content: `x=64`, `w=691`
* TOC wrapper: `x=829`, `w=256`
* Right unused space after TOC: about `355px`

Takeaway: the article starts at the far-left edge of the wide content container. The TOC sits around the visual middle, and the right side remains mostly empty.

## Implementation Direction

Prefer a scoped post-page layout override:

* Center the article/TOC pair as a single reading grid on desktop.
* Keep article width near the existing comfortable reading width.
* Put TOC in a right rail with a controlled gap instead of relying on `lg:ms-auto` and extra margin.
* Keep mobile behavior unchanged.

## Final Measurements

After implementation:

* `1440x900`: article content `x=186`, `w=768`; TOC `x=998`, `w=256`; page `scrollWidth=1440`.
* `1024x768`: article content `x=64`, `w=641`; TOC `x=736`, `w=224`; page `scrollWidth=1024`.
* `390x844`: article content `x=24`, `w=342`; desktop TOC hidden, mobile TOC visible; page `scrollWidth=390`.

Sticky verification at `1440x900`:

* At page top: TOC `y=684`, TOC rail height `34501`.
* After scrolling to `1600px`: TOC rail `y=-916`, TOC stays at `y=140`.
* Required fix: keep the TOC grid item stretched to the article row height; otherwise the sticky element's containing block is only as tall as the TOC itself and it scrolls away with its parent.
