# Sidebar System - Quick Visual Guide

## 🎨 Layout Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     AI DOCTOR APPLICATION                        │
├──────────────┬─────────────────────────────┬────────────────────┤
│              │                             │                    │
│  LEFT        │     MAIN CONTENT AREA       │   RIGHT           │
│  SIDEBAR     │                             │   SIDEBAR         │
│              │                             │                    │
│  [NAV MENU]  │   - Form / Questions        │   [CONTENT]       │
│              │   - Analysis Display        │                    │
│  🏥 Probable │   - Background Workspace    │   Displays        │
│  ⚠️ Risk     │                             │   Selected        │
│  💊 Conventional│                          │   Section         │
│  🌿 Ayurvedic│                             │   Data            │
│  🏠 Home     │                             │                    │
│              │                             │                    │
│  [- □ ×]     │                             │   [- □ ×]         │
└──────────────┴─────────────────────────────┴────────────────────┘
```

## 📋 Navigation Flow

### Step 1: Before Analysis (Initial State)

**Left Sidebar:**
```
┌──────────────────────┐
│ ⚡ Analysis Menu      │
├──────────────────────┤
│                      │
│  Complete the        │
│  consultation to     │
│  view analysis       │
│  sections            │
│                      │
└──────────────────────┘
```

**Right Sidebar:**
```
┌──────────────────────┐
│ ⚡ Analysis Details   │
├──────────────────────┤
│                      │
│  No analysis data    │
│  available. Please   │
│  complete the        │
│  consultation first. │
│                      │
└──────────────────────┘
```

### Step 2: After Analysis Complete

**Left Sidebar (Navigation):**
```
┌──────────────────────┐
│ ⚡ Analysis Menu      │
├──────────────────────┤
│ Analysis Sections    │
├──────────────────────┤
│ ┌──────────────────┐ │
│ │ 🏥 Probable      │ │ ← ACTIVE (glowing)
│ │    Conditions    │ │
│ └──────────────────┘ │
│                      │
│ 📦 Risk Assessment   │ ← Hover effect
│                      │
│ 📦 Conventional      │
│    Treatments        │
│                      │
│ 📦 Ayurvedic         │
│    Medicines         │
│                      │
│ 📦 Home Remedies     │
│                      │
└──────────────────────┘
```

**Right Sidebar (Content Display):**
```
┌─────────────────────────────────┐
│ ⚡ Probable Conditions           │
├─────────────────────────────────┤
│ 🏥 Probable Conditions          │
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Viral Fever          [85%]  │ │
│ ├─────────────────────────────┤ │
│ │ Confidence: High            │ │
│ │ Urgency: 🟢 Low             │ │
│ │ Specialist: Primary Care... │ │
│ │                             │ │
│ │ Rationale: Fever is a...    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Infectious Mono      [60%]  │ │
│ ├─────────────────────────────┤ │
│ │ Confidence: Medium          │ │
│ │ Urgency: 🟡 Medium          │ │
│ │ ...                         │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

### Step 3: User Clicks "Risk Assessment"

**Left Sidebar:**
```
┌──────────────────────┐
│ ⚡ Analysis Menu      │
├──────────────────────┤
│ 📦 Probable          │
│    Conditions        │
│                      │
│ ┌──────────────────┐ │
│ │ ⚠️ Risk          │ │ ← NOW ACTIVE
│ │    Assessment    │ │
│ └──────────────────┘ │
│                      │
│ 📦 Conventional...   │
│ 📦 Ayurvedic...      │
│ 📦 Home Remedies     │
└──────────────────────┘
```

