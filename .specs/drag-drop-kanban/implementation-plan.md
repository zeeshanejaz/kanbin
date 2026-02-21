# Drag-Drop Kanban Implementation Plan

## Overview
Implementation of drag-and-drop functionality for the kanban board with React Query for smart caching, periodic sync, and optimistic updates. This plan breaks down the specification into actionable, testable steps.

## KB Board Reference
- **Board Key**: e131bcd9
- **Board Title**: drag-drop-kanban
- **Branch**: feature/drag-drop-kanban

## Dependencies

### External Libraries Required
- `@tanstack/react-query@^5.17.0` - Server state management
- `@tanstack/react-query-devtools@^5.17.0` - Development tools
- `@dnd-kit/core@^6.1.0` - Drag and drop core
- `@dnd-kit/sortable@^8.0.0` - Sortable utilities
- `@dnd-kit/utilities@^3.2.2` - Helper utilities

### Internal Dependencies
- Existing backend API endpoints (already support position field)
- Position field in database schema (already exists)
- Partial update support in PUT /api/tasks/:id (already exists)

## File Structure

### New Files to Create
```
frontend/src/
├── hooks/
│   ├── useBoardQuery.ts          # React Query hook for board data
│   ├── useTaskMutations.ts       # Mutations for task operations
│   └── useDragDrop.ts            # Drag and drop logic
├── lib/
│   ├── queryClient.ts            # React Query client configuration
│   └── positions.ts              # Position calculation utilities
└── components/
    ├── DraggableTaskCard.tsx     # Draggable wrapper for TaskCard
    └── KanbanColumn.tsx          # Column component with drop zone

backend/internal/
├── utils/
│   └── etag.go                   # ETag generation utilities
└── api/
    └── middleware.go             # ETag middleware (if needed)
```

### Files to Modify
```
frontend/
├── src/main.tsx                  # Add QueryClientProvider
├── src/pages/Board.tsx           # Use new hooks, add drag context
├── src/components/TaskCard.tsx   # Make draggable-friendly
└── src/api/client.ts             # Add ETag support

backend/internal/api/
├── handlers.go                   # Add ETag support to GetBoard
└── router.go                     # Update routes if needed
```

---

## Implementation Phases

### Phase 1: Foundation - React Query Integration

**Goal**: Set up React Query infrastructure and migrate existing board data fetching

#### 1.1 Install Frontend Dependencies
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Install React Query and devtools packages
- **Commands**:
  ```bash
  cd frontend
  npm install @tanstack/react-query@^5.17.0 @tanstack/react-query-devtools@^5.17.0
  ```
- **Validation**: Check package.json has correct versions
- **Files Changed**: `frontend/package.json`, `frontend/package-lock.json`

#### 1.2 Create Query Client Configuration
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Set up QueryClient with polling and caching config
- **Implementation**:
  - Create `frontend/src/lib/queryClient.ts`
  - Configure staleTime, cacheTime, refetchInterval
  - Export QueryClient instance
- **Validation**: File created, exports valid QueryClient
- **Files Changed**: `frontend/src/lib/queryClient.ts` (new)

#### 1.3 Add QueryClientProvider to App
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Wrap app with React Query provider
- **Implementation**:
  - Update `frontend/src/main.tsx`
  - Import QueryClientProvider and queryClient
  - Wrap app with provider
  - Add ReactQueryDevtools in development
- **Validation**: App renders, devtools visible in dev mode
- **Files Changed**: `frontend/src/main.tsx`

#### 1.4 Create useBoardQuery Hook
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Custom hook for fetching board data with React Query
- **Implementation**:
  - Create `frontend/src/hooks/useBoardQuery.ts`
  - Implement useQuery with board key
  - Configure polling interval (10s)
  - Handle loading, error states
- **Validation**: Hook returns data, loading, error correctly
- **Files Changed**: `frontend/src/hooks/useBoardQuery.ts` (new)

#### 1.5 Create Task Mutation Hooks
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Mutations for create, update, delete with optimistic updates
- **Implementation**:
  - Create `frontend/src/hooks/useTaskMutations.ts`
  - `useCreateTaskMutation` with cache invalidation
  - `useUpdateTaskMutation` with optimistic update
  - `useDeleteTaskMutation` with optimistic removal
