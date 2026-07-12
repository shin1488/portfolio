---
title: mcp-security token exchange 샘플 기여
summary: >-
  ERP 프로젝트의 AI 챗봇에서 RFC 8693 token exchange(OBO)로 구현한 사용자 권한 위임을 Spring 생태계의
  MCP 보안 라이브러리에 기여했습니다. gateway 뒤 resource server인 MCP 호스트가 사용자 신원을
  MCP 서버까지 위임할 경로가 없다는 공백을 이슈로 제기하고, 메인테이너와 합의해 샘플 모듈로 제출했습니다.
period:
  from: "2026.07"
techStack: [Spring AI 2.0, MCP, Spring Security, RFC 8693, Keycloak, Spring Authorization Server]
highlights:
  - 'resource server인 MCP 호스트가 사용자 신원을 위임할 경로가 없다는 라이브러리 공백을 이슈로 제기'
  - '메인테이너와 샘플 방향으로 합의한 뒤 customizer · 통합 테스트 · README를 PR로 제출'
  - 'subject_token_type을 요청에 명시해 인가 서버에 종속되지 않는 샘플로 정리'
links:
  - label: 'Issues #88'
    href: https://github.com/spring-ai-community/mcp-security/issues/88
  - label: 'Pull Requests #89'
    href: https://github.com/spring-ai-community/mcp-security/pull/89
organization: spring-ai-community
repo: mcp-security
status: in-review
order: 2
---

# 개요

---

