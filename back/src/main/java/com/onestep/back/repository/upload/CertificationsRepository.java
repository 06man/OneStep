package com.onestep.back.repository.upload;


import com.onestep.back.domain.CertificationId;
import com.onestep.back.domain.Certifications;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CertificationsRepository extends JpaRepository<Certifications, CertificationId> {
    // 특정 목표에 속한 인증들을 날짜 내림차순으로 조회
    @EntityGraph(attributePaths = {"goal", "member"})
    @Query("select c from Certifications c " +
            "where c.goal.goalId = :goalId " +
            "order by c.certDate desc")
    List<Certifications> findByGoal_Id(@Param("goalId") Long goalId);

    // 특정 목표, 특정 회원, 특정 날짜의 인증 조회 (복합키 구성 요소)
    @EntityGraph(attributePaths = {"goal", "member"})
    @Query("select c from Certifications c " +
            "where c.goal.goalId = :goalId " +
            "and c.member.memberId = :memberId " +
            "and c.certDate = :certDate")
    Optional<Certifications> findByGoal_IdAndMember_IdAndCertDate(@Param("goalId") Long goalId,
                                                                  @Param("memberId") Long memberId,
                                                                  @Param("certDate") LocalDate certDate);
//    // 최신 인증 목록 조회
//    @Query("SELECT c FROM Certifications c WHERE c.goal.goalId = :goalId ORDER BY c.certDate DESC")
//    List<Certifications> findLatestCertifications(Long goalId);
//
//    // 오늘 날짜의 인증 조회
//    @Query("SELECT c FROM Certifications c WHERE c.goal.goalId = :goalId AND c.certDate = :today")
//    List<Certifications> findTodayCertifications(Long goalId, LocalDate today);
//
//    // 특정 사용자의 특정 목표에 대한 인증 목록 조회
//    List<Certifications> findByGoal_GoalIdAndMember_MemberId(Long goalId, Long memberId);


    // 최근 인증 기록 탑4 조회
    @Query("SELECT c FROM Certifications c WHERE c.goal.goalId = :goalId ORDER BY c.regDate DESC")
    List<Certifications> findRecentCertificationsByGoalId(@Param("goalId") Long goalId, Pageable pageable);

    // 내보내기, 그만두기 시 삭제할 인증 기록 조회
    List<Certifications> findByGoalGoalIdAndMemberMemberId(Long goalId, String memberId);
}