package com.eventbooking.repository;

import com.eventbooking.entity.SearchHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {
    
    @Query("SELECT s.keyword FROM SearchHistory s WHERE s.createdAt >= :since GROUP BY s.keyword ORDER BY COUNT(s.id) DESC")
    List<String> findTopKeywordsSince(@Param("since") LocalDateTime since, Pageable pageable);
}
