document.addEventListener('DOMContentLoaded', () => {
    const sourceDirInput = document.getElementById('sourceDir');
    const destDirInput = document.getElementById('destDir');
    const previewButton = document.getElementById('previewButton');
    const organizeButton = document.getElementById('organizeButton');
    const previewDiv = document.getElementById('preview');
    const resultDiv = document.getElementById('result');
    const progressBar = document.getElementById('progressBar');
    const progressBarInner = progressBar.querySelector('div');

    async function selectFolder(inputElement) {
        const folderPath = await window.electronAPI.selectFolder();
        if (folderPath) {
            inputElement.value = folderPath;
        }
    }

    document.querySelectorAll('.select-folder').forEach(button => {
        button.addEventListener('click', () => {
            const inputId = button.getAttribute('data-input');
            selectFolder(document.getElementById(inputId));
        });
    });

    previewButton.addEventListener('click', async () => {
        const sourceDir = sourceDirInput.value;
        const destDir = destDirInput.value;
        const fileTypes = Array.from(document.getElementById('fileTypes').selectedOptions).map(option => option.value);
        const minSize = parseFloat(document.getElementById('minSize').value) || 0;
        const maxSize = parseFloat(document.getElementById('maxSize').value) || Infinity;
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;

        if (!sourceDir || !destDir) {
            previewDiv.textContent = '请选择源目录和目标目录';
            previewDiv.classList.remove('hidden');
            return;
        }

        const options = { sourceDir, destDir, fileTypes, minSize, maxSize, dateFrom, dateTo };
        const result = await window.electronAPI.organizeFiles(options);

        previewDiv.textContent = `预览整理结果：\n总文件数：${result.totalFiles}\n将被整理的文件数：${result.organizedFiles}`;
        previewDiv.classList.remove('hidden');
        organizeButton.classList.remove('hidden');
    });

    organizeButton.addEventListener('click', async () => {
        const sourceDir = sourceDirInput.value;
        const destDir = destDirInput.value;
        const fileTypes = Array.from(document.getElementById('fileTypes').selectedOptions).map(option => option.value);
        const minSize = parseFloat(document.getElementById('minSize').value) || 0;
        const maxSize = parseFloat(document.getElementById('maxSize').value) || Infinity;
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;

        if (!sourceDir || !destDir) {
            resultDiv.textContent = '请选择源目录和目标目录';
            resultDiv.classList.remove('hidden');
            return;
        }

        const options = { sourceDir, destDir, fileTypes, minSize, maxSize, dateFrom, dateTo };
        progressBar.classList.remove('hidden');
        resultDiv.classList.remove('hidden');

        const result = await window.electronAPI.organizeFiles(options);

        progressBarInner.style.width = '100%';
        resultDiv.textContent = '文件整理完成！';
        generateReport(options, result);
    });

    function generateReport(options, result) {
        const { sourceDir, destDir, fileTypes, minSize, maxSize, dateFrom, dateTo } = options;
        const { totalFiles, organizedFiles } = result;

        const reportDiv = document.createElement('div');
        reportDiv.innerHTML = `
            <h2>整理报告</h2>
            <p>源目录：${sourceDir}</p>
            <p>目标目录：${destDir}</p>
            <p>文件类型：${fileTypes.join(', ')}</p>
            <p>最小大小：${minSize} KB</p>
            <p>最大大小：${maxSize} KB</p>
            <p>开始日期：${dateFrom || '无'}</p>
            <p>结束日期：${dateTo || '无'}</p>
            <p>总文件数：${totalFiles}</p>
            <p>将被整理的文件数：${organizedFiles}</p>
        `;
        resultDiv.appendChild(reportDiv);
    }

    document.getElementById('darkModeToggle').addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });
});
