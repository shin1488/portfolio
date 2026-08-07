---
title: Spring Security ID 토큰 타입 식별자 버그 제기
summary: >-
  Spring Security의 token exchange는 OidcIdToken을 subject token으로 제출하면 ID 토큰을
  access token으로 라벨링합니다. 공개 API만으로 재현되는 코드와 함께 이슈로 제기하고,
  근본 해결은 식별자를 명시하는 API임을 함께 밝혔습니다.
period:
  from: "2026.07"
techStack: [Spring Security, OAuth 2.0, RFC 8693, OpenID Connect]
highlights:
  - '문제 — OidcIdToken과 Jwt가 형제 클래스이므로 instanceof Jwt가 거짓이 되어, ID 토큰이 access token 식별자로 전송됨'
  - '해결 — 상속으로는 고칠 수 없는 모듈 의존 방향까지 짚고, 매핑을 넓히는 것이 아니라 식별자를 명시하는 API가 근본 해결임을 밝힘'
  - '결과 — 공개 API만으로 재현되는 코드와 함께 프레임워크 본체에 이슈로 등록, 검토 진행 중'
links:
  - label: 'Issues #19448'
    href: https://github.com/spring-projects/spring-security/issues/19448
organization: spring-projects
repo: spring-security
status: proposed
order: 1
---

# 개요

---

- **문제** — token exchange 요청의 `subject_token_type`을 정하는 매핑이 `OidcIdToken`을 `...:access_token`으로 라벨링합니다. ID 토큰에 이 식별자가 맞는 경우는 없습니다.
- **해결** — `OidcIdToken`과 `Jwt`가 형제 클래스이며 모듈 의존 방향 때문에 상속으로는 고칠 수 없다는 점까지 확인해, 공개 API만으로 재현되는 코드와 함께 이슈로 제기했습니다.
- **결과** — 이 값이 틀렸다는 사실은 따로 재현되므로 [앞서 올린 token exchange 이슈](/osc/spring-security-token-exchange)에서 갈라 냈습니다. 다만 근본 해결은 식별자를 명시할 수 있게 하는 것이며, 매핑을 고쳐 이 값만 바로잡는 것으로는 끝나지 않는다는 점을 함께 밝혔습니다.


# 식별자는 토큰의 역할을 가리킨다

---