- **Validation**: Mutations work, optimistic updates apply and rollback
- **Files Changed**: `frontend/src/hooks/useTaskMutations.ts` (new)

#### 1.6 Migrate Board.tsx to React Query
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Replace useState/useEffect with React Query hooks
- **Implementation**:
  - Import useBoardQuery and mutation hooks
  - Remove manual loading state, useEffect
  - Update handlers to use mutations
  - Keep existing UI unchanged
- **Validation**: Board loads correctly, all existing features work
- **Files Changed**: `frontend/src/pages/Board.tsx`

#### 1.7 Backend - Add ETag Generation Utility
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Create utility to generate ETags from board state
- **Implementation**:
  - Create `backend/internal/utils/etag.go`
  - Function to hash board + tasks updated_at timestamps
  - Use crypto/sha256 for hashing
- **Validation**: Unit test - same input produces same ETag
- **Files Changed**: `backend/internal/utils/etag.go` (new)

#### 1.8 Backend - Add ETag Support to GetBoard
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Return ETag header, handle If-None-Match
- **Implementation**:
  - Update `handleGetBoard` in `backend/internal/api/handlers.go`
  - Generate ETag from board data
  - Check If-None-Match header
  - Return 304 if matches, 200 with ETag if not
- **Validation**: Test with curl or Postman - 304 on repeated requests
- **Files Changed**: `backend/internal/api/handlers.go`

#### 1.9 Frontend - Add ETag Support to API Client
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Send If-None-Match, cache ETags
- **Implementation**:
  - Update `frontend/src/api/client.ts`
  - Store last ETag per board key
  - Add If-None-Match header to getBoard
  - Handle 304 responses
- **Validation**: Network tab shows 304 responses, less data transfer
- **Files Changed**: `frontend/src/api/client.ts`

#### 1.10 Phase 1 Testing
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Validate Phase 1 completion
- **Tests**:
  - Board loads correctly with React Query
  - Polling visible in React Query DevTools
  - ETags reduce bandwidth (check Network tab)
  - Create/update/delete tasks work with optimistic updates
  - Optimistic rollback on error works
- **Commands**: `cd frontend && npm run lint && npm run build`
- **Success Criteria**: All existing features work, polling active, ETags working

---

### Phase 2: Drag and Drop - Single Column Reordering

**Goal**: Enable drag-and-drop reordering within the same status column

#### 2.1 Install dnd-kit Dependencies
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Install drag and drop libraries
- **Commands**:
  ```bash
  cd frontend
  npm install @dnd-kit/core@^6.1.0 @dnd-kit/sortable@^8.0.0 @dnd-kit/utilities@^3.2.2
  ```
- **Validation**: Packages in package.json
- **Files Changed**: `frontend/package.json`, `frontend/package-lock.json`

#### 2.2 Create Position Calculation Utilities
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Helper functions for fractional positioning
- **Implementation**:
  - Create `frontend/src/lib/positions.ts`
  - `getPositionBetween(before: number, after: number)`: Calculate middle
  - `shouldRebalance(tasks: Task[])`: Check if gaps too small
  - `recalculatePositions(tasks: Task[])`: Redistribute with 1000 gaps
- **Validation**: Unit tests for edge cases (empty, single task, etc.)
- **Files Changed**: `frontend/src/lib/positions.ts` (new)

#### 2.3 Create KanbanColumn Component
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Column with SortableContext for drop zone
- **Implementation**:
  - Create `frontend/src/components/KanbanColumn.tsx`
  - Wrap children with SortableContext
  - Accept status, tasks, onDrop props
  - Add drop zone highlightingstyles
- **Validation**: Component renders, accepts tasks
- **Files Changed**: `frontend/src/components/KanbanColumn.tsx` (new)

#### 2.4 Create DraggableTaskCard Component
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Wrap TaskCard with useSortable
- **Implementation**:
  - Create `frontend/src/components/DraggableTaskCard.tsx`
  - Use useSortable hook
  - Apply drag transforms and styles
  - Render existing TaskCard as child
  - Add drag handle indicator
