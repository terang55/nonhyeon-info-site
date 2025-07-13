"""
플랫폼별 키워드를 사용한 개선된 크롤러 실행 스크립트
"""

import sys
import os
from datetime import datetime
from enhanced_crawler import EnhancedNonhyeonCrawler
import config

def main():
    """플랫폼별 키워드 크롤링 실행"""
    print("=" * 60)
    print("🎯 논현동 정보 허브 - 플랫폼별 키워드 크롤러")
    print("=" * 60)
    print(f"시작 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # 키워드 정보 출력
    print("📋 플랫폼별 키워드 설정:")
    print(f"   📰 뉴스 키워드 ({len(config.SEARCH_KEYWORDS['news'])}개):")
    for keyword in config.SEARCH_KEYWORDS['news']:
        print(f"      - {keyword}")
    
    print(f"   📝 블로그 키워드 ({len(config.SEARCH_KEYWORDS['blog'])}개):")
    for keyword in config.SEARCH_KEYWORDS['blog']:
        print(f"      - {keyword}")
    
    print(f"   🎥 유튜브 키워드 ({len(config.SEARCH_KEYWORDS['youtube'])}개):")
    for keyword in config.SEARCH_KEYWORDS['youtube']:
        print(f"      - {keyword}")
    print()
    
    try:
        # 크롤러 인스턴스 생성
        crawler = EnhancedNonhyeonCrawler()
        
        # 플랫폼별 키워드 크롤링 실행
        success = crawler.run_enhanced_crawl_with_platform_keywords()
        
        if success:
            print("\n" + "=" * 60)
            print("🎉 플랫폼별 키워드 크롤링 성공적으로 완료!")
            print("=" * 60)
            print(f"완료 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            
            # 결과 파일 위치 안내
            print("\n📁 결과 파일 위치:")
            print(f"   - 데이터: {config.DATA_DIR}/enhanced_news/")
            print(f"   - 로그: {config.LOGS_DIR}/")
            print(f"   - 프론트엔드: ../frontend/public/data/enhanced_news/")
            
        else:
            print("\n" + "=" * 60)
            print("❌ 플랫폼별 키워드 크롤링 실패!")
            print("=" * 60)
            print("로그 파일을 확인하여 오류 원인을 파악하세요.")
            return False
            
    except Exception as e:
        print(f"\n❌ 크롤링 실행 중 오류 발생: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 