token exchange 요청은 제출하는 토큰이 무엇인지를 `subject_token_type`으로 함께 알립니다. [RFC 8693 3절](https://www.rfc-editor.org/rfc/rfc8693#section-3)은 `...:access_token`을 **호출 대상 인가 서버가 발급한 access token**으로, `...:id_token`을 **OpenID Connect가 정의한 ID 토큰**으로 각각 정의합니다. 두 식별자는 배타적입니다.

`OidcIdToken`이 담는 것은 ID 토큰이고, ID 토큰은 위임된 인가 결정이 아니라 인증 사실의 진술입니다. 3절이 `...:access_token`에 요구하는 "클라이언트에게 불투명한 토큰"이라는 조건과도 어긋납니다. ID 토큰에 맞는 식별자는 `...:id_token`이며, JWT를 다른 인가 서버에 authorization grant로 보내는 경우라면 `...:jwt`입니다. 그러나 `...:access_token`이 맞는 경우는 없습니다.


# 형제 클래스 — `OidcIdToken`은 `Jwt`가 아니다

---

Spring Security는 이 식별자를 subject token의 자바 타입에서 도출합니다.

```java
// TokenExchangeGrantRequest (Spring Security)
private static String tokenType(OAuth2Token token) {
    return (token instanceof Jwt) ? JWT_TOKEN_TYPE_VALUE : ACCESS_TOKEN_TYPE_VALUE;
}
```

`OidcIdToken`과 `Jwt`는 부모와 자식이 아니라 형제입니다.

```java
// oauth2-core
public class OidcIdToken extends AbstractOAuth2Token implements IdTokenClaimAccessor { ... }

// oauth2-jose  (oauth2-core에 의존한다)
public class Jwt        extends AbstractOAuth2Token implements JwtClaimAccessor { ... }
```

둘 다 `AbstractOAuth2Token`을 상속하므로 `OidcIdToken`은 `OAuth2Token`이지만 `Jwt`는 아닙니다. 그러므로 `instanceof Jwt`가 거짓이 되고, `Jwt`가 아닌 모든 것이 그렇듯 `...:access_token` 분기가 선택됩니다.

서브클래스를 만들어 고칠 수 있는 실수도 아닙니다. `OidcIdToken`은 `oauth2-core`에, `Jwt`는 `oauth2-core`에 의존하는 `oauth2-jose`에 있습니다. 의존 방향이 그러하므로 `OidcIdToken`이 `Jwt`를 상속하는 것은 성립하지 않습니다. `instanceof Jwt`는 ID 토큰에 대해 참이었던 적이 없고, 앞으로도 참이 될 수 없습니다. ID 토큰이 정의상 JWT임에도 그렇습니다.

이 동작은 token exchange 지원이 들어온 6.3부터 그대로입니다. 판정 로직이 6.4에서 `TokenExchangeGrantRequestEntityConverter`에서 `TokenExchangeGrantRequest.defaultParameters()`로 옮겨졌을 뿐, 메서드 자체는 바뀌지 않았습니다.


# 재현 — 공개 API만으로

---

외부 프로젝트도 커스텀 resolver도 필요하지 않습니다.

```java
OidcIdToken idToken = OidcIdToken.withTokenValue("id-token").claim("sub", "user").build();

MultiValueMap<String, String> parameters =
        new DefaultOAuth2TokenRequestParametersConverter<TokenExchangeGrantRequest>()
                .convert(new TokenExchangeGrantRequest(registration, idToken, null));

parameters.getFirst("subject_token_type");
// -> "urn:ietf:params:oauth:token-type:access_token"
```

ID 토큰을 전달했으나 access token 식별자가 반환됩니다. 이 매핑에는 ID 토큰을 올바르게 라벨링할 분기가 없습니다.

기본 구성에서는 이 경로에 닿지 않습니다. Spring Security가 제공하는 어떤 `Authentication`도 `OidcIdToken`을 principal로 갖지 않으므로, `OidcIdToken`은 애플리케이션이 직접 만든 subject token resolver를 통해서만 도착합니다. 그러나 그 resolver를 두는 것이 프레임워크가 안내하는 방식이고, 인가 서버 쪽에서 ID 토큰 교환을 지원하려는 [PR #19076](https://github.com/spring-projects/spring-security/pull/19076)이 겨냥하는 것도 같은 경로입니다.


# 매핑을 넓히는 것은 해결이 아니다

---

이 값을 `...:id_token`으로 바꾸면 틀린 값 하나는 사라집니다. 그러나 그것으로 끝나지 않습니다. 식별자를 자바 타입에서 도출한다는 설계가 그대로 남고, 애플리케이션은 여전히 이 메서드가 선택한 값을 받을 뿐 자기가 보낼 값을 지정할 수 없습니다. 3절의 식별자 어휘는 열려 있고 자바 타입 계층은 닫혀 있으므로, 분기를 하나 더하는 일은 그 시점에 자바 타입이 있는 식별자만 사용할 수 있게 만드는 것입니다. 근본 해결은 [앞선 이슈](/osc/spring-security-token-exchange)가 요청한 것, 곧 식별자를 애플리케이션이 명시할 수 있게 하는 것입니다.

이 이슈를 갈라 낸 이유는 해결이 가볍기 때문이 아닙니다. ID 토큰이 access token으로 전송된다는 사실은 공개 API만으로 재현되고 어떤 해석에도 의존하지 않아, 명시 API에 대한 논의와 별개로 확인될 수 있기 때문입니다.

