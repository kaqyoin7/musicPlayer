# 添加 Java 11 镜像来源
FROM openjdk:8u362-b09

# springboot 端口
EXPOSE 8080

# 作者
MAINTAINER kls <kaqyoin@163.com>

# 添加 Spring Boot 包
ADD target/practice-0.0.1-SNAPSHOT.jar app.jar

# 执行启动命令
ENTRYPOINT ["java","-Duser.timezone=GMT+8","-Djava.security.egd=file:/dev/./urandom","-jar","/app.jar"]