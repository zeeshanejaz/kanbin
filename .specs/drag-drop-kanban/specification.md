# Drag and Drop Kanban Board - Feature Specification

## Purpose and Goals

Enhance the Kanban board with drag-and-drop functionality to enable users to move tasks between status columns and reorder tasks within columns intuitively. Implement a modern SPA pattern with optimistic updates, smart caching, and periodic synchronization to support real-time collaboration without full page refreshes.

### Key Objectives
- **Intuitive Task Management**: Enable drag-and-drop for moving tasks between columns and reordering within columns
- **Optimistic UI Updates**: Provide instant visual feedback with automatic rollback on errors
- **Smart Caching & Sync**: Use React Query for efficient data fetching, caching, and background synchronization
- **Multi-User Support**: Handle concurrent edits gracefully with conflict detection and smart cache invalidation
- **Performance**: Minimize unnecessary re-renders and API calls while keeping data fresh

---

## Key Requirements and Behaviors

### Functional Requirements

#### FR1: Drag and Drop Interface
- Users can drag any task card to reorder within the same column
- Users can drag tasks between different status columns (TODO ↔ IN_PROGRESS ↔ DONE)
- Visual feedback during drag: ghost/preview of the task, drop zones highlighted
- Tasks maintain their position after dropping
- Mobile/touch support with long-press to initiate drag

#### FR2: Optimistic Updates
- UI updates immediately when user drops a task (no waiting for server response)
- If server request fails, revert to previous state and show error notification
- Maintain smooth UX even during network delays

#### FR3: Smart Caching and Periodic Sync
- Implement React Query (TanStack Query) for data management
- Cache board data with intelligent invalidation strategies
- Poll server periodically (configurable interval, e.g., 5-10 seconds) for board updates
- Use ETags or `updated_at` timestamps for conditional requests to minimize bandwidth
- Only update UI if server data has actually changed (smart diff)
- Pause polling when tab is not active to save resources

#### FR4: Conflict Resolution
- Detect when another user has modified the same task
- Show visual indicator when board data is stale or conflicts detected
- Provide user option to refresh and see latest state
- In case of position conflicts, server's state wins (eventual consistency)

#### FR5: Position Management
- Backend maintains task position as integer field (already exists in schema)
- When task moves, recalculate positions to maintain order
- Position numbers should be stable and avoid frequent renumbering (use decimals or large gaps)

### Non-Functional Requirements

#### NFR1: Performance
- Drag operations feel smooth (<16ms frame time, 60fps)
- Board loads in <500ms for typical board (50 tasks)
- Background sync should not block user interactions
- Debounce position updates to avoid excessive API calls during rapid reordering

#### NFR2: User Experience
- Clear visual feedback for all drag states (dragging, hovering, invalid drops)
- Accessibility: keyboard navigation alternative to drag-and-drop
- Error messages are user-friendly and actionable
- Loading states don't cause layout shift

#### NFR3: Code Quality
- TypeScript strict mode with no `any` types
- Reusable hooks for drag-drop logic
- Clean separation between presentation and data management
- Comprehensive error handling

---

## User Interactions and Workflows

### Workflow 1: Moving Task to Different Status

1. User hovers over a task card in the "TODO" column
2. User clicks and holds (mousedown/touchstart)
3. Task card shows "dragging" visual state (slightly transparent, lifted shadow)
4. User drags task over "IN_PROGRESS" column
5. "IN_PROGRESS" column highlights to indicate valid drop zone
6. User releases mouse/touch
7. **Optimistic Update**: Task immediately appears in "IN_PROGRESS" column at drop position
8. **Background**: API call to update task status and position
9. **Success**: No visual change (optimistic update was correct)
10. **Failure**: Task reverts to original position, error toast shown

### Workflow 2: Reordering Tasks in Same Column

1. User drags a task card within the "IN_PROGRESS" column
2. As user drags, other tasks shift to show where task will land
3. User drops task between two existing tasks
4. **Optimistic Update**: Task appears in new position, other tasks reorder
5. **Background**: API call to update task position
6. **Success/Failure**: Same as Workflow 1

