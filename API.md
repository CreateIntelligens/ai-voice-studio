# AI Voice Studio API 文件

**Base URL：** `http://talk-dev.aitago.tw:8006`

---

## 推薦使用

> **建議優先使用 `/inference_with_translation`**
> 此 endpoint 會自動將繁體中文翻譯成台語後再合成語音，一次完成所有流程，無需前端自行處理翻譯步驟。

---

## Endpoints

### 1. `POST /inference_with_translation` ⭐ 推薦

自動將繁體中文翻譯成台語，再進行語音合成。整合翻譯 + TTS，一次完成。

**Request**

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `tts_text` | string | ✅ | 繁體中文輸入文字 |
| `voice_id` | string | ✅ | 聲音 ID（見聲音列表） |

**Content-Type：** `multipart/form-data`

**Response：** `audio/wav` 二進位音訊檔

**curl 範例：**

```bash
curl -X POST http://talk-dev.aitago.tw:8006/inference_with_translation \
  --form 'tts_text="這是一個好日子！你吃飽了嗎？附近有家餐廳好吃喔。一起去吃吧！"' \
  --form 'voice_id="gentle_female"' \
  --output output.wav
```

**Python 範例：**

```python
import requests

response = requests.post(
    'http://talk-dev.aitago.tw:8006/inference_with_translation',
    data={
        'tts_text': '這是一個好日子！你吃飽了嗎？',
        'voice_id': 'gentle_female'
    }
)
with open('output.wav', 'wb') as f:
    f.write(response.content)
```

**JavaScript 範例：**

```js
const formData = new FormData();
formData.append('tts_text', '這是一個好日子！你吃飽了嗎？');
formData.append('voice_id', 'gentle_female');

const response = await fetch('http://talk-dev.aitago.tw:8006/inference_with_translation', {
    method: 'POST',
    body: formData
});
const blob = await response.blob();
```

---

### 2. `GET /voices`

取得可用聲音列表。

**Request：** 無參數

**Response：** JSON

```json
{
  "voices": [
    {
      "id": "gentle_female",
      "name": "溫柔女聲",
      "description": "適合客服、朗讀等溫和場景",
      "seed": 6
    },
    {
      "id": "professional_male",
      "name": "沉穩男聲",
      "description": "商務簡報、新聞播報等正式場合",
      "seed": 671112
    }
  ]
}
```

**curl 範例：**

```bash
curl http://talk-dev.aitago.tw:8006/voices
```

---

### 3. `POST /inference_with_voice_config`

直接傳入文字（不做翻譯）進行語音合成。適合已自行處理台語文字的場景。

> 若輸入的是繁體中文，建議改用 `/inference_with_translation` 以獲得更好的台語發音。

**Request**

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `tts_text` | string | ✅ | 要合成的文字（建議台語文） |
| `voice_id` | string | ✅ | 聲音 ID |
| `original_text` | string | ❌ | 原始中文文字（僅供 log 記錄用） |

**Content-Type：** `multipart/form-data`

**Response：** `audio/wav` 二進位音訊檔

**curl 範例：**

```bash
curl -X POST http://talk-dev.aitago.tw:8006/inference_with_voice_config \
  --form 'tts_text="這是台語文字"' \
  --form 'voice_id="gentle_female"' \
  --output output.wav
```

---

### 4. `POST /inference_zero_shot`

使用上傳的語音樣本做 zero-shot 克隆合成（自訂說話人）。

**Request**

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `tts_text` | string | ✅ | 要合成的文字 |
| `prompt_text` | string | ✅ | 語音樣本的對應文字內容 |
| `prompt_wav` | file | ✅ | 語音樣本音訊檔（WAV/MP3） |
| `seed` | int | ❌ | 隨機種子，預設 0 |

**Content-Type：** `multipart/form-data`

**Response：** `audio/wav`（串流）

**curl 範例：**

```bash
curl -X POST http://talk-dev.aitago.tw:8006/inference_zero_shot \
  --form 'tts_text="你好，這是合成語音測試"' \
  --form 'prompt_text="語音樣本中說的文字"' \
  --form 'prompt_wav=@/path/to/sample.wav' \
  --form 'seed=42' \
  --output output.wav
```

---

### 5. `POST /inference_sft`

使用預訓練說話人 ID 合成語音（SFT 模式）。

**Request**

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `tts_text` | string | ✅ | 要合成的文字 |
| `spk_id` | string | ✅ | 說話人 ID |

**curl 範例：**

```bash
curl -X POST http://talk-dev.aitago.tw:8006/inference_sft \
  --form 'tts_text="你好世界"' \
  --form 'spk_id="中文女" ' \
  --output output.wav
```

---

## 聲音 ID 列表

| voice_id | 名稱 | 適用場景 |
|----------|------|---------|
| `gentle_female` | 溫柔女聲 | 客服、朗讀、溫和對話 |
| `professional_male` | 沉穩男聲 | 商務簡報、新聞播報 |

---

## 錯誤碼

| HTTP 狀態碼 | 說明 |
|-------------|------|
| `400` | 請求參數錯誤 |
| `404` | 找不到指定的 voice_id 或資源 |
| `500` | 語音合成內部錯誤 |
| `502` | 台語翻譯 API 呼叫失敗（僅 `/inference_with_translation`） |

---

## 透過 Nginx 代理存取

若透過 Web 入口（port 8085 / 8007）存取，所有路徑需加上 `/api/` 前綴：

```
http://talk-dev.aitago.tw:8007/api/inference_with_translation
http://talk-dev.aitago.tw:8007/api/voices
```
