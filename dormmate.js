// Dormmate 宿舍管理系统 - 功能实现
// 使用mock数据代替数据库

// 全局状态
let currentUser = null;
let dorms = [];
let currentDorm = null;

// Mock数据 - 用户
const mockUsers = [
    {
        id: 1,
        username: 'demo_user',
        email: 'demo@example.com',
        password: 'password123'
    },
    {
        id: 2,
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123'
    }
];

// Mock数据 - 宿舍
const mockDorms = [
    {
        id: '10001',  // 修改为数字格式的ID
        name: '东区3号楼 506',
        members: [
            { id: 1, username: 'demo_user', nickname: 'demo_user', isAdmin: true },
            { id: 2, username: 'admin', nickname: 'admin', isAdmin: false }
        ],
        funds: 350.00,
        isAdmin: true,
        fundsHistory: [
            // ... 保持不变
        ],
        requests: [
            // ... 保持不变
        ],
        publicItems: [
            {
                id: 'item_001',
                name: '电水壶',
                price: 89.00,
                status: 'good',
                photo: null,
                purchaseDate: '2023-01-15'
            },
            {
                id: 'item_002',
                name: '饮水机',
                price: 299.00,
                status: 'normal',
                photo: null,
                purchaseDate: '2022-09-01'
            }
        ]
    },
    {
        id: '10002',  // 修改为数字格式的ID
        name: '西区1号楼 302',
        members: [
            { id: 1, username: 'demo_user', nickname: 'demo_user', isAdmin: false }
        ],
        funds: 200.00,
        isAdmin: false,
        fundsHistory: [
            // ... 保持不变
        ],
        requests: [],
        publicItems: []
    }
];

// DOM元素
const authModal = document.getElementById('authModal');
const createDormModal = document.getElementById('createDormModal');
const homeView = document.getElementById('home-view');
const dormManagementView = document.getElementById('dorm-management-view');
const profileView = document.getElementById('profile-view');
const dormsContainer = document.getElementById('dorms-container');
const noDormsMessage = document.getElementById('no-dorms-message');
const dormList = document.getElementById('dorm-list');
const mobileDormList = document.getElementById('mobile-dorm-list');
const usernameDisplay = document.getElementById('username-display');
const dormNameInput = document.getElementById('dorm-name');
const dormNameError = document.getElementById('dorm-name-error');

// 初始化函数
function init() {
    // 检查是否有登录状态
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        // 加载用户的宿舍
        loadUserDorms();
        updateUIAfterLogin();
    } else {
        // 如果没有登录，显示登录模态框
        toggleAuthModal();
    }

    // 添加事件监听器
    document.addEventListener('click', function(event) {
        const accountDropdown = document.getElementById('accountDropdown');
        const fundsHistoryFilter = document.getElementById('funds-history-filter');
        const requestsHistoryFilter = document.getElementById('requests-history-filter');
        
        // 点击页面其他地方时关闭下拉菜单
        if (accountDropdown && !accountDropdown.classList.contains('hidden') && 
            !event.target.closest('#accountDropdown') && 
            !event.target.closest('button[onclick="toggleAccountDropdown()"]')) {
            accountDropdown.classList.add('hidden');
        }
        
        // 关闭经费历史筛选下拉菜单
        if (fundsHistoryFilter && !fundsHistoryFilter.classList.contains('hidden') && 
            !event.target.closest('#funds-history-filter') && 
            !event.target.closest('button[onclick="toggleFundsHistoryFilter()"]')) {
            fundsHistoryFilter.classList.add('hidden');
        }
        
        // 关闭申请历史筛选下拉菜单
        if (requestsHistoryFilter && !requestsHistoryFilter.classList.contains('hidden') && 
            !event.target.closest('#requests-history-filter') && 
            !event.target.closest('button[onclick="toggleRequestsHistoryFilter()"]')) {
            requestsHistoryFilter.classList.add('hidden');
        }
    });

    updateAccountDropdown();
    
    // 如果当前用户已登录并且有宿舍，初始化宿舍管理视图
    if (currentUser && currentUser.dormId) {
        // 查找用户的宿舍
        currentDorm = dorms.find(dorm => dorm.id === currentUser.dormId);
        
        if (currentDorm) {
            // 检查用户是否是管理员
            currentDorm.isAdmin = currentDorm.adminId === currentUser.id;
            
            // 显示宿舍管理视图
            showView('dormManagementView');
            
            // 更新宿舍信息
            updateDormInfo();
            
            // 更新成员列表
            updateMembersList();
            
            // 更新经费信息
            updateFundsInfo();
            
            // 更新经费历史
            updateFundsHistory();
            
            // 更新申请列表
            updateRequestsList();
            
            // 更新公物列表
            updatePublicItemsList();
            
            // 初始化共享文件夹
            initSharedFilesSystem();
            
            // 初始化生活记录系统
            initLifeRecordsSystem();
        } else {
            // 如果找不到宿舍，显示创建宿舍视图
            showView('createDormView');
        }
    } else {
        // 如果用户未登录，显示登录视图
        showView('loginView');
    }
}

// 加载用户的宿舍
function loadUserDorms() {
    // 从mock数据中加载宿舍
    dorms = mockDorms.map(dorm => {
        // 检查用户是否是该宿舍的成员
        const member = dorm.members.find(m => m.id === currentUser.id);
        if (member) {
            return {
                ...dorm,
                isAdmin: member.isAdmin
            };
        }
        return null;
    }).filter(dorm => dorm !== null);

    // 更新UI
    refreshDormCards();
    updateSidebar();
}

// 更新侧边栏
function updateSidebar() {
    // 清空侧边栏
    dormList.innerHTML = '';
    mobileDormList.innerHTML = '';
    
    // 添加宿舍到侧边栏
    dorms.forEach(dorm => {
        addDormToSidebar(dorm);
    });
}

// 显示/隐藏模态框
function toggleAuthModal() {
    authModal.classList.toggle('hidden');
}

