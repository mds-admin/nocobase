import { Repository } from '@nocobase/database';
import lodash from 'lodash';
import { PluginManager } from './plugin-manager';
import { PluginData } from './types';
const fs = require('fs');
const path = require('path');

export class PluginManagerRepository extends Repository {
  pm: PluginManager;

  setPluginManager(pm: PluginManager) {
    this.pm = pm;
  }

  async remove(name: string | string[]) {
    await this.destroy({
      filter: {
        name,
      },
    });
  }

  async enable(name: string | string[]) {
    const pluginNames = lodash.castArray(name);
    const plugins = pluginNames.map((name) => this.pm.get(name));

    for (const plugin of plugins) {
      const requiredPlugins = plugin.requiredPlugins();
      for (const requiredPluginName of requiredPlugins) {
        const requiredPlugin = this.pm.get(requiredPluginName);
        if (!requiredPlugin.enabled) {
          throw new Error(`${plugin.name} plugin need ${requiredPluginName} plugin enabled`);
        }
      }
    }

    for (const plugin of plugins) {
      await plugin.beforeEnable();
    }

    await this.update({
      filter: {
        name,
      },
      values: {
        enabled: true,
        installed: true,
      },
    });
    return pluginNames;
  }

  async upgrade(name: string, data: PluginData) {
    return this.update({
      filter: {
        name,
      },
      values: data,
    });
  }

  async disable(name: string | string[]) {
    name = lodash.cloneDeep(name);

    const pluginNames = lodash.castArray(name);
    console.log(`disable ${name}, ${pluginNames}`);
    const filter = {
      name,
    };

    console.log(JSON.stringify(filter, null, 2));
    await this.update({
      filter,
      values: {
        enabled: false,
        installed: false,
      },
    });
    return pluginNames;
  }

  async getItems() {
    try {
      // sort plugins by id
      return await this.find({
        sort: 'id',
      });
    } catch (error) {
      await this.database.migrator.up();
      await this.collection.sync({
        alter: {
          drop: false,
        },
        force: false,
      });
      return await this.find({
        sort: 'id',
      });
    }
  }

  async init() {
    const exists = await this.collection.existsInDb();
    if (!exists) {
      return;
    }

    const items = await this.getItems();

    for (const item of items) {
      const { options, ...others } = item.toJSON();
      await this.pm.add(item.get('name'), {
        ...others,
        ...options,
      });
    }
    const directoryPath = './packages/plugins/@codenula';
    const folderNames = [];

    fs.readdirSync(directoryPath).forEach((fileName) => {
      const filePath = path.join(directoryPath, fileName);
      const directoryName = path.basename(directoryPath);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        folderNames.push(directoryName + '/' + fileName);
      }
    });
    for (let i = 0; i < folderNames.length; i++) {
      await this.pm.addViaCLI(folderNames[i]);
    }
  }
}
