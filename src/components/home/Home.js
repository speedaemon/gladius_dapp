import { connect } from 'react-redux';
import HomeUI from './HomeUI';
import * as Actions from '../../actions';

const mapStateToProps = (state, ownProps) => {
    return {
        
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        init() {
            dispatch(Actions.initApp());
        }
    };
};

const Home = connect(
    mapStateToProps,
    mapDispatchToProps
)(HomeUI);

export default Home;
