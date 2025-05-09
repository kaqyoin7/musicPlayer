package fm.fulin.app.control;

import fm.fulin.model.Singer;
import fm.fulin.model.User;
import fm.fulin.service.SingerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Controller
public class SingerControl {
    private static final Logger LOG = LoggerFactory.getLogger(SingerControl.class);

    @Autowired
    private SingerService singerService;

    @Value("${loginmock.userName}")
    private String nickName;

    @Value("${loginmock.password}")
    private String password;
    @PostMapping(path = "/user-guide")               //用户首次登录后挑选喜欢歌手页面
    public String myMhz(Model model, User user) {
        if (user.getName().equals(nickName)&&user.getPassword().equals(password)) {

            List<Singer> randomSingers = randomSingers();
            model.addAttribute("singers", randomSingers);

            return "userguide";
        }
        else {
            return "login";
        }
    }

    @GetMapping(path = "/singer/random")
    @ResponseBody
    public List<Singer> randomSingers() {               //获取随机歌手信息
        List<Singer> randomSingers = new ArrayList<>();
        List<Singer> singers = singerService.getAll();

        if (singers != null && singers.size() > 0) {
            Random random = new Random();
            for (int i = 0; i < 10; i++) {
                int n = random.nextInt(singers.size());
                randomSingers.add(singers.get(n));
            }
        }

        return randomSingers;
    }

}
