@echo off
echo 🔥 논현동 정보 허브 - 크롤러 스케줄러 시작
echo ========================================

cd /d "%~dp0"

echo 필요한 패키지를 설치 중...
pip install -r requirements.txt

echo.
echo 스케줄러를 시작합니다...
python enhanced_scheduler.py --daemon

pause 