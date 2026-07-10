---
title: 통합 부품 관리 ERP
summary: >-
  자동차 부품사의 재고·발주·판매를 본사 웹 · 지점 웹 · 현장 모바일 3채널로 관리하는 MSA 기반 통합 ERP.
  5인 팀에서 PM을 겸하며 재고 서비스(Inventory)·AI 챗봇(AiChat)·인프라를 담당했습니다.
period:
  from: "2026.05"
  to: "2026.06"
techStack: [Java 25, Spring Boot 4, Spring AI 2.0, MCP, PostgreSQL, Keycloak, Docker, AWS ECS]
highlights:
  - 'Spring AI 2.0 + MCP 챗봇 — RFC 8693 토큰 교환(OBO)으로 사용자 권한 위임, 쓰기는 딥링크+prefill 핸드오프'
  - '재고 정확성 3종 — 조건부 원자적 UPDATE(동시성), Idempotency-Key 2겹 방어(멱등성), REPEATABLE READ 원장 재생 검증(정합성)'
  - '인프라 — Docker Compose 12컨테이너 오케스트레이션, AWS ECS Fargate 배포, Keycloak 인증'
  - 'PM — 에러 응답(RFC 9457)·멱등키·API 응답 등 팀 컨벤션 표준 주도'
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
- 핵심 요구사항은 세 가지였습니다.
  - **재고 가시성 통합** (본사에서 전국 지점·대리점 재고를 실시간 관제)
  - **발주·배송 자동화** (지점의 발주 요청부터 출고·배송까지 시스템 내 처리)
  - **부품 추적성 확보** (입고부터 출고까지 전 이력화)
- 본사 웹 · 지점 웹 · 현장 모바일(QR/바코드 스캔) 3채널을 지원하며, 백엔드는 도메인별 6개 마이크로서비스(User/Item/Inventory/Procurement/Sales/AiChat) + Gateway로 구성했습니다.

![통합 대시보드](/content/projects/erp-project/dashboard.png)


## 담당 역할

5인 팀에서 PM을 겸하며 Inventory · AiChat · Infra 세 축을 담당했습니다.

- **PM** — 일정·범위 관리와 팀 컨벤션 주도. Spring Boot 4·Spring AI 2.0 등 최신 버전을 도입하기로 결정한 만큼 사소한 것까지 팀 컨벤션으로 정했습니다. API 응답 / 에러 표준, JWT 검증, 시간 처리 등 7개 항목을 문서화하고 6개 서비스에 일관 적용했습니다.
- **Inventory(재고·창고 서비스)** — 재고 5종 변동, 동시성·멱등성·정합성 설계, 소속(tenancy) 데이터 격리.
- **AiChat(챗봇 서비스)** — Spring AI 2.0 + MCP 기반 ERP 어시스턴트. 5개 서비스의 도구를 수집해 조회·안내를 수행합니다.
- **Infra** — Docker Compose 12컨테이너 오케스트레이션(6서비스 + Gateway + Frontend + PostgreSQL·Redis·Keycloak·Adminer), AWS ECS Fargate 배포, Keycloak 인증 인프라.


# 주요 기능

---

## 부품 · 창고 · 공급사 마스터

부품과 창고를 목록 · 상세 · 등록 화면으로 관리하고, 발주처가 되는 공급사도 같은 구조로 관리합니다. 부품 마스터는 전 지점이 열람하는 공통 정보이고, 나머지 업무 데이터는 소속 지점 범위로 접근이 제한됩니다.

## 재고 관리

본사는 전국 지점·대리점의 재고를 통합 조회하고, 안전재고 미만 · 품절 품목을 필터로 관제합니다. 재고를 바꾸는 다섯 가지 변동(입고 · 출고 · 지점입고 · 사용 · 조정)은 전부 이동 원장에 이력으로 남고, 조정 화면에서 실사 수량 보정도 처리합니다.

## 구매 관리

지점은 부족 · 품절 재고를 선택해 담거나 전체 품목을 검색해 구매 요청서를 작성합니다. 요청서는 지점 매니저 승인을 거쳐 본사로 넘어가고, DRAFT · 반려 · 취소 상태로 관리되어 수정과 삭제가 가능하며, 본사 처리 후 입고 확인까지 시스템 안에서 이어집니다.

## 판매 관리

본사 매니저는 판매 요청 승인 화면에서 창고별 가용성(안전재고 − 가용재고)을 확인합니다. 재고가 부족하면 '부족분 발주' 버튼이 구매 요청 접수 화면으로 안내하며 부족 품목과 수량 · 단가를 미리 채워 줍니다. 입고가 끝나면 같은 화면이 '승인 가능' 상태로 바뀝니다.

## 나의 할 일

승인 · 입고처럼 사용자가 처리해야 할 작업을 역할별 분류 카드로 한 페이지에 모았습니다. 본사는 구매 승인 · 입고 처리 · 판매 승인을, 지점은 지점 구매 승인과 입고 처리를 확인하고, 각 건을 눌러 처리 화면으로 바로 이동할 수 있습니다. 분류는 역할에 따라 달라져, 승인 권한이 없는 지점 직원에게는 입고 처리만 노출됩니다.

## 사용자 · 권한 관리