### Workflow 3: Background Sync (Multi-User Scenario)

1. User A is viewing board with 10 tasks
2. User B adds 2 new tasks and moves 1 task to DONE (from another browser/device)
3. React Query polls backend every 10 seconds
4. Server returns updated board data with ETag header
5. **If changed**: React Query detects new data, performs smart diff
6. New tasks fade in, moved task smoothly transitions to DONE column
7. User A's current drag operation (if any) is not interrupted
8. **If unchanged**: Server returns 304 Not Modified, no UI update

### Workflow 4: Keyboard Navigation (Accessibility)

1. User focuses on a task card using Tab key
2. User presses Space to "pick up" task
3. User navigates with Arrow keys (↑↓ to reorder, ←→ to change columns)
4. User presses Space again to "drop" task
5. Same optimistic update flow as drag-drop

---

## Technical Requirements and Dependencies

### Frontend Dependencies

#### New Dependencies to Add
```json
{
  "@tanstack/react-query": "^5.17.0",
  "@tanstack/react-query-devtools": "^5.17.0",
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

**Rationale**:
- **@tanstack/react-query**: Industry-standard for server state management, caching, and synchronization
- **@dnd-kit/\***: Modern, accessible, performant drag-and-drop toolkit for React (built by Shopify, better than react-dnd for our use case)

### Backend API Enhancements

#### New Endpoint: `GET /api/boards/:key` with Conditional Request Support

**Request Headers**:
```
If-None-Match: "etag-value"
```

**Response (200 OK - Data Changed)**:
```json
{
  "id": "uuid",
  "key": "ABC123",
  "title": "My Board",
  "tasks": [...],
  "created_at": "...",
  "expires_at": "...",
  "updated_at": "2026-02-22T10:30:00Z"
}
```

**Response Headers**:
```
ETag: "hash-of-board-state"
```

**Response (304 Not Modified - No Changes)**:
```
(Empty body, just 304 status)
```

#### Enhanced Endpoint: `PUT /api/tasks/:id`

**Request Body** (support position updates):
```json
{
  "status": "IN_PROGRESS",
  "position": 350
}
```

**Considerations**:
- Position updates within same status should be efficient
- Moving to new status should assign appropriate position in target column
- Backend should handle position conflicts gracefully

#### New Endpoint: `POST /api/tasks/:id/move` (Optional, Future Optimization)

Dedicated endpoint for atomic move operations:
```json
{
  "status": "DONE",
  "position": 200,
  "before_task_id": "uuid-of-task-before",
  "after_task_id": "uuid-of-task-after"
}
```

This could simplify position calculation and reduce race conditions in future iterations.

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Components                      │
│  ┌────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ Board.tsx  │  │ TaskCard.tsx│  │ Column.tsx  │      │
│  └─────┬──────┘  └──────┬──────┘  └──────┬──────┘      │
└────────┼─────────────────┼────────────────┼─────────────┘
         │                 │                │
         └─────────────────┴────────────────┘
                           │
         ┌─────────────────▼────────────────────┐
         │     Custom Hooks (Business Logic)     │
         │  • useBoardQuery (React Query)        │
         │  • useTaskMutation                    │
         │  • useDragDrop (dnd-kit)              │
         └─────────────────┬────────────────────┘
                           │
         ┌─────────────────▼────────────────────┐
         │        React Query Client             │
         │  • Cache Management                   │
         │  • Background Refetch (polling)       │
         │  • Optimistic Updates                 │
         │  • Retry Logic                        │
         └─────────────────┬────────────────────┘
                           │
         ┌─────────────────▼────────────────────┐
         │         API Client (Axios)            │
         │  • HTTP requests with ETags           │
         │  • Error handling                     │
         │  • Type-safe interfaces               │
         └─────────────────┬────────────────────┘
                           │
                           │ REST API
                           │
         ┌─────────────────▼────────────────────┐
         │         Backend (Go)                  │
         │  • Board handlers with ETag support   │
         │  • Task update handlers               │
         │  • Position management logic          │
         └───────────────────────────────────────┘
```

---

## Constraints and Considerations