- **Validation**: Card responds to drag gestures
- **Files Changed**: `frontend/src/components/DraggableTaskCard.tsx` (new)

#### 2.5 Add Drag Context to Board
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Wrap board with DndContext
- **Implementation**:
  - Update `frontend/src/pages/Board.tsx`
  - Import DndContext from @dnd-kit/core
  - Wrap kanban grid with DndContext
  - Implement onDragEnd handler (single column only)
- **Validation**: Basic drag works, tasks maintain position
- **Files Changed**: `frontend/src/pages/Board.tsx`

#### 2.6 Implement Position Update on Drop
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Calculate and persist new position on drop
- **Implementation**:
  - In onDragEnd handler, calculate new position
  - Use getPositionBetween utility
  - Call useUpdateTaskMutation with new position
  - Optimistically update task order locally
- **Validation**: Drag task, position persists on refresh
- **Files Changed**: `frontend/src/pages/Board.tsx`

#### 2.7 Add Drag Styling and Animations
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Visual feedback during drag
- **Implementation**:
  - Update `frontend/src/App.css` or component styles
  - Drag overlay (semi-transparent)
  - Drop zone highlight
  - Smooth transitions
  - Cursor states
- **Validation**: Dragging looks smooth, visual feedback clear
- **Files Changed**: `frontend/src/App.css`, component styles

#### 2.8 Phase 2 Testing
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Validate single-column drag works
- **Tests**:
  - Drag task within column
  - Position updates in database
  - Optimistic update applies immediately
  - Position persists on page refresh
  - Rollback on error
- **Success Criteria**: Smooth drag within columns, positions correct

---

### Phase 3: Cross-Column Drag and Drop

**Goal**: Enable dragging tasks between different status columns

#### 3.1 Update onDragEnd for Cross-Column
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Detect column change, update status + position
- **Implementation**:
  - Modify onDragEnd in Board.tsx
  - Detect if task moved to different status
  - Calculate new position in target column
  - Update both status and position fields
- **Validation**: Task moves between columns
- **Files Changed**: `frontend/src/pages/Board.tsx`

#### 3.2 Column Highlighting on Drag Over
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Visual feedback for valid drop zones
- **Implementation**:
  - Use onDragOver event in DndContext
  - Track which column is being hovered
  - Apply highlight styles to target column
  - Dim other columns (optional)
- **Validation**: Columns highlight when dragging over
- **Files Changed**: `frontend/src/components/KanbanColumn.tsx`, styles

#### 3.3 Handle Edge Cases
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Drop back to original, empty columns, etc.
- **Implementation**:
  - Handle dropping back to original position (no-op)
  - Handle dropping into empty column (position = 0)
  - Maintain scroll position during drag
  - Cancel drag on Escape key
- **Validation**: Edge cases don't cause errors
- **Files Changed**: `frontend/src/pages/Board.tsx`

#### 3.4 Ensure Dropdown Selector Compatibility
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Keep dropdown status selector working
- **Implementation**:
  - Verify TaskCard dropdown still works
  - Both drag and dropdown should update status
  - Use same mutation hook
- **Validation**: Can change status via both drag and dropdown
- **Files Changed**: None (verification only)

#### 3.5 Phase 3 Testing
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Validate cross-column drag works
- **Tests**:
  - Drag task between all columns (TODO ↔ IN_PROGRESS ↔ DONE)
  - Status and position update correctly
  - Visual feedback works
  - Dropdown selector still functional
- **Success Criteria**: Full cross-column drag working smoothly

---

### Phase 4: Keyboard Accessibility

**Goal**: Support keyboard navigation for accessibility

#### 4.1 Add Keyboard Event Handlers
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Space to pick/drop, arrows to navigate
- **Implementation**:
  - Create custom hook `useDragDrop` with keyboard support
  - Space bar to pick up/drop task
  - Arrow keys: ↑↓ within column, ←→ between columns
  - Escape to cancel
- **Validation**: Keyboard drag works without mouse
- **Files Changed**: `frontend/src/hooks/useDragDrop.ts` (new)

