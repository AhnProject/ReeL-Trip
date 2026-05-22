package com.reeltrip.api.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Configuration
public class DataSourceConfig {

    @Value("${DATABASE_URL}")
    private String databaseUrl;

    @Bean
    @Primary
    public DataSource dataSource() throws URISyntaxException {
        URI uri = new URI(databaseUrl);

        String host = uri.getHost();
        int port = uri.getPort() > 0 ? uri.getPort() : 5432;
        String path = uri.getPath();

        // getRawUserInfo() 로 인코딩된 원본을 가져온 뒤 첫 ':' 기준으로만 분리
        // (비밀번호에 ':' 혹은 특수문자 포함 대응)
        String rawUserInfo = uri.getRawUserInfo();
        int colonIdx = rawUserInfo.indexOf(':');
        String username = URLDecoder.decode(rawUserInfo.substring(0, colonIdx), StandardCharsets.UTF_8);
        String password = URLDecoder.decode(rawUserInfo.substring(colonIdx + 1), StandardCharsets.UTF_8);

        String query = uri.getQuery();
        String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path
                + (query != null ? "?" + query : "?sslmode=require");

        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(jdbcUrl);
        ds.setUsername(username);
        ds.setPassword(password);
        ds.setDriverClassName("org.postgresql.Driver");
        return ds;
    }
}
