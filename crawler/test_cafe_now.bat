@echo off
chcp 65001 > nul
echo ☕ 네이버 카페 크롤링 테스트 시작...
echo.

cd /d "%~dp0"

python test_cafe_crawling.py

echo.
echo ✅ 카페 크롤링 테스트 완료!
pause 