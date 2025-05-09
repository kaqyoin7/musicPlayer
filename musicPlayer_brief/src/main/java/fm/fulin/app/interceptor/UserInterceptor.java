//package fm.fulin.app.interceptor;
//
//import javax.servlet.http.HttpServletRequest;
//import javax.servlet.http.HttpServletResponse;
//import javax.servlet.http.HttpSession;
//
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.web.servlet.HandlerInterceptor;
//
///**
// * 用户信息拦截器
// */
//public class UserInterceptor implements HandlerInterceptor {
//    private static final Logger LOGGER = LoggerFactory.getLogger(UserInterceptor.class);
//
//    // Controller方法执行之前
//    @Override
//    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
//      HttpSession session = request.getSession();
//      if (session.getAttribute("userLoginInfo") != null) {
//        return true;
//      }
//
//      // 不为登录态，跳转登录
//      String url = "/login";
//      response.sendRedirect(url);
//      return false;
//    }
//
//
//}
