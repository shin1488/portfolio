---
title: 통합 부품 관리 ERP
summary: >-
  본사·지점·현장(모바일) 3채널의 자동차 부품 관리 ERP를 5인 팀이 MSA로 구축.
  PM을 겸하며 재고 서비스(Inventory), AI 챗봇(AiChat), 인프라를 담당했습니다.
period:
  from: "2026.05"
  to: "2026.06"
techStack: [Java 25, Spring Boot 4, Spring AI 2.0, MCP, PostgreSQL, Keycloak, Docker, AWS ECS]
highlights:
  - '재고 정확성 3종 — 조건부 원자적 UPDATE(동시성), Idempotency-Key 2겹 방어(멱등성), REPEATABLE READ 원장 재생 검증(정합성)'
  - 'Spring AI 2.0 + MCP 챗봇 — RFC 8693 토큰 교환(OBO)으로 사용자 권한 위임, 쓰기는 딥링크+prefill 핸드오프'
  - 'Docker Compose 12컨테이너 오케스트레이션과 AWS ECS Fargate 배포, Keycloak 인증 인프라'
  - 'PM으로서 에러 응답(RFC 9457)·멱등키·API 응답 등 팀 컨벤션 표준 주도'
links:
  - label: GitLab
    href: https://gitlab.com/shin1488-group
kind: team
thumbnail: /content/projects/erp-project/hq-dashboard.png
order: 1
---

# 프로젝트 소개

---

## 통합 부품 관리 ERP란?

- 현대오토에버 모빌리티SW스쿨 웹/앱 3기 4차 프로젝트로, "자동차 부품사의 통합 부품 관리 ERP 구축 수행사로 선정되었다"는 시나리오 아래 5인 팀이 약 5주간 요구사항 분석부터 배포까지 수행한 프로젝트입니다.
- 핵심 요구사항은 세 가지였습니다 — ① **재고 가시성 통합**(본사에서 전국 지점·대리점 재고를 실시간 관제), ② **발주·배송 자동화**(지점의 발주 요청부터 출고·배송까지 시스템 내 처리), ③ **부품 추적성 확보**(입고부터 출고까지 전 이력화).
- 본사 웹 · 지점 웹 · 현장 모바일(바코드/QR 스캔) 3채널을 지원하며, 백엔드는 도메인별 6개 마이크로서비스(User/Item/Inventory/Procurement/Sales/AiChat) + Gateway로 구성했습니다.

![통합 대시보드](/content/projects/erp-project/dashboard.png)


## 담당 역할

- **PM** — 일정·범위 관리와 팀 컨벤션 주도. Spring Boot 4·Spring AI 2.0 같은 갓 릴리스된 스택을 쓰기로 한 만큼 사소한 것까지 팀 컨벤션으로 정하였습니다. API 응답 / 에러 표준, JWT 검증, 시간 처리 등 7개 항목을 문서화하고 6개 서비스에 일관 적용했습니다.
- **Inventory(재고·창고 서비스)** — 재고 5종 변동, 동시성·멱등성·정합성 설계, 소속(tenancy) 데이터 격리.
- **AiChat(챗봇 서비스)** — Spring AI 2.0 + MCP 기반 ERP 어시스턴트. 5개 서비스의 도구를 수집해 조회·안내를 수행합니다.
- **Infra** — Docker Compose 12컨테이너 오케스트레이션(6서비스 + Gateway + Frontend + PostgreSQL/Redis/Keycloak/Adminer), AWS ECS Fargate 배포, Keycloak 인증 인프라.


# 시스템 아키텍처

---

![시스템 아키텍처](/content/projects/erp-project/architecture.png)

- **ALB → Gateway(:8080) → 도메인 서비스 5개 + AiChat**. Gateway는 웹에는 BFF(HttpOnly 세션 쿠키, 토큰은 서버 세션에만 존재), 모바일에는 Resource Server(Bearer JWT)로 동작하는 이중 역할입니다.
- 인증은 **Keycloak(OIDC)** 단일 IdP로 통합 — 웹은 Authorization Code, 모바일은 PKCE, 챗봇의 도구 호출은 RFC 8693 토큰 교환을 사용합니다.
- 서비스별 독립 DB(PostgreSQL), 서비스 디스커버리는 Cloud Map, 세션·캐시는 Redis(ElastiCache)를 사용했고, AWS ECS Fargate에 배포했습니다.

