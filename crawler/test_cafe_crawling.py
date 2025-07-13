#!/usr/bin/env python3
"""
네이버 카페 크롤링 테스트 스크립트
"""

from enhanced_crawler import EnhancedNonhyeonCrawler
import json

def test_cafe_crawling():
    """인천 논현동 카페 크롤링 테스트"""
    print("=== 네이버 카페 크롤링 테스트 ===")
    
    # 크롤러 초기화
    crawler = EnhancedNonhyeonCrawler()
    
    try:
        # 웹드라이버 생성
        if not crawler.create_webdriver():
            print("❌ 웹드라이버 생성 실패")
            return
        
        # "인천 논현동" 카페 크롤링
        keyword = "인천 논현동"
        print(f"🔍 '{keyword}' 카페 크롤링 시작...")
        
        cafe_data = crawler.crawl_naver_cafe_search(keyword)
        
        print(f"\n✅ 수집된 카페 게시글: {len(cafe_data)}개")
        print("=" * 60)
        
        # 결과 출력
        for i, post in enumerate(cafe_data, 1):
            print(f"\n{i}. 제목: {post['title']}")
            print(f"   카페: {post['source']}")
            print(f"   작성자: {post['author']}")
            print(f"   작성일: {post['date']}")
            print(f"   URL: {post['url']}")
            print(f"   내용: {post['content'][:100]}...")
            print(f"   길이: {post['content_length']}자")
        
        # JSON 파일로 저장
        output_file = f"test_cafe_{keyword.replace(' ', '_')}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(cafe_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 결과가 '{output_file}' 파일로 저장되었습니다.")
        
        # 다른 키워드도 테스트
        test_keywords = ["논현동", "논현지구", "인천 남동구"]
        
        for test_keyword in test_keywords:
            print(f"\n🔍 '{test_keyword}' 카페 크롤링 테스트...")
            test_data = crawler.crawl_naver_cafe_search(test_keyword)
            print(f"   ✅ '{test_keyword}': {len(test_data)}개 수집")
            
            # 각 키워드별로 파일 저장
            test_output_file = f"test_cafe_{test_keyword.replace(' ', '_')}.json"
            with open(test_output_file, 'w', encoding='utf-8') as f:
                json.dump(test_data, f, ensure_ascii=False, indent=2)
            print(f"   💾 '{test_output_file}' 저장 완료")
        
    except Exception as e:
        print(f"❌ 오류 발생: {str(e)}")
    
    finally:
        # 웹드라이버 종료
        if crawler.driver:
            crawler.driver.quit()
            print("\n🔚 웹드라이버 종료 완료")

if __name__ == "__main__":
    test_cafe_crawling() 