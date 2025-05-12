package fm.fulin.app.control;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URL;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * 图片请求代理，绕开防盗链
 */
@RestController
@RequestMapping("/api/image")
public class ImageProxyController {
    private static final Logger logger = LoggerFactory.getLogger(ImageProxyController.class);
    private final RestTemplate restTemplate;

    private static final Set<String> ALLOWED_DOMAINS = new HashSet<>(Arrays.asList(
        "img9.doubanio.com",
        "img1.doubanio.com",
        "img2.doubanio.com",
        "img3.doubanio.com"
    ));

    public ImageProxyController() {
        this.restTemplate = new RestTemplate();
    }

    @GetMapping("/proxy")
    public ResponseEntity<byte[]> proxyImage(@RequestParam String url) {
        try {
            logger.info("Received image proxy request for URL: {}", url);
            
            // 验证URL域名
            URL imageUrl = new URL(url);
            String host = imageUrl.getHost();
            if (!ALLOWED_DOMAINS.contains(host)) {
                logger.warn("Access denied for domain: {}", host);
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }

            // 设置请求头
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
            headers.set("Referer", "https://music.douban.com/");

            // 使用RestTemplate获取图片
            ResponseEntity<byte[]> response = restTemplate.getForEntity(url, byte[].class);
            
            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                logger.error("Failed to fetch image from source: {}", url);
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            // 设置响应头
            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.setContentType(response.getHeaders().getContentType());
            responseHeaders.setCacheControl("public, max-age=31536000"); // 缓存一年

            logger.info("Successfully proxied image from: {}", url);
            return new ResponseEntity<>(response.getBody(), responseHeaders, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error proxying image from {}: {}", url, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 