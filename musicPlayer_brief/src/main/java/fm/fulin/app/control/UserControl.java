package fm.fulin.app.control;

import javax.annotation.PostConstruct;

import fm.fulin.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class UserControl {

  private static final Logger LOG = LoggerFactory.getLogger(UserControl.class);

  @Autowired
  private UserService userService;

  @PostConstruct
  public void init() {
//    LOG.info("UserControl 启动啦");
//    LOG.info("userService 注入啦");
  }

  @GetMapping(path = "/login")        //登陆页面——待修改
  public String loginPage(Model model) {

    return "login";
  }

  @GetMapping(path = "/sign")     //用户注册界面
  public String signPage(Model model) {
    return "sign";
  }

}
