#!/bin/bash

# 设置错误处理
set -e

# 配置
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="${SCRIPT_DIR}/logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="${LOG_DIR}/generate_scenes_${TIMESTAMP}.log"
PID_FILE="${SCRIPT_DIR}/.generate_scenes.pid"
DEFAULT_SCENE_COUNT=10

# 创建日志目录
mkdir -p "$LOG_DIR"

# 日志函数
log() {
    local level=$1
    shift
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $*"
    echo "$message" | tee -a "$LOG_FILE"
}

# 检查是否已经有实例在运行
check_running() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            if [ "$pid" != "$$" ]; then
                log "ERROR" "另一个实例正在运行 (PID: $pid)"
                return 1
            fi
        else
            log "WARN" "发现过期的PID文件，将删除"
            rm -f "$PID_FILE"
        fi
    fi
    return 0
}

# 清理函数
cleanup() {
    log "INFO" "正在清理..."
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if [ "$pid" = "$$" ]; then
            rm -f "$PID_FILE"
        fi
    fi
    log "INFO" "清理完成"
}

# 设置清理钩子
trap cleanup EXIT

# 获取场景数量参数
SCENE_COUNT=${1:-$DEFAULT_SCENE_COUNT}

# 主函数
main() {
    local max_retries=3
    local retry_count=0
    
    # 记录开始时间
    local start_time=$(date +%s)
    
    log "INFO" "开始生成场景任务"
    log "INFO" "计划生成场景数量: $SCENE_COUNT"
    log "INFO" "日志文件: $LOG_FILE"
    
    # 检查环境
    if [ ! -f "${SCRIPT_DIR}/package.json" ]; then
        log "ERROR" "找不到 package.json 文件"
        exit 1
    fi
    
    # 检查并安装依赖
    if [ ! -d "${SCRIPT_DIR}/node_modules" ]; then
        log "INFO" "正在安装依赖..."
        npm install >> "$LOG_FILE" 2>&1
    fi
    
    # 记录当前进程ID
    echo $$ > "$PID_FILE"
    
    while [ $retry_count -lt $max_retries ]; do
        log "INFO" "尝试生成场景 (尝试 $((retry_count + 1))/$max_retries)"
        
        if cd "${SCRIPT_DIR}" && npx ts-node generate_scenes.ts "$SCENE_COUNT" >> "$LOG_FILE" 2>&1; then
            local end_time=$(date +%s)
            local duration=$((end_time - start_time))
            log "SUCCESS" "场景生成成功！"
            log "INFO" "总耗时: ${duration} 秒"
            exit 0
        else
            retry_count=$((retry_count + 1))
            if [ $retry_count -lt $max_retries ]; then
                log "WARN" "生成失败，等待30秒后重试..."
                sleep 30
            fi
        fi
    done
    
    log "ERROR" "生成场景失败，已达到最大重试次数"
    exit 1
}

# 检查是否要后台运行
if [ "$2" = "--background" ]; then
    # 检查是否已有实例在运行
    check_running || exit 1
    
    # 后台运行并将输出重定向到日志文件
    log "INFO" "启动后台任务..."
    nohup "$0" "$SCENE_COUNT" >> "$LOG_FILE" 2>&1 &
    
    # 记录后台进程ID
    bg_pid=$!
    echo $bg_pid > "$PID_FILE"
    log "INFO" "后台任务已启动 (PID: $bg_pid)"
    log "INFO" "可以通过以下命令查看日志："
    log "INFO" "tail -f $LOG_FILE"
else
    # 检查是否已有实例在运行
    check_running || exit 1
    
    # 前台运行
    main
fi 