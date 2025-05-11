// 播放歌曲
function playSong(songId) {
    window.location.href = `/player/play/${songId}`;
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
    console.log('开始获取歌手名称 - 歌手ID列表:', singerIds);
    
    if (!singerIds || singerIds.length === 0) {
        console.log('没有歌手ID，返回空字符串');
        return '';
    }
    
    try {
        const singerPromises = singerIds.map(id => getSingerInfo(id));
        const singers = await Promise.all(singerPromises);
        const names = singers
            .filter(singer => singer !== null)
            .map(singer => singer.name)
            .join(', ');
        console.log('获取到的歌手名称:', names);
        return names;
    } catch (error) {
        console.error('Error getting singer names:', error);
        return '';
    }
}

// 更新歌手名称显示
async function updateSingerNames() {
    console.log('开始更新歌手名称显示');
    const singerNameElements = document.querySelectorAll('.singer-name');
    console.log('找到的歌手名称元素数量:', singerNameElements.length);
    
    for (const element of singerNameElements) {
        const singerIdsStr = element.dataset.singerIds || '';
        console.log('元素中的歌手ID字符串:', singerIdsStr);
        
        const singerIds = singerIdsStr ? singerIdsStr.split(',').map(id => id.trim()) : [];
        console.log('解析后的歌手ID数组:', singerIds);
        
        const singerNames = await getSingerNames(singerIds);
        console.log('设置歌手名称:', singerNames);
        element.textContent = singerNames || '未知歌手';
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始初始化');
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