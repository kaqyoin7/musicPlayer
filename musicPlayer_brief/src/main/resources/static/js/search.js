class SearchManager {
    constructor() {
        this.currentPage = 1;
        this.currentType = '';
        this.searchTimeout = null;
        this.initEventListeners();
    }

    initEventListeners() {
        // 搜索框输入事件
        $('#searchInput').on('input', () => {
            clearTimeout(this.searchTimeout);
            const keyword = $('#searchInput').val().trim();
            
            if (keyword.length > 0) {
                this.searchTimeout = setTimeout(() => {
                    this.search(keyword, 1, '');
                }, 300);
            } else {
                $('#searchSuggestions').hide();
            }
        });

        // 搜索按钮点击事件
        $('#searchButton').click(() => {
            const keyword = $('#searchInput').val().trim();
            if (keyword) {
                this.search(keyword, 1, this.currentType);
            }
        });

        // 点击建议项
        $(document).on('click', '.search-suggestion-item', (e) => {
            const keyword = $(e.target).text();
            $('#searchInput').val(keyword);
            $('#searchSuggestions').hide();
            this.search(keyword, 1, this.currentType);
        });
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
                    <button class="btn btn-sm btn-primary" onclick="searchManager.playSong('${song.id}')">播放</button>
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
                    <button class="btn btn-sm btn-info" onclick="searchManager.viewSinger('${singer.id}')">查看详情</button>
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
                    <a class="page-link" href="#" onclick="searchManager.search('${$('#searchInput').val()}', ${i}, '${this.currentType}'); return false;">${i}</a>
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
$(document).ready(() => {
    searchManager = new SearchManager();
}); 