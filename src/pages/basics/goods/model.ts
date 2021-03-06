import { AnyAction } from 'redux';
import { EffectsCommandMap } from 'dva';
import { ConnectState } from '@/models/connect.d';
import { goodsApi } from './service';

export interface ISearchData extends ISearchPageData {
  status?: number | string;
}

export interface StateType {
  list: any[];
  searchData: ISearchData;
  details: any;
}

// 把接口所有参数变为非必填
export type PartialStateType = Partial<StateType>;

// 当前页面可以获取到的model
// 这里只引入了全局的和当前页面级别的model，还没引入一级page目录级别model
export type ConnectPageState = ConnectState & { goods: PartialStateType };

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & { select: <T>(func: (state: ConnectPageState) => T) => T },
) => void;

export interface ModelType {
  namespace: string;
  state: PartialStateType;
  effects: {
    fetchList: Effect;
    fetchItem: Effect;
    addItem: Effect;
    updateItem: Effect;
    deleteItem: Effect;
    switchStatus: Effect;
  };
  reducers: {
    saveList: ImmerReducer<PartialStateType, AnyAction>;
    saveItem: ImmerReducer<PartialStateType, AnyAction>;
  };
}

const Model: ModelType = {
  namespace: 'goods',

  state: {
    searchData: {},
    list: [
      {
        id: 1,
        name: '商品一',
        brand: '美特斯班委',
        loaction: '广州',
        creationTime: '2020:08:07',
        stock: 999,
      },
    ],
    details: {},
  },

  effects: {
    *fetchList({ payload }, { call, put }) {
      const res = yield call(goodsApi.index, payload);
      yield put({
        type: 'saveList',
        payload:
          res && Array.isArray(res.data)
            ? res.data
            : [
                {
                  id: 1,
                  name: '商品一',
                  brand: '美特斯班委',
                  loaction: '广州',
                  creationTime: '2020:08:07',
                  stock: 999,
                  skuList: [
                    {
                      skuCode: '0000000',
                      skuName: '000000000',
                      skuBarCode: '0000000',
                    },
                  ],
                },
              ],
      });
      return res;
    },

    *fetchItem({ payload }, { call, put }) {
      const res = yield call(goodsApi.byId, payload);
      yield put({ type: 'saveItem', payload: res && Array.isArray(res.data) ? res.data : [] });
      return res;
    },

    *addItem({ payload }, { call }) {
      const res = yield call(goodsApi.add, payload);
      return !!res;
    },

    *updateItem({ payload }, { call }) {
      const res = yield call(goodsApi.update, payload);
      return !!res;
    },

    *deleteItem({ payload }, { call }) {
      const res = yield call(goodsApi.destroy, payload);
      return !!res;
    },

    *switchStatus({ payload }, { call, put }) {
      const { enabled, id } = payload;
      const res = yield call(enabled ? goodsApi.disable : goodsApi.enable, id);
      if (!res) return Promise.reject();

      return res;
    },
  },
  reducers: {
    saveList(state, { payload }) {
      const setState = state;
      setState.list = payload;
    },
    saveItem(state, { payload }) {
      const setState = state;
      setState.details = payload;
    },
  },
};

export default Model;
