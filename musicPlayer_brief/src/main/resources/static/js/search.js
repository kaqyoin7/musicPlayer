class SearchManager {
    constructor() {
        // console.log('Initializing SearchManager...');
        this.currentPage = 1;
        this.currentType = '';
        this.searchTimeout = null;
        
        // Debug DOM element initialization
        // console.log('Searching for DOM elements...');
        this.searchInput = document.getElementById('searchInput');
        // console.log('searchInput element:', this.searchInput);
        
        this.searchSuggestions = document.getElementById('searchSuggestions');
        // console.log('searchSuggestions element:', this.searchSuggestions);
        
        this.addToCollectionModal = document.getElementById('addToCollectionModal');
        // console.log('addToCollectionModal element:', this.addToCollectionModal);
        
        this.loadingModal = document.getElementById('loadingModal');
        // console.log('loadingModal element:', this.loadingModal);

        // Log all modals in the document for debugging
        const allModals = document.querySelectorAll('.modal');
        // console.log('All modal elements found in document:', allModals);
        
        console.log('Current song ID from window:', window.currentSongId);
        
        // 检查歌曲ID是否正确设置
        this.updateCurrentSongId();
        
        this.initEventListeners();
    }

    // 更新当前歌曲ID
    updateCurrentSongId() {
        // 首先尝试从音频元素获取
        const audioElement = document.getElementById('musicPlayer');
        if (audioElement) {
            const newSongId = audioElement.getAttribute('data-song-id');
            if (newSongId) {
                window.currentSongId = newSongId;
                console.log('Updated song ID from audio element:', window.currentSongId);
                return;
            }
        }

        // 如果音频元素没有ID，尝试从window对象获取
        if (window.currentSongId) {
            console.log('Using song ID from window:', window.currentSongId);
            return;
        }

        console.warn('No song ID available');
    }

    initEventListeners() {
        // console.log('Initializing event listeners...');
        
        // 搜索框获得焦点时显示建议框
        this.searchInput.addEventListener('focus', () => {
            const query = this.searchInput.value.trim();
            console.log(111111111111111);
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
            console.log("检测到内容输入");

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

            // 处理添加到歌单按钮点击
            const addToCollectionBtn = e.target.closest('.add-to-collection');
            if (addToCollectionBtn) {
                console.log('Add to collection button clicked');
                this.updateCurrentSongId(); // 更新歌曲ID
                console.log('Current song ID when clicking:', window.currentSongId);
                this.showCollectionList(addToCollectionBtn);
            }

            // 处理关闭模态框按钮点击
            const closeBtn = e.target.closest('.close-btn');
            if (closeBtn) {
                console.log('Close button clicked');
                this.hideAddToCollectionModal();
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

    // 显示添加到歌单模态框
    showAddToCollectionModal() {
        console.log('Attempting to show add to collection modal...');
        console.log('Current modal element state:', this.addToCollectionModal);
        
        if (!this.addToCollectionModal) {
            console.error('Add to collection modal not found');
            console.log('Document body content:', document.body.innerHTML);
            console.log('All elements with ID:', {
                'addToCollectionModal': document.getElementById('addToCollectionModal'),
                'loadingModal': document.getElementById('loadingModal'),
                'searchInput': document.getElementById('searchInput'),
                'searchSuggestions': document.getElementById('searchSuggestions')
            });
            return;
        }

        const collectionList = this.addToCollectionModal.querySelector('.collection-list');
        console.log('Collection list element:', collectionList);
        
        if (!collectionList) {
            console.error('Collection list element not found');
            console.log('Modal content:', this.addToCollectionModal.innerHTML);
            return;
        }
        
        // 显示加载提示
        this.showLoading();
        
        // 获取所有歌单
        console.log('Fetching collections...');
        fetch('/collection')
            .then(response => {
                console.log('Collection fetch response:', response);
                return response.text();
            })
            .then(html => {
                console.log('Received collection HTML:', html);
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const collections = doc.querySelectorAll('.collection-item');
                console.log('Found collections:', collections.length);
                
                // 清空现有列表
                collectionList.innerHTML = '';
                
                // 添加歌单到列表
                collections.forEach((collection, index) => {
                    console.log(`Processing collection ${index + 1}:`, collection);
                    const collectionId = collection.getAttribute('data-id');
                    const name = collection.querySelector('.collection-name')?.textContent;
                    const description = collection.querySelector('.collection-description')?.textContent;
                    const cover = collection.querySelector('.collection-cover')?.style.backgroundImage;
                    
                    console.log('Collection details:', { collectionId, name, description, cover });
                    
                    const item = document.createElement('div');
                    item.className = 'collection-item';
                    item.innerHTML = `
                        <img src="${cover?.replace(/url\(['"](.+)['"]\)/, '$1') || ''}" alt="${name || ''}">
                        <div class="collection-info">
                            <h3 class="collection-name">${name || ''}</h3>
                            <p class="collection-description">${description || ''}</p>
                        </div>
                    `;
                    
                    item.addEventListener('click', () => this.addSongToCollection(collectionId));
                    collectionList.appendChild(item);
                });
                
                // 隐藏加载提示
                this.hideLoading();
                this.addToCollectionModal.style.display = 'block';
                console.log('Modal display updated');
            })
            .catch(error => {
                console.error('Error fetching collections:', error);
                this.hideLoading();
                alert('获取歌单列表失败，请稍后重试');
            });
    }

    // 隐藏添加到歌单模态框
    hideAddToCollectionModal() {
        if (this.addToCollectionModal) {
            this.addToCollectionModal.style.display = 'none';
        }
    }

    // 添加歌曲到歌单
    addSongToCollection() {
        // 显示加载提示
        this.showLoading();
        
        // 获取所有歌单
        fetch('/collection')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const collections = doc.querySelectorAll('.collection-item');
                
                if (collections.length === 0) {
                    alert('您还没有创建任何歌单，请先创建歌单');
                    this.hideLoading();
                    return;
                }

                // 创建选择列表
                const select = document.createElement('select');
                select.className = 'form-control';
                
                // 添加默认选项
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = '请选择要添加到的歌单';
                select.appendChild(defaultOption);
                
                // 添加歌单选项
                collections.forEach(collection => {
                    const collectionId = collection.getAttribute('data-id');
                    const name = collection.querySelector('.collection-name').textContent;
                    
                    const option = document.createElement('option');
                    option.value = collectionId;
                    option.textContent = name;
                    select.appendChild(option);
                });
                
                // 显示选择对话框
                const result = prompt('请选择要添加到的歌单：', select.outerHTML);
                if (result) {
                    const selectedId = select.value;
                    if (selectedId) {
                        this.addSongToSelectedCollection(selectedId);
                    } else {
                        alert('请选择一个歌单');
                    }
                }
                
                this.hideLoading();
            })
            .catch(error => {
                console.error('Error fetching collections:', error);
                this.hideLoading();
                alert('获取歌单列表失败，请稍后重试');
            });
    }

    // 添加歌曲到选定的歌单
    addSongToSelectedCollection(collectionId) {
        this.showLoading();
        
        fetch(`/collection/${collectionId}/add-song/${window.currentSongId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                songId: window.currentSongId,
                collectionId: collectionId
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text || 'Network response was not ok');
                });
            }
            return response.json();
        })
        .then(result => {
            this.hideLoading();
            if (result === true || result.success) {
                alert('添加成功！');
            } else {
                throw new Error(result.message || '添加失败');
            }
        })
        .catch(error => {
            console.error('Error adding song to collection:', error);
            this.hideLoading();
            alert(error.message || '添加失败，请稍后重试');
        });
    }

    // 显示加载提示
    showLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-overlay';
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p>处理中...</p>
        `;
        document.body.appendChild(loadingDiv);
    }

    // 隐藏加载提示
    hideLoading() {
        const loadingDiv = document.querySelector('.loading-overlay');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    // 显示歌单列表
    showCollectionList(button) {
        // 检查当前歌曲ID
        this.updateCurrentSongId();
        if (!window.currentSongId) {
            console.error('Current song ID is not available:', window.currentSongId);
            alert('无法获取当前播放歌曲信息，请确保正在播放歌曲');
            return;
        }

        console.log('Using song ID for collection:', window.currentSongId);

        // 创建歌单列表容器
        const collectionListDiv = document.createElement('div');
        collectionListDiv.className = 'collection-list-container';
        collectionListDiv.style.cssText = `
            position: absolute;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 10px;
            z-index: 1000;
            max-height: 300px;
            overflow-y: auto;
            min-width: 200px;
        `;

        // 获取按钮位置
        const buttonRect = button.getBoundingClientRect();
        collectionListDiv.style.top = `${buttonRect.bottom + window.scrollY + 5}px`;
        collectionListDiv.style.left = `${buttonRect.left + window.scrollX}px`;

        // 添加标题
        const title = document.createElement('div');
        title.className = 'collection-list-title';
        title.style.cssText = `
            font-weight: bold;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #eee;
        `;
        title.textContent = '选择要添加到的歌单';
        collectionListDiv.appendChild(title);

        // 添加加载提示
        const loadingDiv = document.createElement('div');
        loadingDiv.textContent = '加载中...';
        collectionListDiv.appendChild(loadingDiv);

        // 添加到文档中
        document.body.appendChild(collectionListDiv);

        // 获取歌单列表
        fetch('/collection')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const collections = doc.querySelectorAll('.collection-item');
                
                // 移除加载提示
                loadingDiv.remove();

                if (collections.length === 0) {
                    const noCollections = document.createElement('div');
                    noCollections.textContent = '您还没有创建任何歌单';
                    collectionListDiv.appendChild(noCollections);
                    return;
                }

                // 添加歌单列表
                collections.forEach(collection => {
                    const collectionId = collection.getAttribute('data-id');
                    const name = collection.querySelector('.collection-name').textContent;
                    const description = collection.querySelector('.collection-description')?.textContent || '';
                    const cover = collection.querySelector('.collection-cover')?.style.backgroundImage || '';
                    
                    const item = document.createElement('div');
                    item.className = 'collection-item';
                    item.style.cssText = `
                        padding: 8px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        border-bottom: 1px solid #eee;
                    `;
                    item.innerHTML = `
                        <div style="
                            width: 40px;
                            height: 40px;
                            background-image: ${cover};
                            background-size: cover;
                            margin-right: 10px;
                            border-radius: 4px;
                        "></div>
                        <div>
                            <div style="font-weight: bold;">${name}</div>
                            <div style="font-size: 12px; color: #666;">${description}</div>
                        </div>
                    `;

                    // 添加点击事件
                    item.addEventListener('click', () => {
                        // 再次确认当前歌曲ID
                        this.updateCurrentSongId();
                        const currentSongId = window.currentSongId;
                        
                        if (!currentSongId) {
                            alert('无法获取当前播放歌曲信息，请确保正在播放歌曲');
                            return;
                        }

                        console.log('Adding song', currentSongId, 'to collection', collectionId);
                        
                        // 显示添加中状态
                        const originalContent = item.innerHTML;
                        item.innerHTML = '<div style="text-align: center; width: 100%;">添加中...</div>';
                        item.style.pointerEvents = 'none';
                        
                        // 发送添加请求
                        fetch(`/collection/${collectionId}/add-song/${currentSongId}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            credentials: 'same-origin',
                            body: JSON.stringify({
                                songId: currentSongId,
                                collectionId: collectionId
                            })
                        })
                        .then(response => {
                            if (!response.ok) {
                                return response.text().then(text => {
                                    throw new Error(text || 'Network response was not ok');
                                });
                            }
                            return response.json();
                        })
                        .then(result => {
                            if (result === true || result.success) {
                                // 显示成功状态
                                item.innerHTML = '<div style="text-align: center; width: 100%; color: #4CAF50;">添加成功！</div>';
                                setTimeout(() => {
                                    collectionListDiv.remove();
                                }, 1000);
                            } else {
                                throw new Error(result.message || '添加失败');
                            }
                        })
                        .catch(error => {
                            console.error('Error adding song to collection:', error);
                            item.innerHTML = originalContent;
                            item.style.pointerEvents = 'auto';
                            alert(error.message || '添加失败，请稍后重试');
                        });
                    });

                    // 添加悬停效果
                    item.addEventListener('mouseover', () => {
                        item.style.backgroundColor = '#f5f5f5';
                    });
                    item.addEventListener('mouseout', () => {
                        item.style.backgroundColor = 'white';
                    });

                    collectionListDiv.appendChild(item);
                });
            })
            .catch(error => {
                console.error('Error fetching collections:', error);
                loadingDiv.textContent = '加载失败，请重试';
            });

        // 点击其他地方关闭列表
        const closeList = (e) => {
            if (!collectionListDiv.contains(e.target) && e.target !== button) {
                collectionListDiv.remove();
                document.removeEventListener('click', closeList);
            }
        };
        document.addEventListener('click', closeList);
    }
}

// 初始化搜索管理器
let searchManager;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    console.log('Window currentSongId before initialization:', window.currentSongId);
    searchManager = new SearchManager();
}); 