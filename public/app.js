// API endpoint — 部署后替换为你的 Worker URL
const API_BASE = '/';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const loading = document.getElementById('loading');
const result = document.getElementById('result');
const error = document.getElementById('error');
const errorMessage = document.getElementById('error-message');
const originalPreview = document.getElementById('original-preview');
const resultPreview = document.getElementById('result-preview');
const downloadBtn = document.getElementById('download-btn');
const resetBtn = document.getElementById('reset-btn');
const errorReset = document.getElementById('error-reset');
const toast = document.getElementById('toast');

// Show toast
function showToast(msg, duration = 3000) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), duration);
}

// Show/hide sections
function showLoading() {
  result.classList.add('hidden');
  error.classList.add('hidden');
  loading.classList.remove('hidden');
}

function showResult(originalUrl, resultBlob) {
  loading.classList.add('hidden');
  error.classList.add('hidden');
  result.classList.remove('hidden');

  originalPreview.src = originalUrl;
  resultPreview.src = URL.createObjectURL(resultBlob);
  downloadBtn.href = URL.createObjectURL(resultBlob);
}

function showError(msg) {
  loading.classList.add('hidden');
  result.classList.add('hidden');
  error.classList.remove('hidden');
  errorMessage.textContent = msg;
}

function reset() {
  result.classList.add('hidden');
  error.classList.add('hidden');
  loading.classList.add('hidden');
  dropZone.classList.remove('hidden');
  fileInput.value = '';
}

// Drag & drop
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer?.files[0];
  if (file) processFile(file);
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0];
  if (file) processFile(file);
});

resetBtn.addEventListener('click', reset);
errorReset.addEventListener('click', reset);

// Process file
async function processFile(file) {
  // Validate
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    showError('Unsupported file type. Please use JPG, PNG, or WebP.');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showError('File too large. Max 10MB.');
    return;
  }

  showLoading();

  // Show original preview immediately
  const originalUrl = URL.createObjectURL(file);

  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(API_BASE, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errMsg = 'Something went wrong. Please try again.';
      try {
        const errData = await response.json();
        errMsg = errData.error || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    const resultBlob = await response.blob();
    showResult(originalUrl, resultBlob);
  } catch (err) {
    showError(err.message || 'Network error. Please check your connection.');
  }
}
