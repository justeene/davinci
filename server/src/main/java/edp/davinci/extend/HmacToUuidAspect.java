package edp.davinci.extend;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import edp.davinci.model.User;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.StringUtils;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

@Slf4j
@Aspect
@Component
public class HmacToUuidAspect {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    private static final Cache<String, String> dataCache = CacheBuilder.newBuilder()
            .expireAfterWrite(10, TimeUnit.MINUTES)
            .build();
    private String getHmac(String uuid) throws ExecutionException {
        return dataCache.get(uuid, () -> jdbcTemplate.queryForObject(String.format("select hmac from rel_hmac where oid='%s'",uuid),String.class));
    }
    @Around("execution(* edp.davinci.service.impl.DashboardServiceImpl.shareDashboard(..))")
    public Object genUuid(ProceedingJoinPoint point) throws Throwable {
        Long dashboardId= (Long) point.getArgs()[0];
        User user= (User) point.getArgs()[2];
        String uuid=null;
        try {
            uuid = jdbcTemplate.queryForObject(String.format("select oid from rel_hmac where username='%s' and dashboard_id=%s", user.getUsername(), dashboardId), String.class);
        }catch (EmptyResultDataAccessException e){}
        //如果该用户和dashboardId已经签发则不用重新生成
        if(StringUtils.isBlank(uuid)) {
            //将uuid和shareToken落表
            String shareToken = (String) point.proceed();
            uuid=generate32UUID();
            jdbcTemplate.execute(String.format("insert into rel_hmac(oid,hmac,username,dashboard_id) values('%s','%s','%s',%s)",uuid,shareToken,user.getUsername(),dashboardId));
        }
        return uuid;
    }

    @Around("execution(* edp.davinci.controller.DownloadController.getShareDownloadRecordPage(..))")
    public Object hmacToUuidDownloadPage(ProceedingJoinPoint point) throws Throwable {
        String token= (String) point.getArgs()[1];
        //如果token长度为32，则需要转换
        if(token.length()==32){
            point.getArgs()[1]=getHmac(token);
        }
        return point.proceed(point.getArgs());
    }
    @Around("execution(* edp.davinci.controller.DownloadController.getShareDownloadRecordFile(..))")
    public Object hmacToUuidDownloadFile(ProceedingJoinPoint point) throws Throwable {
        String token= (String) point.getArgs()[2];
        //如果token长度为32，则需要转换
        if(token.length()==32){
            point.getArgs()[2]=getHmac(token);
        }
        return point.proceed(point.getArgs());
    }


    @Around("execution(* edp.davinci.controller.ShareController.*(..))")
    public Object hmacToUuidShare(ProceedingJoinPoint point) throws Throwable {
        String token= (String) point.getArgs()[0];
        //如果token长度为32，则需要转换
        if(token.length()==32){
            point.getArgs()[0]=getHmac(token);
        }
        return point.proceed(point.getArgs());
    }


    public String generate32UUID() {
        return UUID.randomUUID().toString().replace("-", "");
    }
}
