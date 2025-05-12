// 获取播放器元素
const player = document.getElementById('musicPlayer');
const title = document.getElementById('title');
const cover = document.getElementById('cover');
const artist = document.getElementById('artist');

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 从localStorage获取当前歌曲信息
    const songJson = localStorage.getItem('currentSong');
    if (songJson) {
        try {
            const song = JSON.parse(songJson);
            // 更新播放器信息
            await updatePlayerInfo(song); // This will play the song
            // 清除localStorage中的歌曲信息, 因为它已经被加载和播放
            localStorage.removeItem('currentSong');
        } catch (error) {
            console.error('Error loading song from localStorage:', error);
            // 如果加载失败，显示错误信息并尝试播放随机歌曲
            title.textContent = '加载失败';
            artist.textContent = '请重试';
            nextMusic(); // Fallback to random song
        }
    } else {
        // 如果没有歌曲信息，播放随机歌曲
        nextMusic();
    }
});

// 更新播放器信息
async function updatePlayerInfo(song) {
    if (!song) return;
    
    // 更新歌曲信息
    title.textContent = song.name;
    cover.src = song.cover;
    
    // 获取并显示歌手名称
    const singerNames = await getSingerNames(song.singerIds);
    artist.textContent = singerNames || '未知歌手';
    
    // 设置音频源并播放
    player.src = song.url;
    player.play();
}

// 获取歌手名称
async function getSingerNames(singerIds) {
    if (!singerIds || singerIds.length === 0) {
        return '';
    }
    
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

// 获取歌手信息
async function getSingerInfo(singerId) {
    try {
        const cleanId = String(singerId).replace(/[^0-9]/g, '');
        if (!cleanId) {
            console.error('Invalid singer ID:', singerId);
            return null;
        }
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
    nextMusic();
}, false); 