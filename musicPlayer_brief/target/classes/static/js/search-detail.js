// 播放歌曲
function playSong(songId) {
    window.location.href = `/player/play/${songId}`;
}

// 查看歌手详情
function viewSinger(singerId) {
    window.location.href = `/singer/detail/${singerId}`;
}

// 页面加载完成后添加动画效果和事件监听
document.addEventListener('DOMContentLoaded', function() {
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