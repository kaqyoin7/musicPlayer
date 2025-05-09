package fm.fulin.service;

import fm.fulin.model.Song;
import fm.fulin.param.SongQueryParam;
import org.springframework.data.domain.Page;

public interface SongService {

    /**
     * 新增一首歌
     */
    Song add(Song song);

    /**
     * 根据 id 查询
     *
     * @param songId
     * @return
     */
    Song get(String songId);

    /**
     * 根据歌曲查询条件，查询一批歌曲
     */
    Page<Song> list(SongQueryParam songParam);

    /**
     * 修改一首歌
     */
    boolean modify(Song song);

    /**
     * 删除一首歌
     */
    boolean delete(String songId);

    /**
     * 获取随机歌曲
     * @return 随机的一首歌曲
     */
    Song getRandomSong();

}