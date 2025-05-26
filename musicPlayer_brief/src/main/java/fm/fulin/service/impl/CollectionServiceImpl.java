package fm.fulin.service.impl;

import fm.fulin.model.Collection;
import fm.fulin.model.Song;
import fm.fulin.service.CollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class CollectionServiceImpl implements CollectionService {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public Collection createCollection(Collection collection) {
        collection.setGmtCreated(LocalDateTime.now());
        collection.setGmtModified(LocalDateTime.now());
        if (collection.getSongIds() == null) {
            collection.setSongIds(new ArrayList<>());
        }
        collection.setSongCount(collection.getSongIds().size());
        collection.setCover(""); // 初始化为空封面
        return mongoTemplate.save(collection);
    }

    @Override
    public Collection updateCollection(Collection collection) {
        Query query = new Query(Criteria.where("id").is(collection.getId()));
        Update update = new Update()
                .set("name", collection.getName())
                .set("description", collection.getDescription())
                .set("gmtModified", LocalDateTime.now());
        
        mongoTemplate.updateFirst(query, update, Collection.class);
        return getCollection(collection.getId());
    }

    @Override
    public boolean deleteCollection(String id) {
        Query query = new Query(Criteria.where("id").is(id));
        return mongoTemplate.remove(query, Collection.class).getDeletedCount() > 0;
    }

    @Override
    public Collection getCollection(String id) {
        return mongoTemplate.findById(id, Collection.class);
    }

    @Override
    public List<Collection> getAllCollections() {
        return mongoTemplate.findAll(Collection.class);
    }

    @Override
    public List<Collection> searchCollections(String name) {
        Pattern pattern = Pattern.compile(".*" + name + ".*", Pattern.CASE_INSENSITIVE);
        Query query = new Query(Criteria.where("name").regex(pattern));
        return mongoTemplate.find(query, Collection.class);
    }

    @Override
    public boolean addSongToCollection(String collectionId, String songId) {
        Collection collection = getCollection(collectionId);
        if (collection == null) {
            return false;
        }

        if (collection.getSongIds() == null) {
            collection.setSongIds(new ArrayList<>());
        }

        if (!collection.getSongIds().contains(songId)) {
            collection.getSongIds().add(songId);
            collection.setSongCount(collection.getSongIds().size());
            collection.setGmtModified(LocalDateTime.now());
            mongoTemplate.save(collection);
            
            // 更新歌单封面
            updateCollectionCover(collectionId);
            return true;
        }
        return false;
    }

    @Override
    public boolean removeSongFromCollection(String collectionId, String songId) {
        Collection collection = getCollection(collectionId);
        if (collection == null || collection.getSongIds() == null) {
            return false;
        }

        if (collection.getSongIds().remove(songId)) {
            collection.setSongCount(collection.getSongIds().size());
            collection.setGmtModified(LocalDateTime.now());
            mongoTemplate.save(collection);
            
            // 更新歌单封面
            updateCollectionCover(collectionId);
            return true;
        }
        return false;
    }

    @Override
    public List<Collection> getCollectionsBySongId(String songId) {
        Query query = new Query(Criteria.where("songIds").in(songId));
        return mongoTemplate.find(query, Collection.class);
    }

    @Override
    public void updateCollectionCover(String collectionId) {
        Collection collection = getCollection(collectionId);
        if (collection == null || collection.getSongIds() == null || collection.getSongIds().isEmpty()) {
            // 如果歌单为空，设置封面为空
            Query query = new Query(Criteria.where("id").is(collectionId));
            Update update = new Update().set("cover", "");
            mongoTemplate.updateFirst(query, update, Collection.class);
            return;
        }

        // 获取最新加入的歌曲（列表中的最后一个）
        String lastSongId = collection.getSongIds().get(collection.getSongIds().size() - 1);
        Song song = mongoTemplate.findById(lastSongId, Song.class);
        
        if (song != null && song.getCover() != null) {
            // 更新歌单封面为最新歌曲的封面
            Query query = new Query(Criteria.where("id").is(collectionId));
            Update update = new Update().set("cover", song.getCover());
            mongoTemplate.updateFirst(query, update, Collection.class);
        }
    }
}