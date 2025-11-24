# SillyTavern LTM Extractor

SillyTavern용 LTM(Long Term Memory) 자동 추출 확장프로그램입니다.

## 기능

마지막 메시지에서 특정 형식의 LTM 데이터를 추출하여 연결된 월드인포(World Info)에 자동으로 항목을 추가합니다.

## 사용법

1. 채팅에서 다음 형식으로 LTM 데이터를 작성합니다:
```
LTM - Main Keyword: Description (2-3 lines, emotions, details) (Timestamp: Age, mm.dd) |Trigger Keyword1, Trigger Keyword2)|변수1|변수2
```

2. 슬래시 커맨드 `/ltm`을 실행합니다.

3. 자동으로 월드인포에 다음과 같이 추가됩니다:
   - **Keys**: Main Keyword, Trigger Keyword1, Trigger Keyword2
   - **Comment**: Main Keyword
   - **Content**: LTM - Main Keyword: Description (Timestamp: Age, mm.dd)
   - **Constant**: 변수1이 1이면 true, 2이면 false
   - **Order**: 변수2의 값

## 예시

```
LTM - Shadowfang: 왕의 전설적인 검, 어둠을 베는 힘을 가짐 (Timestamp: Ancient, 05.12) |legendary sword, king's weapon)|1|100
```

위 텍스트가 포함된 메시지에서 `/ltm` 명령어를 실행하면:
- Keys: Shadowfang, legendary sword, king's weapon
- Comment: Shadowfang
- Content: LTM - Shadowfang: 왕의 전설적인 검, 어둠을 베는 힘을 가짐 (Timestamp: Ancient, 05.12)
- Constant: true (변수1 = 1)
- Order: 100 (변수2 = 100)

## 설치 방법

1. 이 저장소를 `SillyTavern/public/scripts/extensions/third-party/` 폴더에 클론하거나 다운로드합니다.
2. SillyTavern을 재시작합니다.
3. Extensions 메뉴에서 "LTM Extractor"를 활성화합니다.

## 요구사항

- SillyTavern 최신 버전
- 캐릭터 또는 채팅에 연결된 World Info

## 라이선스

MIT License