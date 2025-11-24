import { eventSource, event_types, saveSettingsDebounced } from '../../../script.js';
import { extension_settings, getContext } from '../../extensions.js';
import { SlashCommandParser } from '../../slash-commands/SlashCommandParser.js';
import { SlashCommand } from '../../slash-commands/SlashCommand.js';
import { ARGUMENT_TYPE, SlashCommandArgument } from '../../slash-commands/SlashCommandArgument.js';

const MODULE_NAME = 'ltm-extractor';

// 확장프로그램 설정 초기화
const defaultSettings = {
    enabled: true
};

function loadSettings() {
    if (!extension_settings[MODULE_NAME]) {
        extension_settings[MODULE_NAME] = defaultSettings;
    }
    return extension_settings[MODULE_NAME];
}

/**
 * LTM 형식 파싱 함수
 * 형식: LTM - Main Keyword: Description (Timestamp: Age, mm.dd) |Trigger Keyword1, Trigger Keyword2)|변수1|변수2
 */
function parseLTMFormat(text) {
    // 정규식으로 LTM 형식 추출
    const ltmRegex = /LTM\s*-\s*([^:]+):\s*([^(]+)\s*\(([^)]+)\)\s*\|([^|]+)\|\s*(\d+)\s*\|\s*(\d+)/g;
    const matches = [];
    let match;

    while ((match = ltmRegex.exec(text)) !== null) {
        const mainKeyword = match[1].trim();
        const description = match[2].trim();
        const timestamp = match[3].trim();
        const triggerKeywords = match[4].split(',').map(k => k.trim()).filter(k => k);
        const variable1 = parseInt(match[5]);
        const variable2 = parseInt(match[6]);

        matches.push({
            mainKeyword,
            description,
            timestamp,
            triggerKeywords,
            variable1,
            variable2,
            fullContent: `LTM - ${mainKeyword}: ${description} (${timestamp})`
        });
    }

    return matches;
}

/**
 * 월드인포에 LTM 항목 추가
 */
async function addLTMToWorldInfo(ltmData, worldInfoName) {
    try {
        // API를 통해 월드인포 파일 로드
        const response = await fetch('/api/worldinfo/get', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: worldInfoName }),
        });

        if (!response.ok) {
            toastr.error(`World Info file "${worldInfoName}" not found`);
            return false;
        }

        const data = await response.json();

        if (!data || !data.entries) {
            toastr.error(`World Info file "${worldInfoName}" has invalid format`);
            return false;
        }

        // 새 UID 생성
        const existingUIDs = Object.keys(data.entries).map(uid => parseInt(uid));
        const newUID = existingUIDs.length > 0 ? Math.max(...existingUIDs) + 1 : 0;

        // 키워드 설정: Main Keyword + Trigger Keywords
        const allKeywords = [ltmData.mainKeyword, ...ltmData.triggerKeywords];

        // 새 항목 생성
        const newEntry = {
            uid: newUID,
            key: allKeywords,
            keysecondary: [],
            comment: ltmData.mainKeyword,
            content: ltmData.fullContent,
            constant: (ltmData.variable1 === 1),
            selective: false,
            order: ltmData.variable2,
            position: 0,
            disable: false,
            addMemo: true,
            excludeRecursion: false,
            delayUntilRecursion: false,
            displayIndex: newUID,
            probability: 100,
            useProbability: false,
            depth: 4,
            selectiveLogic: 0,
            group: '',
            scanDepth: null,
            caseSensitive: false,
            matchWholeWords: false,
            useGroupScoring: false,
            automationId: '',
            role: 0,
            vectorized: false,
            sticky: null,
            cooldown: null,
            delay: null
        };

        // 항목 추가
        data.entries[newUID] = newEntry;

        // 월드인포 저장
        const saveResponse = await fetch('/api/worldinfo/edit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: worldInfoName, data: data }),
        });

        if (!saveResponse.ok) {
            toastr.error('Failed to save World Info');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error adding LTM to World Info:', error);
        toastr.error(`Failed to add LTM entry: ${error.message}`);
        return false;
    }
}

/**
 * /ltm 슬래시 커맨드 콜백
 */
async function ltmCommandCallback(args, value) {
    const context = getContext();
    const chat = context.chat;

    if (!chat || chat.length === 0) {
        toastr.warning('No messages in current chat');
        return '';
    }

    // 마지막 메시지 가져오기
    const lastMessage = chat[chat.length - 1];
    const messageText = lastMessage.mes || '';

    // LTM 형식 파싱
    const ltmEntries = parseLTMFormat(messageText);

    if (ltmEntries.length === 0) {
        toastr.warning('No LTM format found in the last message');
        return '';
    }

    // 연결된 월드인포 가져오기
    const character = context.characters[context.characterId];
    let targetWorldInfo = null;

    // 채팅 전용 월드인포 확인
    if (chat.world_info) {
        targetWorldInfo = chat.world_info;
    }
    // 캐릭터 월드인포 확인
    else if (character && character.data && character.data.character_book) {
        targetWorldInfo = character.data.character_book.name;
    }
    else {
        toastr.error('No World Info connected to this chat or character');
        return '';
    }

    // 각 LTM 항목을 월드인포에 추가
    let successCount = 0;
    for (const ltmEntry of ltmEntries) {
        const success = await addLTMToWorldInfo(ltmEntry, targetWorldInfo);
        if (success) {
            successCount++;
        }
    }

    if (successCount > 0) {
        toastr.success(`Added ${successCount} LTM entr${successCount > 1 ? 'ies' : 'y'} to World Info`);
    }

    return `Added ${successCount} entries`;
}

/**
 * 슬래시 커맨드 등록
 */
function registerSlashCommands() {
    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
        name: 'ltm',
        callback: ltmCommandCallback,
        returns: 'Number of entries added',
        helpString: `
            <div>
                Extracts LTM (Long Term Memory) entries from the last message and adds them to the connected World Info.
            </div>
            <div>
                <strong>Format:</strong>
                <code>LTM - Main Keyword: Description (Timestamp: Age, mm.dd) |Trigger Keyword1, Trigger Keyword2)|Variable1|Variable2</code>
            </div>
            <div>
                <strong>Variables:</strong>
                <ul>
                    <li>Variable1: 1 = constant true, 2 = constant false</li>
                    <li>Variable2: order number</li>
                </ul>
            </div>
            <div>
                <strong>Example:</strong>
                <pre><code>/ltm</code></pre>
            </div>
        `,
    }));

    console.log('LTM Extractor: Slash commands registered');
}

// 확장프로그램 초기화
jQuery(async () => {
    try {
        loadSettings();
        registerSlashCommands();
        console.log('LTM Extractor extension loaded successfully');
    } catch (error) {
        console.error('LTM Extractor failed to load:', error);
    }
});
