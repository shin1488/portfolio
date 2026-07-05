---
title: 던옥 (DNFAUC)
summary: >-
  던전앤파이터 경매장 시세를 게임 접속 없이 홈 화면 위젯으로 확인하는 안드로이드 앱.
  출시 이튿날 넥슨 공식 '오늘의 던파'에 소개되며 실사용자 트래픽을 얻은 1인 프로젝트입니다.
period:
  from: "2023.06"
  to: "2023.06"
techStack: [Android, Java, Volley, Glide, Google AdMob, Nexon Open API]
highlights:
  - '게임 접속 없이 홈 화면 위젯으로 경매장 최저가·평균가 확인 — AppWidgetProvider + PendingIntent 브로드캐스트로 위젯 갱신 구현'
  - "출시 이튿날 넥슨 공식 '오늘의 던파' 소개, 커뮤니티 추천 1위(추천 72 · 비추천 0 · 댓글 77)"
  - "'오늘의 던파' 소개 당일 API 호출 5,439건(첫날 896건), 출시 2일간 설치 214건"
  - '기획·개발·배포를 1인이 수행 — 개인정보처리방침 작성부터 Google Play 등록까지'
links:
  - label: GitHub
    href: https://github.com/shin1488/DNFAuctionWidget
kind: personal
thumbnail: /content/projects/dnfauc/preview1.png
order: 4
---

# 프로젝트 소개

---

![던옥](/content/projects/dnfauc/hero.png)

## 던옥이란?

- 넥슨 던전앤파이터의 Open API를 활용한 **안드로이드 홈 화면 위젯 앱**입니다. 인게임 재화·아이템은 가격 변동이 잦고 그 폭도 적지 않아, 게임에 접속하지 않고도 경매장 시세를 확인하고 싶다는 필요에서 출발했습니다.
- 사용자가 지정한 아이템의 **경매장 최저가와 평균가를 홈 화면 위젯에서 바로** 확인하고, 새로고침 버튼으로 즉시 갱신합니다.
- 기획부터 개발, Google Play 배포까지 **1인이 단독으로** 진행했습니다.


# 주요 기능

---

## 아이템 검색 → 위젯 등록

메인 화면에서 아이템 이름을 입력하면 DNF Open API로 이름을 포함한 아이템 목록을 조회해, 아이콘·이름과 함께 리스트(RecyclerView, 이미지는 Glide)로 보여줍니다. 원하는 아이템을 누르면 로컬 저장소(SharedPreferences)에 저장되고, 위젯이 그 값을 읽어 시세를 표시합니다.

![아이템 검색 결과와 저장](/content/projects/dnfauc/preview2.png)

## 홈 화면 위젯

지정한 아이템의 이미지·이름을 위젯 상단에, 경매장 최저가·평균가를 하단에 표시합니다. 우상단 새로고침 버튼으로 현재 경매장 시세를 즉시 갱신합니다.

![앱 메인 화면과 홈 화면에 배치된 위젯](/content/projects/dnfauc/preview1.png)


# 위젯 갱신

---

위젯은 Activity·Fragment가 아니라 `AppWidgetProvider`를 상속하며, 앱 프로세스가 떠 있지 않아도 동작해야 합니다. 그래서 버튼 클릭을 일반 View의 리스너로 처리할 수 없고, **클릭을 `PendingIntent` 브로드캐스트로 보내 Provider의 `onReceive`에서 받아** API 요청까지 태워 갱신합니다. 이 갱신 배선에 개발 시간의 대부분을 썼습니다.

```java
@Override
public void onUpdate(Context context, AppWidgetManager manager, int[] widgetIds) {
    for (int widgetId : widgetIds) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.auction_widget);
        views.setTextViewText(R.id.item_name, getItemName(context)); // 저장된 아이템

        // 새로고침 버튼 클릭 → 브로드캐스트 → onReceive에서 처리
        Intent intent = new Intent(ACTION_REFRESH_CLICK);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId);
        PendingIntent pi = PendingIntent.getBroadcast(context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE);
        views.setOnClickPendingIntent(R.id.refresh_button, pi);

        performApiRequest(context, widgetId); // 시세 요청 후 위젯 갱신
        manager.updateAppWidget(widgetId, views);
    }
}
```

시세는 Neople Open API 경매장 엔드포인트를 `unitPrice` 오름차순으로 정렬해 요청하고, **가장 싼 매물(`rows[0]`)의 단가를 최저가**로, **API가 함께 내려주는 `averagePrice`를 평균가**로 위젯에 표시합니다(평균은 앱이 계산하지 않고 API 값을 그대로 씁니다).

