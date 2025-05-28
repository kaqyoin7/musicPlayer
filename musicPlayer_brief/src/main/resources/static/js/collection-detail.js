// 播放歌曲
async function playSong(songId) {
    try {
        // 清理ID：移除所有非数字字符
        const cleanId = String(songId).replace(/[^0-9]/g, '');
        console.log('播放歌曲 - 原始ID:', songId, '清理后ID:', cleanId);
        
        if (!cleanId) {
            throw new Error('Invalid song ID');
        }

        // 获取歌曲信息
        console.log('正在请求歌曲信息，URL:', `/test/song/getById?id=${cleanId}`);
        const response = await fetch(`/test/song/getById?id=${cleanId}`);
        console.log('服务器响应状态:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('服务器错误响应:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const responseText = await response.text();
        console.log('服务器原始响应:', responseText);
        
        if (!responseText) {
            throw new Error('Empty response from server');
        }
        
        let song;
        try {
            song = JSON.parse(responseText);
        } catch (e) {
            console.error('JSON解析错误:', e);
            throw new Error('Invalid JSON response from server');
        }
        
        if (!song || !song.id) {
            console.error('无效的歌曲数据:', song);
            throw new Error('Invalid song data received');
        }
        
        console.log('获取到的歌曲信息:', song);
        
        // 设置一个标记，表示这是用户主动选择的歌曲
        song.userSelected = true;
        
        // 将歌曲信息存储到localStorage
        localStorage.setItem('currentSong', JSON.stringify(song));
        
        // 跳转到首页
        window.location.href = '/index';
        
    } catch (error) {
        console.error('Error loading song:', error);
        alert('加载歌曲失败，请重试');
    }
}

// 播放全部歌曲
function playAll() {
    // 获取歌单中的第一首歌曲
    const firstSongItem = document.querySelector('.song-item');
    if (firstSongItem) {
        const songId = firstSongItem.querySelector('.btn-play').getAttribute('data-song-id');
        if (songId) {
            playSong(songId);
        }
    }
}

// 从歌单中移除歌曲
async function removeSong(songId) {
    if (!confirm('确定要从歌单中移除这首歌吗？')) {
        return;
    }

    try {
        const response = await fetch(`/collection/${collectionId}/remove-song/${songId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to remove song from collection');
        }

        const success = await response.json();
        if (success) {
            // 刷新页面以更新歌单内容
            window.location.reload();
        } else {
            throw new Error('Server returned false');
        }
    } catch (error) {
        console.error('Error removing song:', error);
        alert('移除歌曲失败，请重试');
    }
}

// 显示添加歌曲模态框
function showAddSongModal() {
    const modal = document.getElementById('addSongModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// 隐藏添加歌曲模态框
function hideAddSongModal() {
    const modal = document.getElementById('addSongModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 搜索歌曲
async function searchSongs() {
    const searchInput = document.getElementById('songSearchInput');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchInput || !searchResults) return;
    
    const query = searchInput.value.trim();
    if (!query) return;

    try {
        const response = await fetch(`/test/song/search?name=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('Search failed');
        }

        const songs = await response.json();
        
        // 清空搜索结果
        searchResults.innerHTML = '';
        
        if (songs.length === 0) {
            searchResults.innerHTML = '<div class="no-results">没有找到相关歌曲</div>';
            return;
        }

        // 显示搜索结果
        songs.forEach(song => {
            const songElement = document.createElement('div');
            songElement.className = 'search-result-item';
            songElement.innerHTML = `
                <div class="song-info">
                    <div class="song-name">${song.name}</div>
                    <div class="song-artist">${song.singerIds ? song.singerIds.join(', ') : '未知歌手'}</div>
                </div>
                <button class="btn btn-add" onclick="addSongToCollection('${song.id}')">
                    <i class="fas fa-plus"></i>
                </button>
            `;
            searchResults.appendChild(songElement);
        });
    } catch (error) {
        console.error('Error searching songs:', error);
        searchResults.innerHTML = '<div class="error">搜索失败，请重试</div>';
    }
}

// 添加歌曲到歌单
async function addSongToCollection(songId) {
    try {
        // 首先尝试从 localStorage 获取当前播放的歌曲信息
        const currentSongJson = localStorage.getItem('currentSong');
        let songIdToAdd;

        if (currentSongJson) {
            // 如果存在 currentSong，使用其中的 ID
            const currentSong = JSON.parse(currentSongJson);
            songIdToAdd = currentSong.id;
            console.log('Using song ID from currentSong:', songIdToAdd);
        } else {
            // 如果不存在 currentSong，尝试使用传入的 songId
            songIdToAdd = songId;
            console.log('Using provided song ID:', songIdToAdd);
        }

        if (!songIdToAdd) {
            throw new Error('No valid song ID available');
        }

        const response = await fetch(`/collection/${collectionId}/add-song/${songIdToAdd}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to add song to collection');
        }

        const success = await response.json();
        if (success) {
            // 隐藏模态框并刷新页面
            hideAddSongModal();
            window.location.reload();
        } else {
            throw new Error('Server returned false');
        }
    } catch (error) {
        console.error('Error adding song to collection:', error);
        alert('添加歌曲失败，请重试');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始初始化');
    
    // 处理所有歌曲封面图片
    document.querySelectorAll('.song-cover').forEach(cover => {
        const style = cover.getAttribute('style');
        if (style && style.includes('background-image')) {
            const urlMatch = style.match(/url\('([^']+)'\)/);
            if (urlMatch && urlMatch[1]) {
                const originalUrl = urlMatch[1];
                if (!originalUrl.includes('/api/image/proxy')) {
                    const proxyUrl = `/api/image/proxy?url=${encodeURIComponent(originalUrl)}`;
                    cover.style.backgroundImage = `url('${proxyUrl}')`;
                }
            }
        }
    });

    // 为歌曲列表项添加动画效果
    const songItems = document.querySelectorAll('.song-item');
    songItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
        item.classList.add('fade-in');
    });

    // 点击模态框外部关闭模态框
    window.onclick = function(event) {
        const modal = document.getElementById('addSongModal');
        if (event.target === modal) {
            hideAddSongModal();
        }
    };

    // 搜索框回车事件
    const searchInput = document.getElementById('songSearchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchSongs();
            }
        });
    }
}); 