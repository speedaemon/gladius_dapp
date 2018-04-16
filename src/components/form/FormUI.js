import React from 'react';
import { Field } from 'redux-form';

export const FormUI = props => {
    const { onSubmit, handleSubmit, pristine, submitting } = props;

    return (
        <form onSubmit={ handleSubmit(onSubmit) }>
            <div>
                <label>Github Repo URL: </label>
                <Field
                    name="github"
                    component="input"
                    type="text"
                    placeholder="<your repo>.git"
                />
            </div>
            <div>
                <label>Secret: </label>
                <Field
                    name="secret"
                    component="input"
                    type="text"
                    placeholder="keep me in your application to prove you decrypted successfully"
                />
            </div>
            <div>
                <button type="submit" disabled={ pristine || submitting }>
                    Submit Application
                </button>
            </div>
        </form>
    );
};
