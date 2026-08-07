---
title: Spring Security token exchange 타입 식별자 이슈 제기
summary: >-
  RFC 8693 token exchange가 쓰는 세 타입 파라미터를 애플리케이션이 명시할 수 없다는 문제를 Spring Security에
  제기했습니다. ERP 프로젝트의 챗봇 권한 위임에서 출발해 라이브러리 샘플을 거쳐 프레임워크 본체까지 이어진
  기여입니다.
period:
  from: "2026.07"
techStack: [Spring Security, OAuth 2.0, RFC 8693, Keycloak, Spring Authorization Server]
highlights:
  - '문제 — subject_token_type · actor_token_type은 자바 타입에서 추론하고 requested_token_type은 상수로 고정해, 애플리케이션이 식별자를 명시할 수 없음'
  - '해결 — RFC 8693이 역할(access token · ID token)과 형식(JWT)을 직교하는 축으로 규정한다는 근거로, 인가 서버 resolver와 대칭인 명시 API 제안'
  - '결과 — 재현 코드와 함께 프레임워크 본체에 이슈로 등록, 개선 제안으로 검토 진행 중'
links:
  - label: 'Issues #19436'
    href: https://github.com/spring-projects/spring-security/issues/19436
organization: spring-projects
repo: spring-security
status: proposed
order: 2
---

# 개요

---

