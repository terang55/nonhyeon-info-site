"""
기존 크롤링된 데이터에서 중복 제거 스크립트
"""

import os
import json
import glob
from datetime import datetime
from enhanced_crawler import EnhancedNonhyeonCrawler
from loguru import logger
import config

def remove_duplicates_from_existing_data():
    """기존 크롤링된 데이터에서 중복 제거"""
    try:
        print("🔍 기존 데이터에서 중복 제거를 시작합니다...")
        
        # 크롤러 인스턴스 생성 (중복 제거 메서드 사용을 위해)
        crawler = EnhancedNonhyeonCrawler()
        
        # enhanced_news 디렉토리의 모든 JSON 파일 찾기
        enhanced_news_dir = f"{config.DATA_DIR}/enhanced_news"
        json_files = glob.glob(f"{enhanced_news_dir}/*_enhanced_news_*.json")
        
        if not json_files:
            print("❌ 처리할 JSON 파일이 없습니다.")
            return False
        
        print(f"📁 발견된 파일 수: {len(json_files)}개")
        
        total_before = 0
        total_after = 0
        processed_files = 0
        
        for file_path in json_files:
            try:
                filename = os.path.basename(file_path)
                print(f"\n📄 처리 중: {filename}")
                
                # 파일 읽기
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                if not data:
                    print("   ⚠️ 빈 파일입니다.")
                    continue
                
                original_count = len(data)
                total_before += original_count
                
                # 중복 제거
                unique_data = crawler.remove_duplicates(data)
                unique_count = len(unique_data)
                total_after += unique_count
                
                removed_count = original_count - unique_count
                
                if removed_count > 0:
                    # 중복이 제거된 경우에만 파일 업데이트
                    with open(file_path, 'w', encoding='utf-8') as f:
                        json.dump(unique_data, f, ensure_ascii=False, indent=2)
                    
                    print(f"   ✅ {original_count}개 → {unique_count}개 (중복 {removed_count}개 제거)")
                    processed_files += 1
                else:
                    print(f"   ✅ {original_count}개 (중복 없음)")
                
            except Exception as e:
                print(f"   ❌ 파일 처리 중 오류: {str(e)}")
                continue
        
        # 결과 요약
        total_removed = total_before - total_after
        print(f"\n📊 중복 제거 완료!")
        print(f"   • 처리된 파일: {processed_files}개")
        print(f"   • 전체 항목: {total_before}개 → {total_after}개")
        print(f"   • 제거된 중복: {total_removed}개")
        
        if total_removed > 0:
            print(f"   • 중복 제거율: {(total_removed/total_before)*100:.1f}%")
        
        return True
        
    except Exception as e:
        print(f"❌ 중복 제거 중 오류 발생: {str(e)}")
        logger.error(f"중복 제거 오류: {str(e)}")
        return False

def remove_duplicates_across_files():
    """파일 간 중복 제거 - 모든 파일의 데이터를 합쳐서 중복 제거 후 다시 분배"""
    try:
        print("\n🔍 파일 간 중복 제거를 시작합니다...")
        
        crawler = EnhancedNonhyeonCrawler()
        enhanced_news_dir = f"{config.DATA_DIR}/enhanced_news"
        json_files = glob.glob(f"{enhanced_news_dir}/*_enhanced_news_*.json")
        
        if not json_files:
            print("❌ 처리할 JSON 파일이 없습니다.")
            return False
        
        # 모든 파일의 데이터를 키워드별로 수집
        keyword_data = {}
        total_items = 0
        
        for file_path in json_files:
            try:
                filename = os.path.basename(file_path)
                # 파일명에서 키워드 추출
                keyword = filename.split('_enhanced_news_')[0]
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                if keyword not in keyword_data:
                    keyword_data[keyword] = []
                
                keyword_data[keyword].extend(data)
                total_items += len(data)
                
            except Exception as e:
                print(f"   ❌ 파일 읽기 오류 ({filename}): {str(e)}")
                continue
        
        print(f"📊 수집된 데이터: {len(keyword_data)}개 키워드, 총 {total_items}개 항목")
        
        # 키워드별로 중복 제거 및 파일 재생성
        total_unique = 0
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        for keyword, items in keyword_data.items():
            if not items:
                continue
            
            original_count = len(items)
            unique_items = crawler.remove_duplicates(items)
            unique_count = len(unique_items)
            removed_count = original_count - unique_count
            
            total_unique += unique_count
            
            # 새로운 파일명으로 저장
            new_filename = f"{enhanced_news_dir}/{keyword}_enhanced_news_{timestamp}.json"
            with open(new_filename, 'w', encoding='utf-8') as f:
                json.dump(unique_items, f, ensure_ascii=False, indent=2)
            
            if removed_count > 0:
                print(f"   ✅ {keyword}: {original_count}개 → {unique_count}개 (중복 {removed_count}개 제거)")
            else:
                print(f"   ✅ {keyword}: {unique_count}개 (중복 없음)")
        
        # 기존 파일들 삭제 (새로운 타임스탬프가 아닌 파일들)
        for file_path in json_files:
            if timestamp not in file_path:
                try:
                    os.remove(file_path)
                    print(f"   🗑️ 기존 파일 삭제: {os.path.basename(file_path)}")
                except:
                    pass
        
        total_removed = total_items - total_unique
        print(f"\n📊 파일 간 중복 제거 완료!")
        print(f"   • 전체 항목: {total_items}개 → {total_unique}개")
        print(f"   • 제거된 중복: {total_removed}개")
        
        if total_removed > 0:
            print(f"   • 중복 제거율: {(total_removed/total_items)*100:.1f}%")
        
        return True
        
    except Exception as e:
        print(f"❌ 파일 간 중복 제거 중 오류: {str(e)}")
        logger.error(f"파일 간 중복 제거 오류: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🔧 논현동 정보 허브 - 중복 제거 도구")
    print("=" * 60)
    
    print("\n1️⃣ 파일 내 중복 제거 실행...")
    success1 = remove_duplicates_from_existing_data()
    
    if success1:
        print("\n2️⃣ 파일 간 중복 제거 실행...")
        success2 = remove_duplicates_across_files()
        
        if success2:
            print("\n🎉 모든 중복 제거 작업이 완료되었습니다!")
            
            # 프론트엔드 동기화
            print("\n🔄 프론트엔드 동기화 시작...")
            try:
                from sync_to_frontend import sync_data_to_frontend
                if sync_data_to_frontend():
                    print("✅ 프론트엔드 동기화 완료!")
                else:
                    print("❌ 프론트엔드 동기화 실패!")
            except Exception as e:
                print(f"❌ 동기화 중 오류: {str(e)}")
        else:
            print("\n❌ 파일 간 중복 제거 실패!")
    else:
        print("\n❌ 파일 내 중복 제거 실패!")
    
    print("\n" + "=" * 60) 