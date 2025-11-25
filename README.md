# LTM Manager - SillyTavern Extension

## Description

LTM Manager is a SillyTavern extension for processing `/LTM-명령어` commands and dynamically managing world info entries. It provides an intuitive UI for creating world info entries and managing character-specific prompts.

## Features

### LTM Command Processing
- Parse `/LTM-명령어` commands in the format:  
  `LTM - $1: $2 |$3|$4|$5|$6`
- Automatically create World Info entries with the following mapping:
  - **KeySecondary:** `$1, $3`
  - **Comment:** `$1`
  - **Content:** `LTM - $1: $2`
  - **Constant:** `$4` (`A` = true, `2` = false)
  - **Key:** `$5`
  - **Order:** `$6` (number)

### Position Settings
- Customize entry position with options:
  - `0`: Before Character definition
  - `1`: After Character definition

### Character Prompts Management
- Save and retrieve character-specific prompts
- Edit and delete saved prompts through the UI
- Persistent storage of prompts across sessions

### Quick World Info Entry
- Manual entry form for creating world info entries
- All fields configurable through the UI

## Installation

1. Clone the repository into your SillyTavern extensions folder:
   ```bash
   cd SillyTavern/public/scripts/extensions/third_party/
   git clone https://github.com/danahhan/LTMM.git
   ```

2. Restart SillyTavern and enable the extension from Settings → Extensions.

## Usage

### Using LTM Command
```
/LTM-명령어
LTM - Memory: This is the content |secondary|A|mainkey|100
```

This will create a world info entry with:
- KeySecondary: `["Memory", "secondary"]`
- Comment: `Memory`
- Content: `LTM - Memory: This is the content`
- Constant: `true` (because $4 is 'A')
- Key: `mainkey`
- Order: `100`

### UI Features
1. **Position Settings**: Select where world info entries should be positioned
2. **LTM Command Processor**: Enter LTM data directly and process it
3. **Character Prompts**: Save, edit, and manage character-specific prompts
4. **Quick World Info Entry**: Manually create world info entries with all fields

### API Usage (for developers)
```javascript
// Import the extension
const ltm = require('./main');

// Process an LTM command
const result = ltm.processLTMCommand("LTM - Test: Content |tag|A|key|50");

// Set position
ltm.setPosition(0); // Before character
ltm.setPosition(1); // After character

// Manage character prompts
ltm.saveCharacterPrompt("Alice", "This is Alice's system prompt.");
const prompt = ltm.getCharacterPrompt("Alice");
ltm.deleteCharacterPrompt("Alice");
```

## File Structure

```
LTMM/
├── index.js        # SillyTavern extension entry point
├── main.js         # Core LTM command processing logic
├── config.js       # Configuration settings
├── settings.html   # UI template with embedded styles
├── manifest.json   # Extension manifest
├── package.json    # NPM package info
└── README.md       # Documentation
```

## References

- UI design inspired by [character-assets](https://github.com/tincansimagine/character-assets)
- World info management based on [theghostface](https://github.com/HealthyControl/theghostface)

## License

MIT License