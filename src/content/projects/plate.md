---
title: Plate
summary: >-
  팝업 다이닝을 지도·목록으로 찾아 예약하고 경험 후 평가하는 안드로이드 앱.
  3인 팀에서 다이닝 등록·상세·찜 화면을 맡아 Firebase와 통신하는 핵심 흐름을 구현했습니다.
period:
  from: "2020.11"
  to: "2020.12"
techStack: [Android, Java, Firebase, Google Maps, Lottie, Picasso]
highlights:
  - "성과 — 교내 '사용자인터페이스및실습' 과목 유일한 최고 점수"
  - '다이닝 등록 — Daum/Kakao 우편번호 검색을 WebView + JavascriptInterface로 연동, Geocoder 좌표화 후 Firebase 저장'
  - '상세 화면 — Firebase Realtime Database·Storage 연동, Google Maps에 다이닝 위치를 Marker로 표시'
  - '찜 목록 — RecyclerView + SwipeRefreshLayout, Lottie 스켈레톤 로딩'
links:
  - label: GitHub
    href: https://github.com/devappmin/Plate
kind: team
thumbnail: /content/projects/plate/hero.png
order: 6
---

# 프로젝트 소개

---

![Plate](/content/projects/plate/hero.png)

## Plate란?

- 팝업 다이닝은 한시적으로 식당·공유주방을 빌려 상대적으로 저렴하게 파인 다이닝을 선보이는 모델입니다. 홍보가 성패를 가르는데, 홍보가 미흡하면 셰프는 체험객을, 손님은 정보를 얻지 못합니다. 예약도 문자·Google Forms로 제각각이어서 **일관된 예약 시스템**이 필요했습니다.
- 이를 팝업 다이닝을 **지도와 목록으로 한눈에** 보고, 조건에 맞게 검색·예약하고 경험 후 별점을 남기는 앱으로 풀었습니다. 일반 회원은 전환 신청으로 셰프가 되어 자신의 다이닝을 등록합니다.
- 3인이 모두 안드로이드(Java)로 개발한 팀 프로젝트입니다.

## 담당 역할

다이닝 **등록·일정 관리**, **상세 보기**, **찜(북마크)** 화면을 맡아, Firebase와 통신하는 핵심 흐름을 구현했습니다.

![팀 태스크 분담 — 요약](/content/projects/plate/tasklist-1.png)

## 협업 방식

각자 화면을 나눠 맡되 결과 화면은 함께 구현했고, 태스크와 기여를 문서로 정리했습니다.

![팀 태스크 분담 — 세부](/content/projects/plate/tasklist-2.png)

![팀원별 Git Contributions](/content/projects/plate/tasklist-3.png)


# 주요 기능

---

## 회원(셰프 / 일반)

일반 회원으로 가입한 뒤 포트폴리오를 제출해 심사를 거치면 셰프(호스트)로 전환돼 다이닝을 등록할 수 있습니다.

## 다이닝 등록(셰프)

음식 종류·일정·태그·사진 등을 입력해 등록하고, 주소는 검색으로 빠르게 채웁니다. 등록한 다이닝은 일정 관리에서 수정·삭제합니다.

## 검색

음식 종류·해시태그·날짜·시간·인원·지역으로 조건에 맞는 팝업 다이닝을 필터링합니다.

## 지도

전체 또는 검색 결과의 다이닝을 Marker로 표시하고, 현재 화면 근처 다이닝을 하단 목록으로 보여줍니다.

## 상세 · 찜 · 예약

태그·음식 사진·구성·셰프 정보·가격·평점을 확인하고, 찜하거나 여석 있는 일정을 선택해 예약합니다.

## 예약 관리 · 평가

마이페이지에서 예약 이력을 확인·취소하고, 예약 시간이 지나면 별점을 남깁니다.

## Plate 포스트

소식·이벤트 알림을 제공합니다.


# 사용된 기술

---

- **Android** — Java (minSdk 21 · targetSdk 30)
- **Firebase** — Auth · Realtime Database · Storage
- **지도 · 위치** — Google Maps(SupportMapFragment) · Location · Android Geocoder
- **주소 검색** — Daum/Kakao 우편번호 위젯 (WebView + JavascriptInterface)
- **이미지 · 애니메이션** — Glide · Picasso · Lottie(스켈레톤 로딩)


