class SearchManager {
    constructor() {
        this.currentPage = 1;
        this.currentType = '';
        this.searchTimeout = null;
        this.searchInput = document.getElementById('searchInput');
        this.searchSuggestions = document.getElementById('searchSuggestions');
        this.initEventListeners();
    }

    initEventListeners() {
        // 搜索框获得焦点时显示建议框
        this.searchInput.addEventListener('focus', () => {
            const query = this.searchInput.value.trim();
            if (query) {
                this.performSearch(query);
            }
        });

        // 点击页面其他地方时隐藏建议框
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.searchSuggestions.contains(e.target)) {
                this.searchSuggestions.classList.remove('active');
            }
        });

        // 输入搜索内容时触发搜索
        this.searchInput.addEventListener('input', () => {
            const query = this.searchInput.value.trim();
            
            // 清除之前的定时器
            clearTimeout(this.searchTimeout);
            
            if (query) {
                // 设置新的定时器，延迟300ms执行搜索
                this.searchTimeout = setTimeout(() => {
                    this.performSearch(query);
                }, 300);
     
                this.searchSuggestions.classList.remove('active');
                this.searchSuggestions.innerHTML = '';
            }
        });

        // 按下回车键时执行搜索
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = this.searchInput.value.trim();
                if (query) {
                    window.location.href = `/search/detail?keyword=${encodeURIComponent(query)}&type=all&page=1`;
                }
            }
        });

        // 添加事件委托处理播放和查看按钮的点击
        document.addEventListener('click', (e) => {
            const playBtn = e.target.closest('.play-btn');
            if (playBtn) {
                const songId = playBtn.dataset.songId;
                if (songId) {
                    this.playSong(songId);
                }
            }

            const viewBtn = e.target.closest('.view-btn');
            if (viewBtn) {
                const singerId = viewBtn.dataset.singerId;
                if (singerId) {
                    this.viewSinger(singerId);
                }
            }
        });
    }

    performSearch(query) {
        if (!query) {
            this.searchSuggestions.innerHTML = '';
            return;
        }

        fetch(`/search/api?keyword=${encodeURIComponent(query)}&page=1&size=5`)
            .then(response => response.json())
            .then(data => {
                this.displaySuggestions(data);
            })
            .catch(error => {
                console.error('搜索出错:', error);
                this.searchSuggestions.classList.remove('active');
                this.searchSuggestions.innerHTML = '';
            });
    }

    displaySuggestions(data) {
        // 清空之前的建议
        this.searchSuggestions.innerHTML = '';
        
        // 检查是否有搜索结果
        if ((!data.songs || data.songs.length === 0) && (!data.singers || data.singers.length === 0)) {
            this.searchSuggestions.classList.remove('active');
            return;
        }

        // 显示歌曲建议
        if (data.songs && data.songs.length > 0) {
            data.songs.forEach(song => {
                const suggestionItem = document.createElement('div');
                suggestionItem.className = 'suggestion-item';
                
                suggestionItem.innerHTML = `
                    <i class="fas fa-music item-icon"></i>
                    <div class="item-info">
                        <div class="item-title">${song.name}</div>
                        <div class="item-subtitle">歌曲</div>
                    </div>
                `;

                suggestionItem.addEventListener('click', () => {
                    const keyword = this.searchInput.value.trim();
                    window.location.href = `/search/detail?keyword=${encodeURIComponent(keyword)}&type=song&page=1`;
                });

                this.searchSuggestions.appendChild(suggestionItem);
            });
        }

        // 显示歌手建议
        if (data.singers && data.singers.length > 0) {
            data.singers.forEach(singer => {
                const suggestionItem = document.createElement('div');
                suggestionItem.className = 'suggestion-item';
                
                suggestionItem.innerHTML = `
                    <i class="fas fa-user item-icon"></i>
                    <div class="item-info">
                        <div class="item-title">${singer.name}</div>
                        <div class="item-subtitle">歌手</div>
                    </div>
                `;

                suggestionItem.addEventListener('click', () => {
                    const keyword = this.searchInput.value.trim();
                    window.location.href = `/search/detail?keyword=${encodeURIComponent(keyword)}&type=singer&page=1`;
                });

                this.searchSuggestions.appendChild(suggestionItem);
            });
        }

        // 显示建议框
        this.searchSuggestions.classList.add('active');
    }

    search(keyword, page, type) {
        this.currentPage = page;
        this.currentType = type;

        $.get('/search/api', {
            keyword: keyword,
            page: page,
            size: 10,
            type: type
        }, (result) => {
            this.displayResults(result);
            this.displayPagination(result);
        });
    }

    displayResults(result) {
        const $results = $('#searchResults');
        $results.empty();

        if (result.songs && result.songs.length > 0) {
            $results.append('<h3>歌曲</h3>');
            result.songs.forEach(song => {
                $results.append(this.createSongResultItem(song));
            });
        }

        if (result.singers && result.singers.length > 0) {
            $results.append('<h3>歌手</h3>');
            result.singers.forEach(singer => {
                $results.append(this.createSingerResultItem(singer));
            });
        }

        if (!result.songs && !result.singers) {
            $results.append('<p>没有找到相关结果</p>');
        }
    }

    createSongResultItem(song) {
        return `
            <div class="result-item">
                <div class="song-info">
                    <h5>${song.name}</h5>
                    <p>歌手: ${song.singerIds ? song.singerIds.join(', ') : '未知'}</p>
                </div>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary play-btn" data-song-id="${song.id}">播放</button>
                </div>
            </div>
        `;
    }

    createSingerResultItem(singer) {
        return `
            <div class="result-item">
                <div class="singer-info">
                    <h5>${singer.name}</h5>
                    <img src="${singer.avatar || ''}" alt="${singer.name}" class="singer-avatar">
                </div>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-info view-btn" data-singer-id="${singer.id}">查看详情</button>
                </div>
            </div>
        `;
    }

    displayPagination(result) {
        const $pagination = $('#pagination');
        $pagination.empty();

        const totalPages = Math.ceil(result.total / result.size);
        if (totalPages <= 1) return;

        // 上一页
        $pagination.append(`
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="return false;">上一页</a>
            </li>
        `);

        // 页码
        for (let i = 1; i <= totalPages; i++) {
            $pagination.append(`
                <li class="page-item ${this.currentPage === i ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="searchManager.search('${this.searchInput.value}', ${i}, '${this.currentType}'); return false;">${i}</a>
                </li>
            `);
        }

        // 下一页
        $pagination.append(`
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="return false;">下一页</a>
            </li>
        `);
    }

    playSong(songId) {
        window.location.href = `/player/play/${songId}`;
    }

    viewSinger(singerId) {
        window.location.href = `/singer/detail/${singerId}`;
    }
}

// 初始化搜索管理器
let searchManager;
document.addEventListener('DOMContentLoaded', () => {
    searchManager = new SearchManager();
}); 