- **문제** — [ERP 프로젝트](/projects/erp-project)에서 챗봇의 권한 위임을 구현하던 시점에 Spring 생태계의 MCP 보안 라이브러리인 **[mcp-security](https://github.com/spring-ai-community/mcp-security)**를 검토했으나, 해당 라이브러리에서 제공하는 클라이언트 인증 플로우가 authorization_code와 client_credentials밖에 존재하지 않아 gateway 뒤 resource server인 MCP 호스트가 사용자 신원을 위임할 경로가 없었습니다.
- **해결** — 프로젝트에서 이미 검증한 방식이므로, RFC 8693이 정의한 token exchange를 라이브러리의 새로운 클라이언트 인증 플로우로 추가하는 것을 **[이슈로 제안](https://github.com/spring-ai-community/mcp-security/issues/88)**하고, 메인테이너와 샘플 방향으로 합의한 뒤 customizer와 통합 테스트를 **[PR로 제출](https://github.com/spring-ai-community/mcp-security/pull/89)**했습니다.
- **결과** — 공식 샘플 모듈(sample-mcp-client-token-exchange) PR이 리뷰 단계에 있으며, 인가 서버별 요구사항은 README 문서로 정리해 함께 제출했습니다.


# 라이브러리의 공백 — resource server 호스트에는 위임 경로가 없다

---

이 기여는 [ERP 프로젝트](/projects/erp-project)의 AI 챗봇에서 출발했습니다. 챗봇의 MCP 도구 호출에 인증을 적용하기 위해 Spring 생태계의 MCP 보안 라이브러리인 **[mcp-security](https://github.com/spring-ai-community/mcp-security)** 도입을 검토했습니다. 그러나 이 라이브러리가 제공하는 클라이언트 인증 플로우인 authorization_code와 client_credentials 어느 쪽도 챗봇에 맞지 않았습니다.

두 플로우 모두 MCP 호스트가 스스로 인가 서버에서 토큰을 발급받는다고 전제하기 때문입니다. 사용자는 gateway에서 로그인하고, Spring AI 2.0 기반 챗봇 서비스는 그 뒤에서 검증된 사용자의 JWT만 보유한 resource server였습니다. 인가 서버로는 Keycloak 26.2를 사용했습니다. 사용자를 인가 서버로 보내 로그인시키는 authorization_code는 gateway가 이미 맡고 있었고, 호스트 자신의 자격으로 발급받는 client_credentials로는 사용자 신원이 남지 않았습니다.

사용자 신원을 유지해야 했던 까닭은 조회 결과가 요청자의 권한에 따라 달라져야 했기 때문입니다. 챗봇은 다섯 개 도메인 서비스가 등록한 MCP 도구를 호출해 답을 만들므로, 도구를 누구의 권한으로 호출하는지가 답의 범위를 결정합니다. 챗봇 자신의 권한으로 호출한다면 사용자의 신원·자격과 관계없이 같은 답을 받게 됩니다. 조회 결과는 사용자에게 부여된 역할과 소속 지점의 범위 안에 머물러야 했으므로, MCP 서버가 호출자를 챗봇이 아니라 그 사용자로 인식하도록 만들어야 했습니다.

호출자를 사용자로 인식시키는 가장 단순한 수단은 들어온 사용자의 JWT를 MCP 서버에 그대로 전달하는 것입니다. 그러나 이 선택지는 두 가지 이유로 배제했습니다.

- 사용자의 JWT는 audience로 챗봇을 지정하고 있으므로, audience를 검증하는 MCP 서버에서 거부됩니다.
- MCP 인증 스펙이 받은 토큰을 그대로 다음 서비스에 넘기는 [token passthrough를 금지](https://modelcontextprotocol.io/specification/2025-06-18/basic/security_best_practices#token-passthrough)합니다.

그래서 [RFC 8693](https://www.rfc-editor.org/rfc/rfc8693)이 정의한 token exchange를 사용했습니다. 사용자의 JWT를 subject token으로 인가 서버에 제출하면, 사용자를 가리키는 `sub`는 보존하되 `aud`는 교환 클라이언트로 바뀐 새 토큰을 발급받습니다. 전달된 자격 증명이 아니라 인가 서버가 새로 내린 인가 결정이므로 passthrough에 해당하지 않습니다. 앞서 배제했던 두 사유를 모두 피하면서 사용자 신원은 유지되므로, 이렇게 얻은 토큰을 도구 호출(`tools/call`)에 부착했습니다. 그렇지만 해당 방법으로 구현한 배선은 mcp-security에서 제공하지 않아 직접 구현해야 했습니다.

프로젝트가 끝난 뒤, 같은 구성을 쓰는 사용자라면 누구나 이 배선을 다시 구현해야 한다는 생각에 기여를 제안했습니다. gateway가 사용자의 JWT를 전달하는 MSA 구성에서 MCP 호스트가 사용자 신원을 MCP 서버까지 위임하는 유스케이스와 함께, token exchange를 새로운 클라이언트 인증 플로우로 추가하는 안을 **[이슈](https://github.com/spring-ai-community/mcp-security/issues/88)**로 정리했습니다. 제안한 것은 세 가지였습니다.

- 기존 authorization_code · client_credentials 방식과 같은 구조로, MCP 아웃바운드 요청에 교환된 사용자 토큰을 부착하는 customizer를 추가합니다.
- 사용자 인증이 없는 도구 호출은 서비스 토큰으로 fallback하지 않고 실패시키는 선택지를 제공합니다. 멀티 테넌트 구성에서 다른 테넌트의 데이터가 나가는 것을 막기 위해서입니다.
- resource server 토폴로지와 인가 서버 설정을 동작하는 샘플과 README로 제공해, 같은 구성을 쓰는 사용자가 설정을 그대로 재현할 수 있도록 하였습니다.

챗봇에서 이미 운영해 본 구성을, 라이브러리의 새로운 선택지로 두자는 제안이었습니다.


# 샘플 모듈 — 컨벤션을 존중하다

---

이후 코멘트로, 메인테이너(Spring Security 팀 소속)는 코어 통합을 보류하고 샘플로 만드는 방향을 제안했습니다. RFC 8693은 확립된 표준이지만 MCP 인증 스펙이 요구하는 범위는 아니라는 이유였습니다. 이 답변으로 코어는 MCP 스펙으로 지정된 기능만을 다루고, 스펙 밖의 토큰 획득 전략은 샘플이 맡는다는 경계를 알게 되었습니다. 이 방향에 합의해 PR을 샘플 모듈로 재구성했습니다.

샘플 코드는 프로젝트의 코드를 그대로 옮기지 않고 라이브러리 컨벤션에 맞추어 새로 작성했습니다. 챗봇에서는 SecurityContextHolder로 사용자 인증을 읽었지만, 라이브러리는 스레드에 의존하지 않도록 McpTransportContext로 인증을 전달하는 방식을 사용하므로 이에 맞추었습니다.

코드를 새로 작성한 이상 프로젝트에서 확인한 동작이 그대로 성립한다고 볼 수 없었으므로, 제출 전에 해당 저장소가 쓰는 Spring Authorization Server 기반 통합 테스트로 전체 흐름을 다시 검증했습니다. 샘플을 실행하는 데 Keycloak 인스턴스가 필요하면 저장소에 외부 인가 서버 의존이 생기므로, 검증 환경은 저장소의 기존 통합 테스트에 맞추고 Keycloak 관련 설정은 README로 분리했습니다.

통합 테스트가 재현한 전체 흐름은 사용자 로그인에서 시작해 도구 호출로 끝납니다. 사용자 토큰을 authorization_code로 발급받는 클라이언트와 그 토큰을 교환하는 클라이언트는 분리했습니다. gateway가 받은 토큰을 챗봇이 교환하던 프로젝트의 구성을 그대로 옮긴 것입니다. 이렇게 교환한 토큰으로 보안이 적용된 MCP 서버의 도구를 호출하자, MCP 서버는 원래 사용자의 신원으로 응답했습니다. 하지만 passthrough인 경우에도 응답이 동일할 수 있었기 때문에, 교환된 토큰의 클레임까지 확인했습니다. `sub`가 원 사용자를 가리키고 `aud`가 바뀌어 있었던 것을 근거로, 도구 응답이 교환된 토큰으로 이루어졌음을 확정했습니다.

다만 통합 테스트 환경은 Spring Authorization Server를 인가 서버로 사용하여 이루어졌으므로, Keycloak을 쓰는 독자에게 필요한 설정은 이 환경에 드러나지 않습니다. 그래서 Keycloak으로 실행할 때 필요한 사항만 README의 별도 절로 남겼습니다. Standard Token Exchange가 GA로 제공되는 26.2 이상이 필요하고, 교환을 요청하는 클라이언트가 subject token의 audience에 포함되어야 교환이 허용됩니다. 저장소에는 외부 인가 서버 의존을 들이지 않으면서, Keycloak을 사용하는 독자는 README만으로 설정을 재현할 수 있게 했습니다.


# subject_token_type — 인가 서버에 종속되지 않는 값

---

token exchange 요청은 사용자 토큰을 subject token으로 제출하면서, 그것이 어떤 종류의 토큰인지를 `subject_token_type`으로 함께 알립니다. Keycloak 연동에서 마지막까지 해결되지 않은 것이 이 값이었습니다. Keycloak의 Standard Token Exchange는 이 값으로 `...:access_token`만 받아들이지만, Spring Security가 보낸 값은 `...:jwt`였으므로 교환이 거부되었습니다.

반면 Spring Authorization Server는 `...:access_token`과 `...:jwt`를 모두 수용했습니다. 두 인가 서버가 함께 받아들이는 값은 `...:access_token` 하나였으므로, 더욱 니치하게 접근해 그 값으로 통일해야 했습니다. 하지만 그렇게 하려면 Spring Security가 보내는 값을 바꿀 수단이 필요했습니다. Spring Security는 교환에 사용할 subject token을 애플리케이션이 직접 고르도록 subject token resolver를 제공합니다. 이 resolver에서 `Jwt`와 동일한 토큰 값으로 `OAuth2AccessToken`을 생성해 반환하자 `subject_token_type`이 `...:access_token`으로 전송되어, 두 인가 서버 모두에서 교환이 성립했습니다. 이를 확인하고 프로젝트와 샘플 모두 이 방식을 채택했습니다.

다만 이 방식은 요청 파라미터 하나를 위해 토큰의 자바 타입을 바꾸는 것이었습니다. 목적과 수단의 층위가 어긋나 있어, 무엇을 의도했는지가 코드에 드러나지 않았습니다. 게다가 `...:access_token`이 옳은 값이라는 근거도 두 인가 서버가 모두 수용한다는 사실 하나뿐이었습니다.

그 근거를 확인하기 위해 [RFC 8693 3절](https://www.rfc-editor.org/rfc/rfc8693#section-3)을 찾아보았습니다. `...:access_token`은 호출 대상 인가 서버가 발급한 access token을 위해 정의된 값이었고, `...:jwt`는 JWT를 다른 인가 서버에 authorization grant로 보내는 경우를 위해 정의된 값이었습니다. resource server가 방금 검증한 토큰을 같은 인가 서버에서 교환하는 이 패턴은 전자에 해당하므로, `...:access_token`이 스펙에 맞는 값이었습니다. Keycloak은 스펙대로 구현했고, Spring Authorization Server가 `...:jwt`까지 수용했던 것입니다.

그렇다면 Spring Security가 `...:jwt`를 보낸 까닭이 남습니다. 확인한 결과, 이 값을 subject token의 자바 타입에서 도출하고 있었습니다. `TokenExchangeGrantRequest`가 `Jwt`이면 `...:jwt`를, 그렇지 않으면 `...:access_token`을 매핑하므로, resource server가 들고 있는 `Jwt`가 그대로 `...:jwt`로 전송되었던 것입니다.

```java
// TokenExchangeGrantRequest (Spring Security) — 식별자를 subject token의 자바 타입에서 도출한다
private static String tokenType(OAuth2Token token) {
    return (token instanceof Jwt) ? JWT_TOKEN_TYPE_VALUE : ACCESS_TOKEN_TYPE_VALUE;
}
```

파라미터가 자바 타입 하나에 묶여 있으니, 값을 바꾸려면 타입을 바꾸는 수밖에 없었던 것입니다. 그렇다고 타입을 바꾸어 파라미터를 우회할 것이 아니라, 파라미터를 직접 지정하는 편이 맞다고 판단했습니다. 그래서 토큰 객체를 바꾸는 처리를 제거하고, 인가 서버에 교환 요청을 보내는 클라이언트에 `subject_token_type`을 명시했습니다. 전송되는 요청은 동일했지만, 의도가 '토큰 객체의 형태'가 아니라 '요청 파라미터'에 담기도록 하였습니다.

```java
// OAuth2TokenExchangeSyncHttpRequestCustomizer (샘플 PR) — subject_token_type을 요청에 명시한다
static RestClientTokenExchangeTokenResponseClient accessTokenResponseClient() {
    var accessTokenResponseClient = new RestClientTokenExchangeTokenResponseClient();
    accessTokenResponseClient.setParametersCustomizer(
            (parameters) -> parameters.set(OAuth2ParameterNames.SUBJECT_TOKEN_TYPE, ACCESS_TOKEN_TYPE_VALUE));
    return accessTokenResponseClient;
}
```

두 인가 서버를 모두 통과시키려고 자바 타입을 맞추던 코드가, 스펙이 정한 값을 그대로 보내는 코드가 되었습니다. 인가 서버가 무엇이든 같은 값이 전송됩니다.

다만 값을 명시해 우리 문제만 닫혔을 뿐, 잘못된 매핑 문제는 그대로 남아 있었습니다. `Jwt`가 아닌 토큰이 오면 어떻게 되는지 확인한 결과, ID 토큰을 담는 `OidcIdToken`은 `Jwt`가 아니었기 때문에 `...:access_token`으로 전송되었습니다. RFC 8693 3절은 `...:access_token`을 인가 서버가 발급한 access token으로, `...:id_token`을 ID 토큰으로 정의합니다. 두 정의가 배타적이므로 `OidcIdToken`이 담는 ID 토큰에 `...:access_token`이 맞는 경우는 없습니다. 따라서 이것을 결함으로 판단하고, **[Spring Security 이슈](/osc/spring-security-token-exchange)**로 제기했습니다.