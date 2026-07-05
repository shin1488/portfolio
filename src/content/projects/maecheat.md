---
title: 메치트 (MaeCheat)
summary: >-
  메이플스토리에서 거래 분쟁·비매너가 보고된 캐릭터를 검색하면, 커뮤니티에 흩어진 제보 글을
  한곳에 모아 AI가 한 줄로 요약해 주는 평판 검색 서비스. 기획·프론트·백엔드·인프라를 1인 풀스택으로 진행했습니다.
period:
  from: "2026.04"
  to: "2026.05"
techStack: [Java 25, Spring Boot 4, Spring AI, MySQL, React 19, Docker, Caddy, AWS EC2]
highlights:
  - '실서비스 운영 — 이틀 만에 누적 방문자 약 1만·페이지뷰 약 8.5만, 이탈률 7%로 실제 사용자 트래픽 확보'
  - 'Spring AI(Gemini) 한 줄 요약 — @Async + ConcurrentHashMap로 동일 캐릭터 중복 생성을 막고, 마지막 요청까지 재실행 큐로 반영'
  - 'AWS EC2에 Docker Compose(App·MySQL·Caddy) 배포 + GitHub Actions 무중단 CI/CD, Caddy 자동 HTTPS'
  - '커뮤니티 스크래퍼를 인터페이스 + Resolver로 추상화(전략 패턴·DIP) — 사이트 추가 시 구현체만 늘리면 되도록 확장점 분리'
links:
  - label: GitHub
    href: https://github.com/MaeCheat
kind: personal
thumbnail: /content/projects/maecheat/character-detail.png
order: 2
---

# 프로젝트 소개

---

## 메치트란?

- 온라인 게임 메이플스토리에서 거래 분쟁이나 비매너 이슈가 보고된 캐릭터의 닉네임을 검색하면, 인벤 등 외부 커뮤니티에 올라온 제보 글을 한곳에 모아 보여주고 **AI가 한 줄 요약**을 붙여 주는 서비스입니다.
- 흩어진 제보를 캐릭터 단위로 정리해, 거래나 파티 모집 전에 상대의 평판을 빠르게 확인하도록 돕는 것이 목표였습니다. "메이플스토리 버전 더치트(거래 분쟁 정보 검색)"를 컨셉으로 기획했습니다.
- **기획부터 프론트엔드·백엔드·인프라까지 1인이 단독으로 진행한 풀스택 개인 프로젝트**입니다.

![메치트](/content/projects/maecheat/logo.png)


## 담당 범위 — 1인 풀스택

기획 단계의 결정이 그대로 백엔드 스키마 → API 스펙 → 프론트 화면 → 배포 파이프라인까지 한 줄기로 흘러가도록 전 과정을 직접 통제했습니다.

- **Backend** — Spring Boot 4 / Java 25 도메인 분리형 구조(`domain` / `infrastructure` / `global`), 넥슨 OpenAPI 연동, 커뮤니티 스크래핑, Spring AI(Gemini) 요약, 동시성 제어.
- **Frontend** — React 19 / TypeScript / Vite / Tailwind 4, TanStack Query 기반 서버 상태 관리, 커스텀 훅 분리, 글래스모피즘 + 픽셀 폰트 비주얼.
- **Infra** — AWS EC2에 Docker Compose(App · MySQL · Caddy) 배포, Caddy 자동 HTTPS, GitHub Actions 무중단 CI/CD.


# 주요 기능

---

## 캐릭터 검색

닉네임을 입력하면 넥슨 OpenAPI로 OCID(캐릭터 고유 ID)를 조회한 뒤 기본 정보(이미지·직업·레벨)와 AI 요약을 표시합니다. 한 번 조회된 캐릭터는 OCID와 함께 DB에 저장돼, **동일 닉네임 재검색 시 외부 API 호출 없이** 응답합니다. 닉네임 변경이 감지되면 OCID를 기준으로 정보를 자동 갱신합니다.

## 제보 게시글 등록

외부 커뮤니티(인벤)의 게시글 URL을 등록하면 백엔드가 직접 스크래핑해 제목·본문·추천 수를 수집합니다. 신뢰도 낮은 제보가 쌓이지 않도록 **추천 수 30 이상**인 글만 허용하고, **AI가 게시글과 해당 캐릭터의 연관성을 판단**해 무관한 글은 등록을 거부합니다. URL 쿼리 스트링을 제거한 정규화 URL을 기준으로 캐릭터별 중복 제보를 막습니다.

## 추천 / 비추천 · 자동 숨김

제보에 추천·비추천을 누를 수 있고, IP 기반으로 동일 게시글 중복 투표를 차단합니다. **비추천 − 추천 점수가 5를 넘으면 게시글이 자동 숨김** 처리돼 AI 요약에서 제외됩니다. 투표 결과는 요약 재생성의 가중치로 쓰여, 커뮤니티 검증을 거친 제보일수록 요약에 더 강하게 반영됩니다.

