// 全局变量
let currentCollectionId = null;
let currentCoverFile = null;

// 模态框操作
function showCreateModal() {
    document.getElementById('createModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function hideCreateModal() {
    document.getElementById('createModal').style.display = 'none';
    document.body.style.overflow = '';
    // 清空表单
    document.getElementById('collectionName').value = '';
    document.getElementById('collectionDescription').value = '';
    document.getElementById('collectionCover').value = '';
    currentCoverFile = null;
    // 重置封面预览
    const preview = document.querySelector('#createModal .cover-preview');
    preview.innerHTML = '<i class="fas fa-image"></i><span>点击上传封面</span>';
}

function showEditModal() {
    document.getElementById('editModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function hideEditModal() {
    document.getElementById('editModal').style.display = 'none';
    document.body.style.overflow = '';
    currentCollectionId = null;
    currentCoverFile = null;
    // 重置封面预览
    const preview = document.querySelector('#editModal .cover-preview');
    preview.innerHTML = '<i class="fas fa-image"></i><span>点击更换封面</span>';
}

// 封面预览
function handleCoverUpload(input, previewElement) {
    const file = input.files[0];
    if (file) {
        currentCoverFile = file;
        const reader = new FileReader();
        reader.onload = function(e) {
            previewElement.innerHTML = `<img src="${e.target.result}" alt="封面预览">`;
        };
        reader.readAsDataURL(file);
    }
}

// 歌单操作
function createCollection() {
    const name = document.getElementById('collectionName').value.trim();
    const description = document.getElementById('collectionDescription').value.trim();
    
    if (!name) {
        showToast('请输入歌单名称');
        return;
    }
    
    const data = {
        name: name,
        description: description
    };
    
    fetch('/collection/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(text || '创建失败');
            });
        }
        return response.json();
    })
    .then(data => {
        hideCreateModal();
        showToast('创建成功');
        location.reload();
    })
    .catch(error => {
        console.error('Error:', error);
        showToast(error.message || '创建失败，请重试');
    });
}

function editCollection(button) {
    const collectionItem = button.closest('.collection-item');
    currentCollectionId = collectionItem.dataset.id;
    
    document.getElementById('editCollectionName').value = collectionItem.querySelector('.collection-name').textContent;
    document.getElementById('editCollectionDescription').value = collectionItem.dataset.description;
    
    // 设置当前封面预览
    const coverUrl = collectionItem.querySelector('.collection-cover').style.backgroundImage.slice(4, -1).replace(/"/g, "");
    const preview = document.querySelector('#editModal .cover-preview');
    if (coverUrl && coverUrl !== 'null') {
        preview.innerHTML = `<img src="${coverUrl}" alt="封面预览">`;
    }
    
    showEditModal();
}

function updateCollection() {
    const name = document.getElementById('editCollectionName').value.trim();
    const description = document.getElementById('editCollectionDescription').value.trim();
    
    if (!name) {
        showToast('请输入歌单名称');
        return;
    }
    
    const data = {
        id: currentCollectionId,
        name: name,
        description: description
    };
    
    fetch('/collection/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(text || '更新失败');
            });
        }
        return response.json();
    })
    .then(data => {
        hideEditModal();
        showToast('更新成功');
        location.reload();
    })
    .catch(error => {
        console.error('Error:', error);
        showToast(error.message || '更新失败，请重试');
    });
}

function deleteCollection(button) {
    const collectionId = button.closest('.collection-item').dataset.id;
    
    if (confirm('确定要删除这个歌单吗？删除后无法恢复。')) {
        fetch(`/collection/delete/${collectionId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text || '删除失败');
                });
            }
            return response.json();
        })
        .then(data => {
            showToast('删除成功');
            location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
            showToast(error.message || '删除失败，请重试');
        });
    }
}

function playCollection(button) {
    const collectionId = button.closest('.collection-item').dataset.id;
    // 跳转到歌单详情页
    window.location.href = `/collection/${collectionId}`;
}

// 搜索功能
function searchCollections() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
        fetch(`/collection/search?name=${encodeURIComponent(searchTerm)}`, {
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text || '搜索失败');
                });
            }
            return response.json();
        })
        .then(data => {
            updateCollectionList(data);
        })
        .catch(error => {
            console.error('Error:', error);
            showToast(error.message || '搜索失败，请重试');
        });
    }
}

function updateCollectionList(collections) {
    const collectionList = document.getElementById('collectionList');
    collectionList.innerHTML = '';
    
    collections.forEach(collection => {
        const item = document.createElement('div');
        item.className = 'collection-item';
        item.dataset.id = collection.id;
        item.dataset.description = collection.description || '';
        
        item.innerHTML = `
            <div class="collection-cover" style="background-image: url('${collection.coverUrl || ''}')">
                <div class="collection-actions">
                    <button class="btn btn-play" onclick="playCollection(this)">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
            </div>
            <div class="collection-info">
                <h3 class="collection-name">${collection.name}</h3>
                <p class="collection-description">${collection.description || '暂无描述'}</p>
                <div class="collection-meta">
                    <span class="song-count">${collection.songCount || 0} 首歌曲</span>
                    <div class="collection-buttons">
                        <button class="btn btn-enter" onclick="enterCollection(this)">
                            <i class="fas fa-sign-in-alt"></i> 进入歌单
                        </button>
                        <button class="btn btn-edit" onclick="editCollection(this)">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-delete" onclick="deleteCollection(this)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        collectionList.appendChild(item);
    });
}

// 添加进入歌单的函数
function enterCollection(button) {
    const collectionId = button.closest('.collection-item').dataset.id;
    window.location.href = `/collection/${collectionId}`;
}

// 提示框
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// 事件监听
document.addEventListener('DOMContentLoaded', function() {
    // 搜索框回车事件
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchCollections();
            }
        });
    }
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            hideCreateModal();
            hideEditModal();
        }
    });
    
    // 封面上传预览
    const createCoverInput = document.getElementById('collectionCover');
    const editCoverInput = document.getElementById('editCollectionCover');
    
    if (createCoverInput) {
        createCoverInput.addEventListener('change', function() {
            handleCoverUpload(this, document.querySelector('#createModal .cover-preview'));
        });
    }
    
    if (editCoverInput) {
        editCoverInput.addEventListener('change', function() {
            handleCoverUpload(this, document.querySelector('#editModal .cover-preview'));
        });
    }
}); 