```java
String url = "https://api.neople.co.kr/df/auction?sort=unitPrice:asc&itemName="
        + encodeItemName + "&apikey=" + apiKey;
JsonObjectRequest request = new JsonObjectRequest(Request.Method.GET, url, null, response -> {
    JSONArray rows = response.getJSONArray("rows");
    JSONObject cheapest = rows.getJSONObject(0);          // 정렬 첫 행 = 최저가 매물
    NumberFormat fmt = new DecimalFormat("#,###");
    RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.auction_widget);
    views.setTextViewText(R.id.auction_minPrice, fmt.format(cheapest.getInt("unitPrice")));
    views.setTextViewText(R.id.auction_avgPrice, fmt.format(cheapest.getInt("averagePrice")));
    AppWidgetManager.getInstance(context).updateAppWidget(widgetId, views);
}, error -> Toast.makeText(context, "API Request Error", Toast.LENGTH_SHORT).show());
```

검색 화면에서 저장한 아이템은 위젯이 그대로 읽습니다 — **RecyclerView 클릭 → `SharedPreferences("SavedItem")` → 위젯 조회**로 이어지는 단순한 한 갈래 데이터 흐름입니다. API 키는 소스에 두지 않고 gitignore된 문자열 리소스로 분리해 버전 관리에서 제외했습니다.


# 사용된 기술

---

- **Android** — Java · AppWidgetProvider(홈 화면 위젯) · RemoteViews · PendingIntent / BroadcastReceiver · SharedPreferences · ViewBinding (compileSdk 33 · minSdk 24)
- **네트워크 · 이미지** — Volley(DNF Open API 호출) · Glide(아이템 아이콘 로딩)
- **수익화** — Google AdMob 배너


# 성과

---

만들어 두는 데서 그치지 않고 Google Play에 정식 출시해, 짧은 기간에 실제 사용자 트래픽을 확보했습니다.

- **넥슨 공식 소개** — 출시 이튿날인 2023.06.29, 던전앤파이터 공식 홈페이지 **"오늘의 던파"에 소개**됐습니다.

![오늘의 던파 소개](/content/projects/dnfauc/today-dnf.png)

- **커뮤니티 반응** — 출시 당일, 던파 커뮤니티에서 **6월 28일 등록 게시물 중 추천 1위**를 기록했습니다(추천 72 · 비추천 0 · 댓글 77 · 조회 2,373).

![커뮤니티 추천 1위](/content/projects/dnfauc/community-top.png)

- **API 트래픽** — 출시 첫날 896건, "오늘의 던파" 소개 당일 **5,439건**의 API 호출이 발생했습니다. (503은 게임 점검 중 호출된 요청)

![API 호출 내역](/content/projects/dnfauc/api-calls.png)

- **설치 · 광고** — 출시 이틀간 설치 214건, 메인 화면 하단 배너 광고 노출 463건.

![첫날 · 둘째날 설치 수](/content/projects/dnfauc/installs.png)

![배너 광고 노출 수](/content/projects/dnfauc/ad-impressions.png)


# 배운 점

---

## 위젯이라는 낯선 실행 모델

Activity·Fragment만 다루다 `AppWidgetProvider`로 위젯을 만들며, 앱이 떠 있지 않아도 동작하는 UI라는 다른 실행 모델을 처음 경험했습니다. 버튼 클릭을 리스너가 아니라 `PendingIntent` 브로드캐스트로 흘려보내고 `BroadcastReceiver`에서 받아 API까지 태워 갱신하는 흐름을 짜는 데 개발 시간의 대부분을 썼습니다. 일반 View 처리와는 결이 달라, "화면에 붙어 있지 않은 UI를 어떻게 살아 움직이게 할까"를 고민한 시간이었습니다.

## 만드는 것과 출시하는 것은 다르다

실제 사용자를 염두에 둔 첫 배포작이라, 앱을 완성하는 것과 스토어에 올리는 것이 별개라는 걸 체감했습니다. 특히 **개인정보처리방침** 작성·제출이 낯설어 막막했는데, 개인정보 포털의 작성 지원 서비스를 찾아 문서를 만들어 제출했습니다. 릴리즈 뒤 실제 사용자 의견(위젯당 아이템 개수 확대, 특정 가격 도달 시 푸시 알림 등)을 들으며 처음 목표한 앱을 어떻게 키울지에 대한 아이디어를 얻은 것도 값진 경험이었습니다. (앱은 현재 Google Play에서 내려간 상태입니다.)