function toggleCreateDormModal() {
    createDormModal.classList.toggle('hidden');
    dormNameInput.value = '';
    dormNameError.classList.add('hidden');
}

// 登录功能
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        alert('请输入用户名和密码');
        return;
    }
    
    // 在mock数据中查找用户
    const user = mockUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
        // 登录成功
        currentUser = {
            id: user.id,
            username: user.username,
            email: user.email
        };
        
        // 保存登录状态
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // 加载用户的宿舍
        loadUserDorms();
        
        // 更新UI
        updateUIAfterLogin();
        toggleAuthModal();
        alert('登录成功！');
    } else {
        alert('用户名或密码错误');
    }

    updateAccountDropdown();
}

// 注册功能
function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        alert('请输入用户名和密码');
        return;
    }
    
    // 检查用户名是否已存在
    if (mockUsers.some(u => u.username === username)) {
        alert('用户名已存在');
        return;
    }
    
    // 创建新用户
    const newUser = {
        id: mockUsers.length + 1,
        username,
        email: `${username}@example.com`,
        password
    };
    
    // 添加到mock数据
    mockUsers.push(newUser);
    
    // 设置当前用户
    currentUser = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
    };
    
    // 保存登录状态
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // 更新UI
    updateUIAfterLogin();
    toggleAuthModal();
    alert('注册成功并已登录！');

    updateAccountDropdown();
}

// 退出登录
function logout() {
    // 清除登录状态
    localStorage.removeItem('currentUser');
    
    currentUser = null;
    dorms = [];
    currentDorm = null;
    
    // 清空输入框
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    
    // 更新UI
    usernameDisplay.textContent = '未登录';
    dormsContainer.innerHTML = '<p id="no-dorms-message" class="text-gray-500">你还没有加入任何宿舍，点击"创建"或"加入"按钮开始使用。</p>';
    dormList.innerHTML = '';
    mobileDormList.innerHTML = '';
    
    showHomeView();
    toggleAuthModal();
    updateAccountDropdown();
}

// 更新登录后的UI
function updateUIAfterLogin() {
    if (currentUser) {
        usernameDisplay.textContent = currentUser.username;
        
        // 更新个人资料视图
        document.getElementById('profile-username').textContent = currentUser.username;
        document.getElementById('profile-username-input').value = currentUser.username;
        document.getElementById('profile-email-input').value = currentUser.email;
    }
}

// 视图切换
function showHomeView() {
    homeView.classList.remove('hidden');
    dormManagementView.classList.add('hidden');
    profileView.classList.add('hidden');
    refreshDormCards();
}

// 在宿舍管理视图中添加显示宿舍ID的功能
function showDormView(dormId) {
    currentDorm = dorms.find(d => d.id === dormId);
    if (currentDorm) {
        // 更新宿舍管理视图
        document.getElementById('dorm-name-heading').textContent = currentDorm.name;
        document.getElementById('dorm-role-badge').textContent = currentDorm.isAdmin ? '管理员' : '成员';
        document.getElementById('dorm-role-badge').classList.remove('bg-green-100', 'text-green-800', 'bg-blue-100', 'text-blue-800');
        document.getElementById('dorm-role-badge').classList.add(currentDorm.isAdmin ? 'bg-green-100' : 'bg-blue-100', currentDorm.isAdmin ? 'text-green-800' : 'text-blue-800');
        
        // 添加宿舍ID显示
        const dormIdElement = document.createElement('span');
        dormIdElement.className = 'ml-2 text-sm text-gray-500';
        dormIdElement.textContent = `ID: ${currentDorm.id}`;
        
        // 检查是否已存在ID显示，如果存在则移除
        const existingIdElement = document.querySelector('#dorm-name-heading + .text-sm.text-gray-500');
        if (existingIdElement) {
            existingIdElement.remove();
        }
        
        // 添加ID显示到标题旁边
        document.getElementById('dorm-name-heading').parentNode.insertBefore(dormIdElement, document.getElementById('dorm-role-badge'));
        
        // 隐藏设置标签页给非管理员
        document.getElementById('settings-tab').classList.toggle('hidden', !currentDorm.isAdmin);
        
        // 更新经费显示
        document.getElementById('current-funds').textContent = `¥${currentDorm.funds.toFixed(2)}`;
        
        // 更新经费历史
        updateFundsHistory();
        
        // 更新申请列表
        updateRequestsList();
        
        homeView.classList.add('hidden');
        dormManagementView.classList.remove('hidden');
        profileView.classList.add('hidden');
        
        // 默认显示经费标签页
        showDormTab('funds');
    }
}

// 显示宿舍标签页
function showDormTab(tabName) {
    // 隐藏所有标签页
    document.querySelectorAll('[id$="-tab"]').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // 移除所有标签按钮的活动状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active-tab', 'border-indigo-500', 'text-indigo-600');
        btn.classList.add('text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
    });
    
    // 显示选中的标签页
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }
    
    // 设置选中标签按钮的活动状态
    const selectedBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    if (selectedBtn) {
        selectedBtn.classList.remove('text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
        selectedBtn.classList.add('active-tab', 'border-indigo-500', 'text-indigo-600');
    }
    
    // 如果是公物管理标签页，初始化公物管理系统
    if (tabName === 'public-items') {
        showPublicItemsTab();
    }
    
    // 在这里添加：如果是生活记录标签页，初始化生活记录系统
    if (tabName === 'life-records') {
        showLifeRecordsTab();
    }
}

// 在 showPublicItemsTab 函数之后添加
function showLifeRecordsTab() {
    // 初始化生活记录系统
    initLifeRecordsSystem();
}

// 返回上一层文件夹
function navigateToParentFolder() {
    if (typeof navigateToParent === 'function') {
        navigateToParent();
    }
}

function showProfile() {
    homeView.classList.add('hidden');
    dormManagementView.classList.add('hidden');
    profileView.classList.remove('hidden');
    
    // 关闭移动端侧边栏
    hideMobileSidebar();
}

