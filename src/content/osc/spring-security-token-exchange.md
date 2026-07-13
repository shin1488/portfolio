---
title: Spring Security token exchange 이슈 제기
summary: >-
  RFC 8693 token exchange에서 subject_token_type이 subject token의 자바 타입에서 도출되는 문제를
  Spring Security에 제기했습니다. ERP 프로젝트의 챗봇 권한 위임에서 출발해 라이브러리 샘플을 거쳐
  프레임워크 본체까지 이어진 기여입니다.
period:
  from: "2026.07"
techStack: [Spring Security, OAuth 2.0, RFC 8693, Keycloak, Spring Authorization Server]
highlights:
  - '자바 타입에서 프로토콜 식별자를 도출하는 매핑의 결함 세 가지를 재현 코드와 함께 제기'
  - 'RFC 8693이 역할(access token · ID token)과 형식(JWT)을 직교하는 축으로 규정한다는 점을 근거로 제시'
  - '식별자를 추론이 아니라 명시할 수 있도록, 인가 서버 쪽 resolver 전략과 대칭인 클라이언트 API를 제안'
links:
  - label: 'Issues #19436'
    href: https://github.com/spring-projects/spring-security/issues/19436
organization: spring-projects
repo: spring-security
status: proposed
order: 1
---

# 개요

---

