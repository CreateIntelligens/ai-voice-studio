# 🎯 AI Voice Studio - 智能文字轉語音服務

一個基於 Docker 的 AI 文字轉語音服務，提供現代化的網頁界面和完整的 API 支援。

## ✨ 特色功能

- 🚀 **一鍵部署**: 使用 Docker Compose 快速啟動
- 🎨 **現代化網頁界面**: 響應式設計，支援桌面和手機
- 🎯 **預配置聲音**: 管理員預先設定多種聲音選項
- 🔄 **熱重載**: 修改代碼無需重新構建容器
- 🎛️ **靈活配置**: 通過 JSON 檔案管理聲音配置
- 📱 **簡潔操作**: 只需選擇聲音和輸入文字
- 🎵 **即時播放**: 生成後立即播放和下載音頻

## 📦 快速開始

### 環境需求

- Docker 20.10+
- Docker Compose 2.0+
- NVIDIA GPU (推薦，用於加速推理)
- NVIDIA Container Toolkit (GPU 支援)

### 🚀 一鍵啟動

```bash
# 進入項目目錄
cd ai-voice-studio

# 啟動服務
docker-compose up -d

# 查看日誌
docker-compose logs -f
```

### 🌐 訪問服務

- **網頁界面**: http://localhost:8085
- **API 端點**: http://localhost:50000

## ⚙️ 配置說明

### 🔧 環境變數設定

**首次使用前，請先設定環境變數：**

1. 複製環境變數範本：
   ```bash
   cp .env.sample .env
   ```

2. 編輯 `.env` 檔案，設定您的實際配置值：
   ```bash
   nano .env
   # 或使用您偏好的編輯器
   ```

3. 確保模型檔案路徑正確且存在

⚠️ **重要提醒**: `.env` 檔案包含敏感資訊，已加入 `.gitignore` 不會上傳到版本控制。

### 環境變數配置 (.env)

```env
# 模型配置 (請修改為您的實際模型路徑)
MODEL_DIR=./models/your-model-directory/
# 範例: MODEL_DIR=./models/cosyvoice-300m/
# 範例: MODEL_DIR=/path/to/your/models/

# 服務端口
PORT=50000
WEB_PORT=8085

# Docker 項目名稱
COMPOSE_PROJECT_NAME=ai-voice-studio
```

### 聲音配置管理

#### 配置檔案說明
- `config/voices.example.json` - 範例配置檔案（提交到 Git）
- `config/voices.local.json` - 您的個人配置（Git 忽略）
- `config/audio_samples/` - 語音樣本目錄

#### 首次設定
1. 複製範例配置：
   ```bash
   cp config/voices.example.json config/voices.local.json
   ```
2. 編輯 `config/voices.local.json` 添加您的聲音配置
3. 將語音樣本檔案放入 `config/audio_samples/` 目錄
4. 重啟服務以載入新配置

#### 聲音配置格式

```json
{
  "voices": [
    {
      "id": "gentle_female",
      "name": "溫柔女聲",
      "prompt_text": "你好，歡迎使用我們的語音服務",
      "audio_file": "gentle_female.wav",
      "seed": 12345,
      "description": "適合客服、朗讀等溫和場景"
    }
  ]
}
```

#### 添加新聲音

1. 將語音樣本檔案放入 `config/audio_samples/` 目錄
2. 在 `config/voices.local.json` 中添加對應配置
3. 重啟服務：`docker-compose restart ai-voice-studio`

#### 配置檔案自動選擇
系統會自動選擇配置檔案：
- 如果存在 `voices.local.json`，優先使用個人配置
- 如果不存在，則使用 `voices.example.json` 範例配置
- 啟動時會在日誌中顯示使用的配置檔案

## 📁 目錄結構

```
ai-voice-studio/
├── README.md              # 本說明文件
├── .env                   # 環境變數配置
├── .gitignore            # Git 忽略檔案
├── .dockerignore         # Docker 忽略檔案
├── docker-compose.yaml   # Docker Compose 配置
├── Dockerfile            # Docker 映像檔配置
├── nginx.conf            # Nginx 配置
├── start.sh              # 容器啟動腳本
├── config/               # 配置檔案目錄
│   ├── voices.example.json  # 範例配置檔案
│   ├── voices.local.json    # 個人配置檔案（Git 忽略）
│   └── audio_samples/       # 語音樣本目錄
├── web/                  # 網頁界面
│   ├── index.html        # 主頁面
│   ├── style.css         # 樣式檔案
│   └── script.js         # JavaScript 邏輯
├── cosyvoice/            # AI 引擎核心代碼
├── models/               # 模型檔案目錄
├── runtime/              # 運行時檔案
├── third_party/          # 第三方依賴
└── requirements.txt      # Python 依賴
```

