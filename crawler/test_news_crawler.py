#!/usr/bin/env python3
"""
네이버 뉴스 크롤링 테스트 스크립트
"""

from enhanced_crawler import EnhancedNonhyeonCrawler
import json

def test_news_crawling():
    """인천 논현동 뉴스 크롤링 테스트"""
    print("=== 네이버 뉴스 크롤링 테스트 ===")
    
    # 크롤러 초기화
    crawler = EnhancedNonhyeonCrawler()
    
    try:
        # 웹드라이버 생성
        if not crawler.create_webdriver():
            print("❌ 웹드라이버 생성 실패")
            return
        
        # "인천 논현동" 뉴스 크롤링
        keyword = "인천 논현동"
        print(f"🔍 '{keyword}' 뉴스 크롤링 시작...")
        
        news_data = crawler.crawl_enhanced_naver_news(keyword)
        
        print(f"\n✅ 수집된 뉴스: {len(news_data)}개")
        print("=" * 60)
        
        # 결과 출력
        for i, news in enumerate(news_data, 1):
            print(f"\n{i}. 제목: {news['title']}")
            print(f"   언론사: {news['press']}")
            print(f"   URL: {news['url']}")
            print(f"   요약: {news['content'][:100]}...")
            print(f"   길이: {news['content_length']}자")
        
        # JSON 파일로 저장
        output_file = f"test_news_{keyword.replace(' ', '_')}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(news_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 결과가 '{output_file}' 파일로 저장되었습니다.")
        
    except Exception as e:
        print(f"❌ 오류 발생: {str(e)}")
    
    finally:
        # 웹드라이버 종료
        if crawler.driver:
            crawler.driver.quit()
            print("\n🔚 웹드라이버 종료 완료")

if __name__ == "__main__":
    test_news_crawling() 