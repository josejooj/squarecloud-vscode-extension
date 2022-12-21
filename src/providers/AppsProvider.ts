import {
  ApplicationItem,
  GenericTreeItem,
  CustomTreeItem,
  BaseProvider,
  TreeItem,
} from './BaseProvider';

import CacheManager from '../managers/CacheManager';
import { t } from 'vscode-ext-localisation';
import * as pretty from 'pretty-ms';

export class AppsProvider extends BaseProvider<TreeItem> {
  protected websiteOnly?: boolean;

  constructor(private cache: CacheManager) {
    super();

    cache.on('refresh', () => {
      this.refresh();
    });

    cache.on('refreshStatus', () => {
      this.refresh();
    });
  }

  async getChildren(element?: TreeItem): Promise<TreeItem[]> {
    const { contextValue } = element || {};

    if (
      (contextValue === 'square-bot' || contextValue === 'square-site') &&
      element instanceof ApplicationItem
    ) {
      const status = await this.cache.status.get(element.app.id)!;

      return [
        new GenericTreeItem(
          'Uptime',
          'uptime',
          pretty(Date.now() - status.uptimeTimestamp, { compact: true })
        ),

        new GenericTreeItem('CPU', 'cpu', status.cpuUsage),
        new GenericTreeItem('RAM', 'ram', status.ramUsage + 'MB'),
        new GenericTreeItem(
          t('generic.network'),
          'network',
          status.network.now
        ),
        new GenericTreeItem(
          t('generic.storage'),
          'storage',
          status.storageUsage
        ),
      ];
    }

    let { applications } = this.cache;

    if (!applications?.length) {
      if (!this.cache.api) {
        return [
          new CustomTreeItem(
            'Click here to set an API key.',
            {
              command: 'squarecloud.setApiKey',
              title: '%command.setApiKey%',
            },
            'warning'
          ),
        ];
      }

      return [
        new GenericTreeItem(
          t('generic.loading'),
          'ripple',
          undefined,
          'loading'
        ),
      ];
    }

    applications = applications.filter(({ isWebsite }) => {
      return this.websiteOnly ? isWebsite : !isWebsite;
    });

    const applicationItems = applications.map(
      (app) => new ApplicationItem(app, this.cache)
    );

    return applicationItems;
  }
}
