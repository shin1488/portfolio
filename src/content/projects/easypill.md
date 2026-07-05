---
title: EasyPill
summary: >-
  영양제를 성분·가격으로 비교하고 구독·섭취 이력까지 관리하는 크로스플랫폼(Flutter) 앱.
  3인 팀에서 장바구니·결제 화면을 맡았고, 교내 두드림학기제 공모전 장려상을 받았습니다.
period:
  from: "2021.09"
  to: "2021.12"
techStack: [Flutter, Dart, Firebase Auth, SQLite, Django REST]
highlights:
  - '영양제를 성분·가격으로 비교하고 구독·섭취 이력까지 관리하는 크로스플랫폼(Flutter) 앱 — 3인 팀 프로젝트'
  - '장바구니 화면 — 수량 +/− 에 따라 총 결제액을 setState로 실시간 재계산, Django REST를 http로 연동'
  - '결제 화면 — Navigator로 넘어온 주문 목록·배송지 폼·결제수단 선택 UI 구현'
  - '교내 두드림학기제 공모전 장려상 수상'
links:
  - label: GitHub
    href: https://github.com/petabyte-studio
kind: team
thumbnail: /content/projects/easypill/hero.png
order: 5
---

# 프로젝트 소개

---

![EasyPill](/content/projects/easypill/hero.png)

## EasyPill이란?

- 제품을 비교·구독하는 서비스가 늘어나고, 코로나19를 거치며 건강기능식품(영양제)에 대한 관심이 높아진 흐름에서 착안해, **정보 획득 · 의견 공유 · 제품 구독을 한 앱에서** 제공하는 종합 서비스로 기획했습니다.
- 사용자는 영양제를 성분·가격으로 비교하고, 제품에 대한 의견(댓글·별점)을 나누며, 원하는 제품을 **구독하면 한 달 단위로 소분된 영양제를 받고** 섭취 이력을 체크합니다.
- 사용 환경과 관계없이 동일한 사용 흐름을 제공하고자 **Flutter**로 만든 크로스플랫폼 앱이며, 3인 팀(모두 Flutter, 그중 2명은 Django 서버 겸함)이 한 학기 동안 진행했습니다.

## 담당 역할

3인 팀에서 **장바구니 화면과 결제 화면**을 맡아, Django REST 서버와 통신하는 구매 흐름의 프론트를 구현했습니다.


# 주요 기능

---

- **로그인** — Firebase Auth로 로그인하고, UID에 해당하는 닉네임·프로필을 서버에서 불러옵니다.
- **영양제 리스트** — 분류별로 영양제를 보고, **이름·인기·최신·가격·별점순**으로 정렬합니다.
- **비교 · 의견** — 상세 페이지에서 성분·가격·효능을 확인하고, 댓글과 평균 별점을 보거나 직접 남깁니다.
- **구독** — 원하는 영양제를 장바구니에 담아 한 번에 결제하거나, 한 달치를 구독해 소분된 영양제를 받습니다. 구독한 제품은 마이페이지 위젯에 표시됩니다.
- **섭취 이력** — GitHub 잔디(heatmap contribution calendar)처럼, 먹은 날에 색이 칠해지고 섭취 횟수가 많을수록 진해집니다. 날짜를 누르면 그날의 아침·점심·저녁 섭취 이력을 확인합니다.

![로그인 — Firebase Auth 인증과 프로필](/content/projects/easypill/login.png)

![메인 — 오늘의 섭취 이력과 제품 추천·카테고리](/content/projects/easypill/main.png)

![영양제 리스트와 분류·조건별 정렬](/content/projects/easypill/list.png)

![영양제 정보 확인과 의견 공유](/content/projects/easypill/detail.png)


# 담당 — 장바구니 & 결제 화면

---

## 장바구니 — 수량 변경에 실시간으로 반응하는 총액

장바구니는 담은 상품을 Django REST 서버에서 `http`로 조회해 목록으로 보여줍니다(한글 응답은 UTF-8로 디코드). 수량을 `+`/`−`로 조절할 때마다 **`setState` 안에서 총 결제액을 즉시 다시 계산**해, 상품 금액·총액·하단 바에 실시간으로 반영합니다.

![장바구니 · 결제 · 구독 중 영양제](/content/projects/easypill/cart.png)

```dart
// 담은 상품을 서버에서 조회 — 한글은 UTF-8로 디코드
final res = await http.get(Uri.parse('$baseUrl/product?search=$id&search_fields=id'));
setState(() => data!.addAll(json.decode(utf8.decode(res.bodyBytes))));
```

```dart
// 수량 증가 → 총액을 그 자리에서 다시 계산 (선택된 상품만 합산)
IconButton(
  icon: Icon(Icons.add),
  onPressed: () => setState(() {
    productInfos[index].count++;
    if (productInfos[index].checkBox) {
      totalPrice += int.parse(data![index]['price'].toString());
    }
    productInfos[index].price = data![index]['price'] * productInfos[index].count;
  }),
),
```

## 결제 — 주문 확인과 배송지 폼

`구매하기`를 누르면 **선택된 상품만 걸러 `Navigator`로 결제 화면에 넘기고**, 결제 화면은 넘어온 주문 목록과 금액을 다시 보여준 뒤 배송지 입력 폼과 결제수단 선택 UI를 제공합니다. 우편번호 검색과 PG(결제대행) 연동은 이 프로젝트에서 미구현으로 남겼습니다.


# 사용된 기술

---

- **앱** — Flutter · Dart(2.12, null-safety) · `http`(REST 통신) · Firebase Auth(인증) · `sqflite`(로컬 SQLite, 섭취 이력) · `group_button` · `flutter_svg`
- **서버(팀)** — Django · Python · Django REST Framework


# 성과

---

교내 **2021년 2학기 두드림학기제 공모전에서 장려상**을 수상했습니다.

![두드림학기제 공모전 장려상](/content/projects/easypill/award.png)


# 배운 점

---

- **선언형 UI에 처음 익숙해진 프로젝트.** 수량이 바뀔 때마다 총액을 다시 그리는 장바구니를 만들며, 상태를 바꾸면 화면이 따라 갱신되는 Flutter의 방식에 처음 손에 익혔습니다.
- **서버와의 계약에 맞춰 붙이기.** 팀의 Django REST API가 내려주는 응답 형태에 맞춰 클라이언트를 연결하고, 한글 인코딩·수량-금액 계산 같은 화면 쪽 처리를 책임지며 클라이언트–서버 협업의 감을 잡았습니다.


# 프로젝트 보고서 · 영상

---

[두드림 프로그램 최종보고서](/files/easypill-report.pdf)

[구현 시연 영상](https://youtu.be/_qib-P2d1v4)
