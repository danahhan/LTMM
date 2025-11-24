import { eventSource, event_types, saveSettingsDebounced } from '../../../script.js';
import { extension_settings, getContext } from '../../extensions.js';
import { SlashCommandParser } from '../../slash-commands/SlashCommandParser.js';
import { SlashCommand } from '../../slash-commands/SlashCommand.js';
import { ARGUMENT_TYPE, SlashCommandArgument } from '../../slash-commands/SlashCommandArgument.js';
import { loadWorldInfo, saveWorldInfo, createWorldInfoEntry } from '../../world-info.js';

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
        // 월드인포 파일 로드
        const data = await loadWorldInfo(worldInfoName);

        if (!data || !('entries' in data)) {
            toastr.error(`World Info file "${worldInfoName}" not found or invalid`);
            return false;
        }

        // 새 항목 생성
        const entry = createWorldInfoEntry(worldInfoName, data);

        // 키워드 설정: Main Keyword + Trigger Keywords
        const allKeywords = [ltmData.mainKeyword, ...ltmData.triggerKeywords];
        entry.key = allKeywords;

        // Comment에 Main Keyword 설정
        entry.comment = ltmData.mainKeyword;

        // Content 설정
        entry.content = ltmData.fullContent;

        // Constant 설정 (변수1: 1=true, 2=false)
        entry.constant = (ltmData.variable1 === 1);

        // Order 설정 (변수2)
        entry.order = ltmData.variable2;

        // 기본 설정
        entry.enabled = true;
        entry.addMemo = true;

        // 월드인포 저장
        await saveWorldInfo(worldInfoName, data);

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
    const characterWorldInfo = context.world_info;
    const chatWorldInfo = chat.world_info;

    let targetWorldInfo = null;

    // 채팅 전용 월드인포 확인
    if (chatWorldInfo) {
        targetWorldInfo = chatWorldInfo;
    }
    // 캐릭터 월드인포 확인
    else if (characterWorldInfo) {
        targetWorldInfo = characterWorldInfo;
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
    loadSettings();
    registerSlashCommands();
    console.log('LTM Extractor extension loaded');
});