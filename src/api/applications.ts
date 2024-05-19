import { SquareCloudAPI } from "@squarecloud/api";
import { coreConfig } from "../config/core";
import applicationsStore from "../stores/applications";

class ApplicationsManager {
	constructor() {
		this.refresh();
		setInterval(() => this.refresh(), 10000);
	}

	async refresh() {
		const apiKey = await coreConfig.testApiKey();

		if (!apiKey) {
			console.log("[Square Cloud Easy] API key not found.");
			return;
		}

		console.log(`[Square Cloud Easy] API key \`${apiKey}\`.`);

		const api = new SquareCloudAPI(apiKey);
		const applications = await api.applications.get();
		const statuses = await api.applications.status();

		const storedFullStatuses = applicationsStore.get().fullStatuses;
		const fullStatuses = await Promise.all(
			applications
				.filter((app) =>
					storedFullStatuses.find((full) => full.applicationId === app.id),
				)
				.map(async (app) => {
					const application = await app.fetch();
					return application.getStatus();
				}),
		);

		console.log(
			`[Square Cloud Easy] Found ${applications.size} applications and ${statuses.length} statuses.`,
		);

		applicationsStore.set({
			applications: applications.toJSON(),
			fullStatuses,
			statuses,
		});
	}
}

export const applicationsManager = new ApplicationsManager();
