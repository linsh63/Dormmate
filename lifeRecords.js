// 生活记录系统 - 功能实现

// 全局变量
let currentLifeRecords = [];
let currentDisplayMode = 'grid'; // 默认显示模式：grid, wall, timeline

// 初始化生活记录系统
function initLifeRecordsSystem() {
    // 确保当前宿舍有生活记录数组
    if (currentDorm && !currentDorm.lifeRecords) {
        currentDorm.lifeRecords = [];
    }
    
    if (currentDorm) {
        currentLifeRecords = currentDorm.lifeRecords || [];
        renderLifeRecordsList();
    }
}

// 渲染生活记录列表
function renderLifeRecordsList() {
    const lifeRecordsList = document.getElementById('life-records-list');
    if (!lifeRecordsList) return;
    
    lifeRecordsList.innerHTML = '';
    
    if (currentLifeRecords.length === 0) {
        lifeRecordsList.innerHTML = '<p class="text-gray-500 text-center py-8">当前没有生活记录，快来上传吧！</p>';
        return;
    }
    
    // 根据当前显示模式渲染
    switch(currentDisplayMode) {
        case 'wall':
            renderPhotoWall(lifeRecordsList);
            break;
        case 'timeline':
            renderTimeline(lifeRecordsList);
            break;
        case 'grid':
        default:
            renderGridView(lifeRecordsList);
            break;
    }
}

// 网格视图渲染
// 修改渲染函数，移除文本类型的处理
function renderGridView(container) {
    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4';
    
    currentLifeRecords.forEach(record => {
        const recordCard = document.createElement('div');
        recordCard.className = 'bg-white rounded-lg border p-4 hover:shadow-md transition-shadow';
        
        let contentHTML = '';
        
        // 根据记录类型显示不同内容
        switch(record.type) {
            case 'image':
                contentHTML = `
                    <div class="w-full h-48 rounded-md overflow-hidden mb-2 cursor-pointer" 
                         onclick="showFullSizeMedia('${record.content}', '${record.title}', 'image')">
                        <img src="${record.content}" alt="${record.title}" class="w-full h-full object-cover">
                    </div>`;
                break;
            case 'video':
                contentHTML = `
                    <div class="w-full h-48 rounded-md overflow-hidden mb-2 cursor-pointer relative" 
                         onclick="showFullSizeMedia('${record.content}', '${record.title}', 'video')">
                        <video src="${record.content}" class="w-full h-full object-cover" preload="metadata"></video>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <i class="fas fa-play-circle text-white text-4xl opacity-80"></i>
                        </div>
                    </div>`;
                break;
        }
        // 在renderGridView函数中修改
        recordCard.innerHTML = `
            <div>
                ${contentHTML}
                <h4 class="text-md font-semibold text-gray-800">${record.title}</h4>
                <p class="text-sm text-gray-600">${formatDate(record.date)}</p>
                <div class="flex justify-between items-center mt-2">
                    <span class="text-xs text-gray-500">
                        <i class="fas ${record.type === 'image' ? 'fa-image' : (record.type === 'video' ? 'fa-video' : 'fa-file-alt')}"></i>
                        ${record.type === 'image' ? '图片' : (record.type === 'video' ? '视频' : '文本')}
                    </span>
                    <div>
                        <button onclick="event.stopPropagation(); showFullSizeMedia('${record.content}', '${record.title}', '${record.type}', '${record.id}')" 
                                class="text-blue-600 hover:text-blue-800 text-sm">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${currentDorm && currentDorm.isAdmin ? `
                        <button onclick="event.stopPropagation(); deleteLifeRecord('${record.id}')" 
                                class="text-red-600 hover:text-red-800 text-sm ml-2">
                            <i class="fas fa-trash"></i>
                        </button>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        gridContainer.appendChild(recordCard);
    });
    
    container.appendChild(gridContainer);
}

