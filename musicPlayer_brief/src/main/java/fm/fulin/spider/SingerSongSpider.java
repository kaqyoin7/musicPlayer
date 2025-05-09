package fm.fulin.spider;

import com.alibaba.fastjson.JSON;
import fm.fulin.model.Singer;
import fm.fulin.model.Song;
import fm.fulin.service.SingerService;
import fm.fulin.service.SongService;
import fm.fulin.service.SubjectService;
import fm.fulin.util.HttpUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.annotation.PostConstruct;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class SingerSongSpider {
    private static Logger logger = LoggerFactory.getLogger(SingerSongSpider.class);

    private static final String SONG_URL = "https://fm.douban.com/j/v2/artist/{0}/";

    private static final String HOST = "fm.douban.com";

    @Autowired
    private HttpUtil httpUtil;

    @Autowired
    private SubjectService subjectService;

    @Autowired
    private SingerService singerService;

    @Autowired
    private SongService songService;

    @Autowired
    private SubjectSpider subjectSpider;

//    @PostConstruct
    public void init() {
        doExcute();
        logger.info("spider end ...");
    }

    public void doExcute() {
        getSongDataBySingers();
    }

    private void getSongDataBySingers() {
        List<Singer> singers = singerService.getAll();
        if (singers == null || singers.isEmpty()) {
            return;
        }

        // 遍历每个歌手
        for (Singer singer : singers) {
            String singerId = singer.getId();
            String url = MessageFormat.format(SONG_URL, singerId);

            // 替换为自己使用浏览器开发者工具观察到的值
            String cookie = null;
            Map<String, String> headerData = httpUtil.buildHeaderData(null, HOST, cookie);
            String content = httpUtil.getContent(url, headerData);

            if (!StringUtils.hasText(content)) {
                continue;
            }

            Map dataObj = null;

            try {
                dataObj = JSON.parseObject(content, Map.class);
            } catch (Exception e) {
                // 抛异常表示返回的内容不正确，不是正常的 json 格式，可能是网络或服务器出错了。
                logger.error("parse content to map error. ", e);
            }

            // 可能格式错误
            if (dataObj == null) {
                continue;
            }

            // 解析关联的歌手
            Map relatedChannelData = (Map)dataObj.get("related_channel");
            // 保存关联的歌手后，收集关联歌手的 id
            List<String> similarIds = getRelatedSingers(relatedChannelData);
            // 设置给主歌曲
            singer.setSimilarSingerIds(similarIds);

            // 解析歌手的歌曲
            Map songlistData = (Map)dataObj.get("songlist");

            if (songlistData == null || songlistData.isEmpty()) {
                continue;
            }

            List<Map> songsData = (List<Map>)songlistData.get("songs");

            if (songsData == null || songsData.isEmpty()) {
                continue;
            }

            for (Map songObj : songsData) {
                Song song = subjectSpider.buildSong(songObj);
                subjectSpider.saveSong(song);
            }

            // 保存主歌手数据，主要为了修改关联歌手 id 字段
            singerService.modify(singer);
        }
    }

    private List<String> getRelatedSingers(Map sourceData) {
        List<String> similarIds = new ArrayList<>();
        if (sourceData == null || sourceData.isEmpty()) {
            return similarIds;
        }

        List<Map> similarArtistsData = (List<Map>)sourceData.get("similar_artists");

        if (similarArtistsData == null || similarArtistsData.isEmpty()) {
            return similarIds;
        }

        for (Map sArtistObj : similarArtistsData) {
            Singer singer = subjectSpider.buildSinger(sArtistObj);
            subjectSpider.saveSinger(singer);
            similarIds.add(singer.getId());
        }

        return similarIds;
    }

}
