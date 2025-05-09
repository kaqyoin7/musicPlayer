package fm.fulin.model;

import java.util.List;

//MhzViewModels为一个整体二级主题的抽象，属性：二级主题名字、二级主题所包含的主题内容——为Subject一个集合
public class MhzViewModel {
    private String title;
    private List<Subject> subjects;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<Subject> getSubjects() {
        return subjects;
    }

    public void setSubjects(List<Subject> subjects) {
        this.subjects = subjects;
    }
}
