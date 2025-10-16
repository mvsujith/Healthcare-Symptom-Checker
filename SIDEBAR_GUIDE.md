# Sidebar Features Overview

## 🎨 Design Features

### Visual Theme
- **Transparent Background**: `rgba(15, 23, 42, 0.85)` with backdrop blur
- **Teal/Cyan Accents**: Matching your existing `#5eead4` color scheme
- **Glassmorphism Effect**: Frosted glass appearance with blur and transparency
- **Smooth Animations**: 0.4s cubic-bezier transitions

### Window Controls (Top Right of Each Sidebar)

1. **Minimize Button (−)**
   - Color: Yellow on hover (`#fbbf24`)
   - Function: Collapses sidebar to header-only (60px height)
   - Toggle: Click again to restore

2. **Maximize Button (□)**
   - Color: Green on hover (`#22c55e`)
   - Function: Expands sidebar from 320px to 480px width
   - Toggle: Click again to restore original size

3. **Close Button (×)**
   - Color: Red on hover (`#ef4444`)
   - Function: Completely hides sidebar
   - Reopen: Click the floating tab on the edge

### Floating Reopen Tabs
When a sidebar is closed, a slim vertical tab appears on the screen edge:
- **Left Sidebar**: Tab on left edge with `→` arrow
- **Right Sidebar**: Tab on right edge with `←` arrow
- **Hover Effect**: Slides out slightly and glows teal
- **Click**: Reopens the sidebar

---

## 📍 Sidebar Positions & Content

### Left Sidebar: "Patient History"
**Location**: Fixed left side, 24px from edges

**Content Sections**:
1. **Current Session**
   - Gender
   - Age
   - Duration of symptoms
   - Severity level

2. **Symptoms**
   - Full text of entered symptoms
   - Updates as user types

3. **AI Questions** (appears after AI generates questions)
   - Shows count of dynamic questions generated
   - Quick reference for interview progress

### Right Sidebar: "Analysis Status"
**Location**: Fixed right side, 24px from edges

**Content Sections**:
1. **Current Stage**
   - Real-time status indicator:
     - 🏥 Awaiting Input
     - 💭 Ready for AI
     - 🔄 Processing...
     - 📝 Awaiting Answers
     - ✅ Analysis Complete

2. **Quick Actions**
   - Reset button to start new consultation
   - Clickable sidebar items for common actions

3. **System Info**
   - AI Model: DeepSeek R1
   - Current Mode: Phase 1/2 indicator
   - Technical details

4. **Response Preview** (when available)
   - Shows first 150 characters of AI response
   - Quick peek before full analysis

---

## 🎯 Interactive Features

### Hover Effects
- **Control Buttons**: Lift up 2px with glow shadow
- **Sidebar Items**: Slide right 4px with border glow
- **Floating Tabs**: Slide out 4px with teal shadow

### Responsive Behavior
- **Desktop (>1024px)**: Full width sidebars (320px / 480px maximized)
- **Tablet (768-1024px)**: Narrower sidebars (280px / 400px maximized)
- **Mobile (<768px)**: Bottom sheet style, 70% screen height

### Scrollable Content
- Custom teal-themed scrollbar
- Smooth scroll behavior
- Content padding for comfortable reading

---

## 🔧 Technical Implementation

### Component Structure
```
<Sidebar position="left|right" title="Panel Title">
  <div className="sidebar-section">
    <div className="sidebar-section-title">Section Title</div>
    <div className="sidebar-item">
      <div className="sidebar-item-label">Label</div>
      <div className="sidebar-item-value">Value</div>
    </div>
  </div>
</Sidebar>
```

### State Management
Each sidebar independently manages:
- `isMinimized`: Header-only mode
- `isMaximized`: Expanded width mode
- `isClosed`: Completely hidden with reopen tab

### CSS Classes
- `.sidebar`: Main container with position variants
- `.sidebar-left` / `.sidebar-right`: Position modifiers
- `.minimized` / `.maximized`: Size state modifiers
- `.sidebar-toggle`: Floating reopen tab (when closed)

---

## 🎬 Usage Example

The sidebars are already integrated into your App.jsx:

- **Left Sidebar** shows patient data that updates as the user fills the form
- **Right Sidebar** shows real-time analysis status and system info
- **Both sidebars** work independently - you can minimize/maximize/close them separately
- **Floating tabs** let users reopen closed sidebars without refreshing

---

## 🚀 Testing Checklist

1. ✅ Check sidebar transparency and blur effect
2. ✅ Test minimize button (collapses to header)
3. ✅ Test maximize button (expands width)
4. ✅ Test close button (creates floating tab)
5. ✅ Test reopen from floating tab
6. ✅ Verify scroll behavior with lots of content
7. ✅ Test all three states on both sidebars simultaneously
8. ✅ Check responsive behavior on mobile
9. ✅ Verify theme colors match website palette
10. ✅ Test hover effects on all interactive elements

---

## 💡 Customization Tips

### Change Sidebar Width
```css
.sidebar {
  width: 320px; /* Default */
}
.sidebar.maximized {
  width: 480px; /* Maximized */
}
```

### Adjust Transparency
```css
.sidebar {
  background: rgba(15, 23, 42, 0.85); /* 85% opacity */
  backdrop-filter: blur(20px);
}
```

### Modify Colors
All colors use CSS variables for easy theming:
- Primary: `#5eead4` (teal)
- Warning: `#fbbf24` (yellow)
- Success: `#22c55e` (green)
- Danger: `#ef4444` (red)