### Constraints

1. **Browser Compatibility**: Must work on modern browsers (Chrome, Firefox, Safari, Edge) - last 2 major versions
2. **Task Limit**: 100 tasks per board (existing constraint) - drag performance must scale to this limit
3. **No Real-Time WebSockets**: Polling-based sync only (keep infrastructure simple for MVP)
4. **Position Field**: Use existing integer `position` field - avoid schema changes
5. **Backward Compatibility**: Existing dropdown status selector should continue to work

### Technical Considerations

#### Position Number Strategy

**Option A: Sequential Integers (Current)**
- Simple: 0, 1, 2, 3...
- Requires renumbering multiple tasks when inserting in middle
- More database writes

**Option B: Fractional Positioning (Recommended)**
- Use large gaps: 1000, 2000, 3000...
- Insert between: if 1000 and 2000, new task gets 1500
- Minimal database writes
- Requires rebalancing eventually (if gaps too small)

**Option C: Lexicographic Ordering (Future)**
- Use strings like "a", "b", "c"...
- Insert between: "ab" goes between "a" and "b"
- Most flexible, never needs rebalancing
- Requires schema change (position -> VARCHAR)

**Decision for this feature**: Use **Option B** with backend helper functions to calculate positions.

#### React Query Configuration

```typescript
{
  staleTime: 5000,           // Data considered fresh for 5s
  cacheTime: 300000,         // Keep in cache for 5min
  refetchInterval: 10000,    // Poll every 10s when focused
  refetchIntervalInBackground: false,  // Stop when tab inactive
  refetchOnWindowFocus: true,         // Refresh when tab regains focus
  retry: 3,                           // Retry failed requests
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
}
```

#### Optimistic Update Rollback Strategy

1. React Query maintains both `optimistic` and `server` state
2. On mutation, update cache immediately (optimistic)
3. If mutation succeeds, server response becomes new truth
4. If mutation fails:
   - Revert to previous cache state
   - Show error notification
   - Optionally: Keep failed mutation in "pending" state with retry option

#### Conflict Detection

Use `updated_at` timestamp from backend:
```typescript
// When applying server update:
if (serverTask.updated_at > localTask.updated_at) {
  // Server is newer, apply update
  // Visual indicator: pulse/highlight changed tasks
} else if (pendingLocalMutation) {
  // Local mutation in flight, keep optimistic state
  // Mark as "pending sync"
}
```

### UX Considerations

- **Drag Handle**: Consider adding a drag handle icon (⋮⋮) for explicit drag affordance
- **Loading States**: Show skeleton/shimmer while initial board loads
- **Empty States**: Clear messaging in empty columns
- **Error Recovery**: Provide "Retry" and "Refresh Board" options on errors
- **Mobile**: May need different UX for touch devices (long-press to drag, confirm drop)

---

## Testing and Validation Criteria

### Unit Tests

#### Frontend Tests (Vitest/Jest + React Testing Library)
- [ ] `useBoardQuery` hook correctly fetches and caches board data
- [ ] `useBoardQuery` respects staleTime and refetchInterval config
- [ ] `useTaskMutation` performs optimistic updates correctly
- [ ] `useTaskMutation` reverts on error
- [ ] Position calculation utility functions (e.g., `getPositionBetween(before, after)`)
- [ ] Drag event handlers update local state correctly
- [ ] Keyboard navigation handlers work for accessibility

#### Backend Tests (Go)
- [ ] `UpdateTask` handler accepts and persists position field
- [ ] `GetBoard` handler returns ETag header
- [ ] `GetBoard` handler returns 304 when If-None-Match matches
- [ ] Position sorting: tasks returned in correct order by status and position
- [ ] Concurrent updates to same task (race condition handling)

### Integration Tests

- [ ] End-to-end drag-drop: Task moves from TODO → IN_PROGRESS (Cypress/Playwright)
- [ ] Optimistic update reverts on 500 error from server
- [ ] Background polling detects new task added by another user
- [ ] ETag caching prevents redundant data transfer when board unchanged
- [ ] Multiple rapid drags only send final position to server (debounced)

