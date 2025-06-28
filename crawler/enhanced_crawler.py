"""
논현동 정보 허브 - 개선된 크롤러
실제 뉴스 기사로 이동해서 고품질 데이터를 수집하는 크롤러
"""

import os
import json
import time
import requests
import urllib.parse
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from loguru import logger
import config
import difflib
import re

class EnhancedNonhyeonCrawler:
    def __init__(self):
        """개선된 크롤러 초기화"""
        self.setup_logging()
        self.driver = None
        self.data_dir = self.ensure_data_directory()
        
    def setup_logging(self):
        """로깅 설정"""
        log_file = f"{config.LOGS_DIR}/enhanced_crawler_{datetime.now().strftime('%Y%m%d')}.log"
        os.makedirs(config.LOGS_DIR, exist_ok=True)
        
        logger.add(
            log_file,
            format=config.LOG_FORMAT,
            level=config.LOG_LEVEL,
            rotation="1 day",
            retention="30 days"
        )
        logger.info("개선된 논현동 크롤러 시작")

    def ensure_data_directory(self):
        """데이터 저장 디렉토리 확인 및 생성"""
        os.makedirs(config.DATA_DIR, exist_ok=True)
        os.makedirs(f"{config.DATA_DIR}/enhanced_news", exist_ok=True)
        return config.DATA_DIR

    def create_webdriver(self):
        """안전한 웹드라이버 생성"""
        try:
            options = webdriver.ChromeOptions()
            for option in config.CHROME_OPTIONS:
                options.add_argument(option)
            
            # 개인정보 보호 설정
            prefs = {
                "profile.default_content_setting_values": {
                    "notifications": 2,
                    "media_stream": 2,
                }
            }
            options.add_experimental_option("prefs", prefs)
            
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=options)
            self.driver.set_page_load_timeout(30)
            logger.info("웹드라이버 생성 완료")
            return True
            
        except Exception as e:
            logger.error(f"웹드라이버 생성 실패: {str(e)}")
            return False

    def extract_article_content(self, url):
        """실제 뉴스 기사 URL에서 상세 내용 추출 - 현재 사용하지 않음"""
        # 네이버 뉴스 검색 페이지에서 바로 요약을 사용하므로 이 메서드는 비활성화
        return ""

    def crawl_enhanced_naver_news(self, keyword):
        """개선된 네이버 뉴스 크롤링 - 네이버 뉴스 본 페이지에서 직접 수집"""
        try:
            logger.info(f"네이버 뉴스 본 페이지에서 직접 크롤링 시작: {keyword}")
            
            news_data = []
            
            # 네이버 뉴스 검색으로만 수집
            search_news = self._crawl_naver_news_search(keyword)
            news_data.extend(search_news)
            
            # 중복 제거 및 최종 정리
            unique_news = []
            seen_urls = set()
            
            for article in news_data:
                if article['url'] not in seen_urls:
                    unique_news.append(article)
                    seen_urls.add(article['url'])
            
            news_data = unique_news[:5]  # 최대 5개 뉴스만 유지
            
            logger.info(f"네이버 뉴스 직접 수집 완료: {len(news_data)}개 기사")
            return news_data
            
        except Exception as e:
            logger.error(f"네이버 뉴스 직접 크롤링 오류: {str(e)}")
            return []

    def _crawl_naver_news_search(self, keyword):
        """네이버 뉴스 검색 크롤링 - 실제 구조에 맞게 개선"""
        try:
            logger.debug(f"네이버 뉴스 검색으로 '{keyword}' 수집 중...")
            
            # 네이버 뉴스 검색 (관련도순, 1주일) - URL 인코딩 추가
            encoded_keyword = urllib.parse.quote(keyword)
            search_url = f"https://search.naver.com/search.naver?ssc=tab.news.all&query={encoded_keyword}&sm=tab_opt&sort=0&photo=0&field=0&pd=1&ds=&de=&docid=&related=0&mynews=0&office_type=0&office_section_code=0&news_office_checked=&nso=so%3Ar%2Cp%3A1w&is_sug_officeid=0&office_category=0&service_area=0"
            
            logger.debug(f"검색 URL: {search_url}")
            self.driver.get(search_url)
            time.sleep(config.DELAY_BETWEEN_REQUESTS)
            
            news_data = []
            
            # 네이버 뉴스 검색 결과 컨테이너 - 사용자 제공 구조에 맞게 수정
            news_containers = self.driver.find_elements(By.CSS_SELECTOR, "div.sds-comps-vertical-layout.sds-comps-full-layout.I6obO60yNcW8I32mDzvQ")
            
            logger.debug(f"네이버 뉴스 컨테이너 발견: {len(news_containers)}개")
            
            # 상위 5개만 선택
            for idx, container in enumerate(news_containers[:5]):
                try:
                    # 제목 링크 추출 - 사용자 제공 구조에 맞게 개선
                    title_link_element = container.find_element(By.CSS_SELECTOR, "a.rzROnhjF0RNNRoyDaO81.W035WwZVZIWyuG66e5iI")
                    title_span = title_link_element.find_element(By.CSS_SELECTOR, "span.sds-comps-text.sds-comps-text-ellipsis.sds-comps-text-ellipsis-1.sds-comps-text-type-headline1")
                    
                    # 제목 텍스트 추출 (mark 태그 제거)
                    title_html = title_span.get_attribute('innerHTML')
                    title = BeautifulSoup(title_html, 'html.parser').get_text(strip=True)
                    
                    # URL 추출
                    link = title_link_element.get_attribute("href")
                    
                    if not title or not link:
                        logger.debug(f"뉴스 {idx+1}: 제목 또는 링크 없음")
                        continue
                    
                    # 유효한 뉴스 URL인지 확인
                    if not self._is_valid_news_url_enhanced(link):
                        logger.debug(f"유효하지 않은 뉴스 URL: {link}")
                        continue
                    
                    # 광고성 콘텐츠 필터링
                    if self._is_ad_content(title):
                        logger.debug(f"광고성 콘텐츠 제외: {title[:30]}...")
                        continue
                    
                    # 요약문 추출 - 사용자 제공 구조에 맞게 개선
                    summary = ""
                    try:
                        summary_link_element = container.find_element(By.CSS_SELECTOR, "a.rzROnhjF0RNNRoyDaO81.ti6bfMWvbomDA5J1fNOX")
                        summary_span = summary_link_element.find_element(By.CSS_SELECTOR, "span.sds-comps-text.sds-comps-text-ellipsis.sds-comps-text-ellipsis-3.sds-comps-text-type-body1")
                        
                        # 요약문 텍스트 추출 (mark 태그 제거)
                        summary_html = summary_span.get_attribute('innerHTML')
                        summary = BeautifulSoup(summary_html, 'html.parser').get_text(strip=True)
                        
                        # 요약문이 너무 긴 경우 첫 200자로 제한
                        if len(summary) > 200:
                            summary = summary[:200] + "..."
                            
                    except NoSuchElementException:
                        logger.debug(f"뉴스 {idx+1}: 요약문 없음")
                        summary = ""
                    
                    # 날짜 정보 추출 - 새로운 기능 추가
                    date_info = ""
                    try:
                        # 프로필 정보 영역에서 날짜 정보 찾기 (더 구체적인 위치)
                        date_element = container.find_element(By.CSS_SELECTOR, ".sds-comps-profile-info-subtext span.sds-comps-text.sds-comps-text-type-body2.sds-comps-text-weight-sm")
                        date_text = date_element.text.strip()
                        
                        # "4일 전", "1시간 전" 등의 상대 시간을 실제 날짜로 변환
                        if "일 전" in date_text:
                            days_ago = int(date_text.replace("일 전", "").strip())
                            target_date = datetime.now() - timedelta(days=days_ago)
                            date_info = target_date.strftime("%Y-%m-%d")
                        elif "시간 전" in date_text:
                            hours_ago = int(date_text.replace("시간 전", "").strip())
                            target_date = datetime.now() - timedelta(hours=hours_ago)
                            date_info = target_date.strftime("%Y-%m-%d")
                        elif "분 전" in date_text:
                            # 분 전은 오늘 날짜로 처리
                            date_info = datetime.now().strftime("%Y-%m-%d")
                        else:
                            # 다른 형식의 날짜는 원본 텍스트 사용
                            date_info = date_text
                            
                    except NoSuchElementException:
                        logger.debug(f"뉴스 {idx+1}: 날짜 정보 없음")
                        date_info = datetime.now().strftime("%Y-%m-%d")
                    except Exception as e:
                        logger.debug(f"뉴스 {idx+1}: 날짜 처리 오류 - {str(e)}")
                        date_info = datetime.now().strftime("%Y-%m-%d")
                    
                    # 언론사 정보 추출 시도
                    press = ""
                    try:
                        # 먼저 HTML에서 언론사 정보 직접 추출 시도
                        try:
                            press_element = container.find_element(By.CSS_SELECTOR, "a.rzROnhjF0RNNRoyDaO81.iIKbAB3hQq_YoGhlYc24 span")
                            press = press_element.text.strip()
                        except NoSuchElementException:
                            pass
                        
                        # 언론사 정보가 없으면 URL에서 도메인 추출
                        if not press:
                            from urllib.parse import urlparse
                            parsed_url = urlparse(link)
                            domain = parsed_url.netloc
                            
                            # 주요 언론사 도메인 매핑 - 인천 지역 언론사 포함 확장
                            press_mapping = {
                                'sedaily.com': '서울경제',
                                'kyeongin.com': '경인일보',
                                'asiatime.co.kr': '아시아타임',
                                'm-i.kr': '매일일보',
                                'incheonilbo.com': '인천일보',
                                'incheonnews.com': '인천뉴스',
                                'incheonin.com': '인천인',
                                'joongdo.co.kr': '중도일보',
                                'newsis.com': '뉴시스',
                                'yonhapnews.co.kr': '연합뉴스',
                                'joongang.co.kr': '중앙일보',
                                'donga.com': '동아일보',
                                'chosun.com': '조선일보',
                                'hani.co.kr': '한겨레',
                                'khan.co.kr': '경향신문',
                                'mt.co.kr': '머니투데이',
                                'etnews.com': '전자신문',
                                'news1.kr': '뉴스1',
                                'nocutnews.co.kr': '노컷뉴스',
                                'ohmynews.com': '오마이뉴스',
                                'breaknews.com': '브레이크뉴스'
                            }
                            
                            for domain_key, press_name in press_mapping.items():
                                if domain_key in domain:
                                    press = press_name
                                    break
                                    
                            if not press:
                                press = domain
                            
                    except Exception:
                        press = ""
                    
                    # 뉴스 데이터 구성
                    news_data.append({
                        "title": title,
                        "url": link,
                        "content": summary,
                        "summary": summary,
                        "press": press,
                        "date": date_info,  # 실제 추출된 날짜 정보 사용 (YYYY-MM-DD 형식)
                        "crawled_at": datetime.now().strftime("%Y-%m-%d"),  # 시간 제거하고 날짜만
                        "content_length": len(summary),
                        "keyword": keyword,
                        "section": "검색 결과",
                        "type": "news"
                    })
                    
                    logger.debug(f"뉴스 {idx+1} 수집 성공: {title[:30]}... ({press})")
                    
                except Exception as e:
                    logger.debug(f"뉴스 아이템 {idx+1} 처리 중 오류: {str(e)}")
                    continue
            
            logger.info(f"네이버 뉴스 검색으로 {len(news_data)}개 수집 완료")
            return news_data
            
        except Exception as e:
            logger.warning(f"네이버 뉴스 검색 중 오류: {str(e)}")
            return []

    def _is_valid_news_url_enhanced(self, url):
        """강화된 뉴스 URL 유효성 검사 - 더 포용적으로 수정"""
        if not url:
            return False
        
        # 제외할 패턴만 확인 (광고, 프로모션 등)
        invalid_patterns = [
            "static/channelPromotion",
            "mkt.naver.com",
            "promotion",
            "ad.naver.com",
            "shopping.naver.com",
            "channelPromotion.html",
            "atrb?channel_id"
        ]
        
        # 기본적으로 http/https로 시작하는 URL이고 제외 패턴이 없으면 유효
        has_invalid_pattern = any(pattern in url for pattern in invalid_patterns)
        is_web_url = url.startswith(('http://', 'https://'))
        
        return is_web_url and not has_invalid_pattern

    def _is_ad_content(self, title):
        """광고성 콘텐츠 판별"""
        ad_keywords = [
            "언론사 선정",
            "언론사가 선정한",
            "네이버 메인에서", 
            "구독하세요",
            "클립 크리에이터",
            "피드형 콘텐츠",
            "창작자도 지원",
            "Ready, Set, Clip",
            "주요기사 혹은 심층기획"
        ]
        
        return any(keyword in title for keyword in ad_keywords)

    def crawl_naver_blog_search(self, keyword):
        """네이버 블로그 검색 결과 크롤링 - 관련도순, 최신 7일"""
        try:
            logger.info(f"네이버 블로그 크롤링 시작 (최신7일, 관련도순): {keyword}")
            
            blog_data = []
            # 관련도순, 최신 1주일 필터 - 사용자 제공 URL 구조 사용
            encoded_keyword = urllib.parse.quote(keyword)
            search_url = f"https://search.naver.com/search.naver?ssc=tab.blog.all&sm=tab_jum&query={encoded_keyword}&nso=so%3Ar%2Cp%3A1w"
            
            self.driver.get(search_url)
            time.sleep(config.DELAY_BETWEEN_REQUESTS)
            
            # 블로그 포스트 요소들 찾기 - 사용자 제공 구조에 맞게 수정  
            blog_containers = self.driver.find_elements(By.CSS_SELECTOR, "div.view_wrap")
            
            logger.info(f"발견된 블로그 컨테이너 수: {len(blog_containers)}")
            
            for idx, container in enumerate(blog_containers[:5]):  # 최신 5개만
                try:
                    # 제목과 링크 추출 - 사용자 제공 구조에 맞게 수정
                    title_element = container.find_element(By.CSS_SELECTOR, ".detail_box .title_area a.title_link")
                    title = title_element.text.strip()
                    # mark 태그 제거
                    title = BeautifulSoup(title_element.get_attribute('innerHTML'), 'html.parser').get_text(strip=True)
                    link = title_element.get_attribute("href")
                    
                    # 내용 추출
                    try:
                        content_element = container.find_element(By.CSS_SELECTOR, ".detail_box .dsc_area a.dsc_link")
                        content_html = content_element.get_attribute('innerHTML')
                        # mark 태그 제거
                        content = BeautifulSoup(content_html, 'html.parser').get_text(strip=True)
                    except:
                        content = ""
                    
                    # 블로그명 추출 - 사용자 제공 구조에서 추출
                    try:
                        blog_name_element = container.find_element(By.CSS_SELECTOR, ".user_box_inner .user_info a.name")
                        source = blog_name_element.text.strip()
                    except:
                        source = "네이버 블로그"
                    
                    # 날짜 정보 추출 - 새로운 기능 추가
                    date_info = ""
                    try:
                        date_element = container.find_element(By.CSS_SELECTOR, ".user_box_inner .user_info span.sub")
                        date_text = date_element.text.strip()
                        
                        # "X일 전" 형식을 실제 날짜로 변환
                        if "일 전" in date_text:
                            days_ago = int(date_text.replace("일 전", "").strip())
                            actual_date = datetime.now() - timedelta(days=days_ago)
                            date_info = actual_date.strftime("%Y-%m-%d")
                        elif "시간 전" in date_text:
                            # 시간 전인 경우 오늘 날짜
                            date_info = datetime.now().strftime("%Y-%m-%d")
                        else:
                            # 기타 경우 오늘 날짜로 설정
                            date_info = datetime.now().strftime("%Y-%m-%d")
                    except Exception as date_error:
                        logger.debug(f"블로그 날짜 추출 실패: {str(date_error)}")
                        date_info = datetime.now().strftime("%Y-%m-%d")
                    
                    if not title or len(title) < 5:
                        continue
                    
                    # 광고성 콘텐츠 강화 필터링
                    ad_keywords = [
                        "언론사 선정",
                        "클립 크리에이터",
                        "피드형 콘텐츠", 
                        "창작자도 지원",
                        "네이버 클립",
                        "Ready, Set, Clip",
                        "신청 기간",
                        "크리에이터라면"
                    ]
                    
                    if any(ad_word in title for ad_word in ad_keywords):
                        logger.debug(f"광고성 블로그 제외: {title[:50]}...")
                        continue
                        
                    # URL 패턴 필터링 강화
                    excluded_urls = [
                        "mkt.naver.com",
                        "news.naver.com/main/static/",
                        "channelPromotion.html",
                        "atrb?channel_id"
                    ]
                    
                    if any(excluded_url in link for excluded_url in excluded_urls):
                        logger.debug(f"광고 URL 제외: {link}")
                        continue
                        
                    # 제목 길이 체크
                    if len(title) < 8:
                        logger.debug(f"블로그 제목 너무 짧음: {title}")
                        continue
                    
                    blog_post = {
                        "title": title,
                        "content": content,
                        "date": date_info,  # 실제 날짜 정보 사용
                        "url": link,
                        "source": source,
                        "type": "blog",
                        "keyword": keyword,
                        "search_rank": idx + 1,
                        "crawled_at": datetime.now().strftime("%Y-%m-%d"),  # 시간 제거하고 날짜만
                        "press": source,  # 통일성을 위해 press 필드도 추가
                        "summary": content
                    }
                    
                    blog_data.append(blog_post)
                    logger.debug(f"블로그 수집: {title[:50]}...")
                    
                except Exception as e:
                    logger.warning(f"블로그 아이템 처리 중 오류: {str(e)}")
                    continue
            
            logger.info(f"네이버 블로그 수집 완료: {len(blog_data)}개 포스트")
            return blog_data
            
        except Exception as e:
            logger.error(f"네이버 블로그 크롤링 오류: {str(e)}")
            return []

    def crawl_youtube_search(self, keyword):
        """유튜브 검색 결과 크롤링 - 관련도순, 이번주 업로드"""
        try:
            logger.info(f"유튜브 크롤링 시작 (이번주, 관련도순): {keyword}")
            
            youtube_data = []
            # 유튜브 검색 URL - 관련도순, 이번주 업로드 (sp=EgIIAw%3D%3D)
            # URL 인코딩: 인천논현 검색, 이번주 필터 적용
            encoded_keyword = urllib.parse.quote(keyword)
            search_url = f"https://www.youtube.com/results?search_query={encoded_keyword}&sp=EgIIAw%3D%3D"
            
            logger.debug(f"유튜브 검색 URL: {search_url}")
            
            self.driver.get(search_url)
            time.sleep(3)  # 유튜브는 로딩이 좀 더 필요
            
            # 동의 버튼 클릭 (처음 방문시)
            try:
                accept_button = self.driver.find_element(By.CSS_SELECTOR, "button[aria-label*='모두 수락'], button[aria-label*='Accept all']")
                accept_button.click()
                time.sleep(2)
            except:
                pass
            
            # 스크롤을 통해 더 많은 비디오 로드
            self.driver.execute_script("window.scrollTo(0, 1000);")
            time.sleep(2)
            
            # 비디오 요소들 찾기
            video_items = self.driver.find_elements(By.CSS_SELECTOR, "div#contents ytd-video-renderer")
            
            logger.info(f"🎬 발견된 유튜브 비디오 수: {len(video_items)}개 (상위 7개 수집 예정)")
            
            for idx, item in enumerate(video_items[:7]):  # 상위 7개만 수집
                try:
                    # 제목 추출
                    title_element = item.find_element(By.CSS_SELECTOR, "#video-title")
                    title = title_element.text.strip()
                    link = title_element.get_attribute("href")
                    
                    # 채널명 추출
                    try:
                        channel_element = item.find_element(By.CSS_SELECTOR, "#channel-info #text a")
                        channel = channel_element.text.strip()
                    except:
                        channel = ""
                    
                    # 조회수 추출
                    try:
                        views_element = item.find_element(By.CSS_SELECTOR, "#metadata-line span:first-child")
                        views = views_element.text.strip()
                    except:
                        views = ""
                    
                    # 업로드 시간 추출 (없어도 포함)
                    try:
                        time_element = item.find_element(By.CSS_SELECTOR, "#metadata-line span:last-child")
                        upload_time = time_element.text.strip()
                        
                        # 업로드 시간 체크는 로그만 남기고 제외하지 않음
                        if upload_time and not self._is_recent_video(upload_time):
                            logger.debug(f"오래된 영상이지만 포함: {title[:30]}... ({upload_time})")
                            
                    except:
                        upload_time = "업로드 시간 불명"
                        logger.debug(f"업로드 시간 불명이지만 포함: {title[:30]}...")
                    
                    # 썸네일 URL 추출
                    try:
                        thumbnail_element = item.find_element(By.CSS_SELECTOR, "img")
                        thumbnail = thumbnail_element.get_attribute("src")
                    except:
                        thumbnail = ""
                    
                    if not title or len(title) < 3:
                        continue
                    
                    # 업로드 시간을 실제 날짜로 변환
                    actual_date = self._convert_upload_time_to_date(upload_time)
                    
                    youtube_video = {
                        "title": title,
                        "url": link,
                        "channel": channel,
                        "views": views,
                        "upload_time": upload_time,
                        "actual_date": actual_date,
                        "thumbnail": thumbnail,
                        "type": "youtube",
                        "keyword": keyword,
                        "search_rank": idx + 1,
                        "date": actual_date,  # 실제 날짜 사용
                        "summary": f"채널: {channel} | 조회수: {views} | 업로드: {upload_time}"
                    }
                    
                    youtube_data.append(youtube_video)
                    logger.debug(f"유튜브 비디오 수집: {title[:50]}...")
                    
                except Exception as e:
                    logger.warning(f"유튜브 비디오 처리 중 오류: {str(e)}")
                    continue
            
            logger.info(f"유튜브 비디오 수집 완료: {len(youtube_data)}개 비디오")
            return youtube_data
            
        except Exception as e:
            logger.error(f"유튜브 크롤링 오류: {str(e)}")
            return []

    def _is_recent_video(self, upload_time_text):
        """유튜브 업로드 시간이 최근인지 판단 (관대한 기준 적용)"""
        try:
            if not upload_time_text:
                return True  # 시간 불명인 경우도 포함
            
            upload_time_text = upload_time_text.lower().strip()
            
            # 최근 영상 패턴들 (한 달 이내)
            recent_patterns = [
                "초 전", "분 전", "시간 전",  # 오늘
                "일 전", "주 전", "주일 전",  # 일/주 단위
                "하루 전", "이틀 전", "사흘 전", "나흘 전", "닷새 전", "엿새 전",  # 한글 표현
                "일주일 전", "이주일 전", "삼주일 전", "한 달 전"  # 주/월 표현
            ]
            
            # 패턴 매칭
            for pattern in recent_patterns:
                if pattern in upload_time_text:
                    return True
            
            # "일 전" 패턴으로 숫자 추출 (30일까지 허용)
            import re
            day_match = re.search(r'(\d+)일 전', upload_time_text)
            if day_match:
                days_ago = int(day_match.group(1))
                return days_ago <= 30  # 30일 이내로 확장
            
            # "주 전" 패턴 (4주까지 허용)
            week_match = re.search(r'(\d+)주 전', upload_time_text)
            if week_match:
                weeks_ago = int(week_match.group(1))
                return weeks_ago <= 4  # 4주 이내
            
            # 기본적으로 포함 (너무 엄격하지 않게)
            return True
            
        except Exception as e:
            logger.warning(f"업로드 시간 파싱 오류: {str(e)}")
            return True  # 오류 시에도 포함

    def _convert_upload_time_to_date(self, upload_time_text):
        """유튜브 업로드 시간을 실제 날짜로 변환"""
        try:
            if not upload_time_text:
                return datetime.now().strftime("%Y-%m-%d")
            
            upload_time_text = upload_time_text.lower().strip()
            now = datetime.now()
            
            # 오늘 업로드
            if any(x in upload_time_text for x in ["초 전", "분 전", "시간 전"]):
                return now.strftime("%Y-%m-%d")
            
            # N일 전 패턴
            import re
            day_match = re.search(r'(\d+)일 전', upload_time_text)
            if day_match:
                days_ago = int(day_match.group(1))
                target_date = now - timedelta(days=days_ago)
                return target_date.strftime("%Y-%m-%d")
            
            # 한글 표현 처리
            korean_days = {
                "하루 전": 1, "이틀 전": 2, "사흘 전": 3, 
                "나흘 전": 4, "닷새 전": 5, "엿새 전": 6
            }
            
            for korean_day, days_ago in korean_days.items():
                if korean_day in upload_time_text:
                    target_date = now - timedelta(days=days_ago)
                    return target_date.strftime("%Y-%m-%d")
            
            # 기본값: 오늘 날짜
            return now.strftime("%Y-%m-%d")
            
        except Exception as e:
            logger.warning(f"날짜 변환 오류: {str(e)}")
            return datetime.now().strftime("%Y-%m-%d")

    def _normalize_text(self, text):
        """텍스트 정규화 - 중복 검사를 위한 전처리"""
        if not text:
            return ""
        
        # 소문자 변환
        text = text.lower()
        
        # 특수문자, 공백, 숫자 제거
        text = re.sub(r'[^\w가-힣]', '', text)
        
        # 연속된 공백을 하나로
        text = re.sub(r'\s+', '', text)
        
        return text
    
    def _calculate_similarity(self, text1, text2):
        """두 텍스트 간의 유사도 계산 (0~1 사이 값)"""
        if not text1 or not text2:
            return 0.0
        
        # 텍스트 정규화
        norm_text1 = self._normalize_text(text1)
        norm_text2 = self._normalize_text(text2)
        
        if not norm_text1 or not norm_text2:
            return 0.0
        
        # SequenceMatcher를 사용한 유사도 계산
        similarity = difflib.SequenceMatcher(None, norm_text1, norm_text2).ratio()
        return similarity
    
    def _is_duplicate_content(self, item1, item2, title_threshold=0.8, content_threshold=0.7):
        """두 항목이 중복인지 판단"""
        try:
            # URL이 같으면 확실한 중복
            if item1.get('url') == item2.get('url'):
                return True
            
            # 제목 유사도 검사
            title1 = item1.get('title', '')
            title2 = item2.get('title', '')
            title_similarity = self._calculate_similarity(title1, title2)
            
            # 내용 유사도 검사 (summary 또는 content 사용)
            content1 = item1.get('summary', '') or item1.get('content', '')
            content2 = item2.get('summary', '') or item2.get('content', '')
            content_similarity = self._calculate_similarity(content1, content2)
            
            # 제목이 매우 유사하거나, 제목과 내용이 모두 유사하면 중복으로 판단
            if title_similarity >= title_threshold:
                return True
            
            if title_similarity >= 0.6 and content_similarity >= content_threshold:
                return True
            
            return False
            
        except Exception as e:
            logger.warning(f"중복 검사 중 오류: {str(e)}")
            return False
    
    def remove_duplicates(self, data_list):
        """데이터 리스트에서 중복 항목 제거"""
        try:
            if not data_list:
                return []
            
            unique_items = []
            removed_count = 0
            
            for current_item in data_list:
                is_duplicate = False
                
                # 기존 unique_items와 비교
                for existing_item in unique_items:
                    if self._is_duplicate_content(current_item, existing_item):
                        is_duplicate = True
                        removed_count += 1
                        logger.debug(f"중복 제거: '{current_item.get('title', '')[:50]}...'")
                        break
                
                if not is_duplicate:
                    unique_items.append(current_item)
            
            logger.info(f"중복 제거 완료: 전체 {len(data_list)}개 → 유니크 {len(unique_items)}개 (제거: {removed_count}개)")
            return unique_items
            
        except Exception as e:
            logger.error(f"중복 제거 중 오류: {str(e)}")
            return data_list  # 오류 시 원본 반환

    def save_enhanced_data(self, data, keyword):
        """개선된 데이터를 JSON 파일로 저장"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{self.data_dir}/enhanced_news/{keyword}_enhanced_news_{timestamp}.json"
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            logger.info(f"개선된 데이터 저장 완료: {filename} ({len(data)}개 항목)")
            return filename
            
        except Exception as e:
            logger.error(f"데이터 저장 오류: {str(e)}")
            return None

    def run_enhanced_crawl_with_platform_keywords(self):
        """플랫폼별 키워드를 사용한 개선된 크롤링 실행"""
        try:
            if not self.create_webdriver():
                logger.error("웹드라이버 생성 실패")
                return False
            
            all_data = []
            platform_results = {}
            
            # 플랫폼별 키워드 가져오기
            news_keywords = config.SEARCH_KEYWORDS.get('news', [])
            blog_keywords = config.SEARCH_KEYWORDS.get('blog', [])
            youtube_keywords = config.SEARCH_KEYWORDS.get('youtube', [])
            
            print(f"🎯 플랫폼별 키워드 크롤링 시작...")
            print(f"   📰 뉴스 키워드: {len(news_keywords)}개")
            print(f"   📝 블로그 키워드: {len(blog_keywords)}개") 
            print(f"   🎥 유튜브 키워드: {len(youtube_keywords)}개")
            
            # 1. 뉴스 크롤링
            print(f"\n📰 뉴스 크롤링 시작...")
            news_data = []
            for idx, keyword in enumerate(news_keywords, 1):
                print(f"   [{idx}/{len(news_keywords)}] 뉴스 키워드: '{keyword}'")
                keyword_news = self.crawl_enhanced_naver_news(keyword)
                news_data.extend(keyword_news)
                time.sleep(config.DELAY_BETWEEN_REQUESTS)
            
            print(f"   ✅ 뉴스 수집 완료: {len(news_data)}개 항목")
            platform_results['news'] = news_data
            
            # 2. 블로그 크롤링  
            print(f"\n📝 블로그 크롤링 시작...")
            blog_data = []
            for idx, keyword in enumerate(blog_keywords, 1):
                print(f"   [{idx}/{len(blog_keywords)}] 블로그 키워드: '{keyword}'")
                keyword_blog = self.crawl_naver_blog_search(keyword)
                blog_data.extend(keyword_blog)
                time.sleep(config.DELAY_BETWEEN_REQUESTS)
            
            print(f"   ✅ 블로그 수집 완료: {len(blog_data)}개 항목")
            platform_results['blog'] = blog_data
            
            # 3. 유튜브 크롤링
            print(f"\n🎥 유튜브 크롤링 시작...")
            youtube_data = []
            for idx, keyword in enumerate(youtube_keywords, 1):
                print(f"   [{idx}/{len(youtube_keywords)}] 유튜브 키워드: '{keyword}'")
                keyword_youtube = self.crawl_youtube_search(keyword)
                youtube_data.extend(keyword_youtube)
                time.sleep(config.DELAY_BETWEEN_REQUESTS)
            
            print(f"   ✅ 유튜브 수집 완료: {len(youtube_data)}개 항목")
            platform_results['youtube'] = youtube_data
            
            # 플랫폼별 중복 제거
            print(f"\n🔍 플랫폼별 중복 제거 중...")
            for platform, data in platform_results.items():
                if data:
                    unique_data = self.remove_duplicates(data)
                    removed_count = len(data) - len(unique_data)
                    platform_results[platform] = unique_data
                    print(f"   {platform}: {len(data)}개 → {len(unique_data)}개 (중복 {removed_count}개 제거)")
            
            # 전체 데이터 합치기
            all_data = []
            for platform_data in platform_results.values():
                all_data.extend(platform_data)
            
            # 전체 데이터에서 최종 중복 제거 (플랫폼 간 중복)
            if all_data:
                print(f"\n🔍 플랫폼 간 최종 중복 검사 중...")
                initial_count = len(all_data)
                final_unique_data = self.remove_duplicates(all_data)
                final_removed_count = initial_count - len(final_unique_data)
                
                if final_removed_count > 0:
                    print(f"✅ 플랫폼 간 중복 제거 완료: {final_removed_count}개 추가 중복 제거")
                
                # 플랫폼별로 키워드 그룹핑해서 저장
                self._save_platform_based_data(platform_results, final_unique_data)
                
                # 전체 요약 저장
                summary_file = f"{self.data_dir}/enhanced_crawl_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                with open(summary_file, 'w', encoding='utf-8') as f:
                    json.dump({
                        "total_items": len(final_unique_data),
                        "total_before_dedup": initial_count,
                        "duplicates_removed": final_removed_count,
                        "platform_breakdown": {
                            "news": {
                                "keywords": news_keywords,
                                "items": len(platform_results['news'])
                            },
                            "blog": {
                                "keywords": blog_keywords, 
                                "items": len(platform_results['blog'])
                            },
                            "youtube": {
                                "keywords": youtube_keywords,
                                "items": len(platform_results['youtube'])
                            }
                        },
                        "crawl_time": datetime.now().isoformat(),
                        "summary": f"{len(final_unique_data)}개 유니크 항목이 플랫폼별 키워드로 수집됨"
                    }, f, ensure_ascii=False, indent=2)
                
                all_data = final_unique_data
            
            logger.info(f"플랫폼별 키워드 크롤링 완료: {len(all_data)}개 유니크 항목")
            print(f"\n🎉 플랫폼별 키워드 크롤링 완료!")
            print(f"   📊 최종 결과: {len(all_data)}개 유니크 항목")
            print(f"   📰 뉴스: {len(platform_results['news'])}개")
            print(f"   📝 블로그: {len(platform_results['blog'])}개")
            print(f"   🎥 유튜브: {len(platform_results['youtube'])}개")
            
            # 크롤링 완료 후 자동으로 프론트엔드에 동기화
            self.sync_to_frontend()
            
            return True
            
        except Exception as e:
            logger.error(f"플랫폼별 키워드 크롤링 오류: {str(e)}")
            return False
        finally:
            if self.driver:
                self.driver.quit()
                logger.info("웹드라이버 종료")
    
    def _save_platform_based_data(self, platform_results, final_data):
        """플랫폼별 데이터를 개별 파일로 저장"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # 플랫폼별로 저장
            for platform, data in platform_results.items():
                if data:
                    filename = f"{self.data_dir}/enhanced_news/{platform}_enhanced_news_{timestamp}.json"
                    with open(filename, 'w', encoding='utf-8') as f:
                        json.dump(data, f, ensure_ascii=False, indent=2)
                    logger.info(f"{platform} 데이터 저장: {filename} ({len(data)}개 항목)")
            
            # 전체 통합 데이터도 저장
            all_filename = f"{self.data_dir}/enhanced_news/all_platforms_enhanced_news_{timestamp}.json"
            with open(all_filename, 'w', encoding='utf-8') as f:
                json.dump(final_data, f, ensure_ascii=False, indent=2)
            logger.info(f"통합 데이터 저장: {all_filename} ({len(final_data)}개 항목)")
            
        except Exception as e:
            logger.error(f"플랫폼별 데이터 저장 오류: {str(e)}")

    def run_enhanced_crawl(self, keywords):
        """개선된 크롤링 실행"""
        try:
            if not self.create_webdriver():
                logger.error("웹드라이버 생성 실패")
                return False
            
            all_data = []
            total_keywords = len(keywords)
            
            for idx, keyword in enumerate(keywords, 1):
                print(f"\n🔍 [{idx}/{total_keywords}] 키워드: '{keyword}' 크롤링 중...")
                print(f"   📰 뉴스 수집 중 (최신7일, 관련도순)...")
                
                # 뉴스 크롤링
                news_data = self.crawl_enhanced_naver_news(keyword)
                
                print(f"   📝 블로그 수집 중 (최신7일, 관련도순)...")
                # 블로그 크롤링
                blog_data = self.crawl_naver_blog_search(keyword)
                
                print(f"   🎥 유튜브 수집 중 (최신업로드, 관련도순)...")
                # 유튜브 크롤링
                youtube_data = self.crawl_youtube_search(keyword)
                
                # 데이터 합치기
                combined_data = news_data + blog_data + youtube_data
                
                if combined_data:
                    # 키워드별 중복 제거
                    print(f"   🔍 중복 검사 중...")
                    unique_data = self.remove_duplicates(combined_data)
                    
                    # 키워드별 파일 저장
                    self.save_enhanced_data(unique_data, keyword)
                    all_data.extend(unique_data)
                    
                    removed_count = len(combined_data) - len(unique_data)
                    if removed_count > 0:
                        print(f"   ✅ 총 {len(unique_data)}개 항목 수집 완료 (뉴스: {len(news_data)}, 블로그: {len(blog_data)}, 유튜브: {len(youtube_data)}) - 중복 {removed_count}개 제거")
                    else:
                        print(f"   ✅ 총 {len(unique_data)}개 항목 수집 완료 (뉴스: {len(news_data)}, 블로그: {len(blog_data)}, 유튜브: {len(youtube_data)})")
                else:
                    print(f"   ⚠️ 수집된 데이터 없음")
                
                # 요청 간 대기
                time.sleep(config.DELAY_BETWEEN_REQUESTS)
            
            # 전체 데이터에서 최종 중복 제거
            if all_data:
                print(f"\n🔍 전체 데이터 최종 중복 검사 중...")
                final_unique_data = self.remove_duplicates(all_data)
                final_removed_count = len(all_data) - len(final_unique_data)
                
                if final_removed_count > 0:
                    print(f"✅ 전체 데이터 중복 제거 완료: {final_removed_count}개 추가 중복 제거")
                
                # 전체 요약 저장
                summary_file = f"{self.data_dir}/enhanced_crawl_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                with open(summary_file, 'w', encoding='utf-8') as f:
                    json.dump({
                        "total_items": len(final_unique_data),
                        "total_before_dedup": len(all_data),
                        "duplicates_removed": final_removed_count,
                        "keywords": keywords,
                        "crawl_time": datetime.now().isoformat(),
                        "summary": f"{len(final_unique_data)}개 유니크 항목이 {len(keywords)}개 키워드로 수집됨 (중복 {final_removed_count}개 제거)"
                    }, f, ensure_ascii=False, indent=2)
                
                # all_data를 최종 중복 제거된 데이터로 업데이트
                all_data = final_unique_data
            
            logger.info(f"전체 개선된 크롤링 완료: {len(all_data)}개 유니크 항목")
            
            # 크롤링 완료 후 자동으로 프론트엔드에 동기화
            self.sync_to_frontend()
            
            return True
            
        except Exception as e:
            logger.error(f"개선된 크롤링 실행 오류: {str(e)}")
            return False
        finally:
            if self.driver:
                self.driver.quit()
                logger.info("웹드라이버 종료")

    def sync_to_frontend(self):
        """크롤링 완료 후 프론트엔드로 데이터 동기화"""
        try:
            print(f"\n🔄 프론트엔드 데이터 동기화 시작...")
            
            # sync_to_frontend 모듈 임포트
            from sync_to_frontend import sync_data_to_frontend
            
            # 동기화 실행
            success = sync_data_to_frontend()
            
            if success:
                print("✅ 프론트엔드 동기화 완료!")
                logger.info("프론트엔드 데이터 동기화 성공")
            else:
                print("❌ 프론트엔드 동기화 실패!")
                logger.warning("프론트엔드 데이터 동기화 실패")
                
        except Exception as e:
            print(f"❌ 동기화 중 오류 발생: {str(e)}")
            logger.error(f"프론트엔드 동기화 오류: {str(e)}") 