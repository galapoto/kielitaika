# Workplace & Vocabulary Features

## Overview

New features for workplace-specific Finnish learning and vocabulary practice have been implemented.

## Backend Endpoints

### Workplace Endpoints
- `GET /workplace/fields` - List all available professions
- `POST /workplace/lesson` - Get lesson for a specific profession
- `POST /workplace/dialogue` - Generate roleplay scenario
- `POST /workplace/evaluate` - Evaluate user's workplace response

### Vocabulary Endpoints
- `GET /vocab/paths` - List learning paths (general, workplace, yki)
- `GET /vocab/units` - Get vocabulary items for a path/field
- `POST /vocab/missing` - Detect missing vocabulary in transcript
- `POST /vocab/srs` - Build spaced repetition list

## Frontend Screens

### 1. WorkplaceScreen ✅
**File:** `frontend/app/screens/WorkplaceScreen.js`

**Features:**
- Lists all available professions
- Grid layout with profession cards
- Navigation to profession detail screen
- Loading and error states

**API Usage:**
```javascript
const response = await listWorkplaceFields();
// Returns: { fields: [{ id: "sairaanhoitaja", label: "Sairaanhoitaja" }, ...] }
```

### 2. ProfessionDetailScreen ✅
**File:** `frontend/app/screens/ProfessionDetailScreen.js`

**Features:**
- Displays lesson content for selected profession
- Shows vocabulary list
- Grammar tips
- Writing tasks
- "Start Practice" button launches conversation mode

**Lesson Structure:**
```javascript
{
  field: "sairaanhoitaja",
  level: "B1",
  title: "Hoidon aloitus",
  prompt: "Kerro kollegalle potilaan tämänhetkinen tila...",
  vocabulary: ["potilas", "tila", "lääke", ...],
  grammar_tip: "Harjoittele partitiivia...",
  writing_task: "Kirjoita lyhyt raportti..."
}
```

**API Usage:**
```javascript
const response = await fetchWorkplaceLesson('sairaanhoitaja', 'B1');
// Returns: { lesson: {...} }
```

### 3. VocabularyScreen ✅
**File:** `frontend/app/screens/VocabularyScreen.js`

**Features:**
- Path selector (General, Workplace, YKI)
- Flip cards for vocabulary learning
- Toggle between Finnish-first and English-first
- Grid layout with flashcard-style cards

**API Usage:**
```javascript
const response = await fetchVocab('general', null, 20);
// Returns: { items: [{ fi: "hei", en: "hello" }, ...] }

const paths = await listPaths();
// Returns: { paths: [{ id: "general", label: "Yleinen suomi", ... }, ...] }
```

## Navigation Flow

```
Home
├── Workplace
│   └── ProfessionDetail
│       └── Conversation (with profession context)
├── Vocabulary
│   └── (Path selector)
└── ...
```

## Available Professions

Currently supported:
- **Sairaanhoitaja** (Nurse)
- **Lääkäri** (Doctor)
- **ICT / Software** (Software Developer)

Each profession includes:
- Profession-specific vocabulary
- Roleplay scenarios
- Grammar tips
- Writing tasks

## Vocabulary Features

### Path-Based Vocabulary
- **General** - Everyday Finnish vocabulary
- **Workplace** - Profession-specific terms
- **YKI** - Exam-focused vocabulary

### Flashcard Learning
- Tap cards to flip between Finnish and English
- Toggle display mode (Finnish-first or English-first)
- Visual card-based interface

## Integration with Conversation

When starting practice from ProfessionDetailScreen:
- Conversation mode opens with `path: 'workplace'`
- `profession` parameter set to selected field
- AI tutor adapts persona to profession
- Vocabulary and scenarios context-aware

## API Response Examples

### List Workplace Fields
```json
{
  "fields": [
    { "id": "sairaanhoitaja", "label": "Sairaanhoitaja" },
    { "id": "laakari", "label": "Lääkäri" },
    { "id": "ict", "label": "ICT / Software" }
  ]
}
```

### Fetch Workplace Lesson
```json
{
  "lesson": {
    "field": "sairaanhoitaja",
    "level": "B1",
    "title": "Hoidon aloitus",
    "prompt": "Kerro kollegalle potilaan tämänhetkinen tila...",
    "vocabulary": ["potilas", "tila", "viime yö", "lääke", "mittaukset"],
    "grammar_tip": "Harjoittele partitiivia potilaan tilan kuvaukseen.",
    "writing_task": "Kirjoita lyhyt raportti: potilaan vointi + annetut lääkkeet + suunnitelma."
  }
}
```

### Fetch Vocabulary
```json
{
  "items": [
    { "fi": "hei", "en": "hello" },
    { "fi": "kiitos", "en": "thank you" },
    { "fi": "potilas", "en": "patient" }
  ]
}
```

## Future Enhancements

1. **More Professions**
   - Sähköinsinööri (Electrical Engineer)
   - Hoiva-avustaja (Care Assistant)
   - Logistiikka (Logistics)
   - Siivous (Cleaning)

2. **Spaced Repetition**
   - Track learned vocabulary
   - Schedule review sessions
   - Progress tracking

3. **Vocabulary Games**
   - Matching exercises
   - Fill-in-the-blank
   - Pronunciation practice

4. **Workplace Scenarios**
   - Multiple scenarios per profession
   - Scenario difficulty levels
   - Progress tracking

## Testing

To test the features:

1. **Workplace Flow:**
   ```
   Home → Workplace → Select Profession → View Lesson → Start Practice
   ```

2. **Vocabulary Flow:**
   ```
   Home → Vocabulary → Select Path → Study Cards
   ```

## Notes

- All API endpoints return consistent error formats
- Loading states handled in all screens
- Error handling with retry options
- Responsive design for mobile and web