## 🎨 網頁功能

### 主要功能
- **聲音選擇**: 從預配置的聲音類型中選擇
- **文字輸入**: 支援最多 500 字元的文字轉語音
- **即時播放**: 生成完成後立即播放音頻
- **下載功能**: 一鍵下載生成的音頻檔案

### 支援格式
- **輸入音頻**: WAV, MP3, FLAC 等常見格式
- **輸出音頻**: WAV 格式 (22.05kHz, 16-bit)
- **檔案大小**: 語音樣本建議小於 10MB

## 🚀 API 使用

### 主要端點

#### GET /api/voices

獲取可用的聲音配置列表。

**回應範例**:
```json
{
  "voices": [
    {
      "id": "gentle_female",
      "name": "溫柔女聲",
      "description": "適合客服、朗讀等溫和場景"
    }
  ]
}
```

#### POST /api/inference_with_voice_config

使用預配置聲音進行語音合成。

**請求參數**:
```
tts_text: 要轉換的文字 (必填)
voice_id: 聲音配置 ID (必填)
```

**請求範例**:
```bash
curl -X POST http://localhost:50000/inference_with_voice_config \
  -F "tts_text=你好，這是一個測試" \
  -F "voice_id=gentle_female" \
  --output output.wav
```

**回應**: WAV 格式音頻檔案

### 其他可用端點

- `POST /inference_zero_shot_wav`: 原始 Zero-shot 模式 (需上傳音頻)
- `POST /inference_sft`: SFT 模式語音合成
- `POST /inference_cross_lingual`: 跨語言語音合成
- `POST /inference_instruct`: 指令式語音合成

## 🛠️ 開發指南

### 本地開發

```bash
# 進入容器進行除錯
docker-compose exec ai-voice-studio bash

# 查看服務狀態
docker-compose ps

# 重啟特定服務
docker-compose restart ai-voice-studio
```

### 代碼修改

由於使用了 volume 掛載，您可以直接修改本地檔案：

- **網頁檔案**: `web/` 目錄下的檔案修改後立即生效
- **配置檔案**: 修改 `config/voices.local.json` 後需重啟容器
- **Python 代碼**: 修改後需重啟容器

### 日誌查看

```bash
# 查看所有服務日誌
docker-compose logs

# 查看特定服務日誌
docker-compose logs ai-voice-studio

# 即時跟蹤日誌
docker-compose logs -f
```

## 🔧 進階配置

### GPU 支援

確保已安裝 NVIDIA Container Toolkit：

```bash
# Ubuntu/Debian
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker
```

### 端口修改

修改 `.env` 檔案中的端口設定：

```env
PORT=8000          # API 端口
WEB_PORT=3000      # 網頁端口
```

### 記憶體優化

對於記憶體較小的系統，可以調整 Docker 配置：

```yaml
# docker-compose.yaml
services:
  ai-voice-studio:
    deploy:
      resources:
        limits:
          memory: 8G
        reservations:
          memory: 4G
```

## 📝 故障排除

### 常見問題

#### 1. 容器啟動失敗
```bash
# 檢查日誌
docker-compose logs ai-voice-studio

# 檢查端口占用
netstat -tulpn | grep :50000
```

#### 2. GPU 不可用
```bash
# 檢查 GPU 狀態
nvidia-smi

# 檢查 Docker GPU 支援
docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi
```

#### 3. 聲音配置載入失敗
- 確認 `config/voices.local.json` 或 `config/voices.example.json` 格式正確
- 檢查語音樣本檔案是否存在於 `config/audio_samples/`
- 確認檔案路徑和檔名匹配

#### 4. 網頁無法訪問
- 檢查防火牆設定
- 確認端口映射正確
- 檢查 Nginx 配置

### 性能優化

#### 1. 模型載入優化
```env
# 使用 SSD 存儲模型
MODEL_DIR=/fast-storage/models/your-model-directory/
```

#### 2. 記憶體優化
```bash
# 清理未使用的 Docker 資源
docker system prune -a
```

#### 3. 網路優化
```yaml
# docker-compose.yaml 中添加
networks:
  ai-voice-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```


## 🙏 致謝

本項目基於以下開源項目構建：

- **CosyVoice**: [Apache License 2.0](https://github.com/FunAudioLLM/CosyVoice) - 提供核心 AI 語音合成技術
- **FastAPI**: 高性能 Web 框架
- **Docker**: 容器化部署方案

感謝開源社群的貢獻，讓 AI 技術更加普及和易用。



---

**享受 AI 語音合成的樂趣！** 🎉