관리자는 사용자를 등록 · 수정하고 임시 비밀번호를 발급합니다. 최초 로그인 시에는 비밀번호 변경을 강제하며, 본사 · 지점 매니저 · 지점 직원 역할에 따라 사이드바 메뉴와 데이터 접근 범위가 달라집니다.

## 대시보드 · 화면 동선

본사와 지점 대시보드는 부족 재고 · 할 일 같은 지표를 숫자로 보여줍니다. 카드나 활동 막대를 클릭하면 필터와 섹션 상태를 얹은 딥링크로 해당 화면에 진입하고, focus 파라미터로 그 섹션까지 스크롤해 강조합니다. 상세 화면의 브레드크럼은 현재 위치를, 뒤로가기는 진입점 복귀를 맡도록 분리해 어디서 들어왔든 원래 자리로 돌아갑니다. 모든 모션은 OS의 '모션 줄이기(prefers-reduced-motion)' 설정을 따릅니다.

## 현장 모바일

QR/바코드를 스캔해 입고와 출고를 처리하고, 재고 조회 · 작업 이력 · 마이페이지를 제공합니다. 손이 자유롭지 않은 물류 현장에서 빠르게 조작하도록 화면을 구성했습니다.

## AI 챗봇

자연어로 재고 · 발주를 조회하면 표와 차트로 답합니다. 표 복사와 차트 이미지 저장을 지원해, 답변을 문서 작업에 그대로 옮길 수 있습니다. 부족 재고 발주처럼 쓰기가 필요한 업무는 딥링크 + prefill로 작성 화면까지 안내하고, 답변 하단의 사전 생성 질문 버튼을 눌러 자주 쓰는 질의에 바로 접근할 수 있습니다. 챗봇 창은 드래그해 코너 도킹 · 가장자리 도킹 · 플로팅으로 자유롭게 배치합니다.


# 사용된 기술

---

- **Backend** — Java 25 · Spring Boot 4.0.6 · Spring AI 2.0(MCP) · Spring Data JPA · PostgreSQL 18 · Redis 8
- **Auth** — Keycloak 26.2 (OIDC · 웹 BFF 세션 + 모바일 Bearer/PKCE · RFC 8693 Token Exchange)
- **Infra** — Docker Compose · AWS ECS Fargate · ALB · RDS · ElastiCache · Cloud Map · GitLab
- **LLM** — Gemini 3.5 Flash (Spring AI ChatClient + MCP 도구 호출)
- **Frontend** — React 19 · Vite · TanStack Query · Zustand · Tailwind CSS 4
- **Mobile(팀)** — Kotlin · Jetpack Compose

Spring AI 2.0 GA(2026-06-12 릴리스)를 릴리스 직후 도입했습니다. 커뮤니티 레퍼런스가 거의 없어 공식 문서를 1차 소스로 삼는 습관과, 신기술일수록 컨벤션을 강하게 세워야 한다는 교훈을 얻었습니다.


# 시스템 아키텍처

---

![시스템 아키텍처](/content/projects/erp-project/architecture.png)

**ALB → Gateway(:8080) → 도메인 서비스 5개 + AiChat**으로 구성했습니다. 클라이언트와 만나는 최선단의 ALB가 L7 라우팅과 부하 분산을 맡고, Spring Gateway는 경로 라우팅을 담당하도록 역할을 분리했습니다. Gateway는 동시에 웹에는 BFF(HttpOnly 세션 쿠키, 토큰은 서버 세션에만 존재), 모바일에는 Resource Server(Bearer JWT)로 동작하는 이중 역할입니다. 인증은 **Keycloak(OIDC)** 단일 IdP로 통합해, 웹은 Authorization Code · 모바일은 PKCE · 챗봇의 도구 호출은 RFC 8693 토큰 교환을 사용합니다. 데이터는 **RDS PostgreSQL** 한 인스턴스 안에서 서비스마다 데이터베이스를 분리한 Database-per-Service 구조이고, 서비스 디스커버리는 Cloud Map, 세션·캐시는 Redis(ElastiCache)가 맡습니다.

이렇게 구성한 이유는 세 채널이 6개 서비스를 함께 쓰는 시스템이기 때문입니다. 진입을 Gateway 한 갈래로 모으고 인증을 단일 IdP로 통합하면, 어떤 채널로 들어와도 인증 정책이 한곳에서 관리됩니다. 토큰을 서버 세션에만 두는 BFF 방식 덕분에 웹 브라우저에는 토큰이 전달되지 않아, XSS가 발생해도 토큰 탈취로 이어지지 않습니다. 서비스 간 동기 호출에는 사용자의 JWT를 그대로 전파해, 호출받은 서비스가 같은 JWKS 공개키로 검증하고 그 사용자로 인가합니다.

## 배포

로컬 개발은 Docker Compose로 12개 컨테이너를 한 번에 기동하고, 운영 배포는 단일 ECS 클러스터에 서비스별 태스크를 배치하는 형태입니다. 아래는 클러스터에 배포된 9개 서비스가 모두 정상(활성 · 1/1 실행 중) 상태인 화면입니다.

![ECS 클러스터에 배포된 서비스 목록](/content/projects/erp-project/ecs-services.png)

## 백엔드 구조

