import { configureStore } from '@reduxjs/toolkit';
import { Provider, useSelector, connect } from 'react-redux';
import { useEffect, useState, useRef, useMemo } from 'react';
import { Slices } from './Slices';
import { EntityAdapterSingletone } from './EntityAdapterSingletone';

const departmentSelectors = EntityAdapterSingletone.INSTANCE.getSelectors(
    (state) => state.departments,
);

const addressSelectors = EntityAdapterSingletone.INSTANCE.getSelectors(
    (state) => state.addresses,
);

const usersSelectors = EntityAdapterSingletone.INSTANCE.getSelectors(
    (state) => state.users,
);

const petsSelectors = EntityAdapterSingletone.INSTANCE.getSelectors(
    (state) => state.pets,
);

// TESTS

const store = configureStore({
    reducer: {
        users: Slices.USERS.reducer,
        addresses: Slices.ADDRESSES.reducer,
        departments: Slices.DEPARTMENTS.reducer,
        pets: Slices.PETS.reducer,
        currentDate: Slices.CURRENT_DATE.reducer,
    },
});

const originalDispatch = store.dispatch.bind(store);

let i = 0;
const results = {
    manyEntitiesConnect: [],
    manyEntitiesUseSelector: [],
    oneEntityConnect: [],
    oneEntityUseSelector: [],
    cleanUp: [],
};

const TEST_TYPES = {
    MANY_ENTITIES_USE_SELECTOR: 'manyEntitiesUseSelector',
    MANY_ENTITIES_CONNECT: 'manyEntitiesConnect',
    ONE_ENTITY_USE_SELECTOR: 'oneEntityUseSelector',
    ONE_ENTITY_CONNECT: 'oneEntityConnect',
    CLEAN_UP: 'cleanUp',
};

const getTestTypeLabel = (type) => {
    switch (type) {
        case TEST_TYPES.MANY_ENTITIES_USE_SELECTOR:
            return 'Many Entities UseSelector';
        case TEST_TYPES.MANY_ENTITIES_CONNECT:
            return 'Many Entities Connect';
        case TEST_TYPES.ONE_ENTITY_USE_SELECTOR:
            return 'One Entity UseSelector';
        case TEST_TYPES.ONE_ENTITY_CONNECT:
            return 'One Entity Connect';
        case TEST_TYPES.CLEAN_UP:
            return 'Clean Up';
        default:
            return 'Unknown';
    }
};

store.dispatch = (action) => {
    const perf = performance.now();
    const result = originalDispatch(action);
    const perfEnd = performance.now();
    const timeSpend = perfEnd - perf;

    // Skip the first run as it's usually a long one
    // (CPU loads data into cache)
    if (i > 0) {
        const testType = action.payload.testType;
        results[testType].push(timeSpend);
    }

    console.log(
        `${getTestTypeLabel(action.payload.testType)} ${action.type} took ${(
            timeSpend / 1000
        ).toFixed(4)}s`,
    );
    i++;
    return result;
};

// Create 10 test users

const User = ({ userId }) => {
    const user = useSelector((state) =>
        usersSelectors.selectById(state, userId),
    );
    const address = useSelector((state) =>
        addressSelectors.selectById(state, user.addressId),
    );
    const department = useSelector((state) =>
        departmentSelectors.selectById(state, user.departmentId),
    );
    const petEntities = useSelector((state) =>
        petsSelectors.selectEntities(state),
    );
    const pets = useMemo(
        () => user.petIds.map((id) => petEntities[id]),
        [user.petIds, petEntities],
    );
    const currentDate = useSelector((state) => state.currentDate);
    return (
        <div>
            {user.username} {address.address} {department.name}
            <div>
                Pets:{' '}
                {pets.map((pet) => `${pet.name} (${pet.type})`).join(', ')}
            </div>
            <div>Current Date: {currentDate}</div>
        </div>
    );
};

const Users = () => {
    const users = useSelector((state) => usersSelectors.selectAll(state));
    return users.map((user) => <User key={user.id} userId={user.id} />);
};

