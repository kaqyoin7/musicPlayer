// 模态框操作
function showAddSongModal() {
    document.getElementById('addSongModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function hideAddSongModal() {
    document.getElementById('addSongModal').style.display = 'none';
    document.body.style.overflow = '';
    document.getElementById('songSearchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
}

// 播放功能
function playSong(songId) {
    // 跳转到播放页面并传递歌曲ID
    window.location.href = `/player?songId=${songId}`;
}

function playAll() {
    // 跳转到播放页面并传递歌单ID
    window.location.href = `/player?collectionId=${collectionId}`;
}

// 歌曲管理
function removeSong(songId) {
    if (confirm('确定要从歌单中移除这首歌吗？')) {
        fetch(`/collection/${collectionId}/remove-song/${songId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text || '移除失败');
                });
            }
            return response.json();
        })
        .then(data => {
            showToast('移除成功');
            location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
            showToast(error.message || '移除失败，请重试');
        });
    }
}

// 搜索功能
function searchSongs() {
    const searchInput = document.getElementById('songSearchInput');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
        fetch(`/song/search?name=${encodeURIComponent(searchTerm)}`, {
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
        .then(songs => {
            updateSearchResults(songs);
        })
        .catch(error => {
            console.error('Error:', error);
            showToast(error.message || '搜索失败，请重试');
        });
    }
}

function updateSearchResults(songs) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = songs.map(song => `
        <div class="song-item">
            <div class="song-info">
                <div class="song-name">${song.name}</div>
                <div class="song-artist">${song.artist}</div>
            </div>
            <div class="song-actions">
                <button class="btn btn-add" onclick="addSong('${song.id}')">
                    <i class="fas fa-plus"></i>
                    添加
                </button>
            </div>
        </div>
    `).join('');
}

function addSong(songId) {
    fetch(`/collection/${collectionId}/add-song/${songId}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(text || '添加失败');
            });
        }
        return response.json();
    })
    .then(data => {
        showToast('添加成功');
        hideAddSongModal();
        location.reload();
    })
    .catch(error => {
        console.error('Error:', error);
        showToast(error.message || '添加失败，请重试');
    });
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
    const searchInput = document.getElementById('songSearchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchSongs();
            }
        });
    }
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            hideAddSongModal();
        }
    });
}); 