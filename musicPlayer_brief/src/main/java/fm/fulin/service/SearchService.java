package fm.fulin.service;

import fm.fulin.model.SearchResult;
import fm.fulin.param.SearchRequest;


public interface SearchService {
    /**
     * 搜索歌曲和歌手
     * @param request 搜索请求参数
     * @return 搜索结果
     */
    SearchResult search(SearchRequest request);
} 