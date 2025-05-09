package fm.fulin.app.control;

import fm.fulin.model.SearchResult;
import fm.fulin.param.SearchRequest;
import fm.fulin.service.SearchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/search")
public class SearchController {
    private static final Logger LOG = LoggerFactory.getLogger(SearchController.class);

    @Autowired
    private SearchService searchService;

    @GetMapping("/page")
    public String searchPage(@RequestParam(required = false) String keyword, Model model) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            SearchRequest request = new SearchRequest();
            request.setKeyword(keyword.trim());
            request.setPage(1);
            request.setSize(10);
            SearchResult result = searchService.search(request);
            model.addAttribute("searchResult", result);
            model.addAttribute("keyword", keyword);
        }
        return "search";
    }

    @GetMapping("/api")
    @ResponseBody
    public SearchResult search(SearchRequest request) {
        LOG.info("search request: {}", request);
        return searchService.search(request);
    }

    @GetMapping("/detail")
    public String searchDetail(@RequestParam String keyword,
                             @RequestParam(required = false, defaultValue = "song") String type,
                             @RequestParam(required = false, defaultValue = "1") int page,
                             Model model) {
        LOG.info("search detail request - keyword: {}, type: {}, page: {}", keyword, type, page);
        
        SearchRequest request = new SearchRequest();
        request.setKeyword(keyword.trim());
        request.setPage(page);
        request.setSize(10);
        request.setType(type);
        
        SearchResult result = searchService.search(request);
        
        model.addAttribute("keyword", keyword);
        model.addAttribute("type", type);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", (int) Math.ceil((double) result.getTotal() / request.getSize()));
        
        if ("song".equals(type)) {
            model.addAttribute("songs", result.getSongs());
        } else {
            model.addAttribute("singers", result.getSingers());
        }
        
        return "search-detail";
    }
} 