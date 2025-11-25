// src/main.js
const config = require('./config');

class LTMCommandExtension {
    constructor() {
        this.position = config.defaultPosition; // Default position setting
        this.characterPrompts = {};             // Stores character-specific prompts
        this.characters = [];                   // Stores character order data
        this.defaultCharacter = config.defaultCharacter; // Default character setting
        
        // Initialize with default character
        this.initializeDefaultCharacter();
    }

    // Initialize with default character
    initializeDefaultCharacter() {
        this.characters = [{ ...this.defaultCharacter, isDefault: true }];
    }

    // Process /LTM-Command
    processLTMCommand(msg) {
        const regex = /LTM - (\S*): ([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)/m;
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

    // Add a new character with order
    addCharacter(name, order) {
        const newCharacter = {
            name: name || '{{char}}',
            order: order || this.getNextOrder(),
            isDefault: false
        };
        this.characters.push(newCharacter);
        console.log(`Added character: ${newCharacter.name}, Order: ${newCharacter.order}`);
        return newCharacter;
    }

    // Delete a character by index
    deleteCharacter(index) {
        if (this.characters.length <= 1) {
            console.error('Cannot delete: At least one character is required.');
            return false;
        }
        const deleted = this.characters.splice(index, 1);
        console.log(`Deleted character at index ${index}:`, deleted[0]);
        return true;
    }

    // Update a character's name and order
    updateCharacter(index, name, order) {
        if (index < 0 || index >= this.characters.length) {
            console.error('Invalid character index.');
            return false;
        }
        this.characters[index].name = name || this.characters[index].name;
        this.characters[index].order = order || this.characters[index].order;
        console.log(`Updated character at index ${index}:`, this.characters[index]);
        return true;
    }

    // Get all characters
    getCharacters() {
        return [...this.characters];
    }

    // Set characters from external source
    setCharacters(characters) {
        if (Array.isArray(characters) && characters.length > 0) {
            this.characters = characters.map((c, index) => ({
                name: c.name || '{{char}}',
                order: c.order || index + 1,
                isDefault: index === 0 && c.name === '{{char}}' && c.order === 1
            }));
        } else {
            this.initializeDefaultCharacter();
        }
    }

    // Get next available order number
    getNextOrder() {
        if (this.characters.length === 0) return 1;
        return Math.max(...this.characters.map(c => c.order)) + 1;
    }

    // Generate prompt string from characters
    generatePrompt() {
        if (this.characters.length === 0) {
            return `이름: ${this.defaultCharacter.name}, Order: ${this.defaultCharacter.order}`;
        }

        return this.characters
            .map(c => `이름: ${c.name || '{{char}}'}, Order: ${c.order}`)
            .join('\n');
    }

    // Sync character data to prompt - updates internal state and returns generated prompt
    syncCharacter(index) {
        if (index < 0 || index >= this.characters.length) {
            console.error('Invalid character index for sync.');
            return null;
        }
        const prompt = this.generatePrompt();
        console.log(`Synced character at index ${index}. Generated prompt:\n${prompt}`);
        return prompt;
    }

    // Sync all characters to prompt
    syncAllCharacters() {
        const prompt = this.generatePrompt();
        console.log(`Synced all characters. Generated prompt:\n${prompt}`);
        return prompt;
    }

    // Reset to default state
    reset() {
        this.initializeDefaultCharacter();
        this.characterPrompts = {};
        console.log('Reset to default state.');
    }
}

// Export the extension for use
module.exports = new LTMCommandExtension();