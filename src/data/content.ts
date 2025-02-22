export interface Vocabulary {
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  translation: string;
}

export interface KeyPhrase {
  phrase: string;
  meaning: string;
  category: 'expression' | 'technique' | 'conjunction' | 'response';
  example?: string;
  translation?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  translation?: string;
  likes: number;
  createdAt: string;
  replies?: Comment[];
}

export interface Post {
  id: string;
  title: string;
  content: string;
  level: string;
  topic: string;
  createdAt: string;
  vocabularies: Vocabulary[];
  keyPhrases: KeyPhrase[];
  learningPoints?: string[];
  comments: Comment[];
  likes: number;
  favorites: number;
}

export const posts: Post[] = [
  {
    id: '1',
    title: '选择餐厅的友好争论',
    content: `Sarah: How about Italian food? I know a great pasta place nearby!
Tom: Actually, I was thinking Asian cuisine. There's this amazing new Thai restaurant.
Sarah: But we had Thai last week! And this Italian place has the best tiramisu in town.
Tom: Well, the Thai place also serves incredible desserts. Plus, it's less crowded.
Sarah: Hmm, you make a good point about the crowd... Tell you what, let's try your Thai place today, but next time we're definitely going Italian!
Tom: Deal! I promise you'll love their mango sticky rice!`,
    level: 'B1',
    topic: '日常生活',
    createdAt: '2024-02-22T10:00:00Z',
    vocabularies: [
      {
        word: 'cuisine',
        phonetic: '/kwɪˈziːn/',
        meaning: '烹饪风格；菜系',
        example: 'I was thinking Asian cuisine.',
        translation: '我在想吃亚洲菜。'
      },
      {
        word: 'incredible',
        phonetic: '/ɪnˈkredəbl/',
        meaning: '难以置信的；极好的',
        example: 'The Thai place serves incredible desserts.',
        translation: '这家泰国餐厅供应美味的甜点。'
      },
      {
        word: 'crowded',
        phonetic: '/ˈkraʊdɪd/',
        meaning: '拥挤的；挤满人的',
        example: 'Plus, it\'s less crowded.',
        translation: '而且，人也比较少。'
      },
      {
        word: 'definitely',
        phonetic: '/ˈdefɪnətli/',
        meaning: '肯定地；确定地',
        example: 'Next time we\'re definitely going Italian!',
        translation: '下次我们一定要去吃意大利菜！'
      }
    ],
    keyPhrases: [
      {
        phrase: 'How about...?',
        meaning: '用于提出建议',
        category: 'expression',
        example: 'How about Italian food?',
        translation: '意大利菜怎么样？'
      },
      {
        phrase: 'Actually, I was thinking...',
        meaning: '委婉表达不同意见',
        category: 'expression',
        example: 'Actually, I was thinking Asian cuisine.',
        translation: '实际上，我在想吃亚洲菜。'
      },
      {
        phrase: 'you make a good point',
        meaning: '认可对方观点',
        category: 'response',
        example: 'You make a good point about the crowd.',
        translation: '你说得对，关于人多的问题。'
      },
      {
        phrase: 'Tell you what...',
        meaning: '提出折中方案',
        category: 'expression',
        example: 'Tell you what, let\'s try your Thai place today.',
        translation: '这样吧，我们今天去你说的泰国餐厅。'
      },
      {
        phrase: 'Well,',
        meaning: '用于开始回应，表示稍作考虑',
        category: 'response',
        example: 'Well, the Thai place also serves incredible desserts.',
        translation: '嗯，那家泰国餐厅也有很棒的甜点。'
      },
      {
        phrase: 'But',
        meaning: '表示转折',
        category: 'conjunction',
        example: 'But we had Thai last week!',
        translation: '但是我们上周才吃过泰国菜！'
      },
      {
        phrase: 'Plus',
        meaning: '表示补充',
        category: 'conjunction',
        example: 'Plus, it\'s less crowded.',
        translation: '而且，人也比较少。'
      }
    ],
    learningPoints: [
      '在表达不同意见时，使用 "Actually..." 来委婉开场',
      '用 "you make a good point" 来肯定对方的观点，建立积极对话氛围',
      '使用 "Tell you what..." 来提出折中方案，展示灵活性',
      '通过 "Plus" 补充论据，加强说服力'
    ],
    comments: [
      {
        id: 'c1',
        userId: 'u1',
        userName: 'Emma Chen',
        userAvatar: '👩🏻‍💼',
        content: "This dialogue is so relatable! I always struggle with restaurant choices with my friends. The phrase 'you make a good point' is really useful - I've started using it in my daily conversations and it helps keep things positive!",
        translation: "这段对话太真实了！我和朋友选餐厅时总是很纠结。'you make a good point'这个短语很实用 - 我已经开始在日常对话中使用它了，这真的有助于保持对话积极的氛围！",
        likes: 45,
        createdAt: '2024-02-23T14:30:00Z'
      },
      {
        id: 'c2',
        userId: 'u2',
        userName: 'Michael Zhang',
        userAvatar: '👨🏻‍💻',
        content: "The compromise strategy here is brilliant! Instead of just arguing, they found a win-win solution. I've learned that 'Tell you what...' is such a smooth way to suggest alternatives.",
        translation: "这里的妥协策略很棒！与其一直争论，他们找到了双赢的解决方案。我学到了 'Tell you what...' 是个提出替代方案的很好的表达。",
        likes: 38,
        createdAt: '2024-02-23T15:45:00Z'
      },
      {
        id: 'c3',
        userId: 'u3',
        userName: 'Sarah Wang',
        userAvatar: '👩🏻‍🎓',
        content: "Love how they use 'Actually...' to disagree politely! Been practicing this in my workplace and it really helps avoid conflicts. Also, the Thai mango sticky rice sounds amazing 😋",
        translation: "很喜欢他们用'Actually...'来委婉地表达不同意见！我在工作中一直在练习这个，确实有助于避免冲突。另外，泰国芒果糯米饭听起来太诱人了😋",
        likes: 27,
        createdAt: '2024-02-23T16:20:00Z'
      }
    ],
    likes: 128,
    favorites: 45
  },
  {
    id: '2',
    title: '远程工作vs办公室工作的讨论',
    content: `Manager: I think it's time for everyone to return to the office. Face-to-face collaboration is invaluable.
Employee: I understand your point, but I've actually been more productive working from home.
Manager: That's interesting. What makes you more productive at home?
Employee: Less distractions, no commute time, and I can focus better. Though I do miss some aspects of office life.
Manager: How about we try a hybrid model? Three days in office, two days remote?
Employee: That sounds like a great compromise! We get the best of both worlds.`,
    level: 'B2',
    topic: '职场',
    createdAt: '2024-02-22T11:00:00Z',
    vocabularies: [
      {
        word: 'invaluable',
        phonetic: '/ɪnˈvæljuəbl/',
        meaning: '非常宝贵的，无价的',
        example: 'Face-to-face collaboration is invaluable.',
        translation: '面对面的协作是非常宝贵的。'
      },
      {
        word: 'productive',
        phonetic: '/prəˈdʌktɪv/',
        meaning: '高效的；富有成效的',
        example: 'I\'ve actually been more productive working from home.',
        translation: '实际上我在家工作效率更高。'
      },
      {
        word: 'hybrid',
        phonetic: '/ˈhaɪbrɪd/',
        meaning: '混合的；混合模式',
        example: 'How about we try a hybrid model?',
        translation: '我们试试混合模式怎么样？'
      },
      {
        word: 'compromise',
        phonetic: '/ˈkɒmprəmaɪz/',
        meaning: '妥协；折中方案',
        example: 'That sounds like a great compromise!',
        translation: '这听起来是个很好的折中方案！'
      },
      {
        word: 'commute',
        phonetic: '/kəˈmjuːt/',
        meaning: '通勤；上下班往返',
        example: 'No commute time.',
        translation: '没有通勤时间。'
      }
    ],
    keyPhrases: [
      {
        phrase: 'I understand your point, but...',
        meaning: '表示理解但有不同意见',
        category: 'response',
        example: 'I understand your point, but I\'ve actually been more productive working from home.',
        translation: '我理解你的观点，但实际上我在家工作效率更高。'
      },
      {
        phrase: 'That\'s interesting.',
        meaning: '表示感兴趣并愿意继续讨论',
        category: 'response',
        example: 'That\'s interesting. What makes you more productive at home?',
        translation: '这很有意思。是什么让你在家工作效率更高？'
      },
      {
        phrase: 'Though',
        meaning: '表示让步',
        category: 'conjunction',
        example: 'Though I do miss some aspects of office life.',
        translation: '虽然我确实想念办公室生活的某些方面。'
      },
      {
        phrase: 'the best of both worlds',
        meaning: '两全其美',
        category: 'expression',
        example: 'We get the best of both worlds.',
        translation: '我们能够两全其美。'
      }
    ],
    learningPoints: [
      '使用 "I understand your point, but..." 来表达不同意见时既表示理解又不失立场',
      '通过 "That\'s interesting" 保持对话开放性，鼓励对方详细说明',
      '运用 "Though" 来承认对立面，使论述更加全面',
      '用具体例子（distractions, commute time）支持论点'
    ],
    comments: [
      {
        id: 'c4',
        userId: 'u4',
        userName: 'David Liu',
        userAvatar: '👨🏻‍🚀',
        content: "This hybrid work discussion hits home! The phrase 'I understand your point, but...' is perfect for professional disagreements. I used it in my last meeting with my boss about flexible working hours.",
        translation: "这个混合办公的讨论太贴切了！'I understand your point, but...'这个短语很适合在工作中表达不同意见。我在上次和老板讨论弹性工作制时就用了这个。",
        likes: 56,
        createdAt: '2024-02-23T17:00:00Z'
      },
      {
        id: 'c5',
        userId: 'u5',
        userName: 'Linda Wu',
        userAvatar: '👩🏻‍🏫',
        content: "The expression 'the best of both worlds' is such a positive way to look at compromise! Also, the vocabulary here is super relevant for modern workplace discussions.",
        translation: "'the best of both worlds'这个表达真的是看待妥协的很好方式！而且这里的词汇对现代职场对话都特别实用。",
        likes: 42,
        createdAt: '2024-02-23T18:15:00Z'
      },
      {
        id: 'c6',
        userId: 'u6',
        userName: 'Tom Yang',
        userAvatar: '👨🏻‍💼',
        content: "Great example of constructive workplace dialogue! The manager's response 'That's interesting' shows genuine curiosity instead of dismissal. Really helpful for my management style!",
        translation: "这是建设性职场对话的好例子！经理的回应'That's interesting'展现了真诚的好奇而不是否定。对我的管理风格很有帮助！",
        likes: 33,
        createdAt: '2024-02-23T19:30:00Z'
      }
    ],
    likes: 89,
    favorites: 37
  }
]; 