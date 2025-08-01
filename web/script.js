// DOM elements
const ttsForm = document.getElementById('ttsForm');
const ttsText = document.getElementById('ttsText');
const voiceSelect = document.getElementById('voiceSelect');
const generateBtn = document.getElementById('generateBtn');
const loading = document.getElementById('loading');
const resultCard = document.getElementById('resultCard');
const audioPlayer = document.getElementById('audioPlayer');
const downloadBtn = document.getElementById('downloadBtn');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const charCount = document.getElementById('charCount');

// Global variables
let currentAudioBlob = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateCharCount();
    loadVoices();
});

function setupEventListeners() {
    // Form submission
    ttsForm.addEventListener('submit', handleFormSubmit);
    
    // Character count
    ttsText.addEventListener('input', updateCharCount);
    
    // Download button
    downloadBtn.addEventListener('click', downloadAudio);
}

function updateCharCount() {
    const count = ttsText.value.length;
    charCount.textContent = count;
    
    if (count > 500) {
        charCount.style.color = '#e53e3e';
    } else if (count > 400) {
        charCount.style.color = '#dd6b20';
    } else {
        charCount.style.color = '#666';
    }
}

async function loadVoices() {
    try {
        const response = await fetch('/api/voices');
        if (!response.ok) {
            throw new Error('無法載入聲音配置');
        }
        
        const data = await response.json();
        const voices = data.voices;
        
        // 清空現有選項
        voiceSelect.innerHTML = '<option value="">請選擇聲音類型...</option>';
        
        // 添加聲音選項
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.id;
            option.textContent = `${voice.name} - ${voice.description}`;
            voiceSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('載入聲音配置失敗:', error);
        showError('載入聲音配置失敗，請重新整理頁面');
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Show loading
    showLoading();
    hideError();
    hideResult();
    
    try {
        // Prepare form data
        const formData = new FormData();
        formData.append('tts_text', ttsText.value.trim());
        formData.append('voice_id', voiceSelect.value);
        
        // Make API request
        const response = await fetch('/api/inference_with_voice_config', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Get audio blob
        const audioBlob = await response.blob();
        currentAudioBlob = audioBlob;
        
        // Create audio URL and play
        const audioUrl = URL.createObjectURL(audioBlob);
        audioPlayer.src = audioUrl;
        
        // Show result
        showResult();
        
    } catch (error) {
        console.error('Error:', error);
        showError('生成語音時發生錯誤: ' + error.message);
    } finally {
        hideLoading();
    }
}

function validateForm() {
    // Check text input
    if (!ttsText.value.trim()) {
        showError('請輸入要轉換的文字');
        ttsText.focus();
        return false;
    }
    
    if (ttsText.value.length > 500) {
        showError('文字長度不能超過 500 字元');
        ttsText.focus();
        return false;
    }
    
    // Check voice selection
    if (!voiceSelect.value) {
        showError('請選擇聲音類型');
        voiceSelect.focus();
        return false;
    }
    
    return true;
}

function showLoading() {
    loading.style.display = 'block';
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>生成中...</span>';
}

function hideLoading() {
    loading.style.display = 'none';
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<i class="fas fa-play"></i><span>生成語音</span>';
}

function showResult() {
    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideResult() {
    resultCard.style.display = 'none';
}

function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    errorMessage.style.display = 'none';
}

function downloadAudio() {
    if (!currentAudioBlob) {
        showError('沒有可下載的音頻檔案');
        return;
    }
    
    const url = URL.createObjectURL(currentAudioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai_voice_${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Add some CSS for the select dropdown
const style = document.createElement('style');
style.textContent = `
    select {
        padding: 15px;
        border: 2px solid #e1e5e9;
        border-radius: 12px;
        font-size: 1rem;
        transition: all 0.3s ease;
        background: white;
        width: 100%;
        cursor: pointer;
    }
    
    select:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    select option {
        padding: 10px;
    }
`;
document.head.appendChild(style);

// Add keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + Enter to submit form
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        if (!generateBtn.disabled) {
            handleFormSubmit(event);
        }
    }
    
    // Escape to hide error
    if (event.key === 'Escape') {
        hideError();
    }
});

// Add tooltips for better UX
function addTooltips() {
    const tooltips = {
        'ttsText': '輸入您想要轉換成語音的文字內容',
        'voiceSelect': '選擇適合的聲音風格和語調'
    };
    
    Object.entries(tooltips).forEach(([id, text]) => {
        const element = document.getElementById(id);
        if (element) {
            element.title = text;
        }
    });
}

// Initialize tooltips
addTooltips();

// Performance optimization: Debounce character count update
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Replace the direct event listener with debounced version
ttsText.removeEventListener('input', updateCharCount);
ttsText.addEventListener('input', debounce(updateCharCount, 100));
