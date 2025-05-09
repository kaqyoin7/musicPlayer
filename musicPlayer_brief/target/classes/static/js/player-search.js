//播放器搜索组件
class PlayerSearchManager {
    constructor() {
        this.searchTimeout = null;
        this.initEventListeners();
    }

    initEventListeners() {
        // 搜索框输入事件
        $('#playerSearchInput').on('input', () => {
            clearTimeout(this.searchTimeout);
            const keyword = $('#playerSearchInput').val().trim();
            
            if (keyword.length > 0) {
                this.searchTimeout = setTimeout(() => {
                    this.searchSuggestions(keyword);
                }, 300);
            } else {
                $('#playerSearchSuggestions').hide();
            }
        });

        // 回车键搜索
        $('#playerSearchInput').on('keypress', (e) => {
            if (e.which === 13) { // Enter key
                const keyword = $('#playerSearchInput').val().trim();
                if (keyword) {
                    window.location.href = `/search/page?keyword=${encodeURIComponent(keyword)}`;
                }
            }
        });

        // 点击建议项
        $(document).on('click', '.player-search-suggestion-item', (e) => {
            const $item = $(e.currentTarget);
            const type = $item.data('type');
            const id = $item.data('id');
            
            if (type === 'song') {
                window.location.href = `/player/play/${id}`;
            } else if (type === 'singer') {
                window.location.href = `/singer/detail/${id}`;
            }
        });

        // 点击页面其他地方关闭建议框
        $(document).on('click', (e) => {
            if (!$(e.target).closest('.search-container').length) {
                $('#playerSearchSuggestions').hide();
            }
        });

        // 搜索框获得焦点时显示建议框
        $('#playerSearchInput').on('focus', () => {
            const keyword = $('#playerSearchInput').val().trim();
            if (keyword) {
                this.searchSuggestions(keyword);
            }
        });
    }

    searchSuggestions(keyword) {
        $.get('/search/api', {
            keyword: keyword,
            page: 1,
            size: 5,
            type: ''
        }, (result) => {
            this.displaySuggestions(result);
        });
    }

    displaySuggestions(result) {
        const $suggestions = $('#playerSearchSuggestions');
        $suggestions.empty();

        let hasResults = false;

        if (result.songs && result.songs.length > 0) {
            hasResults = true;
            result.songs.forEach(song => {
                $suggestions.append(this.createSongSuggestionItem(song));
            });
        }

        if (result.singers && result.singers.length > 0) {
            hasResults = true;
            result.singers.forEach(singer => {
                $suggestions.append(this.createSingerSuggestionItem(singer));
            });
        }

        if (hasResults) {
            $suggestions.show();
        } else {
            $suggestions.hide();
        }
    }

    createSongSuggestionItem(song) {
        return `
            <div class="player-search-suggestion-item" data-type="song" data-id="${song.id}">
                <div class="item-icon">
                    <i class="fas fa-music"></i>
                </div>
                <div class="item-content">
                    <div class="item-name">${song.name}</div>
                    <div class="item-type">歌曲</div>
                </div>
            </div>
        `;
    }

    createSingerSuggestionItem(singer) {
        return `
            <div class="player-search-suggestion-item" data-type="singer" data-id="${singer.id}">
                <div class="item-icon">
                    <i class="fas fa-user"></i>
                </div>
                <div class="item-content">
                    <div class="item-name">${singer.name}</div>
                    <div class="item-type">歌手</div>
                </div>
            </div>
        `;
    }
}

// 初始化搜索管理器
let playerSearchManager;
$(document).ready(() => {
    playerSearchManager = new PlayerSearchManager();
}); 