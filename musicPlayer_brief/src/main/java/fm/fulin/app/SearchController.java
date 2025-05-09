package fm.fulin.app;

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
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/search")
public class SearchController {
    private static final Logger LOG = LoggerFactory.getLogger(SearchController.class);

    @Autowired
    private SearchService searchService;

    @GetMapping("/page")
    public String searchPage() {
        return "search";
    }

    @GetMapping("/api")
    @ResponseBody
    public SearchResult search(SearchRequest request) {
        LOG.info("search request: {}", request);
        return searchService.search(request);
    }
} 