백엔드 공통 구조로는 헥사고날 아키텍처의 포트·어댑터 패턴과 레이어드 아키텍처를 결합한 "실용적 DDD"를 채택했습니다. 팀원 간의 숙련도 차이와 5주라는 제한된 기간을 고려했을 때, full-hexagonal 전면 도입은 부담이 크다고 판단했습니다. 그렇다고 팀원들에게 익숙한 레이어드만 사용하기에는 코드 품질이 걱정되었고, SOLID 원칙을 지키며 유연하게 가져갈 방법이 필요했습니다. 그래서 헥사고날의 장점만 살려, 포트 인터페이스는 domain에 · 구현은 infrastructure에 두는 핵심 패턴만 적용해 도메인을 외부 기술로부터 격리했습니다.

![부분 헥사고날 + 레이어드 = 실용적 DDD와 실제 패키지 구조](/content/projects/erp-project/slide-backend-architecture.png)


# AiChat — "AI를 통해 UX를 개선하고, 나아가 AX를 꾀하다"

---

- **문제** — 기존 업무 방식은 모든 부담을 사용자에게 지웠습니다. ERP 기능을 전부 알고 있어야 했고, 원하는 화면까지 메뉴를 단계마다 거쳐 들어가야 했으며, 필요한 값은 하나하나 직접 입력해야 했습니다.
- **해결** — 챗봇에게 자연어로 질의하면 데이터를 조회해 답하고, 필요한 입력까지 대신 채워 실제 업무 화면으로 안내하도록 구현했습니다.
- **결과** — 방문할 페이지와 거쳐야 할 워크플로우를 알지 못해도 자연어 한 마디로 업무를 처리합니다. 네 단계 메뉴를 거치던 발주 신청이 질의 한 줄로 끝납니다.

제목의 문구는 팀의 **서비스 캐치프레이즈**이며, 이를 AiChat으로 구현했습니다. 구조는 도메인 서비스 5개가 각자 MCP 도구를 등록하고, AiChat이 이를 수집해 질문에 맞는 도구를 선택해 호출하는 형태입니다.

![AiChat 구조 — 5개 서비스의 MCP 도구를 수집해 답변 생성](/content/projects/erp-project/slide-mcp-structure.png)

## 한 마디로 발주까지 — 조회·표·딥링크 prefill

![부족 재고 → 구매 요청 prefill](/content/projects/erp-project/chatbot-prefill.png)

부족 재고 신청은 원래 업무 메뉴에서 구매 요청 접수 화면까지 네 단계를 거쳐 들어가, 부족한 품목을 파악하고 수치를 직접 입력해야 하는 업무였습니다. 챗봇 도입 후에는 "부족 재고 신청해줘" 한 마디면 됩니다.

- 챗봇이 MCP 도구로 안전재고 미만 품목을 조회해 표로 정리합니다.
- 답변 하단의 버튼을 누르면 구매 요청 화면으로 이동합니다.
- 조회된 16개 품목과 수량이 폼에 **prefill**되어, 사용자는 검토하고 저장만 하면 됩니다.


## 답변을 그대로 업무로 — 표 복사·차트 저장

조회 결과를 다시 옮겨 적지 않아도 되도록, 챗봇 답변의 표와 차트를 화면 밖으로 그대로 내보낼 수 있게 했습니다. 표는 서식을 유지한 채 복사되어 문서·스프레드시트에 그대로 붙여넣을 수 있고, 차트는 우측 상단의 버튼을 눌러 이미지로 저장할 수 있습니다.

![챗봇 답변의 표를 복사해 문서에 붙여넣은 결과](/content/projects/erp-project/chatbot-table-paste.png)

![부족·품절 재고 비중 차트 — 우측 상단 버튼으로 이미지 저장](/content/projects/erp-project/chatbot-chart-download.png)


# 챗봇 가드레일 — 쓰기 차단 · 권한 위임 · 루프 방어

---

- **문제** — 챗봇이 업무를 돕게 하되, 잘못된 쓰기와 권한·소속(tenancy) 누수의 여지는 원천적으로 없어야 했고, 도구 실행 오류와 끝없는 에이전트 루프에도 대비해야 했습니다.
- **해결** — 쓰기 도구는 일절 노출하지 않고 딥링크+prefill로 화면에 안내했습니다. 도구 호출에만 RFC 8693 토큰 교환으로 사용자 권한을 위임하고, 도구 예외와 호출 라운드는 JSON 변환과 상한으로 각각 방어했습니다.
- **결과** — 조회 → 표·차트 → 업무 화면 이동까지 이어지는 ERP 어시스턴트이며, 권한 규칙은 REST와 동일하게 적용됩니다. 도구 실행이 실패하거나 도구 호출이 상한 없이 반복되는 상황에서도 대화가 깨지지 않습니다.

관건은 챗봇이 업무를 돕되 그 경계를 넘지 않게 하는 것이었습니다. 입고·출고·조정 같은 쓰기 권한은 부여하지 않고, 읽기 권한은 요청자 본인의 것을 그대로 위임하며, 도구의 실행 오류와 반복 호출까지 방어했습니다.


## 쓰기는 원천 차단, 안내는 딥링크로

LLM에게 쓰기 권한을 부여하는 대신, **쓰기 도구 자체를 노출하지 않는 것**을 유일한 구조적 보장으로 삼았습니다. 프롬프트로 "쓰지 마"라고 지시하는 것이 아니라, 입고·출고·조정 같은 쓰기 메서드를 처음부터 도구로 등록하지 않았습니다. 우회를 하든 jailbreak를 하든 등록되지 않은 도구는 호출할 수 없으니, 잘못된 데이터가 기록될 여지 자체가 사라집니다.

