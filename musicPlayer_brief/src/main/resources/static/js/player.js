// 获取播放器元素
const player = document.getElementById('musicPlayer');
const title = document.getElementById('title');
const cover = document.getElementById('cover');
const artist = document.getElementById('artist');

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM Content Loaded');
    // 从localStorage获取当前歌曲信息
    const songJson = localStorage.getItem('currentSong');
    console.log('Retrieved from localStorage:', songJson);
    
    if (songJson) {
        try {
            const song = JSON.parse(songJson);
            console.log('Parsed song data:', song);
            
            // 检查是否是用户选择的歌曲
            if (song.userSelected) {
                console.log('Playing user selected song:', song.name);
                // 更新播放器信息
                await updatePlayerInfo(song);
                // 清除localStorage中的歌曲信息
                localStorage.removeItem('currentSong');
                // 移除播放开始事件监听器，防止触发随机歌曲预加载
                player.removeEventListener('play', preloadNextSong);
            } else {
                // 如果不是用户选择的歌曲，播放随机歌曲
                console.log('No user selected song, playing random song');
                nextMusic();
            }
        } catch (error) {
            console.error('Error loading song from localStorage:', error);
            // 如果加载失败，显示错误信息并尝试播放随机歌曲
            title.textContent = '加载失败';
            artist.textContent = '请重试';
            nextMusic();
        }
    } else {
        console.log('No song in localStorage, playing random song');
        // 如果没有歌曲信息，播放随机歌曲
        nextMusic();
    }
});

// 更新播放器信息
async function updatePlayerInfo(song) {
    if (!song) {
        console.error('No song data provided to updatePlayerInfo');
        return;
    }
    
    console.log('Updating player info with song:', song);
    
    // 更新歌曲信息
    title.textContent = song.name;
    cover.src = song.cover;
    
    // 处理singerIds格式问题
    let singerIds = song.singerIds;
    if (typeof singerIds === 'string') {
        try {
            singerIds = JSON.parse(singerIds);
        } catch (e) {
            console.error('Error parsing singerIds:', e);
            singerIds = [];
        }
    }
    
    // 获取并显示歌手名称
    const singerNames = await getSingerNames(singerIds);
    artist.textContent = singerNames || '未知歌手';
    
    // 设置音频源
    player.src = song.url;
    console.log('Setting audio source to:', song.url);
    
    // 等待音频加载完成
    await new Promise((resolve) => {
        const handleLoadedData = () => {
            console.log('Audio loaded successfully');
            player.removeEventListener('loadeddata', handleLoadedData);
            resolve();
        };
        player.addEventListener('loadeddata', handleLoadedData);
        
        // 设置超时处理
        setTimeout(() => {
            console.log('Audio loading timeout, proceeding anyway');
            player.removeEventListener('loadeddata', handleLoadedData);
            resolve();
        }, 5000); // 5秒超时
    });
    
    // 尝试播放
    try {
        // 添加用户交互事件监听器
        const playOnInteraction = async () => {
            try {
                await player.play();
                console.log('Successfully started playing:', song.name);
                // 移除所有交互事件监听器
                document.removeEventListener('click', playOnInteraction);
                document.removeEventListener('keydown', playOnInteraction);
                player.removeEventListener('click', playOnInteraction);
            } catch (error) {
                console.error('Error playing after interaction:', error);
            }
        };

        // 添加多个交互事件监听器
        document.addEventListener('click', playOnInteraction);
        document.addEventListener('keydown', playOnInteraction);
        player.addEventListener('click', playOnInteraction);

        // 尝试自动播放
        await player.play();
        console.log('Successfully started playing:', song.name);
    } catch (error) {
        console.log('Autoplay failed, waiting for user interaction:', error);
        // 自动播放失败时，显示提示信息
        title.textContent = `${song.name} (点击播放)`;
    }
}

// 获取歌手名称
async function getSingerNames(singerIds) {
    if (!singerIds || singerIds.length === 0) {
        return '';
    }
    
    try {
        // 确保singerIds是数组
        const ids = Array.isArray(singerIds) ? singerIds : [singerIds];
        const singerPromises = ids.map(id => getSingerInfo(id));
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

// 获取歌手信息
async function getSingerInfo(singerId) {
    try {
        // 清理ID，移除所有非数字字符
        const cleanId = String(singerId).replace(/[^0-9]/g, '');
        if (!cleanId) {
            console.error('Invalid singer ID:', singerId);
            return null;
        }
        console.log('Fetching singer info for ID:', cleanId);
        const response = await fetch(`/test/singer/get?id=${cleanId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching singer info:', error);
        return null;
    }
}

// 播放下一首
async function nextMusic() {
    // 检查是否有待播放的歌曲
    const songJson = localStorage.getItem('currentSong');
    if (songJson) {
        try {
            const song = JSON.parse(songJson);
            if (song.userSelected) {
                // 如果是用户选择的歌曲，直接播放
                await updatePlayerInfo(song);
                localStorage.removeItem('currentSong');
                return;
            }
        } catch (error) {
            console.error('Error loading pending song:', error);
        }
    }

    // 如果没有待播放的歌曲或歌曲不是用户选择的，播放随机歌曲
    try {
        const response = await fetch('/test/song/random');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const song = await response.json();
        await updatePlayerInfo(song);
    } catch (error) {
        console.error('Error playing next song:', error);
    }
}

// 监听播放结束事件
player.addEventListener('ended', function() {
    // 检查是否有用户选择的歌曲
    const songJson = localStorage.getItem('currentSong');
    if (!songJson) {
        nextMusic();
    }
}, false);

// 添加页面可见性变化监听
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        // 页面变为可见时，检查是否有待播放的歌曲
        const songJson = localStorage.getItem('currentSong');
        if (songJson) {
            try {
                const song = JSON.parse(songJson);
                console.log('Found pending song after visibility change:', song);
                updatePlayerInfo(song);
            } catch (error) {
                console.error('Error loading song after visibility change:', error);
            }
        }
    }
}); 