 package fm.fulin.app.control;

import fm.fulin.model.PlayerLog;
import fm.fulin.service.PlayerLogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/player")
public class PlayerLogControl {
    private static final Logger LOG = LoggerFactory.getLogger(PlayerLogControl.class);

    @Autowired
    private PlayerLogService playerLogService;

    @PostMapping("/log")
    public void logPlay(@RequestBody PlayerLog log) {
        playerLogService.logPlay(log);
    }
}