package fm.fulin.service.impl;

import fm.fulin.model.SearchResult;
import fm.fulin.model.Singer;
import fm.fulin.model.Song;
import fm.fulin.param.SearchRequest;
import fm.fulin.service.SearchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SearchServiceImpl implements SearchService {
    private static final Logger LOG = LoggerFactory.getLogger(SearchServiceImpl.class);

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public SearchResult search(SearchRequest request) {
        SearchResult result = new SearchResult();
        result.setPage(request.getPage());
        result.setSize(request.getSize());

        if (request.getKeyword() == null || request.getKeyword().trim().isEmpty()) {
            return result;
        }

        String keyword = request.getKeyword().trim();
        Pageable pageable = PageRequest.of(request.getPage() - 1, request.getSize());

        // 根据类型搜索
        if ("song".equals(request.getType())) {
            searchSongs(keyword, pageable, result);
        } else if ("singer".equals(request.getType())) {
            searchSingers(keyword, pageable, result);
        } else {
            // 如果未指定类型，则同时搜索歌曲和歌手
            searchSongs(keyword, pageable, result);
            searchSingers(keyword, pageable, result);
        }

        return result;
    }

    private void searchSongs(String keyword, Pageable pageable, SearchResult result) {
        Query query = new Query();
        query.addCriteria(Criteria.where("name").regex(keyword, "i"));
        query.with(pageable);

        List<Song> songs = mongoTemplate.find(query, Song.class);
        long total = mongoTemplate.count(Query.query(Criteria.where("name").regex(keyword, "i")), Song.class);

        result.setSongs(songs);
        result.setTotal(total);
    }

    private void searchSingers(String keyword, Pageable pageable, SearchResult result) {
        Query query = new Query();
        query.addCriteria(Criteria.where("name").regex(keyword, "i"));
        query.with(pageable);

        List<Singer> singers = mongoTemplate.find(query, Singer.class);
        long total = mongoTemplate.count(Query.query(Criteria.where("name").regex(keyword, "i")), Singer.class);

        result.setSingers(singers);
        result.setTotal(total);
    }
} 