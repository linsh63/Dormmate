// 共享文件夹系统

// 当前路径
let currentPath = [];

// 初始化共享文件夹标签页
function showSharedFilesTab() {
    if (!currentDorm) return;
    
    // 确保宿舍有文件系统
    if (!currentDorm.fileSystem) {
        currentDorm.fileSystem = {
            type: 'folder',
            children: {}
        };
    }
    
    // 渲染文件系统
    renderCurrentFolder();
}

// 渲染当前文件夹内容
function renderCurrentFolder() {
    // 更新面包屑导航
    updateBreadcrumbs();
    
    // 获取当前文件夹内容
    let currentFolder = currentDorm.fileSystem;
    for (const folder of currentPath) {
        currentFolder = currentFolder.children[folder];
    }
    
    // 渲染文件和文件夹
    const container = document.getElementById('shared-files-container');
    container.innerHTML = '';
    
    // 添加操作按钮
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'flex justify-between items-center mb-4';
    actionsDiv.innerHTML = `
        <div>
            <button onclick="showCreateFolderModal()" class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mr-2">
                <i class="fas fa-folder-plus mr-1"></i> 新建文件夹
            </button>
            <button onclick="showUploadFileModal()" class="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
                <i class="fas fa-upload mr-1"></i> 上传文件
            </button>
        </div>
    `;
    container.appendChild(actionsDiv);
    
    // 如果当前文件夹为空
    if (Object.keys(currentFolder.children).length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'text-center py-8 text-gray-500';
        emptyMessage.innerHTML = '<p>此文件夹为空</p>';
        container.appendChild(emptyMessage);
        return;
    }
    
    // 添加文件和文件夹
    Object.entries(currentFolder.children).forEach(([name, item]) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'flex items-center justify-between p-3 border-b hover:bg-gray-50';
        
        if (item.type === 'folder') {
            itemElement.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-folder text-yellow-400 mr-3 text-xl"></i>
                    <span>${name}</span>
                </div>
                <div>
                    <button class="text-blue-500 hover:text-blue-700 mr-2" onclick="navigateToFolder('${name}')">
                        打开
                    </button>
                    <button class="text-red-500 hover:text-red-700" onclick="confirmDeleteItem('${name}')">
                        删除
                    </button>
                </div>
            `;
        } else {
            itemElement.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-file text-gray-400 mr-3 text-xl"></i>
                    <div>
                        <span>${name}</span>
                        <div class="text-xs text-gray-500">
                            ${item.size} · ${item.date}
                        </div>
                    </div>
                </div>
                <div>
                    <button class="text-blue-500 hover:text-blue-700 mr-2" onclick="downloadFile('${name}')">
                        下载
                    </button>
                    <button class="text-red-500 hover:text-red-700" onclick="confirmDeleteItem('${name}')">
                        删除
                    </button>
                </div>
            `;
        }
        
        container.appendChild(itemElement);
    });
}

// 导航到指定文件夹
function navigateToFolder(folderName) {
    currentPath.push(folderName);
    renderCurrentFolder();
}

// 返回上一层文件夹
function navigateToParent() {
    if (currentPath.length > 0) {
        currentPath.pop();
        renderCurrentFolder();
    }
}

// 更新面包屑导航
function updateBreadcrumbs() {
    const breadcrumbs = document.getElementById('file-breadcrumbs');
    breadcrumbs.innerHTML = '';
    
    // 添加根目录
    const rootElement = document.createElement('div');
    rootElement.className = 'flex items-center';
    rootElement.innerHTML = `
        <button class="text-blue-500 hover:text-blue-700" onclick="resetPath()">
            <i class="fas fa-home mr-1"></i>根目录
        </button>
    `;
    breadcrumbs.appendChild(rootElement);
    
    // 如果在根目录，不显示返回按钮
    if (currentPath.length > 0) {
        // 添加返回上一级按钮
        const backButton = document.createElement('button');
        backButton.className = 'ml-3 text-gray-500 hover:text-gray-700';
        backButton.innerHTML = '<i class="fas fa-arrow-up mr-1"></i>返回上一级';
        backButton.onclick = navigateToParent;
        breadcrumbs.appendChild(backButton);
    }
    
    // 添加当前路径
    let path = '';
    currentPath.forEach((folder, index) => {
        path += (index > 0 ? '/' : '') + folder;
        
        const separator = document.createElement('span');
        separator.className = 'mx-2 text-gray-400';
        separator.textContent = '/';
        breadcrumbs.appendChild(separator);
        
        const folderElement = document.createElement('span');
        folderElement.className = index === currentPath.length - 1 ? 'text-gray-700' : 'text-blue-500 hover:text-blue-700 cursor-pointer';
        folderElement.textContent = folder;
        
        if (index < currentPath.length - 1) {
            folderElement.onclick = () => navigateToSpecificPath(index);
        }
        
        breadcrumbs.appendChild(folderElement);
    });
}