```java
// StockMcpTools (Inventory) — 조회 도구만 @McpTool로 노출한다
@Component
@RequiredArgsConstructor
public class StockMcpTools {
    private final StockService stockService;

    @McpTool(description = "재고 목록 조회 …",
             annotations = @McpTool.McpAnnotations(readOnlyHint = true, openWorldHint = false))
    public StockPageResponse searchStock(...) { return stockService.searchStock(...); }

    // 입고·출고·소비·조정·안전재고 변경(쓰기)에는 @McpTool을 부착하지 않음 → LLM에 노출되지 않는다
}
```

쓰기 요청이 오면 거절하는 것이 아니라 구조화된 `action` 블록(딥링크 + prefill)으로 기존 인증·검증을 모두 거치는 화면에 안내합니다. 프론트는 경로 allowlist로만 이동을 허용합니다.

````text
[화면 안내 액션 — 시스템 프롬프트 발췌]
당신은 직접 쓰기를 하지 않으므로(쓰기 도구 없음), 쓰기 요청도 거절하지 말고 해당 화면으로 안내합니다.
```action
{"type":"navigate","path":"<경로>","label":"<버튼 문구>","prefill":{ ... }}
```
````


## 챗봇의 권한 문제 — RFC 8693 Token Exchange(OBO)

챗봇은 자기 권한을 갖지 않습니다. 요청자가 매번 다르니 권한도 매번 달라야 하기 때문입니다. 본사 직원과 지점 직원이 동일한 질문을 해도 보여야 할 답은 다릅니다. 그렇지만 원본 사용자 토큰을 하위 서비스에 그대로 넘기는 passthrough는 MCP 스펙이 금지하는 안티패턴입니다. 그래서 **도구 호출(tools/call)에만 사용자 토큰을 RFC 8693 token exchange로 교환해 부착**하고, initialize·tools/list 같은 프로토콜 요청은 서비스 토큰으로 분리했습니다. 사용자 컨텍스트가 없으면 서비스 토큰으로 fallback하지 않고 실패시킵니다. 지점 직원의 질의가 전사 데이터로 새는 tenancy 누수를 막기 위해서입니다.

```java
// McpOutboundAuthCustomizer (AiChat) — MCP 아웃바운드 요청에 토큰을 부착한다
public void customize(HttpRequest.Builder b, String method, URI endpoint,
                      String body, McpTransportContext ctx) {
    if (isToolCall(body)) {                                  // 사용자 데이터 접근
        Authentication user = SecurityContextHolder.getContext().getAuthentication();
        if (user == null || !user.isAuthenticated() || user instanceof AnonymousAuthenticationToken)
            throw new IllegalStateException("사용자 인증 컨텍스트 없음 — 서비스 토큰 fallback 없이 실패");
        attachBearer(b, tokenExchangeManager.authorize(      // RFC 8693 토큰 교환(OBO)
            OAuth2AuthorizeRequest.withClientRegistrationId(tokenExchangeRegistrationId)
                .principal(user).build()), tokenExchangeRegistrationId);
    } else {                                                 // initialize·tools/list = 서비스 토큰
        attachBearer(b, serviceManager.authorize(/* client_credentials */), serviceRegistrationId);
    }
}
```

신원을 그대로 위임받되, 읽는 범위는 두 겹으로 좁힙니다. 발주·공급사처럼 본사 전용 업무는 도구 메서드 첫 줄에서 `requireHqRole()`로 본사 역할을 확인하고, 지점 소속 인원은 자기 소속 현황만 조회할 수 있습니다. 핵심은 이 규칙이 챗봇이 아니라 **서비스 계층에 구현되어 있다**는 점입니다. REST로 호출하든 챗봇으로 호출하든 동일하게 적용되므로, 챗봇이 권한을 우회하거나 확장하는 통로가 되지 않습니다.

```java
// 본사 전용 도구 — 메서드 첫 줄에서 명시적으로 검사(fail-closed).
// @PreAuthorize는 MCP 호출이 메서드보안 프록시를 탄다는 보장이 없어 fail-open 위험이 있다.
@McpTool(description = "발주(PO) 목록을 조건으로 조회한다. ...")
public CommonResponse.Offset<PurchaseOrderListResponse> searchPurchaseOrders(...) {
    McpAuthz.requireHqRole();   // HQ 역할이 아니면 AccessDeniedException → 403
    ...
}

// McpAuthz — 위임받은 사용자 토큰의 역할로 판정한다
public static void requireHqRole() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    boolean allowed = auth != null && auth.isAuthenticated()
            && auth.getAuthorities().stream().anyMatch(a -> HQ_ROLES.contains(a.getAuthority()));
    if (!allowed) {
        throw new AccessDeniedException("MCP 도구 호출 권한이 없습니다(HQ 전용).");
    }
}
```


## LLM 에이전트 루프 방어 2종

**도구 예외의 JSON 변환** — Spring AI 기본 구현은 도구 실행 실패를 평문으로 LLM에 반환하는데, Gemini는 도구 응답을 JSON으로 파싱하므로 평문이 오면 채팅 전체가 깨졌습니다. `ToolExecutionExceptionProcessor`를 교체해 `{"error": "..."}` JSON으로 감싸 반환하니, 모델이 실패 원인을 읽고 자연어로 설명해 주는 우아한 실패가 되었습니다.

