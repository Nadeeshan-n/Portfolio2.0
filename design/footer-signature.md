# Footer signature

The source of truth is `nadeeshan-signature-reference.png`, copied byte for byte
from the uploaded signature. Its SHA-256 is retained in `signature-trace.json`.
The handwriting is preserved as SVG fill contours, including the original
tapered strokes. Seventeen separate pen paths reveal those contours through
white SVG masks; the pen paths do not replace or restyle the original ink.

`scripts/build-footer-signature.py` regenerates the vector asset. It requires
Pillow, NumPy, SciPy and contourpy. `scripts/footer_signature.py` inserts or
refreshes the shared inline SVG in the nine page footers. The Education,
Projects and Contact generators preserve this integration on future builds.

The N finishes at 600 ms, the name at 1500 ms, the final flourish at 2100 ms,
and the underline at 2600 ms. A 5000 ms hold, 450 ms reverse draw/reset and
100 ms empty pause make an 8150 ms cycle. IntersectionObserver and native Web
Animations pause the cycle outside the footer, in a hidden tab and on page
hide. Returning resumes the same cycle. Initialization is guarded so another
script evaluation cannot create a second controller. Reduced motion and
unsupported animation APIs show the completed signature.

The signature uses the requested light palette by default. Existing explicit
dark theme attributes or a `.dark` ancestor select the requested dark palette.
This asset does not add a separate theme switch to the portfolio. The footer
uses a 150–180 px signature, centred beside the existing information on desktop
and stacked with the existing information on mobile.

Validation: rendered SVG writing milestones and both palettes were inspected
against the uploaded image. The reveal covers more than 99.99% of the traced
ink; empty and reset frames contain no visible ink. Lifecycle checks passed
for viewport/tab visibility, page hide/show, reduced motion, API fallbacks
and repeated initialization. Removing only the signature integration restores
all nine HTML pages byte for byte, including their previous footer content.
The managed browser preview was unavailable. The hosted 12ui alignment kit
could not complete because it requires sign-in; no conversion was purchased.
