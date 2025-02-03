import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GoalCard from "./GoalCard";

const GoalList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [goals, setGoals] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [isFetching, setIsFetching] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef(null);
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;

    const navigate = useNavigate();

    // 📌 목표 목록 가져오기 (페이지네이션 적용)
    const fetchGoals = async (page = 0, reset = false) => {
        if (!hasMore && !reset) return;
        setIsFetching(true);

        try {
            const response = await axios.get(`${SERVER_URL}/goals/list`, {
                params: {
                    categoryId: selectedCategory || undefined,
                    title: searchTerm || undefined,
                    page: page,
                    size: 6,
                },
            });

            console.log("📌 서버 응답 데이터:", response.data);

            if (!response.data || response.data.length === 0) {
                setHasMore(false);
            } else {
                setHasMore(true);

                setGoals(prevGoals => {
                    const newGoals = response.data.filter(
                        newGoal => !prevGoals.some(existingGoal => existingGoal.goalId === newGoal.goalId)
                    );
                    return reset ? response.data : [...prevGoals, ...newGoals];
                });
            }
        } catch (error) {
            console.error("목표 리스트 불러오는 중 오류 발생:", error);
        } finally {
            setIsFetching(false);
        }
    };

    // 📌 검색 버튼 클릭 시 새로운 검색 적용
    const handleSearch = () => {
        setCurrentPage(0);
        setHasMore(true);
        setGoals([]);
        fetchGoals(0, true);
    };

    // 📌 무한 스크롤 감지
    useEffect(() => {
        if (isFetching || !hasMore) return;
        if (!observer.current) return;

        const observerCallback = (entries) => {
            if (entries[0].isIntersecting && !isFetching) {
                setCurrentPage(prevPage => prevPage + 1);
            }
        };

        const observerOptions = {
            root: null,
            rootMargin: "100px",
            threshold: 1.0,
        };

        const newObserver = new IntersectionObserver(observerCallback, observerOptions);
        newObserver.observe(observer.current);
        return () => newObserver.disconnect();
    }, [isFetching, hasMore]);

    // 📌 첫 로딩 시 데이터 가져오기
    useEffect(() => {
        fetchGoals();
    }, []);

    return (
        <div className="container mt-4">
            {/* 상단 제목과 목표 등록 버튼 */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>목표 목록</h1>
                <button className="btn btn-primary" onClick={() => navigate("goals/register")}>
                    목표 등록
                </button>
            </div>

            {/* 검색 기능 */}
            <div className="d-flex gap-2 mb-3">
                <input
                    type="text"
                    placeholder="검색어 입력"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control"
                />
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="form-select"
                >
                    <option value="">전체</option>
                    <option value="1">운동</option>
                    <option value="2">건강</option>
                    <option value="3">학습</option>
                    <option value="4">습관</option>
                    <option value="5">기타</option>
                </select>
                <button className="btn btn-secondary" onClick={handleSearch}>
                    검색
                </button>
            </div>

            {/* 목표 카드 리스트 */}
            <div className="row">
                {goals.length > 0 ? (
                    goals.map((goal, index) => (
                        <div className="col-md-4 mb-4" key={`${goal.goalId}-${index}`}>
                            <GoalCard goal={goal} />
                        </div>
                    ))
                ) : (
                    <p className="text-center">검색 결과가 없습니다.</p>
                )}
            </div>

            {/* 무한 스크롤 트리거 (마지막 요소) */}
            <div ref={observer} style={{ height: "10px", margin: "20px 0" }} />

            {/* 로딩 표시 */}
            {isFetching && <p className="text-center">⏳ 로딩 중...</p>}
        </div>
    );
};

export default GoalList;
