# Separate Contact page

The requested `/contact/` route is added without editing any existing section, shared stylesheet, artwork, project data or contact configuration. The current Home Connect button still goes to its on-page Contact section. Following the owner's navigation request, Home, Education, Projects and all project detail headers now include Contact, using the existing desktop links and mobile Menu. The Education and Projects generators preserve the new link when rebuilding. The Contact page retains its active navigation item, shared header and footer components.

## Layout and styling

The centered CONTACT label and Sora 700 heading lead into a 620px form area that blends into the page's #F7F9F7 background, with no outer border or rounded corners on desktop or mobile. The four fields keep the current names, required states, input backgrounds, focus rings and native autocomplete semantics. Two tiny corner marks add texture in the panel padding, outside the fields. Four small technical SVGs occupy outer desktop whitespace, with only two retained on mobile. The page uses the existing ivory, charcoal and jade palette. The submit control inherits the shared flat square sketch-button treatment, 13px Sora 500 text and 46px minimum height, with no arrow. Like the on-page Contact button, it retains the jade fill, white text, charcoal border and small sketch accents while natively disabled. System-color mode preserves its disabled treatment. No shared button rules are edited.

At 520px and below, the name fields stack, input text is 16px, and social controls wrap into centered rows using the same 48px controls and spacing. The form, heading and link section remain centered. The page uses local CSS Grid and Flexbox; only decorative SVGs are positioned absolutely. There is no dependency, animation library, video, GIF, tracking or runtime image fetch.

## Social destinations and assets

Five platform icons remain: Facebook, LinkedIn, WhatsApp, X and GitHub. TikTok, YouTube and Pinterest were removed from the controls and their configuration. The retained icons use authentic paths and original viewBoxes. Monochrome color is supplied with `currentColor`, without altering paths or proportions. Sources and license notices are under `dist/contact/icons/`. Font Awesome's LinkedIn attribution remains in the inline SVG. GitHub, WhatsApp and X use brand-owned SVGs; Facebook uses the current Simple Icons package; LinkedIn uses Font Awesome's SVG, as the brand-owned download is PNG.

The existing verified GitHub profile is active. No other profile URL was supplied or found in the portfolio configuration, and the optional contact-destination question received no answer. The other four icons are native disabled controls with a coming-soon accessible label and title, rather than invented destinations. Set the actual profiles in `dist/contact/socials.json`. Valid public HTTPS URLs activate the appropriate links at runtime, with platform-host validation, `noopener noreferrer`, and announced new-tab behavior. Rebuilding also provides those links in the static HTML.

## Form delivery

The new page reads the existing `/contact.json` without modifying it. Both its email and endpoint are currently null. The native send button is therefore disabled. The visible “Messaging is coming soon.” note and its description reference have been removed as requested; the controller no longer depends on that element. Supplying a real email recipient enables an encoded mailto draft; the status explicitly says the visitor must send it from their email app. A configured public HTTPS JSON endpoint enables direct delivery. Credentials, insecure URLs and sample recipient addresses are rejected.

The controller validates required values and email format, focuses the first invalid field, associates errors through `aria-describedby`, and announces results. Endpoint submission prevents duplicate sends, disables fields while busy, uses a 15-second abort, omits credentials, and retains text on failure. Success is reported only after an accepted response; a JSON failure response also stays a failure. No real email or delivery endpoint was called in verification.

## Motion

All Contact page content appears immediately. There is no entrance fade, upward movement or staggered reveal for the label, heading, supporting copy, form, fields, submit row or social controls. The generator and stylesheet no longer add entrance classes or delayed animation rules. Content also remains visible without JavaScript.

After 1500ms, a tiny jade dot transitions into the hand-drawn plane. It follows the very same SVG path progressively drawn behind it, with a 3.5-second eased flight, 450ms settling phase and 650ms reverse path erasure. The flight ends at 6550ms and never restarts on scroll, hover or submission. The path stays in the upper and outer whitespace, ending in the form's upper-right padding. Compact layouts use a smaller plane and right-edge lane. Geometry is measured again before the flight starts, and responsive resizing preserves progress.

Hidden documents pause the flight and background drift. Reduced motion disables floating motion and ends the flight permanently. Unsupported frame or SVG geometry APIs leave a static page. SVGs are non-interactive and hidden from assistive technology. Focus indicators and system-color fallbacks remain available.

## Build and verification

```sh
python3 scripts/build-contact.py
node --check dist/contact/contact-page.js
node scripts/check-contact-page.cjs
```

Checks pass for pending/unsafe configuration, required-field errors, encoded email drafts, direct-delivery success and failure, duplicate-submit protection, safe social activation, staged one-time flight, hidden-page pause, responsive route updates, reduced-motion and unsupported-API fallbacks, and mobile menu behavior. All requests and geometry APIs are mocked.

Structural checks confirm four correctly labeled fields, unique IDs, five valid social SVGs with original paths/viewBoxes, valid local asset/route references and correct external-link attributes. Initial page-creation checks confirmed every pre-existing tracked file was unchanged. The navigation follow-up checks confirm the Contact destination, active states and mobile Menu associations on all nine routes, with exact preservation outside the added header links. The latest cleanup changes only the Contact page, its generator, configuration, checks and documentation. Its supplied annotations identify the submit button, note and three social controls; other page content and flight behavior remain unchanged.

12ui was installed and its Draft workflow attempted with a generic design concept, without a private screenshot, URL or source upload. It stopped at the separate 12ui sign-in requirement before producing candidates. There is consequently no approved design target or comparison. The managed runtime has no supported control-browser skill; no preview server or alternative browser automation was started. Browser rendering, live SVG motion and real message delivery remain unverified. Source and lifecycle checks support publication of this isolated page while preserving the current owner-private audience.
