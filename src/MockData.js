export class MockData {
    static DEFAULT_ENTITY_COUNT = 10000;

    static PETS = Array.from(
        { length: MockData.DEFAULT_ENTITY_COUNT * 3 },
        (_, index) => ({
            id: index + 1,
            name: `pet${index + 1}`,
            type: ['dog', 'cat', 'hamster'][index % 3],
            age: Math.floor(Math.random() * 15),
        }),
    );

    static USERS = Array.from(
        { length: MockData.DEFAULT_ENTITY_COUNT },
        (_, index) => ({
            id: index + 1,
            username: `user${index + 1}`,
            email: `user${index + 1}@example.com`,
            age: 20 + index,
            role: index % 2 === 0 ? 'admin' : 'user',
            active: true,
            createdAt: new Date().toISOString(),
            score: Math.floor(Math.random() * 100),
            addressId: MockData.DEFAULT_ENTITY_COUNT - index,
            departmentId: index + 1,
            petIds: [index * 3 + 2, index * 3 + 1, index * 3 + 3],
            lastLogin: new Date().toISOString(),
        }),
    );

    static ADDRESSES = Array.from(
        { length: MockData.DEFAULT_ENTITY_COUNT },
        (_, index) => ({
            id: index + 1,
            address: `address${index + 1}`,
            city: `city${index + 1}`,
            state: `state${index + 1}`,
            note: `note ${index + 1} is a pretty long note, but we wont use it`,
        }),
    );

    static DEPARTMENTS = Array.from(
        { length: MockData.DEFAULT_ENTITY_COUNT },
        (_, index) => ({
            id: index + 1,
            name: `department${index + 1}`,
        }),
    );
}
