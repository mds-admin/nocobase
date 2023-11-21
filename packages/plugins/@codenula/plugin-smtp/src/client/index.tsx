import { TableOutlined } from '@ant-design/icons';
import {
  Plugin,
  SchemaComponentOptions,
  SchemaInitializer,
  SchemaInitializerContext,

} from '@nocobase/client';
// import { Button, Card, Input } from 'antd';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { SmtpRequestDesigner } from './SmtpRequestDesigner';
import SmtpRequest from './SmtpRequest';
import { SmtpRequestProvider } from './SmtpRequestProvider';

export const SmtpRequestBlockInitializer = (props) => {
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
          'x-designer': 'SmtpRequestDesigner',
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
const SmtpRequestProviderNew = React.memo((props) => {
  const items = useContext<any>(SchemaInitializerContext);
  const children = items.BlockInitializers.items[1].children;
  children.push({
    key: 'smtprequest',
    type: 'item',
    title: '{{t("Smtp Request block")}}',
    component: 'SmtpRequestBlockInitializer',
  });
  return (

      <SchemaComponentOptions components={{ SmtpRequestDesigner, SmtpRequestBlockInitializer }}>
        <SchemaInitializerContext.Provider value={items}>{props.children}</SchemaInitializerContext.Provider>
      </SchemaComponentOptions>
    
  );
});
SmtpRequestProviderNew.displayName = 'SmtpRequestProviderNew';

export class PluginSmtpClient extends Plugin {
  async afterAdd() {
    // await this.app.pm.add()
  }

  async beforeLoad() {}

  // You can get and modify the app instance here
  async load() {
    this.app.addProvider(SmtpRequestProviderNew);
    this.app.use(SmtpRequestProvider, this.options);
    this.app.pluginSettingsManager.add('smtp', {
      title: 'Smtp', // menu title and page title
      icon: 'ApiOutlined', // menu icon
      //@ts-ignore
      Component: ()=><SmtpRequest/>,
    });
  }
}

export default PluginSmtpClient;