// 宿舍创建功能
function createDorm() {
    const dormName = dormNameInput.value.trim();
    
    if (!dormName) {
        dormNameError.classList.remove('hidden');
        return;
    }
    
    // 生成一个随机的6位数字ID
    const dormId = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 创建新宿舍
    const newDorm = {
        id: dormId,  // 使用数字格式的ID
        name: dormName,
        members: [{
            id: currentUser.id,
            username: currentUser.username,
            nickname: currentUser.username, // 默认昵称为用户名
            isAdmin: true
        }],
        funds: 0,
        isAdmin: true, // 创建者是管理员
        fundsHistory: [],
        requests: [],
        // 添加空的公物列表
        publicItems: [],
        lifeRecords: []
    };
    
    // 添加到mock数据
    mockDorms.push(newDorm);
    dorms.push(newDorm);
    
    // 更新UI
    addDormToSidebar(newDorm);
    renderDormCard(newDorm);
    
    toggleCreateDormModal();
    
    // 隐藏"没有宿舍"的消息
    const noDormsMessage = document.getElementById('no-dorms-message');
    if (noDormsMessage) {
        noDormsMessage.classList.add('hidden');
    }
}

// 添加宿舍到侧边栏
function addDormToSidebar(dorm) {
    const dormItem = document.createElement('button');
    dormItem.className = 'flex items-center px-2 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 sidebar-item';
    dormItem.onclick = () => showDormView(dorm.id);
    
    dormItem.innerHTML = `
        <i class="fas fa-home mr-2 text-indigo-500"></i>
        <span>${dorm.name}</span>
    `;
    
    dormList.appendChild(dormItem);
    
    // 移动端也需要添加
    const mobileDormItem = dormItem.cloneNode(true);
    mobileDormItem.onclick = () => {
        showDormView(dorm.id);
        hideMobileSidebar();
    };
    mobileDormList.appendChild(mobileDormItem);
}

// 渲染宿舍卡片
function renderDormCard(dorm) {
    const noDormsMessage = document.getElementById('no-dorms-message');
    if (noDormsMessage && !noDormsMessage.classList.contains('hidden')) {
        noDormsMessage.classList.add('hidden');
    }
    
    const dormCard = document.createElement('div');
    dormCard.className = 'dorm-card bg-white rounded-lg shadow p-6 flex flex-col cursor-pointer';
    dormCard.onclick = () => showDormView(dorm.id);
    
    dormCard.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-800">${dorm.name}</h3>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dorm.isAdmin ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
                ${dorm.isAdmin ? '管理员' : '成员'}
            </span>
        </div>
        <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-600">成员数</span>
            <span class="text-sm font-medium text-gray-800">${dorm.members.length}人</span>
        </div>
        <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-600">公共经费</span>
            <span class="text-sm font-medium text-indigo-600">¥${dorm.funds.toFixed(2)}</span>
        </div>
        <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">宿舍ID</span>
            <span class="text-sm font-medium text-gray-800">${dorm.id}</span>
        </div>
    `;
    
    dormsContainer.appendChild(dormCard);
}

// 刷新宿舍卡片
function refreshDormCards() {
    dormsContainer.innerHTML = '';
    if (dorms.length === 0) {
        dormsContainer.innerHTML = '<p id="no-dorms-message" class="text-gray-500">你还没有加入任何宿舍，点击"创建"或"加入"按钮开始使用。</p>';
    } else {
        dorms.forEach(dorm => renderDormCard(dorm));
    }
}

// 修改更新经费历史函数，使用昵称
function updateFundsHistory(filter = 'all') {
    if (!currentDorm) return;
    
    const fundsHistoryList = document.getElementById('funds-history-list');
    fundsHistoryList.innerHTML = '';
    
    // 根据筛选条件过滤历史记录
    let filteredHistory = currentDorm.fundsHistory;
    if (filter !== 'all') {
        filteredHistory = currentDorm.fundsHistory.filter(item => item.type === filter);
    }
    
    // 添加已批准的申请到经费历史
    const approvedRequests = currentDorm.requests.filter(req => req.status === 'approved');
    if (filter === 'all' || filter === 'request') {
        filteredHistory = [...filteredHistory, ...approvedRequests];
    }
    
    // 按日期排序
    filteredHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredHistory.length === 0) {
        fundsHistoryList.innerHTML = '<li class="py-4"><p class="text-gray-500 text-center">暂无经费记录</p></li>';
        return;
    }
    
    // 渲染历史记录
    filteredHistory.forEach(item => {
        // 查找用户昵称
        const member = currentDorm.members.find(m => m.id === item.userId);
        const displayName = member ? (member.nickname || member.username) : item.username;
        
        const historyItem = document.createElement('li');
        historyItem.className = 'py-4';
        
        const isContribution = item.type === 'contribution';
        
        historyItem.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-start">
                    <div class="p-2 rounded-full ${isContribution ? 'bg-indigo-100' : 'bg-green-100'} mr-3">
                        <i class="fas ${isContribution ? 'fa-hand-holding-usd' : 'fa-shopping-cart'} ${isContribution ? 'text-indigo-600' : 'text-green-600'}"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-800">${item.description}</p>
                        <p class="text-xs text-gray-500">由 ${displayName} 于 ${formatDate(item.date)}</p>
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium ${isContribution ? 'text-indigo-600' : 'text-red-600'}">
                        ${isContribution ? '+' : '-'}¥${item.amount.toFixed(2)}
                    </p>
                </div>
            </div>
        `;
        
        fundsHistoryList.appendChild(historyItem);
    });
}

