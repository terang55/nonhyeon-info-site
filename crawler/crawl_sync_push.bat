@echo off
chcp 65001 > nul
title 논현동 정보 허브 - 전체 크롤링+동기화+Git Push

echo.
echo ============================================================
echo 🚀 논현동 정보 허브 - 전체 크롤링 + 프론트 동기화 + Git Push
echo ============================================================
echo.

rem 1) 기존 크롤링 + 동기화 스크립트 실행
call "%~dp0crawl_and_sync.bat"
if %errorlevel% neq 0 (
    echo ❌ 크롤링/동기화 단계에서 오류가 발생하여 Git 작업을 중단합니다.
    pause
    exit /b 1
)

rem 2) Git 저장소 루트로 이동 (현재 파일 기준 상위 폴더)
cd /d "%~dp0.."

rem 3) Git 스테이징: 크롤링 데이터 및 동기화된 프론트엔드 데이터만 포함
git add data/enhanced_news/ frontend/public/data/enhanced_news/ frontend/public/data/enhanced_news/sync_summary.json

rem 4) 변경 사항이 없으면 종료
git diff --cached --quiet && (
    echo ⚠️  커밋할 변경 사항이 없습니다. 스크립트를 종료합니다.
    goto :end
)

rem 5) 커밋 메시지 생성 (날짜/시간 포함)
for /f "tokens=1-3 delims=-/. " %%a in ("%date%") do set YMD=%%a-%%b-%%c
set COMMIT_MSG=🗃️ 데이터 자동 동기화: %YMD% %time%

git commit -m "%COMMIT_MSG%"
if %errorlevel% neq 0 (
    echo ❌ git commit 실패.
    pause
    exit /b 1
)

echo 🔼 git push origin main ...
git push origin main
if %errorlevel% neq 0 (
    echo ❌ git push 실패.
    pause
    exit /b 1
)

:end
echo.
echo ✅ 전체 작업 완료! 변경 사항이 Github에 반영되었습니다.
echo 아무 키나 누르면 창을 닫습니다...
pause > nul 