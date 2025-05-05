// 场景重建功能实现
// 该文件提供场景重建的后端逻辑，不包含前端设计代码

// 全局变量
let sceneData = null;
let tempSceneItems = [];
let currentStep = 1;
let totalSteps = 4;
let uploadedPhotos = [];

// 初始化场景重建系统
function initSceneReconstructionSystem() {
    console.log('初始化场景重建系统');
    
    // 预设的场景数据
    sceneData = {
        id: 'scene_001',
        name: '标准宿舍场景',
        createdAt: new Date().toISOString(),
        room: {
            width: 4,
            length: 6,
            height: 2.8,
            wallColor: '#F5F5F5',
            floorType: 'wood'
        },
        items: [
            {
                id: 'item_001',
                type: 'bed',
                name: '单人床',
                dimensions: { width: 0.9, length: 2, height: 0.5 },
                position: { x: -1.5, y: 0.25, z: -2 },
                rotation: { x: 0, y: 0, z: 0 },
                color: '#8B4513'
            },
            {
                id: 'item_002',
                type: 'desk',
                name: '书桌',
                dimensions: { width: 1.2, length: 0.6, height: 0.75 },
                position: { x: 1.5, y: 0.375, z: -2.2 },
                rotation: { x: 0, y: 0, z: 0 },
                color: '#A0522D'
            },
            {
                id: 'item_003',
                type: 'chair',
                name: '椅子',
                dimensions: { width: 0.4, length: 0.4, height: 0.8 },
                position: { x: 1.5, y: 0.4, z: -1.6 },
                rotation: { x: 0, y: 180, z: 0 },
                color: '#D2691E'
            },
            {
                id: 'item_004',
                type: 'wardrobe',
                name: '衣柜',
                dimensions: { width: 0.8, length: 0.6, height: 1.8 },
                position: { x: -1.5, y: 0.9, z: 2 },
                rotation: { x: 0, y: 0, z: 0 },
                color: '#CD853F'
            },
            {
                id: 'item_005',
                type: 'bookshelf',
                name: '书架',
                dimensions: { width: 0.8, length: 0.3, height: 1.2 },
                position: { x: 1.5, y: 0.6, z: 2 },
                rotation: { x: 0, y: 0, z: 0 },
                color: '#DEB887'
            }
        ]
    };
}

// 显示场景重建标签页
function showSceneReconstructionTab() {
    console.log('显示场景重建标签页');
    
    // 获取场景重建容器
    const container = document.getElementById('scene-reconstruction-container');
    if (!container) {
        console.error('场景重建容器不存在');
        return;
    }
    
    // 添加提示信息
    container.innerHTML = `
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div class="flex">
                <div class="flex-shrink-0">
                    <i class="fas fa-exclamation-triangle text-yellow-400"></i>
                </div>
                <div class="ml-3">
                    <p class="text-sm text-yellow-700">
                        该功能暂未实现，生成场景仅为示例
                    </p>
                </div>
            </div>
        </div>
        
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-medium text-gray-900">场景重建</h3>
            <button onclick="showSceneCreationModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm font-medium">
                <i class="fas fa-plus mr-1"></i> 创建场景
            </button>
        </div>
        
        <div id="scenes-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- 场景列表将在这里渲染 -->
        </div>
    `;
    
    // 加载场景列表
    loadScenes();
}

// 显示场景创建模态框
function showSceneCreationModal() {
    console.log('显示场景创建模态框');
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    modal.id = 'sceneCreationModal';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">创建新场景</h3>
                <button onclick="closeModal('sceneCreationModal')" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="px-6 py-4">
                <div class="mb-4">
                    <h4 class="text-md font-medium text-gray-800 mb-2">房间信息</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="room-width">房间宽度 (米)</label>
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="room-width" type="number" min="1" step="0.1" value="4">
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="room-length">房间长度 (米)</label>
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="room-length" type="number" min="1" step="0.1" value="6">
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="room-height">房间高度 (米)</label>
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="room-height" type="number" min="1" step="0.1" value="2.8">
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="wall-color">墙面颜色</label>
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="wall-color" type="color" value="#F5F5F5">
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="floor-type">地板类型</label>
                            <select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="floor-type">
                                <option value="wood">木地板</option>
                                <option value="tile">瓷砖</option>
                                <option value="carpet">地毯</option>
                                <option value="concrete">水泥</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="mb-4">
                    <h4 class="text-md font-medium text-gray-800 mb-2">添加物品</h4>
                    <div class="flex mb-2">
                        <button onclick="showAddItemForm()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm font-medium">
                            <i class="fas fa-plus mr-1"></i> 添加物品
                        </button>
                    </div>
                    <div id="items-list" class="border rounded-lg p-4 bg-gray-50 max-h-60 overflow-y-auto">
                        <p id="no-items-message" class="text-gray-500 text-center py-2">暂无添加物品</p>
                    </div>
                </div>
                
                <div class="mb-4">
                    <h4 class="text-md font-medium text-gray-800 mb-2">场景预览</h4>
                    <div id="scene-preview-container" class="w-full h-64 bg-gray-100 rounded-lg">
                        <!-- 预览将在这里显示 -->
                    </div>
                </div>
                
                <div class="flex justify-end mt-6">
                    <button onclick="closeModal('sceneCreationModal')" class="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium mr-2">
                        取消
                    </button>
                    <button onclick="finishSceneCreation()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                        完成
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 初始化物品列表
    tempSceneItems = [];
    
    // 初始化预览
    setTimeout(() => {
        initScenePreview();
    }, 100);
}

// 关闭模态框
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

