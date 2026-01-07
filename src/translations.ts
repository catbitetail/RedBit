
export type Language = 'en' | 'zh' | 'ja' | 'ko';

export const translations = {
  en: {
    app_name: "RedBit",
    powered_by: "Powered by Gemini 3.0 Pro",
    hero_title_1: "Mining the",
    hero_title_2: "Red Ocean",
    hero_desc: "\"Travels a thousand miles a day.\" RedBit (Chitu) extracts deep structured insights and audience profiles from Xiaohongshu comments at the speed of light.",

    // Input
    step_1: "Step 1",
    input_source: "Input Source",
    tab_text: "Paste Text / Image",
    tab_url: "Post URL",
    placeholder_text: "Paste comments here or upload screenshots...",
    placeholder_url: "Paste full XHS share text or URL (e.g., http://xhslink.com/...)",
    placeholder_cookie: "Paste your 'web_session' cookie here (Optional, for deep crawling)",
    upload_btn: "Upload Screenshot",
    clear_btn: "Clear",
    analyze_btn: "Start Mining",
    analyzing_btn: "Mining...",
    fetch_analyze_btn: "Fetch & Mine",
    fetching_btn: "Fetching...",
    ocr_loading: "Extracting text...",
    tip_url: "Tip: Supports xhslink.com short links.",
    cookie_label: "XHS Cookie (Optional)",
    cookie_note: "Providing a cookie allows for deeper data extraction if connected to a backend crawler.",

    // Errors
    err_url_not_indexed: "The AI could not find this post in search results (it might be new or not indexed). Please use the 'Paste Text/Image' tab instead.",
    err_generic: "Analysis failed. Please try again or check your input.",

    // Results
    report_title: "Analysis Report",

    // Class Rep
    class_rep_title: "Executive Summary",
    listen_btn: "Listen",
    playing_btn: "Playing...",
    controversies: "Controversies / Debates",
    no_controversies: "No major controversies.",
    info_gains: "Info Gains (Value Add)",
    no_info_gains: "No additional info detected.",
    god_replies: "\"God Replies\"",
    no_god_replies: "No witty replies found.",

    // Viewpoint Analysis
    viewpoint_title: "Comprehensive Viewpoint Analysis",
    viewpoint_desc: "All opinions categorized and ranked by insight value.",
    category_label: "Category",
    high_value: "High Value",

    // Sentiment
    radar_title: "Emotional Radar",
    sentiment_score: "Sentiment Score:",
    top_emotions: "Top Emotions",

    // Word Cloud
    keywords_title: "Key Keywords & Insights",
    size_indicates: "Size indicates frequency. Color indicates sentiment.",

    // Audience
    audience_profile: "Audience Profile",
    next_topics: "Next Topic Ideas",
    generate_draft_btn: "Draft",
    generating_btn: "Writing...",
    draft_modal_title: "Generated Content Draft",
    copy_draft: "Copy Draft",
    questions_needs: "Questions & Needs",
    no_questions: "No specific questions detected.",
    trends_alerts: "Trends & Alerts",
    meme_alert: "Meme / Slang Alert",
    none_detected: "None detected",
    competitor_weakness: "Competitor Weaknesses",

    // Smart Reply
    smart_reply_title: "Smart Reply Agent",
    smart_reply_desc: "Stuck on a comment? Paste it here to get tailored reply suggestions.",
    placeholder_reply: "e.g., Is this dress worth the price?",
    copy: "Copy",

    // Archives & Tools
    history_btn: "Archives",
    save_btn: "Save Local",
    export_btn: "Export JSON",
    export_pdf: "Export PDF",
    saved_success: "Saved!",
    load_archive_title: "Saved Reports",
    no_archives: "No saved reports yet.",
    delete: "Delete",
    backup_restore: "Backup & Restore",
    export_all: "Export All",
    import_json: "Import JSON",
    import_success: "Successfully imported reports!",
    import_error: "Invalid JSON file.",

    // Chat & Notes
    tools_panel: "RedBit Assistant & Notes",
    tab_chat: "Q&A",
    tab_notes: "Notes",
    chat_placeholder: "Ask about this analysis...",
    notes_placeholder: "Write your observations here...",
    chat_welcome: "I have read the analysis. What would you like to know?",
    send: "Send",
  },
  zh: {
    app_name: "赤兔 RedBit",
    powered_by: "基于 Gemini 3.0 Pro",
    hero_title_1: "日行千里 深挖",
    hero_title_2: "红海",
    hero_desc: "赤兔 —— 你的 AI 数据挖掘神驹<br />从海量小红书评论中极速提炼用户痛点、市场机会与情绪洞察",

    // Input
    step_1: "第一步",
    input_source: "输入来源",
    tab_text: "粘贴图文",
    tab_url: "帖子链接",
    placeholder_text: "在此粘贴评论或上传截图...",
    placeholder_url: "粘贴小红书分享口令或链接 (如 http://xhslink.com/...)",
    placeholder_cookie: "在此粘贴 'web_session' Cookie (可选，用于深度抓取)",
    upload_btn: "上传截图",
    clear_btn: "清空",
    analyze_btn: "开始挖掘",
    analyzing_btn: "挖掘中...",
    fetch_analyze_btn: "抓取并挖掘",
    fetching_btn: "抓取中...",
    ocr_loading: "提取文字中...",
    tip_url: "提示: 支持 xhslink.com 短链接。",
    cookie_label: "小红书 Cookie (可选)",
    cookie_note: "Cookie 仅为预留字段。纯前端模式下无法直接使用 Cookie 抓取，需配合后端服务。若链接抓取失败，请使用截图功能。",

    // Errors
    err_url_not_indexed: "AI 在搜索引擎中未找到该笔记内容（可能是新笔记或未被收录）。建议复制评论文本或使用“截图上传”功能，效果更佳。",
    err_generic: "挖掘失败，请重试或检查输入。",

    // Results
    report_title: "赤兔分析报告",

    // Class Rep
    class_rep_title: "“课代表”总结",
    listen_btn: "收听",
    playing_btn: "播放中...",
    controversies: "争议 / 辩论焦点",
    no_controversies: "无主要争议。",
    info_gains: "信息增量 (干货)",
    no_info_gains: "无额外信息补充。",
    god_replies: "神评论",
    no_god_replies: "未发现神回复。",

    // Viewpoint Analysis
    viewpoint_title: "全观点信息流",
    viewpoint_desc: "整理所有评论观点，按主题聚类，并按“信息价值”排序。",
    category_label: "观点主题",
    high_value: "高价值",

    // Sentiment
    radar_title: "情绪雷达",
    sentiment_score: "情感指数:",
    top_emotions: "高频情绪",

    // Word Cloud
    keywords_title: "核心关键词 & 洞察",
    size_indicates: "字体大小代表频率，颜色代表情感倾向。",

    // Audience
    audience_profile: "人群画像侧写",
    next_topics: "潜在选题建议 (点击生成)",
    generate_draft_btn: "生成笔记",
    generating_btn: "写作中...",
    draft_modal_title: "赤兔 AI 生成笔记草稿",
    copy_draft: "复制草稿",
    questions_needs: "提问 & 需求",
    no_questions: "未检测到具体问题。",
    trends_alerts: "趋势 & 预警",
    meme_alert: "梗 / 流行语预警",
    none_detected: "未检测到",
    competitor_weakness: "竞品槽点 / 弱点",

    // Smart Reply
    smart_reply_title: "智能回复助手",
    smart_reply_desc: "不知道怎么回？粘贴评论，AI 帮你高情商回复。",
    placeholder_reply: "例如：这件衣服值这个价吗？",
    copy: "复制",

    // Archives & Tools
    history_btn: "历史存档",
    save_btn: "暂存浏览器",
    export_btn: "本地备份",
    export_pdf: "导出 PDF",
    saved_success: "已暂存!",
    load_archive_title: "已保存的报告",
    no_archives: "暂无存档。",
    delete: "删除",
    backup_restore: "备份与恢复",
    export_all: "导出全部",
    import_json: "导入备份",
    import_success: "成功导入备份!",
    import_error: "文件格式错误。",

    // Chat & Notes
    tools_panel: "赤兔助手 & 笔记",
    tab_chat: "提问 Q&A",
    tab_notes: "随手记",
    chat_placeholder: "针对当前分析结果提问...",
    notes_placeholder: "在此记录你的想法...",
    chat_welcome: "我是赤兔助手。我已阅读当前分析报告，有什么可以帮你的吗？",
    send: "发送",
  },
  ja: {
    app_name: "RedBit 赤兎",
    powered_by: "Gemini 3.0 Pro 搭載",
    hero_title_1: "千里を",
    hero_title_2: "駆け抜ける",
    hero_desc: "RedBit (赤兎) - 高度なAIを使用して、Xiaohongshu（小紅書）のコメントから構造化されたインサイトを光速で抽出します。",

    // Input
    step_1: "ステップ 1",
    input_source: "入力ソース",
    tab_text: "テキスト / 画像",
    tab_url: "投稿 URL",
    placeholder_text: "コメントを貼り付けるか、スクリーンショットをアップロード...",
    placeholder_url: "XHSの共有テキストまたはURLを貼り付け (例: http://xhslink.com/...)",
    placeholder_cookie: "'web_session' Cookieを貼り付け (任意、詳細クロール用)",
    upload_btn: "スクショをアップロード",
    clear_btn: "クリア",
    analyze_btn: "分析開始",
    analyzing_btn: "分析中...",
    fetch_analyze_btn: "取得して分析",
    fetching_btn: "取得中...",
    ocr_loading: "テキスト抽出中...",
    tip_url: "ヒント: xhslink.com 短縮リンクに対応しています。",
    cookie_label: "XHS Cookie (任意)",
    cookie_note: "Cookieを提供すると、バックエンドクローラーでの詳細なデータ抽出が可能になります。",

    // Errors
    err_url_not_indexed: "検索エンジンでこの投稿が見つかりませんでした。代わりにテキスト貼り付けまたはスクリーンショットを使用してください。",
    err_generic: "分析に失敗しました。もう一度お試しください。",

    // Results
    report_title: "分析レポート",

    // Class Rep
    class_rep_title: "「学級委員」まとめ",
    listen_btn: "聞く",
    playing_btn: "再生中...",
    controversies: "論争 / 議論",
    no_controversies: "主要な論争はありません。",
    info_gains: "有益情報 (補足)",
    no_info_gains: "追加情報はありません。",
    god_replies: "神コメント",
    no_god_replies: "機知に富んだ返信は見つかりませんでした。",

    // Viewpoint Analysis
    viewpoint_title: "全観点分析",
    viewpoint_desc: "すべての意見をカテゴリ分けし、洞察の価値順にランク付けしました。",
    category_label: "カテゴリ",
    high_value: "高価値",

    // Sentiment
    radar_title: "感情レーダー",
    sentiment_score: "感情スコア:",
    top_emotions: "主な感情",

    // Word Cloud
    keywords_title: "キーワード & インサイト",
    size_indicates: "サイズは頻度、色は感情を示します。",

    // Audience
    audience_profile: "オーディエンス分析",
    next_topics: "次回のトピック提案",
    generate_draft_btn: "下書き作成",
    generating_btn: "執筆中...",
    draft_modal_title: "生成された記事ドラフト",
    copy_draft: "コピー",
    questions_needs: "質問 & ニーズ",
    no_questions: "具体的な質問は検出されませんでした。",
    trends_alerts: "トレンド & アラート",
    meme_alert: "ミーム / スラング警告",
    none_detected: "検出なし",
    competitor_weakness: "競合の弱点",

    // Smart Reply
    smart_reply_title: "スマート返信エージェント",
    smart_reply_desc: "返信にお困りですか？ここに貼り付けて提案を受け取りましょう。",
    placeholder_reply: "例: このドレスは価格に見合っていますか？",
    copy: "コピー",

    // Archives & Tools
    history_btn: "アーカイブ",
    save_btn: "一時保存",
    export_btn: "エクスポート",
    export_pdf: "PDF エクスポート",
    saved_success: "保存しました!",
    load_archive_title: "保存されたレポート",
    no_archives: "アーカイブはありません。",
    delete: "削除",
    backup_restore: "バックアップと復元",
    export_all: "すべてエクスポート",
    import_json: "インポート",
    import_success: "正常にインポートされました!",
    import_error: "ファイル形式が無効です。",

    // Chat & Notes
    tools_panel: "AIアシスタント & メモ",
    tab_chat: "Q&A",
    tab_notes: "メモ",
    chat_placeholder: "この分析について質問...",
    notes_placeholder: "ここに考えを書き留めてください...",
    chat_welcome: "分析結果を読み込みました。何か質問はありますか？",
    send: "送信",
  },
  ko: {
    app_name: "RedBit 적토마",
    powered_by: "Gemini 3.0 Pro 기반",
    hero_title_1: "천리를",
    hero_title_2: "달리는",
    hero_desc: "RedBit (적토마) - 샤오홍슈(Xiaohongshu) 댓글에서 구조화된 인사이트를 빛의 속도로 추출합니다.",

    // Input
    step_1: "1단계",
    input_source: "입력 소스",
    tab_text: "텍스트 / 이미지",
    tab_url: "게시물 URL",
    placeholder_text: "댓글을 붙여넣거나 스크린샷을 업로드하세요...",
    placeholder_url: "XHS 공유 텍스트 또는 URL 붙여넣기 (예: http://xhslink.com/...)",
    placeholder_cookie: "'web_session' 쿠키 붙여넣기 (선택 사항, 정밀 크롤링용)",
    upload_btn: "스크린샷 업로드",
    clear_btn: "지우기",
    analyze_btn: "채굴 시작",
    analyzing_btn: "분석 중...",
    fetch_analyze_btn: "가져오기 및 분석",
    fetching_btn: "가져오는 중...",
    ocr_loading: "텍스트 추출 중...",
    tip_url: "팁: xhslink.com 단축 링크를 지원합니다.",
    cookie_label: "XHS 쿠키 (선택 사항)",
    cookie_note: "쿠키를 제공하면 백엔드 크롤러와 연결하여 더 깊이 있는 데이터를 추출할 수 있습니다.",

    // Errors
    err_url_not_indexed: "검색 엔진에서 이 게시물을 찾을 수 없습니다. 대신 텍스트를 붙여넣거나 스크린샷을 업로드해 보세요.",
    err_generic: "분석 실패. 다시 시도해 주세요.",

    // Results
    report_title: "분석 보고서",

    // Class Rep
    class_rep_title: "요약 리포트",
    listen_btn: "듣기",
    playing_btn: "재생 중...",
    controversies: "논쟁 / 토론",
    no_controversies: "주요 논쟁 없음.",
    info_gains: "유용한 정보 (추가)",
    no_info_gains: "추가 정보가 감지되지 않았습니다.",
    god_replies: "베스트 댓글",
    no_god_replies: "재치 있는 답글을 찾을 수 없습니다.",

    // Viewpoint Analysis
    viewpoint_title: "전체 관점 분석",
    viewpoint_desc: "모든 의견을 분류하고 통찰력 가치에 따라 순위를 매깁니다.",
    category_label: "카테고리",
    high_value: "높은 가치",

    // Sentiment
    radar_title: "감정 레이더",
    sentiment_score: "감정 점수:",
    top_emotions: "주요 감정",

    // Word Cloud
    keywords_title: "핵심 키워드 & 인사이트",
    size_indicates: "크기는 빈도를, 색상은 감정을 나타냅니다.",

    // Audience
    audience_profile: "잠재고객 프로필",
    next_topics: "다음 주제 제안",
    generate_draft_btn: "초안 생성",
    generating_btn: "작성 중...",
    draft_modal_title: "생성된 콘텐츠 초안",
    copy_draft: "초안 복사",
    questions_needs: "질문 & 니즈",
    no_questions: "구체적인 질문이 감지되지 않았습니다.",
    trends_alerts: "트렌드 & 알림",
    meme_alert: "밈 / 유행어 알림",
    none_detected: "감지되지 않음",
    competitor_weakness: "경쟁사 약점",

    // Smart Reply
    smart_reply_title: "스마트 답장 에이전트",
    smart_reply_desc: "답장하기 곤란한가요? 여기에 붙여넣어 맞춤형 제안을 받아보세요.",
    placeholder_reply: "예: 이 옷이 가격 값을 하나요?",
    copy: "복사",

    // Archives & Tools
    history_btn: "아카이브",
    save_btn: "임시 저장",
    export_btn: "내보내기",
    export_pdf: "PDF 내보내기",
    saved_success: "저장됨!",
    load_archive_title: "저장된 보고서",
    no_archives: "저장된 보고서가 없습니다.",
    delete: "삭제",
    backup_restore: "백업 및 복원",
    export_all: "모두 내보내기",
    import_json: "JSON 가져오기",
    import_success: "성공적으로 가져왔습니다!",
    import_error: "잘못된 파일 형식입니다.",

    // Chat & Notes
    tools_panel: "AI 어시스턴트 & 노트",
    tab_chat: "Q&A",
    tab_notes: "노트",
    chat_placeholder: "분석 내용에 대해 질문하세요...",
    notes_placeholder: "여기에 생각을 기록하세요...",
    chat_welcome: "분석 보고서를 확인했습니다. 궁금한 점이 있으신가요?",
    send: "전송",
  }
};
