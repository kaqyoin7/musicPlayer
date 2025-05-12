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

// 预加载音频和图片
async function preloadResources(song) {
    if (!song) return;
    
    return new Promise((resolve, reject) => {
        // 预加载音频
        const audio = new Audio();
        audio.preload = 'auto';
        
        // 预加载封面图片
        const img = new Image();
        
        // 音频加载完成
        audio.oncanplaythrough = () => {
            console.log('音频预加载完成:', song.name);
            resolve();
        };
        
        // 音频加载失败
        audio.onerror = (error) => {
            console.error('音频预加载失败:', error);
            reject(error);
        };
        
        // 开始加载音频
        audio.src = song.url;
        
        // 使用代理URL加载图片
        const proxyUrl = `/api/image/proxy?url=${encodeURIComponent(song.cover)}`;
        img.src = proxyUrl;
        
        // 图片加载完成或失败
        img.onload = () => {
            console.log('图片预加载完成:', song.name);
            // 更新页面上所有使用该图片的元素
            document.querySelectorAll(`img[data-cover="${song.cover}"]`).forEach(imgElement => {
                imgElement.src = proxyUrl;
            });
        };
        
        img.onerror = (error) => {
            console.error('图片预加载失败:', error);
            // 图片加载失败时使用默认图片
            const defaultCover = '/images/default-cover.jpg';
            document.querySelectorAll(`img[data-cover="${song.cover}"]`).forEach(imgElement => {
                imgElement.src = defaultCover;
            });
        };
    });
}

// 查看歌手详情
function viewSinger(singerId) {
    window.location.href = `/singer/detail/${singerId}`;
}

// 获取歌手信息
async function getSingerInfo(singerId) {
    try {
        // 清理ID：移除所有非数字字符
        const cleanId = String(singerId).replace(/[^0-9]/g, '');
        console.log('获取歌手信息 - 原始ID:', singerId, '清理后ID:', cleanId);
        
        if (!cleanId) {
            console.error('Invalid singer ID:', singerId);
            return null;
        }
        const response = await fetch(`/test/singer/get?id=${cleanId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const singer = await response.json();
        console.log('获取到的歌手信息:', singer);
        return singer;
    } catch (error) {
        console.error('Error fetching singer info:', error);
        return null;
    }
}

// 获取歌手名称
async function getSingerNames(singerIds) {
    if (!singerIds || singerIds.length === 0) return '';
    
    try {
        const singerPromises = singerIds.map(id => getSingerInfo(id));
        const singers = await Promise.all(singerPromises);
        return singers
            .filter(singer => singer !== null)
            .map(singer => singer.name)
            .join(', ');
    } catch (error) {
        console.error('Error getting singer names:', error);
        return '';
    }
}

// // 更新播放器信息
// async function updatePlayerInfo(song) {
//     if (!song) return;
//
//     // 获取并显示歌手名称
//     const singerNames = await getSingerNames(song.singerIds);
//
//     // 将完整的播放信息存储到localStorage
//     const playerInfo = {
//         name: song.name,
//         cover: song.cover,
//         url: song.url,
//         singerNames: singerNames || 'Unknown'
//     };
//
//     localStorage.setItem('playerInfo', JSON.stringify(playerInfo));
// }

// 更新歌手名称显示
async function updateSingerNames() {
    // console.log('开始更新歌手名称显示');
    const singerNameElements = document.querySelectorAll('.singer-name');
    // console.log('找到的歌手名称元素数量:', singerNameElements.length);
    
    for (const element of singerNameElements) {
        const singerIdsStr = element.dataset.singerIds || '';
        // console.log('元素中的歌手ID字符串:', singerIdsStr);
        
        const singerIds = singerIdsStr ? singerIdsStr.split(',').map(id => id.trim()) : [];
        // console.log('解析后的歌手ID数组:', singerIds);
        
        const singerNames = await getSingerNames(singerIds);
        console.log('设置歌手名称:', singerNames);
        element.textContent = singerNames || '未知歌手';
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始初始化');
    
    // 处理所有歌曲封面图片
    document.querySelectorAll('.song-cover').forEach(img => {
        const originalSrc = img.src;
        if (originalSrc) {
            img.dataset.cover = originalSrc;
            const proxyUrl = `/api/image/proxy?url=${encodeURIComponent(originalSrc)}`;
            img.src = proxyUrl;
            
            // 添加图片加载失败处理
            img.onerror = () => {
                img.src = '/images/default-cover.jpg';
            };
        }
    });
    
    // 更新歌手名称
    updateSingerNames();
    
    // 为歌曲和歌手列表项添加动画效果
    const songItems = document.querySelectorAll('.song-item');
    const singerItems = document.querySelectorAll('.singer-item');

    songItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
        item.classList.add('fade-in');
    });

    singerItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
        item.classList.add('fade-in');
    });

    // 使用事件委托处理播放按钮点击
    document.querySelector('.song-list')?.addEventListener('click', function(e) {
        const playBtn = e.target.closest('.play-btn');
        if (playBtn) {
            const songId = playBtn.dataset.songId;
            if (songId) {
                playSong(songId);
            }
        }
    });

    // 使用事件委托处理查看歌手按钮点击
    document.querySelector('.singer-list')?.addEventListener('click', function(e) {
        const viewBtn = e.target.closest('.view-btn');
        if (viewBtn) {
            const singerId = viewBtn.dataset.singerId;
            if (singerId) {
                viewSinger(singerId);
            }
        }
    });
}); 