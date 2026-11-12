package com.reeltrip.api.common.typehandler;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reeltrip.api.place.model.PlaceHours;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.List;

/**
 * places.hours_structured(JSONB) <-> List&lt;PlaceHours&gt; 매핑.
 * postgresql 드라이버가 runtime scope라 PGobject를 직접 참조할 수 없어,
 * Types.OTHER로 문자열을 넘기는 방식(JDBC 표준 범위에서의 JSONB 저장 기법)을 사용.
 */
@MappedTypes(List.class)
public class PlaceHoursListTypeHandler extends BaseTypeHandler<List<PlaceHours>> {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final TypeReference<List<PlaceHours>> TYPE = new TypeReference<>() {};

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, List<PlaceHours> parameter, JdbcType jdbcType) throws SQLException {
        try {
            ps.setObject(i, MAPPER.writeValueAsString(parameter), Types.OTHER);
        } catch (Exception e) {
            throw new SQLException("Failed to serialize PlaceHours list to JSON", e);
        }
    }

    @Override
    public List<PlaceHours> getNullableResult(ResultSet rs, String columnName) throws SQLException {
        return fromJson(rs.getString(columnName));
    }

    @Override
    public List<PlaceHours> getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        return fromJson(rs.getString(columnIndex));
    }

    @Override
    public List<PlaceHours> getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        return fromJson(cs.getString(columnIndex));
    }

    private List<PlaceHours> fromJson(String json) throws SQLException {
        if (json == null) return null;
        try {
            return MAPPER.readValue(json, TYPE);
        } catch (Exception e) {
            throw new SQLException("Failed to parse hours_structured JSON: " + json, e);
        }
    }
}