# 다이닝 등록 — 주소 검색과 Firebase 업로드

---

- **문제** — 주소를 손으로 입력받으면 오타와 형식 불일치로 좌표를 얻지 못해, 상세 화면의 지도 표시까지 연쇄적으로 깨집니다.
- **해결** — Daum/Kakao 우편번호 위젯을 WebView에 로드해 선택 결과를 `@JavascriptInterface`로 되받고, `Geocoder`로 좌표화해 다이닝 정보와 함께 저장했습니다.
- **결과** — 사용자가 주소를 검색해 선택하면 정확한 주소와 좌표가 저장되고, 상세 화면의 지도가 이 좌표를 그대로 사용합니다.

셰프가 새 다이닝을 등록하는 화면입니다. 잘못된 정보가 올라가지 않도록 시작·종료 시간 유효성과 빈 항목을 검사하고, 갤러리 사진은 Firebase **Storage**에, 나머지 정보는 **Realtime Database**에 저장합니다.

주소는 직접 입력받는 대신 **Daum/Kakao 우편번호(주소검색) 위젯을 WebView에 로드하고**, 선택 결과를 `@JavascriptInterface`로 되받아 채웁니다(위젯 페이지는 직접 호스팅). 받은 주소는 Android `Geocoder`로 좌표로 변환해 함께 저장하고, 상세 화면 지도에서 그대로 사용합니다.

```java
// WebView에 Daum 우편번호 위젯을 띄우고, 선택 주소를 JS 브리지로 되받는다
class MyJavaScriptInterface {
    @JavascriptInterface
    public void processDATA(String data) {          // 위젯이 선택 주소를 넘겨줌
        Intent intent = new Intent();
        intent.putExtra("data", data);
        setResult(RESULT_OK, intent);
        finish();
    }
}
webView.addJavascriptInterface(new MyJavaScriptInterface(), "Android");
webView.setWebViewClient(new WebViewClient() {
    @Override
    public void onPageFinished(WebView view, String url) {
        webView.loadUrl("javascript:sample2_execDaumPostcode();"); // 위젯 검색 실행
    }
});
webView.loadUrl("http://plate.dothome.co.kr/index.php");            // 직접 호스팅한 위젯 페이지
```

돌려받은 주소는 `AddDiningPlanActivity`에서 `location_editText`에 채워지고, 등록 시 `Geocoder`로 위경도를 구해 다이닝 정보와 함께 `Dining` 노드에 `setValue`로 기록됩니다.

# 다이닝 상세 — Firebase와 지도

---

- **문제** — 홈 · 지도 · 찜 여러 경로에서 진입하는 정보 밀도가 가장 높은 화면이기 때문에, Realtime Database · Storage · 지도 세 소스를 한 화면에 모아야 했습니다.
- **해결** — 다이닝·셰프 정보와 사진을 Firebase에서 읽어 표시하고, `SupportMapFragment`에 등록 시 저장해 둔 좌표로 Marker를 표시했습니다.
- **결과** — 어느 경로로 들어와도 같은 정보와 위치를 확인하고 찜·예약으로 이어집니다.

```java
mapFragment.getMapAsync(googleMap -> {
    LatLng location = new LatLng(dining.getCoordinate().get("latitude"),
                                 dining.getCoordinate().get("longitude"));
    googleMap.moveCamera(CameraUpdateFactory.newLatLngZoom(location, 15));
    Marker marker = googleMap.addMarker(new MarkerOptions()
            .title(dining.getTitle()).position(location));
    marker.showInfoWindow();
});
```

# 찜(북마크) — RecyclerView와 스켈레톤

---

- **문제** — 네트워크 로딩 동안 목록이 비어 보이면, 찜이 없는 것인지 불러오는 중인지 사용자가 구분할 수 없습니다.
- **해결** — RecyclerView 목록 위에 **Lottie 스켈레톤 애니메이션**을 겹쳐 두고, 당겨서 새로고침(`SwipeRefreshLayout`) 중에만 노출했다가 데이터가 오면 감췄습니다.
- **결과** — 로딩과 빈 목록이 시각적으로 구분되고, 같은 패턴을 다이닝 일정 관리 화면에도 재사용했습니다.

