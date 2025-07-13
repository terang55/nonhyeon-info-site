"""
논현동 정보 데이터 분석기
수집된 뉴스, 카페 글 등의 데이터를 분석하고 인사이트를 제공
"""

import os
import json
import pandas as pd
from datetime import datetime, timedelta
from collections import Counter
import re
from loguru import logger
import config

class NonhyeonDataAnalyzer:
    def __init__(self):
        """분석기 초기화"""
        self.data_dir = config.DATA_DIR
        self.setup_logging()
        
    def setup_logging(self):
        """로깅 설정"""
        logger.add(
            f"{config.LOGS_DIR}/analyzer_{datetime.now().strftime('%Y%m%d')}.log",
            format=config.LOG_FORMAT,
            level=config.LOG_LEVEL,
            rotation="1 day"
        )
        
    def load_recent_data(self, data_type, days=7):
        """최근 N일간의 데이터 로드"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            all_data = []
            
            data_path = f"{self.data_dir}/{data_type}"
            if not os.path.exists(data_path):
                logger.warning(f"데이터 경로가 존재하지 않음: {data_path}")
                return []
            
            for file in os.listdir(data_path):
                if file.endswith('.json'):
                    file_path = os.path.join(data_path, file)
                    file_time = datetime.fromtimestamp(os.path.getctime(file_path))
                    
                    if file_time >= cutoff_date:
                        try:
                            with open(file_path, 'r', encoding='utf-8') as f:
                                data = json.load(f)
                                if isinstance(data, list):
                                    all_data.extend(data)
                                else:
                                    all_data.append(data)
                        except Exception as e:
                            logger.warning(f"파일 로드 실패: {file} - {str(e)}")
            
            logger.info(f"{data_type} 데이터 로드 완료: {len(all_data)}개 항목")
            return all_data
            
        except Exception as e:
            logger.error(f"데이터 로드 오류: {str(e)}")
            return []

    def analyze_news_trends(self, days=7):
        """뉴스 트렌드 분석"""
        try:
            logger.info(f"최근 {days}일간 뉴스 트렌드 분석 시작")
            
            news_data = self.load_recent_data("news", days)
            if not news_data:
                return {"error": "분석할 뉴스 데이터가 없습니다."}
            
            # 데이터프레임 생성
            df = pd.DataFrame(news_data)
            
            # 기본 통계
            total_articles = len(df)
            unique_sources = df['press'].nunique() if 'press' in df.columns else 0
            
            # 키워드별 기사 수
            keyword_counts = df['keyword'].value_counts().to_dict() if 'keyword' in df.columns else {}
            
            # 언론사별 기사 수
            press_counts = df['press'].value_counts().head(10).to_dict() if 'press' in df.columns else {}
            
            # 제목에서 주요 키워드 추출
            title_keywords = self.extract_keywords_from_titles(df['title'].tolist() if 'title' in df.columns else [])
            
            # 일별 기사 수 (만약 날짜 정보가 있다면)
            daily_counts = {}
            if 'crawled_at' in df.columns:
                df['date'] = pd.to_datetime(df['crawled_at']).dt.date
                daily_counts = df['date'].value_counts().sort_index().to_dict()
            
            analysis_result = {
                "period": f"최근 {days}일",
                "total_articles": total_articles,
                "unique_sources": unique_sources,
                "keyword_distribution": keyword_counts,
                "top_press": press_counts,
                "trending_keywords": title_keywords,
                "daily_articles": {str(k): v for k, v in daily_counts.items()},
                "analyzed_at": datetime.now().isoformat()
            }
            
            logger.info(f"뉴스 트렌드 분석 완료: {total_articles}개 기사 분석")
            return analysis_result
            
        except Exception as e:
            logger.error(f"뉴스 트렌드 분석 오류: {str(e)}")
            return {"error": f"분석 중 오류 발생: {str(e)}"}

    def analyze_cafe_trends(self, days=7):
        """카페 글 트렌드 분석"""
        try:
            logger.info(f"최근 {days}일간 카페 트렌드 분석 시작")
            
            cafe_data = self.load_recent_data("cafe", days)
            if not cafe_data:
                return {"error": "분석할 카페 데이터가 없습니다."}
            
            df = pd.DataFrame(cafe_data)
            
            # 기본 통계
            total_posts = len(df)
            unique_cafes = df['cafe_name'].nunique() if 'cafe_name' in df.columns else 0
            
            # 키워드별 글 수
            keyword_counts = df['keyword'].value_counts().to_dict() if 'keyword' in df.columns else {}
            
            # 카페별 글 수
            cafe_counts = df['cafe_name'].value_counts().head(10).to_dict() if 'cafe_name' in df.columns else {}
            
            # 제목에서 주요 키워드 추출
            title_keywords = self.extract_keywords_from_titles(df['title'].tolist() if 'title' in df.columns else [])
            
            # 내용에서 관심사 키워드 추출
            content_keywords = self.extract_content_keywords(df['content_preview'].tolist() if 'content_preview' in df.columns else [])
            
            analysis_result = {
                "period": f"최근 {days}일",
                "total_posts": total_posts,
                "unique_cafes": unique_cafes,
                "keyword_distribution": keyword_counts,
                "active_cafes": cafe_counts,
                "trending_keywords": title_keywords,
                "content_interests": content_keywords,
                "analyzed_at": datetime.now().isoformat()
            }
            
            logger.info(f"카페 트렌드 분석 완료: {total_posts}개 글 분석")
            return analysis_result
            
        except Exception as e:
            logger.error(f"카페 트렌드 분석 오류: {str(e)}")
            return {"error": f"분석 중 오류 발생: {str(e)}"}

    def extract_keywords_from_titles(self, titles):
        """제목에서 키워드 추출"""
        try:
            # 논현동 관련 키워드들
            interest_keywords = [
                "맛집", "카페", "육아", "어린이집", "유치원", "학원",
                "부동산", "아파트", "전세", "매매", "분양",
                "교통", "버스", "지하철", "주차",
                "병원", "약국", "마트", "편의점",
                "공원", "놀이터", "헬스장", "수영장",
                "이사", "입주", "신규", "오픈"
            ]
            
            keyword_counts = Counter()
            
            for title in titles:
                if title:
                    for keyword in interest_keywords:
                        if keyword in title:
                            keyword_counts[keyword] += 1
            
            return dict(keyword_counts.most_common(15))
            
        except Exception as e:
            logger.error(f"키워드 추출 오류: {str(e)}")
            return {}

    def extract_content_keywords(self, contents):
        """내용에서 관심사 키워드 추출"""
        try:
            # 육아, 생활 관련 키워드들
            lifestyle_keywords = [
                "육아", "아이", "아기", "어머님", "엄마", "아빠",
                "놀이", "수업", "체험", "프로그램", "이벤트",
                "할인", "세일", "추천", "후기", "리뷰",
                "맛있", "좋았", "괜찮", "만족", "추천",
                "가격", "비용", "무료", "저렴", "비싸"
            ]
            
            keyword_counts = Counter()
            
            for content in contents:
                if content:
                    for keyword in lifestyle_keywords:
                        if keyword in content:
                            keyword_counts[keyword] += 1
            
            return dict(keyword_counts.most_common(10))
            
        except Exception as e:
            logger.error(f"내용 키워드 추출 오류: {str(e)}")
            return {}

    def generate_summary_report(self, days=7):
        """종합 분석 리포트 생성"""
        try:
            logger.info(f"최근 {days}일간 종합 분석 리포트 생성 시작")
            
            # 뉴스와 카페 데이터 분석
            news_analysis = self.analyze_news_trends(days)
            cafe_analysis = self.analyze_cafe_trends(days)
            
            # 전체 데이터 요약
            total_items = 0
            if 'total_articles' in news_analysis:
                total_items += news_analysis['total_articles']
            if 'total_posts' in cafe_analysis:
                total_items += cafe_analysis['total_posts']
            
            # 핫 토픽 추출 (뉴스와 카페에서 공통으로 언급되는 키워드)
            hot_topics = self.find_common_keywords(news_analysis, cafe_analysis)
            
            report = {
                "summary": {
                    "period": f"최근 {days}일",
                    "total_data_points": total_items,
                    "generated_at": datetime.now().isoformat()
                },
                "news_analysis": news_analysis,
                "cafe_analysis": cafe_analysis,
                "hot_topics": hot_topics,
                "insights": self.generate_insights(news_analysis, cafe_analysis)
            }
            
            # 리포트 저장
            report_file = f"{self.data_dir}/analysis_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(report_file, 'w', encoding='utf-8') as f:
                json.dump(report, f, ensure_ascii=False, indent=2)
            
            logger.info(f"종합 분석 리포트 생성 완료: {report_file}")
            return report
            
        except Exception as e:
            logger.error(f"리포트 생성 오류: {str(e)}")
            return {"error": f"리포트 생성 중 오류 발생: {str(e)}"}

    def find_common_keywords(self, news_analysis, cafe_analysis):
        """뉴스와 카페에서 공통으로 언급되는 키워드 찾기"""
        try:
            news_keywords = set(news_analysis.get('trending_keywords', {}).keys())
            cafe_keywords = set(cafe_analysis.get('trending_keywords', {}).keys())
            
            common_keywords = news_keywords.intersection(cafe_keywords)
            
            hot_topics = {}
            for keyword in common_keywords:
                news_count = news_analysis.get('trending_keywords', {}).get(keyword, 0)
                cafe_count = cafe_analysis.get('trending_keywords', {}).get(keyword, 0)
                hot_topics[keyword] = {
                    "news_mentions": news_count,
                    "cafe_mentions": cafe_count,
                    "total_mentions": news_count + cafe_count
                }
            
            # 총 언급수로 정렬
            sorted_topics = dict(sorted(hot_topics.items(), 
                                     key=lambda x: x[1]['total_mentions'], 
                                     reverse=True))
            
            return sorted_topics
            
        except Exception as e:
            logger.error(f"공통 키워드 찾기 오류: {str(e)}")
            return {}

    def generate_insights(self, news_analysis, cafe_analysis):
        """분석 결과를 바탕으로 인사이트 생성"""
        insights = []
        
        try:
            # 뉴스 관련 인사이트
            if 'total_articles' in news_analysis:
                total_news = news_analysis['total_articles']
                if total_news > 0:
                    insights.append(f"📰 최근 논현동 관련 뉴스가 {total_news}건 보도되었습니다.")
                    
                    top_keyword = list(news_analysis.get('keyword_distribution', {}).keys())
                    if top_keyword:
                        insights.append(f"🔥 가장 많이 언급된 키워드는 '{top_keyword[0]}'입니다.")
            
            # 카페 관련 인사이트
            if 'total_posts' in cafe_analysis:
                total_posts = cafe_analysis['total_posts']
                if total_posts > 0:
                    insights.append(f"💬 최근 논현동 관련 카페 글이 {total_posts}건 작성되었습니다.")
                    
                    active_cafes = list(cafe_analysis.get('active_cafes', {}).keys())
                    if active_cafes:
                        insights.append(f"☕ 가장 활발한 카페는 '{active_cafes[0]}'입니다.")
            
            # 관심사 분석
            content_interests = cafe_analysis.get('content_interests', {})
            if content_interests:
                top_interest = list(content_interests.keys())[0]
                insights.append(f"🎯 주민들의 주요 관심사는 '{top_interest}' 관련 내용입니다.")
            
            return insights
            
        except Exception as e:
            logger.error(f"인사이트 생성 오류: {str(e)}")
            return ["분석 중 오류가 발생했습니다."]

def main():
    """메인 실행 함수"""
    analyzer = NonhyeonDataAnalyzer()
    
    print("📊 논현동 정보 데이터 분석기")
    print("=" * 50)
    
    while True:
        print("\n📋 분석 메뉴:")
        print("1. 뉴스 트렌드 분석 (최근 7일)")
        print("2. 카페 글 트렌드 분석 (최근 7일)")
        print("3. 종합 분석 리포트 생성")
        print("4. 사용자 정의 기간 분석")
        print("5. 종료")
        
        choice = input("\n선택하세요 (1-5): ").strip()
        
        if choice == "1":
            result = analyzer.analyze_news_trends()
            print("\n📰 뉴스 트렌드 분석 결과:")
            print(json.dumps(result, ensure_ascii=False, indent=2))
            
        elif choice == "2":
            result = analyzer.analyze_cafe_trends()
            print("\n☕ 카페 글 트렌드 분석 결과:")
            print(json.dumps(result, ensure_ascii=False, indent=2))
            
        elif choice == "3":
            result = analyzer.generate_summary_report()
            print("\n📊 종합 분석 리포트:")
            if 'insights' in result:
                print("\n💡 주요 인사이트:")
                for insight in result['insights']:
                    print(f"   {insight}")
            print(f"\n📄 상세 리포트가 저장되었습니다.")
            
        elif choice == "4":
            try:
                days = int(input("분석할 기간을 입력하세요 (일수): "))
                result = analyzer.generate_summary_report(days)
                print(f"\n📊 최근 {days}일간 분석 완료")
            except ValueError:
                print("❌ 유효한 숫자를 입력해주세요.")
                
        elif choice == "5":
            print("👋 분석기를 종료합니다.")
            break
            
        else:
            print("❌ 잘못된 선택입니다.")

if __name__ == "__main__":
    main() 