**Right Sidebar Updates:**
```
┌─────────────────────────────────┐
│ ⚡ Risk Assessment               │
├─────────────────────────────────┤
│ ⚠️ Risk Assessment              │
├─────────────────────────────────┤
│                                 │
│ ⚠️ Immediate Risks              │
│ ┌─────────────────────────────┐ │
│ │ • Dehydration if fever      │ │
│ │ • Potential complications   │ │
│ └─────────────────────────────┘ │
│                                 │
│ 📅 Long-term Risks              │
│ ┌─────────────────────────────┐ │
│ │ • Chronic conditions if...  │ │
│ └─────────────────────────────┘ │
│                                 │
│ 🚨 Seek Emergency Care If:      │
│ ┌─────────────────────────────┐ │
│ │ • Fever exceeds 104°F       │ │
│ │ • Difficulty breathing      │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

## 🎨 Color Coding Reference

### Confidence Levels
- 🟢 **High (85%+)**: Green background, green badge
- 🟡 **Medium (60-84%)**: Yellow background, yellow badge
- 🔴 **Low (<60%)**: Red background, red badge

### Urgency Levels
- 🟢 **Low**: Green badge
- 🟡 **Medium**: Yellow badge
- 🔴 **High**: Red badge

### Prescription Status
- 🔴 **℞ Rx Required**: Red badge
- 🟢 **✓ OTC**: Green badge

### Risk Categories
- 🟡 **Immediate Risks**: Yellow left border
- 🔵 **Long-term Risks**: Teal left border
- 🔴 **Emergency Conditions**: Red background + red left border

## 🖱️ Interactive Elements

### Navigation Item States

**Default:**
```css
Background: rgba(15, 23, 42, 0.5)
Border: 1px solid rgba(94, 234, 212, 0.2)
Color: #e2e8f0
```

**Hover:**
```css
Background: rgba(15, 23, 42, 0.8)
Border: rgba(94, 234, 212, 0.4)
Transform: translateX(4px)
```

**Active (Selected):**
```css
Background: rgba(94, 234, 212, 0.15)
Border: rgba(94, 234, 212, 0.6)
Box-shadow: 0 0 15px rgba(94, 234, 212, 0.2)
Color: #5eead4 (teal)
```

## 📊 Section Content Examples

### 1. Probable Conditions Card
```
┌──────────────────────────────────┐
│ Viral Fever              [85%]   │ ← Name + Confidence Badge
├──────────────────────────────────┤
│ Confidence: High                 │ ← Detail rows
│ Urgency: 🟢 Low                  │
│ Specialist: Primary Care...      │
├──────────────────────────────────┤
│ Rationale:                       │ ← Rationale section
│ Fever is a common symptom of...  │
│ (Full paragraph in bordered box) │
└──────────────────────────────────┘
```

### 2. Treatment Card
```
┌──────────────────────────────────┐
│ Acetaminophen      [✓ OTC]       │ ← Name + Prescription
├──────────────────────────────────┤
│ Type: Medication                 │
│ Purpose: Reduce fever            │
├──────────────────────────────────┤
│ Dosage:                          │ ← Teal info box
│ 500-1000 mg every 4-6 hours      │
├──────────────────────────────────┤
│ ⚠️ Precautions:                  │ ← Yellow warning box
│ Avoid if known allergies...      │
└──────────────────────────────────┘
```

### 3. Ayurvedic Medicine Card
```
┌──────────────────────────────────┐
│ 🌿 Ginger                        │ ← Leaf emoji + name
├──────────────────────────────────┤
│ Traditional Use: Reduces fever   │
│ Dosage: 1-2 cups daily           │
│ Forms: Tea, Powder               │
├──────────────────────────────────┤
│ ⚠️ Precautions:                  │
│ Avoid if experiencing stomach... │
└──────────────────────────────────┘
```

### 4. Home Remedy Card
```
┌──────────────────────────────────┐
│ 🏠 Warm Water Sponging           │ ← House emoji + name
├──────────────────────────────────┤
│ Preparation:                     │ ← Teal box
│ Use a sponge soaked in warm...   │
├──────────────────────────────────┤
│ Frequency: Every 15-20 minutes   │
│ Benefits: Helps reduce temp...   │
├──────────────────────────────────┤
│ ⚠️ Precautions:                  │
│ Avoid cold water as it can...    │
└──────────────────────────────────┘
```

## 🎬 Animation Timeline

```
User clicks "Risk Assessment"
    ↓
[0ms] setSelectedSection('risk_assessment')
    ↓
[50ms] Left sidebar: Active highlight moves
    ↓
[100ms] Right sidebar: Title updates
    ↓
[150ms] Content fades in (opacity 0 → 1)
    ↓
[300ms] Content slides in (translateY(10px) → 0)
    ↓
[300ms] Animation complete
```

## 📐 Dimensions

### Sidebars
- **Width**: 320px (default), 480px (maximized)
- **Height**: Viewport height - 48px (24px margin top/bottom)
- **Border Radius**: 16px
- **Gap from Edge**: 24px

### Cards
- **Padding**: 1.25rem (20px)
- **Border Radius**: 12px
- **Margin Bottom**: 1rem (16px)
- **Border Width**: 1px

### Typography
- **Section Heading**: 1.3rem, weight 600
- **Card Title**: 1.1rem, weight 600
- **Body Text**: 0.9rem, weight 400
- **Labels**: 0.85rem, weight 600

## 🔄 State Diagram

```
┌─────────────────┐
│  Initial Load   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ No Analysis     │ ← Placeholder state
│ Data            │
└────────┬────────┘
         │ User submits answers
         ↓
┌─────────────────┐
│ AI Processing   │ ← Loading state
└────────┬────────┘
         │ Response received
         ↓
┌─────────────────┐
│ Parse Analysis  │ ← Data transformation
└────────┬────────┘
         │ Success
         ↓
┌─────────────────┐
│ Navigation      │ ← Active state
│ Enabled         │ ← Default: probable_conditions
└────────┬────────┘
         │ User clicks section
         ↓
┌─────────────────┐
│ Display Section │ ← Content rendering
│ Content         │
└────────┬────────┘
         │ User clicks another section
         ↓
      (Loop back to Display Section Content)
```

## 🎯 Key Features Summary

✅ **5 Navigation Sections**: Probable Conditions, Risk Assessment, Conventional Treatments, Ayurvedic Medicines, Home Remedies

✅ **Active State Highlighting**: Clear visual feedback on selected section

✅ **Smooth Animations**: Fade-in and slide transitions

✅ **Color-Coded Information**: Confidence, urgency, prescription status

✅ **Responsive Design**: Works on desktop, tablet, mobile

✅ **Empty States**: Graceful handling of missing data

✅ **Window Controls**: Minimize, maximize, close functionality

✅ **Glassmorphism UI**: Transparent backgrounds with blur effects

✅ **Teal Theme**: Consistent with existing design system

---

**Quick Start**: Complete a consultation → Navigate analysis sections → Click any section in left sidebar → View content in right sidebar
