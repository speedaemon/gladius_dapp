import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import { homeReducer } from './components/home/HomeReducer';
import { reducer as formReducer } from 'redux-form';


const reducer = combineReducers({
  routing: routerReducer,
  home: homeReducer,
  form: formReducer
});

export default reducer;
