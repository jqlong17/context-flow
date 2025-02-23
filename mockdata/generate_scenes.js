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
exports.__esModule = true;
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
        get: function () {
            return {
                'Content-Type': 'application/json',
                'Authorization': "Bearer ".concat(this.apiKey)
            };
        },
        enumerable: false,
        configurable: true
    });
    APIConfig.makeRequest = function (messages, customConfig) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var maxRetries, retryCount, lastError, _loop_1, this_1, state_1;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        maxRetries = 3;
                        retryCount = 0;
                        lastError = null;
                        _loop_1 = function () {
                            var defaultBody, response, error_1, delay_1;
                            return __generator(this, function (_f) {
                                switch (_f.label) {
                                    case 0:
                                        _f.trys.push([0, 2, , 5]);
                                        console.log("\n[API\u8BF7\u6C42] \u7B2C ".concat(retryCount + 1, " \u6B21\u5C1D\u8BD5"));
                                        defaultBody = __assign({ model: this_1.model, messages: messages, temperature: this_1.defaults.temperature, top_p: this_1.defaults.topP, max_tokens: this_1.defaults.maxTokens, stream: this_1.defaults.stream }, customConfig);
                                        return [4 /*yield*/, axios_1["default"].post(this_1.baseURL, defaultBody, {
                                                headers: this_1.headers,
                                                timeout: 120000
                                            })];
                                    case 1:
                                        response = _f.sent();
                                        if (!((_d = (_c = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.choices) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content)) {
                                            throw new Error('API响应格式不正确');
                                        }
                                        return [2 /*return*/, { value: response.data.choices[0].message.content }];
                                    case 2:
                                        error_1 = _f.sent();
                                        lastError = error_1;
                                        retryCount++;
                                        if (!(retryCount < maxRetries)) return [3 /*break*/, 4];
                                        delay_1 = Math.pow(2, retryCount) * 2000;
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delay_1); })];
                                    case 3:
                                        _f.sent();
                                        _f.label = 4;
                                    case 4: return [3 /*break*/, 5];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _e.label = 1;
                    case 1:
                        if (!(retryCount < maxRetries)) return [3 /*break*/, 3];
                        return [5 /*yield**/, _loop_1()];
                    case 2:
                        state_1 = _e.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        return [3 /*break*/, 1];
                    case 3: throw lastError;
                }
            });
        });
    };
    APIConfig.baseURL = process.env.ZHIPU_API_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    APIConfig.apiKey = process.env.ZHIPU_API_KEY;
    APIConfig.model = 'glm-4-flash';
    APIConfig.defaults = {
        temperature: 0.95,
        topP: 0.7,
        maxTokens: 4095,
        stream: false
    };
    return APIConfig;
}());
// 获取随机用户
function getRandomUser() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, users, error, randomUser, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, supabase
                            .from('users')
                            .select('user_id, name, avatar, style_description, gender, background_story, tags, level')
                            .limit(10)];
                case 1:
                    _a = _b.sent(), users = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    if (!users || users.length === 0)
                        throw new Error('没有找到可用的作者');
                    randomUser = users[Math.floor(Math.random() * users.length)];
                    return [2 /*return*/, randomUser];
                case 2:
                    error_2 = _b.sent();
                    console.error('获取随机作者失败:', error_2);
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    });
}
// 生成场景
function generateScene(user) {
    return __awaiter(this, void 0, void 0, function () {
        var timeOfDay, weather, mood, season, scenePrompt, response, sceneData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    timeOfDay = ['morning', 'afternoon', 'evening'][Math.floor(Math.random() * 3)];
                    weather = ['sunny', 'rainy', 'cloudy', 'snowy'][Math.floor(Math.random() * 4)];
                    mood = ['energetic', 'relaxed', 'focused', 'creative'][Math.floor(Math.random() * 4)];
                    season = ['spring', 'summer', 'autumn', 'winter'][Math.floor(Math.random() * 4)];
                    scenePrompt = "\u8BF7\u751F\u6210\u4E00\u4E2A\u4E0E\u7528\u6237\u80CC\u666F\u76F8\u5173\u7684\u82F1\u8BED\u5B66\u4E60\u573A\u666F\u3002\u8BF7\u6CE8\u610F\uFF1A\u5FC5\u987B\u8FD4\u56DE\u4E25\u683C\u7684JSON\u683C\u5F0F\uFF0C\u4E0D\u8981\u5305\u542B\u4EFB\u4F55\u989D\u5916\u7684\u683C\u5F0F\u6807\u8BB0\u6216\u6362\u884C\u7B26\u3002\n\n\u573A\u666F\u8981\u6C42\uFF1A\n1. \u65F6\u95F4\u8BBE\u5B9A\u5728 ".concat(timeOfDay, "\uFF0C").concat(season, " season\uFF0C\u5929\u6C14\u4E3A ").concat(weather, "\n2. \u7528\u6237\u5F53\u524D\u5FC3\u60C5\uFF1A").concat(mood, "\n3. \u6BCF\u6B21\u751F\u6210\u7684\u573A\u666F\u90FD\u5FC5\u987B\u72EC\u7279\uFF0C\u4E0D\u8981\u91CD\u590D\u76F8\u4F3C\u7684\u573A\u666F\n4. \u5145\u5206\u6316\u6398\u7528\u6237\u80CC\u666F\u6545\u4E8B\u4E2D\u7684\u4E0D\u540C\u4FA7\u9762\uFF0C\u521B\u9020\u591A\u6837\u5316\u7684\u573A\u666F\n5. \u8003\u8651\u7528\u6237\u5728\u4E0D\u540C\u65F6\u95F4\u3001\u4E0D\u540C\u5FC3\u60C5\u4E0B\u53EF\u80FD\u9047\u5230\u7684\u5404\u79CD\u60C5\u5883\n\n\u7528\u6237\u4FE1\u606F\uFF1A\n{\n  \"\u804C\u4E1A\u8EAB\u4EFD\": \"").concat(user.background_story, "\",\n  \"\u5174\u8DA3\u6807\u7B7E\": ").concat(JSON.stringify(user.tags), ",\n  \"\u82F1\u8BED\u6C34\u5E73\": \"").concat(user.level, "\",\n  \"\u6027\u522B\": \"").concat(user.gender, "\"\n}\n\n\u751F\u6210\u8981\u6C42\uFF1A\n1. \u573A\u666F\u5FC5\u987B\u4E0E\u7528\u6237\u7684\u5B9E\u9645\u7ECF\u5386\u548C\u4E13\u4E1A\u9886\u57DF\u9AD8\u5EA6\u76F8\u5173\n2. \u573A\u666F\u5E94\u8BE5\u662F\u7528\u6237\u5728\u5B9E\u9645\u5DE5\u4F5C/\u5B66\u4E60\u4E2D\u5F88\u53EF\u80FD\u9047\u5230\u7684\n3. \u53C2\u4E0E\u8005\u8EAB\u4EFD\u8981\u7B26\u5408\u7528\u6237\u7684\u804C\u4E1A\u73AF\u5883\n4. \u4EA4\u9645\u76EE\u6807\u8981\u53CD\u6620\u771F\u5B9E\u7684\u8BED\u8A00\u9700\u6C42\n5. \u4E13\u4E1A\u672F\u8BED\u8981\u7B26\u5408\u7528\u6237\u7684\u9886\u57DF\n6. \u786E\u4FDD\u573A\u666F\u5177\u6709\u72EC\u7279\u6027\uFF0C\u907F\u514D\u4E0E\u5176\u4ED6\u573A\u666F\u91CD\u590D\n7. \u6839\u636E\u65F6\u95F4\u3001\u5929\u6C14\u3001\u5FC3\u60C5\u7B49\u56E0\u7D20\u8C03\u6574\u573A\u666F\u7684\u5177\u4F53\u7EC6\u8282\n8. \u8003\u8651\u5B63\u8282\u6027\u548C\u65F6\u95F4\u7279\u70B9\u5BF9\u573A\u666F\u7684\u5F71\u54CD\n\n\u8BF7\u76F4\u63A5\u8FD4\u56DE\u5982\u4E0B\u683C\u5F0F\u7684JSON\u5B57\u7B26\u4E32\uFF08\u6CE8\u610F\uFF1A\u5FC5\u987B\u662F\u5355\u884C\uFF0C\u4E0D\u8981\u5305\u542B\u6362\u884C\u7B26\u548C\u989D\u5916\u7A7A\u683C\uFF09\uFF1A\n{\"category\":\"\u573A\u666F\u7C7B\u522B\",\"location\":\"\u5177\u4F53\u5730\u70B9\",\"situation\":\"\u5177\u4F53\u60C5\u5883\u7684\u8BE6\u7EC6\u63CF\u8FF0\",\"participants\":[\"\u53C2\u4E0E\u80051\",\"\u53C2\u4E0E\u80052\"],\"objectives\":[\"\u4EA4\u9645\u76EE\u68071\",\"\u4EA4\u9645\u76EE\u68072\"],\"topics\":[\"\u53EF\u80FD\u6D89\u53CA\u7684\u8BDD\u98981\",\"\u8BDD\u98982\"],\"professional_terms\":[\"\u76F8\u5173\u4E13\u4E1A\u672F\u8BED1\",\"\u672F\u8BED2\"]}");
                    return [4 /*yield*/, APIConfig.makeRequest([
                            {
                                role: "system",
                                content: "你是一个专业的英语教育场景设计专家。每次都要生成独特的场景，即使是相同的用户背景也要创造不同的情境。考虑时间、季节、天气和用户心情等因素，确保场景的多样性和真实性。请严格按照要求返回JSON格式数据，不要添加任何额外的格式标记或换行符。"
                            },
                            {
                                role: "user",
                                content: scenePrompt
                            }
                        ], {
                            temperature: 0.9,
                            top_p: 0.9,
                            presence_penalty: 0.6,
                            frequency_penalty: 0.6 // 减少重复内容的倾向
                        })];
                case 1:
                    response = _a.sent();
                    sceneData = JSON.parse(response);
                    // 添加时间和环境信息到场景中
                    return [2 /*return*/, __assign({ user_id: user.user_id, user_name: user.name, user_background: user.background_story, user_level: user.level, created_at: new Date().toISOString(), time_of_day: timeOfDay, weather: weather, season: season, mood: mood }, sceneData)];
            }
        });
    });
}
// 生成多个场景
function generateScenes(count) {
    return __awaiter(this, void 0, void 0, function () {
        var scenes, csvWriter, i, user, scene, processedScene, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\u5F00\u59CB\u751F\u6210 ".concat(count, " \u4E2A\u573A\u666F..."));
                    scenes = [];
                    csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
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
                        append: true // 启用追加模式
                    });
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < count)) return [3 /*break*/, 10];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 8, , 9]);
                    console.log("\n\u751F\u6210\u7B2C ".concat(i + 1, "/").concat(count, " \u4E2A\u573A\u666F"));
                    return [4 /*yield*/, getRandomUser()];
                case 3:
                    user = _a.sent();
                    return [4 /*yield*/, generateScene(user)];
                case 4:
                    scene = _a.sent();
                    scenes.push(scene);
                    processedScene = __assign(__assign({}, scene), { participants: JSON.stringify(scene.participants), objectives: JSON.stringify(scene.objectives), topics: JSON.stringify(scene.topics), professional_terms: JSON.stringify(scene.professional_terms) });
                    return [4 /*yield*/, csvWriter.writeRecords([processedScene])];
                case 5:
                    _a.sent();
                    console.log("\u7B2C ".concat(i + 1, " \u4E2A\u573A\u666F\u751F\u6210\u5B8C\u6210\u5E76\u5DF2\u4FDD\u5B58\u5230CSV"));
                    if (!(i < count - 1)) return [3 /*break*/, 7];
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7: return [3 /*break*/, 9];
                case 8:
                    error_3 = _a.sent();
                    console.error("\u751F\u6210\u7B2C ".concat(i + 1, " \u4E2A\u573A\u666F\u5931\u8D25:"), error_3);
                    return [3 /*break*/, 9];
                case 9:
                    i++;
                    return [3 /*break*/, 1];
                case 10: return [2 /*return*/, scenes];
            }
        });
    });
}
// 主函数
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var sceneCount, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!APIConfig.apiKey) {
                        console.error('请在.env文件中设置ZHIPU_API_KEY');
                        process.exit(1);
                    }
                    sceneCount = process.argv[2] ? parseInt(process.argv[2]) : 10;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    console.log('开始生成场景...');
                    return [4 /*yield*/, generateScenes(sceneCount)];
                case 2:
                    _a.sent();
                    console.log('场景生成完成！');
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    console.error('生成场景失败:', error_4);
                    process.exit(1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
main();
