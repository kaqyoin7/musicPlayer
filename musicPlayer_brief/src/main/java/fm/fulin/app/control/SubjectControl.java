package fm.fulin.app.control;

import fm.fulin.model.CollectionViewModel;
import fm.fulin.model.Singer;
import fm.fulin.model.Song;
import fm.fulin.model.Subject;
import fm.fulin.service.SingerService;
import fm.fulin.service.SongService;
import fm.fulin.service.SubjectService;
import fm.fulin.util.SubjectUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.ArrayList;
import java.util.List;

@Controller
public class SubjectControl {

    private static final Logger LOG = LoggerFactory.getLogger(SubjectControl.class);

    @Autowired
    private SubjectService subjectService;

    @Autowired
    private SingerService singerService;

    @Autowired
    private SongService songService;


    @GetMapping(path = "/collection")               //显示歌单
    public String collection(Model model) {
        List<Subject> subjects = subjectService.getSubjects(SubjectUtil.TYPE_COLLECTION);

        List<List<CollectionViewModel>> subjectColumns = new ArrayList<>();
        // 最大行数
        int lineCount = (subjects.size() % 5 == 0) ? subjects.size() / 5 : (subjects.size() / 5) + 1;
        // 列数，最多 5 列
        for (int i = 0; i < 5; i++) {
            // 每列的元素
            List<CollectionViewModel> column = new ArrayList<>();
            // 第一列的元素是 0 5 11
            // j 是行数
            for (int j = 0; j < lineCount; j++) {
                int itemIndex = i + j * 5;
                if (itemIndex < subjects.size()) {
                    Subject subject = subjects.get(itemIndex);
                    CollectionViewModel xvm = new CollectionViewModel();
                    xvm.setSubject(subject);

                    if (subject.getMaster() != null) {
                        Singer singer = singerService.get(subject.getMaster());
                        xvm.setSinger(singer);
                    }

                    if (subject.getSongIds() != null && !subject.getSongIds().isEmpty()) {
                        List<Song> songs = new ArrayList<>();
                        for (String songId : subject.getSongIds()) {
                            Song song = songService.get(songId);
                            songs.add(song);
                        }
                        xvm.setSongs(songs);
                    }
                    column.add(xvm);
                }
            }
            subjectColumns.add(column);
        }
        model.addAttribute("subjectColumns", subjectColumns);
        return "collection";
    }
}
