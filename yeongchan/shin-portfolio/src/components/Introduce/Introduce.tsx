import styles from './Introduce.module.css';

const Introduce = () => {
    return (
        <div className={styles.introduce_section}>
            <p className={styles.subtitle}>저는...</p>
            <div className={styles.what_can_i_do}>
                <p>● 안드로이드의 수명 주기를 고려하여 리소스 누수 없는 안정적인 코드를 작성할 수 있습니다.</p>
                <p>● 안드로이드 4대 컴포넌트의 특징을 이해하고 있으며, SAA(Single Activity Architecture) 기반의 앱 개발이 가능합니다.</p>
                <p>● MVVM, MVI와 같은 디자인 패턴을 적용하고 구현해 본 경험이 있으며, 관심사 분리를 통한 구조적인 설계를 지향합니다.</p>
                <p>● SOLID 원칙을 준수하여 확장성 있고 유지보수가 용이한 코드를 작성할 수 있습니다.</p>
                <p>● 의존성 주입(DI)에 대한 개념을 숙지하고 있으며 관련 라이브러리(Hilt)를 사용해 본 경험이 있습니다.</p>
                <p>● 선언형 UI 프레임워크에서의 상태 관리 체계를 이해하고 있으며, UI 레이어와 데이터 레이어 간의 상태 동기화를 효율적으로 처리할 수 있습니다.</p>
                <p>● 불변성과 순수 함수를 지향하는 함수형 프로그래밍의 개념을 이해하며, 사이드 이펙트를 최소화하여 예측 가능한 코드를 작성할 수 있습니다.</p>
            </div>
        </div>
    );
}

export default Introduce;