package fm.fulin.app.control;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.ClientHttpRequest;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RequestCallback;
import org.springframework.web.client.ResponseExtractor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.FileCopyUtils;

import java.io.IOException;
import java.net.URL;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * 图片请求代理 + cdn缓存，加快请求速度
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
//            logger.info("Received image proxy request for URL: {}", url);
            
            // 验证URL域名
            URL imageUrl = new URL(url);
            String host = imageUrl.getHost();
            if (!ALLOWED_DOMAINS.contains(host)) {
                logger.warn("Access denied for domain: {}", host);
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }

            // 创建请求回调来设置请求头
            RequestCallback requestCallback = new RequestCallback() {
                @Override
                public void doWithRequest(ClientHttpRequest request) {
                    HttpHeaders headers = request.getHeaders();
                    headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
                    headers.set("Referer", "https://music.douban.com/");
                    headers.set("Accept", "image/webp,image/apng,image/*,*/*;q=0.8");
                    headers.set("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8");
                    headers.set("Cache-Control", "no-cache");
                    headers.set("Pragma", "no-cache");
                }
            };

            // 创建响应提取器
            ResponseExtractor<ResponseEntity<byte[]>> responseExtractor = (ClientHttpResponse response) -> {
                try {
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(response.getHeaders().getContentType());
                    headers.setCacheControl("public, max-age=31536000"); // 缓存一年
                    
                    byte[] body = FileCopyUtils.copyToByteArray(response.getBody());
                    return new ResponseEntity<>(body, headers, response.getStatusCode());
                } catch (IOException e) {
                    throw new RuntimeException("Error reading response body", e);
                }
            };

            // 执行请求
            ResponseEntity<byte[]> response = restTemplate.execute(
                url,
                org.springframework.http.HttpMethod.GET,
                requestCallback,
                responseExtractor
            );
            
            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                logger.error("Failed to fetch image from source: {}", url);
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            logger.info("Successfully proxied image from: {}", url);
            return response;
            
        } catch (Exception e) {
            logger.error("Error proxying image from {}: {}", url, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 