import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// 定义对话内容接口
interface DialogueContent {
  speaker: string;
  text: string;
}

// 定义文章数据接口
interface ArticleData {
  user_id: string;
  title: string;
  content: DialogueContent[] | string;
  level: string;
  tags: string[];
  vocabularies: any[];
  key_phrases: any[];
  learning_points: string[];
  created_at: string;
  scene?: any;
}

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

// 创建 Supabase 客户端
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

// 同步单篇文章到数据库
async function syncArticleToDb(articleData: { article: ArticleData }) {
  try {
    const article = articleData.article;
    
    // 在保存文章前删除scene字段
    const { scene, ...articleDataWithoutScene } = article;

    // 准备要插入的数据
    const dbArticle = {
      user_id: article.user_id,
      title: article.title,
      content: typeof article.content === 'string'
        ? article.content.split('\n').map((line: string) => {
            const [speaker, ...textParts] = line.split(':');
            return {
              speaker: speaker.trim(),
              text: textParts.join(':').trim()
            };
          })
        : article.content,
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

    // 检查文章是否已存在（通过标题和作者ID）
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('article_id')
      .eq('title', article.title)
      .eq('user_id', article.user_id)
      .single();

    if (existingArticle) {
      console.log(`文章已存在，跳过: ${article.title}`);
      return false;
    }

    // 插入新文章
    const { data, error } = await supabase
      .from('articles')
      .insert(dbArticle)
      .select('article_id, title')
      .single();

    if (error) {
      console.error('插入文章失败:', {
        title: article.title,
        error: error.message,
        details: error.details
      });
      return false;
    }

    console.log(`文章同步成功: ${article.title} (ID: ${data.article_id})`);
    return true;
  } catch (error) {
    console.error('同步文章时发生错误:', error);
    return false;
  }
}

// 同步所有文章
async function syncAllArticles() {
  console.log('\n=== 开始同步文章到数据库 ===');
  console.log('开始时间:', new Date().toISOString());

  try {
    // 读取生成的文章文件
    const articlesFile = path.join(__dirname, 'generated_articles.json');
    const fileContent = fs.readFileSync(articlesFile, 'utf8');
    const data = JSON.parse(fileContent);

    if (!data.articles || !Array.isArray(data.articles)) {
      console.error('文章数据格式错误：找不到文章数组');
      return;
    }

    const articles = data.articles;
    console.log(`找到 ${articles.length} 篇文章需要同步`);

    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;

    // 同步每篇文章
    for (const article of articles) {
      console.log(`\n处理文章: ${article.title}`);
      
      const result = await syncArticleToDb({ article });
      
      if (result) {
        successCount++;
      } else {
        if (result === false) {
          skipCount++;
        } else {
          failCount++;
        }
      }

      // 添加延迟以避免可能的速率限制
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n=== 同步完成 ===');
    console.log('结束时间:', new Date().toISOString());
    console.log('同步结果:');
    console.log(`- 成功: ${successCount} 篇`);
    console.log(`- 跳过: ${skipCount} 篇`);
    console.log(`- 失败: ${failCount} 篇`);

  } catch (error) {
    console.error('同步过程中发生错误:', error);
  }
}

// 运行同步
syncAllArticles(); 