// 照片墙渲染
function renderPhotoWall(container) {
    // 只筛选图片类型的记录
    const imageRecords = currentLifeRecords.filter(record => record.type === 'image');
    
    if (imageRecords.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">没有图片记录，无法创建照片墙</p>';
        return;
    }
    
    const wallContainer = document.createElement('div');
    wallContainer.className = 'masonry-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2';
    
    // 随机排列图片，创造更有趣的照片墙效果
    const shuffledImages = [...imageRecords].sort(() => Math.random() - 0.5);
    
    shuffledImages.forEach((record, index) => {
        const size = index % 5 === 0 ? 'col-span-2 row-span-2' : '';
        const rotation = Math.floor(Math.random() * 6) - 3; // -3 到 3 度的随机旋转
        
        const imageCard = document.createElement('div');
        imageCard.className = `bg-white p-2 shadow-md hover:shadow-lg transition-all duration-300 ${size}`;
        imageCard.style.transform = `rotate(${rotation}deg)`;
        
        imageCard.innerHTML = `
            <div class="relative overflow-hidden cursor-pointer" 
                 onclick="showFullSizeMedia('${record.content}', '${record.title}', 'image')">
                <img src="${record.content}" alt="${record.title}" class="w-full h-full object-cover">
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <h4 class="text-white text-sm font-medium truncate">${record.title}</h4>
                    <p class="text-white/80 text-xs">${formatDate(record.date)}</p>
                </div>
            </div>
        `;
        
        wallContainer.appendChild(imageCard);
    });
    
    container.appendChild(wallContainer);
}

// 时间线渲染 - 改为文件夹结构
// 添加一个全局变量来存储展开状态
let expandedFolders = {
    years: {},
    months: {},
    days: {}
};

