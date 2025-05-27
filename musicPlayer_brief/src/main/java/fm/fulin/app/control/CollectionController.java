package fm.fulin.app.control;

import fm.fulin.model.Collection;
import fm.fulin.model.Song;
import fm.fulin.model.Singer;
import fm.fulin.service.CollectionService;
import fm.fulin.service.SongService;
import fm.fulin.service.SingerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/collection")
public class CollectionController {

    @Autowired
    private CollectionService collectionService;

    @Autowired
    private SongService songService;

    @Autowired
    private SingerService singerService;

    // 显示歌单列表页面
    @GetMapping
    public String listCollections(Model model) {
        List<Collection> collections = collectionService.getAllCollections();
        model.addAttribute("collections", collections);
        return "collection";
    }

    // 显示歌单详情页面
    @GetMapping("/{id}")
    public String getCollectionDetail(@PathVariable String id, Model model) {
        Collection collection = collectionService.getCollection(id);
        if (collection == null) {
            return "redirect:/collection";
        }
        
        List<Song> songs = collection.getSongIds().stream()
                .map(songId -> songService.get(songId))
                .filter(song -> song != null)
                .collect(Collectors.toList());

        // 获取所有歌手信息
        Map<String, Singer> singerMap = new HashMap<>();
        songs.forEach(song -> {
            if (song.getSingerIds() != null) {
                song.getSingerIds().forEach(singerId -> {
                    if (!singerMap.containsKey(singerId)) {
                        Singer singer = singerService.get(singerId);
                        if (singer != null) {
                            singerMap.put(singerId, singer);
                        }
                    }
                });
            }
        });

        // 设置歌单封面为最新加入歌曲的封面
        if (!songs.isEmpty()) {
            Song latestSong = songs.get(songs.size() - 1);
            if (latestSong.getCover() != null && !latestSong.getCover().isEmpty()) {
                collection.setCover(latestSong.getCover());
            }
        }
        
        model.addAttribute("collection", collection);
        model.addAttribute("songs", songs);
        model.addAttribute("singerMap", singerMap);
        return "collection/detail";
    }

    // 创建歌单
    @PostMapping("/create")
    @ResponseBody
    public Collection createCollection(@RequestBody Collection collection) {
        return collectionService.createCollection(collection);
    }

    // 更新歌单
    @PostMapping("/update")
    @ResponseBody
    public Collection updateCollection(@RequestBody Collection collection) {
        return collectionService.updateCollection(collection);
    }

    // 删除歌单
    @PostMapping("/delete/{id}")
    @ResponseBody
    public boolean deleteCollection(@PathVariable String id) {
        return collectionService.deleteCollection(id);
    }

    // 搜索歌单
    @GetMapping("/search")
    @ResponseBody
    public List<Collection> searchCollections(@RequestParam String name) {
        return collectionService.searchCollections(name);
    }

    // 添加歌曲到歌单
    @PostMapping("/{collectionId}/add-song/{songId}")
    @ResponseBody
    public boolean addSongToCollection(@PathVariable String collectionId, @PathVariable String songId) {
        boolean success = collectionService.addSongToCollection(collectionId, songId);
        if (success) {
            // 更新歌单封面为最新添加的歌曲封面
            Song song = songService.get(songId);
            if (song != null && song.getCover() != null && !song.getCover().isEmpty()) {
                Collection collection = collectionService.getCollection(collectionId);
                if (collection != null) {
                    collection.setCover(song.getCover());
                    collectionService.updateCollection(collection);
                }
            }
        }
        return success;
    }

    // 从歌单移除歌曲
    @PostMapping("/{collectionId}/remove-song/{songId}")
    @ResponseBody
    public boolean removeSongFromCollection(@PathVariable String collectionId, @PathVariable String songId) {
        boolean success = collectionService.removeSongFromCollection(collectionId, songId);
        if (success) {
            // 如果删除的是当前封面歌曲，更新歌单封面为最新歌曲的封面
            Collection collection = collectionService.getCollection(collectionId);
            if (collection != null) {
                List<String> songIds = collection.getSongIds();
                if (!songIds.isEmpty()) {
                    Song latestSong = songService.get(songIds.get(songIds.size() - 1));
                    if (latestSong != null && latestSong.getCover() != null && !latestSong.getCover().isEmpty()) {
                        collection.setCover(latestSong.getCover());
                        collectionService.updateCollection(collection);
                    }
                }
            }
        }
        return success;
    }
} 