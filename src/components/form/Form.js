import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import * as Actions from '../../actions';
import { FormUI } from './FormUI';

const mapStateToProps = (state) => {
    return {};
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onSubmit(values) {
            dispatch(Actions.submitApp(values));
        }
    };
};

const AppForm = reduxForm({
    form: 'ApplicationForm',
})(FormUI);

export const Form = connect(
    mapStateToProps,
    mapDispatchToProps
)(AppForm);

