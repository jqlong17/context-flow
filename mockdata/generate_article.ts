import * as fs from 'fs';
import * as path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

// 创建 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// API配置
class APIConfig {
  static readonly baseURL = process.env.ZHIPU_API_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  static readonly apiKey = process.env.ZHIPU_API_KEY;
  static readonly model = 'glm-4-flash';

  // 默认配置参数
  static readonly defaults = {
    temperature: 0.95,
    topP: 0.7,
    maxTokens: 4095,
    stream: false
  };

  // 请求头
  static get headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  // 创建请求体
  static createRequestBody(
    messages: Array<{ role: string; content: string }>,
    config: Partial<typeof APIConfig.defaults> = {}
  ) {
    return {
      model: this.model,
      messages,
      temperature: this.defaults.temperature,
      top_p: this.defaults.topP,
      max_tokens: this.defaults.maxTokens,
      stream: this.defaults.stream,
      ...config
    };
  }

  // 创建请求
  static async makeRequest(messages: Array<{ role: string; content: string }>, customConfig?: any) {
    const maxRetries = 3;
    let retryCount = 0;
    let lastError: any = null;

    while (retryCount < maxRetries) {
      try {
        console.log(`\n[API请求] 第 ${retryCount + 1} 次尝试`);
        console.log('[API请求] 时间:', new Date().toISOString());
        console.log('[API请求] 请求体大小:', JSON.stringify(messages).length, '字节');
        console.log('[API请求] 发送请求到:', this.baseURL);
        
        const defaultBody = this.createRequestBody(messages);
        const requestBody = customConfig ? { ...defaultBody, ...customConfig } : defaultBody;

        const startTime = Date.now();
        const response = await axios.post(
          this.baseURL,
          requestBody,
          { 
            headers: this.headers,
            timeout: 120000, // 增加到120秒
            maxBodyLength: Infinity,
            maxContentLength: Infinity
          }
        );
        const endTime = Date.now();
        
        console.log('[API请求] 请求耗时:', (endTime - startTime) / 1000, '秒');
        console.log('[API请求] 响应状态:', response.status);
        console.log('[API请求] 响应头:', JSON.stringify(response.headers, null, 2));
        console.log('[API请求] 响应大小:', JSON.stringify(response.data).length, '字节');

        if (!response.data?.choices?.[0]?.message?.content) {
          console.error('[API请求] 响应格式错误:', JSON.stringify(response.data, null, 2));
          throw new Error('API响应格式不正确');
        }

        const content = response.data.choices[0].message.content;
        console.log('[API请求] 响应内容长度:', content.length);
        console.log('[API请求] 响应内容前100个字符:', content.substring(0, 100));

        return content;
      } catch (error: any) {
        lastError = error;
        retryCount++;
        
        console.error(`[API请求] 失败 (尝试 ${retryCount}/${maxRetries}):`, {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText,
          headers: error.response?.headers,
          data: error.response?.data,
          stack: error.stack
        });

        if (retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 2000; // 增加基础延迟
          console.log(`[API请求] 等待 ${delay/1000} 秒后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error('[API请求] 最终失败，已达到最大重试次数');
    throw lastError;
  }
}

// 定义数据类型
interface Vocabulary {
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  translation: string;
}

interface KeyPhrase {
  phrase: string;
  meaning: string;
  category: string;
  example: string;
  translation: string;
}

// 定义用户类型
interface User {
  user_id: string;
  name: string;
  avatar: string;
  style_description: string;
  gender: string;
  background_story: string;
  tags: string[];
  level: string;
}

// 定义文章类型
interface DialogueContent {
  speaker: string;
  text: string;
}

interface Article {
  title: string;
  content: DialogueContent[];
  level: string;
  tags: string[];
  created_at: string;
  vocabularies: Vocabulary[];
  key_phrases: KeyPhrase[];
  learning_points: string[];
  user_id: string;
  user: User;
  scene: GeneratedScene;
}

// 定义场景类型
interface GeneratedScene {
  user_id: string;
  user_name: string;
  user_background: string;
  user_level: string;
  category: string;
  location: string;
  situation: string;
  participants: string[];
  objectives: string[];
  topics: string[];
  professional_terms: string[];
  created_at: string;
  time_of_day: string;
  weather: string;
  season: string;
  mood: string;
}

// 话题列表
const TAGS = [
  '日常生活', '职场', '学习', '旅游', '购物', 
  '美食', '娱乐', '社交', '健康', '科技'
];

// 难度等级
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];

// 短语分类
const PHRASE_CATEGORIES = [
  'expression', 'response', 'technique', 'conjunction'
];

// 清理API响应中的JSON
function cleanJsonResponse(response: string): string {
  let cleaned = '';
  try {
    // 移除可能的markdown标记
    cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // 移除开头和结尾的空白字符
    cleaned = cleaned.trim();
    
    // 处理音标格式问题
    cleaned = cleaned.replace(/: \/([^/]+)\//g, ': "/$1/"');
    
    // 处理换行符，确保使用标准格式
    cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // 处理字符串中的控制字符
    cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, (char) => {
      if (char === '\n') return '\\n';  // 保留换行符
      if (char === '\t') return '\\t';  // 保留制表符
      return '';  // 移除其他控制字符
    });

    // 处理引号问题
    cleaned = cleaned.replace(/(?<!\\)"/g, '\\"');  // 转义未转义的双引号
    cleaned = cleaned.replace(/\\{2,}"/g, '\\"');   // 修复多重转义
    cleaned = cleaned.replace(/^{/, '{"');          // 添加开头的引号
    cleaned = cleaned.replace(/}$/, '"}');          // 添加结尾的引号
    cleaned = cleaned.replace(/"\s*:\s*"([^"]+)"/g, '"$1"'); // 修复属性名称

    // 尝试解析和重新生成JSON字符串
    const jsonObj = JSON.parse(cleaned);
    return JSON.stringify(jsonObj);
  } catch (error) {
    console.error('JSON清理失败:', error);
    console.error('原始响应:', response);
    console.error('清理后的内容:', cleaned);
    
    // 尝试进一步清理
    try {
      // 移除所有换行符和多余的空格
      cleaned = cleaned.replace(/\n/g, ' ').replace(/\s+/g, ' ');
      // 确保所有属性名和字符串值都使用双引号
      cleaned = cleaned.replace(/(\w+):/g, '"$1":');
      cleaned = cleaned.replace(/:\s*'([^']+)'/g, ':"$1"');
      const jsonObj = JSON.parse(cleaned);
      return JSON.stringify(jsonObj);
    } catch (retryError) {
      console.error('二次清理失败:', retryError);
      throw error; // 抛出原始错误
    }
  }
}

// 修改生成文章内容的提示词
function generatePrompt(tags: string[], level: string, user: User) {
  return `请基于以下用户背景创建一个英语学习场景对话。请严格遵循JSON格式。

用户背景信息：
{
  "基本信息": {
    "性别": "${user.gender}",
    "英语水平": "${level}",
    "兴趣标签": ${JSON.stringify(user.tags)},
    "个人故事": "${user.background_story}"
  }
}

请创建一个完整的学习场景，返回格式如下：
{
  "title": "标题（中文，15-25字，带1-2个表情符号）",
  "content": [
    {
      "speaker": "说话人名字",
      "text": "说话内容"
    }
  ],
  "vocabularies": [
    {
      "word": "单词",
      "phonetic": "音标",
      "meaning": "中文含义",
      "example": "例句（来自对话）",
      "translation": "例句翻译"
    }
  ],
  "key_phrases": [
    {
      "phrase": "短语",
      "meaning": "含义",
      "category": "分类",
      "example": "例句（来自对话）",
      "translation": "例句翻译"
    }
  ],
  "learning_points": [
    "学习要点1",
    "学习要点2",
    "学习要点3"
  ]
}

注意事项：
1. content数组中的每个对象必须包含speaker和text两个字段
2. 对话必须自然流畅，符合用户的实际使用场景
3. 严格遵循JSON格式规范
4. 确保所有字段完整填写，不得缺失`;
}

// 获取随机作者
async function getRandomUser(): Promise<User> {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('user_id, name, avatar, style_description, gender, background_story, tags')
      .limit(10);

    if (error) {
      throw error;
    }

    if (!users || users.length === 0) {
      throw new Error('没有找到可用的作者');
    }

    // 随机选择一个用户
    const randomUser = users[Math.floor(Math.random() * users.length)];
    
    // 根据背景故事设置默认的 level
    const story = randomUser.background_story.toLowerCase();
    let level = 'A2';
    
    if (story.includes('留学') || story.includes('海外') || story.includes('国外工作')) {
      level = 'C1';
    } else if (story.includes('英语专业') || story.includes('外企') || story.includes('跨国公司')) {
      level = 'B2';
    } else if (story.includes('大学') || story.includes('本科') || story.includes('研究生')) {
      level = 'B1';
    }

    return {
      ...randomUser,
      level
    };
  } catch (error) {
    console.error('获取随机作者失败:', error);
    throw error;
  }
}

// 从CSV读取场景
async function readScenesFromCSV(): Promise<GeneratedScene[]> {
  try {
    const csvContent = await fs.promises.readFile(
      path.join(__dirname, 'generated_scenes.csv'), 
      'utf-8'
    );
    
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });

    return records.map((record: any) => ({
      user_id: record['User ID'],
      user_name: record['User Name'],
      user_background: record['User Background'],
      user_level: record['User Level'],
      category: record['Category'],
      location: record['Location'],
      situation: record['Situation'],
      participants: JSON.parse(record['Participants'] || '[]'),
      objectives: JSON.parse(record['Objectives'] || '[]'),
      topics: JSON.parse(record['Topics'] || '[]'),
      professional_terms: JSON.parse(record['Professional Terms'] || '[]'),
      created_at: record['Created At'],
      time_of_day: record['Time of Day'],
      weather: record['Weather'],
      season: record['Season'],
      mood: record['Mood']
    }));
  } catch (error) {
    console.error('读取场景CSV文件失败:', error);
    throw error;
  }
}

// 根据用户ID获取用户信息
async function getUserById(userId: string): Promise<User> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error || !user) {
      throw new Error(`无法获取用户信息: ${userId}`);
    }
    
    return user;
  } catch (error) {
    console.error(`获取用户 ${userId} 信息失败:`, error);
    throw error;
  }
}

// 基于场景生成文章内容
async function generateArticleWithScene(user: User, scene: GeneratedScene): Promise<Article> {
  const contentPrompt = `请基于以下场景信息，创建一个吸引人的中文标题和英文对话。

注意：对话内容必须是英文的，但标题和其他说明仍然使用中文。

1. 充分利用场景中的以下要素：
   - 场景类别：${scene.category}
   - 地点：${scene.location}
   - 时间：${scene.time_of_day}，${scene.season}
   - 天气：${scene.weather}
   - 人物心情：${scene.mood}
   - 专业领域：${scene.professional_terms.join('、')}

2. 标题风格：
   - 长度15-25字
   - 带1-2个表情符号
   - 要有故事性和悬念感
   - 突出场景的戏剧性或有趣之处
   - 避免平铺直叙，用富有感染力的语言
   - 要和对话的内容紧密相关
   - 标题中有50%的概率使用场景中的要素

3. 对话内容要求（必须是英文）：
   - 对话要自然流畅，符合英语母语者的表达习惯
   - 有60%的概率在对话内容中适当使用1-2个emoji表情
   - emoji使用原则：
     * 只在表达强烈情感或特定场景时使用
     * 每个说话人最多使用1个emoji
     * 确保emoji与对话内容和说话人性格相符
     * 不要过度使用，保持对话的专业性
   - 对话中的emoji示例：
     * 表达惊讶：😮
     * 表达开心：😊
     * 表达思考：🤔
     * 表达赞同：👍
     * 表达担忧：😟

场景详细信息：
${JSON.stringify(scene, null, 2)}

用户背景：
{
  "基本信息": {
    "职业背景": "${user.background_story}",
    "英语水平": "${user.level}",
    "兴趣标签": ${JSON.stringify(user.tags)}
  }
}

请生成以下内容：
1. 标题（15-25字的中文，带1-2个表情符号）
2. 英语对话（必须是英文，要包含场景中的专业术语，地道，口语化，日常化）
3. 重点词汇（从对话中提取的英文单词，中文解释）
4. 关键短语（从对话中提取的英文短语，中文解释）
5. 学习要点（中文）
6. 相关标签（2-3个中文标签，必须与文章内容高度相关，可以从以下来源选择或组合：
   - 场景主题：${scene.topics.join('、')}
   - 专业术语：${scene.professional_terms.join('、')}
   - 对话内容：根据生成的对话内容提取
   - 学习目标：${scene.objectives.join('、')}
   标签要求：
   - 每个标签2-5个字
   - 避免过于宽泛的标签
   - 确保与对话内容和场景紧密相关
   - 突出特色和专业性）

返回格式示例：
{
  "title": "示例中文标题",
  "content": [
    {
      "speaker": "说话人名字",
      "text": "English dialogue content"
    }
  ],
  "vocabularies": [
    {
      "word": "English word",
      "phonetic": "/音标/",
      "meaning": "中文含义",
      "example": "English example from the dialogue",
      "translation": "例句中文翻译"
    }
  ],
  "key_phrases": [
    {
      "phrase": "English phrase",
      "meaning": "中文含义",
      "category": "分类",
      "example": "English example from the dialogue",
      "translation": "例句中文翻译"
    }
  ],
  "learning_points": ["中文学习要点1", "中文学习要点2"],
  "tags": ["中文标签1", "中文标签2", "中文标签3"]
}`;

  console.log('正在生成文章内容...');
  console.log('文章生成提示词:', contentPrompt);
  
  const response = await APIConfig.makeRequest([
    {
      role: "system",
      content: "你是一个专业的英语教育内容创作者。请确保返回严格的JSON格式数据，所有字符串都必须使用双引号，不要添加任何额外的格式标记。特别注意：必须生成tags字段，且包含2-3个标签。"
    },
    {
      role: "user",
      content: contentPrompt
    }
  ], {
    temperature: 0.7,
    response_format: { type: "json_object" }
  });

  console.log('原始API响应:', response);
  
  try {
    // 直接尝试解析JSON
    const rawArticle = JSON.parse(response);
    
    // 处理content字段，确保是对话数组格式
    const processedContent = typeof rawArticle.content === 'string' 
      ? rawArticle.content.split('\n').map((line: string) => {
          const [speaker, ...contentParts] = line.split(':');
          return {
            speaker: speaker.trim(),
            text: contentParts.join(':').trim()
          };
        })
      : rawArticle.content;

    const article = {
      ...rawArticle,
      content: processedContent,
      user_id: user.user_id,
      user: user,
      scene: scene,
      created_at: new Date().toISOString(),
      level: user.level
    };
    
    console.log('文章内容生成完成:', article);
    return article;
  } catch (error) {
    console.error('JSON解析失败，尝试清理:', error);
    // 如果直接解析失败，使用cleanJsonResponse函数
    const cleanedResponse = cleanJsonResponse(response);
    console.log('清理后的响应:', cleanedResponse);
    const rawArticle = JSON.parse(cleanedResponse);
    
    // 处理content字段，确保是对话数组格式
    const processedContent = typeof rawArticle.content === 'string' 
      ? rawArticle.content.split('\n').map((line: string) => {
          const [speaker, ...contentParts] = line.split(':');
          return {
            speaker: speaker.trim(),
            text: contentParts.join(':').trim()
          };
        })
      : rawArticle.content;

    const article = {
      ...rawArticle,
      content: processedContent,
      user_id: user.user_id,
      user: user,
      scene: scene,
      created_at: new Date().toISOString(),
      level: user.level
    };
    
    return article;
  }
}

// 检查已生成的文章
async function checkExistingArticles(): Promise<Set<string>> {
  try {
    // 检查数据库中已有的文章
    const { data: articles, error } = await supabase
      .from('articles')
      .select('scene')
      .not('scene', 'is', null);

    if (error) {
      console.error('检查数据库文章失败:', error);
      return new Set<string>();
    }

    const existingUserIds = new Set<string>();
    articles?.forEach(article => {
      const scene = article.scene as { user_id: string };
      if (scene?.user_id) {
        existingUserIds.add(scene.user_id);
      }
    });

    console.log(`数据库中已有 ${existingUserIds.size} 个用户的文章`);
    return existingUserIds;
  } catch (error) {
    console.error('检查已有文章失败:', error);
    return new Set<string>();
  }
}

// 生成所有文章
async function generateAllArticles(count: number, shouldSaveToSupabase: boolean = false) {
  console.log('开始生成文章...');
  const articles: Article[] = [];

  try {
    // 读取所有场景
    console.log('读取场景数据...');
    const scenes = await readScenesFromCSV();
    console.log(`成功读取 ${scenes.length} 个场景`);

    // 获取已有文章的用户ID
    const existingUserIds = await checkExistingArticles();
    
    // 过滤出需要生成文章的场景
    const scenesNeedArticles = scenes.filter(scene => !existingUserIds.has(scene.user_id));
    console.log(`需要为 ${scenesNeedArticles.length} 个场景生成文章`);

    // 确保不超过可用场景数量
    const actualCount = Math.min(count, scenesNeedArticles.length);
    console.log(`计划生成 ${actualCount} 篇文章`);

    // 随机打乱场景顺序
    const shuffledScenes = scenesNeedArticles.sort(() => Math.random() - 0.5);

    for (let i = 0; i < actualCount; i++) {
      try {
        console.log(`\n生成第 ${i + 1}/${actualCount} 篇文章`);
        const scene = shuffledScenes[i];
        
        // 获取用户信息
        console.log(`获取用户信息: ${scene.user_id}`);
        const user = await getUserById(scene.user_id);
        
        // 生成文章
        console.log('根据场景生成文章...');
        const article = await generateArticleWithScene(user, scene);
        
        // 保存到本地JSON文件
        const outputDir = path.join(__dirname, 'generated');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `article_${timestamp}_${i + 1}.json`;
        const filePath = path.join(outputDir, fileName);

        // 确保输出目录存在
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        // 保存到本地文件
        await fs.promises.writeFile(
          filePath,
          JSON.stringify(article, null, 2),
          'utf8'
        );
        console.log(`[保存] 文章已保存到: ${filePath}`);

        // 立即保存到数据库
        if (shouldSaveToSupabase) {
          console.log('\n[数据库] 开始保存文章到数据库...');
          await saveToSupabase([article]);
          console.log('[数据库] 文章已成功保存到数据库');
        }

        articles.push(article);
        console.log('文章生成完成');
      } catch (error) {
        console.error(`生成第 ${i + 1} 篇文章时发生错误:`, error);
        // 继续生成下一篇文章
      }

      // 添加延迟避免API限制
      if (i < actualCount - 1) {
        console.log('等待2秒后继续...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\n所有文章生成完成！');
    console.log(`成功生成: ${articles.length} 篇`);
    console.log(`失败: ${actualCount - articles.length} 篇`);

  } catch (error) {
    console.error('生成文章过程中发生错误:', error);
    throw error;
  }

  return articles;
}

// 将文章保存为CSV
async function saveToCSV(articles: Article[]) {
  const csvWriter = createObjectCsvWriter({
    path: path.join(__dirname, 'articles.csv'),
    header: [
      { id: 'article_id', title: 'article_id' },
      { id: 'title', title: 'title' },
      { id: 'content', title: 'content' },
      { id: 'level', title: 'level' },
      { id: 'tags', title: 'tags' },
      { id: 'created_at', title: 'created_at' },
      { id: 'vocabularies', title: 'vocabularies' },
      { id: 'key_phrases', title: 'key_phrases' },
      { id: 'learning_points', title: 'learning_points' },
      { id: 'user_id', title: 'user_id' },
      { id: 'user', title: 'user' }
    ]
  });

  // 转换数组为JSON字符串
  const records = articles.map(article => ({
    ...article,
    vocabularies: JSON.stringify(article.vocabularies),
    key_phrases: JSON.stringify(article.key_phrases),
    learning_points: JSON.stringify(article.learning_points),
    user: JSON.stringify(article.user)
  }));

  await csvWriter.writeRecords(records);
  console.log('CSV文件已成功生成');
}

// 将文章保存到 Supabase
async function saveToSupabase(articles: Article[]) {
  console.log('\n=== 开始保存文章到数据库 ===');
  console.log('数据库URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('准备保存文章数量:', articles.length);
  
  for (const article of articles) {
    try {
      console.log('\n[数据库] 开始保存文章:', article.title);
      
      // 检查必要的字段
      if (!article.user_id) {
        throw new Error('缺少必要字段: user_id');
      }

      // 准备文章数据，只包含需要的字段
      const articleData = {
        user_id: article.user_id,
        title: article.title,
        content: article.content,
        level: article.level,
        tags: article.tags,
        vocabularies: article.vocabularies,
        key_phrases: article.key_phrases,
        learning_points: article.learning_points,
        created_at: article.created_at,
        updated_at: new Date().toISOString(),
        likes_count: 0,
        favorites_count: 0,
        comments_count: 0
      };

      console.log('[数据库] 数据准备完成，开始插入');
      console.log('[数据库] 数据结构:', Object.keys(articleData).join(', '));
      console.log('[数据库] 数据大小:', JSON.stringify(articleData).length, '字节');

      // 测试数据库连接
      const { data: testData, error: testError } = await supabase
        .from('articles')
        .select('article_id')
        .limit(1);

      if (testError) {
        console.error('[数据库] 连接测试失败:', {
          message: testError.message,
          details: testError.details,
          hint: testError.hint,
          code: testError.code
        });
        throw new Error('数据库连接测试失败');
      }

      console.log('[数据库] 连接测试成功');

      // 插入文章数据
      const { data, error } = await supabase
        .from('articles')
        .insert([articleData])
        .select('article_id, title')
        .single();

      if (error) {
        console.error('[数据库] 保存失败:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('[数据库] 文章保存成功:', {
        article_id: data.article_id,
        title: data.title
      });

    } catch (error: any) {
      console.error('[数据库] 保存文章时发生错误:', {
        title: article.title,
        error: {
          message: error.message,
          code: error?.code,
          details: error?.details
        }
      });
      throw error; // 向上传播错误，以便主函数知道保存失败
    }
  }
  
  console.log('\n=== 数据库保存完成 ===');
}

// 将文章保存为本地 JSON 文件
async function saveToLocalJson(articles: Article[]) {
  const outputDir = path.join(__dirname, 'generated');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const fileName = `article_${timestamp}_${i + 1}.json`;
    const filePath = path.join(outputDir, fileName);

    try {
      await fs.promises.writeFile(
        filePath,
        JSON.stringify(article, null, 2),
        'utf8'
      );
      console.log(`[保存] 文章已保存到: ${filePath}`);
    } catch (error) {
      console.error(`[错误] 保存文章失败 ${filePath}:`, error);
      throw error;
    }
  }
}

// 主函数
async function main() {
  try {
    // 检查环境变量
    const requiredEnvVars = {
      'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
      'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'NEXT_PUBLIC_ZHIPU_API_KEY': process.env.NEXT_PUBLIC_ZHIPU_API_KEY
    };

    const missingEnvVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingEnvVars.length > 0) {
      throw new Error(`缺少必要的环境变量: ${missingEnvVars.join(', ')}\n请确保在.env文件中设置这些变量`);
    }

    console.log('\n=== 环境检查 ===');
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('API配置已完成');
    
    const count = process.argv[2] ? parseInt(process.argv[2]) : 1;
    console.log(`\n=== 开始生成 ${count} 篇文章 ===`);
    
    // 生成文章
    const articles = await generateAllArticles(count, true);  // 设置为true以启用数据库保存
    
    // 保存到本地JSON文件
    await saveToLocalJson(articles);
    
    // 保存到数据库
    await saveToSupabase(articles);
    
    console.log('\n=== 所有任务完成 ===');
  } catch (error) {
    console.error('执行失败：', error);
    process.exit(1);
  }
}

main(); 