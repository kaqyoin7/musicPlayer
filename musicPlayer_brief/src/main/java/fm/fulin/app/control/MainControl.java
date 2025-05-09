package fm.fulin.app.control;

import com.alibaba.fastjson.JSON;
import fm.fulin.model.*;
import fm.fulin.param.SongQueryParam;
import fm.fulin.service.*;
import fm.fulin.util.SubjectUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.ArrayList;
import java.util.List;

@Controller
public class MainControl {
    private static final Logger LOG = LoggerFactory.getLogger(MainControl.class);

    @Autowired
    private SubjectService subjectService;

    @Autowired
    private SingerService singerService;

    @Autowired
    private SongService songService;

    @Autowired
    private UserService userService;


@GetMapping(path = "/index")
public String index(Model model) {
        // 设置首屏歌曲数据
        setSongData(model);
        // 设置赫兹数据
        setMhzData(model);
        System.out.println("welcome!");
        return "index";
}

    @GetMapping(path = "/error")                        //404页面
    public String error(Model model) {
        return "error";
    }

    private void setSongData(Model model) {
        SongQueryParam songParam = new SongQueryParam();
        songParam.setPageNum(4);
        songParam.setPageSize(1);
        Page<Song> songs = songService.list(songParam);

        if (songs != null && !songs.isEmpty()) {
            Song resultSong = songs.getContent().get(0);
            model.addAttribute("song", resultSong);
            List<String> singerIds = resultSong.getSingerIds();

            List<Singer> singers = new ArrayList<>();
            if (singerIds != null && !singerIds.isEmpty()) {

                for (String singerId : singerIds) {
                    Singer singer = singerService.get(singerId);
                    singers.add(singer);
                }
            }

            model.addAttribute("singers", singers);
        }
    }
    //"选择艺术家"播放歌曲
    @GetMapping("/player_artist")
    public String player_artist(Model model){
        setSongData(model);
        // 设置赫兹数据
        setMhzData(model);
    return "player_artist";
    }
    private void setMhzData(Model model) {
        // 查询所有的mhz数据
        List<Subject> subjectDatas = subjectService.getSubjects(SubjectUtil.TYPE_MHZ);

        // 在内存中分类，避免查询四次。
        // 查询数据库由于有网络请求，效率比用程序分类低
        List<Subject> artistDatas = new ArrayList<>();
        List<Subject> moodDatas = new ArrayList<>();
        List<Subject> ageDatas = new ArrayList<>();
        List<Subject> styleDatas = new ArrayList<>();

        if (subjectDatas != null && !subjectDatas.isEmpty()) {

            for (Subject subject : subjectDatas) {
                if (SubjectUtil.TYPE_SUB_ARTIST.equals(subject.getSubjectSubType())) {
                    artistDatas.add(subject);
                } else if (SubjectUtil.TYPE_SUB_MOOD.equals(subject.getSubjectSubType())) {
                    moodDatas.add(subject);
                } else if (SubjectUtil.TYPE_SUB_AGE.equals(subject.getSubjectSubType())) {
                    ageDatas.add(subject);
                } else if (SubjectUtil.TYPE_SUB_STYLE.equals(subject.getSubjectSubType())) {
                    styleDatas.add(subject);
                } else {
                    // 防止数据错误
                    LOG.error("subject data error. unknown subtype. subject=" + JSON.toJSONString(subject));
                }
            }
        }

        // 按照页面视觉组织数据：艺术家mhz，由于是独立的区块，不放一起
        model.addAttribute("artistDatas", artistDatas);

        // 按照页面视觉组织数据：按顺序填入三个赫兹数据
        //依据兆赫类型不同分类(“心情/场景”、“语言/年代”等)，内容为主题二级分类对应内容，为一个Subject的集合
        List<MhzViewModel> mhzViewModels = new ArrayList<>();
        buildMhzViewModel(moodDatas, "心情 / 场景", mhzViewModels);
        buildMhzViewModel(ageDatas, "语言 / 年代", mhzViewModels);
        buildMhzViewModel(styleDatas, "风格 / 流派", mhzViewModels);
        //mhzViewModels为一个整体二级主题的抽象
        model.addAttribute("mhzViewModels", mhzViewModels);
    }

    private void buildMhzViewModel(List<Subject> subjects, String title, List<MhzViewModel> mhzViewModels) {
        MhzViewModel mhzVO = new MhzViewModel();
        mhzVO.setSubjects(subjects);
        mhzVO.setTitle(title);
        mhzViewModels.add(mhzVO);
    }
}
