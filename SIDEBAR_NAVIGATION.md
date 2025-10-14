# Sidebar Navigation System

This document describes the collapsible sidebar navigation system implemented across the DOTA application.

## Overview

The sidebar navigation provides a consistent way to switch between organizations and applications throughout the app. It features:
- ✅ Collapsible/expandable design
- ✅ Colorful gradient icons with initials
- ✅ Smooth animations and transitions
- ✅ Active state highlighting
- ✅ Tooltips in collapsed mode
- ✅ Context-aware navigation

## Components

### 1. OrgSwitcher
**Location:** `app/components/Pages/components/AppListPage/components/OrgSwitcher.tsx`

**Used in:** Applications list page (`/dashboard/:org/apps`)

**Features:**
- Shows all organizations user has access to
- Highlights current organization
- Click to switch between orgs
- Collapsible to icon-only view

**States:**
- **Expanded:** 280px wide, shows org names and icons
- **Collapsed:** 80px wide, shows only colorful icons with tooltips

### 2. CombinedSidebar
**Location:** `app/components/Pages/components/AppDetailPage/components/CombinedSidebar.tsx`

**Used in:** Application detail page (`/dashboard/:org/:app`)

**Features:**
- Shows all organizations (top section)
- Shows all apps in current org (bottom section)
- Highlights current org and current app
- Click org to go to apps list
- Click app to switch to that app's details
- Collapsible to icon-only view

**Sections:**
1. **Organizations** - Switch between orgs
2. **Applications** - Switch between apps within org

## Visual Design

### Expanded View (280px)
```
┌──────────────────────────┐
│ ORGANIZATIONS        [<] │
│                           │
│ ┌─────────────────────┐  │
│ │ [TE] TechCorp       │  │
│ │ Current org         │  │
│ └─────────────────────┘  │
│                           │
│ ┌─────────────────────┐  │
│ │ [IN] InnovateX     │  │
│ └─────────────────────┘  │
│                           │
│ ────────────────────────  │
│                           │
│ APPLICATIONS              │
│                           │
│ ┌─────────────────────┐  │
│ │ [MY] MyApp         │  │
│ │ Current app        │  │
│ └─────────────────────┘  │
│                           │
│ ┌─────────────────────┐  │
│ │ [AP] AppTwo        │  │
│ └─────────────────────┘  │
└──────────────────────────┘
```

### Collapsed View (80px)
```
┌──────┐
│  [>] │
│      │
│ [TE] │ ← Active org
│      │
│ [IN] │
│      │
│ [CM] │
│      │
│ ───  │
│      │
│ [MY] │ ← Active app
│      │
│ [AP] │
│      │
│ [WE] │
└──────┘
```

## Icon System

### Color Palette
Each org/app gets a consistent color from this palette:
1. `#667eea` - Purple/Blue
2. `#764ba2` - Deep Purple
3. `#f093fb` - Pink/Purple
4. `#4facfe` - Sky Blue
5. `#43e97b` - Green
6. `#fa709a` - Rose
7. `#feca57` - Yellow
8. `#48dbfb` - Cyan

**Color Assignment:**
- Based on name hash (consistent across sessions)
- Same name = same color always
- Gradient background with drop shadow

### Initials Generation
- **Single word:** First 2 letters (e.g., "DOTA" → "DO")
- **Multiple words:** First letter of each word (e.g., "Tech Corp" → "TC")
- Always uppercase
- White text on gradient background

## Active States

