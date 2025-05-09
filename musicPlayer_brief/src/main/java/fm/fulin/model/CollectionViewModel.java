package fm.fulin.model;

import java.util.List;

public class CollectionViewModel {
    //Ö÷Ìâ
    private Subject subject;
    //¸èÊÖ
    private Singer singer;
    //¸èÇú  
    private List<Song> songs;

    public Subject getSubject() {
        return subject;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }

    public Singer getSinger() {
        return singer;
    }

    public void setSinger(Singer singer) {
        this.singer = singer;
    }

    public List<Song> getSongs() {
        return songs;
    }

    public void setSongs(List<Song> songs) {
        this.songs = songs;
    }

}