// 显示添加物品表单
function showAddItemForm() {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    modal.id = 'addItemModal';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">添加物品</h3>
                <button onclick="closeModal('addItemModal')" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="px-6 py-4">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="item-type">物品类型</label>
                    <select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-type">
                        <option value="bed">床</option>
                        <option value="desk">桌子</option>
                        <option value="chair">椅子</option>
                        <option value="wardrobe">衣柜</option>
                        <option value="bookshelf">书架</option>
                        <option value="nightstand">床头柜</option>
                        <option value="lamp">台灯</option>
                        <option value="computer">电脑</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="item-name">物品名称</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-name" type="text" placeholder="输入物品名称">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">尺寸 (米)</label>
                    <div class="grid grid-cols-3 gap-2">
                        <div>
                            <label class="block text-gray-700 text-xs mb-1" for="item-width">宽度</label>
                            <input class="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-width" type="number" min="0.1" step="0.1" value="1">
                        </div>
                        <div>
                            <label class="block text-gray-700 text-xs mb-1" for="item-length">长度</label>
                            <input class="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-length" type="number" min="0.1" step="0.1" value="1">
                        </div>
                        <div>
                            <label class="block text-gray-700 text-xs mb-1" for="item-height">高度</label>
                            <input class="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-height" type="number" min="0.1" step="0.1" value="1">
                        </div>
                    </div>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">位置 (米)</label>
                    <div class="grid grid-cols-3 gap-2">
                        <div>
                            <label class="block text-gray-700 text-xs mb-1" for="item-x">X</label>
                            <input class="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-x" type="number" step="0.1" value="0">
                        </div>
                        <div>
                            <label class="block text-gray-700 text-xs mb-1" for="item-y">Y</label>
                            <input class="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-y" type="number" step="0.1" value="0">
                        </div>
                        <div>
                            <label class="block text-gray-700 text-xs mb-1" for="item-z">Z</label>
                            <input class="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-z" type="number" step="0.1" value="0">
                        </div>
                    </div>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">旋转 (度)</label>
                    <div class="grid grid-cols-3 gap-2">
                        <div>
                            <label class="block text-gray-700 text-xs mb-1" for="item-rot-x">X</label>
                            <input class="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-rot-x" type="number" step="15" value="0">
                        </div>
                        <div>
                            <label class="block text-gray-700 text-xs mb-1" for="item-rot-y">Y</label>
                            <input class="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-rot-y" type="number" step="15" value="0">
                        </div>
                        <div>
                            <label class="block text-gray-700 text-xs mb-1" for="item-rot-z">Z</label>
                            <input class="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-rot-z" type="number" step="15" value="0">
                        </div>
                    </div>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="item-color">颜色</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-color" type="color" value="#A0522D">
                </div>
                <div class="flex justify-end">
                    <button onclick="closeModal('addItemModal')" class="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium mr-2">
                        取消
                    </button>
                    <button onclick="addItem()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                        添加
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 根据物品类型预设尺寸
    document.getElementById('item-type').addEventListener('change', function() {
        const type = this.value;
        let width, length, height;
        
        switch (type) {
            case 'bed':
                width = 0.9;
                length = 2;
                height = 0.5;
                break;
            case 'desk':
                width = 1.2;
                length = 0.6;
                height = 0.75;
                break;
            case 'chair':
                width = 0.4;
                length = 0.4;
                height = 0.8;
                break;
            case 'wardrobe':
                width = 0.8;
                length = 0.6;
                height = 1.8;
                break;
            case 'bookshelf':
                width = 0.8;
                length = 0.3;
                height = 1.2;
                break;
            case 'nightstand':
                width = 0.4;
                length = 0.4;
                height = 0.5;
                break;
            case 'lamp':
                width = 0.2;
                length = 0.2;
                height = 0.5;
                break;
            case 'computer':
                width = 0.5;
                length = 0.3;
                height = 0.4;
                break;
            default:
                width = 1;
                length = 1;
                height = 1;
        }
        
        document.getElementById('item-width').value = width;
        document.getElementById('item-length').value = length;
        document.getElementById('item-height').value = height;
    });
}

// 添加物品
function addItem() {
    // 获取物品信息
    const type = document.getElementById('item-type').value;
    let name = document.getElementById('item-name').value;
    
    // 如果名称为空，使用类型作为名称
    if (!name) {
        switch (type) {
            case 'bed': name = '床'; break;
            case 'desk': name = '桌子'; break;
            case 'chair': name = '椅子'; break;
            case 'wardrobe': name = '衣柜'; break;
            case 'bookshelf': name = '书架'; break;
            case 'nightstand': name = '床头柜'; break;
            case 'lamp': name = '台灯'; break;
            case 'computer': name = '电脑'; break;
            default: name = '物品';
        }
    }
    
    const width = parseFloat(document.getElementById('item-width').value);
    const length = parseFloat(document.getElementById('item-length').value);
    const height = parseFloat(document.getElementById('item-height').value);
    
    const x = parseFloat(document.getElementById('item-x').value);
    const y = parseFloat(document.getElementById('item-y').value);
    const z = parseFloat(document.getElementById('item-z').value);
    
    const rotX = parseFloat(document.getElementById('item-rot-x').value);
    const rotY = parseFloat(document.getElementById('item-rot-y').value);
    const rotZ = parseFloat(document.getElementById('item-rot-z').value);
    
    const color = document.getElementById('item-color').value;
    
    // 创建物品对象
    const item = {
        id: 'item_' + Date.now(),
        type: type,
        name: name,
        dimensions: {
            width: width,
            length: length,
            height: height
        },
        position: {
            x: x,
            y: y,
            z: z
        },
        rotation: {
            x: rotX,
            y: rotY,
            z: rotZ
        },
        color: color
    };
    
    // 添加到临时物品列表
    tempSceneItems.push(item);
    
    // 更新物品列表
    updateItemsList();
    
    // 更新预览
    updateScenePreview();
    
    // 关闭模态框
    closeModal('addItemModal');
}

