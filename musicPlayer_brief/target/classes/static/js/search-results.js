// document.addEventListener('DOMContentLoaded', function() {
//     // 播放按钮点击事件
//     document.querySelectorAll('.play-btn').forEach(button => {
//         button.addEventListener('click', function() {
//             const songId = this.dataset.songId;
//             // 调用播放接口
//             fetch(`/api/songs/${songId}/play`, {
//                 method: 'POST'
//             })
//             .then(response => response.json())
//             .then(data => {
//                 if (data.success) {
//                     // 播放成功，可以添加一些视觉反馈
//                     this.innerHTML = '<i class="fas fa-check"></i> 已播放';
//                     this.disabled = true;
//                 }
//             })
//             .catch(error => {
//                 console.error('播放失败:', error);
//             });
//         });
//     });
//
//     // 收藏按钮点击事件
//     document.querySelectorAll('.collect-btn').forEach(button => {
//         button.addEventListener('click', function() {
//             const songId = this.dataset.songId;
//             // 调用收藏接口
//             fetch(`/api/songs/${songId}/collect`, {
//                 method: 'POST'
//             })
//             .then(response => response.json())
//             .then(data => {
//                 if (data.success) {
//                     // 收藏成功，更新按钮状态
//                     this.innerHTML = '<i class="fas fa-heart"></i> 已收藏';
//                     this.disabled = true;
//                 }
//             })
//             .catch(error => {
//                 console.error('收藏失败:', error);
//             });
//         });
//     });
//
//     // 查看歌手详情按钮点击事件
//     document.querySelectorAll('.view-btn').forEach(button => {
//         button.addEventListener('click', function() {
//             const artistId = this.dataset.artistId;
//             window.location.href = `/artists/${artistId}`;
//         });
//     });

    // 标签页切换时保持URL参数
    document.querySelectorAll('.nav-link').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            const urlParams = new URLSearchParams(window.location.search);
            const query = urlParams.get('q');
            const page = urlParams.get('page') || 1;
            
            // 更新URL，保持查询参数
            const newUrl = `${target}?q=${query}&page=${page}`;
            window.history.pushState({}, '', newUrl);
            
            // 手动触发标签页切换
            document.querySelector(this.getAttribute('href')).classList.add('show', 'active');
            document.querySelectorAll('.tab-pane').forEach(pane => {
                if (pane.id !== this.getAttribute('href').substring(1)) {
                    pane.classList.remove('show', 'active');
                }
            });
        });
    });
// });