## AI 한 줄 요약

캐릭터에 매핑된 여러 제보를 Spring AI(Gemini)로 한 줄 요약해 카드에 표시합니다. 추천 점수가 5의 배수에 도달하거나 게시글이 숨김 처리될 때마다 비동기로 요약을 재생성하고, **AI 면책 문구**를 함께 노출해 결과의 한계를 명확히 안내합니다.


# 넥슨 OpenAPI — 선언형 HTTP 클라이언트

---

외부 API 호출을 `RestTemplate`으로 손수 조립하는 대신, Spring 7의 `@HttpExchange` + `@ImportHttpServices`를 써서 **인터페이스 선언만으로** 넥슨 API 클라이언트를 빈으로 등록했습니다. 베이스 URL과 API 키 헤더는 `RestClientHttpServiceGroupConfigurer`로 한 곳에서 주입합니다.

```java
@HttpExchange("/maplestory/v1")
public interface NexonApiClient {
    @GetExchange("/id")
    NexonOcidResponseDto getCharacterId(@RequestParam("character_name") String name);

    @GetExchange("/character/basic")
    NexonCharacterBasicResponseDto getCharacterBasic(@RequestParam("ocid") String ocid);
}

@Configuration
@ImportHttpServices(types = NexonApiClient.class)   // 인터페이스만으로 클라이언트 빈 등록
public class NexonApiConfig {
    @Bean
    RestClientHttpServiceGroupConfigurer nexonConfigurer() {
        return groups -> groups.forEachClient((group, builder) ->
                builder.baseUrl("https://open.api.nexon.com")
                        .defaultHeader("x-nxopen-api-key", apiKey));
    }
}
```

넥슨 API는 일일 호출 한도가 있어, OCID를 DB에 캐싱해 재검색 시 호출을 건너뛰고, 외부 호출이 일어날 때마다 일자별 호출 수를 누적 기록해 한도를 관제하도록 했습니다.


# AI 요약의 동시성 제어

---

AI 요약은 외부 호출이라 응답이 길고, 짧은 시간에 여러 투표·등록이 몰리면 **같은 캐릭터에 대해 중복 요약이 동시에 생성**될 수 있었습니다. `@Async` + `ConcurrentHashMap` 기반 실행 제어로 "실행 중인 작업"과 "대기 중인 재실행"을 명확히 나눠, 중복 호출은 막으면서도 마지막 요청까지 누락 없이 반영되도록 직접 설계했습니다.

```java
private final Set<Long> running = ConcurrentHashMap.newKeySet();      // 요약 생성 중인 캐릭터
private final Set<Long> pendingRerun = ConcurrentHashMap.newKeySet(); // 실행 중 들어온 재실행 예약

@Async
public void generateSummaryAsync(Long characterId) {
    // 이미 실행 중이면 재실행 플래그만 세우고 리턴 — 중복 생성 차단
    if (!running.add(characterId)) {
        pendingRerun.add(characterId);
        return;
    }
    try {
        doGenerateSummary(characterId);   // 외부 AI 호출은 트랜잭션 밖에서 수행
    } finally {
        running.remove(characterId);
        // 실행 중 추가 요청이 있었으면 한 번 더 — 마지막 상태까지 반영
        if (pendingRerun.remove(characterId)) generateSummaryAsync(characterId);
    }
}
```

한 가지 더 신경 쓴 건 **외부 호출을 트랜잭션 밖에 두는 것**이었습니다. 긴 AI 호출을 DB 트랜잭션 안에서 하면 커넥션이 그 시간만큼 붙잡혀 풀 고갈로 번지기 때문에, 제보 조회와 요약 반영만 `TransactionTemplate`으로 짧게 감싸고 실제 LLM 호출은 그 밖에서 처리했습니다.


# 확장을 염두에 둔 스크래퍼 설계

---

제보의 출처는 인벤 하나였지만, 디시인사이드·에펨코리아 등으로 얼마든지 늘어날 수 있는 축이었습니다. 그래서 스크래핑 로직을 `CommunityScraper` 인터페이스로 추상화하고, `CommunityScraperResolver`가 URL을 보고 적절한 구현체를 골라 주도록 만들었습니다. 새 커뮤니티는 **기존 코드를 건드리지 않고 구현체만 추가**하면 되도록 설계했습니다.

```java
public interface CommunityScraper {
    record ScrapedData(String title, String content, int upvotes) {}

    boolean supports(String url);   // 이 스크래퍼가 처리할 수 있는 URL인지
    void validateUrl(String url);
    ScrapedData scrape(String url);
    int getMinUpvotes();            // 등록에 필요한 최소 추천 수
}

@Component
@RequiredArgsConstructor
public class CommunityScraperResolver {
    private final List<CommunityScraper> scrapers;  // 구현체 전부 주입

    public CommunityScraper resolve(String url) {
        return scrapers.stream()
                .filter(s -> s.supports(url))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("현재 지원하지 않는 사이트입니다."));
    }
}
```