- **문제** — ERP 챗봇의 권한 위임을 [spring-ai-community/mcp-security PR #89](https://github.com/spring-ai-community/mcp-security/pull/89)의 샘플로 옮기며 `subject_token_type`을 요청에 명시했는데, 그 값을 결정하는 매핑이 subject token의 **자바 타입**을 보고 프로토콜 식별자를 고르고 있었습니다.
- **해결** — RFC 8693이 토큰의 역할과 형식을 직교하는 축으로 규정한다는 점을 근거로, 이 매핑이 세 가지 결함을 낳는다는 것을 재현 코드와 함께 이슈로 제기했습니다.
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


# 매핑은 자바 타입 하나만 본다

---

Spring Security는 이 값을 subject token의 자바 타입에서 도출합니다.

```java
// TokenExchangeGrantRequest (Spring Security) — 식별자를 subject token의 자바 타입에서 도출한다
private static String tokenType(OAuth2Token token) {
    return (token instanceof Jwt) ? JWT_TOKEN_TYPE_VALUE : ACCESS_TOKEN_TYPE_VALUE;
}
```

`Jwt`이면 `...:jwt`를, 그렇지 않으면 `...:access_token`을 내보냅니다. 이 메서드가 token exchange 요청에서 `subject_token_type`의 유일한 출처이며, token exchange 지원이 들어온 Spring Security 6.3부터 한 번도 바뀌지 않았습니다.

이 한 줄에 두 가지 문제가 겹쳐 있습니다.

- 질문은 토큰의 **역할**을 묻지만, `Jwt`인 쪽은 **형식**으로 답합니다.
- `instanceof Jwt`는 프로토콜상 JWT인지가 아니라 **자바 클래스 이름이 `Jwt`인지**를 묻습니다. 자바 타입(`Jwt`)과 프로토콜 식별자(`...:jwt`)는 이름만 닮았을 뿐 층위가 다른데, 그 둘을 잇는 근거가 이 삼항 연산자 한 줄밖에 없습니다.


# 결함 1 — ID 토큰이 access token으로 라벨링된다

---

`OidcIdToken`과 `Jwt`는 부모와 자식이 아니라 형제입니다.

```java
// oauth2-core
public class OidcIdToken extends AbstractOAuth2Token implements IdTokenClaimAccessor { ... }

// oauth2-jose  (oauth2-core에 의존한다)
public class Jwt        extends AbstractOAuth2Token implements JwtClaimAccessor { ... }
```

둘 다 `AbstractOAuth2Token`을 상속하므로 `OidcIdToken`은 `OAuth2Token`이지만 `Jwt`는 아닙니다. 그러므로 `instanceof Jwt`가 거짓이 되어 `...:access_token`으로 전송됩니다.

RFC 8693 3절이 `...:access_token`을 **인가 서버가 발급한 access token**으로, `...:id_token`을 **ID 토큰**으로 정의하므로 두 식별자는 배타적입니다. `OidcIdToken`이 담는 것은 ID 토큰이고, ID 토큰은 위임된 인가 결정이 아니라 인증 사실의 진술입니다. 3절이 `...:access_token`에 요구하는 "클라이언트에게 불투명한 토큰"이라는 조건과도 어긋납니다. ID 토큰에 맞는 식별자는 `...:id_token`이며, JWT를 다른 인가 서버에 authorization grant로 보내는 경우라면 `...:jwt`입니다. 그러나 `...:access_token`이 맞는 경우는 없습니다.

서브클래스를 만들어 고칠 수 있는 실수도 아닙니다. `OidcIdToken`은 `oauth2-core`에, `Jwt`는 `oauth2-core`에 의존하는 `oauth2-jose`에 있습니다. 의존 방향이 그러하므로 `OidcIdToken`이 `Jwt`를 상속하는 것은 성립하지 않습니다. `instanceof Jwt`는 ID 토큰에 대해 참이었던 적이 없고, 앞으로도 참이 될 수 없습니다. ID 토큰이 정의상 JWT임에도 그렇습니다.

공개 API만으로 재현됩니다.

```java
OidcIdToken idToken = OidcIdToken.withTokenValue("id-token").claim("sub", "user").build();

MultiValueMap<String, String> parameters =
        new DefaultOAuth2TokenRequestParametersConverter<TokenExchangeGrantRequest>()
                .convert(new TokenExchangeGrantRequest(registration, idToken, null));

parameters.getFirst("subject_token_type");
// -> "urn:ietf:params:oauth:token-type:access_token"
```

ID 토큰을 전달했으나 access token 식별자가 반환됩니다. 이 매핑에는 ID 토큰을 올바르게 라벨링할 분기가 없습니다.


# 결함 2 — `...:id_token`은 기본 파라미터로 표현할 수 없다

---

`tokenType()`이 내보낼 수 있는 값은 둘뿐이므로, `...:id_token`은 요청 파라미터를 통째로 덮어써야만 보낼 수 있습니다. 매핑을 설정하는 것이 아니라 우회하는 것입니다.

이 결함이 지금 문제가 되는 이유가 있습니다. 같은 저장소의 인가 서버 쪽에서는 [spring-projects/spring-security PR #19076](https://github.com/spring-projects/spring-security/pull/19076)이 `...:id_token`을 허용 목록에 추가하는 작업을 진행 중입니다. 반영되면 인가 서버는 `...:id_token` subject token을 받아들이지만, 같은 저장소의 OAuth2 클라이언트에는 그 요청을 만들 수단이 없습니다.


# 결함 3 — resource server의 access token이 `...:jwt`로 전송된다

---

ERP 챗봇에서 실제로 겪은 결함입니다. gateway 뒤의 resource server가 방금 검증한 사용자 토큰을 같은 인가 서버에서 교환하는 경우, 그 토큰은 RFC 8693 3절이 `...:access_token`으로 정의한 바로 그것입니다. 그러나 Spring이 검증을 마치고 건네주는 객체는 `Jwt`이므로 요청은 `...:jwt`로 전송되었고, Keycloak의 Standard Token Exchange는 이 요청을 거부했습니다.

이 결함은 예외적인 경로에서 나타나는 것이 아닙니다. 기본 구성에서 subject token으로 해석되는 유일한 타입이 `Jwt`이고, Spring Security 레퍼런스 문서의 token exchange 예제가 바로 그 경로를 사용합니다.

그리고 이 결함은 매핑을 개선하는 것만으로는 해소되지 않습니다. 같은 `Jwt`가 두 상황에서 똑같이 도착하기 때문입니다.

| 상황 | 맞는 식별자 | 도착하는 자바 타입 |
|---|---|---|
| 호출 대상 인가 서버가 발급한 토큰 | `...:access_token` | `Jwt` |
| 다른 인가 서버로 넘길 JWT | `...:jwt` | `Jwt` |

자바 타입에는 **누가 발급했는지**가 담기지 않습니다. 그러므로 어떤 매핑을 얹어도 두 상황을 가릴 수 없고, 식별자를 자바 타입에서 뽑아내는 방식 자체를 그대로 둔 채로는 이 결함이 남습니다.


# 제안 — 추론이 아니라 명시

---

세 결함이 한 줄에서 나오므로, 해법도 그 한 줄을 바꾸는 것이라고 판단했습니다. 식별자를 자바 타입에서 **추론**하지 말고, 애플리케이션이 **명시**할 수 있게 하는 것입니다.

Spring Security는 이미 교환에 사용할 subject token을 애플리케이션이 직접 고르도록 resolver를 제공합니다. 빠져 있는 것은 타입입니다. 그래서 토큰과 함께 식별자도 반환하는 resolver를 추가하고, `TokenExchangeGrantRequest`가 그 식별자를 들고 다니도록 하는 안을 제안했습니다. 기존 생성자와 그 동작은 기본값으로 남기므로 하위 호환이 유지됩니다.

이 형태에는 선례가 있습니다. [spring-projects/spring-security PR #19076](https://github.com/spring-projects/spring-security/pull/19076)이 인가 서버 쪽에 도입하려는 것이 바로 subject token을 타입에 따라 해석하는 resolver 전략입니다. 식별자를 값으로 다루는 API가 인가 서버에만 생기고 클라이언트에는 없는 셈이며, 이 비대칭을 이슈에 함께 적었습니다.
