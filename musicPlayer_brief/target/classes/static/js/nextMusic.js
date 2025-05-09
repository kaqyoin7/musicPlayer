let player = document.getElementById('musicPlayer')
let isPlaying = true
let songsName = document.getElementById('title')
let cover = document.getElementById('cover')
let artist = document.getElementById('artist')

// 预加载的歌曲信息
let preloadedSong = null;
let isPreloading = false;

// 获取歌手信息
async function getSingerInfo(singerId) {
    try {
        // 清理ID：移除所有非数字字符
        const cleanId = String(singerId).replace(/[^0-9]/g, '');
        console.log("cleanID:"+cleanId)
        if (!cleanId) {
            console.error('Invalid singer ID:', singerId);
            return null;
        }
        const response = await fetch(`/test/singer/get?id=${cleanId}`);
        // const response = await fetch(`/test/singer/get?id=${singerId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const singer = await response.json();
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
        
        // 预加载图片
        img.src = song.cover;
    });
}

// 从后端获取随机歌曲
async function getRandomSong() {
    try {
        const response = await fetch('/test/song/random');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const song = await response.json();
        return song;
    } catch (error) {
        console.error('Error fetching random song:', error);
        return null;
    }
}

// 记录播放日志
async function logPlay(song, singerNames) {
    try {
        const logData = {
            songName: song.name,
            singerNames: singerNames,
            coverUrl: song.cover,
            audioUrl: song.url
        };
        
        await fetch('/api/player/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(logData)
        });
    } catch (error) {
        console.error('Failed to log play:', error);
    }
}

// 更新播放器信息
async function updatePlayerInfo(song) {
    if (!song) return;
    
    songsName.innerText = song.name;
    cover.src = song.cover;
    
    // 获取并显示歌手名称
    const singerNames = await getSingerNames(song.singerIds);
    artist.innerText = singerNames || 'unKonwn';
    
    player.src = song.url;
    player.play();

    // 记录播放日志
    await logPlay(song, singerNames);
}

// 预加载下一首歌曲
async function preloadNextSong() {
    if (isPreloading) return;
    
    try {
        isPreloading = true;
        const song = await getRandomSong();
        if (song) {
            await preloadResources(song);
            preloadedSong = song;
            console.log('预加载完成:', song.name);
        }
    } catch (error) {
        console.error('预加载失败:', error);
    } finally {
        isPreloading = false;
    }
}

// 播放下一首
async function nextMusic() {
    // 如果有预加载的歌曲，直接使用
    if (preloadedSong) {
        await updatePlayerInfo(preloadedSong);
        preloadedSong = null;
    } else {
        // 如果没有预加载的歌曲，立即加载并播放
        const song = await getRandomSong();
        await updatePlayerInfo(song);
    }
    
    // 开始预加载下一首
    preloadNextSong();
}

// 添加下一首按钮的点击事件监听器
document.addEventListener('DOMContentLoaded', function() {
    const nextButton = document.querySelector('.next');
    if (nextButton) {
        nextButton.addEventListener('click', nextMusic);
    }
});

// 监听播放结束事件
player.addEventListener('ended', function () {
    nextMusic();
}, false);

// 监听播放开始事件，开始预加载下一首
player.addEventListener('play', function() {
    preloadNextSong();
}, false);

// 初始加载第一首歌
nextMusic();