// 修改时间线渲染函数
function renderTimeline(container) {
    // 按日期排序
    const sortedRecords = [...currentLifeRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 按年、月、日分组
    const recordsByDate = {};
    
    sortedRecords.forEach(record => {
        const date = new Date(record.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        if (!recordsByDate[year]) {
            recordsByDate[year] = {};
        }
        
        if (!recordsByDate[year][month]) {
            recordsByDate[year][month] = {};
        }
        
        if (!recordsByDate[year][month][day]) {
            recordsByDate[year][month][day] = [];
        }
        
        recordsByDate[year][month][day].push(record);
    });
    
    const folderContainer = document.createElement('div');
    folderContainer.className = 'folder-structure p-4';
    
    // 创建根文件夹
    const rootFolder = document.createElement('div');
    rootFolder.className = 'root-folder';
    rootFolder.innerHTML = `
        <div class="text-xl font-bold mb-4 text-indigo-700 border-b pb-2">
            <i class="fas fa-folder-open mr-2"></i>生活记录文件夹
        </div>
    `;
    
    // 年份文件夹
    const yearsList = document.createElement('div');
    yearsList.className = 'ml-6 space-y-4';
    
    // 按年份降序排序
    const years = Object.keys(recordsByDate).sort((a, b) => b - a);
    
    years.forEach(year => {
        const yearFolder = document.createElement('div');
        yearFolder.className = 'year-folder';
        yearFolder.dataset.year = year;
        
        const yearHeader = document.createElement('div');
        yearHeader.className = 'flex items-center cursor-pointer hover:bg-indigo-50 p-2 rounded-md transition-colors';
        yearHeader.innerHTML = `
            <i class="fas fa-folder text-yellow-500 mr-2"></i>
            <span class="font-semibold">${year}年</span>
            <i class="fas fa-chevron-down ml-2 text-gray-500 text-sm year-toggle"></i>
        `;
        
        // 点击年份文件夹展开/折叠
        yearHeader.addEventListener('click', function() {
            const monthsContainer = this.nextElementSibling;
            const toggleIcon = this.querySelector('.year-toggle');
            
            if (monthsContainer.style.display === 'none') {
                monthsContainer.style.display = 'block';
                toggleIcon.classList.remove('fa-chevron-down');
                toggleIcon.classList.add('fa-chevron-up');
                expandedFolders.years[year] = true;
            } else {
                monthsContainer.style.display = 'none';
                toggleIcon.classList.remove('fa-chevron-up');
                toggleIcon.classList.add('fa-chevron-down');
                expandedFolders.years[year] = false;
            }
        });
        
        yearFolder.appendChild(yearHeader);
        
        // 月份文件夹容器
        const monthsContainer = document.createElement('div');
        monthsContainer.className = 'ml-6 space-y-3 mt-2';
        // 根据保存的状态决定是否显示
        monthsContainer.style.display = expandedFolders.years[year] ? 'block' : 'none';
        
        // 如果年份已展开，更新图标
        if (expandedFolders.years[year]) {
            const toggleIcon = yearHeader.querySelector('.year-toggle');
            toggleIcon.classList.remove('fa-chevron-down');
            toggleIcon.classList.add('fa-chevron-up');
        }
        
        // 按月份降序排序
        const months = Object.keys(recordsByDate[year]).sort((a, b) => b - a);
        
        months.forEach(month => {
            const monthFolder = document.createElement('div');
            monthFolder.className = 'month-folder';
            monthFolder.dataset.year = year;
            monthFolder.dataset.month = month;
            
            const monthName = new Date(year, month - 1, 1).toLocaleString('zh-CN', { month: 'long' });
            
            const monthHeader = document.createElement('div');
            monthHeader.className = 'flex items-center cursor-pointer hover:bg-indigo-50 p-2 rounded-md transition-colors';
            monthHeader.innerHTML = `
                <i class="fas fa-folder text-blue-500 mr-2"></i>
                <span class="font-medium">${monthName}</span>
                <i class="fas fa-chevron-down ml-2 text-gray-500 text-sm month-toggle"></i>
            `;
            
            // 点击月份文件夹展开/折叠
            monthHeader.addEventListener('click', function() {
                const daysContainer = this.nextElementSibling;
                const toggleIcon = this.querySelector('.month-toggle');
                
                if (daysContainer.style.display === 'none') {
                    daysContainer.style.display = 'block';
                    toggleIcon.classList.remove('fa-chevron-down');
                    toggleIcon.classList.add('fa-chevron-up');
                    if (!expandedFolders.months[year]) expandedFolders.months[year] = {};
                    expandedFolders.months[year][month] = true;
                } else {
                    daysContainer.style.display = 'none';
                    toggleIcon.classList.remove('fa-chevron-up');
                    toggleIcon.classList.add('fa-chevron-down');
                    if (!expandedFolders.months[year]) expandedFolders.months[year] = {};
                    expandedFolders.months[year][month] = false;
                }
            });
            
            monthFolder.appendChild(monthHeader);
            
            // 日期文件夹容器
            const daysContainer = document.createElement('div');
            daysContainer.className = 'ml-6 space-y-2 mt-2';
            
            // 根据保存的状态决定是否显示
            const monthExpanded = expandedFolders.months && 
                                 expandedFolders.months[year] && 
                                 expandedFolders.months[year][month];
            daysContainer.style.display = monthExpanded ? 'block' : 'none';
            
            // 如果月份已展开，更新图标
            if (monthExpanded) {
                const toggleIcon = monthHeader.querySelector('.month-toggle');
                toggleIcon.classList.remove('fa-chevron-down');
                toggleIcon.classList.add('fa-chevron-up');
            }
            
            // 按日期降序排序
            const days = Object.keys(recordsByDate[year][month]).sort((a, b) => b - a);
            
            days.forEach(day => {
                const dayFolder = document.createElement('div');
                dayFolder.className = 'day-folder';
                dayFolder.dataset.year = year;
                dayFolder.dataset.month = month;
                dayFolder.dataset.day = day;
                
                const date = new Date(year, month - 1, day);
                const dayOfWeek = date.toLocaleString('zh-CN', { weekday: 'short' });
                
                const dayHeader = document.createElement('div');
                dayHeader.className = 'flex items-center cursor-pointer hover:bg-indigo-50 p-2 rounded-md transition-colors';
                dayHeader.innerHTML = `
                    <i class="fas fa-folder text-green-500 mr-2"></i>
                    <span>${day}日 (${dayOfWeek})</span>
                    <i class="fas fa-chevron-down ml-2 text-gray-500 text-sm day-toggle"></i>
                `;
                
                // 点击日期文件夹展开/折叠
                dayHeader.addEventListener('click', function() {
                    const recordsContainer = this.nextElementSibling;
                    const toggleIcon = this.querySelector('.day-toggle');
                    
                    if (recordsContainer.style.display === 'none') {
                        recordsContainer.style.display = 'block';
                        toggleIcon.classList.remove('fa-chevron-down');
                        toggleIcon.classList.add('fa-chevron-up');
                        if (!expandedFolders.days[year]) expandedFolders.days[year] = {};
                        if (!expandedFolders.days[year][month]) expandedFolders.days[year][month] = {};
                        expandedFolders.days[year][month][day] = true;
                    } else {
                        recordsContainer.style.display = 'none';
                        toggleIcon.classList.remove('fa-chevron-up');
                        toggleIcon.classList.add('fa-chevron-down');
                        if (!expandedFolders.days[year]) expandedFolders.days[year] = {};
                        if (!expandedFolders.days[year][month]) expandedFolders.days[year][month] = {};
                        expandedFolders.days[year][month][day] = false;
                    }
                });
                
                dayFolder.appendChild(dayHeader);
                
                // 记录容器
                const recordsContainer = document.createElement('div');
                recordsContainer.className = 'ml-6 space-y-2 mt-2';
                
                // 根据保存的状态决定是否显示
                const dayExpanded = expandedFolders.days && 
                                   expandedFolders.days[year] && 
                                   expandedFolders.days[year][month] && 
                                   expandedFolders.days[year][month][day];
                recordsContainer.style.display = dayExpanded ? 'block' : 'none';
                
                // 如果日期已展开，更新图标
                if (dayExpanded) {
                    const toggleIcon = dayHeader.querySelector('.day-toggle');
                    toggleIcon.classList.remove('fa-chevron-down');
                    toggleIcon.classList.add('fa-chevron-up');
                }
                
                // 渲染当天的记录
                recordsByDate[year][month][day].forEach(record => {
                    const recordItem = document.createElement('div');
                    recordItem.className = 'record-item flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors';
                    
                    // 根据记录类型显示不同图标
                    let icon = '';
                    switch(record.type) {
                        case 'image':
                            icon = '<i class="fas fa-image text-green-600 mr-2"></i>';
                            break;
                        case 'video':
                            icon = '<i class="fas fa-video text-blue-600 mr-2"></i>';
                            break;
                        case 'text':
                            icon = '<i class="fas fa-file-alt text-purple-600 mr-2"></i>';
                            break;
                    }
                    
                    // 创建缩略图预览
                    let thumbnailHTML = '';
                    if (record.type === 'image') {
                        thumbnailHTML = `
                            <div class="w-10 h-10 rounded overflow-hidden mr-2 flex-shrink-0">
                                <img src="${record.content}" alt="${record.title}" class="w-full h-full object-cover">
                            </div>
                        `;
                    } else if (record.type === 'video') {
                        thumbnailHTML = `
                            <div class="w-10 h-10 rounded overflow-hidden mr-2 flex-shrink-0 relative bg-gray-200">
                                <video src="${record.content}" class="w-full h-full object-cover"></video>
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <i class="fas fa-play-circle text-white text-sm"></i>
                                </div>
                            </div>
                        `;
                    }
                    
                    recordItem.innerHTML = `
                        ${thumbnailHTML}
                        ${icon}
                        <span class="truncate">${record.title}</span>
                        <div class="ml-auto flex space-x-2">
                            <button onclick="event.stopPropagation(); showFullSizeMedia('${record.content}', '${record.title}', '${record.type}', '${record.id}')" 
                                    class="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-100">
                                <i class="fas fa-eye text-sm"></i>
                            </button>
                            ${currentDorm && currentDorm.isAdmin ? `
                            <button onclick="event.stopPropagation(); deleteLifeRecord('${record.id}')" 
                                    class="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100">
                                <i class="fas fa-trash text-sm"></i>
                            </button>` : ''}
                        </div>
                    `;
                    
                    // 点击记录项查看全尺寸媒体
                    recordItem.addEventListener('click', function(e) {
                        if (!e.target.closest('button')) {
                            showFullSizeMedia(record.content, record.title, record.type, record.id);
                        }
                    });
                    
                    recordsContainer.appendChild(recordItem);
                });
                
                dayFolder.appendChild(recordsContainer);
                daysContainer.appendChild(dayFolder);
            });
            
            monthFolder.appendChild(daysContainer);
            monthsContainer.appendChild(monthFolder);
        });
        
        yearFolder.appendChild(monthsContainer);
        yearsList.appendChild(yearFolder);
    });
    
    rootFolder.appendChild(yearsList);
    folderContainer.appendChild(rootFolder);
    container.appendChild(folderContainer);
    
    // 如果没有保存的展开状态，默认展开第一个年份
    if (Object.keys(expandedFolders.years).length === 0 && years.length > 0) {
        const firstYear = years[0];
        expandedFolders.years[firstYear] = true;
        
        const firstYearFolder = yearsList.querySelector(`.year-folder[data-year="${firstYear}"]`);
        if (firstYearFolder) {
            const yearHeader = firstYearFolder.querySelector('.flex.items-center');
            yearHeader.click();
        }
    }
}

// 切换显示模式
function changeDisplayMode(mode) {
    currentDisplayMode = mode;
    
    // 更新模式选择器的激活状态
    document.querySelectorAll('.display-mode-btn').forEach(btn => {
        btn.classList.remove('bg-indigo-600', 'text-white');
        btn.classList.add('bg-white', 'text-gray-700');
    });
    
    document.getElementById(`${mode}-mode-btn`).classList.remove('bg-white', 'text-gray-700');
    document.getElementById(`${mode}-mode-btn`).classList.add('bg-indigo-600', 'text-white');
    
    // 重新渲染列表
    renderLifeRecordsList();
}

// 显示添加生活记录模态框
function showAddRecordModal() {
    if (!currentDorm) return;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    modal.id = 'addRecordModal';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">添加生活记录</h3>
                <button onclick="closeModal('addRecordModal')" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="px-6 py-4">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="record-title-input">标题</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="record-title-input" type="text" placeholder="请输入标题">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="record-type-input">记录类型</label>
                    <select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="record-type-input" disabled>
                        <option value="" selected>请先选择文件</option>
                        <option value="image">图片</option>
                        <option value="video">视频</option>
                    </select>
                    <p class="text-xs text-gray-500 mt-1">记录类型将根据上传的文件自动选择</p>
                </div>
                <div id="file-input-container" class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="record-file-input">上传文件</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="record-file-input" type="file" accept="image/*,video/*" onchange="handleFileSelect(this)">
                    <p class="text-xs text-gray-500 mt-1">仅支持图片和视频文件</p>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="record-date-input">日期</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="record-date-input" type="date" value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="flex items-center justify-end">
                    <button onclick="closeModal('addRecordModal')" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
                        取消
                    </button>
                    <button onclick="addLifeRecord()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        添加
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 处理文件选择，自动判断文件类型
function handleFileSelect(fileInput) {
    if (!fileInput.files || fileInput.files.length === 0) {
        return;
    }
    
    const file = fileInput.files[0];
    const fileName = file.name.toLowerCase();
    const typeSelect = document.getElementById('record-type-input');
    
    // 图片文件扩展名
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    // 视频文件扩展名
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv'];
    
    let isValidFile = false;
    
    // 检查是否为图片文件
    for (const ext of imageExtensions) {
        if (fileName.endsWith(ext)) {
            typeSelect.value = 'image';
            isValidFile = true;
            break;
        }
    }
    
    // 如果不是图片，检查是否为视频文件
    if (!isValidFile) {
        for (const ext of videoExtensions) {
            if (fileName.endsWith(ext)) {
                typeSelect.value = 'video';
                isValidFile = true;
                break;
            }
        }
    }
    
    // 如果既不是图片也不是视频，提示用户重新选择
    if (!isValidFile) {
        alert('请上传图片或视频文件！');
        fileInput.value = ''; // 清空文件输入
    }
}

// 添加生活记录
function addLifeRecord() {
    if (!currentDorm) return;
    
    const titleInput = document.getElementById('record-title-input');
    const typeInput = document.getElementById('record-type-input');
    const fileInput = document.getElementById('record-file-input');
    const dateInput = document.getElementById('record-date-input');
    
    const title = titleInput.value.trim();
    const type = typeInput.value;
    const date = dateInput.value;
    
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('请选择文件');
        return;
    }
    
    // 再次验证文件类型
    const file = fileInput.files[0];
    const fileName = file.name.toLowerCase();
    
    // 图片文件扩展名
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    // 视频文件扩展名
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv'];
    
    let isValidFile = false;
    let fileType = '';
    
    // 检查是否为图片文件
    for (const ext of imageExtensions) {
        if (fileName.endsWith(ext)) {
            fileType = 'image';
            isValidFile = true;
            break;
        }
    }
    
    // 如果不是图片，检查是否为视频文件
    if (!isValidFile) {
        for (const ext of videoExtensions) {
            if (fileName.endsWith(ext)) {
                fileType = 'video';
                isValidFile = true;
                break;
            }
        }
    }
    
    // 如果既不是图片也不是视频，提示用户重新选择
    if (!isValidFile) {
        alert('请上传图片或视频文件！');
        return;
    }
    
    // 创建新记录对象
    const newRecord = {
        id: `record_${Date.now()}`,
        title: title,
        type: fileType, // 使用检测到的文件类型
        date: date,
        content: null,
        fileName: file.name
    };
    
    // 处理文件上传
    const reader = new FileReader();
    reader.onload = function(e) {
        newRecord.content = e.target.result;
        completeAddRecord(newRecord);
    };
    
    reader.readAsDataURL(file);
}

// 完成添加记录
function completeAddRecord(record) {
    // 确保宿舍有生活记录数组
    if (!currentDorm.lifeRecords) {
        currentDorm.lifeRecords = [];
    }
    
    // 添加记录到列表
    currentDorm.lifeRecords.push(record);
    currentLifeRecords = currentDorm.lifeRecords;
    
    // 更新全局数据
    if (typeof dorms !== 'undefined') {
        const dormIndex = dorms.findIndex(d => d.id === currentDorm.id);
        if (dormIndex !== -1) {
            dorms[dormIndex].lifeRecords = currentLifeRecords;
        }
    }
    
    if (typeof mockDorms !== 'undefined') {
        const mockDormIndex = mockDorms.findIndex(d => d.id === currentDorm.id);
        if (mockDormIndex !== -1) {
            mockDorms[mockDormIndex].lifeRecords = currentLifeRecords;
        }
    }
    
    // 更新UI
    renderLifeRecordsList();
    
    // 关闭模态框
    closeModal('addRecordModal');
    
    alert('生活记录添加成功！');
    
    // 自动展开包含新记录的文件夹
    if (currentDisplayMode === 'timeline') {
        const date = new Date(record.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        // 设置展开状态
        expandedFolders.years[year] = true;
        if (!expandedFolders.months[year]) expandedFolders.months[year] = {};
        expandedFolders.months[year][month] = true;
        if (!expandedFolders.days[year]) expandedFolders.days[year] = {};
        if (!expandedFolders.days[year][month]) expandedFolders.days[year][month] = {};
        expandedFolders.days[year][month][day] = true;
        
        // 重新渲染以应用展开状态
        renderLifeRecordsList();
    }
}

// 删除生活记录
function deleteLifeRecord(recordId) {
    if (!currentDorm || !currentDorm.isAdmin) return;
    
    // 确认删除
    if (!confirm('确定要删除这条生活记录吗？')) {
        return;
    }
    
    // 查找记录索引
    const recordIndex = currentLifeRecords.findIndex(r => r.id === recordId);
    if (recordIndex === -1) return;
    
    // 删除记录
    currentLifeRecords.splice(recordIndex, 1);
    currentDorm.lifeRecords = currentLifeRecords;
    
    // 更新全局数据
    if (typeof dorms !== 'undefined') {
        const dormIndex = dorms.findIndex(d => d.id === currentDorm.id);
        if (dormIndex !== -1) {
            dorms[dormIndex].lifeRecords = currentLifeRecords;
        }
    }
    
    if (typeof mockDorms !== 'undefined') {
        const mockDormIndex = mockDorms.findIndex(d => d.id === currentDorm.id);
        if (mockDormIndex !== -1) {
            mockDorms[mockDormIndex].lifeRecords = currentLifeRecords;
        }
    }
    
    // 更新UI
    renderLifeRecordsList();
    
    alert('生活记录已删除');
}

// 显示全尺寸媒体
function showFullSizeMedia(content, title, type, recordId = null) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    modal.id = 'fullSizeMediaModal';
    
    // 获取当前记录的索引和所有媒体记录（包括图片和视频）
    let currentIndex = -1;
    
    // 筛选出图片和视频类型的记录
    let allMediaRecords = currentLifeRecords.filter(r => r.type === 'image' || r.type === 'video');
    
    // 按日期排序
    allMediaRecords = allMediaRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 如果提供了recordId，则查找该记录的索引
    if (recordId) {
        currentIndex = allMediaRecords.findIndex(r => r.id === recordId);
    } else {
        // 否则通过内容和标题查找
        currentIndex = allMediaRecords.findIndex(r => r.content === content && r.title === title);
    }
    
    // 计算前一个和后一个记录的索引
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : allMediaRecords.length - 1;
    const nextIndex = currentIndex < allMediaRecords.length - 1 ? currentIndex + 1 : 0;
    
    let mediaHTML = '';
    
    switch(type) {
        case 'image':
            mediaHTML = `<img src="${content}" alt="${title}" class="max-w-full max-h-[80vh] object-contain">`;
            break;
        case 'video':
            mediaHTML = `
                <video src="${content}" controls autoplay class="max-w-full max-h-[80vh]"></video>
            `;
            break;
        case 'text':
            // 查找对应的记录以获取文件名
            const record = currentLifeRecords.find(r => r.content === content && r.title === title);
            const fileName = record ? record.fileName : `${title}.txt`;
            
            mediaHTML = `
                <div class="bg-white p-6 rounded-lg w-full max-w-2xl">
                    <div class="flex items-center mb-6">
                        <i class="fas fa-file-alt text-gray-400 text-4xl mr-4"></i>
                        <div>
                            <h3 class="text-lg font-medium text-gray-800">${fileName}</h3>
                            <p class="text-sm text-gray-500">${formatFileSize(content.length)}</p>
                        </div>
                    </div>
                    <div class="flex justify-center">
                        <button onclick="downloadTextContent('${encodeURIComponent(content)}', '${title}')" class="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded flex items-center">
                            <i class="fas fa-download mr-2"></i> 下载文件
                        </button>
                    </div>
                </div>
            `;
            break;
    }
    
    // 添加导航按钮，仅当有多个媒体时显示
    const navigationButtons = allMediaRecords.length > 1 ? `
        <button id="prevMediaBtn" class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-70 transition-all">
            <i class="fas fa-chevron-left"></i>
        </button>
        <button id="nextMediaBtn" class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-70 transition-all">
            <i class="fas fa-chevron-right"></i>
        </button>
    ` : '';
    
    // 添加媒体类型指示器
    const typeIndicator = `
        <div class="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
            ${type === 'image' ? '<i class="fas fa-image mr-1"></i>图片' : '<i class="fas fa-video mr-1"></i>视频'}
        </div>
    `;
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl relative">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
                <button onclick="closeModal('fullSizeMediaModal')" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="px-6 py-4 flex justify-center relative">
                ${mediaHTML}
                ${type !== 'text' ? typeIndicator : ''}
                ${navigationButtons}
            </div>
            <div class="px-6 py-3 border-t flex justify-between">
                <div class="text-sm text-gray-500">
                    ${allMediaRecords.length > 1 ? `${currentIndex + 1} / ${allMediaRecords.length}` : ''}
                </div>
                <button onclick="closeModal('fullSizeMediaModal')" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    关闭
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 如果有多个媒体，添加导航功能
    if (allMediaRecords.length > 1) {
        // 添加前一个按钮点击事件
        const prevBtn = document.getElementById('prevMediaBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                const prevRecord = allMediaRecords[prevIndex];
                closeModal('fullSizeMediaModal');
                showFullSizeMedia(prevRecord.content, prevRecord.title, prevRecord.type, prevRecord.id);
            });
        }
        
        // 添加后一个按钮点击事件
        const nextBtn = document.getElementById('nextMediaBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                const nextRecord = allMediaRecords[nextIndex];
                closeModal('fullSizeMediaModal');
                showFullSizeMedia(nextRecord.content, nextRecord.title, nextRecord.type, nextRecord.id);
            });
        }
        
        // 添加键盘事件监听
        const keyHandler = function(e) {
            if (e.key === 'ArrowLeft') {
                // 左箭头键 - 前一个
                const prevRecord = allMediaRecords[prevIndex];
                closeModal('fullSizeMediaModal');
                showFullSizeMedia(prevRecord.content, prevRecord.title, prevRecord.type, prevRecord.id);
            } else if (e.key === 'ArrowRight') {
                // 右箭头键 - 后一个
                const nextRecord = allMediaRecords[nextIndex];
                closeModal('fullSizeMediaModal');
                showFullSizeMedia(nextRecord.content, nextRecord.title, nextRecord.type, nextRecord.id);
            } else if (e.key === 'Escape') {
                // ESC键 - 关闭
                closeModal('fullSizeMediaModal');
            }
        };
        
        document.addEventListener('keydown', keyHandler);
        
        // 在模态框关闭时移除事件监听
        modal.addEventListener('remove', function() {
            document.removeEventListener('keydown', keyHandler);
        });
        
        // 修改closeModal函数以触发remove事件
        const originalCloseModal = window.closeModal;
        window.closeModal = function(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                const event = new Event('remove');
                modal.dispatchEvent(event);
            }
            originalCloseModal(modalId);
        };
    }
}