로컬 개발은 Docker Compose로 12개 컨테이너를 한 번에 띄우고, 운영 배포는 단일 ECS 클러스터에 서비스별 태스크를 올리는 형태입니다. 아래는 클러스터에 배포된 9개 서비스가 모두 정상(활성 · 1/1 실행 중)으로 떠 있는 상태입니다.

![ECS 클러스터에 배포된 서비스 목록](/content/projects/erp-project/ecs-services.png)


# "신기술, 그러므로 강력한 컨벤션."

---

팀의 기술 캐치프레이즈입니다. Spring AI 2.0 · Spring Boot 4 · Java 25처럼 갓 나온 스택은 강력하지만, 정립된 표준도 정형화된 패턴도 없어 같은 기능도 팀원마다 제각각 구현되기 쉽습니다. 그래서 도입한 기술 하나하나의 디테일 — 외부 도메인 통신 · JWT 검증 · 에러 응답 · 멱등키 · 시간 처리까지 — 을 팀 컨벤션으로 못 박았습니다.

![팀이 작성한 컨벤션 문서 목록](/content/projects/erp-project/convention-docs.png)

주제별로 정리한 실제 팀 컨벤션 노션 문서 일부입니다.

- **⭐️API · 에러 표준⭐️**
  - 📄 [API 응답 / 에러 표준](https://shin-workspace.notion.site/API-36efded21c4080d6b620d1390f8aac4e)
- **서비스 간 통신**
  - 📄 [MSA 외부 도메인 통신 컨벤션 (v1.2)](https://shin-workspace.notion.site/MSA-v1-2-369fded21c40804780f0c7a900b3596e)
  - 📄 [외부 도메인 Mock Client 작성 가이드 (v1.1)](https://shin-workspace.notion.site/Mock-Client-v1-1-375fded21c4080398c30c3a7292c530e)
- **인증 · 인가**
  - 📄 [Keycloak JWT 검증 팀 컨벤션 (v2.8)](https://shin-workspace.notion.site/Keycloak-JWT-v2-8-372fded21c40803d8d23dd4cf53961f0)
- **데이터 · 상태**
  - 📄 [멱등키 호출 규약 (전 서비스 공통)](https://shin-workspace.notion.site/37ffded21c408058a552ddc64eb3bb74)
  - 📄 [시간(Time) 처리 컨벤션](https://shin-workspace.notion.site/Time-36ffded21c4080cea934d6d55e46e218)
  - 📄 [Redis(ElastiCache) 사용 컨벤션 (v1.2)](https://shin-workspace.notion.site/Redis-ElastiCache-v1-2-373fded21c4080d8a820e66ed6ca90c7)

가장 공을 들인 건 에러 응답 표준입니다. MSA에선 서비스마다 에러 포맷이 난립하기 쉬운데, 문제는 스프링·서블릿 구조상 예외가 **세 갈래로 흩어진다**는 것이었습니다 — MVC 밖으로 빠진 에러는 서블릿 컨테이너가, 인증·인가 실패는 시큐리티 필터가, 도메인·검증 예외는 디스패처 안 `@RestControllerAdvice`가 받습니다. 이 세 길목을 모두 막아 어디서 발생하든 같은 `ProblemDetail`(RFC 9457) 포맷으로 수렴시켰고, 클라이언트와 서비스 간 통신 모두 분기 없이 에러 코드 하나로 일관되게 처리할 수 있게 됐습니다.


# "AI를 통해 UX를 개선하고, 나아가 AX를 꾀하다"

---

팀의 서비스 캐치프레이즈이고, 이를 **AiChat**으로 구현했습니다. 사용자가 모든 기능과 화면 위치를 숙지하지 않아도, 챗봇에게 질의하면 데이터를 조회해 주고 실제 업무 화면까지 데려다줍니다.

![부족 재고 → 구매 요청 prefill](/content/projects/erp-project/chatbot-prefill.png)

"부족 재고 신청해줘" 한 마디면 ① 챗봇이 MCP 도구로 안전재고 미만 품목을 조회해 표로 정리하고 ② 답변 하단의 버튼으로 구매 요청 화면에 이동하며 ③ 조회된 16개 품목·수량이 폼에 **prefill**됩니다. 사용자는 검토하고 저장만 하면 됩니다.


## 답변을 그대로 업무로 — 표 복사·차트 저장

조회 결과를 다시 옮겨 적지 않아도 되도록, 챗봇 답변의 표와 차트를 화면 밖으로 그대로 꺼낼 수 있게 했습니다. 표는 서식을 유지한 채 복사돼 문서·스프레드시트에 바로 붙고, 차트는 우측 상단 버튼 한 번으로 이미지로 저장됩니다.

![챗봇 답변의 표를 복사해 문서에 붙여넣은 결과](/content/projects/erp-project/chatbot-table-paste.png)

![부족·품절 재고 비중 차트 — 우측 상단 버튼으로 이미지 저장](/content/projects/erp-project/chatbot-chart-download.png)


## 쓰기는 원천 차단, 안내는 딥링크로

LLM에게 쓰기 권한을 주는 대신, **쓰기 도구 자체를 노출하지 않는 것**을 유일한 하드 보장으로 삼았습니다. 프롬프트로 "쓰지 마"라고 부탁하는 게 아니라, 모델이 받는 도구 목록에 입고·출고·조정 같은 쓰기 메서드가 처음부터 없습니다 — 우회를 하든 jailbreak를 하든 없는 도구는 부를 수 없으니, 잘못된 데이터가 쓰일 여지 자체가 사라집니다. 쓰기 요청이 오면 거절하는 게 아니라 구조화된 `action` 블록(딥링크 + prefill)으로 기존 인증·검증을 모두 거치는 화면에 안내하고, 프론트는 경로 allowlist로만 이동을 허용합니다.

````text
[화면 안내 액션 — 시스템 프롬프트 발췌]
당신은 직접 쓰기를 하지 않으므로(쓰기 도구 없음), 쓰기 요청도 거절하지 말고 해당 화면으로 안내합니다.
```action
{"type":"navigate","path":"<경로>","label":"<버튼 문구>","prefill":{ ... }}
```
````


## 챗봇의 권한 문제 — RFC 8693 Token Exchange(OBO)

챗봇은 자기 권한을 갖지 않습니다. 요청자가 매번 다르고, 권한도 소속도 매번 다르기 때문입니다. 원본 사용자 토큰을 하위 서비스에 그대로 넘기는 passthrough는 MCP 스펙이 금지하는 안티패턴이라, **도구 호출(tools/call)에만 사용자 토큰을 RFC 8693 token exchange로 교환해 부착**하고, 프로토콜 요청(initialize·tools/list 등)은 서비스 토큰으로 분리했습니다. 사용자 컨텍스트가 없으면 서비스 토큰으로 fallback하지 않고 실패시킵니다 — 지점 직원의 질의가 전사 데이터로 새는 tenancy 누수를 막기 위해서입니다.

```java
@Override
public void customize(HttpRequest.Builder builder, String method, URI endpoint, String body,
                      McpTransportContext context) {
    if (isToolCall(body)) {
        Authentication user = SecurityContextHolder.getContext().getAuthentication();
        if (user == null || !user.isAuthenticated() || user instanceof AnonymousAuthenticationToken) {
            throw new IllegalStateException(
                    "도구 호출에 사용자 인증 컨텍스트가 없습니다 — 서비스 토큰 fallback 없이 실패(tenancy 누수 방지)");
        }
        attachBearer(builder, tokenExchangeManager.authorize(
                OAuth2AuthorizeRequest.withClientRegistrationId(tokenExchangeRegistrationId)
                        .principal(user).build()), tokenExchangeRegistrationId);
    } else {
        // initialize·tools/list·ping 등 사용자 무관 프로토콜 요청 — 서비스 토큰
        attachBearer(builder, serviceManager.authorize(...), serviceRegistrationId);
    }
}
```

신원을 그대로 물려받되, 읽는 범위는 두 겹으로 좁힙니다. 발주·공급사처럼 본사 전용 업무는 도구 메서드 첫 줄에서 `requireHqRole()`로 본사 역할을 확인하고, 지점 소속 인원은 자기 소속 현황만 조회할 수 있습니다. 핵심은 이 규칙이 챗봇이 아니라 **서비스 계층에 박혀 있다**는 것 — REST로 부르든 챗봇으로 부르든 똑같이 적용되므로, 챗봇이 권한을 우회하거나 늘리는 통로가 되지 않습니다.


## LLM 에이전트 루프 방어 2종

- **도구 예외의 JSON 변환** — Spring AI 기본 구현은 도구 실행 실패를 평문으로 LLM에 돌려주는데, Gemini는 도구 응답을 JSON으로 파싱하므로 평문이 오면 채팅 전체가 깨졌습니다. `ToolExecutionExceptionProcessor`를 교체해 `{"error": "..."}` JSON으로 감싸 반환하니, 모델이 실패 원인을 읽고 자연어로 설명해 주는 우아한 실패가 됐습니다.
- **도구 호출 라운드 상한** — "전부 보여줘"류 질의나 에러 반복 시 에이전트 루프가 폭주해 지연·비용이 커집니다. Spring AI에 빌트인 상한이 없어 `ToolExecutionEligibilityChecker`에 라운드 카운터를 달아 상한 초과 시 루프를 끊고 범위를 좁혀 달라는 안내로 대체했습니다.


# Inventory — 정확성이 전부인 도메인

---

![Inventory ERD](/content/projects/erp-project/erd-inventory.png)

재고 도메인의 설계 원칙은 하나였습니다 — **현재고는 이동 원장(stock_movement)의 파생값이고, 그 값은 어떤 동시성·재시도·장애 상황에서도 틀리면 안 된다.** 이를 세 겹으로 보장했습니다.


## 동시성 — 조건부 원자적 UPDATE

조회 → 검증 → 차감이 분리되면 그 틈(TOCTOU)에 다른 요청이 끼어들어 없는 재고를 팔 수 있습니다. `SELECT ... FOR UPDATE`(비관적 락)는 정확하지만 인기 품목 한 행에 트래픽이 몰리면 전 요청이 직렬화되고, 여러 품목의 락 순서가 꼬이면 데드락이 납니다. 검증과 차감을 **DB의 한 UPDATE 문장**으로 합쳐 원자적으로 처리했습니다.

```java
@Modifying(clearAutomatically = true)
@Query("""
        update Stock s
           set s.currentStock = s.currentStock - :quantity,
               s.updatedAt = :now
         where s.warehouse.id = :warehouseId
           and s.sku = :sku
           and s.currentStock - s.reserved >= :quantity
        """)
int decreaseStock(@Param("warehouseId") Long warehouseId, @Param("sku") String sku,
                  @Param("quantity") int quantity, @Param("now") OffsetDateTime now);
```

가용이 부족하면 0행 갱신 — affected rows가 그대로 성공/실패 판정값이 됩니다. 락은 UPDATE~커밋의 짧은 구간만 잡히고, 단일 문장이라 데드락도 없으며, 애플리케이션 락 코드가 0줄입니다. 비관적 락이 정확성을 처리량으로 지불했다면, 이 방식은 검증과 갱신을 애플리케이션이 아니라 DB의 원자적 연산에 맡겨 **정확성과 처리량을 함께 확보**합니다 — 동시성 문제를 우회한 게 아니라 발생할 구간 자체를 없앴습니다.


## 멱등성 — Idempotency-Key + fingerprint 2겹

응답이 유실(타임아웃)되면 클라이언트는 성공 여부를 모른 채 재시도하고, 첫 요청이 성공했었다면 출고가 이중 차감됩니다. 재고 변동 5종 전부에 `Idempotency-Key` 헤더를 요구하고, **선점 INSERT를 원자적 claim**으로 사용했습니다.

```sql
insert into idempotency_record
    (type, idempotency_key, principal, request_fingerprint, status, created_at, updated_at)
values
    (:type, :idempotencyKey, :principal, :fingerprint, 'IN_PROGRESS', :now, :now)
on conflict (type, idempotency_key, principal) do nothing
```

- claim·업무·완료 기록을 **한 트랜잭션**에 묶어 크래시 시 통째로 롤백 — 고아 IN_PROGRESS가 없습니다.
- 중복 요청은 재실행 없이 저장된 응답을 **replay**하고, 같은 키에 다른 payload(키 재사용)는 body 해시(fingerprint) 불일치로 422를 반환합니다.
- 이력 테이블의 유니크 제약이 영구 백스톱 — 멱등 레코드(요청 계층) + 원장 유니크(데이터 계층)의 2겹 방어입니다.


## 정합성 — 자정 미니 정산 (REPEATABLE READ)

파생값은 드리프트할 수 있으므로, 매일 자정 원장을 재생해 현재고와 대조하는 정산을 돌립니다. 행별 독립 트랜잭션을 `REPEATABLE READ`로 열어 **락 없이 같은 스냅샷**에서 current_stock과 원장 합을 읽고, 증분 커서(last_movement_id)로 직전 정산 이후분만 재생합니다. 불일치는 MISMATCH로 append-only 기록됩니다.

```java
@Transactional(isolation = Isolation.REPEATABLE_READ)
public StockReconciliation reconcile(Long stockId) {
    // 직전 정산의 커서(last_movement_id) 이후 이동분만 재생
    int expected = baseline + stockMovementRepository.sumQuantityChangeAfter(sku, warehouseId, cursor);
    int actual = stock.getCurrentStock();
    ReconciliationStatus status = expected == actual ? MATCHED : MISMATCH;
    // 스냅샷 이후 들어온 이동(id가 더 큼)은 다음 회차로 밀린다
    ...
}
```


## 소속 데이터 격리 (Tenancy)

지점(BRANCH) 사용자는 자기 지점 창고만, 본사(HQ)는 전체를 봅니다. 컨트롤러마다 if를 흩뿌리는 대신 `TenancyScope` 한 곳에서 요청 스코프를 강제하고, 소속 외 리소스는 존재 여부를 숨기기 위해 404로 응답합니다. BRANCH인데 소속 코드가 해석되지 않으면 전체 공개가 아니라 **빈 결과로 fail-closed**합니다.


# 사용된 기술

---

- **Backend** — Java 25 LTS · Spring Boot 4.0.6 · Spring AI 2.0 GA(MCP) · JPA/Hibernate · PostgreSQL 18 · Redis 8
- **Auth** — Keycloak 26 (OIDC · 웹 BFF 세션 + 모바일 Bearer/PKCE · RFC 8693 Token Exchange)
- **Infra** — Docker Compose · AWS ECS Fargate · ALB · RDS · ElastiCache · Cloud Map · GitLab
- **LLM** — Gemini (Spring AI ChatClient + MCP 도구 호출)
- **Frontend(팀)** — React 19 · Vite · TanStack Query · Tailwind 4 / **Mobile(팀)** — Android

Spring AI 2.0 GA(2026-06-12 릴리스)를 릴리스 직후 도입했습니다. 커뮤니티 레퍼런스가 거의 없어 공식 문서를 1차 소스로 삼는 습관과, 신기술일수록 컨벤션을 강하게 잡아야 한다는 교훈을 얻었습니다.


# 성과

---

- 요구사항 달성률: User·Procurement·Sales 100%, Item 95.7%, Inventory 89.5%
- 100+ 항목 QA, Playwright E2E 테스트
- **부족 재고 → 자동 발주**: 판매 승인 시 전 창고 재고 부족을 감지해 구매 요청서 prefill로 이어지는 MSA 3서비스 횡단 플로우
- 챗봇 답변의 표 복사·차트 다운로드·딥링크 액션 등 실무형 UX


# 배운 점

---

## 트랜잭션 경계와 예외 (개인 발표 주제)

재고 차감은 여러 부품을 한 번에 처리하는데, **한 라인이라도 가용이 부족하면 전체를 거부**해야 합니다(all-or-nothing). 라인별로 조건부 원자적 UPDATE(`decreaseStock`)를 돌리다 0행 갱신(부족)이 나오면 실패로 모아 두고, 루프 끝에서 예외를 던져 지금까지의 차감을 통째로 롤백합니다.

```java
@Transactional
public void consume(String idempotencyKey, StockConsumeRequest request) {
    // ...
    List<String> failed = new ArrayList<>();
    for (ConsumeItem item : sorted) {                    // sku 정렬 순서로 차감 → 락 순서 고정(데드락 방지)
        int affected = stockRepository.decreaseStock(
                warehouse.getId(), item.sku(), item.quantity(), now);
        if (affected == 0) failed.add(item.sku());        // 조건부 UPDATE가 0행 → 실패 수집
    }
    if (!failed.isEmpty()) {
        // 실패 원인 분기: 미취급(행 없음) → 404, 가용 부족 → 422. 예외로 전체 롤백.
        if (!notFound.isEmpty()) throw new StockNotFoundException("없는 sku입니다: " + notFound);
        throw new StockAvailableInsufficientException("가용재고가 부족한 sku입니다: " + failed);
    }
    recordFlow(...);   // 전부 성공한 경우에만 도달 — 사용 이력 기록
}
```

문제는 여기서 실패를 **어떻게 알리느냐**에 따라 롤백이 되기도, 안 되기도 한다는 것이었습니다. 이 버그를 쫓다가 트랜잭션 롤백 규칙을 개인 발표 주제로 삼았습니다.

트랜잭션 프록시는 메서드가 어떻게 빠져나가는지로 가릅니다 — **정상 return과 checked 예외는 커밋, RuntimeException/Error만 롤백**입니다. checked=커밋은 직관과 반대인데, 업무상 예상된 예외는 작업이 유효한 것으로 본 EJB 시절 관례를 이어받은 기본값입니다. 즉 실패를 checked 예외나 `return`으로 알리면 프록시는 정상 종료로 보고 앞서 적용된 차감을 커밋해 버립니다 — 일부만 빠진 재고는 정합성이 깨진 상태입니다. 그래서 도메인 예외를 전부 RuntimeException으로 통일했습니다.

```java
public class StockAvailableInsufficientException extends RuntimeException {
    public StockAvailableInsufficientException(String message) { super(message); }
}
```

이유는 셋 — ① `throw`만으로 롤백이 기본이 되고(메서드마다 `rollbackFor`를 챙길 필요 없음), ② 중간 계층 시그니처가 `throws`로 오염되지 않으며, ③ 예외 처리가 전역 핸들러 한 곳으로 모입니다. 던진 예외는 `@RestControllerAdvice`가 받아 `ErrorCode` 하나에서 status와 code를 함께 꺼내 `ProblemDetail`로 변환합니다.

```java
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
    @ExceptionHandler(StockAvailableInsufficientException.class)   // 가용 부족 → 422
    public ProblemDetail handle(StockAvailableInsufficientException e) {
        return problem(StockErrorCode.STOCK_AVAILABLE_INSUFFICIENT, e.getMessage());
    }
    // status·code가 enum 상수 하나에 묶여 있어 둘이 어긋날 수 없다
    private ProblemDetail problem(ErrorCode code, String detail) {
        ProblemDetail p = ProblemDetail.forStatusAndDetail(code.status(), detail);
        p.setProperty("code", code.code());
        p.setProperty("timestamp", OffsetDateTime.now(clock));
        return p;
    }
}
```

마지막으로 함정이 둘 — 트랜잭션 안에서 예외를 `try-catch`로 삼키면 프록시는 정상으로 보고 커밋하고(롤백시키려면 예외가 경계를 탈출해야 함), 반대로 내부 메서드가 던진 순간 찍히는 `rollback-only` 때문에 바깥에서 예외를 삼켜도 커밋 시점에 `UnexpectedRollbackException`이 터집니다. "잡았는데 왜 롤백되지?"의 정체입니다.


## 외부 호출은 트랜잭션 밖으로

API/MQ 호출을 DB 트랜잭션 안에서 하면 외부 지연이 커넥션 풀 고갈로 전파됩니다. 서비스 간 동기 호출(RestClient + @HttpExchange)은 전부 트랜잭션 밖으로 배치하는 것을 팀 규칙으로 삼았고, 향후 outbox/saga·서킷브레이커(Resilience4j) 도입을 개선 방향으로 정리했습니다.


# PM으로서

---

역할·소속·화면이 여러 갈래로 나뉘는 시스템을 5명이 서비스 단위로 나눠 개발하다 보니, 에러 포맷·멱등·인증 및 인가 같은 규칙이 서비스마다 어긋나기 쉬웠습니다. 게다가 앞서 말했듯 정립된 표준이 없는 신기술을 쓰는 만큼, 이 규칙들을 팀 차원에서 하나로 못 박아 줄 '컨벤션'이 반드시 필요했습니다.

그러려면 누군가 먼저 기술에 부딪히며 기준을 세워야 한다고 생각했습니다. 팀에 잘못된 방향을 제시하지 않으려면 단순히 먼저 알아보는 수준을 넘어, 여러 가능성을 대조하고 철저하게 사실관계를 검증하며 컨벤션을 다듬어야 했습니다. 팀원들에게 확실한 근거를 제시하고자 집요하게 파고들었던 이 시간은, 돌이켜보니 저 자신의 기술적 이해도를 가장 높여준 자산이 되어 있었습니다.

고맙게도 팀원들이 잘 따라와 준 덕에 프로젝트를 성공적으로 마무리할 수 있었고, 이 과정에서 '기술적 리더'로서의 책임감과 팀을 이끄는 감각을 함께 익힐 수 있었던 좋은 경험이 되었다고 생각합니다.


# 프로젝트 이미지

---

## 공통 · 마스터

![로그인](/content/projects/erp-project/login.png)

![부품 마스터](/content/projects/erp-project/item-master.png)

![창고 마스터](/content/projects/erp-project/warehouse-master.png)


## 본사

![본사 통합 대시보드](/content/projects/erp-project/hq-dashboard.png)

![재고 관리 · 조정](/content/projects/erp-project/admin-stock.png)

![구매 요청 현황](/content/projects/erp-project/purchase-status.png)

![판매 요청 현황](/content/projects/erp-project/sales-status.png)

![공급사 목록](/content/projects/erp-project/vendor-list.png)

![나의 작업 이력](/content/projects/erp-project/hq-worklog.png)


## 지점

![지점 대시보드](/content/projects/erp-project/branch-dashboard.png)

![구매 요청 접수](/content/projects/erp-project/purchase-request.png)

![지점 매니저 승인](/content/projects/erp-project/branch-approval.png)


## AI 챗봇

![챗봇 · 부족 재고 발주 요청서 생성 (표 · 차트 · 딥링크)](/content/projects/erp-project/chatbot-shortage-order.png)

![챗봇 · 전사 부족·품절 재고 조회 (표 복사)](/content/projects/erp-project/chatbot-shortage-all.png)

![챗봇 · 발주 상세 조회](/content/projects/erp-project/chatbot-po.png)

![챗봇 · 최근 발주 목록 조회](/content/projects/erp-project/chatbot-po-list.png)

![챗봇 · 단일 품목 발주서 작성 안내](/content/projects/erp-project/chatbot-single-order.png)

![챗봇 · 쓰기 요청은 거절 대신 작성 화면으로 안내](/content/projects/erp-project/chatbot-write-block.png)


## 모바일

![모바일 · 홈](/content/projects/erp-project/mobile-home.jpg)

![모바일 · QR 입고 스캔](/content/projects/erp-project/mobile-scan.jpg)

![모바일 · 재고 조회](/content/projects/erp-project/mobile-stock.jpg)

![모바일 · 마이페이지](/content/projects/erp-project/mobile-mypage.jpg)

![모바일 · 작업 이력](/content/projects/erp-project/mobile-worklog.jpg)


# 발표 자료 · 영상

---

[전체 발표 슬라이드](/files/erp-project-presentation.pdf)

[웹 시연](https://youtu.be/tXZphdlfiLU)

[모바일 시연](https://youtube.com/shorts/V2bXpBBMT38)
