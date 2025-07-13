@echo off
chcp 65001 > nul
title 논현동 정보 허브 - 전체 크롤링 + 동기화

echo.
echo ============================================================
echo 🚀 논현동 정보 허브 - 전체 크롤링 + 프론트엔드 동기화
echo ============================================================
echo.

cd /d "%~dp0"

echo 📂 현재 디렉토리: %CD%
echo.

echo 🐍 Python 가상환경 활성화 중...
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    echo ✅ 가상환경 활성화 완료
) else (
    echo ⚠️ 가상환경이 없습니다. 시스템 Python을 사용합니다.
)
echo.

echo ⏰ 시작 시간: %date% %time%
echo.

echo ==================== 1단계: 전체 크롤링 ====================
echo 🎯 플랫폼별 키워드 크롤링 시작...
echo 📰 뉴스: 공식적이고 정확한 지명 위주
echo 📝 블로그: 생활 정보와 개인 경험 위주  
echo 🎥 유튜브: 영상 콘텐츠에 적합한 키워드
echo ☕ 카페: 지역 커뮤니티 정보 (현재 스킵)
echo.

python run_platform_keywords_crawler.py

if %errorlevel% neq 0 (
    echo ❌ 크롤링 중 오류가 발생했습니다.
    pause
    exit /b 1
)

echo.
echo ✅ 크롤링 완료!
echo.

echo ================= 2단계: 프론트엔드 동기화 =================
echo 🔄 프론트엔드 데이터 동기화를 시작합니다...
echo.

python sync_to_frontend.py --sync

if %errorlevel% neq 0 (
    echo ❌ 동기화 중 오류가 발생했습니다.
    pause
    exit /b 1
)

echo.
echo ====================== 작업 완료! ======================
echo ✅ 전체 크롤링 완료!
echo ✅ 프론트엔드 동기화 완료!
echo ⏰ 완료 시간: %date% %time%
echo.
echo 📊 결과 확인:
echo   - 크롤링 데이터: data/enhanced_news/ 폴더
echo   - 프론트엔드: frontend/public/data/ 폴더
echo.
echo 🌐 웹사이트에서 최신 데이터를 확인해보세요!
echo.
