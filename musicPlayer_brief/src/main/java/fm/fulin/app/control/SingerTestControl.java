package fm.fulin.app.control;

import fm.fulin.model.Singer;
import fm.fulin.service.SingerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/test/singer")
public class SingerTestControl {

    private static final Logger LOG = LoggerFactory.getLogger(SingerTestControl.class);

    @Autowired
    private SingerService singerService;

    @GetMapping(path = "/add")
    public Singer testAddSinger() {
        Singer singer = new Singer();
        singer.setId("0");
        singer.setGmtModified(LocalDateTime.now());
        singer.setGmtCreated(LocalDateTime.now());
        singer.setAvatar("https://5b0988e595225.cdn.sohucs.com/images/20170724/ad28da0d658b43aba84ce91df9cacdad.jpeg");
        singer.setName("测试歌手");
        singer.setHomepage("https://www.baidu.com/");

        Singer addedSinger = singerService.addSinger(singer);

        return addedSinger;
    }

    @GetMapping(path = "/getAll")
    public List<Singer> testGetAll() {
        return singerService.getAll();
    }

    @GetMapping(path = "/getOne")
    public Singer testGetSinger() {
        return singerService.get("461344");
    }

    @GetMapping(path = "/get")
    public Singer getSingerById(String id) {
        LOG.info("Received request for singer ID: {}", id);

        if (id == null || id.trim().isEmpty()) {
            LOG.error("Invalid singer ID: null or empty");
            return null;
        }

        // 清理ID：只保留数字
        if (id.isEmpty()) {
            LOG.error("Invalid singer ID: no digits found in {}", id);
            return null;
        }

//        LOG.info("Looking up singer with cleaned ID: {}", cleanId);
        try {
            Singer singer = singerService.get(id);
            if (singer == null) {
                LOG.error("No singer found with ID: {}", id);
                return null;
            }
//            LOG.info("Found singer: {} with ID: {}", singer.getName(), cleanId);
            return singer;
        } catch (Exception e) {
            LOG.error("Error looking up singer with ID: " + id, e);
            return null;
        }
    }

    @GetMapping(path = "/modify")
    public boolean testModifySinger() {
        Singer singer = new Singer();
        singer.setId("0");
        singer.setName("测试歌手2");
        return singerService.modify(singer);
    }

    @GetMapping(path = "/del")
    public boolean testDelSinger() {
        return singerService.delete("0");
    }

}