- **문제** — ERP 챗봇의 권한 위임을 [spring-ai-community/mcp-security PR #89](https://github.com/spring-ai-community/mcp-security/pull/89)의 샘플로 옮기며 `subject_token_type`을 요청에 명시했는데, 그 값을 결정하는 매핑이 subject token의 **자바 타입**을 보고 프로토콜 식별자를 고르고 있었습니다.
- **해결** — RFC 8693이 토큰의 역할과 형식을 직교하는 축으로 규정한다는 점을 근거로, 이 grant가 쓰는 타입 파라미터 셋을 애플리케이션이 명시할 수 없다는 것을 재현 코드와 함께 이슈로 제기했습니다.
- **결과** — 식별자를 추론이 아니라 명시할 수 있게 하는 API를 제안했습니다. 인가 서버 쪽에서 진행 중인 resolver 전략과 대칭이 되는 형태이며, 이슈는 접수되어 분류를 기다리고 있습니다.


# 역할과 형식은 서로 다른 축이다

---

token exchange 요청은 사용자 토큰을 subject token으로 제출하면서, 그것이 어떤 종류의 토큰인지를 `subject_token_type`으로 함께 알립니다. [RFC 8693 3절](https://www.rfc-editor.org/rfc/rfc8693#section-3)이 이 자리에 쓸 수 있는 식별자를 다섯 가지 정의하고, JWT를 가리키는 값 하나를 [RFC 7519 9절](https://www.rfc-editor.org/rfc/rfc7519#section-9)에서 가져다 씁니다.

| 식별자 | 무엇을 가리키나 | 축 |
|---|---|---|
| `...:access_token` | 호출 대상 인가 서버가 발급한 access token | 발급 목적 |
| `...:refresh_token` | 호출 대상 인가 서버가 발급한 refresh token | 발급 목적 |
| `...:id_token` | OpenID Connect Core 2절이 정의한 ID 토큰 | 발급 목적 |
| `...:saml1` | base64url로 인코딩된 SAML 1.1 assertion | 구문 |
| `...:saml2` | base64url로 인코딩된 SAML 2.0 assertion | 구문 |
| `...:jwt` | JWT | 구문 |

[IANA OAuth URI 레지스트리](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#uri)에 등록된 token type 식별자는 이 여섯 개가 전부입니다. 두 축은 3절 첫 문단이 직접 가릅니다. 다른 곳이 발급한 토큰이라면 식별자는 인가 서버가 그것을 파싱할 수 있도록 **구문**을 알리고, 호출 대상 인가 서버가 발급한 토큰이라면 **그 인가 서버가 무엇을 위해 발급했는지**를 알립니다. 두 축은 서로 독립입니다. access token은 JWT로 발급될 수도, 발급자에게 물어봐야 내용을 알 수 있는 불투명한 문자열일 수도 있습니다. 반대로 ID 토큰은 정의상 언제나 JWT이지만 access token은 아닙니다. 3절이 이 구분을 직접 서술합니다.

> access token은 위임된 인가 결정을 나타내고, JWT는 토큰 포맷이다. access token은 JWT로 포맷될 수 있으나 반드시 그럴 필요는 없다. JWT가 access token일 수도 있으나, 모든 JWT가 access token인 것은 아니다.

즉 이 값을 정하려면 토큰이 **어떤 역할로 쓰이는지**와 **누가 발급했는지**를 알아야 합니다. 어떤 포맷으로 서명되어 있는지는 그 답을 주지 않습니다.

3절의 어휘는 닫혀 있지도 않습니다. 같은 절이 다른 URI를 사용해 다른 토큰 타입을 나타낼 수 있다고 적어 확장을 열어 둡니다.


# 기본 파라미터 — 세 식별자가 한 자리에서 정해진다

---

[RFC 8693 2.1절](https://www.rfc-editor.org/rfc/rfc8693#section-2.1)은 이 grant에 타입 파라미터를 셋 규정합니다. 제출하는 토큰을 알리는 `subject_token_type`, 대리 주체를 함께 제출할 때 쓰는 `actor_token_type`, 무엇을 돌려받고 싶은지 적는 `requested_token_type`입니다. 셋 모두 3절이 서술하는 식별자를 값으로 받습니다.

Spring Security에서 앞의 둘은 subject token의 자바 타입에서 도출되고, 셋째는 상수로 고정됩니다.

```java
// TokenExchangeGrantRequest (Spring Security) — 식별자를 subject token의 자바 타입에서 도출한다
private static String tokenType(OAuth2Token token) {
    return (token instanceof Jwt) ? JWT_TOKEN_TYPE_VALUE : ACCESS_TOKEN_TYPE_VALUE;
}

// defaultParameters() — requested_token_type은 조건 없이 access token으로 설정된다
parameters.set(OAuth2ParameterNames.REQUESTED_TOKEN_TYPE, ACCESS_TOKEN_TYPE_VALUE);
```

`tokenType()`은 `Jwt`이면 `...:jwt`를, 그렇지 않으면 `...:access_token`을 내보냅니다. 이 메서드가 `subject_token_type`과 `actor_token_type`의 유일한 출처이며, token exchange 지원이 들어온 Spring Security 6.3부터 한 번도 바뀌지 않았습니다.

두 식별자 문자열은 `TokenExchangeGrantRequest`의 `private static final` 필드입니다. `OAuth2ParameterNames`처럼 공개된 상수도, 열거형도, 해석 가능한 값도 아니므로, 애플리케이션이 실제로 전송되는 값에 닿는 방법은 요청 파라미터 맵을 통째로 교체하는 것뿐입니다.

`tokenType()` 한 줄에는 두 가지 문제가 겹쳐 있습니다.

- 질문은 토큰의 **역할**을 묻지만, `Jwt`인 쪽은 **형식**으로 답합니다.
- `instanceof Jwt`는 프로토콜상 JWT인지가 아니라 **자바 클래스 이름이 `Jwt`인지**를 묻습니다. 자바 타입(`Jwt`)과 프로토콜 식별자(`...:jwt`)는 이름만 닮았을 뿐 층위가 다른데, 그 둘을 잇는 근거가 이 삼항 연산자 한 줄밖에 없습니다.


# 결함 1 — 추론으로는 두 상황을 가를 수 없다

---

3절은 `...:access_token`과 `...:jwt`를 가르는 기준을 발급자 관계로 못 박습니다. 호출 대상 인가 서버가 발급한 토큰이면 전자이고, 다른 인가 서버로 넘길 JWT이면 후자입니다.

ERP 챗봇에서 실제로 겪은 것이 전자입니다. gateway 뒤의 resource server가 방금 검증한 사용자 토큰을 같은 인가 서버에서 교환하는 경우이며, [RFC 8693 1절](https://www.rfc-editor.org/rfc/rfc8693#section-1)이 resource server가 교환의 클라이언트 역할을 맡는 경우로 직접 이름 붙인 상황입니다. 그러나 Spring이 검증을 마치고 건네주는 객체는 `Jwt`이므로 요청은 `...:jwt`로 전송되었고, Keycloak의 Standard Token Exchange는 이 요청을 거부했습니다. 26.2에서 정식 기능이 된 이 교환은 허용하는 `subject_token_type`을 access token 하나로 제한합니다. Ping도 같은 이유로 거부한다는 보고가 [gh-16486](https://github.com/spring-projects/spring-security/issues/16486)에 있습니다.

두 상황이 같은 자바 타입으로 도착합니다.

| 상황 | 맞는 식별자 | 도착하는 자바 타입 |
|---|---|---|
| 호출 대상 인가 서버가 발급한 토큰 | `...:access_token` | `Jwt` |
| 다른 인가 서버로 넘길 JWT | `...:jwt` | `Jwt` |

`Jwt`에는 **누가 발급했는지**가 담기지 않으므로, 어떤 매핑을 얹어도 두 상황을 가릴 수 없습니다. 토큰의 `iss` 클레임을 등록 정보의 issuer와 대조하는 방법을 떠올릴 수 있으나 일반해가 되지 못합니다. `ClientRegistration.ProviderDetails.getIssuerUri()`가 `@Nullable`이고 `token-exchange` 등록에는 grant별 검증이 없어, `token-uri`만 지정한 등록에는 대조할 대상 자체가 없습니다. 그런 등록에서는 추론이 조용히 한쪽을 고르고, 그 선택이 틀렸다는 사실은 교환이 거부되는 시점에야 드러납니다.

게다가 매핑이 해소하는 방향이 기본 경로에서는 틀린 쪽입니다. 기본 subject token resolver가 내주는 유일한 타입이 `Jwt`이고, Spring Security 레퍼런스 문서의 token exchange 예제가 바로 그 경로를 사용합니다.

자바 타입을 위장하는 우회는 있습니다. resolver 안에서 `Jwt`를 `OAuth2AccessToken`으로 감싸면 `...:access_token`이 나갑니다. 동작하기는 하나, 프로토콜 파라미터를 토큰의 자바 타입을 속여서 제어하는 셈입니다. 그 방법밖에 없다는 것이 이 결함의 내용입니다.


# 결함 2 — 위장할 타입조차 없다

---

`tokenType()`이 내보낼 수 있는 값은 둘뿐이므로, 나머지 식별자는 요청 파라미터를 통째로 덮어써야만 보낼 수 있습니다. 매핑을 설정하는 것이 아니라 우회하는 것입니다.

여기서 한 프로파일을 세워 두겠습니다. OAuth 워킹그룹이 채택한 [Identity Assertion JWT Authorization Grant 초안](https://datatracker.ietf.org/doc/draft-ietf-oauth-identity-assertion-authz-grant/)은 이 grant를 프로파일링해, SSO를 마친 애플리케이션이 이미 들고 있는 신원 assertion을 제출하고 제3자의 인가 서버에서 access token으로 바꿀 수 있는 grant를 받게 합니다. 대화형 리다이렉트도 사용자별 동의도 없이 SaaS 사이를 잇는 것이 목적이며, Model Context Protocol의 Enterprise-Managed Authorization 확장이 이 초안 위에 서 있습니다. 초안 4.3절은 `subject_token_type`으로 `...:id_token` · `...:saml2` · `...:refresh_token` 셋을 명시합니다.

이 셋 가운데 `...:saml2`는 대응하는 자바 타입이 아예 없습니다. `spring-security-saml2-service-provider`는 어떤 oauth2 모듈에도 의존하지 않아 `OAuth2Token`이 컴파일 클래스패스에 없고, 따라서 SAML 로그인이 만들어 내는 어떤 것도 subject token이 될 수 없습니다. 반대편의 `AbstractOAuth2Token` 서브클래스 여덟 개에도 SAML assertion을 담는 타입은 없습니다. 이 경로를 타려는 애플리케이션은 `OAuth2Token`을 직접 구현해 assertion을 담아야 하는데, `Jwt`가 아닌 모든 것이 그렇듯 `...:access_token`으로 라벨링됩니다.

결함 1에는 자바 타입을 위장한다는 지렛대라도 있었습니다. 여기에는 위장해 들어갈 타입이 없습니다.

3절의 어휘는 열려 있고 자바 타입 계층은 닫혀 있으므로, 매핑은 작성 시점에 자바 타입이 있던 식별자들의 스냅샷일 수밖에 없습니다. 매핑을 넓히면 식별자 하나가 닿을 수 있게 될 뿐, 애플리케이션이 식별자를 말할 수 있게 되지는 않습니다.


# 결함 3 — `requested_token_type`은 생략도 변경도 할 수 없다

---

`defaultParameters()`는 이 값을 조건 없이 `...:access_token`으로 설정합니다. 대부분의 교환에서 맞는 값이므로 상수 자체가 결함은 아닙니다. 결함은 애플리케이션이 보낼 수 있는 값이 그것뿐이라는 데 있습니다.

2.1절은 이 파라미터를 OPTIONAL로 규정하고, 생략에 의미를 부여합니다. 요청 타입을 지정하지 않으면 발급할 토큰의 종류는 인가 서버의 재량이며, `resource`나 `audience`가 가리키는 대상의 요구에 따라 정해질 수 있습니다. 인가 서버에 판단을 맡기고 싶은 애플리케이션은 그렇게 할 수 없습니다. 파라미터가 항상 실려 나가기 때문입니다.

같은 저장소의 인가 서버 구현은 이 생략을 정확히 처리합니다. `OAuth2TokenExchangeAuthenticationConverter`는 값이 없으면 2.1절의 기본값을 적용하는 분기를 갖고 있습니다. 같은 저장소의 클라이언트가 그 분기를 탈 수 없습니다.

값을 바꿔야 하는 경우도 있습니다. 앞서 세운 Identity Assertion JWT Authorization Grant는 `requested_token_type`으로 `...:id-jag`를 REQUIRED로 요구하는데, 3절이 정의한 다섯에 없는 값이며 3절이 열어 둔 확장점을 쓰는 것입니다. 파라미터가 상수인 한 그 확장점을 쓸 수 없습니다. 결함 2와 합치면, 실재하는 프로파일 하나가 이 grant의 타입 파라미터 셋 가운데 둘에서 동시에 막힙니다.


# 제안 — 추론이 아니라 명시

---

세 결함이 한 자리에서 나오므로, 해법도 그 자리를 바꾸는 것이라고 판단했습니다. 식별자를 자바 타입에서 **추론**하지 말고, 애플리케이션이 **명시**할 수 있게 하는 것입니다.

Spring Security는 이미 교환에 사용할 subject token을 애플리케이션이 직접 고르도록 resolver를 제공합니다. 빠져 있는 것은 타입입니다. 그래서 토큰과 함께 식별자도 정하는 resolver를 두고, `TokenExchangeGrantRequest`가 세 식별자를 인자로 받는 생성자를 갖도록 하는 안을 제안했습니다. 기존 생성자와 그 동작은 기본값으로 남기므로 하위 호환이 유지됩니다. 다만 `requested_token_type`은 지정하지 않은 상태를 `...:access_token`과 구분해 표현할 수 있어야 합니다. 그래야 2.1절이 정한 기본값이 인가 서버에서 적용됩니다.

이 형태에는 선례가 있습니다. [spring-projects/spring-security PR #19076](https://github.com/spring-projects/spring-security/pull/19076)이 인가 서버 쪽에 도입하려는 것이 바로 subject token을 타입에 따라 해석하는 resolver 전략입니다. 식별자를 값으로 다루는 API가 인가 서버에만 생기고 클라이언트에는 없는 셈이며, 이 비대칭을 이슈에 함께 적었습니다.

대안으로 `ClientRegistration.ClientSettings`에 설정으로 두는 안도 함께 냈습니다. 같은 PR이 인가 서버의 `RegisteredClient.ClientSettings`에 항목을 더하고 있어 대칭이 정확합니다.

마지막으로 기본 파라미터를 문서화하는 안을 따로 두었습니다. 현재 레퍼런스 문서는 기본 파라미터가 항상 제공된다고만 적을 뿐 그 값이 무엇인지는 적지 않아, `subject_token_type`이 subject token의 자바 타입에서 도출된다는 사실을 알 방법이 없습니다. 값을 고쳐야 한다는 것 자체를 모르는 상태로 남습니다. 이 항목은 나머지와 독립이므로 먼저 반영될 수 있습니다.

같은 메서드에서 나오지만 따로 재현되는 결함 하나는 이 이슈에서 갈라 [별도로 제기했습니다](/osc/spring-security-oidc-id-token-type). `OidcIdToken`이 `...:access_token`으로 전송되는 것인데, 매핑을 넓혀 그 값을 바로잡더라도 여기서 요청하는 명시는 여전히 불가능합니다.
