package fm.fulin.service.impl;

import fm.fulin.model.PlayerLog;
import fm.fulin.service.PlayerLogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.format.DateTimeFormatter;

@Service
public class PlayerLogServiceImpl implements PlayerLogService {
    private static final Logger LOG = LoggerFactory.getLogger(PlayerLogServiceImpl.class);
    private static final String LOG_FILE = "player_log.txt";
    private static final Path LOG_PATH = Paths.get(LOG_FILE);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public void logPlay(PlayerLog log) {
        try {
            // 确保日志文件存在
            if (!Files.exists(LOG_PATH)) {
                Files.createFile(LOG_PATH);
            }

            // 确保时间已设置
            if (log.getPlayTime() == null) {
                log.setPlayTime(java.time.LocalDateTime.now());
            }

            // 追加写入日志
            String logEntry = String.format("[%s] 播放歌曲: %s | 歌手: %s | 封面: %s | 音源: %s\n",
                    log.getPlayTime().format(formatter),
                    log.getSongName(),
                    log.getSingerNames(),
                    log.getCoverUrl(),
                    log.getAudioUrl());
            
            Files.write(LOG_PATH, logEntry.getBytes(), StandardOpenOption.APPEND);
            
            LOG.info("Play log recorded: {}", log.getSongName());
        } catch (IOException e) {
            LOG.error("Failed to write play log", e);
        }
    }
} 