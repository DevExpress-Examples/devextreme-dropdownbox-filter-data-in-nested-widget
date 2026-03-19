interface SelectionState {
  dropDownValue: number | null;
  selectedRowKeys: number[];
  focusedRowKey: number | null;
}

type SelectionAction =
    | { type: 'SELECT_VALUE'; value: number | null }
    | { type: 'SELECT_ROW'; keys: number[] }
    | { type: 'SELECT_FOCUSED_ROW' }
    | { type: 'SET_FOCUSED_KEY'; key: number | null }
    | { type: 'RESET' };

export function selectionReducer(state: SelectionState, action: SelectionAction): SelectionState {
  switch (action.type) {
    case 'SELECT_VALUE':
      return {
        dropDownValue: action.value,
        selectedRowKeys: action.value ? [action.value] : [],
        focusedRowKey: action.value,
      };
    case 'SELECT_FOCUSED_ROW':
      if (!state.focusedRowKey) return state;
      return {
        dropDownValue: state.focusedRowKey,
        selectedRowKeys: [state.focusedRowKey],
        focusedRowKey: state.focusedRowKey,
      };
    case 'SELECT_ROW':
      return {
        ...state,
        dropDownValue: action.keys.length ? action.keys[0] : null,
        selectedRowKeys: action.keys,
      };
    case 'SET_FOCUSED_KEY':
      return { ...state, focusedRowKey: action.key };
    case 'RESET':
      return { ...state, selectedRowKeys: [] };
    default:
      return state;
  }
}
