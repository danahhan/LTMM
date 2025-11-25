// index.js - Main entry point for SillyTavern extension
import { extension_settings, getContext, loadExtensionSettings, saveSettingsDebounced } from "../../../extensions.js";
import { saveWorldInfo, world_info } from "../../../worldinfo.js";
import { eventSource, event_types } from "../../../../script.js";
import { SlashCommand } from "../../../slash-commands/SlashCommand.js";
import { SlashCommandParser } from "../../../slash-commands/SlashCommandParser.js";
import { SlashCommandArgument } from "../../../slash-commands/SlashCommandArgument.js";

const extensionName = "LTMM";
const extensionFolderPath = `scripts/extensions/third_party/${extensionName}`;
const defaultSettings = {
    position: 0, // 0 = before C, 1 = after C
    characterPrompts: {},
    enabled: true
};

// Load settings
async function loadSettings() {
    extension_settings[extensionName] = extension_settings[extensionName] || {};
    if (Object.keys(extension_settings[extensionName]).length === 0) {
        Object.assign(extension_settings[extensionName], defaultSettings);
    }
}

// Parse LTM command format: LTM - $1: $2 |$3|$4|$5|$6
function parseLTMMessage(msg) {
    const regex = /LTM\s*-\s*(\S+):\s*([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)/;
    const match = regex.exec(msg);
    
    if (!match) {
        return null;
    }

    const [, $1, $2, $3, $4, $5, $6] = match;
    
    // Build world info object based on requirements:
    // $1 and $3 -> keysecondary
    // $1 -> comment
    // LTM - $1: $2 -> content
    // $4 = 'A' -> constant = true, $4 = '2' -> constant = false
    // $5 -> key
    // $6 -> order (number)
    return {
        keysecondary: [$1.trim(), $3.trim()].filter(Boolean),
        comment: $1.trim(),
        content: `LTM - ${$1.trim()}: ${$2.trim()}`,
        constant: $4.trim() === 'A',
        key: $5.trim(),
        order: parseInt($6.trim(), 10) || 0,
        position: extension_settings[extensionName].position
    };
}

// Process the /LTM-명령어 command
async function processLTMCommand(lastMessage) {
    const worldInfoData = parseLTMMessage(lastMessage);
    
    if (!worldInfoData) {
        console.error("[LTMM] Invalid LTM message format.");
        toastr.error("Invalid LTM message format. Expected: LTM - $1: $2 |$3|$4|$5|$6");
        return null;
    }

    console.log("[LTMM] Processed WorldInfo:", worldInfoData);
    return worldInfoData;
}

// Create a new world info entry
async function createWorldInfoEntry(data) {
    try {
        const context = getContext();
        
        // Create the entry object
        const entry = {
            key: [data.key],
            keysecondary: data.keysecondary,
            comment: data.comment,
            content: data.content,
            constant: data.constant,
            order: data.order,
            position: data.position, // 0 = before C, 1 = after C
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

        console.log("[LTMM] Creating world info entry:", entry);
        toastr.success(`World Info entry created: ${data.comment}`);
        
        return entry;
    } catch (error) {
        console.error("[LTMM] Error creating world info entry:", error);
        toastr.error("Failed to create world info entry");
        return null;
    }
}

// Save character-specific prompt
function saveCharacterPrompt(characterName, prompt) {
    if (!characterName) {
        toastr.warning("Please select a character first.");
        return;
    }
    
    extension_settings[extensionName].characterPrompts[characterName] = prompt;
    saveSettingsDebounced();
    toastr.success(`Prompt saved for ${characterName}`);
}

// Get character-specific prompt
function getCharacterPrompt(characterName) {
    return extension_settings[extensionName].characterPrompts[characterName] || "";
}

// Delete character prompt
function deleteCharacterPrompt(characterName) {
    if (extension_settings[extensionName].characterPrompts[characterName]) {
        delete extension_settings[extensionName].characterPrompts[characterName];
        saveSettingsDebounced();
        toastr.info(`Prompt deleted for ${characterName}`);
    }
}

// Set position setting
function setPosition(position) {
    extension_settings[extensionName].position = position;
    saveSettingsDebounced();
}

// Handle slash command
function handleLTMSlashCommand(args, value) {
    const lastMessage = value || getLastUserMessage();
    
    if (!lastMessage) {
        toastr.warning("No message to process.");
        return;
    }
    
    const worldInfoData = processLTMCommand(lastMessage);
    if (worldInfoData) {
        createWorldInfoEntry(worldInfoData);
    }
}

// Get last user message
function getLastUserMessage() {
    const context = getContext();
    const chat = context.chat;
    
    if (!chat || chat.length === 0) {
        return null;
    }
    
    // Find last user message
    for (let i = chat.length - 1; i >= 0; i--) {
        if (chat[i].is_user) {
            return chat[i].mes;
        }
    }
    
    return null;
}

// Update UI with current settings
function updateUI() {
    const position = extension_settings[extensionName].position;
    $(`#ltmm_position_select`).val(position);
    
    // Update character prompts list
    updateCharacterPromptsList();
}

// Update character prompts list in UI
function updateCharacterPromptsList() {
    const promptsList = $("#ltmm_prompts_list");
    promptsList.empty();
    
    const prompts = extension_settings[extensionName].characterPrompts || {};
    
    if (Object.keys(prompts).length === 0) {
        promptsList.append('<div class="ltmm-empty-state">No character prompts saved yet.</div>');
        return;
    }
    
    for (const [characterName, prompt] of Object.entries(prompts)) {
        const item = $(`
            <div class="ltmm-prompt-item" data-character="${characterName}">
                <div class="ltmm-prompt-header">
                    <span class="ltmm-character-name">${characterName}</span>
                    <div class="ltmm-prompt-actions">
                        <button class="ltmm-edit-btn menu_button" title="Edit">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="ltmm-delete-btn menu_button" title="Delete">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="ltmm-prompt-content">${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}</div>
            </div>
        `);
        promptsList.append(item);
    }
}

// Initialize the extension
jQuery(async () => {
    const settingsHtml = await $.get(`${extensionFolderPath}/settings.html`);
    
    $("#extensions_settings2").append(settingsHtml);
    
    await loadSettings();
    updateUI();
    
    // Event handlers
    $("#ltmm_position_select").on("change", function() {
        setPosition(parseInt($(this).val(), 10));
    });
    
    $("#ltmm_save_prompt").on("click", function() {
        const characterName = $("#ltmm_character_name").val().trim();
        const prompt = $("#ltmm_character_prompt").val().trim();
        
        if (characterName && prompt) {
            saveCharacterPrompt(characterName, prompt);
            updateCharacterPromptsList();
            $("#ltmm_character_name").val("");
            $("#ltmm_character_prompt").val("");
        } else {
            toastr.warning("Please enter both character name and prompt.");
        }
    });
    
    // Delete prompt handler
    $(document).on("click", ".ltmm-delete-btn", function() {
        const characterName = $(this).closest(".ltmm-prompt-item").data("character");
        deleteCharacterPrompt(characterName);
        updateCharacterPromptsList();
    });
    
    // Edit prompt handler
    $(document).on("click", ".ltmm-edit-btn", function() {
        const characterName = $(this).closest(".ltmm-prompt-item").data("character");
        const prompt = getCharacterPrompt(characterName);
        $("#ltmm_character_name").val(characterName);
        $("#ltmm_character_prompt").val(prompt);
    });
    
    // Process LTM button
    $("#ltmm_process_btn").on("click", function() {
        const input = $("#ltmm_input").val().trim();
        if (input) {
            const worldInfoData = processLTMCommand(input);
            if (worldInfoData) {
                createWorldInfoEntry(worldInfoData);
                $("#ltmm_input").val("");
            }
        } else {
            toastr.warning("Please enter LTM data to process.");
        }
    });
    
    // Register slash command
    try {
        SlashCommandParser.addCommandObject(SlashCommand.fromProps({
            name: 'LTM-명령어',
            callback: handleLTMSlashCommand,
            unnamedArgumentList: [
                SlashCommandArgument.fromProps({
                    description: 'The LTM message to process',
                    isRequired: false,
                    defaultValue: ''
                })
            ],
            helpString: 'Process LTM command and create world info entry.'
        }));
        console.log("[LTMM] Slash command registered successfully.");
    } catch (error) {
        console.warn("[LTMM] Could not register slash command:", error);
    }
    
    console.log("[LTMM] Extension loaded successfully.");
});

// Export functions for external use
export {
    parseLTMMessage,
    processLTMCommand,
    createWorldInfoEntry,
    saveCharacterPrompt,
    getCharacterPrompt,
    setPosition
};
