import { TableOutlined } from '@ant-design/icons';

import {
  Plugin,
  SchemaComponentOptions,
  SchemaInitializer,
  SchemaInitializerContext,

} from '@nocobase/client';
import { Outlet } from 'react-router-dom';

import { ResetPassword } from './pages/ResetPassword';
import { useTranslation } from 'react-i18next';
import { SigninSignupDesigner } from './SigninSignupDesigner';
import React, { useContext } from 'react';
import './signin.css';
import './forgotPassword.css';
import './assets/icomoon/icomoon.css';

import CustomSigninPage from './pages/CustomSigninPage';
import CustomSignupPage from './pages/CustomSignupPage';
import CustomForgotPasswordPage from './pages/CustomForgotPasswordPage';
import EmailBody from './components/EmailBody';

const SettingPageLayout = () => (
  <div>
      <Outlet />
  </div>
);
export const SigninSignupInitializer = (props) => {
  const { insert } = props;
  const { t } = useTranslation();
  return (
    <SchemaInitializer.Item
      {...props}
      icon={<TableOutlined />}
      onClick={() => {
        insert({
          type: 'void',
          'x-component': 'CardItem',
          'x-designer': 'SigninSignupDesigner',
          properties: {
            request: {
              type: 'void',
              'x-component': 'div',
              'x-content': 'Input Request',
            },
          },
        });
      }}
      title={t('Input block')}
    />
  );
};
const SigninSignpProviderNew = React.memo((props) => {
  const items = useContext<any>(SchemaInitializerContext);
  const children = items.BlockInitializers.items[1].children;
  children.push({
    key: 'signin-signup',
    type: 'item',
    title: '{{t("Signin Signup block")}}',
    component: 'SigninSignupInitializer',
  });
  return (
 
      <SchemaComponentOptions components={{ SigninSignupDesigner, SigninSignupInitializer }}>
        <SchemaInitializerContext.Provider value={items}>{props.children}</SchemaInitializerContext.Provider>
      </SchemaComponentOptions>

  );
});
SigninSignpProviderNew.displayName = 'SigninSignup';

export class PluginSigninSignupForgotpasswordClient extends Plugin {
  async afterAdd() {
    // await this.app.pm.add()
  }

  async beforeLoad() {}

  // You can get and modify the app instance here
  async load() {

    this.app.pluginSettingsManager.add('signin-signup-forgotpassword', {
      title: 'Email Template', // menu title and page title
      icon: 'ApiOutlined', // menu icon
      Component: ()=><SettingPageLayout />,
    });
    this.app.pluginSettingsManager.add('signin-signup-forgotpassword.signin', {
      title: 'Signin', // menu title and page title
      icon: 'ApiOutlined', // menu icon
      Component: ()=><EmailBody page="signinEmail" subject="signinEmailSubject" />,
    });
  
    this.app.pluginSettingsManager.add('signin-signup-forgotpassword.Reset-Password-success', {
      title: 'Reset Password Success', // menu title and page title
      icon: 'ApiOutlined', // menu icon
      Component: ()=><EmailBody page="forgotPasswordEmail" subject="forgotPasswordEmailSubject" />,
    });

    this.app.pluginSettingsManager.add('signin-signup-forgotpassword.Reset-Password', {
      title: 'Confirm Reset Password', // menu title and page title
      icon: 'ApiOutlined', // menu icon
      Component: ()=><EmailBody page="confirmForgotPasswordEmail" subject="confirmForgotPasswordEmailSubject"/>,
    });

    this.app.pluginSettingsManager.add('signin-signup-forgotpassword.signup', {
      title: 'Signup', // menu title and page title
      icon: 'ApiOutlined', // menu icon
      Component: ()=> <EmailBody page="signupEmail" subject="signupEmailSubject" />,
    });

   
   
   
    //<EmailBody page="signinEmail" subject="signinEmailSubject" />
    // this.app.addProvider(SigninSignpProviderNew);
    // console.log(this.app);
    this.addRoutes();
    this.app.addComponents({
      SigninPage: CustomSigninPage,
      SignupPage: CustomSignupPage,
    });
    // this.app.addComponents({})
    // this.app.addScopes({})
    // this.app.addProvider()
    // this.app.addProviders()
    // this.app.router.add()
  }
  addRoutes() {
    this.app.router.add('forgotPassword', {
      path: '/forgotPassword',
      element: <CustomForgotPasswordPage />,
    });
    this.app.router.add('resetPassword', {
      path: '/resetPassword/:email/:token',
      element: <ResetPassword />,
    });
  }
}

export default PluginSigninSignupForgotpasswordClient;
