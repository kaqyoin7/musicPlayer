package fm.fulin.service;

import fm.fulin.model.PlayerLog;

public interface PlayerLogService {
    /**
     * 记录播放日志
     * @param log 播放日志信息
     */
    void logPlay(PlayerLog log);
} 