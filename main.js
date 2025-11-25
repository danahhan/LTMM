// src/main.js
const config = require('./config');

class LTMCommandExtension {
    constructor() {
        this.position = config.defaultPosition; // Default position setting
        this.characterPrompts = {};             // Stores character-specific prompts
    }

    // Process /LTM-Command
    processLTMCommand(msg) {
        const regex = /LTM - ([^:]+): ([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)/m;
        const match = regex.exec(msg);

        if (!match) return console.error("Invalid LTM message format.");

        const [, key1, contentPart, key3, constantFlag, keySecondary, order] = match;

        // Build world info object
        const worldInfo = {
            key: `${key1}, ${key3}`,
            comment: key1,
            content: `LTM - ${key1}: ${contentPart}`,
            constant: constantFlag === 'A',
            keysecondary: keySecondary,
            order: parseInt(order, 10)
        };

        console.log('Processed WorldInfo:', worldInfo);

        this.saveWorldInfo(worldInfo);
    }

    // Save to World Info
    saveWorldInfo(data) {
        // Placeholder method to simulate saving world info
        console.log('Saving World Info:', data);
        // You can replace this with the actual saving logic or API call
    }

    // Set Position
    setPosition(position) {
        if (position === 0) {
            this.position = "before C";
        } else if (position === 1) {
            this.position = "after C";
        } else {
            console.error("Invalid position value.");
        }
    }

    // Add Prompt for a Specific Character
    saveCharacterPrompt(characterName, prompt) {
        this.characterPrompts[characterName] = prompt;
        console.log(`Saved prompt for ${characterName}:`, prompt);
    }

    // Get Prompt for a Specific Character
    getCharacterPrompt(characterName) {
        return this.characterPrompts[characterName] || "No prompt set for this character.";
    }
}

// Export the extension for use
module.exports = new LTMCommandExtension();