```xml
<!-- fragment_bookmark.xml (간략) -->
<androidx.coordinatorlayout.widget.CoordinatorLayout ...>

    <!-- 당겨서 새로고침 -->
    <androidx.swiperefreshlayout.widget.SwipeRefreshLayout
        android:id="@+id/refresh_BookmarkFragment" ...>

        <!-- 찜 목록 -->
        <androidx.recyclerview.widget.RecyclerView
            android:id="@+id/recycler_BookmarkFragment" ... />

    </androidx.swiperefreshlayout.widget.SwipeRefreshLayout>

    <!-- 로딩 스켈레톤 — 목록 위에 겹쳐 표시(초기엔 gone) -->
    <com.airbnb.lottie.LottieAnimationView
        android:id="@+id/loading_lottie_Bookmarkfragment"
        android:visibility="gone" ... />

</androidx.coordinatorlayout.widget.CoordinatorLayout>
```


# 성과

---

- 교내 **2020년 2학기 '사용자인터페이스및실습' 과목 프로젝트 평가에서 유일한 최고 점수**를 받았습니다.

![과목 프로젝트 평가 최고 점수](/content/projects/plate/award.png)


# 배운 점

---

## 순차 key가 부른 경쟁 상태

찜 목록의 key를 1, 2, 3…처럼 순차로 관리했더니, 하트 버튼을 빠르게 연타하면 인덱스가 꼬여(1·2·3·5처럼) 목록을 불러올 때 예외가 발생했습니다. key를 **random value**로 바꾸고 `DiningMasterData` 클래스로 목록을 다루면서 중복·인덱스 꼬임을 막았습니다.

## RecyclerView, 그리고 팀과 공유하는 DB

앱 개발을 시작하자마자 맡은 것이 찜 목록의 RecyclerView였는데, 어댑터·커스텀 뷰가 처음에는 잘 이해되지 않았습니다. 이후 대부분의 화면이 RecyclerView였기 때문에, 이 기회에 개념을 확실히 다졌습니다. 또 초기 스키마 기준으로 작성한 코드는 값이 바뀔 때마다 어려움이 있었고, 혼자 값을 바꾸면 팀원 코드에도 영향이 갔습니다. 그래서 값의 추가·삭제·변경을 팀과 **조율**하며 공유 데이터베이스를 다루는 방법을 익혔습니다.

![배운 점 — 최종보고서 발췌 (1)](/content/projects/plate/lesson-1.png)

![배운 점 — 최종보고서 발췌 (2)](/content/projects/plate/lesson-2.png)


# 프로젝트 이미지

---

![메인 화면](/content/projects/plate/app-main.png)

![지도 — 전국 다이닝과 근처 목록](/content/projects/plate/app-08.png)

![다이닝 검색 · 지도 표시](/content/projects/plate/app-search-map.png)

![찜 목록(북마크)](/content/projects/plate/app-bookmark.png)

![마이페이지 — 계정 관리와 권한 요청](/content/projects/plate/app-11.png)

![마이페이지](/content/projects/plate/app-mypage.png)

![다이닝 등록 (셰프 회원 전용)](/content/projects/plate/app-register.png)

![다이닝 등록 — 입력 완료](/content/projects/plate/app-register-b.png)

![다이닝 일정 관리 (셰프 회원 전용)](/content/projects/plate/app-schedule.png)

![다이닝 상세 · 구성](/content/projects/plate/app-15.png)

![다이닝 상세 정보 · 지도 · 예약](/content/projects/plate/app-detail.png)

![예약 확인](/content/projects/plate/app-17.png)

![예약 확인 · 취소 · 다이닝 평가](/content/projects/plate/app-reserve.png)

![Plate 포스트 알림](/content/projects/plate/app-post.png)


# 관련 자료

---

[1차 보고서](/files/plate-report-1.pdf)

[2차 보고서](/files/plate-report-2.pdf)

[3차 보고서](/files/plate-report-3.pdf)

[최종 보고서](/files/plate-report-final.pdf)

[구현 영상 1](https://youtu.be/nVKovekNcls)

[구현 영상 2](https://youtu.be/PNwa-TpY_zU)

[구현 영상 3](https://www.youtube.com/watch?v=DMK952Bq49Q)
