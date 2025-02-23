import * as fs from 'fs';
import * as path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse';

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

  static readonly defaults = {
    temperature: 0.95,
    topP: 0.7,
    maxTokens: 4095,
    stream: false
  };

  static get headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  static async makeRequest(messages: Array<{ role: string; content: string }>, customConfig?: any) {
    const maxRetries = 3;
    let retryCount = 0;
    let lastError: any = null;

    while (retryCount < maxRetries) {
      try {
        console.log(`\n[API请求] 第 ${retryCount + 1} 次尝试`);
        
        const defaultBody = {
          model: this.model,
          messages,
          temperature: this.defaults.temperature,
          top_p: this.defaults.topP,
          max_tokens: this.defaults.maxTokens,
          stream: this.defaults.stream,
          ...customConfig
        };

        const response = await axios.post(
          this.baseURL,
          defaultBody,
          { 
            headers: this.headers,
            timeout: 120000
          }
        );

        if (!response.data?.choices?.[0]?.message?.content) {
          throw new Error('API响应格式不正确');
        }

        return response.data.choices[0].message.content;
      } catch (error: any) {
        lastError = error;
        retryCount++;
        
        if (retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 2000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }
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

// 获取所有用户
async function getAllUsers(): Promise<User[]> {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('user_id, name, avatar, style_description, gender, background_story, tags, level')
      .order('user_id');

    if (error) throw error;
    if (!users || users.length === 0) throw new Error('没有找到可用的用户');
    
    return users;
  } catch (error) {
    console.error('获取用户列表失败:', error);
    throw error;
  }
}

// 检查用户是否已有场景
async function checkExistingScenes(): Promise<Set<string>> {
  try {
    const csvContent = await fs.promises.readFile(
      path.join(__dirname, 'generated_scenes.csv'), 
      'utf-8'
    ).catch(() => ''); // 如果文件不存在，返回空字符串

    if (!csvContent) {
      return new Set<string>();
    }

    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });

    const existingUserIds = new Set<string>();
    records.forEach((record: any) => {
      existingUserIds.add(record['User ID']);
    });

    return existingUserIds;
  } catch (error) {
    console.error('读取现有场景失败:', error);
    return new Set<string>();
  }
}

// 获取随机用户
async function getRandomUser(): Promise<User> {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('user_id, name, avatar, style_description, gender, background_story, tags, level')
      .limit(10);

    if (error) throw error;
    if (!users || users.length === 0) throw new Error('没有找到可用的作者');

    const randomUser = users[Math.floor(Math.random() * users.length)];
    return randomUser;
  } catch (error) {
    console.error('获取随机作者失败:', error);
    throw error;
  }
}

// 生成场景
async function generateScene(user: User): Promise<GeneratedScene> {
  // 生成随机元素
  const timeOfDay = ['morning', 'afternoon', 'evening'][Math.floor(Math.random() * 3)];
  const weather = ['sunny', 'rainy', 'cloudy', 'snowy'][Math.floor(Math.random() * 4)];
  const mood = ['energetic', 'relaxed', 'focused', 'creative'][Math.floor(Math.random() * 4)];
  const season = ['spring', 'summer', 'autumn', 'winter'][Math.floor(Math.random() * 4)];

  const scenePrompt = `请生成一个与用户背景相关的英语学习场景。请注意：必须返回严格的JSON格式，不要包含任何额外的格式标记或换行符。

场景要求：
1. 时间设定在 ${timeOfDay}，${season} season，天气为 ${weather}
2. 用户当前心情：${mood}
3. 每次生成的场景都必须独特，不要重复相似的场景
4. 充分挖掘用户背景故事中的不同侧面，创造多样化的场景
5. 考虑用户在不同时间、不同心情下可能遇到的各种情境

用户信息：
{
  "职业身份": "${user.background_story}",
  "兴趣标签": ${JSON.stringify(user.tags)},
  "英语水平": "${user.level}",
  "性别": "${user.gender}"
}

生成要求：
1. 场景必须与用户的实际经历和专业领域高度相关
2. 场景应该是用户在实际工作/学习中很可能遇到的
3. 参与者身份要符合用户的职业环境
4. 交际目标要反映真实的语言需求
5. 专业术语要符合用户的领域
6. 确保场景具有独特性，避免与其他场景重复
7. 根据时间、天气、心情等因素调整场景的具体细节
8. 考虑季节性和时间特点对场景的影响

请直接返回如下格式的JSON字符串（注意：必须是单行，不要包含换行符和额外空格）：
{"category":"场景类别","location":"具体地点","situation":"具体情境的详细描述","participants":["参与者1","参与者2"],"objectives":["交际目标1","交际目标2"],"topics":["可能涉及的话题1","话题2"],"professional_terms":["相关专业术语1","术语2"]}`;

  const response = await APIConfig.makeRequest([
    {
      role: "system",
      content: "你是一个专业的英语教育场景设计专家。每次都要生成独特的场景，即使是相同的用户背景也要创造不同的情境。考虑时间、季节、天气和用户心情等因素，确保场景的多样性和真实性。请严格按照要求返回JSON格式数据，不要添加任何额外的格式标记或换行符。"
    },
    {
      role: "user",
      content: scenePrompt
    }
  ], {
    temperature: 0.9,  // 提高温度增加随机性
    top_p: 0.9,       // 提高采样范围
    presence_penalty: 0.6,  // 增加新内容的倾向
    frequency_penalty: 0.6  // 减少重复内容的倾向
  });

  const sceneData = JSON.parse(response);
  
  // 添加时间和环境信息到场景中
  return {
    user_id: user.user_id,
    user_name: user.name,
    user_background: user.background_story,
    user_level: user.level,
    created_at: new Date().toISOString(),
    time_of_day: timeOfDay,
    weather: weather,
    season: season,
    mood: mood,
    ...sceneData
  };
}

