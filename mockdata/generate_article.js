"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var csv_writer_1 = require("csv-writer");
var axios_1 = require("axios");
var dotenv_1 = require("dotenv");
var supabase_js_1 = require("@supabase/supabase-js");
// 加载环境变量
dotenv_1["default"].config({ path: path.join(__dirname, '../.env') });
// 创建 Supabase 客户端
var supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');
// API配置
var APIConfig = /** @class */ (function () {
    function APIConfig() {
    }
    Object.defineProperty(APIConfig, "headers", {
        // 请求头
        get: function () {
            return {
                'Content-Type': 'application/json',
                'Authorization': "Bearer ".concat(this.apiKey)
            };
        },
        enumerable: false,
        configurable: true
    });
    // 创建请求体
    APIConfig.createRequestBody = function (messages, config) {
        if (config === void 0) { config = {}; }
        return __assign({ model: this.model, messages: messages, temperature: this.defaults.temperature, top_p: this.defaults.topP, max_tokens: this.defaults.maxTokens, stream: this.defaults.stream }, config);
    };
    // 创建请求
    APIConfig.makeRequest = function (messages, customConfig) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function () {
            var maxRetries, retryCount, lastError, _loop_1, this_1, state_1;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        maxRetries = 3;
                        retryCount = 0;
                        lastError = null;
                        _loop_1 = function () {
                            var defaultBody, requestBody, startTime, response, endTime, content, error_1, delay_1;
                            return __generator(this, function (_k) {
                                switch (_k.label) {
                                    case 0:
                                        _k.trys.push([0, 2, , 5]);
                                        console.log("\n[API\u8BF7\u6C42] \u7B2C ".concat(retryCount + 1, " \u6B21\u5C1D\u8BD5"));
                                        console.log('[API请求] 时间:', new Date().toISOString());
                                        console.log('[API请求] 请求体大小:', JSON.stringify(messages).length, '字节');
                                        console.log('[API请求] 发送请求到:', this_1.baseURL);
                                        defaultBody = this_1.createRequestBody(messages);
                                        requestBody = customConfig ? __assign(__assign({}, defaultBody), customConfig) : defaultBody;
                                        startTime = Date.now();
                                        return [4 /*yield*/, axios_1["default"].post(this_1.baseURL, requestBody, {
                                                headers: this_1.headers,
                                                timeout: 120000,
                                                maxBodyLength: Infinity,
                                                maxContentLength: Infinity
                                            })];
                                    case 1:
                                        response = _k.sent();
                                        endTime = Date.now();
                                        console.log('[API请求] 请求耗时:', (endTime - startTime) / 1000, '秒');
                                        console.log('[API请求] 响应状态:', response.status);
                                        console.log('[API请求] 响应头:', JSON.stringify(response.headers, null, 2));
                                        console.log('[API请求] 响应大小:', JSON.stringify(response.data).length, '字节');
                                        if (!((_d = (_c = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.choices) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content)) {
                                            console.error('[API请求] 响应格式错误:', JSON.stringify(response.data, null, 2));
                                            throw new Error('API响应格式不正确');
                                        }
                                        content = response.data.choices[0].message.content;
                                        console.log('[API请求] 响应内容长度:', content.length);
                                        console.log('[API请求] 响应内容前100个字符:', content.substring(0, 100));
                                        return [2 /*return*/, { value: content }];
                                    case 2:
                                        error_1 = _k.sent();
                                        lastError = error_1;
                                        retryCount++;
                                        console.error("[API\u8BF7\u6C42] \u5931\u8D25 (\u5C1D\u8BD5 ".concat(retryCount, "/").concat(maxRetries, "):"), {
                                            message: error_1.message,
                                            code: error_1.code,
                                            status: (_e = error_1.response) === null || _e === void 0 ? void 0 : _e.status,
                                            statusText: (_f = error_1.response) === null || _f === void 0 ? void 0 : _f.statusText,
                                            headers: (_g = error_1.response) === null || _g === void 0 ? void 0 : _g.headers,
                                            data: (_h = error_1.response) === null || _h === void 0 ? void 0 : _h.data,
                                            stack: error_1.stack
                                        });
                                        if (!(retryCount < maxRetries)) return [3 /*break*/, 4];
                                        delay_1 = Math.pow(2, retryCount) * 2000;
                                        console.log("[API\u8BF7\u6C42] \u7B49\u5F85 ".concat(delay_1 / 1000, " \u79D2\u540E\u91CD\u8BD5..."));
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delay_1); })];
                                    case 3:
                                        _k.sent();
                                        _k.label = 4;
                                    case 4: return [3 /*break*/, 5];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _j.label = 1;
                    case 1:
                        if (!(retryCount < maxRetries)) return [3 /*break*/, 3];
                        return [5 /*yield**/, _loop_1()];
                    case 2:
                        state_1 = _j.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        return [3 /*break*/, 1];
                    case 3:
                        console.error('[API请求] 最终失败，已达到最大重试次数');
                        throw lastError;
                }
            });
        });
    };
    APIConfig.baseURL = process.env.ZHIPU_API_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    APIConfig.apiKey = process.env.ZHIPU_API_KEY;
    APIConfig.model = 'glm-4-flash';
    // 默认配置参数
    APIConfig.defaults = {
        temperature: 0.95,
        topP: 0.7,
        maxTokens: 4095,
        stream: false
    };
    return APIConfig;
}());
// 话题列表
var TAGS = [
    '日常生活', '职场', '学习', '旅游', '购物',
    '美食', '娱乐', '社交', '健康', '科技'
];
// 难度等级
var LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
// 短语分类
var PHRASE_CATEGORIES = [
    'expression', 'response', 'technique', 'conjunction'
];
// 清理API响应中的JSON
function cleanJsonResponse(response) {
    var cleaned = '';
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
        cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, function (char) {
            if (char === '\n')
                return '\\n'; // 保留换行符
            if (char === '\t')
                return '\\t'; // 保留制表符
            return ''; // 移除其他控制字符
        });
        // 处理引号问题
        cleaned = cleaned.replace(/(?<!\\)"/g, '\\"'); // 转义未转义的双引号
        cleaned = cleaned.replace(/\\{2,}"/g, '\\"'); // 修复多重转义
        cleaned = cleaned.replace(/^{/, '{"'); // 添加开头的引号
        cleaned = cleaned.replace(/}$/, '"}'); // 添加结尾的引号
        cleaned = cleaned.replace(/"\s*:\s*"([^"]+)"/g, '"$1"'); // 修复属性名称
        // 尝试解析和重新生成JSON字符串
        var jsonObj = JSON.parse(cleaned);
        return JSON.stringify(jsonObj);
    }
    catch (error) {
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
            var jsonObj = JSON.parse(cleaned);
            return JSON.stringify(jsonObj);
        }
        catch (retryError) {
            console.error('二次清理失败:', retryError);
            throw error; // 抛出原始错误
        }
    }
}
// 修改生成文章内容的提示词
function generatePrompt(tags, level, user) {
    return "\u8BF7\u57FA\u4E8E\u4EE5\u4E0B\u7528\u6237\u80CC\u666F\u521B\u5EFA\u4E00\u4E2A\u82F1\u8BED\u5B66\u4E60\u573A\u666F\u5BF9\u8BDD\u3002\u8BF7\u4E25\u683C\u9075\u5FAAJSON\u683C\u5F0F\u3002\n\n\u7528\u6237\u80CC\u666F\u4FE1\u606F\uFF1A\n{\n  \"\u57FA\u672C\u4FE1\u606F\": {\n    \"\u6027\u522B\": \"".concat(user.gender, "\",\n    \"\u82F1\u8BED\u6C34\u5E73\": \"").concat(level, "\",\n    \"\u5174\u8DA3\u6807\u7B7E\": ").concat(JSON.stringify(user.tags), ",\n    \"\u4E2A\u4EBA\u6545\u4E8B\": \"").concat(user.background_story, "\"\n  }\n}\n\n\u8BF7\u521B\u5EFA\u4E00\u4E2A\u5B8C\u6574\u7684\u5B66\u4E60\u573A\u666F\uFF0C\u8FD4\u56DE\u683C\u5F0F\u5982\u4E0B\uFF1A\n{\n  \"title\": \"\u6807\u9898\uFF08\u4E2D\u6587\uFF0C15-25\u5B57\uFF0C\u5E261-2\u4E2A\u8868\u60C5\u7B26\u53F7\uFF09\",\n  \"content\": [\n    {\n      \"speaker\": \"\u8BF4\u8BDD\u4EBA\u540D\u5B57\",\n      \"content\": \"\u8BF4\u8BDD\u5185\u5BB9\"\n    }\n  ],\n  \"vocabularies\": [\n    {\n      \"word\": \"\u5355\u8BCD\",\n      \"phonetic\": \"\u97F3\u6807\",\n      \"meaning\": \"\u4E2D\u6587\u542B\u4E49\",\n      \"example\": \"\u4F8B\u53E5\uFF08\u6765\u81EA\u5BF9\u8BDD\uFF09\",\n      \"translation\": \"\u4F8B\u53E5\u7FFB\u8BD1\"\n    }\n  ],\n  \"key_phrases\": [\n    {\n      \"phrase\": \"\u77ED\u8BED\",\n      \"meaning\": \"\u542B\u4E49\",\n      \"category\": \"\u5206\u7C7B\",\n      \"example\": \"\u4F8B\u53E5\uFF08\u6765\u81EA\u5BF9\u8BDD\uFF09\",\n      \"translation\": \"\u4F8B\u53E5\u7FFB\u8BD1\"\n    }\n  ],\n  \"learning_points\": [\n    \"\u5B66\u4E60\u8981\u70B91\",\n    \"\u5B66\u4E60\u8981\u70B92\",\n    \"\u5B66\u4E60\u8981\u70B93\"\n  ]\n}\n\n\u6CE8\u610F\u4E8B\u9879\uFF1A\n1. content\u6570\u7EC4\u4E2D\u7684\u6BCF\u4E2A\u5BF9\u8C61\u5FC5\u987B\u5305\u542Bspeaker\u548Ccontent\u4E24\u4E2A\u5B57\u6BB5\n2. \u5BF9\u8BDD\u5FC5\u987B\u81EA\u7136\u6D41\u7545\uFF0C\u7B26\u5408\u7528\u6237\u7684\u5B9E\u9645\u4F7F\u7528\u573A\u666F\n3. \u4E25\u683C\u9075\u5FAAJSON\u683C\u5F0F\u89C4\u8303\n4. \u786E\u4FDD\u6240\u6709\u5B57\u6BB5\u5B8C\u6574\u586B\u5199\uFF0C\u4E0D\u5F97\u7F3A\u5931");
}
// 获取随机作者
function getRandomUser() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, users, error, randomUser, story, level, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, supabase
                            .from('users')
                            .select('user_id, name, avatar, style_description, gender, background_story, tags')
                            .limit(10)];
                case 1:
                    _a = _b.sent(), users = _a.data, error = _a.error;
                    if (error) {
                        throw error;
                    }
                    if (!users || users.length === 0) {
                        throw new Error('没有找到可用的作者');
                    }
                    randomUser = users[Math.floor(Math.random() * users.length)];
                    story = randomUser.background_story.toLowerCase();
                    level = 'A2';
                    if (story.includes('留学') || story.includes('海外') || story.includes('国外工作')) {
                        level = 'C1';
                    }
                    else if (story.includes('英语专业') || story.includes('外企') || story.includes('跨国公司')) {
                        level = 'B2';
                    }
                    else if (story.includes('大学') || story.includes('本科') || story.includes('研究生')) {
                        level = 'B1';
                    }
                    return [2 /*return*/, __assign(__assign({}, randomUser), { level: level })];
                case 2:
                    error_2 = _b.sent();
                    console.error('获取随机作者失败:', error_2);
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    });
}
// 根据用户标签选择文章标签
function selectTagsBasedOnUser(user) {
    // 如果用户没有标签，返回默认标签
    if (!user.tags || user.tags.length === 0) {
        return ['日常生活'];
    }
    // 从用户的标签中随机选择2-3个
    var numTags = Math.floor(Math.random() * 2) + 2; // 2到3个标签
    var shuffledTags = __spreadArray([], user.tags, true).sort(function () { return Math.random() - 0.5; });
    return shuffledTags.slice(0, Math.min(numTags, user.tags.length));
}
// 从CSV读取场景
function getRandomScene() {
    return __awaiter(this, void 0, void 0, function () {
        var csvPath, fileContent, lines, headers, randomLineIndex, randomLine, values, currentValue, insideQuotes, i, char, parseJsonField, scene;
        return __generator(this, function (_a) {
            try {
                csvPath = path.join(__dirname, 'generated_scenes.csv');
                if (!fs.existsSync(csvPath)) {
                    throw new Error('场景CSV文件不存在，请先运行 generate_scenes.ts 生成场景');
                }
                fileContent = fs.readFileSync(csvPath, 'utf-8');
                lines = fileContent.split('\n').filter(function (line) { return line.trim(); });
                headers = lines[0].split(',');
                randomLineIndex = Math.floor(Math.random() * (lines.length - 1)) + 1;
                randomLine = lines[randomLineIndex];
                values = [];
                currentValue = '';
                insideQuotes = false;
                for (i = 0; i < randomLine.length; i++) {
                    char = randomLine[i];
                    if (char === '"') {
                        insideQuotes = !insideQuotes;
                    }
                    else if (char === ',' && !insideQuotes) {
                        values.push(currentValue.trim());
                        currentValue = '';
                    }
                    else {
                        currentValue += char;
                    }
                }
                values.push(currentValue.trim());
                parseJsonField = function (field) {
                    try {
                        // 移除多余的引号和转义字符
                        var cleaned = field.replace(/^"|"$/g, '').replace(/\\"/g, '"');
                        return JSON.parse(cleaned);
                    }
                    catch (error) {
                        console.error('解析JSON字段失败:', field);
                        return [];
                    }
                };
                scene = {
                    user_id: values[headers.indexOf('User ID')],
                    user_name: values[headers.indexOf('User Name')],
                    user_background: values[headers.indexOf('User Background')],
                    user_level: values[headers.indexOf('User Level')],
                    category: values[headers.indexOf('Category')],
                    location: values[headers.indexOf('Location')],
                    situation: values[headers.indexOf('Situation')],
                    participants: parseJsonField(values[headers.indexOf('Participants')]),
                    objectives: parseJsonField(values[headers.indexOf('Objectives')]),
                    topics: parseJsonField(values[headers.indexOf('Topics')]),
                    professional_terms: parseJsonField(values[headers.indexOf('Professional Terms')]),
                    created_at: values[headers.indexOf('Created At')],
                    time_of_day: values[headers.indexOf('Time of Day')],
                    weather: values[headers.indexOf('Weather')],
                    season: values[headers.indexOf('Season')],
                    mood: values[headers.indexOf('Mood')]
                };
                return [2 /*return*/, scene];
            }
            catch (error) {
                console.error('获取随机场景失败:', error);
                throw error;
            }
            return [2 /*return*/];
        });
    });
}
// 基于场景生成文章内容
function generateArticleWithScene(user, scene) {
    return __awaiter(this, void 0, void 0, function () {
        var contentPrompt, response, rawArticle, processedContent, article, cleanedResponse, rawArticle, processedContent, article;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    contentPrompt = "\u8BF7\u57FA\u4E8E\u4EE5\u4E0B\u573A\u666F\u4FE1\u606F\uFF0C\u521B\u5EFA\u4E00\u4E2A\u5438\u5F15\u4EBA\u7684\u4E2D\u6587\u6807\u9898\u548C\u5B8C\u6574\u7684\u82F1\u8BED\u5B66\u4E60\u5BF9\u8BDD\u3002\u6807\u9898\u8981\u6C42\uFF1A\n1. \u5145\u5206\u5229\u7528\u573A\u666F\u4E2D\u7684\u4EE5\u4E0B\u8981\u7D20\uFF1A\n   - \u573A\u666F\u7C7B\u522B\uFF1A".concat(scene.category, "\n   - \u5730\u70B9\uFF1A").concat(scene.location, "\n   - \u65F6\u95F4\uFF1A").concat(scene.time_of_day, "\uFF0C").concat(scene.season, "\n   - \u5929\u6C14\uFF1A").concat(scene.weather, "\n   - \u4EBA\u7269\u5FC3\u60C5\uFF1A").concat(scene.mood, "\n   - \u4E13\u4E1A\u9886\u57DF\uFF1A").concat(scene.professional_terms.join('、'), "\n2. \u6807\u9898\u98CE\u683C\uFF1A\n   - \u957F\u5EA615-25\u5B57\n   - \u5E261-2\u4E2A\u8868\u60C5\u7B26\u53F7\n   - \u8981\u6709\u6545\u4E8B\u6027\u548C\u60AC\u5FF5\u611F\n   - \u7A81\u51FA\u573A\u666F\u7684\u620F\u5267\u6027\u6216\u6709\u8DA3\u4E4B\u5904\n   - \u907F\u514D\u5E73\u94FA\u76F4\u53D9\uFF0C\u7528\u5BCC\u6709\u611F\u67D3\u529B\u7684\u8BED\u8A00\n\n3. \u5BF9\u8BDD\u5185\u5BB9\u8981\u6C42\uFF1A\n   - \u5BF9\u8BDD\u8981\u81EA\u7136\u6D41\u7545\uFF0C\u7B26\u5408\u65E5\u5E38\u8868\u8FBE\u4E60\u60EF\n   - \u670930%\u7684\u6982\u7387\u5728\u5BF9\u8BDD\u5185\u5BB9\u4E2D\u9002\u5F53\u4F7F\u75281-2\u4E2Aemoji\u8868\u60C5\uFF0C\u4F7F\u5BF9\u8BDD\u66F4\u751F\u52A8\n   - emoji\u4F7F\u7528\u539F\u5219\uFF1A\n     * \u53EA\u5728\u8868\u8FBE\u5F3A\u70C8\u60C5\u611F\u6216\u7279\u5B9A\u573A\u666F\u65F6\u4F7F\u7528\n     * \u6BCF\u4E2A\u8BF4\u8BDD\u4EBA\u6700\u591A\u4F7F\u75281\u4E2Aemoji\n     * \u786E\u4FDDemoji\u4E0E\u5BF9\u8BDD\u5185\u5BB9\u548C\u8BF4\u8BDD\u4EBA\u6027\u683C\u76F8\u7B26\n     * \u4E0D\u8981\u8FC7\u5EA6\u4F7F\u7528\uFF0C\u4FDD\u6301\u5BF9\u8BDD\u7684\u4E13\u4E1A\u6027\n   - \u5BF9\u8BDD\u4E2D\u7684emoji\u793A\u4F8B\uFF1A\n     * \u8868\u8FBE\u60CA\u8BB6\uFF1A\uD83D\uDE2E\n     * \u8868\u8FBE\u5F00\u5FC3\uFF1A\uD83D\uDE0A\n     * \u8868\u8FBE\u601D\u8003\uFF1A\uD83E\uDD14\n     * \u8868\u8FBE\u8D5E\u540C\uFF1A\uD83D\uDC4D\n     * \u8868\u8FBE\u62C5\u5FE7\uFF1A\uD83D\uDE1F\n\n\u573A\u666F\u8BE6\u7EC6\u4FE1\u606F\uFF1A\n").concat(JSON.stringify(scene, null, 2), "\n\n\u7528\u6237\u80CC\u666F\uFF1A\n{\n  \"\u57FA\u672C\u4FE1\u606F\": {\n    \"\u804C\u4E1A\u80CC\u666F\": \"").concat(user.background_story, "\",\n    \"\u82F1\u8BED\u6C34\u5E73\": \"").concat(user.level, "\",\n    \"\u5174\u8DA3\u6807\u7B7E\": ").concat(JSON.stringify(user.tags), "\n  }\n}\n\n\u8BF7\u751F\u6210\u4EE5\u4E0B\u5185\u5BB9\uFF1A\n1. \u6807\u9898\uFF0815-25\u5B57\u7684\u4E2D\u6587\uFF0C\u5E261-2\u4E2A\u8868\u60C5\u7B26\u53F7\uFF09\n2. \u82F1\u8BED\u5BF9\u8BDD\uFF08\u8981\u5305\u542B\u573A\u666F\u4E2D\u7684\u4E13\u4E1A\u672F\u8BED\uFF09\n3. \u91CD\u70B9\u8BCD\u6C47\uFF08\u4ECE\u5BF9\u8BDD\u4E2D\u63D0\u53D6\uFF09\n4. \u5173\u952E\u77ED\u8BED\uFF08\u4ECE\u5BF9\u8BDD\u4E2D\u63D0\u53D6\uFF09\n5. \u5B66\u4E60\u8981\u70B9\n6. \u76F8\u5173\u6807\u7B7E\uFF08\u4ECE\u5BF9\u8BDD\u5185\u5BB9\u63D0\u53D62-3\u4E2A\uFF09\n\n\u8FD4\u56DE\u683C\u5F0F\u793A\u4F8B\uFF1A\n{\n  \"title\": \"\u793A\u4F8B\u6807\u9898\",\n  \"content\": \"\u5BF9\u8BDD\u5185\u5BB9\",\n  \"vocabularies\": [\n    {\n      \"word\": \"\u793A\u4F8B\u5355\u8BCD\",\n      \"phonetic\": \"/\u97F3\u6807/\",\n      \"meaning\": \"\u542B\u4E49\",\n      \"example\": \"\u4F8B\u53E5\",\n      \"translation\": \"\u7FFB\u8BD1\"\n    }\n  ],\n  \"key_phrases\": [\n    {\n      \"phrase\": \"\u793A\u4F8B\u77ED\u8BED\",\n      \"meaning\": \"\u542B\u4E49\",\n      \"category\": \"\u5206\u7C7B\",\n      \"example\": \"\u4F8B\u53E5\",\n      \"translation\": \"\u7FFB\u8BD1\"\n    }\n  ],\n  \"learning_points\": [\"\u8981\u70B91\", \"\u8981\u70B92\"],\n  \"tags\": [\"\u6807\u7B7E1\", \"\u6807\u7B7E2\"]\n}");
                    console.log('正在生成文章内容...');
                    console.log('文章生成提示词:', contentPrompt);
                    return [4 /*yield*/, APIConfig.makeRequest([
                            {
                                role: "system",
                                content: "你是一个专业的英语教育内容创作者。请确保返回严格的JSON格式数据，所有字符串都必须使用双引号，不要添加任何额外的格式标记。"
                            },
                            {
                                role: "user",
                                content: contentPrompt
                            }
                        ], {
                            temperature: 0.7,
                            response_format: { type: "json_object" }
                        })];
                case 1:
                    response = _a.sent();
                    console.log('原始API响应:', response);
                    try {
                        rawArticle = JSON.parse(response);
                        processedContent = typeof rawArticle.content === 'string'
                            ? rawArticle.content.split('\n').map(function (line) {
                                var _a = line.split(':'), speaker = _a[0], contentParts = _a.slice(1);
                                return {
                                    speaker: speaker.trim(),
                                    content: contentParts.join(':').trim()
                                };
                            })
                            : rawArticle.content;
                        article = __assign(__assign({}, rawArticle), { content: processedContent });
                        console.log('文章内容生成完成:', article);
                        return [2 /*return*/, article];
                    }
                    catch (error) {
                        console.error('JSON解析失败，尝试清理:', error);
                        cleanedResponse = cleanJsonResponse(response);
                        console.log('清理后的响应:', cleanedResponse);
                        rawArticle = JSON.parse(cleanedResponse);
                        processedContent = typeof rawArticle.content === 'string'
                            ? rawArticle.content.split('\n').map(function (line) {
                                var _a = line.split(':'), speaker = _a[0], contentParts = _a.slice(1);
                                return {
                                    speaker: speaker.trim(),
                                    content: contentParts.join(':').trim()
                                };
                            })
                            : rawArticle.content;
                        article = __assign(__assign({}, rawArticle), { content: processedContent });
                        return [2 /*return*/, article];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// 修改生成单篇文章的函数
function generateArticle(tags, level) {
    return __awaiter(this, void 0, void 0, function () {
        var scene, _a, user, userError, articleTags, articleLevel, articleContent, date, article, now, timestamp, safeTitle, fileName, filePath, dirPath, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    console.log('\n=== 开始生成单篇文章 ===');
                    // 1. 获取随机场景
                    console.log('\n--- 第一步：获取随机场景 ---');
                    return [4 /*yield*/, getRandomScene()];
                case 1:
                    scene = _b.sent();
                    console.log('获取到的场景：', scene);
                    return [4 /*yield*/, supabase
                            .from('users')
                            .select('*')
                            .eq('user_id', scene.user_id)
                            .single()];
                case 2:
                    _a = _b.sent(), user = _a.data, userError = _a.error;
                    if (userError || !user) {
                        console.error('获取用户失败:', userError);
                        throw new Error('无法找到匹配的用户');
                    }
                    articleTags = Array.from(new Set(__spreadArray(__spreadArray([], scene.topics, true), scene.professional_terms, true)));
                    articleLevel = user.level;
                    console.log('生成参数：', {
                        author: user.name,
                        tags: articleTags.join(', '),
                        level: articleLevel,
                        background: user.background_story
                    });
                    // 4. 生成文章内容
                    console.log('\n--- 第二步：生成文章内容 ---');
                    return [4 /*yield*/, generateArticleWithScene(user, scene)];
                case 3:
                    articleContent = _b.sent();
                    date = new Date();
                    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
                    article = {
                        title: articleContent.title,
                        content: articleContent.content,
                        level: articleLevel,
                        tags: articleTags,
                        created_at: date.toISOString(),
                        vocabularies: articleContent.vocabularies,
                        key_phrases: articleContent.key_phrases,
                        learning_points: articleContent.learning_points,
                        user_id: user.user_id,
                        user: user,
                        scene: scene
                    };
                    now = new Date();
                    timestamp = now.toISOString()
                        .replace(/T/, '_')
                        .replace(/\..+/, '')
                        .replace(/[-:]/g, '')
                        .slice(0, 15);
                    safeTitle = article.title
                        .replace(/[「」【】]/g, '')
                        .replace(/[^\w\s\u4e00-\u9fa5]/g, '_')
                        .replace(/\s+/g, '_')
                        .slice(0, 50);
                    fileName = "".concat(timestamp, "_").concat(safeTitle, ".json");
                    filePath = path.join(__dirname, 'generated', fileName);
                    dirPath = path.dirname(filePath);
                    if (!fs.existsSync(dirPath)) {
                        fs.mkdirSync(dirPath, { recursive: true });
                    }
                    // 9. 检查数据完整性
                    console.log('检查文章数据完整性...');
                    if (!article.title || !Array.isArray(article.content) || article.content.length === 0 || !article.vocabularies || !article.key_phrases || !article.learning_points) {
                        console.error('文章数据不完整：', article);
                        throw new Error('文章数据不完整');
                    }
                    // 10. 写入文件
                    try {
                        fs.writeFileSync(filePath, JSON.stringify({
                            generated_time: now.toISOString(),
                            article: article
                        }, null, 2), 'utf8');
                        console.log('文章已保存到:', filePath);
                    }
                    catch (writeError) {
                        console.error('保存文件失败：', writeError);
                        throw writeError;
                    }
                    console.log('文章生成完成：', {
                        title: article.title,
                        dialogueCount: article.content.length,
                        vocabCount: article.vocabularies.length,
                        phrasesCount: article.key_phrases.length,
                        pointsCount: article.learning_points.length,
                        sceneCategory: article.scene.category
                    });
                    console.log('=== 文章生成结束 ===\n');
                    return [2 /*return*/, article];
                case 4:
                    error_3 = _b.sent();
                    console.error('生成文章失败，详细错误：', error_3);
                    console.error('错误堆栈：', error_3 instanceof Error ? error_3.stack : '未知错误');
                    throw error_3;
                case 5: return [2 /*return*/];
            }
        });
    });
}
// 检查最新生成的文章
function checkLatestArticle() {
    return __awaiter(this, void 0, void 0, function () {
        var generatedDir_1, files, latestFile, content, article, isValid;
        return __generator(this, function (_a) {
            try {
                console.log('\n=== 检查最新生成的文章 ===');
                generatedDir_1 = path.join(__dirname, 'generated');
                if (!fs.existsSync(generatedDir_1)) {
                    console.log('生成目录不存在');
                    return [2 /*return*/, false];
                }
                files = fs.readdirSync(generatedDir_1)
                    .filter(function (file) { return file.endsWith('.json'); })
                    .map(function (file) { return ({
                    name: file,
                    path: path.join(generatedDir_1, file),
                    time: fs.statSync(path.join(generatedDir_1, file)).mtime.getTime()
                }); })
                    .sort(function (a, b) { return b.time - a.time; });
                if (files.length === 0) {
                    console.log('目录中没有文章文件');
                    return [2 /*return*/, false];
                }
                latestFile = files[0];
                console.log('最新生成的文章:', latestFile.name);
                content = fs.readFileSync(latestFile.path, 'utf8');
                article = JSON.parse(content);
                isValid = article.article &&
                    article.article.title &&
                    article.article.content &&
                    article.article.vocabularies &&
                    article.article.key_phrases &&
                    article.article.learning_points;
                if (isValid) {
                    console.log('文章数据完整性检查通过');
                    console.log('标题:', article.article.title);
                    console.log('内容长度:', article.article.content.length);
                    console.log('生词数量:', article.article.vocabularies.length);
                    console.log('短语数量:', article.article.key_phrases.length);
                    console.log('学习要点数量:', article.article.learning_points.length);
                    console.log('=== 检查完成 ===\n');
                    return [2 /*return*/, true];
                }
                else {
                    console.log('文章数据不完整');
                    console.log('=== 检查完成 ===\n');
                    return [2 /*return*/, false];
                }
            }
            catch (error) {
                console.error('检查文章时发生错误:', error);
                return [2 /*return*/, false];
            }
            return [2 /*return*/];
        });
    });
}
// 生成所有文章
function generateAllArticles(count) {
    return __awaiter(this, void 0, void 0, function () {
        var articles, i, article, isValid, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\n=== 开始批量生成文章 ===');
                    console.log("\u8BA1\u5212\u751F\u6210\u6587\u7AE0\u6570\u91CF: ".concat(count));
                    console.log('开始时间:', new Date().toISOString());
                    articles = [];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < count)) return [3 /*break*/, 10];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, , 9]);
                    console.log("\n--- \u5F00\u59CB\u751F\u6210\u7B2C ".concat(i + 1, "/").concat(count, " \u7BC7\u6587\u7AE0 ---"));
                    console.log('当前时间:', new Date().toISOString());
                    return [4 /*yield*/, generateArticle([], '')];
                case 3:
                    article = _a.sent();
                    articles.push(article);
                    console.log("\u7B2C ".concat(i + 1, " \u7BC7\u6587\u7AE0\u751F\u6210\u5B8C\u6210\n"));
                    return [4 /*yield*/, checkLatestArticle()];
                case 4:
                    isValid = _a.sent();
                    if (!isValid) {
                        console.log('最新文章检查失败，停止生成');
                        return [3 /*break*/, 10];
                    }
                    if (!(i < count - 1)) return [3 /*break*/, 6];
                    console.log('等待10秒后继续生成下一篇...');
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 10000); })];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [3 /*break*/, 9];
                case 7:
                    error_4 = _a.sent();
                    console.error("\u751F\u6210\u7B2C ".concat(i + 1, " \u7BC7\u6587\u7AE0\u5931\u8D25:"), error_4);
                    console.error('错误堆栈:', error_4 instanceof Error ? error_4.stack : '未知错误');
                    console.error('继续生成下一篇...\n');
                    // 在出错后等待更长时间
                    console.log('出错后等待15秒再继续...');
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 15000); })];
                case 8:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 9:
                    i++;
                    return [3 /*break*/, 1];
                case 10:
                    console.log("\n=== \u6279\u91CF\u751F\u6210\u5B8C\u6210 ===");
                    console.log('结束时间:', new Date().toISOString());
                    console.log("\u6210\u529F\u751F\u6210\u6587\u7AE0\u6570\u91CF: ".concat(articles.length, "/").concat(count));
                    return [2 /*return*/, articles];
            }
        });
    });
}
// 将文章保存为CSV
function saveToCSV(articles) {
    return __awaiter(this, void 0, void 0, function () {
        var csvWriter, records;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
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
                    records = articles.map(function (article) { return (__assign(__assign({}, article), { vocabularies: JSON.stringify(article.vocabularies), key_phrases: JSON.stringify(article.key_phrases), learning_points: JSON.stringify(article.learning_points), user: JSON.stringify(article.user) })); });
                    return [4 /*yield*/, csvWriter.writeRecords(records)];
                case 1:
                    _a.sent();
                    console.log('CSV文件已成功生成');
                    return [2 /*return*/];
            }
        });
    });
}
// 将文章保存到 Supabase
function saveToSupabase(articles) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, articles_1, article, articleData, _a, data, error, error_5;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('开始保存文章到数据库...');
                    _i = 0, articles_1 = articles;
                    _b.label = 1;
                case 1:
                    if (!(_i < articles_1.length)) return [3 /*break*/, 7];
                    article = articles_1[_i];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 5, , 6]);
                    articleData = {
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
                        comments_count: 0,
                        scene: article.scene
                    };
                    // 打印要保存的数据（用于调试）
                    console.log('准备保存的文章数据:', JSON.stringify(articleData, null, 2));
                    return [4 /*yield*/, supabase
                            .from('articles')
                            .insert([articleData])
                            .select('article_id, title')
                            .single()];
                case 3:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('保存文章失败:', {
                            message: error.message,
                            details: error.details,
                            hint: error.hint,
                            code: error.code // 添加错误代码
                        });
                    }
                    else {
                        console.log("\u6587\u7AE0 \"".concat(data.title, "\" \u5DF2\u6210\u529F\u4FDD\u5B58\u5230\u6570\u636E\u5E93\uFF0CID: ").concat(data.article_id));
                    }
                    // 添加延迟以避免可能的速率限制
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                case 4:
                    // 添加延迟以避免可能的速率限制
                    _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    error_5 = _b.sent();
                    console.error('保存文章时发生错误:', error_5);
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7:
                    console.log('所有文章保存完成！');
                    return [2 /*return*/];
            }
        });
    });
}
// 将文章保存为本地 JSON 文件
function saveToLocalJson(articles) {
    return __awaiter(this, void 0, void 0, function () {
        var result, filePath, dirPath;
        return __generator(this, function (_a) {
            console.log('\n=== 开始保存到本地 JSON 文件 ===');
            try {
                result = {
                    generated_time: new Date().toISOString(),
                    articles: articles
                };
                filePath = path.join(__dirname, 'generated_articles.json');
                console.log('保存路径：', filePath);
                console.log('文章数量：', articles.length);
                console.log('正在写入文件...');
                dirPath = path.dirname(filePath);
                if (!fs.existsSync(dirPath)) {
                    console.log('创建目录：', dirPath);
                    fs.mkdirSync(dirPath, { recursive: true });
                }
                // 写入文件
                fs.writeFileSync(filePath, JSON.stringify(result, null, 2), { encoding: 'utf8', flag: 'w' });
                console.log('文件保存成功！');
                console.log('=== 保存完成 ===\n');
            }
            catch (error) {
                console.error('保存文件失败：', error);
                throw error;
            }
            return [2 /*return*/];
        });
    });
}
// 测试生成单篇文章
function testGenerateOneArticle() {
    return __awaiter(this, void 0, void 0, function () {
        var user, testTags, testLevel, article, testResult, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('开始测试生成单篇文章...\n');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, getRandomUser()];
                case 2:
                    user = _a.sent();
                    testTags = selectTagsBasedOnUser(user);
                    testLevel = user.level;
                    console.log('测试参数：');
                    console.log('作者:', user.name);
                    console.log('用户标签:', user.tags.join(', '));
                    console.log('背景:', user.background_story);
                    console.log('选择的文章标签:', testTags);
                    console.log('选择的难度:', testLevel, '\n');
                    return [4 /*yield*/, generateArticle(testTags, testLevel)];
                case 3:
                    article = _a.sent();
                    // 验证文章格式
                    console.log('生成的文章：');
                    console.log('----------------------------------------');
                    console.log('标题:', article.title);
                    console.log('----------------------------------------');
                    console.log('对话内容:');
                    article.content.forEach(function (dialogue) {
                        console.log("".concat(dialogue.speaker, ": ").concat(dialogue.content));
                    });
                    console.log('----------------------------------------');
                    console.log('生词:', article.vocabularies.length, '个');
                    article.vocabularies.forEach(function (v) {
                        console.log("- ".concat(v.word, " ").concat(v.phonetic, ": ").concat(v.meaning));
                        console.log("  \u4F8B\u53E5: ".concat(v.example));
                        console.log("  \u7FFB\u8BD1: ".concat(v.translation, "\n"));
                    });
                    console.log('----------------------------------------');
                    console.log('短语:', article.key_phrases.length, '个');
                    article.key_phrases.forEach(function (p) {
                        console.log("- ".concat(p.phrase, " (").concat(p.category, "): ").concat(p.meaning));
                        console.log("  \u4F8B\u53E5: ".concat(p.example));
                        console.log("  \u7FFB\u8BD1: ".concat(p.translation, "\n"));
                    });
                    console.log('----------------------------------------');
                    console.log('学习要点:');
                    article.learning_points.forEach(function (p) { return console.log("- ".concat(p)); });
                    console.log('----------------------------------------');
                    console.log('作者信息:');
                    console.log('- 名字:', article.user.name);
                    console.log('- 性别:', article.user.gender);
                    console.log('- 背景:', article.user.background_story);
                    console.log('- 标签:', article.user.tags.join(', '));
                    console.log('----------------------------------------');
                    // 保存到 Supabase
                    return [4 /*yield*/, saveToSupabase([article])];
                case 4:
                    // 保存到 Supabase
                    _a.sent();
                    testResult = {
                        test_time: new Date().toISOString(),
                        article: article
                    };
                    fs.writeFileSync(path.join(__dirname, 'test_result.json'), JSON.stringify(testResult, null, 2), 'utf8');
                    console.log('\n测试完成！结果已保存到 test_result.json 和数据库');
                    return [3 /*break*/, 6];
                case 5:
                    error_6 = _a.sent();
                    console.error('测试失败:', error_6);
                    process.exit(1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// 主函数
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var isTest, shouldSaveToSupabase, articles, user, testTags, testLevel, article, testResult, articleCount, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!APIConfig.apiKey) {
                        console.error('请在.env文件中设置ZHIPU_API_KEY');
                        process.exit(1);
                    }
                    isTest = process.argv[2] === 'test';
                    shouldSaveToSupabase = process.argv[3] === '--save-to-supabase';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 10, , 11]);
                    articles = [];
                    if (!isTest) return [3 /*break*/, 4];
                    return [4 /*yield*/, getRandomUser()];
                case 2:
                    user = _a.sent();
                    testTags = selectTagsBasedOnUser(user);
                    testLevel = user.level;
                    return [4 /*yield*/, generateArticle(testTags, testLevel)];
                case 3:
                    article = _a.sent();
                    articles = [article];
                    testResult = {
                        test_time: new Date().toISOString(),
                        article: article
                    };
                    fs.writeFileSync(path.join(__dirname, 'test_result.json'), JSON.stringify(testResult, null, 2), 'utf8');
                    console.log('测试结果已保存到 test_result.json');
                    return [3 /*break*/, 6];
                case 4:
                    articleCount = process.argv[2] ? parseInt(process.argv[2]) : 10;
                    console.log("\u5F00\u59CB\u751F\u6210 ".concat(articleCount, " \u7BC7\u6587\u7AE0..."));
                    return [4 /*yield*/, generateAllArticles(articleCount)];
                case 5:
                    articles = _a.sent();
                    _a.label = 6;
                case 6:
                    // 无论是测试模式还是正常模式，都保存到本地 JSON 文件
                    console.log('准备保存文章到本地文件...');
                    return [4 /*yield*/, saveToLocalJson(articles)];
                case 7:
                    _a.sent();
                    if (!shouldSaveToSupabase) return [3 /*break*/, 9];
                    console.log('准备保存文章到 Supabase...');
                    return [4 /*yield*/, saveToSupabase(articles)];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9:
                    console.log('所有操作完成！');
                    return [3 /*break*/, 11];
                case 10:
                    error_7 = _a.sent();
                    console.error('生成或保存文章失败:', error_7);
                    process.exit(1);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
main();
