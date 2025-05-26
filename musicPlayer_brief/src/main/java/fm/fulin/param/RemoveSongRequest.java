package fm.fulin.param;

/**
 * @Author kaqyoin
 * @Description
 * @Date 2025/5/26 22:01
 */
public class RemoveSongRequest {
    private String collectionId;
    private String songId;

    public String getCollectionId() {
        return collectionId;
    }

    public void setCollectionId(String collectionId) {
        this.collectionId = collectionId;
    }

    public String getSongId() {
        return songId;
    }

    public void setSongId(String songId) {
        this.songId = songId;
    }
}
