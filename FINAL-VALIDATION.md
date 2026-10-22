# Final design implementation and validation

22 October 2026. Production domain: `https://churchofchrist.mw`.

The agreed design implementation is complete. The [improvement plan](./DESIGN-IMPROVEMENT-PLAN.md) retains the original audit, all 29 design implementation increments and the subsequent content refinement. Public pages, dashboard records and management tools, and invitation-based account flows now share their respective responsive design systems.

The subsequent content pass uses the supplied history and doctrine documents for the homepage, About, first-visit information, contact guidance and footer. Its sources and editorial decisions are recorded in [CONTENT-SOURCES.md](./CONTENT-SOURCES.md). The 87 public tests, TypeScript, targeted lint, production build, all 26 read-only HTTP checks and section-link/server-markup checks passed again for this content update; the API is unchanged. The library feeds continued to exercise unavailable recovery, and the temporary frontend was stopped afterwards.

## Delivered scope

| Area                  | Result                                                                                                                                                                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared foundation     | Phone navigation drawers, bounded panels/dialogs, shrinking content columns, wrapping action groups, contained tables, compact pagination, inline progress and distinct request states.                                                 |
| Church welcome        | Congregation photography, consistent public typography, clear Sunday invitation, shared service languages/times, last-Sunday combined-service exception, directions, contact and visit journeys.                                        |
| Portal                | Redesigned overview, all record families, management lists, editors, membership/import tools, attention/prayer work, account/role/audit tools and their loading, empty, error and permission states.                                    |
| Account access        | Consistent sign-in and password flows, preserved return destinations, invitation-only registration guidance, session handling and safe audit responses. Role mutations now require active ROOT authorization and protect the last ROOT. |
| Public content        | About/contact, messages/scripture reading, groups, events/calendar exports, programs/schedules, broadcasts and Publications discovery/detail pages use the shared public design and useful recovery paths.                              |
| Requested final fixes | Grey off-air Live navigation on desktop/mobile; recognized video embeds with direct provider fallback; prayer typography, form grouping and private-prayer behavior.                                                                    |
| Launch assets         | Confirmed-domain canonicals, sitemap, crawler rules, account/portal noindex metadata, generated sharing image and privacy-conscious journey instrumentation.                                                                            |

## Automated results

| Check                      | Result                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| Frontend records/workflows | 243 passed                                                                                 |
| Frontend foundation        | 4 passed                                                                                   |
| Frontend public features   | 87 passed                                                                                  |
| API fixtures, 21 suites    | 175 passed                                                                                 |
| Total regression tests     | **509 passed**                                                                             |
| Frontend TypeScript        | Passed                                                                                     |
| Targeted frontend lint     | Passed for all 52 changed source/test/script files                                         |
| Targeted API lint          | Passed for the new public helpers, ROOT role-change helper and modified public controllers |
| Production builds          | Frontend and API passed                                                                    |
| Changed-file whitespace    | Passed, including new files                                                                |

Fixtures execute project helpers/components/services/controllers with explicit test transports or an in-memory Prisma substitute. They establish the documented filtering, projection, validation, interaction and transaction-call behavior. They do not establish live database collation, simultaneous transactions, uploaded-file storage behavior, email delivery or external account/provider availability. Existing unrelated private-service lint baselines were preserved.

The final test additions cover actual Live flags/time windows, invalid provider URLs, click-to-load player behavior, offline/unavailable navigation, library paging and return links, published-only document data, detail metadata and safe links, personal-prayer non-submission, duplicate/error/success handling, safe measurement payloads and ROOT authorization/session revocation. Failed role or session writes roll back in fixtures; a later audit failure remains an uncertain response after a committed change.

## Responsive and accessibility source review

Browser verification is excluded from the agreed scope. These are source/markup findings, not measurements on physical devices or a certification of accessibility conformance.

| Width/context                                       | Confirmed implementation                                                                                                                                                                                                                                                       |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Narrow phones, including the 320 CSS px requirement | Public and portal containers permit content to shrink. Forms and detail sections stack, long titles/contact values wrap, primary actions remain reachable, page counts take a separate row where needed, and genuinely tabular content scrolls inside its own labelled region. |
| Phones below desktop navigation breakpoints         | Website and dashboard menus use bounded drawers/dialogs. Native modal focus containment, Escape/close behavior and focus return are retained. Hidden navigation does not remain as a second visible menu.                                                                      |
| Tablets and constrained content regions             | Management grids use available content width/container rules rather than assuming the viewport remains available after the sidebar. Multi-column public/detail layouts wait until their content has enough space. Headers, filters and action groups wrap.                     |
| Wide desktops                                       | Public discovery cards use multiple columns; reading width remains bounded. Portal details organize identity, actions, context and related records instead of stretching a primitive label/value list across the screen.                                                       |
| Keyboard and form states                            | Skip links, visible focus rules, labelled controls/fieldsets, semantic headings, accessible action names, status/error announcements, confirmation focus and keyboard-accessible navigation/media controls are present.                                                        |
| Media and preferences                               | The supported broadcast frame has a descriptive title and a minimum 200 px player height. No third-party broadcast frame loads before Play. Provider links remain available. Reduced-motion styles remain in place.                                                            |