```java
@Override
public String process(ToolExecutionException exception) {
    return wrap(exception);   // {"error":"<실제 사유>"}로 감싸 LLM에 반환
}

private String wrap(ToolExecutionException exception) {
    try {
        return jsonMapper.writeValueAsString(Map.of("error", cleanMessage(exception.getMessage())));
    } catch (RuntimeException e) {
        // 여기서 다시 던지면 채팅이 깨지므로 최소 JSON을 손으로 보장한다
        return "{\"error\":\"도구 호출에 실패했습니다\"}";
    }
}
```

**도구 호출 라운드 상한** — "전부 보여줘"류 질의나 에러 반복 시 에이전트 루프가 상한 없이 반복되어 지연·비용이 커집니다. Spring AI에 빌트인 상한이 없어 `ToolExecutionEligibilityChecker` 구현에 라운드 카운터를 두어, 상한 초과 시 루프를 중단하고 범위를 좁혀 달라는 안내로 대체했습니다.

```java
@Component
public class ToolCallIterationLimiter implements ToolExecutionEligibilityChecker {

    private final ThreadLocal<Integer> rounds = ThreadLocal.withInitial(() -> 0);

    @Override
    public Boolean apply(ChatResponse chatResponse) {
        if (chatResponse == null || !chatResponse.hasToolCalls()) {
            return false;   // 도구 호출이 없으면 루프 종료(기본 동작과 동일)
        }
        int round = rounds.get() + 1;
        rounds.set(round);
        if (round > maxRounds) {
            log.warn("도구 호출 라운드 상한({}) 초과 — 에이전트 루프를 중단한다", maxRounds);
            return false;   // 상한 초과 → 도구를 더 실행하지 않고 안내로 대체
        }
        return true;
    }
}
```


# 컨벤션 — "신기술, 그러므로 강력한 컨벤션."

---

- **문제** — Spring Boot 4·Spring AI 2.0 같은 최신 기술은 정립된 표준이 없어, 같은 기능도 팀원마다 제각각 구현되기 쉬웠습니다.
- **해결** — 외부 통신·JWT 검증·에러 응답·멱등키·시간 처리까지 7개 컨벤션 문서로 규정해 6개 서비스에 일관 적용했습니다.
- **결과** — 누가 작성하든 비슷한 코드가 나오는 일관된 코드베이스를 갖추었고, 통신·인증·에러 처리가 하나의 표준으로 수렴했습니다.

제목의 문구는 팀의 **기술 캐치프레이즈**입니다. Spring AI 2.0 · Spring Boot 4 · Java 25처럼 갓 나온 스택은 강력하지만, 정립된 표준도, 정형화된 패턴도 없어 같은 기능이 팀원마다 제각각 구현되기 쉽습니다. 그래서 외부 도메인 통신 · JWT 검증 · 에러 응답 · 멱등키 · 시간 처리까지 도입한 기술 하나하나의 세부 규칙을 팀 컨벤션으로 정리했습니다.

![팀이 작성한 컨벤션 문서 목록](/content/projects/erp-project/convention-docs.png)

주제별로 정리한 실제 팀 컨벤션 노션 문서 일부입니다.

