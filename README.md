# LTM Command Extension for SillyTavern

## Description

This extension adds functionality for processing `/LTM-commands` in SillyTavern and dynamically updating world info. It includes options to customize the position of the updates and store character-specific prompts.

## Features

- Parse `/LTM-commands` in the format:  
  `LTM - $1: $2 |$3|$4|$5|$6`
- Dynamically update World Info with:
  - **Key:** `$1, $3`
  - **Comment:** `$1`
  - **Content:** `LTM - $1: $2`
  - **Constant:** Set based on `$4` (`A = true`, otherwise `false`).
  - **KeySecondary:** `$5`
  - **Order:** `$6`
- Customize position with options:
  - `0`: "before C"
  - `1`: "after C"
- Save and retrieve character-specific prompts.
- **Character Order Management UI** with:
  - Add/delete characters with custom names and order numbers
  - Sync button to update prompts automatically
  - Default character: `이름: {{char}}, Order: 1`
  - Real-time prompt preview

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/[your-username]/ltm-command-extension.git
   ```

2. Install dependencies (if any):
   ```bash
   npm install
   ```

3. Add the extension to SillyTavern:
   - Copy the folder into SillyTavern's extensions directory.
   - Restart SillyTavern and enable the extension from the settings.

## Usage

1. **LTM Command Format:**
   ```
   /LTM-명령어
   LTM - $1: $2 |$3|$4|$5|$6
   ```

2. **Set Position:**
   ```javascript
   extension.setPosition(0); // Set position to "before C"
   extension.setPosition(1); // Set position to "after C"
   ```

3. **Save Character Prompt:**
   ```javascript
   extension.saveCharacterPrompt("Alice", "This is Alice's prompt.");
   ```

4. **Retrieve Character Prompt:**
   ```javascript
   const prompt = extension.getCharacterPrompt("Alice");
   console.log(prompt);
   ```

5. **Character Order Management:**
   ```javascript
   // Add a new character
   extension.addCharacter("Alice", 2);
   
   // Update a character
   extension.updateCharacter(0, "Bob", 1);
   
   // Delete a character
   extension.deleteCharacter(1);
   
   // Get all characters
   const characters = extension.getCharacters();
   
   // Generate prompt from characters
   const prompt = extension.generatePrompt();
   // Output: "이름: {{char}}, Order: 1\n이름: Alice, Order: 2"
   
   // Sync a specific character
   extension.syncCharacter(0);
   
   // Sync all characters
   extension.syncAllCharacters();
   
   // Reset to default
   extension.reset();
   ```

## UI Usage

Open `index.html` in a browser to use the Character Manager UI:
- Click "캐릭터 추가" to add a new character
- Enter character name and order number
- Click "Sync" to synchronize changes to the prompt
- Click "삭제" to remove a character
- View the generated prompt in the preview section

## License

MIT License