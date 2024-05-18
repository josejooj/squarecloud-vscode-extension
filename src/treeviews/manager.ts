import { window } from "vscode";
import { ApplicationsTreeViewProvider } from "./applications/provider";

type TreeViewsKey = keyof TreeViewsManager["views"];

class TreeViewsManager {
	public views = {
		applications: new ApplicationsTreeViewProvider(),
	};

	register() {
		window.registerTreeDataProvider("apps-view", this.views.applications);
	}

	refreshViews(...views: TreeViewsKey[]) {
		for (const view of views) {
			this.views[view].refresh();
		}
	}

	refreshAll() {
		for (const view of Object.values(this.views)) {
			view.refresh();
		}
	}
}

export const treeViewsManager = new TreeViewsManager();
