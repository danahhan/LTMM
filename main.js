// main.js - Core LTM Command Extension Logic
// This file provides standalone functionality for LTM command processing

const config = require('./config');

/**
 * LTM Command Extension Class
 * Handles LTM command parsing, world info creation, and character prompt management
 */
class LTMCommandExtension {
    constructor() {
        this.position = config.defaultPosition; // Default position setting (0 = before C, 1 = after C)
        this.characterPrompts = {};              // Stores character-specific prompts
    }

    /**
     * Parse LTM message format: LTM - $1: $2 |$3|$4|$5|$6
     * @param {string} msg - The message to parse
     * @returns {Object|null} - Parsed world info object or null if invalid
     * 
     * Field mapping based on requirements:
     * - $1 and $3 -> keysecondary
     * - $1 -> comment
     * - LTM - $1: $2 -> content
     * - $4 = 'A' -> constant = true, $4 = '2' -> constant = false
     * - $5 -> key
     * - $6 -> order (number)
     */
    parseLTMMessage(msg) {
        const regex = /LTM\s*-\s*(\S+):\s*([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)/;
        const match = regex.exec(msg);

        if (!match) {
            return null;
        }

        const [, $1, $2, $3, $4, $5, $6] = match;

        return {
            keysecondary: [$1.trim(), $3.trim()].filter(Boolean),
            comment: $1.trim(),
            content: `LTM - ${$1.trim()}: ${$2.trim()}`,
            constant: $4.trim() === 'A',
            key: $5.trim(),
            order: parseInt($6.trim(), 10) || 0,
            position: this.position
        };
    }

    /**
     * Process /LTM-Command
     * @param {string} msg - The LTM message to process
     * @returns {Object|null} - The processed world info or null if invalid
     */
    processLTMCommand(msg) {
        const worldInfo = this.parseLTMMessage(msg);

        if (!worldInfo) {
            console.error("[LTMM] Invalid LTM message format.");
            return null;
        }

        console.log('[LTMM] Processed WorldInfo:', worldInfo);
        this.saveWorldInfo(worldInfo);
        return worldInfo;
    }

    /**
     * Save to World Info
     * @param {Object} data - World info data to save
     */
    saveWorldInfo(data) {
        console.log('[LTMM] Saving World Info:', data);
        // This is a placeholder - actual implementation depends on the context
        // In SillyTavern, this would interface with the world info API
    }

    /**
     * Set Position for world info entries
     * @param {number} position - 0 for "before C", 1 for "after C"
     */
    setPosition(position) {
        if (position === 0) {
            this.position = 0;
            console.log('[LTMM] Position set to: before C (0)');
        } else if (position === 1) {
            this.position = 1;
            console.log('[LTMM] Position set to: after C (1)');
        } else {
            console.error("[LTMM] Invalid position value. Use 0 (before C) or 1 (after C).");
        }
    }

    /**
     * Get current position setting
     * @returns {number} - Current position (0 or 1)
     */
    getPosition() {
        return this.position;
    }

    /**
     * Save prompt for a specific character
     * @param {string} characterName - Name of the character
     * @param {string} prompt - The prompt text to save
     */
    saveCharacterPrompt(characterName, prompt) {
        if (!characterName) {
            console.error('[LTMM] Character name is required.');
            return false;
        }
        this.characterPrompts[characterName] = prompt;
        console.log(`[LTMM] Saved prompt for ${characterName}`);
        return true;
    }

    /**
     * Get prompt for a specific character
     * @param {string} characterName - Name of the character
     * @returns {string} - The saved prompt or empty string
     */
    getCharacterPrompt(characterName) {
        return this.characterPrompts[characterName] || "";
    }

    /**
     * Delete prompt for a specific character
     * @param {string} characterName - Name of the character
     * @returns {boolean} - True if deleted, false if not found
     */
    deleteCharacterPrompt(characterName) {
        if (this.characterPrompts[characterName]) {
            delete this.characterPrompts[characterName];
            console.log(`[LTMM] Deleted prompt for ${characterName}`);
            return true;
        }
        return false;
    }

    /**
     * Get all saved character prompts
     * @returns {Object} - Object containing all character prompts
     */
    getAllCharacterPrompts() {
        return { ...this.characterPrompts };
    }

    /**
     * Create a world info entry object with all required fields
     * @param {Object} data - Partial data to create entry from
     * @returns {Object} - Complete world info entry
     */
    createWorldInfoEntry(data) {
        return {
            key: Array.isArray(data.key) ? data.key : [data.key],
            keysecondary: Array.isArray(data.keysecondary) ? data.keysecondary : [data.keysecondary],
            comment: data.comment || "",
            content: data.content || "",
            constant: data.constant || false,
            order: data.order || 100,
            position: data.position !== undefined ? data.position : this.position,
            disable: false,
            selectiveLogic: 0,
            addMemo: true,
            depth: 4,
            probability: 100,
            group: "",
            scanDepth: null,
            caseSensitive: false,
            matchWholeWords: false,
            useGroupScoring: false,
            automationId: "",
            vectorized: false,
            sticky: 0,
            cooldown: 0,
            delay: 0,
            excludeRecursion: false
        };
    }
}

// Export the extension class and instance for use
const ltmExtension = new LTMCommandExtension();

module.exports = ltmExtension;
module.exports.LTMCommandExtension = LTMCommandExtension;