const UserConnected = connect((state, { userId }) => {
    const user = usersSelectors.selectById(state, userId);
    const address = addressSelectors.selectById(state, user.addressId);
    const department = departmentSelectors.selectById(state, user.departmentId);
    const pets = user.petIds.map((id) => petsSelectors.selectById(state, id));
    const currentDate = state.currentDate;
    return {
        user,
        address,
        department,
        pets,
        currentDate,
    };
})(({ user, address, department, pets, currentDate }) => (
    <div>
        {user.username} {address.address} {department.name}
        <div>
            Pets: {pets.map((pet) => `${pet.name} (${pet.type})`).join(', ')}
        </div>
        <div>Current Date: {currentDate}</div>
    </div>
));

const UsersConnected = connect((state) => ({
    users: usersSelectors.selectAll(state),
}))(({ users }) =>
    users.map((user) => <UserConnected key={user.id} userId={user.id} />),
);

const UserOneEntity = ({ userId }) => {
    const user = useSelector((state) =>
        usersSelectors.selectById(state, userId),
    );
    return <div>{user.username}</div>;
};

const UsersOneEntity = () => {
    const users = useSelector((state) => usersSelectors.selectAll(state));
    return users.map((user) => (
        <UserOneEntity key={user.id} userId={user.id} />
    ));
};

const UserOneEntityConnected = connect((state, { userId }) => {
    const user = usersSelectors.selectById(state, userId);
    return {
        user,
    };
})(({ user }) => <div>{user.username}</div>);

const UsersOneEntityConnected = connect((state) => ({
    users: usersSelectors.selectAll(state),
}))(({ users }) =>
    users.map((user) => (
        <UserOneEntityConnected key={user.id} userId={user.id} />
    )),
);

const Results = () => {
    const calculateAverage = (arr) =>
        arr.length > 0
            ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(4)
            : '0.0000';

    return (
        <div>
            {Object.entries(results).map(([type, measurements]) => (
                <div key={type}>
                    {getTestTypeLabel(type)}: {calculateAverage(measurements)}s
                    ({measurements.length} runs)
                </div>
            ))}
        </div>
    );
};

const TEST_CYCLE = [
    TEST_TYPES.ONE_ENTITY_CONNECT,
    TEST_TYPES.CLEAN_UP,
    TEST_TYPES.MANY_ENTITIES_USE_SELECTOR,
    TEST_TYPES.CLEAN_UP,
    TEST_TYPES.ONE_ENTITY_USE_SELECTOR,
    TEST_TYPES.CLEAN_UP,
    TEST_TYPES.MANY_ENTITIES_CONNECT,
    TEST_TYPES.CLEAN_UP,
];

const MAX_TRIES = 40;
const DISPATCH_COUNT = 10;

function App() {
    const [testType, setTestType] = useState(TEST_CYCLE[0]);
    const countRef = useRef(0);
    const cyclePositionRef = useRef(0);

    console.log(`Rendering for ${getTestTypeLabel(testType)}`);

    useEffect(() => {
        if (countRef.current > MAX_TRIES) {
            return;
        }

        if (testType !== TEST_TYPES.CLEAN_UP) {
            countRef.current++;
            for (let i = 0; i < DISPATCH_COUNT; i++) {
                store.dispatch({
                    type: 'TEST_ACTION',
                    payload: {
                        testType,
                    },
                });
            }
        }

        cyclePositionRef.current =
            (cyclePositionRef.current + 1) % TEST_CYCLE.length;
        const nextTestType = TEST_CYCLE[cyclePositionRef.current];
        setTestType(nextTestType);
    }, [testType]);

    if (countRef.current > MAX_TRIES) {
        return <Results />;
    }

    return (
        <Provider store={store}>
            <div>Calculating results...</div>
            {testType === TEST_TYPES.MANY_ENTITIES_USE_SELECTOR && <Users />}
            {testType === TEST_TYPES.MANY_ENTITIES_CONNECT && (
                <UsersConnected />
            )}
            {testType === TEST_TYPES.ONE_ENTITY_USE_SELECTOR && (
                <UsersOneEntity />
            )}
            {testType === TEST_TYPES.ONE_ENTITY_CONNECT && (
                <UsersOneEntityConnected />
            )}
        </Provider>
    );
}

export default App;
