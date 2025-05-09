package fm.fulin.service.impl;

import com.mongodb.client.result.DeleteResult;
import com.mongodb.client.result.UpdateResult;
import fm.fulin.model.Singer;
import fm.fulin.service.SingerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SingerServiceImpl implements SingerService {

    private static final Logger LOG = LoggerFactory.getLogger(SingerServiceImpl.class);

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public Singer addSinger(Singer singer) {
        // 作为服务，要对入参进行判断，不能假设被调用时，传入的一定是真正的对象
        if (singer == null) {
            LOG.error("input singer data is null.");
            return null;
        }

        if (singer.getGmtCreated() == null) {
            singer.setGmtCreated(LocalDateTime.now());
        }
        if (singer.getGmtModified() == null) {
            singer.setGmtModified(LocalDateTime.now());
        }

        return mongoTemplate.insert(singer);
    }

    @Override
    public Singer get(String singerId) {
        // 输入的主键 id 必须有文本，不能为空或全空格
        if (!StringUtils.hasText(singerId)) {
            LOG.error("input singerId is blank.");
            return null;
        }

        try {
            LOG.info("Looking up singer with ID: {}", singerId);
            // 使用Query和Criteria来查询
//            int idInt = Integer.parseInt(singerId);  // 或 Long.parseLong()，视数据而定
//            String idString = singerId.replaceAll("[^0-9]", "");
            int idInt = Integer.parseInt(singerId);

            Query query = new Query(Criteria.where("id").is(idInt));

            Singer singer = mongoTemplate.findOne(query, Singer.class);
            if (singer == null) {
                LOG.warn("No singer found with ID: {}", singerId);
            } else {
                LOG.info("Found singer: {} with ID: {}", singer.getName(), singerId);
            }
            return singer;
        } catch (Exception e) {
            LOG.error("Error looking up singer with ID: " + singerId, e);
            return null;
        }
    }

    @Override
    public List<Singer> getAll() {
        List<Singer> singers = mongoTemplate.findAll(Singer.class);
        return singers;
    }

    @Override
    public boolean modify(Singer singer) {
        // 作为服务，要对入参进行判断，不能假设被调用时，入参一定正确
        if (singer == null || !StringUtils.hasText(singer.getId())) {
            LOG.error("input singer data is not correct.");
            return false;
        }

        // 主键不能修改，作为查询条件
        Query query = new Query(Criteria.where("id").is(singer.getId()));

        Update updateData = new Update();
        // 每次修改都更新 gmtModified 为当前时间
        updateData.set("gmtModified", LocalDateTime.now());
        // 值为 null 表示不修改。值为长度为 0 的字符串 "" 表示清空此字段
        if (singer.getName() != null) {
            updateData.set("name", singer.getName());
        }

        if (singer.getAvatar() != null) {
            updateData.set("avatar", singer.getAvatar());
        }

        if (singer.getHomepage() != null) {
            updateData.set("homepage", singer.getHomepage());
        }

        if (singer.getSimilarSingerIds() != null) {
            updateData.set("similarSingerIds", singer.getSimilarSingerIds());
        }

        // 把一条符合条件的记录，修改其字段
        UpdateResult result = mongoTemplate.updateFirst(query, updateData, Singer.class);
        return result != null && result.getModifiedCount() > 0;
    }

    @Override
    public boolean delete(String singerId) {
        // 输入的主键 id 必须有文本，不能为空或全空格
        if (!StringUtils.hasText(singerId)) {
            LOG.error("input singerId is blank.");
            return false;
        }

        Singer singer = new Singer();
        singer.setId(singerId);

        DeleteResult result = mongoTemplate.remove(singer);
        return result != null && result.getDeletedCount() > 0;
    }
}