#### 4.2 Focus Management
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Maintain focus during keyboard drag
- **Implementation**:
  - Track focus state during keyboard drag
  - Visual focus indicator on active task
  - Announce position changes
- **Validation**: Focus stays on dragged task
- **Files Changed**: `frontend/src/components/DraggableTaskCard.tsx`

#### 4.3 ARIA Attributes
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Screen reader support
- **Implementation**:
  - Add role="button" to task cards
  - aria-grabbed during drag
  - aria-dropeffect on drop zones
  - Live regions for announcements
- **Validation**: Screen reader announces movements
- **Files Changed**: `frontend/src/components/DraggableTaskCard.tsx`, KanbanColumn

#### 4.4 Phase 4 Testing
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Validate accessibility
- **Tests**:
  - Navigate with keyboard only
  - Screen reader test (NVDA/JAWS)
  - Lighthouse accessibility audit
- **Success Criteria**: Full keyboard nav, passes accessibility audit

---

### Phase 5: Polish and Performance

**Goal**: Optimize performance and add visual polish

#### 5.1 Debounce Rapid Position Updates
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Only send final position after settling
- **Implementation**:
  - Add debounce to position mutation (500ms)
  - Track pending mutations
  - Cancel intermediate updates
- **Validation**: Multiple rapid drags = one API call
- **Files Changed**: `frontend/src/hooks/useTaskMutations.ts`

#### 5.2 Optimize Re-renders
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Memoize components to prevent unnecessary renders
- **Implementation**:
  - Wrap TaskCard with React.memo
  - Memoize callbacks with useCallback
  - Memoize computed values with useMemo
- **Validation**: React DevTools Profiler shows fewer renders
- **Files Changed**: Multiple component files

#### 5.3 Add Loading Skeleton
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Show skeleton during initial load
- **Implementation**:
  - Create skeleton component
  - Show during isLoading state
  - Avoid layout shift
- **Validation**: Smooth loading experience
- **Files Changed**: `frontend/src/pages/Board.tsx`, new skeleton component

#### 5.4 Smart Diff for Background Updates
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Only update changed tasks, highlight changes
- **Implementation**:
  - Compare cached vs server tasks by ID and updated_at
  - Only update if server is newer
  - Animate changed tasks (pulse/highlight)
  - Don't interrupt active drag
- **Validation**: Changes from other users fade in smoothly
- **Files Changed**: `frontend/src/hooks/useBoardQuery.ts`

#### 5.5 Error Handling and Toast Notifications
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: User-friendly error messages
- **Implementation**:
  - Add toast library (or custom component)
  - Show toast on mutation errors
  - "Retry" and "Refresh" actions
  - Offline indicator
- **Validation**: Errors are clear and actionable
- **Files Changed**: New toast component, mutation hooks

#### 5.6 Mobile/Touch Optimization
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Test and optimize for touch devices
- **Implementation**:
  - Test on iOS and Android
  - Adjust touch targets (min 44px)
  - Long-press to initiate drag
  - Prevent scroll conflicts
- **Validation**: Works smoothly on mobile
- **Files Changed**: Styles, touch event handlers

#### 5.7 Performance Benchmarking
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Measure and document performance
- **Tests**:
  - Lighthouse score (target >90)
  - Drag performance profiling (60fps)
  - Load time with 100 tasks (<500ms)
  - Network waterfall analysis
- **Success Criteria**: All benchmarks met
- **Files Changed**: Documentation

---

### Phase 6: Testing and Documentation

**Goal**: Comprehensive test coverage and updated docs

#### 6.1 Unit Tests - Frontend Hooks
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Test hooks with >80% coverage
- **Implementation**:
  - Test useBoardQuery (caching, polling)
  - Test mutation hooks (optimistic updates, rollback)
  - Test position calculation utilities
  - Use @testing-library/react-hooks
- **Validation**: Coverage >80%, all tests pass
- **Files Changed**: New test files

#### 6.2 Unit Tests - Backend
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Test ETag generation and handlers
- **Implementation**:
  - Test ETag generation (same input = same output)
  - Test GetBoard with If-None-Match (304 response)
  - Test position updates
- **Validation**: All Go tests pass
- **Files Changed**: New *_test.go files