// 更新申请列表
function updateRequestsList(filter = 'all') {
    if (!currentDorm) return;
    
    // 待审批申请
    const pendingRequestsList = document.getElementById('pending-requests-list');
    pendingRequestsList.innerHTML = '';
    
    const pendingRequests = currentDorm.requests.filter(req => req.status === 'pending');
    
    if (pendingRequests.length === 0) {
        pendingRequestsList.innerHTML = '<p class="text-gray-500 text-center py-8">当前没有待审批的申请</p>';
    } else {
        pendingRequests.forEach(req => {
            // 查找用户昵称
            const member = currentDorm.members.find(m => m.id === req.userId);
            const displayName = member ? (member.nickname || member.username) : req.username;
            
            const requestItem = document.createElement('div');
            requestItem.className = 'bg-white rounded-lg border p-4 mb-4';
            
            requestItem.innerHTML = `
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h4 class="text-md font-semibold text-gray-800">${req.description}</h4>
                        <p class="text-sm text-gray-600">申请人: ${displayName}</p>
                        <p class="text-sm text-gray-600">申请日期: ${formatDate(req.date)}</p>
                        <p class="text-sm font-medium text-red-600">申请金额: ¥${req.amount.toFixed(2)}</p>
                    </div>
                    ${currentDorm.isAdmin ? `
                    <div class="flex space-x-2">
                        <button onclick="approveRequest('${req.id}')" class="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600">
                            批准
                        </button>
                        <button onclick="rejectRequest('${req.id}')" class="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600">
                            拒绝
                        </button>
                    </div>
                    ` : ''}
                </div>
            `;
            
            pendingRequestsList.appendChild(requestItem);
        });
    }
    
    // 申请历史
    const requestsHistoryList = document.getElementById('requests-history-list');
    requestsHistoryList.innerHTML = '';
    
    // 根据筛选条件过滤历史记录
    let filteredRequests = currentDorm.requests;
    if (filter !== 'all') {
        filteredRequests = currentDorm.requests.filter(req => req.status === filter);
    }
    
    // 按日期排序
    filteredRequests.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredRequests.length === 0) {
        requestsHistoryList.innerHTML = '<li class="py-4"><p class="text-gray-500 text-center">暂无申请记录</p></li>';
        return;
    }
    
    // 渲染历史记录
    filteredRequests.forEach(req => {
        // 查找用户昵称
        const member = currentDorm.members.find(m => m.id === req.userId);
        const displayName = member ? (member.nickname || member.username) : req.username;
        
        const historyItem = document.createElement('li');
        historyItem.className = 'py-4';
        
        const statusClass = req.status === 'approved' ? 'text-green-600' : (req.status === 'rejected' ? 'text-red-600' : 'text-yellow-600');
        const statusText = req.status === 'approved' ? '已批准' : (req.status === 'rejected' ? '已拒绝' : '待处理');
        
        historyItem.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-start">
                    <div class="p-2 rounded-full bg-gray-100 mr-3">
                        <i class="fas fa-shopping-cart text-gray-600"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-800">${req.description}</p>
                        <p class="text-xs text-gray-500">申请人: ${displayName} · 申请日期: ${formatDate(req.date)}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-sm font-medium text-red-600">¥${req.amount.toFixed(2)}</p>
                    <p class="text-xs ${statusClass}">${statusText}</p>
                </div>
            </div>
        `;
        
        requestsHistoryList.appendChild(historyItem);
    });
}

// 批准申请 - 需要修改以处理公共物品
function approveRequest(requestId) {
    if (!currentDorm || !currentDorm.isAdmin) return;
    
    const requestIndex = currentDorm.requests.findIndex(req => req.id === requestId);
    if (requestIndex === -1) return;
    
    const request = currentDorm.requests[requestIndex];
    
    // 检查经费是否足够
    if (currentDorm.funds < request.amount) {
        alert('公共经费不足，无法批准此申请');
        return;
    }
    
    // 更新申请状态
    request.status = 'approved';
    
    // 扣除经费
    currentDorm.funds -= request.amount;
    
    // 如果是公共物品申请，将物品添加到宿舍的公共物品列表
    if (request.isPublicItem && request.publicItem) {
        // 确保宿舍有公共物品数组
        if (!currentDorm.publicItems) {
            currentDorm.publicItems = [];
        }
        
        // 添加物品到列表
        currentDorm.publicItems.push({
            ...request.publicItem,
            id: `item_${Date.now()}`,
            status: request.publicItem.status,
            approvedDate: new Date().toISOString().split('T')[0]
        });
    }
    
    // 更新UI
    document.getElementById('current-funds').textContent = `¥${currentDorm.funds.toFixed(2)}`;
    updateRequestsList();
    updateFundsHistory();
    
    alert('申请已批准');
}

// 拒绝申请
function rejectRequest(requestId) {
    if (!currentDorm || !currentDorm.isAdmin) return;
    
    const requestIndex = currentDorm.requests.findIndex(req => req.id === requestId);
    if (requestIndex === -1) return;
    
    // 更新申请状态
    currentDorm.requests[requestIndex].status = 'rejected';
    
    // 更新UI
    updateRequestsList();
    
    alert('申请已拒绝');
}

// 显示缴纳经费模态框
function showContributeModal() {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    modal.id = 'contributeModal';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">缴纳经费</h3>
                <button onclick="closeModal('contributeModal')" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="px-6 py-4">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="contribute-amount">金额</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="contribute-amount" type="number" min="0" step="0.01" placeholder="请输入金额">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="contribute-description">描述</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="contribute-description" type="text" placeholder="请输入描述">
                </div>
                <div class="flex items-center justify-end">
                    <button onclick="closeModal('contributeModal')" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
                        取消
                    </button>
                    <button onclick="contributeToFunds()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        确认缴纳
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 显示申请使用经费模态框
function showRequestModal() {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    modal.id = 'requestModal';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">申请使用经费</h3>
                <button onclick="closeModal('requestModal')" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="px-6 py-4">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="request-amount">金额</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="request-amount" type="number" min="0" step="0.01" placeholder="请输入金额">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="request-description">用途描述</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="request-description" type="text" placeholder="请输入用途描述">
                </div>
                <!-- 新增选项：是否为购置公共物品 -->
                <div class="mb-4">
                    <label class="flex items-center">
                        <input type="checkbox" id="is-public-item" class="mr-2">
                        <span class="text-gray-700 text-sm font-bold">是否为购置公共物品</span>
                    </label>
                </div>
                <!-- 公共物品信息，初始隐藏 -->
                <div id="public-item-details" class="mb-4 hidden">
                    <div class="mb-3">
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="item-name">物品名称</label>
                        <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-name" type="text" placeholder="请输入物品名称">
                    </div>
                    <div class="mb-3">
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="item-photo">物品照片</label>
                        <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-photo" type="file" accept="image/*">
                    </div>
                    <div class="mb-3">
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="item-status">物品状态</label>
                        <select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-status">
                            <option value="new">全新</option>
                            <option value="good">良好</option>
                            <option value="normal">一般</option>
                            <option value="poor">较差</option>
                        </select>
                    </div>
                </div>
                <div class="flex items-center justify-end">
                    <button onclick="closeModal('requestModal')" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
                        取消
                    </button>
                    <button onclick="submitFundRequest()" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        提交申请
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加事件监听器，当勾选"是否为购置公共物品"时显示或隐藏相关字段
    document.getElementById('is-public-item').addEventListener('change', function() {
        document.getElementById('public-item-details').classList.toggle('hidden', !this.checked);
    });
}

// 显示邀请成员模态框
function showInviteModal() {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    modal.id = 'inviteModal';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">邀请成员</h3>
                <button onclick="closeModal('inviteModal')" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="px-6 py-4">
                <div class="mb-4">
                    <p class="text-gray-700 mb-2">分享以下宿舍ID给想要邀请的成员：</p>
                    <div class="flex items-center">
                        <input id="invite-code" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100" type="text" value="${currentDorm.id}" readonly>
                        <button onclick="copyInviteCode()" class="ml-2 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
                <div class="mt-4">
                    <p class="text-sm text-gray-600">成员可以在"加入宿舍"页面输入此ID来加入您的宿舍。</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}


// 显示设置昵称的模态框
function showNicknameModal() {
    // 获取当前用户在当前宿舍中的昵称
    const member = currentDorm.members.find(m => m.id === currentUser.id);
    if (member) {
        document.getElementById('nickname-input').value = member.nickname || member.username;
    }
    
    // 显示模态框
    const modal = document.getElementById('nicknameModal');
    modal.classList.remove('hidden');
}

// 切换昵称模态框的显示状态
function toggleNicknameModal() {
    const modal = document.getElementById('nicknameModal');
    modal.classList.toggle('hidden');
}

// 更新昵称
function updateNickname() {
    const nicknameInput = document.getElementById('nickname-input');
    const nickname = nicknameInput.value.trim();
    
    if (!nickname) {
        document.getElementById('nickname-error').classList.remove('hidden');
        return;
    }
    
    // 更新当前宿舍中当前用户的昵称
    const memberIndex = currentDorm.members.findIndex(m => m.id === currentUser.id);
    if (memberIndex !== -1) {
        currentDorm.members[memberIndex].nickname = nickname;
        
        // 更新所有宿舍数据中的昵称
        mockDorms.forEach(dorm => {
            if (dorm.id === currentDorm.id) {
                const idx = dorm.members.findIndex(m => m.id === currentUser.id);
                if (idx !== -1) {
                    dorm.members[idx].nickname = nickname;
                }
            }
        });
        
        // 显示成功消息
        alert('昵称设置成功！');
        
        // 关闭模态框
        toggleNicknameModal();
        
        // 如果有成员列表视图，更新它
        updateMembersList();
    }
}

// 更新成员列表
function updateMembersList() {
    const membersModal = document.getElementById('membersModal');
    if (membersModal) {
        // 如果成员列表模态框已打开，则关闭并重新打开
        closeModal('membersModal');
        showMembersList();
    }
}

// 显示成员列表模态框
function showMembersList() {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    modal.id = 'membersModal';
    
    let membersHTML = '';
    currentDorm.members.forEach(member => {
        const isCurrentUser = member.id === currentUser.id;
        const displayName = member.nickname || member.username;
        
        membersHTML += `
            <div class="flex items-center justify-between py-3 border-b">
                <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                        <i class="fas fa-user text-indigo-600"></i>
                    </div>
                    <div>
                        <p class="font-medium text-gray-800">${displayName}${isCurrentUser ? ' (我)' : ''}</p>
                        <p class="text-xs text-gray-500">${member.username}</p>
                    </div>
                </div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.isAdmin ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
                    ${member.isAdmin ? '管理员' : '成员'}
                </span>
            </div>
        `;
    });
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">宿舍成员</h3>
                <button onclick="closeModal('membersModal')" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="px-6 py-4 max-h-96 overflow-y-auto">
                ${membersHTML}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}


// 在初始化函数中添加以下代码
function updateAccountDropdown() {
    const profileLink = document.getElementById('profile-link');
    const logoutLink = document.getElementById('logout-link');
    const loginLink = document.getElementById('login-link');
    
    if (currentUser) {
        // 已登录状态
        profileLink.style.display = 'block';
        logoutLink.style.display = 'block';
        loginLink.style.display = 'none';
    } else {
        // 未登录状态
        profileLink.style.display = 'none';
        logoutLink.style.display = 'none';
        loginLink.style.display = 'block';
    }
}

// 显示加入宿舍模态框
function showJoinDormModal() {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    modal.id = 'joinDormModal';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">加入宿舍</h3>
                <button onclick="closeModal('joinDormModal')" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="px-6 py-4">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="dorm-id">宿舍ID</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="join-dorm-id" type="text" placeholder="请输入宿舍ID">
                </div>
                <div id="join-dorm-error" class="text-red-500 text-sm mb-4 hidden">无效的宿舍ID</div>
                <div class="flex items-center justify-end">
                    <button onclick="closeModal('joinDormModal')" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
                        取消
                    </button>
                    <button onclick="joinDorm()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        加入
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 关闭模态框
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

// 缴纳经费
function contributeToFunds() {
    const amount = parseFloat(document.getElementById('contribute-amount').value);
    const description = document.getElementById('contribute-description').value.trim();
    
    if (isNaN(amount) || amount <= 0) {
        alert('请输入有效金额');
        return;
    }
    
    // 获取当前用户在当前宿舍中的昵称
    const member = currentDorm.members.find(m => m.id === currentUser.id);
    const displayName = member ? (member.nickname || member.username) : currentUser.username;
    
    // 添加经费记录
    const contribution = {
        id: `contrib_${Date.now()}`,
        type: 'contribution',
        amount: amount,
        description: description,
        date: new Date().toISOString(),
        userId: currentUser.id,
        username: displayName
    };
    
    // 更新宿舍经费
    currentDorm.funds += amount;
    currentDorm.fundsHistory.push(contribution);
    
    // 更新UI
    document.getElementById('current-funds').textContent = `¥${currentDorm.funds.toFixed(2)}`;
    updateFundsHistory();
    
    // 关闭模态框
    closeModal('contributeModal');
    
    alert('经费缴纳成功！');
}

// 提交经费使用申请
function submitFundRequest() {
    const amount = parseFloat(document.getElementById('request-amount').value);
    const description = document.getElementById('request-description').value.trim();
    const isPublicItem = document.getElementById('is-public-item').checked;
    
    if (isNaN(amount) || amount <= 0) {
        alert('请输入有效金额');
        return;
    }
    
    if (!description) {
        alert('请输入用途描述');
        return;
    }
    
    // 获取当前用户在当前宿舍中的昵称
    const member = currentDorm.members.find(m => m.id === currentUser.id);
    const displayName = member ? (member.nickname || member.username) : currentUser.username;
    
    // 创建申请
    const request = {
        id: `req_${Date.now()}`,
        type: 'request',
        amount: amount,
        description: description,
        date: new Date().toISOString(),
        status: 'pending',
        userId: currentUser.id,
        username: displayName,
        isPublicItem: isPublicItem
    };
    
    // 如果是公共物品申请，添加物品信息
    if (isPublicItem) {
        const itemName = document.getElementById('item-name').value.trim();
        const itemStatus = document.getElementById('item-status').value;
        const itemPhotoInput = document.getElementById('item-photo');
        
        if (!itemName) {
            alert('请输入物品名称');
            return;
        }
        
        // 处理物品照片
        let itemPhoto = null;
        if (itemPhotoInput.files && itemPhotoInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                itemPhoto = e.target.result;
                
                // 完成物品信息
                request.publicItem = {
                    name: itemName,
                    price: amount,
                    status: itemStatus,
                    photo: itemPhoto,
                    purchaseDate: new Date().toISOString().split('T')[0]
                };
                
                // 添加申请
                finishSubmitRequest(request);
            };
            reader.readAsDataURL(itemPhotoInput.files[0]);
        } else {
            // 没有照片
            request.publicItem = {
                name: itemName,
                price: amount,
                status: itemStatus,
                photo: null,
                purchaseDate: new Date().toISOString().split('T')[0]
            };
            
            // 添加申请
            finishSubmitRequest(request);
        }
    } else {
        // 不是公共物品申请，直接添加
        finishSubmitRequest(request);
    }
}

// 完成申请提交
function finishSubmitRequest(request) {
    // 添加申请到宿舍
    currentDorm.requests.push(request);
    
    // 更新UI
    updateRequestsList();
    
    // 关闭模态框
    closeModal('requestModal');
    
    alert('申请已提交，等待管理员审批');
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
                        ${currentDorm.isAdmin ? `
                        <button onclick="showUpdateItemModal('${item.id}')" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
                            <i class="fas fa-edit mr-1"></i> 编辑物品
                        </button>
                        <button onclick="confirmDeleteItem('${item.id}')" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
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

// 显示更新物品模态框（包含名称、状态、照片）
function showUpdateItemModal(itemId) {
    if (!currentDorm || !currentDorm.publicItems) return;
    
    const item = currentDorm.publicItems.find(i => i.id === itemId);
    if (!item) return;
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    modal.id = 'updateItemModal';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">更新物品信息</h3>
                <button onclick="closeModal('updateItemModal')" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="px-6 py-4">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="update-item-name">物品名称</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="update-item-name" type="text" value="${item.name}">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="update-item-status">物品状态</label>
                    <select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="update-item-status">
                        <option value="new" ${item.status === 'new' ? 'selected' : ''}>全新</option>
                        <option value="good" ${item.status === 'good' ? 'selected' : ''}>良好</option>
                        <option value="normal" ${item.status === 'normal' ? 'selected' : ''}>一般</option>
                        <option value="poor" ${item.status === 'poor' ? 'selected' : ''}>较差</option>
                        <option value="broken" ${item.status === 'broken' ? 'selected' : ''}>损坏</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="update-item-photo">更新照片</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="update-item-photo" type="file" accept="image/*">
                </div>
                ${item.photo ? `
                <div class="mb-4">
                    <p class="text-sm text-gray-600 mb-2">当前照片:</p>
                    <img src="${item.photo}" alt="${item.name}" class="w-32 h-32 object-cover rounded">
                </div>
                ` : ''}
                <div class="flex items-center justify-end">
                    <button onclick="closeModal('updateItemModal')" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
                        取消
                    </button>
                    <button onclick="updateItem('${itemId}')" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        更新
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 更新物品信息
function updateItem(itemId) {
    if (!currentDorm || !currentDorm.publicItems) return;
    
    const itemIndex = currentDorm.publicItems.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;
    
    const newName = document.getElementById('update-item-name').value.trim();
    const newStatus = document.getElementById('update-item-status').value;
    const photoInput = document.getElementById('update-item-photo');
    
    if (!newName) {
        alert('物品名称不能为空');
        return;
    }
    
    // 更新名称和状态
    currentDorm.publicItems[itemIndex].name = newName;
    currentDorm.publicItems[itemIndex].status = newStatus;
    
    // 处理照片更新
    if (photoInput.files && photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentDorm.publicItems[itemIndex].photo = e.target.result;
            completeItemUpdate(itemId);
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        // 没有更新照片
        completeItemUpdate(itemId);
    }
}

// 完成物品更新
function completeItemUpdate(itemId) {
    // 关闭模态框
    closeModal('updateItemModal');
    closeModal('itemDetailsModal');
    
    // 如果在公物管理标签页，刷新列表
    if (document.getElementById('public-items-tab') && 
        !document.getElementById('public-items-tab').classList.contains('hidden')) {
        showPublicItemsTab();
    }
    
    alert('物品信息已更新');
    
    // 可选：重新打开物品详情
    showItemDetails(itemId);
}

// 确认删除物品
function confirmDeleteItem(itemId) {
    if (!currentDorm || !currentDorm.isAdmin || !currentDorm.publicItems) return;
    
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
    if (!currentDorm || !currentDorm.isAdmin || !currentDorm.publicItems) return;
    
    const itemIndex = currentDorm.publicItems.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;
    
    // 从列表中删除物品
    currentDorm.publicItems.splice(itemIndex, 1);
    
    // 更新全局数据，确保在mockDorms中也删除该物品
    mockDorms.forEach(dorm => {
        if (dorm.id === currentDorm.id && dorm.publicItems) {
            const idx = dorm.publicItems.findIndex(i => i.id === itemId);
            if (idx !== -1) {
                dorm.publicItems.splice(idx, 1);
            }
        }
    });
    
    // 关闭所有相关模态框
    closeModal('confirmDeleteModal');
    closeModal('itemDetailsModal');
    
    // 如果在公物管理标签页，刷新列表
    if (document.getElementById('public-items-tab') && 
        !document.getElementById('public-items-tab').classList.contains('hidden')) {
        showPublicItemsTab();
    }
    
    alert('物品已删除');
}

// 显示全尺寸图片
function showFullSizeImage(imageUrl, title) {
    if (!imageUrl) return;
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    modal.id = 'fullSizeImageModal';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">${title || '查看图片'}</h3>
                <button onclick="closeModal('fullSizeImageModal')" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="px-6 py-4 flex justify-center">
                <img src="${imageUrl}" alt="${title || '图片'}" class="max-w-full max-h-[70vh] object-contain">
            </div>
            <div class="px-6 py-3 border-t flex justify-end">
                <button onclick="closeModal('fullSizeImageModal')" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    关闭
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 显示更新物品状态模态框
function showUpdateItemStatusModal(itemId) {
    if (!currentDorm || !currentDorm.publicItems) return;
    
    const item = currentDorm.publicItems.find(i => i.id === itemId);
    if (!item) return;
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    modal.id = 'updateItemStatusModal';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">更新物品状态</h3>
                <button onclick="closeModal('updateItemStatusModal')" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="px-6 py-4">
                <div class="mb-4">
                    <p class="text-gray-700 mb-2">物品: ${item.name}</p>
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="update-item-status">新状态</label>
                    <select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="update-item-status">
                        <option value="new" ${item.status === 'new' ? 'selected' : ''}>全新</option>
                        <option value="good" ${item.status === 'good' ? 'selected' : ''}>良好</option>
                        <option value="normal" ${item.status === 'normal' ? 'selected' : ''}>一般</option>
                        <option value="poor" ${item.status === 'poor' ? 'selected' : ''}>较差</option>
                        <option value="broken" ${item.status === 'broken' ? 'selected' : ''}>损坏</option>
                    </select>
                </div>
                <div class="flex items-center justify-end">
                    <button onclick="closeModal('updateItemStatusModal')" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
                        取消
                    </button>
                    <button onclick="updateItemStatus('${itemId}')" class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        更新
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}
// 更新物品状态
function updateItemStatus(itemId) {
    if (!currentDorm || !currentDorm.publicItems) return;
    
    const itemIndex = currentDorm.publicItems.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;
    
    const newStatus = document.getElementById('update-item-status').value;
    
    // 更新物品状态
    currentDorm.publicItems[itemIndex].status = newStatus;
    
    // 关闭模态框
    closeModal('updateItemStatusModal');
    closeModal('itemDetailsModal');
    
    // 如果在公物管理标签页，刷新列表
    if (document.getElementById('public-items-tab') && 
        !document.getElementById('public-items-tab').classList.contains('hidden')) {
        showPublicItemsTab();
    }
    
    alert('物品状态已更新');
}

// 加入宿舍
function joinDorm() {
    const dormId = document.getElementById('join-dorm-id').value.trim();
    
    if (!dormId) {
        document.getElementById('join-dorm-error').textContent = '请输入宿舍ID';
        document.getElementById('join-dorm-error').classList.remove('hidden');
        return;
    }
    
    // 查找宿舍
    const dorm = mockDorms.find(d => d.id === dormId);
    
    if (!dorm) {
        document.getElementById('join-dorm-error').textContent = '找不到该宿舍';
        document.getElementById('join-dorm-error').classList.remove('hidden');
        return;
    }
    
    // 检查是否已经是成员
    if (dorm.members.some(m => m.id === currentUser.id)) {
        document.getElementById('join-dorm-error').textContent = '你已经是该宿舍的成员';
        document.getElementById('join-dorm-error').classList.remove('hidden');
        return;
    }
    
    // 添加用户到宿舍成员
    dorm.members.push({
        id: currentUser.id,
        username: currentUser.username,
        nickname: currentUser.username, // 默认昵称为用户名
        isAdmin: false
    });
    
    // 添加宿舍到用户的宿舍列表
    dorms.push({
        id: dorm.id,
        name: dorm.name,
        isAdmin: false,
        members: dorm.members,
        funds: dorm.funds,
        fundsHistory: dorm.fundsHistory,
        requests: dorm.requests,
        publicItems: dorm.publicItems
    });
    
    // 更新UI
    addDormToSidebar(dorms[dorms.length - 1]);
    renderDormCard(dorms[dorms.length - 1]);
    
    // 关闭模态框
    closeModal('joinDormModal');
    
    alert('成功加入宿舍！');
}

// 移除成员
function removeMember(memberId) {
    if (!currentDorm || !currentDorm.isAdmin) return;
    
    // 确认是否移除
    if (!confirm('确定要移除该成员吗？')) {
        return;
    }
    
    // 找到成员索引
    const memberIndex = currentDorm.members.findIndex(m => m.id === memberId);
    if (memberIndex === -1) return;
    
    // 移除成员
    currentDorm.members.splice(memberIndex, 1);
    
    // 更新UI
    closeModal('membersModal');
    showMembersList();
    
    alert('成员已移除');
}

// 更新宿舍信息
function updateDormInfo() {
    if (!currentDorm || !currentDorm.isAdmin) return;
    
    const newName = document.getElementById('dorm-name-input').value.trim();
    
    if (!newName) {
        alert('宿舍名称不能为空');
        return;
    }
    
    // 更新宿舍名称
    currentDorm.name = newName;
    
    // 更新UI
    document.getElementById('dorm-name-heading').textContent = newName;
    
    // 更新侧边栏
    updateSidebar();
    
    alert('宿舍信息已更新');
}

// 更新个人资料
function updateProfile() {
    if (!currentUser) return;
    
    const username = document.getElementById('profile-username-input').value.trim();
    const email = document.getElementById('profile-email-input').value.trim();
    const password = document.getElementById('profile-password-input').value;
    const confirmPassword = document.getElementById('profile-confirm-password-input').value;
    
    if (!username || !email) {
        alert('用户名和邮箱不能为空');
        return;
    }
    
    // 检查密码
    if (password) {
        if (password !== confirmPassword) {
            alert('两次输入的密码不一致');
            return;
        }
        
        // 更新密码
        const userIndex = mockUsers.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            mockUsers[userIndex].password = password;
        }
    }
    
    // 更新用户信息
    currentUser.username = username;
    currentUser.email = email;
    
    // 更新mock数据
    const userIndex = mockUsers.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        mockUsers[userIndex].username = username;
        mockUsers[userIndex].email = email;
    }
    
    // 更新宿舍中的用户名
    dorms.forEach(dorm => {
        const memberIndex = dorm.members.findIndex(m => m.id === currentUser.id);
        if (memberIndex !== -1) {
            dorm.members[memberIndex].username = username;
        }
    });
    
    // 更新UI
    usernameDisplay.textContent = username;
    document.getElementById('profile-username').textContent = username;
    
    // 保存到本地存储
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    alert('个人资料已更新');
}

// 复制邀请码
function copyInviteCode() {
    const inviteCode = document.getElementById('invite-code');
    inviteCode.select();
    document.execCommand('copy');
    
    alert('邀请码已复制到剪贴板');
}

// 切换经费历史筛选
function toggleFundsHistoryFilter() {
    const filter = document.getElementById('funds-history-filter');
    filter.classList.toggle('hidden');
}

// 筛选经费历史
function filterFundsHistory(type) {
    document.getElementById('funds-filter-text').textContent = 
        type === 'all' ? '全部' : (type === 'contribution' ? '缴纳' : '使用申请');
    
    document.getElementById('funds-history-filter').classList.add('hidden');
    
    updateFundsHistory(type);
}

// 切换申请历史筛选
function toggleRequestsHistoryFilter() {
    const filter = document.getElementById('requests-history-filter');
    filter.classList.toggle('hidden');
}

// 筛选申请历史
function filterRequestsHistory(status) {
    let statusText = '全部';
    switch (status) {
        case 'approved':
            statusText = '已批准';
            break;
        case 'rejected':
            statusText = '已拒绝';
            break;
        case 'pending':
            statusText = '待处理';
            break;
    }
    
    document.getElementById('requests-filter-text').textContent = statusText;
    document.getElementById('requests-history-filter').classList.add('hidden');
    
    updateRequestsList(status);
}

// 移动端侧边栏
function showMobileSidebar() {
    document.getElementById('mobileSidebar').classList.remove('-translate-x-full');
}

function hideMobileSidebar() {
    document.getElementById('mobileSidebar').classList.add('-translate-x-full');
}

// 账户下拉菜单
function toggleAccountDropdown() {
    document.getElementById('accountDropdown').classList.toggle('hidden');
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

// 在 dormmate.js 中添加共享文件夹标签页的初始化代码
// 在 init 函数中或者其他适当的位置添加以下代码

// 初始化标签页切换
function initTabs() {
    // 获取所有标签页按钮
    const tabButtons = document.querySelectorAll('.tab-button');
    
    // 为每个按钮添加点击事件
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 获取目标标签页ID
            const targetTabId = this.getAttribute('data-tab');
            
            // 隐藏所有标签页内容
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.add('hidden');
            });
            
            // 移除所有按钮的激活状态
            tabButtons.forEach(btn => {
                btn.classList.remove('bg-indigo-600', 'text-white');
                btn.classList.add('text-gray-600', 'hover:text-gray-900');
            });
            
            // 显示目标标签页
            document.getElementById(targetTabId).classList.remove('hidden');
            
            // 激活当前按钮
            this.classList.remove('text-gray-600', 'hover:text-gray-900');
            this.classList.add('bg-indigo-600', 'text-white');
            
            // 如果是共享文件夹标签页，初始化文件系统
            if (targetTabId === 'shared-files-tab') {
                showSharedFilesTab();
            }
        });
    });
}

// 初始化应用
document.addEventListener('DOMContentLoaded', init);