// 下载文本内容
function downloadTextContent(encodedContent, fileName) {
    const content = decodeURIComponent(encodedContent);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// 创建视频合集
function createVideoCollection() {
    // 筛选视频记录
    const videoRecords = currentLifeRecords.filter(record => record.type === 'video');
    
    if (videoRecords.length === 0) {
        alert('当前宿舍没有视频记录，无法创建合集！');
        return;
    }
    
    // 按日期排序（从新到旧）
    const sortedVideos = [...videoRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 创建视频合集模态框
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    modal.id = 'videoCollectionModal';
    
    // 构建视频播放列表HTML
    let videoListHTML = '';
    sortedVideos.forEach((video, index) => {
        videoListHTML += `
            <div class="video-item flex items-center p-2 ${index === 0 ? 'bg-indigo-50' : ''} hover:bg-indigo-50 rounded-md mb-2" data-index="${index}">
                <div class="w-16 h-12 rounded overflow-hidden mr-2 flex-shrink-0 relative bg-gray-200">
                    <video src="${video.content}" class="w-full h-full object-cover"></video>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <i class="fas fa-play-circle text-white text-sm"></i>
                    </div>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium truncate">${video.title}</p>
                    <p class="text-xs text-gray-500">${formatDate(video.date)}</p>
                </div>
            </div>
        `;
    });
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[80vh] flex flex-col">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">视频合集</h3>
                <button onclick="closeModal('videoCollectionModal')" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="flex flex-1 overflow-hidden">
                <div class="w-2/3 bg-black flex items-center justify-center p-4">
                    <video id="collectionPlayer" src="${sortedVideos[0].content}" controls autoplay class="max-w-full max-h-full"></video>
                </div>
                <div class="w-1/3 border-l overflow-y-auto p-4">
                    <h4 class="font-medium text-gray-800 mb-3">播放列表 (${sortedVideos.length}个视频)</h4>
                    <div id="videoPlaylist" class="space-y-2">
                        ${videoListHTML}
                    </div>
                </div>
            </div>
            <div class="border-t px-6 py-3 flex justify-between items-center">
                <div>
                    <span id="currentVideoInfo" class="text-sm text-gray-600">正在播放: ${sortedVideos[0].title}</span>
                </div>
                <div class="flex space-x-2">
                    <button id="prevVideoBtn" class="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                        <i class="fas fa-step-backward mr-1"></i> 上一个
                    </button>
                    <button id="nextVideoBtn" class="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                        下一个 <i class="fas fa-step-forward ml-1"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 获取视频播放器元素
    const videoPlayer = document.getElementById('collectionPlayer');
    const videoPlaylist = document.getElementById('videoPlaylist');
    const currentVideoInfo = document.getElementById('currentVideoInfo');
    const prevVideoBtn = document.getElementById('prevVideoBtn');
    const nextVideoBtn = document.getElementById('nextVideoBtn');
    
    let currentVideoIndex = 0;
    
    // 设置视频结束时自动播放下一个
    videoPlayer.addEventListener('ended', function() {
        playNextVideo();
    });
    
    // 播放列表点击事件
    videoPlaylist.addEventListener('click', function(e) {
        const videoItem = e.target.closest('.video-item');
        if (videoItem) {
            const index = parseInt(videoItem.dataset.index);
            playVideo(index);
        }
    });
    
    // 上一个视频按钮点击事件
    prevVideoBtn.addEventListener('click', function() {
        playPrevVideo();
    });
    
    // 下一个视频按钮点击事件
    nextVideoBtn.addEventListener('click', function() {
        playNextVideo();
    });
    
    // 播放指定索引的视频
    function playVideo(index) {
        if (index < 0 || index >= sortedVideos.length) return;
        
        currentVideoIndex = index;
        videoPlayer.src = sortedVideos[index].content;
        videoPlayer.play();
        currentVideoInfo.textContent = `正在播放: ${sortedVideos[index].title}`;
        
        // 更新播放列表高亮
        const videoItems = videoPlaylist.querySelectorAll('.video-item');
        videoItems.forEach((item, i) => {
            if (i === index) {
                item.classList.add('bg-indigo-50');
            } else {
                item.classList.remove('bg-indigo-50');
            }
        });
        
        // 滚动到当前播放项
        const activeItem = videoItems[index];
        if (activeItem) {
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
    // 播放上一个视频
    function playPrevVideo() {
        let prevIndex = currentVideoIndex - 1;
        if (prevIndex < 0) {
            prevIndex = sortedVideos.length - 1;
        }
        playVideo(prevIndex);
    }
    
    // 播放下一个视频
    function playNextVideo() {
        let nextIndex = currentVideoIndex + 1;
        if (nextIndex >= sortedVideos.length) {
            nextIndex = 0;
        }
        playVideo(nextIndex);
    }
    
    // 添加键盘快捷键
    const keyHandler = function(e) {
        if (e.key === 'ArrowLeft') {
            playPrevVideo();
        } else if (e.key === 'ArrowRight') {
            playNextVideo();
        } else if (e.key === 'Escape') {
            closeModal('videoCollectionModal');
        }
    };
    
    document.addEventListener('keydown', keyHandler);
    
    // 在模态框关闭时移除事件监听
    modal.addEventListener('remove', function() {
        document.removeEventListener('keydown', keyHandler);
    });
}

// 显示生活记录标签页
function showLifeRecordsTab() {
    initLifeRecordsSystem();
    renderLifeRecordsList();
}

// 格式化日期
function formatDate(dateString, showTime = false) {
    if (!dateString) return '未知';
    
    try {
        const date = new Date(dateString);
        if (showTime) {
            return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    } catch (e) {
        return dateString;
    }
}

// 添加格式化文件大小的辅助函数
function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + ' KB';
    } else {
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}