#### 6.3 Integration Tests
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: E2E tests for drag-drop flows
- **Implementation**:
  - Install Playwright or Cypress
  - Test drag within column
  - Test drag between columns
  - Test multi-user scenario (two tabs)
  - Test keyboard navigation
- **Validation**: All E2E tests pass
- **Files Changed**: New test files

#### 6.4 Update Documentation
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Update README and API docs
- **Implementation**:
  - Add drag-drop feature to README
  - Document ETag support in API docs
  - Architecture diagram with React Query
  - User guide with keyboard shortcuts
- **Validation**: Docs are clear and complete
- **Files Changed**: README.md, docs/

#### 6.5 Code Review Preparation
- [ ] Not Started
- **KB Task ID**: (to be created)
- **Description**: Final checks before PR
- **Tasks**:
  - Run full /pr-checklist
  - Fix any linting issues
  - Ensure all tests pass
  - Update CHANGELOG (if exists)
- **Success Criteria**: Ready for code review

---

## Testing Strategy

### Unit Tests
- **Frontend**: Vitest + React Testing Library
- **Backend**: Go testing package
- **Target Coverage**: >80%

### Integration Tests
- **Tool**: Playwright or Cypress
- **Scenarios**:
  - Drag within column
  - Drag between columns
  - Multi-user updates
  - Keyboard navigation
  - Error handling

### Manual Testing Checklist
- [ ] Drag task within column
- [ ] Drag task between columns
- [ ] Keyboard navigation (Tab, Space, Arrows)
- [ ] Mobile touch drag (iOS/Android)
- [ ] Network offline → drag → error shown
- [ ] Two tabs open → changes sync
- [ ] Large board (100 tasks) → smooth performance
- [ ] Dropdown selector still works

### Performance Testing
- [ ] Lighthouse performance score >90
- [ ] Drag at 60fps (Chrome DevTools Performance tab)
- [ ] Load time <500ms for 50 tasks
- [ ] ETag reduces bandwidth by >50%

---

## Success Criteria

### Functional
- ✅ Drag and drop works within columns
- ✅ Drag and drop works between columns
- ✅ Position persists in database
- ✅ Optimistic updates with rollback on error
- ✅ Background polling detects changes
- ✅ ETag optimization reduces bandwidth
- ✅ Keyboard navigation fully functional
- ✅ Dropdown selector still works

### Non-Functional
- ✅ Drag performance at 60fps
- ✅ Board loads in <500ms (50 tasks)
- ✅ Test coverage >80%
- ✅ Lighthouse accessibility score perfect
- ✅ Works on mobile (iOS/Android)

### Code Quality
- ✅ TypeScript strict mode, no `any`
- ✅ All linting passes
- ✅ No console errors/warnings
- ✅ Clean commit history
- ✅ Documentation updated

---

## Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| dnd-kit performance with 100 tasks | Test early in Phase 2; virtualize if needed |
| React Query learning curve | Phase 1 dedicated to setup; use official docs |
| Mobile drag UX poor | Phase 5 dedicated to mobile; keep dropdown as fallback |
| ETag bugs | Thorough testing; graceful fallback to regular polling |
| Scope creep | Strict phase adherence; defer enhancements to future |

---

## Estimated Timeline

- **Phase 1**: 1-2 days
- **Phase 2**: 2-3 days
- **Phase 3**: 2-3 days
- **Phase 4**: 1-2 days
- **Phase 5**: 2-3 days
- **Phase 6**: 2-3 days

**Total**: 10-16 days (1 developer, full-time)

---

## Next Steps

1. ✅ Create KB board (e131bcd9)
2. ⏳ Create KB tasks for each implementation step
3. ⏳ Begin Phase 1: Install dependencies
4. ⏳ Iterate through phases with testing after each

---

## Notes

- Each phase builds on the previous
- Can pause after any phase for review
- Mobile optimization can be deprioritized if timeline tight
- Keyboard accessibility is non-negotiable for compliance
- Performance benchmarks must be met before Phase 6 completion

---

**Last Updated**: 2026-02-22
**Status**: Planning Complete, Ready for Implementation
