// 公物管理系统 - 功能实现

// 全局变量
let currentPublicItems = [];

// 初始化公物管理系统
function initPublicItemsSystem() {
    // 确保当前宿舍有公物数组
    if (currentDorm && !currentDorm.publicItems) {
        currentDorm.publicItems = [];
    }
    
    if (currentDorm) {
        currentPublicItems = currentDorm.publicItems || [];
        renderPublicItemsList();
    }
}

// 渲染公物列表
function renderPublicItemsList() {
    const publicItemsList = document.getElementById('public-items-list');
    if (!publicItemsList) return;
    
    publicItemsList.innerHTML = '';
    
    if (currentPublicItems.length === 0) {
        publicItemsList.innerHTML = '<p class="text-gray-500 text-center py-8">当前没有公共物品</p>';
        return;
    }
    
    currentPublicItems.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'bg-white rounded-lg border p-4 mb-4 cursor-pointer hover:shadow-md transition-shadow';
        itemCard.onclick = () => showItemDetails(item.id);
        
        // 状态文本和颜色
        let statusText = '未知';
        let statusColor = 'text-gray-600';
        
        switch(item.status) {
            case 'new':
                statusText = '全新';
                statusColor = 'text-green-600';
                break;
            case 'good':
                statusText = '良好';
                statusColor = 'text-blue-600';
                break;
            case 'normal':
                statusText = '一般';
                statusColor = 'text-yellow-600';
                break;
            case 'poor':
                statusText = '较差';
                statusColor = 'text-red-600';
                break;
        }
        
        itemCard.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex">
                    ${item.photo ? `
                        <div class="w-20 h-20 rounded-md overflow-hidden mr-4 bg-gray-100 flex-shrink-0">
                            <img src="${item.photo}" alt="${item.name}" class="w-full h-full object-cover">
                        </div>
                    ` : `
                        <div class="w-20 h-20 rounded-md overflow-hidden mr-4 bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-box text-gray-400 text-2xl"></i>
                        </div>
                    `}
                    <div>
                        <h4 class="text-md font-semibold text-gray-800">${item.name}</h4>
                        <p class="text-sm text-gray-600">价格: ¥${item.price.toFixed(2)}</p>
                        <p class="text-sm ${statusColor}">状态: ${statusText}</p>
                        <p class="text-sm text-gray-600">购买日期: ${formatDate(item.purchaseDate)}</p>
                    </div>
                </div>
                <div>
                    <span class="text-sm text-blue-600">
                        <i class="fas fa-info-circle"></i> 查看详情
                    </span>
                </div>
            </div>
        `;
        
        publicItemsList.appendChild(itemCard);
    });
}

// 显示添加公物模态框
function showAddItemModal() {
    if (!currentDorm) return;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    modal.id = 'addItemModal';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">添加公共物品</h3>
                <button onclick="closeModal('addItemModal')" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="px-6 py-4">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="item-name-input">物品名称</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-name-input" type="text" placeholder="请输入物品名称">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="item-price-input">价格</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-price-input" type="number" min="0" step="0.01" placeholder="请输入价格">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="item-status-input">状态</label>
                    <select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-status-input">
                        <option value="new">全新</option>
                        <option value="good">良好</option>
                        <option value="normal">一般</option>
                        <option value="poor">较差</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="item-photo-input">照片</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-photo-input" type="file" accept="image/*">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="item-purchase-date">购买日期</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-purchase-date" type="date" value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="flex items-center justify-end">
                    <button onclick="closeModal('addItemModal')" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
                        取消
                    </button>
                    <button onclick="addPublicItem()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        添加
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 显示编辑公物模态框
function showEditItemModal(itemId) {
    if (!currentDorm || !currentDorm.isAdmin) return;
    
    const item = currentPublicItems.find(i => i.id === itemId);
    if (!item) return;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    modal.id = 'editItemModal';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">编辑公共物品</h3>
                <button onclick="closeModal('editItemModal')" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="px-6 py-4">
                <input type="hidden" id="edit-item-id" value="${item.id}">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="edit-item-name">物品名称</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="edit-item-name" type="text" value="${item.name}" placeholder="请输入物品名称">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="edit-item-price">价格</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="edit-item-price" type="number" min="0" step="0.01" value="${item.price}" placeholder="请输入价格">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="edit-item-status">状态</label>
                    <select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="edit-item-status">
                        <option value="new" ${item.status === 'new' ? 'selected' : ''}>全新</option>
                        <option value="good" ${item.status === 'good' ? 'selected' : ''}>良好</option>
                        <option value="normal" ${item.status === 'normal' ? 'selected' : ''}>一般</option>
                        <option value="poor" ${item.status === 'poor' ? 'selected' : ''}>较差</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="edit-item-photo">照片</label>
                    <div class="flex items-center mb-2">
                        ${item.photo ? `<img src="${item.photo}" alt="${item.name}" class="w-16 h-16 object-cover rounded mr-2">` : ''}
                        <span class="text-sm text-gray-600">${item.photo ? '当前已有照片' : '暂无照片'}</span>
                    </div>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="edit-item-photo" type="file" accept="image/*">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="edit-item-purchase-date">购买日期</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="edit-item-purchase-date" type="date" value="${item.purchaseDate}">
                </div>
                <div class="flex items-center justify-end">
                    <button onclick="closeModal('editItemModal')" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
                        取消
                    </button>
                    <button onclick="updatePublicItem()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        保存
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 添加公物
function addPublicItem() {
    if (!currentDorm) return;
    
    const nameInput = document.getElementById('item-name-input');
    const priceInput = document.getElementById('item-price-input');
    const statusInput = document.getElementById('item-status-input');
    const photoInput = document.getElementById('item-photo-input');
    const purchaseDateInput = document.getElementById('item-purchase-date');
    
    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value);
    const status = statusInput.value;
    const purchaseDate = purchaseDateInput.value;
    
    if (!name) {
        alert('请输入物品名称');
        return;
    }
    
    if (isNaN(price) || price < 0) {
        alert('请输入有效的价格');
        return;
    }
    
    // 创建新物品对象
    const newItem = {
        id: `item_${Date.now()}`,
        name: name,
        price: price,
        status: status,
        purchaseDate: purchaseDate,
        photo: null
    };
    
    // 处理照片上传
    if (photoInput.files && photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            newItem.photo = e.target.result;
            completeAddItem(newItem);
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        completeAddItem(newItem);
    }
}

// 完成添加物品
function completeAddItem(item) {
    // 添加到公物列表
    currentPublicItems.push(item);
    currentDorm.publicItems = currentPublicItems;
    
    // 更新UI
    renderPublicItemsList();
    
    // 关闭模态框
    closeModal('addItemModal');
    
    alert('公共物品添加成功！');
}

// 更新公物
function updatePublicItem() {
    if (!currentDorm || !currentDorm.isAdmin) return;
    
    const itemId = document.getElementById('edit-item-id').value;
    const nameInput = document.getElementById('edit-item-name');
    const priceInput = document.getElementById('edit-item-price');
    const statusInput = document.getElementById('edit-item-status');
    const photoInput = document.getElementById('edit-item-photo');
    const purchaseDateInput = document.getElementById('edit-item-purchase-date');
    
    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value);
    const status = statusInput.value;
    const purchaseDate = purchaseDateInput.value;
    
    if (!name) {
        alert('请输入物品名称');
        return;
    }
    
    if (isNaN(price) || price < 0) {
        alert('请输入有效的价格');
        return;
    }
    
    // 查找物品
    const itemIndex = currentPublicItems.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;
    
    const updatedItem = {
        ...currentPublicItems[itemIndex],
        name: name,
        price: price,
        status: status,
        purchaseDate: purchaseDate
    };
    
    // 处理照片上传
    if (photoInput.files && photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            updatedItem.photo = e.target.result;
            completeUpdateItem(itemIndex, updatedItem);
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        completeUpdateItem(itemIndex, updatedItem);
    }
}

// 完成更新物品
function completeUpdateItem(itemIndex, updatedItem) {
    // 更新物品
    currentPublicItems[itemIndex] = updatedItem;
    currentDorm.publicItems = currentPublicItems;
    
    // 更新UI
    renderPublicItemsList();
    
    // 关闭模态框
    closeModal('editItemModal');
    
    alert('公共物品更新成功！');
}

// 删除公物
function deletePublicItem(itemId) {
    if (!currentDorm || !currentDorm.isAdmin) return;
    
    // 确认删除
    if (!confirm('确定要删除这个公共物品吗？')) {
        return;
    }
    
    // 查找物品索引
    const itemIndex = currentPublicItems.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;
    
    // 删除物品
    currentPublicItems.splice(itemIndex, 1);
    currentDorm.publicItems = currentPublicItems;
    
    // 更新全局数据 (确保 dorms 和 mockDorms 在全局范围内可访问)
    if (typeof dorms !== 'undefined') {
        const dormIndex = dorms.findIndex(d => d.id === currentDorm.id);
        if (dormIndex !== -1) {
            dorms[dormIndex].publicItems = currentPublicItems;
        }
    }
    
    if (typeof mockDorms !== 'undefined') {
        const mockDormIndex = mockDorms.findIndex(d => d.id === currentDorm.id);
        if (mockDormIndex !== -1) {
            mockDorms[mockDormIndex].publicItems = currentPublicItems;
        }
    }
    
    // 关闭模态框
    closeModal('itemDetailsModal');
    
    // 更新UI
    renderPublicItemsList();
    
    alert('物品已删除');
}

// 在宿舍视图中显示公物标签页
function showPublicItemsTab() {
    if (!currentDorm) return;
    
    // 渲染公物列表
    renderPublicItems();
}

// 渲染公物列表
function renderPublicItems() {
    const publicItemsList = document.getElementById('public-items-list');
    if (!publicItemsList) return;
    
    publicItemsList.innerHTML = '';
    
    if (!currentDorm.publicItems || currentDorm.publicItems.length === 0) {
        publicItemsList.innerHTML = '<p class="text-gray-500 text-center py-8">当前没有公共物品</p>';
        return;
    }
    
    // 按照添加时间排序，最新的在前面
    const sortedItems = [...currentDorm.publicItems].sort((a, b) => {
        const dateA = a.purchaseDate ? new Date(a.purchaseDate) : new Date(0);
        const dateB = b.purchaseDate ? new Date(b.purchaseDate) : new Date(0);
        return dateB - dateA;
    });
    
    sortedItems.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer';
        itemCard.onclick = () => showItemDetails(item.id);
        
        // 准备物品状态显示
        let statusText = '未知';
        let statusClass = 'bg-gray-100 text-gray-800';
        
        switch(item.status) {
            case 'new':
                statusText = '全新';
                statusClass = 'bg-green-100 text-green-800';
                break;
            case 'good':
                statusText = '良好';
                statusClass = 'bg-blue-100 text-blue-800';
                break;
            case 'normal':
                statusText = '一般';
                statusClass = 'bg-yellow-100 text-yellow-800';
                break;
            case 'poor':
                statusText = '较差';
                statusClass = 'bg-red-100 text-red-800';
                break;
        }
        
        // 准备缩略图
        const thumbnailHTML = item.photo ? 
            `<div class="w-16 h-16 bg-gray-100 rounded overflow-hidden mr-4">
                <img src="${item.photo}" alt="${item.name}" class="w-full h-full object-cover">
             </div>` : 
            `<div class="w-16 h-16 bg-gray-100 rounded flex items-center justify-center mr-4">
                <i class="fas fa-image text-gray-400"></i>
             </div>`;
        
        itemCard.innerHTML = `
            <div class="flex items-start">
                ${thumbnailHTML}
                <div class="flex-1">
                    <div class="flex justify-between items-start">
                        <h4 class="text-md font-semibold text-gray-800">${item.name}</h4>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
                            ${statusText}
                        </span>
                    </div>
                    <p class="text-sm text-gray-600">价格: ¥${item.price.toFixed(2)}</p>
                    <p class="text-sm text-gray-500">购买日期: ${item.purchaseDate || '未知'}</p>
                </div>
            </div>
        `;
        
        publicItemsList.appendChild(itemCard);
    });
}

// 显示添加物品模态框
function showAddItemModal() {
    if (!currentDorm) return;
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    modal.id = 'addItemModal';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">添加公共物品</h3>
                <button onclick="closeModal('addItemModal')" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="px-6 py-4">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="add-item-name">物品名称</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="add-item-name" type="text" placeholder="请输入物品名称">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="add-item-price">价格</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="add-item-price" type="number" min="0" step="0.01" placeholder="请输入价格">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="add-item-status">物品状态</label>
                    <select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="add-item-status">
                        <option value="new">全新</option>
                        <option value="good">良好</option>
                        <option value="normal">一般</option>
                        <option value="poor">较差</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="add-item-date">购买日期</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="add-item-date" type="date">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="add-item-photo">物品照片</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="add-item-photo" type="file" accept="image/*">
                </div>
                <div class="flex items-center justify-end">
                    <button onclick="closeModal('addItemModal')" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
                        取消
                    </button>
                    <button onclick="addPublicItem()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        添加
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('add-item-date').value = today;
}

// 添加公共物品
function addPublicItem() {
    if (!currentDorm) return;
    
    const nameInput = document.getElementById('add-item-name');
    const priceInput = document.getElementById('add-item-price');
    const statusInput = document.getElementById('add-item-status');
    const dateInput = document.getElementById('add-item-date');
    const photoInput = document.getElementById('add-item-photo');
    
    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value);
    const status = statusInput.value;
    const date = dateInput.value;
    
    if (!name) {
        alert('请输入物品名称');
        return;
    }
    
    if (isNaN(price) || price < 0) {
        alert('请输入有效的价格');
        return;
    }
    
    // 创建新物品对象
    const newItem = {
        id: `item_${Date.now()}`,
        name: name,
        price: price,
        status: status,
        purchaseDate: date,
        photo: null
    };
    
    // 处理图片上传
    if (photoInput.files && photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            newItem.photo = e.target.result; // 将图片转为base64存储
            
            // 完成添加物品
            completeAddItem(newItem);
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        // 没有上传图片，直接添加
        completeAddItem(newItem);
    }
}

// 完成添加物品
function completeAddItem(item) {
    // 确保宿舍有公共物品数组
    if (!currentDorm.publicItems) {
        currentDorm.publicItems = [];
    }
    
    // 添加物品到列表
    currentDorm.publicItems.push(item);
    
    // 更新UI
    renderPublicItems();
    
    // 关闭模态框
    closeModal('addItemModal');
    
    alert('物品添加成功！');
}

// 确认删除物品
function confirmDeleteItem(itemId) {
    if (!currentDorm || !currentDorm.publicItems) return;
    
    const item = currentDorm.publicItems.find(i => i.id === itemId);
    if (!item) return;
    
    // 创建确认模态框
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    modal.id = 'confirmDeleteModal';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">确认删除</h3>
                <button onclick="closeModal('confirmDeleteModal')" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="px-6 py-4">
                <p class="text-gray-700 mb-4">确定要删除物品 "${item.name}" 吗？此操作不可撤销。</p>
                <div class="flex items-center justify-end">
                    <button onclick="closeModal('confirmDeleteModal')" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
                        取消
                    </button>
                    <button onclick="deleteItem('${itemId}')" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        删除
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 删除物品
function deleteItem(itemId) {
    if (!currentDorm || !currentDorm.publicItems) return;
    
    const itemIndex = currentDorm.publicItems.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;
    
    // 从列表中删除物品
    currentDorm.publicItems.splice(itemIndex, 1);
    
    // 更新全局数据
    const dormIndex = dorms.findIndex(d => d.id === currentDorm.id);
    if (dormIndex !== -1) {
        dorms[dormIndex].publicItems = currentDorm.publicItems;
    }
    
    // 更新 mockDorms 数据
    const mockDormIndex = mockDorms.findIndex(d => d.id === currentDorm.id);
    if (mockDormIndex !== -1) {
        mockDorms[mockDormIndex].publicItems = currentDorm.publicItems;
    }
    
    // 更新当前公物列表
    currentPublicItems = currentDorm.publicItems;
    
    // 关闭所有相关模态框
    closeModal('confirmDeleteModal');
    closeModal('itemDetailsModal');
    
    // 刷新公物列表
    renderPublicItemsList();
    
    alert('物品已删除');
}

// 显示物品详情模态框
function showItemDetails(itemId) {
    if (!currentDorm || !currentDorm.publicItems) return;
    
    // 查找物品
    const item = currentDorm.publicItems.find(item => item.id === itemId);
    if (!item) return;
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    modal.id = 'itemDetailsModal';
    
    // 准备物品状态显示
    let statusText = '未知';
    let statusClass = 'bg-gray-100 text-gray-800';
    
    switch(item.status) {
        case 'new':
            statusText = '全新';
            statusClass = 'bg-green-100 text-green-800';
            break;
        case 'good':
            statusText = '良好';
            statusClass = 'bg-blue-100 text-blue-800';
            break;
        case 'normal':
            statusText = '一般';
            statusClass = 'bg-yellow-100 text-yellow-800';
            break;
        case 'poor':
            statusText = '较差';
            statusClass = 'bg-red-100 text-red-800';
            break;
    }
    
    // 准备照片显示
    const photoHTML = item.photo ? 
        `<div class="mt-4">
            <img src="${item.photo}" alt="${item.name}" class="w-full h-auto rounded-lg cursor-pointer" onclick="showFullSizeImage('${item.photo}', '${item.name}')">
            <p class="text-sm text-gray-500 mt-1">点击图片可查看大图</p>
         </div>` : 
        `<div class="mt-4 bg-gray-100 rounded-lg p-8 flex items-center justify-center">
            <p class="text-gray-500">暂无物品照片</p>
         </div>`;
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">物品详情</h3>
                <button onclick="closeModal('itemDetailsModal')" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="px-6 py-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="text-xl font-bold text-gray-800">${item.name}</h4>
                        <p class="text-gray-600">价格: ¥${item.price.toFixed(2)}</p>
                        <p class="text-gray-600">购买日期: ${item.purchaseDate || '未知'}</p>
                    </div>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
                        ${statusText}
                    </span>
                </div>
                ${photoHTML}
                <div class="mt-6 flex justify-between">
                    <div>
                        <button onclick="showUpdateItemModal('${item.id}')" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
                            <i class="fas fa-edit mr-1"></i> 编辑物品
                        </button>
                        ${currentDorm.isAdmin ? `
                        <button onclick="deletePublicItem('${item.id}')" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            <i class="fas fa-trash-alt mr-1"></i> 删除
                        </button>
                        ` : ''}
                    </div>
                    <button onclick="closeModal('itemDetailsModal')" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        关闭
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 显示公物管理标签页
function showPublicItemsTab() {
    initPublicItemsSystem();
    renderPublicItemsList();
}