The prayer page now inherits the same public body/display font system as the other public pages. Its fields stack on small widths, optional contact fields are grouped, and its secondary guidance moves beside the form only at the large breakpoint. Broadcast and publication filters and pagination retain all relevant state without forcing phone controls onto a single crowded row.

## Asset and performance review

The homepage uses three optimized congregation photographs and an optimized logo rather than eagerly loading the original full-resolution carousel. Only the hero is preloaded; other photographs remain lazy. Explicit aspect ratios and image sizing help reserve space.

| Optimized source asset |       Bytes |
| ---------------------- | ----------: |
| Worship hero           |     171,876 |
| Community photograph   |     120,582 |
| Welcome photograph     |      83,240 |
| Church logo            |       8,256 |
| Combined               | **383,954** |

The hero is approximately 168 KiB, within the plan's 150–350 KB starting budget; the four optimized source images together are approximately 375 KiB, below the 1 MB image budget. These are source-file sizes, not a claim about full-page transferred bytes or real-user loading times. Public body/display fonts remain local and use `display: swap`. Optional feeds have bounded requests and separate Suspense/recovery states, so a failed feed does not remove the welcome or basic visit/contact information.

LCP ≤2.5 seconds, INP ≤200 ms and CLS ≤0.1 remain field targets to assess after deployment. No field results or improvement percentages have been invented.

## Read-only production HTTP checks

**26 checks passed against the final production frontend build.** The repeatable checker starts and stops its own hidden temporary production frontend. It performs GET requests only, with no credentials or form submissions.

It checks all 12 public landing pages for a main landmark, skip link and correct-domain canonical; the `/home` redirect; account and representative dashboard indexing metadata; robots and sitemap responses; missing-resource recovery; and both social-image metadata destinations. Populated library detail pages are checked if the running public feed supplies them. Empty or unavailable feeds are not treated as proof of a populated live integration.

In this run, the public Publications and broadcast feeds were unavailable and their recovery content rendered successfully. No populated library-detail URL was discovered, so populated detail behavior is established by fixtures rather than this HTTP run. This must not be presented as verification of a live API/database integration. Both Open Graph and Twitter image destinations returned the same valid **1200 × 630 PNG, 51,790 bytes**. The temporary frontend was stopped after verification.

The generated sharing image is also inspected as a local PNG for readable layout and correct identity. Its renderer uses its bundled font, avoiding the variable-font incompatibility encountered during the first build. Manrope/Lora remain the website fonts. File-based metadata supplies the actual image address to Open Graph and Twitter.

## Measurement and deployment handoff

`PublicJourneyEvents` emits sanitized `church:analytics` custom events in the public layout. Allowed names cover visit/directions, message opens, group enquiries, broadcast Play/provider opens, publication opens and successful visit/prayer submissions. The only payload keys are `event` and normalized `path`; detail addresses become `/[record]` families. Request text, personal contact data, query strings and private routes are excluded. No analytics vendor, transmission endpoint, cookies or local storage have been added. A chosen collector can subscribe to this event after the church decides how to operate analytics; the implementation does not claim an active analytics dashboard or a real visitor baseline.

Run the updated API and frontend together. This final pass needs no migration and no dependency installation. Deploying them, confirming the production domain/cookie/API configuration, verifying a real invitation/password email or upload, and checking a provider's actual broadcast are operational actions beyond the local read-only verification. No production deployment or live data mutation occurred during this work.

The reported Edge failure was inside the player. Public broadcasts no longer frame arbitrary page URLs. Recognized YouTube videos use the documented video embed address and retain a direct viewing link; Facebook/channel/unsupported URLs open with the broadcaster. Providers, browser policies and video owners can still block playback, so the direct fallback remains part of the finished design.

Earlier audit-response sanitization remains in place; historical stored snapshots were not rewritten. Homecell server-side pagination and access controls for direct stored-file URLs remain separate platform/storage work, with the existing local Homecell filtering/paging contract retained. They are not represented as newly completed capabilities.

## Reproduce

From `site-v2`:

```powershell
npm run test:records
npm run test:foundation
npm run test:public
node node_modules/typescript/bin/tsc --noEmit
npm run build
node scripts/check-public-http.mjs
```

The HTTP summary and social preview are written under ignored `.next/validation/` artifacts. Targeted lint uses the changed source/test/script paths, avoiding unrelated lint baselines.

From `api`, run its `test:*` fixture scripts from `test:schedule-lists` through `test:public-finish` (21 `.test.cjs` suites), targeted lint for the helpers/controllers noted above, and `npm run build`. The older scripts named `test:members`, `test:streams` and similar are separate integration tools and were not used for live mutations.
