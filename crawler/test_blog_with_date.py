#!/usr/bin/env python3
"""
날짜 정보 포함 네이버 블로그 크롤링 테스트
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from enhanced_crawler import EnhancedNonhyeonCrawler
import json

def test_blog_with_date():
    """블로그 날짜 정보 추출 기능 테스트"""
    print("=== 날짜 정보 포함 네이버 블로그 크롤링 테스트 ===")
    
    crawler = EnhancedNonhyeonCrawler()
    
    # 웹드라이버 생성
    if not crawler.create_webdriver():
        print("❌ 웹드라이버 생성 실패")
        return
    
    try:
        # 테스트 키워드
        test_keyword = "인천 논현동"
        print(f"\n🔍 테스트 키워드: {test_keyword}")
        
        # 네이버 블로그 크롤링
        blog_data = crawler.crawl_naver_blog_search(test_keyword)
        
        print(f"\n📊 수집 결과: {len(blog_data)}개 블로그")
        
        for i, blog in enumerate(blog_data, 1):
            print(f"\n📝 블로그 {i}:")
            print(f"   제목: {blog['title'][:60]}...")
            print(f"   블로그명: {blog['source']}")
            print(f"   날짜: {blog['date']}")
            print(f"   URL: {blog['url'][:50]}...")
            print(f"   내용: {blog['content'][:80]}...")
        
        # 결과를 JSON 파일로 저장
        with open("test_blog_with_date.json", "w", encoding="utf-8") as f:
            json.dump(blog_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ 테스트 완료! 결과가 test_blog_with_date.json에 저장되었습니다.")
        
    except Exception as e:
        print(f"❌ 테스트 중 오류 발생: {str(e)}")
        
    finally:
        try:
            crawler.driver.quit()
        except:
            pass

if __name__ == "__main__":
    test_blog_with_date() 