// 更新物品列表
function updateItemsList() {
    const itemsList = document.getElementById('items-list');
    const noItemsMessage = document.getElementById('no-items-message');
    
    if (tempSceneItems.length === 0) {
        noItemsMessage.classList.remove('hidden');
        return;
    }
    
    noItemsMessage.classList.add('hidden');
    
    // 清空列表
    while (itemsList.firstChild && itemsList.firstChild !== noItemsMessage) {
        itemsList.removeChild(itemsList.firstChild);
    }
    
    // 添加物品
    tempSceneItems.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'flex justify-between items-center p-2 border-b last:border-b-0';
        
        itemElement.innerHTML = `
            <div>
                <span class="font-medium">${item.name}</span>
                <span class="text-xs text-gray-500 ml-2">${item.type}</span>
            </div>
            <div class="flex space-x-2">
                <button onclick="editItem(${index})" class="text-indigo-600 hover:text-indigo-800">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="removeItem(${index})" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        itemsList.insertBefore(itemElement, noItemsMessage);
    });
}

// 编辑物品
function editItem(index) {
    const item = tempSceneItems[index];
    
    // 创建模态框
    showAddItemForm();
    
    // 填充表单
    setTimeout(() => {
        document.getElementById('item-type').value = item.type;
        document.getElementById('item-name').value = item.name;
        
        document.getElementById('item-width').value = item.dimensions.width;
        document.getElementById('item-length').value = item.dimensions.length;
        document.getElementById('item-height').value = item.dimensions.height;
        
        document.getElementById('item-x').value = item.position.x;
        document.getElementById('item-y').value = item.position.y;
        document.getElementById('item-z').value = item.position.z;
        
        document.getElementById('item-rot-x').value = item.rotation.x;
        document.getElementById('item-rot-y').value = item.rotation.y;
        document.getElementById('item-rot-z').value = item.rotation.z;
        
        document.getElementById('item-color').value = item.color;
        
        // 修改添加按钮
        const addButton = document.querySelector('#addItemModal button:last-child');
        addButton.textContent = '保存';
        addButton.onclick = function() {
            // 移除旧物品
            tempSceneItems.splice(index, 1);
            
            // 添加新物品
            addItem();
        };
    }, 100);
}

// 移除物品
function removeItem(index) {
    if (confirm('确定要删除这个物品吗？')) {
        tempSceneItems.splice(index, 1);
        updateItemsList();
        updateScenePreview();
    }
}

// 初始化场景预览
function initScenePreview() {
    const previewContainer = document.getElementById('scene-preview-container');
    
    if (!previewContainer) {
        console.error('预览容器不存在');
        return;
    }
    
    // 创建预览画布
    const canvas = document.createElement('canvas');
    canvas.className = 'w-full h-full';
    previewContainer.innerHTML = '';
    previewContainer.appendChild(canvas);
    
    // 初始化Three.js
    const previewScene = new THREE.Scene();
    previewScene.background = new THREE.Color(0xf0f0f0);
    
    const previewCamera = new THREE.PerspectiveCamera(75, previewContainer.clientWidth / previewContainer.clientHeight, 0.1, 1000);
    previewCamera.position.set(0, 1.6, 5);
    
    const previewRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    previewRenderer.setSize(previewContainer.clientWidth, previewContainer.clientHeight);
    previewRenderer.shadowMap.enabled = true;
    
    const previewControls = new THREE.OrbitControls(previewCamera, previewRenderer.domElement);
    previewControls.enableDamping = true;
    previewControls.dampingFactor = 0.05;
    
    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    previewScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    previewScene.add(directionalLight);
    
    // 获取房间信息
    const roomWidth = parseFloat(document.getElementById('room-width').value);
    const roomLength = parseFloat(document.getElementById('room-length').value);
    const roomHeight = parseFloat(document.getElementById('room-height').value);
    const wallColor = document.getElementById('wall-color').value;
    const floorType = document.getElementById('floor-type').value;
    
    // 创建房间
    createRoom(previewScene, roomWidth, roomLength, roomHeight, wallColor, floorType);
    
    // 添加物品
    tempSceneItems.forEach(item => {
        addItemToScene(previewScene, item);
    });
    
    // 渲染循环
    function animate() {
        requestAnimationFrame(animate);
        previewControls.update();
        previewRenderer.render(previewScene, previewCamera);
    }
    
    animate();
    
    // 添加窗口大小调整事件
    window.addEventListener('resize', () => {
        const width = previewContainer.clientWidth;
        const height = previewContainer.clientHeight;
        
        previewCamera.aspect = width / height;
        previewCamera.updateProjectionMatrix();
        
        previewRenderer.setSize(width, height);
    });
}

// 更新场景预览
function updateScenePreview() {
    // 重新初始化预览
    initScenePreview();
}

// 创建房间
function createRoom(scene, width, length, height, wallColor, floorType) {
    // 创建地板
    const floorGeometry = new THREE.PlaneGeometry(width, length);
    
    // 根据地板类型选择纹理
    let floorTexture;
    switch (floorType) {
        case 'wood':
            floorTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/hardwood2_diffuse.jpg');
            break;
        case 'tile':
            floorTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/floors/FloorsCheckerboard_S_Diffuse.jpg');
            break;
        case 'carpet':
            floorTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/floors/FloorsCheckerboard_S_Diffuse.jpg');
            break;
        case 'concrete':
            floorTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg');
            break;
        default:
            floorTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/hardwood2_diffuse.jpg');
    }
    
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(width / 2, length / 2);
    
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        map: floorTexture,
        roughness: 0.8,
        metalness: 0.2
    });
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // 创建墙壁
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: wallColor,
        roughness: 0.9,
        metalness: 0.1
    });
    
    // 后墙
    const backWallGeometry = new THREE.PlaneGeometry(width, height);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, height / 2, -length / 2);
    backWall.receiveShadow = true;
    scene.add(backWall);
    
    // 前墙
    const frontWallGeometry = new THREE.PlaneGeometry(width, height);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.position.set(0, height / 2, length / 2);
    frontWall.rotation.y = Math.PI;
    frontWall.receiveShadow = true;
    scene.add(frontWall);
    
    // 左墙
    const leftWallGeometry = new THREE.PlaneGeometry(length, height);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.set(-width / 2, height / 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    scene.add(leftWall);
    
    // 右墙
    const rightWallGeometry = new THREE.PlaneGeometry(length, height);
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
    rightWall.position.set(width / 2, height / 2, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true;
    scene.add(rightWall);
    
    // 天花板
    const ceilingGeometry = new THREE.PlaneGeometry(width, length);
    const ceiling = new THREE.Mesh(ceilingGeometry, wallMaterial);
    ceiling.position.set(0, height, 0);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.receiveShadow = true;
    scene.add(ceiling);
}

// 添加物品到场景
function addItemToScene(scene, item) {
    let geometry;
    
    // 根据物品类型创建几何体
    switch (item.type) {
        case 'bed':
            geometry = new THREE.BoxGeometry(
                item.dimensions.width,
                item.dimensions.height,
                item.dimensions.length
            );
            break;
        case 'desk':
            geometry = new THREE.BoxGeometry(
                item.dimensions.width,
                item.dimensions.height,
                item.dimensions.length
            );
            break;
        case 'chair':
            // 椅子由座位和靠背组成
            const seatGeometry = new THREE.BoxGeometry(
                item.dimensions.width,
                item.dimensions.height / 4,
                item.dimensions.length
            );
            
            const backGeometry = new THREE.BoxGeometry(
                item.dimensions.width,
                item.dimensions.height * 3/4,
                item.dimensions.length / 8
            );
            
            const seatMaterial = new THREE.MeshStandardMaterial({ color: item.color });
            const seat = new THREE.Mesh(seatGeometry, seatMaterial);
            seat.position.set(
                item.position.x,
                item.position.y - item.dimensions.height / 4,
                item.position.z
            );
            seat.rotation.set(
                THREE.MathUtils.degToRad(item.rotation.x),
                THREE.MathUtils.degToRad(item.rotation.y),
                THREE.MathUtils.degToRad(item.rotation.z)
            );
            seat.castShadow = true;
            scene.add(seat);
            
            const backMaterial = new THREE.MeshStandardMaterial({ color: item.color });
            const back = new THREE.Mesh(backGeometry, backMaterial);
            back.position.set(
                item.position.x,
                item.position.y + item.dimensions.height / 4,
                item.position.z + item.dimensions.length / 2 - item.dimensions.length / 16
            );
            back.rotation.set(
                THREE.MathUtils.degToRad(item.rotation.x),
                THREE.MathUtils.degToRad(item.rotation.y),
                THREE.MathUtils.degToRad(item.rotation.z)
            );
            back.castShadow = true;
            scene.add(back);
            
            // 椅子腿
            const legGeometry = new THREE.CylinderGeometry(0.02, 0.02, item.dimensions.height / 2);
            const legMaterial = new THREE.MeshStandardMaterial({ color: '#8B4513' });
            
            const legPositions = [
                { x: item.dimensions.width / 2 - 0.05, z: item.dimensions.length / 2 - 0.05 },
                { x: -item.dimensions.width / 2 + 0.05, z: item.dimensions.length / 2 - 0.05 },
                { x: item.dimensions.width / 2 - 0.05, z: -item.dimensions.length / 2 + 0.05 },
                { x: -item.dimensions.width / 2 + 0.05, z: -item.dimensions.length / 2 + 0.05 }
            ];
            
            legPositions.forEach(pos => {
                const leg = new THREE.Mesh(legGeometry, legMaterial);
                leg.position.set(
                    item.position.x + pos.x,
                    item.position.y - item.dimensions.height / 2,
                    item.position.z + pos.z
                );
                leg.castShadow = true;
                scene.add(leg);
            });
            
            return;
        case 'wardrobe':
            geometry = new THREE.BoxGeometry(
                item.dimensions.width,
                item.dimensions.height,
                item.dimensions.length
            );
            break;
        case 'bookshelf':
            // 书架由多个层组成
            const shelfMaterial = new THREE.MeshStandardMaterial({ color: item.color });
            const numShelves = 4;
            const shelfHeight = item.dimensions.height / numShelves;
            const shelfThickness = 0.03;
            
            // 书架背板
            const backboardGeometry = new THREE.BoxGeometry(
                item.dimensions.width,
                item.dimensions.height,
                0.02
            );
            
            const backboard = new THREE.Mesh(backboardGeometry, shelfMaterial);
            backboard.position.set(
                item.position.x,
                item.position.y,
                item.position.z - item.dimensions.length / 2 + 0.01
            );
            backboard.rotation.set(
                THREE.MathUtils.degToRad(item.rotation.x),
                THREE.MathUtils.degToRad(item.rotation.y),
                THREE.MathUtils.degToRad(item.rotation.z)
            );
            backboard.castShadow = true;
            scene.add(backboard);
            
            // 书架侧板
            const sideboardGeometry = new THREE.BoxGeometry(
                0.02,
                item.dimensions.height,
                item.dimensions.length
            );
            
            const leftSideboard = new THREE.Mesh(sideboardGeometry, shelfMaterial);
            leftSideboard.position.set(
                item.position.x - item.dimensions.width / 2 + 0.01,
                item.position.y,
                item.position.z
            );
            leftSideboard.rotation.set(
                THREE.MathUtils.degToRad(item.rotation.x),
                THREE.MathUtils.degToRad(item.rotation.y),
                THREE.MathUtils.degToRad(item.rotation.z)
            );
            leftSideboard.castShadow = true;
            scene.add(leftSideboard);
            
            const rightSideboard = new THREE.Mesh(sideboardGeometry, shelfMaterial);
            rightSideboard.position.set(
                item.position.x + item.dimensions.width / 2 - 0.01,
                item.position.y,
                item.position.z
            );
            rightSideboard.rotation.set(
                THREE.MathUtils.degToRad(item.rotation.x),
                THREE.MathUtils.degToRad(item.rotation.y),
                THREE.MathUtils.degToRad(item.rotation.z)
            );
            rightSideboard.castShadow = true;
            scene.add(rightSideboard);
            
            // 书架层板
            for (let i = 0; i < numShelves; i++) {
                const shelfGeometry = new THREE.BoxGeometry(
                    item.dimensions.width,
                    shelfThickness,
                    item.dimensions.length
                );
                
                const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
                shelf.position.set(
                    item.position.x,
                    item.position.y - item.dimensions.height / 2 + i * shelfHeight,
                    item.position.z
                );
                shelf.rotation.set(
                    THREE.MathUtils.degToRad(item.rotation.x),
                    THREE.MathUtils.degToRad(item.rotation.y),
                    THREE.MathUtils.degToRad(item.rotation.z)
                );
                shelf.castShadow = true;
                scene.add(shelf);
                
                // 添加一些书
                if (i > 0) {
                    const numBooks = Math.floor(Math.random() * 5) + 3;
                    const bookWidth = item.dimensions.width / numBooks;
                    
                    for (let j = 0; j < numBooks; j++) {
                        const bookHeight = Math.random() * 0.2 + 0.1;
                        const bookDepth = Math.random() * 0.1 + 0.1;
                        const bookGeometry = new THREE.BoxGeometry(bookWidth * 0.8, bookHeight, bookDepth);
                        
                        const bookColor = new THREE.Color(
                            Math.random(),
                            Math.random(),
                            Math.random()
                        );
                        
                        const bookMaterial = new THREE.MeshStandardMaterial({ color: bookColor });
                        const book = new THREE.Mesh(bookGeometry, bookMaterial);
                        
                        book.position.set(
                            item.position.x - item.dimensions.width / 2 + bookWidth * (j + 0.5),
                            item.position.y - item.dimensions.height / 2 + i * shelfHeight + bookHeight / 2 + shelfThickness,
                            item.position.z - item.dimensions.length / 2 + bookDepth / 2 + 0.02
                        );
                        
                        book.rotation.set(
                            THREE.MathUtils.degToRad(item.rotation.x),
                            THREE.MathUtils.degToRad(item.rotation.y),
                            THREE.MathUtils.degToRad(item.rotation.z)
                        );
                        
                        book.castShadow = true;
                        scene.add(book);
                    }
                }
            }
            
            return;
        case 'nightstand':
            geometry = new THREE.BoxGeometry(
                item.dimensions.width,
                item.dimensions.height,
                item.dimensions.length
            );
            break;
        case 'lamp':
            // 灯座
            const baseMaterial = new THREE.MeshStandardMaterial({ color: '#696969' });
            const baseGeometry = new THREE.CylinderGeometry(
                item.dimensions.width / 2,
                item.dimensions.width / 1.5,
                item.dimensions.height / 5,
                16
            );
            
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.set(
                item.position.x,
                item.position.y - item.dimensions.height * 0.4,
                item.position.z
            );
            base.rotation.set(
                THREE.MathUtils.degToRad(item.rotation.x),
                THREE.MathUtils.degToRad(item.rotation.y),
                THREE.MathUtils.degToRad(item.rotation.z)
            );
            base.castShadow = true;
            scene.add(base);
            
            // 灯杆
            const poleMaterial = new THREE.MeshStandardMaterial({ color: '#A9A9A9' });
            const poleGeometry = new THREE.CylinderGeometry(
                0.02,
                0.02,
                item.dimensions.height * 0.6,
                8
            );
            
            const pole = new THREE.Mesh(poleGeometry, poleMaterial);
            pole.position.set(
                item.position.x,
                item.position.y - item.dimensions.height * 0.1,
                item.position.z
            );
            pole.rotation.set(
                THREE.MathUtils.degToRad(item.rotation.x),
                THREE.MathUtils.degToRad(item.rotation.y),
                THREE.MathUtils.degToRad(item.rotation.z)
            );
            pole.castShadow = true;
            scene.add(pole);
            
            // 灯罩
            const shadeMaterial = new THREE.MeshStandardMaterial({ 
                color: item.color,
                transparent: true,
                opacity: 0.8
            });
            
            const shadeGeometry = new THREE.ConeGeometry(
                item.dimensions.width / 1.2,
                item.dimensions.height / 3,
                16,
                1,
                true
            );
            
            const shade = new THREE.Mesh(shadeGeometry, shadeMaterial);
            shade.position.set(
                item.position.x,
                item.position.y + item.dimensions.height * 0.2,
                item.position.z
            );
            shade.rotation.set(
                THREE.MathUtils.degToRad(item.rotation.x + 180),
                THREE.MathUtils.degToRad(item.rotation.y),
                THREE.MathUtils.degToRad(item.rotation.z)
            );
            shade.castShadow = true;
            scene.add(shade);
            
            // 灯泡
            const lightMaterial = new THREE.MeshBasicMaterial({ color: '#FFFFA0' });
            const lightGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            
            const light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.set(
                item.position.x,
                item.position.y + item.dimensions.height * 0.1,
                item.position.z
            );
            scene.add(light);
            
            // 添加点光源
            const pointLight = new THREE.PointLight(0xffffcc, 0.5, 3);
            pointLight.position.set(
                item.position.x,
                item.position.y + item.dimensions.height * 0.1,
                item.position.z
            );
            scene.add(pointLight);
            
            return;
        case 'computer':
            // 显示器
            const monitorMaterial = new THREE.MeshStandardMaterial({ color: '#2F4F4F' });
            const monitorGeometry = new THREE.BoxGeometry(
                item.dimensions.width,
                item.dimensions.height * 0.7,
                item.dimensions.length / 10
            );
            
            const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
            monitor.position.set(
                item.position.x,
                item.position.y + item.dimensions.height * 0.2,
                item.position.z
            );
            monitor.rotation.set(
                THREE.MathUtils.degToRad(item.rotation.x),
                THREE.MathUtils.degToRad(item.rotation.y),
                THREE.MathUtils.degToRad(item.rotation.z)
            );
            monitor.castShadow = true;
            scene.add(monitor);
            
            // 屏幕
            const screenMaterial = new THREE.MeshBasicMaterial({ color: '#87CEEB' });
            const screenGeometry = new THREE.PlaneGeometry(
                item.dimensions.width * 0.9,
                item.dimensions.height * 0.6
            );
            
            const screen = new THREE.Mesh(screenGeometry, screenMaterial);
            screen.position.set(
                item.position.x,
                item.position.y + item.dimensions.height * 0.2,
                item.position.z + item.dimensions.length / 20 + 0.001
            );
            screen.rotation.set(
                THREE.MathUtils.degToRad(item.rotation.x),
                THREE.MathUtils.degToRad(item.rotation.y),
                THREE.MathUtils.degToRad(item.rotation.z)
            );
            scene.add(screen);
            
            // 底座
            const standMaterial = new THREE.MeshStandardMaterial({ color: '#2F4F4F' });
            const standGeometry = new THREE.BoxGeometry(
                item.dimensions.width / 3,
                item.dimensions.height * 0.1,
                item.dimensions.length / 2
            );
            
            const stand = new THREE.Mesh(standGeometry, standMaterial);
            stand.position.set(
                item.position.x,
                item.position.y - item.dimensions.height * 0.3,
                item.position.z
            );
            stand.rotation.set(
                THREE.MathUtils.degToRad(item.rotation.x),
                THREE.MathUtils.degToRad(item.rotation.y),
                THREE.MathUtils.degToRad(item.rotation.z)
            );
            stand.castShadow = true;
            scene.add(stand);
            
            // 键盘
            const keyboardMaterial = new THREE.MeshStandardMaterial({ color: '#696969' });
            const keyboardGeometry = new THREE.BoxGeometry(
                item.dimensions.width * 0.8,
                item.dimensions.height * 0.05,
                item.dimensions.length * 0.4
            );
            
            const keyboard = new THREE.Mesh(keyboardGeometry, keyboardMaterial);
            keyboard.position.set(
                item.position.x,
                item.position.y - item.dimensions.height * 0.35,
                item.position.z + item.dimensions.length * 0.3
            );
            keyboard.rotation.set(
                THREE.MathUtils.degToRad(item.rotation.x),
                THREE.MathUtils.degToRad(item.rotation.y),
                THREE.MathUtils.degToRad(item.rotation.z)
            );
            keyboard.castShadow = true;
            scene.add(keyboard);
            
            // 鼠标
            const mouseMaterial = new THREE.MeshStandardMaterial({ color: '#696969' });
            const mouseGeometry = new THREE.BoxGeometry(
                item.dimensions.width * 0.15,
                item.dimensions.height * 0.05,
                item.dimensions.length * 0.2
            );
            
            const mouse = new THREE.Mesh(mouseGeometry, mouseMaterial);
            mouse.position.set(
                item.position.x + item.dimensions.width * 0.4,
                item.position.y - item.dimensions.height * 0.35,
                item.position.z + item.dimensions.length * 0.3
            );
            mouse.rotation.set(
                THREE.MathUtils.degToRad(item.rotation.x),
                THREE.MathUtils.degToRad(item.rotation.y),
                THREE.MathUtils.degToRad(item.rotation.z)
            );
            mouse.castShadow = true;
            scene.add(mouse);
            
            return;
        default:
            geometry = new THREE.BoxGeometry(
                item.dimensions.width,
                item.dimensions.height,
                item.dimensions.length
            );
    }
    
    const material = new THREE.MeshStandardMaterial({ color: item.color });
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.set(item.position.x, item.position.y, item.position.z);
    mesh.rotation.set(
        THREE.MathUtils.degToRad(item.rotation.x),
        THREE.MathUtils.degToRad(item.rotation.y),
        THREE.MathUtils.degToRad(item.rotation.z)
    );
    
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    scene.add(mesh);
}

// 完成场景创建
function finishSceneCreation() {
    // 获取房间信息
    const roomWidth = parseFloat(document.getElementById('room-width').value);
    const roomLength = parseFloat(document.getElementById('room-length').value);
    const roomHeight = parseFloat(document.getElementById('room-height').value);
    const wallColor = document.getElementById('wall-color').value;
    const floorType = document.getElementById('floor-type').value;
    
    // 创建场景对象
    const newScene = {
        id: 'scene_' + Date.now(),
        name: '我的宿舍场景',
        createdAt: new Date().toISOString(),
        room: {
            width: roomWidth,
            length: roomLength,
            height: roomHeight,
            wallColor: wallColor,
            floorType: floorType
        },
        items: tempSceneItems
    };
    
    // 保存场景
    saveScene(newScene);
    
    // 关闭模态框
    closeModal('sceneCreationModal');
    
    // 刷新场景列表
    loadScenes();
}

// 保存场景
function saveScene(scene) {
    // 获取已有场景
    let scenes = JSON.parse(localStorage.getItem('dormmate_scenes') || '[]');
    
    // 添加新场景
    scenes.push(scene);
    
    // 保存到本地存储
    localStorage.setItem('dormmate_scenes', JSON.stringify(scenes));
}

// 加载场景列表
function loadScenes() {
    // 获取场景容器
    const container = document.getElementById('scenes-container');
    
    if (!container) {
        console.error('场景容器不存在');
        return;
    }
    
    // 获取已有场景
    let scenes = JSON.parse(localStorage.getItem('dormmate_scenes') || '[]');
    
    // 如果没有场景，添加默认场景
    if (scenes.length === 0) {
        // 初始化场景重建系统
        initSceneReconstructionSystem();
        
        // 添加默认场景
        scenes.push(sceneData);
        
        // 保存到本地存储
        localStorage.setItem('dormmate_scenes', JSON.stringify(scenes));
    }
    
    // 清空容器
    container.innerHTML = '';
    
    // 添加场景卡片
    scenes.forEach(scene => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md overflow-hidden';
        
        const formattedDate = new Date(scene.createdAt).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        card.innerHTML = `
            <div class="h-48 bg-gray-200 relative">
                <div id="scene-preview-${scene.id}" class="w-full h-full"></div>
                <div class="absolute top-2 right-2 flex space-x-1">
                    <button onclick="viewScene('${scene.id}')" class="bg-indigo-600 hover:bg-indigo-700 text-white p-1 rounded-full">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="deleteScene('${scene.id}')" class="bg-red-600 hover:bg-red-700 text-white p-1 rounded-full">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="p-4">
                <h4 class="text-lg font-medium text-gray-900">${scene.name}</h4>
                <p class="text-sm text-gray-500">${formattedDate}</p>
                <div class="mt-2 text-xs text-gray-600">
                    <span class="inline-block mr-2">
                        <i class="fas fa-ruler-combined mr-1"></i> ${scene.room.width}×${scene.room.length}×${scene.room.height}m
                    </span>
                    <span class="inline-block">
                        <i class="fas fa-couch mr-1"></i> ${scene.items.length}个物品
                    </span>
                </div>
            </div>
        `;
        
        container.appendChild(card);
        
        // 初始化预览
        setTimeout(() => {
            initSceneCardPreview(scene);
        }, 100);
    });
}

// 初始化场景卡片预览
function initSceneCardPreview(scene) {
    const previewContainer = document.getElementById(`scene-preview-${scene.id}`);
    
    if (!previewContainer) {
        console.error(`预览容器 scene-preview-${scene.id} 不存在`);
        return;
    }
    
    // 创建预览画布
    const canvas = document.createElement('canvas');
    canvas.className = 'w-full h-full';
    previewContainer.appendChild(canvas);
    
    // 初始化Three.js
    const previewScene = new THREE.Scene();
    previewScene.background = new THREE.Color(0xf0f0f0);
    
    const previewCamera = new THREE.PerspectiveCamera(75, previewContainer.clientWidth / previewContainer.clientHeight, 0.1, 1000);
    previewCamera.position.set(0, 1.6, 5);
    
    const previewRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    previewRenderer.setSize(previewContainer.clientWidth, previewContainer.clientHeight);
    previewRenderer.shadowMap.enabled = true;
    
    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    previewScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    previewScene.add(directionalLight);
    
    // 创建房间
    createRoom(
        previewScene,
        scene.room.width,
        scene.room.length,
        scene.room.height,
        scene.room.wallColor,
        scene.room.floorType
    );
    
    // 添加物品
    scene.items.forEach(item => {
        addItemToScene(previewScene, item);
    });
    
    // 渲染循环
    function animate() {
        requestAnimationFrame(animate);
        
        // 旋转相机
        const time = Date.now() * 0.0005;
        previewCamera.position.x = Math.sin(time) * 5;
        previewCamera.position.z = Math.cos(time) * 5;
        previewCamera.lookAt(0, 1, 0);
        
        previewRenderer.render(previewScene, previewCamera);
    }
    
    animate();
}

// 查看场景
function viewScene(sceneId) {
    // 获取已有场景
    let scenes = JSON.parse(localStorage.getItem('dormmate_scenes') || '[]');
    
    // 查找场景
    const scene = scenes.find(s => s.id === sceneId);
    
    if (!scene) {
        console.error(`场景 ${sceneId} 不存在`);
        return;
    }
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    modal.id = 'viewSceneModal';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">${scene.name}</h3>
                <button onclick="closeModal('viewSceneModal')" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="px-6 py-4 h-5/6">
                <div id="scene-view-container" class="w-full h-full bg-gray-100 rounded-lg">
                    <!-- 场景预览将在这里渲染 -->
                </div>
            </div>
            <div class="flex justify-end border-t px-6 py-4">
                <button onclick="exportScene('${scene.id}')" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium mr-2">
                    <i class="fas fa-file-export mr-1"></i> 导出场景
                </button>
                <button onclick="closeModal('viewSceneModal')" class="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    关闭
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 初始化场景查看器
    setTimeout(() => {
        initSceneViewer(scene);
    }, 100);
}

// 初始化场景查看器
function initSceneViewer(scene) {
    const viewerContainer = document.getElementById('scene-view-container');
    
    if (!viewerContainer) {
        console.error('查看器容器不存在');
        return;
    }
    
    // 创建查看器画布
    const canvas = document.createElement('canvas');
    canvas.className = 'w-full h-full';
    viewerContainer.innerHTML = '';
    viewerContainer.appendChild(canvas);
    
    // 初始化Three.js
    const viewerScene = new THREE.Scene();
    viewerScene.background = new THREE.Color(0xf0f0f0);
    
    const viewerCamera = new THREE.PerspectiveCamera(75, viewerContainer.clientWidth / viewerContainer.clientHeight, 0.1, 1000);
    viewerCamera.position.set(0, 1.6, 5);
    
    const viewerRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    viewerRenderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
    viewerRenderer.shadowMap.enabled = true;
    
    const viewerControls = new THREE.OrbitControls(viewerCamera, viewerRenderer.domElement);
    viewerControls.enableDamping = true;
    viewerControls.dampingFactor = 0.05;
    
    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    viewerScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    viewerScene.add(directionalLight);
    
    // 创建房间
    createRoom(
        viewerScene,
        scene.room.width,
        scene.room.length,
        scene.room.height,
        scene.room.wallColor,
        scene.room.floorType
    );
    
    // 添加物品
    scene.items.forEach(item => {
        addItemToScene(viewerScene, item);
    });
    
    // 渲染循环
    function animate() {
        requestAnimationFrame(animate);
        viewerControls.update();
        viewerRenderer.render(viewerScene, viewerCamera);
    }
    
    animate();
    
    // 添加窗口大小调整事件
    window.addEventListener('resize', () => {
        const width = viewerContainer.clientWidth;
        const height = viewerContainer.clientHeight;
        
        viewerCamera.aspect = width / height;
        viewerCamera.updateProjectionMatrix();
        
        viewerRenderer.setSize(width, height);
    });
}

// 删除场景
function deleteScene(sceneId) {
    if (!confirm('确定要删除这个场景吗？此操作无法撤销。')) {
        return;
    }
    
    // 获取已有场景
    let scenes = JSON.parse(localStorage.getItem('dormmate_scenes') || '[]');
    
    // 过滤掉要删除的场景
    scenes = scenes.filter(s => s.id !== sceneId);
    
    // 保存到本地存储
    localStorage.setItem('dormmate_scenes', JSON.stringify(scenes));
    
    // 刷新场景列表
    loadScenes();
}

// 导出场景
function exportScene(sceneId) {
    // 获取已有场景
    let scenes = JSON.parse(localStorage.getItem('dormmate_scenes') || '[]');
    
    // 查找场景
    const scene = scenes.find(s => s.id === sceneId);
    
    if (!scene) {
        console.error(`场景 ${sceneId} 不存在`);
        return;
    }
    
    // 创建导出数据
    const exportData = JSON.stringify(scene, null, 2);
    
    // 创建下载链接
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scene.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// 初始化场景重建系统
function initSceneReconstructionSystem() {
    // 默认场景数据
    sceneData = {
        id: 'scene_default',
        name: '标准宿舍场景',
        createdAt: new Date().toISOString(),
        room: {
            width: 4,
            length: 6,
            height: 3,
            wallColor: '#F5F5F5',
            floorType: 'wood'
        },
        items: [
            {
                id: 'item_bed_1',
                type: 'bed',
                name: '床',
                dimensions: {
                    width: 0.9,
                    length: 2,
                    height: 0.5
                },
                position: {
                    x: -1.5,
                    y: 0.25,
                    z: -2
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                color: '#A0522D'
            },
            {
                id: 'item_desk_1',
                type: 'desk',
                name: '书桌',
                dimensions: {
                    width: 1.2,
                    length: 0.6,
                    height: 0.75
                },
                position: {
                    x: 1.5,
                    y: 0.375,
                    z: -2
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                color: '#8B4513'
            },
            {
                id: 'item_chair_1',
                type: 'chair',
                name: '椅子',
                dimensions: {
                    width: 0.4,
                    length: 0.4,
                    height: 0.8
                },
                position: {
                    x: 1.5,
                    y: 0.4,
                    z: -1.2
                },
                rotation: {
                    x: 0,
                    y: 180,
                    z: 0
                },
                color: '#4B3621'
            },
            {
                id: 'item_wardrobe_1',
                type: 'wardrobe',
                name: '衣柜',
                dimensions: {
                    width: 0.8,
                    length: 0.6,
                    height: 1.8
                },
                position: {
                    x: -1.5,
                    y: 0.9,
                    z: 2
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                color: '#DEB887'
            },
            {
                id: 'item_bookshelf_1',
                type: 'bookshelf',
                name: '书架',
                dimensions: {
                    width: 0.8,
                    length: 0.3,
                    height: 1.2
                },
                position: {
                    x: 1.5,
                    y: 0.6,
                    z: 2
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                color: '#CD853F'
            },
            {
                id: 'item_lamp_1',
                type: 'lamp',
                name: '台灯',
                dimensions: {
                    width: 0.2,
                    length: 0.2,
                    height: 0.5
                },
                position: {
                    x: 1.2,
                    y: 0.75,
                    z: -2.2
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                color: '#FFD700'
            }
        ]
    };
}

// 关闭模态框
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 加载场景列表
    loadScenes();
    
    // 添加创建场景按钮事件
    document.getElementById('create-scene-btn').addEventListener('click', function() {
        showSceneCreationForm();
    });
});

// 显示场景创建表单
function showSceneCreationForm() {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    modal.id = 'sceneCreationModal';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">创建新场景</h3>
                <button onclick="closeModal('sceneCreationModal')" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="px-6 py-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="text-md font-medium text-gray-900 mb-4">房间设置</h4>
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="room-width">宽度 (米)</label>
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="room-width" type="number" step="0.1" min="1" max="10" value="4">
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="room-length">长度 (米)</label>
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="room-length" type="number" step="0.1" min="1" max="10" value="6">
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="room-height">高度 (米)</label>
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="room-height" type="number" step="0.1" min="1" max="5" value="3">
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="wall-color">墙壁颜色</label>
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="wall-color" type="color" value="#F5F5F5">
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="floor-type">地板类型</label>
                            <select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="floor-type">
                                <option value="wood">木地板</option>
                                <option value="tile">瓷砖</option>
                                <option value="carpet">地毯</option>
                                <option value="concrete">水泥</option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <button onclick="updateScenePreview()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                                更新预览
                            </button>
                        </div>
                    </div>
                    <div>
                        <h4 class="text-md font-medium text-gray-900 mb-4">物品管理</h4>
                        <div class="mb-4">
                            <button onclick="showAddItemForm()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                                <i class="fas fa-plus mr-1"></i> 添加物品
                            </button>
                        </div>
                        <div class="bg-gray-100 rounded-lg p-4 h-64 overflow-y-auto">
                            <div id="items-list" class="space-y-2">
                                <div id="no-items-message" class="text-gray-500 text-center py-4">
                                    暂无物品，请点击"添加物品"按钮添加
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-6">
                    <h4 class="text-md font-medium text-gray-900 mb-4">场景预览</h4>
                    <div id="scene-preview-container" class="w-full h-64 bg-gray-100 rounded-lg">
                        <!-- 场景预览将在这里渲染 -->
                    </div>
                </div>
            </div>
            <div class="flex justify-end border-t px-6 py-4">
                <button onclick="closeModal('sceneCreationModal')" class="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium mr-2">
                    取消
                </button>
                <button onclick="finishSceneCreation()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    完成
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 初始化临时物品列表
    tempSceneItems = [];
    
    // 初始化场景预览
    setTimeout(() => {
        initScenePreview();
    }, 100);
}

// 显示添加物品表单
function showAddItemForm() {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
    modal.id = 'addItemModal';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="flex justify-between items-center border-b px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-900">添加物品</h3>
                <button onclick="closeModal('addItemModal')" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="px-6 py-4">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="item-type">物品类型</label>
                    <select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-type">
                        <option value="bed">床</option>
                        <option value="desk">桌子</option>
                        <option value="chair">椅子</option>
                        <option value="wardrobe">衣柜</option>
                        <option value="bookshelf">书架</option>
                        <option value="nightstand">床头柜</option>
                        <option value="lamp">台灯</option>
                        <option value="computer">电脑</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="item-name">物品名称 (可选)</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-name" type="text" placeholder="例如：我的床">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">尺寸 (米)</label>
                    <div class="grid grid-cols-3 gap-2">
                        <div>
                            <label class="block text-gray-700 text-xs mb-1" for="item-width">宽度</label>
                            <input class="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-width" type="number" step="0.1" value="0.9">
                        </div>
                        <div>
                            <label class="block text-gray-700 text-xs mb-1" for="item-length">长度</label>
                            <input class="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-length" type="number" step="0.1" value="2">
                        </div>
                        <div>
                            <label class="block text-gray-700 text-xs mb-1" for="item-height">高度</label>
                            <input class="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-height" type="number" step="0.1" value="0.5">
                        </div>
                    </div>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">位置 (米)</label>
                    <div class="grid grid-cols-3 gap-2">
                        <div>
                            <label class="block text-gray-700 text-xs mb-1" for="item-x">X</label>
                            <input class="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-x" type="number" step="0.1" value="0">
                        </div>
                        <div>
                            <label class="block text-gray-700 text-xs mb-1" for="item-y">Y</label>
                            <input class="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-y" type="number" step="0.1" value="0">
                        </div>
                        <div>
                            <label class="block text-gray-700 text-xs mb-1" for="item-z">Z</label>
                            <input class="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-z" type="number" step="0.1" value="0">
                        </div>
                    </div>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">旋转 (度)</label>
                    <div class="grid grid-cols-3 gap-2">
                        <div>
                            <label class="block text-gray-700 text-xs mb-1" for="item-rot-x">X</label>
                            <input class="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-rot-x" type="number" step="15" value="0">
                        </div>
                        <div>
                            <label class="block text-gray-700 text-xs mb-1" for="item-rot-y">Y</label>
                            <input class="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-rot-y" type="number" step="15" value="0">
                        </div>
                        <div>
                            <label class="block text-gray-700 text-xs mb-1" for="item-rot-z">Z</label>
                            <input class="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-rot-z" type="number" step="15" value="0">
                        </div>
                    </div>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="item-color">颜色</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="item-color" type="color" value="#A0522D">
                </div>
                <div class="flex justify-end">
                    <button onclick="closeModal('addItemModal')" class="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium mr-2">
                        取消
                    </button>
                    <button onclick="addItem()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                        添加
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 根据物品类型预设尺寸
    document.getElementById('item-type').addEventListener('change', function() {
        const type = this.value;
        let width, length, height;
        
        switch (type) {
            case 'bed':
                width = 0.9;
                length = 2;
                height = 0.5;
                break;
            case 'desk':
                width = 1.2;
                length = 0.6;
                height = 0.75;
                break;
            case 'chair':
                width = 0.4;
                length = 0.4;
                height = 0.8;
                break;
            case 'wardrobe':
                width = 0.8;
                length = 0.6;
                height = 1.8;
                break;
            case 'bookshelf':
                width = 0.8;
                length = 0.3;
                height = 1.2;
                break;
            case 'nightstand':
                width = 0.4;
                length = 0.4;
                height = 0.5;
                break;
            case 'lamp':
                width = 0.2;
                length = 0.2;
                height = 0.5;
                break;
            case 'computer':
                width = 0.5;
                length = 0.3;
                height = 0.4;
                break;
            default:
                width = 1;
                length = 1;
                height = 1;
        }
        
        document.getElementById('item-width').value = width;
        document.getElementById('item-length').value = length;
        document.getElementById('item-height').value = height;
    });
}