- **API 계약**
  - 📄 ⭐️ [API 응답 / 에러 표준](https://shin-workspace.notion.site/API-36efded21c4080d6b620d1390f8aac4e)
  - 📄 [멱등키 호출 규약 (전 서비스 공통)](https://shin-workspace.notion.site/37ffded21c408058a552ddc64eb3bb74)
- **서비스 간 통신**
  - 📄 [MSA 외부 도메인 통신 컨벤션 (v1.2)](https://shin-workspace.notion.site/MSA-v1-2-369fded21c40804780f0c7a900b3596e)
  - 📄 [외부 도메인 Mock Client 작성 가이드 (v1.1)](https://shin-workspace.notion.site/Mock-Client-v1-1-375fded21c4080398c30c3a7292c530e)
- **인증 · 인가**
  - 📄 [Keycloak JWT 검증 팀 컨벤션 (v2.8)](https://shin-workspace.notion.site/Keycloak-JWT-v2-8-372fded21c40803d8d23dd4cf53961f0)
- **공통 구현 규칙**
  - 📄 [시간(Time) 처리 컨벤션](https://shin-workspace.notion.site/Time-36ffded21c4080cea934d6d55e46e218)
  - 📄 [Redis(ElastiCache) 사용 컨벤션 (v1.2)](https://shin-workspace.notion.site/Redis-ElastiCache-v1-2-373fded21c4080d8a820e66ed6ca90c7)

## 가장 공들인 표준 — 세 갈래로 흩어지는 에러 응답

가장 공을 들인 것은 에러 응답 표준입니다. MSA에서는 서비스마다 에러 포맷이 난립하기 쉬운데, 문제는 Spring·서블릿 구조상 예외가 **세 갈래로 흩어진다**는 것이었습니다. MVC 밖으로 빠진 에러는 서블릿 컨테이너가, 인증·인가 실패는 시큐리티 필터가, 도메인·검증 예외는 디스패처 안 `@RestControllerAdvice`가 받습니다. 이 세 예외 경로 각각에 전용 처리기를 두어, 어디서 발생하든 같은 `ProblemDetail`(RFC 9457) 포맷으로 수렴시켰습니다. 덕분에 클라이언트와 서비스 간 통신 모두 분기 없이 에러 코드 하나로 일관성 있게 처리할 수 있었습니다.

![예외가 흩어지는 세 갈래 — 필터 · 컨테이너 · 디스패처](/content/projects/erp-project/slide-error-paths.png)

세 경로에서 실제로 출력된 응답입니다. 출처가 전부 다르지만 전부 같은 구조(ProblemDetail)인 것을 확인할 수 있습니다.

**본문 크기 초과 413 — Servlet Container (필터 sendError → /error 정규화)**

```json
{
  "type": "about:blank",
  "title": "Content Too Large",
  "status": 413,
  "detail": "요청 본문이 허용 크기를 초과했습니다",
  "instance": "/api/stocks/inbound",
  "code": "COMMON_BAD_REQUEST",
  "timestamp": "2026-06-28T10:12:33.041+09:00"
}
```

**인증 실패 401 — Security Filter (+ 응답헤더 WWW-Authenticate: Bearer)**

```json
{
  "type": "about:blank",
  "title": "Unauthorized",
  "status": 401,
  "detail": "인증이 필요합니다",
  "instance": "/api/stocks",
  "code": "AUTH_UNAUTHORIZED",
  "timestamp": "2026-06-28T10:12:33.041+09:00"
}
```

**도메인 예외 409 — MVC Dispatcher 내부 Advice**

```json
{
  "type": "about:blank",
  "title": "Conflict",
  "status": 409,
  "detail": "이미 존재하는 창고 코드입니다: WH-HQ-001",
  "instance": "/api/warehouses",
  "code": "WAREHOUSE_CODE_DUPLICATED",
  "timestamp": "2026-06-28T10:12:33.041+09:00"
}
```


# Inventory — 정확성이 전부인 도메인

---

- **문제** — 현재고는 이동 원장(stock_movement)의 파생값이기 때문에, 동시 요청·재시도·부분 실패 어떤 상황에서도 값이 어긋나서는 안 됩니다.
- **해결** — 조건부 원자적 UPDATE(동시성), Idempotency-Key 2겹 방어(멱등성), REPEATABLE READ 원장 재생 검증(정합성)의 세 겹으로 방어했습니다.
- **결과** — TOCTOU·이중 반영을 구조적으로 차단하고, 매일 자정 원장 대조로 정합성을 상시 검증합니다.

![Inventory ERD](/content/projects/erp-project/erd-inventory.png)

재고 도메인의 설계 원칙은 하나였습니다. **현재고는 이동 원장(stock_movement)의 파생값이고, 그 값은 동시 요청·재시도·부분 실패 어떤 상황에서도 실제와 어긋나서는 안 된다는 것**입니다. 이를 세 겹으로 보장했습니다.


## 동시성 — 조건부 원자적 UPDATE

조회 → 검증 → 차감이 분리되면 그 틈(TOCTOU)에 다른 요청이 끼어들어 없는 재고를 판매할 수 있습니다. `SELECT ... FOR UPDATE`(비관적 락)는 정확하지만 특정 품목 한 행에 트래픽이 몰리면 전 요청이 직렬화되고, 여러 품목의 락 획득 순서가 엇갈리면 데드락이 발생할 수 있습니다. 그래서 검증과 차감을 **DB의 한 UPDATE 문장**으로 합쳐 원자적으로 처리했습니다.

![동시 차감 경합 — 분리된 조회·검증·차감이 만드는 초과 판매](/content/projects/erp-project/slide-race-condition.png)

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

가용이 부족하면 0행만 갱신되므로, affected rows가 그대로 성공/실패 판정값이 됩니다. 락은 UPDATE부터 커밋까지의 짧은 구간에만 유지되고, 단일 문장이므로 데드락도 발생하지 않으며, 애플리케이션 락 코드는 0줄입니다. 비관적 락이 정확성을 처리량과 안정성으로 지불했다면, 이 방식은 검증과 갱신을 애플리케이션이 아니라 DB의 원자적 연산에 맡겨 **정확성과 처리량을 함께 확보**합니다. 동시성 문제를 우회한 것이 아니라 발생할 구간 자체를 없앴습니다.


## 멱등성 — Idempotency-Key + fingerprint 2겹

응답이 유실(타임아웃)되면 클라이언트는 성공 여부를 모른 채 재시도하고, 첫 요청이 성공했다면 출고가 이중 차감됩니다. 그래서 재고 변동 5종 전부에 `Idempotency-Key` 헤더를 요구하고, **선점 INSERT를 원자적 claim**으로 사용했습니다.

![응답 유실 → 재시도 → 이중 차감 시나리오](/content/projects/erp-project/slide-idempotency.png)

```sql
insert into idempotency_record
    (type, idempotency_key, principal, request_fingerprint, status, created_at, updated_at)
values
    (:type, :idempotencyKey, :principal, :fingerprint, 'IN_PROGRESS', :now, :now)
on conflict (type, idempotency_key, principal) do nothing
```

- claim·업무·완료 기록을 **한 트랜잭션**에 묶어, 크래시가 발생하면 통째로 롤백되므로 고아 IN_PROGRESS가 남지 않습니다.
- 중복 요청은 재실행 없이 저장된 응답을 **replay**하고, 같은 키에 다른 payload(키 재사용)는 body 해시(fingerprint) 불일치로 422를 반환합니다.
- 이력 테이블의 유니크 제약이 영구 백스톱이 되어, 멱등 레코드(요청 계층)와 원장 유니크(데이터 계층)의 2겹 방어를 이룹니다.


## 정합성 — 자정 미니 정산 (REPEATABLE READ)

파생값은 드리프트할 수 있으므로, 매일 자정 원장을 재생해 현재고와 대조하는 정산을 실행합니다. 행마다 트랜잭션이 독립적이기 때문에, 한 행이 실패해도 나머지 검증은 계속됩니다. 각 검증은 `REPEATABLE READ`로 열어 **락 없이 같은 스냅샷**에서 current_stock과 원장 합을 읽기 때문에, 검증 도중 다른 요청이 재고를 차감해도 거짓 불일치가 발생하지 않고 운영 트래픽을 멈추지도 않습니다. 재생은 증분 커서(last_movement_id)로 직전 정산 이후분만 합산하고, 불일치는 MISMATCH로 append-only 기록됩니다.

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

```java
// StockReconciliationJob — 매일 자정, 전 재고 행을 순회. 행마다 독립 트랜잭션이라 한 행의 실패가 전체로 번지지 않는다
@Scheduled(cron = "0 0 0 * * *", zone = "Asia/Seoul")
public void reconcileAll() {
    stockRepository.findAllIds().forEach(service::reconcile);
}
```


## 소속 데이터 격리 (Tenancy)

지점(BRANCH) 사용자는 자기 지점 창고만, 본사(HQ)는 전체를 봅니다. 컨트롤러마다 if를 흩뿌리는 대신 `TenancyScope` 한 곳에서 요청 스코프를 강제하고, 소속 외 리소스는 존재 여부를 숨기기 위해 404로 응답합니다. BRANCH인데 소속 코드가 해석되지 않으면 전체 공개가 아니라 **빈 결과로 fail-closed**합니다.

```java
// TenancyScope (Inventory) — 조회 스코프를 소속으로 강제한다
public String effectiveWarehouseCode(String requested) {
    if (!principal.isBranchScoped()) return requested;          // 본사·서비스 토큰 = 무제한
    String own = principal.currentTenancyCode();                // 지점 = 자기 소속 강제
    if (requested != null && !requested.isBlank() && !requested.equals(own))
        throw new TenancyScopeForbiddenException("소속 창고만 조회할 수 있습니다"); // 타 지점 명시 = 거부
    return own != null ? own : "__NO_TENANCY__";                // 소속 미해석 = 빈 결과(fail-closed)
}
```


# 품질 — 100+ 항목 QA와 Playwright E2E

---

- **문제** — 동작 여부만 확인하는 수동 점검으로는 실제 업무에서 발생할 엣지 케이스를 놓치기 쉽고, 한 곳을 고치면 다른 곳이 깨지는 회귀도 잡기 어려웠습니다.
- **해결** — 엣지 케이스를 화면 단위로 잡아 화면 · 설명 · 우선순위로 정리한 100+ 항목 QA를 진행하고, Keycloak 실제 로그인 세션을 저장·재사용해 주요 화면을 자동 순회하는 Playwright E2E를 구축했습니다.
- **결과** — 긴급 건부터 처리하는 추적 체계를 갖추었고, 코드를 고친 뒤에는 명령어 하나로 핵심 흐름이 깨지지 않았는지 즉시 확인할 수 있었습니다.

![100+ 항목 QA와 Playwright E2E 자동화](/content/projects/erp-project/slide-qa.png)

QA는 UI/UX를 집중 개선하기 위한 것이었습니다. 기능이 동작하는 수준을 넘어 모션 · 레이아웃 안정성 · 시각적 일관성 · 실수 방지 · 접근성까지 화면 단위로 다듬었고, 이 UX 완성도가 팀이 내세운 차별점이었습니다.


# 배운 점

---

## 트랜잭션 경계와 예외

재고 차감은 여러 부품을 한 번에 처리하는데, **한 라인이라도 가용이 부족하면 전체를 거부**해야 합니다(all-or-nothing). 라인별로 조건부 원자적 UPDATE(`decreaseStock`)를 실행하다 0행 갱신(부족)이 발생하면 실패로 모아 두고, 루프 끝에서 예외를 던져 지금까지의 차감을 통째로 롤백합니다.

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

문제는 여기서 실패를 **어떻게 알리느냐**에 따라 롤백이 되기도, 안 되기도 한다는 것이었습니다. 이 버그를 쫓으며 트랜잭션 롤백 규칙을 학습하였습니다.

트랜잭션 프록시는 메서드가 어떻게 빠져나가는지로 커밋과 롤백을 가릅니다. **정상 return과 checked 예외는 커밋, RuntimeException/Error만 롤백**입니다. 예외가 던져졌다면 실패로 보고 전부 되돌리는 것이 직관인데, checked 예외만은 커밋으로 처리됩니다. 이유를 찾아보니, 업무상 예상된 예외는 작업이 유효한 것으로 본 EJB 시절 관례를 Spring이 이어받은 기본값이기 때문이었습니다. 즉 실패를 checked 예외나 `return`으로 알리면 프록시는 정상 종료로 보고 앞서 적용된 차감을 그대로 커밋합니다. 일부만 빠진 재고는 정합성이 깨진 상태입니다.

```java
// 실패를 return으로 알렸다면 — 앞서 성공한 차감이 그대로 커밋되어 부분 차감으로 남는다
for (Line l : lines)
    if (stockRepository.decreaseStock(...) == 0) failed.add(l);
if (!failed.isEmpty()) return;            // 정상 return → 롤백되지 않음
```

그래서 도메인 예외를 전부 RuntimeException으로 통일했습니다.

```java
public class StockAvailableInsufficientException extends RuntimeException {
    public StockAvailableInsufficientException(String message) { super(message); }
}
```

이유는 세 가지입니다.

- `throw`만으로 롤백이 기본이 되어, 메서드마다 `rollbackFor`를 지정할 필요가 없습니다.
- 중간 계층 시그니처가 `throws`로 오염되지 않습니다.
- 예외 처리가 전역 핸들러 한 곳으로 모입니다.

던진 예외는 `@RestControllerAdvice`가 받아 `ErrorCode` 하나에서 status와 code를 함께 꺼내 `ProblemDetail`로 변환합니다.

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

마지막으로 함정이 두 가지 있습니다. 트랜잭션 안에서 예외를 `try-catch`로 잡아 전파를 끊으면, 프록시는 정상 종료로 판단해 커밋합니다. 롤백이 일어나려면 예외가 트랜잭션 경계 밖까지 전파되어야 합니다. 반대로 같은 트랜잭션에 참여한 내부 메서드가 예외를 던지면 그 순간 트랜잭션이 `rollback-only`로 표시되기 때문에, 바깥 메서드에서 그 예외를 잡아 처리해도 커밋 시점에 `UnexpectedRollbackException`이 발생합니다. 예외를 분명히 잡았는데도 트랜잭션이 롤백되는 혼란은 이 두 번째 함정에서 비롯됩니다.

```java
// 함정 1 — 예외를 잡아 전파를 끊으면 정상 종료로 보여 커밋된다
@Transactional
public void outbound(...) {
    try { decrease(...); }
    catch (Exception e) { log.warn("무시", e); }   // 경계를 벗어나지 못함 → 커밋
}

// 함정 2 — 내부 메서드가 던진 순간 rollback-only가 표시된다
@Transactional
public void outer() {
    try { inner.work(); }            // 같은 트랜잭션 참여, 런타임 예외 → rollback-only
    catch (Exception e) { /* 잡아도 이미 늦음 */ }
}   // 커밋 시점에 UnexpectedRollbackException 발생
```

두 함정 모두 앞서 세운 규칙 하나로 함께 피할 수 있었습니다. 도메인 예외를 트랜잭션 안에서 잡지 않고 경계 밖까지 전파시키는 것입니다. 예외가 경계를 벗어나므로 정상 종료로 오인될 일이 없고, rollback-only와 커밋 의도가 어긋날 일도 없으며, 변환은 전역 핸들러 한 곳이 맡습니다. 처음의 부분 차감 버그는 이렇게 예외의 종류와 트랜잭션 경계를 맞춰 두는 것으로 해결했습니다.


## 외부 호출은 트랜잭션 밖으로

API/MQ 호출을 DB 트랜잭션 안에서 하면 외부 지연이 커넥션 풀 고갈로 전파됩니다. 서비스 간 동기 호출(RestClient + @HttpExchange)은 전부 트랜잭션 밖에 배치하는 것을 팀 규칙으로 삼았고, 향후 outbox/saga·서킷브레이커(Resilience4j) 도입을 개선 과제로 남겼습니다.

## PM으로서

역할·소속·화면이 여러 갈래로 나뉘는 시스템을 5명이 서비스 단위로 분담해 개발했기 때문에, 에러 포맷 · 멱등키 · 인증·인가 같은 규칙이 서비스마다 어긋나기 쉬웠습니다. 게다가 앞서 언급했듯 정립된 표준이 없는 최신 기술을 사용하는 만큼, 이 규칙들을 팀 차원에서 하나로 통일해 줄 '컨벤션'이 반드시 필요했습니다.

그렇게 하려면 누군가 먼저 기술에 부딪히며 기준을 세워야 한다고 생각했습니다. 팀에 잘못된 방향을 제시하지 않으려면 단순히 먼저 조사하는 수준으로는 부족했습니다. 여러 가능성을 대조하고 사실관계를 철저히 검증하며 컨벤션을 다듬어야 했습니다. 팀원들에게 확실한 근거를 제시하고자 집요하게 파고들었던 이 시간은, 돌이켜보니 저 자신의 기술적 이해도를 가장 높여준 자산이 되어 있었습니다.

고맙게도 팀원들이 믿고 따라와 준 덕분에 프로젝트를 성공적으로 마무리할 수 있었고, 이 과정은 '기술적 리더'로서의 책임감과 팀을 이끄는 감각을 함께 익힌 값진 경험으로 남았습니다.


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


# 관련 자료

---

[전체 발표 슬라이드](/files/erp-project-presentation.pdf)

[웹 시연](https://youtu.be/tXZphdlfiLU)

[모바일 시연](https://youtube.com/shorts/V2bXpBBMT38)
