"""
논현동 정보 허브 - 개선된 크롤러 스케줄러
enhanced_crawler.py를 정기적으로 실행하여 최신 정보를 수집
"""

import schedule
import time
import threading
import os
import sys
from datetime import datetime
from enhanced_crawler import EnhancedNonhyeonCrawler
from loguru import logger
import config

class EnhancedCrawlerScheduler:
    def __init__(self):
        """스케줄러 초기화"""
        self.running = False
        self.crawler = EnhancedNonhyeonCrawler()
        self.setup_schedules()
        self.setup_logging()
        
    def setup_logging(self):
        """로깅 설정"""
        log_file = f"{config.LOGS_DIR}/enhanced_scheduler_{datetime.now().strftime('%Y%m%d')}.log"
        os.makedirs(config.LOGS_DIR, exist_ok=True)
        
        logger.add(
            log_file,
            format=config.LOG_FORMAT,
            level=config.LOG_LEVEL,
            rotation="1 day",
            retention="30 days"
        )
        logger.info("개선된 크롤러 스케줄러 시작")
        
    def setup_schedules(self):
        """크롤링 스케줄 설정"""
        # 매일 오전 6시에 전체 크롤링 (뉴스 + 블로그 + 유튜브)
        schedule.every().day.at("06:00").do(self.run_full_enhanced_crawl)
        
        # 매일 오후 8시에 전체 크롤링
        schedule.every().day.at("20:00").do(self.run_full_enhanced_crawl)
        
        logger.info("개선된 크롤링 스케줄 설정 완료")
        logger.info("- 매일 06:00: 전체 개선된 크롤링")
        logger.info("- 매일 20:00: 전체 개선된 크롤링")

    def run_full_enhanced_crawl(self):
        """전체 개선된 크롤링 실행"""
        try:
            logger.info("🚀 스케줄된 전체 개선된 크롤링 시작")
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 🔥 전체 개선된 크롤링 시작...")
            
            success = self.crawler.run_enhanced_crawl(config.SEARCH_KEYWORDS)
            
            if success:
                logger.info("✅ 스케줄된 전체 개선된 크롤링 완료")
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ✅ 전체 크롤링 완료!")
                
                # 데이터 확인 실행
                self.run_data_check()
            else:
                logger.error("❌ 스케줄된 전체 개선된 크롤링 실패")
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ❌ 크롤링 실패")
                
        except Exception as e:
            logger.error(f"전체 개선된 크롤링 오류: {str(e)}")
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ❌ 크롤링 오류: {str(e)}")

    def run_news_only_crawl(self):
        """뉴스만 빠르게 크롤링"""
        try:
            logger.info("📰 스케줄된 뉴스 전용 크롤링 시작")
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 📰 뉴스 크롤링 시작...")
            
            # 주요 뉴스 키워드만 선별
            news_keywords = [
                "인천 논현동",
                "인천 논현지구", 
                "인천 남동구 논현동",
                "인천 논현동 맛집",
                "인천 논현동 부동산"
            ]
            
            success = self.crawler.run_enhanced_crawl(news_keywords)
            
            if success:
                logger.info("✅ 스케줄된 뉴스 전용 크롤링 완료")
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ✅ 뉴스 크롤링 완료!")
            else:
                logger.error("❌ 스케줄된 뉴스 전용 크롤링 실패")
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ❌ 뉴스 크롤링 실패")
                
        except Exception as e:
            logger.error(f"뉴스 전용 크롤링 오류: {str(e)}")
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ❌ 뉴스 크롤링 오류: {str(e)}")

    def run_weekly_full_crawl(self):
        """주간 대용량 크롤링"""
        try:
            logger.info("🗓️ 주간 대용량 크롤링 시작")
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 🗓️ 주간 대용량 크롤링 시작...")
            
            # 모든 가능한 키워드로 크롤링
            all_keywords = config.SEARCH_KEYWORDS + [
                "인천 논현동 육아",
                "인천 논현동 병원",
                "인천 논현동 학교",
                "인천 남동구 소식",
                "논현동 맛집 추천",
                "논현동 카페 추천"
            ]
            
            success = self.crawler.run_enhanced_crawl(all_keywords)
            
            if success:
                logger.info("✅ 주간 대용량 크롤링 완료")
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ✅ 주간 대용량 크롤링 완료!")
                
                # 데이터 분석 실행
                self.run_data_analysis()
            else:
                logger.error("❌ 주간 대용량 크롤링 실패")
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ❌ 주간 크롤링 실패")
                
        except Exception as e:
            logger.error(f"주간 대용량 크롤링 오류: {str(e)}")
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ❌ 주간 크롤링 오류: {str(e)}")

    def run_data_check(self):
        """데이터 확인 실행"""
        try:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 📊 데이터 확인 중...")
            os.system("python check_enhanced_data.py")
        except Exception as e:
            logger.warning(f"데이터 확인 오류: {str(e)}")

    def run_data_analysis(self):
        """데이터 분석 실행"""
        try:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 📈 데이터 분석 중...")
            os.system("python data_analyzer.py")
        except Exception as e:
            logger.warning(f"데이터 분석 오류: {str(e)}")

    def start_scheduler(self):
        """스케줄러 시작"""
        self.running = True
        logger.info("🕐 개선된 크롤러 스케줄러 시작")
        print("🕐 개선된 크롤러 스케줄러가 시작되었습니다.")
        print("=" * 60)
        
        # 다음 실행 시간 출력
        self.print_next_schedules()
        
        print("\n백그라운드에서 실행 중... 종료하려면 Ctrl+C를 누르세요.\n")
        
        while self.running:
            try:
                schedule.run_pending()
                time.sleep(60)  # 1분마다 스케줄 확인
                
            except KeyboardInterrupt:
                logger.info("사용자에 의해 스케줄러 중단")
                print("\n사용자에 의해 스케줄러가 중단되었습니다.")
                break
            except Exception as e:
                logger.error(f"스케줄러 오류: {str(e)}")
                print(f"스케줄러 오류: {str(e)}")
                time.sleep(60)

    def stop_scheduler(self):
        """스케줄러 중지"""
        self.running = False
        logger.info("스케줄러 중지 요청")

    def get_next_schedules(self):
        """다음 실행 시간들 조회"""
        jobs = schedule.get_jobs()
        next_runs = []
        
        for job in jobs:
            job_name = "전체 개선된 크롤링"
            
            next_runs.append({
                "job": job_name,
                "next_run": job.next_run.strftime("%Y-%m-%d %H:%M:%S") if job.next_run else "없음"
            })
        
        return next_runs

    def print_next_schedules(self):
        """다음 실행 시간들 출력"""
        print("📅 예정된 크롤링 일정:")
        for run_info in self.get_next_schedules():
            print(f"   • {run_info['job']}: {run_info['next_run']}")

