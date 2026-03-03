import { techStack } from '../data/techStack';

export const getIconUrl = (stackName: string) => {
    // Java 입력 시 자동으로 OpenJDK 매핑 (저작권상의 이유로 java의 아이콘이 존재하지 않음)
    const targetName = stackName.toLowerCase() === 'java' ? 'openjdk' : stackName.toLowerCase();

    const allItems = techStack.flatMap(cat => cat.items);
    const tech = allItems.find(t => 
        t.name.toLowerCase() === targetName || 
        t.icon.toLowerCase() === targetName
    );
    
    const icon = tech?.icon || targetName;
    const color = tech?.color || 'black';
    
    return `https://cdn.simpleicons.org/${icon}/${color}`;
};