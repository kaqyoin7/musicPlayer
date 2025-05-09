package fm.fulin.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

// 播放记录日志
public class PlayerLog {
    private String songName;
    private String singerNames;
    private String coverUrl;
    private String audioUrl;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime playTime;

    public PlayerLog() {
        this.playTime = LocalDateTime.now();
    }

    public PlayerLog(String songName, String singerNames, String coverUrl, String audioUrl) {
        this.songName = songName;
        this.singerNames = singerNames;
        this.coverUrl = coverUrl;
        this.audioUrl = audioUrl;
        this.playTime = LocalDateTime.now();
    }

    public String getSongName() {
        return songName;
    }

    public void setSongName(String songName) {
        this.songName = songName;
    }

    public String getSingerNames() {
        return singerNames;
    }

    public void setSingerNames(String singerNames) {
        this.singerNames = singerNames;
    }

    public String getCoverUrl() {
        return coverUrl;
    }

    public void setCoverUrl(String coverUrl) {
        this.coverUrl = coverUrl;
    }

    public String getAudioUrl() {
        return audioUrl;
    }

    public void setAudioUrl(String audioUrl) {
        this.audioUrl = audioUrl;
    }

    public LocalDateTime getPlayTime() {
        return playTime;
    }

    public void setPlayTime(LocalDateTime playTime) {
        this.playTime = playTime;
    }

    @Override
    public String toString() {
        return String.format("[%s] 播放歌曲: %s | 歌手: %s | 封面: %s | 音源: %s",
                playTime, songName, singerNames, coverUrl, audioUrl);
    }
} 