import { createSlice } from '@reduxjs/toolkit';
import { EntityAdapterSingletone } from './EntityAdapterSingletone';
import { MockData } from './MockData';

const createEntitySlice = (name, mockData) => {
    const initialState = EntityAdapterSingletone.INSTANCE.getInitialState(
        {
            loading: false,
            error: null,
        },
        mockData.reduce((acc, item) => {
            acc[item.id] = item;
            return acc;
        }, {}),
    );

    const reducers = {
        add: EntityAdapterSingletone.INSTANCE.addOne,
        addMany: EntityAdapterSingletone.INSTANCE.addMany,
        update: EntityAdapterSingletone.INSTANCE.updateOne,
    };

    return createSlice({
        name,
        initialState,
        reducers,
    });
};

export class Slices {
    static CURRENT_DATE = createSlice({
        name: 'currentDate',
        initialState: new Date().toISOString(),
        reducers: {
            setCurrentDate: (state, action) => action.payload,
        },
    });

    static DEPARTMENTS = createEntitySlice('departments', MockData.DEPARTMENTS);

    static ADDRESSES = createEntitySlice('addresses', MockData.ADDRESSES);

    static PETS = createEntitySlice('pets', MockData.PETS);

    static USERS = createEntitySlice('users', MockData.USERS);
}
