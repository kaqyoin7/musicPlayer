package fm.fulin.service;

import fm.fulin.model.Collection;
import java.util.List;

public interface CollectionService {
    // 创建歌单
    Collection createCollection(Collection collection);
    
    // 更新歌单信息
    Collection updateCollection(Collection collection);
    
    // 删除歌单
    boolean deleteCollection(String id);
    
    // 获取歌单详情
    Collection getCollection(String id);
    
    // 获取所有歌单
    List<Collection> getAllCollections();
    
    // 根据名称搜索歌单
    List<Collection> searchCollections(String name);
    
    // 向歌单添加歌曲
    boolean addSongToCollection(String collectionId, String songId);
    
    // 从歌单移除歌曲
    boolean removeSongFromCollection(String collectionId, String songId);
    
    // 获取包含指定歌曲的歌单列表
    List<Collection> getCollectionsBySongId(String songId);
    
    // 更新歌单封面（使用最新加入的歌曲封面）
    void updateCollectionCover(String collectionId);
} 