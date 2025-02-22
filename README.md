# 语境 Flow - 沉浸式英语学习应用

这是一个基于 [Next.js](https://nextjs.org) 开发的英语学习应用，旨在通过真实场景对话帮助用户提升英语水平。

## 功能特点

- 🎯 基于真实场景的英语对话学习
- 📚 重点单词和短语高亮显示
- 🔍 详细的语言点解析
- 💡 学习要点总结
- 💬 用户评论和交流
- 📱 响应式设计，支持多端访问

## 技术栈

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Supabase

## 开始使用

首先，运行开发服务器：

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
# 或
bun dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

## 项目结构

```
src/
├── app/                # 应用页面
│   ├── page.tsx       # 首页
│   ├── post/          # 文章详情页
│   └── profile/       # 个人中心
├── components/        # 可复用组件
├── lib/              # 工具函数和配置
└── data/             # 数据模型和mock数据
```

## 数据库设计

项目使用 Supabase 作为后端服务，主要包含以下数据表：

- articles: 文章内容
- vocabularies: 单词库
- key_phrases: 关键短语
- comments: 用户评论
- users: 用户信息

## 部署

推荐使用 [Vercel 平台](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) 部署，它是 Next.js 的创建者开发的平台。

## 了解更多

要了解更多关于 Next.js 的信息，请参考以下资源：

- [Next.js 文档](https://nextjs.org/docs) - 了解 Next.js 特性和 API
- [Learn Next.js](https://nextjs.org/learn) - 交互式 Next.js 教程

欢迎查看 [Next.js GitHub 仓库](https://github.com/vercel/next.js)，我们欢迎您的反馈和贡献！