서비스 계층은 `InvenScraper`라는 구체 클래스를 전혀 모른 채 오직 인터페이스에만 의존하도록 했습니다. 의존성 역전 원칙(DIP)이 단순한 이론이 아니라 향후 기능 추가 비용을 실제로 낮추는 도구라는 걸, 확장점을 명시적으로 분리해 보며 체감했습니다.


# 사용된 기술

---

- **Backend** — Java 25 · Spring Boot 4 · Spring Web MVC · Spring Data JPA · Spring AI(Gemini) · jsoup(스크래핑) · MySQL
- **Frontend** — React 19 · TypeScript · Vite · Tailwind CSS 4 · TanStack Query · React Router · Axios · galmuri(픽셀 폰트) · Vercel Analytics / Speed Insights
- **Infra** — AWS EC2 · Docker / Docker Compose / DockerHub · Caddy(HTTPS · 리버스 프록시) · GitHub Actions · Vercel · DuckDNS


# 인프라 · 배포

---

- AWS EC2에 **Docker Compose 3-컨테이너**(Spring Boot 앱 · MySQL · Caddy)로 배포했습니다. Caddy가 HTTPS 리버스 프록시를 맡아 `maecheat.duckdns.org`로 자동 인증서를 발급하도록 구성했습니다.
- **GitHub Actions 무중단 CI/CD** — main 브랜치 push 시 DockerHub 이미지를 빌드·푸시하고, EC2에 SSH로 접속해 `docker compose up -d --no-deps app`으로 앱 컨테이너만 무중단 교체하도록 자동화했습니다.
- 프론트엔드는 Vercel에 배포하고 `maecheat.com` 도메인·환경 변수를 연결했습니다.


# 성과

---

만들어 두는 데서 그치지 않고, 실제로 서비스를 열어 운영하며 사용자 트래픽을 확보했습니다.

- **실사용 트래픽** — 누적 방문자 약 1만, 페이지뷰 약 8.5만, **이탈률 7%**를 기록했습니다. 낮은 이탈률은 "닉네임 검색 → 평판 확인"이라는 핵심 동선이 실제로 소비됐다는 신호였습니다. (Vercel Analytics 기준, 피크 시간대 12시간 86K 엣지 요청)
- **누적 데이터** — 약 200개 캐릭터에 355건의 제보가 등록됐고, 커뮤니티의 추천·비추천으로 신뢰도 낮은 글은 자동 숨김되며 자정됐습니다.
- **AI 파이프라인의 실전 검증** — 등록 시 AI 연관성 판단이 무관한 인벤 게시글을 걸러 내고, 추천 점수 변화마다 요약이 비동기로 재생성되는 흐름이 운영 트래픽 속에서 안정적으로 동작했습니다.

![Vercel Analytics — 방문자 · 페이지뷰 · 이탈률](/content/projects/maecheat/analytics.png)

![Vercel Edge Requests — 12시간 트래픽 추이](/content/projects/maecheat/edge-requests.png)


# 배운 점

---

## 전략 패턴과 확장성

커뮤니티 스크래핑을 인터페이스로 추상화하고 Resolver가 구현체를 골라 주는 구조 덕분에, 새 커뮤니티를 붙일 때 기존 코드를 건드리지 않고 확장점만 늘리면 됐습니다. DIP가 "미래의 변경 비용을 지금 낮춰 두는 도구"라는 걸 이론이 아니라 실제 확장 지점으로 확인했습니다.

## 비동기 작업의 동시성 제어

응답이 긴 외부 호출을, 짧은 시간에 몰리는 트리거 속에서 안전하게 다루는 문제를 직접 풀어 봤습니다. "지금 실행 중"과 "대기 중 재실행"을 분리한다는 아이디어를 코드로 구현하며, 동시성은 도구를 아는 것보다 **경합이 생기는 지점을 정확히 짚는 것**이 먼저라는 걸 배웠습니다.

## 1인 풀스택 + 인프라까지

기획의 의사결정이 스키마 → API → 화면 → 파이프라인으로 일관되게 흐르는 과정을 처음부터 끝까지 통제하면서, 레이어 사이의 트레이드오프(어디까지 백엔드에서 검증하고 어디부터 프론트에서 막을지)를 매번 능동적으로 결정해야 했습니다. Spring 백엔드 · React 프론트 · Docker·Caddy·GitHub Actions로 이어지는 전 과정을 한 사이클 돌려 본 경험은, 한 영역만 다룰 때는 보이지 않던 **시스템 전체의 시야**를 갖게 해 주었습니다.


# 프로젝트 이미지

---

![메인 — 캐릭터 닉네임 검색](/content/projects/maecheat/main.png)

![캐릭터 상세 — 관련 게시글과 AI 한 줄 요약](/content/projects/maecheat/character-detail.png)