// 生成多个场景
async function generateScenes(count: number) {
  console.log('开始生成场景...');
  const scenes: any[] = [];

  try {
    // 获取所有用户
    const users = await getAllUsers();
    console.log(`找到 ${users.length} 个用户`);

    // 获取已有场景的用户ID
    const existingUserIds = await checkExistingScenes();
    console.log(`已有 ${existingUserIds.size} 个用户的场景`);

    // 过滤出需要生成场景的用户
    const usersNeedScenes = users.filter(user => !existingUserIds.has(user.user_id));
    console.log(`需要为 ${usersNeedScenes.length} 个用户生成场景`);

    // 创建CSV写入器
    const csvWriter = createObjectCsvWriter({
      path: path.join(__dirname, 'generated_scenes.csv'),
      header: [
        { id: 'user_id', title: 'User ID' },
        { id: 'user_name', title: 'User Name' },
        { id: 'user_background', title: 'User Background' },
        { id: 'user_level', title: 'User Level' },
        { id: 'category', title: 'Category' },
        { id: 'location', title: 'Location' },
        { id: 'situation', title: 'Situation' },
        { id: 'participants', title: 'Participants' },
        { id: 'objectives', title: 'Objectives' },
        { id: 'topics', title: 'Topics' },
        { id: 'professional_terms', title: 'Professional Terms' },
        { id: 'created_at', title: 'Created At' },
        { id: 'time_of_day', title: 'Time of Day' },
        { id: 'weather', title: 'Weather' },
        { id: 'season', title: 'Season' },
        { id: 'mood', title: 'Mood' }
      ],
      append: existingUserIds.size > 0 // 如果已有场景，则启用追加模式
    });

    for (let i = 0; i < usersNeedScenes.length; i++) {
      try {
        const user = usersNeedScenes[i];
        console.log(`\n生成第 ${i + 1}/${usersNeedScenes.length} 个场景`);
        console.log(`用户: ${user.name} (${user.user_id})`);

        const scene = await generateScene(user);
        scenes.push(scene);

        const processedScene = {
          ...scene,
          participants: JSON.stringify(scene.participants),
          objectives: JSON.stringify(scene.objectives),
          topics: JSON.stringify(scene.topics),
          professional_terms: JSON.stringify(scene.professional_terms)
        };

        await csvWriter.writeRecords([processedScene]);
        console.log(`第 ${i + 1} 个场景生成完成并已保存到CSV`);

        // 添加延迟避免API限制
        if (i < usersNeedScenes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`生成第 ${i + 1} 个场景失败:`, error);
      }
    }

    console.log('\n场景生成完成！');
    console.log(`成功生成: ${scenes.length} 个场景`);
    console.log(`失败: ${usersNeedScenes.length - scenes.length} 个场景`);

  } catch (error) {
    console.error('生成场景过程中发生错误:', error);
    throw error;
  }

  return scenes;
}

// 主函数
async function main() {
  if (!APIConfig.apiKey) {
    console.error('请在.env文件中设置ZHIPU_API_KEY');
    process.exit(1);
  }

  const sceneCount = process.argv[2] ? parseInt(process.argv[2]) : 10;
  
  try {
    console.log('开始生成场景...');
    await generateScenes(sceneCount);
    console.log('场景生成完成！');
  } catch (error) {
    console.error('生成场景失败:', error);
    process.exit(1);
  }
}

main(); 