// 导航到特定路径
function navigateToSpecificPath(index) {
    currentPath = currentPath.slice(0, index + 1);
    renderCurrentFolder();
}

// 重置路径到根目录
function resetPath() {
    currentPath = [];
    renderCurrentFolder();
}

// 显示创建文件夹模态框
function showCreateFolderModal() {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    modal.id = 'createFolderModal';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">新建文件夹</h3>
                <button onclick="closeModal('createFolderModal')" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="px-6 py-4">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="folder-name">文件夹名称</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="folder-name" type="text" placeholder="请输入文件夹名称">
                </div>
                <div class="flex items-center justify-end">
                    <button onclick="closeModal('createFolderModal')" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
                        取消
                    </button>
                    <button onclick="createFolder()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        创建
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 创建文件夹
function createFolder() {
    const folderName = document.getElementById('folder-name').value.trim();
    
    if (!folderName) {
        alert('请输入文件夹名称');
        return;
    }
    
    // 获取当前文件夹
    let currentFolder = currentDorm.fileSystem;
    for (const folder of currentPath) {
        currentFolder = currentFolder.children[folder];
    }
    
    // 检查是否已存在同名文件夹或文件
    if (currentFolder.children[folderName]) {
        alert('已存在同名文件夹或文件');
        return;
    }
    
    // 创建新文件夹
    currentFolder.children[folderName] = {
        type: 'folder',
        children: {},
        date: new Date().toISOString().split('T')[0]
    };
    
    // 关闭模态框
    closeModal('createFolderModal');
    
    // 刷新文件系统
    renderCurrentFolder();
}

// 显示上传文件模态框
function showUploadFileModal() {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    modal.id = 'uploadFileModal';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">上传文件</h3>
                <button onclick="closeModal('uploadFileModal')" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="px-6 py-4">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="file-upload">选择文件</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="file-upload" type="file">
                </div>
                <div class="flex items-center justify-end">
                    <button onclick="closeModal('uploadFileModal')" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
                        取消
                    </button>
                    <button onclick="uploadFile()" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        上传
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 上传文件
function uploadFile() {
    const fileInput = document.getElementById('file-upload');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('请选择要上传的文件');
        return;
    }
    
    const file = fileInput.files[0];
    
    // 获取当前文件夹
    let currentFolder = currentDorm.fileSystem;
    for (const folder of currentPath) {
        currentFolder = currentFolder.children[folder];
    }
    
    // 检查是否已存在同名文件或文件夹
    if (currentFolder.children[file.name]) {
        if (!confirm('已存在同名文件或文件夹，是否覆盖？')) {
            return;
        }
    }
    
    // 读取文件内容
    const reader = new FileReader();
    reader.onload = function(e) {
        // 创建新文件
        currentFolder.children[file.name] = {
            type: 'file',
            content: e.target.result,
            size: formatFileSize(file.size),
            date: new Date().toISOString().split('T')[0]
        };
        
        // 关闭模态框
        closeModal('uploadFileModal');
        
        // 刷新文件系统
        renderCurrentFolder();
    };
    
    reader.readAsDataURL(file);
}

// 下载文件
function downloadFile(fileName) {
    // 获取当前文件夹
    let currentFolder = currentDorm.fileSystem;
    for (const folder of currentPath) {
        currentFolder = currentFolder.children[folder];
    }
    
    // 获取文件
    const file = currentFolder.children[fileName];
    if (!file || file.type !== 'file') {
        alert('文件不存在');
        return;
    }
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = file.content;
    link.download = fileName;
    link.click();
}

// 确认删除项目
function confirmDeleteItem(itemName) {
    // 创建确认模态框
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    modal.id = 'confirmDeleteModal';
    
    // 获取当前文件夹
    let currentFolder = currentDorm.fileSystem;
    for (const folder of currentPath) {
        currentFolder = currentFolder.children[folder];
    }
    
    const item = currentFolder.children[itemName];
    const itemType = item.type === 'folder' ? '文件夹' : '文件';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">确认删除</h3>
                <button onclick="closeModal('confirmDeleteModal')" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="px-6 py-4">
                <p class="text-gray-700 mb-4">确定要删除${itemType} "${itemName}" 吗？${item.type === 'folder' ? '此操作将删除文件夹中的所有内容，' : ''}此操作不可撤销。</p>
                <div class="flex items-center justify-end">
                    <button onclick="closeModal('confirmDeleteModal')" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
                        取消
                    </button>
                    <button onclick="deleteItem('${itemName}')" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        删除
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 删除项目
function deleteItem(itemName) {
    // 获取当前文件夹
    let currentFolder = currentDorm.fileSystem;
    for (const folder of currentPath) {
        currentFolder = currentFolder.children[folder];
    }
    
    // 删除项目
    delete currentFolder.children[itemName];
    
    // 关闭模态框
    closeModal('confirmDeleteModal');
    
    // 刷新文件系统
    renderCurrentFolder();
}

// 关闭模态框
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}