### Edge Cases to Test

1. **Network Offline**: 
   - Drag task → network fails → user sees error + reverted state
   - Board continues to work with cached data, shows "offline" indicator

2. **Concurrent Edits**:
   - User A drags task to position 5
   - User B simultaneously drags same task to position 10
   - Both see optimistic updates
   - Server processes in order received (first wins)
   - Second user's next poll sees server state, adjusts

3. **Task Deleted During Drag**:
   - User A starts dragging Task X
   - User B deletes Task X
   - User A drops → API returns 404
   - Task disappears from User A's board with notification

4. **Empty Column**:
   - Drag task to empty column → should position at 0 or min position value

5. **Rapid Reordering**:
   - User drags same task multiple times quickly
   - Only final position should persist
   - Intermediate positions should be cancelled

6. **Large Board (100 tasks)**:
   - Drag performance remains smooth
   - Polling doesn't cause lag
   - React Query cache size stays reasonable

7. **Tab Inactive Then Active**:
   - User leaves tab inactive for 5 minutes
   - Returns to tab → React Query refetches immediately
   - Shows changes made while away with visual highlights

8. **Mobile Touch Events**:
   - Long-press activates drag mode
   - Scrolling works while not in drag mode
   - Drop zones are large enough for finger targets

---

## Implementation Phases

### Phase 1: Foundation (React Query + Data Layer)

**Goal**: Replace current state management with React Query, enable smart caching and periodic sync

**Tasks**:
1. **Install Dependencies**
   - Add `@tanstack/react-query` and devtools
   - Add React Query provider to app root

2. **Create Query Client Configuration**
   - Set up QueryClient with optimized defaults
   - Configure polling, staleTime, cacheTime
   - Add dev tools in development mode

3. **Create Custom Hooks**
   - `useBoardQuery(key: string)`: Fetch board with React Query
   - `useCreateTaskMutation(boardKey: string)`: Mutation with cache invalidation
   - `useUpdateTaskMutation()`: Mutation with optimistic updates
   - `useDeleteTaskMutation()`: Mutation with optimistic removal

4. **Update Board.tsx Component**
   - Replace useState/useEffect with useBoardQuery
   - Implement optimistic updates for status changes
   - Test that existing functionality still works

5. **Backend: Add ETag Support**
   - Generate ETag based on board+tasks updated_at timestamps
   - Return ETag header in GetBoard response
   - Handle If-None-Match header, return 304 when appropriate

6. **API Client: ETag Handling**
   - Send If-None-Match header with cached ETag
   - Handle 304 responses (use cached data)

**Success Criteria**:
- Board loads and displays correctly with React Query
- Periodic polling works (can see in React Query DevTools)
- ETag optimization reduces bandwidth (verify in Network tab)
- Existing features (create, update status via dropdown, delete) work with optimistic updates
- Tests pass: query hook tests, mutation hook tests

**Estimated Effort**: 1-2 days

---

### Phase 2: Drag and Drop UI (Single Column Reordering)

**Goal**: Add drag-and-drop to reorder tasks within the same column only

