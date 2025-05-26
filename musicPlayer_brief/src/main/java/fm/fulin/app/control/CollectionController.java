package fm.fulin.app.control;

import fm.fulin.model.Collection;
import fm.fulin.model.Song;
import fm.fulin.service.CollectionService;
import fm.fulin.service.SongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/collection")
public class CollectionController {

    @Autowired
    private CollectionService collectionService;

    @Autowired
    private SongService songService;

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
        
        model.addAttribute("collection", collection);
        model.addAttribute("songs", songs);
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
        return collectionService.addSongToCollection(collectionId, songId);
    }

    // 从歌单移除歌曲
    @PostMapping("/{collectionId}/remove-song/{songId}")
    @ResponseBody
    public boolean removeSongFromCollection(@PathVariable String collectionId, @PathVariable String songId) {
        return collectionService.removeSongFromCollection(collectionId, songId);
    }
} 