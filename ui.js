// LTM Character Manager UI

class LTMCharacterManagerUI {
    constructor() {
        this.characters = [];
        this.defaultCharacter = { name: '{{char}}', order: 1 };
        this.nextId = 1; // Unique ID counter for characters
        this.init();
    }

    init() {
        // Add default character on initialization
        this.characters.push({ ...this.defaultCharacter, id: this.nextId++, isDefault: true });
        
        this.renderCharacterList();
        this.updatePromptPreview();
        
        // Bind add character button
        const addBtn = document.getElementById('add-character-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addCharacter());
        }
    }

    // Find character index by ID
    findCharacterIndexById(id) {
        return this.characters.findIndex(c => c.id === id);
    }

    // Find character by ID
    findCharacterById(id) {
        return this.characters.find(c => c.id === id);
    }

    renderCharacterList() {
        const container = document.getElementById('character-list');
        if (!container) return;

        container.innerHTML = '';

        this.characters.forEach((character) => {
            const entry = this.createCharacterEntry(character);
            container.appendChild(entry);
        });
    }

    createCharacterEntry(character) {
        const characterId = character.id;
        const entry = document.createElement('div');
        entry.className = 'character-entry';
        entry.dataset.id = characterId;

        const nameLabel = document.createElement('label');
        nameLabel.textContent = '이름:';
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = character.name;
        nameInput.placeholder = '캐릭터 이름';
        nameInput.dataset.field = 'name';
        nameInput.dataset.id = characterId;

        const orderLabel = document.createElement('label');
        orderLabel.textContent = 'Order:';
        
        const orderInput = document.createElement('input');
        orderInput.type = 'number';
        orderInput.value = character.order;
        orderInput.min = 1;
        orderInput.dataset.field = 'order';
        orderInput.dataset.id = characterId;

        const syncBtn = document.createElement('button');
        syncBtn.className = 'btn btn-sync';
        syncBtn.textContent = 'Sync';
        syncBtn.addEventListener('click', () => this.syncCharacterById(characterId));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-delete';
        deleteBtn.textContent = '삭제';
        deleteBtn.addEventListener('click', () => this.deleteCharacterById(characterId));

        // Add input event listeners for real-time updates using ID lookup
        nameInput.addEventListener('input', (e) => {
            const char = this.findCharacterById(characterId);
            if (char) {
                char.name = e.target.value;
            }
        });

        orderInput.addEventListener('input', (e) => {
            const char = this.findCharacterById(characterId);
            if (char) {
                char.order = parseInt(e.target.value, 10) || 1;
            }
        });

        entry.appendChild(nameLabel);
        entry.appendChild(nameInput);
        entry.appendChild(orderLabel);
        entry.appendChild(orderInput);
        entry.appendChild(syncBtn);
        entry.appendChild(deleteBtn);

        // Add default indicator if this is the default character
        if (character.isDefault) {
            const defaultIndicator = document.createElement('span');
            defaultIndicator.className = 'default-indicator';
            defaultIndicator.textContent = '(기본값)';
            entry.appendChild(defaultIndicator);
        }

        return entry;
    }

    addCharacter() {
        const newOrder = this.characters.length > 0 
            ? Math.max(...this.characters.map(c => c.order)) + 1 
            : 1;
        
        this.characters.push({
            id: this.nextId++,
            name: '',
            order: newOrder,
            isDefault: false
        });

        this.renderCharacterList();
    }

    deleteCharacterById(id) {
        // Prevent deletion of the last character (keep at least one)
        if (this.characters.length <= 1) {
            alert('최소 하나의 캐릭터가 필요합니다.');
            return;
        }

        const index = this.findCharacterIndexById(id);
        if (index !== -1) {
            this.characters.splice(index, 1);
            this.renderCharacterList();
            this.updatePromptPreview();
        }
    }

    syncCharacterById(id) {
        const character = this.findCharacterById(id);
        if (!character) return;

        // Update the prompt preview
        this.updatePromptPreview();

        // Dispatch custom event for external integration
        const event = new CustomEvent('ltm-character-sync', {
            detail: {
                character: character,
                allCharacters: this.characters,
                prompt: this.generatePrompt()
            }
        });
        document.dispatchEvent(event);

        // Visual feedback
        const entry = document.querySelector(`.character-entry[data-id="${id}"]`);
        if (entry) {
            entry.style.borderColor = '#4CAF50';
            setTimeout(() => {
                entry.style.borderColor = '#444';
            }, 500);
        }

        console.log('Character synced:', character);
        console.log('Generated prompt:', this.generatePrompt());
    }

    syncAllCharacters() {
        this.updatePromptPreview();
        
        const event = new CustomEvent('ltm-all-characters-sync', {
            detail: {
                characters: this.characters,
                prompt: this.generatePrompt()
            }
        });
        document.dispatchEvent(event);

        console.log('All characters synced');
        console.log('Generated prompt:', this.generatePrompt());
    }

    generatePrompt() {
        if (this.characters.length === 0) {
            return '이름: {{char}}, Order: 1';
        }

        return this.characters
            .map(c => `이름: ${c.name || '{{char}}'}, Order: ${c.order}`)
            .join('\n');
    }

    updatePromptPreview() {
        const previewElement = document.getElementById('prompt-preview-content');
        if (previewElement) {
            previewElement.textContent = this.generatePrompt();
        }
    }

    // Get all characters data
    getCharacters() {
        return [...this.characters];
    }

    // Set characters from external source
    setCharacters(characters) {
        if (Array.isArray(characters) && characters.length > 0) {
            this.characters = characters.map((c, index) => ({
                id: this.nextId++,
                name: c.name || '{{char}}',
                order: c.order || index + 1,
                isDefault: index === 0 && c.name === '{{char}}' && c.order === 1
            }));
        } else {
            // Reset to default
            this.characters = [{ ...this.defaultCharacter, id: this.nextId++, isDefault: true }];
        }
        this.renderCharacterList();
        this.updatePromptPreview();
    }

    // Reset to default state
    reset() {
        this.characters = [{ ...this.defaultCharacter, id: this.nextId++, isDefault: true }];
        this.renderCharacterList();
        this.updatePromptPreview();
    }
}

// Initialize when DOM is ready
let ltmCharacterManager;
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            ltmCharacterManager = new LTMCharacterManagerUI();
        });
    } else {
        ltmCharacterManager = new LTMCharacterManagerUI();
    }
}

// Export for Node.js environment (testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LTMCharacterManagerUI;
}