### Expanded Active State
- Purple border (2px solid #667eea)
- Light purple background (rgba(103, 126, 234, 0.12))
- Bold text in purple
- "Current organization" or "Current app" label

### Collapsed Active State
- Purple border (2px)
- Enhanced shadow
- Tooltip shows full name

### Hover States
- Light purple background on hover
- Smooth 150ms transition
- Works in both expanded and collapsed modes

## Navigation Flow

### From Organizations Page
1. User is on `/dashboard` (org list)
2. Clicks org card → navigates to `/dashboard/:org/apps`
3. Sidebar shows with selected org highlighted
4. All apps in that org are displayed

### From Apps List Page
1. User is on `/dashboard/:org/apps`
2. Sidebar shows org switcher
3. Click different org → navigate to that org's apps
4. Click app card → navigate to `/dashboard/:org/:app`

### From App Detail Page
1. User is on `/dashboard/:org/:app`
2. Combined sidebar shows:
   - Organizations section (current org highlighted)
   - Applications section (current app highlighted)
3. Click different org → go to that org's apps list
4. Click different app → switch to that app's details
5. Stay within same org when switching apps

## Collapse/Expand Behavior

### Collapse Button
- Located in top right of sidebar header
- Left chevron (←) when expanded
- Right chevron (→) when collapsed
- Smooth 200ms width transition

### State Persistence
- Currently per-session (resets on page load)
- Could be enhanced with localStorage for persistence

### Width Transitions
```typescript
width: isCollapsed ? "80px" : "280px"
transition: "width 200ms ease"
```

## Tooltips

### When Shown
- Only in collapsed mode
- On hover over any icon
- Shows full org/app name

### Tooltip Style
- Position: right
- With arrow pointing to icon
- Auto-positioned to avoid viewport edges

## Implementation Details

### Color Consistency
```typescript
const getColor = (name: string) => {
  const hash = name.split("").reduce((acc, char) => 
    acc + char.charCodeAt(0), 0
  );
  return colors[hash % colors.length];
};
```

### Initials Extraction
```typescript
const getInitials = (name: string) => {
  const words = name.trim().split(" ");
  if (words.length === 1) {
    return name.substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
};
```

### Navigation
```typescript
// Switch org
navigate(route("/dashboard/:org/apps", { org: org.id }));

// Switch app within org
navigate(route("/dashboard/:org/:app", { 
  org: currentOrgId, 
  app: app.id 
}));
```

## Responsive Behavior

### Desktop (> 768px)
- Full sidebar functionality
- Smooth collapse/expand
- Hover states

### Tablet/Mobile (< 768px)
- Could be enhanced with drawer/overlay mode
- Currently same as desktop (may need adjustment)

## Accessibility

### Keyboard Navigation
- All buttons are keyboard accessible
- Tab through organizations/apps
- Enter/Space to activate

### Screen Readers
- Meaningful labels on buttons
- ARIA labels for collapse button
- Semantic HTML structure

## Future Enhancements

### Possible Improvements
1. **Persistence** - Save collapsed state to localStorage
2. **Search** - Add search/filter for many orgs/apps
3. **Favorites** - Pin frequently used orgs/apps to top
4. **Recent** - Show recently visited items
5. **Keyboard Shortcuts** - Quick navigation (e.g., Cmd+K)
6. **Mobile Drawer** - Overlay mode for mobile devices
7. **Drag & Drop** - Reorder favorites
8. **Groups** - Group organizations by category

## Testing

### Manual Test Checklist
- [ ] Sidebar collapses/expands smoothly
- [ ] Active org is highlighted correctly
- [ ] Active app is highlighted correctly
- [ ] Clicking org navigates to apps list
- [ ] Clicking app navigates to app details
- [ ] Tooltips show in collapsed mode
- [ ] Colors are consistent for same names
- [ ] Icons show correct initials
- [ ] Transitions are smooth (200ms)
- [ ] Hover states work correctly
- [ ] No layout shift during collapse/expand

### Edge Cases
- [ ] Very long org/app names (ellipsis)
- [ ] Single character names
- [ ] Names with special characters
- [ ] Many orgs (scrolling)
- [ ] Many apps (scrolling)
- [ ] No orgs (empty state)
- [ ] No apps (empty state)

## Performance

### Optimizations
- Icons generated on render (no image loading)
- CSS transitions (GPU accelerated)
- Memoized color/initial calculations
- Smooth scrolling in overflow areas

### Bundle Size
- No external icon libraries for initials
- Minimal additional code
- Leverages existing Mantine components

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS transitions and gradients
- Flexbox layout
- SVG icons (from Tabler)