def run_scheduler_daemon():
    """데몬 모드로 스케줄러 실행"""
    print("🔥 논현동 정보 허브 - 개선된 크롤러 스케줄러")
    print("=" * 60)
    
    scheduler = EnhancedCrawlerScheduler()
    
    try:
        scheduler.start_scheduler()
    except KeyboardInterrupt:
        print("\n스케줄러를 종료합니다.")
        scheduler.stop_scheduler()

def run_immediate_crawl():
    """즉시 크롤링 실행"""
    print("🚀 즉시 크롤링을 실행합니다...")
    scheduler = EnhancedCrawlerScheduler()
    scheduler.run_full_enhanced_crawl()

def main():
    """메인 실행 함수"""
    if len(sys.argv) > 1:
        if sys.argv[1] == "--now":
            run_immediate_crawl()
        elif sys.argv[1] == "--daemon":
            run_scheduler_daemon()
        else:
            print("사용법: python enhanced_scheduler.py [--now|--daemon]")
            print("  --now: 즉시 크롤링 실행")
            print("  --daemon: 스케줄러 데몬 모드로 실행")
    else:
        print("논현동 정보 허브 - 개선된 크롤러 스케줄러")
        print("=" * 50)
        print("1. 즉시 크롤링 실행")
        print("2. 스케줄러 시작")
        print("3. 종료")
        
        choice = input("선택하세요 (1-3): ").strip()
        
        if choice == "1":
            run_immediate_crawl()
        elif choice == "2":
            run_scheduler_daemon()
        elif choice == "3":
            print("종료합니다.")
        else:
            print("잘못된 선택입니다.")

if __name__ == "__main__":
    main() 