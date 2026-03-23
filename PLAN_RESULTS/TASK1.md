# TASK 1 Result — Analyze Figma-Generated Code in /Design

## 1. Folder Structure (Design)

```text
Design/
  src/
    main.tsx
    app/
      App.tsx
      routes.tsx
      components/
        QuestionCard.tsx
        figma/
          ImageWithFallback.tsx
        ui/
          (46 generated Radix/shadcn-style UI primitives)
      screens/
        AskQuestion.tsx
        QuestionDetail.tsx
        QuestionFeed.tsx
    styles/
      index.css
      tailwind.css
      theme.css
      fonts.css (empty)
```

## 2. Reusable Components and Files to Migrate

### Core screens (high reuse)
- `src/app/screens/QuestionFeed.tsx`
- `src/app/screens/AskQuestion.tsx`
- `src/app/screens/QuestionDetail.tsx`

### Shared app component (high reuse)
- `src/app/components/QuestionCard.tsx`

### UI primitives currently used by screens/components
- `src/app/components/ui/button.tsx`
- `src/app/components/ui/card.tsx`
- `src/app/components/ui/badge.tsx`
- `src/app/components/ui/textarea.tsx`

### Required utility for UI primitives
- `src/app/components/ui/utils.ts` (the `cn()` helper)

### Routing/bootstrap/styles to reuse as baseline
- `src/main.tsx`
- `src/app/App.tsx`
- `src/app/routes.tsx`
- `src/styles/index.css`
- `src/styles/tailwind.css`
- `src/styles/theme.css`

## 3. Dead Code / Unused Assets (Current State)

### Unused generated UI primitives
Only 4 of 46 UI files are used in the current app flow. The following are currently unused and should not be migrated initially:
- `accordion.tsx`, `alert.tsx`, `alert-dialog.tsx`, `aspect-ratio.tsx`, `avatar.tsx`
- `breadcrumb.tsx`, `calendar.tsx`, `carousel.tsx`, `chart.tsx`, `checkbox.tsx`
- `collapsible.tsx`, `command.tsx`, `context-menu.tsx`, `dialog.tsx`, `drawer.tsx`
- `dropdown-menu.tsx`, `form.tsx`, `hover-card.tsx`, `input.tsx`, `input-otp.tsx`
- `label.tsx`, `menubar.tsx`, `navigation-menu.tsx`, `pagination.tsx`, `popover.tsx`
- `progress.tsx`, `radio-group.tsx`, `resizable.tsx`, `scroll-area.tsx`, `select.tsx`
- `separator.tsx`, `sheet.tsx`, `sidebar.tsx`, `skeleton.tsx`, `slider.tsx`
- `sonner.tsx`, `switch.tsx`, `table.tsx`, `tabs.tsx`, `toggle.tsx`, `toggle-group.tsx`, `tooltip.tsx`

### Other likely-unused assets/files
- `src/styles/fonts.css` is present but empty.
- `src/app/components/figma/ImageWithFallback.tsx` is not referenced by current screens.
- `src/app/components/ui/use-mobile.ts` is only referenced by `sidebar.tsx` (which is currently unused).

## 4. Missing Logic / Routing Gaps

### Data and persistence gaps
- `QuestionFeed` uses local `useState` with hardcoded `initialQuestions`.
- `AskQuestion` only logs to console and navigates back; no backend call.
- `QuestionDetail` uses local mock dictionary (`questionData`) and local upvote state.
- No Redis persistence, no API layer, no error boundaries for network/data failures.

### Foundry integration gaps
- No call to Microsoft Foundry GPT endpoint exists.
- No async question->answer orchestration is implemented.

### Routing gaps
- Route paths are correct (`/`, `/ask`, `/question/:id`) and can be reused.
- Data loading is route-unaware: direct navigation to `/question/:id` depends on hardcoded in-file mock data, not fetched state.
- No loading/error/empty route states from real backend responses.

## 5. Migration Recommendation for /app

Start with a **minimal migration set**:
1. Screens: `QuestionFeed`, `AskQuestion`, `QuestionDetail`
2. Shared component: `QuestionCard`
3. UI primitives: `button`, `card`, `badge`, `textarea`
4. Utility/styles: `utils.ts`, `index.css`, `tailwind.css`, `theme.css`

This minimizes dead code carryover while preserving the existing UX baseline for subsequent Redis + Foundry integration.