**Tasks**:
1. **Install dnd-kit Dependencies**
   - `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

2. **Create DraggableTaskCard Component**
   - Wrap TaskCard with `useSortable` hook
   - Add drag handle visual indicator
   - Apply dragging styles (transform, opacity)

3. **Update Column Component**
   - Implement `SortableContext` for each status column
   - Handle `onDragEnd` event
   - Calculate new position when task dropped

4. **Position Calculation Utilities**
   - `getPositionBetween(taskBefore, taskAfter)`: Calculate position for insert
   - `recalculatePositions(tasks)`: Rebalance if needed
   - Use fractional positioning strategy (gaps of 1000)

5. **Optimistic Update for Position**
   - On drop, immediately update local task list order
   - Call `useUpdateTaskMutation` with new position
   - Revert if mutation fails

6. **Styling**
   - Drag overlay styling
   - Drop zone indicator
   - Smooth transitions for task reordering

**Success Criteria**:
- Dragging task within column reorders it correctly
- Position persists on page refresh
- Smooth animations during drag/drop
- Other tasks shift to show drop location
- Optimistic update/rollback works
- Tests pass: drag event handlers, position calculation logic

**Estimated Effort**: 2-3 days

---

### Phase 3: Cross-Column Drag and Drop

**Goal**: Enable dragging tasks between different status columns

**Tasks**:
1. **Update Drag Handlers**
   - Detect when task dropped in different column
   - Update both `status` and `position` fields

2. **Multi-Column DndContext**
   - Wrap entire kanban grid in single `DndContext`
   - Implement collision detection for drop zones
   - Handle `over` state for column highlighting

3. **Status Change + Position Update**
   - Mutation payload: `{ status: newStatus, position: newPosition }`
   - Optimistic: Move task to new column in correct position
   - Server: Validate status transition is valid

4. **Column Highlighting**
   - Show visual feedback when dragging over valid drop zone
   - Dim invalid drop zones (if applicable)

5. **Edge Cases**
   - Dropping back into original column (no-op or reorder)
   - Dropping between columns with many tasks
   - Maintaining scroll position during drag

**Success Criteria**:
- Tasks can be dragged between all three columns
- Status updates correctly in database
- Position is correct in target column
- No visual glitches or layout issues
- Dropdown status selector continues to work as fallback
- Tests pass: cross-column drag scenarios, status+position mutations

**Estimated Effort**: 2-3 days

---

### Phase 4: Keyboard Accessibility

**Goal**: Support keyboard navigation as alternative to mouse drag-drop

**Tasks**:
1. **Keyboard Event Handlers**
   - Space to pick up / drop task
   - Arrow keys to navigate (↑↓ within column, ←→ between columns)
   - Escape to cancel drag operation

2. **Focus Management**
   - Maintain focus on task during keyboard drag
   - Announce position changes to screen readers
   - Visual focus indicator

3. **ARIA Attributes**
   - `role="button"` on task cards
   - `aria-grabbed` state during keyboard drag
   - `aria-dropeffect` on drop zones
   - Live regions for announcements

4. **Documentation**
   - User-facing help text or tooltip explaining keyboard shortcuts
   - Developer documentation for accessibility considerations

**Success Criteria**:
- Full drag-drop functionality available via keyboard
- Screen reader announces task movements
- Passes accessibility audit (aXe, Lighthouse)
- Tests pass: keyboard event handler tests

**Estimated Effort**: 1-2 days

---

### Phase 5: Polish and Performance Optimization

**Goal**: Optimize performance, add visual polish, handle edge cases

**Tasks**:
1. **Performance Optimization**
   - Debounce rapid position updates (only send final position after 500ms)
   - Optimize re-renders with React.memo on TaskCard
   - Virtualize task list if > 50 tasks (react-window or similar)
   - Measure and optimize drag performance (aim for 60fps)

2. **Visual Polish**
   - Smooth animations for task movements
   - Loading skeleton on initial board load
   - Pulse/highlight tasks that changed via sync
   - "Syncing..." indicator when mutations pending
   - Toast notifications for errors

3. **Error Handling**
   - User-friendly error messages
   - Retry failed mutations with exponential backoff
   - "Refresh Board" button on critical errors
   - Offline mode indicator

4. **Smart Diff for Background Updates**
   - Compare cached tasks with server tasks by ID and updated_at
   - Only update tasks that actually changed
   - Animate new/changed tasks (fade in, highlight)
   - Don't interrupt user's current drag operation

5. **Mobile/Touch Optimization**
   - Test on iOS and Android devices
   - Adjust touch target sizes (min 44px)
   - Long-press duration tuning
   - Prevent accidental drags while scrolling

6. **Conflict Resolution UI**
   - Show notification when server state conflicts with local
   - Option to "Keep Local Changes" or "Sync with Server"
   - Visual diff of what changed

**Success Criteria**:
- Drag operations feel smooth and responsive (60fps)
- Background sync doesn't disrupt active user interactions
- Error states are clear and actionable
- Board loads quickly even with 100 tasks
- Mobile experience is positive
- All edge cases handled gracefully
- Performance benchmarks met (load <500ms, drag <16ms/frame)

**Estimated Effort**: 2-3 days

---

### Phase 6: Testing and Documentation

**Goal**: Comprehensive test coverage and documentation

**Tasks**:
1. **Unit Test Coverage**
   - Achieve >80% coverage for hooks and utilities
   - Test all optimistic update scenarios
   - Test position calculation edge cases

2. **Integration Tests**
   - Cypress or Playwright E2E tests for critical flows
   - Test drag-drop visually
   - Test multi-user scenarios (simulate with multiple tabs)

3. **Performance Testing**
   - Lighthouse score > 90
   - Drag performance profiling
   - Network waterfall analysis

4. **Documentation**
   - Update README with new features
   - API documentation for ETag support
   - Code comments for complex drag logic
   - Architecture diagram showing React Query flow

5. **User Guide**
   - How to use drag and drop
   - Keyboard shortcuts
   - What happens when changes conflict

**Success Criteria**:
- Test coverage >80%
- All integration tests pass
- Performance benchmarks documented
- README and docs updated
- Code review ready

**Estimated Effort**: 2-3 days

---

## Total Estimated Timeline

- **Phase 1**: 1-2 days
- **Phase 2**: 2-3 days  
- **Phase 3**: 2-3 days
- **Phase 4**: 1-2 days
- **Phase 5**: 2-3 days
- **Phase 6**: 2-3 days

**Total**: ~10-16 days (assuming one developer, full-time)

Can be parallelized if multiple developers (e.g., one on frontend, one on backend enhancements).

---

## Dependencies and Risks

### External Dependencies
- `@tanstack/react-query`: Mature, well-maintained (low risk)
- `@dnd-kit/*`: Active development, good documentation (low risk)

### Internal Dependencies
- Backend API must support partial updates (already does)
- Position field already exists in schema (no migration needed)
- ETag support is new, but straightforward to implement

### Risks and Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| dnd-kit performance issues with 100 tasks | High | Low | Start with Phase 2 testing on large boards; virtualize if needed |
| React Query learning curve | Medium | Medium | Use official docs, examples; Phase 1 is dedicated to learning |
| ETag implementation bugs | Medium | Low | Thorough testing; fallback to regular polling if ETag fails |
| Concurrent edit conflicts | High | Medium | Clear conflict resolution UI; eventual consistency is acceptable |
| Mobile drag-drop UX poor | Medium | Medium | Phase 5 dedicated to mobile; fallback to dropdown selector |
| Scope creep beyond MVP | Low | High | Strict adherence to phases; defer "nice-to-haves" to post-MVP |

---

## Future Enhancements (Out of Scope for This Feature)

- **WebSocket Real-Time Sync**: Replace polling with WebSocket for instant updates
- **Undo/Redo**: Allow users to undo task movements
- **Bulk Operations**: Multi-select and drag multiple tasks at once
- **Custom Columns**: Allow users to define custom status columns
- **Task Dependencies**: Visual arrows showing task relationships (would affect drag logic)
- **Swim Lanes**: Horizontal grouping of tasks in addition to vertical columns
- **Lexicographic Positioning**: Migrate from integer positions to string-based for infinite precision

---

## Success Metrics

**User Experience**:
- [ ] Users can drag and drop tasks without errors >95% of the time
- [ ] Drag feels responsive (60fps)
- [ ] Background sync detects changes within 10 seconds

**Technical**:
- [ ] Test coverage >80%
- [ ] Lighthouse performance score >90
- [ ] API calls reduced by >50% with ETag caching
- [ ] No memory leaks (React Query cache cleaned up properly)

**Accessibility**:
- [ ] Keyboard navigation fully functional
- [ ] Screen reader compatible
- [ ] Passes aXe accessibility audit with 0 violations

---

## Sign-off

This specification is ready for implementation once approved. Each phase can be developed and merged incrementally following the project's trunk-based workflow.

**Next Steps**:
1. Review and approve specification
2. Create KB board and tasks
3. Begin Phase 1 implementation
4. Iterate with feedback after each phase

**Questions or Clarifications**: [To be filled during review]
